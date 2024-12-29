# 2024 stack notes

I am treating 2024 as the **technology period for this learning collection**, not claiming that a Git commit was made in 2024.

| Tool / action | Lab target | Why it is here |
| --- | --- | --- |
| Node.js | 20.18.1 | Node 20 LTS was available in 2024 and has a built-in test runner |
| `actions/checkout` | v4 | Source checkout |
| `actions/setup-node` | v4 | Pick a consistent Node version |
| `docker/setup-buildx-action` | v3 | Docker Buildx support |
| `docker/login-action` | v3 | GitHub Container Registry authentication |
| `docker/build-push-action` | v6 | Image build and optional publish |
| `actions/upload-artifact` | v4 | Keep the release bundle from a tag |

This is a **historical compatibility target**, not a security baseline for new deployment. For new internet-exposed systems, upgrade the Node runtime and relevant Actions to supported patched versions. Similarly, the `node:20.18.1-alpine` container tag is intentionally historical; do not treat it as a current production image.

External CI checks weren't performed inside GitHub; they need a live repository and runner. Unit tests and a local bundle verification were run using a newer Node version available in the workspace, which is not a substitute for testing the exact Node 20.18.1 build.

References:
- https://nodejs.org/en/about/previous-releases
- https://github.com/actions/setup-node
- https://github.com/docker/build-push-action
- https://docs.github.com/en/actions
