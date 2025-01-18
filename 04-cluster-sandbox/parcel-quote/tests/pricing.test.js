'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateQuote, checkTariffs, DEFAULT_TARIFFS, InputError } = require('../pricing');

test('calculates exact 1 kg local quote', () => {
  assert.equal(calculateQuote('local', '1000').amountPaise, 6500);
});
test('rounds 1001 grams up to two kilograms', () => {
  assert.deepEqual(calculateQuote('local', '1001').billedKg, 2);
  assert.equal(calculateQuote('local', '1001').amountPaise, 8000);
});
test('remote zone uses its own tariff', () => {
  assert.equal(calculateQuote('remote', '1200').amountPaise, 24500);
});
test('max 50kg is accepted', () => {
  assert.equal(calculateQuote('national', '50000').billedKg, 50);
});
for (const val of ['0', '-1', '1.3', '1e3', '50001', '', 'abc']) {
  test('rejects invalid weight: ' + JSON.stringify(val), () => {
    assert.throws(() => calculateQuote('local', val), InputError);
  });
}
test('rejects invalid zone', () => {
  assert.throws(() => calculateQuote('international', '1000'), InputError);
});
test('rejects tariffs without all the required zones', () => {
  assert.throws(() => checkTariffs({local: DEFAULT_TARIFFS.local}), /Invalid tariff/);
});
test('rejects negative tariff rate', () => {
  assert.throws(() => checkTariffs({...DEFAULT_TARIFFS, local:{baseCents:-1,perKgCents:20}}), /Invalid tariff/);
});
