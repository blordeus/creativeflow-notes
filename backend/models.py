from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.sql import func
from database import Base
class Note(Base):
    __tablename__ = "notes"
    id        = Column(Integer, primary_key=True, index=True)
    title     = Column(String(255), nullable=False)
    content   = Column(Text, default="")
    tags      = Column(String(500), default="")   # comma-separated
    category  = Column(String(100), default="General")  # e.g. Ideas, Projects, Clients
    color     = Column(String(20), default="#ffffff")
    is_archived = Column(Boolean, default=False)
    is_pinned   = Column(Boolean, default=False)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())