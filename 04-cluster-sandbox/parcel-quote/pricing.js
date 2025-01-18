'use strict';

class InputError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InputError';
  }
}

const DEFAULT_TARIFFS = Object.freeze({
  local: { baseCents: 5000, perKgCents: 1500 },
  national: { baseCents: 8500, perKgCents: 3000 },
  remote: { baseCents: 12500, perKgCents: 6000 }
});

function checkTariffs(tariffs) {
  if (!tariffs || typeof tariffs !== 'object' || Array.isArray(tariffs)) {
    throw new Error('PRICING_JSON should be an object');
  }
  for (const name of ['local', 'national', 'remote']) {
    const pair = tariffs[name];
    if (!pair || !Number.isSafeInteger(pair.baseCents) || !Number.isSafeInteger(pair.perKgCents)
        || pair.baseCents < 0 || pair.perKgCents < 0 || pair.baseCents > 1000000 || pair.perKgCents > 1000000) {
      throw new Error('Invalid tariff entry: ' + name);
    }
  }
  return tariffs;
}

function calculateQuote(zone, gramsText, tariffs = DEFAULT_TARIFFS) {
  if (typeof zone !== 'string' || !Object.prototype.hasOwnProperty.call(tariffs, zone)
      || !['local', 'national', 'remote'].includes(zone)) {
    throw new InputError('zone must be local, national or remote');
  }
  if (typeof gramsText !== 'string' || !/^[0-9]+$/.test(gramsText)) {
    throw new InputError('weight_grams must be a positive whole number');
  }
  const grams = Number(gramsText);
  if (!Number.isSafeInteger(grams) || grams < 1 || grams > 50000) {
    throw new InputError('weight_grams must be between 1 and 50000');
  }
  // Round upward to a full kg. All calculations use integer paise.
  const billedKg = Math.ceil(grams / 1000);
  const rate = tariffs[zone];
  return { zone, weightGrams: grams, billedKg,
    amountPaise: rate.baseCents + billedKg * rate.perKgCents, currency: 'INR' };
}

module.exports = { DEFAULT_TARIFFS, checkTariffs, calculateQuote, InputError };
