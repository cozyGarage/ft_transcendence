# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### Development Environment Issues

#### 1. Frontend won't start - "Cannot find module"

**Symptoms:**
```
Error: Cannot find module 'react'
Error: Cannot find module 'vite'
```

**Solution:**
```bash
# Remove node_modules volume and reinstall
docker-compose -f docker-compose.dev.yml down
docker volume rm ft_transcendence_node_modules
docker-compose -f docker-compose.dev.yml up -d front-end-dev

# Wait for installation to complete, then check logs
docker-compose -f docker-compose.dev.yml logs -f front-end-dev
```

**Why this happens:**
- node_modules might be corrupted
- Host OS binaries mixed with container binaries
- Named volume ensures Linux-compatible dependencies

---

#### 2. Backend "relation does not exist" error

**Symptoms:**
```
django.db.utils.ProgrammingError: relation "accounts_user" does not exist
```

**Solution:**
```bash
# Run migrations
docker-compose -f docker-compose.dev.yml exec back-end-dev python manage.py migrate

# If that doesn't work, reset database:
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

**Why this happens:**
- Database migrations haven't been run
- Database was reset but migrations weren't reapplied

---

#### 3. WebSocket connection fails with 4001

**Symptoms:**
```
WebSocket connection closed: code=4001
```

**Solution:**
```typescript
// Ensure you're passing the JWT token
const ws = new WebSocket(`ws://localhost:8000/ws/game/room1/?token=${accessToken}`);

// Check if token is valid
console.log('Token:', accessToken); // Should not be null/undefined

// Try refreshing your auth token
await authStore.refreshToken();
```

**Why this happens:**
- Missing JWT token in WebSocket URL
- Expired token
- Invalid token format

---

#### 4. CORS errors

**Symptoms:**
```
Access to fetch at 'http://localhost:8000/api/v1/users/' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**Solution:**
```bash
# Check .env file:
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Restart backend:
docker-compose -f docker-compose.dev.yml restart back-end-dev
```

**Why this happens:**
- Frontend origin not in CORS_ALLOWED_ORIGINS
- .env not loaded properly

---

#### 5. Port already in use

**Symptoms:**
```
Error: bind: address already in use
```

**Solution:**
```powershell
# Windows - Find process using port 5173
netstat -ano | findstr :5173

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F

# Or change port in docker-compose.dev.yml:
ports:
  - "5174:5173"  # Use 5174 instead
```

**Linux/Mac:**
```bash
# Find and kill process
lsof -ti:5173 | xargs kill -9

# Or change port as above
```

---

### Database Issues

#### 6. Can't connect to PostgreSQL

**Symptoms:**
```
FATAL: password authentication failed for user "postgres"
```

**Solution:**
```bash
# Check .env file
POSTGRES_USER=postgres
POSTGRES_PASSWORD=yourpassword
POSTGRES_DB=ft_transcendence

# Reset database container
docker-compose -f docker-compose.dev.yml down -v database
docker-compose -f docker-compose.dev.yml up -d database

# Wait 10 seconds, then restart backend
docker-compose -f docker-compose.dev.yml restart back-end-dev
```

---

#### 7. Database queries are slow

**Solution:**
```bash
# Check database connections
docker-compose -f docker-compose.dev.yml exec database psql -U postgres -d ft_transcendence -c "SELECT count(*) FROM pg_stat_activity;"

# Add database indexes (example)
docker-compose -f docker-compose.dev.yml exec back-end-dev python manage.py dbshell

# In psql:
CREATE INDEX idx_user_email ON accounts_user(email);
CREATE INDEX idx_tournament_date ON tournament_tournament(created_at);
```

---

### Redis Issues

#### 8. WebSocket messages not routing

**Symptoms:**
- Messages sent but not received by other clients
- "ConnectionRefusedError: [Errno 111] Connection refused" in logs

**Solution:**
```bash
# Check if Redis is running
docker-compose -f docker-compose.dev.yml ps redis

# Check Redis connection
docker-compose -f docker-compose.dev.yml exec redis redis-cli ping
# Should return: PONG

# Check Redis logs
docker-compose -f docker-compose.dev.yml logs redis

# If Redis is not running:
docker-compose -f docker-compose.dev.yml up -d redis
docker-compose -f docker-compose.dev.yml restart back-end-dev
```

