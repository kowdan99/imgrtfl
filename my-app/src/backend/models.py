import enum
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, ARRAY, Text, Float, Index, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.sql import func
from database import Base

class DecisionAction(str, enum.Enum):
    expand = "expand"
    nudge = "nudge"
    resurface = "resurface"

class ActionStatus(str, enum.Enum):
    suggested = "suggested"
    scheduled = "scheduled"
    executed  = "executed"
    cancelled = "cancelled"

class DecisionTrace(Base):
    __tablename__ = "decision_traces"

    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    entry_id     = Column(Integer, ForeignKey("gratitude_entries.id", ondelete="CASCADE"), nullable=False)

    top_action   = Column(SAEnum(DecisionAction, name="decision_action"), nullable=False)
    candidates_json = Column(JSONB, nullable=False)  # {"expand":0.xx,"nudge":0.yy,"resurface":0.zz}
    signals_json    = Column(JSONB, nullable=False)  # features only; no raw entry text
    reason       = Column(Text, nullable=False)
    confidence   = Column(Float, nullable=False)     # 0..1
    latency_ms   = Column(Integer, nullable=False)

    created_at   = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user  = relationship("User", back_populates="decision_traces")
    entry = relationship("GratitudeEntry", back_populates="decision_traces")
    actions = relationship("Action", back_populates="trace", cascade="all, delete-orphan")

    __table_args__ = (
        Index("idx_decision_traces_user_created", "user_id", "created_at"),
        Index("idx_decision_traces_entry", "entry_id"),
        Index("idx_decision_traces_action", "top_action"),
    )

class Action(Base):
    __tablename__ = "actions"

    id           = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    entry_id     = Column(Integer, ForeignKey("gratitude_entries.id", ondelete="CASCADE"), nullable=False)
    trace_id     = Column(Integer, ForeignKey("decision_traces.id", ondelete="SET NULL"), nullable=True)

    type         = Column(SAEnum(DecisionAction, name="decision_action"), nullable=False)
    status       = Column(SAEnum(ActionStatus,   name="action_status"),   nullable=False, default=ActionStatus.suggested)
    params_json  = Column(JSONB, nullable=True)          # {"person":"Sam"} or {"when_days":14}
    scheduled_for= Column(DateTime(timezone=True), nullable=True)
    executed_at  = Column(DateTime(timezone=True), nullable=True)

    created_at   = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user  = relationship("User", back_populates="actions")
    entry = relationship("GratitudeEntry", back_populates="actions")
    trace = relationship("DecisionTrace", back_populates="actions")

    __table_args__ = (
        Index("idx_actions_user_created", "user_id", "created_at"),
        Index("idx_actions_entry", "entry_id"),
        Index("idx_actions_type_status", "type", "status"),
    )

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

    #Relationship to traces and actions
    decision_traces = relationship("DecisionTrace", back_populates="user")
    actions         = relationship("Action",        back_populates="user")


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

    #Relationship to traces and actions
    decision_traces = relationship("DecisionTrace", back_populates="entry", cascade="all, delete-orphan")
    actions         = relationship("Action",        back_populates="entry", cascade="all, delete-orphan")

class Reflection(Base):
    __tablename__ = "reflections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    embedding = Column(ARRAY(String), nullable=True) 

    user = relationship("User", back_populates="reflections")