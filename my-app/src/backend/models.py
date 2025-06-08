from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, ARRAY, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    clerk_user_id = Column(String, unique=True, nullable=False)  # Link to Clerk
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone_number = Column(String, nullable=False)
    use_llm_reminders = Column(Boolean, default=False)

    
    # Relationship to entries
    entries = relationship("GratitudeEntry", back_populates="user")
    reflections = relationship("Reflection", back_populates="user")

class GratitudeEntry(Base):
    __tablename__ = "gratitude_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    llm_reminder = Column(Text, nullable=True)
    llm_reasoning_trace = Column(Text, nullable=True)
    tags = Column(ARRAY(String), nullable=True)
    mood = Column(String, nullable=True)

    # Relationship to user
    user = relationship("User", back_populates="entries")

class Reflection(Base):
    __tablename__ = "reflections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    embedding = Column(ARRAY(String), nullable=True) 

    user = relationship("User", back_populates="reflections")