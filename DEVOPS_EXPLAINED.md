# Development Environment Guide

## 📁 DevOps Directory Structure Explained

### Why `/devops`?

The `/devops` directory is a **centralized configuration hub** for deployment and operations. This pattern is considered a best practice because:

#### 1. **Separation of Concerns**
```
ft_transcendence/
├── backend/           # Application code (what the app does)
├── frontend-react/    # Frontend code (what users see)
├── blockchain/        # Smart contracts (decentralized logic)
└── devops/           # Infrastructure code (how/where it runs)
```

- **Application logic** stays in `backend/` and `frontend-react/`
- **Infrastructure configuration** stays in `devops/`
- Developers can work on features without touching deployment configs
- DevOps engineers can update infrastructure without touching app code

#### 2. **Single Source of Truth**
All deployment-related files in one place:
```
devops/
├── Dockerfile              # Container build instructions
├── requirements.txt        # Python dependencies (frozen versions)
├── start.sh               # Container startup script
├── nginx/                 # Web server configuration
│   └── nginx.conf
├── prometheus/            # Monitoring configuration
├── grafana/              # Metrics dashboards
├── alertmanager/         # Alert routing
└── certs/                # SSL certificates
```

#### 3. **Environment Consistency**

**Why not put requirements.txt in backend/?**

```python
# backend/requirements.txt (if it existed)
Django==5.0.11  # Development version might be different
```

```python
# devops/requirements.txt (actual)
Django==5.0.11  # EXACT version for production
# All dependencies pinned with specific versions
```

**Benefits:**
- ✅ **Reproducible builds** - Same versions every deployment
- ✅ **No "works on my machine"** - Docker ensures consistency
- ✅ **Easy rollback** - Git history shows exact dependency changes
- ✅ **Security** - Can audit and update specific versions

#### 4. **Multi-Stage Deployment**

The `devops/` structure supports different environments:

```yaml
# Development
docker-compose.dev.yml
- Hot reload enabled
- Debug mode on
- Ports exposed for tools
- Uses devops/Dockerfile (same base)

# Production
docker-compose.yml
- Optimized builds
- Security hardened
- Minimal exposed ports
- Uses devops/Dockerfile (same base)
```

Both use the **same Dockerfile** but with different overrides!

---

## 🔧 How DevOps Components Work Together

### The Dockerfile (Container Blueprint)

```dockerfile
FROM python:3.12-slim          # Base image (OS + Python)
WORKDIR /app                   # Set working directory
COPY ./certs/server.cert .     # SSL certificates
COPY requirements.txt /app     # Dependency list
RUN pip install -r requirements.txt  # Install dependencies
COPY start.sh /                # Startup script
CMD ["daphne", ...]           # Default command
```

**Why this way?**
- **Layered caching** - Docker caches each step, faster rebuilds
- **Security** - SSL certs copied before app code
- **Flexibility** - Can override CMD in docker-compose

### The start.sh Script

```bash
#!/bin/sh
python3 manage.py makemigrations  # Create DB migrations
python3 manage.py migrate          # Apply migrations
python3 manage.py collectstatic    # Gather static files
exec "$@"                          # Run the passed command
```

**Why separate script?**
- **Pre-flight checks** - Ensure DB is ready
- **Idempotent** - Safe to run multiple times
- **Flexible** - Can add more setup steps without changing Dockerfile

### Nginx Configuration

```nginx
devops/nginx/nginx.conf
- Reverse proxy (frontend → backend)
- SSL termination
- Static file serving
- Security headers
- Compression
```

**Why Nginx instead of Django serving directly?**
- ⚡ **Performance** - Nginx is 10x faster for static files
- 🔒 **Security** - Battle-tested reverse proxy
- 📊 **Features** - Caching, compression, rate limiting
- 🔄 **Load balancing** - Can add multiple backend instances

---

## 🚀 Docker Compose Development vs Production

### Development Setup (docker-compose.dev.yml)

```yaml
front-end-dev:
  image: node:20-alpine
  volumes:
    - ./frontend-react:/app    # Live code mounting
    - node_modules:/app/node_modules  # Named volume for speed
  ports:
    - "5173:5173"              # Vite dev server exposed
  command: pnpm dev --host     # Hot reload enabled
```

