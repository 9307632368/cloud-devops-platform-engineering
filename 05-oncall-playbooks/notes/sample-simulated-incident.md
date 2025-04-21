# Practice write-up: quote requests returned 503

This is a **simulated example**, not an incident I handled at a company.

**Setup:** I restarted the demo service with `FAULT_MODE=errors`, then sent local traffic using the load generator.

**Expected observations:** The readiness endpoint still returns 200, but `/api/quote` starts returning 503. The 5xx line rises on Grafana; after the alert evaluation window, `LabHighErrorRate` should become active.

**What I would check:** The request logs first, then the time the service was restarted, and whether there was a real dependency failure. For this demo there isn't one; the failure is just controlled startup configuration.

**Recovery step:** Change the mode back to normal, recreate the service, then send the same set of requests. Check that the 5xx rate drops and that the alert resolves.

**What I learned from the exercise:** Health endpoints answer different questions. An app can be reachable and still fail user requests. I should not treat a green liveness check as proof that the user-facing feature works.

No production outage or Grafana screenshot is claimed here. Complete the exercise yourself and record the actual output.
