import { useEffect, useState } from 'react';

/**
 * Custom hook for media queries - replaces MUI's useMediaQuery
 * @param query - CSS media query string (e.g., '(max-width: 768px)')
 * @returns boolean - Whether the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mediaQueryList = window.matchMedia(query);
    setMatches(mediaQueryList.matches);

    const handler = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    // Use addEventListener for better browser support
    mediaQueryList.addEventListener('change', handler);

    return () => {
      mediaQueryList.removeEventListener('change', handler);
    };
  }, [query]);

  // Return false during SSR
  if (!mounted) {
    return false;
  }

  return matches;
}

// Common media query helpers
export const mediaQueries = {
  xs: '(max-width: 640px)',
  sm: '(max-width: 768px)',
  md: '(max-width: 1024px)',
  lg: '(max-width: 1280px)',
  xl: '(max-width: 1536px)',
};

export function useIsMobile() {
  return useMediaQuery(mediaQueries.sm);
}

export function useIsTablet() {
  return useMediaQuery(mediaQueries.md);
}

export function useIsDesktop() {
  return !useMediaQuery(mediaQueries.md);
}
