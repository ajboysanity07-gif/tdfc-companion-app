import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMyTheme } from '@/hooks/use-mytheme';
import { useMediaQuery } from '@/hooks/use-media-query';

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
    const isMobile = useMediaQuery('(max-width: 768px)');

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
                        <div
                            className="w-full max-w-full rounded-t-3xl overflow-hidden max-h-screen flex flex-col"
                            style={{
                                backgroundColor: tw.isDark ? '#1f1f1f' : '#ffffff',
                            }}
                        >
                            {/* Header with close button */}
                            <div 
                                className="relative p-2 border-b"
                                style={{
                                    borderColor: tw.isDark ? '#333' : '#e5e5e5',
                                }}
                            >
                                <div className="flex items-center gap-0.5 text-xs text-gray-600">
                                    <div className="w-4 h-4">
                                        <img 
                                            src="/images/logo-white.png" 
                                            alt="RADS Logo" 
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    RADS Computer Services
                                </div>
                                <button
                                    onClick={handleDismiss}
                                    className="absolute top-2 right-2 p-1 text-gray-600 hover:bg-gray-100 rounded"
                                    style={{
                                        backgroundColor: tw.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                    }}
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Scrollable content */}
                            <div className="flex-1 overflow-auto p-2 flex flex-col">
                                {/* App Info Section */}
                                <div className="flex gap-2 mb-2">
                                    {/* App Icon */}
                                    <div
                                        className="w-16 h-16 rounded shrink-0 overflow-hidden border flex items-center justify-center"
                                        style={{
                                            borderColor: tw.isDark ? '#333' : '#e5e5e5',
                                        }}
                                    >
                                        <img 
                                            src="/images/tdfc-icon.png" 
                                            alt="TDFC App" 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* App Name & Publisher */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-base truncate mb-1">
                                            TDFC Companion App
                                        </h3>
                                        <p className="text-xs font-semibold" style={{ color: '#01875f' }}>
                                            RADS Computer Services
                                        </p>
                                    </div>
                                </div>

                                {/* Install Button */}
                                <button
                                    onClick={handleInstall}
                                    className="w-full py-3 mb-2 rounded font-bold text-sm cursor-pointer transition-all shrink-0 hover:opacity-90 active:scale-95"
                                    style={{
                                        backgroundColor: '#01875f',
                                        color: 'white',
                                    }}
                                >
                                    Install
                                </button>

                                {/* Screenshots Section - with minimum height */}
                                <div className="mb-2 flex-1 min-h-72 flex flex-col justify-center">
                                    <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-thin scrollbar-thumb-gray-400">
                                        {[1, 2, 3, 4].map((i) => {
                                            const screenshotName = tw.isDark 
                                                ? `screenshot-${i}-dark.png`
                                                : `screenshot-${i}-light.png`;
                                            return (
                                                <div
                                                    key={i}
                                                    className="w-32 h-72 rounded border shrink-0 overflow-hidden flex items-center justify-center"
                                                    style={{
                                                        backgroundColor: tw.isDark ? '#2a2a2a' : '#f5f5f5',
                                                        borderColor: tw.isDark ? '#333' : '#e5e5e5',
                                                    }}
                                                >
                                                    <img 
                                                        src={`/images/${screenshotName}`}
                                                        alt={`Screenshot ${i}`}
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* About Section */}
                                <div className="shrink-0">
                                    <h4 className="font-bold text-xs mb-0.5">
                                        About this app
                                    </h4>
                                    <p className="text-xs leading-relaxed opacity-70">
                                        TDFC Cooperative Financial Management System - Manage your loans, track transactions, 
                                        view amortization schedules, and stay connected with your cooperative.
                                    </p>
                                </div>
                            </div>
                        </div>
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
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 9999,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <div
                            className="w-full max-w-3xl h-96 rounded-lg overflow-hidden flex flex-row shadow-2xl"
                            style={{
                                backgroundColor: tw.isDark ? '#1f1f1f' : '#ffffff',
                            }}
                        >
                            {/* Left Side: Screenshots/Visual */}
                            <div
                                className="w-5/12 p-2 flex flex-col items-center justify-center gap-2 overflow-auto"
                                style={{
                                    backgroundColor: tw.isDark ? '#2a2a2a' : '#f5f5f5',
                                }}
                            >
                                {[1, 2].map((i) => {
                                    const screenshotName = tw.isDark 
                                        ? `screenshot-${i}-dark.png`
                                        : `screenshot-${i}-light.png`;
                                    return (
                                        <div
                                            key={i}
                                            className="w-32 h-64 rounded-lg border overflow-hidden flex items-center justify-center"
                                            style={{
                                                borderColor: tw.isDark ? '#333' : '#e5e5e5',
                                                backgroundColor: tw.isDark ? '#1f1f1f' : '#ffffff',
                                            }}
                                        >
                                            <img 
                                                src={`/images/${screenshotName}`}
                                                alt={`Screenshot ${i}`}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Right Side: Content */}
                            <div
                                className="w-7/12 flex flex-col p-6 relative overflow-auto"
                            >
                                {/* Close Button */}
                                <button
                                    onClick={handleDismiss}
                                    className="absolute top-3 right-3 p-1 text-gray-600 hover:bg-gray-100 rounded"
                                    style={{
                                        backgroundColor: tw.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                    }}
                                >
                                    <X size={18} />
                                </button>

                                {/* Title */}
                                <h2 className="text-2xl font-bold mb-1 mt-1">
                                    TDFC Companion App
                                </h2>

                                {/* Publisher */}
                                <p className="text-sm font-semibold mb-3" style={{ color: '#01875f' }}>
                                    RADS Computer Services
                                </p>

                                {/* Description */}
                                <p className="text-sm leading-relaxed mb-4 flex-1 opacity-80">
                                    Manage your loans, track transactions, view amortization schedules, and stay connected with your cooperative. Access your financial information anytime, anywhere with offline support.
                                </p>

                                {/* Buttons */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleInstall}
                                        className="flex-1 py-3 rounded font-bold text-sm cursor-pointer transition-all hover:opacity-90 active:scale-95"
                                        style={{
                                            backgroundColor: '#01875f',
                                            color: 'white',
                                        }}
                                    >
                                        Install Now
                                    </button>
                                    <button
                                        onClick={handleRemindLater}
                                        className="flex-1 py-3 rounded font-semibold text-sm cursor-pointer transition-all border hover:opacity-80 active:scale-95"
                                        style={{
                                            borderColor: tw.isDark ? '#333' : '#e5e5e5',
                                            color: tw.isDark ? '#fff' : '#000',
                                        }}
                                    >
                                        Remind Later
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            )}
        </>
    );
};

export default PWAInstallPrompt;
