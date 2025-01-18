'use strict';
const { DEFAULT_TARIFFS, checkTariffs } = require('./pricing');

function readConfig(env = process.env) {
  const port = Number(env.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Invalid PORT');
  const tariffs = env.PRICING_JSON ? JSON.parse(env.PRICING_JSON) : DEFAULT_TARIFFS;
  checkTariffs(tariffs);
  return {
    port,
    stage: String(env.APP_ENV || 'local').slice(0, 30),
    region: String(env.APP_REGION || 'lab').slice(0, 30),
    pod: String(env.POD_NAME || 'local-process').slice(0, 100),
    tariffs
  };
}
module.exports = { readConfig };
