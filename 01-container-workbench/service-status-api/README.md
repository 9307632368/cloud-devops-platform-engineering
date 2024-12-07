# Service status API

This isn't intended as a general-purpose backend framework. I needed a small application that produces logs, has health endpoints, receives traffic, and can fail during a deployment exercise.

The API receives heartbeat messages from imagined background services. The data is **in memory**, so it disappears on restart. For real use it would need a database, authentication, proper metrics and an audit trail.

## Running it locally

```powershell
node --version
node --test
node src/server.js
```

In a separate PowerShell terminal:

```powershell
Invoke-RestMethod -Uri http://localhost:8080/health/ready
Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/heartbeats -ContentType 'application/json' -Body '{"service":"queue-worker","status":"ok"}'
Invoke-RestMethod -Uri http://localhost:8080/api/services
```

## Working with Docker

```powershell
docker build -t service-status:2024 .
docker run --rm -p 127.0.0.1:8080:8080 --name status-api service-status:2024
```

In another terminal:

```powershell
docker inspect --format '{{json .State.Health}}' status-api
docker logs --tail 20 status-api
```

The Dockerfile runs the tests in a build stage and keeps just the app files for the runtime stage. It also runs as the non-root `node` user. `node:20.18.1-alpine3.20` is a November 2024-era image tag. This is for historical learning; do **not** assume 2024 images remain secure for internet-facing deployment in 2026.

## Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/health/live` | Is the process responding? |
| GET | `/health/ready` | Should it receive traffic? |
| GET | `/api/services` | List reported services; supports `?filter=online` |
| POST | `/api/heartbeats` | Create/update heartbeat |
| GET | `/metrics` | Tiny Prometheus-style counters (demo only) |

A service becomes offline if no new heartbeat arrived in 90 seconds. You can send a new heartbeat to bring it back online.

## Deliberate failure

```powershell
docker run --rm -p 127.0.0.1:8080:8080 -e MAINTENANCE_MODE=true service-status:2024
```

Try `/health/live` (200) and `/health/ready` (503). A healthcheck looking at readiness will mark this container unhealthy.

## What I'd improve next

Persist heartbeats in a database, secure the write endpoint, add proper tracing, and test under concurrent traffic. For now I deliberately kept dependencies at zero so the container behaviour is the main subject.
