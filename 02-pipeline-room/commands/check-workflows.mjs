import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..', '..');
const names = ['devops-quality-2024.yml', 'devops-image-2024.yml', 'devops-release-2024.yml'];
const rootFolder = path.join(repoRoot, '.github', 'workflows');

for (const name of names) {
  const template = await readFile(path.join(scriptDir, '..', 'workflow-files', name), 'utf8');
  if (!/^on:\s*$/m.test(template)) throw new Error(`${name} is missing workflow triggers`);
  if (!/^permissions:\s*$/m.test(template)) throw new Error(`${name} needs explicit permissions`);
  if (!template.includes('actions/checkout@v4')) throw new Error(`${name} has no checkout step`);
  if (!template.includes('pipeline-room/build-lab')) throw new Error(`${name} does not reference the app`);
  const installed = path.join(rootFolder, name);
  try { await access(installed); }
  catch (err) {
    if (err.code === 'ENOENT') {
      console.error(`Missing ${installed}. Run commands/install-workflows.ps1 and try again.`);
      process.exitCode = 1;
      continue;
    }
    throw err;
  }
  if ((await readFile(installed, 'utf8')) !== template) {
    console.error(`${name} differs from the template. Check manually before merging.`);
    process.exitCode = 1;
  } else console.log(`OK ${name}`);
}
