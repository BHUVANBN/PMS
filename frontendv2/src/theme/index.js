import { createTheme } from '@mui/material/styles';

const glass = {
  sidebar: {
    background: 'rgba(255,255,255,0.3)',
    border: '1px solid rgba(255,255,255,0.25)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  },
  card: {
    background: 'rgba(255,255,255,0.7)',
    border: '1px solid rgba(255,255,255,0.35)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },
  table: {
    background: 'rgba(255,255,255,0.65)',
    border: '1px solid rgba(255,255,255,0.35)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  },
};
export const createAppTheme = (mode = 'light') => {
  const isDark = mode === 'dark';
  return createTheme({
    breakpoints: {
      values: { xs: 0, sm: 1024, md: 1366, lg: 1440, xl: 1920 },
    },
    palette: {
      mode,
      primary: { main: '#6366F1' },
      secondary: { main: '#8B5CF6' },
      success: { main: '#10B981' },
      error: { main: '#EF4444' },
      warning: { main: '#F59E0B' },
      info: { main: '#38BDF8' },
      background: {
        default: 'transparent',
        paper: isDark ? 'rgba(17,24,39,0.7)' : 'rgba(255,255,255,0.7)'
      },
      text: {
        primary: isDark ? '#ffffff' : '#0f172a',
        secondary: isDark ? '#e5e7eb' : '#475569'
      },
      grey: {
        50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1f2937', 900: '#0f172a',
      },
    },
    shape: { borderRadius: 16 },
    spacing: 8,
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontSize: '32px', fontWeight: 700, lineHeight: 1.2 },
      h2: { fontSize: '24px', fontWeight: 600, lineHeight: 1.25 },
      h3: { fontSize: '18px', fontWeight: 600, lineHeight: 1.3 },
      h4: { fontSize: '16px', fontWeight: 600, lineHeight: 1.3 },
      body1: { fontSize: '14px', lineHeight: 1.5 },
      body2: { fontSize: '13px', lineHeight: 1.5 },
      caption: { fontSize: '12px' },
      button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0.2 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            minHeight: '100vh',
            background: isDark
              ? 'linear-gradient(135deg, rgba(24, 24, 27, 0.8) 0%, rgba(17, 24, 39, 0.8) 100%)'
              : 'linear-gradient(135deg, rgba(147, 197, 253, 0.3) 0%, rgba(196, 181, 253, 0.3) 50%, rgba(251, 207, 232, 0.3) 100%)',
            backgroundRepeat: 'no-repeat',
            backgroundAttachment: 'fixed',
          },
          '*:focus-visible': { outline: '2px solid #6366F1', outlineOffset: 2 },
          '*::-webkit-scrollbar': { width: 6, height: 6 },
          '*::-webkit-scrollbar-track': { background: 'rgba(0,0,0,0.05)', borderRadius: 3 },
          '*::-webkit-scrollbar-thumb': { background: 'rgba(0,0,0,0.2)', borderRadius: 3 },
          '*::-webkit-scrollbar-thumb:hover': { background: 'rgba(0,0,0,0.3)' },
          '@media (prefers-reduced-motion: reduce)': {
            '*': { animationDuration: '0.01ms !important', animationIterationCount: '1 !important', transitionDuration: '0.01ms !important', scrollBehavior: 'auto !important' },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.35)',
            background: isDark ? 'rgba(17,24,39,0.6)' : glass.card.background,
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(15, 23, 42, 0.12)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.35)',
            background: isDark ? 'rgba(17,24,39,0.6)' : glass.card.background,
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease-in-out',
            boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.5)' : '0 8px 24px rgba(15, 23, 42, 0.12)',
          },
        },
      },
      MuiCardContent: { styleOverrides: { root: { padding: 24 } } },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: isDark ? 'rgba(17,24,39,0.6)' : 'rgba(255,255,255,0.6)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            color: 'inherit',
            boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.6)' : '0 4px 16px rgba(15, 23, 42, 0.08)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            width: 280,
            borderRight: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.25)',
            background: isDark ? 'rgba(17,24,39,0.6)' : glass.sidebar.background,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: isDark ? '2px 0 12px rgba(0,0,0,0.5)' : '2px 0 12px rgba(15, 23, 42, 0.08)',
          },
        },
      },
      MuiButton: {
        defaultProps: { size: 'medium', variant: 'contained' },
        styleOverrides: {
          root: { borderRadius: 12, fontWeight: 600, padding: '12px 32px', transition: 'all 0.3s ease-in-out' },
          containedPrimary: {
            background: 'linear-gradient(90deg, #6366F1 0%, #8B5CF6 100%)',
            boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.6)' : '0 8px 24px rgba(99,102,241,0.35)',
            ':hover': { filter: 'brightness(1.05)', boxShadow: isDark ? '0 12px 28px rgba(0,0,0,0.7)' : '0 12px 28px rgba(99,102,241,0.45)' },
          },
          outlined: { borderWidth: 1.5 },
        },
      },
      MuiChip: { styleOverrides: { root: { borderRadius: 10, fontWeight: 500, fontSize: '12px' } } },
      MuiLinearProgress: { styleOverrides: { root: { height: 6, borderRadius: 3 }, bar: { borderRadius: 3 } } },
      MuiTabs: { styleOverrides: { root: { '.MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' } } } },
      MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600, fontSize: '14px', minHeight: 48 } } },
    },
  });
};

export default createAppTheme('light');
