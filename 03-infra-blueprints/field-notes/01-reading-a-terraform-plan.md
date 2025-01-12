# Before I press apply

What helped me understand Terraform was reading the **plan** instead of immediately running `apply`.

I look for these symbols:

- `+`: Terraform wants to create a resource.
- `~`: something will change in place.
- `-/+`: resource replacement; it may interrupt service.
- `-`: destroy; check very carefully.

For this lab I expect a VPC, four subnets, routing, one EC2 server and one private S3 bucket. If the plan shows unexpected changes to existing AWS resources, I stop and check the account/profile and state.

Commands I use:

```powershell
terraform init
terraform fmt -recursive
terraform validate
terraform plan -out=dev.tfplan
terraform show dev.tfplan
```

**Important:** `terraform plan` still reads AWS account information, so I need configured credentials. I don't save plans or state in the Git repository. This note is a checklist, not a report that I ran a live plan.
