import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    htmlFontSize: 16,
    h4: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.2 },
    h5: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.25 },
    h6: { fontSize: '1.125rem', fontWeight: 600 },
    subtitle1: { fontSize: '1rem', fontWeight: 600 },
    subtitle2: { fontSize: '0.95rem', fontWeight: 600 },
    body1: { fontSize: '0.95rem' },
    body2: { fontSize: '0.9rem' },
    caption: { fontSize: '0.8rem' },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: 0.2,
      fontSize: '0.95rem',
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        size: 'medium',
        variant: 'contained',
      },
      styleOverrides: {
        root: ({ theme }) => ({
          minWidth: 140,
          paddingLeft: theme.spacing(2),
          paddingRight: theme.spacing(2),
          paddingTop: theme.spacing(1),
          paddingBottom: theme.spacing(1),
          borderRadius: 8,
        }),
      },
    },
    MuiButtonGroup: {
      styleOverrides: {
        grouped: {
          minWidth: 140,
        },
      },
    },
    MuiIconButton: {
      defaultProps: {
        size: 'medium',
      },
      styleOverrides: {
        root: ({ theme }) => ({
          padding: theme.spacing(1.25),
        }),
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          fontSize: '0.95rem',
        },
        body: {
          fontSize: '0.9rem',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        label: {
          fontWeight: 600,
        },
      },
    },
  },
});

export default theme;
