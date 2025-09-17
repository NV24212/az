from fastapi import APIRouter
from pydantic import BaseModel
from enum import Enum

router = APIRouter(prefix="/api")


class OrderStatus(str, Enum):
    PENDING = "PENDING"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"


class Category(BaseModel):
    categoryId: int
    name: str


class Product(BaseModel):
    productId: int
    name: str
    description: str
    price: float
    stockQuantity: int
    imageUrl: str | None = None
    categoryId: int


class Customer(BaseModel):
    customerId: int
    name: str
    phone: str
    address: str


class OrderItem(BaseModel):
    orderItemId: int
    orderId: int
    productId: int
    quantity: int
    priceAtPurchase: float


class Order(BaseModel):
    orderId: int
    customerId: int
    status: OrderStatus
    totalAmount: float


@router.get("/status")
async def status():
    return {"api": "ok"}


@router.get("/products")
async def list_products() -> list[Product]:
    return []


@router.get("/categories")
async def list_categories() -> list[Category]:
    return []


@router.post("/customers")
async def create_customer(customer: Customer) -> Customer:
    return customer


@router.post("/orders")
async def create_order(order: Order) -> Order:
    return order