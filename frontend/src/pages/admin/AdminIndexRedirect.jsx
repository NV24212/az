import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminIndexRedirect = () => {
  return <Navigate to="/admin/users" />;
};

export default AdminIndexRedirect;
