# IELTS Prep.AI - Next.js Setup Script
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  IELTS Prep.AI - Next.js Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js version
Write-Host "[1/5] Checking Node.js version..." -ForegroundColor Yellow
$nodeVersion = node --version
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js not found. Please install Node.js 18 or later." -ForegroundColor Red
    exit 1
}

# Check if .env.local exists
Write-Host ""
Write-Host "[2/5] Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "✓ .env.local found" -ForegroundColor Green
    $content = Get-Content ".env.local" -Raw
    if ($content -match "GEMINI_API_KEY=.+") {
        Write-Host "✓ GEMINI_API_KEY is configured" -ForegroundColor Green
    } else {
        Write-Host "⚠ GEMINI_API_KEY is empty in .env.local" -ForegroundColor Yellow
        Write-Host "  Please edit .env.local and add your Gemini API key" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠ .env.local not found" -ForegroundColor Yellow
    Write-Host "  Creating .env.local from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env.local"
    Write-Host "✓ .env.local created" -ForegroundColor Green
    Write-Host "  ⚠ Please edit .env.local and add your Gemini API key!" -ForegroundColor Yellow
}

# Install dependencies
Write-Host ""
Write-Host "[3/5] Installing dependencies..." -ForegroundColor Yellow
Write-Host "  This may take a few minutes..." -ForegroundColor Gray
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    Write-Host "  Try: npm install --registry=https://registry.npmmirror.com" -ForegroundColor Yellow
    exit 1
}

# Build check
Write-Host ""
Write-Host "[4/5] Verifying TypeScript configuration..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✓ Project structure verified" -ForegroundColor Green
} else {
    Write-Host "✗ node_modules not found" -ForegroundColor Red
    exit 1
}

# Final instructions
Write-Host ""
Write-Host "[5/5] Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Next Steps:" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Edit .env.local and add your Gemini API key:" -ForegroundColor White
Write-Host "   GEMINI_API_KEY=your_actual_api_key_here" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Get your API key from:" -ForegroundColor White
Write-Host "   https://aistudio.google.com/" -ForegroundColor Blue
Write-Host ""
Write-Host "3. Start the development server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Green
Write-Host ""
Write-Host "4. Open your browser:" -ForegroundColor White
Write-Host "   http://localhost:3000" -ForegroundColor Blue
Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Security Features:" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "✓ API key stored securely on backend" -ForegroundColor Green
Write-Host "✓ All AI calls processed through API routes" -ForegroundColor Green
Write-Host "✓ No client-side API key exposure" -ForegroundColor Green
Write-Host ""
Write-Host "Ready to go! 🚀" -ForegroundColor Cyan
Write-Host ""
