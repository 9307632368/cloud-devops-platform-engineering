# Small web host

The first version of this lab used a public EC2 instance and a plain HTML page served by Nginx. I did this on purpose because it is easier to debug Terraform + networking when the actual app is tiny.

- Amazon Linux 2023 AMI selected at plan/apply time (not locked to a 2024 AMI image).
- Starts Nginx using instance user data.
- Security group allows HTTP from a configurable CIDR, but does not open SSH.
- SSM role for remote administration. It still depends on account permissions, connectivity, and the agent actually working.
- Instance Metadata Service requires IMDSv2.
- Encrypted EBS root volume.

This is a **public HTTP demo**, not a finished production service. For actual deployment use HTTPS, an ALB, and a private app subnet.
