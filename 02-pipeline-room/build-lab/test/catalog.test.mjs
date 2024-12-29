import test from 'node:test';
import assert from 'node:assert/strict';
import { filterBuilds, parseFilters, loadBuilds } from '../src/catalog.mjs';

const records = [
  { id: 'a', service: 'billing', status: 'success' },
  { id: 'b', service: 'api', status: 'failed' },
  { id: 'c', service: 'billing', status: 'running' },
];

function query(text) { return new URLSearchParams(text); }

test('filter supports status', () => assert.deepEqual(filterBuilds(records, { status: 'success' }).map(r => r.id), ['a']));
test('filter supports service', () => assert.deepEqual(filterBuilds(records, { service: 'billing' }).map(r => r.id), ['a', 'c']));
test('filter supports limit', () => assert.equal(filterBuilds(records, { limit: 1 }).length, 1));
test('filter allows combined filters', () => assert.deepEqual(filterBuilds(records, { service: 'billing', status: 'running' }).map(r => r.id), ['c']));
test('filter does not mutate source', () => { filterBuilds(records, { limit: 1 }); assert.equal(records.length, 3); });
test('default limit is 20', () => assert.equal(parseFilters(query('')).filters.limit, 20));
test('valid limit', () => assert.equal(parseFilters(query('limit=100')).filters.limit, 100));
test('invalid limit rejected', () => { for (const v of ['0','-1','101','abc','1.2','01']) assert.ok(parseFilters(query(`limit=${v}`)).error); });
test('invalid status rejected', () => assert.match(parseFilters(query('status=done')).error, /status/));
test('bad service rejected', () => assert.match(parseFilters(query('service=Hello!!')).error, /service/));
test('allowed filter fields parsed', () => assert.equal(parseFilters(query('status=failed&service=api')).filters.status, 'failed'));
test('loads fixtures on disk', async () => { const items = await loadBuilds(new URL('../data/builds.json', import.meta.url)); assert.equal(items.length, 4); });