**Development Features:**
1. **Hot Reload** - Code changes reflect immediately
2. **Exposed Ports** - Can access services directly (DB on 5432, Redis on 6379)
3. **Debug Mode** - Full error traces, Django debug toolbar
4. **Volume Mounts** - Edit code on host, runs in container
5. **Redis Commander** - GUI for inspecting Redis data
6. **No Build Step** - Faster startup, uses source files directly

### Production Setup (docker-compose.yml)

```yaml
front-end:
  image: nginx:latest
  volumes:
    - ./frontend-react/dist:/usr/share/nginx/html  # Pre-built files
    - ./devops/nginx:/etc/nginx/conf.d
  ports:
    - "443:443"                # Only HTTPS exposed
```

**Production Features:**
1. **Optimized Builds** - Minified, compressed assets
2. **Minimal Exposure** - Only necessary ports open
3. **Security Hardened** - Production-ready configs
4. **Monitoring** - Prometheus, Grafana, Alertmanager
5. **SSL/TLS** - Encrypted communications
6. **Health Checks** - Automatic restart on failure

---

## 📊 Complete Service Architecture

```
┌─────────────────────────────────────────────────┐
│  Browser (HTTPS)                                │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  Nginx (front-end container)                    │
│  - SSL Termination                              │
│  - Static file serving (React build)            │
│  - Reverse proxy to backend                     │
│  - Security headers                             │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  Daphne (back-end container)                    │
│  - Django REST API                              │
│  - WebSocket server (Channels)                  │
│  - Business logic                               │
└─────┬────────────────┬──────────────────────────┘
      │                │
      ▼                ▼
┌──────────┐    ┌──────────────┐
│PostgreSQL│    │    Redis     │
│(database)│    │(Channel Layer│
│          │    │ & Cache)     │
└──────────┘    └──────────────┘
```

### Why This Architecture?

1. **Nginx as Gateway**
   - Single entry point
   - Handles SSL complexity
   - Protects backend from direct exposure

2. **Daphne for ASGI**
   - Supports WebSockets (for real-time features)
   - Async request handling
   - Better than traditional WSGI for modern apps

3. **PostgreSQL**
   - ACID compliance (data integrity)
   - Complex queries
   - Relational data (users, games, tournaments)

4. **Redis**
   - WebSocket message routing (Channel Layers)
   - Session storage
   - Caching
   - Real-time pub/sub

---

## 🛠️ Development Workflow

### Starting Development Environment

```bash
# 1. Start all services
docker-compose -f docker-compose.dev.yml up

# What happens:
# - PostgreSQL starts → Creates DB
# - Redis starts → Ready for connections
# - Backend starts → Runs migrations → Starts Daphne
# - Frontend starts → Installs pnpm deps → Starts Vite dev server

# 2. Access services:
# - Frontend: http://localhost:5173 (Vite dev server with HMR)
# - Backend API: http://localhost:8000
# - PostgreSQL: localhost:5432 (use pgAdmin or DBeaver)
# - Redis: localhost:6379 (use Redis Commander on :8081)
```

### Making Changes

```bash
# Frontend changes:
# 1. Edit files in frontend-react/src/
# 2. Save → Vite auto-reloads browser
# 3. No rebuild needed!

# Backend changes:
# 1. Edit files in backend/
# 2. Save → Daphne auto-reloads (Django's --reload)
# 3. New models? Run: docker-compose exec back-end python manage.py makemigrations

# Database schema changes:
docker-compose exec back-end-dev python manage.py makemigrations
docker-compose exec back-end-dev python manage.py migrate

# View logs:
docker-compose -f docker-compose.dev.yml logs -f back-end-dev
docker-compose -f docker-compose.dev.yml logs -f front-end-dev
```

### Why Named Volumes for node_modules?

```yaml
volumes:
  - ./frontend-react:/app                    # Source code
  - node_modules:/app/node_modules          # Dependencies
```

**Problem Without Named Volume:**
- Installing node_modules on host (Windows) includes Windows-specific binaries
- Mounting to Linux container → binaries don't work
- Result: "Error: Cannot find module..."

**Solution:**
- Named volume `node_modules` is Linux-native
- Only source code is mounted from host
- Dependencies install inside container → always compatible
- 10x faster than host mounting (no filesystem translation)

