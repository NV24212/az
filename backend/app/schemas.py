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

        # 1. Safely retrieve the 'expand' dictionary, defaulting to empty dict
        expand_data = data.get('expand', {})

        # 2. Check if the required expanded field exists in the 'expand' data
        # If the query was?expand=categoryId, the key in 'expand' is 'categoryId'
        if 'categoryId' in expand_data:

            # 3. CRITICAL: PocketBase may return a list of records for a one-to-one relation
            # if maxSelect is 1. Check if it's a list and take the first item, or take the item directly.
            expanded_category = expand_data['categoryId']

            if isinstance(expanded_category, list) and len(expanded_category) > 0:
                # If it's a list (maxSelect: 1, but still wrapped in a list)
                data['category'] = expanded_category
            elif isinstance(expanded_category, dict):
                # If it's a single dictionary (the Category object)
                data['category'] = expanded_category
            else:
                # Fail gracefully if data is weirdly structured, leaving 'category' as None
                data['category'] = None

        # Ensure the original 'categoryId' field is retained for the ID string
        # and delete the 'expand' key before Pydantic processes the rest
        if 'expand' in data:
            del data['expand']

        return data

Product.model_rebuild()