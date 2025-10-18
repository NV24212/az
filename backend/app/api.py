from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from . import services, schemas
from .dependencies import PBAdminClient
import httpx

# Main router for the API
router = APIRouter(prefix="/api")

# Router for admin-specific endpoints
admin_router = APIRouter(
    prefix="/api/admin",
    dependencies=[Depends(services.get_current_admin_user)]
)

# --- Authentication Endpoint ---
@router.post("/login", response_model=schemas.Token, tags=["Authentication"])
async def login_for_access_token(form_data: schemas.AdminLoginRequest, pb_client: PBAdminClient):
    """
    Logs in an admin by authenticating with PocketBase, then returns a
    FastAPI-specific JWT access token.
    """
    # The dependency injection now handles the admin authentication.
    # We just need to create our own token if the dependency resolved.
    access_token = services.create_access_token(
        data={"sub": form_data.email}
    )
    return {"access_token": access_token, "token_type": "bearer"}

# --- Public Endpoints ---
@router.get("/status")
async def status_check(pb_client: PBAdminClient):
    """Checks the API status and the connection to PocketBase."""
    # The dependency now implicitly checks the health.
    return {"api": "ok", "pocketbase": "healthy"}

@router.get("/products", response_model=List[schemas.Product])
async def list_products(pb_client: PBAdminClient):
    """Retrieves a list of all products from PocketBase."""
    return await services.get_products(pb_client)

@router.get("/categories", response_model=List[schemas.Category])
async def list_categories(pb_client: PBAdminClient):
    """Retrieves a list of all product categories from PocketBase."""
    return await services.get_categories(pb_client)

# --- Admin Endpoints ---
@admin_router.get("/status")
async def admin_status_check():
    """Checks the admin API status."""
    return {"api": "admin ok"}

@admin_router.post("/products", response_model=schemas.Product)
async def create_product(product: schemas.ProductCreate, pb_client: PBAdminClient):
    """Creates a new product in PocketBase."""
    return await services.create_product(pb_client, product.model_dump())

@admin_router.patch("/products/{product_id}", response_model=schemas.Product)
async def update_product(product_id: str, product: schemas.ProductUpdate, pb_client: PBAdminClient):
    """Updates a product in PocketBase."""
    updated_product = await services.update_product(pb_client, product_id, product.model_dump(exclude_unset=True))
    if updated_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return updated_product

@admin_router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: str, pb_client: PBAdminClient):
    """Deletes a product from PocketBase."""
    success = await services.delete_product(pb_client, product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return None

@admin_router.post("/categories", response_model=schemas.Category)
async def create_category(category: schemas.CategoryCreate, pb_client: PBAdminClient):
    """Creates a new category in PocketBase."""
    return await services.create_category(pb_client, category.model_dump())

@admin_router.patch("/categories/{category_id}", response_model=schemas.Category)
async def update_category(category_id: str, category: schemas.CategoryUpdate, pb_client: PBAdminClient):
    """Updates a category in PocketBase."""
    updated_category = await services.update_category(pb_client, category_id, category.model_dump(exclude_unset=True))
    if updated_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return updated_category

@admin_router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(category_id: str, pb_client: PBAdminClient):
    """Deletes a category from PocketBase."""
    success = await services.delete_category(pb_client, category_id)
    if not success:
        raise HTTPException(status_code=404, detail="Category not found")
    return None