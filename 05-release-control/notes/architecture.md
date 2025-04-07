# How the release moves

```mermaid
flowchart LR
    A[Node tests] --> B[Build and push image]
    B --> C[Image digest]
    C --> D[Promote to dev]
    D --> E[Review and commit Git changes]
    E --> F[Argo CD manual sync]
    F --> G[Check dev]
    G --> H[Promote same digest to staging]
    H --> I[Check staging]
    I --> J[Promote same digest to prod]
```

The Git repo stores what should be deployed. Argo CD watches the repo, but **these sample Applications do not enable automatic sync**. The script edits the overlay and local ledger; it has no direct Kubernetes access.

The main idea is that staging and production should run the **same image digest** already checked in the previous environment, rather than rebuilding different images.

For a real company system, I would add signed artifacts, branch protection, approval gates, proper alerting, and a more reliable release database. The JSON ledger in this lab is mainly useful for understanding the workflow.
