# AI Coding Agent Instructions - ft_transcendence

## Project Overview

**ft_transcendence** is a real-time multiplayer gaming platform with Pong/Othello games, blockchain tournament scoring, and comprehensive social features. Built with Django Channels for WebSocket support, React frontend, and Solidity smart contracts.

## Architecture: The Big Picture

### Dual Frontend Strategy
- **`frontend/`** - Original vanilla JS implementation (legacy, Web Components)
- **`frontend-react/`** - Modern React + TypeScript rewrite (active development)
- Focus development on `frontend-react/` using React 18.3, TypeScript 5.6, Vite 6.0

### Real-Time Communication Model
All WebSocket connections use **JWT authentication via query string**:
```typescript
// Pattern used throughout frontend-react/src/
const ws = new WebSocket(`${WS_BASE_URL}/ws/game/${roomId}/?token=${accessToken}`);
```

Backend validates via `JWTAuthMiddleware` in [backend/middleware.py](backend/backend/middleware.py):
- Parses `?token=` from query string
- Validates JWT with `rest_framework_simplejwt.tokens.AccessToken`
- Attaches `User` or `AnonymousUser` to WebSocket scope
- All consumers MUST check `if self.scope['user'].is_anonymous: await self.close(code=4001)`

### Service Boundaries
```
┌─────────────┐    HTTP/WS     ┌──────────────┐    SQL      ┌──────────────┐
│   Nginx     │───────────────▶│   Django     │────────────▶│  PostgreSQL  │
│  (reverse   │                │  + Channels  │             │              │
│   proxy)    │                │              │             └──────────────┘
└─────────────┘                │              │
                               │              │    Pub/Sub  ┌──────────────┐
                               │              │────────────▶│    Redis     │
                               └──────────────┘             │ (channels)   │
                                      │                     └──────────────┘
                                      │ Web3.py
                                      ▼
                               ┌──────────────┐
                               │   Sepolia    │
                               │  Testnet     │
                               └──────────────┘
```

**Key Integration Points:**
- `backend/backend/asgi.py` - Routes WebSocket connections to consumers (chat, game, notification, tournament)
- `backend/backend/settings.py` - Redis channel layer config (NOT InMemoryChannelLayer)
- All consumers inherit from `channels.generic.websocket.AsyncWebsocketConsumer`

### Data Flow: Game Session
1. Frontend creates room via REST API: `POST /api/v1/game/rooms/`
2. Players connect to WebSocket: `ws://localhost:8000/ws/game/{room_id}/?token={jwt}`
3. `JWTAuthMiddleware` authenticates, attaches user to scope
4. `GameConsumer` (backend/game/consumers.py) validates auth, adds to Redis channel group
5. Game state synchronized via channel layers: `await self.channel_layer.group_send(...)`
6. On game end, results stored in PostgreSQL + optionally blockchain

## Critical Developer Workflows

### Development Environment
```bash
# Start development stack (Vite HMR + Django hot reload)
docker-compose -f docker-compose.dev.yml up --build

# Frontend: http://localhost:5173 (Vite dev server)
# Backend: http://localhost:8000 (Django with Daphne ASGI)
# Redis Commander: http://localhost:8081 (GUI for Redis debugging)
```

**Why docker-compose.dev.yml exists:** Named volumes for `node_modules` (10x faster than host mounts on Windows/Mac), exposed ports for debugging tools, pnpm instead of npm.

### Database Migrations
```bash
# ALWAYS create migrations when modifying models
docker-compose -f docker-compose.dev.yml exec back-end-dev python manage.py makemigrations

# Apply migrations
docker-compose -f docker-compose.dev.yml exec back-end-dev python manage.py migrate

# Inspect migration SQL before applying
docker-compose -f docker-compose.dev.yml exec back-end-dev python manage.py sqlmigrate app_name 0001
```

### WebSocket Debugging
```bash
# Monitor Redis pub/sub in real-time
docker-compose -f docker-compose.dev.yml exec redis redis-cli
> MONITOR

# Check active WebSocket connections in Django logs
docker-compose -f docker-compose.dev.yml logs -f back-end-dev | grep "WebSocket"

# Test WebSocket from browser console:
const ws = new WebSocket('wss://localhost:8000/ws/game/test/?token=YOUR_JWT');
ws.onmessage = (e) => console.log(JSON.parse(e.data));
```

