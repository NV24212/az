import bcrypt
import os
import secrets
import string
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from . import models, schemas
from .config import settings
from .db import get_db

# Load environment variables from .env file
load_dotenv()

# --- Authentication and User Services ---

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/admin/login")

def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password=pwd_bytes, salt=salt)
    return hashed_password.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    plain_password_bytes = plain_password.encode('utf-8')
    hashed_password_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password=plain_password_bytes, hashed_password=hashed_password_bytes)

async def get_admin_credentials(db: AsyncSession):
    store_settings = await get_settings(db)
    if not store_settings or not store_settings.adminEmail or not store_settings.hashed_password:
        raise ValueError("Admin email and password must be set in the store settings.")
    return {"email": store_settings.adminEmail, "hashed_password": store_settings.hashed_password}

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def get_current_admin_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
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
        admin_creds = await get_admin_credentials(db)
        if email != admin_creds["email"]:
            raise credentials_exception
        return {"email": email}
    except (JWTError, ValueError):
        raise credentials_exception

# --- Category Service Functions ---

async def get_category(db: AsyncSession, category_id: int):
    result = await db.execute(select(models.Category).filter(models.Category.categoryId == category_id))
    return result.scalar_one_or_none()

async def get_category_by_name(db: AsyncSession, name: str):
    result = await db.execute(select(models.Category).filter(models.Category.name == name))
    return result.scalar_one_or_none()

async def get_categories(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(models.Category).offset(skip).limit(limit))
    return result.scalars().all()

async def create_category(db: AsyncSession, category: schemas.CategoryCreate):
    db_category = models.Category(name=category.name)
    db.add(db_category)
    await db.commit()
    await db.refresh(db_category)
    return db_category

async def update_category(db: AsyncSession, category_id: int, category_update: schemas.CategoryUpdate):
    db_category = await get_category(db, category_id)
    if db_category:
        db_category.name = category_update.name
        await db.commit()
        await db.refresh(db_category)
    return db_category

async def delete_category(db: AsyncSession, category_id: int):
    db_category = await get_category(db, category_id)
    if db_category:
        await db.delete(db_category)
        await db.commit()
    return db_category

# --- Product Service Functions ---

async def get_product(db: AsyncSession, product_id: int):
    result = await db.execute(select(models.Product).filter(models.Product.productId == product_id))
    return result.scalar_one_or_none()

async def get_products(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(models.Product).offset(skip).limit(limit))
    return result.scalars().all()

async def create_product(db: AsyncSession, product: schemas.ProductCreate):
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    return db_product

async def update_product(db: AsyncSession, product_id: int, product_update: schemas.ProductUpdate):
    db_product = await get_product(db, product_id)
    if db_product:
        update_data = product_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_product, key, value)
        await db.commit()
        await db.refresh(db_product)
    return db_product

async def delete_product(db: AsyncSession, product_id: int):
    db_product = await get_product(db, product_id)
    if db_product:
        await db.delete(db_product)
        await db.commit()
    return db_product

# --- Customer and Order Service Functions ---

async def get_customer(db: AsyncSession, customer_id: int):
    result = await db.execute(select(models.Customer).filter(models.Customer.customerId == customer_id))
    return result.scalar_one_or_none()

async def get_customers(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(models.Customer).offset(skip).limit(limit))
    return result.scalars().all()

async def create_customer(db: AsyncSession, customer: schemas.CustomerCreate):
    db_customer = models.Customer(**customer.model_dump())
    db.add(db_customer)
    await db.commit()
    await db.refresh(db_customer)
    return db_customer

async def update_customer(db: AsyncSession, customer_id: int, customer_update: schemas.CustomerUpdate):
    db_customer = await get_customer(db, customer_id)
    if db_customer:
        update_data = customer_update.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_customer, key, value)
        await db.commit()
        await db.refresh(db_customer)
    return db_customer

async def delete_customer(db: AsyncSession, customer_id: int):
    db_customer = await get_customer(db, customer_id)
    if db_customer:
        await db.delete(db_customer)
        await db.commit()
    return db_customer

from sqlalchemy import select

