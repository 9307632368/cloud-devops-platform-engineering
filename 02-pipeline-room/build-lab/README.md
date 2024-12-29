# Release Status API (the app used in my CI/CD experiments)

I needed one small service that I could test, build, and put into a container without spending all the time on frontend code. This is the sample application for `pipeline-room`.

It uses Node.js built-ins and a JSON file. No database or third-party npm runtime packages. That is intentional: the interesting part of this folder is **what happens to code between a commit and a release**.

## Run it locally

Node.js 20.18.1 is the version used in the 2024 lab configuration.

```powershell
npm ci
npm test
npm run lint
npm run build
npm run verify
npm run start:dist
```

Open http://localhost:3000/health or use `requests.http` with the REST Client extension.

| Endpoint | Description |
| --- | --- |
| `GET /health` | health check for containers |
| `GET /api/version` | version from the bundle manifest |
| `GET /api/builds` | list of sample build results |
| `GET /api/builds?status=success&limit=2` | filtered and limited builds |
| `GET /api/builds/build-102` | one sample build |

The JSON file is demo data, not records of real production deployments. To keep the lab simple, this API is read-only. Try changing a sample build status, rerunning tests, and building a new bundle.

## What `npm run build` actually does

This is not a JavaScript compiler. `scripts/build.mjs` copies the runnable `src/` and `data/` files into `dist/` and writes `manifest.json` with the version and SHA-256 checksum for each file.

`npm run verify` checks that the bundle has exactly the listed files and none of them have changed. `RELEASE_TAG=v1.0.0 npm run verify` also checks that the release tag matches `package.json` version.

The container copies only `dist/` from the builder stage. This makes it easy to see whether the CI artifact and the running application have the same contents.

## Docker (requires Docker Desktop)

```powershell
docker build -t release-status-api:2024 .
docker run --rm -p 3000:3000 release-status-api:2024
```

The Dockerfile is a **2024-era learning example**. Before deploying anything publicly, review and update the base image to a currently maintained, security-patched version.

## Limits

- This API does not talk to real GitHub runs. Build events are fixtures in `data/builds.json`.
- The bundle hashes demonstrate integrity checking, but they are not signed attestations or protection against an attacker who can replace the whole bundle.
- Docker and the remote GitHub Actions workflows need to be tested once the folder is added to an actual GitHub repository.
