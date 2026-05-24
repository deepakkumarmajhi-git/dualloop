from sqlalchemy import Column, Integer, String
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    github_id = Column(String, unique=True)
    username = Column(String)
    avatar_url = Column(String)
    email = Column(String, nullable=True)
    github_access_token = Column(String, nullable=True)
    target_role = Column(String, default="Fullstack Developer")
    bio = Column(String, nullable=True)
    followers = Column(Integer, default=0)
    following = Column(Integer, default=0)
    organizations_json = Column(String, nullable=True)