# ews-relay-task.ps1 — ตั้งเวลาให้ Windows รัน scripts/ews-relay.js ทุก 15 นาที (ธงเตือนภัยกรมทรัพยากรน้ำ → เว็บจริง)
#
#   ติดตั้ง:  powershell -ExecutionPolicy Bypass -File scripts\ews-relay-task.ps1
#   ถอนออก:  powershell -ExecutionPolicy Bypass -File scripts\ews-relay-task.ps1 -Remove
#
# - งานชื่อ "ratthai-ews-relay" รันในบัญชีผู้ใช้ปัจจุบัน เฉพาะตอนล็อกอินอยู่ (ไม่ต้องเก็บรหัสผ่าน)
# - log ต่อท้ายที่ ..\.ews-relay.log (นอกโฟลเดอร์เว็บ ไม่ขึ้น git)
# - เครื่องปิด = หยุดถ่ายทอด → /api/warn เลิกใช้ไฟล์ที่เก่ากว่า 2 ชม. เอง (แสดงว่าดึงไม่ได้ ไม่โชว์ธงค้าง)
param([switch]$Remove)

$Name = 'ratthai-ews-relay'
if ($Remove) {
  Unregister-ScheduledTask -TaskName $Name -Confirm:$false -ErrorAction SilentlyContinue
  Write-Output "ลบงาน $Name แล้ว"
  return
}

$Repo = Split-Path -Parent $PSScriptRoot
$Node = (Get-Command node -ErrorAction Stop).Source
$Log = Join-Path (Split-Path -Parent $Repo) '.ews-relay.log'
$Script = Join-Path $Repo 'scripts\ews-relay.js'
# cmd /c เพื่อต่อ log ได้ · ใส่เครื่องหมายคำพูดเพราะ path มีช่องว่างและภาษาไทย
$Arg = '/c ""' + $Node + '" "' + $Script + '" >> "' + $Log + '" 2>&1"'

$Action = New-ScheduledTaskAction -Execute 'cmd.exe' -Argument $Arg -WorkingDirectory $Repo
$Trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 15)
$Settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -DontStopIfGoingOnBatteries -AllowStartIfOnBatteries -ExecutionTimeLimit (New-TimeSpan -Minutes 5) -MultipleInstances IgnoreNew
Register-ScheduledTask -TaskName $Name -Action $Action -Trigger $Trigger -Settings $Settings -Description 'ถ่ายทอดธงเตือนภัย ews.dwr.go.th ขึ้น branch ews-data ของ ratthai-kaona (เว็บกรุงเทพฯ ทะลุมิติ)' -Force | Out-Null
Write-Output "ตั้งงาน $Name แล้ว — รันทุก 15 นาที · log: $Log"
