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
    
async def get_repository_commits(token: str, owner: str, repo: str, etag: str = None):
    url = f"https://api.github.com/repos/{owner}/{repo}/commits"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/json",
    }
    if etag:
        headers["If-None-Match"] = etag

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{url}?per_page=30",
            headers=headers,
        )
        
        if response.status_code == 304:
            return {"not_modified": True, "commits": [], "etag": etag}
            
        if response.status_code != 200:
            # Handle rate limit warnings or error payloads gracefully
            try:
                res_data = response.json()
            except Exception:
                res_data = {"message": response.text}
            return {"not_modified": False, "commits": res_data, "etag": None}
            
        new_etag = response.headers.get("ETag")
        return {
            "not_modified": False,
            "commits": response.json(),
            "etag": new_etag
        }

async def get_commit_details(token: str, owner: str, repo: str, sha: str):
    url = f"https://api.github.com/repos/{owner}/{repo}/commits/{sha}"
    async with httpx.AsyncClient() as client:
        response = await client.get(
            url,
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/json",
            },
        )
        if response.status_code != 200:
            return []
            
        data = response.json()
        files = data.get("files", [])
        extensions = []
        for f in files:
            filename = f.get("filename", "")
            if "." in filename:
                ext = filename.split(".")[-1].lower()
                if ext:
                    extensions.append(ext)
        return list(set(extensions))
    
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