<#
  check-missing.ps1 — ตรวจว่ารูปร่างเขตเลือกตั้ง (district-shapes) ขาดตรงไหนบ้าง "รายเขต"

  หน้า election/index.html วาดโมเสกตำบลลงสีตามเขตเลือกตั้งของปีที่เลือก
  ปีเก่า (districtsOwn) แบ่งเขตคนละแบบกับปี 2569 จึงห้ามตกไปใช้ไฟล์รูปร่างปีปัจจุบัน
  จังหวัดที่ยังไม่มีไฟล์ของปีนั้นเลยถูกวาดเป็น "วงหมายเลขเขต" ทับจังหวัดสีเดียวแทน
  (แบบที่เห็นตอนเปิดปี 2544 แล้ว กทม. เป็นสีแดงทึบมีวงเลข 1-37 ลอยอยู่)

  สคริปต์นี้บอก 3 อย่าง (ระบุเป็น "เลขเขต" ไม่ใช่แค่ชื่อจังหวัด)
    1. เขตที่มีในผลเลือกตั้ง แต่ยังไม่มีข้อมูลรายเขตใน detail-<ปี>.js
       → คลิกเขตนั้นบนแผนที่แล้วไม่มีรายชื่อผู้สมัคร/คะแนนขึ้น
    2. จังหวัดที่ "ไม่มีไฟล์รูปร่าง" ของปีนั้น — กระทบกี่เขต เลขอะไรบ้าง
    3. จังหวัดที่มีไฟล์แล้ว แต่ยังขาดบางเขตข้างในไฟล์ (เทียบเลข z กับเขตจริง)

  แหล่งอ้างอิง
    parliament-<ปี>.js → PDATA.zone   = เขตที่มีอยู่จริงตามผลเลือกตั้ง (ตัวตั้ง)
    detail-<ปี>.js     → คีย์ "จังหวัด|เลขเขต" = เขตที่ทำข้อมูลรายเขตแล้ว
    district-shapes/   → index-<ปี>.js บอกว่าจังหวัดไหนใช้ไฟล์รูปร่างชื่ออะไร

  ใช้: powershell -File check-missing.ps1            # สรุปทุกปี
       powershell -File check-missing.ps1 -Year 2544 # เจาะปีเดียว
       powershell -File check-missing.ps1 -Full      # ไล่เลขเขตครบทุกจังหวัด
#>
param(
    [int]$Year = 0,
    [switch]$Full
)

$ErrorActionPreference = 'Stop'
# ไฟล์ข้อมูลเป็น UTF-8 ไม่มี BOM — ถ้าไม่บอก encoding PowerShell 5.1 จะอ่านเป็น ANSI แล้วภาษาไทยเพี้ยน
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Set-Location -LiteralPath $PSScriptRoot

$YEARS = @(2539, 2544, 2548, 2550, 2554, 2562)
if ($Year -gt 0) { $YEARS = @($Year) }

function Read-Utf8($path) {
    return [System.IO.File]::ReadAllText((Resolve-Path -LiteralPath $path), [System.Text.Encoding]::UTF8)
}

# เขตที่มีข้อมูลรายเขต: detail-<ปี>.js มีคีย์ "จังหวัด|เลขเขต"
function Get-ZonesOfYear($yr) {
    $file = "detail-$yr.js"
    if (!(Test-Path $file)) { return $null }
    $raw = Read-Utf8 $file
    $map = @{}
    foreach ($m in [regex]::Matches($raw, '"([^"|]+)\|(\d+)"')) {
        $prov = $m.Groups[1].Value
        $no = [int]$m.Groups[2].Value
        if (-not $map.ContainsKey($prov)) { $map[$prov] = [System.Collections.Generic.HashSet[int]]::new() }
        [void]$map[$prov].Add($no)
    }
    return $map
}

# เขตที่ "มีอยู่จริง" ตามผลเลือกตั้ง: parliament-<ปี>.js → PDATA.zone[{prov,no,...}]
# ใช้เป็นตัวตั้ง เพราะ detail อาจยังทำไม่ครบ (เป็นสิ่งที่สคริปต์นี้ต้องจับ)
function Get-ResultZonesOfYear($yr) {
    $file = "parliament-$yr.js"
    if (!(Test-Path $file)) { return $null }
    $raw = Read-Utf8 $file
    $map = @{}
    foreach ($m in [regex]::Matches($raw, '"prov"\s*:\s*"([^"]+)"\s*,\s*"no"\s*:\s*"?(\d+)"?')) {
        $prov = $m.Groups[1].Value
        $no = [int]$m.Groups[2].Value
        if (-not $map.ContainsKey($prov)) { $map[$prov] = [System.Collections.Generic.HashSet[int]]::new() }
        [void]$map[$prov].Add($no)
    }
    return $map
}

