# =============================================
# check_and_update.ps1
# ---------------------------------------------
# Purpose: Auto-update local repo from GitHub
# Author:  Taher Kezar Jhalodwala
# =============================================

# --- CONFIGURATION ---
$RepoOwner   = "TKezr"     
$RepoName    = "FridAuto"         
$Branch      = "main"            
$LocalDir    = (Get-Location).Path
$VersionFile = Join-Path $LocalDir ".last_commit.txt"

$ProgressPreference = 'SilentlyContinue'

# --- Download a file from URL ---
function Download-File($Url, $OutFile) {
    Write-Host "[+] Downloading $Url -> $OutFile"
    try {
        Invoke-WebRequest -Uri $Url -OutFile $OutFile -UseBasicParsing
    } catch {
        Write-Host "[!] Failed to download $Url : $_"
        Write-Output "STATUS:DOWNLOAD_FAILED"
        exit 1
    }
}

# --- Fetch latest commit SHA from GitHub ---
$ApiUrl = "https://api.github.com/repos/$RepoOwner/$RepoName/commits/$Branch"
Write-Host "[*] Checking latest commit for $RepoOwner/$RepoName ($Branch)..."
try {
    $Response = Invoke-RestMethod -Uri $ApiUrl -UseBasicParsing
    $LatestSHA = $Response.sha
} catch {
    Write-Host "[!] Failed to fetch commit info: $_"
    Write-Output "STATUS:COULD_NOT_CONNECT_TO_GITHUB"
    exit 1
}

if (-not $LatestSHA) {
    Write-Output "STATUS:COULD_NOT_CONNECT_TO_GITHUB"
    exit 1
}

Write-Host "[*] Latest commit SHA: $LatestSHA"

# --- Compare with last local version ---
$LocalSHA = ""
if (Test-Path $VersionFile) {
    $LocalSHA = Get-Content $VersionFile -ErrorAction SilentlyContinue
    Write-Host "[*] Local version: $LocalSHA"
} else {
    Write-Host "[*] No previous version record found. Assuming fresh install."
}

if ($LocalSHA -eq $LatestSHA) {
    Write-Output "STATUS:UP_TO_DATE"
    exit 0
}

# --- Use local temp folder instead of $env:TEMP ---
$TempFolder = Join-Path $LocalDir "__update_temp"
if (Test-Path $TempFolder) { Remove-Item $TempFolder -Recurse -Force }
New-Item -ItemType Directory -Path $TempFolder | Out-Null

$ZipUrl = "https://github.com/$RepoOwner/$RepoName/archive/refs/heads/$Branch.zip"
$ZipFile = Join-Path $TempFolder "$RepoName.zip"
$TempExtractDir = Join-Path $TempFolder "$RepoName-temp"

# --- Download latest ZIP ---
Download-File $ZipUrl $ZipFile

# --- Extract into current directory ---
Write-Host "[*] Extracting files..."
try {
    if (Test-Path $TempExtractDir) { Remove-Item $TempExtractDir -Recurse -Force }
    Expand-Archive -Path $ZipFile -DestinationPath $TempExtractDir -Force

    $ExtractedFolder = Join-Path $TempExtractDir "$RepoName-$Branch"

    Write-Host "[*] Updating files in $LocalDir ..."
    Copy-Item -Path "$ExtractedFolder\*" -Destination $LocalDir -Recurse -Force

    # Cleanup
    Remove-Item $TempFolder -Recurse -Force
} catch {
    Write-Host "[!] Extraction or copy failed: $_"
    Write-Output "STATUS:EXTRACTION_FAILED"
    exit 1
}

# --- Save new version ---
$LatestSHA | Out-File -Encoding ascii -FilePath $VersionFile -Force
Write-Host "[+] Updated to latest version ($LatestSHA)."
Write-Output "STATUS:UPDATE_SUCCESS"
Write-Host "[*] All done!"
exit 0
