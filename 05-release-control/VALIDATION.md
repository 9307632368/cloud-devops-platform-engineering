# Validation notes

I ran these checks when packaging this lab:

- `python -m pytest -q` — **34 passing** Python tests for the release CLI and Kubernetes/Argo YAML checks.
- `npm test` inside `parcel-api/` — **9 passing** Node.js API tests.
- Extracted the ZIP into a clean folder and ran both test suites again.

**Limitations:** `docker build`, `kubectl kustomize`, live Argo CD sync, and production deployments were **not** tested here because those tools/services are not available in this environment. The exact 2024 Python dependency versions were not independently reinstalled here; checks ran using locally installed packages.

The release script edits Git files only. It does not perform real deployments or guarantee production safety.
