import { destination } from './navigation.js';
const $ = id => document.getElementById(id);
let controller, frame, timeout;
function status(text) { $('status').textContent = text; }
function fail(error) { clearTimeout(timeout); $('progress').hidden = true; $('error').textContent = error.message || String(error); $('error').hidden = false; status('Needs attention'); }
function loading() { $('error').hidden = true; $('progress').hidden = false; status('Loading page…'); clearTimeout(timeout); timeout = setTimeout(() => { $('progress').hidden = true; status('Still waiting'); $('error').textContent = 'This page is taking a while. Try reloading or opening another website.'; $('error').hidden = false; }, 30000); }
function showHome() { frame?.frame.remove(); frame = null; clearTimeout(timeout); $('progress').hidden = true; $('viewport').hidden = true; $('welcome').hidden = false; $('address').value = ''; $('error').hidden = true; for (const id of ['back','forward','reload']) $(id).disabled = true; status('Proxy ready'); }
async function navigate(input) {
  try {
    const url = destination(input);
    await ready;
    if (!frame) {
      frame = controller.createFrame();
      frame.frame.title = 'Proxied website';
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
    $('address').value = url; $('welcome').hidden = true; $('viewport').hidden = false;
    for (const id of ['back','forward','reload']) $(id).disabled = false;
    loading(); frame.go(url);
  } catch (error) { fail(error); }
}
async function initialize() {
  if (!navigator.serviceWorker) throw new Error('This browser needs service worker support. Open coupeweb using HTTPS or localhost.');
  if (!window.crossOriginIsolated) throw new Error('Browser isolation is unavailable. Open coupeweb directly in a browser tab.');
  const { ScramjetController } = $scramjetLoadController();
  controller = new ScramjetController({ prefix: '/proxy/', files: { wasm: '/scram/scramjet.wasm.wasm', all: '/scram/scramjet.all.js', sync: '/scram/scramjet.sync.js' } });
  await controller.init();
  await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;
  if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
  const connection = new BareMux.BareMuxConnection('/baremux/worker.js');
  await connection.setTransport('/libcurl/index.mjs', [{ websocket: `${location.protocol === 'https:' ? 'wss:' : 'ws:'}//${location.host}/wisp/` }]);
  $('go').disabled = false; status('Proxy ready');
}
const ready = initialize();
ready.catch(fail);
$('browse').addEventListener('submit', event => { event.preventDefault(); navigate($('address').value); });
for (const button of document.querySelectorAll('[data-url]')) button.addEventListener('click', () => navigate(button.dataset.url));
$('home').addEventListener('click', showHome);
$('back').addEventListener('click', () => frame?.back());
$('forward').addEventListener('click', () => frame?.forward());
$('reload').addEventListener('click', () => { if (frame) { loading(); frame.reload(); } });
