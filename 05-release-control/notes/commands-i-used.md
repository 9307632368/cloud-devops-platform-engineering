# Commands to try

From `release-control/`:

```powershell
python tools/release.py status
python tools/release.py history
python tools/release.py plan dev --version v1.2.0 --digest sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
python tools/release.py promote dev --version v1.2.0 --digest sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
python tools/release.py promote staging --version v1.2.0 --digest sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
python tools/release.py promote prod --version v1.2.0 --digest sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa --approve-prod
```

**Do not copy the example digest into a real deployment.** Replace with the published image digest and replace the registry owner name.

For a second release, use a different version and digest. You can then test:

```powershell
python tools/release.py history --environment dev
python tools/release.py rollback dev --to v1.2.0
```

The rollback is just a GitOps file change. It does not wait for live Kubernetes readiness or reverse database migrations.

After reviewing `git diff`, commit the version change, let Argo CD see it, and choose Sync. You need working cluster permissions and installed Argo CD for those last steps.
