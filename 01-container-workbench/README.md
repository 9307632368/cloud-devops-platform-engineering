# Container workbench

This is the first part of my Cloud / DevOps repository (2024 track). I wanted to understand what actually happens after writing a Dockerfile, not just memorize commands.

I used a small service-status API so there is something real to containerize. Then I put an Nginx proxy in front of it and added a few things to deliberately break and troubleshoot.

## What is here

| Place | What I tried |
| --- | --- |
| `service-status-api/` | A Node HTTP service, tests, Dockerfile, container healthcheck, non-root user |
| `compose-demo/` | Two containers, service networking, reverse proxy, health-gated startup |
| `things-i-broke/` | Port conflicts, unhealthy containers, wrong proxy targets |
| `lab-notes/` | Small notes, commands I actually use, diagram |

No npm packages need to be downloaded to run the service; Node 20 built-ins are enough.

## Start here (Windows PowerShell)

Install Docker Desktop with Linux containers and Node.js 20 (the exercise targets the 2024 Node 20 LTS release).

```powershell
cd service-status-api
node --test
node src/server.js
```

In another PowerShell window:

```powershell
Invoke-RestMethod http://localhost:8080/health/live
Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/heartbeats -ContentType 'application/json' -Body '{"service":"billing-worker","status":"ok","note":"job queue looks normal"}'
Invoke-RestMethod http://localhost:8080/api/services
```

For the actual container experiment, stop the local server with Ctrl+C and run:

```powershell
cd ..\compose-demo
docker compose up --build -d
docker compose ps
.\smoke-test.ps1
docker compose logs --tail 30
docker compose down
```

If the PowerShell policy blocks scripts, run the equivalent `Invoke-RestMethod` commands in `compose-demo/README.md` rather than changing your machine's execution policy.

## Important things I noticed

- `localhost` *inside a container* is that container, not my laptop or another service.
- Passing a healthcheck matters because a process can be alive but not ready.
- The API stores heartbeats in memory. Restarting it clears the demo data; this is **not** a persistent production status service.
- Only Nginx has a port published to the laptop in Compose. The API stays on the private Compose network.

## Build order for this repository

This whole repository belongs to the **2024 collection**. I am doing the basics first, then CI pipelines, Terraform, Kubernetes, GitOps, and monitoring. I am not splitting a single repository into 2024/2025/2026.

The directory names are based on the work, not a repeated `tutorials/examples/exercises` template.

## Validation

See `VALIDATION.md` for what was tested here and what still needs a Docker Desktop run.
