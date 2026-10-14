param(
  [Parameter(Mandatory=$true)][string]$Target,
  [switch]$Force
)
$ErrorActionPreference = 'Stop'
$Source = Split-Path -Parent $PSScriptRoot
$Target = (Resolve-Path $Target).Path
$items = @('core','adapters','.claude','.gemini','project-memory','docs','CLAUDE.md','GEMINI.md')
foreach ($item in $items) {
  $src = Join-Path $Source $item
  $dst = Join-Path $Target $item
  if (Test-Path $dst) {
    if (-not $Force) { Write-Host "SKIP existing: $dst"; continue }
  }
  if (Test-Path $src -PathType Container) {
    Copy-Item $src $dst -Recurse -Force:$Force
  } else {
    Copy-Item $src $dst -Force:$Force
  }
  Write-Host "INSTALLED: $dst"
}
Write-Host "Done. Review CLAUDE.md, GEMINI.md, core/OPERATING_SYSTEM.md and project-memory before implementation."
