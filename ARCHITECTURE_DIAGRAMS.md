# Architecture Diagrams

## Development Environment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Your Computer                            │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Docker Desktop                              │  │
│  │                                                          │  │
│  │  ┌────────────────┐  ┌────────────────┐                │  │
│  │  │  front-end-dev │  │  back-end-dev  │                │  │
│  │  │                │  │                │                │  │
│  │  │ Node 20 Alpine │  │ Python 3.12    │                │  │
│  │  │                │  │                │                │  │
│  │  │ Vite Dev :5173 │  │ Daphne :8000   │                │  │
│  │  │ Hot Reload ✅  │  │ Auto-reload ✅ │                │  │
│  │  │                │  │                │                │  │
│  │  │ Volume Mount:  │  │ Volume Mount:  │                │  │
│  │  │ ./frontend-    │  │ ./backend/     │                │  │
│  │  │    react/      │  │                │                │  │
│  │  └────────┬───────┘  └────────┬───────┘                │  │
│  │           │                   │                         │  │
│  │           │        ┌──────────┴──────────┐             │  │
│  │           │        │                     │             │  │
│  │           │   ┌────▼─────┐        ┌─────▼────┐        │  │
│  │           │   │PostgreSQL│        │  Redis   │        │  │
│  │           │   │   :5432  │        │  :6379   │        │  │
│  │           │   │          │        │          │        │  │
│  │           │   │  Volume: │        │ Volume:  │        │  │
│  │           │   │ postgres │        │  redis_  │        │  │
│  │           │   │  _data   │        │   data   │        │  │
│  │           │   └──────────┘        └──────────┘        │  │
│  │           │                                            │  │
│  │           │   ┌──────────────────┐                    │  │
│  │           └───► Redis Commander  │                    │  │
│  │               │     :8081        │                    │  │
│  │               └──────────────────┘                    │  │
│  │                                                        │  │
│  │  Network: app_network (bridge)                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  Exposed Ports to Host:                                    │
│  - 5173  → Vite Dev Server (Frontend)                     │
│  - 8000  → Django API (Backend)                           │
│  - 5432  → PostgreSQL (DB Client Access)                  │
│  - 6379  → Redis (Redis Client Access)                    │
│  - 8081  → Redis Commander (Web GUI)                      │
└─────────────────────────────────────────────────────────────┘

Your IDE (VS Code)
  │
  ├─ Edit: frontend-react/src/App.tsx
  │    └─→ Saved → Vite detects → HMR → Browser refreshes (< 100ms)
  │
  └─ Edit: backend/accounts/views.py
       └─→ Saved → Django detects → Reloads → API updates (~1s)
