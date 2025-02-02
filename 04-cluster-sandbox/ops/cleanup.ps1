$ErrorActionPreference = 'Stop'
$cluster = 'student-lab'
$existing = @(kind get clusters)
if ($LASTEXITCODE -ne 0 -or $existing -notcontains $cluster) { Write-Host 'No student-lab cluster to delete.'; exit 0 }
$answer = Read-Host "Type DELETE to remove the $cluster kind cluster"
if ($answer -cne 'DELETE') { Write-Host 'Cancelled.'; exit 0 }
kind delete cluster --name $cluster
if ($LASTEXITCODE -ne 0) { throw 'Cluster deletion failed' }
Write-Host "Deleted $cluster"
