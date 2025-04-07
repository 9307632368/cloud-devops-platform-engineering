# A few release problems worth understanding

## Wrong image digest

The tag exists, but the digest does not match an image in the registry. Kubernetes will show `ImagePullBackOff`. Make sure you copied the digest **from the published image**, not the tarball or a local hash.

## Staging passed but prod still fails

The image may be identical while permissions, secrets, traffic and database state differ. A shared digest is useful, but not a full guarantee.

## Rollback and database migrations

This lab does not contain migrations. For actual software releases, a rollback may fail if the database schema is no longer compatible with the older application. Use backwards-compatible changes and planned migration steps.

## What the Python tool does not handle

- Two developers running it at the same time
- Lost changes between editing multiple files if the process crashes mid-update
- Automatic smoke tests after Argo CD sync
- Pull request approvals, build signatures, live health checks

That is why I would commit release changes through reviewed pull requests instead of treating the script like a production release controller.
