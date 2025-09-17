from pydantic import BaseModel
from enum import Enum
from typing import List

# --- Pydantic Models for Authentication ---
class AdminLoginRequest(BaseModel):
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

# --- Enum for Order Status ---
class OrderStatus(str, Enum):
    PENDING = "PENDING"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"

# --- Category Schemas ---
class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(CategoryBase):
    pass

class Category(CategoryBase):
    categoryId: int

    class Config:
        orm_mode = True

# --- Store Settings Schemas ---
class StoreSettingsBase(BaseModel):
    storeName: str | None = None
    storeDescription: str | None = None
    currency: str | None = None
    deliveryFee: float | None = None
    freeDeliveryMinimum: float | None = None
    codEnabled: bool | None = None
    orderSuccessMessageEn: str | None = None
    orderSuccessMessageAr: str | None = None
    checkoutInstructionsEn: str | None = None
    checkoutInstructionsAr: str | None = None
    deliveryMessageEn: str | None = None
    deliveryMessageAr: str | None = None
    pickupMessageEn: str | None = None
    pickupMessageAr: str | None = None
    adminEmail: str | None = None

class StoreSettingsUpdate(StoreSettingsBase):
    pass

class StoreSettings(StoreSettingsBase):
    id: int

    class Config:
        orm_mode = True

# --- Product Schemas ---
class ProductBase(BaseModel):
    name: str
    description: str | None = None
    price: float
    stockQuantity: int
    imageUrl: str | None = None
    categoryId: int

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    pass

class Product(ProductBase):
    productId: int

    class Config:
        orm_mode = True

# --- Customer Schemas ---
class CustomerBase(BaseModel):
    name: str
    phone: str
    address: str

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    customerId: int

    class Config:
        orm_mode = True

# --- Order Schemas ---
class OrderItemBase(BaseModel):
    productId: int
    quantity: int

class OrderItemCreate(OrderItemBase):
    pass

class OrderItem(OrderItemBase):
    orderItemId: int
    orderId: int
    priceAtPurchase: float

    class Config:
        orm_mode = True

class OrderBase(BaseModel):
    customerId: int
    items: List[OrderItemCreate]

class OrderCreate(OrderBase):
    pass

class Order(BaseModel):
    orderId: int
    customerId: int
    status: OrderStatus
    totalAmount: float
    items: List[OrderItem] = []

    class Config:
        orm_mode = True
