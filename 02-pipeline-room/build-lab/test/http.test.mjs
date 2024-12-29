import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeApp } from '../src/http.mjs';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

async function withApi(action) {
  const server = makeApp({
    dataPath: path.join(root, 'data', 'builds.json'),
    manifestPath: path.join(root, 'dist', 'manifest.json'),
    fallbackVersion: '1.0.0-dev',
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  try { await action(`http://127.0.0.1:${server.address().port}`); }
  finally { await new Promise((resolve, reject) => server.close(err => err ? reject(err) : resolve())); }
}

async function json(url, init) { const r = await fetch(url, init); return { status: r.status, data: await r.json(), headers: r.headers }; }

test('health endpoint works', () => withApi(async base => {
  const r = await json(`${base}/health`);
  assert.equal(r.status, 200); assert.equal(r.data.status, 'ok');
}));
test('all builds returned', () => withApi(async base => {
  const r = await json(`${base}/api/builds`);
  assert.equal(r.status, 200); assert.equal(r.data.count, 4);
}));
test('filters work via HTTP', () => withApi(async base => {
  const r = await json(`${base}/api/builds?status=success&limit=1`);
  assert.equal(r.status, 200); assert.equal(r.data.items.length, 1); assert.equal(r.data.items[0].status, 'success');
}));
test('single build lookup works', () => withApi(async base => {
  const r = await json(`${base}/api/builds/build-102`);
  assert.equal(r.status, 200); assert.equal(r.data.status, 'failed');
}));
test('nonexistent build returns 404', () => withApi(async base => {
  assert.equal((await json(`${base}/api/builds/build-999`)).status, 404);
}));
test('unknown endpoint returns 404', () => withApi(async base => {
  assert.equal((await json(`${base}/nothing`)).status, 404);
}));
test('wrong method returns 405', () => withApi(async base => {
  assert.equal((await json(`${base}/api/builds`, { method: 'POST' })).status, 405);
}));
test('bad query returns 400', () => withApi(async base => {
  assert.equal((await json(`${base}/api/builds?status=oops`)).status, 400);
}));
test('no caching and MIME sniffing headers', () => withApi(async base => {
  const r = await json(`${base}/health`);
  assert.equal(r.headers.get('cache-control'), 'no-store');
  assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
}));
test('version endpoint works for source or built artifact', () => withApi(async base => {
  const r = await json(`${base}/api/version`);
  assert.equal(r.status, 200); assert.match(r.data.version, /^1\.0\.0/);
}));
