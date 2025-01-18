'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { readConfig } = require('../config');

test('loads sensible defaults', () => {
  const c = readConfig({});
  assert.equal(c.port, 3000);
  assert.equal(c.stage, 'local');
});
test('rejects invalid ports', () => {
  assert.throws(() => readConfig({PORT:'70000'}), /Invalid PORT/);
  assert.throws(() => readConfig({PORT:'abc'}), /Invalid PORT/);
});
test('accepts a custom tariff config', () => {
  const c = readConfig({PRICING_JSON: JSON.stringify({local:{baseCents:1,perKgCents:2},national:{baseCents:3,perKgCents:4},remote:{baseCents:5,perKgCents:6}})});
  assert.equal(c.tariffs.local.baseCents, 1);
});
test('rejects invalid JSON config', () => {
  assert.throws(() => readConfig({PRICING_JSON:'not-json'}), SyntaxError);
});
