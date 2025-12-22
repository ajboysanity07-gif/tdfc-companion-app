import React, { useEffect, useState } from 'react';
import { AppBar, Box, Dialog, IconButton, Slide, Toolbar, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import type { TransitionProps } from '@mui/material/transitions';
import type { SxProps, Theme } from '@mui/material/styles';

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
    const layerZ = zIndex ?? theme.zIndex.modal + 10;
    const [appContentEl, setAppContentEl] = useState<HTMLElement | null>(null);

    useEffect(() => {
        if (typeof document === 'undefined') return;
        // Binds the dialog to the main app content area instead of the entire viewport.
        const target = document.querySelector<HTMLElement>('[data-app-content="true"]');
        setAppContentEl(target);
    }, []);

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
            container={appContentEl ?? undefined}
            TransitionComponent={Transition}
            slotProps={{
                root: appContentEl
                    ? {
                          sx: {
                              position: 'absolute',
                              inset: 0,
                              zIndex: layerZ,
                          },
                      }
                    : undefined,
                backdrop: {
                    sx: {
                        position: appContentEl ? 'absolute' : 'fixed',
                        inset: 0,
                        zIndex: layerZ,
                        backgroundColor: 'transparent',
                        backdropFilter: 'none',
                    },
                },
            }}
            PaperProps={{
                sx: {
                    position: appContentEl ? 'absolute' : undefined,
                    inset: appContentEl ? 0 : undefined,
                    width: appContentEl ? '100%' : undefined,
                    height: appContentEl ? '100%' : undefined,
                    maxWidth: appContentEl ? '100%' : undefined,
                    maxHeight: appContentEl ? '100%' : undefined,
                    m: appContentEl ? 0 : undefined,
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
                }}
            >
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={onClose} aria-label="close">
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
                    p: { xs: 2.5, sm: 3.5 },
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
