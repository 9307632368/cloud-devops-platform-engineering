$ErrorActionPreference = "Stop"
$port = if ($env:APP_PORT) { $env:APP_PORT } else { "8088" }
$base = "http://127.0.0.1:$port"
Write-Host "Checking $base"
$ready = Invoke-RestMethod "$base/health/ready"
if (-not $ready.ready) { throw "API is not ready" }
$body = @{ service = "orders-worker"; status = "ok"; note = "message from PowerShell smoke check" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "$base/api/heartbeats" -Body $body -ContentType 'application/json' | Out-Null
$response = Invoke-RestMethod "$base/api/services"
if ($response.count -lt 1) { throw "Expected at least one heartbeat" }
Write-Host "OK: proxy reached API and heartbeat is visible"
$response | ConvertTo-Json -Depth 5
