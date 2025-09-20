-- migrations.sql g

-- Enable the UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. AdminUser Table
-- For simplicity in a single-admin setup, we won't create a full user table.
-- The admin's email and hashed password will be managed via environment variables.
-- This table is defined in the SRS but omitted here for a simpler, secure implementation.

-- 2. Customer Table
CREATE TABLE IF NOT EXISTS Customer (
    "customerId" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "address" TEXT NOT NULL
);

-- 3. Category Table
CREATE TABLE IF NOT EXISTS Category (
    "categoryId" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL UNIQUE
);

-- 4. Product Table
CREATE TABLE IF NOT EXISTS Product (
    "productId" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10, 2) NOT NULL,
    "stockQuantity" INTEGER NOT NULL,
    "imageUrl" VARCHAR(2048),
    "categoryId" INTEGER REFERENCES Category("categoryId") ON DELETE SET NULL
);

-- 5. Order Status Enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE order_status AS ENUM ('PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED');
    END IF;
END$$;

-- 6. Order Table
CREATE TABLE IF NOT EXISTS "Order" (
    "orderId" SERIAL PRIMARY KEY,
    "customerId" INTEGER REFERENCES Customer("customerId") ON DELETE CASCADE,
    "status" order_status NOT NULL DEFAULT 'PENDING',
    "totalAmount" DECIMAL(10, 2) NOT NULL,
    "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 7. OrderItem Table
CREATE TABLE IF NOT EXISTS OrderItem (
    "orderItemId" SERIAL PRIMARY KEY,
    "orderId" INTEGER REFERENCES "Order"("orderId") ON DELETE CASCADE,
    "productId" INTEGER REFERENCES Product("productId") ON DELETE RESTRICT,
    "quantity" INTEGER NOT NULL,
    "priceAtPurchase" DECIMAL(10, 2) NOT NULL
);

-- 8. StoreSettings Table
-- This table will hold a single row of settings for the store.
CREATE TABLE IF NOT EXISTS StoreSettings (
    "id" SERIAL PRIMARY KEY,
    "storeName" VARCHAR(255) DEFAULT 'AzharStore',
    "storeDescription" TEXT,
    "currency" VARCHAR(10) DEFAULT 'USD',
    "deliveryFee" DECIMAL(10, 2) DEFAULT 5.00,
    "freeDeliveryMinimum" DECIMAL(10, 2) DEFAULT 100.00,
    "codEnabled" BOOLEAN DEFAULT true,
    "orderSuccessMessageEn" TEXT DEFAULT 'Your order has been placed successfully!',
    "orderSuccessMessageAr" TEXT DEFAULT 'تم استلام طلبك بنجاح!',
    "checkoutInstructionsEn" TEXT DEFAULT 'Please review your order details before confirming.',
    "checkoutInstructionsAr" TEXT DEFAULT 'يرجى مراجعة تفاصيل طلبك قبل التأكيد.',
    "deliveryMessageEn" TEXT DEFAULT 'This item will be delivered to your address.',
    "deliveryMessageAr" TEXT DEFAULT 'سيتم توصيل هذا المنتج إلى عنوانك.',
    "pickupMessageEn" TEXT DEFAULT 'This item is available for pickup.',
    "pickupMessageAr" TEXT DEFAULT 'هذا المنتج متاح للاستلام.',
    "adminEmail" VARCHAR(255)
);

-- Insert a default settings row if one doesn't exist
INSERT INTO StoreSettings ("id", "adminEmail")
SELECT 1, 'admin@example.com'
WHERE NOT EXISTS (SELECT 1 FROM StoreSettings WHERE "id" = 1);

-- Seed Data for Categories for initial setup
INSERT INTO Category ("name") VALUES
('Electronics'),
('Books'),
('Clothing'),
('Home & Kitchen')
ON CONFLICT ("name") DO NOTHING;

-- Seed Data for Products for initial setup
INSERT INTO Product ("name", "description", "price", "stockQuantity", "imageUrl", "categoryId") VALUES
('Laptop', 'A high-performance laptop.', 999.99, 10, 'https://example.com/laptop.jpg', 1),
('Smartphone', 'A latest model smartphone.', 699.99, 25, 'https://example.com/smartphone.jpg', 1),
('The Great Gatsby', 'A classic novel.', 12.50, 100, 'https://example.com/gatsby.jpg', 2),
('T-Shirt', 'A comfortable cotton t-shirt.', 25.00, 200, 'https://example.com/tshirt.jpg', 3)
ON CONFLICT DO NOTHING;

-- Note: In a real Supabase environment, you would run this SQL in the Supabase SQL Editor.
-- For local development, this can be used to set up a local PostgreSQL database.
