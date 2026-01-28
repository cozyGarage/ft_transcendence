
# ft_transcendence

**ft_transcendence** is a project developed as part of the 42 coding school curriculum. This application delivers a fully functional multiplayer online Pong game built with modern web development practices and a secure, robust backend.

## Demo Video

[![Demo Video](./ScreenShots/Profile.png)](https://www.youtube.com/watch?v=bXRbh0gd8fU)

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
    - [Using Docker Compose](#using-docker-compose)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## About the Project

**ft_transcendence** reimagines the classic Pong game experience with a modern twist. This project focuses on delivering an engaging multiplayer experience while maintaining high standards in code quality, security, and user experience.

---

## Features

- 🎮 **Real-time Multiplayer:** Play competitive Pong and Othello matches with friends or other players.
- 🤖 **AI Opponents:** Practice against intelligent AI opponents.
- 🔒 **Secure Authentication:** Login system with support for Two-Factor Authentication (2FA) and OAuth.
- 💬 **Chat System:** Built-in real-time private messaging.
- 🏆 **Tournaments:** Create and join tournaments with bracket-style competition.
- 📊 **Leaderboards:** Track player performance and rankings with league system.
- 🖼 **User Profiles:** Customize profiles and view detailed game statistics.
- 🔔 **Real-time Notifications:** Stay updated with friend requests, game invites, and more.
- ⚙️ **Settings:** Personalize game and account settings.
- ⛓️ **Blockchain Integration:** Tournament scores stored on blockchain for transparency.

---

## Technologies Used

### Front-End
- **React 18** - Modern component-based UI library with hooks.
- **TypeScript** - Type-safe JavaScript for better developer experience.
- **Vite** - Next-generation frontend build tool with HMR.
- **React Router 7** - Client-side routing with protected routes.
- **Zustand** - Lightweight state management for React.
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development.
- **Axios** - Promise-based HTTP client with interceptors.
- **React Hook Form + Zod** - Form handling with schema validation.
- **Lucide React** - Beautiful, customizable icons.

### Back-End
- **Django 5.0 LTS** - Python framework for developing secure, scalable applications.
- **Django REST Framework** - Toolkit for building Web APIs.
- **Django Channels** - WebSocket support for real-time features.
- **PostgreSQL** - Database system for storing game data.
- **Redis** - In-memory data store for caching and WebSocket channel layers.

### DevOps & Infrastructure
- **Docker** - Containerized deployment with multi-stage builds.
- **Docker Compose** - Multi-container orchestration.
- **Nginx** - Reverse proxy and static file serving.
- **Prometheus** - Metrics collection and monitoring.
- **Grafana** - Metrics visualization and dashboards.
- **Alertmanager** - Alert handling and notifications.

### Blockchain
- **Hardhat** - Ethereum development environment.
- **Solidity** - Smart contract language for tournament scores.

---

## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

Ensure you have the following installed:
- [Node.js 18+](https://nodejs.org/) (for frontend development)
- [Python 3.11+](https://www.python.org/)
- [Docker](https://www.docker.com/)
- [Git](https://git-scm.com/)

---

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/ft_transcendence.git
   ```

2. Navigate to the project directory:
   ```bash
   cd ft_transcendence
   ```

3. Install frontend dependencies (for development):
   ```bash
   cd frontend-react
   npm install
   ```

---

### Running the Application

#### Using Docker Compose (Production)

To start the project, simply run the following command:

```bash
docker compose up --build
```

This command will build the Docker containers and start the application. The backend and frontend will be automatically set up and available for access.

The application will be accessible at `https://localhost`.

#### Development Mode

For frontend development with hot-reload:

```bash
cd frontend-react
npm run dev
```

For backend development:

```bash
cd backend
python manage.py runserver
```

---

## Project Structure

```
ft_transcendence/
├── backend/                 # Django backend
│   ├── accounts/           # User authentication & profiles
│   ├── chat/               # Real-time chat system
│   ├── friend/             # Friend management
│   ├── game/               # Game logic & WebSocket consumers
│   ├── notification/       # Notification system
│   ├── Player/             # Player profiles & stats
│   └── tournament/         # Tournament management
├── frontend-react/          # React + TypeScript frontend
│   ├── src/
│   │   ├── api/           # API client & endpoints
│   │   ├── components/    # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── layouts/       # Page layouts
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand state stores
│   │   └── types/         # TypeScript type definitions
│   ├── package.json
│   └── vite.config.ts
├── blockchain/              # Smart contracts
├── devops/                  # Docker & monitoring configs
└── docker-compose.yml
```


---

## Usage

1. **Sign Up:** Create an account or log in with existing credentials.
2. **Play a Match:** Challenge players in real-time Pong games.
3. **Socialize:** Chat with friends or other players using the messaging system.
4. **Track Progress:** View stats and rankings on the leaderboard.

---

## Screenshots

![Login](./ScreenShots/Login.jpeg)
![Home](./ScreenShots/Home.png)
![Profile](./ScreenShots/Profile.png)
![Profile2](./ScreenShots/Profile2.jpeg)
![Game](./ScreenShots/Game.jpeg)
![Chat](./ScreenShots/Chat.jpeg)
![Tournament](./ScreenShots/Tournament.jpeg)
![Monitoring](./ScreenShots/Monitoring.jpeg)

---

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes and push to your branch.
4. Submit a pull request.

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

## Contact

**ft_transcendence Team**  
For any inquiries or feedback, feel free to open an issue in the repository.

---

We hope you enjoy the application and look forward to your contributions or feedback to make **ft_transcendence** even better! 🚀
