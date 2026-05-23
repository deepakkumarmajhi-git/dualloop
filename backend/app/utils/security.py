from fastapi import Query, HTTPException, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.utils.jwt import decode_access_token

def get_current_user(token: str = Query(...), db: Session = Depends(get_db)) -> User:
    """
    FastAPI dependency that extracts and validates the JWT token from the query parameter.
    Injects the corresponding SQLAlchemy User model into standard endpoint signatures.
    """
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired JWT access token",
        )
    
    user_id = payload.get("user_id")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found in local workspace database",
        )
    
    return user
