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
    response = supabase.table("products").select("*, category:categories(*), product_images(*), product_variants(*)").execute()
    return response.data

def get_product(product_id: int, supabase: Client = Depends(get_supabase_client)) -> schemas.Product | None:
    response = supabase.table("products").select("*, category:categories(*), product_images(*), product_variants(*)").eq("id", product_id).execute()
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
    existing_primary_image = supabase.table("product_images").select("id").eq("product_id", product_id).eq("is_primary", True).execute()
    is_primary = not existing_primary_image.data
    response = supabase.table("product_images").insert({"product_id": product_id, "image_url": image_url, "is_primary": is_primary}).execute()
    return response.data[0]

def delete_product_image(image_id: int, supabase: Client = Depends(get_supabase_client)) -> bool:
    image_response = supabase.table("product_images").select("image_url, product_id, is_primary").eq("id", image_id).execute()
    if not image_response.data:
        return False

    image_data = image_response.data[0]
    image_url = image_data["image_url"]
    product_id = image_data["product_id"]
    was_primary = image_data["is_primary"]

    file_path = "/".join(image_url.split("/")[-2:])

    supabase.storage.from_("products").remove([file_path])

    response = supabase.table("product_images").delete().eq("id", image_id).execute()

    if was_primary:
        remaining_images = supabase.table("product_images").select("id").eq("product_id", product_id).order("created_at").execute()
        if remaining_images.data:
            new_primary_id = remaining_images.data[0]["id"]
            supabase.table("product_images").update({"is_primary": True}).eq("id", new_primary_id).execute()

    return bool(response.data)

def set_primary_image(image_id: int, supabase: Client = Depends(get_supabase_client)) -> schemas.ProductImage | None:
    image_response = supabase.table("product_images").select("product_id").eq("id", image_id).execute()
    if not image_response.data:
        return None
    product_id = image_response.data[0]["product_id"]

    supabase.table("product_images").update({"is_primary": False}).eq("product_id", product_id).execute()

    response = supabase.table("product_images").update({"is_primary": True}).eq("id", image_id).execute()
    return response.data[0] if response.data else None

def create_product_variant(product_id: int, variant: schemas.ProductVariantCreate, supabase: Client = Depends(get_supabase_client)) -> schemas.ProductVariant:
    response = supabase.table("product_variants").insert({"product_id": product_id, **variant.model_dump()}).execute()
    return response.data[0]

def update_product_variant(variant_id: int, variant: schemas.ProductVariantUpdate, supabase: Client = Depends(get_supabase_client)) -> schemas.ProductVariant | None:
    response = supabase.table("product_variants").update(variant.model_dump(exclude_unset=True)).eq("id", variant_id).execute()
    return response.data[0] if response.data else None

def delete_product_variant(variant_id: int, supabase: Client = Depends(get_supabase_client)) -> bool:
    response = supabase.table("product_variants").delete().eq("id", variant_id).execute()
    return bool(response.data)

def update_product_variant_image(variant_id: int, image_url: str, supabase: Client = Depends(get_supabase_client)) -> schemas.ProductVariant | None:
    response = supabase.table("product_variants").update({"image_url": image_url}).eq("id", variant_id).execute()
    return response.data[0] if response.data else None
