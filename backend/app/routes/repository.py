from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db, SessionLocal
from app.models.commit import Commit
from app.models.repository import Repository
from app.models.user import User
from app.services.github import (
    get_user_repositories,
    get_repository_commits,
    get_commit_details,
    get_repository_languages,
    get_github_user,
    get_user_organizations,
    get_repository_pulls
)
from app.utils.security import get_current_user
from app.schemas import (
    SyncStatusResponse,
    RepositoryResponse,
    CommitTimelineResponse,
    DeleteStatusResponse
)
from typing import List
import asyncio
import json

router = APIRouter(prefix="/repositories")


async def run_unified_workspace_sync(user_id: int):
    """
    Background worker task to fetch repositories, commits, and calculate DNA telemetry.
    """
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user or not user.github_access_token:
            return

        # 0. Sync user profile info (Bio, Followers, Orgs)
        try:
            gh_user = await get_github_user(user.github_access_token)
            if gh_user and "id" in gh_user:
                user.bio = gh_user.get("bio")
                user.followers = gh_user.get("followers", 0)
                user.following = gh_user.get("following", 0)
                
            gh_orgs = await get_user_organizations(user.github_access_token)
            if isinstance(gh_orgs, list):
                orgs_list = []
                for org in gh_orgs:
                    if isinstance(org, dict) and "login" in org:
                        orgs_list.append({
                            "name": org["login"],
                            "avatar_url": org.get("avatar_url")
                        })
                user.organizations_json = json.dumps(orgs_list)
            db.commit()
        except Exception as e_user:
            import traceback
            print("Background sync user profile warning:")
            traceback.print_exc()

        # 1. Fetch repositories from GitHub
        repos = await get_user_repositories(user.github_access_token)
        if isinstance(repos, dict) and "message" in repos:
            print("Background Sync GitHub Repo API Error:", repos.get("message"))
            return

        # Parallel fetch for repository languages (limit to first 70 to protect rates)
        lang_tasks = []
        pull_tasks = []
        sync_repos = []
        if isinstance(repos, list):
            sync_repos_cand = repos[:70]
            for r_item in sync_repos_cand:
                if isinstance(r_item, dict) and "id" in r_item and "owner" in r_item:
                    sync_repos.append(r_item)

        for r_item in sync_repos:
            owner = r_item["owner"]["login"]
            repo_name = r_item["name"]
            lang_tasks.append(get_repository_languages(user.github_access_token, owner, repo_name))
            pull_tasks.append(get_repository_pulls(user.github_access_token, owner, repo_name))
            
        lang_results = []
        pull_results = []
        
        tasks_to_gather = []
        if lang_tasks:
            tasks_to_gather.append(asyncio.gather(*lang_tasks, return_exceptions=True))
        if pull_tasks:
            tasks_to_gather.append(asyncio.gather(*pull_tasks, return_exceptions=True))
            
        if tasks_to_gather:
            gathered_results = await asyncio.gather(*tasks_to_gather, return_exceptions=True)
            if len(gathered_results) > 0 and not isinstance(gathered_results[0], Exception):
                lang_results = gathered_results[0]
            if len(gathered_results) > 1 and not isinstance(gathered_results[1], Exception):
                pull_results = gathered_results[1]
        
        # Create a lookup dictionary of repository ID -> languages percentage dictionary
        lang_lookup = {}
        for r_idx, r_item in enumerate(sync_repos):
            if r_idx >= len(lang_results):
                break
            res_langs = lang_results[r_idx]
            if not isinstance(res_langs, Exception) and isinstance(res_langs, dict) and "message" not in res_langs:
                total_bytes = sum(res_langs.values())
                if total_bytes > 0:
                    lang_lookup[str(r_item["id"])] = {
                        lang: round((bytes_count / total_bytes) * 100, 1)
                        for lang, bytes_count in res_langs.items()
                    }

        # Create a lookup dictionary of repository ID -> pulls count dictionary
        pulls_lookup = {}
        for r_idx, r_item in enumerate(sync_repos):
            if r_idx >= len(pull_results):
                break
            res_pulls = pull_results[r_idx]
            if not isinstance(res_pulls, Exception) and isinstance(res_pulls, list):
                open_count = 0
                merged_count = 0
                for pr in res_pulls:
                    if isinstance(pr, dict):
                        if pr.get("state") == "open":
                            open_count += 1
                        elif pr.get("state") == "closed" and pr.get("merged_at"):
                            merged_count += 1
                pulls_lookup[str(r_item["id"])] = {
                    "open": open_count,
                    "merged": merged_count
                }

        # Sync repositories metadata
        for repo in repos:
            if not isinstance(repo, dict) or "id" not in repo:
                continue

            existing_repo = db.query(Repository).filter(
                Repository.github_repo_id == str(repo["id"])
            ).first()
            
            # Extract languages and pull requests
            languages_pct = lang_lookup.get(str(repo["id"]), {})
            pulls_data = pulls_lookup.get(str(repo["id"]), {"open": 0, "merged": 0})

            if not existing_repo:
                new_repo = Repository(
                    github_repo_id=str(repo["id"]),
                    name=repo["name"],
                    full_name=repo["full_name"],
                    description=repo.get("description"),
                    language=repo.get("language"),
                    stars=repo.get("stargazers_count", 0),
                    forks=repo.get("forks_count", 0),
                    repo_url=repo["html_url"],
                    owner_id=user.id,
                    languages_json=json.dumps(languages_pct) if languages_pct else None,
                    created_at=repo.get("created_at"),
                    updated_at=repo.get("updated_at"),
                    size=repo.get("size", 0),
                    default_branch=repo.get("default_branch", "main"),
                    open_pull_requests=pulls_data["open"],
                    merged_pull_requests=pulls_data["merged"]
                )
                db.add(new_repo)
            else:
                existing_repo.stars = repo.get("stargazers_count", 0)
                existing_repo.forks = repo.get("forks_count", 0)
                existing_repo.description = repo.get("description")
                existing_repo.language = repo.get("language")
                existing_repo.created_at = repo.get("created_at")
                existing_repo.updated_at = repo.get("updated_at")
                existing_repo.size = repo.get("size", 0)
                existing_repo.default_branch = repo.get("default_branch", "main")
                existing_repo.open_pull_requests = pulls_data["open"]
                existing_repo.merged_pull_requests = pulls_data["merged"]
                if languages_pct:
                    existing_repo.languages_json = json.dumps(languages_pct)
                if not existing_repo.owner_id:
                    existing_repo.owner_id = user.id

        # CRUD Synchronization: Remove any repositories that have been deleted or archived on GitHub
        active_github_ids = {str(repo["id"]) for repo in repos if isinstance(repo, dict) and "id" in repo}
        existing_db_repos = db.query(Repository).filter(Repository.owner_id == user.id).all()
        for db_repo in existing_db_repos:
            if db_repo.github_repo_id not in active_github_ids:
                # Purge associated commits to preserve cascading constraints
                db.query(Commit).filter(Commit.repository_id == db_repo.id).delete()
                db.delete(db_repo)
                print(f"CRUD SYNC: Successfully deleted stale repository {db_repo.full_name} from DB.")

        db.commit()

        # 2. Synchronize commits for all repositories
        repositories = db.query(Repository).filter(Repository.owner_id == user.id).all()
        
        # Parallel fetch for active repositories
        tasks = []
        for r in repositories:
            owner, repo_name = r.full_name.split("/")
            tasks.append(get_repository_commits(user.github_access_token, owner, repo_name, r.commits_etag))
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for idx, r in enumerate(repositories):
            res = results[idx]
            if isinstance(res, Exception):
                print(f"Background Sync GitHub Commits exception on {r.full_name}:", res)
                continue
                
            if not isinstance(res, dict):
                continue
                
            if res.get("not_modified"):
                print(f"CACHE: Commits not modified for {r.full_name} (ETag matched).")
                continue
                
            commits = res.get("commits", [])
            if isinstance(commits, dict) and "message" in commits:
                print(f"Background Sync GitHub Commits API Error on {r.full_name}:", commits.get("message"))
                continue
                
            if not isinstance(commits, list):
                continue

            # Update ETag in repository
            r.commits_etag = res.get("etag")
            db.commit()

            shas_to_check = [c["sha"] for c in commits if isinstance(c, dict) and "sha" in c]
            existing_shas = set()
            if shas_to_check:
                existing_shas = {
                    c.commit_sha for c in db.query(Commit.commit_sha).filter(
                        Commit.commit_sha.in_(shas_to_check)
                    ).all()
                }

            # Find newly discovered commits
            new_commit_items = []
            for item in commits:
                if not isinstance(item, dict) or "sha" not in item:
                    continue
                sha = item["sha"]
                if sha not in existing_shas:
                    new_commit_items.append(item)

            if new_commit_items:
                # Parallel fetch commit details for new commits (limit to 10 to avoid rate limits)
                owner, repo_name = r.full_name.split("/")
                detail_tasks = []
                for item in new_commit_items[:10]:
                    detail_tasks.append(get_commit_details(user.github_access_token, owner, repo_name, item["sha"]))
                
                details_results = await asyncio.gather(*detail_tasks, return_exceptions=True)
                
                for c_idx, item in enumerate(new_commit_items[:10]):
                    det_res = details_results[c_idx]
                    extensions = []
                    additions = 0
                    deletions = 0
                    if not isinstance(det_res, Exception) and isinstance(det_res, dict):
                        extensions = det_res.get("extensions", [])
                        additions = det_res.get("additions", 0)
                        deletions = det_res.get("deletions", 0)
                        
                    commit = Commit(
                        commit_sha=item["sha"],
                        message=item["commit"]["message"],
                        author_name=item["commit"]["author"]["name"],
                        commit_date=item["commit"]["author"]["date"],
                        repository_id=r.id,
                        modified_extensions=json.dumps(extensions),
                        additions=additions,
                        deletions=deletions
                    )
                    db.add(commit)
                    
                # Handle standard insertions for commits beyond the first 10 details limit
                for item in new_commit_items[10:]:
                    commit = Commit(
                        commit_sha=item["sha"],
                        message=item["commit"]["message"],
                        author_name=item["commit"]["author"]["name"],
                        commit_date=item["commit"]["author"]["date"],
                        repository_id=r.id,
                        modified_extensions=json.dumps([]),
                        additions=0,
                        deletions=0
                    )
                    db.add(commit)
                    
        db.commit()

        print(f"BACKGROUND SYNC: Successfully synced workspace for user {user.username}.")
    except Exception as e:
        import traceback
        print("Error in background unified sync execution:")
        traceback.print_exc()
    finally:
        db.close()


