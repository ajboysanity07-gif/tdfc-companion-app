import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

const KEY = 'tdfc-theme';
const DEFAULT: Appearance = 'dark'; // first-time visitors; use 'system' to follow the OS instead

const prefersDark = () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
const isDarkFor = (a: Appearance) => a === 'dark' || (a === 'system' && prefersDark());

const read = (): Appearance => {
    if (typeof window === 'undefined') return DEFAULT;
    // legacy key: 'appearance'
    const v = localStorage.getItem(KEY) ?? localStorage.getItem('appearance');
    return v === 'light' || v === 'dark' || v === 'system' ? v : DEFAULT;
};

const applyTheme = (a: Appearance) => {
    const dark = isDarkFor(a);
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
};

const persist = (a: Appearance) => {
    localStorage.setItem(KEY, a);
    document.cookie = `appearance=${a};path=/;max-age=${365 * 24 * 60 * 60};SameSite=Lax`;
};

type Ctx = { appearance: Appearance; isDark: boolean; updateAppearance: (mode: Appearance) => void };

const AppearanceContext = createContext<Ctx>({ appearance: DEFAULT, isDark: true, updateAppearance: () => {} });

export const AppearanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [appearance, setAppearance] = useState<Appearance>(read);
    const [isDark, setIsDark] = useState(() => isDarkFor(appearance));

    const updateAppearance = useCallback((mode: Appearance) => {
        persist(mode);
        setAppearance(mode);
    }, []);

    useEffect(() => {
        const sync = () => {
            applyTheme(appearance);
            setIsDark(isDarkFor(appearance));
        };
        sync();
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        if (appearance === 'system') mq.addEventListener('change', sync);
        return () => mq.removeEventListener('change', sync);
    }, [appearance]);

    // keep other tabs in sync
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === KEY) setAppearance(read());
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    return <AppearanceContext.Provider value={{ appearance, isDark, updateAppearance }}>{children}</AppearanceContext.Provider>;
};

export function useAppearance() {
    return useContext(AppearanceContext);
}

// Sets the theme before React renders (the blade head script does the same pre-paint).
export function initializeTheme() {
    applyTheme(read());
}
