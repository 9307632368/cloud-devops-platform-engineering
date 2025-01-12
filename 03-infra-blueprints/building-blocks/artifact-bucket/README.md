# Private artifact bucket

I wanted somewhere private to put ZIP archives or build logs without turning S3 into a public file host. This module has four checks I cared about: public access blocking, versioning, server-side encryption and abandoned multipart upload cleanup.

I left `force_destroy` off. If I accidentally put important files here, I don't want `terraform destroy` to delete them without warning. Emptying a versioned bucket needs extra care.

No public bucket policy, website endpoint or upload credentials are included.
