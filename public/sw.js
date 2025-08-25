// Service Worker for Portfolio PWA
const CACHE_NAME = 'edikan-portfolio-v1'
const STATIC_CACHE_NAME = 'static-v1'
const DYNAMIC_CACHE_NAME = 'dynamic-v1'

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/projects',
  '/blog',
  '/case-studies',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add critical CSS and JS files here when identified
]

// Resources that should be cached dynamically
const CACHEABLE_PATHS = [
  '/blog/',
  '/project/',
  '/case-study/',
  '/api/search'
]

// Resources that should never be cached
const NEVER_CACHE = [
  '/admin',
  '/api/admin',
  '/api/contact',
  '/api/auth'
]

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('Service Worker: Installed successfully')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Service Worker: Installation failed', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker: Activated successfully')
        return self.clients.claim()
      })
  )
})

// Fetch event - handle requests with caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip cross-origin requests and chrome extensions
  if (url.origin !== location.origin || url.protocol === 'chrome-extension:') {
    return
  }
  
  // Never cache admin or auth routes
  if (NEVER_CACHE.some(path => url.pathname.startsWith(path))) {
    return fetch(request)
  }
  
  // Handle different types of requests
  if (request.method === 'GET') {
    // Static assets - Cache First strategy
    if (isStaticAsset(url.pathname)) {
      event.respondWith(cacheFirstStrategy(request))
    }
    // API requests - Network First strategy  
    else if (url.pathname.startsWith('/api/')) {
      event.respondWith(networkFirstStrategy(request))
    }
    // Pages - Network First with fallback
    else {
      event.respondWith(pageStrategy(request))
    }
  }
})

// Cache First Strategy - for static assets
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.error('Cache First Strategy failed:', error)
    return new Response('Offline content not available', { 
      status: 503, 
      statusText: 'Service Unavailable' 
    })
  }
}

// Network First Strategy - for API and dynamic content
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Network request failed, trying cache:', request.url)
    
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    return new Response(JSON.stringify({
      error: 'Offline - content not available',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Page Strategy - for HTML pages
async function pageStrategy(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Network request failed for page, trying cache:', request.url)
    
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline fallback page
    const offlinePage = await caches.match('/')
    if (offlinePage) {
      return offlinePage
    }
    
    return new Response(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offline - Edikan Udoibuot Portfolio</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
            background-color: #f8fafc;
            color: #334155;
            text-align: center;
            padding: 2rem;
          }
          .offline-icon {
            width: 80px;
            height: 80px;
            background-color: #e2e8f0;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 2rem;
            font-size: 2rem;
          }
          h1 { margin-bottom: 1rem; }
          p { margin-bottom: 2rem; max-width: 400px; line-height: 1.5; }
          button {
            background-color: #3b82f6;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            cursor: pointer;
            font-size: 1rem;
          }
          button:hover { background-color: #2563eb; }
        </style>
      </head>
      <body>
        <div class="offline-icon">📡</div>
        <h1>You're Offline</h1>
        <p>This page isn't available offline. Please check your internet connection and try again.</p>
        <button onclick="window.location.reload()">Try Again</button>
      </body>
      </html>
    `, {
      status: 503,
      headers: { 'Content-Type': 'text/html' }
    })
  }
}

// Helper function to determine if a path is a static asset
function isStaticAsset(pathname) {
  const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot']
  return staticExtensions.some(ext => pathname.endsWith(ext)) || pathname.startsWith('/_next/static')
}

// Background sync for form submissions (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'contact-form-sync') {
    event.waitUntil(syncContactForm())
  }
})

async function syncContactForm() {
  // Implementation for syncing offline form submissions
  console.log('Syncing contact form submissions...')
}

// Push notification handler (future enhancement)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Update',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('Edikan Portfolio Update', options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

console.log('Service Worker: Script loaded successfully')