from __future__ import annotations
from pydantic import BaseModel, model_validator
from typing import Dict, Any, Optional

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

class ProductBase(BaseModel):
    name: str
    description: str | None = None
    price: float
    stockQuantity: int
    imageUrl: str | None = None

class ProductCreate(ProductBase):
    categoryId: str

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

    # PocketBase returns categoryId, but Pydantic expects 'category' object
    categoryId: str
    category: Optional[Category] = None

    @model_validator(mode='before')
    @classmethod
    def move_expand_to_category(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        # FIX: Ensure we check for 'expand' first.
        expand_data = data.get('expand')

        if expand_data and isinstance(expand_data, dict):
            # The expanded data key is the relation field name (categoryId).
            # The value is the Category object.
            # We copy that object into the 'category' field, which matches the Pydantic model.
            if 'categoryId' in expand_data:
                # FIX: Assign the expanded Category object to the 'category' field
                data['category'] = expand_data['categoryId']

        return data

Product.model_rebuild()