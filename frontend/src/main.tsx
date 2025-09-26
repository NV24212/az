import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import Storefront from './pages/Storefront.tsx'
import AdminDashboard from './pages/admin/AdminDashboard.tsx'
import ProductsPage from './pages/admin/ProductsPage.tsx'
import AdminLogin from './pages/AdminLogin.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import AdminLayout from './pages/admin/AdminLayout.tsx'
import CategoriesPage from './pages/admin/CategoriesPage.tsx'
import OrdersPage from './pages/admin/OrdersPage.tsx'
import CartPage from './pages/CartPage.tsx'
import SettingsPage from './pages/admin/SettingsPage.tsx'
import CustomersPage from './pages/admin/CustomersPage.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Storefront /> },
      { path: 'cart', element: <CartPage /> },
      {
        path: 'admin',
        element: <ProtectedRoute />,
        children: [
          {
            path: '',
            element: <AdminLayout />,
            children: [
              { index: true, element: <AdminDashboard /> },
              { path: 'products', element: <ProductsPage /> },
              { path: 'categories', element: <CategoriesPage /> },
              { path: 'orders', element: <OrdersPage /> },
              { path: 'customers', element: <CustomersPage /> },
              { path: 'settings', element: <SettingsPage /> },
            ]
          }
        ]
      },
      { path: 'admin/login', element: <AdminLogin /> },
    ],
  },
])

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
