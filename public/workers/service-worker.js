// Simple placeholder service worker for PWA/service worker related tasks
self.addEventListener('install', (event) => {
  console.log('[SW] install')
  self.skipWaiting()
})
self.addEventListener('activate', (event) => {
  console.log('[SW] activate')
})
