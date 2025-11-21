# Otomatik Test - Birden fazla Twitter URL'i test et
# Kullanım: .\test-automated.ps1

Write-Host "Twitter Video Downloader - Automated Test Suite" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

# Test URL'leri (örnek - kendi URL'lerinizi ekleyin)
$testUrls = @(
    # Örnek URL'ler - gerçek Twitter URL'leri ile değiştirin
    # "https://twitter.com/username/status/1234567890",
    # "https://x.com/username/status/1234567890"
)

if ($testUrls.Count -eq 0) {
    Write-Host "⚠ No test URLs configured." -ForegroundColor Yellow
    Write-Host "Edit this script and add Twitter URLs to test." -ForegroundColor Gray
    Write-Host ""
    Write-Host "Example:" -ForegroundColor Cyan
    Write-Host '  $testUrls = @(' -ForegroundColor White
    Write-Host '    "https://twitter.com/username/status/1234567890"' -ForegroundColor White
    Write-Host '  )' -ForegroundColor White
    exit 0
}

$backendUrl = "http://localhost:3001"
$apiUrl = "$backendUrl/api"

# Backend kontrolü
Write-Host "[Setup] Checking backend..." -ForegroundColor Cyan
try {
    $healthResponse = Invoke-RestMethod -Uri "$backendUrl/health" -Method Get -ErrorAction Stop
    if ($healthResponse.status -ne "ok") {
        Write-Host "✗ Backend is not healthy" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Backend is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend is not running! Please start it first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Testing $($testUrls.Count) URLs..." -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$failCount = 0

foreach ($url in $testUrls) {
    Write-Host "Testing: $url" -ForegroundColor Yellow
    
    try {
        $extractBody = @{
            url = $url
        } | ConvertTo-Json

        $extractResponse = Invoke-RestMethod -Uri "$apiUrl/extract" -Method Post -Body $extractBody -ContentType "application/json" -ErrorAction Stop
        
        if ($extractResponse.success) {
            Write-Host "  ✓ Success - Tweet ID: $($extractResponse.data.tweetId)" -ForegroundColor Green
            $successCount++
        } else {
            Write-Host "  ✗ Failed - No success response" -ForegroundColor Red
            $failCount++
        }
    } catch {
        Write-Host "  ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
        $failCount++
    }
    
    Write-Host ""
    Start-Sleep -Seconds 1  # Rate limiting için bekle
}

Write-Host "================================================" -ForegroundColor Green
Write-Host "Test Results:" -ForegroundColor Cyan
Write-Host "  Success: $successCount" -ForegroundColor Green
Write-Host "  Failed: $failCount" -ForegroundColor $(if ($failCount -gt 0) { "Red" } else { "Green" })
Write-Host ""

