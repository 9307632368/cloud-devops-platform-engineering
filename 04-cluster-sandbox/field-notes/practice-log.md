# Things to try and write down

These are open exercises, not claimed experiment results.

- [ ] Build image and load it into kind
- [ ] Deploy local overlay and confirm 2 Ready Pods
- [ ] Make 10 requests and compare Pod names (load balancing may not be perfectly even)
- [ ] Delete one Pod; see how the Deployment replaces it
- [ ] Change the per-kg price in the ConfigMap, apply, restart, check the output
- [ ] Apply the NodePort and connect using host port 8081
- [ ] Try 3 replicas and observe the Service
- [ ] Install metrics-server, then try HPA and record whether it scaled
- [ ] Run the staging overlay in a different namespace
- [ ] Clean up the named kind cluster

Keep screenshots only of what actually happened. If a step failed, note the reason and the command used to debug it.
