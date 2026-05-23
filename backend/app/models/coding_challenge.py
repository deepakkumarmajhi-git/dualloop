from sqlalchemy import Column, Integer, String, ForeignKey
from app.database import Base


class CodingChallenge(Base):
    __tablename__ = "coding_challenges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    description = Column(String)
    code_template = Column(String)
    test_criteria = Column(String)
    radar_dimension = Column(String)
    status = Column(String, default="pending")  # "pending", "completed"
    created_at = Column(String)