async def create_order(db: AsyncSession, order: schemas.OrderCreate):
    async with db.begin_nested(): # Start a transaction
        # 1. Fetch all products at once and validate stock
        product_ids = [item.productId for item in order.items]
        result = await db.execute(
            select(models.Product).filter(models.Product.productId.in_(product_ids))
        )
        products_in_db = {p.productId: p for p in result.scalars().all()}

        total_amount = 0
        for item in order.items:
            product = products_in_db.get(item.productId)
            if not product:
                raise HTTPException(status_code=404, detail=f"Product with ID {item.productId} not found.")
            if product.stockQuantity < item.quantity:
                raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}.")
            total_amount += product.price * item.quantity

        # 2. Create the Order object without items first
        db_order = models.Order(
            customerId=order.customerId,
            totalAmount=total_amount,
            status=models.OrderStatusEnum.PENDING,
        )
        db.add(db_order)
        await db.flush() # Flush to get the generated orderId

        # 3. Now create OrderItems with the correct orderId and update stock
        for item in order.items:
            product = products_in_db.get(item.productId)
            # This check is redundant but safe
            if product:
                product.stockQuantity -= item.quantity
                db_order_item = models.OrderItem(
                    orderId=db_order.orderId,
                    productId=item.productId,
                    quantity=item.quantity,
                    priceAtPurchase=product.price,
                )
                db.add(db_order_item)

    # 4. The transaction is automatically committed here by the 'async with' block.

    # 5. Fetch the fully populated order to return to the client
    # This ensures all relationships (customer, items, products) are loaded
    created_order = await get_order(db, db_order.orderId)
    return created_order

from sqlalchemy.orm import joinedload

async def get_order(db: AsyncSession, order_id: int):
    result = await db.execute(
        select(models.Order)
        .filter(models.Order.orderId == order_id)
        .options(
            joinedload(models.Order.customer),
            joinedload(models.Order.items).joinedload(models.OrderItem.product)
        )
    )
    return result.scalar_one_or_none()

async def get_orders(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(models.Order)
        .options(
            joinedload(models.Order.customer),
            joinedload(models.Order.items).joinedload(models.OrderItem.product)
        )
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def update_order_status(db: AsyncSession, order_id: int, status: schemas.OrderStatus):
    db_order = await get_order(db, order_id)
    if db_order:
        db_order.status = status
        await db.commit()
        await db.refresh(db_order)
    return db_order

async def delete_order(db: AsyncSession, order_id: int):
    db_order = await get_order(db, order_id)
    if db_order:
        await db.delete(db_order)
        await db.commit()
    return db_order

# --- Store Settings Service Functions ---

async def get_settings(db: AsyncSession):
    result = await db.execute(select(models.StoreSettings).filter(models.StoreSettings.id == 1))
    return result.scalar_one_or_none()

async def update_settings(db: AsyncSession, settings_update: schemas.StoreSettingsUpdate):
    db_settings = await get_settings(db)
    if db_settings:
        update_data = settings_update.model_dump(exclude_unset=True)

        # Handle password update separately to ensure it's not bypassed
        if 'password' in update_data:
            new_password = update_data.pop('password')
            # Only update the password if a non-empty string is provided
            if new_password:
                db_settings.hashed_password = get_password_hash(new_password)

        for key, value in update_data.items():
            setattr(db_settings, key, value)

        await db.commit()
        await db.refresh(db_settings)
    return db_settings

def generate_random_password(length: int = 16) -> str:
    alphabet = string.ascii_letters + string.digits + string.punctuation
    password = ''.join(secrets.choice(alphabet) for i in range(length))
    return password

async def initialize_database(db: AsyncSession):
    # This function is called on startup to ensure the store settings exist and are valid.
    store_settings = await get_settings(db)

    # Check for initial admin password in environment variables
    initial_password = os.getenv("AZHAR_ADMIN_INITIAL_PASSWORD")
    password_to_set = None

    if store_settings is None:
        if not initial_password:
            # Generate a random password if not set in environment
            initial_password = generate_random_password()
            print("--- Generated initial admin password. Please store it securely. ---")
            print(f"Initial Admin Password: {initial_password}")

        password_to_set = initial_password
        hashed_password = get_password_hash(password_to_set)

        print("--- No store settings found. Creating with initial password. ---")
        default_settings = models.StoreSettings(
            id=1,
            storeName="My Store",
            adminEmail=settings.AZHAR_ADMIN_EMAIL,
            hashed_password=hashed_password,
            storeDescription="Welcome to my store!",
            currency="USD",
            deliveryFee=5.00,
            freeDeliveryMinimum=50.00,
            codEnabled=True,
            orderSuccessMessageEn="Your order has been placed successfully!",
            orderSuccessMessageAr="تم تقديم طلبك بنجاح!",
            checkoutInstructionsEn="Please review your order details before proceeding.",
            checkoutInstructionsAr="يرجى مراجعة تفاصيل طلبك قبل المتابعة.",
            deliveryMessageEn="Your order will be delivered soon.",
            deliveryMessageAr="سيتم توصيل طلبك قريبا.",
            pickupMessageEn="You can pick up your order from our store.",
            pickupMessageAr="يمكنك استلام طلبك من متجرنا."
        )
        db.add(default_settings)

    elif not store_settings.hashed_password:
        if not initial_password:
            initial_password = generate_random_password()
            print("--- Hashed password not found. Generated a new random password. ---")
            print(f"New Admin Password: {initial_password}")

        password_to_set = initial_password
        store_settings.hashed_password = get_password_hash(password_to_set)
        print("--- Hashed password not found in existing settings. Setting new password. ---")

    await db.commit()
