from jose import jwt
from datetime import datetime, timedelta, timezone
from .config import settings
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from .pocketbase_client import pb_client
from . import schemas

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/login")

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def get_current_admin_user(token: str = Depends(oauth2_scheme)):
    """
    Dependency to validate the JWT token and return the user's email.
    Raises HTTPException 401 if the token is invalid.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str | None = payload.get("sub")
        if email is None:
            raise credentials_exception
        return {"email": email}
    except jwt.JWTError:
        raise credentials_exception

async def get_products():
    return await pb_client.get_full_list("products", {"expand": "categoryId"})

async def create_product(product_data: dict):
    return await pb_client.create_record("products", product_data)

async def update_product(product_id: str, product_data: dict):
    return await pb_client.update_record("products", product_id, product_data)

async def delete_product(product_id: str):
    return await pb_client.delete_record("products", product_id)

async def get_categories():
    return await pb_client.get_records("categories")

async def create_category(category_data: dict):
    return await pb_client.create_record("categories", category_data)

async def update_category(category_id: str, category_data: dict):
    return await pb_client.update_record("categories", category_id, category_data)

async def delete_category(category_id: str):
    return await pb_client.delete_record("categories", category_id)

# --- Customer Services ---
async def get_customers():
    return await pb_client.get_full_list("customers")

async def create_customer(customer_data: dict):
    return await pb_client.create_record("customers", customer_data)

# --- Order Services ---
async def get_orders():
    return await pb_client.get_full_list("orders", {"expand": "customerId,items.productId"})

async def get_order(order_id: str):
    return await pb_client.get_record("orders", order_id, {"expand": "customerId,items.productId"})

async def create_order(order_data: dict):
    # IMPORTANT: This implementation is not transactional. In a production environment,
    # all database operations for creating an order should be wrapped in a single
    # transaction to ensure data consistency. If any step fails, all previous
    # steps should be rolled back. PocketBase does not support transactions
    # across multiple collections in this manner, so a more robust solution
    # might involve a different database or a different approach to data modeling.

    # 1. Create Customer
    customer = await create_customer(order_data['customer'])
    if not customer:
        raise HTTPException(status_code=400, detail="Could not create customer.")

    # 2. Calculate total amount and prepare order items
    total_amount = 0
    order_items_to_create = []
    for item in order_data['items']:
        product = await pb_client.get_record("products", item['productId'])
        if not product:
            raise HTTPException(status_code=404, detail=f"Product with id {item['productId']} not found.")
        total_amount += product.price * item['quantity']
        order_items_to_create.append({
            "productId": item['productId'],
            "quantity": item['quantity'],
            "priceAtPurchase": product.price
        })

    # 3. Create Order
    new_order_data = {
        "customerId": customer.id,
        "totalAmount": total_amount,
        "status": "PENDING",
        "items": [] # Will be updated after creating order items
    }
    new_order = await pb_client.create_record("orders", new_order_data)
    if not new_order:
        raise HTTPException(status_code=500, detail="Could not create order.")

    # 4. Create OrderItems and link them to the Order
    created_item_ids = []
    for item_data in order_items_to_create:
        item_data["orderId"] = new_order.id
        new_item = await pb_client.create_record("order_items", item_data)
        if new_item:
            created_item_ids.append(new_item.id)

    # 5. Update the order with the created order items
    await pb_client.update_record("orders", new_order.id, {"items": created_item_ids})

    return await get_order(new_order.id)


async def update_order_status(order_id: str, status: str):
    return await pb_client.update_record("orders", order_id, {"status": status})

# --- Settings Services ---
async def get_settings():
    """Retrieves the store settings. Assumes one settings document in the collection."""
    settings_list = await pb_client.get_full_list("settings")
    if settings_list and len(settings_list) > 0:
        # Assuming there is only one settings document
        return schemas.StoreSettings(**settings_list[0].to_dict())
    return None

async def update_settings(settings_data: schemas.StoreSettings):
    """Updates the store settings."""
    settings_list = await pb_client.get_full_list("settings")
    if settings_list and len(settings_list) > 0:
        record_id = settings_list[0].id
        updated_record = await pb_client.update_record("settings", record_id, settings_data.model_dump())
        if updated_record:
            return schemas.StoreSettings(**updated_record.to_dict())
    return None