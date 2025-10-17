import bcrypt
import os
import secrets
import string
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from . import schemas
from .config import settings
from .supabase import supabase

# Load environment variables from .env file
load_dotenv()

# --- Authentication and User Services ---

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/admin/login")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    plain_password_bytes = plain_password.encode('utf-8')
    hashed_password_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password=plain_password_bytes, hashed_password=hashed_password_bytes)

async def get_admin_credentials():
    response = supabase.table('StoreSettings').select('adminEmail, hashed_password').eq('id', 1).single().execute()
    if not response.data:
        raise ValueError("Admin credentials not found in store settings.")
    return {"email": response.data['adminEmail'], "hashed_password": response.data['hashed_password']}

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def get_current_admin_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str | None = payload.get("sub")
        if email is None:
            raise credentials_exception
        admin_creds = await get_admin_credentials()
        if email != admin_creds["email"]:
            raise credentials_exception
        return {"email": email}
    except (JWTError, ValueError):
        raise credentials_exception

# --- Category Service Functions ---

async def get_categories(skip: int = 0, limit: int = 100):
    response = supabase.table('Category').select('*').range(skip, skip + limit -1).execute()
    return response.data

# --- Product Service Functions ---

async def get_products(skip: int = 0, limit: int = 100):
    response = supabase.table('Product').select('*, category:Category(*)').range(skip, skip + limit - 1).execute()
    return response.data