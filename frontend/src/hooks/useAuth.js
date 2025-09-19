import { useState, useEffect } from 'react';
import api from '../services/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Prefer local state first to decide which endpoint to validate against
        const storedUserJson = localStorage.getItem('user');
        const isAuth = localStorage.getItem('isAuthenticated') === 'true';
        if (storedUserJson && isAuth) {
          const storedUser = JSON.parse(storedUserJson);
          setUser(storedUser);
          setIsAuthenticated(true);
          // Best-effort validation against role-specific endpoint (if available)
          try {
            const role = storedUser.role;
            if (role === 'admin') await api.admin.getMe();
            else if (role === 'hr') await api.hr.getMe();
            else if (role === 'manager') await api.manager.getMe();
            else if (role === 'developer') await api.developer.getMe();
            else if (role === 'tester') await api.tester.getMe();
            else if (role === 'employee') await api.employee.getMe();
          } catch (_) {
            // If validation fails, clear session
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('user');
            localStorage.removeItem('isAuthenticated');
          }
          return;
        }
        // Attempt cookie-based session discovery (user may have a valid httpOnly cookie)
        try {
          const meEndpoints = [
            () => api.admin.getMe(),
            () => api.hr.getMe(),
            () => api.manager.getMe(),
            () => api.developer.getMe(),
            () => api.tester.getMe(),
            () => api.employee.getMe(),
          ];
          for (const getMe of meEndpoints) {
            try {
              const me = await getMe();
              if (me && me.user && me.user.role) {
                const detectedUser = { role: me.user.role, username: me.user.username, id: me.user.id };
                setUser(detectedUser);
                setIsAuthenticated(true);
                localStorage.setItem('user', JSON.stringify(detectedUser));
                localStorage.setItem('isAuthenticated', 'true');
                return;
              }
            } catch (_) {
              // try next role
            }
          }
        } catch (_) {
          // ignore
        }

        // Still not authenticated
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
