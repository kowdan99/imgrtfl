from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime
import random
import os
from pydantic import BaseModel
from typing import List, Optional
from twilio.rest import Client
from anthropic import Anthropic
import models
from database import SessionLocal, engine

# Create database tables
models.Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI()

# Initialize Twilio client
twilio_client = Client(
    os.environ.get("TWILIO_ACCOUNT_SID"),
    os.environ.get("TWILIO_AUTH_TOKEN")
)

# Initialize Anthropic client
anthropic = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Pydantic models for request/response
class GratitudeEntryCreate(BaseModel):
    content: str
    tags: List[str] = []
    mood: str = "thankful"

class GratitudeEntryResponse(BaseModel):
    id: int
    content: str
    tags: List[str]
    mood: str
    created_at: datetime

    class Config:
        orm_mode = True

class UserCreate(BaseModel):
    name: str
    email: str
    phone_number: str
    reminder_frequency: str = "weekly"
    preferred_time: str = "09:00"
    use_llm_reminders: bool = False

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    phone_number: str
    reminder_frequency: str
    preferred_time: str
    use_llm_reminders: bool

    class Config:
        orm_mode = True

# API Routes

@app.post("/api/users/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = models.User(
        name=user.name,
        email=user.email,
        phone_number=user.phone_number,
        reminder_frequency=user.reminder_frequency,
        preferred_time=user.preferred_time,
        use_llm_reminders=user.use_llm_reminders
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/api/entries/", response_model=GratitudeEntryResponse)
def create_entry(entry: GratitudeEntryCreate, user_id: int, db: Session = Depends(get_db)):
    # Check if user exists
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create entry
    db_entry = models.GratitudeEntry(
        user_id=user_id,
        content=entry.content,
        tags=entry.tags,
        mood=entry.mood
    )
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

@app.get("/api/entries/{user_id}", response_model=List[GratitudeEntryResponse])
def get_entries(user_id: int, db: Session = Depends(get_db)):
    entries = db.query(models.GratitudeEntry).filter(models.GratitudeEntry.user_id == user_id).all()
    return entries

# Helper function for sending reminders
def generate_llm_reminder(entry):
    prompt = f"""Create a thoughtful, uplifting reminder based on this gratitude journal entry. 
    Make it personal but not overly sentimental. Keep it under 160 characters for SMS:
    
    "{entry.content}"
    """
    
    response = anthropic.messages.create(
        model="claude-3-7-sonnet-20250219",
        max_tokens=300,
        messages=[{"role": "user", "content": prompt}]
    )
    
    return response.content[0].text

def send_reminder(user_id: int, db: Session):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        print(f"User {user_id} not found")
        return
    
    # Get all entries for this user
    entries = db.query(models.GratitudeEntry).filter(models.GratitudeEntry.user_id == user_id).all()
    if not entries:
        print(f"No entries found for user {user_id}")
        return
    
    # Select a random entry
    random_entry = random.choice(entries)
    
    # Generate message content
    if user.use_llm_reminders:
        message_content = generate_llm_reminder(random_entry)
    else:
        entry_date = random_entry.created_at.strftime("%B %d, %Y")
        message_content = f"Remembering your gratitude from {entry_date}: \"{random_entry.content}\""
    
    # Send SMS via Twilio
    try:
        twilio_client.messages.create(
            body=message_content,
            from_=os.environ.get("TWILIO_PHONE_NUMBER"),
            to=user.phone_number
        )
        print(f"Reminder sent to user {user_id}")
    except Exception as e:
        print(f"Failed to send reminder to user {user_id}: {str(e)}")

@app.post("/api/send-reminder/")
def trigger_reminder(user_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # Validate user exists
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Execute in background to avoid blocking the API
    background_tasks.add_task(send_reminder, user_id, db)
    
    return {"message": "Reminder scheduled"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)