# Commands I used when a cluster setup breaks

**ImagePullBackOff**: if image is local, did I run `kind load docker-image ... --name student-lab`? Does the deployment image name match `parcel-quote-api:2024-lab`? Did I accidentally set Always pull?

**Pending Pod**: `kubectl -n parcel-lab describe pod <pod-name>` and inspect Events. Check resources and node capacity.

**CrashLoopBackOff**: `kubectl -n parcel-lab logs <pod-name> --previous`; verify `PRICING_JSON`, port, and startup errors.

**Service not responding**: compare `app: parcel-quote` labels to the Service selector. Check readiness and endpointslices.

**HPA shows unknown**: metrics-server or resource request is missing. The app's `/metrics` text isn't the same as node CPU metrics.

**Ingress not responding**: an Ingress object is not itself an Ingress controller. Check which controller is installed and what address/host it serves.

Always run `kubectl config current-context` before applying or deleting anything.
