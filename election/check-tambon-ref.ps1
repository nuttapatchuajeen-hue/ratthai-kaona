<#
  check-tambon-ref.ps1 — เทียบรูปร่างตำบลทั้งประเทศ กับ "รายชื่อตำบลมาตรฐาน"

  check-tambon.ps1 จับได้เฉพาะตำบลที่ประกาศ กกต. เอ่ยชื่อ (คืออำเภอที่ถูกผ่าครึ่ง)
  ตัวนี้กวาดครบทุกตำบลทั้ง 77 จังหวัด โดยดึงชุดข้อมูลการปกครอง (จังหวัด/อำเภอ/ตำบล)
  จาก kongvut/thai-province-data (อิงข้อมูล กรมการปกครอง) มาเก็บไว้ที่ .tambon-cache/

  รายงาน 4 กลุ่ม
    ก. ขาดจริง          ตำบลในชุดอ้างอิง ที่ไม่มีรูปร่างเลยในจังหวัดนั้น
    ข. สะกดต่าง         จับคู่ได้ด้วยระยะแก้ไข (Levenshtein) ≤ 2
    ค. อยู่คนละอำเภอ     ชื่อตำบลมีในไฟล์ แต่ผูกกับอำเภออื่น
                        (ส่วนใหญ่คือชุดอ้างอิงยังผูกตำบลไว้กับอำเภอแม่ก่อนแยกอำเภอ)
    ง. มีในไฟล์ ไม่มีในอ้างอิง   ชื่อที่ไฟล์ตั้งเอง เช่น "เทศบาล…" หรือชื่อเกาะ

  ⚠ อ่านผลอย่างมีวิจารณญาณ
    - ชุดอ้างอิงตามหลังการตั้งแขวงใหม่ของ กทม. (มี 170 แขวง ปัจจุบัน 180)
    - การจับคู่สะกดอาจผิดได้ ถ้าอำเภอนั้นมีตำบลชื่อคล้ายกันจริง ๆ
      (เช่น ศรีสะเกษ "โพนเขวา" ถูกจับคู่กับ "โพนข่า" ทั้งที่เป็นคนละตำบล)
    - กลุ่ม ก. ต้องอ่านคู่กับกลุ่ม ง. เสมอ หลายรายการเป็นแค่ตั้งชื่อต่าง ไม่ได้หายจริง

  ใช้: powershell -File check-tambon-ref.ps1
       powershell -File check-tambon-ref.ps1 -Refresh    # ดึงชุดอ้างอิงใหม่
#>
param(
    [switch]$Refresh,
    [string]$Out = ""
)
$ErrorActionPreference = 'Stop'
$EL = $PSScriptRoot
$SHDIR = Join-Path $EL "district-shapes"
$CACHE = Join-Path $EL ".tambon-cache"
if (-not $Out) { $Out = Join-Path $EL "check-tambon-ref.txt" }
$BASE = "https://raw.githubusercontent.com/kongvut/thai-province-data/master/data/raw"

if (-not (Test-Path -LiteralPath $CACHE)) { New-Item -ItemType Directory -Path $CACHE | Out-Null }
foreach ($n in @("provinces", "districts", "sub_districts")) {
    $p = Join-Path $CACHE "$n.json"
    if ($Refresh -or -not (Test-Path -LiteralPath $p)) {
        Write-Host "ดึง $n.json ..."
        curl.exe -sS -m 120 -o $p "$BASE/$n.json"
    }
}
function RU($p) { return [System.IO.File]::ReadAllText($p, [System.Text.Encoding]::UTF8) }

$prov = (RU (Join-Path $CACHE "provinces.json"))     | ConvertFrom-Json
$dist = (RU (Join-Path $CACHE "districts.json"))     | ConvertFrom-Json
$sub  = (RU (Join-Path $CACHE "sub_districts.json")) | ConvertFrom-Json

$provName = @{}
foreach ($p in $prov) { if ($p.deleted_at) { continue }; $provName[[int]$p.id] = $p.name_th }
$distInfo = @{}
foreach ($d in $dist) {
    if ($d.deleted_at) { continue }
    $distInfo[[int]$d.id] = [pscustomobject]@{ prov = $provName[[int]$d.province_id]; amp = ($d.name_th -replace '^อำเภอ','' -replace '^เขต','') }
}
$ref = @{}
foreach ($s in $sub) {
    if ($s.deleted_at) { continue }
    $di = $distInfo[[int]$s.district_id]
    if (-not $di) { continue }
    if (-not $ref.ContainsKey($di.prov)) { $ref[$di.prov] = @{} }
    if (-not $ref[$di.prov].ContainsKey($di.amp)) { $ref[$di.prov][$di.amp] = New-Object 'System.Collections.Generic.HashSet[string]' }
    # ตัดคำนำหน้า วงเล็บ และช่องว่าง ให้เทียบได้ตรง ๆ
    [void]$ref[$di.prov][$di.amp].Add(((($s.name_th -replace '^ตำบล','' -replace '^แขวง','') -replace '\s*\([^)]*\)','') -replace '\s',''))
}