### Blockchain Development
```bash
# Compile contracts
cd blockchain
npx hardhat compile

# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia

# CRITICAL: Update backend/tournament/tournament_abi.json with new ABI
# NEVER accept ABI from frontend - security vulnerability (see SECURITY_IMPLEMENTATION.md)
```

**Wallet Management:**
```python
# backend/tournament/views.py
from eth_account import Account
from web3 import Web3

# Load from environment (NEVER commit private keys)
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
account = Account.from_key(PRIVATE_KEY)

# Sign transactions with backend wallet
tx = contract.functions.storeScore(...).buildTransaction({
    "from": account.address,
    "nonce": w3.eth.getTransactionCount(account.address, 'pending'),
    "gas": GAS_LIMIT,
    "gasPrice": w3.eth.gas_price,
})
signed_tx = account.sign_transaction(tx)
tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
```

**Gas Estimation:**
```python
# Dynamic gas estimation (safer than hardcoded GAS_LIMIT)
try:
    estimated_gas = contract.functions.storeScore(
        tournament_id, winner_id, winner_score, loser_id, loser_score
    ).estimate_gas({"from": account.address})
    
    # Add 20% buffer for safety
    gas_limit = int(estimated_gas * 1.2)
except Exception as e:
    # Fallback to default if estimation fails
    gas_limit = int(os.getenv("GAS_LIMIT", "300000"))

# Use current network gas price (better than hardcoded)
gas_price = w3.eth.gas_price
```

**Testnet vs Mainnet:**
```bash
# .env configuration
# TESTNET (Sepolia) - for development
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
CONTRACT_ADDRESS=0x...  # Deployed test contract
PRIVATE_KEY=0x...  # Test wallet (funded from faucet)

# MAINNET - for production (use separate wallet!)
# WEB3_PROVIDER_URI=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
# CONTRACT_ADDRESS=0x...  # Deployed production contract
# PRIVATE_KEY=0x...  # Production wallet (CRITICAL: secure key management)
```

**Pattern:** Deploy to Sepolia first, test extensively, then deploy identical contract to mainnet with production wallet.

## Project-Specific Conventions

### Authentication Flow (2FA + JWT)
1. `POST /api/v1/auth/login/` returns `temp_token` (signed JWT, 5-min expiry)
2. Frontend submits 2FA code with `temp_token` to `/api/v1/auth/verify-2fa/`
3. Backend validates signed token (`jwt.decode(temp_token, settings.SECRET_KEY, algorithms=['HS256'])`)
4. Returns `access_token` (15-min) + `refresh_token` (httpOnly cookie, 4 weeks)
5. Frontend stores `access_token` in memory (Zustand), includes in `Authorization: Bearer {token}`

**Why signed temp_token?** Previously exposed user IDs in plaintext - security fix in [accounts/views.py](backend/accounts/views.py).

### Rate Limiting Pattern
```python
# backend/accounts/views.py
from django_ratelimit.decorators import ratelimit

@ratelimit(key='ip', rate='5/m', block=True)  # 5 requests per minute per IP
@api_view(['POST'])
def login(request):
    # Auth logic
```
**Applied to:** login (5/m), register (3/h), 2FA endpoints (5/m). NOT applied to game endpoints (would break real-time).

### Input Sanitization
```python
# backend/chat/consumers.py
import bleach

message = bleach.clean(
    data.get("message", ""),
    tags=[],  # Strip ALL HTML tags
    strip=True
)
```
**Only in chat consumer** - game state already validated, notifications server-generated.

### Frontend State Management (Zustand)
```typescript
// frontend-react/src/store/authStore.ts
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,  // In-memory only
      user: null,
      // ... persist only user profile, NOT tokens
    }),
    { name: 'auth-storage' }
  )
);
```
**Convention:** Access token in-memory (cleared on refresh), refresh token in httpOnly cookie (auto-sent). NO tokens in localStorage.

### Environment Variables
`.env` file MUST be created from `.env.example`. Critical vars:
```bash
SECRET_KEY=  # Generate: python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
ALLOWED_HOSTS=localhost,127.0.0.1  # NEVER use wildcard "*"
CORS_ALLOWED_ORIGINS=http://localhost:5173  # Frontend dev server
REDIS_HOST=redis  # Container name in docker-compose
CONTRACT_ADDRESS=  # After deploying TournamentScores.sol
```

## Testing Strategy

