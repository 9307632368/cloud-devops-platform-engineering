"""Small local GitOps release helper; it does not deploy anything."""
from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
import re
import sys
import tempfile

import yaml

ROOT = Path(__file__).resolve().parent.parent
ENVS = ('dev', 'staging', 'prod')
IMAGE_NAME = 'ghcr.io/YOUR_GITHUB_USER/parcel-release-lab'
VERSION_RE = re.compile(r'^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?$')
DIGEST_RE = re.compile(r'^sha256:[a-f0-9]{64}$')
PLACEHOLDER = 'sha256:' + '0' * 64

class ReleaseError(Exception):
    pass


def validate_release(version: str, digest: str) -> None:
    if not VERSION_RE.fullmatch(version):
        raise ReleaseError('Expected a release version such as v1.2.3 or v1.2.3-rc1.')
    if not DIGEST_RE.fullmatch(digest) or digest == PLACEHOLDER:
        raise ReleaseError('Expected a real-looking SHA-256 image digest (sha256: plus 64 lowercase hex digits).')


def paths(root: Path, env: str) -> tuple[Path, Path]:
    if env not in ENVS:
        raise ReleaseError('Environment must be dev, staging, or prod.')
    folder = root / 'gitops' / 'overlays' / env
    return folder / 'kustomization.yaml', folder / 'release-patch.yaml'


def read_yaml(path: Path) -> dict:
    result = yaml.safe_load(path.read_text(encoding='utf-8'))
    if not isinstance(result, dict):
        raise ReleaseError(f'Expected an object in {path}.')
    return result


def read_ledger(root: Path) -> dict:
    doc = json.loads((root / 'release-history' / 'ledger.json').read_text(encoding='utf-8'))
    if doc.get('schema') != 1 or not isinstance(doc.get('events'), list):
        raise ReleaseError('Invalid release ledger format.')
    return doc


def current(events: list[dict], env: str) -> dict | None:
    return next((event for event in reversed(events) if event['environment'] == env), None)


def permitted(events: list[dict], env: str, version: str, digest: str, approve_prod: bool) -> None:
    if env == 'prod' and not approve_prod:
        raise ReleaseError('Production changes need --approve-prod (and a normal Git review).')
    predecessor = {'staging': 'dev', 'prod': 'staging'}.get(env)
    if predecessor:
        done = current(events, predecessor)
        if done is None or (done['version'], done['digest']) != (version, digest):
            raise ReleaseError(f'Promote the exact same version and digest to {predecessor} first.')


def validate_overlay(doc: dict) -> dict:
    images = doc.get('images')
    if not isinstance(images, list) or len(images) != 1 or images[0].get('name') != IMAGE_NAME:
        raise ReleaseError('Overlay has an unexpected image entry; review it manually.')
    return images[0]


def validate_patch(doc: dict) -> None:
    if doc.get('kind') != 'Deployment' or doc.get('metadata', {}).get('name') != 'parcel-status':
        raise ReleaseError('Unexpected release patch Deployment target.')
    containers = doc.get('spec', {}).get('template', {}).get('spec', {}).get('containers', [])
    if len(containers) != 1 or containers[0].get('name') != 'api':
        raise ReleaseError('Unexpected release patch container.')
    values = [e for e in containers[0].get('env', []) if e.get('name') == 'APP_VERSION']
    if len(values) != 1:
        raise ReleaseError('Exactly one APP_VERSION environment entry is required.')


def write_atomic(path: Path, content: str) -> None:
    fd, name = tempfile.mkstemp(prefix='.release-', dir=path.parent, text=True)
    try:
        with os.fdopen(fd, 'w', encoding='utf-8', newline='\n') as f:
            f.write(content)
        os.replace(name, path)
    finally:
        if os.path.exists(name):
            os.unlink(name)


