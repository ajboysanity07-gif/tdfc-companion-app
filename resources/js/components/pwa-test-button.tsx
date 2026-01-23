import React, { useEffect, useState } from 'react';
import { Button, Box } from '@mui/material';
import InstallMobileIcon from '@mui/icons-material/InstallMobile';

// Temporary debug component - remove after testing
const PWATestButton: React.FC = () => {
    const [canInstall, setCanInstall] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => {
        console.log(msg);
        setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);
    };

    useEffect(() => {
        addLog('[TEST] Component mounted');
        
        const handler = (e: Event) => {
            e.preventDefault();
            addLog('[TEST] beforeinstallprompt fired!');
            setCanInstall(true);
            (window as any).__pwaPrompt = e;
        };

        window.addEventListener('beforeinstallprompt', handler);
        addLog('[TEST] Listening for beforeinstallprompt...');

        // Check current state
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(() => {
                addLog('[TEST] Service Worker is ready');
            });
        }

        if (window.matchMedia('(display-mode: standalone)').matches) {
            addLog('[TEST] App is running in standalone mode (already installed)');
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const testInstall = async () => {
        const prompt = (window as any).__pwaPrompt;
        if (!prompt) {
            addLog('[TEST] No install prompt available');
            alert('PWA Install not available. Check console for details.\n\nCommon issues:\n1. Not using HTTPS\n2. Service worker not registered\n3. App already installed\n4. Browser doesn\'t support PWA');
            return;
        }

        addLog('[TEST] Triggering install prompt');
        await prompt.prompt();
        const result = await prompt.userChoice;
        addLog(`[TEST] User choice: ${result.outcome}`);
    };

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 70,
                right: 20,
                zIndex: 9999,
                bgcolor: 'background.paper',
                p: 2,
                borderRadius: 2,
                boxShadow: 3,
                maxWidth: 300,
            }}
        >
            <Button
                variant="contained"
                size="small"
                onClick={testInstall}
                startIcon={<InstallMobileIcon />}
                disabled={!canInstall}
                fullWidth
                sx={{ mb: 1 }}
            >
                Test PWA Install
            </Button>
            <Box sx={{ fontSize: '0.7rem', maxHeight: 200, overflow: 'auto' }}>
                {logs.map((log, i) => (
                    <div key={i}>{log}</div>
                ))}
            </Box>
        </Box>
    );
};

export default PWATestButton;
