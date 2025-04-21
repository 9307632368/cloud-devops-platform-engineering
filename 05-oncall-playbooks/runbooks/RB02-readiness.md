# RB02 — API is alive but not ready

**Signals:** `/health/live` returns 200 while `/health/ready` returns 503; `lab_ready` is 0.

## What I check

1. Look for timeouts/errors from a dependency (database, queue, inventory service).
2. Check the dependency connection, access credentials and DNS.
3. See whether the problem affects one replica or every replica.
4. Keep unhealthy instances out of traffic; do not bypass readiness just to make a dashboard green.

## Try it

Set `FAULT_MODE=not-ready`, recreate only the demo service, then compare the two health endpoints. See `drills/README.md` for exact commands.

## Recovery

Reset `FAULT_MODE=normal`, recreate the service, then confirm both endpoints and a quote request succeed.
