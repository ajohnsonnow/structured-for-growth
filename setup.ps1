# Quick Start Script
# Run this script to set up your development environment

Write-Host "🚀 Structured For Growth - Quick Setup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check Node.js installation
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion found" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if node_modules exists
if (Test-Path "node_modules") {
    Write-Host "📦 Dependencies already installed" -ForegroundColor Green
} else {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# Check .env file
if (Test-Path ".env") {
    Write-Host "✅ Environment file exists" -ForegroundColor Green
} else {
    Write-Host "📝 Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ .env file created. Please edit it with your settings" -ForegroundColor Green
    Write-Host "⚠️  Important: Update EMAIL settings in .env file" -ForegroundColor Yellow
}

# Generate JWT secret if needed
$envContent = Get-Content ".env" -Raw
if ($envContent -match "your-super-secret-jwt-key-change-this-in-production") {
    Write-Host "🔐 Generating JWT secret..." -ForegroundColor Yellow
    $secret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    $envContent = $envContent -replace "your-super-secret-jwt-key-change-this-in-production", $secret
    Set-Content ".env" $envContent
    Write-Host "✅ JWT secret generated" -ForegroundColor Green
}

# Create data directory if it doesn't exist
if (-not (Test-Path "data")) {
    Write-Host "📁 Creating data directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "data" | Out-Null
    Write-Host "✅ Data directory created" -ForegroundColor Green
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit .env file with your email settings" -ForegroundColor White
Write-Host "2. Run: npm run dev" -ForegroundColor White
Write-Host "3. Open: http://localhost:5173`n" -ForegroundColor White

Write-Host "📚 Documentation:" -ForegroundColor Yellow
Write-Host "   - README.md - Project overview" -ForegroundColor White
Write-Host "   - SETUP.md - Detailed setup guide" -ForegroundColor White
Write-Host "   - templates/README.md - Template library guide`n" -ForegroundColor White

Write-Host "Would you like to start the development server now? (Y/N): " -ForegroundColor Cyan -NoNewline
$response = Read-Host

if ($response -eq 'Y' -or $response -eq 'y') {
    Write-Host "`n🚀 Starting development server..." -ForegroundColor Green
    npm run dev
} else {
    Write-Host "`nRun 'npm run dev' when you're ready to start!" -ForegroundColor Cyan
}
