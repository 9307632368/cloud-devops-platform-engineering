'use strict';

const http = require('node:http');
const { URL } = require('node:url');

const buckets = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5];
const allowedModes = new Set(['normal', 'errors', 'slow', 'not-ready']);

function createApp(config = {}) {
  const mode = config.mode || 'normal';
  if (!allowedModes.has(mode)) throw new Error(`Unknown demo mode: ${mode}`);
  const sleep = config.sleep || ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  const samples = new Map();
  let requestTotal = 0;
  let errorTotal = 0;
  let durationSum = 0;
  let durationCount = 0;
  const counts = buckets.map(() => 0);

  function record(method, route, status, elapsed) {
    const key = `${method}|${route}|${status}`;
    samples.set(key, (samples.get(key) || 0) + 1);
    requestTotal += 1;
    if (status >= 500) errorTotal += 1;
    durationSum += elapsed;
    durationCount += 1;
    for (let i = 0; i < buckets.length; i++) {
      if (elapsed <= buckets[i]) counts[i] += 1;
    }
  }

  function writeJson(response, code, data) {
    response.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
    response.end(JSON.stringify(data));
  }

  function metrics() {
    const lines = [
      '# HELP lab_http_requests_total Number of requests to the demo API (except metrics).',
      '# TYPE lab_http_requests_total counter',
    ];
    for (const [key, count] of [...samples].sort(([a], [b]) => a.localeCompare(b))) {
      const [method, route, status] = key.split('|');
      lines.push(`lab_http_requests_total{method="${method}",route="${route}",status="${status}"} ${count}`);
    }
    lines.push('# HELP lab_http_errors_total HTTP responses with status >= 500.');
    lines.push('# TYPE lab_http_errors_total counter');
    lines.push(`lab_http_errors_total ${errorTotal}`);
    lines.push('# HELP lab_http_request_duration_seconds Duration of requests excluding /metrics.');
    lines.push('# TYPE lab_http_request_duration_seconds histogram');
    for (let i = 0; i < buckets.length; i++) {
      lines.push(`lab_http_request_duration_seconds_bucket{le="${buckets[i]}"} ${counts[i]}`);
    }
    lines.push(`lab_http_request_duration_seconds_bucket{le="+Inf"} ${durationCount}`);
    lines.push(`lab_http_request_duration_seconds_sum ${durationSum.toFixed(6)}`);
    lines.push(`lab_http_request_duration_seconds_count ${durationCount}`);
    lines.push('# HELP lab_ready Whether this demo service is ready for requests.');
    lines.push('# TYPE lab_ready gauge');
    lines.push(`lab_ready ${mode === 'not-ready' ? 0 : 1}`);
    lines.push('# HELP lab_api_requests_served_total Total requests handled by API routes.');
    lines.push('# TYPE lab_api_requests_served_total counter');
    lines.push(`lab_api_requests_served_total ${requestTotal}`);
    return lines.join('\n') + '\n';
  }

  async function handler(request, response) {
    const started = process.hrtime.bigint();
    let status = 200;
    let route = 'not_found';
    try {
      const url = new URL(request.url, 'http://localhost');
      if (request.method === 'GET' && url.pathname === '/metrics') {
        response.writeHead(200, { 'content-type': 'text/plain; version=0.0.4; charset=utf-8' });
        response.end(metrics());
        return;
      }
      if (request.method === 'GET' && url.pathname === '/health/live') {
        route = 'liveness';
        writeJson(response, 200, { status: 'alive' });
      } else if (request.method === 'GET' && url.pathname === '/health/ready') {
        route = 'readiness';
        status = mode === 'not-ready' ? 503 : 200;
        writeJson(response, status, { ready: status === 200, checks: { inventory: status === 200 ? 'ok' : 'unavailable' } });
      } else if (request.method === 'GET' && url.pathname === '/api/quote') {
        route = 'quote';
        const raw = url.searchParams.get('units');
        if (raw === null || !/^[0-9]+$/.test(raw) || !Number.isSafeInteger(Number(raw)) || Number(raw) < 1 || Number(raw) > 500) {
          status = 400;
          writeJson(response, 400, { error: 'units must be an integer from 1 to 500' });
        } else if (mode === 'not-ready') {
          status = 503;
          writeJson(response, 503, { error: 'inventory dependency is unavailable' });
        } else if (mode === 'errors') {
          status = 503;
          writeJson(response, 503, { error: 'simulated upstream failure' });
        } else {
          if (mode === 'slow') await sleep(350);
          writeJson(response, 200, { units: Number(raw), total_cents: Number(raw) * 1250, currency: 'USD' });
        }
      } else {
        status = request.method === 'GET' ? 404 : 405;
        writeJson(response, status, { error: 'route not found or method not allowed' });
      }
    } catch (error) {
      status = 500;
      if (!response.headersSent) writeJson(response, 500, { error: 'internal server error' });
    } finally {
      const duration = Number(process.hrtime.bigint() - started) / 1e9;
      if (!response.headersSent || response.statusCode) status = response.statusCode || status;
      if (request.url !== '/metrics') record(request.method || 'UNKNOWN', route, status, duration);
      if (request.url !== '/metrics') {
        const line = { time: new Date().toISOString(), method: request.method, route, status, duration_ms: Math.round(duration * 1000), mode };
        if (!config.quiet) process.stdout.write(JSON.stringify(line) + '\n');
      }
    }
  }
  return { handler, metrics, getStats: () => ({ requestTotal, errorTotal, mode }) };
}

if (require.main === module) {
  const port = Number(process.env.PORT || 8080);
  const host = process.env.HOST || '127.0.0.1';
  const mode = process.env.FAULT_MODE || 'normal';
  const app = createApp({ mode });
  const server = http.createServer(app.handler);
  server.listen(port, host, () => process.stdout.write(`lab service listening on ${host}:${port} (${mode})\n`));
  for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => server.close(() => process.exit(0)));
}
module.exports = { createApp, buckets };
