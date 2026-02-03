// /lib/tailwind-theme.ts

export type ThemeMode = 'light' | 'dark';

// Color palette
const colors = {
  red: '#e14e4e',          // Dark red
  redLight: '#f57373',     // Light red
  yellow: '#ffe57b',       // Yellow
  blue: '#4c92f1',         // Blue
  teal: '#87bfd3',         // Teal
};

export function getTailwindTheme(mode: ThemeMode = 'light') {
  const isDark = mode === 'dark';
  const primary = colors.red;
  const secondary = colors.blue;
  const accent = colors.redLight;
  
  return {
    isDark,
    colors,
    bgClass: isDark ? 'bg-neutral-900' : 'bg-linear-to-br from-gray-100 via-white to-gray-200',
    inputBase:
      'mt-2 w-full rounded-lg border px-4 py-3 placeholder:text-gray-400 outline-none ' +
      (isDark
        ? `border-gray-700 bg-gray-900 text-white focus:border-[${primary}] focus:ring-[${primary}]/30`
        : `border-gray-200 bg-white text-black focus:border-[${primary}] focus:ring-[${primary}]/50`),
    card: isDark ? 'bg-[#2f2f2f] border border-[#3a3a3a]' : 'bg-[#f5f5f5] border border-[#e5e7eb]',
    button:
      `rounded-full bg-[${primary}] px-8 py-3 text-sm font-extrabold tracking-wide text-white hover:bg-[${accent}] disabled:opacity-40`,
    buttonSecondary:
      `rounded-full bg-[${secondary}] px-8 py-3 text-sm font-extrabold tracking-wide text-white hover:bg-blue-600 disabled:opacity-40`,
    buttonTeal:
      `rounded-full bg-[${colors.teal}] px-8 py-3 text-sm font-extrabold tracking-wide text-white hover:bg-teal-600 disabled:opacity-40`,
    label: `text-[${primary}]`,
    link: `font-semibold text-[${primary}] hover:underline`,
    warning: `text-[${colors.yellow}]`,
    success: `text-[${colors.teal}]`,
  };
}
