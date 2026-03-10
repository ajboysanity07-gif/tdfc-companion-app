import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { initializeTheme, AppearanceProvider } from './hooks/use-appearance';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import axios from 'axios'; // ✅ Import axios

axios.defaults.withCredentials = true; // ✅ Always send credentials/cookies

const appName = import.meta.env.VITE_APP_NAME || 'TDFC Companion App';

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

const cleanupStaleServiceWorkers = async () => {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    const scriptPatterns = [/\/sw\.js$/i, /workbox/i, /precache/i, /vite-pwa/i];

    await Promise.all(
      registrations.map(async (registration) => {
        const scriptUrl =
          registration.active?.scriptURL ??
          registration.waiting?.scriptURL ??
          registration.installing?.scriptURL ??
          '';

        if (scriptUrl && scriptPatterns.some((pattern) => pattern.test(scriptUrl))) {
          await registration.unregister();
        }
      })
    );

    if (!('caches' in window)) {
      return;
    }

    const cacheNames = await caches.keys();
    const cachePatterns = [/workbox/i, /precache/i, /vite-pwa/i, /sw/i];
    const cacheTargets = cacheNames.filter((name) => cachePatterns.some((pattern) => pattern.test(name)));

    await Promise.all(cacheTargets.map((name) => caches.delete(name)));
  } catch {
    return;
  }
};

createInertiaApp({
  title: (title) => title ? `${title} - ${appName}` : appName,

  resolve: (name) => {
    const pages = {
      ...import.meta.glob('./Pages/**/*.tsx', { eager: true }),
      ...import.meta.glob('./pages/**/*.tsx', { eager: true }),
      ...import.meta.glob('./Pages/**/*.jsx', { eager: true }),
      ...import.meta.glob('./pages/**/*.jsx', { eager: true }),
    };
    const page =
      pages[`./Pages/${name}.tsx`] ??
      pages[`./pages/${name}.tsx`] ??
      pages[`./Pages/${name}.jsx`] ??
      pages[`./pages/${name}.jsx`];

    if (!page) throw new Error(`Inertia page not found: ${name}`);
    return page;
  },

  setup({ el, App, props }) {
    cleanupStaleServiceWorkers();
    // ✅ Call Sanctum's CSRF endpoint once when the SPA mounts
    axios.get('/sanctum/csrf-cookie');

    const root = createRoot(el);

    root.render(
      <QueryClientProvider client={queryClient}>
        <AppearanceProvider>
          <App {...props} />
          {/* {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />} */}
        </AppearanceProvider>
      </QueryClientProvider>
    );
  },

  progress: {
    color: '#4B5563',
  },
});

// This will set light / dark mode on load...
initializeTheme();
