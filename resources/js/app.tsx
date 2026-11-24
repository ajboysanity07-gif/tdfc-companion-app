import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { MotionConfig } from 'framer-motion';
import { createRoot } from 'react-dom/client';
import MuiThemeWrapper from './components/mui-theme-wrapper';
import { AppearanceProvider, initializeTheme } from './hooks/use-appearance'; // ✅ Import AppearanceProvider

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            retry: 2,
            refetchOnWindowFocus: false,
        },
    },
});

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),

    resolve: (name) => {
        const pages = {
            ...import.meta.glob('./Pages/**/*.tsx', { eager: true }),
            ...import.meta.glob('./pages/**/*.tsx', { eager: true }),
            ...import.meta.glob('./Pages/**/*.jsx', { eager: true }),
            ...import.meta.glob('./pages/**/*.jsx', { eager: true }),
        };
        const page = pages[`./Pages/${name}.tsx`] ?? pages[`./pages/${name}.tsx`] ?? pages[`./Pages/${name}.jsx`] ?? pages[`./pages/${name}.jsx`];

        if (!page) throw new Error(`Inertia page not found: ${name}`);
        return page;
    },

    setup({ el, App, props }) {
        const root = createRoot(el);

        // ✅ Wrap with AppearanceProvider at the very top!
        root.render(
            <QueryClientProvider client={queryClient}>
                <AppearanceProvider>
                    <MuiThemeWrapper>
                        <MotionConfig reducedMotion="user">
                            <App {...props} />
                        </MotionConfig>
                        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
                    </MuiThemeWrapper>
                </AppearanceProvider>
            </QueryClientProvider>,
        );
    },

    progress: {
        color: 'var(--brand-red)',
    },
});

// This will set light / dark mode on load...
initializeTheme();
