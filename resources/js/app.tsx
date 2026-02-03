import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { initializeTheme, AppearanceProvider } from './hooks/use-appearance';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import axios from 'axios'; // ✅ Import axios

axios.defaults.withCredentials = true; // ✅ Always send credentials/cookies

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
