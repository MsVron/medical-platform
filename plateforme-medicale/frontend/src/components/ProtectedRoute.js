import React from 'react';
import { Navigate } from 'react-router-dom';

// Define valid roles to ensure type safety
const VALID_ROLES = ['super_admin', 'admin', 'medecin', 'patient', 'institution'];

const ProtectedRoute = ({ children, allowedRoles }) => {
  // Safely retrieve user and token
  let user = null;
  const token = localStorage.getItem('token');

  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      user = JSON.parse(userData);
    }
  } catch (error) {
    console.error('Error parsing user data:', error);
  }

  // Log for debugging (remove in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('ProtectedRoute check:', { user, token, allowedRoles });
  }

  // Check if user is authenticated
  if (!token || !user) {
    if (process.env.NODE_ENV === 'development') {
      console.log('No token or user, redirecting to /login');
    }
    return <Navigate to="/login" replace />;
  }

  // Validate role
  if (!user.role || !VALID_ROLES.includes(user.role)) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Invalid or missing role, redirecting to /unauthorized');
    }
    return <Navigate to="/unauthorized" replace />;
  }

  // Check if user has required role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Role not allowed, redirecting to /unauthorized');
    }
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;