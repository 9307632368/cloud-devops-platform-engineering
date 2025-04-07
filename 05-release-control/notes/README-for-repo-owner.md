# When adding this folder to a bigger GitHub repo

Your repository name is `cloud-devops-platform-engineering`. Put these files under `release-control/` and keep its own README.

GitHub Actions will **not** run from inside `release-control/workflow-templates/`. Copy the two workflow YAML files into the top-level `.github/workflows/` using:

```powershell
.\release-control\tools\install-workflows.ps1 -RepositoryRoot .
```

Review the destination before using `-Force`. The script does not push or commit anything.

Argo CD sample Applications refer to `release-control/gitops/overlays/...` inside the main repository, so their paths should line up once the folder is uploaded.
