$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Push-Location $root
try {
  python -m pytest -q
  if ($LASTEXITCODE -ne 0) {throw 'Python release tests failed'}
  Push-Location (Join-Path $root 'parcel-api')
  try {
    npm test
    if ($LASTEXITCODE -ne 0) {throw 'Node tests failed'}
  } finally {Pop-Location}
} finally {Pop-Location}
