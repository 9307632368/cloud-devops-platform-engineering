# Pods, Deployments, Services — how I remember them

A Pod runs the container. A Deployment describes the desired replica count and how to replace Pods during rollout. A Service gives a stable address even when individual Pods are replaced.

I added two replicas. Both answer the same price because the service is stateless; each response also includes its Pod name from the Downward API so I can check where a request went.

Things to try:

```powershell
kubectl -n parcel-lab get pods -o wide
kubectl -n parcel-lab get endpointslices -l kubernetes.io/service-name=parcel-quote
kubectl -n parcel-lab delete pod <one-pod-name>
kubectl -n parcel-lab get pods -w
```

The Deployment should create a replacement Pod. Do not type the angle brackets literally.
