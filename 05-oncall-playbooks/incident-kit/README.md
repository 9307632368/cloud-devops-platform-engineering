# Looking through logs when something goes wrong

The application prints one JSON line per request. I added this small Python script so I can check response counts and timings without installing a log processing library.

Try the included **made-up** log file:

```powershell
python incident-kit/triage.py incident-kit/sample-service-logs.jsonl
python incident-kit/triage.py incident-kit/sample-service-logs.jsonl --write-report reports/triage.md
```

To save actual logs from Docker:

```powershell
docker compose logs --no-log-prefix service > reports/docker-service.log
```

The Docker log stream also contains startup messages and other text. The parser skips non-JSON rows and shows warnings. The output is a quick first pass only: it cannot tell you the real root cause by itself.
