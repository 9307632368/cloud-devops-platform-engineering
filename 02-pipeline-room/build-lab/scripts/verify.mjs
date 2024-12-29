import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyBundle } from './bundle.mjs';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const tag = process.env.RELEASE_TAG || null;
const manifest = await verifyBundle(path.join(root, 'dist'), tag);
console.log(`Verified ${manifest.files.length} files for ${manifest.application} v${manifest.version}`);
