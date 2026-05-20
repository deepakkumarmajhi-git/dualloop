from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.repository import Repository
from app.services.analytics import calculate_language_distribution
from app.utils.jwt import decode_access_token

router = APIRouter(prefix="/analytics")


@router.get("/languages")
def language_analytics(token: str, db: Session = Depends(get_db)):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid JWT access token",
        )

    user_id = payload.get("user_id")

    repositories = db.query(Repository).filter(Repository.owner_id == user_id).all()

    result = calculate_language_distribution(repositories)

    return result