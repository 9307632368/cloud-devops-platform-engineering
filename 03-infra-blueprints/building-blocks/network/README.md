# Network block

I wanted a network with two availability zones rather than dropping everything into a default VPC.

- One `/16` VPC.
- Two `/24` public subnets and two `/24` private subnets.
- Public subnets route to an internet gateway.
- Private subnets only have the local VPC route (no NAT in this lab).

The subnet addresses are derived with `cidrsubnet()` instead of having four hard-coded CIDRs. The `/16` input is required because I used 8 extra bits to get `/24` subnets.

The demo EC2 module uses the first public subnet. The second public/private subnets are here to practice multi-AZ design, not to pretend this sample is highly available.
