from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from supabase import Client

from . import services, schemas
from .config import settings
from .supabase_client import get_supabase_client


router = APIRouter(prefix="/api")
admin_router = APIRouter(
    prefix="/api/admin",
    dependencies=[Depends(services.get_current_admin_user)],
)

@router.post("/login", response_model=schemas.Token, tags=["Authentication"])
def login_for_access_token(form_data: schemas.AdminLoginRequest):
    is_valid_user = (form_data.email == settings.ADMIN_EMAIL and
                     form_data.password == settings.ADMIN_PASSWORD)
    if not is_valid_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = services.create_access_token(data={"sub": form_data.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/products", response_model=List[schemas.Product], tags=["Products"])
def list_products(supabase: Client = Depends(get_supabase_client)):
    return services.get_products(supabase=supabase)

@router.get("/products/{product_id}", response_model=schemas.Product, tags=["Products"])
def get_product(product_id: int, supabase: Client = Depends(get_supabase_client)):
    db_product = services.get_product(product_id=product_id, supabase=supabase)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@router.get("/categories", response_model=List[schemas.Category], tags=["Categories"])
def list_categories(supabase: Client = Depends(get_supabase_client)):
    return services.get_categories(supabase=supabase)

@router.get("/categories/{category_id}", response_model=schemas.Category, tags=["Categories"])
def get_category(category_id: int, supabase: Client = Depends(get_supabase_client)):
    db_category = services.get_category(category_id=category_id, supabase=supabase)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category

@admin_router.post("/products", response_model=schemas.Product, tags=["Admin - Products"])
def create_product(product: schemas.ProductCreate, supabase: Client = Depends(get_supabase_client)):
    return services.create_product(product=product, supabase=supabase)

@admin_router.patch("/products/{product_id}", response_model=schemas.Product, tags=["Admin - Products"])
def update_product(product_id: int, product: schemas.ProductUpdate, supabase: Client = Depends(get_supabase_client)):
    db_product = services.update_product(product_id=product_id, product=product, supabase=supabase)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@admin_router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Admin - Products"])
def delete_product(product_id: int, supabase: Client = Depends(get_supabase_client)):
    success = services.delete_product(product_id=product_id, supabase=supabase)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return None

@admin_router.post("/categories", response_model=schemas.Category, tags=["Admin - Categories"])
def create_category(category: schemas.CategoryCreate, supabase: Client = Depends(get_supabase_client)):
    return services.create_category(category=category, supabase=supabase)

@admin_router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Admin - Categories"])
def delete_category(category_id: int, supabase: Client = Depends(get_supabase_client)):
    success = services.delete_category(category_id=category_id, supabase=supabase)
    if not success:
        raise HTTPException(status_code=404, detail="Category not found")
    return None
