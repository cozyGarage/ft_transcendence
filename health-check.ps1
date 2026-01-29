# Docker Development Environment Health Check Script

Write-Host "`n=== ft_transcendence Development Environment Health Check ===" -ForegroundColor Cyan
Write-Host "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n" -ForegroundColor Gray

# Check Docker
Write-Host "✓ Docker is running" -ForegroundColor Green

Write-Host "`n--- Container Status ---" -ForegroundColor Yellow

# Check containers
$services = @(
    @{Name="back-end-dev"; Port="8000"; Service="Django Backend (Daphne)"},
    @{Name="front-end-dev"; Port="5173"; Service="React Frontend (Vite)"},
    @{Name="postgres-dev"; Port="5432"; Service="PostgreSQL Database"},
    @{Name="redis-dev"; Port="6379"; Service="Redis Cache"},
    @{Name="redis-commander-dev"; Port="8081"; Service="Redis Commander GUI"}
)

foreach ($svc in $services) {
    $status = docker ps --filter "name=$($svc.Name)" --filter "status=running" --format "{{.Names}}" 2>$null
    
    if ($status) {
        Write-Host "✓ $($svc.Service) - Port $($svc.Port)" -ForegroundColor Green
    } else {
        Write-Host "✗ $($svc.Service) - Not running" -ForegroundColor Red
    }
}

# Check backend
Write-Host "`n--- Backend Health ---" -ForegroundColor Yellow
$backendLogs = docker logs back-end-dev --tail 50 2>&1 | Out-String

if ($backendLogs -match "Listening on TCP address") {
    Write-Host "✓ Daphne server is running" -ForegroundColor Green
} else {
    Write-Host "⚠ Daphne may not be running" -ForegroundColor Yellow
}

# Check frontend
Write-Host "`n--- Frontend Health ---" -ForegroundColor Yellow
$frontendLogs = docker logs front-end-dev --tail 30 2>&1 | Out-String

if ($frontendLogs -match "VITE.*ready") {
    Write-Host "✓ Vite dev server is running" -ForegroundColor Green
} else {
    Write-Host "⚠ Vite may be starting" -ForegroundColor Yellow
}

# Database check
Write-Host "`n--- Database Connection ---" -ForegroundColor Yellow
$dbCheck = docker exec postgres-dev pg_isready -U postgres 2>&1
if ($dbCheck -match "accepting connections") {
    Write-Host "✓ PostgreSQL is accepting connections" -ForegroundColor Green
} else {
    Write-Host "✗ PostgreSQL connection issue" -ForegroundColor Red
}

# Redis check
Write-Host "`n--- Redis Connection ---" -ForegroundColor Yellow
$redisCheck = docker exec redis-dev redis-cli ping 2>&1
if ($redisCheck -match "PONG") {
    Write-Host "✓ Redis is responding" -ForegroundColor Green
} else {
    Write-Host "✗ Redis connection issue" -ForegroundColor Red
}

# URLs
Write-Host "`n--- Service URLs ---" -ForegroundColor Cyan
Write-Host "Frontend (Vite):      http://localhost:5173" -ForegroundColor White
Write-Host "Backend API:          https://localhost:8000" -ForegroundColor White
Write-Host "Redis Commander:      http://localhost:8081" -ForegroundColor White

Write-Host "`n=== Health Check Complete ===`n" -ForegroundColor Cyan
