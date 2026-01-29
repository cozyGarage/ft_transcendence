# Quick Start - Development Environment

## Prerequisites

- Docker Desktop installed
- Git installed
- Text editor (VS Code recommended)

## First Time Setup

### 1. Clone and Configure

```bash
# Navigate to project
cd ft_transcendence

# Copy environment template
cp .env.example .env

# Edit .env with your settings
# Minimum required for development:
# - DEBUG=True
# - POSTGRES_PASSWORD=yourpassword
# - SECRET_KEY=generate-with-python
```

### 2. Generate Secret Key

```bash
# Quick way to generate SECRET_KEY:
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Copy output to .env:
# SECRET_KEY=your-generated-key-here
```

### 3. Start Development Environment

```bash
# Start all services (first time will download images and build)
docker-compose -f docker-compose.dev.yml up

# Or run in background:
docker-compose -f docker-compose.dev.yml up -d

# Watch logs:
docker-compose -f docker-compose.dev.yml logs -f
```

### 4. Access Your Application

- **Frontend (React + Vite HMR)**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin
- **API Documentation**: http://localhost:8000/api/v1/
- **Redis Commander**: http://localhost:8081
- **PostgreSQL**: localhost:5432 (use any DB client)

### 5. Create Superuser (Optional)

```bash
docker-compose -f docker-compose.dev.yml exec back-end-dev python manage.py createsuperuser
```

---

## Daily Development Workflow

### Start Working

```bash
# Start services
docker-compose -f docker-compose.dev.yml up

# Services will auto-reload on code changes!
# - Frontend: Vite HMR (instant)
# - Backend: Django auto-reload (1-2 seconds)
```

### Make Changes

#### Frontend Changes
```bash
# Edit any file in frontend-react/src/
# Save → Browser auto-refreshes
# No manual rebuild needed!
```

#### Backend Changes
```bash
# Edit any file in backend/
# Save → Django restarts automatically
# API updates immediately
```

#### Database Schema Changes
```bash
# After editing models.py:
docker-compose -f docker-compose.dev.yml exec back-end-dev python manage.py makemigrations
docker-compose -f docker-compose.dev.yml exec back-end-dev python manage.py migrate
```

### Stop Working

```bash
# Stop services (keep data)
docker-compose -f docker-compose.dev.yml down

# Stop and remove all data (fresh start next time)
docker-compose -f docker-compose.dev.yml down -v
```

---

## Common Commands

### Container Management

```bash
# Start services
docker-compose -f docker-compose.dev.yml up -d

# Stop services
docker-compose -f docker-compose.dev.yml down

# Restart a specific service
docker-compose -f docker-compose.dev.yml restart back-end-dev

# Rebuild after dependency changes
docker-compose -f docker-compose.dev.yml build back-end-dev
docker-compose -f docker-compose.dev.yml up -d back-end-dev

# View logs
docker-compose -f docker-compose.dev.yml logs -f back-end-dev
docker-compose -f docker-compose.dev.yml logs -f front-end-dev
```

### Database Operations

```bash
# Run migrations
docker-compose -f docker-compose.dev.yml exec back-end-dev python manage.py migrate

# Create migrations
docker-compose -f docker-compose.dev.yml exec back-end-dev python manage.py makemigrations

# Access Django shell
docker-compose -f docker-compose.dev.yml exec back-end-dev python manage.py shell

# Access PostgreSQL shell
docker-compose -f docker-compose.dev.yml exec database psql -U postgres -d ft_transcendence

# Reset database (WARNING: Deletes all data)
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d
```

### Frontend Operations

```bash
# Install new package
docker-compose -f docker-compose.dev.yml exec front-end-dev pnpm add axios

# Run tests
docker-compose -f docker-compose.dev.yml exec front-end-dev pnpm test

# Build for production
docker-compose -f docker-compose.dev.yml exec front-end-dev pnpm build

# Lint code
docker-compose -f docker-compose.dev.yml exec front-end-dev pnpm lint
```

### Backend Operations

```bash
# Install new Python package
# 1. Add to devops/requirements.txt
echo "requests==2.31.0" >> devops/requirements.txt

# 2. Rebuild backend
docker-compose -f docker-compose.dev.yml build back-end-dev
docker-compose -f docker-compose.dev.yml up -d back-end-dev

# Run Django management commands
docker-compose -f docker-compose.dev.yml exec back-end-dev python manage.py <command>

# Create superuser
docker-compose -f docker-compose.dev.yml exec back-end-dev python manage.py createsuperuser

# Collect static files
docker-compose -f docker-compose.dev.yml exec back-end-dev python manage.py collectstatic
```

