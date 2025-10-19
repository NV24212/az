from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from . import services, schemas

# Main router for the API
router = APIRouter(prefix="/api")

# Router for admin-specific endpoints
admin_router = APIRouter(
    prefix="/api/admin",
    dependencies=[Depends(services.get_current_admin_user)]
)

from .config import settings
import secrets

# --- Authentication Endpoint ---
@router.post("/login", response_model=schemas.Token, tags=["Authentication"])
async def login_for_access_token(form_data: schemas.AdminLoginRequest):
    """
    Logs in an admin by checking credentials against environment variables.
    This is a temporary solution until a proper database is in place.
    """
    # Use secrets.compare_digest for constant-time comparison to prevent timing attacks.
    # This is crucial for security, especially when handling passwords.
    is_valid_email = secrets.compare_digest(form_data.email, settings.ADMIN_EMAIL)
    is_valid_password = secrets.compare_digest(form_data.password, settings.ADMIN_PASSWORD)

    if not (is_valid_email and is_valid_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = services.create_access_token(
        data={"sub": form_data.email}
    )
    return {"access_token": access_token, "token_type": "bearer"}

# --- Public Endpoints ---
@router.get("/status")
async def status_check():
    """Checks the API status."""
    return {"api": "ok"}

@router.get("/products", response_model=List[schemas.Product])
async def list_products():
    """Retrieves a list of all products."""
    return await services.get_products()

@router.get("/categories", response_model=List[schemas.Category])
async def list_categories():
    """Retrieves a list of all product categories."""
    return await services.get_categories()

# --- Admin Endpoints ---
@admin_router.get("/status")
async def admin_status_check():
    """Checks the admin API status."""
    return {"api": "admin ok"}

@admin_router.post("/products", response_model=schemas.Product)
async def create_product(product: schemas.ProductCreate):
    """Creates a new product."""
    return await services.create_product(product.model_dump())

@admin_router.patch("/products/{product_id}", response_model=schemas.Product)
async def update_product(product_id: str, product: schemas.ProductUpdate):
    """Updates a product."""
    updated_product = await services.update_product(product_id, product.model_dump(exclude_unset=True))
    if updated_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return updated_product

@admin_router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: str):
    """Deletes a product."""
    success = await services.delete_product(product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return None

@admin_router.post("/categories", response_model=schemas.Category)
async def create_category(category: schemas.CategoryCreate):
    """Creates a new category."""
    return await services.create_category(category.model_dump())

@admin_router.patch("/categories/{category_id}", response_model=schemas.Category)
async def update_category(category_id: str, category: schemas.CategoryUpdate):
    """Updates a category."""
    updated_category = await services.update_category(category_id, category.model_dump(exclude_unset=True))
    if updated_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return updated_category

@admin_router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(category_id: str):
    """Deletes a category."""
    success = await services.delete_category(category_id)
    if not success:
        raise HTTPException(status_code=404, detail="Category not found")
    return None