from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, ARRAY, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone_number = Column(String, nullable=False)
    reminder_frequency = Column(String, default="weekly") 
    use_llm_reminders = Column(Boolean, default=False)
    
    # Relationship to entries
    entries = relationship("GratitudeEntry", back_populates="user")

class GratitudeEntry(Base):
    __tablename__ = "gratitude_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship to user
    user = relationship("User", back_populates="entries")