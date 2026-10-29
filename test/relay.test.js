import { test } from 'node:test';
import assert from 'node:assert/strict';
import { server as wisp } from '@mercuryworkshop/wisp-js/server';
import { relayOptions } from '../server-policy.js';
const { is_stream_allowed } = await import(new URL('../server/filter.mjs', import.meta.resolve('@mercuryworkshop/wisp-js/server')));

test('valid website streams do not crash Wisp; total and destination limits remain enforced', async () => {
  const original = { ...wisp.options };
  Object.assign(wisp.options, relayOptions, { dns_method: async () => '8.8.8.8' });
  try {
    const connection = { streams: { 1: { socket: { hostname: 'public-site.test' } } } };
    assert.equal(await is_stream_allowed(connection, 1, 'public-site.test', 443), 0);
    assert.notEqual(await is_stream_allowed(connection, 1, 'public-site.test', 22), 0);
    assert.notEqual(await is_stream_allowed(connection, 1, '127.0.0.1', 443), 0);
    assert.notEqual(await is_stream_allowed(connection, 1, '192.168.1.1', 443), 0);
    const full = { streams: Object.fromEntries(Array.from({ length: 64 }, (_, i) => [i, { socket: { hostname: 'public-site.test' } }])) };
    assert.notEqual(await is_stream_allowed(full, 1, 'public-site.test', 443), 0);
  } finally { Object.assign(wisp.options, original); }
});
