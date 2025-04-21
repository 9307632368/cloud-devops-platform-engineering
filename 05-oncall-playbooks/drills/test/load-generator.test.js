const {test} = require('node:test');
const assert = require('node:assert/strict');
const {parseOptions, run} = require('../load-generator');

test('defaults to safe loopback address', () => assert.equal(parseOptions([]).base, 'http://127.0.0.1:8080'));
for (const url of ['http://example.com','https://localhost:8080','http://10.0.0.2:8080','http://0.0.0.0:8080']) {
  test('rejects non-loopback target ' + url, () => assert.throws(() => parseOptions(['--base', url])));
}
for (const value of ['0','501','nan','-1','2.5']) {
  test('rejects request count ' + value, () => assert.throws(() => parseOptions(['--count', value])));
}
test('rejects too much concurrency', () => assert.throws(() => parseOptions(['--concurrency','100'])));
test('rejects unknown CLI flags', () => assert.throws(() => parseOptions(['--anything','1'])));
test('summarizes responses accurately', async () => {
  let index = 0;
  const fakeFetch = async () => ({status: ++index < 3 ? 200 : 503, arrayBuffer: async () => Buffer.from('ok')});
  const result = await run({base:'http://127.0.0.1:8080',count:4,concurrency:1}, fakeFetch);
  assert.equal(result.sent,4); assert.equal(result.ok,2); assert.equal(result.failed,2);
});
