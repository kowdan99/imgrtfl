from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime
import random
import os
from pydantic import BaseModel
from typing import List, Optional
from twilio.rest import Client
import models
from database import SessionLocal, engine
from auth import require_user
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import openai
import json
import re

from dotenv import load_dotenv
load_dotenv()

# Create database tables
models.Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI()
# client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
openai.api_key = os.getenv("OPENAI_API_KEY")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "https://imgrtfl.com",
    "https://www.imgrtfl.com",
    "https://imgrtfl.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Twilio client
twilio_client = Client(
    os.environ.get("TWILIO_ACCOUNT_SID"),
    os.environ.get("TWILIO_AUTH_TOKEN")
)

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


class GratitudeEntryResponse(BaseModel):
    id: int
    content: str
    llm_reminder: Optional[str] = None
    created_at: datetime
    llm_reasoning_trace: Optional[str] = None
    tags: Optional[List[str]] = None
    mood: Optional[str] = None

    class Config:
        orm_mode = True

class UserCreate(BaseModel):
    name: str
    email: str
    phone_number: str
    use_llm_reminders: bool = False

class UserResponse(BaseModel):
    id: int
    clerk_user_id: str
    name: str
    email: str
    phone_number: str
    use_llm_reminders: bool

    class Config:
        orm_mode = True

class ReflectionResponse(BaseModel):
    id: int
    user_id: int
    content: str
    created_at: datetime
    embedding: Optional[List[str]] = None

    class Config:
        orm_mode = True

# API Routes

@app.options("/api/users/")
def preflight_handler():
    return Response(status_code=200)

