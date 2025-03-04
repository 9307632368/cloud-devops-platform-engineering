# My local cluster checklist (PowerShell)

Commands are from inside `cluster-sandbox/` after extracting the contents of this ZIP.

### Before I start

```powershell
docker version
kind version
kubectl version --client
node --version
```

The lab is designed around 2024 releases: kind v0.24.0 with Kubernetes 1.31.0, and Node 20.18.1. It is fine to learn with these historical tools in an isolated lab, but supported versions are a better choice for anything internet-facing.

### Bring up a local cluster

```powershell
kind create cluster --name student-lab --config .\clusters\kind-v131.yaml
kubectl cluster-info --context kind-student-lab
kubectl get nodes
```

### Build and deploy the application

```powershell
.\ops\build-and-load.ps1
.\ops\deploy-local.ps1
kubectl -n parcel-lab get all
kubectl -n parcel-lab describe deployment parcel-quote
```

`kind load docker-image` is important here: kind runs Kubernetes in its own node containers, so a local Docker image is not automatically visible to Kubernetes.

### Talk to the API

In one terminal:

```powershell
kubectl -n parcel-lab port-forward svc/parcel-quote 8080:80
```

In a second terminal:

```powershell
.\ops\smoke-test.ps1
Invoke-RestMethod 'http://127.0.0.1:8080/api/quote?zone=local&weight_grams=1500'
```

The quote for local 1500 grams should be **8000 paise** under the local overlay (5000 base + 2 * 1500). That is INR 80.00; costs are an invented example, not live shipping prices.

### Check rollouts and replicas

```powershell
kubectl -n parcel-lab rollout status deployment/parcel-quote
kubectl -n parcel-lab get pods -l app=parcel-quote -o wide
kubectl -n parcel-lab logs deployment/parcel-quote --tail=25
kubectl -n parcel-lab scale deployment/parcel-quote --replicas=3
kubectl -n parcel-lab get pods -w
```

After experimenting, return to the desired configuration with `kubectl apply -k .\manifests\overlays\local`. The replica count in the file is 2.

### Change a ConfigMap value

Edit `manifests/overlays/local/patch-config.yaml`, then:

```powershell
kubectl apply -k .\manifests\overlays\local
kubectl -n parcel-lab rollout restart deployment/parcel-quote
kubectl -n parcel-lab rollout status deployment/parcel-quote
```

A change to an environment variable sourced from a ConfigMap won't change inside already-running Pods until they are restarted.

### Add-ons (after the base is working)

```powershell
kubectl apply -f .\manifests\addons\kind-nodeport.yaml
kubectl apply -f .\manifests\addons\hpa.yaml
kubectl -n parcel-lab get hpa
```

HPA needs a working Metrics Server. Add-ons are separate because the base setup should work before introducing more dependencies.

### Remove the lab when finished

```powershell
.\ops\cleanup.ps1
```

This script removes the `student-lab` **kind cluster** after confirmation. It does not touch any other clusters. Running the script destroys Kubernetes resources inside that named cluster.
