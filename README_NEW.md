# 🎮 ft_transcendence - Modern Web Gaming Platform

A full-stack web application featuring real-time multiplayer games (Pong, Othello), tournaments, chat, and blockchain score verification.

## 🏗️ Tech Stack

### Frontend
- **React 18.3** + **TypeScript 5.6** - Modern UI framework with type safety
- **Vite 6.0** - Lightning-fast build tool with HMR
- **Tailwind CSS 3.4** - Utility-first styling with custom cyber theme
- **Zustand 5.0** - Lightweight state management
- **React Router 7** - Client-side routing
- **Axios** - HTTP client with interceptors
- **Vitest + Playwright** - Unit and E2E testing

### Backend
- **Django 5.0 LTS** - Python web framework
- **Django Channels 4.2** - WebSocket support for real-time features
- **PostgreSQL** - Relational database
- **Redis 7** - Channel layer and caching
- **Daphne** - ASGI server
- **JWT Authentication** - Secure token-based auth with 2FA support

### Blockchain
- **Solidity 0.8.24** - Smart contract language
- **Hardhat** - Development environment
- **Web3.py 7.7** - Python Ethereum library
- **Sepolia Testnet** - Ethereum test network

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy and static file serving
- **Prometheus + Grafana** - Monitoring and metrics
- **Let's Encrypt** - SSL/TLS certificates (production)

## 📚 Documentation

- **[QUICK_START.md](QUICK_START.md)** - Get started in 5 minutes
- **[DEVOPS_EXPLAINED.md](DEVOPS_EXPLAINED.md)** - Understanding the /devops directory
- **[ARCHITECTURE_DIAGRAMS.md](ARCHITECTURE_DIAGRAMS.md)** - Visual architecture guide
- **[SECURITY_IMPLEMENTATION.md](SECURITY_IMPLEMENTATION.md)** - Security features and audit
- **[MIGRATION_STATUS.md](MIGRATION_STATUS.md)** - React migration progress

## 🚀 Quick Start

### Development Environment

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd ft_transcendence

# 2. Setup environment
cp .env.example .env
# Edit .env with your settings

# 3. Start development services
docker-compose -f docker-compose.dev.yml up

# 4. Access the application
# Frontend: http://localhost:5173 (Vite dev server with HMR)
# Backend: http://localhost:8000 (Django API)
# Redis Commander: http://localhost:8081
```

See [QUICK_START.md](QUICK_START.md) for detailed instructions.

### Production Deployment

```bash
# 1. Build frontend
cd frontend-react
pnpm build

# 2. Start production services
cd ..
docker-compose up -d

# 3. Access via HTTPS
# https://yourdomain.com
```

## 🎯 Features

### 🎮 Games
- **Pong** - Classic paddle game with real-time WebSocket multiplayer
- **Othello** - Strategic board game with AI opponent
- **Tournament System** - Create and manage competitive tournaments
- **Matchmaking** - Automatic player matching for games

### 👥 Social
- **User Profiles** - Customizable avatars and stats
- **Friends System** - Add friends, block users
- **Real-time Chat** - Private and room-based messaging
- **Notifications** - Live updates for game invites, friend requests

### 🔒 Security
- **JWT Authentication** - Secure token-based auth
- **2FA Support** - TOTP-based two-factor authentication
- **OAuth Integration** - Login with 42 Intra and Google
- **WebSocket Auth** - JWT-authenticated WebSocket connections
- **Rate Limiting** - Protection against brute force attacks
- **CORS Protection** - Strict origin validation
- **Security Headers** - CSP, HSTS, X-Frame-Options, etc.
- **Input Sanitization** - XSS and injection prevention

### ⛓️ Blockchain
- **Score Verification** - Tournament scores stored on Ethereum
- **Smart Contract** - Access-controlled score storage
- **Transparency** - Immutable game history
- **Sepolia Testnet** - Testing without real ETH

## 📁 Project Structure

```
ft_transcendence/
├── backend/                 # Django application
│   ├── accounts/           # User authentication and profiles
│   ├── game/              # Game logic and WebSocket consumers
│   ├── chat/              # Real-time chat system
│   ├── tournament/        # Tournament management
│   ├── Player/            # Player statistics and achievements
│   ├── notification/      # Real-time notifications
│   └── friend/            # Friend and block system
│
├── frontend-react/         # React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── layouts/       # Layout components
│   │   ├── store/         # Zustand state management
│   │   ├── api/           # API client and endpoints
│   │   └── utils/         # Helper functions
│   ├── test/              # Unit tests
│   └── e2e/               # Playwright E2E tests
│
├── blockchain/             # Smart contracts
│   ├── contracts/         # Solidity contracts
│   ├── scripts/           # Deployment scripts
│   └── test/              # Contract tests
│
├── devops/                # Infrastructure configuration
│   ├── Dockerfile         # Container build instructions
│   ├── requirements.txt   # Python dependencies
│   ├── nginx/            # Web server config
│   ├── prometheus/       # Monitoring config
│   └── grafana/          # Dashboard config
│
└── docker-compose*.yml    # Container orchestration
```

## 🔧 Development Workflow

### Frontend Development
```bash
# Make changes to frontend-react/src/
# Vite automatically reloads browser (<100ms)