def save_release(root: Path, env: str, version: str, digest: str, action: str, events: list[dict]) -> None:
    image_path, patch_path = paths(root, env)
    image_doc = read_yaml(image_path)
    patch_doc = read_yaml(patch_path)
    image = validate_overlay(image_doc)
    validate_patch(patch_doc)
    # Write the release version in both a pod annotation and the API env var.
    image['digest'] = digest
    pod = patch_doc['spec']['template']
    pod.setdefault('metadata', {}).setdefault('annotations', {})['release-lab/version'] = version
    for item in pod['spec']['containers'][0]['env']:
        if item['name'] == 'APP_VERSION':
            item['value'] = version
    previous = current(events, env)
    if previous and (previous['version'], previous['digest']) == (version, digest):
        raise ReleaseError(f'{env} already points to {version} with that digest.')
    event = {'action': action, 'environment': env, 'version': version, 'digest': digest,
             'previous_version': previous['version'] if previous else None,
             'previous_digest': previous['digest'] if previous else None}
    # Individual files are replaced safely; the three-file update is not a DB transaction.
    write_atomic(image_path, yaml.safe_dump(image_doc, sort_keys=False))
    write_atomic(patch_path, yaml.safe_dump(patch_doc, sort_keys=False))
    write_atomic(root / 'release-history' / 'ledger.json', json.dumps({'schema': 1, 'events': events + [event]}, indent=2) + '\n')


def plan(events: list[dict], env: str, version: str, digest: str, approve_prod: bool) -> str:
    validate_release(version, digest)
    permitted(events, env, version, digest, approve_prod)
    old = current(events, env)
    return f'{env}: {old["version"] if old else "UNPUBLISHED"} -> {version}\nimage: {digest}\nThis is a local file edit, not a Kubernetes deployment.'


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description='Update GitOps release files; does not deploy to a cluster.')
    ap.add_argument('--root', type=Path, default=ROOT, help='folder containing gitops/ and release-history/')
    sp = ap.add_subparsers(dest='cmd', required=True)
    sp.add_parser('status')
    history_parser = sp.add_parser('history')
    history_parser.add_argument('--environment', choices=ENVS)
    for action in ('plan', 'promote'):
        p = sp.add_parser(action)
        p.add_argument('environment', choices=ENVS)
        p.add_argument('--version', required=True)
        p.add_argument('--digest', required=True)
        p.add_argument('--approve-prod', action='store_true')
    rollback = sp.add_parser('rollback')
    rollback.add_argument('environment', choices=ENVS)
    rollback.add_argument('--to', required=True, help='earlier version promoted to this same environment')
    rollback.add_argument('--approve-prod', action='store_true')
    args = ap.parse_args(argv)
    try:
        events = read_ledger(args.root)['events']
        if args.cmd == 'status':
            for env in ENVS:
                entry = current(events, env)
                print(f'{env:8} {entry["version"] if entry else "UNPUBLISHED"} {entry["digest"] if entry else "(placeholder; do not sync)"}')
        elif args.cmd == 'history':
            filtered = [e for e in events if not args.environment or e['environment'] == args.environment]
            for e in filtered:
                print(f'{e["action"]:8} {e["environment"]:8} {e["version"]:16} {e["digest"]}')
            if not filtered:
                print('No releases recorded yet.')
        elif args.cmd in ('plan','promote'):
            print(plan(events, args.environment, args.version, args.digest, args.approve_prod))
            if args.cmd == 'promote':
                save_release(args.root, args.environment, args.version, args.digest, 'promote', events)
                print('Files updated. Check git diff before committing.')
        elif args.cmd == 'rollback':
            if args.environment == 'prod' and not args.approve_prod:
                raise ReleaseError('Production rollback needs --approve-prod.')
            matches = [e for e in events if e['environment'] == args.environment and e['version'] == args.to]
            if not matches:
                raise ReleaseError('That version was not previously recorded in this environment.')
            target = matches[-1]
            save_release(args.root, args.environment, target['version'], target['digest'], 'rollback', events)
            print(f'Changed {args.environment} back to {target["version"]}. Check git diff, commit, and sync manually.')
        return 0
    except (ReleaseError, FileNotFoundError, KeyError, ValueError, yaml.YAMLError) as exc:
        print(f'Release error: {exc}', file=sys.stderr)
        return 2

if __name__ == '__main__':
    sys.exit(main())
