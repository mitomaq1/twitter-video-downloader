# GitHub'a Push Script
# Kullanım: .\push-to-github.ps1 -RepoName "twitter-video-downloader" -GitHubUsername "your-username"

param(
    [Parameter(Mandatory=$true)]
    [string]$RepoName,
    
    [Parameter(Mandatory=$true)]
    [string]$GitHubUsername
)

Write-Host "GitHub Repository Push Script" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green
Write-Host ""

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "Error: Git repository not initialized!" -ForegroundColor Red
    exit 1
}

# Check current branch
$currentBranch = git branch --show-current
if (-not $currentBranch) {
    Write-Host "Creating main branch..." -ForegroundColor Yellow
    git checkout -b main
    $currentBranch = "main"
}

Write-Host "Current branch: $currentBranch" -ForegroundColor Cyan

# Check if remote already exists
$remoteExists = git remote | Select-String -Pattern "origin"
if ($remoteExists) {
    Write-Host "Remote 'origin' already exists. Updating..." -ForegroundColor Yellow
    git remote set-url origin "https://github.com/$GitHubUsername/$RepoName.git"
} else {
    Write-Host "Adding remote 'origin'..." -ForegroundColor Yellow
    git remote add origin "https://github.com/$GitHubUsername/$RepoName.git"
}

Write-Host ""
Write-Host "IMPORTANT: Make sure you have created the repository on GitHub first!" -ForegroundColor Yellow
Write-Host "Repository URL: https://github.com/$GitHubUsername/$RepoName" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to continue with push, or Ctrl+C to cancel..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Green

try {
    git push -u origin $currentBranch
    Write-Host ""
    Write-Host "Success! Repository pushed to GitHub." -ForegroundColor Green
    Write-Host "Repository URL: https://github.com/$GitHubUsername/$RepoName" -ForegroundColor Cyan
} catch {
    Write-Host ""
    Write-Host "Error pushing to GitHub. Please check:" -ForegroundColor Red
    Write-Host "1. Repository exists on GitHub" -ForegroundColor Yellow
    Write-Host "2. You have access to the repository" -ForegroundColor Yellow
    Write-Host "3. GitHub credentials are configured" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "You can also push manually with:" -ForegroundColor Cyan
    Write-Host "git push -u origin $currentBranch" -ForegroundColor White
}

