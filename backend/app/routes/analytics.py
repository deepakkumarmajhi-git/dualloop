from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.repository import Repository
from app.models.user import User
from app.services.analytics import calculate_language_distribution
from app.utils.security import get_current_user

router = APIRouter(prefix="/analytics")


@router.get("/languages")
def language_analytics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    repositories = db.query(Repository).filter(Repository.owner_id == current_user.id).all()

    result = calculate_language_distribution(repositories)

    return result