import React from 'react';
import { authAPI, apiUtils } from '../../services/api.js';
import { USER_ROLES } from '../../utils/constants/api.js';

const ProtectedRoute = ({ 
  children, 
  requiredRoles = [], 
  fallback = null,
  redirectTo = '/login' 
}) => {
  const isAuthenticated = authAPI.isAuthenticated();
  const userRole = apiUtils.getUserRole();

  // Check if user is authenticated
  if (!isAuthenticated) {
    if (fallback) {
      return fallback;
    }
    // Redirect to login
    window.location.href = redirectTo;
    return null;
  }

  // Check if user has required role
  if (requiredRoles.length > 0 && !apiUtils.hasAnyRole(requiredRoles)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page. Required role(s): {requiredRoles.join(', ')}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Your current role: <span className="font-medium capitalize">{userRole}</span>
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
};

// Higher-order component for role-based access
export const withRoleProtection = (Component, requiredRoles = []) => {
  return function ProtectedComponent(props) {
    return (
      <ProtectedRoute requiredRoles={requiredRoles}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
};

// Specific role components
export const AdminOnly = ({ children, fallback }) => (
  <ProtectedRoute requiredRoles={[USER_ROLES.ADMIN]} fallback={fallback}>
    {children}
  </ProtectedRoute>
);

export const ManagerOnly = ({ children, fallback }) => (
  <ProtectedRoute requiredRoles={[USER_ROLES.MANAGER]} fallback={fallback}>
    {children}
  </ProtectedRoute>
);

export const DeveloperOnly = ({ children, fallback }) => (
  <ProtectedRoute requiredRoles={[USER_ROLES.DEVELOPER]} fallback={fallback}>
    {children}
  </ProtectedRoute>
);

export const TesterOnly = ({ children, fallback }) => (
  <ProtectedRoute requiredRoles={[USER_ROLES.TESTER]} fallback={fallback}>
    {children}
  </ProtectedRoute>
);

export const HROnly = ({ children, fallback }) => (
  <ProtectedRoute requiredRoles={[USER_ROLES.HR]} fallback={fallback}>
    {children}
  </ProtectedRoute>
);

// Management roles (Admin + Manager)
export const ManagementOnly = ({ children, fallback }) => (
  <ProtectedRoute requiredRoles={[USER_ROLES.ADMIN, USER_ROLES.MANAGER]} fallback={fallback}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;
