# Twitter Video Downloader - Otomatik Test Script
# Kullanım: .\test-video-download.ps1 -TwitterUrl "https://twitter.com/username/status/1234567890"

param(
    [Parameter(Mandatory=$true)]
    [string]$TwitterUrl
)

Write-Host "Twitter Video Downloader - Test Script" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host ""

# Backend URL
$backendUrl = "http://localhost:3001"
$apiUrl = "$backendUrl/api"

# Test 1: Backend Health Check
Write-Host "[1/3] Backend health check..." -ForegroundColor Cyan
try {
    $healthResponse = Invoke-RestMethod -Uri "$backendUrl/health" -Method Get -ErrorAction Stop
    if ($healthResponse.status -eq "ok") {
        Write-Host "✓ Backend is running" -ForegroundColor Green
    } else {
        Write-Host "✗ Backend health check failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Backend is not running! Please start the backend first." -ForegroundColor Red
    Write-Host "  Run: cd backend && npm run dev" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Test 2: Extract Video Info
Write-Host "[2/3] Extracting video information..." -ForegroundColor Cyan
Write-Host "Twitter URL: $TwitterUrl" -ForegroundColor Gray
try {
    $extractBody = @{
        url = $TwitterUrl
    } | ConvertTo-Json

    $extractResponse = Invoke-RestMethod -Uri "$apiUrl/extract" -Method Post -Body $extractBody -ContentType "application/json" -ErrorAction Stop
    
    if ($extractResponse.success) {
        Write-Host "✓ Video information extracted successfully" -ForegroundColor Green
        Write-Host "  Tweet ID: $($extractResponse.data.tweetId)" -ForegroundColor Gray
        Write-Host "  Title: $($extractResponse.data.title)" -ForegroundColor Gray
        Write-Host "  Author: $($extractResponse.data.author)" -ForegroundColor Gray
        
        if ($extractResponse.data.thumbnail) {
            Write-Host "  Thumbnail: $($extractResponse.data.thumbnail)" -ForegroundColor Gray
        }
        
        if ($extractResponse.data.formats -and $extractResponse.data.formats.Count -gt 0) {
            Write-Host "  Formats found: $($extractResponse.data.formats.Count)" -ForegroundColor Gray
        } else {
            Write-Host "  ⚠ No video formats found in extract response" -ForegroundColor Yellow
        }
        
        $tweetId = $extractResponse.data.tweetId
    } else {
        Write-Host "✗ Failed to extract video information" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Error extracting video info: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
    exit 1
}

Write-Host ""

# Test 3: Download Video (Test URL only, don't actually download)
Write-Host "[3/3] Testing video download endpoint..." -ForegroundColor Cyan
try {
    $downloadUrl = "$apiUrl/download?url=$([System.Web.HttpUtility]::UrlEncode($TwitterUrl))"
    
    # Head request to check if endpoint responds
    $downloadResponse = Invoke-WebRequest -Uri $downloadUrl -Method Get -ErrorAction Stop -MaximumRedirection 0
    
    if ($downloadResponse.StatusCode -eq 200) {
        Write-Host "✓ Download endpoint is working" -ForegroundColor Green
        Write-Host "  Content-Type: $($downloadResponse.Headers.'Content-Type')" -ForegroundColor Gray
    } elseif ($downloadResponse.StatusCode -eq 404) {
        Write-Host "⚠ Download endpoint returned 404 (video URL not found)" -ForegroundColor Yellow
        Write-Host "  This might be normal if Twitter's HTML structure changed" -ForegroundColor Gray
    } else {
        Write-Host "⚠ Download endpoint returned status: $($downloadResponse.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 404) {
        Write-Host "⚠ Video download returned 404" -ForegroundColor Yellow
        Write-Host "  This might mean the video URL extraction needs improvement" -ForegroundColor Gray
    } else {
        Write-Host "✗ Error testing download: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=======================================" -ForegroundColor Green
Write-Host "Test completed!" -ForegroundColor Green
Write-Host ""
Write-Host "To manually test in browser:" -ForegroundColor Cyan
Write-Host "  1. Open http://localhost:5173" -ForegroundColor White
Write-Host "  2. Paste the Twitter URL" -ForegroundColor White
Write-Host "  3. Click 'Extract Video'" -ForegroundColor White
Write-Host ""

