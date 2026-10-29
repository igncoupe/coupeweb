// Builds a static copy of coupeweb in dist/ for GitHub Pages (or any static host).
// Static hosts cannot run the Wisp relay, so the build points the app at an external one.
import { cp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scramjetPath } from '@mercuryworkshop/scramjet/path';
import { libcurlPath } from '@mercuryworkshop/libcurl-transport';
import { baremuxPath } from '@mercuryworkshop/bare-mux/node';

const relay = process.env.COUPE_RELAY || 'wss://wisp.mercurywork.shop/';
if (!/^wss?:\/\//.test(relay)) throw new Error(`COUPE_RELAY must start with wss:// or ws://, got ${relay}`);
const dist = fileURLToPath(new URL('../dist/', import.meta.url));
await rm(dist, { recursive: true, force: true });
await cp(fileURLToPath(new URL('../public/', import.meta.url)), dist, { recursive: true });
// Only the files the browser loads; the packages also ship source maps and unused bundles.
for (const [dir, root, files] of [
  ['scram', scramjetPath, ['scramjet.all.js', 'scramjet.wasm.wasm', 'scramjet.sync.js']],
  ['libcurl', libcurlPath, ['index.mjs']],
  ['baremux', baremuxPath, ['index.js', 'worker.js']],
]) for (const file of files) await cp(join(root, file), join(dist, dir, file));
await writeFile(join(dist, 'config.js'), `export const relay = ${JSON.stringify(relay)};\n`);
await writeFile(join(dist, '.nojekyll'), '');

// The service worker caches the app under a name derived from every other file,
// so each deploy with changes replaces the cache and an unchanged deploy keeps it.
const hash = createHash('sha256');
for (const entry of (await readdir(dist, { recursive: true, withFileTypes: true })).sort((a, b) => join(a.parentPath, a.name).localeCompare(join(b.parentPath, b.name)))) {
  if (!entry.isFile() || entry.name === 'sw.js') continue;
  const file = join(entry.parentPath, entry.name);
  hash.update(file.slice(dist.length)).update(await readFile(file));
}
const sw = join(dist, 'sw.js');
const source = await readFile(sw, 'utf8');
if (!source.includes("const VERSION = 'dev';")) throw new Error('sw.js no longer declares VERSION; update scripts/build.js');
await writeFile(sw, source.replace("const VERSION = 'dev';", `const VERSION = '${hash.digest('hex').slice(0, 12)}';`));
console.log(`Built dist/ using relay ${relay}`);
