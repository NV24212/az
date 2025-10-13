export interface Customer {
  customerId: number;
  name: string;
  phone: string;
  address: string;
}

export interface Variant {
  variantId: number;
  name: string;
  stockQuantity: number;
}

export interface Product {
  productId: number;
  name: string;
  description: string | null;
  price: number;
  stockQuantity: number; // This will now be the total stock
  imageUrl: string | null;
  categoryId: number;
  variants: Variant[];
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

export interface Category {
  categoryId: number;
  name: string;
}

export interface StoreSettings {
  id: number;
  storeName: string | null;
  storeDescription: string | null;
  currency: string | null;
  deliveryFee: number | null;
  freeDeliveryMinimum: number | null;
  codEnabled: boolean | null;
  orderSuccessMessageEn: string | null;
  orderSuccessMessageAr: string | null;
  checkoutInstructionsEn: string | null;
  checkoutInstructionsAr: string | null;
  deliveryMessageEn: string | null;
  deliveryMessageAr: string | null;
  pickupMessageEn: string | null;
  pickupMessageAr: string | null;
  adminEmail: string | null;
}