param(
  [Parameter(Mandatory=$true)][string]$RepositoryRoot,
  [switch]$Force
)
$ErrorActionPreference = 'Stop'
$source = Join-Path $PSScriptRoot '..\workflow-templates'
$dest = Join-Path $RepositoryRoot '.github\workflows'
New-Item -ItemType Directory -Path $dest -Force | Out-Null
$names = @('release-lab-ci.yml', 'release-lab-publish.yml')
foreach ($name in $names) {
  $target = Join-Path $dest $name
  if ((Test-Path $target) -and (-not $Force)) {
    Write-Error "Already exists: $target. Use -Force only if you meant to replace it."
  }
  Copy-Item -Path (Join-Path $source $name) -Destination $target -Force:$Force
  Write-Host "Installed $target"
}