@app.post("/api/users/", response_model=UserResponse)
def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    token_payload: dict = Depends(require_user)
):
    print("Incoming user_data:", user_data)
    print("Clerk token payload:", token_payload)
    try:
        clerk_user_id = token_payload["sub"]
    except Exception as e:
        print("Failed to extract user ID:", e)
        raise HTTPException(status_code=400, detail="Invalid token")

    # Optional: prevent duplicate creation
    #existing = db.query(models.User).filter_by(clerk_user_id=clerk_user_id).first()
    #if existing:
        #raise HTTPException(status_code=400, detail="User already exists")
    if db.query(models.User).filter_by(clerk_user_id=clerk_user_id).first():
        print("User already exists with ID:", clerk_user_id)
        raise HTTPException(status_code=400, detail="User already exists")

    db_user = models.User(
        clerk_user_id=clerk_user_id,
        name=user_data.name,
        email=user_data.email,
        phone_number=user_data.phone_number,
        use_llm_reminders=user_data.use_llm_reminders,
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    print("Created DB user with Clerk ID:", clerk_user_id)
    return db_user

@app.post("/api/entries/", response_model=GratitudeEntryResponse)
async def create_entry(entry: GratitudeEntryCreate, db: Session = Depends(get_db), user=Depends(require_user)):
    # Check if user exists
    clerk_user_id = user["sub"]
    # print("🔐 Clerk ID from JWT:", clerk_user_id)
    db_user = db.query(models.User).filter(models.User.clerk_user_id == clerk_user_id).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db_entry = models.GratitudeEntry(
        user_id=db_user.id,
        content=entry.content,
    )

    if db_user.use_llm_reminders:
        try:
            reminder, reasoning, tags, mood = await generate_llm_reminder(entry.content)
            db_entry.llm_reminder = reminder
            db_entry.llm_reasoning_trace = reasoning
            db_entry.tags = tags
            db_entry.mood = mood
        except Exception as e:
            print("LLM generation failed:", e)

    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

@app.get("/api/entries/", response_model=List[GratitudeEntryResponse])
def get_entries(db: Session = Depends(get_db), user=Depends(require_user)):
    clerk_user_id = user["sub"]

    db_user = db.query(models.User).filter(models.User.clerk_user_id == clerk_user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    entries = (
        db.query(models.GratitudeEntry)
        .filter(models.GratitudeEntry.user_id == db_user.id)
        .order_by(models.GratitudeEntry.created_at.desc())
        .all()
    )

    return entries

# Helper function for sending reminders
async def generate_llm_reminder(entry):
    # prompt = f"""Take the following gratitude journal thought and expand it into a meaningful, emotionally intelligent reflection. 
    # Make it warm, specific, and under 160 characters:
    
    # "{entry}"
    # """

    # prompt_2 = f"""
    # You are a thoughtful gratitude assistant.

    # Given the following journal entry, generate:
    # 1. A meaningful, emotionally intelligent reflection. Make it warm, specific, and under 160 characters.
    
    # 2. A brief explanation of why this reminder is meaningful, based on emotional tone, patterns, or recurring themes.

    # Entry:
    # "{entry}"

    # Respond in this JSON format:
    # {{
    # "reminder": "...",
    # "reasoning": "..."
    # }}
    # """

    prompt = f"""
    You're a personal gratitude assistant.

    Given a user's journal entry, generate a response with:
    1. A **less obvious**, possibly **overlooked**, but still heartfelt and meaningful gratitude reminder.
    → Avoid clichés. Make it emotionally intelligent and subtle — something they might have missed.

    2. A short explanation of why this reminder matters (focus on emotional patterns, small details, or inner grounding)

    3. A few tags (1–3) related to the moment

    4. One mood word that captures the tone

    Entry:
    \"\"\"{entry}\"\"\"

    Respond **only** with raw JSON, and use double quotes ("") for all keys and values.

    Return exactly this format:

    {{
    "reminder": "...",
    "reasoning": "...",
    "tags": ["...", "..."],
    "mood": "..."
    }}
    """

    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=300,
        temperature=0.7,
        stop=["}"]
    )

    # print(response)
    
    # return response.choices[0].message.content.strip()
    print(response)
    data = safe_parse_llm_json(response.choices[0].message.content)
    return data["reminder"], data["reasoning"], data["tags"], data["mood"]
    
def safe_parse_llm_json(content: str):
    # Remove markdown/code wrappers
    content = content.strip()
    if content.startswith("```"):
        content = re.sub(r"^```(?:json)?\n?", "", content)
        content = content.rstrip("```").strip()

    # Patch missing closing brace
    if content.count("{") > content.count("}"):
        content += "}"

    try:
        return json.loads(content)
    except json.JSONDecodeError as e:
        print("❌ JSON parsing failed")
        print("LLM output:\n", content)
        raise ValueError("Invalid JSON from LLM") from e
    
def send_reminder(db: Session = Depends(get_db), user=Depends(require_user)):
    if not user.phone_number:
        raise HTTPException(status_code=400, detail="User has no phone number on file")

    entries = (
        db.query(models.GratitudeEntry)
        .filter(models.GratitudeEntry.user_id == user.id)
        .order_by(models.GratitudeEntry.created_at.desc())
        .all()
    )

    if not entries:
        raise HTTPException(status_code=404, detail="No gratitude entries found")

    random_entry = random.choice(entries)
    reminder_text = random_entry.llm_reminder or random_entry.content
    entry_date = random_entry.created_at.strftime("%B %d, %Y")

    message_content = f"[imgrtfl] remembering your gratitude from {entry_date}: \"{reminder_text}\""

    # Send SMS
    try:
        twilio_client.messages.create(
            body=message_content,
            from_=os.environ.get("TWILIO_PHONE_NUMBER"),
            to=user.phone_number
        )
        print(f"✅ Reminder sent to user {user}")
    except Exception as e:
        # Log generic error without exposing user PII
        print(f"❌ Failed to send reminder to user {user}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send SMS reminder")

@app.post("/api/send-reminder/")
def trigger_reminder(background_tasks: BackgroundTasks, db: Session = Depends(get_db), user=Depends(require_user)):
    clerk_user_id = user["sub"]
    user = db.query(models.User).filter(models.User.clerk_user_id == clerk_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    background_tasks.add_task(send_reminder, db=db, user=user)
    return {"message": "Reminder scheduled"}

@app.post("/api/reflect", response_model=ReflectionResponse)
def generate_reflection(user=Depends(require_user), db: Session = Depends(get_db)): 
    clerk_user_id = user["sub"]

    db_user = db.query(models.User).filter(models.User.clerk_user_id == clerk_user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    entries = (
        db.query(models.GratitudeEntry)
        .filter(models.GratitudeEntry.user_id == db_user.id)
        .order_by(models.GratitudeEntry.created_at.desc())
        .limit(5)
        .all()
    )

    texts = [e.content for e in entries]
    if not texts:
        return {"reflection": "No entries yet to reflect on."}

    reflection = generate_reflection_summary(texts)
    db_reflection = models.Reflection(
        user_id=db_user.id,
        content=reflection,
    )
    db.add(db_reflection)
    db.commit()
    db.refresh(db_reflection)
    return db_reflection


def build_reflection_prompt(entries: list[str]) -> str:
    joined = "\n".join(f"- {e}" for e in entries)
    return f"""
You are a mindful journaling assistant.

Here are the last 5 gratitude entries from a user:
{joined}

Summarize any patterns, emotional tone, or recurring themes. Offer a 1–2 sentence insight they might find meaningful.
"""

def generate_reflection_summary(entries: list[str]) -> str:
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": build_reflection_prompt(entries)}],
        max_tokens=200
    )
    return response.choices[0].message.content.strip()
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

