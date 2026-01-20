import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        host: '0.0.0.0',
        port: 5173,
        hmr: {
            host: '192.168.1.6',
        },
    },
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    esbuild: {
        jsx: 'automatic',
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'resources/js'),
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
        },
    },
    build: {
        chunkSizeWarningLimit: 2500,
        rollupOptions: {
            output: {
                manualChunks: {
                    // Split MUI into separate chunks
                    'mui-core': ['@mui/material', '@mui/system', '@emotion/react', '@emotion/styled'],
                    'mui-icons': ['@mui/icons-material'],
                    'mui-datagrid': ['@mui/x-data-grid'],
                    // Split large libraries
                    'excel': ['exceljs'],
                    'pdf': ['jspdf', 'jspdf-autotable'],
                    // React and core dependencies
                    'react-vendor': ['react', 'react-dom', 'react/jsx-runtime'],
                    'router': ['@inertiajs/react'],
                },
            },
        },
    },
});
