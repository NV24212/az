from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from . import services, schemas
from .dependencies import PBAdminClient
import httpx
import structlog
import traceback

logger = structlog.get_logger(__name__)

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
async def status_check():
    """Checks the API status and the connection to PocketBase."""
    # This endpoint does not use the admin client dependency to avoid
    # unnecessary authentication calls for a simple health check.
    from .dependencies import get_pocketbase_admin_client
    pb_client = await anext(get_pocketbase_admin_client())
    pocketbase_healthy = await pb_client.health_check()
    return {
        "api": "ok",
        "pocketbase": "healthy" if pocketbase_healthy else "unhealthy"
    }

@router.get("/products", response_model=List[schemas.Product])
async def list_products(pb_client: PBAdminClient):
    """Retrievelist_categoriess a list of all products from PocketBase."""
    try:
        # Pydantic validation happens implicitly on return
        return await services.get_products(pb_client)
    except Exception as e:
        # CRITICAL: Log the detailed traceback here before the global handler catches it
        logger.error("product_list_failed", error=str(e), traceback=traceback.format_exc()) # Ensure traceback is imported
        # Allow the exception to continue to the global handler for the 500 response
        raise # The global handler will catch this and report 500

@router.get("/categories", response_model=List[schemas.Category])
async def list_categories(pb_client: PBAdminClient):
    """Retrierieves a list of all product categories from PocketBase."""
    try:
        return await services.get_categories(pb_client)
    except Exception as e:
        logger.error("category_list_failed", error=str(e), traceback=traceback.format_exc())
        raise

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