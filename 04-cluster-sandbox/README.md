# Kubernetes cluster sandbox

I used a small shipping-quote API for this part of my DevOps practice. It has enough moving parts to try Deployments, Services, ConfigMaps and scaling without having to set up a database first.

The point of this folder is to learn what Kubernetes is doing with an application I can actually run. Most of the YAML is deliberately written out rather than hidden behind a chart.

## What's here

| Path | Why I added it |
| --- | --- |
| `parcel-quote/` | Stateless Node HTTP API, Dockerfile and tests |
| `clusters/` | A 2024 kind setup using Kubernetes v1.31 |
| `manifests/base/` | Deployment, Service, ConfigMap, ServiceAccount, PodDisruptionBudget |
| `manifests/overlays/` | Local and staging-like Kustomize configurations |
| `manifests/addons/` | Optional NodePort, HPA, Ingress, NetworkPolicy |
| `ops/` | Windows scripts and a small traffic driver |
| `field-notes/` | What to check when the cluster doesn't behave as expected |
| `validation/` | Source checks for the YAML structure |

## Run without Kubernetes first

Install Node.js 20 and run:

```powershell
cd parcel-quote
npm test
npm start
```

Then open `http://localhost:3000/api/quote?zone=national&weight_grams=1600`.

Try `/health/live`, `/health/ready` and `/metrics` too. The metrics here are **per process**, not aggregated cluster metrics.

## Run on kind (Windows PowerShell)

Install Docker Desktop, kind v0.24.0 and kubectl compatible with v1.31. Keep Docker Desktop running. From this folder:

```powershell
kind create cluster --name student-lab --config .\clusters\kind-v131.yaml
.\ops\build-and-load.ps1
.\ops\deploy-local.ps1
kubectl -n parcel-lab get deployments,pods,services
kubectl -n parcel-lab port-forward svc/parcel-quote 8080:80
```

Keep port-forward running and open a second terminal:

```powershell
.\ops\smoke-test.ps1
node .\ops\traffic\run-requests.js http://127.0.0.1:8080 60 6
```

If you want to use the mapped host port instead, apply `manifests/addons/kind-nodeport.yaml` and visit `http://127.0.0.1:8081` (the kind config maps 8081 to node port 30080).

For the full walkthrough and what each command does, read [WINDOWS-LAB.md](WINDOWS-LAB.md).

## Optional parts (not needed for the first deployment)

- HPA: apply `manifests/addons/hpa.yaml`, but install a compatible **metrics-server** first. `kubectl top pods -n parcel-lab` should work before expecting autoscaling. Sending 60 HTTP calls won't always create enough CPU usage to trigger it.
- Ingress: a controller has to be installed separately. Applying just the Ingress object does not expose the service.
- NetworkPolicy: applies an inbound restriction to the quote Pods. Check how the policy interacts with your CNI before enabling it; NodePort traffic might no longer reach the Pods.
- Staging-like overlay: makes a **second namespace** and runs the same app with different config and replica count.

## Important limitations

I could run the Node tests and inspect the YAML locally, but I did **not** run an actual kind/Kubernetes cluster in the build environment. The steps are included to reproduce it on Windows. The 2024 versions are for a historical learning setup. Kubernetes v1.31 and Node 20 have since reached end of support; don't use these unchanged for a public production service.

Everything in this folder is a learning implementation, not a production deployment or real benchmark.
