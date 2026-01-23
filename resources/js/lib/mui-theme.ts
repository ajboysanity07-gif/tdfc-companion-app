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
      primary: '#0a0a0a',                // Near black for maximum contrast
      secondary: '#3a3a3a',              // Much darker gray for strong readability
    },
    divider: '#bdbdbd',                  // Darker for clear visibility
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
