# ConfigMaps and rollouts

I kept the fake tariffs in a ConfigMap, so changing a price does not require editing the Node source code. I read these settings as environment variables when the process starts.

Important detail: changing a ConfigMap does **not** change environment variables in an existing running container. After changing the YAML, apply it and restart the Deployment:

```powershell
kubectl apply -k .\manifests\overlays\local
kubectl -n parcel-lab rollout restart deployment/parcel-quote
kubectl -n parcel-lab rollout status deployment/parcel-quote
```

Check: Does the Pod name change? Does the price change? What happens to the request during the rollout? The configuration is not sensitive; I would not store credentials in this ConfigMap.
