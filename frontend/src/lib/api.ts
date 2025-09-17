export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// --- Types based on backend schemas ---
export interface Category {
  categoryId: number;
  name: string;
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

export interface Customer {
  customerId: number;
  name: string;
  phone: string;
  address: string;
}

export type OrderStatus = 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  orderId: number;
  customerId: number;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
}

interface ApiError {
  detail?: string;
}

// --- Public API calls ---
export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({})) as ApiError;
    throw new Error(`POST ${path} failed: ${res.status} - ${errorBody.detail || 'Unknown error'}`);
  }
  return res.json();
}

// --- Auth ---
export async function login(password: string): Promise<{ access_token: string }> {
  return apiPost('/api/admin/login', { password });
}

// --- Helper for authenticated requests ---
function getAuthHeaders() {
  const token = localStorage.getItem('admin_token');
  if (!token) throw new Error('Admin token not found');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

// --- Generic authenticated API functions ---
async function apiGetAdmin<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

async function apiPostAdmin<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({})) as ApiError;
    throw new Error(`POST ${path} failed: ${res.status} - ${errorBody.detail || 'Unknown error'}`);
  }
  return res.json();
}

async function apiPutAdmin<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({})) as ApiError;
    throw new Error(`PUT ${path} failed: ${res.status} - ${errorBody.detail || 'Unknown error'}`);
  }
  return res.json();
}

async function apiDeleteAdmin<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({})) as ApiError;
    throw new Error(`DELETE ${path} failed: ${res.status} - ${errorBody.detail || 'Unknown error'}`);
  }
  return res.json();
}

// --- Product Management API calls ---
export const getAdminProducts = () => apiGetAdmin<Product[]>('/api/admin/products/');
export const createProduct = (product: Omit<Product, 'productId'>) => apiPostAdmin<Product>('/api/admin/products/', product);
export const updateProduct = (productId: number, product: Partial<Omit<Product, 'productId'>>) => apiPutAdmin<Product>(`/api/admin/products/${productId}`, product);
export const deleteProduct = (productId: number) => apiDeleteAdmin<Product>(`/api/admin/products/${productId}`);

// --- Category Management API calls ---
export const getAdminCategories = () => apiGetAdmin<Category[]>('/api/admin/categories/');
export const createCategory = (category: Omit<Category, 'categoryId'>) => apiPostAdmin<Category>('/api/admin/categories/', category);
export const updateCategory = (categoryId: number, category: Omit<Category, 'categoryId'>) => apiPutAdmin<Category>(`/api/admin/categories/${categoryId}`, category);
export const deleteCategory = (categoryId: number) => apiDeleteAdmin<Category>(`/api/admin/categories/${categoryId}`);

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

// --- Order Management API calls ---
export const getAdminOrders = () => apiGetAdmin<Order[]>('/api/admin/orders/');
export const updateOrderStatus = (orderId: number, status: OrderStatus) => apiPutAdmin<Order>(`/api/admin/orders/${orderId}?status=${status}`, {});
export const deleteOrder = (orderId: number) => apiDeleteAdmin<Order>(`/api/admin/orders/${orderId}`);

// --- Settings Management API calls ---
export const getAdminSettings = () => apiGetAdmin<StoreSettings>('/api/admin/settings/');
export const updateAdminSettings = (settings: Partial<StoreSettings>) => apiPutAdmin<StoreSettings>('/api/admin/settings/', settings);

