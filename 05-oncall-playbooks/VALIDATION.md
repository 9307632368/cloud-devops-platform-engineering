# What I tested locally

I checked these using the tools available in the working environment:

- **22 Node.js tests** — service routing, liveness/readiness, good/bad quotes, faults, counters and histogram output.
- **13 Node.js tests** — local-only load-generator argument checking and response summaries.
- **12 Python tests** — JSONL parsing, invalid inputs, p95 and report writing.
- **11 Python source checks** — dashboard JSON, expected files, alert-rule names, local port binding and 2024 version pins.

**Total: 58 checks passed.** The checks use the Node.js and Python versions installed in the working environment (not the exact 2024 runtime).

I also parsed all six YAML configuration files and the dashboard JSON. A live HTTP smoke test returned 200 from `/health/live`, `/health/ready`, `/api/quote?units=3`, and `/metrics`; the quote total was verified as 3750 cents.

## Still to try on Windows

I did **not** run Docker Compose, the Prometheus binary, Alertmanager or Grafana here because the Docker engine and `promtool` are unavailable. That means the config layout and source tests have been checked, but a live metrics scrape, alert firing, dashboard rendering and container build are **not yet confirmed**.

After extraction, follow the README and record the results of the four drills. Please do not report them as tested until you actually run them.
