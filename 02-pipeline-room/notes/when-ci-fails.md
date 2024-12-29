# Notes for debugging a red workflow

| Symptom | What I would check first |
| --- | --- |
| Workflow never appears in Actions | Files must be in *root* `.github/workflows/`, not just `pipeline-room/workflow-files/` |
| `npm ci` fails | A lockfile must be committed, versions must match package.json, and network access to npm must be possible if dependencies exist |
| `Cannot find module` | Check working-directory and relative paths; actions start at repo root unless changed |
| Bundle checksum mismatch | Someone edited `dist/` after building; run build again, then verify |
| Release job fails on tag | `vX.Y.Z` must match `package.json` |
| GHCR push gets 403 | Check `packages: write`, GitHub Actions repo settings and org package policies; don't print tokens |
| Docker build failure | Reproduce with `docker build` at the path used by the action, inspect copy paths and base image availability |
| PR green but main push red | PR builds don't publish. A main push additionally requires GHCR permissions |

When debugging, read the *first* failing command and its exit code before retrying the whole pipeline. I keep the logs clean by printing only short errors, not environment variables or secret values.