**Check settings.py:**
```python
CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels_redis.core.RedisChannelLayer",
        "CONFIG": {
            "hosts": [("redis", 6379)],  # Should be "redis" not "localhost"
        },
    },
}
```

---

### Frontend Issues

#### 9. Hot reload not working

**Symptoms:**
- Changes to files don't reflect in browser
- Need to manually refresh

**Solution for Vite:**
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    host: true,
    watch: {
      usePolling: true,  // For Docker on Windows/Mac
    }
  }
});
```

```bash
# Restart frontend container
docker-compose -f docker-compose.dev.yml restart front-end-dev
```

---

#### 10. Build fails - "JavaScript heap out of memory"

**Solution:**
```yaml
# docker-compose.dev.yml
front-end-dev:
  environment:
    - NODE_OPTIONS=--max-old-space-size=4096
```

Or build on host instead:
```bash
cd frontend-react
pnpm build
```

---

### Docker Issues

#### 11. "No space left on device"

**Solution:**
```bash
# Clean up Docker
docker system prune -a --volumes

# Remove unused images
docker image prune -a

# Check disk usage
docker system df
```

---

#### 12. Container keeps restarting

**Solution:**
```bash
# Check logs for error
docker-compose -f docker-compose.dev.yml logs --tail=100 back-end-dev

# Common causes:
# - Syntax error in code
# - Missing environment variable
# - Port conflict
# - Database not ready

# Debug by running container interactively
docker-compose -f docker-compose.dev.yml run --rm back-end-dev sh
```

---

#### 13. Slow Docker performance on Windows

**Solution:**
```bash
# Use WSL2 backend in Docker Desktop settings
# Settings → General → Use WSL 2 based engine

# Move project to WSL2 filesystem
\\wsl$\Ubuntu\home\yourusername\ft_transcendence

# Named volumes are faster than bind mounts
# Already configured in docker-compose.dev.yml for node_modules
```

---

### Security Issues

#### 14. Rate limit blocking legitimate requests

**Symptoms:**
```
429 Too Many Requests
```

**Temporary Solution (Development Only):**
```python
# backend/accounts/views.py
# Comment out rate limiting decorators:
# @ratelimit(key='ip', rate='5/m', block=True)
def login(request):
    ...
```

**Production Solution:**
```python
# Increase rate limit
@ratelimit(key='ip', rate='10/m', block=True)

# Or use user-based rate limiting
@ratelimit(key='user', rate='20/m', block=True)
```

---

#### 15. JWT token expired

**Symptoms:**
```
{"detail":"Token is expired"}
```

**Solution:**
```typescript
// Frontend should auto-refresh via interceptor
// Check: frontend-react/src/api/client.ts

// Manually refresh:
const refreshToken = async () => {
  const response = await axios.post('/api/v1/auth/refresh/', {}, {
    withCredentials: true
  });
  authStore.setAccessToken(response.data.access_token);
};
```

**Adjust token lifetime (settings.py):**
```python
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=30),  # Increase from 15
    "REFRESH_TOKEN_LIFETIME": timedelta(weeks=4),
}
```

---

### Blockchain Issues

#### 16. Transaction fails - "insufficient funds"

**Solution:**
```bash
# Get Sepolia testnet ETH from faucet:
# https://sepoliafaucet.com/
# https://faucet.sepolia.dev/

# Check balance:
# Visit: https://sepolia.etherscan.io/address/<your-wallet-address>
```

---

#### 17. "nonce too low" error

**Solution:**
```python
# backend/tournament/views.py
# Transaction count might be cached, add reset_nonce=True
tx = contract.functions.storeScore(...).buildTransaction({
    "nonce": w3.eth.getTransactionCount(account.address, 'pending'),
    # Use 'pending' instead of 'latest'
})
```

---

### Production Issues

#### 18. 502 Bad Gateway from Nginx

**Solution:**
```bash
# Check if backend is running
docker-compose ps back-end

# Check backend logs
docker-compose logs back-end

# Check nginx logs
docker-compose logs front-end

# Verify nginx config
docker-compose exec front-end nginx -t

