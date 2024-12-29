# Run this from anywhere: powershell -File .\pipeline-room\commands\install-workflows.ps1
# Folder assumption: the repository root contains pipeline-room and container-workbench.
param(
    [string] $RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path,
    [switch] $Overwrite
)

$ErrorActionPreference = "Stop"
$RepoRoot = (Resolve-Path $RepoRoot).Path
$source = Join-Path $PSScriptRoot "..\workflow-files"
$target = Join-Path $RepoRoot ".github\workflows"

if (-not (Test-Path (Join-Path $RepoRoot "pipeline-room\build-lab\package.json"))) {
    throw "Can't find pipeline-room/build-lab under $RepoRoot. Did you extract this folder into the right location?"
}
if (-not (Test-Path (Join-Path $RepoRoot "container-workbench\service-status-api\package.json"))) {
    throw "The quality workflow also tests container-workbench/service-status-api. Restore that folder first."
}

New-Item -ItemType Directory -Force -Path $target | Out-Null
Get-ChildItem -Path $source -Filter '*.yml' -File | ForEach-Object {
    $dest = Join-Path $target $_.Name
    if ((Test-Path $dest) -and -not $Overwrite) {
        throw "Not overwriting $dest. Review differences and rerun with -Overwrite if that's intended."
    }
    Copy-Item -LiteralPath $_.FullName -Destination $dest -Force:$Overwrite
    Write-Host "Installed: $dest"
}
Write-Host "Review the files with git diff, then commit them to enable Actions."
