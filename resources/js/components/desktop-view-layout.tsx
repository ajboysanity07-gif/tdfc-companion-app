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
        border: '1px solid',
        borderColor: tw.isDark ? 'rgba(64, 64, 64, 0.7)' : 'rgba(229, 231, 235, 1)',
        boxShadow: tw.isDark 
            ? '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)' 
            : '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
        backgroundColor: tw.isDark ? '#171717' : '#FAFAFA',
        p: 4,
        minHeight: 850,
        display: 'flex',
        flexDirection: 'column',
    } satisfies SxProps<Theme>;


    const leftStyles: SxProps<Theme> = mergeSx(panelBase, leftSx);
    const rightStyles: SxProps<Theme> = mergeSx(panelBase, rightSx);

    return (
        <Box
            sx={{
                display: 'flex',
                flex: 1,
                flexDirection: 'column',
                gap: 0,
                p: 2,
                pt: 0,
                bgcolor: tw.isDark ? '#0a0a0a' : '#f5f5f5',
                transition: 'color 300ms, background-color 300ms',
                ...wrapperSx,
            }}
        >
            <Stack direction="row" spacing={2} alignItems="stretch" {...stackProps}>
                <Box sx={leftStyles}>{left}</Box>
                <Box sx={rightStyles}>{right}</Box>
            </Stack>
            {afterStack}
        </Box>
    );
}
