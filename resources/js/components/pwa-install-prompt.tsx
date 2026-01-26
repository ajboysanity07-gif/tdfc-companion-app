import React, { useEffect, useState } from 'react';
import { Box, IconButton, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { motion, AnimatePresence } from 'framer-motion';
import { useMyTheme } from '@/hooks/use-mytheme';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type BrowserType = 'chrome' | 'firefox' | 'safari' | 'mobile' | 'unknown';

const detectBrowser = (): BrowserType => {
    const ua = navigator.userAgent;
    
    // Check for Safari (must be before Chrome as Safari contains 'Chrome')
    if (/^((?!chrome|android).)*safari/i.test(ua) || /Safari/.test(ua) && !/Chrome/.test(ua)) {
        return 'safari';
    }
    
    // Check for Firefox
    if (/firefox|fxios/i.test(ua)) {
        return 'firefox';
    }
    
    // Check for Chrome (includes Chromium-based)
    if (/chrome|chromium|crios/i.test(ua)) {
        return 'chrome';
    }
    
    // Check for mobile browser
    if (/mobile|android|iphone|ipad|ipod/i.test(ua)) {
        return 'mobile';
    }
    
    return 'unknown';
};

const PWAInstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [browserType, setBrowserType] = useState<BrowserType>('unknown');
    const tw = useMyTheme();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const browser = detectBrowser();
        setBrowserType(browser);
        console.log('[PWA] Detected browser:', browser);
        console.log('[PWA] Install prompt component mounted');
        console.log('[PWA] User Agent:', navigator.userAgent);
        
        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            console.log('[PWA] App is already installed');
            return;
        }

        // Allow clearing the dismissal flag via URL param (?resetPWA=true) for testing
        const urlParams = new URLSearchParams(window.location.search);
        const isResettingPWA = urlParams.has('resetPWA');
        if (isResettingPWA) {
            localStorage.removeItem('pwa-install-dismissed');
            sessionStorage.removeItem('pwa-prompt-shown-this-session');
            console.log('[PWA] Dismissal flag cleared via URL param');
        }

        // Check if prompt was already shown in this session (don't repeat during same session)
        const shownThisSession = sessionStorage.getItem('pwa-prompt-shown-this-session');
        if (shownThisSession && !isResettingPWA) {
            console.log('[PWA] Prompt already shown in this session');
            return;
        }

        // For Chrome/Chromium browsers
        if (browser === 'chrome') {
            console.log('[PWA] Chrome detected, setting up beforeinstallprompt listener...');
            let promptEventFired = false;
            
            const handler = (e: Event) => {
                console.log('[PWA] ✓ beforeinstallprompt event FIRED!');
                promptEventFired = true;
                e.preventDefault();
                
                const promptEvent = e as BeforeInstallPromptEvent;
                setDeferredPrompt(promptEvent);
                
                setTimeout(() => {
                    console.log('[PWA] Setting showPrompt to TRUE');
                    setShowPrompt(true);
                }, 2000);
            };

            window.addEventListener('beforeinstallprompt', handler);
            console.log('[PWA] beforeinstallprompt listener attached');

            // Fallback: if no beforeinstallprompt event after 3 seconds, show fallback (for dev/localhost)
            const fallbackTimer = setTimeout(() => {
                if (!promptEventFired) {
                    console.log('[PWA] beforeinstallprompt event did not fire (likely on localhost/dev), showing fallback prompt');
                    sessionStorage.setItem('pwa-prompt-shown-this-session', 'true');
                    setShowPrompt(true);
                }
            }, 3000);

            return () => {
                window.removeEventListener('beforeinstallprompt', handler);
                clearTimeout(fallbackTimer);
            };
        }
        
        // For non-Chrome browsers, show fallback prompt after delay
        console.log('[PWA] Non-Chrome browser, showing fallback prompt in 3 seconds...');
        const timer = setTimeout(() => {
            console.log('[PWA] Showing fallback install prompt for', browser);
            sessionStorage.setItem('pwa-prompt-shown-this-session', 'true');
            setShowPrompt(true);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const handleInstall = async () => {
        // Mark as shown this session
        sessionStorage.setItem('pwa-prompt-shown-this-session', 'true');
        
        // For Chrome/Chromium browsers with deferred prompt
        if (deferredPrompt) {
            console.log('[PWA] Triggering Chrome native install prompt');
            await deferredPrompt.prompt();
            const choiceResult = await deferredPrompt.userChoice;

            if (choiceResult.outcome === 'accepted') {
                console.log('[PWA] User accepted the install prompt');
            } else {
                console.log('[PWA] User dismissed the install prompt');
            }

            setDeferredPrompt(null);
            setShowPrompt(false);
            return;
        }

        // For non-Chrome browsers, show browser-specific instructions
        console.log('[PWA] Showing browser-specific install instructions for:', browserType);

        let instructions = '';
        
        if (browserType === 'firefox') {
            instructions = 'Firefox - Install Instructions:\n\n' +
                '1. Click the menu icon (☰) in the top right corner\n' +
                '2. Select "Install" or look for an install icon next to the address bar\n' +
                '3. Click "Install" when prompted\n\n' +
                'Note: Some Firefox versions may not show an install option. ' +
                'If you don\'t see it, the app is still accessible from the browser.';
        } else if (browserType === 'safari') {
            instructions = 'Safari - Install Instructions:\n\n' +
                '1. Tap the Share button (up arrow from bottom) at the bottom of the screen\n' +
                '2. Scroll down and tap "Add to Home Screen"\n' +
                '3. Enter a name for the app\n' +
                '4. Tap "Add" in the top right corner\n\n' +
                'The app will now appear on your home screen and can be launched from there.';
        } else if (browserType === 'mobile') {
            instructions = 'Mobile Browser - Install Instructions:\n\n' +
                'Look for an "Install" or "Add to Home Screen" button, usually:\n' +
                '• In the address bar\n' +
                '• In the menu (☰ or ⋯)\n' +
                '• At the bottom of the screen\n\n' +
                'If you don\'t see an install option, try opening this page in Chrome, Firefox, or Safari.';
        } else {
            instructions = 'Install Instructions:\n\n' +
                'Your browser should show an install prompt. If not:\n' +
                '• Try refreshing the page (F5 or Ctrl+R)\n' +
                '• Look for an install button in the address bar or menu\n' +
                '• Use Chrome, Firefox, or Safari for best results';
        }

        alert(instructions);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        // Mark as shown this session
        sessionStorage.setItem('pwa-prompt-shown-this-session', 'true');
        // Remember dismissal for 7 days
        const dismissedUntil = Date.now() + 7 * 24 * 60 * 60 * 1000;
        localStorage.setItem('pwa-install-dismissed', dismissedUntil.toString());
    };

    const handleRemindLater = () => {
        setShowPrompt(false);
        // Mark as shown this session
        sessionStorage.setItem('pwa-prompt-shown-this-session', 'true');
        // Show again in 24 hours
        const remindAt = Date.now() + 24 * 60 * 60 * 1000;
        localStorage.setItem('pwa-install-dismissed', remindAt.toString());
    };

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
                        onClick={isMobile ? handleRemindLater : undefined}
                    />
                )}
            </AnimatePresence>

            {/* Mobile: Google Play Style Bottom Sheet */}
            {isMobile && (
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
                            maxHeight: '95vh',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            flexDirection: 'column',
                        }}
                    >
                        <Paper
                            elevation={0}
                            sx={{
                                width: '100%',
                                maxWidth: '100%',
                                bgcolor: tw.isDark ? '#1f1f1f' : '#ffffff',
                                borderTopLeftRadius: 24,
                                borderTopRightRadius: 24,
                                borderBottomLeftRadius: 0,
                                borderBottomRightRadius: 0,
                                overflow: 'hidden',
                                maxHeight: '95vh',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            {/* Header with close button */}
                            <Box sx={{ position: 'relative', p: 2, borderBottom: `1px solid ${tw.isDark ? '#333' : '#e5e5e5'}` }}>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Box component="span" sx={{ width: 16, height: 16 }}>
                                        <img 
                                            src="/images/logo-white.png" 
                                            alt="RADS Logo" 
                                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                        />
                                    </Box>
                                    RADS Computer Services
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
                            <Box sx={{ flex: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column' }}>
                                {/* App Info Section */}
                                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexShrink: 0 }}>
                                    {/* App Icon */}
                                    <Box
                                        sx={{
                                            width: 64,
                                            height: 64,
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
                                        <Typography variant="h6" fontWeight={600} gutterBottom noWrap sx={{ fontSize: '1rem' }}>
                                            TDFC Companion App
                                        </Typography>
                                        <Typography variant="body2" color="primary" gutterBottom sx={{ fontSize: '0.85rem' }}>
                                            RADS Computer Services
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Install Button */}
                                <Box
                                    component="button"
                                    onClick={handleInstall}
                                    sx={{
                                        width: '100%',
                                        py: 1.2,
                                        mb: 2,
                                        borderRadius: 2,
                                        border: 'none',
                                        bgcolor: '#01875f',
                                        color: 'white',
                                        fontWeight: 700,
                                        fontSize: '0.8rem',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        flexShrink: 0,
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

                                {/* Screenshots Section - with minimum height */}
                                <Box sx={{ mb: 2, flex: 1, minHeight: 280, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <Box sx={{ 
                                        display: 'flex', 
                                        gap: 1, 
                                        overflowX: 'auto',
                                        pb: 0.5,
                                        '&::-webkit-scrollbar': {
                                            height: 3,
                                        },
                                        '&::-webkit-scrollbar-thumb': {
                                            backgroundColor: tw.isDark ? '#444' : '#ccc',
                                            borderRadius: 2,
                                        },
                                    }}>
                                        {[1, 2, 3, 4].map((i) => {
                                            const screenshotName = tw.isDark 
                                                ? `screenshot-${i}-dark.png`
                                                : `screenshot-${i}-light.png`;
                                            return (
                                                <Box
                                                    key={i}
                                                    sx={{
                                                        width: 130,
                                                        height: 280,
                                                        borderRadius: 1.5,
                                                        overflow: 'hidden',
                                                        flexShrink: 0,
                                                        border: `1px solid ${tw.isDark ? '#333' : '#e5e5e5'}`,
                                                        bgcolor: tw.isDark ? '#2a2a2a' : '#f5f5f5',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <img 
                                                        src={`/images/${screenshotName}`}
                                                        alt={`Screenshot ${i}`}
                                                        style={{ 
                                                            width: '100%', 
                                                            height: '100%', 
                                                            objectFit: 'contain'
                                                        }}
                                                    />
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                </Box>

                                {/* About Section */}
                                <Box sx={{ flexShrink: 0 }}>
                                    <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ fontSize: '0.8rem', mb: 0.5 }}>
                                        About this app
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4, fontSize: '0.75rem' }}>
                                        TDFC Cooperative Financial Management System - Manage your loans, track transactions, 
                                        view amortization schedules, and stay connected with your cooperative.
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </motion.div>
                )}
            </AnimatePresence>
            )}

            {/* Desktop: Modern Card Dialog */}
            {!isMobile && (
            <AnimatePresence>
                {showPrompt && (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ 
                            type: 'spring',
                            damping: 25,
                            stiffness: 300,
                        }}
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 9999,
                        }}
                    >
                        <Paper
                            elevation={8}
                            sx={{
                                width: 700,
                                maxHeight: '90vh',
                                bgcolor: tw.isDark ? '#1f1f1f' : '#ffffff',
                                borderRadius: 3,
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'row',
                            }}
                        >
                            {/* Left Side: Screenshots/Visual */}
                            <Box
                                sx={{
                                    width: '40%',
                                    bgcolor: tw.isDark ? '#2a2a2a' : '#f5f5f5',
                                    p: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 2,
                                    overflow: 'auto',
                                }}
                            >
                                {[1, 2].map((i) => {
                                    const screenshotName = tw.isDark 
                                        ? `screenshot-${i}-dark.png`
                                        : `screenshot-${i}-light.png`;
                                    return (
                                        <Box
                                            key={i}
                                            sx={{
                                                width: '90%',
                                                maxWidth: 160,
                                                aspectRatio: '9/16',
                                                borderRadius: 2,
                                                overflow: 'hidden',
                                                border: `1px solid ${tw.isDark ? '#333' : '#e5e5e5'}`,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <img 
                                                src={`/images/${screenshotName}`}
                                                alt={`Screenshot ${i}`}
                                                style={{ 
                                                    width: '100%', 
                                                    height: '100%', 
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        </Box>
                                    );
                                })}
                            </Box>

                            {/* Right Side: Content */}
                            <Box
                                sx={{
                                    width: '60%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    p: 3,
                                    position: 'relative',
                                }}
                            >
                                {/* Close Button */}
                                <IconButton
                                    size="small"
                                    onClick={handleDismiss}
                                    sx={{
                                        position: 'absolute',
                                        top: 12,
                                        right: 12,
                                        color: 'text.secondary',
                                    }}
                                >
                                    <CloseIcon />
                                </IconButton>

                                {/* Title */}
                                <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mt: 1 }}>
                                    TDFC Companion App
                                </Typography>

                                {/* Publisher */}
                                <Typography variant="body2" color="primary" gutterBottom>
                                    RADS Computer Services
                                </Typography>

                                {/* Description */}
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 3, flex: 1 }}>
                                    Manage your loans, track transactions, view amortization schedules, and stay connected with your cooperative. Access your financial information anytime, anywhere with offline support.
                                </Typography>

                                {/* Buttons */}
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Box
                                        component="button"
                                        onClick={handleInstall}
                                        sx={{
                                            flex: 1,
                                            py: 1.2,
                                            borderRadius: 2,
                                            border: 'none',
                                            bgcolor: '#01875f',
                                            color: 'white',
                                            fontWeight: 700,
                                            fontSize: '0.95rem',
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
                                        Install Now
                                    </Box>
                                    <Box
                                        component="button"
                                        onClick={handleRemindLater}
                                        sx={{
                                            flex: 1,
                                            py: 1.2,
                                            borderRadius: 2,
                                            border: `1px solid ${tw.isDark ? '#333' : '#e5e5e5'}`,
                                            bgcolor: 'transparent',
                                            color: tw.isDark ? '#fff' : '#000',
                                            fontWeight: 600,
                                            fontSize: '0.95rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                bgcolor: tw.isDark ? '#2a2a2a' : '#f5f5f5',
                                            },
                                        }}
                                    >
                                        Remind Later
                                    </Box>
                                </Box>
                            </Box>
                        </Paper>
                    </motion.div>
                )}
            </AnimatePresence>
            )}
        </>
    );
};

export default PWAInstallPrompt;