# Run tests
docker-compose -f docker-compose.dev.yml exec front-end-dev pnpm test

# Lint code
docker-compose -f docker-compose.dev.yml exec front-end-dev pnpm lint
```

### Backend Development
```bash
# Make changes to backend/
# Django automatically reloads (~1s)

# Create migrations
docker-compose -f docker-compose.dev.yml exec back-end-dev python manage.py makemigrations

# Apply migrations
docker-compose -f docker-compose.dev.yml exec back-end-dev python manage.py migrate

# Run tests
docker-compose -f docker-compose.dev.yml exec back-end-dev python manage.py test
```

### Smart Contract Development
```bash
cd blockchain

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to Sepolia
npx hardhat run scripts/deploy.cjs --network sepolia
```

## 🧪 Testing

```bash
# Frontend unit tests
docker-compose -f docker-compose.dev.yml exec front-end-dev pnpm test

# Frontend E2E tests
docker-compose -f docker-compose.dev.yml exec front-end-dev pnpm test:e2e

# Backend tests
docker-compose -f docker-compose.dev.yml exec back-end-dev python manage.py test

# Smart contract tests
cd blockchain && npx hardhat test
```

## 📊 Monitoring

Access monitoring dashboards in production:

- **Grafana**: http://localhost:3000
  - Default credentials: admin/admin
  - Dashboards for Nginx, PostgreSQL, Django

- **Prometheus**: http://localhost:9090
  - Metrics collection and alerting

- **Redis Commander**: http://localhost:8081 (dev only)
  - Browse Redis keys and values

## 🔐 Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Critical settings
DEBUG=False
SECRET_KEY=<generate-random-key>
ALLOWED_HOSTS=localhost,yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com

# Database
POSTGRES_DB=ft_transcendence
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<strong-password>

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Blockchain
SEPOLIA_URL=https://sepolia.infura.io/v3/<your-project-id>
CONTRACT_ADDRESS=<deployed-contract-address>
PRIVATE_KEY=<wallet-private-key>
```

See `.env.example` for all available options.

## 🛡️ Security Features

- ✅ **CORS Protection** - Whitelist-based origin validation
- ✅ **Rate Limiting** - Login (5/min), Registration (3/hr), 2FA (5/min)
- ✅ **WebSocket Auth** - JWT-based WebSocket authentication
- ✅ **2FA Security** - Signed temporary tokens (5-min expiry)
- ✅ **Input Sanitization** - XSS prevention in chat
- ✅ **Security Headers** - CSP, HSTS, X-Frame-Options, etc.
- ✅ **Smart Contract Access Control** - Owner-only score storage
- ✅ **Redis Channel Layer** - Scalable WebSocket routing

See [SECURITY_IMPLEMENTATION.md](SECURITY_IMPLEMENTATION.md) for details.

## 🤝 Contributing

1. Read [DEVOPS_EXPLAINED.md](DEVOPS_EXPLAINED.md) to understand the architecture
2. Follow the development workflow in [QUICK_START.md](QUICK_START.md)
3. Ensure tests pass before committing
4. Follow the existing code style
5. Update documentation for new features

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- 42 School for the project guidelines
- The Django, React, and Web3 communities
- All contributors and testers

## 📞 Support

- **Documentation**: Check the docs/ directory
- **Issues**: GitHub Issues
- **Security**: See [SECURITY_IMPLEMENTATION.md](SECURITY_IMPLEMENTATION.md)

---

**Built with ❤️ using modern web technologies**

Last Updated: January 2026
