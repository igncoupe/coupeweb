importScripts('/scram/scramjet.all.js');
const { ScramjetServiceWorker } = $scramjetLoadWorker();
const proxy = new ScramjetServiceWorker();
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => event.respondWith((async () => {
  await proxy.loadConfig();
  return proxy.route(event) ? proxy.fetch(event) : fetch(event.request);
})()));
