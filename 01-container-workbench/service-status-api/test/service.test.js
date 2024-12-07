import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { createHeartbeatStore } from '../src/store.js';

async function fixture(t, opts = {}) {
  const srv = createApp({ log: () => {}, ...opts });
  await new Promise((resolve) => srv.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => srv.close(resolve)));
  return `http://127.0.0.1:${srv.address().port}`;
}
async function post(base, body, headers = { 'content-type': 'application/json' }) {
  return fetch(`${base}/api/heartbeats`, { method: 'POST', headers, body: typeof body === 'string' ? body : JSON.stringify(body) });
}

test('root route provides a helpful API hint', async (t) => {
  const base = await fixture(t);
  const res = await fetch(base);
  assert.equal(res.status, 200);
  assert.match((await res.json()).hint, /heartbeats/);
});
test('live and ready endpoints work normally', async (t) => {
  const base = await fixture(t);
  assert.equal((await fetch(`${base}/health/live`)).status, 200);
  assert.deepEqual(await (await fetch(`${base}/health/ready`)).json(), { ready: true });
});
test('maintenance makes readiness fail but liveness continue', async (t) => {
  const base = await fixture(t, { maintenance: true });
  assert.equal((await fetch(`${base}/health/live`)).status, 200);
  assert.equal((await fetch(`${base}/health/ready`)).status, 503);
});
test('empty service list', async (t) => {
  const base = await fixture(t);
  assert.deepEqual(await (await fetch(`${base}/api/services`)).json(), { count: 0, services: [] });
});
test('creates a heartbeat', async (t) => {
  const base = await fixture(t);
  const res = await post(base, { service: 'billing-worker', status: 'ok' });
  assert.equal(res.status, 201);
  assert.equal((await res.json()).service, 'billing-worker');
  const data = await (await fetch(`${base}/api/services`)).json();
  assert.equal(data.count, 1);
  assert.equal(data.services[0].online, true);
});
test('existing heartbeat updates instead of creating duplicates', async (t) => {
  const base = await fixture(t);
  assert.equal((await post(base, { service: 'billing-worker', status: 'ok' })).status, 201);
  assert.equal((await post(base, { service: 'billing-worker', status: 'warn', note: 'slow' })).status, 200);
  const data = await (await fetch(`${base}/api/services`)).json();
  assert.equal(data.count, 1);
  assert.equal(data.services[0].note, 'slow');
});
test('service names and status are validated', async (t) => {
  const base = await fixture(t);
  assert.equal((await post(base, { service: '../bad', status: 'ok' })).status, 400);
  assert.equal((await post(base, { service: 'good-name', status: 'broken' })).status, 400);
});
test('rejects overlong note', async (t) => {
  const base = await fixture(t);
  assert.equal((await post(base, { service: 'good-name', status: 'ok', note: 'x'.repeat(121) })).status, 400);
});
test('requires a JSON object', async (t) => {
  const base = await fixture(t);
  assert.equal((await post(base, [1, 2])).status, 400);
});
test('rejects invalid JSON', async (t) => {
  const base = await fixture(t);
  assert.equal((await post(base, '{invalid')).status, 400);
});
test('rejects wrong content type', async (t) => {
  const base = await fixture(t);
  assert.equal((await post(base, '{}', { 'content-type': 'text/plain' })).status, 415);
});
test('rejects oversized body', async (t) => {
  const base = await fixture(t);
  assert.equal((await post(base, { service: 'good-name', status: 'ok', extra: 'x'.repeat(17_000) })).status, 413);
});
test('rejects unsupported list filters', async (t) => {
  const base = await fixture(t);
  assert.equal((await fetch(`${base}/api/services?filter=maybe`)).status, 400);
});
test('recognizes expired heartbeats', async (t) => {
  let clock = Date.UTC(2024, 10, 1);
  const store = createHeartbeatStore({ now: () => clock, ttlMs: 60_000 });
  const base = await fixture(t, { store });
  await post(base, { service: 'billing-worker', status: 'ok' });
  clock += 61_000;
  const offline = await (await fetch(`${base}/api/services?filter=offline`)).json();
  assert.equal(offline.count, 1);
  assert.equal(offline.services[0].online, false);
  assert.equal((await (await fetch(`${base}/api/services?filter=online`)).json()).count, 0);
});
test('limits the maximum number of tracked services', async (t) => {
  const base = await fixture(t, { store: createHeartbeatStore({ limit: 1 }) });
  assert.equal((await post(base, { service: 'one', status: 'ok' })).status, 201);
  assert.equal((await post(base, { service: 'two', status: 'ok' })).status, 409);
});
test('all responses receive a request id for tracing', async (t) => {
  const base = await fixture(t);
  const id = (await fetch(`${base}/health/live`)).headers.get('x-request-id');
  assert.match(id, /^[0-9a-f-]{36}$/);
});
test('metrics endpoint contains request and service counts', async (t) => {
  const base = await fixture(t);
  await post(base, { service: 'billing-worker', status: 'ok' });
  const res = await fetch(`${base}/metrics`);
  assert.equal(res.status, 200);
  assert.match(await res.text(), /app_known_services 1/);
});
test('unknown routes return 404', async (t) => {
  const base = await fixture(t);
  assert.equal((await fetch(`${base}/missing`)).status, 404);
});
