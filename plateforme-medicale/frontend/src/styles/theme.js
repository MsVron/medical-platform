import { createTheme } from '@mui/material/styles';

const medicalTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4ca1af', // Medical aqua/teal
      dark: '#2c3e50', // Dark blue
    },
    secondary: {
      main: '#2c3e50', // Dark blue
    },
    error: {
      main: '#e74c3c', // Red for error states
      dark: '#c0392b',
    },
    background: {
      default: '#fafafa',
      paper: '#f5f5f5',
    },
    text: {
      primary: '#2c3e50',
      secondary: '#4ca1af',
    },
  },
  typography: {
    fontFamily: "'Segoe UI', sans-serif",
    h4: {
      fontWeight: 'bold',
    },
    h5: {
      fontWeight: 'bold',
    },
    h6: {
      fontWeight: 'bold',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 'bold',
          borderRadius: 8,
          boxShadow: '0 4px 8px rgba(44, 62, 80, 0.1)',
          transition: 'all 0.3s ease',
        },
        containedPrimary: {
          backgroundColor: '#4ca1af',
          '&:hover': {
            backgroundColor: '#2c3e50',
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 12px rgba(44, 62, 80, 0.2)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(to bottom, #2c3e50, #4ca1af)',
          color: 'white',
        },
      },
    },
  },
});

export default medicalTheme;