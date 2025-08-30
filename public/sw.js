// Service Worker for The Robot Overlord
// Implements caching strategies for better performance

const CACHE_NAME = 'robot-overlord-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/_next/static/css/',
  '/_next/static/js/',
  '/images/logo.svg',
  '/images/overlord-icon.png'
];

// API endpoints to cache with different strategies
const API_CACHE_PATTERNS = [
  /^\/api\/posts/,
  /^\/api\/topics/,
  /^\/api\/users/,
  /^\/api\/stats/
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests with appropriate strategies
  if (url.pathname.startsWith('/_next/static/')) {
    // Static assets - Cache First
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
    // API requests - Stale While Revalidate
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
  } else if (url.pathname.startsWith('/images/')) {
    // Images - Cache First with fallback
    event.respondWith(cacheFirstWithFallback(request, STATIC_CACHE));
  } else if (url.pathname === '/' || url.pathname.startsWith('/feed') || url.pathname.startsWith('/admin')) {
    // Pages - Network First with cache fallback
    event.respondWith(networkFirstWithCache(request, DYNAMIC_CACHE));
  } else {
    // Everything else - Network First
    event.respondWith(networkFirst(request));
  }
});

// Cache First Strategy
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache First strategy failed:', error);
    return new Response('Network error', { status: 408 });
  }
}

// Network First Strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.error('Network First strategy failed:', error);
    return new Response('Network error', { status: 408 });
  }
}

// Network First with Cache Fallback
async function networkFirstWithCache(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('Content not available offline', { 
      status: 503,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Return cached response if network fails
    return cachedResponse;
  });
  
  // Return cached response immediately if available, otherwise wait for network
  return cachedResponse || fetchPromise;
}

// Cache First with Fallback
async function cacheFirstWithFallback(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    // Return fallback image for failed image requests
    return cache.match('/images/placeholder.svg') || networkResponse;
  } catch (error) {
    const cache = await caches.open(cacheName);
    return cache.match('/images/placeholder.svg') || new Response('Image not available', { status: 404 });
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle offline actions when back online
  console.log('Background sync triggered');
}

// Push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/images/overlord-icon.png',
      badge: '/images/badge.png',
      tag: data.tag || 'default',
      requireInteraction: data.requireInteraction || false,
      actions: data.actions || []
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action) {
    // Handle action clicks
    console.log('Notification action clicked:', event.action);
  } else {
    // Handle notification click
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE)
        .then((cache) => {
          return cache.addAll(event.data.urls);
        })
    );
  }
});
