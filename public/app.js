import { destination } from './navigation.js';
import { relay as defaultRelay } from './config.js';
const $ = id => document.getElementById(id);
// Every path is relative to this file, so the app works at the site root and under a GitHub Pages /repo/ path.
const base = new URL('./', import.meta.url);
const path = file => new URL(file, base).pathname;
let controller, connection, frame, timeout;
function status(text) { $('status').textContent = text; }
function fail(error) { clearTimeout(timeout); $('progress').hidden = true; $('error').textContent = error.message || String(error); $('error').hidden = false; status('Needs attention'); }
function loading() { $('error').hidden = true; $('progress').hidden = false; status('Loading page…'); clearTimeout(timeout); timeout = setTimeout(() => { $('progress').hidden = true; status('Still waiting'); $('error').textContent = 'This page is taking a while. Try reloading or opening another website.'; $('error').hidden = false; }, 30000); }
function showHome() { frame?.frame.remove(); frame = null; clearTimeout(timeout); $('progress').hidden = true; $('viewport').hidden = true; $('welcome').hidden = false; $('address').value = ''; $('error').hidden = true; for (const id of ['back','forward','reload']) $(id).disabled = true; status('Proxy ready'); $('address').focus(); }
function savedRelay() { try { return localStorage.getItem('coupeweb-relay') || defaultRelay; } catch { return defaultRelay; } }
async function navigate(input) {
  try {
    const url = destination(input);
    $('address').value = url; $('welcome').hidden = true; $('viewport').hidden = false;
    loading();
    await ready;
    if (!frame) {
      frame = controller.createFrame();
      frame.frame.title = 'Proxied website';
      frame.frame.allow = 'fullscreen; autoplay; encrypted-media; picture-in-picture; clipboard-write';
      frame.addEventListener('urlchange', event => { $('address').value = event.url; });
      frame.addEventListener('navigate', () => loading());
      frame.frame.addEventListener('load', () => {
        clearTimeout(timeout); $('progress').hidden = true;
        try {
          const doc = frame.frame.contentDocument;
          if (doc?.getElementById('errorTitle') && doc?.getElementById('errorTrace')) {
            fail(new Error('The proxy could not load this website. Try reloading or another address.'));
            return;
          }
        } catch { /* Some destinations prevent access to their document. */ }
        status('Ready');
      });
      $('viewport').append(frame.frame);
    }
    for (const id of ['back','forward','reload']) $(id).disabled = false;
    frame.go(url);
  } catch (error) { fail(error); }
}
async function serviceWorker() {
  await navigator.serviceWorker.register(path('sw.js'), { scope: path('./') });
  await navigator.serviceWorker.ready;
  if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
}
async function useRelay(url) {
  await connection.setTransport(path('libcurl/index.mjs'), [{ websocket: url }]);
}
async function initialize() {
  if (!navigator.serviceWorker) throw new Error('This browser needs service worker support. Open coupeweb using HTTPS or localhost.');
  // The service worker download, Scramjet's WebAssembly setup and the transport all start at once.
  const worker = serviceWorker();
  const { ScramjetController } = $scramjetLoadController();
  controller = new ScramjetController({
    prefix: path('proxy/'),
    files: { wasm: path('scram/scramjet.wasm.wasm'), all: path('scram/scramjet.all.js'), sync: path('scram/scramjet.sync.js') },
    // Source maps make Scramjet track every rewritten script; skipping them makes heavy sites load much faster.
    flags: { sourcemaps: false },
  });
  connection = new BareMux.BareMuxConnection(path('baremux/worker.js'));
  await Promise.all([controller.init(), worker, useRelay(savedRelay())]);
  status('Proxy ready');
}
const ready = initialize();
ready.catch(fail);
$('browse').addEventListener('submit', event => { event.preventDefault(); navigate($('address').value); });
for (const button of document.querySelectorAll('[data-url]')) button.addEventListener('click', () => navigate(button.dataset.url));
$('home').addEventListener('click', showHome);
$('back').addEventListener('click', () => frame?.back());
$('forward').addEventListener('click', () => frame?.forward());
$('reload').addEventListener('click', () => { if (frame) { loading(); frame.reload(); } });
$('relay').value = savedRelay();
$('relay-form').addEventListener('submit', async event => {
  event.preventDefault();
  const value = $('relay').value.trim() || defaultRelay;
  try {
    if (!/^wss?:\/\//i.test(value)) throw new Error('Relay addresses start with wss:// or ws://.');
    try { value === defaultRelay ? localStorage.removeItem('coupeweb-relay') : localStorage.setItem('coupeweb-relay', value); } catch { /* Storage can be blocked; the relay still applies to this visit. */ }
    $('relay').value = value;
    await ready; await useRelay(value);
    $('error').hidden = true; status('Relay saved');
  } catch (error) { fail(error); }
});
