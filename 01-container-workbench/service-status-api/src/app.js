import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { createHeartbeatStore } from './store.js';

const MAX_BYTES = 16 * 1024;

function send(res, statusCode, payload, requestId) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
    'x-request-id': requestId,
    'x-content-type-options': 'nosniff',
  });
  res.end(body);
}

async function readJson(req) {
  let size = 0;
  const parts = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BYTES) {
      const err = new Error('request body exceeds 16 KB');
      err.statusCode = 413;
      throw err;
    }
    parts.push(chunk);
  }
  if (!String(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) {
    const err = new Error('Content-Type must be application/json');
    err.statusCode = 415;
    throw err;
  }
  try { return JSON.parse(Buffer.concat(parts).toString('utf8')); }
  catch {
    const err = new Error('invalid JSON body');
    err.statusCode = 400;
    throw err;
  }
}

export function createApp({
  store = createHeartbeatStore(),
  maintenance = false,
  log = (entry) => console.log(JSON.stringify(entry)),
} = {}) {
  const counts = { requests: 0, errors: 0 };

  const handler = async (req, res) => {
    const requestId = randomUUID();
    const startedAt = Date.now();
    counts.requests++;
    res.once('finish', () => {
      if (res.statusCode >= 400) counts.errors++;
      log({ requestId, method: req.method, path: req.url?.split('?')[0], status: res.statusCode, durationMs: Date.now() - startedAt });
    });

    try {
      // The URL parser handles query parameters without string-matching mistakes.
      const url = new URL(req.url ?? '/', 'http://localhost');
      if (req.method === 'GET' && url.pathname === '/') {
        return send(res, 200, { name: 'service-status-api', hint: 'POST /api/heartbeats' }, requestId);
      }
      if (req.method === 'GET' && url.pathname === '/health/live') {
        return send(res, 200, { live: true }, requestId);
      }
      if (req.method === 'GET' && url.pathname === '/health/ready') {
        return send(res, maintenance ? 503 : 200, { ready: !maintenance }, requestId);
      }
      if (req.method === 'GET' && url.pathname === '/api/services') {
        const filter = url.searchParams.get('filter');
        if (filter !== null && filter !== 'online' && filter !== 'offline') {
          return send(res, 400, { error: 'filter should be online or offline' }, requestId);
        }
        const services = store.list({ filter });
        return send(res, 200, { count: services.length, services }, requestId);
      }
      if (req.method === 'POST' && url.pathname === '/api/heartbeats') {
        const outcome = store.put(await readJson(req));
        if (outcome.error) return send(res, outcome.code || 400, { error: outcome.error }, requestId);
        return send(res, outcome.created ? 201 : 200, outcome.saved, requestId);
      }
      if (req.method === 'GET' && url.pathname === '/metrics') {
        const body = [
          '# TYPE app_requests_total counter',
          `app_requests_total ${counts.requests}`,
          '# TYPE app_errors_total counter',
          `app_errors_total ${counts.errors}`,
          '# TYPE app_known_services gauge',
          `app_known_services ${store.size()}`,
          '',
        ].join('\n');
        res.writeHead(200, { 'content-type': 'text/plain; version=0.0.4; charset=utf-8', 'content-length': Buffer.byteLength(body) });
        return res.end(body);
      }
      return send(res, 404, { error: 'route not found' }, requestId);
    } catch (err) {
      const status = Number.isInteger(err.statusCode) ? err.statusCode : 500;
      return send(res, status, { error: status === 500 ? 'internal server error' : err.message }, requestId);
    }
  };

  return createServer(handler);
}
