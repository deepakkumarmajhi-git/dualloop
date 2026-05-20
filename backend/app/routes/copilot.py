from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils.jwt import decode_access_token
from app.models.user import User
from app.models.behavioral_snapshot import BehavioralSnapshot
from app.services.behavioral_engine import calculate_behavioral_metrics
from app.services.copilot import generate_mentorship_advice
from pydantic import BaseModel

router = APIRouter(prefix="/copilot")


class UpdateGoalRequest(BaseModel):
    target_role: str


def get_user_from_token(token: str, db: Session) -> User:
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid JWT access token",
        )
    user_id = payload.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


@router.get("/dna")
def get_developer_dna(token: str, db: Session = Depends(get_db)):
    user = get_user_from_token(token, db)
    
    # Calculate DNA
    dna = calculate_behavioral_metrics(user.id, db)
    
    # Load history snapshots
    snapshots = db.query(BehavioralSnapshot).filter(
        BehavioralSnapshot.user_id == user.id
    ).order_by(BehavioralSnapshot.calculated_at.asc()).all()
    
    history = [
        {
            "calculated_at": s.calculated_at,
            "consistency_score": s.consistency_score,
            "momentum_score": s.momentum_score
        }
        for s in snapshots
    ]
    
    return {
        "target_role": user.target_role,
        "username": user.username,
        "avatar_url": user.avatar_url,
        "dna": dna,
        "history": history
    }



@router.post("/goal")
def update_target_role(token: str, req: UpdateGoalRequest, db: Session = Depends(get_db)):
    user = get_user_from_token(token, db)
    
    # Update target career goal
    user.target_role = req.target_role
    db.commit()
    
    # Recompute DNA metrics with the new goal immediately
    dna = calculate_behavioral_metrics(user.id, db)
    
    return {
        "status": "success",
        "target_role": user.target_role,
        "dna": dna
    }


@router.get("/mentorship")
def get_mentorship_insights(token: str, db: Session = Depends(get_db)):
    user = get_user_from_token(token, db)
    advice = generate_mentorship_advice(user.id, db)
    return {
        "advice": advice
    }
