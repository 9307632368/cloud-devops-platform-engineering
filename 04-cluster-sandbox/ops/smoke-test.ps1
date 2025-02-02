param([string]$BaseUrl = 'http://127.0.0.1:8080')
$ErrorActionPreference = 'Stop'
Write-Host 'This expects port-forward to be running in another terminal.'
$live = Invoke-RestMethod "$BaseUrl/health/live"
$ready = Invoke-RestMethod "$BaseUrl/health/ready"
$quote = Invoke-RestMethod "$BaseUrl/api/quote?zone=local&weight_grams=1500"
if ($live.status -ne 'ok' -or $ready.status -ne 'ok') { throw 'Health checks failed' }
if ($quote.amountPaise -ne 8000 -or $quote.billedKg -ne 2) { throw 'Quote response did not match expected value' }
Write-Host ('Smoke test OK. Served by pod: ' + $quote.pod)
