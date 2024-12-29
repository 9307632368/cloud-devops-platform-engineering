# Before I push a release tag

- [ ] `npm test` and `npm run lint` pass
- [ ] `npm run build` and `npm run verify` pass
- [ ] `package.json` version is the version I intend to release
- [ ] `git status` is clean and the correct commit is on the branch
- [ ] Tag is exactly `v<package version>` (example: `v1.0.0`)
- [ ] No keys, `.env` files, local databases or private files are in the commit
- [ ] PR review / branch protections are satisfied where they are configured
- [ ] The release workflow shows a green result and the artifact is downloadable

The tag workflow uploads the verified bundle as a GitHub Actions artifact. It **does not** create a GitHub Release page or deploy the application.

## If the wrong tag was used

The workflow should fail with a message such as `Expected tag v1.0.0, received v1.0.1`. Don't fix the check by ignoring it. Review whether the code needs a version bump or a corrected tag; be careful about changing tags that have already been shared.
