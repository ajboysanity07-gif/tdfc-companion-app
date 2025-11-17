import React, { useCallback, useEffect, useState, createContext, useContext } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

const prefersDark = () => {
    if (typeof window === 'undefined') {
        return false;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const setCookie = (name: string, value: string, days = 365) => {
    if (typeof document === 'undefined') {
        return;
    }
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const applyTheme = (appearance: Appearance) => {
    const isDark = appearance === 'dark' || (appearance === 'system' && prefersDark());
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
};

const mediaQuery = () => {
    if (typeof window === 'undefined') {
        return null;
    }
    return window.matchMedia('(prefers-color-scheme: dark)');
};

const handleSystemThemeChange = () => {
    const currentAppearance = localStorage.getItem('appearance') as Appearance;
    applyTheme(currentAppearance || 'system');
};

// --- Context & Provider (NEW) ---

type AppearanceContextType = {
    appearance: Appearance;
    updateAppearance: (mode: Appearance) => void;
};

const AppearanceContext = createContext<AppearanceContextType>({
    appearance: 'system',
    updateAppearance: () => {},
});

// Provider component you must use at app root
export const AppearanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [appearance, setAppearance] = useState<Appearance>(() => {
        if (typeof window === 'undefined') return 'system';
        return (localStorage.getItem('appearance') as Appearance) || 'system';
    });

    const updateAppearance = useCallback((mode: Appearance) => {
        setAppearance(mode);
        localStorage.setItem('appearance', mode);
        setCookie('appearance', mode);
        applyTheme(mode);
    }, []);

    // Initial and external (system) theme changes
    useEffect(() => {
        // Set the theme on first mount
        applyTheme(appearance);

        const mq = mediaQuery();
        // Listen for system changes in "system" mode:
        if (appearance === 'system') {
            mq?.addEventListener('change', handleSystemThemeChange);
        }
        return () => {
            mq?.removeEventListener('change', handleSystemThemeChange);
        };
    }, [appearance]);

    return (
        <AppearanceContext.Provider value={{ appearance, updateAppearance }}>
            {children}
        </AppearanceContext.Provider>
    );
};

// Hook for reading/updating appearance anywhere
export function useAppearance() {
    return useContext(AppearanceContext);
}

// This is only needed if you need to set theme on very first app load before React renders
export function initializeTheme() {
    const savedAppearance = (localStorage.getItem('appearance') as Appearance) || 'system';
    applyTheme(savedAppearance);
    mediaQuery()?.addEventListener('change', handleSystemThemeChange);
}
