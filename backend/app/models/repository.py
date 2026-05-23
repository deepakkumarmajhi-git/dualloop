from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base


class Repository(Base):
    __tablename__ = "repositories"
    id = Column(Integer, primary_key=True, index=True)
    github_repo_id = Column(String, unique=True)
    name = Column(String)
    full_name = Column(String)
    description = Column(String)
    language = Column(String)
    stars = Column(Integer)
    forks = Column(Integer)
    repo_url = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"))
    commits_etag = Column(String, nullable=True)
    languages_json = Column(String, nullable=True)
    created_at = Column(String, nullable=True)
    updated_at = Column(String, nullable=True)
    size = Column(Integer, default=0)
    default_branch = Column(String, default="main")
    open_pull_requests = Column(Integer, default=0)
    merged_pull_requests = Column(Integer, default=0)