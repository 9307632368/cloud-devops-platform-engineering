$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$cluster = 'student-lab'
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { throw 'Docker was not found.' }
if (-not (Get-Command kind -ErrorAction SilentlyContinue)) { throw 'kind was not found.' }
$existing = @(kind get clusters)
if ($LASTEXITCODE -ne 0 -or $existing -notcontains $cluster) { throw 'Create the student-lab kind cluster first.' }
& docker build -t parcel-quote-api:2024-lab (Join-Path $root 'parcel-quote')
if ($LASTEXITCODE -ne 0) { throw 'docker build failed' }
& kind load docker-image parcel-quote-api:2024-lab --name $cluster
if ($LASTEXITCODE -ne 0) { throw 'kind load failed' }
Write-Host 'Image built and loaded. Next: .\ops\deploy-local.ps1'
