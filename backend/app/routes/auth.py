from fastapi import APIRouter
from fastapi.responses import RedirectResponse
from app.services.github import get_access_token, get_github_user
from app.config import GITHUB_CLIENT_ID, FRONTEND_URL
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User
from app.utils.jwt import create_access_token


router = APIRouter(prefix="/auth")


@router.get("/github/login")
def github_login():
    github_auth_url = (
        "https://github.com/login/oauth/authorize"
        f"?client_id={GITHUB_CLIENT_ID}"
        "&scope=read:user user:email"
    )

    return RedirectResponse(github_auth_url)


@router.get("/github/callback")
async def github_callback(code: str):
    token_data = await get_access_token(code)

    access_token = token_data.get("access_token")

    user_data = await get_github_user(access_token)

    db: Session = SessionLocal()

    existing_user = db.query(User).filter(
        User.github_id == str(user_data["id"])
    ).first()

    if not existing_user:
        new_user = User(
            github_id=str(user_data["id"]),
            username=user_data["login"],
            avatar_url=user_data["avatar_url"],
            email=user_data.get("email"),
            github_access_token=access_token
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        user = new_user

    else:
        existing_user.github_access_token = access_token
        db.commit()
        db.refresh(existing_user)
        user = existing_user

    jwt_token = create_access_token({
        "user_id": user.id,
        "username": user.username
    })

    return RedirectResponse(
        f"{FRONTEND_URL}/dashboard?token={jwt_token}"
    )