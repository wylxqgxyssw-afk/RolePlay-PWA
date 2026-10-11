const CACHE_NAME = 'roleplay-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './icon-192.png',
  './icon-512.png',
  './manifest-chat.json'
];

self.addEventListener('install', event => {
  console.log('SW 安装');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // 立即激活
});

self.addEventListener('activate', event => {
  event.waitUntil(
    clients.claim().then(() => {
      // 清理旧缓存
      return caches.keys().then(keys => {
        return Promise.all(
          keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
        );
      });
    })
  );
});

// 网络优先，失败才用缓存
self.addEventListener('fetch', event => {
  // ⚠️ 关键修改：只处理同源的 GET 请求，避免拦截 Supabase API 或聊天 API
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) {
    return;
  }
  
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
