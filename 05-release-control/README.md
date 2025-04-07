# Release control (2024 lab)

This folder is where I'm trying out the part that happens **after** an application works locally: making a release, promoting the same image to another environment, and going back if something breaks.

I used a small parcel status API as the app. The interesting part here is not the API itself; it is the release flow around it. All promotion commands only **change files on disk**. They do not contact a cluster, publish an image, or push to GitHub automatically.

## What is inside

| Folder | Why it is here |
| --- | --- |
| `parcel-api/` | small Node HTTP service with tests and Dockerfile |
| `gitops/base/` | common Kubernetes resources |
| `gitops/overlays/{dev,staging,prod}/` | environment settings and image digest pins |
| `gitops/argocd/` | examples of Argo CD Applications (manual sync) |
| `tools/release.py` | promote, dry-run, status, and rollback commands |
| `release-history/ledger.json` | local log of changes made by the tool |
| `workflow-templates/` | GitHub Actions workflow **templates** to copy into the actual repo root |
| `notes/` | architecture sketch, exercises, and what to check when something fails |
| `tests/` | tests for promotion rules and release states |

## Quick start on Windows (PowerShell)

Run these commands while you are inside **this** `release-control` folder.

```powershell
# Python 3.11 (or another supported Python 3.x)
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements-dev.txt
python -m pytest -q

# Node.js 20 (2024-era target)
cd parcel-api
npm test
npm start
# open http://localhost:3000/healthz and /api/parcels
```

In a second terminal, go back to this folder:

```powershell
python tools/release.py status
python tools/release.py plan dev --version v1.2.0 --digest sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
```

The SHA shown above is an **example**, not a published Docker image. To promote a real release, replace the digest with the one from your container registry. These commands only change local files; `plan` changes nothing.

## The flow I am using

1. Run the Node tests and build/push the image with a version tag.
2. Note the registry's immutable `sha256:...` image digest.
3. Run `plan`, then `promote dev` with the **real** digest.
4. Review and commit the changes to Git. Have Argo CD sync dev only after the image exists.
5. Test dev. Promote the *same version and digest* to staging and then production. The script checks this order.
6. If a release has a problem, use `history` and `rollback` to go back to a previously promoted digest. Commit and sync the rollback.

Before syncing anything, change `YOUR_GITHUB_USER` in the manifests, workflow and Argo CD repository URL. The sample overlays initially use a deliberately invalid image digest and must not be synced as-is. Production changes need `--approve-prod`, but that flag is **not** a substitute for human review or GitHub protection rules.

## What I checked

- Node unit tests and Python release-script tests can run locally.
- YAML files are parsed and checked by Python tests.
- I could **not** run a real Kubernetes cluster, Argo CD or Docker engine in this environment. The manifests and release workflow still need deployment testing on your machine.

I kept the command names simple so I can explain them in an interview and understand what changed in Git. The project is a **learning implementation**, not a live production deployment.

## Reference versions (2024)

- Node.js **20.18.1** (20 November 2024): https://nodejs.org/en/blog/release/v20.18.1
- Kubernetes **1.30** (April 2024): https://kubernetes.io/blog/2024/04/17/kubernetes-v1-30-release/
- Argo CD **2.12** (August 2024): https://argo-cd.readthedocs.io/en/release-2.12/
- PyYAML **6.0.2** (6 August 2024): https://pypi.org/project/PyYAML/6.0.2/
- pytest **8.3.4** (December 2024): https://docs.pytest.org/en/stable/changelog.html

Versions represent a 2024 learning stack. Using an old stack for a current public deployment may require security upgrades.
