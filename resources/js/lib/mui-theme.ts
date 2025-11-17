// mui-theme.ts
import { createTheme } from '@mui/material/styles';

// Light theme
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#f57373' },        // Accent light red
    secondary: { main: '#4c92f1' },      // Accent blue
    warning: { main: '#ffe57b' },        // Accent yellow
    background: {
      default: '#fafafb',                // Soft background (softer than pure white)
      paper: '#ffffff',                  // Card/paper white
    },
    text: {
      primary: '#232323',                // Dark but not pure black
      secondary: '#888888',              // Muted gray for secondary
    },
    divider: '#e0e0e0',                  // Soft but visible divider
  },
});

// Dark theme
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#f57373' },
    secondary: { main: '#4c92f1' },
    warning: { main: '#ffe57b' },
    background: {
      default: '#171717',
      paper: '#2f2f2f',
    },
    text: {
      primary: '#ffffff',
      secondary: '#bbbbbb'
    },
    divider: '#232323',
  },
});
