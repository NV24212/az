import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n';
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import Storefront from './pages/Storefront.tsx'
import AdminLogin from './pages/AdminLogin.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import AdminLayout from './layouts/AdminLayout.tsx'
import CartPage from './pages/CartPage.tsx'
import adminRoutes from './routes/admin.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Storefront /> },
      { path: 'cart', element: <CartPage /> },
    ],
  },
  {
    path: '/admin',
    element: <ProtectedRoute />,
    children: [
      {
        path: '',
        element: <AdminLayout />,
        children: adminRoutes.map(route => ({
          path: route.path.substring(1),
          element: <route.component />,
        })),
      },
    ],
  },
  {
    path: '/admin/login',
    element: <AdminLogin />,
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
