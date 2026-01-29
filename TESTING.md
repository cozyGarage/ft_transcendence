# Testing Guide

## Backend Tests (Django + Channels)

### Running Tests

```bash
# Run all tests
docker-compose -f docker-compose.dev.yml exec back-end-dev python manage.py test

# Run specific app tests
docker-compose -f docker-compose.dev.yml exec back-end-dev python manage.py test accounts
docker-compose -f docker-compose.dev.yml exec back-end-dev python manage.py test chat
docker-compose -f docker-compose.dev.yml exec back-end-dev python manage.py test game

# Run with verbose output
docker-compose -f docker-compose.dev.yml exec back-end-dev python manage.py test --verbosity=2

# Run specific test class
docker-compose -f docker-compose.dev.yml exec back-end-dev python manage.py test accounts.tests.UserAuthenticationTest

# Run specific test method
docker-compose -f docker-compose.dev.yml exec back-end-dev python manage.py test accounts.tests.UserAuthenticationTest.test_login_with_valid_credentials
```

### Coverage

```bash
# Run tests with coverage
docker-compose -f docker-compose.dev.yml exec back-end-dev coverage run --source='.' manage.py test

# Generate coverage report
docker-compose -f docker-compose.dev.yml exec back-end-dev coverage report

# Generate HTML coverage report
docker-compose -f docker-compose.dev.yml exec back-end-dev coverage html
# Opens in browser: backend/htmlcov/index.html
```

### Test Categories

**Unit Tests**: Test individual functions and models
- `accounts/tests.py` - Authentication, registration, token refresh
- `game/tests.py` - Game room creation, player management
- `tournament/tests.py` - Tournament creation, scoring

**WebSocket Tests**: Test real-time consumers
- `chat/tests.py` - Chat consumer with JWT auth
- `game/consumers.py` - Game state synchronization
- `notification/tests.py` - Notification delivery

**Integration Tests**: Test full request/response cycles
- API endpoints with authentication
- Database interactions
- Rate limiting

## Frontend Tests

### Unit Tests (Vitest)

```bash
cd frontend-react

# Run tests in watch mode
pnpm test

# Run tests once
pnpm test run

# Run with UI
pnpm test:ui

# Coverage report
pnpm test:coverage
```

**Test Files:**
- `src/components/__tests__/*.test.tsx` - Component tests
- `src/api/__tests__/*.test.ts` - API client tests
- `src/utils/__tests__/*.test.ts` - Utility function tests

### E2E Tests (Playwright)

```bash
cd frontend-react

# Run E2E tests
pnpm test:e2e

# Run with UI for debugging
pnpm test:e2e:ui

# Run specific test file
pnpm exec playwright test e2e/integration.spec.ts

# Debug mode (step through tests)
pnpm test:e2e:debug

# Generate test report
pnpm exec playwright show-report
```

**E2E Test Scenarios:**
- Authentication flow (login, 2FA, logout)
- WebSocket connections (chat, game, notifications)
- API integration
- Navigation and routing

### Visual Regression Tests

```bash
# Update visual snapshots
pnpm exec playwright test --update-snapshots

# Compare with baselines
pnpm test:e2e
```

## Integration Testing (Full Stack)

### Complete Test Suite

```bash
# 1. Start development environment
docker-compose -f docker-compose.dev.yml up -d

# 2. Wait for services to be ready
sleep 15

# 3. Run backend tests
docker-compose -f docker-compose.dev.yml exec back-end-dev python manage.py test

# 4. Run frontend unit tests
cd frontend-react && pnpm test run

# 5. Run E2E tests (requires both services running)
pnpm test:e2e

# 6. Check coverage
docker-compose -f docker-compose.dev.yml exec back-end-dev coverage report
cd frontend-react && pnpm test:coverage
```

### Automated Test Script

Create `run-all-tests.ps1`:

```powershell
Write-Host "Starting Full Test Suite..." -ForegroundColor Cyan

# Start services
docker-compose -f docker-compose.dev.yml up -d
Start-Sleep -Seconds 20

# Backend tests
Write-Host "`nRunning Backend Tests..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml exec -T back-end-dev python manage.py test

# Frontend unit tests
Write-Host "`nRunning Frontend Unit Tests..." -ForegroundColor Yellow
cd frontend-react
pnpm test run

# E2E tests
Write-Host "`nRunning E2E Tests..." -ForegroundColor Yellow
pnpm test:e2e

Write-Host "`nAll Tests Complete!" -ForegroundColor Green
```

## Writing New Tests

### Backend Test Template

```python
from django.test import TestCase
from rest_framework.test import APIClient
from accounts.models import User

class MyFeatureTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_feature_works(self):
        """Test description"""
        response = self.client.get('/api/v1/endpoint/')
        self.assertEqual(response.status_code, 200)
```

### Frontend Component Test Template

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### E2E Test Template

```typescript
import { test, expect } from '@playwright/test';

test('feature works end-to-end', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.click('button:has-text("Click Me")');
  await expect(page.locator('.result')).toContainText('Success');
});
```

## CI/CD Integration

Tests run automatically on:
- Every commit (pre-commit hook)
- Pull requests (GitHub Actions)
- Before deployment

See `.github/workflows/test.yml` for CI configuration.

## Debugging Failed Tests

### Backend
```bash
# Run single test with pdb debugger
docker-compose -f docker-compose.dev.yml exec back-end-dev python manage.py test accounts.tests.MyTest --pdb

# Check logs
docker logs back-end-dev
```

### Frontend
```bash
# Run test in debug mode
pnpm test -- --inspect-brk

# Use Playwright inspector
pnpm test:e2e:debug
```

## Performance Testing

### Load Testing
```bash
# Install k6
choco install k6

# Run load test
k6 run tests/load/api-load-test.js
```

### WebSocket Performance
```bash
# Test concurrent WebSocket connections
artillery run tests/artillery/websocket-test.yml
```
