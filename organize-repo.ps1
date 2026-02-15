# ECHONA Repository Organization Script
# This script moves development files to appropriate folders for a clean GitHub repo

Write-Host "Organizing ECHONA Repository..." -ForegroundColor Cyan
Write-Host ""

# Move documentation files to docs/
Write-Host "Moving documentation files..." -ForegroundColor Yellow
$docFiles = @(
    "AUTH_FIX_COMPLETE.md",
    "BACKEND_FIX_README.md",
    "BACKEND_PERMANENT_FIX.md",
    "BUG_FIX_GUIDE.md",
    "BUG_FIX_SUMMARY.md",
    "CHANGES_FOR_GITHUB.md",
    "COMPLETE_SETUP_GUIDE.md",
    "CONNECTIVITY_FIX.md",
    "PERMANENT_FIX_README.md",
    "PHASE3_SURPRISE_ME.md",
    "PHASE4_COMPLETE.md",
    "PHASE4_EMOTION_AWARE.md",
    "PORT_CONFLICT_FIX.md",
    "PROBLEM_FIXED.md",
    "QUICK_REFERENCE.md",
    "QUICK_START.txt",
    "README_START_HERE.txt",
    "SPOTIFY_FIX_SUMMARY.md",
    "SPOTIFY_QUICK_FIX.md",
    "SPOTIFY_REDIRECT_URI_FIX.md",
    "SPOTIFY_SETUP.md",
    "SPOTIFY_STATUS.md",
    "SPOTIFY_TEST_GUIDE.md",
    "SPOTIFY_TROUBLESHOOTING.md",
    "STARTUP_GUIDE.md",
    "TESTING_GUIDE.md",
    "UI_IMPROVEMENTS_COMPLETE.md",
    "UI_UX_QUICK_REFERENCE.md",
    "UI_UX_REDESIGN_COMPLETE.md"
)

foreach ($file in $docFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "docs\" -Force
        Write-Host "  Moved $file" -ForegroundColor Green
    }
}

# Move script files to scripts/
Write-Host "`nMoving script files..." -ForegroundColor Yellow
$scriptFiles = @(
    "START_ECHONA.bat",
    "start-all-services.bat",
    "start-all-services.ps1",
    "start-echona-complete.ps1",
    "start-echona.bat",
    "start-echona.ps1",
    "START_HERE.ps1",
    "STOP_ECHONA.bat",
    "stop-all-services.bat",
    "stop-all-services.ps1",
    "stop-echona-complete.ps1",
    "stop-echona.bat",
    "stop-echona.ps1",
    "health-check.bat",
    "health-check.ps1",
    "validate-system.ps1"
)

foreach ($file in $scriptFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "scripts\" -Force
        Write-Host "  Moved $file" -ForegroundColor Green
    }
}

# Move test files to tests/
Write-Host "`nMoving test files..." -ForegroundColor Yellow
$testFiles = @(
    "demo.html",
    "test-body.json",
    "test-login.json",
    "test-spotify.bat",
    "test-spotify.html",
    "spotify-setup-guide.html"
)

foreach ($file in $testFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "tests\" -Force
        Write-Host "  Moved $file" -ForegroundColor Green
    }
}

Write-Host "`nRepository organization complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Current structure:" -ForegroundColor Cyan
Write-Host "  - docs/     All documentation files"
Write-Host "  - scripts/  Startup and utility scripts"
Write-Host "  - tests/    Test and demo files"
Write-Host "  - frontend/ React application"
Write-Host "  - backend/  Node.js server"
Write-Host "  - ml/       Python ML services"
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Review README.md and update with your information"
Write-Host "  2. Check .gitignore for any additional exclusions"
Write-Host "  3. Run: git add ."
Write-Host "  4. Run: git commit -m 'Reorganize repository structure'"
Write-Host "  5. Push to GitHub"
Write-Host ""
