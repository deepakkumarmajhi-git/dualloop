from sqlalchemy.orm import Session
from app.models.user import User
from app.services.behavioral_engine import calculate_behavioral_metrics
from app.services.gemini import generate_gemini_mentorship


async def generate_mentorship_advice(user_id: int, db: Session) -> str:
    """
    Asynchronously generates behavioral mentorship advice using the Gemini service.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return "User session context not found. Please log in again."

    # 1. Fetch active DNA profile metrics from LOOP 1
    dna = calculate_behavioral_metrics(user_id, db)
    if not dna:
        return "Unable to calculate behavioral telemetry. Please synchronize your repositories first."

    # 2. Call the Gemini service (which handles API REST pipelines and local fallbacks)
    return await generate_gemini_mentorship(dna)
