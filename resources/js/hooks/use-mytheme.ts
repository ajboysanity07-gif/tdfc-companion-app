// useMyTheme.ts - Get the current theme (light/dark) from document
import { useEffect, useState } from 'react';
import { getTailwindTheme } from '@/lib/tailwind-theme';

export function useMyTheme() {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check for dark mode from document class or localStorage
    const isDark = document.documentElement.classList.contains('dark');
    setMode(isDark ? 'dark' : 'light');

    // Listen for changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          setMode(isDark ? 'dark' : 'light');
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  if (!mounted) {
    return getTailwindTheme('light');
  }

  return getTailwindTheme(mode);
}
