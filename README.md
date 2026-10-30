# Cloud & DevOps Platform Engineering

This repository is where I have been putting my DevOps practice work. I started with a small API running in Docker and gradually moved to CI/CD, Terraform, Kubernetes, releases and monitoring.

I didn't want this to be only a collection of commands. Most folders have a small application or script to work with, along with the configuration, tests and notes from the exercise. Some things are intentionally kept simple so I can understand how the pieces fit together.

**Collection:** 2024 learning track  
**Topics:** Docker, GitHub Actions, Terraform, AWS, Kubernetes, GitOps, Prometheus and Grafana

> The 2024 label refers to the technology versions and learning track used for these labs. It does not mean every file was written or committed in 2024. Some versions are no longer supported, so I would update them before using these examples in a new production system.

## What's inside

```text
cloud-devops-platform-engineering/
|
|-- container-workbench/
|   |-- service-status-api/
|   |-- compose-demo/
|   |-- things-i-broke/
|   `-- lab-notes/
|
|-- pipeline-room/
|   |-- build-lab/
|   |-- workflow-files/
|   |-- commands/
|   |-- notes/
|   `-- practice/
|
|-- infra-blueprints/
|   |-- building-blocks/
|   |-- playground/dev/
|   |-- checks/
|   |-- scripts/
|   `-- field-notes/
|
|-- cluster-sandbox/
|   |-- parcel-quote/
|   |-- manifests/
|   |-- validation/
|   `-- field-notes/
|
|-- release-control/
|   |-- parcel-api/
|   |-- gitops/
|   |-- tools/
|   |-- tests/
|   `-- release-history/
|
|-- oncall-playbooks/
|   |-- service/
|   |-- observability/
|   |-- drills/
|   |-- runbooks/
|   `-- incident-kit/
|
`-- README.md
```

Each folder is a separate lab. I kept the folder names based on what I was doing instead of putting everything under the same `tutorials/` and `projects/` template.

| Folder | What I worked on |
| --- | --- |
| [container-workbench](./container-workbench/) | Docker image, Node.js service-status API, Compose networking, Nginx proxy and container troubleshooting |
| [pipeline-room](./pipeline-room/) | GitHub Actions checks, building a Docker image, creating release bundles and verifying checksums |
| [infra-blueprints](./infra-blueprints/) | Terraform modules for an AWS VPC, EC2 web server and private S3 bucket, plus a combined dev stack |
| [cluster-sandbox](./cluster-sandbox/) | A quote API deployed through Kubernetes manifests, Kustomize overlays, health probes and optional scaling examples |
| [release-control](./release-control/) | GitOps layout, release promotion rules, pinned image digests, local rollback history and Argo CD examples |
| [oncall-playbooks](./oncall-playbooks/) | Metrics, Prometheus alerts, Grafana dashboards, simulated faults, log analysis and incident runbooks |

## How I worked through it

I followed this order because each part uses something from the previous one:

1. **Run the application locally**, then put it in a Docker container.
2. **Automate the checks** so a push or pull request can be tested consistently.
3. **Describe infrastructure in code** instead of relying on manual console steps.
4. **Deploy and configure services in Kubernetes.**
5. **Practice releases and rollbacks** without editing a live system by hand.
6. **Observe and troubleshoot** the service when something goes wrong.

The interesting part for me was understanding the connections: why a container can be running but not ready, how a failed CI check prevents a bad build, and why promoting the exact same image digest is safer than rebuilding for each environment.

## Running the labs

I mainly wrote the commands for **Windows PowerShell**. The instructions for each lab are in its own `README.md`.

You don't need to install everything just to explore the repository. Node.js can run the API examples without Docker. Terraform needs its CLI for actual validation/planning; the Kubernetes labs need Docker Desktop and a local cluster such as kind.

### 1. Start with the container example

Open PowerShell from the repository root:

```powershell
cd .\container-workbench\service-status-api
node --test
node src/server.js
```

In another terminal, visit `http://localhost:8080/health/live` or try the requests from `requests.http`.

To try the two-container setup after installing Docker Desktop:

```powershell
cd .\container-workbench\compose-demo
docker compose up --build -d
docker compose ps
docker compose down
```

### 2. Try the CI/CD example

```powershell
cd .\pipeline-room\build-lab
npm ci
npm test
npm run build
npm run verify
```

**Note:** GitHub Actions only detects workflow files stored at the **repository root** under `.github/workflows/`. The `pipeline-room/commands/install-workflows.ps1` script copies the example workflows there. Review the files before enabling publishing or release jobs.

### 3. Explore the Terraform configuration

```powershell
cd .\infra-blueprints\playground\dev
terraform init
terraform fmt -check
terraform validate
```

Do not run `terraform apply` until you have read [the cost and teardown notes](./infra-blueprints/COSTS_AND_TEARDOWN.md). AWS resources can incur charges. The example settings must be reviewed for your own account and network.

### 4. Move on to Kubernetes, releases and monitoring

I keep the longer setup steps in these lab guides:

- [Kubernetes sandbox](./cluster-sandbox/README.md) — build the image, start a local cluster and apply the manifests.
- [Release control](./release-control/README.md) — inspect the release plan, promotion rules and rollback commands.
- [On-call playbooks](./oncall-playbooks/README.md) — start the monitoring stack and try a controlled failure simulation.

Run the example services **one at a time** unless you change their ports; several labs use common local ports.

## Versions and validation

The examples aim to use releases available during **2024**, such as Node.js 20, Terraform 1.9.x, the AWS provider 5.x and Kubernetes 1.30/1.31. Individual folders have more precise version notes and their own dependencies. A version listed here is not a claim that the full stack has been tested together on that exact version.

I tested the application logic and many configuration checks locally. The lab folders contain their own `VALIDATION.md` files or checks describing the results. What **has not** been verified across the whole repository is a complete run of every Docker image, live AWS deployment, Kubernetes cluster, Argo CD sync or monitoring stack. Those need to be tested on a machine with the required tools and accounts.

The incident examples, service data and release history are for practice. They are **not** records from real production incidents or actual company environments.

## A few things to be careful about

- Keep AWS credentials, tokens and passwords out of Git. Use local environment variables or appropriate secret storage.
- Don't commit `.env` files, Terraform state or other generated files containing sensitive values.
- Check images, provider versions and security settings before exposing anything to the internet.
- Use the rollback and incident drills in a local/test environment, not on someone else's running service.
- Read the relevant folder's README before copying commands into PowerShell.

## References

I used official documentation as a guide while understanding the tools:

- [Docker documentation](https://docs.docker.com/)
- [GitHub Actions documentation](https://docs.github.com/en/actions)
- [Terraform documentation](https://developer.hashicorp.com/terraform/docs)
- [Kubernetes documentation](https://kubernetes.io/docs/home/)
- [Argo CD documentation](https://argo-cd.readthedocs.io/)
- [Prometheus documentation](https://prometheus.io/docs/)
- [Grafana documentation](https://grafana.com/docs/)

This is a learning portfolio, not a production-ready platform. I plan to keep improving the examples as I get more hands-on experience.