---

## Troubleshooting

### Frontend won't start / Module not found

```bash
# Remove node_modules volume and reinstall
docker-compose -f docker-compose.dev.yml down
docker volume rm ft_transcendence_node_modules
docker-compose -f docker-compose.dev.yml up -d front-end-dev
```

### Backend connection errors

```bash
# Check if database is ready
docker-compose -f docker-compose.dev.yml ps

# View backend logs
docker-compose -f docker-compose.dev.yml logs back-end-dev

# Restart backend
docker-compose -f docker-compose.dev.yml restart back-end-dev
```

### Database connection refused

```bash
# Database might not be ready, wait 10 seconds and try again
# Or restart database:
docker-compose -f docker-compose.dev.yml restart database
```

### Port already in use

```bash
# Find what's using the port
# Windows:
netstat -ano | findstr :5173
# Linux/Mac:
lsof -i :5173

# Change ports in docker-compose.dev.yml if needed
```

### Complete reset (nuclear option)

```bash
# Stop everything
docker-compose -f docker-compose.dev.yml down -v

# Remove all containers and images
docker system prune -a

# Start fresh
docker-compose -f docker-compose.dev.yml up --build
```

---

## Development Tips

### VS Code Extensions

Recommended extensions for this project:

- **Python** - Python language support
- **Pylance** - Python IntelliSense
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **Docker** - Docker file support
- **PostgreSQL** - Database management
- **Thunder Client** - API testing
- **GitLens** - Git superpowers

### Hot Reload Not Working?

**Frontend:**
```typescript
// vite.config.ts should have:
server: {
  host: true,
  watch: {
    usePolling: true  // For Docker on Windows
  }
}
```

**Backend:**
Django auto-reload works by default with the mounted volume.

### Performance Tips

1. **Use named volumes** for node_modules (already configured)
2. **Don't mount node_modules** from host to container
3. **Exclude node_modules** from Docker build context
4. **Use .dockerignore** to exclude unnecessary files

### Debugging

**Backend (Python):**
```python
# Add breakpoint in code
import pdb; pdb.set_trace()

# Or use ipdb (better)
import ipdb; ipdb.set_trace()
```

**Frontend (TypeScript):**
```typescript
// Browser DevTools or
console.log('Debug:', variable);
debugger; // Pauses in browser
```

### Environment Variables

**Development (.env):**
```bash
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

**Production:**
```bash
DEBUG=False
ALLOWED_HOSTS=yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

---

## Testing

### Run All Tests

```bash
# Frontend tests
docker-compose -f docker-compose.dev.yml exec front-end-dev pnpm test

# Backend tests
docker-compose -f docker-compose.dev.yml exec back-end-dev python manage.py test

# E2E tests (Playwright)
docker-compose -f docker-compose.dev.yml exec front-end-dev pnpm test:e2e
```

### Coverage

```bash
# Frontend coverage
docker-compose -f docker-compose.dev.yml exec front-end-dev pnpm test:coverage

# Backend coverage
docker-compose -f docker-compose.dev.yml exec back-end-dev coverage run manage.py test
docker-compose -f docker-compose.dev.yml exec back-end-dev coverage report
```

---

## Production Build (Local Testing)

```bash
# Build frontend
cd frontend-react
pnpm build

# Start production compose
cd ..
docker-compose up -d

# Access at https://localhost (note HTTPS)
```

---

## Getting Help

- Check logs: `docker-compose -f docker-compose.dev.yml logs -f`
- Read DEVOPS_EXPLAINED.md for architecture details
- Read SECURITY_IMPLEMENTATION.md for security features
- Check .env.example for required environment variables

## Next Steps

1. Read [DEVOPS_EXPLAINED.md](DEVOPS_EXPLAINED.md) to understand the architecture
2. Review [SECURITY_IMPLEMENTATION.md](SECURITY_IMPLEMENTATION.md) for security features
3. Check out the [backend/README.md](backend/README.md) for API documentation
4. Explore [frontend-react/README.md](frontend-react/README.md) for component docs

Happy coding! 🚀
