from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base


class Commit(Base):
    __tablename__ = "commits"
    id = Column(Integer, primary_key=True, index=True)
    commit_sha = Column(String, unique=True)
    message = Column(String)
    author_name = Column(String)
    commit_date = Column(String)
    repository_id = Column(Integer, ForeignKey("repositories.id"))
    modified_extensions = Column(String, nullable=True)