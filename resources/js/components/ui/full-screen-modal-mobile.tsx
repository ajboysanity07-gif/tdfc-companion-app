import React, { useEffect } from 'react';
import { AppBar, Box, Dialog, IconButton, Slide, Toolbar, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import type { TransitionProps } from '@mui/material/transitions';
import type { SxProps, Theme } from '@mui/material/styles';
import { useSidebar } from '@/components/ui/sidebar';

type Props = {
    open: boolean;
    title: React.ReactNode;
    onClose: () => void;
    children: React.ReactNode;
    headerBg?: string;
    headerColor?: string;
    toolbarContentRight?: React.ReactNode;
    bodySx?: SxProps<Theme>;
    paperSx?: SxProps<Theme>;
    bodyClassName?: string;
    onToggle?: (open: boolean) => void;
    zIndex?: number;
};

const Transition = React.forwardRef(function Transition(
    props: TransitionProps & { children: React.ReactElement },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="right" ref={ref} timeout={{ enter: 320, exit: 240 }} {...props} />;
});

const FullScreenModalMobile: React.FC<Props> = ({
    open,
    title,
    onClose,
    children,
    headerBg = '#f57979',
    headerColor = '#fff',
    toolbarContentRight,
    bodySx,
    paperSx,
    bodyClassName,
    onToggle,
    zIndex,
}) => {
    const theme = useTheme();
    const layerZ = zIndex ?? 5; // Lower than sidebar's z-10
    const { state: sidebarState, isMobile: isSidebarMobile } = useSidebar();
    const sidebarWidth = isSidebarMobile ? '0px' : (sidebarState === 'expanded' ? '16rem' : '4rem');
    const isCollapsed = !isSidebarMobile && sidebarState === 'collapsed';

    useEffect(() => {
        if (typeof document === 'undefined') return;
        if (bodyClassName) {
            if (open) {
                document.body.classList.add(bodyClassName);
            } else {
                document.body.classList.remove(bodyClassName);
            }
        }
        onToggle?.(open);

        return () => {
            if (bodyClassName) {
                document.body.classList.remove(bodyClassName);
            }
        };
    }, [bodyClassName, onToggle, open]);

    return (
        <Dialog
            fullScreen
            open={open}
            onClose={onClose}
            TransitionComponent={Transition}
            slotProps={{
                root: {
                    sx: {
                        zIndex: layerZ,
                    },
                },
                backdrop: {
                    sx: {
                        position: 'fixed',
                        inset: 0,
                        zIndex: layerZ,
                        backgroundColor: 'transparent',
                        backdropFilter: 'none',
                        left: { xs: 0, md: sidebarWidth }, // Offset for sidebar on desktop
                    },
                },
            }}
            PaperProps={{
                sx: {
                    position: 'fixed',
                    top: 0,
                    bottom: { xs: 74, md: 0 }, // Leave room for bottom nav on mobile
                    left: { xs: 0, md: sidebarWidth }, // Offset for sidebar on desktop
                    right: 0,
                    width: { xs: '100%', md: `calc(100% - ${sidebarWidth})` },
                    height: { xs: 'calc(100% - 74px)', md: '100%' },
                    maxWidth: '100%',
                    maxHeight: '100%',
                    m: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(12,12,14,0.94)' : 'rgba(255,255,255,0.98)',
                    backdropFilter: 'blur(12px)',
                    zIndex: layerZ + 1,
                    overflow: 'hidden',
                    ...paperSx,
                },
            }}
        >
            <AppBar
                position="sticky"
                color="default"
                elevation={0}
                sx={{
                    bgcolor: headerBg,
                    color: headerColor,
                    borderBottom: '1px solid rgba(0,0,0,0.08)',
                    pl: isCollapsed ? 2 : 0,
                }}
            >
                <Toolbar sx={{ pl: { xs: 2, md: 0 } }}>
                    <IconButton 
                        color="inherit" 
                        onClick={onClose} 
                        aria-label="close"
                        sx={{ ml: { xs: 0, md: isCollapsed ? 0 : 2 } }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Typography
                        sx={{
                            ml: 2,
                            flex: 1,
                            minWidth: 0,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            fontSize: { xs: 16, sm: 20 },
                            lineHeight: 1.2,
                        }}
                        variant="h6"
                        component="div"
                        fontWeight={800}
                    >
                        {title}
                    </Typography>
                    {toolbarContentRight}
                </Toolbar>
            </AppBar>
            <Box
                sx={{
                    px: { xs: 2.5, sm: 3.5 },
                    py: { xs: 2.5, sm: 3.5 },
                    pb: { xs: 5, sm: 6 },
                    flex: 1,
                    overflowY: 'auto',
                    width: '100%',
                    ...bodySx,
                }}
            >
                {children}
            </Box>
        </Dialog>
    );
};

export default FullScreenModalMobile;
