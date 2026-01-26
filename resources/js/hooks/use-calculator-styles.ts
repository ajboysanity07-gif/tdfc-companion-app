import { useMyTheme } from '@/hooks/use-mytheme';

export const useCalculatorStyles = () => {
    const tw = useMyTheme();

    return {
        cardBg: tw.isDark ? '#2f2f2f' : '#f5f5f5',
        cardBorder: tw.isDark ? '#3a3a3a' : '#d4d4d4',
        accentColor: '#F57979',
        inputBorder: tw.isDark ? '1px solid rgba(255, 255, 255, 0.23)' : '1px solid rgba(0, 0, 0, 0.23)',
        inputBg: 'transparent',
        inputColor: tw.isDark ? '#fff' : '#000',
        isDark: tw.isDark,
    };
};
