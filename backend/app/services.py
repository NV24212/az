import bcrypt
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from . import models, schemas
from .config import settings

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

def get_admin_credentials():
    admin_email = settings.AZHAR_ADMIN_EMAIL
    admin_password = settings.ADMIN_PASSWORD
    if not admin_email or not admin_password:
        raise ValueError("AZHAR_ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment.")
    return {"email": admin_email, "password": admin_password}

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
        admin_creds = get_admin_credentials()
        if email != admin_creds["email"]:
            raise credentials_exception
        return {"email": email}
    except JWTError:
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
    db_product = models.Product(**product.dict())
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    return db_product

async def update_product(db: AsyncSession, product_id: int, product_update: schemas.ProductUpdate):
    db_product = await get_product(db, product_id)
    if db_product:
        update_data = product_update.dict(exclude_unset=True)
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

async def create_customer(db: AsyncSession, customer: schemas.CustomerCreate):
    db_customer = models.Customer(**customer.dict())
    db.add(db_customer)
    await db.commit()
    await db.refresh(db_customer)
    return db_customer

async def create_order(db: AsyncSession, order: schemas.OrderCreate):
    total_amount = 0
    for item in order.items:
        product = await get_product(db, item.productId)
        if not product or product.stockQuantity < item.quantity:
            raise HTTPException(status_code=400, detail=f"Product {item.productId} not available or insufficient stock.")
        total_amount += product.price * item.quantity

    db_order = models.Order(customerId=order.customerId, totalAmount=total_amount)
    db.add(db_order)
    await db.flush()

    for item in order.items:
        product = await get_product(db, item.productId)
        db_order_item = models.OrderItem(
            orderId=db_order.orderId,
            productId=item.productId,
            quantity=item.quantity,
            priceAtPurchase=product.price
        )
        product.stockQuantity -= item.quantity
        db.add(db_order_item)

    await db.commit()
    await db.refresh(db_order)
    return db_order

async def get_order(db: AsyncSession, order_id: int):
    result = await db.execute(select(models.Order).filter(models.Order.orderId == order_id))
    return result.scalar_one_or_none()

async def get_orders(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(models.Order).offset(skip).limit(limit))
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
        update_data = settings_update.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_settings, key, value)
        await db.commit()
        await db.refresh(db_settings)
    return db_settings
