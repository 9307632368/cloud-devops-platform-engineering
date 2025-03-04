# Validation (local)

The Node application has a built-in test suite. I also wrote a few offline checks for the Kubernetes manifests.

```powershell
cd parcel-quote
npm test
cd ..
py -3.11 -m pip install -r .\validation\requirements-optional.txt
py -3.11 .\validation\check-manifests.py
```

These tests check the application behavior, YAML parsing and connections between important fields such as the Deployment labels and Service selector.

They **do not** prove that `kubectl apply -k` was accepted by a live API server, that Docker built the image, that metrics-server worked or that traffic was balanced. Test those separately in the kind cluster. See `field-notes/practice-log.md`.

## Result from the build environment

- 24 Node.js application tests passed on **Node.js 22.16.0** (the only Node version installed here).
- 13 offline YAML/manifest tests passed using Python and PyYAML.
- No Docker image build, `kind` cluster creation, Kubernetes rollouts, HPA, NetworkPolicy enforcement, or live Ingress tests were performed here.
- The application and image target Node 20.x from 2024, but that historical runtime still needs independent testing on your machine.
