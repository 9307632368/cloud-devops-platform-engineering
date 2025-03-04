# Networking experiments

- `parcel-quote` is a ClusterIP Service reachable inside Kubernetes.
- `kubectl port-forward` uses the Kubernetes API path, convenient for testing from Windows.
- `parcel-quote-nodeport` is optional; its 30080 port connects through kind's host port mapping to 8081.
- The Ingress example is just a resource definition. It does nothing useful until an Ingress controller is installed and configured.
- The optional NetworkPolicy allows inbound traffic **only from Pods in the same namespace**. Depending on traffic path it may block externally routed NodePort or ingress calls. Don't assume a policy is enforced; test in your cluster.

One test I want to run: apply the NodePort first, confirm access, apply the network policy, try again, then remove the policy. Write down exactly what happened instead of assuming all clusters behave identically.
