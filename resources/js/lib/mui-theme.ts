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
      primary: '#1a1a1a',                // Darker for better contrast
      secondary: '#525252',              // Darker gray for better readability (WCAG AA compliant)
    },
    divider: '#d4d4d4',                  // Slightly darker for better visibility
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
