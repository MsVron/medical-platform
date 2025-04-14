import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  console.log('ProtectedRoute check:', { user, token, allowedRoles }); // Debug

  if (!token || !user) {
    console.log('No token or user, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.log('Role not allowed, redirecting to /unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;