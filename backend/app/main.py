from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.auth import router as auth_router
from app.database import Base, engine
from app.models.user import User
from app.models.repository import Repository
from app.models.commit import Commit
from app.routes.repository import router as repo_router
from app.routes.analytics import router as analytics_router



app = FastAPI()
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(repo_router)
app.include_router(analytics_router)

@app.get("/")
def home():
    return {"message": "DualLoop Backend Running"}