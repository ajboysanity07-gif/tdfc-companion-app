// Simple service worker for PWA installability
const CACHE_NAME = 'tdfc-v1';

self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Let all requests pass through (no caching for now)
  event.respondWith(fetch(event.request));
});
