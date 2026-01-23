import React, { useEffect, useState } from 'react';
import { Box, Button, IconButton, Paper, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InstallMobileIcon from '@mui/icons-material/InstallMobile';
import { useMyTheme } from '@/hooks/use-mytheme';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const tw = useMyTheme();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        console.log('[PWA] Install prompt component mounted');
        
        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('[PWA] App is already installed');
            return;
        }

        // Check if user has already dismissed the prompt
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (dismissed) {
            const dismissedUntil = parseInt(dismissed);
            if (Date.now() < dismissedUntil) {
                console.log('[PWA] Install prompt was dismissed, will show again at:', new Date(dismissedUntil));
                return;
            } else {
                // Dismissal expired, clear it
                localStorage.removeItem('pwa-install-dismissed');
            }
        }

        // Listen for the beforeinstallprompt event
        const handler = (e: Event) => {
            console.log('[PWA] beforeinstallprompt event fired!');
            // Prevent the default browser install prompt
            e.preventDefault();
            
            const promptEvent = e as BeforeInstallPromptEvent;
            setDeferredPrompt(promptEvent);
            
            // Show our custom prompt after a short delay
            setTimeout(() => {
                console.log('[PWA] Showing custom install prompt');
                setShowPrompt(true);
            }, 2000);
        };

        window.addEventListener('beforeinstallprompt', handler);
        console.log('[PWA] Listening for beforeinstallprompt event...');

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) {
            console.log('[PWA] No deferred prompt available');
            alert('Install prompt not available. Make sure you:\n1. Are using HTTPS or localhost\n2. Have a valid manifest.json\n3. Have a registered service worker\n4. Haven\'t already installed the app');
            return;
        }

        console.log('[PWA] Triggering install prompt');
        // Show the native install prompt
        await deferredPrompt.prompt();

        // Wait for the user's response
        const choiceResult = await deferredPrompt.userChoice;

        if (choiceResult.outcome === 'accepted') {
            console.log('[PWA] User accepted the install prompt');
        } else {
            console.log('[PWA] User dismissed the install prompt');
        }

        // Clear the prompt
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        // Remember dismissal for 7 days
        const dismissedUntil = Date.now() + 7 * 24 * 60 * 60 * 1000;
        localStorage.setItem('pwa-install-dismissed', dismissedUntil.toString());
    };

    const handleRemindLater = () => {
        setShowPrompt(false);
        // Show again in 24 hours
        const remindAt = Date.now() + 24 * 60 * 60 * 1000;
        localStorage.setItem('pwa-install-dismissed', remindAt.toString());
    };

    if (!showPrompt || !deferredPrompt) return null;

    return (
        <Box
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 9999,
                p: isMobile ? 2 : 3,
                display: 'flex',
                justifyContent: 'center',
                pointerEvents: 'none',
            }}
        >
            <Paper
                elevation={8}
                sx={{
                    maxWidth: isMobile ? '100%' : 480,
                    width: '100%',
                    p: isMobile ? 2 : 3,
                    borderRadius: 3,
                    bgcolor: tw.isDark ? '#1c1c1c' : '#ffffff',
                    border: `1px solid ${tw.isDark ? '#3a3a3a' : '#e5e5e5'}`,
                    pointerEvents: 'auto',
                    position: 'relative',
                    background: tw.isDark 
                        ? 'linear-gradient(135deg, #1c1c1c 0%, #2d2d2d 100%)'
                        : 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
                }}
            >
                {/* Close button */}
                <IconButton
                    size="small"
                    onClick={handleDismiss}
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: 'text.secondary',
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>

                <Stack spacing={2}>
                    {/* Icon and Title */}
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                            sx={{
                                width: 56,
                                height: 56,
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'rgba(239, 83, 80, 0.15)',
                                color: '#ef5350',
                            }}
                        >
                            <InstallMobileIcon sx={{ fontSize: 32 }} />
                        </Box>
                        <Box sx={{ flex: 1, pr: 3 }}>
                            <Typography variant="h6" fontWeight={700} gutterBottom>
                                Install TDFC App
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Install our app for faster access and offline functionality
                            </Typography>
                        </Box>
                    </Stack>

                    {/* Buttons */}
                    <Stack direction={isMobile ? 'column' : 'row'} spacing={1.5}>
                        <Button
                            variant="contained"
                            onClick={handleInstall}
                            fullWidth={isMobile}
                            sx={{
                                flex: isMobile ? 'unset' : 1,
                                bgcolor: '#ef5350',
                                color: 'white',
                                fontWeight: 700,
                                textTransform: 'none',
                                py: 1.25,
                                '&:hover': {
                                    bgcolor: '#e53935',
                                },
                            }}
                        >
                            Install Now
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={handleRemindLater}
                            fullWidth={isMobile}
                            sx={{
                                flex: isMobile ? 'unset' : 1,
                                borderColor: tw.isDark ? '#3a3a3a' : '#e5e5e5',
                                color: 'text.secondary',
                                fontWeight: 600,
                                textTransform: 'none',
                                py: 1.25,
                            }}
                        >
                            Remind Me Later
                        </Button>
                    </Stack>
                </Stack>
            </Paper>
        </Box>
    );
};

export default PWAInstallPrompt;
