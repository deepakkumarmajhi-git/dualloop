from sqlalchemy import Column, Integer, String
from app.database import Base
from sqlalchemy.ext.hybrid import hybrid_property
from app.utils.crypto import encrypt_token, decrypt_token


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    github_id = Column(String, unique=True)
    username = Column(String)
    avatar_url = Column(String)
    email = Column(String, nullable=True)
    
    # Store the encrypted token in the database, mapping it to the original column name
    _github_access_token = Column("github_access_token", String, nullable=True)

    @hybrid_property
    def github_access_token(self) -> str:
        if self._github_access_token is None:
            return None
        return decrypt_token(self._github_access_token)

    @github_access_token.setter
    def github_access_token(self, value: str):
        if value is None:
            self._github_access_token = None
        else:
            self._github_access_token = encrypt_token(value)

    target_role = Column(String, default="Fullstack Developer")
    bio = Column(String, nullable=True)
    followers = Column(Integer, default=0)
    following = Column(Integer, default=0)
    organizations_json = Column(String, nullable=True)