from __future__ import annotations
from sqlmodel import Field, Relationship, SQLModel
from typing import List, Optional

# --- Pydantic Models for Authentication ---
# These are not database tables, just data transfer objects.
class AdminLoginRequest(SQLModel):
    email: str
    password: str

class Token(SQLModel):
    access_token: str
    token_type: str

# --- Database Table Models ---
# These models define the tables in our PostgreSQL database.

class Category(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    products: List["Product"] = Relationship(back_populates="category")

class Product(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    price: float
    stock_quantity: int
    image_url: Optional[str] = None
    category_id: Optional[int] = Field(default=None, foreign_key="category.id")
    category: Optional["Category"] = Relationship(back_populates="products")

# --- API Data Transfer Models (DTOs) ---
# We define separate models for API input and output
# to decouple the API from the database schema and prevent issues with relationships.

# For creating a new category via the API
class CategoryCreate(SQLModel):
    name: str

# For reading a category from the API
class CategoryRead(CategoryCreate):
    id: int

# For creating a new product via the API
class ProductCreate(SQLModel):
    name: str
    description: Optional[str] = None
    price: float
    stock_quantity: int
    image_url: Optional[str] = None
    category_id: Optional[int] = None

# For reading a product from the API
class ProductRead(ProductCreate):
    id: int

# For updating a product via the API
class ProductUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    stock_quantity: Optional[int] = None
    image_url: Optional[str] = None
    category_id: Optional[int] = None

# --- DTOs with Relationships ---
# These models are used when an API endpoint needs to return nested objects.

class ProductReadWithCategory(ProductRead):
    category: Optional[CategoryRead] = None

class CategoryReadWithProducts(CategoryRead):
    products: List[ProductRead] = []
