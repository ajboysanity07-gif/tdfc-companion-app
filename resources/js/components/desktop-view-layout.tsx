import { useMyTheme } from '@/hooks/use-mytheme';
import { Box, Stack, type BoxProps, type StackProps, type SxProps, type Theme } from '@mui/material';
import { type ReactNode } from 'react';

type DesktopViewLayoutProps = {
    left: ReactNode;
    right: ReactNode;
    afterStack?: ReactNode;
    wrapperSx?: BoxProps['sx'];
    leftSx?: BoxProps['sx'];
    rightSx?: BoxProps['sx'];
    stackProps?: StackProps;
};

export default function DesktopViewLayout({
    left,
    right,
    afterStack,
    wrapperSx,
    leftSx,
    rightSx,
    stackProps,
}: DesktopViewLayoutProps) {
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

    const panelBase = {
        flex: 1,
        borderRadius: 3,
        boxShadow: '0 12px 30px rgba(15,23,42,0.12)',
        backgroundColor: tw.isDark ? '#2f2f2f' : 'background.paper',
        p: 4,
        minHeight: 600,
        display: 'flex',
        flexDirection: 'column',
    } satisfies SxProps<Theme>;

    const wrapperStyles: SxProps<Theme> = mergeSx(
        {
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            gap: 4,
            p: 2,
            bgcolor: tw.isDark ? '#0a0a0a' : '#f5f5f5',
            transition: 'color 300ms, background-color 300ms',
        },
        wrapperSx,
    );

    const leftStyles: SxProps<Theme> = mergeSx(panelBase, leftSx);
    const rightStyles: SxProps<Theme> = mergeSx(panelBase, rightSx);

    return (
        <Box
            sx={wrapperStyles}
        >
            <Stack direction="row" spacing={3} alignItems="stretch" {...stackProps}>
                <Box sx={leftStyles}>{left}</Box>
                <Box sx={rightStyles}>{right}</Box>
            </Stack>
            {afterStack}
        </Box>
    );
}
