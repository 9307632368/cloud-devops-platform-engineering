# Cost and cleanup notes

This stack is **not free just because it is a tutorial**. EC2, public IPv4 addresses, S3 storage/requests and data transfer can have charges. Exact costs depend on your AWS account, free-tier eligibility, region and usage. Check AWS pricing before applying.

## Before applying

- Use a separate test AWS account if possible.
- Confirm region and profile with `aws sts get-caller-identity`.
- Review the resource counts and costs in `terraform plan`.
- Never push credentials, `.tfstate`, `.tfvars` with secrets, or saved plans to GitHub.
- Set a budget alert in AWS Billing if you plan to leave the demo running.

## When done

From `playground/dev`:

```powershell
terraform plan -destroy
terraform destroy
```

The S3 bucket has `force_destroy = false` so it will not silently delete artifacts. If you uploaded objects, deletion may fail until you explicitly empty the bucket (including **all object versions/delete markers**). Do not switch to `force_destroy = true` just to make cleanup easier if files matter.

Keep the Terraform state until teardown is verified. A failed destroy does **not** mean resources are gone. Double-check AWS Console and billing.

## Why there is no NAT gateway

NAT gateways are handy when private subnet instances need outbound access, but they also have hourly and traffic charges. I left NAT out of this lab. The private subnets are here to understand routing and network separation; the demo EC2 server is in a public subnet.
