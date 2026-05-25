from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    GITHUB_CLIENT_ID: str
    GITHUB_CLIENT_SECRET: str
    FRONTEND_URL: str
    GEMINI_API_KEY: str
    DATABASE_URL: str = "sqlite:///./dualloop.db"
    JWT_SECRET_KEY: str
    ENCRYPTION_KEY: Optional[str] = None

settings = Settings()

# Backwards compatibility exports
GITHUB_CLIENT_ID = settings.GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET = settings.GITHUB_CLIENT_SECRET
FRONTEND_URL = settings.FRONTEND_URL
GEMINI_API_KEY = settings.GEMINI_API_KEY
ENCRYPTION_KEY = settings.ENCRYPTION_KEY