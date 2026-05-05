import uuid
from sqlalchemy import Column, String, DateTime, func, ForeignKey, Text, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from models.base import Base

class Quote(Base):
    __tablename__ = "quotes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    contractor_id = Column(UUID(as_uuid=True), ForeignKey("contractor_profiles.id", ondelete="CASCADE"), nullable=False)

    price_min = Column(Numeric(12, 2), nullable=True)
    price_max = Column(Numeric(12, 2), nullable=True)
    message = Column(Text, nullable=True)
    pdf_path = Column(String, nullable=True)  # path in Supabase Storage

    # pending | accepted | declined
    status = Column(String, nullable=False, default="pending")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    project = relationship("Project", back_populates="quotes")
    contractor = relationship("ContractorProfile", back_populates="quotes")