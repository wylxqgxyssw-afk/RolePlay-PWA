const CACHE_NAME = 'roleplay-cache-v4';

self.addEventListener('install', event => {
  console.log('SW 安装中...');
  // 不再强制预缓存，防止因为某一个图片加载失败导致整个 SW 安装崩溃
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    clients.claim().then(() => {
      return caches.keys().then(keys => {
        return Promise.all(
          keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
        );
      });
    })
  );
});

self.addEventListener('fetch', event => {
  // 只处理同源 GET 请求，避免拦截 CDN 或 API 请求
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) {
    return;
  }
  // 网络优先，失败才用缓存
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
