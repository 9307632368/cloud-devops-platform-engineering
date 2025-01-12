# Infra blueprints (Terraform + AWS)

This folder is where I kept my Terraform practice for setting up a small AWS environment. The goal was to stop creating everything manually in the AWS console and learn to describe the whole setup in code.

I started with networking, added a tiny web server, and finally added a private bucket for build artifacts. The `playground/dev` stack puts those pieces together. I split the code into modules so I could change one part without copying the same resources to every example.

## What is actually implemented?

| Folder | What I put there |
| --- | --- |
| `building-blocks/network/` | VPC, two public subnets, two private subnets, routing and internet gateway |
| `building-blocks/web-server/` | EC2, security group, instance role, Nginx user-data script |
| `building-blocks/artifact-bucket/` | Private S3 bucket with versioning, encryption and public access blocking |
| `playground/dev/` | A runnable configuration using all three modules |
| `sketches/` | A diagram and a couple of design notes |
| `scripts/` | PowerShell helpers for checking, planning and cleaning up |
| `checks/` | Local source checks that don't need AWS credentials |

## Software versions

I wrote this exercise against **Terraform 1.9.8** and **AWS provider 5.70.0**, which were available in 2024. The AWS provider version is fixed in `versions.tf`; Terraform CLI version is documented in `.terraform-version`.

- Terraform CLI: https://releases.hashicorp.com/terraform/1.9.8/
- Provider: https://registry.terraform.io/providers/hashicorp/aws/5.70.0
- AWS CLI v2: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html

The examples intentionally use basic AWS services. No Kubernetes, OpenTofu features, or provider arguments introduced after 2024.

## Quick run (PowerShell)

1. Install Terraform 1.9.8 and AWS CLI v2.
2. Configure an AWS profile that can provision VPC, EC2, IAM and S3 resources. Prefer short-lived credentials/SSO.
3. From this folder:

```powershell
aws sts get-caller-identity --profile default
cd playground/dev
Copy-Item terraform.tfvars.example terraform.tfvars
terraform init
terraform fmt -recursive
terraform validate
terraform plan -out=dev.tfplan
```

Check the plan carefully. **`terraform plan` does not deploy anything.** To provision resources, you would separately run `terraform apply dev.tfplan` (real AWS charges can apply). For a safer workflow use the `scripts/plan.ps1` helper from this folder.

If you really want to deploy, read [COSTS_AND_TEARDOWN.md](COSTS_AND_TEARDOWN.md) first. Then read the outputs for the HTTP demo URL and S3 bucket name. The EC2 instance may need a couple of minutes to finish installing Nginx.

## Expected stack layout

```text
infra-blueprints/               # the folder you extract into
├── building-blocks/
│   ├── network/
│   ├── web-server/
│   └── artifact-bucket/
├── playground/dev/
├── sketches/
├── scripts/
├── checks/
├── .gitignore
├── .terraform-version
└── README.md
```

## Security decisions

- No SSH port is opened. The EC2 role allows AWS Systems Manager Session Manager instead.
- The S3 bucket blocks public access. It is not a website bucket.
- EC2 requires IMDSv2, and the root volume is encrypted.
- There are no hard-coded AWS keys or passwords.
- HTTP on port 80 is intentionally public for this **demo**. Do not use this setup to serve sensitive data. In a real production project I would put HTTPS behind a load balancer, restrict access, and use proper remote Terraform state.
- Private subnets have **no NAT gateway** in this small lab. This saves on cost, but instances there cannot download packages from the public internet without additional networking.

## Testing notes

Run local checks without cloud access:

```powershell
py -3 -m unittest discover -s checks -v
```

For a complete syntax/provider check, Terraform still needs to download the provider:

```powershell
cd playground/dev
terraform init -backend=false
terraform validate
```

`terraform validate` checks the configuration, **not** the result of actually creating AWS resources. I have not claimed the infrastructure was deployed or measured in the cloud.

## Things I would improve later

- Store state in a dedicated encrypted S3 backend with locking, access controls, and versioning; don't upload `terraform.tfstate` to GitHub.
- Add HTTPS, ALB, autoscaling and a proper private application tier.
- Use OIDC with CI/CD instead of long-lived AWS access keys.
- Run policy checks and a cost estimate before applying changes.

This is a learning stack, not a production certification.
