import { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI, apiUtils } from '../services/api.js';

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR',
  UPDATE_USER: 'UPDATE_USER',
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state by verifying token with backend
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Verify token with backend
          const response = await authAPI.verifyToken();
          
          const normalizedUser = response.user ? { ...response.user, role: (response.user.role || '').toLowerCase() } : null;
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              user: normalizedUser,
              token,
            },
          });
        } catch (error) {
          // Token is invalid, clear it
          apiUtils.clearAuthToken();
          localStorage.removeItem('role');
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Login function
const login = async (credentials) => {
  dispatch({ type: AUTH_ACTIONS.LOGIN_START });

  try {
    // Backend expects { username, password }, where username can be username or email
    const payload = {
      username: credentials.username || credentials.email,
      password: credentials.password,
    };

    const response = await authAPI.login(payload);

    // Store token and role locally
    apiUtils.setAuthToken(response.token);
    if (response.role) localStorage.setItem('role', String(response.role).toLowerCase());

    const role = (response.user?.role || response.role || '').toLowerCase();
    const userObj = response.user ? { ...response.user, role: role } : (role ? { role } : null);

    dispatch({
      type: AUTH_ACTIONS.LOGIN_SUCCESS,
      payload: {
        user: userObj,
        token: response.token,
      },
    });

    // Return firstLogin flag along with success
    return { 
      success: true, 
      user: userObj, 
      firstLogin: response.firstLogin || false 
    };

  } catch (error) {
    dispatch({
      type: AUTH_ACTIONS.LOGIN_FAILURE,
      payload: error.message,
    });

    return { success: false, error: error.message, firstLogin: false };
  }
};


  // Register function
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    try {
      const response = await authAPI.register(userData);

      // Store token and role locally
      apiUtils.setAuthToken(response.token);
      if (response.role) localStorage.setItem('role', String(response.role).toLowerCase());

      const role = (response.user?.role || response.role || '').toLowerCase();
      const userObj = response.user ? { ...response.user, role: role } : (role ? { role } : null);

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: userObj,
          token: response.token,
        },
      });

      return { success: true, user: userObj };
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: error.message,
      });
      
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear token and state regardless of API call result
      apiUtils.clearAuthToken();
      localStorage.removeItem('role');
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  };

  // Update user function
  const updateUser = (userData) => {
    dispatch({
      type: AUTH_ACTIONS.UPDATE_USER,
      payload: userData,
    });
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Check if user has specific role
  const hasRole = (role) => {
    const a = (state.user?.role || '').toString().trim().toLowerCase();
    const b = (role || '').toString().trim().toLowerCase();
    return a === b;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    const current = (state.user?.role || '').toString().trim().toLowerCase();
    return (roles || []).some(r => (r || '').toString().trim().toLowerCase() === current);
  };

  // Check if user has permission for specific action
  const hasPermission = (permission) => {
    const userRole = state.user?.role;
    
    // Define role permissions
    const rolePermissions = {
      admin: ['*'], // Admin has all permissions
      hr: ['manage_employees', 'manage_leave', 'view_standups'],
      manager: ['manage_projects', 'manage_tickets', 'view_analytics', 'assign_tasks'],
      developer: ['view_tickets', 'update_ticket_status', 'view_kanban'],
      tester: ['view_tickets', 'create_bugs', 'validate_tickets', 'view_kanban'],
      sales: ['view_tickets', 'create_reports', 'view_kanban'],
      marketing: ['view_tickets', 'manage_campaigns', 'view_kanban'],
      intern: ['view_tickets', 'view_kanban'], // Limited permissions
    };
    
    const permissions = rolePermissions[userRole] || [];
    return permissions.includes('*') || permissions.includes(permission);
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
    hasRole,
    hasAnyRole,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