### Backend Tests (Django + Channels)
```bash
# Run all tests
docker-compose -f docker-compose.dev.yml exec back-end-dev python manage.py test

# Test specific app with verbose output
docker-compose -f docker-compose.dev.yml exec back-end-dev python manage.py test accounts --verbosity=2

# Test specific test class or method
docker-compose -f docker-compose.dev.yml exec back-end-dev python manage.py test accounts.tests.TestLogin
docker-compose -f docker-compose.dev.yml exec back-end-dev python manage.py test accounts.tests.TestLogin.test_valid_credentials

# Run tests with coverage
docker-compose -f docker-compose.dev.yml exec back-end-dev coverage run --source='.' manage.py test
docker-compose -f docker-compose.dev.yml exec back-end-dev coverage report
docker-compose -f docker-compose.dev.yml exec back-end-dev coverage html  # Creates htmlcov/ directory
```

**WebSocket Consumer Testing Pattern:**
```python
# backend/chat/tests.py (example)
from channels.testing import WebsocketCommunicator
from django.test import TransactionTestCase
from backend.asgi import application
from rest_framework_simplejwt.tokens import AccessToken

class ChatConsumerTest(TransactionTestCase):
    async def test_authenticated_connection(self):
        # Create user and get JWT token
        user = await self.create_user()
        token = str(AccessToken.for_user(user))
        
        # Connect to WebSocket with JWT in query string
        communicator = WebsocketCommunicator(
            application,
            f"/ws/chat/room123/?token={token}"
        )
        connected, _ = await communicator.connect()
        self.assertTrue(connected)
        
        # Send message
        await communicator.send_json_to({
            "type": "chat_message",
            "message": "Hello"
        })
        
        # Receive response
        response = await communicator.receive_json_from()
        self.assertEqual(response["message"], "Hello")
        
        # Disconnect
        await communicator.disconnect()
    
    async def test_unauthenticated_connection_rejected(self):
        # Connect without token
        communicator = WebsocketCommunicator(
            application,
            "/ws/chat/room123/"
        )
        connected, _ = await communicator.connect()
        self.assertFalse(connected)  # Should reject connection
```

**Model/View Testing:**
```python
# backend/accounts/tests.py (example)
from django.test import TestCase
from rest_framework.test import APIClient
from accounts.models import User

class UserAuthTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
    
    def test_login_returns_temp_token(self):
        response = self.client.post('/api/v1/auth/login/', {
            'email': 'test@example.com',
            'password': 'testpass123'
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn('temp_token', response.data)
        
    def test_rate_limiting_blocks_excessive_requests(self):
        # Make 6 requests (rate limit is 5/min)
        for i in range(6):
            response = self.client.post('/api/v1/auth/login/', {
                'email': 'test@example.com',
                'password': 'wrongpassword'
            })
        self.assertEqual(response.status_code, 429)  # Too Many Requests
```

### Frontend Tests

**Unit Tests (Vitest):**
```bash
cd frontend-react

# Run tests in watch mode
pnpm test

# Run tests once
pnpm test run

# Run with UI
pnpm test:ui

# Coverage report (opens in browser)
pnpm test:coverage
```

**Test Pattern (Component Testing):**
```typescript
// frontend-react/src/components/__tests__/LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginForm from '../LoginForm';
import * as authApi from '@/api/auth';

// Mock API calls
vi.mock('@/api/auth');

describe('LoginForm', () => {
  it('submits form with valid credentials', async () => {
    const mockLogin = vi.fn().mockResolvedValue({ temp_token: 'abc123' });
    vi.spyOn(authApi, 'login').mockImplementation(mockLogin);
    
    render(<LoginForm />);
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });
});
```

**E2E Tests (Playwright):**
```bash
# Run E2E tests
pnpm test:e2e

# Run with UI for debugging
pnpm test:e2e:ui

# Run specific test file
pnpm exec playwright test e2e/login.spec.ts

# Debug mode
pnpm test:e2e:debug
```

**E2E Test Pattern:**
```typescript
// frontend-react/e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test('user can login and see dashboard', async ({ page }) => {
  // Navigate to login page
  await page.goto('http://localhost:5173/login');
  
  // Fill in credentials
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  
  // Click login
  await page.click('button[type="submit"]');
  
  // Wait for 2FA page
  await expect(page).toHaveURL(/.*verify-2fa/);
  
  // Enter 2FA code (mock or use test code)
  await page.fill('input[name="code"]', '123456');
  await page.click('button[type="submit"]');
  
  // Should redirect to dashboard
  await expect(page).toHaveURL(/.*dashboard/);
  await expect(page.locator('h1')).toContainText('Dashboard');
});

test('WebSocket connection works for game', async ({ page }) => {
  // Login first
  await page.goto('http://localhost:5173/login');
  // ... login steps ...
  
  // Navigate to game
  await page.goto('http://localhost:5173/game/pong');
  
  // Listen for WebSocket messages
  page.on('websocket', ws => {
    ws.on('framereceived', frame => {
      const message = JSON.parse(frame.payload);
      expect(message).toHaveProperty('type');
    });
  });
  
  // Join game room
  await page.click('button:has-text("Join Game")');
  
  // Verify connected
  await expect(page.locator('.connection-status')).toContainText('Connected');
});
```

