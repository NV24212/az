export interface Customer {
  customerId: number;
  name: string;
  phone: string;
  address: string;
}

export interface Product {
  productId: number;
  name: string;
  description: string | null;
  price: number;
  stockQuantity: number;
  imageUrl: string | null;
  categoryId: number;
}

export interface OrderItem {
  orderItemId: number;
  orderId: number;
  productId: number;
  quantity: number;
  priceAtPurchase: number;
  product: Product;
}

export type OrderStatus = "PENDING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface Order {
  orderId: number;
  customerId: number;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string; // Comes as string from JSON
  items: OrderItem[];
  customer: Customer;
}