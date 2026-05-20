from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.auth import router as auth_router
from app.database import Base, engine
from app.models.user import User
from app.models.repository import Repository
from app.models.commit import Commit
from app.models.specialization_profile import SpecializationProfile
from app.models.behavioral_snapshot import BehavioralSnapshot

from app.routes.repository import router as repo_router
from app.routes.analytics import router as analytics_router
from app.routes.copilot import router as copilot_router
app = FastAPI(title="DualLoop API")
Base.metadata.create_all(bind=engine)

# Dynamic hot-migration to ensure target_role column exists in users table
from sqlalchemy import inspect, text
try:
    inspector = inspect(engine)
    if "users" in inspector.get_table_names():
        columns = [col["name"] for col in inspector.get_columns("users")]
        if "target_role" not in columns:
            with engine.begin() as conn:
                conn.execute(text("ALTER TABLE users ADD COLUMN target_role VARCHAR DEFAULT 'Fullstack Developer'"))
                print("MIGRATION: Successfully added target_role column to users table.")
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