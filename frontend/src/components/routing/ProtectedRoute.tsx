import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getToken } from '../../lib/auth'

export default function ProtectedRoute() {
  const token = getToken()
  const { pathname } = useLocation()
  if (!token) return <Navigate to="/admin/login" state={{ from: pathname }} replace />
  return <Outlet />
}
