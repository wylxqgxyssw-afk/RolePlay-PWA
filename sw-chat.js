// sw-chat.js

// 【极其重要】每次更新前端代码（index.html），必须把这里的 v1.0.1 改成 v1.0.2、v1.0.3...
// 必须与 index.html 里的 CURRENT_VERSION 保持一致！
const CACHE_NAME = 'roleplay-cache-v1.0.2'; 

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
  // 注意：这里不直接调用 self.skipWaiting()，而是等待前端发送指令，确保平滑过渡
});

self.addEventListener('activate', event => {
  console.log('SW 激活中，清理旧缓存...');
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
  // 只处理同源的 GET 请求
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) {
    return;
  }
  event.respondWith(
    // 网络优先策略：优先去服务器拉最新代码，断网了才用缓存
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});

// 接收前端 index.html 发来的 skipWaiting 指令
self.addEventListener('message', event => {
  if (event.data && event.data.action === 'skipWaiting') {
    console.log('收到前端指令，立即跳过等待接管页面...');
    self.skipWaiting();
  }
});
