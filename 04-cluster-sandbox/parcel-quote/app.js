'use strict';
const http = require('node:http');
const { URL } = require('node:url');
const { calculateQuote, InputError } = require('./pricing');

function createApp(config) {
  let quoteCount = 0;
  let errorCount = 0;
  const startedAt = Date.now();

  function reply(res, status, body) {
    const output = JSON.stringify(body);
    res.writeHead(status, {
      'content-type': 'application/json; charset=utf-8',
      'content-length': Buffer.byteLength(output),
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff'
    });
    res.end(output);
  }

  return http.createServer((req, res) => {
    let url;
    try { url = new URL(req.url, 'http://localhost'); }
    catch { errorCount += 1; return reply(res, 400, { error: 'Invalid URL' }); }
    if (req.method !== 'GET') {
      errorCount += 1;
      res.setHeader('allow', 'GET');
      return reply(res, 405, { error: 'Only GET requests are supported' });
    }
    const path = url.pathname;
    if (path === '/health/live' || path === '/health/ready') {
      return reply(res, 200, { status: 'ok', check: path.endsWith('/live') ? 'live' : 'ready' });
    }
    if (path === '/metrics') {
      const lines = [
        '# HELP parcel_quotes_total Number of quotes returned by this process',
        '# TYPE parcel_quotes_total counter',
        `parcel_quotes_total ${quoteCount}`,
        '# HELP parcel_errors_total Number of invalid or unsupported requests',
        '# TYPE parcel_errors_total counter',
        `parcel_errors_total ${errorCount}`,
        '# HELP parcel_uptime_seconds Process uptime',
        '# TYPE parcel_uptime_seconds gauge',
        `parcel_uptime_seconds ${Math.floor((Date.now() - startedAt) / 1000)}`,
        ''
      ];
      res.writeHead(200, { 'content-type': 'text/plain; version=0.0.4; charset=utf-8',
        'cache-control': 'no-store' });
      return res.end(lines.join('\n'));
    }
    if (path === '/api/quote') {
      try {
        const quote = calculateQuote(url.searchParams.get('zone'),
          url.searchParams.get('weight_grams'), config.tariffs);
        quoteCount += 1;
        return reply(res, 200, { ...quote, stage: config.stage, region: config.region, pod: config.pod });
      } catch (err) {
        errorCount += 1;
        if (err instanceof InputError) return reply(res, 422, { error: err.message });
        return reply(res, 500, { error: 'Unexpected error' });
      }
    }
    if (path === '/') return reply(res, 200, { name: 'parcel-quote', endpoints: [
      '/api/quote?zone=local&weight_grams=1200', '/health/live', '/health/ready', '/metrics'
    ] });
    errorCount += 1;
    return reply(res, 404, { error: 'Route not found' });
  });
}
module.exports = { createApp };
