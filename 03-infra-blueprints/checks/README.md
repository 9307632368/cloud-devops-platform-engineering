# What these checks do (and don't)

I added basic `unittest` checks because I wanted to catch accidental file deletions and obvious unsafe changes even when I don't have AWS credentials available.

```powershell
py -3 -m unittest discover -s checks -v
```

These checks inspect files; they do **not** parse all of Terraform, contact AWS, test provider compatibility, or guarantee an actual deployment. Run `terraform fmt`, `terraform init`, `terraform validate`, and `terraform plan` too. Use a dedicated sandbox account for real integration testing.
