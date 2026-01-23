import React, { useEffect, useState } from 'react';
import { Box, IconButton, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import { motion, AnimatePresence } from 'framer-motion';
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

    if (!deferredPrompt) return null;

    return (
        <>
            {/* Backdrop */}
            <AnimatePresence>
                {showPrompt && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            zIndex: 9998,
                        }}
                        onClick={handleRemindLater}
                    />
                )}
            </AnimatePresence>

            {/* Google Play Style Dialog */}
            <AnimatePresence>
                {showPrompt && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ 
                            type: 'spring',
                            damping: 30,
                            stiffness: 300,
                        }}
                        style={{
                            position: 'fixed',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            zIndex: 9999,
                            maxHeight: '85vh',
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <Paper
                            elevation={0}
                            sx={{
                                width: '100%',
                                maxWidth: isMobile ? '100%' : 500,
                                bgcolor: tw.isDark ? '#1f1f1f' : '#ffffff',
                                borderTopLeftRadius: isMobile ? 24 : 24,
                                borderTopRightRadius: isMobile ? 24 : 24,
                                borderBottomLeftRadius: 0,
                                borderBottomRightRadius: 0,
                                overflow: 'hidden',
                                maxHeight: '85vh',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            {/* Header with close button */}
                            <Box sx={{ position: 'relative', p: 2, borderBottom: `1px solid ${tw.isDark ? '#333' : '#e5e5e5'}` }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Box component="span" sx={{ width: 16, height: 16 }}>
                                        <svg viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                                        </svg>
                                    </Box>
                                    Google Play
                                </Typography>
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
                                    <CloseIcon />
                                </IconButton>
                            </Box>

                            {/* Scrollable content */}
                            <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                                {/* App Info Section */}
                                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                                    {/* App Icon */}
                                    <Box
                                        sx={{
                                            width: 72,
                                            height: 72,
                                            borderRadius: 2,
                                            overflow: 'hidden',
                                            flexShrink: 0,
                                            border: `1px solid ${tw.isDark ? '#333' : '#e5e5e5'}`,
                                        }}
                                    >
                                        <img 
                                            src="/images/tdfc-icon.png" 
                                            alt="TDFC App" 
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </Box>

                                    {/* App Name & Publisher */}
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="h6" fontWeight={600} gutterBottom noWrap>
                                            TDFC Companion App
                                        </Typography>
                                        <Typography variant="body2" color="primary" gutterBottom>
                                            TDFC Cooperative
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Contains ads · In-app purchases
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Stats Section */}
                                <Box sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-around', 
                                    mb: 3,
                                    pb: 2,
                                    borderBottom: `1px solid ${tw.isDark ? '#333' : '#e5e5e5'}`
                                }}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3, mb: 0.5 }}>
                                            <Typography variant="body2" fontWeight={600}>4.8</Typography>
                                            <StarIcon sx={{ fontSize: 14, color: '#5f6368' }} />
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">
                                            326K reviews
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="body2" fontWeight={600} gutterBottom>
                                            3+
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Rated for 3+
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="body2" fontWeight={600} gutterBottom>
                                            5M+
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Downloads
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Install Button */}
                                <Box
                                    component="button"
                                    onClick={handleInstall}
                                    sx={{
                                        width: '100%',
                                        py: 1.5,
                                        mb: 3,
                                        borderRadius: 2,
                                        border: 'none',
                                        bgcolor: '#01875f',
                                        color: 'white',
                                        fontWeight: 700,
                                        fontSize: '0.875rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            bgcolor: '#017a56',
                                        },
                                        '&:active': {
                                            transform: 'scale(0.98)',
                                        },
                                    }}
                                >
                                    Install
                                </Box>

                                {/* Screenshots Section */}
                                <Box sx={{ mb: 3 }}>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        gap: 1.5, 
                                        overflowX: 'auto',
                                        pb: 1,
                                        '&::-webkit-scrollbar': {
                                            height: 4,
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            backgroundColor: tw.isDark ? '#444' : '#ccc',
                                            borderRadius: 2,
                                        },
                                    }}>
                                        {[1, 2, 3, 4].map((i) => (
                                            <Box
                                                key={i}
                                                sx={{
                                                    width: 180,
                                                    height: 320,
                                                    borderRadius: 2,
                                                    overflow: 'hidden',
                                                    flexShrink: 0,
                                                    border: `1px solid ${tw.isDark ? '#333' : '#e5e5e5'}`,
                                                    bgcolor: tw.isDark ? '#2a2a2a' : '#f5f5f5',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Typography variant="caption" color="text.secondary">
                                                    Screenshot {i}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>

                                {/* About Section */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                                        About this app
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                        TDFC Cooperative Financial Management System - Manage your loans, track transactions, 
                                        view amortization schedules, and stay connected with your cooperative. Access your 
                                        financial information anytime, anywhere with offline support.
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default PWAInstallPrompt;
