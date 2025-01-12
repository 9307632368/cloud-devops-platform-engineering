param(
    [string]$Profile = "default"
)
$ErrorActionPreference = "Stop"
$stack = Join-Path $PSScriptRoot "..\playground\dev"
Push-Location $stack
try {
    Write-Host "AWS identity (please check that this is the correct account):"
    aws sts get-caller-identity --profile $Profile
    if ($LASTEXITCODE -ne 0) { throw "AWS identity check failed" }
    terraform init
    if ($LASTEXITCODE -ne 0) { throw "terraform init failed" }
    terraform fmt -recursive
    if ($LASTEXITCODE -ne 0) { throw "terraform fmt failed" }
    terraform validate
    if ($LASTEXITCODE -ne 0) { throw "terraform validate failed" }
    terraform plan -var "aws_profile=$Profile" -out=dev.tfplan
    if ($LASTEXITCODE -ne 0) { throw "terraform plan failed" }
    Write-Host "Plan saved. Nothing was applied. Read COSTS_AND_TEARDOWN.md before applying."
}
finally { Pop-Location }
