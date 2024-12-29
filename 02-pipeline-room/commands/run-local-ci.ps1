# Local version of the quality gate. Run from anywhere.
$ErrorActionPreference = "Stop"
$repo = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$app = Join-Path $repo "pipeline-room\build-lab"
$prior = Get-Location
try {
    Set-Location $app
    foreach ($command in @('ci', 'run lint', 'test', 'run build', 'run verify')) {
        Write-Host "--> npm $command"
        $npmArgs = $command -split ' '
        & npm @npmArgs
        if ($LASTEXITCODE -ne 0) { throw "npm $command failed (exit $LASTEXITCODE)" }
    }
    Set-Location (Join-Path $repo 'container-workbench\service-status-api')
    & npm test
    if ($LASTEXITCODE -ne 0) { throw 'Existing service tests failed' }
    & node (Join-Path $repo 'pipeline-room\commands\check-workflows.mjs')
    if ($LASTEXITCODE -ne 0) { throw 'Workflow check failed' }
    Write-Host 'Local checks passed.'
} finally { Set-Location $prior }
