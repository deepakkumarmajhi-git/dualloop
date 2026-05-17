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