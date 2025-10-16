import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/admin/Login'
import AdminLayout from './components/layout/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import Products from './pages/admin/Products'
import Orders from './pages/admin/Orders'
import Customers from './pages/admin/Customers'
import Settings from './pages/admin/Settings'
import Analytics from './pages/admin/Analytics'
import ProtectedRoute from './components/routing/ProtectedRoute'
import StoreLayout from './components/layout/StoreLayout'
import Store from './pages/Store'

export default function App() {
  return (
    <Routes>
      <Route element={<StoreLayout />}>
        <Route path="/" element={<Store />} />
      </Route>
      <Route path="/admin/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<Customers />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
