import React from 'react';
import { getCurrentUser, isAuthenticated } from '../services/authService';
// @fix: Import Role from '../types' as it's defined there, not authService.
import { Role } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const user = getCurrentUser();

  if (!isAuthenticated()) {
    // If not authenticated, redirect to login.
    // Using window.location.hash for routing as per constraints.
    window.location.hash = '/login';
    return null;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // If authenticated but role not allowed, display unauthorized message or redirect
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-100 text-red-700 text-lg p-4 rounded-md shadow-md m-4">
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;