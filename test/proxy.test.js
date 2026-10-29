import { test } from 'node:test';
import assert from 'node:assert/strict';
import { destination } from '../public/navigation.js';
import { validHost, validUpgrade } from '../server-policy.js';
test('addresses and searches preserve URL meaning', () => {
  assert.equal(destination(' example.com/a?x=1#hello '), 'https://example.com/a?x=1#hello');
  assert.equal(destination('http://example.com'), 'http://example.com/');
  assert.equal(destination('space & science'), 'https://www.google.com/search?q=space%20%26%20science');
  for (const input of ['', 'javascript:alert(1)', 'file:///etc/passwd', 'https://user:pass@example.com']) assert.throws(() => destination(input));
});
test('relay rejects cross-origin requests and unapproved hosts', () => {
  const hosts = new Set(['localhost:8080']);
  const req = { url: '/wisp/', headers: { host: 'localhost:8080', origin: 'http://localhost:8080' } };
  assert.equal(validUpgrade(req, hosts), true);
  assert.equal(validHost('attacker.test:8080', hosts), false);
  assert.equal(validUpgrade({ ...req, url: '/wisp/other' }, hosts), false);
  for (const origin of ['https://attacker.test', 'null', undefined]) assert.equal(validUpgrade({ ...req, headers: { ...req.headers, origin } }, hosts), false);
});
