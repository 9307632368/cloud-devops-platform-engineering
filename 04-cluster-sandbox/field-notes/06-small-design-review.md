# What I would change before using this for real traffic

This is a lab, not a hosted shipping product. What is already useful: stateless request handling, input checks, container probes, resource budgets, restrictive pod security settings, rollout controls and tests.

Still missing: HTTPS/TLS termination, a real secrets setup, central metrics/logging, authentication, request tracing, realistic load measurements, supply-chain scanning, properly pinned image digests, backup/restore for any future database, alerting and a supported Kubernetes/Node version.

I deliberately kept pricing data fake and avoided adding real credentials or cloud account setup. The module can run locally without spending money.
