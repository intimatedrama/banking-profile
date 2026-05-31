# fix-wifi-dns.ps1
# Run as Administrator: Right-click > Run with PowerShell (as Admin)
# Fixes DNS/connectivity issues caused by Flipper Zero / ESP32 attacks

#Requires -RunAsAdministrator

Write-Host "`n=== WiFi / DNS Reset Tool ===" -ForegroundColor Cyan

# 1. Check hosts file for suspicious entries
Write-Host "`n[1] Checking hosts file for suspicious entries..." -ForegroundColor Yellow
$hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"
$hostsContent = Get-Content $hostsPath
$suspicious = $hostsContent | Where-Object { $_ -notmatch '^\s*#' -and $_ -match '\S' -and $_ -notmatch '127\.0\.0\.1\s+localhost' -and $_ -notmatch '::1\s+localhost' }
if ($suspicious) {
    Write-Host "  WARNING: Unexpected entries found in hosts file:" -ForegroundColor Red
    $suspicious | ForEach-Object { Write-Host "    $_" -ForegroundColor Red }
    $confirm = Read-Host "  Remove these entries? (y/n)"
    if ($confirm -eq 'y') {
        $cleaned = $hostsContent | Where-Object { $_ -match '^\s*#' -or $_ -notmatch '\S' -or $_ -match '127\.0\.0\.1\s+localhost' -or $_ -match '::1\s+localhost' }
        $cleaned | Set-Content $hostsPath -Encoding ASCII
        Write-Host "  Hosts file cleaned." -ForegroundColor Green
    }
} else {
    Write-Host "  Hosts file looks clean." -ForegroundColor Green
}

# 2. Flush DNS cache
Write-Host "`n[2] Flushing DNS cache..." -ForegroundColor Yellow
ipconfig /flushdns | Out-Null
Write-Host "  Done." -ForegroundColor Green

# 3. Reset Winsock
Write-Host "`n[3] Resetting Winsock catalog..." -ForegroundColor Yellow
netsh winsock reset | Out-Null
Write-Host "  Done." -ForegroundColor Green

# 4. Reset TCP/IP stack
Write-Host "`n[4] Resetting TCP/IP stack..." -ForegroundColor Yellow
netsh int ip reset | Out-Null
Write-Host "  Done." -ForegroundColor Green

# 5. Release and renew IP
Write-Host "`n[5] Releasing and renewing IP address..." -ForegroundColor Yellow
ipconfig /release | Out-Null
ipconfig /renew  | Out-Null
Write-Host "  Done." -ForegroundColor Green

# 6. Set DNS to Cloudflare + Google on the Wi-Fi adapter
Write-Host "`n[6] Setting DNS servers to 1.1.1.1 and 8.8.8.8 on Wi-Fi adapter..." -ForegroundColor Yellow
$wifiAdapter = Get-NetAdapter | Where-Object { $_.Status -eq 'Up' -and ($_.Name -match 'Wi.?Fi|Wireless|WLAN' -or $_.InterfaceDescription -match 'Wi.?Fi|Wireless|802\.11') } | Select-Object -First 1

if ($wifiAdapter) {
    Set-DnsClientServerAddress -InterfaceAlias $wifiAdapter.Name -ServerAddresses ("1.1.1.1", "8.8.8.8")
    Write-Host "  Applied to adapter: $($wifiAdapter.Name)" -ForegroundColor Green
} else {
    Write-Host "  Could not auto-detect Wi-Fi adapter. Applying to all active adapters..." -ForegroundColor Red
    Get-NetAdapter | Where-Object { $_.Status -eq 'Up' } | ForEach-Object {
        Set-DnsClientServerAddress -InterfaceAlias $_.Name -ServerAddresses ("1.1.1.1", "8.8.8.8")
        Write-Host "  Applied to: $($_.Name)" -ForegroundColor Green
    }
}

# 7. Re-register DNS
Write-Host "`n[7] Re-registering DNS..." -ForegroundColor Yellow
ipconfig /registerdns | Out-Null
Write-Host "  Done." -ForegroundColor Green

# 8. Test connectivity
Write-Host "`n[8] Testing connectivity..." -ForegroundColor Yellow
$ping = Test-Connection -ComputerName "1.1.1.1" -Count 2 -Quiet
if ($ping) {
    Write-Host "  Internet connectivity confirmed." -ForegroundColor Green
} else {
    Write-Host "  Still no connectivity. A reboot may be required." -ForegroundColor Red
}

Write-Host "`n=== Done. Reboot recommended to fully apply Winsock/TCP reset. ===" -ForegroundColor Cyan
