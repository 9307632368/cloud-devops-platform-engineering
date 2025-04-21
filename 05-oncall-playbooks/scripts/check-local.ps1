$ErrorActionPreference = 'Stop'
Write-Host 'Checking the local service...'
$health = Invoke-RestMethod -Uri 'http://127.0.0.1:8080/health/live'
if ($health.status -ne 'alive') { throw 'The liveness endpoint did not respond as expected' }
$ready = Invoke-RestMethod -Uri 'http://127.0.0.1:8080/health/ready'
if ($ready.ready -ne $true) { throw 'The service is not ready' }
$result = Invoke-RestMethod -Uri 'http://127.0.0.1:8080/api/quote?units=3'
if ($result.total_cents -ne 3750) { throw 'Quote returned the wrong amount' }
Write-Host 'API checks passed. Open http://127.0.0.1:3000 for Grafana.'
