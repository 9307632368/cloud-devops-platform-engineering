'use strict';
const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { createApp, buckets } = require('../server');

async function start(mode = 'normal') {
  const app = createApp({ mode, quiet: true, sleep: async () => {} });
  const server = http.createServer(app.handler);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  return { app, base, close: () => new Promise(resolve => server.close(resolve)) };
}
async function withServer(mode, fn) {
  const testServer = await start(mode);
  try { return await fn(testServer); } finally { await testServer.close(); }
}

test('liveness always succeeds', async () => withServer('not-ready', async ({base}) => {
  const r = await fetch(base + '/health/live'); assert.equal(r.status, 200); assert.equal((await r.json()).status, 'alive');
}));
test('readiness succeeds in normal mode', async () => withServer('normal', async ({base}) => {
  const r = await fetch(base + '/health/ready'); assert.equal(r.status, 200); assert.equal((await r.json()).ready, true);
}));
test('readiness reports dependency failure', async () => withServer('not-ready', async ({base}) => {
  const r = await fetch(base + '/health/ready'); assert.equal(r.status, 503); assert.equal((await r.json()).ready, false);
}));
test('quote computes cents, not floating-point dollars', async () => withServer('normal', async ({base}) => {
  const data = await (await fetch(base + '/api/quote?units=3')).json();
  assert.deepEqual(data, { units: 3, total_cents: 3750, currency: 'USD' });
}));
for (const units of ['', '0', '501', '-2', '1.5', 'abc', '999999999999999999999']) {
  test(`rejects bad quantity ${JSON.stringify(units)}`, async () => withServer('normal', async ({base}) => {
    assert.equal((await fetch(base + '/api/quote?units=' + encodeURIComponent(units))).status, 400);
  }));
}
test('missing units rejected', async () => withServer('normal', async ({base}) => {
  assert.equal((await fetch(base + '/api/quote')).status, 400);
}));
test('errors fault results in 503', async () => withServer('errors', async ({base}) => {
  assert.equal((await fetch(base + '/api/quote?units=2')).status, 503);
}));
test('slow fault still serves correct response', async () => withServer('slow', async ({base}) => {
  assert.equal((await fetch(base + '/api/quote?units=2')).status, 200);
}));
test('not-ready faults reject business requests', async () => withServer('not-ready', async ({base}) => {
  assert.equal((await fetch(base + '/api/quote?units=2')).status, 503);
}));
test('unknown path returns 404', async () => withServer('normal', async ({base}) => {
  assert.equal((await fetch(base + '/not-real')).status, 404);
}));
test('wrong method returns 405', async () => withServer('normal', async ({base}) => {
  assert.equal((await fetch(base + '/api/quote?units=2', {method:'POST'})).status, 405);
}));
test('metrics contains counters, histogram, readiness gauge', async () => withServer('normal', async ({base}) => {
  await fetch(base + '/api/quote?units=2');
  await fetch(base + '/api/quote?units=0');
  const metrics = await (await fetch(base + '/metrics')).text();
  assert.match(metrics, /lab_http_requests_total\{method="GET",route="quote",status="200"\} 1/);
  assert.match(metrics, /lab_http_requests_total\{method="GET",route="quote",status="400"\} 1/);
  assert.match(metrics, /lab_http_request_duration_seconds_bucket\{le="\+Inf"\} 2/);
  assert.match(metrics, /lab_ready 1/);
}));
test('metrics scraping does not increment request count', async () => withServer('normal', async ({base,app}) => {
  await fetch(base + '/metrics'); await fetch(base + '/metrics');
  assert.equal(app.getStats().requestTotal, 0);
}));
test('error counter advances for 5xx only', async () => withServer('errors', async ({base,app}) => {
  await fetch(base + '/api/quote?units=1');
  await fetch(base + '/api/quote?units=0');
  assert.equal(app.getStats().errorTotal, 1);
}));
test('histogram buckets are ordered', () => {
  assert.ok(buckets.every((item, i) => i === 0 || item > buckets[i-1]));
});
test('unknown fault mode refused at startup', () => {
  assert.throws(() => createApp({mode:'chaos'}), /Unknown demo mode/);
});
