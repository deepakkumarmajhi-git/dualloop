from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.commit import Commit
from app.models.repository import Repository
from app.models.user import User
from app.services.github import get_user_repositories, get_repository_commits, get_commit_details
from app.services.behavioral_engine import calculate_behavioral_metrics
from app.utils.security import get_current_user
import asyncio
import json

router = APIRouter(prefix="/repositories")


async def run_unified_workspace_sync(user_id: int, db: Session):
    """
    Background worker task to fetch repositories, commits, and calculate DNA telemetry.
    """
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user or not user.github_access_token:
            return

        # 1. Fetch repositories from GitHub
        repos = await get_user_repositories(user.github_access_token)
        if isinstance(repos, dict) and "message" in repos:
            print("Background Sync GitHub Repo API Error:", repos.get("message"))
            return

        # Sync repositories metadata
        for repo in repos:
            if not isinstance(repo, dict) or "id" not in repo:
                continue

            existing_repo = db.query(Repository).filter(
                Repository.github_repo_id == str(repo["id"])
            ).first()

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
                )
                db.add(new_repo)
            else:
                existing_repo.stars = repo.get("stargazers_count", 0)
                existing_repo.forks = repo.get("forks_count", 0)
                existing_repo.description = repo.get("description")
                existing_repo.language = repo.get("language")
                if not existing_repo.owner_id:
                    existing_repo.owner_id = user.id
        db.commit()

        # 2. Synchronize commits for recent repositories (up to 5 to protect rate limits)
        repositories = db.query(Repository).filter(Repository.owner_id == user.id).all()
        
        # Parallel fetch for active repositories
        tasks = []
        for r in repositories[:5]:
            owner, repo_name = r.full_name.split("/")
            tasks.append(get_repository_commits(user.github_access_token, owner, repo_name, r.commits_etag))
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for idx, r in enumerate(repositories[:5]):
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
                    if not isinstance(det_res, Exception) and isinstance(det_res, list):
                        extensions = det_res
                        
                    commit = Commit(
                        commit_sha=item["sha"],
                        message=item["commit"]["message"],
                        author_name=item["commit"]["author"]["name"],
                        commit_date=item["commit"]["author"]["date"],
                        repository_id=r.id,
                        modified_extensions=json.dumps(extensions)
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
                        modified_extensions=json.dumps([]) # fallback
                    )
                    db.add(commit)
                    
        db.commit()

        # 3. Trigger DNA Telemetry behavioral engine re-calculation
        calculate_behavioral_metrics(user.id, db)
        print(f"BACKGROUND SYNC: Successfully synced workspace for user {user.username}.")
    except Exception as e:
        print("Error in background unified sync execution:", e)


@router.get("/sync")
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
    background_tasks.add_task(run_unified_workspace_sync, current_user.id, db)

    # Return instant syncing response so dashboard UX remains snappy
    return {"status": "syncing", "message": "Unified repository and commit synchronization running in background."}


@router.get("/all")
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
                "commit_date": latest_commit.commit_date
            }

        result.append({
            "id": repo.id,
            "name": repo.name,
            "description": repo.description,
            "language": repo.language,
            "stars": repo.stars,
            "forks": repo.forks,
            "repo_url": repo.repo_url,
            "latest_commit": latest_commit_data
        })

    return result


@router.get("/commits/feed")
def get_commit_feed(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns recent commit history timeline log entries for the active authenticated user.
    """
    from datetime import datetime, timedelta
    
    # Calculate date threshold 30 days ago
    limit_date = (datetime.utcnow() - timedelta(days=30)).strftime("%Y-%m-%dT%H:%M:%SZ")

    commits = db.query(Commit).join(Repository).filter(
        Repository.owner_id == current_user.id,
        Commit.commit_date >= limit_date
    ).order_by(Commit.commit_date.desc()).all()

    # Graceful fallback: if no commits in the last 30 days, load the most recent 30 commits
    if not commits:
        commits = db.query(Commit).join(Repository).filter(
            Repository.owner_id == current_user.id
        ).order_by(Commit.commit_date.desc()).limit(30).all()

    result = []
    for c in commits:
        repo = db.query(Repository).filter(Repository.id == c.repository_id).first()
        result.append({
            "sha": c.commit_sha[:8] if c.commit_sha else "Unknown",
            "message": c.message,
            "author_name": c.author_name,
            "commit_date": c.commit_date,
            "repo_name": repo.name if repo else "Unknown"
        })

    return result