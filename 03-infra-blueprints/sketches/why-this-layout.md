# A few design notes

The diagram looks a bit bigger than the project really is. I created four subnets to understand the public/private split across AZs, but there is still **only one** running EC2 server in one AZ. It is not highly available.

The private subnets don't use NAT. This is intentional to avoid a NAT gateway bill for a tutorial. If I later deploy services in private subnets, I will need NAT or appropriate VPC endpoints for dependencies.

I also kept the S3 bucket separate from the EC2 role. It isn't necessary for the Nginx demo to access S3. If that changes later, I should add a narrow IAM policy for exactly the required bucket actions instead of giving `s3:*`.

For a team deployment, my first changes would be a remotely managed and protected Terraform state backend, HTTPS/ALB, reliable patching, and account-level access controls.
