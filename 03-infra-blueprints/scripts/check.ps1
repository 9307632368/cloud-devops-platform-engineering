$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
Push-Location $root
try {
    py -3 -m unittest discover -s checks -v
    if ($LASTEXITCODE -ne 0) { throw "Local checks failed" }
    if (Get-Command terraform -ErrorAction SilentlyContinue) {
        terraform fmt -recursive
        if ($LASTEXITCODE -ne 0) { throw "Terraform formatting failed" }
    } else {
        Write-Host "Terraform CLI not found. Only local Python checks ran."
    }
}
finally { Pop-Location }