function Lev($a, $b) {
    $n = $a.Length; $m = $b.Length
    if ($n -eq 0) { return $m }; if ($m -eq 0) { return $n }
    $prev = New-Object 'int[]' ($m + 1); $cur = New-Object 'int[]' ($m + 1)
    for ($j = 0; $j -le $m; $j++) { $prev[$j] = $j }
    for ($i = 1; $i -le $n; $i++) {
        $cur[0] = $i
        for ($j = 1; $j -le $m; $j++) {
            $c = 1; if ($a[$i-1] -eq $b[$j-1]) { $c = 0 }
            $v = $prev[$j] + 1
            if ($cur[$j-1] + 1 -lt $v) { $v = $cur[$j-1] + 1 }
            if ($prev[$j-1] + $c -lt $v) { $v = $prev[$j-1] + $c }
            $cur[$j] = $v
        }
        for ($j = 0; $j -le $m; $j++) { $prev[$j] = $cur[$j] }
    }
    return $prev[$m]
}

$L  = New-Object System.Collections.Generic.List[string]
$LM = New-Object System.Collections.Generic.List[string]
$LS = New-Object System.Collections.Generic.List[string]
$LA = New-Object System.Collections.Generic.List[string]
$LE = New-Object System.Collections.Generic.List[string]
$tShapes = 0

foreach ($f in (Get-ChildItem -LiteralPath $SHDIR -Filter *.js | Sort-Object Name)) {
    if ($f.Name -like 'index*') { continue }
    if ($f.BaseName -match '-\d{4}$') { continue }      # ไฟล์รายปีใช้รูปร่างชุดเดียวกับฐาน
    $raw = RU $f.FullName
    $pm = [regex]::Match($raw, 'DISTRICT_SHAPES\["([^"]+)"\]')
    if (-not $pm.Success) { continue }
    $pname = $pm.Groups[1].Value
    $shp = @{}; $allTam = @{}
    foreach ($m in [regex]::Matches($raw, '\{"z":\d+,"amp":"([^"]*)","tam":"([^"]*)"')) {
        $a = $m.Groups[1].Value; $t = $m.Groups[2].Value
        if (-not $shp.ContainsKey($a)) { $shp[$a] = New-Object 'System.Collections.Generic.HashSet[string]' }
        [void]$shp[$a].Add($t); $allTam[$t] = $a; $tShapes++
    }
    $R = $ref[$pname]
    if (-not $R) { $L.Add("!! ไม่มีในชุดอ้างอิง: $pname"); continue }

    $ampMap = @{}
    foreach ($a in $R.Keys) {
        if ($shp.ContainsKey($a)) { $ampMap[$a] = $a; continue }
        $best = $null; $bd = 99
        foreach ($b in $shp.Keys) { $d = Lev $a $b; if ($d -lt $bd) { $bd = $d; $best = $b } }
        if ($best -and ($bd -le 4 -or $best.Contains($a) -or $a.Contains($best))) { $ampMap[$a] = $best }
    }

    $matched = @{}
    foreach ($a in ($R.Keys | Sort-Object)) {
        $sa = $ampMap[$a]
        foreach ($t in ($R[$a] | Sort-Object)) {
            if ($sa -and $shp[$sa].Contains($t)) { $matched[$sa + '|' + $t] = $true; continue }
            if ($allTam.ContainsKey($t)) { $matched[$allTam[$t] + '|' + $t] = $true; $LA.Add("$pname : $t — อ้างอิงว่าอยู่ อ.$a · ไฟล์ไว้ที่ อ." + $allTam[$t]); continue }
            $best = $null; $bd = 99
            if ($sa) { foreach ($e in $shp[$sa]) { if ($matched.ContainsKey($sa + '|' + $e)) { continue }; $d = Lev $t $e; if ($d -lt $bd) { $bd = $d; $best = $e } } }
            if ($best -and $bd -le 2) { $matched[$sa + '|' + $best] = $true; $LS.Add("$pname · $a : อ้างอิง '$t' → ไฟล์ '$best'"); continue }
            $LM.Add("$pname · $a / $t")
        }
    }
    foreach ($a in ($shp.Keys | Sort-Object)) {
        foreach ($t in ($shp[$a] | Sort-Object)) {
            if (-not $matched.ContainsKey($a + '|' + $t)) { $LE.Add("$pname · $a / $t") }
        }
    }
}
$L.Add("รูปร่างในไฟล์ $tShapes ชิ้น")
$L.Add(""); $L.Add("########## ก. ขาดจริง (" + $LM.Count + ")");                    foreach ($x in $LM) { $L.Add("  $x") }
$L.Add(""); $L.Add("########## ข. สะกดต่าง (" + $LS.Count + ")");                   foreach ($x in $LS) { $L.Add("  $x") }
$L.Add(""); $L.Add("########## ค. อยู่คนละอำเภอกับชุดอ้างอิง (" + $LA.Count + ")"); foreach ($x in $LA) { $L.Add("  $x") }
$L.Add(""); $L.Add("########## ง. มีในไฟล์ แต่ไม่มีในชุดอ้างอิง (" + $LE.Count + ")"); foreach ($x in $LE) { $L.Add("  $x") }
[System.IO.File]::WriteAllLines($Out, $L, (New-Object System.Text.UTF8Encoding($false)))
Write-Host ("เขียน " + $Out + "  (" + $L.Count + " บรรทัด)")