# จังหวัด -> ชื่อไฟล์รูปร่างที่ปีนั้นใช้ (จาก index-<ปี>.js)
function Get-OverrideOfYear($yr) {
    $file = "district-shapes/index-$yr.js"
    if (!(Test-Path $file)) { return $null }
    $raw = Read-Utf8 $file
    $map = @{}
    foreach ($m in [regex]::Matches($raw, '"([^"]+)"\s*:\s*"([^"]+)"')) {
        $map[$m.Groups[1].Value] = $m.Groups[2].Value
    }
    return $map
}

# เลขเขตที่มีรูปร่างจริงในไฟล์ (ทุกตำบลมีฟิลด์ "z" = เลขเขตเลือกตั้ง)
function Get-ZonesInShapeFile($slug) {
    $file = "district-shapes/$slug.js"
    if (!(Test-Path $file)) { return $null }
    $raw = Read-Utf8 $file
    $set = [System.Collections.Generic.HashSet[int]]::new()
    foreach ($m in [regex]::Matches($raw, '"z"\s*:\s*(\d+)')) { [void]$set.Add([int]$m.Groups[1].Value) }
    # ,$set — กัน PowerShell แผ่ HashSet ออกเป็นอาร์เรย์ตอน return (ไม่งั้น .Contains() หาย)
    return , $set
}

# ย่อรายการเลขเขตให้อ่านง่าย: 1,2,3,5,6,9 -> 1-3, 5-6, 9
function Format-Range($nums) {
    $s = @($nums | Sort-Object)
    if ($s.Count -eq 0) { return '' }
    $parts = @(); $start = $s[0]; $prev = $s[0]
    for ($i = 1; $i -le $s.Count; $i++) {
        $cur = if ($i -lt $s.Count) { $s[$i] } else { -999 }
        if ($cur -ne $prev + 1) {
            $parts += if ($start -eq $prev) { "$start" } else { "$start-$prev" }
            $start = $cur
        }
        $prev = $cur
    }
    return ($parts -join ', ')
}

$grand = [ordered]@{}

