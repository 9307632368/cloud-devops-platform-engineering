# Permissions I had to pay attention to

The first workflow only needs read access to the repository. I set top-level `permissions: contents: read` so tests aren't accidentally given a write-capable token.

The Docker image job needs `packages: write` if it pushes an image to GHCR. The login step and `push: true` are guarded so that **pull requests build but do not publish**. This avoids having an external contributor's PR try to use publishing credentials.

`secrets.GITHUB_TOKEN` is a short-lived token GitHub makes available to a workflow. I do not paste a token or PAT into code, `.env` files, or screenshots. For forks, token permissions differ and some events do not receive secrets, which is another reason not to publish on PRs.

This lab uses major-version Actions references (`@v4`, `@v6`). For a serious deployment, I should pin trusted actions to verified commit SHAs, review the repository and organizational settings, and choose currently maintained versions.

No production cloud keys or real registry credentials are supplied in this repository.
