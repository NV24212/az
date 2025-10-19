from sqlmodel import Session, select
from fastapi import Depends, HTTPException
from jose import jwt
from datetime import datetime, timedelta, timezone

from . import schemas
from .config import settings
from .db import get_session

# --- Authentication Service ---

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

# --- Category Services ---

def get_categories(session: Session = Depends(get_session)) -> list[schemas.Category]:
    return session.exec(select(schemas.Category)).all()

def get_category(category_id: int, session: Session = Depends(get_session)) -> schemas.Category | None:
    return session.get(schemas.Category, category_id)

def create_category(category: schemas.CategoryCreate, session: Session = Depends(get_session)) -> schemas.Category:
    db_category = schemas.Category.model_validate(category)
    session.add(db_category)
    session.commit()
    session.refresh(db_category)
    return db_category

def delete_category(category_id: int, session: Session = Depends(get_session)) -> bool:
    category = session.get(schemas.Category, category_id)
    if not category:
        return False
    session.delete(category)
    session.commit()
    return True

# --- Product Services ---

def get_products(session: Session = Depends(get_session)) -> list[schemas.Product]:
    return session.exec(select(schemas.Product)).all()

def get_product(product_id: int, session: Session = Depends(get_session)) -> schemas.Product | None:
    return session.get(schemas.Product, product_id)

def create_product(product: schemas.ProductCreate, session: Session = Depends(get_session)) -> schemas.Product:
    db_product = schemas.Product.model_validate(product)
    session.add(db_product)
    session.commit()
    session.refresh(db_product)
    return db_product

def update_product(product_id: int, product: schemas.ProductUpdate, session: Session = Depends(get_session)) -> schemas.Product | None:
    db_product = session.get(schemas.Product, product_id)
    if not db_product:
        return None
    product_data = product.model_dump(exclude_unset=True)
    for key, value in product_data.items():
        setattr(db_product, key, value)
    session.add(db_product)
    session.commit()
    session.refresh(db_product)
    return db_product

def delete_product(product_id: int, session: Session = Depends(get_session)) -> bool:
    product = session.get(schemas.Product, product_id)
    if not product:
        return False
    session.delete(product)
    session.commit()
    return True
