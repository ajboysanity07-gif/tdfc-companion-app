// /lib/tailwind-theme.ts

export type ThemeMode = 'light' | 'dark';

export function getTailwindTheme(mode: ThemeMode = 'light') {
  const isDark = mode === 'dark';
  return {
    isDark, // <--- add this if you want to use it
    bgClass: isDark
      ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
      : 'bg-linear-to-br from-gray-100 via-white to-gray-200',
    inputBase:
      'mt-2 w-full rounded-lg border px-4 py-3 placeholder:text-gray-400 outline-none ' +
      (isDark
        ? 'border-gray-700 bg-gray-900 text-white focus:border-pink-400 focus:ring-pink-700/30'
        : 'border-gray-200 bg-white text-black focus:border-[#F57979] focus:ring-[#F57979]/50'),
    card: isDark ? 'bg-gray-800' : 'bg-[#ededed]',
    button:
      (isDark
        ? 'rounded-full bg-pink-700 px-8 py-3 text-sm font-extrabold tracking-wide text-white hover:bg-pink-600 disabled:opacity-40'
        : 'rounded-full bg-[#F57979] px-8 py-3 text-sm font-extrabold tracking-wide text-white hover:bg-pink-500 disabled:opacity-40'),
    label: isDark ? 'text-pink-300' : 'text-[#F57979]',
    link: 'font-semibold text-[#F57979] hover:underline',
  };
}
