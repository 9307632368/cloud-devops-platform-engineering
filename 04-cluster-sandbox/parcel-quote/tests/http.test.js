'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../app');
const { readConfig } = require('../config');

async function withServer(fn) {
  const server = createApp(readConfig({APP_ENV:'test',POD_NAME:'pod-1'}));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = 'http://127.0.0.1:' + server.address().port;
  try { await fn(address); }
  finally { await new Promise(resolve => server.close(resolve)); }
}

test('health endpoints respond correctly', async () => withServer(async base => {
  for (const path of ['/health/live', '/health/ready']) {
    const res = await fetch(base + path);
    assert.equal(res.status, 200);
    assert.equal((await res.json()).status, 'ok');
  }
}));
test('quote returns JSON, pod and integer paise', async () => withServer(async base => {
  const res = await fetch(base + '/api/quote?zone=national&weight_grams=1600');
  const json = await res.json();
  assert.equal(res.status, 200);
  assert.equal(json.amountPaise, 14500);
  assert.equal(json.pod, 'pod-1');
  assert.equal(res.headers.get('cache-control'), 'no-store');
}));
test('bad query returns 422', async () => withServer(async base => {
  const res = await fetch(base + '/api/quote?zone=bad&weight_grams=1');
  assert.equal(res.status, 422);
  assert.match((await res.json()).error, /zone/);
}));
test('unknown route returns 404', async () => withServer(async base => {
  const res = await fetch(base + '/wrong');
  assert.equal(res.status, 404);
}));
test('write methods are rejected', async () => withServer(async base => {
  const res = await fetch(base + '/api/quote', {method: 'POST'});
  assert.equal(res.status, 405);
  assert.equal(res.headers.get('allow'), 'GET');
}));
test('metrics count successful and failed quotes on a single server', async () => withServer(async base => {
  await fetch(base + '/api/quote?zone=local&weight_grams=1000');
  await fetch(base + '/api/quote?zone=bad&weight_grams=1000');
  const res = await fetch(base + '/metrics');
  const text = await res.text();
  assert.match(text, /parcel_quotes_total 1/);
  assert.match(text, /parcel_errors_total 1/);
}));
