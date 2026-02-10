# Script para criar bundle.txt do projeto
$bundlePath = "bundle.txt"
$projectPath = "C:\Users\USER\Downloads\app2\bora-bailar-shell-main"

# Remove arquivo existente
if (Test-Path $bundlePath) { Remove-Item $bundlePath }

# Header
"# Project Bundle - BoraBailar Shell" | Out-File $bundlePath -Encoding utf8
"# Generated at: $(Get-Date)" | Out-File $bundlePath -Append -Encoding utf8
"# " | Out-File $bundlePath -Append -Encoding utf8
"" | Out-File $bundlePath -Append -Encoding utf8

# Get all relevant files
$files = Get-ChildItem -Recurse -Include *.ts,*.tsx,*.js,*.json,*.md | Where-Object { 
    $_.FullName -notmatch "node_modules" -and 
    $_.FullName -notmatch "\.expo" -and 
    $_.FullName -notmatch "attached_assets" -and 
    $_.Name -ne "package-lock.json"
}

Write-Host "Encontrados $($files.Count) arquivos..."

foreach ($file in $files) {
    $relativePath = $file.FullName.Replace("$projectPath\", "")
    Write-Host "Adicionando: $relativePath"
    
    "========================================" | Out-File $bundlePath -Append -Encoding utf8
    "FILE: $relativePath" | Out-File $bundlePath -Append -Encoding utf8
    "========================================" | Out-File $bundlePath -Append -Encoding utf8
    Get-Content $file.FullName -Raw | Out-File $bundlePath -Append -Encoding utf8
    "" | Out-File $bundlePath -Append -Encoding utf8
}

$size = [math]::Round((Get-Item $bundlePath).Length / 1KB, 2)
Write-Host "Bundle criado com sucesso! Tamanho: $size KB"
