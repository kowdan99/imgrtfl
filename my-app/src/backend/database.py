from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Database URL from environment variable
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://doadmin:AVNS_wS9qIsFIZUjkI-NOdiq@db-postgresql-sfo3-01886-do-user-20420403-0.d.db.ondigitalocean.com:25060/defaultdb?sslmode=require")

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Create a SessionLocal class for database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for declarative models
Base = declarative_base()
