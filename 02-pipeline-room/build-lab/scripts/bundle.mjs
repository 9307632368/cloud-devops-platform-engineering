import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

export const COPY_PATHS = ['src', 'data'];

async function collectFiles(directory, prefix = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  const found = [];
  for (const item of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const rel = path.posix.join(prefix, item.name);
    if (item.isDirectory()) found.push(...await collectFiles(path.join(directory, item.name), rel));
    else if (item.isFile()) found.push(rel);
    else throw new Error(`Unsupported path type in bundle: ${rel}`);
  }
  return found;
}

export async function buildBundle(sourceDir, destDir) {
  const pkg = JSON.parse(await readFile(path.join(sourceDir, 'package.json'), 'utf8'));
  if (!/^\d+\.\d+\.\d+$/.test(pkg.version)) throw new Error('Version must use x.y.z');
  await rm(destDir, { recursive: true, force: true });
  await mkdir(destDir, { recursive: true });
  for (const folder of COPY_PATHS) await cp(path.join(sourceDir, folder), path.join(destDir, folder), { recursive: true });
  const files = (await collectFiles(destDir)).sort();
  const hashes = [];
  for (const name of files) {
    const buffer = await readFile(path.join(destDir, name));
    hashes.push({ path: name, sha256: createHash('sha256').update(buffer).digest('hex') });
  }
  const manifest = { application: pkg.name, version: pkg.version, files: hashes };
  await writeFile(path.join(destDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  return manifest;
}

export async function verifyBundle(destDir, expectedTag = null) {
  const manifest = JSON.parse(await readFile(path.join(destDir, 'manifest.json'), 'utf8'));
  if (expectedTag && expectedTag !== `v${manifest.version}`) {
    throw new Error(`Expected tag v${manifest.version}, received ${expectedTag}`);
  }
  const actual = (await collectFiles(destDir)).filter((name) => name !== 'manifest.json').sort();
  const declared = manifest.files.map((item) => item.path).sort();
  if (actual.join('\n') !== declared.join('\n')) throw new Error('Bundle file list has changed');
  for (const file of manifest.files) {
    const buffer = await readFile(path.join(destDir, file.path));
    const digest = createHash('sha256').update(buffer).digest('hex');
    if (digest !== file.sha256) throw new Error(`SHA-256 mismatch: ${file.path}`);
  }
  return manifest;
}
