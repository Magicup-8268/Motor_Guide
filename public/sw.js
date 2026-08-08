const CACHE = 'magicup-work-flow-shell-v4'
// sw.js가 배포되는 위치(루트 `/` 또는 GitHub Pages 하위 경로 `/Motor_Guide/`)를 스스로 계산해
// 어느 base 경로에서 서비스워커가 등록되어도 올바른 파일을 캐시하도록 한다.
const BASE = new URL('.', self.location.href).pathname
const APP_SHELL = [BASE, `${BASE}index.html`, `${BASE}magicup-logo.svg`, `${BASE}motor-atlas-mark.svg`, `${BASE}manifest.webmanifest`]

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
  const shellIndex = `${BASE}index.html`
  try {
    const response = await fetch(request)
    if (response.ok) cache.put(shellIndex, response.clone())
    return response
  } catch {
    return (await cache.match(request)) || (await cache.match(shellIndex)) || Response.error()
  }
}
