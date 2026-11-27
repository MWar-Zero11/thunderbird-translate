# Builds dist/thunderbird-translate.xpi (a zip with manifest.json at the root).
$root = Split-Path $PSScriptRoot -Parent
$dist = Join-Path $root "dist"
New-Item -ItemType Directory -Force $dist | Out-Null
$xpi = Join-Path $dist "thunderbird-translate.xpi"
$zip = Join-Path $dist "thunderbird-translate.zip"
Remove-Item $xpi, $zip -ErrorAction SilentlyContinue
$files = @("manifest.json", "core.js", "popup.html", "popup.css", "popup.js", "options.html", "options.js", "icons") | ForEach-Object { Join-Path $root $_ }
Compress-Archive -Path $files -DestinationPath $zip
Move-Item $zip $xpi
Write-Host "Built $xpi"
