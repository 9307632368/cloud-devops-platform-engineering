# Things I intentionally broke

When I first learned Docker, examples usually showed just a successful `docker run`. Here I want to practice fixing a service, not only starting one.

Start with the Compose stack in the previous folder. The scenarios below are **lab simulations**, not claims about incidents at a real company.

| Situation | Symptom | What to check |
| --- | --- | --- |
| Port already used | Compose cannot publish `8088` | `docker compose ps`, `Get-NetTCPConnection -LocalPort 8088` |
| API unhealthy | Proxy stays stopped or fails startup | `docker compose logs api`, readiness vs liveness |
| Wrong proxy hostname | Browser gets a `502` | Compose service DNS, `nginx/default.conf` |

Keep the command outputs or a short screenshot in your own notes after trying each experiment.

- [Port conflict drill](port-conflict.md)
- [Readiness failure drill](unhealthy-container.md)
- [Reverse proxy failure drill](proxy-502.md)
