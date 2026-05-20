from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.commit import Commit
from app.models.repository import Repository
from app.models.user import User
from app.services.github import get_user_repositories, get_repository_commits
from app.utils.jwt import decode_access_token

router = APIRouter(prefix="/repositories")


@router.get("/sync")
async def sync_repositories(token: str, db: Session = Depends(get_db)):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid JWT access token",
        )

    user_id = payload.get("user_id")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found in local workspace database",
        )

    if not user.github_access_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User does not have a GitHub OAuth access token linked",
        )

    repos = await get_user_repositories(user.github_access_token)
    if isinstance(repos, dict) and "message" in repos:
        # Check if GitHub API returned an error
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"GitHub API Error: {repos.get('message')}",
        )

    synced_count = 0
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
            synced_count += 1
        else:
            # Update existing repository stats and link owner if missing
            existing_repo.stars = repo.get("stargazers_count", 0)
            existing_repo.forks = repo.get("forks_count", 0)
            existing_repo.description = repo.get("description")
            existing_repo.language = repo.get("language")
            if not existing_repo.owner_id:
                existing_repo.owner_id = user.id
            synced_count += 1

    db.commit()

    # Retrieve all synced repositories for this user and return them
    repositories = db.query(Repository).filter(Repository.owner_id == user.id).all()

    result = []
    for repo in repositories:
        result.append({
            "id": repo.id,
            "name": repo.name,
            "description": repo.description,
            "language": repo.language,
            "stars": repo.stars,
            "forks": repo.forks,
            "repo_url": repo.repo_url,
        })

    return result


@router.get("/commits/sync")
async def sync_commits(
    token: str,
    owner: str,
    repo: str,
    db: Session = Depends(get_db)
):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid JWT access token",
        )

    user_id = payload.get("user_id")

    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.github_access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="GitHub authentication required",
        )

    commits = await get_repository_commits(
        user.github_access_token,
        owner,
        repo
    )

    if isinstance(commits, dict) and "message" in commits:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"GitHub API Error: {commits.get('message')}",
        )

    repository = db.query(Repository).filter(
        Repository.full_name == f"{owner}/{repo}"
    ).first()

    # O(1) Optimization: Bulk fetch all SHAs in a single query
    shas_to_check = [c["sha"] for c in commits if isinstance(c, dict) and "sha" in c]
    existing_shas = set()
    if shas_to_check:
        existing_shas = {
            c.commit_sha for c in db.query(Commit.commit_sha).filter(
                Commit.commit_sha.in_(shas_to_check)
            ).all()
        }

    synced_commits = 0
    for item in commits:
        if not isinstance(item, dict) or "sha" not in item:
            continue

        sha = item["sha"]

        if sha not in existing_shas:
            commit = Commit(
                commit_sha=sha,
                message=item["commit"]["message"],
                author_name=item["commit"]["author"]["name"],
                commit_date=item["commit"]["author"]["date"],
                repository_id=repository.id if repository else None
            )
            db.add(commit)
            synced_commits += 1

    db.commit()

    return {
        "message": f"Successfully synced {synced_commits} commits.",
        "commits_count": len(commits),
    }


@router.get("/all")
def get_all_repositories(token: str, db: Session = Depends(get_db)):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid JWT access token",
        )

    user_id = payload.get("user_id")

    repositories = db.query(Repository).filter(Repository.owner_id == user_id).all()

    result = []

    for repo in repositories:
        result.append({
            "id": repo.id,
            "name": repo.name,
            "description": repo.description,
            "language": repo.language,
            "stars": repo.stars,
            "forks": repo.forks,
            "repo_url": repo.repo_url,
        })

    return result