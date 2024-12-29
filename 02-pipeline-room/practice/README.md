# Small experiments to try

These are exercises rather than screenshots of tests I claim to have performed. Do them in a separate branch.

### Experiment A — break one test

Change the expected `/health` response in `build-lab/test/http.test.mjs` and run `npm test`. The failing output should point to the mismatch. Undo the change before committing.

### Experiment B — catch an altered build file

Run `npm run build`, edit `dist/data/builds.json` by hand and run `npm run verify`. Verification should fail with a SHA-256 mismatch. Rebuild to restore it.

### Experiment C — wrong tag version

Build and try:

```powershell
$env:RELEASE_TAG = "v9.9.9"
npm run verify
Remove-Item Env:RELEASE_TAG
```

The command should reject the tag because it does not match `package.json`.

### Experiment D — watch a PR vs push

After the workflow files are installed, open a test pull request with a small change in `pipeline-room/build-lab/`. The Docker workflow should build but not publish. Merging to the `main` branch should attempt publication; this step requires GitHub package permissions and a working registry setup.

### Experiment E — missing workflow path

Temporarily rename a file under `.github/workflows/`, run `node pipeline-room/commands/check-workflows.mjs`, and read the warning. Restore the file afterwards. This illustrates why copying YAML into `workflow-files/` alone isn't enough.
