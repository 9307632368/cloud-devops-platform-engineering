# Two-container deployment: Nginx + status API

I kept the Compose part separate from the application because here the point is networking, deployment and troubleshooting.

```text
Windows laptop
    |
    | http://127.0.0.1:8088
    v
Nginx proxy :80  --->  API service :8080 (not published on host)
```

## Start

Run from **this** folder (`compose-demo`):

```powershell
docker compose config
docker compose up --build -d
docker compose ps
.\smoke-test.ps1
```

If PowerShell blocks scripts, try these commands manually:

```powershell
Invoke-RestMethod http://127.0.0.1:8088/health/ready
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8088/api/heartbeats -ContentType 'application/json' -Body '{"service":"orders-worker","status":"ok"}'
Invoke-RestMethod http://127.0.0.1:8088/api/services
```

## Inspect

```powershell
docker compose ps
docker compose logs -f --tail 30 api
docker compose exec api node --version
docker compose exec api id
docker compose images
```

The `id` command should show that the API does not run as root. The API container uses a read-only root filesystem and a writable temporary `/tmp` mount (it does not need file writes for this demo).

## Stop

```powershell
docker compose down
```

Do not use `docker compose down -v` blindly on other projects; it also deletes named volumes.

## Quick exercises

1. Change the host port by copying `.env.example` to `.env`, then set `APP_PORT=8090`.
2. Look at `docker compose logs api` after sending three requests.
3. Run `docker compose exec api node -p 'process.getuid()'` to confirm non-root.
4. Set `MAINTENANCE_MODE=true` in `.env`, then `docker compose up -d --force-recreate`. The API is intentionally not ready, so the proxy may fail to start; restore `false` afterwards.
5. From your laptop, try `http://localhost:8080`. It should not reach the API from Compose because only Nginx publishes a host port (unless you still have a local server running).

This setup is only for localhost and learning. It is not an HTTPS deployment and it has no authentication or persistent storage.
