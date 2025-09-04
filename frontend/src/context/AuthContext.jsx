import React from 'react';
import { useAuth } from '../hooks/useAuth';
import AuthContext from './_internalContext';

// Move hook to separate file to satisfy react-refresh rule
// Note: Hook moved to separate file to satisfy react-refresh rule

export const AuthProvider = ({ children }) => {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};
