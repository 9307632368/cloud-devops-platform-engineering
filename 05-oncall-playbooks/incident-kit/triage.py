"""Read JSON-lines application logs and summarize what happened.

No third-party packages required. It reads one file; it does not query any
production services or change infrastructure.
"""
from __future__ import annotations

import argparse
import json
import math
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path


def parse_lines(text: str) -> tuple[list[dict], list[str]]:
    records = []
    warnings = []
    for number, line in enumerate(text.splitlines(), 1):
        if not line.strip():
            continue
        try:
            row = json.loads(line)
            if not isinstance(row, dict):
                raise ValueError('expected an object')
            if not isinstance(row.get('status'), int) or isinstance(row['status'], bool) or not 100 <= row['status'] <= 599:
                raise ValueError('status must be an HTTP status integer')
            duration = row.get('duration_ms')
            if not isinstance(duration, (int,float)) or isinstance(duration, bool) or not math.isfinite(duration) or duration < 0:
                raise ValueError('duration_ms must be a nonnegative number')
            # A log line without any time is still usable for counts.
            records.append(row)
        except (ValueError, json.JSONDecodeError) as exc:
            warnings.append(f'line {number}: {exc}')
    return records, warnings


def summarize(records: list[dict]) -> dict:
    if not records:
        return {'count': 0, 'server_errors': 0, 'error_rate_pct': 0.0, 'p95_ms': None, 'statuses': {}, 'routes': {}}
    elapsed = sorted(float(x['duration_ms']) for x in records)
    codes = Counter(str(row['status']) for row in records)
    routes = Counter(str(row.get('route', 'unknown')) for row in records)
    errors = sum(row['status'] >= 500 for row in records)
    return {
        'count': len(records), 'server_errors': errors,
        'error_rate_pct': round(errors * 100 / len(records), 2),
        'p95_ms': round(elapsed[math.ceil(len(elapsed) * .95) - 1], 2),
        'statuses': dict(sorted(codes.items())),
        'routes': dict(sorted(routes.items())),
    }


def build_report(stats: dict, warnings: list[str], source: str) -> str:
    severity = 'needs investigation' if stats['error_rate_pct'] > 20 or (stats['p95_ms'] or 0) > 250 else 'no threshold exceeded in this sample'
    return '\n'.join([
        '# Local log triage', '',
        f'- Log source: `{source}`',
        f'- Valid log entries: {stats["count"]}',
        f'- 5xx responses: {stats["server_errors"]} ({stats["error_rate_pct"]}%)',
        f'- P95 sample duration: {stats["p95_ms"] if stats["p95_ms"] is not None else "n/a"} ms',
        f'- First pass: **{severity}**',
        f'- Skipped malformed rows: {len(warnings)}', '',
        '## HTTP statuses', '',
        *[f'- {status}: {num}' for status, num in stats['statuses'].items()], '',
        '## Routes', '',
        *[f'- {route}: {num}' for route, num in stats['routes'].items()], '',
        '## What I would check next', '',
        '1. Confirm the time range; this report is based only on the supplied sample.',
        '2. Compare request rate, 5xx rate, and P95 latency on the dashboard.',
        '3. Check recent deployments and readiness before trying a rollback.',
        '4. Write down the actual cause only after collecting evidence.', '',
        'This is a learning report, **not** proof of a real outage or root cause.', ''
    ])


def main() -> int:
    parser = argparse.ArgumentParser(description='Review local JSONL service logs')
    parser.add_argument('path', type=Path)
    parser.add_argument('--write-report', type=Path, help='optional output Markdown path')
    args = parser.parse_args()
    try:
        records, warnings = parse_lines(args.path.read_text(encoding='utf-8'))
    except OSError as exc:
        parser.error(str(exc))
    report = build_report(summarize(records), warnings, args.path.name)
    print(report)
    if warnings:
        print('Input warnings:', *warnings, sep='\n - ')
    if args.write_report:
        args.write_report.parent.mkdir(parents=True, exist_ok=True)
        args.write_report.write_text(report, encoding='utf-8')
    return 0 if records else 2


if __name__ == '__main__':
    raise SystemExit(main())