```

## Production Environment Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                          Docker Host                              │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    Docker Engine                           │  │
│  │                                                            │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │            Nginx Container (front-end)              │  │  │
│  │  │                   :443 (HTTPS)                      │  │  │
│  │  │  ┌──────────────────────────────────────────────┐  │  │  │
│  │  │  │  SSL Termination (Let's Encrypt)              │  │  │  │
│  │  │  │  - server.cert                                │  │  │  │
│  │  │  │  - server.key                                 │  │  │  │
│  │  │  └───────────────┬──────────────────────────────┘  │  │  │
│  │  │                  │                                  │  │  │
│  │  │  ┌───────────────▼──────────────────────────────┐  │  │  │
│  │  │  │  Static Files (React build)                  │  │  │  │
│  │  │  │  - /usr/share/nginx/html/                    │  │  │  │
│  │  │  │  - index.html, *.js, *.css                   │  │  │  │
│  │  │  │  - Gzip compressed                           │  │  │  │
│  │  │  │  - Brotli compressed                         │  │  │  │
│  │  │  └───────────────┬──────────────────────────────┘  │  │  │
│  │  │                  │                                  │  │  │
│  │  │  ┌───────────────▼──────────────────────────────┐  │  │  │
│  │  │  │  Reverse Proxy                               │  │  │  │
│  │  │  │  /api/* → http://back-end:8000               │  │  │  │
│  │  │  │  /ws/*  → ws://back-end:8000                 │  │  │  │
│  │  │  └───────────────┬──────────────────────────────┘  │  │  │
│  │  │                  │                                  │  │  │
│  │  │  ┌───────────────▼──────────────────────────────┐  │  │  │
│  │  │  │  Security Headers                            │  │  │  │
│  │  │  │  - CSP, HSTS, X-Frame-Options                │  │  │  │
│  │  │  └──────────────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │                              │                             │  │
│  │                              ▼                             │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │         Django/Daphne Container (back-end)          │  │  │
│  │  │                Internal :8000                       │  │  │
│  │  │  ┌──────────────────────────────────────────────┐  │  │  │
│  │  │  │  ASGI Application                            │  │  │  │
│  │  │  │  - REST API endpoints                        │  │  │  │
│  │  │  │  - WebSocket handlers                        │  │  │  │
│  │  │  │  - JWT Authentication                        │  │  │  │
│  │  │  │  - Business Logic                            │  │  │  │
│  │  │  └───────────────┬─────────────────┬────────────┘  │  │  │
│  │  └──────────────────┼─────────────────┼───────────────┘  │  │
│  │                     │                 │                   │  │
│  │          ┌──────────▼────────┐    ┌──▼────────────────┐  │  │
│  │          │   PostgreSQL      │    │      Redis        │  │  │
│  │          │   Container       │    │   Container       │  │  │
│  │          │                   │    │                   │  │  │
│  │          │  Internal :5432   │    │  Internal :6379   │  │  │
│  │          │                   │    │                   │  │  │
│  │          │  ┌─────────────┐ │    │  ┌─────────────┐  │  │  │
│  │          │  │Persistent   │ │    │  │Channel Layer│  │  │  │
│  │          │  │Data         │ │    │  │Messages     │  │  │  │
│  │          │  │- User Data  │ │    │  │- WebSocket  │  │  │  │
│  │          │  │- Game Data  │ │    │  │  Routing    │  │  │  │
│  │          │  │- Tournament │ │    │  │- Cache      │  │  │  │
│  │          │  └─────────────┘ │    │  └─────────────┘  │  │  │
│  │          │                   │    │                   │  │  │
│  │          │  Volume:          │    │  Volume:          │  │  │
│  │          │  postgres_data    │    │  redis_data       │  │  │
│  │          └───────────────────┘    └───────────────────┘  │  │
│  │                                                            │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │              Monitoring Stack                       │  │  │
│  │  │                                                     │  │  │
│  │  │  ┌──────────────┐  ┌──────────────┐               │  │  │
│  │  │  │ Prometheus   │  │   Grafana    │               │  │  │
│  │  │  │  :9090       │  │    :3000     │               │  │  │
│  │  │  │              │  │              │               │  │  │
│  │  │  │ Metrics      │◄─┤ Dashboards  │               │  │  │
│  │  │  │ Collection   │  │ Visualize   │               │  │  │
│  │  │  └──────────────┘  └──────────────┘               │  │  │
│  │  │                                                     │  │  │
│  │  │  ┌──────────────┐  ┌──────────────┐               │  │  │
│  │  │  │ Alertmanager │  │  Exporters   │               │  │  │
│  │  │  │              │  │  - Nginx     │               │  │  │
│  │  │  │ Alert        │  │  - Postgres  │               │  │  │
│  │  │  │ Routing      │  │  - Backend   │               │  │  │
│  │  │  └──────────────┘  └──────────────┘               │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │                                                            │  │
│  │  Network: app_network (bridge)                            │  │
│  │  - All containers communicate via internal network       │  │
│  │  - Only Nginx exposes port 443 to outside                │  │
│  └────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────────┘
                              ▲
                              │
                         Internet
                      (HTTPS only)
```

## DevOps Directory Structure

```
devops/
│
├── Dockerfile                    # Container build instructions
│   ├─ Base: python:3.12-slim
│   ├─ Install: requirements.txt
│   ├─ Setup: SSL certs
│   └─ Entrypoint: start.sh
│
├── requirements.txt              # Python dependencies (pinned versions)
│   ├─ Django==5.0.11
│   ├─ channels-redis==4.2.1
│   ├─ web3==7.7.0
│   └─ ... (all backend dependencies)
│
├── start.sh                      # Container startup script
│   ├─ Run migrations
│   ├─ Collect static files
│   └─ Start Daphne
│
├── nginx/                        # Web server configuration
│   └── nginx.conf
│       ├─ SSL/TLS setup
│       ├─ Static file serving
│       ├─ Reverse proxy rules
│       ├─ Security headers
│       └─ Compression (gzip/brotli)
│
├── certs/                        # SSL certificates
│   ├── server.cert              # Public certificate
│   └── server.key               # Private key (gitignored)
│
├── prometheus/                   # Metrics collection
│   ├── prometheus.yml           # Scrape configs
│   └── rules.yml                # Alert rules
│
├── grafana/                      # Monitoring dashboards
│   └── grafana.ini              # Grafana config
│
└── alertmanager/                 # Alert routing
    └── alertmanager.yml         # Notification configs

Why this structure?
├─ Centralized infrastructure configuration
├─ Separated from application code
├─ Version controlled deployment configs
├─ Reproducible across environments
└─ Single source of truth for operations
```

## Request Flow Diagrams

### HTTP Request Flow (Development)

```
Browser (localhost:5173)
    │
    │ (1) Request: http://localhost:5173/
    │
    ▼
Vite Dev Server (front-end-dev container)
    │
    │ (2) Serve: React app (uncompiled)
    │     HMR enabled, source maps included
    │
    ▼
Browser renders React
    │
    │ (3) API call: fetch('http://localhost:8000/api/v1/users/')
    │
    ▼
Django/Daphne (back-end-dev container)
    │
    │ (4) Process request
    │     - JWT authentication
    │     - Rate limiting
    │     - Business logic
    │
    ├─→ PostgreSQL (query user data)
    │   └─→ Return results
    │
    └─→ Redis (cache check)
        └─→ Return cached data
    │
    │ (5) Response: JSON data
    │
    ▼
Browser updates React state
```

