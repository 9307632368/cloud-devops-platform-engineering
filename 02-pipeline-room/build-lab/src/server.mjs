import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeApp } from './http.mjs';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const port = Number(process.env.PORT ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be between 1 and 65535');
}

const app = makeApp({
  dataPath: path.join(root, 'data', 'builds.json'),
  manifestPath: path.join(root, 'manifest.json'),
  fallbackVersion: '1.0.0-dev',
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Release status API listening on http://localhost:${port}`);
});
