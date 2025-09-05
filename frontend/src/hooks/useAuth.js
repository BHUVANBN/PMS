import { useState, useEffect } from 'react';
import api from '../services/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if user is stored in localStorage
        const storedUserJson = localStorage.getItem('user');
        const isAuth = localStorage.getItem('isAuthenticated') === 'true';
        
        if (storedUserJson && isAuth) {
          const storedUser = JSON.parse(storedUserJson);
          
          // Try to validate with the general /api/me endpoint first
          try {
            const response = await api.user.getMe();
            if (response && response.user) {
              // Update user data with fresh data from server
              setUser(response.user);
              setIsAuthenticated(true);
              localStorage.setItem('user', JSON.stringify(response.user));
            } else {
              throw new Error('Invalid response');
            }
          } catch (error) {
            console.warn('Auth validation failed:', error);
            // If validation fails, try role-specific endpoint as fallback
            try {
              const role = storedUser.role;
              let response;
              
              if (role === 'admin') response = await api.admin.getMe();
              else if (role === 'hr') response = await api.hr.getMe();
              else if (role === 'manager') response = await api.manager.getMe();
              else if (role === 'developer') response = await api.developer.getMe();
              else if (role === 'tester') response = await api.tester.getMe();
              else if (role === 'employee') response = await api.employee.getMe();
              
              if (response && response.user) {
                setUser(response.user);
                setIsAuthenticated(true);
                localStorage.setItem('user', JSON.stringify(response.user));
              } else {
                throw new Error('Role-specific validation failed');
              }
            } catch (roleError) {
              console.warn('Role-specific auth validation failed:', roleError);
              // If both validations fail, clear session
              setUser(null);
              setIsAuthenticated(false);
              localStorage.removeItem('user');
              localStorage.removeItem('isAuthenticated');
            }
          }
        } else {
          // No stored user, not authenticated
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('user');
          localStorage.removeItem('isAuthenticated');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        // On any error, clear session to be safe
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('isAuthenticated', 'true');
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('rememberMe');
  };

  return {
    user,
    isAuthenticated,
    loading,
    login,
    logout
  };
};