### Integration Testing

**Test Full Stack (Backend + Frontend + WebSocket):**
```bash
# 1. Start development environment
docker-compose -f docker-compose.dev.yml up -d

# 2. Wait for services to be ready
sleep 10

# 3. Run backend tests
docker-compose -f docker-compose.dev.yml exec back-end-dev python manage.py test

# 4. Run frontend unit tests
cd frontend-react && pnpm test run

# 5. Run E2E tests (requires both frontend and backend running)
pnpm test:e2e

# 6. Check test coverage
docker-compose -f docker-compose.dev.yml exec back-end-dev coverage report
pnpm test:coverage
```

## Common Pitfalls & Solutions

### ❌ Wrong: InMemoryChannelLayer
```python
# settings.py - DO NOT USE
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer"
    }
}
```
**Why wrong:** Doesn't work with multiple Daphne workers, messages lost between processes.

### ✅ Correct: Redis Channel Layer
```python
# settings.py
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("redis", 6379)],  # Container name
        },
    },
}
```

### ❌ Wrong: Client-Provided Contract ABI
```python
# backend/tournament/views.py - SECURITY VULNERABILITY
def store_score(request):
    abi = request.data.get('abi')  # NEVER DO THIS
    contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=abi)
```

### ✅ Correct: Server-Side ABI Storage
```python
# backend/tournament/views.py
with open(os.path.join(BASE_DIR, 'tournament', 'tournament_abi.json')) as f:
    ABI = json.load(f)

contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=ABI)
```

### File Structure Gotcha: Two Backends Modules
- `backend/backend/` - Django project settings (settings.py, urls.py, asgi.py, middleware.py)
- `backend/accounts/`, `backend/game/`, etc. - Django apps

**Not a typo** - Django convention: project folder shares name with outer directory.

## Security Checklist (Before Production)

Refer to [SECURITY_IMPLEMENTATION.md](SECURITY_IMPLEMENTATION.md) for full details:

- [ ] `ALLOWED_HOSTS` set to specific domains (not `["*"]`)
- [ ] `CORS_ALLOWED_ORIGINS` set to frontend URL (not `CORS_ALLOW_ALL_ORIGINS = True`)
- [ ] All WebSocket consumers check `scope['user'].is_anonymous`
- [ ] Rate limiting enabled on auth endpoints
- [ ] Security headers in nginx.conf (CSP, HSTS, X-Frame-Options, etc.)
- [ ] Smart contract deployed with backend wallet as owner
- [ ] `.env` file contains strong `SECRET_KEY` (50+ chars)
- [ ] Database credentials changed from defaults

## Documentation Reference

- [DEVOPS_EXPLAINED.md](DEVOPS_EXPLAINED.md) - Why `/devops` directory exists, infrastructure philosophy
- [QUICK_START.md](QUICK_START.md) - Step-by-step setup, daily workflows
- [ARCHITECTURE_DIAGRAMS.md](ARCHITECTURE_DIAGRAMS.md) - Visual diagrams of system architecture
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Solutions to 19+ common issues
- [SECURITY_IMPLEMENTATION.md](SECURITY_IMPLEMENTATION.md) - Security audit findings & fixes

## Key Files to Understand

- [backend/backend/asgi.py](backend/backend/asgi.py) - WebSocket routing entry point
- [backend/backend/middleware.py](backend/backend/middleware.py) - JWT WebSocket auth logic
- [backend/game/consumers.py](backend/game/consumers.py) - Real-time game state management
- [frontend-react/src/api/client.ts](frontend-react/src/api/client.ts) - Axios interceptors for token refresh
- [docker-compose.dev.yml](docker-compose.dev.yml) - Development environment orchestration
- [blockchain/contracts/TournamentScores.sol](blockchain/contracts/TournamentScores.sol) - Smart contract with access control

---

**Last Updated:** January 2026 | **Primary Stack:** Django 5.0 + React 18 + Channels 4.2 + Solidity 0.8
