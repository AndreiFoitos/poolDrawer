import uuid
from sqlalchemy import Column, String, Enum, DateTime, func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from models.base import Base
import enum

class UserRole(enum.Enum):
    homeowner = "homeowner"
    contractor = "contractor"
    admin = "admin"

class User(Base):
    __tablename__ = "users"

    # This ID must match the ID in Supabase's auth.users table
    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    email = Column(String, unique=True, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.homeowner)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    contractor_profile = relationship("ContractorProfile", back_populates="user", uselist=False)
    designs = relationship("Design", back_populates="user")
    projects = relationship("Project", back_populates="user")