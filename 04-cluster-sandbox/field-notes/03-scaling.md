# Scaling notes

Manual scaling is straightforward: `kubectl -n parcel-lab scale deployment parcel-quote --replicas=3`.

HPA is separate. I left the add-on in `manifests/addons/hpa.yaml`. It sets 2–4 replicas and aims for 65% CPU relative to the 100m CPU request.

Things I need to check before saying HPA works:

1. Is Metrics Server installed and healthy?
2. Does `kubectl top pods -n parcel-lab` show CPU values?
3. Does `kubectl -n parcel-lab describe hpa parcel-quote` show a real current CPU percentage?
4. Is the workload CPU-heavy enough to trigger scaling? This quote API is mostly lightweight I/O, so a small traffic run might not show anything.

The `/metrics` endpoint measures **application** counters and does not supply the metrics.k8s.io CPU values used by this HPA.
