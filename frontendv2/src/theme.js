import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: 0.2,
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
  },
});

export default theme;
