import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './ui/LoadingSpinner';

const ProtectedRoute = ({ 
  children, 
  requiredRoles = [], 
  requiredPermissions = [],
  fallbackPath = '/login',
  showUnauthorized = false 
}) => {
  const { isAuthenticated, isLoading, user, hasAnyRole, hasPermission } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check role-based access
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    if (showUnauthorized) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-error-100 rounded-full flex items-center justify-center">
              <span className="material-icons text-error-600 text-2xl">block</span>
            </div>
            <h2 className="text-2xl font-semibold text-neutral-900 mb-2">Access Denied</h2>
            <p className="text-neutral-600 mb-4">
              You don't have permission to access this page.
            </p>
            <p className="text-sm text-neutral-500">
              Required roles: {requiredRoles.join(', ')}
            </p>
            <p className="text-sm text-neutral-500">
              Your role: {user?.role || 'Unknown'}
            </p>
          </div>
        </div>
      );
    }
    
    // Redirect based on user role
    const roleRedirects = {
      admin: '/admin/dashboard',
      hr: '/hr/dashboard',
      manager: '/manager/dashboard',
      developer: '/developer/dashboard',
      tester: '/tester/dashboard',
      sales: '/sales/dashboard',
      marketing: '/marketing/dashboard',
      intern: '/intern/dashboard',
    };
    
    const redirectPath = roleRedirects[user?.role] || '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  // Check permission-based access
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requiredPermissions.every(permission => 
      hasPermission(permission)
    );
    
    if (!hasRequiredPermissions) {
      if (showUnauthorized) {
        return (
          <div className="min-h-screen flex items-center justify-center bg-neutral-50">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-error-100 rounded-full flex items-center justify-center">
                <span className="material-icons text-error-600 text-2xl">lock</span>
              </div>
              <h2 className="text-2xl font-semibold text-neutral-900 mb-2">Insufficient Permissions</h2>
              <p className="text-neutral-600 mb-4">
                You don't have the required permissions to access this page.
              </p>
              <p className="text-sm text-neutral-500">
                Required permissions: {requiredPermissions.join(', ')}
              </p>
            </div>
          </div>
        );
      }
      
      // Redirect to appropriate dashboard
      const roleRedirects = {
        admin: '/admin/dashboard',
        hr: '/hr/dashboard',
        manager: '/manager/dashboard',
        developer: '/developer/dashboard',
        tester: '/tester/dashboard',
        sales: '/sales/dashboard',
        marketing: '/marketing/dashboard',
        intern: '/intern/dashboard',
      };
      
      const redirectPath = roleRedirects[user?.role] || '/dashboard';
      return <Navigate to={redirectPath} replace />;
    }
  }

  // User is authenticated and authorized
  return children;
};

export default ProtectedRoute;
