from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.auth import router as auth_router
from app.database import Base, engine
from app.models.user import User
from app.models.repository import Repository
from app.models.commit import Commit
from app.models.specialization_profile import SpecializationProfile
from app.models.behavioral_snapshot import BehavioralSnapshot
from app.models.coding_challenge import CodingChallenge

from app.routes.repository import router as repo_router
from app.routes.analytics import router as analytics_router
from app.routes.copilot import router as copilot_router
app = FastAPI(title="DualLoop API")
Base.metadata.create_all(bind=engine)

# Dynamic hot-migration to ensure target_role and XP/level columns exist in users table
from sqlalchemy import inspect, text
try:
    inspector = inspect(engine)
    if "users" in inspector.get_table_names():
        columns = [col["name"] for col in inspector.get_columns("users")]
        if "target_role" not in columns:
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE users ADD COLUMN target_role VARCHAR DEFAULT 'Fullstack Developer'"))
                print("MIGRATION: Successfully added target_role column to users table.")
        
        xp_cols = {
            "xp_ui_ux": "INTEGER DEFAULT 0",
            "xp_logic": "INTEGER DEFAULT 0",
            "xp_data": "INTEGER DEFAULT 0",
            "xp_devops": "INTEGER DEFAULT 0",
            "xp_velocity": "INTEGER DEFAULT 0",
            "level": "INTEGER DEFAULT 1"
        }
        for col_name, col_type in xp_cols.items():
            if col_name not in columns:
                with engine.begin() as conn:
                    conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
                    print(f"MIGRATION: Successfully added {col_name} column to users table.")
    
    # Hot-migration for repositories (commits_etag)
    if "repositories" in inspector.get_table_names():
        repo_cols = [col["name"] for col in inspector.get_columns("repositories")]
        if "commits_etag" not in repo_cols:
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE repositories ADD COLUMN commits_etag VARCHAR"))
                print("MIGRATION: Successfully added commits_etag column to repositories table.")
                
    # Hot-migration for commits (modified_extensions)
    if "commits" in inspector.get_table_names():
        commit_cols = [col["name"] for col in inspector.get_columns("commits")]
        if "modified_extensions" not in commit_cols:
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE commits ADD COLUMN modified_extensions VARCHAR"))
                print("MIGRATION: Successfully added modified_extensions column to commits table.")
except Exception as e:
    print("Database migration check warning:", e)


# Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(repo_router)
app.include_router(analytics_router)
app.include_router(copilot_router)


@app.get("/")
def home():
    return {"message": "DualLoop Backend Running"}