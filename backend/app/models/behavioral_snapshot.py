from sqlalchemy import Column, Integer, String, Float, ForeignKey
from app.database import Base


class BehavioralSnapshot(Base):
    __tablename__ = "behavioral_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    consistency_score = Column(Float)
    momentum_score = Column(Float)
    calculated_at = Column(String)
