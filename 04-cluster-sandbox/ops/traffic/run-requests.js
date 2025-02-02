'use strict';
// node ops/traffic/run-requests.js http://127.0.0.1:8080 60 6
const base = process.argv[2] || 'http://127.0.0.1:8080';
const total = Number(process.argv[3] || 60);
const concurrency = Number(process.argv[4] || 6);
if (!Number.isSafeInteger(total) || total < 1 || total > 2000 ||
    !Number.isSafeInteger(concurrency) || concurrency < 1 || concurrency > 100 ||
    concurrency > total) {
  console.error('Usage: node run-requests.js <base-url> <1..2000 requests> <1..100 concurrency>');
  process.exit(1);
}
const stats = { ok: 0, failed: 0, pods: {} };
let cursor = 0;
async function worker() {
  while (cursor < total) {
    cursor += 1;
    try {
      const res = await fetch(`${base}/api/quote?zone=local&weight_grams=1001`,
        {signal: AbortSignal.timeout(5000)});
      const json = await res.json();
      if (!res.ok || json.amountPaise !== 8000) throw new Error('Bad status or price');
      stats.ok++;
      stats.pods[json.pod] = (stats.pods[json.pod] || 0) + 1;
    } catch (e) {
      stats.failed++;
      console.error(e.message);
    }
  }
}
Promise.all(Array.from({length: concurrency}, () => worker())).then(() => {
  console.log(JSON.stringify(stats, null, 2));
  if (stats.failed) process.exitCode = 1;
});