# Restart services
docker-compose restart front-end back-end
```

---

#### 19. SSL certificate issues

**Solution:**
```bash
# For development (self-signed):
# Browser will show warning - click "Advanced" → "Proceed"

# For production, use Let's Encrypt:
docker run -it --rm \
  -v ./devops/certs:/etc/letsencrypt \
  certbot/certbot certonly --standalone \
  -d yourdomain.com
```

---

## Debugging Tools

### Backend Debugging

```bash
# Django shell
docker-compose -f docker-compose.dev.yml exec back-end-dev python manage.py shell

# Example: Check user
from accounts.models import User
User.objects.all()

# Database shell
docker-compose -f docker-compose.dev.yml exec back-end-dev python manage.py dbshell

# Interactive Python debugger
# Add to code:
import ipdb; ipdb.set_trace()
```

### Frontend Debugging

```bash
# Check network requests
# Browser DevTools → Network tab

# React DevTools
# Install extension: React Developer Tools

# Check state
# Console: window.__REACT_DEVTOOLS_GLOBAL_HOOK__

# Vite inspect
docker-compose -f docker-compose.dev.yml exec front-end-dev pnpm exec vite-inspect
```

### Database Debugging

```bash
# Connect with psql
docker-compose -f docker-compose.dev.yml exec database psql -U postgres -d ft_transcendence

# Check connections
SELECT * FROM pg_stat_activity;

# Check table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# Slow query analysis
EXPLAIN ANALYZE SELECT * FROM accounts_user WHERE email = 'test@example.com';
```

### Redis Debugging

```bash
# Redis CLI
docker-compose -f docker-compose.dev.yml exec redis redis-cli

# In redis-cli:
PING                    # Test connection
KEYS *                  # List all keys
GET key_name           # Get value
MONITOR                # Watch all commands
INFO                   # Server info
```

### Network Debugging

```bash
# Check if service is listening
docker-compose -f docker-compose.dev.yml exec back-end-dev netstat -tlnp

# Test connectivity between containers
docker-compose -f docker-compose.dev.yml exec front-end-dev ping back-end-dev
docker-compose -f docker-compose.dev.yml exec back-end-dev ping database

# Check DNS resolution
docker-compose -f docker-compose.dev.yml exec back-end-dev nslookup database
```

---

## Performance Optimization

### Backend

```python
# Use select_related for foreign keys
users = User.objects.select_related('player').all()

# Use prefetch_related for many-to-many
tournaments = Tournament.objects.prefetch_related('players').all()

# Add database indexes
class Meta:
    indexes = [
        models.Index(fields=['email']),
        models.Index(fields=['created_at']),
    ]

# Use caching
from django.core.cache import cache
result = cache.get('key')
if not result:
    result = expensive_operation()
    cache.set('key', result, 300)  # 5 minutes
```

### Frontend

```typescript
// Lazy load routes
const GamePage = lazy(() => import('./pages/GamePage'));

// Memoize expensive components
const ExpensiveComponent = memo(({ data }) => {
  return <div>{data}</div>;
});

// Use React Query for data fetching
const { data } = useQuery('users', fetchUsers);
```

---

## Getting Additional Help

If none of these solutions work:

1. **Check logs comprehensively:**
   ```bash
   docker-compose -f docker-compose.dev.yml logs --tail=200 > debug.log
   ```

2. **Clean slate:**
   ```bash
   docker-compose -f docker-compose.dev.yml down -v
   docker system prune -a
   docker-compose -f docker-compose.dev.yml up --build
   ```

3. **Check documentation:**
   - [DEVOPS_EXPLAINED.md](DEVOPS_EXPLAINED.md)
   - [SECURITY_IMPLEMENTATION.md](SECURITY_IMPLEMENTATION.md)
   - [QUICK_START.md](QUICK_START.md)

4. **Verify environment:**
   - Copy fresh `.env.example` to `.env`
   - Regenerate `SECRET_KEY`
   - Check all required variables are set

5. **GitHub Issues:**
   - Search existing issues
   - Create new issue with:
     - Full error message
     - Logs from affected service
     - Steps to reproduce
     - Your environment (OS, Docker version)

---

**Remember**: When in doubt, try the "turn it off and on again" approach with Docker containers! 🔄
