<#
  check-tambon.ps1 — ตรวจว่า "ตำบล/แขวง" ในไฟล์รูปร่าง (district-shapes) ขาดหรือลงเขตผิด

  คู่กับ check-missing.ps1 (ตัวนั้นตรวจระดับ "เขต" ว่าจังหวัดไหนยังไม่มีไฟล์รูปร่าง)
  ตัวนี้ลงลึกอีกชั้น: เทียบรายชื่อตำบลในไฟล์รูปร่าง กับ "พื้นที่เขตเลือกตั้ง" ที่เขียนไว้
  ใน year-<ปี>.js (คีย์ "จังหวัด|เลขเขต") ซึ่งระบุอำเภอ และระบุตำบลเมื่ออำเภอถูกผ่าครึ่ง
  เช่น "อำเภอเหนือคลอง (ยกเว้นตำบลปกาสัย ...)" / "(เฉพาะตำบล ...)"

  รายงาน 4 อย่าง
    AMPHOE-NOT-IN-SHAPES     อำเภอที่ประกาศพูดถึง แต่ไม่มีในไฟล์รูปร่าง (สะกดต่าง/ขาดจริง)
    TAMBON-NOT-IN-SHAPES     ตำบลที่ประกาศระบุชื่อ แต่ไม่มีรูปร่าง → พื้นที่นั้นถูกกลืน
                             ไปกับตำบลข้างเคียง แล้วลงสีตามเขตของเพื่อนบ้าน (สีเพี้ยน)
    WRONG-ZONE               ตำบลที่ z ในไฟล์รูปร่าง ไม่ตรงกับเขตที่ประกาศระบุ
    NOT-CLAIMED-BY-ANY-ZONE  ตำบลที่มีรูปร่าง แต่ไม่มีเขตไหนอ้างถึง (มักเป็นสะกดไม่ตรงกัน
                             — จะจับคู่กับ TAMBON-NOT-IN-SHAPES ของอำเภอเดียวกันเสมอ)

  แหล่งอ้างอิง
    year-<ปี>.js            → "จังหวัด|เลขเขต": "พื้นที่..."  (ตัวตั้ง)
    district-shapes/index.js + index-<ปี>.js → จังหวัดใช้ไฟล์รูปร่างชื่ออะไรในปีนั้น
    district-shapes/<ไฟล์>.js → {"z","amp","tam","d"}

  ใช้: powershell -File check-tambon.ps1 -Yr 2569
       powershell -File check-tambon.ps1 -Yr 2566 -Out report.txt

  หมายเหตุ ปี 2539/2544/2548/2550 เป็นเขตใหญ่เรียงเบอร์ และข้อความพื้นที่สมัยนั้น
  อ้างชื่อตำบลเก่าที่ถูกยุบ/ย้ายไปแล้ว ผลลัพธ์จึงมี noise มากกว่าปี 2554 ขึ้นไป
#>
param(
    [string]$Yr = "2569",
    [string]$Out = ""
)
$ErrorActionPreference = 'Stop'
$EL = $PSScriptRoot
$SHDIR = Join-Path $EL "district-shapes"
if (-not $Out) { $Out = Join-Path $EL ("check-tambon-" + $Yr + ".txt") }

$L = New-Object System.Collections.Generic.List[string]
function RU($p) { return [System.IO.File]::ReadAllText($p, [System.Text.Encoding]::UTF8) }

# จังหวัด -> ชื่อไฟล์รูปร่างที่ปีนั้นใช้ (ฐาน 2569 แล้วทับด้วย override ของปี)
$idx = @{}
foreach ($m in [regex]::Matches((RU (Join-Path $SHDIR "index.js")), '"([^"]+)"\s*:\s*"([^"]+)"')) { $idx[$m.Groups[1].Value] = $m.Groups[2].Value }
$ovPath = Join-Path $SHDIR "index-$Yr.js"
if (Test-Path -LiteralPath $ovPath) {
  foreach ($m in [regex]::Matches((RU $ovPath), '"([^"]+)"\s*:\s*"([^"]+)"')) { $idx[$m.Groups[1].Value] = $m.Groups[2].Value }
}

# พื้นที่เขต: "จังหวัด|เลขเขต" -> ข้อความที่มีคำว่า อำเภอ/เขต
$areas = @{}
foreach ($m in [regex]::Matches((RU (Join-Path $EL "year-$Yr.js")), '"([฀-๿]+)\|(\d+)"\s*:\s*"([^"]*(?:อำเภอ|เขต)[^"]*)"')) {
  $areas[$m.Groups[1].Value + "|" + $m.Groups[2].Value] = $m.Groups[3].Value
}
$L.Add("year $Yr : area entries = " + $areas.Count)

$shapeCache = @{}
function Get-Shape($prov) {
  if ($shapeCache.ContainsKey($prov)) { return $shapeCache[$prov] }
  $slug = $idx[$prov]
  if (-not $slug) { $shapeCache[$prov] = $null; return $null }
  $p = Join-Path $SHDIR ($slug + ".js")
  if (-not (Test-Path -LiteralPath $p)) { $shapeCache[$prov] = $null; return $null }
  $byAmp = @{}
  foreach ($m in [regex]::Matches((RU $p), '\{"z":(\d+),"amp":"([^"]*)","tam":"([^"]*)"')) {
    $a = $m.Groups[2].Value
    if (-not $byAmp.ContainsKey($a)) { $byAmp[$a] = @{} }
    $byAmp[$a][$m.Groups[3].Value] = [int]$m.Groups[1].Value
  }
  $o = [pscustomobject]@{ slug = $slug; byAmp = $byAmp }
  $shapeCache[$prov] = $o
  return $o
}

