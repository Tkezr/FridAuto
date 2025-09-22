param([string]$extraPath)

$env:Path = $env:Path + ";" + $extraPath
Write-Host "Updated PATH: $env:Path"

$ErrorActionPreference = "Stop"

$serversFolder = ".\frida-setup\servers"   # SERVER FOLDER
$adbPath = "adb"

if (-not (Get-Command $adbPath -ErrorAction SilentlyContinue)) {
    Write-Error "[-]adb not found. Add platform-tools to PATH or set \$adbPath to full adb.exe"
    exit 1
}

$devices = & $adbPath devices | Select-Object -Skip 1 | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" }
$deviceLine = $devices | Where-Object { $_ -match "device$" } | Select-Object -First 1
if (-not $deviceLine) { Write-Error "[-]No online device found"; exit 2 }
$deviceId = ($deviceLine -split "\s+")[0]
Write-Host "[+] Using device: $deviceId"

$abi = (& $adbPath -s $deviceId shell getprop ro.product.cpu.abi).Trim()
if (-not $abi) { $abi = (& $adbPath -s $deviceId shell getprop ro.product.cpu.abilist).Trim().Split(',')[0] }
Write-Host "[+] Device ABI: $abi"

$abiMap = @{
    "armeabi-v7a" = "arm"
    "arm64-v8a"   = "arm64"
    "x86"         = "x86"
    "x86_64"      = "x86_64"
}

$fridaAbi = $abiMap[$abi]
$serverFile = Get-ChildItem -Path $serversFolder -File | Where-Object { $_.Name -match $fridaAbi } | Select-Object -First 1

if (-not $serverFile) {
    Write-Error "[-]No frida-server binary found in $serversFolder matching ABI '$abi'"
    exit 3
}

Write-Host "[+] Using frida-server: $($serverFile.FullName)"

& $adbPath -s $deviceId push $serverFile.FullName /data/local/tmp/frida-server
& $adbPath -s $deviceId shell chmod 755 /data/local/tmp/frida-server

Write-Host "[+] Attempting to start frida-server..."
try {
    & $adbPath -s $deviceId shell "su -c 'nohup /data/local/tmp/frida-server >/data/local/tmp/frida-server.log 2>&1 &'"
    Write-Host "[+] Attempted to start frida-server via su."
} catch {
    Write-Warning "[-]adb su failed; trying root..."
    try {
        & $adbPath -s $deviceId root | Out-Null
        Start-Sleep -Seconds 1
        & $adbPath -s $deviceId shell "nohup /data/local/tmp/frida-server >/data/local/tmp/frida-server.log 2>&1 &"
        Write-Host "[+] Started frida-server using adb root"
    } catch {
        Write-Warning "[-]Could not start frida-server; device may not be rooted."
    }
}

# Check process
Start-Sleep -Seconds 1
$psCheck = & $adbPath -s $deviceId shell "ps -A | grep frida-server" 2>$null
if (-not $psCheck) { $psCheck = & $adbPath -s $deviceId shell "ps | grep frida-server" 2>$null }
if ($psCheck) { Write-Host "[+] frida-server is running." } else { Write-Warning "[-]frida-server not running; check logs on device." }

Write-Host "++++++++ Frida is Live ++++++++"
