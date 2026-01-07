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
        gap: 3,
        p: 2,
        pb: 2,
        minHeight: 'auto',
        bgcolor: tw.isDark ? '#0a0a0a' : '#f5f5f5',
    };

    const stackBase: SxProps<Theme> = {
        borderRadius: 3,
        boxShadow: '0 12px 30px rgba(15,23,42,0.12)',
        backgroundColor: tw.isDark ? '#2f2f2f' : 'background.paper',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 'calc(100vh - 320px)',
        justifyContent: 'flex-start',
        width: '100%',
        maxWidth: 720,
        alignSelf: 'center',
        pb: { xs: 8, sm: 3 },
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
