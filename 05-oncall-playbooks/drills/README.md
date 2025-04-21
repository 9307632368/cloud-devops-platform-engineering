# Trying out incidents locally

These are drills, not real production incidents. I wanted a safe way to see what a dashboard looks like when a service starts failing.

## Basic traffic

In a separate PowerShell window (after `docker compose up -d --build`):

```powershell
node drills/load-generator.js --count 100 --concurrency 4
```

The tool refuses to send traffic to non-local hosts. The cap is 500 requests and 20 concurrent workers.

## Simulate a high error rate

```powershell
$env:FAULT_MODE = "errors"
docker compose up -d --no-deps --force-recreate service
node drills/load-generator.js --count 100 --concurrency 4
```

Prometheus checks alerts periodically, so allow enough scraping/evaluation time before assuming there is a problem with the alert.

## Simulate a slow API

```powershell
$env:FAULT_MODE = "slow"
docker compose up -d --no-deps --force-recreate service
node drills/load-generator.js --count 100 --concurrency 4
```

## Simulate a dependency not ready

```powershell
$env:FAULT_MODE = "not-ready"
docker compose up -d --no-deps --force-recreate service
curl.exe -i http://localhost:8080/health/ready
```

## Simulate a stopped service

```powershell
docker compose stop service
```

## Reset everything without deleting the monitoring database

```powershell
$env:FAULT_MODE = "normal"
docker compose up -d --no-deps --force-recreate service
```

If you used `docker compose stop service`, the last command brings it up again.

`docker compose down -v` deletes local monitoring history and is **not** part of the normal reset.
