importScripts('./scram/scramjet.all.js');
const { ScramjetServiceWorker } = $scramjetLoadWorker();
const proxy = new ScramjetServiceWorker();
// scripts/build.js replaces 'dev' with a content hash, which turns on offline caching of the app shell.
const VERSION = 'dev';
const CACHE = `coupeweb-${VERSION}`;
const SHELL = ['./', 'index.html', 'style.css', 'app.js', 'navigation.js', 'config.js', 'icon.svg',
  'scram/scramjet.all.js', 'scram/scramjet.wasm.wasm', 'scram/scramjet.sync.js',
  'baremux/index.js', 'baremux/worker.js', 'libcurl/index.mjs'];
self.addEventListener('install', event => {
  self.skipWaiting();
  if (VERSION !== 'dev') event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)));
});
self.addEventListener('activate', event => event.waitUntil((async () => {
  for (const key of await caches.keys()) if (key.startsWith('coupeweb-') && key !== CACHE) await caches.delete(key);
  await self.clients.claim();
})()));
async function handle(event) {
  // The page stores Scramjet's config before it proxies anything; until then nothing here is a proxy request.
  if (!proxy.config) await proxy.loadConfig();
  if (proxy.config && proxy.route(event)) return proxy.fetch(event);
  if (VERSION !== 'dev' && event.request.method === 'GET') {
    const cached = await caches.match(event.request, { ignoreSearch: true });
    if (cached) return cached;
  }
  return fetch(event.request);
}
self.addEventListener('fetch', event => {
  if (new URL(event.request.url).origin === location.origin) event.respondWith(handle(event));
});
