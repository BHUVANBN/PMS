import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { ThemeModeContext } from './useThemeMode';

export const ThemeModeProvider = ({ children }) => {
  const { user } = useAuth();
  const roleKey = (user?.role || '').toString().trim().toLowerCase();

  const storageKey = useMemo(() => {
    // Persist per role; fallback to global when role unknown/login page
    if (roleKey) return `theme_mode_role_${roleKey}`;
    return 'theme_mode_global';
  }, [roleKey]);

  const readMode = (key) => {
    try {
      const saved = localStorage.getItem(key);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch { /* noop */ }
    return 'light';
  };

  const getInitial = () => readMode(storageKey);

  const [mode, setMode] = useState(getInitial);

  // When storage key changes (user switch/login/logout), rehydrate from the new key
  useEffect(() => {
    const newMode = readMode(storageKey);
    setMode(newMode);
  }, [storageKey]);

  // Persist current mode under the active key
  useEffect(() => {
    try { localStorage.setItem(storageKey, mode); } catch { /* noop */ }
  }, [mode, storageKey]);

  const resolvedMode = mode;

  const value = useMemo(() => ({ mode, setMode, resolvedMode }), [mode, resolvedMode]);

  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  );
};
