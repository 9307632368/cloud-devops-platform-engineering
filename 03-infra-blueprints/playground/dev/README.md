# Dev playground

This is the only folder where I run `terraform plan` and `terraform apply`. Everything under `building-blocks` is imported as a module; those modules are not individual deployments.

## Commands

```powershell
Copy-Item terraform.tfvars.example terraform.tfvars
terraform init
terraform validate
terraform plan -out=dev.tfplan
terraform apply dev.tfplan
terraform output web_url
```

When testing is complete:

```powershell
terraform destroy
```

**Don't run `apply` automatically in CI.** The web host and public IPv4 address can cost money. The S3 bucket also stores versions, so clean up carefully.

The local state isn't meant for teams; it is ignored by Git. In a real team, set up a remote state backend in a **separate bootstrap project**, plus locking and least-privilege access. Do not try to reference the same bucket that this project is creating as its backend (chicken-and-egg problem).

## What should appear in the plan?

- VPC, internet gateway, two public and two private subnets, route tables and associations.
- One security group, IAM role + instance profile, EC2 instance.
- One private versioned S3 bucket with public access blocked and encryption.

`terraform plan` needs AWS credentials because it queries your account and availability zones; the local Python checks do not.
