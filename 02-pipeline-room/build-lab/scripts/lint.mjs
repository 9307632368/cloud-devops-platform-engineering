import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname), '..');
const files = [];
for (const folder of ['src', 'scripts', 'test']) {
  for (const name of await readdir(path.join(root, folder))) {
    if (name.endsWith('.mjs')) files.push(path.join(root, folder, name));
  }
}
for (const file of files) {
  const result = spawnSync(process.execPath, ['--check', file], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
console.log(`Syntax checked ${files.length} JavaScript files`);
