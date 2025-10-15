import { lazy } from 'react';

const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const ProductsPage = lazy(() => import('../pages/admin/ProductsPage'));
const CategoriesPage = lazy(() => import('../pages/admin/CategoriesPage'));
const OrdersPage = lazy(() => import('../pages/admin/OrdersPage'));
const CustomersPage = lazy(() => import('../pages/admin/CustomersPage'));
const SettingsPage = lazy(() => import('../pages/admin/SettingsPage'));

const routes = [
  {
    path: '/dashboard',
    component: AdminDashboard,
  },
  {
    path: '/products',
    component: ProductsPage,
  },
  {
    path: '/categories',
    component: CategoriesPage,
  },
  {
    path: '/orders',
    component: OrdersPage,
  },
  {
    path: '/customers',
    component: CustomersPage,
  },
  {
    path: '/settings',
    component: SettingsPage,
  },
];

export default routes;
