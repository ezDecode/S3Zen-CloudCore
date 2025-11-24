# CloudCore URL Shortener - Quick Deployment Script
# Run this script to deploy the URL shortener to Cloudflare Workers

Write-Host "================================" -ForegroundColor Cyan
Write-Host "CloudCore URL Shortener Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if wrangler is installed
Write-Host "Checking for Wrangler CLI..." -ForegroundColor Yellow
$wranglerInstalled = Get-Command wrangler -ErrorAction SilentlyContinue

if (-not $wranglerInstalled) {
    Write-Host "❌ Wrangler not found. Installing..." -ForegroundColor Red
    npm install -g wrangler
} else {
    Write-Host "✅ Wrangler is installed" -ForegroundColor Green
}

Write-Host ""

# Login to Cloudflare
Write-Host "Step 1: Login to Cloudflare" -ForegroundColor Cyan
Write-Host "You'll be redirected to login in your browser..." -ForegroundColor Yellow
wrangler login

Write-Host ""

# Create KV namespace
Write-Host "Step 2: Create KV Namespace" -ForegroundColor Cyan
Write-Host "Creating production namespace..." -ForegroundColor Yellow
$kvOutput = wrangler kv:namespace create "SHORTLINKS" 2>&1 | Out-String

Write-Host $kvOutput

# Extract namespace ID (this is a simple regex, might need adjustment)
if ($kvOutput -match 'id = "([a-f0-9]+)"') {
    $namespaceId = $Matches[1]
    Write-Host "✅ Namespace ID: $namespaceId" -ForegroundColor Green
    
    # Update wrangler.toml
    Write-Host "Updating wrangler.toml..." -ForegroundColor Yellow
    $wranglerToml = Get-Content "wrangler.toml" -Raw
    $wranglerToml = $wranglerToml -replace 'id = "YOUR_KV_NAMESPACE_ID"', "id = `"$namespaceId`""
    Set-Content "wrangler.toml" $wranglerToml
    Write-Host "✅ wrangler.toml updated" -ForegroundColor Green
} else {
    Write-Host "⚠️  Could not extract namespace ID. Please update wrangler.toml manually." -ForegroundColor Yellow
}

Write-Host ""

# Generate API key
Write-Host "Step 3: Generate API Key" -ForegroundColor Cyan
$apiKey = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
Write-Host "Generated API Key: $apiKey" -ForegroundColor Green
Write-Host "⚠️  SAVE THIS KEY - You'll need it for CloudCore frontend!" -ForegroundColor Yellow
Write-Host ""

# Set API key as secret
Write-Host "Setting API key as Worker secret..." -ForegroundColor Yellow
Write-Host "Enter the API key when prompted (copy from above)" -ForegroundColor Yellow
Write-Host $apiKey | wrangler secret put API_KEY

Write-Host ""

# Deploy worker
Write-Host "Step 4: Deploy Worker" -ForegroundColor Cyan
Write-Host "Deploying to Cloudflare..." -ForegroundColor Yellow
wrangler deploy

Write-Host ""

# Final instructions
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Configure custom domain in Cloudflare Dashboard:" -ForegroundColor White
Write-Host "   Workers & Pages > Your Worker > Triggers > Add Custom Domain" -ForegroundColor Gray
Write-Host "   Domain: go.cloudcore.app" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Update CloudCore .env file:" -ForegroundColor White
Write-Host "   VITE_SHORTENER_URL=https://go.cloudcore.app" -ForegroundColor Gray
Write-Host "   VITE_SHORTENER_API_KEY=$apiKey" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Update ALLOWED_ORIGINS in url-shortener.js with your production domains" -ForegroundColor White
Write-Host ""
Write-Host "4. Test the deployment:" -ForegroundColor White
Write-Host "   npm run dev (in CloudCore root)" -ForegroundColor Gray
Write-Host ""
Write-Host "See SHORTENER_INTEGRATION.md for full documentation" -ForegroundColor Cyan
Write-Host ""
