# Checking whether S3 is really private

A bucket saying “private” in a README is not enough. After deployment, I would check the actual AWS settings.

From PowerShell, replace `<bucket-name>` with the real output:

```powershell
aws s3api get-public-access-block --bucket <bucket-name>
aws s3api get-bucket-versioning --bucket <bucket-name>
aws s3api get-bucket-encryption --bucket <bucket-name>
```

What I expect:

- All four Public Access Block settings are true.
- Versioning status is `Enabled`.
- Default encryption uses `AES256`.

Do not paste real credentials into screenshots. When testing upload/download, use a throwaway file and delete all versions later if you want to destroy the bucket.

This is a list of verification steps, not captured AWS output.
