/* ================================================================
  望舒塔罗 v2 — sw.js
  PWA Service Worker：离线缓存核心资源
  ================================================================ */

const CACHE_NAME = 'wangshu-tarot-v2-v1';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './cards.js',
  './app.js',
  './manifest.json'
  // 注意：icon 文件需要你手动放到 assets/ 目录
  // './assets/icon-192.png',
  // './assets/icon-512.png'
];

// 安装阶段：预缓存核心资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] 预缓存核心资源');
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 激活阶段：清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('[SW] 删除旧缓存:', k);
          return caches.delete(k);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 拦截请求：优先用缓存，回退到网络
self.addEventListener('fetch', event => {
  // 只对同源请求做缓存优先
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          // 后台同步更新缓存（stale-while-revalidate）
          fetcher(event.request);
          return cachedResponse;
        }
        return fetcher(event.request);
      }).catch(() => fetch(event.request))
    );
  }
});

function fetcher(request) {
  return fetch(request).then(response => {
    if (response && response.status === 200 && response.type === 'basic') {
      const responseClone = response.clone();
      caches.open(CACHE_NAME).then(cache => {
        cache.put(request, responseClone);
      });
    }
    return response;
  }).catch(() => {
    // 离线且缓存里没有：返回离线提示页（可选）
    return caches.match('./index.html');
  });
}