### HTTP Request Flow (Production)

```
Browser (https://yourdomain.com)
    │
    │ (1) Request: https://yourdomain.com/
    │     TLS handshake
    │
    ▼
Nginx (front-end container :443)
    │
    │ (2) SSL termination
    │     Apply security headers
    │     Check if static file
    │
    ├─→ Static file? → Serve from /usr/share/nginx/html/
    │   │               (pre-built, compressed React)
    │   │
    │   └─→ Return with gzip/brotli
    │
    └─→ API request (/api/*)
        │
        │ (3) Reverse proxy to: http://back-end:8000
        │
        ▼
Django/Daphne (back-end container)
    │
    │ (4) Process request
    │     - JWT authentication
    │     - Rate limiting
    │     - Business logic
    │
    ├─→ PostgreSQL (query data)
    │   └─→ Return results
    │
    └─→ Redis (cache/channel layer)
        └─→ Return data
    │
    │ (5) Response: JSON data
    │
    ▼
Nginx
    │
    │ (6) Add security headers
    │
    ▼
Browser (receives response)
```

### WebSocket Connection Flow

```
Browser
    │
    │ (1) Connect: ws://localhost:8000/ws/game/room1/?token=<JWT>
    │
    ▼
Nginx (Production) or Direct (Development)
    │
    │ (2) Upgrade to WebSocket
    │
    ▼
Daphne/Channels (back-end)
    │
    │ (3) JWT Authentication Middleware
    │     - Extract token from query string
    │     - Validate JWT
    │     - Attach user to scope
    │
    ├─→ Invalid token? → Close connection (4001)
    │
    └─→ Valid token
        │
        │ (4) Consumer.connect()
        │     - Check user permissions
        │     - Join channel group
        │
        ▼
    Redis Channel Layer
        │
        │ (5) Subscribe to: game_room1
        │
        ▼
    WebSocket established
        │
        │ (6) Real-time bidirectional communication
        │
        ├─→ Client sends message
        │   └─→ Consumer.receive()
        │       └─→ Broadcast via channel layer
        │           └─→ All clients in room receive
        │
        └─→ Server sends message
            └─→ channel_layer.group_send()
                └─→ Client receives via Consumer.send()
```

## File Mount Strategy (Development)

```
Host Machine                    Docker Container
─────────────                  ─────────────────

frontend-react/                /app/
├── src/                  →    ├── src/           (MOUNTED)
│   ├── App.tsx                │   ├── App.tsx    ✏️ Edit here
│   └── ...                    │   └── ...        🔄 Auto-reload
├── public/               →    ├── public/        (MOUNTED)
├── package.json          →    ├── package.json   (MOUNTED)
├── vite.config.ts        →    ├── vite.config.ts (MOUNTED)
└── node_modules/              └── node_modules/  (VOLUME ✅)
    (NOT mounted)                  (Container-native)

Why?
- Source code: Mounted from host (edit with IDE)
- Dependencies: Named volume (Linux-compatible binaries)
- Result: Fast, compatible, hot-reload works!

backend/                       /app/
├── accounts/             →    ├── accounts/      (MOUNTED)
│   ├── views.py               │   ├── views.py   ✏️ Edit here
│   └── ...                    │   └── ...        🔄 Auto-reload
├── backend/              →    ├── backend/       (MOUNTED)
├── manage.py             →    ├── manage.py      (MOUNTED)
└── (no venv mounted)          └── /usr/local/    (System Python)

Why?
- All code mounted from host
- Python packages in container's system Python
- Django auto-reload detects changes
```

## Summary: The DevOps Philosophy

```
┌────────────────────────────────────────────────────────────┐
│                    Separation of Concerns                  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Application Code (backend/, frontend-react/)             │
│  ├─ What the app does                                     │
│  ├─ Business logic                                        │
│  ├─ User features                                         │
│  └─ Developers work here daily                           │
│                                                            │
│  Infrastructure Code (devops/)                            │
│  ├─ How the app runs                                      │
│  ├─ Where it runs                                         │
│  ├─ Deployment configs                                    │
│  └─ DevOps engineers maintain                            │
│                                                            │
│  Configuration (.env)                                     │
│  ├─ Environment-specific settings                         │
│  ├─ Secrets and API keys                                 │
│  └─ Changes per environment                              │
│                                                            │
└────────────────────────────────────────────────────────────┘

Benefits:
✅ Clear responsibilities
✅ Easy to maintain
✅ Scales from 1 to 1000 developers
✅ Industry standard (Netflix, Google, Amazon)
✅ Version controlled deployments
✅ Reproducible environments
```
