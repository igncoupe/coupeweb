import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import Fastify from 'fastify';
import serve from '@fastify/static';
import { server as wisp, logging } from '@mercuryworkshop/wisp-js/server';
import { scramjetPath } from '@mercuryworkshop/scramjet/path';
import { libcurlPath } from '@mercuryworkshop/libcurl-transport';
import { baremuxPath } from '@mercuryworkshop/bare-mux/node';
import { validHost, validUpgrade, relayOptions } from './server-policy.js';

const port = Number(process.env.PORT || 8080);
const host = process.env.HOST || '127.0.0.1';
const hosts = new Set([`localhost:${port}`, `127.0.0.1:${port}`]);
if (process.env.CODESPACE_NAME) hosts.add(`${process.env.CODESPACE_NAME}-${port}.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN || 'app.github.dev'}`);
for (const origin of (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean)) hosts.add(new URL(origin).host);
logging.set_level(logging.ERROR);
Object.assign(wisp.options, relayOptions);
const app = Fastify({
  serverFactory(handler) {
    const server = createServer((req, res) => {
      if (!validHost(req.headers.host, hosts)) { res.writeHead(403); res.end('Host not allowed'); return; }
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
      res.setHeader('Referrer-Policy', 'no-referrer');
      handler(req, res);
    });
    server.on('upgrade', (req, socket, head) => {
      if (!validUpgrade(req, hosts)) { socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n'); return; }
      wisp.routeRequest(req, socket, head);
    });
    return server;
  },
});
for (const [prefix, root] of [
  ['/', fileURLToPath(new URL('./public/', import.meta.url))],
  ['/scram/', scramjetPath], ['/libcurl/', libcurlPath], ['/baremux/', baremuxPath],
]) app.register(serve, { root, prefix, decorateReply: prefix === '/' });
app.get('/health', async () => ({ status: 'ready' }));
await app.listen({ port, host });
console.log(`coupeweb is ready at http://localhost:${port}`);
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => app.close().then(() => process.exit(0)));