# แยกข้อความพื้นที่ -> รายการ { อำเภอ, โหมด, ตำบลที่ระบุ }
#   วงเล็บใช้ทั้ง (...) และ [...]  ·  "เทศบาลตำบลX" ต้องไม่ถูกอ่านเป็นตำบล
function Parse-Area($s, $ampW, $tamW) {
  $s = [regex]::Replace($s, 'และ(?=\s*(อำเภอ|ตำบล|แขวง|เขต))', ' ')
  $items = @()
  $rx = '(?:' + $ampW + ')(?<amp>[^\s\(\)\[\]]+)(?:\s*(?:\((?<par1>[^\)]*)\)|\[(?<par2>[^\]]*)\]))?'
  foreach ($m in [regex]::Matches($s, $rx)) {
    $amp = $m.Groups['amp'].Value.TrimEnd(',', '.', ';')
    $par = $m.Groups['par1'].Value; if (-not $par) { $par = $m.Groups['par2'].Value }
    $mode = 'all'; $tams = @()
    if ($par) {
      if ($par -match 'ยกเว้น') { $mode = 'except' } elseif ($par -match 'เฉพาะ') { $mode = 'only' } else { $mode = 'other' }
      foreach ($t in [regex]::Matches($par, '(?<!เทศบาล)(?<!ส่วน)(?:' + $tamW + ')([^\s\(\)\[\]]+)')) { $tams += $t.Groups[1].Value.TrimEnd(',', '.', ';') }
      if ($tams.Count -eq 0) { $mode = 'other' }
    }
    $items += [pscustomobject]@{ amp = $amp; mode = $mode; tams = $tams; par = $par }
  }
  return $items
}

$provZones = @{}
foreach ($k in $areas.Keys) {
  $pp = $k.Split('|')[0]; $nn = [int]$k.Split('|')[1]
  if (-not $provZones.ContainsKey($pp)) { $provZones[$pp] = @() }
  $provZones[$pp] += $nn
}

$nMissAmp = 0; $nMissTam = 0; $nWrongZ = 0; $nUnclaimed = 0; $nOther = 0
foreach ($prov in ($provZones.Keys | Sort-Object)) {
  $sh = Get-Shape $prov
  if (-not $sh) { $L.Add("!! ไม่มีไฟล์รูปร่าง: $prov"); continue }
  $ampW = 'อำเภอ'; $tamW = 'ตำบล'
  if ($prov -eq 'กรุงเทพมหานคร') { $ampW = 'เขต'; $tamW = 'แขวง' }
  $claim = @{}
  $rep = New-Object System.Collections.Generic.List[string]
  foreach ($z in ($provZones[$prov] | Sort-Object)) {
    $items = Parse-Area $areas["$prov|$z"] $ampW $tamW
    if ($items.Count -eq 0) { $rep.Add("  [z$z] parse-fail: " + $areas["$prov|$z"]); $nOther++; continue }
    foreach ($it in $items) {
      if (-not $sh.byAmp.ContainsKey($it.amp)) { $rep.Add("  [z$z] AMPHOE-NOT-IN-SHAPES: " + $it.amp); $nMissAmp++; continue }
      $all = $sh.byAmp[$it.amp]
      if ($it.mode -eq 'other') { $rep.Add("  [z$z] unparsed-paren " + $it.amp + " (" + $it.par + ")"); $nOther++; continue }
      if ($it.mode -eq 'all') {
        foreach ($t in $all.Keys) { $claim[$it.amp + '|' + $t] = $z }
      } elseif ($it.mode -eq 'only') {
        foreach ($t in $it.tams) {
          if (-not $all.ContainsKey($t)) { $rep.Add("  [z$z] TAMBON-NOT-IN-SHAPES: " + $it.amp + " / " + $t); $nMissTam++ }
          else { $claim[$it.amp + '|' + $t] = $z }
        }
      } else {
        foreach ($t in $it.tams) { if (-not $all.ContainsKey($t)) { $rep.Add("  [z$z] TAMBON-NOT-IN-SHAPES(except): " + $it.amp + " / " + $t); $nMissTam++ } }
        foreach ($t in $all.Keys) { if ($it.tams -notcontains $t) { $claim[$it.amp + '|' + $t] = $z } }
      }
    }
  }
  foreach ($a in ($sh.byAmp.Keys | Sort-Object)) {
    foreach ($t in ($sh.byAmp[$a].Keys | Sort-Object)) {
      $key = "$a|$t"; $actual = $sh.byAmp[$a][$t]
      if ($claim.ContainsKey($key)) {
        if ($claim[$key] -ne $actual) { $rep.Add("  WRONG-ZONE: $a / $t  shapes=z$actual  text=z" + $claim[$key]); $nWrongZ++ }
      } else {
        $rep.Add("  NOT-CLAIMED-BY-ANY-ZONE: $a / $t  (shapes=z$actual)"); $nUnclaimed++
      }
    }
  }
  if ($rep.Count -gt 0) {
    $L.Add("=== $prov  [" + $sh.slug + "]")
    foreach ($r in $rep) { $L.Add($r) }
  }
}
$L.Add("--- สรุปปี $Yr : amphoe-missing=$nMissAmp tambon-missing=$nMissTam wrong-zone=$nWrongZ not-claimed=$nUnclaimed unparsed=$nOther")
[System.IO.File]::WriteAllLines($Out, $L, (New-Object System.Text.UTF8Encoding($false)))
Write-Host ("เขียน " + $Out + "  (" + $L.Count + " บรรทัด)")
