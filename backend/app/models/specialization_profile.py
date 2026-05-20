from sqlalchemy import Column, Integer, String, Float, ForeignKey
from app.database import Base


class SpecializationProfile(Base):
    __tablename__ = "specialization_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    career_alignment_score = Column(Float)
    severity_level = Column(String)
    backend_specialization_index = Column(Float)
    frontend_dominance_ratio = Column(Float)
    developer_role_title = Column(String)
