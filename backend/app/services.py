from supabase import Client
from fastapi import Depends, HTTPException, status
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from fastapi.security import OAuth2PasswordBearer

from . import schemas
from .config import settings
from .supabase_client import get_supabase_client

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

def get_current_admin_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    return {"email": email}

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def get_categories(supabase: Client = Depends(get_supabase_client)) -> list[schemas.Category]:
    response = supabase.table("categories").select("*").execute()
    return response.data

def get_category(category_id: int, supabase: Client = Depends(get_supabase_client)) -> schemas.Category | None:
    response = supabase.table("categories").select("*").eq("id", category_id).execute()
    return response.data[0] if response.data else None

def create_category(category: schemas.CategoryCreate, supabase: Client = Depends(get_supabase_client)) -> schemas.Category:
    response = supabase.table("categories").insert(category.model_dump()).execute()
    return response.data[0]

def update_category(category_id: int, category: schemas.CategoryCreate, supabase: Client = Depends(get_supabase_client)) -> schemas.Category | None:
    response = supabase.table("categories").update(category.model_dump()).eq("id", category_id).execute()
    return response.data[0] if response.data else None

def delete_category(category_id: int, supabase: Client = Depends(get_supabase_client)) -> bool:
    response = supabase.table("categories").delete().eq("id", category_id).execute()
    return bool(response.data)

def get_products(supabase: Client = Depends(get_supabase_client)) -> list[schemas.Product]:
    response = supabase.table("products").select("*, category:categories(*), product_images(*)").execute()
    return response.data

def get_product(product_id: int, supabase: Client = Depends(get_supabase_client)) -> schemas.Product | None:
    response = supabase.table("products").select("*, category:categories(*), product_images(*)").eq("id", product_id).execute()
    return response.data[0] if response.data else None

def create_product(product: schemas.ProductCreate, supabase: Client = Depends(get_supabase_client)) -> schemas.Product:
    response = supabase.table("products").insert(product.model_dump()).execute()
    return response.data[0]

def update_product(product_id: int, product: schemas.ProductUpdate, supabase: Client = Depends(get_supabase_client)) -> schemas.Product | None:
    response = supabase.table("products").update(product.model_dump(exclude_unset=True)).eq("id", product_id).execute()
    return response.data[0] if response.data else None

def delete_product(product_id: int, supabase: Client = Depends(get_supabase_client)) -> bool:
    response = supabase.table("products").delete().eq("id", product_id).execute()
    return bool(response.data)

def create_product_image(product_id: int, image_url: str, supabase: Client = Depends(get_supabase_client)) -> schemas.ProductImage:
    response = supabase.table("product_images").insert({"product_id": product_id, "image_url": image_url}).execute()
    return response.data[0]

def delete_product_image(image_id: int, supabase: Client = Depends(get_supabase_client)) -> bool:
    # First, get the image URL so we can delete it from storage
    image_response = supabase.table("product_images").select("image_url").eq("id", image_id).execute()
    if not image_response.data:
        return False

    image_url = image_response.data[0]["image_url"]
    file_path = image_url.split("/")[-2:] # This is a bit brittle, but should work for now

    # Delete the file from storage
    supabase.storage.from_("products").remove([f"{file_path[0]}/{file_path[1]}"])

    # Delete the record from the database
    response = supabase.table("product_images").delete().eq("id", image_id).execute()
    return bool(response.data)

def set_primary_image(image_id: int, supabase: Client = Depends(get_supabase_client)) -> schemas.ProductImage | None:
    # First, get the product_id for the image
    image_response = supabase.table("product_images").select("product_id").eq("id", image_id).execute()
    if not image_response.data:
        return None
    product_id = image_response.data[0]["product_id"]

    # Set all other images for this product to is_primary = false
    supabase.table("product_images").update({"is_primary": False}).eq("product_id", product_id).execute()

    # Set the selected image to is_primary = true
    response = supabase.table("product_images").update({"is_primary": True}).eq("id", image_id).execute()
    return response.data[0] if response.data else None
