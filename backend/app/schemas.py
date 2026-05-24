from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Dict

# ==========================================
# USER SCHEMAS
# ==========================================

class OrganizationSchema(BaseModel):
    name: str
    avatar_url: Optional[str] = None

class UserMeResponse(BaseModel):
    id: int
    username: str
    avatar_url: Optional[str] = None
    email: Optional[EmailStr] = None
    target_role: str
    bio: Optional[str] = None
    followers: int
    following: int
    organizations: List[OrganizationSchema] = []

    model_config = {
        "from_attributes": True
    }

class RoleUpdateRequest(BaseModel):
    target_role: str = Field(..., min_length=1, max_length=100, description="The developer's new selected target role")

class RoleUpdateResponse(BaseModel):
    status: str
    target_role: str


# ==========================================
# REPOSITORY SCHEMAS
# ==========================================

class SyncStatusResponse(BaseModel):
    status: str
    message: str

class LatestCommitSchema(BaseModel):
    sha: str
    message: str
    author_name: str
    commit_date: str
    additions: int
    deletions: int

class RepositoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    language: Optional[str] = None
    languages: Dict[str, float] = {}
    stars: int
    forks: int
    repo_url: str
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    size: int
    default_branch: str
    open_pull_requests: int
    merged_pull_requests: int
    latest_commit: Optional[LatestCommitSchema] = None

    model_config = {
        "from_attributes": True
    }

class CommitTimelineSchema(BaseModel):
    sha: str
    message: str
    author_name: str
    commit_date: str
    additions: int
    deletions: int
    modified_extensions: Optional[str] = None

class CommitTimelineResponse(BaseModel):
    repo_name: str
    repo_full_name: str
    total_commits: int
    commits: List[CommitTimelineSchema]

class DeleteStatusResponse(BaseModel):
    status: str
    message: str