@router.get("/sync", response_model=SyncStatusResponse)
async def sync_repositories(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.github_access_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User does not have a GitHub OAuth access token linked",
        )

    # Queue unified repository and commit sync task in background
    background_tasks.add_task(run_unified_workspace_sync, current_user.id)

    # Return instant syncing response so dashboard UX remains snappy
    return {"status": "syncing", "message": "Unified repository and commit synchronization running in background."}


@router.get("/all", response_model=List[RepositoryResponse])
def get_all_repositories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repositories = db.query(Repository).filter(Repository.owner_id == current_user.id).all()

    result = []
    for repo in repositories:
        # Fetch the most recent commit for this repository
        latest_commit = db.query(Commit).filter(
            Commit.repository_id == repo.id
        ).order_by(Commit.commit_date.desc()).first()
        
        latest_commit_data = None
        if latest_commit:
            latest_commit_data = {
                "sha": latest_commit.commit_sha[:8] if latest_commit.commit_sha else "Unknown",
                "message": latest_commit.message,
                "author_name": latest_commit.author_name,
                "commit_date": latest_commit.commit_date,
                "additions": latest_commit.additions,
                "deletions": latest_commit.deletions
            }

        # Parse languages_json percentages safely
        languages_data = {}
        if repo.languages_json:
            try:
                languages_data = json.loads(repo.languages_json)
            except Exception:
                languages_data = {}

        result.append({
            "id": repo.id,
            "name": repo.name,
            "description": repo.description,
            "language": repo.language,
            "languages": languages_data,
            "stars": repo.stars,
            "forks": repo.forks,
            "repo_url": repo.repo_url,
            "created_at": repo.created_at,
            "updated_at": repo.updated_at,
            "size": repo.size,
            "default_branch": repo.default_branch,
            "open_pull_requests": repo.open_pull_requests,
            "merged_pull_requests": repo.merged_pull_requests,
            "latest_commit": latest_commit_data
        })

    return result


