// ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element, requiredRoles }) => {
  const token = localStorage.getItem('token'); // Check for token in localStorage
  const userRole = localStorage.getItem('role'); // Assume user role is stored in localStorage

  if (!token) {
    return <Navigate to="/login" replace />; // Redirect to login if no token
  }

  if (requiredRoles && !requiredRoles.includes(userRole)) {
    return <Navigate to="/404" replace />; // Redirect to 404 if user role does not match
  }

  return element; 
};

export default ProtectedRoute;