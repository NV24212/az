from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from . import services, schemas
from .config import settings
from .pocketbase_client import pb_client

# Main router for the API
router = APIRouter(prefix="/api")

# Router for admin-specific endpoints
admin_router = APIRouter(
    prefix="/api/admin",
    dependencies=[Depends(services.get_current_admin_user)]
)

# --- Authentication Endpoint ---
@router.post("/login", response_model=schemas.Token, tags=["Authentication"])
async def login_for_access_token(form_data: schemas.AdminLoginRequest):
    """
    Logs in an admin by authenticating with PocketBase, then returns a
    FastAPI-specific JWT access token.
    """
    try:
        # Authenticate with PocketBase to verify credentials.
        # The new pb_client handles token management automatically.
        await pb_client.client.admins.auth_with_password(
            form_data.email, form_data.password
        )
        # If successful, create a JWT token for our own API
        access_token = services.create_access_token(
            data={"sub": form_data.email}
        )
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

# --- Public Endpoints ---
@router.get("/status")
async def status_check():
    """Checks the API status and the connection to PocketBase."""
    pocketbase_healthy = await pb_client.health_check()
    return {
        "api": "ok",
        "pocketbase": "healthy" if pocketbase_healthy else "unhealthy"
    }

@router.get("/products", response_model=List[schemas.Product])
async def list_products():
    """Retrieves a list of all products from PocketBase."""
    result = await services.get_products()
    return result.items if result else []

@router.get("/categories", response_model=List[schemas.Category])
async def list_categories():
    """Retrieves a list of all product categories from PocketBase."""
    result = await services.get_categories()
    return result.items if result else []

# --- Admin Endpoints ---
@admin_router.get("/status")
async def admin_status_check():
    """Checks the admin API status."""
    return {"api": "admin ok"}

@admin_router.post("/products", response_model=schemas.Product)
async def create_product(product: schemas.ProductCreate):
    """Creates a new product in PocketBase."""
    return await services.create_product(product.model_dump())

@admin_router.patch("/products/{product_id}", response_model=schemas.Product)
async def update_product(product_id: str, product: schemas.ProductUpdate):
    """Updates a product in PocketBase."""
    # model_dump(exclude_unset=True) is important to only send updated fields
    updated_product = await services.update_product(product_id, product.model_dump(exclude_unset=True))
    if updated_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return updated_product

@admin_router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: str):
    """Deletes a product from PocketBase."""
    success = await services.delete_product(product_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return None

@admin_router.post("/categories", response_model=schemas.Category)
async def create_category(category: schemas.CategoryCreate):
    """Creates a new category in PocketBase."""
    return await services.create_category(category.model_dump())

@admin_router.patch("/categories/{category_id}", response_model=schemas.Category)
async def update_category(category_id: str, category: schemas.CategoryUpdate):
    """Updates a category in PocketBase."""
    updated_category = await services.update_category(category_id, category.model_dump(exclude_unset=True))
    if updated_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return updated_category

@admin_router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(category_id: str):
    """Deletes a category from PocketBase."""
    success = await services.delete_category(category_id)
    if not success:
        raise HTTPException(status_code=404, detail="Category not found")
    return None

# --- Public Order Endpoint ---
@router.post("/orders", response_model=schemas.Order, tags=["Orders"])
async def create_order(order: schemas.OrderCreate):
    """Creates a new order, including a customer and order items."""
    return await services.create_order(order.model_dump())

# --- Admin Customer Endpoints ---
@admin_router.get("/customers", response_model=List[schemas.Customer], tags=["Customers"])
async def list_customers():
    """Retrieves a list of all customers."""
    result = await services.get_customers()
    return result.items if result else []

# --- Admin Order Endpoints ---
@admin_router.get("/orders", response_model=List[schemas.Order], tags=["Orders"])
async def list_orders():
    """Retrieves a list of all orders."""
    result = await services.get_orders()
    return result.items if result else []

@admin_router.get("/orders/{order_id}", response_model=schemas.Order, tags=["Orders"])
async def get_order(order_id: str):
    """Retrieves a single order by its ID."""
    order = await services.get_order(order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@admin_router.patch("/orders/{order_id}", response_model=schemas.Order, tags=["Orders"])
async def update_order_status(order_id: str, order_update: schemas.OrderUpdate):
    """Updates the status of an order."""
    updated_order = await services.update_order_status(order_id, order_update.status)
    if updated_order is None:
        raise HTTPException(status_code=404, detail="Order not found")
    return updated_order

# --- Admin Settings Endpoints ---
@admin_router.get("/settings", response_model=schemas.StoreSettings, tags=["Settings"])
async def get_settings():
    """Retrieves the store settings."""
    settings = await services.get_settings()
    if settings is None:
        raise HTTPException(status_code=404, detail="Settings not found")
    return settings

@admin_router.put("/settings", response_model=schemas.StoreSettings, tags=["Settings"])
async def update_settings(settings: schemas.StoreSettings):
    """Updates the store settings."""
    updated_settings = await services.update_settings(settings)
    if updated_settings is None:
        raise HTTPException(status_code=500, detail="Failed to update settings")
    return updated_settings