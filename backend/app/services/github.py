import httpx  # type: ignore[import]
from app.config import GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET

GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USER_URL = "https://api.github.com/user"
GITHUB_REPOS_URL = "https://api.github.com/user/repos"


async def get_access_token(code: str):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            GITHUB_TOKEN_URL,
            headers={"Accept": "application/json"},
            data={
                "client_id": GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code": code,
            },
        )

        return response.json()

async def get_github_user(token: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            GITHUB_USER_URL,
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/json",
            },
        )

        return response.json()

async def get_user_repositories(token: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(
            GITHUB_REPOS_URL,
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/json",
            },
        )

        return response.json()
    
async def get_repository_commits(token: str, owner: str, repo: str):
    url = f"https://api.github.com/repos/{owner}/{repo}/commits"

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/json",
            },
        )

        return response.json()
    
async def get_repository_languages(
    token: str,
    owner: str,
    repo: str
):
    url = f"https://api.github.com/repos/{owner}/{repo}/languages"

    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/json",
            },
        )

        return response.json()