# Quick troubleshooting

**Grafana says it cannot find Prometheus:** check `docker compose ps` and the provisioned datasource URL `http://prometheus:9090`. Do not change that to localhost inside a container.

**No data in the request panels:** first hit `/api/quote` a few times and wait for at least two scrape intervals. The `/metrics` endpoint does not increment the counter when it is scraped.

**Alert never fires:** check Prometheus `Status > Targets` and `Alerts`, send repeated traffic, and allow the `for` period to pass. A single request is normally not enough.

**Port already in use:** check `Get-NetTCPConnection -LocalPort 8080` in PowerShell. Change the host port mapping if needed, not the internal service target.

**Docker says the Grafana password is missing:** copy `.env.example` to `.env`, set your own strong password, and try again. Never commit `.env`.

**My logs have non-JSON text:** startup output and Docker wrapper lines may not be JSON. The triage script reports skipped rows.
