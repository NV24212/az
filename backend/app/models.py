import enum
from sqlalchemy import Column, Integer, String, DECIMAL, ForeignKey, Enum, DateTime, Boolean
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func

Base = declarative_base()

class OrderStatusEnum(enum.Enum):
    PENDING = "PENDING"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"

class Category(Base):
    __tablename__ = "Category"

    categoryId = Column("categoryId", Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)

    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = "Product"

    productId = Column("productId", Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(String)
    price = Column(DECIMAL(10, 2), nullable=False)
    stockQuantity = Column("stockQuantity", Integer, nullable=False)
    imageUrl = Column("imageUrl", String)
    categoryId = Column("categoryId", Integer, ForeignKey("Category.categoryId"))

    category = relationship("Category", back_populates="products")


class Customer(Base):
    __tablename__ = "Customer"

    customerId = Column("customerId", Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    address = Column(String, nullable=False)

    orders = relationship("Order", back_populates="customer")

class Order(Base):
    __tablename__ = "Order"

    orderId = Column("orderId", Integer, primary_key=True, index=True)
    customerId = Column("customerId", Integer, ForeignKey("Customer.customerId"))
    status = Column(Enum(OrderStatusEnum, name="order_status"), default=OrderStatusEnum.PENDING, nullable=False)
    totalAmount = Column("totalAmount", DECIMAL(10, 2), nullable=False)
    createdAt = Column("createdAt", DateTime(timezone=True), server_default=func.now())

    customer = relationship("Customer", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "OrderItem"

    orderItemId = Column("orderItemId", Integer, primary_key=True, index=True)
    orderId = Column("orderId", Integer, ForeignKey("Order.orderId"))
    productId = Column("productId", Integer, ForeignKey("Product.productId"))
    quantity = Column(Integer, nullable=False)
    priceAtPurchase = Column("priceAtPurchase", DECIMAL(10, 2), nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product")


class StoreSettings(Base):
    __tablename__ = "StoreSettings"

    id = Column(Integer, primary_key=True, default=1)
    storeName = Column("storeName", String)
    storeDescription = Column("storeDescription", String)
    currency = Column(String)
    deliveryFee = Column("deliveryFee", DECIMAL(10, 2))
    freeDeliveryMinimum = Column("freeDeliveryMinimum", DECIMAL(10, 2))
    codEnabled = Column("codEnabled", Boolean)
    orderSuccessMessageEn = Column("orderSuccessMessageEn", String)
    orderSuccessMessageAr = Column("orderSuccessMessageAr", String)
    checkoutInstructionsEn = Column("checkoutInstructionsEn", String)
    checkoutInstructionsAr = Column("checkoutInstructionsAr", String)
    deliveryMessageEn = Column("deliveryMessageEn", String)
    deliveryMessageAr = Column("deliveryMessageAr", String)
    pickupMessageEn = Column("pickupMessageEn", String)
    pickupMessageAr = Column("pickupMessageAr", String)
    adminEmail = Column("adminEmail", String)
    hashed_password = Column(String)
