const SERVICE_NAME = /^[a-z][a-z0-9-]{2,31}$/;
const ALLOWED_STATUSES = new Set(['ok', 'warn']);

export function createHeartbeatStore({ now = () => Date.now(), ttlMs = 90_000, limit = 200 } = {}) {
  const entries = new Map();

  function record(payload) {
    if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
      return { error: 'JSON object required' };
    }
    const { service, status, note = '' } = payload;
    if (typeof service !== 'string' || !SERVICE_NAME.test(service)) {
      return { error: 'service must be 3-32 lowercase letters, digits or hyphens; start with a letter' };
    }
    if (!ALLOWED_STATUSES.has(status)) {
      return { error: 'status must be ok or warn' };
    }
    if (typeof note !== 'string' || note.length > 120) {
      return { error: 'note must be a string with at most 120 characters' };
    }
    if (!entries.has(service) && entries.size >= limit) {
      return { error: 'service limit reached', code: 409 };
    }
    const saved = { service, status, note, lastSeen: new Date(now()).toISOString() };
    entries.set(service, saved);
    return { saved };
  }

  function put(payload) {
    const existed = typeof payload?.service === 'string' && entries.has(payload.service);
    const outcome = record(payload);
    if (outcome.saved) return { ...outcome, created: !existed };
    return outcome;
  }

  function list({ filter } = {}) {
    const ts = now();
    return Array.from(entries.values())
      .map((entry) => ({ ...entry, online: ts - Date.parse(entry.lastSeen) < ttlMs }))
      .filter((entry) => !filter || (filter === 'online' ? entry.online : !entry.online))
      .sort((a, b) => a.service.localeCompare(b.service));
  }

  return { put, list, size: () => entries.size };
}
