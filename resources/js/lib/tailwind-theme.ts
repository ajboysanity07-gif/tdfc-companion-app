// /lib/tailwind-theme.ts

export type ThemeMode = 'light' | 'dark';

export function getTailwindTheme(mode: ThemeMode = 'light') {
  const isDark = mode === 'dark';
  const accent = '#F57979';
  return {
    isDark, // <--- add this if you want to use it
    bgClass: isDark ? 'bg-neutral-900' : 'bg-linear-to-br from-gray-100 via-white to-gray-200',
    inputBase:
      'mt-2 w-full rounded-lg border px-4 py-3 placeholder:text-gray-400 outline-none ' +
      (isDark
        ? 'border-gray-700 bg-gray-900 text-white focus:border-pink-400 focus:ring-pink-700/30'
        : 'border-gray-200 bg-white text-black focus:border-[#F57979] focus:ring-[#F57979]/50'),
    card: isDark ? 'bg-[#2f2f2f] border border-[#3a3a3a]' : 'bg-[#f5f5f5] border border-[#e5e7eb]',
    button:
      (isDark
        ? `rounded-full bg-[${accent}] px-8 py-3 text-sm font-extrabold tracking-wide text-white hover:bg-[#f46868] disabled:opacity-40`
        : `rounded-full bg-[${accent}] px-8 py-3 text-sm font-extrabold tracking-wide text-white hover:bg-[#f46868] disabled:opacity-40`),
    label: isDark ? `text-[${accent}]` : `text-[${accent}]`,
    link: `font-semibold text-[${accent}] hover:underline`,
  };
}
