# GCP Cloud Run Deployment Script for SkillBridge

$Project = "atomic-segment-466806-v8"
$Region = "europe-west1"
$RepoName = "skillbridge"
$ServiceName = "skillbridge-app"
$ImageTag = "europe-west1-docker.pkg.dev/$Project/$RepoName/app:latest"

Write-Host "==============================================" -ForegroundColor Green
Write-Host "Starting SkillBridge Production Deployment" -ForegroundColor Green
Write-Host "Project: $Project" -ForegroundColor Cyan
Write-Host "Region: $Region" -ForegroundColor Cyan
Write-Host "Image: $ImageTag" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Green

# Ensure correct project is set
gcloud config set project $Project

# 1. Build and Push Docker image using Google Cloud Build
Write-Host "Running Google Cloud Build..." -ForegroundColor Yellow
gcloud builds submit --tag $ImageTag --timeout=15m

if ($LASTEXITCODE -ne 0) {
    Write-Error "Google Cloud Build failed! Deployment aborted."
    exit 1
}

Write-Host "Google Cloud Build completed successfully! Image is pushed to Artifact Registry." -ForegroundColor Green

# 2. Get environment variables for deployment
# Try to read default values from .env.production first, then .env
$LocalEnv = @{}
if (Test-Path ".env.production") {
    Get-Content ".env.production" | ForEach-Object {
        if ($_ -match "^([^=]+)=(.*)$") {
            $key = $Matches[1].Trim()
            $val = $Matches[2].Trim().Trim('"').Trim("'")
            $LocalEnv[$key] = $val
        }
    }
}
if (-not $LocalEnv["DATABASE_URL"] -and (Test-Path ".env")) {
    Get-Content ".env" | ForEach-Object {
        if ($_ -match "^([^=]+)=(.*)$") {
            $key = $Matches[1].Trim()
            $val = $Matches[2].Trim().Trim('"').Trim("'")
            if (-not $LocalEnv[$key]) {
                $LocalEnv[$key] = $val
            }
        }
    }
}

$DefaultGeminiKey = $LocalEnv["GEMINI_API_KEY"]
$DefaultNextAuthSecret = $LocalEnv["NEXTAUTH_SECRET"]
$DefaultDatabaseUrl = $LocalEnv["DATABASE_URL"]
$DefaultNextauthUrl = $LocalEnv["NEXTAUTH_URL"]

# Get MS SQL Database URL
$DatabaseUrl = [System.Environment]::GetEnvironmentVariable("DATABASE_URL")
if (-not $DatabaseUrl) {
    $DatabaseUrl = $DefaultDatabaseUrl
}
if (-not $DatabaseUrl) {
    $DatabaseUrl = Read-Host "Enter production MS SQL Database URL (sqlserver://...)"
}

if (-not $DatabaseUrl) {
    Write-Error "Database URL is required for deployment."
    exit 1
}

# Get NextAuth Secret
$NextauthSecret = $DefaultNextAuthSecret
if (-not $NextauthSecret) {
    $NextauthSecret = "skillbridge-prod-secret-key-$(Get-Random)"
}

# Get Gemini API Key
$GeminiApiKey = [System.Environment]::GetEnvironmentVariable("GEMINI_API_KEY")
if (-not $GeminiApiKey) {
    $GeminiApiKey = $DefaultGeminiKey
}
if (-not $GeminiApiKey) {
    $GeminiApiKey = Read-Host "Enter GEMINI_API_KEY"
}

# Get NextAuth URL
$NextauthUrl = [System.Environment]::GetEnvironmentVariable("NEXTAUTH_URL")
if (-not $NextauthUrl) {
    $NextauthUrl = $DefaultNextauthUrl
}
if (-not $NextauthUrl) {
    $CustomDomain = Read-Host "Enter production domain/subdomain if already decided (e.g., https://api.yoursite.com) [Press Enter to configure later]"
    if ($CustomDomain) {
        $NextauthUrl = $CustomDomain
    } else {
        # We will set a temporary dummy or fallback, then update it once Cloud Run gives us the URL.
        $NextauthUrl = "https://skillbridge-app-temp.a.run.app"
    }
}

Write-Host "Deploying to Google Cloud Run..." -ForegroundColor Yellow

gcloud run deploy $ServiceName `
  --image=$ImageTag `
  --platform=managed `
  --region=$Region `
  --allow-unauthenticated `
  --set-env-vars="DATABASE_URL=$DatabaseUrl,NEXTAUTH_SECRET=$NextauthSecret,GEMINI_API_KEY=$GeminiApiKey,NEXTAUTH_URL=$NextauthUrl,NODE_ENV=production"

if ($LASTEXITCODE -ne 0) {
    Write-Error "Google Cloud Run deployment failed!"
    exit 1
}

Write-Host "==============================================" -ForegroundColor Green
Write-Host "SkillBridge is deployed successfully!" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green
