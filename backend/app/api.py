import structlog
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

logger = structlog.get_logger(__name__)

from . import services, schemas

# Main router for the API
router = APIRouter(prefix="/api")

# Router for admin-specific endpoints
admin_router = APIRouter(prefix="/api/admin")


# --- Authentication Endpoint ---
@admin_router.post("/login", response_model=schemas.Token)
async def login_for_access_token(form_data: schemas.AdminLoginRequest):
    try:
        admin_creds = await services.get_admin_credentials()
        if not services.verify_password(form_data.password, admin_creds["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        access_token = services.create_access_token(data={"sub": admin_creds["email"]})
        return {"access_token": access_token, "token_type": "bearer"}
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not find admin credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


# --- Public Endpoints ---
@router.get("/status")
async def status_check():
    return {"api": "ok"}

@router.get("/products", response_model=List[schemas.Product])
async def list_products(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    return await services.get_products(db, skip=skip, limit=limit)

@router.get("/categories", response_model=List[schemas.Category])
async def list_categories(db: AsyncSession = Depends(get_db)):
    return await services.get_categories(db=db)

@router.post("/customers", response_model=schemas.Customer)
async def create_customer_endpoint(customer: schemas.CustomerCreate, db: AsyncSession = Depends(get_db)):
    return await services.create_customer(db=db, customer=customer)

@router.post("/orders", response_model=schemas.Order)
async def create_order_endpoint(order: schemas.OrderCreate, db: AsyncSession = Depends(get_db)):
    try:
        return await services.create_order(db=db, order=order)
    except HTTPException as e:
        # Re-raise HTTPExceptions directly as they are intentional
        raise e
    except Exception as e:
        # Log the full traceback of the unexpected error for debugging
        logger.exception("An unexpected error occurred while creating an order.")
        raise HTTPException(status_code=500, detail="An unexpected error occurred while creating the order.")


# --- Admin Product Management Endpoints ---
@admin_router.post("/products/", response_model=schemas.Product)
async def create_product(product: schemas.ProductCreate, admin: dict = Depends(services.get_current_admin_user)):
    return await services.create_product(product=product)

@admin_router.get("/products/", response_model=List[schemas.Product])
async def read_products(skip: int = 0, limit: int = 100, admin: dict = Depends(services.get_current_admin_user)):
    return await services.get_products(skip=skip, limit=limit)

@admin_router.put("/products/{product_id}", response_model=schemas.Product)
async def update_product(product_id: int, product: schemas.ProductUpdate, admin: dict = Depends(services.get_current_admin_user)):
    db_product = await services.update_product(product_id=product_id, product_update=product)
    if db_product is None: raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@admin_router.delete("/products/{product_id}", response_model=schemas.Product)
async def delete_product(product_id: int, admin: dict = Depends(services.get_current_admin_user)):
    db_product = await services.delete_product(product_id=product_id)
    if db_product is None: raise HTTPException(status_code=404, detail="Product not found")
    return db_product


# --- Admin Category Management Endpoints ---
@admin_router.post("/categories/", response_model=schemas.Category)
async def create_category(category: schemas.CategoryCreate, admin: dict = Depends(services.get_current_admin_user)):
    return await services.create_category(category=category)

@admin_router.get("/categories/", response_model=List[schemas.Category])
async def read_categories(skip: int = 0, limit: int = 100, admin: dict = Depends(services.get_current_admin_user)):
    return await services.get_categories(skip=skip, limit=limit)

@admin_router.put("/categories/{category_id}", response_model=schemas.Category)
async def update_category(category_id: int, category: schemas.CategoryUpdate, admin: dict = Depends(services.get_current_admin_user)):
    db_category = await services.update_category(category_id=category_id, category_update=category)
    if db_category is None: raise HTTPException(status_code=404, detail="Category not found")
    return db_category

@admin_router.delete("/categories/{category_id}", response_model=schemas.Category)
async def delete_category(category_id: int, admin: dict = Depends(services.get_current_admin_user)):
    db_category = await services.delete_category(category_id=category_id)
    if db_category is None: raise HTTPException(status_code=404, detail="Category not found")
    return db_category


# --- Admin Customer Management Endpoints ---
@admin_router.get("/customers/", response_model=List[schemas.Customer])
async def read_customers(skip: int = 0, limit: int = 100, admin: dict = Depends(services.get_current_admin_user)):
    return await services.get_customers(skip=skip, limit=limit)

@admin_router.get("/customers/{customer_id}", response_model=schemas.Customer)
async def read_customer(customer_id: int, admin: dict = Depends(services.get_current_admin_user)):
    db_customer = await services.get_customer(customer_id=customer_id)
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return db_customer

@admin_router.post("/customers/", response_model=schemas.Customer)
async def create_admin_customer(customer: schemas.CustomerCreate, admin: dict = Depends(services.get_current_admin_user)):
    return await services.create_customer(customer=customer)

@admin_router.put("/customers/{customer_id}", response_model=schemas.Customer)
async def update_customer(customer_id: int, customer: schemas.CustomerUpdate, admin: dict = Depends(services.get_current_admin_user)):
    db_customer = await services.update_customer(customer_id=customer_id, customer_update=customer)
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return db_customer

@admin_router.delete("/customers/{customer_id}", response_model=schemas.Customer)
async def delete_customer(customer_id: int, admin: dict = Depends(services.get_current_admin_user)):
    db_customer = await services.delete_customer(customer_id=customer_id)
    if db_customer is None:
        raise HTTPException(status_code=404, detail="Customer not found")
    return db_customer


# --- Admin Order Management Endpoints ---
@admin_router.get("/orders/", response_model=List[schemas.Order])
async def read_orders(skip: int = 0, limit: int = 100, admin: dict = Depends(services.get_current_admin_user)):
    return await services.get_orders(skip=skip, limit=limit)

@admin_router.get("/orders/{order_id}", response_model=schemas.Order)
async def read_order(order_id: int, admin: dict = Depends(services.get_current_admin_user)):
    db_order = await services.get_order(order_id=order_id)
    if db_order is None: raise HTTPException(status_code=404, detail="Order not found")
    return db_order

@admin_router.put("/orders/{order_id}", response_model=schemas.Order)
async def update_order_status(order_id: int, status: schemas.OrderStatus, admin: dict = Depends(services.get_current_admin_user)):
    db_order = await services.update_order_status(order_id=order_id, status=status)
    if db_order is None: raise HTTPException(status_code=404, detail="Order not found")
    return db_order

@admin_router.delete("/orders/{order_id}", response_model=schemas.Order)
async def delete_order(order_id: int, admin: dict = Depends(services.get_current_admin_user)):
    db_order = await services.delete_order(order_id=order_id)
    if db_order is None: raise HTTPException(status_code=404, detail="Order not found")
    return db_order


# --- Admin Store Settings Endpoints ---
@admin_router.get("/settings/", response_model=schemas.StoreSettings)
async def get_settings(admin: dict = Depends(services.get_current_admin_user)):
    settings = await services.get_settings()
    if settings is None: raise HTTPException(status_code=404, detail="Settings not found")
    return settings

@admin_router.put("/settings/", response_model=schemas.StoreSettings)
async def update_settings(settings: schemas.StoreSettingsUpdate, admin: dict = Depends(services.get_current_admin_user)):
    return await services.update_settings(settings_update=settings)