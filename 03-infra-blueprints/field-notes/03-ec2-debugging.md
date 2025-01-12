# Nginx didn't appear — where I would look

I initially thought an EC2 instance showing *running* meant the website was ready. Actually user-data still needs to install Nginx.

My check order:

1. Confirm `terraform output web_url` points to the instance's public IP.
2. Wait briefly for user-data and open the HTTP URL (not HTTPS; this lab doesn't configure TLS).
3. Look at port 80 inbound rules in the security group and the public subnet route to the Internet gateway.
4. If Session Manager is working, inspect `/var/log/cloud-init-output.log` and `systemctl status nginx`.
5. Confirm the AMI and package repositories are reachable; outbound access needs a public IP and correct routes.

To check from PowerShell:

```powershell
.\scripts\verify-http.ps1 -Url 'http://REPLACE_WITH_REAL_IP/'
```

Why not SSH? I deliberately did not open port 22. Use SSM Session Manager with proper AWS permissions or troubleshooting from AWS console.

This is a troubleshooting exercise, not evidence that I had this exact failure on a deployed AWS instance.
