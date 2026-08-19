$idx = Get-Content 'district-shapes/index.js' -Raw
$allProvs = [System.Collections.ArrayList]@()
foreach ($m in [regex]::Matches($idx, '"([^"]+)":"([^"]+)"')) {
    [void]$allProvs.Add($m.Groups[1].Value)
}

$years = @(2539, 2544, 2548, 2550, 2554, 2562)

foreach ($yr in $years) {
    $file = "district-shapes/index-$yr.js"
    if (!(Test-Path $file)) {
        Write-Host "=== $yr : NO INDEX FILE ==="
        continue
    }
    $raw = Get-Content $file -Raw
    $ovrProvs = [System.Collections.ArrayList]@()
    foreach ($m in [regex]::Matches($raw, '"([^"]+)":"([^"]+)"')) {
        [void]$ovrProvs.Add($m.Groups[1].Value)
    }
    $missing = $allProvs | Where-Object { $ovrProvs -notcontains $_ }
    Write-Host "=== $yr : override has $($ovrProvs.Count) / $($allProvs.Count) provinces ==="
    if ($missing) {
        Write-Host "MISSING ($($missing.Count)):"
        $missing | ForEach-Object { Write-Host "  - $_" }
    }
    Write-Host ""
}
