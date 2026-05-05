import uuid
from sqlalchemy import Column, String, DateTime, func, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from models.base import Base

class Design(Base):
    __tablename__ = "designs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    name = Column(String, nullable=False, default="My Design")

    # The full design JSON (pool shape, features, colors, etc.)
    design_data = Column(JSONB, nullable=False, default=dict)

    # Location info
    address = Column(String, nullable=True)
    lat = Column(String, nullable=True)
    lng = Column(String, nullable=True)
    zoom = Column(Integer, nullable=True, default=19)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="designs")
    project = relationship("Project", back_populates="design", uselist=False)