# RB03 — 5xx errors increasing

**Signals:** 5xx rate above 20% when there is enough traffic; users may see temporary failures.

## What I check

1. Compare 5xx request rate with traffic volume. A single failed request should not create a major incident automatically.
2. Group errors by route and check recent application logs.
3. Compare the time of the increase to recent deployments and downstream dependency changes.
4. Check if retries are causing more traffic; do not add unlimited retries.

## Try it

Use `FAULT_MODE=errors` and run `node drills/load-generator.js --count 100 --concurrency 4`. See the alert and dashboard after multiple scrape intervals.

## Recovery

Switch the service to normal mode; confirm successful requests before marking the incident closed.
