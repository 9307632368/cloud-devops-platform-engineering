# Checklist before I would merge a release PR

- [ ] Tests passed and CI run is linked in the PR
- [ ] Image built and pushed with a version tag
- [ ] Digest copied from registry output and verified
- [ ] GitOps overlay changes reviewed
- [ ] Dev shows correct `/version`
- [ ] Staging uses exactly the dev image digest
- [ ] Rollback image/digest exists and still pulls
- [ ] Production changes reviewed and approved
- [ ] Someone knows where to see pod events and logs

There is no claim here that these checks were performed on a live cluster.
