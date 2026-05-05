import uuid
from sqlalchemy import Column, String, DateTime, func, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from models.base import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    design_id = Column(UUID(as_uuid=True), ForeignKey("designs.id", ondelete="SET NULL"), nullable=True)

    notes = Column(Text, nullable=True)
    budget_range = Column(String, nullable=True)   # e.g. "25000-50000"

    # exploring | asap | 1_3_months | 3_6_months | 6_plus_months
    timeline = Column(String, nullable=True, default="exploring")

    # collecting_quotes | quoted | in_progress | completed | cancelled
    status = Column(String, nullable=False, default="collecting_quotes")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="projects")
    design = relationship("Design", back_populates="project")
    quotes = relationship("Quote", back_populates="project")