import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useAppearance } from '@/hooks/use-appearance';
import { lightTheme, darkTheme } from '@/lib/mui-theme';
import { ReactNode, useEffect, useState } from 'react';

interface MuiThemeWrapperProps {
    children: ReactNode; // Content to be wrapped
}

export default function MuiThemeWrapper({ children }: MuiThemeWrapperProps) {
    // Get current appearance setting from custom hook
    const { appearance } = useAppearance();
    
    // State to store the current Material UI theme
    const [muiTheme, setMuiTheme] = useState(lightTheme);

    // Effect to update theme when appearance changes
    useEffect(() => {
        // If user selected "system" mode
        if (appearance === 'system') {
            // Check if system prefers dark mode
            const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches;
            // Set theme based on system preference
            setMuiTheme(systemPreference ? darkTheme : lightTheme);

            // Create media query listener for system preference changes
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            // Handler function when system preference changes
            const handleChange = (e: MediaQueryListEvent) => {
                setMuiTheme(e.matches ? darkTheme : lightTheme);
            };
            
            // Add listener for changes
            mediaQuery.addEventListener('change', handleChange);
            
            // Cleanup: remove listener when component unmounts
            return () => mediaQuery.removeEventListener('change', handleChange);
        } else {
            // If user selected explicit light or dark mode
            setMuiTheme(appearance === 'dark' ? darkTheme : lightTheme);
        }
    }, [appearance]); // Re-run effect when appearance changes

    return (
        <ThemeProvider theme={muiTheme}>
            {/* CssBaseline applies default Material UI styles */}
            <CssBaseline />
            {/* Render children with the selected theme */}
            {children}
        </ThemeProvider>
    );
}
