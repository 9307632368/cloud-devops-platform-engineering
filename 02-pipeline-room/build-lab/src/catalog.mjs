import { readFile } from 'node:fs/promises';

const STATUSES = new Set(['success', 'failed', 'running']);

/** Read a simple fixture file. For this demo it acts like a read-only database. */
export async function loadBuilds(filePath) {
  const parsed = JSON.parse(await readFile(filePath, 'utf8'));
  if (!Array.isArray(parsed) || !parsed.every((item) =>
    item && typeof item.id === 'string' && STATUSES.has(item.status))) {
    throw new Error('Invalid builds data');
  }
  return parsed;
}

export function filterBuilds(builds, { status, service, limit = 20 } = {}) {
  let rows = builds;
  if (status) rows = rows.filter((row) => row.status === status);
  if (service) rows = rows.filter((row) => row.service === service);
  return rows.slice(0, limit);
}

export function parseFilters(searchParams) {
  const status = searchParams.get('status');
  const service = searchParams.get('service');
  const rawLimit = searchParams.get('limit') ?? '20';

  if (status !== null && !STATUSES.has(status)) {
    return { error: 'status must be success, failed or running' };
  }
  if (service !== null && (!/^[a-z0-9-]{1,40}$/.test(service))) {
    return { error: 'service should be 1-40 lowercase letters, digits or hyphens' };
  }
  if (!/^[1-9]\d*$/.test(rawLimit) || Number(rawLimit) > 100) {
    return { error: 'limit must be an integer from 1 to 100' };
  }
  return { filters: { status, service, limit: Number(rawLimit) } };
}
