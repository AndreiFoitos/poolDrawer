import uuid

from sqlalchemy import Column, DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from models.base import Base


class ContractorProfile(Base):
    __tablename__ = "contractor_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    company_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    license_number = Column(String, nullable=True)
    website = Column(String, nullable=True)
    about = Column(Text, nullable=True)

    # pending | approved | rejected
    approval_status = Column(String, nullable=False, default="pending")
    license_document_path = Column(String, nullable=True)  # path in Supabase Storage

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="contractor_profile")
    quotes = relationship("Quote", back_populates="contractor")