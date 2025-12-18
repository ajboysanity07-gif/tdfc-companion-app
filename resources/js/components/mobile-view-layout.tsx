import { useMyTheme } from '@/hooks/use-mytheme';
import { Box, Stack, type BoxProps } from '@mui/material';
import { type ReactNode } from 'react';

type MobileViewLayoutProps = {
    children: ReactNode;
    footer?: ReactNode;
    wrapperSx?: BoxProps['sx'];
    stackSx?: BoxProps['sx'];
};

export default function MobileViewLayout({ children, footer, wrapperSx, stackSx }: MobileViewLayoutProps) {
    const tw = useMyTheme();

    return (
        <Box
            sx={[
                {
                    display: 'flex',
                    flex: 1,
                    flexDirection: 'column',
                    gap: 3,
                    p: 2,
                    pb: 2,
                    minHeight: 'auto',
                    bgcolor: tw.isDark ? '#171717' : '#fafafa',
                },
                wrapperSx,
            ]}
        >
            <Stack
                sx={[
                    {
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
                },
                stackSx,
            ]}
        >
            {children}
            </Stack>
            {footer}
        </Box>
    );
}
