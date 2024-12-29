import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { filterBuilds, loadBuilds, parseFilters } from './catalog.mjs';

function send(res, status, data) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  });
  res.end(JSON.stringify(data));
}

export function makeApp({ dataPath, manifestPath, fallbackVersion = 'dev' }) {
  return createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      if (req.method !== 'GET') {
        return send(res, 405, { error: 'Only GET is supported in this demo' });
      }
      if (url.pathname === '/health') {
        return send(res, 200, { status: 'ok', service: 'release-status-api' });
      }
      if (url.pathname === '/api/version') {
        let version = fallbackVersion;
        try {
          const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
          if (typeof manifest.version === 'string') version = manifest.version;
        } catch (err) {
          if (err.code !== 'ENOENT') throw err;
        }
        return send(res, 200, { version, source: version === fallbackVersion ? 'source' : 'bundle' });
      }
      if (url.pathname === '/api/builds') {
        const parsed = parseFilters(url.searchParams);
        if (parsed.error) return send(res, 400, { error: parsed.error });
        const builds = await loadBuilds(dataPath);
        const items = filterBuilds(builds, parsed.filters);
        return send(res, 200, { count: items.length, items });
      }
      const match = /^\/api\/builds\/([a-zA-Z0-9-]+)$/.exec(url.pathname);
      if (match) {
        const builds = await loadBuilds(dataPath);
        const item = builds.find((row) => row.id === match[1]);
        if (!item) return send(res, 404, { error: 'Build not found' });
        return send(res, 200, item);
      }
      return send(res, 404, { error: 'Route not found' });
    } catch (err) {
      // Avoid returning system paths or raw stack traces in HTTP responses.
      console.error('Request error:', err.message);
      return send(res, 500, { error: 'Internal server error' });
    }
  });
}
