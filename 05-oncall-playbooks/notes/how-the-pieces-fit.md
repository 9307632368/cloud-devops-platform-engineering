# How I connected the monitoring parts

I found it easier to understand this setup by tracing a single request.

```text
PowerShell / browser
       |
       v
  Node quote API :8080 -----> JSON request log -> triage.py
       |
       +---- /metrics <----- Prometheus :9090
                                 |           |
                                 |           +--> Alertmanager :9093
                                 |                 (UI only, no paging)
                                 v
                           Grafana :3000
```

My checks for each part:

1. Open `/health/live` to see if the Node process answers HTTP.
2. Open `/health/ready` to see whether the app says it can serve requests.
3. Open `/metrics` to confirm that there are counters and histogram buckets.
4. Open Prometheus Targets to see if its scrape works from *inside* Docker.
5. Open Grafana and run some quote requests to see graphs change.
6. Cause one **simulated** failure, read the matching runbook and reset the service.

### Why not just check the Docker container status?

A container can be running and still serve errors. Similarly, it may answer a liveness probe while a dependency is unavailable. For this reason I kept the two health endpoints separate and added a business API metric.
