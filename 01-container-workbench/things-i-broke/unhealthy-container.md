# Drill: the process runs but is not ready

**Goal:** See why liveness and readiness are separate.

1. Copy `compose-demo/.env.example` to `compose-demo/.env`.
2. Set `MAINTENANCE_MODE=true`.
3. From `compose-demo` run `docker compose up --build -d`.
4. Inspect: `docker compose ps`; then `docker compose logs --tail 30 api`.
5. In a separate window, run `docker compose exec api node -e "require('node:http').get('http://127.0.0.1:8080/health/live',r=>console.log(r.statusCode))"`.
6. Repeat for `/health/ready` and compare HTTP status codes.
7. Set `MAINTENANCE_MODE=false` and rerun `docker compose up -d --force-recreate`.

**What happened?** The process could accept requests, but the healthcheck was configured to fail readiness. Compose avoids starting the proxy until that dependency is healthy.
