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

    const panelBase = {
        flex: 1,
        borderRadius: 3,
        boxShadow: '0 12px 30px rgba(15,23,42,0.12)',
        backgroundColor: tw.isDark ? '#2f2f2f' : 'background.paper',
        p: 4,
        minHeight: 600,
        display: 'flex',
        flexDirection: 'column',
    } satisfies BoxProps['sx'];

    const wrapperStyles: SxProps<Theme> = [
        {
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            gap: 4,
            p: 2,
            bgcolor: tw.isDark ? '#171717' : '#FAFAFA',
            transition: 'color 300ms, background-color 300ms',
        },
        ...(wrapperSx ? [wrapperSx] : []),
    ];

    const leftStyles: SxProps<Theme> = [panelBase, ...(leftSx ? [leftSx] : [])];
    const rightStyles: SxProps<Theme> = [panelBase, ...(rightSx ? [rightSx] : [])];

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
