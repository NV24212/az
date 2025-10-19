from __future__ import annotations
from pydantic import BaseModel, model_validator, ConfigDict
from typing import Dict, Any, Optional

# --- Pydantic Models for Authentication ---
class AdminLoginRequest(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# --- Schemas for PocketBase Records ---

# Add configuration to handle PocketBase system fields (like created, updated)
# and allow flexible attribute assignment.
class PBDictBase(BaseModel):
    model_config = ConfigDict(extra='ignore', from_attributes=True)

class CategoryBase(PBDictBase):
    name: str

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: str | None = None

class Category(CategoryBase):
    id: str
    collectionId: str
    collectionName: str
    created: str
    updated: str

class ProductBase(PBDictBase):
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
    categoryId: Optional[str] = None
    category: Optional[Category] = None

    @model_validator(mode='before')
    @classmethod
    def move_expand_to_category(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        # Safely extract expand data
        expand_data = data.pop('expand', {}) # <--- Safe, defaults to empty dict

        if expand_data and isinstance(expand_data, dict):
            # The key is the relation field name ('categoryId').
            # Get with .get() for safety
            expanded_category_data = expand_data.get('categoryId') # <--- Use .get()

            if expanded_category_data: # <--- Check if anything was actually found
                if isinstance(expanded_category_data, list):
                    # Should only happen for maxSelect > 1. If it's empty, use None.
                    data['category'] = expanded_category_data[0] if expanded_category_data else None
                else:
                    # If it's a dict (the actual Category record)
                    data['category'] = expanded_category_data
            else:
                # If 'categoryId' key was not in expand_data or its value was None/empty
                data['category'] = None # Explicitly set to None if no expanded category
        else:
            # If there was no 'expand' key or it wasn't a dict
            data['category'] = None # Explicitly set to None

        return data

Product.model_rebuild()
