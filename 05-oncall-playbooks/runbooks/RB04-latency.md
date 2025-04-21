# RB04 — Response times are slow

**Signals:** P95 quote latency above 250 ms while traffic is active.

## What I check

1. Check P95 and request volume together. An empty histogram does not mean the system is fast.
2. Find slow routes and compare CPU / memory use or external calls if those metrics exist.
3. Inspect recent changes and dependency timings before scaling blindly.
4. Check that any load generation is limited to the local sandbox.

## Try it

Use `FAULT_MODE=slow` and run `node drills/load-generator.js --count 100 --concurrency 4`. The app waits about 350 ms per quote in this mode.

## Recovery

Reset normal mode and verify latency trends recover under similar traffic, not just during idle time.
