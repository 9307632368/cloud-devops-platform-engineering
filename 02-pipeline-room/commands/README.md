# Commands I actually use

I keep the PowerShell commands here because I usually run these from the root of the GitHub repository.

1. Extract this ZIP **into** `cloud-devops-platform-engineering/pipeline-room/`.
2. From the repository root, run `powershell -File .\pipeline-room\commands\install-workflows.ps1` (or `pwsh -File ...`).
3. Look at what was copied into `.github/workflows/`. Those are the paths GitHub actually reads.
4. Run `powershell -File .\pipeline-room\commands\run-local-ci.ps1`.
5. After the tests pass, commit the files and open a small pull request.

The installer does not replace an existing workflow unless you add `-Overwrite`. It also checks that the earlier `container-workbench/service-status-api` example is present, since the quality workflow tests both applications.

If you prefer Git Bash / macOS / Linux, use `sh pipeline-room/commands/run-local-ci.sh`.

**Note:** `check-workflows.mjs` is a lightweight path/content sanity check, not a complete YAML validator or a replacement for running GitHub Actions remotely.