foreach ($yr in $YEARS) {
    Write-Host ""
    Write-Host ("=" * 68)
    Write-Host "  ปี $yr" -ForegroundColor Cyan
    Write-Host ("=" * 68)

    $zones = Get-ZonesOfYear $yr
    if ($null -eq $zones) { Write-Host "  ไม่พบ detail-$yr.js — ข้าม" -ForegroundColor DarkGray; continue }

    # ── ตรวจที่ 1: เขตที่มีในผลเลือกตั้ง แต่ยังไม่มีข้อมูลรายเขต (คลิกแล้วไม่มีอะไรขึ้น) ──
    $res = Get-ResultZonesOfYear $yr
    $ndCount = 0; $resTotal = 0
    if ($null -ne $res) {
        $noDetail = @()
        foreach ($p in ($res.Keys | Sort-Object)) {
            $resTotal += $res[$p].Count
            # กำหนดค่าตรง ๆ ไม่ใช้ if แบบนิพจน์ — ไม่งั้น PowerShell แผ่ HashSet ออกเป็นอาร์เรย์
            $have = [System.Collections.Generic.HashSet[int]]::new()
            if ($zones.ContainsKey($p)) { $have = $zones[$p] }
            $gap = @($res[$p] | Where-Object { -not $have.Contains($_) })
            if ($gap.Count) {
                $noDetail += [pscustomobject]@{ Prov = $p; Count = $gap.Count; Nums = Format-Range $gap }
                $ndCount += $gap.Count
            }
        }
        if ($ndCount) {
            Write-Host ""
            Write-Host ("  ── ไม่มีข้อมูลรายเขตใน detail-$yr.js ({0}/{1} เขต) ──" -f $ndCount, $resTotal) -ForegroundColor Red
            $show = if ($Full) { $noDetail } else { $noDetail | Sort-Object Count -Descending | Select-Object -First 12 }
            foreach ($r in $show) {
                Write-Host ("    {0,-22} {1,3} เขต   [{2}]" -f $r.Prov, $r.Count, $r.Nums)
            }
            if (-not $Full -and $noDetail.Count -gt 12) {
                Write-Host ("    … อีก {0} จังหวัด (ใส่ -Full เพื่อดูครบ)" -f ($noDetail.Count - 12)) -ForegroundColor DarkGray
            }
        }
    }

    $ovr = Get-OverrideOfYear $yr
    if ($null -eq $ovr) {
        Write-Host "  ไม่พบ district-shapes/index-$yr.js — ปีนี้ยังไม่มีรูปร่างเขตเลย" -ForegroundColor Yellow
        $ovr = @{}
    }

    $provs = @($zones.Keys | Sort-Object)
    $noFile = @(); $partial = @(); $okCount = 0
    $totalZones = 0; $missZones = 0

    foreach ($p in $provs) {
        $want = $zones[$p]
        $totalZones += $want.Count

        if (-not $ovr.ContainsKey($p)) {
            $noFile += [pscustomobject]@{ Prov = $p; Count = $want.Count; Nums = Format-Range $want }
            $missZones += $want.Count
            continue
        }

        $have = Get-ZonesInShapeFile $ovr[$p]
        if ($null -eq $have) {
            $noFile += [pscustomobject]@{ Prov = $p; Count = $want.Count; Nums = ("ไฟล์หาย: " + $ovr[$p]) }
            $missZones += $want.Count
            continue
        }

        $gap = @($want | Where-Object { -not $have.Contains($_) })
        if ($gap.Count -gt 0) {
            $partial += [pscustomobject]@{ Prov = $p; Have = $have.Count; Want = $want.Count; Nums = Format-Range $gap }
            $missZones += $gap.Count
        }
        else { $okCount++ }
    }

    $pct = if ($totalZones) { [math]::Round(($totalZones - $missZones) / $totalZones * 100, 1) } else { 0 }
    Write-Host ""
    Write-Host "  ── รูปร่างเขตบนแผนที่ ──"
    Write-Host ("  จังหวัดครบ {0}/{1}  ·  เขตที่วาดรูปร่างได้ {2}/{3} ({4}%)" -f `
            $okCount, $provs.Count, ($totalZones - $missZones), $totalZones, $pct)

    if ($noFile.Count) {
        Write-Host ""
        Write-Host "  ── ไม่มีไฟล์รูปร่างของปีนี้ (ตกไปใช้วงหมายเลขเขต) ──" -ForegroundColor Yellow
        $show = if ($Full) { $noFile } else { $noFile | Sort-Object Count -Descending | Select-Object -First 12 }
        foreach ($r in $show) {
            Write-Host ("    {0,-22} {1,3} เขต   [{2}]" -f $r.Prov, $r.Count, $r.Nums)
        }
        if (-not $Full -and $noFile.Count -gt 12) {
            Write-Host ("    … อีก {0} จังหวัด (ใส่ -Full เพื่อดูครบ)" -f ($noFile.Count - 12)) -ForegroundColor DarkGray
        }
    }

    if ($partial.Count) {
        Write-Host ""
        Write-Host "  ── มีไฟล์แล้วแต่ยังขาดบางเขตข้างใน ──" -ForegroundColor Magenta
        foreach ($r in $partial) {
            Write-Host ("    {0,-22} มี {1}/{2} เขต   ขาด [{3}]" -f $r.Prov, $r.Have, $r.Want, $r.Nums)
        }
    }

    if (-not $noFile.Count -and -not $partial.Count) {
        Write-Host "  รูปร่างครบทุกเขต" -ForegroundColor Green
    }

    # คีย์เป็นสตริง — [ordered] ตีความคีย์ที่เป็น int ว่าเป็น "ลำดับที่" ไม่ใช่คีย์
    $grand["$yr"] = [pscustomobject]@{
        Year = $yr; Provinces = $provs.Count; ProvOk = $okCount
        Zones = $totalZones; ZonesMissing = $missZones; Pct = $pct
        NoDetail = $ndCount; ResZones = $resTotal
    }
}

if ($grand.Count -gt 1) {
    Write-Host ""
    Write-Host ("=" * 68)
    Write-Host "  สรุปรวม" -ForegroundColor Cyan
    Write-Host ("=" * 68)
    $grand.Values | Format-Table `
    @{L = 'ปี'; E = { $_.Year } },
    @{L = 'จังหวัดครบ'; E = { "$($_.ProvOk)/$($_.Provinces)" } },
    @{L = 'เขตที่มีรูปร่าง'; E = { "$($_.Zones - $_.ZonesMissing)/$($_.Zones)" } },
    @{L = '%'; E = { $_.Pct } },
    @{L = 'ขาดข้อมูลรายเขต'; E = { if ($_.NoDetail) { "$($_.NoDetail)/$($_.ResZones)" } else { "-" } } } -AutoSize
}
