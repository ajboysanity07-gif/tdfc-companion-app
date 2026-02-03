// /lib/tailwind-theme.ts

export type ThemeMode = 'light' | 'dark';

// Color palette - matches shadcn/ui and custom branding
export const colors = {
  red: '#e14e4e',          // Dark red - primary
  redLight: '#f57373',     // Light red
  yellow: '#ffe57b',       // Yellow - warning
  blue: '#4c92f1',         // Blue - secondary
  teal: '#87bfd3',         // Teal - success
};

export function getTailwindTheme(mode: ThemeMode = 'light') {
  const isDark = mode === 'dark';
  
  return {
    isDark,
    colors,
    // Background gradients
    bgClass: isDark 
      ? 'bg-slate-950' 
      : 'bg-gradient-to-br from-gray-50 via-white to-gray-100',
    
    // For legacy components using these classes
    inputBase: 'rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground',
    card: isDark ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-gray-200',
    button: 'inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90',
    label: 'text-sm font-medium text-foreground',
    link: 'font-medium text-primary hover:underline',
    warning: 'text-yellow-600 dark:text-yellow-500',
    success: 'text-emerald-600 dark:text-emerald-500',
    error: 'text-red-600 dark:text-red-500',
    info: 'text-blue-600 dark:text-blue-500',
  };
}
