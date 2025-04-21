# On-call playbooks and monitoring lab

I wanted to try more than just deploying an application. When something goes wrong after deployment, I should know how to find it and what to check before changing things. This folder is a small setup for practicing that.

The API is intentionally simple: it calculates a quote based on a unit count. The useful part is the monitoring around it. I can start it normally, run some traffic, and recreate it in different failure modes to see how the dashboard and alerts behave.

The incidents in `drills/` and `notes/` are **practice scenarios**. I haven't presented them as production incidents.

## What's in here

- `service/` — Node.js API with health checks, JSON request logs and Prometheus metrics.
- `observability/` — Prometheus scrape config, alert rules, Alertmanager routing, Grafana dashboard.
- `drills/` — local traffic generator and four fault scenarios.
- `runbooks/` — what to check when availability, readiness, 5xx, or latency gets worse.
- `incident-kit/` — Python script to summarize JSONL logs into a Markdown incident note.
- `notes/` — troubleshooting and my practice incident write-up.
- `scripts/` — one PowerShell smoke test.

## First run on Windows

Requirements: Docker Desktop with Compose, PowerShell, and Node.js 20 if you want to run the service outside Docker. Python 3.11+ is optional for the log script.

```powershell
Copy-Item .env.example .env
notepad .env
# Set your own strong value for GRAFANA_ADMIN_PASSWORD.
docker compose up -d --build
```

Then try:

```powershell
curl.exe -i http://127.0.0.1:8080/health/live
curl.exe -i http://127.0.0.1:8080/health/ready
curl.exe -i "http://127.0.0.1:8080/api/quote?units=3"
node drills/load-generator.js --count 60 --concurrency 4
```

Open these **local-only** pages:

| URL | Purpose |
|---|---|
| http://127.0.0.1:8080/metrics | Raw metrics |
| http://127.0.0.1:9090/targets | Prometheus scrape status |
| http://127.0.0.1:9090/alerts | Prometheus alerts |
| http://127.0.0.1:9093 | Alertmanager status |
| http://127.0.0.1:3000 | Grafana dashboard (login: lab-admin and your `.env` password) |

The Grafana dashboard is under **Student Lab / On-call Lab - Service Health**.

## Try one failure

Follow `drills/README.md` for commands. Change one thing at a time: errors, slowness, dependency not ready, or stopping the service. Check the dashboard and runbook, then switch back to normal.

Don't leave the service in a failure mode after finishing the lab.

## Run the checks without Docker

```powershell
cd service
npm test
cd ..
node --test drills/test/*.test.js
python -m unittest discover -s incident-kit/tests -p "test_*.py" -v
```

For a fast manual test, open another PowerShell window and run `node service/server.js` from this directory. Node listens on `127.0.0.1:8080` by default.

## A few limitations

- The demo has no real database or dependency. Fault modes are simulations configured at startup.
- Alertmanager uses an empty receiver on purpose, so **no real paging or email notification happens**.
- Host ports in Compose are bound to `127.0.0.1`. Do not expose these dashboards to the internet as-is.
- Local unit tests check the implementation; real Docker, Prometheus, Alertmanager, and Grafana behavior should be verified on your PC.
- Versions are chosen from 2024 for this repository collection. See `notes/version-notes.md` for the release references and security note.

## Shutting down

```powershell
docker compose down
```

I have not used `down -v` here because it would delete the local dashboard and metrics volumes.
