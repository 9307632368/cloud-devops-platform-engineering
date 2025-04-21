# RB01 — API cannot be reached

**Signals:** `up == 0`, scrape error, browser cannot reach `/health/live`.

## First five minutes

1. Check `docker compose ps` and `docker compose logs --tail 50 service`.
2. Try `curl.exe -i http://127.0.0.1:8080/health/live`.
3. Check if the app exited, the port is occupied, or Prometheus has the wrong target.
4. Check the last deployment/build instead of restarting randomly.

## In this lab

Stop only the service using `docker compose stop service`. Watch the `LabServiceDown` alert. Start it again with `docker compose up -d service` and verify `up` returns to 1.

## Recovery check

Verify liveness, readiness, an actual quote request, and a recovering graph. Write down when it started, what you changed, and what evidence proves recovery.

A container restart may help the demonstration. It does **not** automatically mean the root cause is fixed in production.
