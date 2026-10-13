const CACHE_NAME = 'roleplay-cache-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './icon-192.png',
  './icon-512.png',
  './manifest-chat.json'
];

self.addEventListener('install', event => {
  console.log('SW 安装中...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // 注意：安装时不再强制跳过等待，而是等用户点击更新
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

// 网络优先，失败才用缓存（确保用户尽量拿到最新内容）
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) {
    return;
  }
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

// 监听来自主线程的“跳过等待”指令
self.addEventListener('message', event => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
