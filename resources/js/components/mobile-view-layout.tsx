import { useMyTheme } from '@/hooks/use-mytheme';
import { Box, Stack, type BoxProps, type SxProps, type Theme } from '@mui/material';
import { type ReactNode } from 'react';

type MobileViewLayoutProps = {
    children: ReactNode;
    footer?: ReactNode;
    wrapperSx?: BoxProps['sx'];
    stackSx?: BoxProps['sx'];
};

export default function MobileViewLayout({ children, footer, wrapperSx, stackSx }: MobileViewLayoutProps) {
    const tw = useMyTheme();

    const resolveSx = (value: SxProps<Theme> | undefined, theme: Theme): Record<string, unknown> => {
        if (!value) return {};
        if (Array.isArray(value)) {
            return value.reduce<Record<string, unknown>>((acc, item) => ({ ...acc, ...resolveSx(item, theme) }), {});
        }
        if (typeof value === 'function') {
            return resolveSx(value(theme), theme);
        }
        return value as Record<string, unknown>;
    };

    const mergeSx = (base: SxProps<Theme>, override?: SxProps<Theme>): SxProps<Theme> => (theme: Theme) => ({
        ...resolveSx(base, theme),
        ...resolveSx(override, theme),
    });

    const wrapperBase: SxProps<Theme> = {
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
        gap: 0,
        p: 2,
        pt: 0,
        pb: { xs: 10, sm: 2 },
        minHeight: 'auto',
        bgcolor: tw.isDark ? '#0a0a0a' : '#f5f5f5',
    };

    const stackBase: SxProps<Theme> = {
        borderRadius: 6,
        border: '1px solid',
        borderColor: tw.isDark ? 'rgba(64, 64, 64, 0.7)' : 'rgba(229, 231, 235, 1)',
        boxShadow: tw.isDark 
            ? '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)' 
            : '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        backgroundColor: tw.isDark ? '#171717' : '#FAFAFA',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        width: '100%',
        maxWidth: 720,
        alignSelf: 'center',
    };

    const wrapperStyles = mergeSx(wrapperBase, wrapperSx);
    const stackStyles = mergeSx(stackBase, stackSx);

    return (
        <Box
            sx={wrapperStyles}
        >
            <Stack
                sx={stackStyles}
        >
            {children}
            </Stack>
            {footer}
        </Box>
    );
}
