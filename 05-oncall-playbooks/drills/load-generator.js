'use strict';
// This tool will only send requests to local loopback addresses on purpose.
const { URL } = require('node:url');

function parseOptions(argv) {
  const args = {base: 'http://127.0.0.1:8080', count: 60, concurrency: 4};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i];
    const value = argv[i + 1];
    if (!value) throw new Error('Each option needs a value');
    if (key === '--base') args.base = value;
    else if (key === '--count') args.count = Number(value);
    else if (key === '--concurrency') args.concurrency = Number(value);
    else throw new Error('Unknown option: ' + key);
  }
  const target = new URL(args.base);
  if (target.protocol !== 'http:' || !['localhost','127.0.0.1','[::1]'].includes(target.hostname)) {
    throw new Error('Load generator only supports local http://localhost or 127.0.0.1 URLs');
  }
  if (!Number.isInteger(args.count) || args.count < 1 || args.count > 500) throw new Error('--count must be 1..500');
  if (!Number.isInteger(args.concurrency) || args.concurrency < 1 || args.concurrency > 20) throw new Error('--concurrency must be 1..20');
  return args;
}

async function run(opts, request = fetch) {
  let current = 0;
  const responses = [];
  async function worker() {
    while (current < opts.count) {
      current += 1;
      const begin = performance.now();
      try {
        const res = await request(opts.base.replace(/\/$/, '') + '/api/quote?units=2');
        await res.arrayBuffer();
        responses.push({status: res.status, duration_ms: performance.now() - begin});
      } catch (err) {
        responses.push({status: 0, duration_ms: performance.now() - begin});
      }
    }
  }
  await Promise.all(Array.from({length: Math.min(opts.concurrency, opts.count)}, () => worker()));
  const sorted = responses.map(r => r.duration_ms).sort((a,b) => a-b);
  return {sent: responses.length, ok:responses.filter(r => r.status >= 200 && r.status < 300).length, failed:responses.filter(r => r.status === 0 || r.status >= 500).length, p95_ms: Math.round(sorted[Math.ceil(sorted.length * .95) - 1]), statuses: responses.reduce((o,r) => (o[r.status] = (o[r.status] || 0) + 1, o), {})};
}
if (require.main === module) {
  try { const args = parseOptions(process.argv.slice(2)); run(args).then(stats => console.log(JSON.stringify(stats, null, 2))).catch(e => { console.error(e.message); process.exitCode = 1; }); }
  catch (e) { console.error(e.message); process.exitCode = 1; }
}
module.exports = { parseOptions, run };
