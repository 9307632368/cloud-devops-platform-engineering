# Things to try yourself

1. Add a `/api/parcels?status=delivered` filter and write tests for it.
2. Make a `v1.0.0` and `v1.1.0` release in a **temporary copy** of this folder. Compare `git diff`.
3. Try promoting staging before dev. Read the error message and explain why that check exists.
4. Try promoting prod without `--approve-prod`.
5. Add an HTTP smoke-test script that checks `/version` after a deployment.
6. Add a GitHub Actions environment approval to the publish workflow.
7. Add a test that deliberately corrupts `release-patch.yaml` and checks whether validation rejects it.

**Interview idea:** Explain why an immutable digest is safer for promotion than a mutable tag such as `latest`. Then explain what GitOps does *not* solve automatically.
