# PowerShell Script to Remove Secrets from Git History
# Run this script from the repository root directory

Write-Host "========================================" -ForegroundColor Red
Write-Host "SECURITY WARNING" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host "This script will rewrite Git history!" -ForegroundColor Yellow
Write-Host "Make sure you have:" -ForegroundColor Yellow
Write-Host "1. Backed up your repository" -ForegroundColor Yellow
Write-Host "2. Changed all exposed secrets" -ForegroundColor Yellow
Write-Host "3. Notified all team members" -ForegroundColor Yellow
Write-Host ""
$confirm = Read-Host "Type 'YES' to continue"

if ($confirm -ne "YES") {
    Write-Host "Aborted." -ForegroundColor Red
    exit
}

# Check if git-filter-repo is installed
$gitFilterRepo = Get-Command git-filter-repo -ErrorAction SilentlyContinue

if (-not $gitFilterRepo) {
    Write-Host "git-filter-repo not found. Installing..." -ForegroundColor Yellow
    pip install git-filter-repo
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install git-filter-repo. Please install manually:" -ForegroundColor Red
        Write-Host "pip install git-filter-repo" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "Creating backup..." -ForegroundColor Green
$backupDir = "..\community-hub-connect-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
git clone . $backupDir
Write-Host "Backup created at: $backupDir" -ForegroundColor Green

Write-Host ""
Write-Host "Removing secrets from Git history..." -ForegroundColor Yellow

# Create temporary file with replacements
$replacementsFile = "replacements.txt"
@"
django-insecure-vvt`$vsu*78wtq-`$@y1^uhxszdb*yi!c`$&dn^u7e3^y31^q7j_3==>REMOVED_SECRET_KEY
GhanaDior1000`$==>REMOVED_PASSWORD
"@ | Out-File -FilePath $replacementsFile -Encoding utf8

# Run git-filter-repo
Write-Host "Running git-filter-repo..." -ForegroundColor Yellow
git filter-repo --replace-text $replacementsFile --force

# Clean up
Remove-Item $replacementsFile -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Cleaning up Git references..." -ForegroundColor Yellow
git for-each-ref --format="delete %(refname)" refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "History cleaned!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Verify secrets are removed:" -ForegroundColor White
Write-Host "   git log --all --full-history -p | Select-String -Pattern 'django-insecure|GhanaDior'" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Force push to GitHub (WARNING: This overwrites remote history):" -ForegroundColor Yellow
Write-Host "   git push origin --force --all" -ForegroundColor Gray
Write-Host "   git push origin --force --tags" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Notify all team members to re-clone the repository" -ForegroundColor Yellow
Write-Host ""

