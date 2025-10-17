from pydantic import BaseModel

# --- Pydantic Models for Authentication ---
class AdminLoginRequest(BaseModel):
    email: str
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

# --- Schemas for Customers ---
class CustomerBase(BaseModel):
    name: str
    phone: str
    address: str

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    id: str

# --- Schemas for Orders ---
class OrderItemBase(BaseModel):
    productId: str
    quantity: int
    orderId: str | None = None

class OrderItemCreate(OrderItemBase):
    pass

class OrderItem(OrderItemBase):
    id: str
    priceAtPurchase: float

class OrderBase(BaseModel):
    status: str = "PENDING"
    totalAmount: float

class OrderCreate(BaseModel):
    customer: CustomerCreate
    items: list[OrderItemCreate]

class OrderUpdate(BaseModel):
    status: str

class Order(OrderBase):
    id: str
    customerId: str
    items: list[OrderItem] = []

# --- Schemas for Settings ---
class GeneralSettings(BaseModel):
    storeName: str
    description: str
    currency: str

class DeliverySettings(BaseModel):
    deliveryFee: float
    freeDeliveryThreshold: float

class MessageSettings(BaseModel):
    orderSuccessMessage: str
    checkoutInstructions: str

class StoreSettings(BaseModel):
    general: GeneralSettings
    delivery: DeliverySettings
    messages: MessageSettings

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