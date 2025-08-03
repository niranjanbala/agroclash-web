// AgroClash Service Worker
const CACHE_NAME = 'agroclash-v1.0.0'
const STATIC_CACHE = 'agroclash-static-v1.0.0'
const DYNAMIC_CACHE = 'agroclash-dynamic-v1.0.0'
const API_CACHE = 'agroclash-api-v1.0.0'

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/dashboard',
  '/plots',
  '/crops',
  '/weather',
  '/marketplace',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/user/profile',
  '/api/plots',
  '/api/crops',
  '/api/weather/current',
  '/api/market/prices'
]

// Network-first resources (always try network first)
const NETWORK_FIRST = [
  '/api/weather/',
  '/api/market/',
  '/api/notifications/'
]

// Cache-first resources (try cache first)
const CACHE_FIRST = [
  '/static/',
  '/icons/',
  '/images/',
  '/_next/static/'
]

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    Promise.all([
      // Cache static files
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('Service Worker: Caching static files')
        return cache.addAll(STATIC_FILES)
      }),
      
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('Service Worker: Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      }),
      
      // Take control of all clients
      self.clients.claim()
    ])
  )
})

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return
  }
  
  event.respondWith(handleFetch(request))
})

async function handleFetch(request) {
  const url = new URL(request.url)
  
  try {
    // API requests
    if (url.pathname.startsWith('/api/')) {
      return await handleAPIRequest(request)
    }
    
    // Static assets (cache first)
    if (CACHE_FIRST.some(pattern => url.pathname.startsWith(pattern))) {
      return await cacheFirst(request)
    }
    
    // Network first for dynamic content
    if (NETWORK_FIRST.some(pattern => url.pathname.includes(pattern))) {
      return await networkFirst(request)
    }
    
    // Default: Network first with cache fallback
    return await networkFirst(request)
    
  } catch (error) {
    console.error('Service Worker: Fetch error:', error)
    return await handleOffline(request)
  }
}

// Cache first strategy
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    // Update cache in background
    updateCache(request)
    return cachedResponse
  }
  
  // Not in cache, fetch from network
  const networkResponse = await fetch(request)
  
  if (networkResponse.ok) {
    const cache = await caches.open(STATIC_CACHE)
    cache.put(request, networkResponse.clone())
  }
  
  return networkResponse
}

// Network first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
    
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    throw error
  }
}

// Handle API requests with special caching
async function handleAPIRequest(request) {
  const url = new URL(request.url)
  
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Cache API responses
      const cache = await caches.open(API_CACHE)
      
      // Add timestamp to cached API responses
      const responseData = await networkResponse.clone().json()
      const timestampedResponse = new Response(
        JSON.stringify({
          ...responseData,
          _cached: Date.now(),
          _ttl: getTTL(url.pathname)
        }),
        {
          status: networkResponse.status,
          statusText: networkResponse.statusText,
          headers: networkResponse.headers
        }
      )
      
      cache.put(request, timestampedResponse)
    }
    
    return networkResponse
    
  } catch (error) {
    // Network failed, try cached API response
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse) {
      const data = await cachedResponse.json()
      
      // Check if cached data is still valid
      if (data._cached && data._ttl) {
        const age = Date.now() - data._cached
        if (age < data._ttl) {
          return cachedResponse
        }
      }
    }
    
    throw error
  }
}

// Get TTL (time to live) for different API endpoints
function getTTL(pathname) {
  if (pathname.includes('/weather/')) return 10 * 60 * 1000 // 10 minutes
  if (pathname.includes('/market/')) return 30 * 60 * 1000 // 30 minutes
  if (pathname.includes('/user/')) return 60 * 60 * 1000 // 1 hour
  return 5 * 60 * 1000 // 5 minutes default
}

// Update cache in background
async function updateCache(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse)
    }
  } catch (error) {
    // Ignore background update errors
    console.log('Service Worker: Background update failed:', error)
  }
}

// Handle offline scenarios
async function handleOffline(request) {
  const url = new URL(request.url)
  
  // Try to find cached version
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }
  
  // For navigation requests, return offline page
  if (request.mode === 'navigate') {
    const offlineResponse = await caches.match('/offline')
    if (offlineResponse) {
      return offlineResponse
    }
  }
  
  // For API requests, return offline data structure
  if (url.pathname.startsWith('/api/')) {
    return new Response(
      JSON.stringify({
        error: 'offline',
        message: 'You are currently offline. Please check your connection.',
        offline: true
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
  
  // Default offline response
  return new Response(
    'You are currently offline. Please check your connection.',
    {
      status: 503,
      statusText: 'Service Unavailable',
      headers: {
        'Content-Type': 'text/plain'
      }
    }
  )
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered:', event.tag)
  
  if (event.tag === 'sync-offline-actions') {
    event.waitUntil(syncOfflineActions())
  }
})

async function syncOfflineActions() {
  try {
    // Get offline actions from IndexedDB or cache
    const offlineActions = await getOfflineActions()
    
    for (const action of offlineActions) {
      try {
        await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body
        })
        
        // Remove successful action
        await removeOfflineAction(action.id)
        
      } catch (error) {
        console.log('Service Worker: Failed to sync action:', action.id, error)
      }
    }
    
  } catch (error) {
    console.error('Service Worker: Background sync failed:', error)
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received')
  
  const options = {
    body: 'You have new updates in AgroClash!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icons/action-open.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/action-dismiss.png'
      }
    ]
  }
  
  if (event.data) {
    try {
      const payload = event.data.json()
      options.body = payload.body || options.body
      options.data = payload.data || options.data
    } catch (error) {
      console.log('Service Worker: Invalid push payload:', error)
    }
  }
  
  event.waitUntil(
    self.registration.showNotification('AgroClash', options)
  )
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked:', event.action)
  
  event.notification.close()
  
  if (event.action === 'dismiss') {
    return
  }
  
  const url = event.notification.data?.url || '/'
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus()
        }
      }
      
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
})

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.addAll(event.data.urls)
      })
    )
  }
})

// Utility functions for offline actions (would integrate with IndexedDB)
async function getOfflineActions() {
  // This would typically read from IndexedDB
  // For now, return empty array
  return []
}

async function removeOfflineAction(actionId) {
  // This would typically remove from IndexedDB
  console.log('Service Worker: Removing offline action:', actionId)
}

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('Service Worker: Periodic sync triggered:', event.tag)
  
  if (event.tag === 'sync-data') {
    event.waitUntil(syncPeriodicData())
  }
})

async function syncPeriodicData() {
  try {
    // Sync critical data in background
    await fetch('/api/sync/critical')
    console.log('Service Worker: Periodic sync completed')
  } catch (error) {
    console.log('Service Worker: Periodic sync failed:', error)
  }
}

console.log('Service Worker: Loaded successfully')