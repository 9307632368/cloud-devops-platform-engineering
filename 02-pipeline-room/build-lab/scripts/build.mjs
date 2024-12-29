import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildBundle } from './bundle.mjs';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const manifest = await buildBundle(root, path.join(root, 'dist'));
console.log(`Built ${manifest.application} v${manifest.version} (${manifest.files.length} files)`);
