from pydantic import BaseModel, model_validator
from typing import Dict, Any

# --- Pydantic Models for Authentication ---
class AdminLoginRequest(BaseModel):
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# --- Schemas for PocketBase Records ---

class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: str | None = None

class Category(CategoryBase):
    id: str
    collectionId: str
    collectionName: str
    category: Category | None = None

    @model_validator(mode='before')
    def move_expand_to_category(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Move the 'expand' data from PocketBase into the 'category' field.
        """
        if 'expand' in data and 'categoryId' in data['expand']:
            data['category'] = data['expand']['categoryId']
        return data

class ProductBase(BaseModel):
    name: str
    description: str | None = None
    price: float
    stockQuantity: int
    imageUrl: str | None = None
    categoryId: str

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: float | None = None
    stockQuantity: int | None = None
    imageUrl: str | None = None
    categoryId: str | None = None

class Product(ProductBase):
    id: str
    collectionId: str
    collectionName: str