import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm, unlink } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { buildBundle, verifyBundle } from '../scripts/bundle.mjs';

async function fixture(run) {
  const tmp = await mkdtemp(path.join(os.tmpdir(), 'pipeline-room-test-'));
  const src = path.join(tmp, 'src');
  const dist = path.join(tmp, 'dist');
  await mkdir(path.join(src, 'src'), { recursive: true });
  await mkdir(path.join(src, 'data'));
  await writeFile(path.join(src, 'package.json'), JSON.stringify({ name: 'demo', version: '1.2.3' }));
  await writeFile(path.join(src, 'src', 'server.mjs'), 'console.log("ok")\n');
  await writeFile(path.join(src, 'data', 'info.json'), '{"ok":true}\n');
  try { await run({ src, dist }); }
  finally { await rm(tmp, { recursive: true, force: true }); }
}

test('build produces version manifest', () => fixture(async ({src, dist}) => {
  const result = await buildBundle(src, dist);
  assert.equal(result.version, '1.2.3');
  assert.equal(result.files.length, 2);
}));
test('verification succeeds before changes', () => fixture(async ({src, dist}) => {
  await buildBundle(src, dist);
  assert.equal((await verifyBundle(dist)).version, '1.2.3');
}));
test('matching release tag accepted', () => fixture(async ({src, dist}) => {
  await buildBundle(src, dist);
  await verifyBundle(dist, 'v1.2.3');
}));
test('mismatching release tag rejected', () => fixture(async ({src, dist}) => {
  await buildBundle(src, dist);
  await assert.rejects(verifyBundle(dist, 'v9.0.0'), /Expected tag/);
}));
test('corrupted file detected', () => fixture(async ({src, dist}) => {
  await buildBundle(src, dist);
  await writeFile(path.join(dist, 'data', 'info.json'), '{"ok":false}\n');
  await assert.rejects(verifyBundle(dist), /SHA-256 mismatch/);
}));
test('missing file detected', () => fixture(async ({src, dist}) => {
  await buildBundle(src, dist);
  await unlink(path.join(dist, 'src', 'server.mjs'));
  await assert.rejects(verifyBundle(dist), /file list/);
}));
test('unexpected extra file detected', () => fixture(async ({src, dist}) => {
  await buildBundle(src, dist);
  await writeFile(path.join(dist, 'data', 'secret.txt'), 'untracked');
  await assert.rejects(verifyBundle(dist), /file list/);
}));
test('rebuild manifest is stable for same inputs', () => fixture(async ({src, dist}) => {
  await buildBundle(src, dist);
  const first = await readFile(path.join(dist, 'manifest.json'), 'utf8');
  await buildBundle(src, dist);
  const second = await readFile(path.join(dist, 'manifest.json'), 'utf8');
  assert.equal(first, second);
}));
