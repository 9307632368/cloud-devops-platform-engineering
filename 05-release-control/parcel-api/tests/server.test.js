'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {createServer} = require('../src/server');
let server, origin;
test.before(async () => {
  server = createServer({version:'v1.2.0'});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
});
test.after(async () => {await new Promise((resolve,reject)=>server.close(e=>e?reject(e):resolve()));});
async function fetchJson(path,opts) {const r=await fetch(origin+path,opts);return [r.status,await r.json()];}
test('health endpoint',async()=>{const [s,b]=await fetchJson('/healthz');assert.equal(s,200);assert.equal(b.ok,true);});
test('ready endpoint',async()=>{const [s,b]=await fetchJson('/readyz');assert.equal(s,200);assert.equal(b.ready,true);});
test('version field',async()=>{const [s,b]=await fetchJson('/version');assert.equal(s,200);assert.equal(b.version,'v1.2.0');});
test('list parcels',async()=>{const [s,b]=await fetchJson('/api/parcels');assert.equal(s,200);assert.equal(b.items.length,2);});
test('known parcel',async()=>{const [s,b]=await fetchJson('/api/parcels/PKG-1001');assert.equal(s,200);assert.equal(b.destination,'Pune');});
test('unknown parcel',async()=>{const [s,b]=await fetchJson('/api/parcels/PKG-9999');assert.equal(s,404);assert.equal(b.error,'not_found');});
test('unknown route',async()=>{const [s]=await fetchJson('/missing');assert.equal(s,404);});
test('unsupported method',async()=>{const [s,b]=await fetchJson('/api/parcels',{method:'POST'});assert.equal(s,405);assert.equal(b.error,'method_not_allowed');});
test('bad parcel id treated as route mismatch',async()=>{const [s]=await fetchJson('/api/parcels/hello%20world');assert.equal(s,404);});
