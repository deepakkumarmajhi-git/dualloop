from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.auth import router as auth_router
from app.database import Base, engine
from app.models.user import User
from app.models.repository import Repository
from app.models.commit import Commit
from sqlalchemy import inspect, text
from app.routes.repository import router as repo_router
from app.routes.user import router as user_router
from app.config import settings
from app.utils.rate_limit import limiter
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

app = FastAPI(title="DualLoop API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

Base.metadata.create_all(bind=engine)

# Dynamic hot-migration to ensure target_role exists in users table

try:
    inspector = inspect(engine)
    if "users" in inspector.get_table_names():
        columns = [col["name"] for col in inspector.get_columns("users")]
        if "target_role" not in columns:
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE users ADD COLUMN target_role VARCHAR DEFAULT 'Fullstack Developer'"))
                print("MIGRATION: Successfully added target_role column to users table.")
        user_new_cols = {
            "bio": "VARCHAR",
            "followers": "INTEGER DEFAULT 0",
            "following": "INTEGER DEFAULT 0",
            "organizations_json": "VARCHAR"
        }
        for col_name, col_type in user_new_cols.items():
            if col_name not in columns:
                with engine.begin() as conn:
                    conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
                    print(f"MIGRATION: Successfully added {col_name} column to users table.")
    
    # Hot-migration for repositories (commits_etag, languages_json)
    if "repositories" in inspector.get_table_names():
        repo_cols = [col["name"] for col in inspector.get_columns("repositories")]
        if "commits_etag" not in repo_cols:
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE repositories ADD COLUMN commits_etag VARCHAR"))
                print("MIGRATION: Successfully added commits_etag column to repositories table.")
        if "languages_json" not in repo_cols:
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE repositories ADD COLUMN languages_json VARCHAR"))
                print("MIGRATION: Successfully added languages_json column to repositories table.")
        if "created_at" not in repo_cols:
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE repositories ADD COLUMN created_at VARCHAR"))
                print("MIGRATION: Successfully added created_at column to repositories table.")
        if "updated_at" not in repo_cols:
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE repositories ADD COLUMN updated_at VARCHAR"))
                print("MIGRATION: Successfully added updated_at column to repositories table.")
        
        repo_new_cols = {
            "size": "INTEGER DEFAULT 0",
            "default_branch": "VARCHAR DEFAULT 'main'",
            "open_pull_requests": "INTEGER DEFAULT 0",
            "merged_pull_requests": "INTEGER DEFAULT 0"
        }
        for col_name, col_type in repo_new_cols.items():
            if col_name not in repo_cols:
                with engine.begin() as conn:
                    conn.execute(text(f"ALTER TABLE repositories ADD COLUMN {col_name} {col_type}"))
                    print(f"MIGRATION: Successfully added {col_name} column to repositories table.")
                
    # Hot-migration for commits (modified_extensions)
    if "commits" in inspector.get_table_names():
        commit_cols = [col["name"] for col in inspector.get_columns("commits")]
        if "modified_extensions" not in commit_cols:
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE commits ADD COLUMN modified_extensions VARCHAR"))
                print("MIGRATION: Successfully added modified_extensions column to commits table.")
        
        commit_new_cols = {
            "additions": "INTEGER DEFAULT 0",
            "deletions": "INTEGER DEFAULT 0"
        }
        for col_name, col_type in commit_new_cols.items():
            if col_name not in commit_cols:
                with engine.begin() as conn:
                    conn.execute(text(f"ALTER TABLE commits ADD COLUMN {col_name} {col_type}"))
                    print(f"MIGRATION: Successfully added {col_name} column to commits table.")
except Exception as e:
    print("Database migration check warning:", e)

# Strict CORS Origin Binding- Only allow connections from the actual production frontend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(settings.FRONTEND_URL)],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth_router)
app.include_router(repo_router)
app.include_router(user_router)


@app.get("/")
def home():
    return {"message": "DualLoop Backend Running"}