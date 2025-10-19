import structlog
from jose import jwt
from datetime import datetime, timedelta, timezone
from .config import settings
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")
logger = structlog.get_logger(__name__)

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
    return []

async def create_product(product_data: dict):
    # This is a stub. In the future, it will create a product in the database.
    # Returning a dummy object to satisfy the response_model
    dummy_category = {
        "id": "cat_123",
        "collectionId": "collections",
        "collectionName": "categories",
        "created": "2024-01-01T00:00:00Z",
        "updated": "2024-01-01T00:00:00Z",
        "name": "Dummy Category"
    }
    dummy_product = {
        "id": "prod_123",
        "collectionId": "collections",
        "collectionName": "products",
        "name": product_data.get("name", "Dummy Product"),
        "description": product_data.get("description"),
        "price": product_data.get("price", 99.99),
        "stockQuantity": product_data.get("stockQuantity", 100),
        "imageUrl": product_data.get("imageUrl"),
        "categoryId": product_data.get("categoryId"),
        "category": dummy_category
    }
    return dummy_product

async def update_product(product_id: str, product_data: dict):
    # This is a stub. In the future, it will update a product in the database.
    return await create_product(product_data)

async def delete_product(product_id: str):
    # This is a stub. In the future, it will delete a product from the database.
    return True

async def get_categories():
    return []

async def create_category(category_data: dict):
    # This is a stub. In the future, it will create a category in the database.
    dummy_category = {
        "id": "cat_123",
        "collectionId": "collections",
        "collectionName": "categories",
        "created": "2024-01-01T00:00:00Z",
        "updated": "2024-01-01T00:00:00Z",
        "name": category_data.get("name", "Dummy Category")
    }
    return dummy_category

async def update_category(category_id: str, category_data: dict):
    # This is a stub. In the future, it will update a category in the database.
    return await create_category(category_data)

async def delete_category(category_id: str):
    # This is a stub. In the future, it will delete a category from the database.
    return True
