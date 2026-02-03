// mui-theme.ts
import { createTheme } from '@mui/material/styles';

// Color palette
const colors = {
  red: '#e14e4e',          // Dark red
  redLight: '#f57373',     // Light red
  yellow: '#ffe57b',       // Yellow
  blue: '#4c92f1',         // Blue
  teal: '#87bfd3',         // Teal
};

// Light theme
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: colors.red },              // Red for primary actions
    secondary: { main: colors.blue },           // Blue for secondary
    error: { main: colors.red },                // Red for errors
    warning: { main: colors.yellow },           // Yellow for warnings
    info: { main: colors.blue },                // Blue for info
    success: { main: colors.teal },             // Teal for success
    background: {
      default: '#fafafb',                       // Soft background
      paper: '#f5f5f5',                         // Card/paper light gray
    },
    text: {
      primary: '#0a0a0a',                       // Near black
      secondary: '#3a3a3a',                     // Dark gray
    },
    divider: '#bdbdbd',                         // Divider gray
  },
});

// Dark theme
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: colors.redLight },
    secondary: { main: colors.blue },
    error: { main: colors.red },
    warning: { main: colors.yellow },
    info: { main: colors.blue },
    success: { main: colors.teal },
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
