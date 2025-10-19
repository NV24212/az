from pydantic import BaseModel
from typing import Optional

class AdminLoginRequest(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class Category(BaseModel):
    id: int
    name: str

class CategoryCreate(BaseModel):
    name: str

class Product(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: float
    stock_quantity: int
    image_url: Optional[str] = None
    category_id: Optional[int] = None
    category: Optional[Category] = None

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock_quantity: int
    image_url: Optional[str] = None
    category_id: Optional[int] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock_quantity: Optional[int] = None
    image_url: Optional[str] = None
    category_id: Optional[int] = None
