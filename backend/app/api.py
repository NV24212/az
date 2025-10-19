from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import List
from supabase import Client
import secrets
import uuid

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
    is_valid_password = secrets.compare_digest(form_data.password, settings.AZHAR_ADMIN_INITIAL_PASSWORD)
    if not is_valid_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = services.create_access_token(data={"sub": "admin"})
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

@admin_router.get("/products", response_model=List[schemas.Product], tags=["Admin - Products"])
def admin_list_products(supabase: Client = Depends(get_supabase_client)):
    return services.get_products(supabase=supabase)

@admin_router.get("/categories", response_model=List[schemas.Category], tags=["Admin - Categories"])
def admin_list_categories(supabase: Client = Depends(get_supabase_client)):
    return services.get_categories(supabase=supabase)

@admin_router.patch("/categories/{category_id}", response_model=schemas.Category, tags=["Admin - Categories"])
def update_category(category_id: int, category: schemas.CategoryCreate, supabase: Client = Depends(get_supabase_client)):
    db_category = services.update_category(category_id=category_id, category=category, supabase=supabase)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category

@admin_router.post("/products/{product_id}/images", response_model=schemas.ProductImage, tags=["Admin - Products"])
def upload_product_image(product_id: int, file: UploadFile = File(...), supabase: Client = Depends(get_supabase_client)):
    file_path = f"{product_id}/{uuid.uuid4()}{file.filename}"
    try:
        supabase.storage.from_("products").upload(file_path, file.file)
        image_url = supabase.storage.from_("products").get_public_url(file_path)
        return services.create_product_image(product_id=product_id, image_url=image_url, supabase=supabase)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@admin_router.delete("/products/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Admin - Products"])
def delete_product_image(image_id: int, supabase: Client = Depends(get_supabase_client)):
    success = services.delete_product_image(image_id=image_id, supabase=supabase)
    if not success:
        raise HTTPException(status_code=404, detail="Image not found")
    return None

@admin_router.post("/products/images/{image_id}/set-primary", response_model=schemas.ProductImage, tags=["Admin - Products"])
def set_primary_image(image_id: int, supabase: Client = Depends(get_supabase_client)):
    image = services.set_primary_image(image_id=image_id, supabase=supabase)
    if image is None:
        raise HTTPException(status_code=404, detail="Image not found")
    return image

@admin_router.get("/orders", response_model=List[schemas.Order], tags=["Admin - Orders"])
def admin_list_orders(supabase: Client = Depends(get_supabase_client)):
    return [
        {"id": 1, "customer_name": "John Doe", "total": 100, "status": "Pending"},
        {"id": 2, "customer_name": "Jane Doe", "total": 200, "status": "Shipped"},
    ]

@admin_router.get("/customers", response_model=List[schemas.Customer], tags=["Admin - Customers"])
def admin_list_customers(supabase: Client = Depends(get_supabase_client)):
    return [
        {"id": 1, "name": "John Doe", "email": "jhon@doe.com", "phone": "123-456-7890"},
        {"id": 2, "name": "Jane Doe", "email": "jane@doe.com", "phone": "098-765-4321"},
    ]

@admin_router.post("/products/{product_id}/variants", response_model=schemas.ProductVariant, tags=["Admin - Products"])
def create_variant(product_id: int, variant: schemas.ProductVariantCreate, supabase: Client = Depends(get_supabase_client)):
    return services.create_product_variant(product_id=product_id, variant=variant, supabase=supabase)

@admin_router.patch("/products/variants/{variant_id}", response_model=schemas.ProductVariant, tags=["Admin - Products"])
def update_variant(variant_id: int, variant: schemas.ProductVariantUpdate, supabase: Client = Depends(get_supabase_client)):
    db_variant = services.update_product_variant(variant_id=variant_id, variant=variant, supabase=supabase)
    if db_variant is None:
        raise HTTPException(status_code=404, detail="Variant not found")
    return db_variant

@admin_router.delete("/products/variants/{variant_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Admin - Products"])
def delete_variant(variant_id: int, supabase: Client = Depends(get_supabase_client)):
    success = services.delete_product_variant(variant_id=variant_id, supabase=supabase)
    if not success:
        raise HTTPException(status_code=404, detail="Variant not found")
    return None

@admin_router.post("/products/variants/{variant_id}/image", response_model=schemas.ProductVariant, tags=["Admin - Products"])
def upload_variant_image(variant_id: int, file: UploadFile = File(...), supabase: Client = Depends(get_supabase_client)):
    file_path = f"variants/{variant_id}/{uuid.uuid4()}{file.filename}"
    try:
        supabase.storage.from_("products").upload(file_path, file.file)
        image_url = supabase.storage.from_("products").get_public_url(file_path)
        return services.update_product_variant_image(variant_id=variant_id, image_url=image_url, supabase=supabase)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@admin_router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Admin - Categories"])
def delete_category(category_id: int, supabase: Client = Depends(get_supabase_client)):
    success = services.delete_category(category_id=category_id, supabase=supabase)
    if not success:
        raise HTTPException(status_code=404, detail="Category not found")
    return None
