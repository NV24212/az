import bcrypt
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from . import models, schemas
from jose import jwt
from datetime import datetime, timedelta, timezone
from .config import settings

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain-text password against a hashed password.

    Args:
        plain_password: The password to verify.
        hashed_password: The hashed password from the database.

    Returns:
        True if the passwords match, False otherwise.
    """
    # bcrypt.checkpw requires the hashed password to be in bytes.
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def get_admin_credentials(db: AsyncSession):
    result = await db.execute(select(models.StoreSettings).filter(models.StoreSettings.id == 1))
    settings = result.scalar_one_or_none()
    if not settings:
        raise ValueError("Admin credentials not found in store settings.")
    return {"email": settings.adminEmail, "hashed_password": settings.hashed_password}

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from .database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/admin/login")

async def get_current_admin_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    """
    Dependency to get the current admin user from a JWT token.
    Raises HTTPException 401 if the token is invalid or the user is not found.
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

        # Since this is an async function, we need to get the admin credentials
        # within this async context.
        admin_creds = await get_admin_credentials(db)
        if email != admin_creds["email"]:
            raise credentials_exception

        return {"email": email}
    except (jwt.JWTError, ValueError):
        raise credentials_exception

async def get_products(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(models.Product).offset(skip).limit(limit))
    return result.scalars().all()

async def get_categories(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(models.Category).offset(skip).limit(limit))
    return result.scalars().all()

async def create_customer(db: AsyncSession, customer: schemas.CustomerCreate):
    db_customer = models.Customer(**customer.model_dump())
    db.add(db_customer)
    await db.commit()
    await db.refresh(db_customer)
    return db_customer

async def create_order(db: AsyncSession, order: schemas.OrderCreate):
    total_amount = 0
    for item in order.items:
        result = await db.execute(select(models.Product).filter(models.Product.productId == item.productId))
        product = result.scalar_one()
        total_amount += product.price * item.quantity

    db_order = models.Order(
        customerId=order.customerId,
        totalAmount=total_amount,
        status="PENDING"
    )
    db.add(db_order)
    await db.commit()
    await db.refresh(db_order)

    for item in order.items:
        result = await db.execute(select(models.Product).filter(models.Product.productId == item.productId))
        product = result.scalar_one()
        db_order_item = models.OrderItem(
            orderId=db_order.orderId,
            productId=item.productId,
            quantity=item.quantity,
            priceAtPurchase=product.price
        )
        db.add(db_order_item)
    await db.commit()
    await db.refresh(db_order)
    return db_order

async def create_product(db: AsyncSession, product: schemas.ProductCreate):
    db_product = models.Product(**product.model_dump())
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    return db_product

async def update_product(db: AsyncSession, product_id: int, product_update: schemas.ProductUpdate):
    result = await db.execute(select(models.Product).filter(models.Product.productId == product_id))
    db_product = result.scalar_one_or_none()
    if db_product:
        for key, value in product_update.model_dump(exclude_unset=True).items():
            setattr(db_product, key, value)
        await db.commit()
        await db.refresh(db_product)
    return db_product

async def delete_product(db: AsyncSession, product_id: int):
    result = await db.execute(select(models.Product).filter(models.Product.productId == product_id))
    db_product = result.scalar_one_or_none()
    if db_product:
        await db.delete(db_product)
        await db.commit()
    return db_product

async def create_category(db: AsyncSession, category: schemas.CategoryCreate):
    db_category = models.Category(**category.model_dump())
    db.add(db_category)
    await db.commit()
    await db.refresh(db_category)
    return db_category

async def update_category(db: AsyncSession, category_id: int, category_update: schemas.CategoryUpdate):
    result = await db.execute(select(models.Category).filter(models.Category.categoryId == category_id))
    db_category = result.scalar_one_or_none()
    if db_category:
        for key, value in category_update.model_dump(exclude_unset=True).items():
            setattr(db_category, key, value)
        await db.commit()
        await db.refresh(db_category)
    return db_category

async def delete_category(db: AsyncSession, category_id: int):
    result = await db.execute(select(models.Category).filter(models.Category.categoryId == category_id))
    db_category = result.scalar_one_or_none()
    if db_category:
        await db.delete(db_category)
        await db.commit()
    return db_category

async def get_customers(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(models.Customer).offset(skip).limit(limit))
    return result.scalars().all()

async def get_customer(db: AsyncSession, customer_id: int):
    result = await db.execute(select(models.Customer).filter(models.Customer.customerId == customer_id))
    return result.scalar_one_or_none()

async def update_customer(db: AsyncSession, customer_id: int, customer_update: schemas.CustomerUpdate):
    result = await db.execute(select(models.Customer).filter(models.Customer.customerId == customer_id))
    db_customer = result.scalar_one_or_none()
    if db_customer:
        for key, value in customer_update.model_dump(exclude_unset=True).items():
            setattr(db_customer, key, value)
        await db.commit()
        await db.refresh(db_customer)
    return db_customer

async def delete_customer(db: AsyncSession, customer_id: int):
    result = await db.execute(select(models.Customer).filter(models.Customer.customerId == customer_id))
    db_customer = result.scalar_one_or_none()
    if db_customer:
        await db.delete(db_customer)
        await db.commit()
    return db_customer

async def get_orders(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(models.Order).offset(skip).limit(limit))
    return result.scalars().all()

async def get_order(db: AsyncSession, order_id: int):
    result = await db.execute(select(models.Order).filter(models.Order.orderId == order_id))
    return result.scalar_one_or_none()

async def update_order_status(db: AsyncSession, order_id: int, status: schemas.OrderStatus):
    result = await db.execute(select(models.Order).filter(models.Order.orderId == order_id))
    db_order = result.scalar_one_or_none()
    if db_order:
        db_order.status = status.value
        await db.commit()
        await db.refresh(db_order)
    return db_order

async def delete_order(db: AsyncSession, order_id: int):
    result = await db.execute(select(models.Order).filter(models.Order.orderId == order_id))
    db_order = result.scalar_one_or_none()
    if db_order:
        await db.delete(db_order)
        await db.commit()
    return db_order

async def get_settings(db: AsyncSession):
    result = await db.execute(select(models.StoreSettings).filter(models.StoreSettings.id == 1))
    return result.scalar_one_or_none()

async def update_settings(db: AsyncSession, settings_update: schemas.StoreSettingsUpdate):
    result = await db.execute(select(models.StoreSettings).filter(models.StoreSettings.id == 1))
    db_settings = result.scalar_one_or_none()
    if db_settings:
        update_data = settings_update.model_dump(exclude_unset=True)
        if 'password' in update_data and update_data['password']:
            hashed_password = bcrypt.hashpw(update_data['password'].encode('utf-8'), bcrypt.gensalt())
            db_settings.hashed_password = hashed_password.decode('utf-8')
            del update_data['password']
        for key, value in update_data.items():
            setattr(db_settings, key, value)
        await db.commit()
        await db.refresh(db_settings)
    return db_settings