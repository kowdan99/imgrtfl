from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import requests
from dotenv import load_dotenv
import os

load_dotenv()

bearer_scheme = HTTPBearer()

# Load environment variables safely
JWKS_URL = os.getenv("CLERK_JWT_JWKS_URL")
JWT_ISSUER = os.getenv("CLERK_JWT_ISSUER")
JWT_AUDIENCE = os.getenv("CLERK_JWT_AUDIENCE")

if not JWKS_URL or not JWT_ISSUER or not JWT_AUDIENCE:
    raise RuntimeError("Missing required environment variables for JWT verification")

# Fetch JWKS (JSON Web Key Set) safely
try:
    jwks_response = requests.get(JWKS_URL)
    jwks = jwks_response.json()
except Exception as e:
    raise RuntimeError(f"Failed to fetch Clerk JWKS: {e}")

def verify_token(token: str):
    for key in jwks["keys"]:
        try:
            return jwt.decode(
                token,
                key,
                algorithms=["RS256"],
                audience=JWT_AUDIENCE,
                issuer=JWT_ISSUER,
            )
        except JWTError:
            continue

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials",
    )

def require_user(auth: HTTPAuthorizationCredentials = Depends(bearer_scheme)):
    token = auth.credentials
    payload = verify_token(token)
    return payload
