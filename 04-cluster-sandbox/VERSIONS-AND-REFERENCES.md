# Versions and references

I kept the toolchain aligned to releases available in late 2024.

- Node.js **20.18.1**, released 2024-11-20: https://nodejs.org/en/blog/release/v20.18.1
- kind **v0.24.0**, released 2024-08-15, with default node image `kindest/node:v1.31.0`: https://github.com/kubernetes-sigs/kind/releases/tag/v0.24.0
- Kubernetes **v1.31.0** (2024): https://kubernetes.io/releases/1.31/
- Python **3.11** plus optional PyYAML **6.0.2** for local YAML checks (not used by the Node app).

Docs I used when working through the ideas:

- https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
- https://kubernetes.io/docs/concepts/services-networking/service/
- https://kubernetes.io/docs/concepts/configuration/configmap/
- https://kubernetes.io/docs/concepts/workloads/autoscaling/horizontal-pod-autoscale/
- https://kind.sigs.k8s.io/docs/user/quick-start/

The sample application and manifests are original practice code, not copied from those references. The version numbers describe the lab **toolchain**, not an earlier GitHub commit date. Both Kubernetes 1.31 and Node 20 are now end-of-life; please use a supported stack for real deployments.
