$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$context = 'kind-student-lab'
$active = kubectl config current-context
if ($LASTEXITCODE -ne 0 -or $active -ne $context) { throw "Current kubectl context must be $context (found $active)." }
& kubectl apply -k (Join-Path $root 'manifests/overlays/local')
if ($LASTEXITCODE -ne 0) { throw 'kubectl apply failed' }
& kubectl -n parcel-lab rollout status deployment/parcel-quote --timeout=150s
if ($LASTEXITCODE -ne 0) { throw 'Deployment did not become ready; inspect pods and events.' }
Write-Host 'Deployment is ready. Port forward: kubectl -n parcel-lab port-forward svc/parcel-quote 8080:80'
