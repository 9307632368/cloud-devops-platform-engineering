#!/usr/bin/env sh
set -eu
REPO_ROOT="$(CDPATH= cd -- "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT/pipeline-room/build-lab"
npm ci --ignore-scripts
npm run lint
npm test
npm run build
npm run verify
cd "$REPO_ROOT/container-workbench/service-status-api"
npm test
node "$REPO_ROOT/pipeline-room/commands/check-workflows.mjs"
printf 'Local checks passed.\n'