@router.get("/{repo_id}/commits", response_model=CommitTimelineResponse)
def get_repository_commits_timeline(
    repo_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetch all commits for a specific repository to build the timeline UI.
    """
    repo = db.query(Repository).filter(
        Repository.id == repo_id,
        Repository.owner_id == current_user.id
    ).first()

    if not repo:
        raise HTTPException(status_code=404, detail="Repository not found")

    commits = db.query(Commit).filter(
        Commit.repository_id == repo.id
    ).order_by(Commit.commit_date.desc()).all()

    result = [
        {
            "sha": c.commit_sha,
            "message": c.message,
            "author_name": c.author_name,
            "commit_date": c.commit_date,
            "additions": c.additions,
            "deletions": c.deletions,
            "modified_extensions": c.modified_extensions,
        }
        for c in commits
    ]

    return {
        "repo_name": repo.name,
        "repo_full_name": repo.full_name,
        "total_commits": len(commits),
        "commits": result
    }


@router.delete("/{repo_id}", response_model=DeleteStatusResponse)
def delete_repository(
    repo_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    CRUD endpoint to delete a repository and all its associated commits from local database.
    """
    repo = db.query(Repository).filter(
        Repository.id == repo_id,
        Repository.owner_id == current_user.id
    ).first()
    
    if not repo:
        raise HTTPException(
            status_code=404,
            detail="Repository not found in your station workspace"
        )
        
    # Delete associated commits first to respect DB constraints
    db.query(Commit).filter(Commit.repository_id == repo.id).delete()
    
    db.delete(repo)
    db.commit()
    
    return {"status": "success", "message": f"Purged repository {repo.full_name} from local workspace."}