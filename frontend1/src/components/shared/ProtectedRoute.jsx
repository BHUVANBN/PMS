import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  requiredRoles = [], 
  fallbackPath = '/login',
  showUnauthorized = true 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner fullScreen text="Checking authentication..." />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check role-based access if roles are specified
  const allowedRoles = requiredRole ? [requiredRole] : requiredRoles;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (showUnauthorized) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Access Denied</h3>
              <p className="text-red-600 mb-4">
                You don't have permission to access this page. Required role: {allowedRoles.join(' or ')}.
              </p>
              <div className="space-x-2">
                <button
                  onClick={() => window.history.back()}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Go Back
                </button>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // User is authenticated and authorized
  return children;
};

// Higher-order component for role-based protection
export const withRoleProtection = (Component, requiredRoles) => {
  return function ProtectedComponent(props) {
    return (
      <ProtectedRoute requiredRoles={requiredRoles}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
};

// Specific role protection components
export const AdminRoute = ({ children }) => (
  <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>
);

export const ManagerRoute = ({ children }) => (
  <ProtectedRoute requiredRole="manager">{children}</ProtectedRoute>
);

export const HRRoute = ({ children }) => (
  <ProtectedRoute requiredRole="hr">{children}</ProtectedRoute>
);

export const DeveloperRoute = ({ children }) => (
  <ProtectedRoute requiredRole="developer">{children}</ProtectedRoute>
);

export const TesterRoute = ({ children }) => (
  <ProtectedRoute requiredRole="tester">{children}</ProtectedRoute>
);

export const EmployeeRoute = ({ children }) => (
  <ProtectedRoute requiredRoles={['employee', 'developer', 'tester', 'manager', 'hr', 'admin']}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;
