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

    all_commits = []
    page = 1
    new_etag = None

    async with httpx.AsyncClient() as client:
        while True:
            response = await client.get(
                f"{url}?per_page=100&page={page}",
                headers=headers,
            )
            
            if response.status_code == 304:
                return {"not_modified": True, "commits": [], "etag": etag}
                
            if response.status_code != 200:
                try:
                    res_data = response.json()
                except Exception:
                    res_data = {"message": response.text}
                
                if page == 1:
                    return {"not_modified": False, "commits": res_data, "etag": None}
                else:
                    break
                    
            if page == 1:
                new_etag = response.headers.get("ETag")
                
            page_data = response.json()
            if not page_data or not isinstance(page_data, list):
                break
                
            all_commits.extend(page_data)
            
            link_header = response.headers.get("Link")
            if not link_header or 'rel="next"' not in link_header:
                break
                
            page += 1
            
        return {
            "not_modified": False,
            "commits": all_commits,
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
            return {"extensions": [], "additions": 0, "deletions": 0}
            
        data = response.json()
        files = data.get("files", [])
        extensions = []
        for f in files:
            filename = f.get("filename", "")
            if "." in filename:
                ext = filename.split(".")[-1].lower()
                if ext:
                    extensions.append(ext)
        
        stats = data.get("stats", {})
        additions = stats.get("additions", 0)
        deletions = stats.get("deletions", 0)
        return {
            "extensions": list(set(extensions)),
            "additions": additions,
            "deletions": deletions
        }
    
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


async def get_user_organizations(token: str):
    url = "https://api.github.com/user/orgs"
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
        return response.json()


async def get_repository_pulls(token: str, owner: str, repo: str):
    url = f"https://api.github.com/repos/{owner}/{repo}/pulls?state=all&per_page=30"
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
        return response.json()