---

## 🔒 Security Layers in DevOps Structure

### 1. Certificates (`devops/certs/`)
```
certs/
├── server.cert    # Public certificate
└── server.key     # Private key
```

**Why in devops?**
- Centralized secret management
- Easy to gitignore
- Can be replaced without touching app code
- Production uses different certs (from Let's Encrypt)

### 2. Environment Variables (`.env`)
```bash
# Not in devops/ because:
# - Different per environment (dev, staging, prod)
# - Contains actual secrets (not templates)
# - Gitignored at root level
```

### 3. Security Headers (nginx.conf)
```nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header Strict-Transport-Security "max-age=31536000";
```

**Centralized in devops/nginx/** because:
- Same headers for all environments
- Version controlled
- Easy to audit and update

---

## 📦 Dependency Management Strategy

### Why `devops/requirements.txt` vs `backend/requirements.txt`?

**Typical Structure (Without devops/):**
```
backend/
├── requirements.txt          # "Django>=5.0"
├── requirements-dev.txt      # "django-debug-toolbar"
└── requirements-prod.txt     # Duplicate dependencies
```

**Our Structure (With devops/):**
```
backend/                      # Application code only
devops/
└── requirements.txt          # Django==5.0.11 (pinned)
```

**Advantages:**
1. **Single source** - No duplicate dependency lists
2. **Pinned versions** - Exact versions in production
3. **Dockerfile integration** - One COPY command
4. **Audit trail** - Git history shows infrastructure changes
5. **Development flexibility** - Can use virtual env locally with different versions

---

## 🚦 Development vs Production Differences

| Aspect | Development | Production |
|--------|-------------|------------|
| **Frontend** | Vite dev server (5173) | Nginx serving built files (443) |
| **Hot Reload** | ✅ Enabled | ❌ Disabled |
| **Debug Mode** | `DEBUG=True` | `DEBUG=False` |
| **Source Maps** | ✅ Included | ❌ Excluded |
| **Ports Exposed** | Many (DB, Redis, etc.) | Minimal (443 only) |
| **SSL** | Self-signed | Let's Encrypt |
| **Logging** | Verbose | Structured (JSON) |
| **Monitoring** | Optional | Prometheus + Grafana |
| **Volume Mounts** | Live source code | Built artifacts |
| **Restart Policy** | `no` | `unless-stopped` |

---

## 🎯 Best Practices We Follow

### 1. **Infrastructure as Code**
All configs in Git → Reproducible environments

### 2. **Immutable Infrastructure**
Containers are disposable → Rebuild, don't patch

### 3. **12-Factor App Principles**
- Config in environment
- Dependencies declared
- Stateless processes
- Logs to stdout

### 4. **Security in Depth**
- Nginx → Application firewall
- Django → Input validation
- PostgreSQL → Row-level security
- Redis → Password protected

### 5. **Developer Experience**
- One command to start: `docker-compose up`
- Hot reload for fast iteration
- Exposed ports for debugging
- Clear separation of concerns

---

## 🔄 Typical Development Day

```bash
# Morning: Start everything
docker-compose -f docker-compose.dev.yml up

# Make frontend changes
# Edit frontend-react/src/components/MyComponent.tsx
# → Browser auto-refreshes

# Make backend changes
# Edit backend/accounts/views.py
# → Django auto-reloads

# Add new dependency
echo "requests==2.31.0" >> devops/requirements.txt
docker-compose -f docker-compose.dev.yml build back-end
docker-compose -f docker-compose.dev.yml up -d back-end

# Database issues? Reset:
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up

# Evening: Stop everything
docker-compose -f docker-compose.dev.yml down
```

---

## 📚 Summary

**Why `/devops` directory?**
- ✅ Centralized infrastructure configuration
- ✅ Clear separation from application code
- ✅ Version-controlled deployment configs
- ✅ Reproducible builds across environments
- ✅ Easy to maintain and audit
- ✅ Scales from development to production

**The DevOps Way:**
```
Code → Build (Dockerfile) → Test → Deploy (docker-compose) → Monitor (Prometheus)
All configs in devops/ → All versioned in Git → All environments consistent
```

This structure follows industry best practices used by companies like Google, Netflix, and Amazon for managing containerized applications!
