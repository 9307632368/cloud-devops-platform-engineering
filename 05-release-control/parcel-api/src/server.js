'use strict';
const http = require('node:http');

function makeHandler(options = {}) {
  const parcels = new Map(options.parcels || [
    ['PKG-1001', {id:'PKG-1001', status:'in_transit', destination:'Pune'}],
    ['PKG-1002', {id:'PKG-1002', status:'delivered', destination:'Mumbai'}],
  ]);
  const version = options.version || process.env.APP_VERSION || 'dev';
  return (req, res) => {
    const method = req.method || 'GET';
    const url = new URL(req.url || '/', 'http://localhost');
    const reply = (code, data) => {
      res.writeHead(code, {'content-type':'application/json; charset=utf-8','cache-control':'no-store'});
      res.end(JSON.stringify(data));
    };
    if (method !== 'GET') return reply(405, {error:'method_not_allowed'});
    if (url.pathname === '/healthz') return reply(200, {ok:true});
    if (url.pathname === '/readyz') return reply(200, {ready:true});
    if (url.pathname === '/version') return reply(200, {version});
    if (url.pathname === '/api/parcels') return reply(200, {items:Array.from(parcels.values())});
    const match = /^\/api\/parcels\/([A-Za-z0-9-]+)$/.exec(url.pathname);
    if (match) {
      const item = parcels.get(match[1]);
      return item ? reply(200, item) : reply(404, {error:'not_found'});
    }
    return reply(404, {error:'route_not_found'});
  };
}

function createServer(options={}) {
  return http.createServer(makeHandler(options));
}

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  const server = createServer();
  server.listen(port, '0.0.0.0', () => console.log(`Parcel lab listening on ${port}`));
  const shutdown = () => server.close(() => process.exit(0));
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
module.exports = {makeHandler,createServer};
