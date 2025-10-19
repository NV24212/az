from supabase import Client
from fastapi import Depends
from jose import jwt
from datetime import datetime, timedelta, timezone

from . import schemas
from .config import settings
from .supabase_client import get_supabase_client

# --- Authentication Service ---

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

# --- Category Services ---

def get_categories(supabase: Client = Depends(get_supabase_client)) -> list[schemas.Category]:
    response = supabase.table("category").select("*").execute()
    return response.data

def get_category(category_id: int, supabase: Client = Depends(get_supabase_client)) -> schemas.Category | None:
    response = supabase.table("category").select("*").eq("id", category_id).execute()
    return response.data[0] if response.data else None

def create_category(category: schemas.CategoryCreate, supabase: Client = Depends(get_supabase_client)) -> schemas.Category:
    response = supabase.table("category").insert(category.model_dump()).execute()
    return response.data[0]

def delete_category(category_id: int, supabase: Client = Depends(get_supabase_client)) -> bool:
    response = supabase.table("category").delete().eq("id", category_id).execute()
    return bool(response.data)

# --- Product Services ---

def get_products(supabase: Client = Depends(get_supabase_client)) -> list[schemas.Product]:
    response = supabase.table("product").select("*, category(*)").execute()
    return response.data

def get_product(product_id: int, supabase: Client = Depends(get_supabase_client)) -> schemas.Product | None:
    response = supabase.table("product").select("*, category(*)").eq("id", product_id).execute()
    return response.data[0] if response.data else None

def create_product(product: schemas.ProductCreate, supabase: Client = Depends(get_supabase_client)) -> schemas.Product:
    response = supabase.table("product").insert(product.model_dump()).execute()
    return response.data[0]

def update_product(product_id: int, product: schemas.ProductUpdate, supabase: Client = Depends(get_supabase_client)) -> schemas.Product | None:
    response = supabase.table("product").update(product.model_dump(exclude_unset=True)).eq("id", product_id).execute()
    return response.data[0] if response.data else None

def delete_product(product_id: int, supabase: Client = Depends(get_supabase_client)) -> bool:
    response = supabase.table("product").delete().eq("id", product_id).execute()
    return bool(response.data)
