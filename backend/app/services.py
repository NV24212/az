from jose import jwt
from datetime import datetime, timedelta, timezone
from .config import settings
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from .pocketbase_client import pb_client

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

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
    """
    Dependency to validate the JWT token and return the user's email.
    Raises HTTPException 401 if the token is invalid.
    """
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
        return {"email": email}
    except jwt.JWTError:
        raise credentials_exception

async def get_products():
    return await pb_client.get_full_list("products", expand="categoryId")

async def create_product(product_data: dict):
    return await pb_client.create_record("products", product_data)

async def update_product(product_id: str, product_data: dict):
    return await pb_client.update_record("products", product_id, product_data)

async def delete_product(product_id: str):
    return await pb_client.delete_record("products", product_id)

async def get_categories():
    return await pb_client.get_full_list("categories", sort="name")

async def create_category(category_data: dict):
    return await pb_client.create_record("categories", category_data)

async def update_category(category_id: str, category_data: dict):
    return await pb_client.update_record("categories", category_id, category_data)

async def delete_category(category_id: str):
    return await pb_client.delete_record("categories", category_id)