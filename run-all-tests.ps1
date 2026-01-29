# Full Test Suite Automation Script
# Runs backend, frontend unit, and E2E tests

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  ft_transcendence Test Suite" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Check if services are running
Write-Host "`nChecking Docker services..." -ForegroundColor Yellow
$backendStatus = docker ps --filter "name=back-end-dev" --format "{{.Status}}"
$frontendStatus = docker ps --filter "name=front-end-dev" --format "{{.Status}}"

if (-not $backendStatus) {
    Write-Host "Backend container not running. Starting services..." -ForegroundColor Red
    docker-compose -f docker-compose.dev.yml up -d
    Write-Host "Waiting 20 seconds for services to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 20
} else {
    Write-Host "✓ Services already running" -ForegroundColor Green
}

# Backend Tests
Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "  Backend Tests (Django + Channels)" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

docker-compose -f docker-compose.dev.yml exec -T back-end-dev python manage.py test --verbosity=2

$backendResult = $LASTEXITCODE

# Backend Coverage
Write-Host "`nGenerating coverage report..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml exec -T back-end-dev coverage run --source='.' manage.py test
docker-compose -f docker-compose.dev.yml exec -T back-end-dev coverage report

# Frontend Unit Tests
Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "  Frontend Unit Tests (Vitest)" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

cd frontend-react
pnpm test run
$frontendResult = $LASTEXITCODE

# E2E Tests
Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "  E2E Tests (Playwright)" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

pnpm test:e2e
$e2eResult = $LASTEXITCODE

cd ..

# Summary
Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "  Test Results Summary" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

if ($backendResult -eq 0) {
    Write-Host "✓ Backend Tests: PASSED" -ForegroundColor Green
} else {
    Write-Host "✗ Backend Tests: FAILED" -ForegroundColor Red
}

if ($frontendResult -eq 0) {
    Write-Host "✓ Frontend Tests: PASSED" -ForegroundColor Green
} else {
    Write-Host "✗ Frontend Tests: FAILED" -ForegroundColor Red
}

if ($e2eResult -eq 0) {
    Write-Host "✓ E2E Tests: PASSED" -ForegroundColor Green
} else {
    Write-Host "✗ E2E Tests: FAILED" -ForegroundColor Red
}

Write-Host "`nTest suite complete!`n" -ForegroundColor Cyan

# Exit with error if any tests failed
if (($backendResult -ne 0) -or ($frontendResult -ne 0) -or ($e2eResult -ne 0)) {
    exit 1
}
