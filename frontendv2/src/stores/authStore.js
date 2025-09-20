import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authAPI } from '../services/api';

// Auth store with Zustand
const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      // Actions
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authAPI.login(credentials);
          
          if (response.success) {
            const { user, token } = response.data;
            
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
            
            return { success: true, data: response.data };
          } else {
            set({
              isLoading: false,
              error: response.message || 'Login failed'
            });
            return { success: false, error: response.message };
          }
        } catch (error) {
          const errorMessage = error.message || 'Login failed';
          set({
            isLoading: false,
            error: errorMessage
          });
          return { success: false, error: errorMessage };
        }
      },
      
      register: async (userData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authAPI.register(userData);
          
          if (response.success) {
            set({
              isLoading: false,
              error: null
            });
            return { success: true, data: response.data };
          } else {
            set({
              isLoading: false,
              error: response.message || 'Registration failed'
            });
            return { success: false, error: response.message };
          }
        } catch (error) {
          const errorMessage = error.message || 'Registration failed';
          set({
            isLoading: false,
            error: errorMessage
          });
          return { success: false, error: errorMessage };
        }
      },
      
      logout: async () => {
        set({ isLoading: true });
        
        try {
          await authAPI.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        }
      },
      
      verifyToken: async () => {
        const { token } = get();
        
        if (!token) {
          set({ isAuthenticated: false, isLoading: false });
          return false;
        }
        
        set({ isLoading: true });
        
        try {
          const response = await authAPI.verifyToken();
          
          if (response.success) {
            const { user } = response.data;
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
            return true;
          } else {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              isLoading: false,
              error: null
            });
            return false;
          }
        } catch (error) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
          return false;
        }
      },
      
      refreshToken: async () => {
        try {
          const response = await authAPI.refreshToken();
          
          if (response.success) {
            const { user, token } = response.data;
            set({
              user,
              token,
              isAuthenticated: true,
              error: null
            });
            return true;
          } else {
            get().logout();
            return false;
          }
        } catch (error) {
          get().logout();
          return false;
        }
      },
      
      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData }
        }));
      },
      
      clearError: () => {
        set({ error: null });
      },
      
      // Utility functions
      hasRole: (role) => {
        const { user } = get();
        return user?.role?.toLowerCase() === role.toLowerCase();
      },
      
      hasAnyRole: (roles) => {
        const { user } = get();
        if (!user?.role) return false;
        return roles.some(role => 
          user.role.toLowerCase() === role.toLowerCase()
        );
      },
      
      isAdmin: () => {
        return get().hasRole('admin');
      },
      
      isManager: () => {
        return get().hasRole('manager');
      },
      
      isDeveloper: () => {
        return get().hasRole('developer');
      },
      
      isTester: () => {
        return get().hasRole('tester');
      },
      
      isHR: () => {
        return get().hasRole('hr');
      },
      
      canAccess: (requiredRoles) => {
        if (!requiredRoles || requiredRoles.length === 0) return true;
        return get().hasAnyRole(requiredRoles);
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);

// Selectors for better performance
export const useAuth = () => useAuthStore((state) => ({
  user: state.user,
  token: state.token,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
  error: state.error
}));

export const useAuthActions = () => useAuthStore((state) => ({
  login: state.login,
  register: state.register,
  logout: state.logout,
  verifyToken: state.verifyToken,
  refreshToken: state.refreshToken,
  updateUser: state.updateUser,
  clearError: state.clearError
}));

export const useAuthUtils = () => useAuthStore((state) => ({
  hasRole: state.hasRole,
  hasAnyRole: state.hasAnyRole,
  isAdmin: state.isAdmin,
  isManager: state.isManager,
  isDeveloper: state.isDeveloper,
  isTester: state.isTester,
  isHR: state.isHR,
  canAccess: state.canAccess
}));

export default useAuthStore;
