param([Parameter(Mandatory = $true)][string]$Url)
$ErrorActionPreference = "Stop"
Write-Host "Checking $Url"
try {
    $res = Invoke-WebRequest -Uri $Url -TimeoutSec 15 -UseBasicParsing
    if ($res.StatusCode -ne 200) { throw "Unexpected HTTP status: $($res.StatusCode)" }
    if ($res.Content -notmatch "Terraform demo") { throw "Page did not contain the demo marker" }
    Write-Host "HTTP demo responded successfully."
} catch {
    Write-Error "Check failed: $($_.Exception.Message). Check instance status, cloud-init, routes and security groups."
    exit 1
}
