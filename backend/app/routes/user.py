from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.user import User
from app.utils.security import get_current_user
from app.database import get_db

router = APIRouter(prefix="/user")


import json

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    orgs_data = []
    if current_user.organizations_json:
        try:
            orgs_data = json.loads(current_user.organizations_json)
        except Exception:
            orgs_data = []

    return {
        "id": current_user.id,
        "username": current_user.username,
        "avatar_url": current_user.avatar_url,
        "email": current_user.email,
        "target_role": current_user.target_role,
        "bio": current_user.bio,
        "followers": current_user.followers,
        "following": current_user.following,
        "organizations": orgs_data
    }


@router.post("/role")
def update_target_role(
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    role = payload.get("target_role")
    if not role:
        raise HTTPException(status_code=400, detail="target_role is required")
        
    current_user.target_role = role
    db.commit()
    return {"status": "success", "target_role": current_user.target_role}