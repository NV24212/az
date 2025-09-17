import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('admin_token');

  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  // In a real app, you might also want to decode the token
  // and check if it's expired. For now, this is sufficient.

  return <Outlet />;
};

export default ProtectedRoute;
