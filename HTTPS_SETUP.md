# HTTPS Development Setup with mkcert

## Quick Setup (5 minutes)

### 1. Install mkcert

**Windows (PowerShell as Admin):**
```powershell
choco install mkcert
# OR with scoop:
scoop bucket add extras
scoop install mkcert
```

**macOS:**
```bash
brew install mkcert
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt install libnss3-tools
wget https://github.com/FiloSottile/mkcert/releases/download/v1.4.4/mkcert-v1.4.4-linux-amd64
chmod +x mkcert-v1.4.4-linux-amd64
sudo mv mkcert-v1.4.4-linux-amd64 /usr/local/bin/mkcert
```

### 2. Generate Trusted Local Certificates

```bash
# Install local CA
mkcert -install

# Generate certificates for localhost
cd devops/certs
mkcert localhost 127.0.0.1 ::1

# Rename files to match nginx config
mv localhost+2.pem server.cert
mv localhost+2-key.pem server.key
```

### 3. Start Development with HTTPS

```bash
# Start all services including nginx
docker-compose -f docker-compose.dev.yml up -d

# Access services:
# - Frontend: https://localhost (via nginx)
# - Backend API: https://localhost/api/v1/
# - Direct Vite: http://localhost:5173
# - Direct Backend: http://localhost:8000
```

## Architecture

```
Browser
   │
   ├─→ https://localhost         → Nginx (SSL termination)
   │                                   │
   │                                   ├─→ /api/     → Django (8000)
   │                                   ├─→ /ws/      → Daphne WebSocket (8000)
   │                                   └─→ /         → Vite HMR Proxy (5173)
   │
   ├─→ http://localhost:5173     → Vite dev server (direct, for HMR)
   └─→ http://localhost:8000     → Django API (direct, for debugging)
```

## Why This Setup?

1. **Mirrors Production**: Nginx terminates TLS just like production
2. **No Browser Warnings**: mkcert creates locally-trusted certificates
3. **Service Mesh**: Single entry point for all services
4. **WebSocket Support**: Nginx proxies WSS connections properly
5. **Flexible**: Can still access services directly via HTTP

## Troubleshooting

### Certificate Not Trusted
```bash
# Reinstall CA
mkcert -install

# Check CA location
mkcert -CAROOT
```

### Nginx Won't Start
```bash
# Check certificate files exist
ls -la devops/certs/

# View nginx logs
docker logs nginx-dev
```

### Mixed Content Warnings
Update `frontend-react/.env`:
```bash
VITE_API_URL=https://localhost/api/v1
VITE_WS_URL=wss://localhost/ws
```

## Production Deployment

For production, use Let's Encrypt instead:

```bash
docker run -it --rm \
  -v ./devops/certs:/etc/letsencrypt \
  certbot/certbot certonly --standalone \
  -d yourdomain.com \
  -d www.yourdomain.com
```

Then update nginx to use Let's Encrypt certificates in production compose file.
