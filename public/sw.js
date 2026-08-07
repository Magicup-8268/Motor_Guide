const CACHE = 'magicup-work-flow-shell-v4'
const APP_SHELL = ['/', '/index.html', '/magicup-logo.svg', '/motor-atlas-mark.svg', '/manifest.webmanifest']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
    ),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  const requestUrl = new URL(event.request.url)
  if (requestUrl.origin !== self.location.origin || requestUrl.pathname.startsWith('/api/')) return

  const isDevelopmentAsset = requestUrl.pathname.startsWith('/src/')
    || requestUrl.pathname.startsWith('/@vite')
    || requestUrl.pathname.startsWith('/@react-refresh')
    || requestUrl.pathname.startsWith('/node_modules/')
  if (isDevelopmentAsset) return

  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(event.request))
    return
  }

  event.respondWith(cacheFirstAsset(event.request))
})

async function cacheFirstAsset(request) {
  const cache = await caches.open(CACHE)
  const cached = await cache.match(request)
  if (cached) return cached

  const response = await fetch(request)
  if (response.ok) cache.put(request, response.clone())
  return response
}

async function networkFirstNavigation(request) {
  const cache = await caches.open(CACHE)
  try {
    const response = await fetch(request)
    if (response.ok) cache.put('/index.html', response.clone())
    return response
  } catch {
    return (await cache.match(request)) || (await cache.match('/index.html')) || Response.error()
  }
}
