// Othello Matchmaking Lobby - Simple room-based matchmaking
import { router } from "/root/Router.js";

const othelloLobbyTemplate = document.createElement('template');

othelloLobbyTemplate.innerHTML = /*html*/ `
    <style>
        :host {
            display: block;
            width: 100%;
            height: 100%;
        }
        
        .lobby-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            padding: 2rem;
            gap: 2rem;
        }
        
        .lobby-card {
            background: linear-gradient(135deg, rgba(0, 20, 43, 0.9) 0%, rgba(0, 51, 71, 0.8) 100%);
            border: 2px solid var(--secondary-cyan);
            border-radius: var(--border-radius);
            padding: 3rem;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 8px 32px 0 rgba(0, 185, 190, 0.2);
            backdrop-filter: blur(10px);
        }
        
        .lobby-title {
            font-family: 'Sansation Bold';
            font-size: 2.5rem;
            color: var(--primary-cyan);
            text-align: center;
            margin-bottom: 2rem;
            text-shadow: 0 0 10px rgba(0, 255, 252, 0.5);
        }
        
        .lobby-options {
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
        }
        
        .option-btn {
            padding: 1.5rem;
            background: rgba(0, 185, 190, 0.2);
            border: 2px solid var(--secondary-cyan);
            border-radius: var(--border-radius);
            color: var(--text-white);
            font-family: 'Sansation Bold';
            font-size: 1.2rem;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 1rem;
        }
        
        .option-btn:hover {
            background: rgba(0, 255, 252, 0.3);
            border-color: var(--primary-cyan);
            box-shadow: 0 0 15px rgba(0, 255, 252, 0.4);
            transform: translateY(-2px);
        }
        
        .option-btn:active {
            transform: translateY(0);
        }
        
        .room-input-section {
            display: none;
            flex-direction: column;
            gap: 1rem;
        }
        
        .room-input-section.active {
            display: flex;
        }
        
        .input-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }
        
        .input-group label {
            color: var(--primary-cyan);
            font-family: 'Sansation';
            font-size: 1rem;
        }
        
        .input-group input {
            padding: 1rem;
            background: rgba(0, 20, 43, 0.6);
            border: 2px solid var(--secondary-cyan);
            border-radius: var(--border-radius);
            color: var(--text-white);
            font-family: 'Sansation';
            font-size: 1.1rem;
        }
        
        .input-group input:focus {
            outline: none;
            border-color: var(--primary-cyan);
            box-shadow: 0 0 10px rgba(0, 255, 252, 0.3);
        }
        
        .btn-group {
            display: flex;
            gap: 1rem;
        }
        
        .btn {
            flex: 1;
            padding: 1rem;
            border: 2px solid var(--secondary-cyan);
            border-radius: var(--border-radius);
            font-family: 'Sansation Bold';
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .btn-primary {
            background: var(--secondary-cyan);
            color: var(--dark-blue);
        }
        
        .btn-primary:hover {
            background: var(--primary-cyan);
            box-shadow: 0 0 15px rgba(0, 255, 252, 0.4);
        }
        
        .btn-secondary {
            background: transparent;
            color: var(--text-white);
        }
        
        .btn-secondary:hover {
            background: rgba(0, 185, 190, 0.2);
        }
        
        .room-code-display {
            text-align: center;
            padding: 1.5rem;
            background: rgba(0, 255, 252, 0.1);
            border: 2px solid var(--primary-cyan);
            border-radius: var(--border-radius);
            margin: 1rem 0;
        }
        
        .room-code-label {
            color: var(--text-white);
            font-size: 0.9rem;
            margin-bottom: 0.5rem;
        }
        
        .room-code {
            font-family: 'Courier New', monospace;
            font-size: 2rem;
            color: var(--primary-cyan);
            font-weight: bold;
            letter-spacing: 0.2rem;
        }
        
        .waiting-message {
            text-align: center;
            color: var(--text-white);
            font-size: 1.1rem;
            margin-top: 1rem;
        }
        
        .back-btn {
            margin-top: 1rem;
            padding: 0.8rem 1.5rem;
            background: transparent;
            border: 2px solid var(--secondary-cyan);
            border-radius: var(--border-radius);
            color: var(--text-white);
            font-family: 'Sansation';
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .back-btn:hover {
            background: rgba(0, 185, 190, 0.2);
        }
    </style>
    
    <div class="lobby-container">
        <div class="lobby-card">
            <h1 class="lobby-title">🎮 Othello Lobby</h1>
            
            <!-- Main Options -->
            <div class="lobby-options" id="main-options">
                <button class="option-btn" id="create-room-btn">
                    <span>🎯</span>
                    <span>Create Room</span>
                </button>
                <button class="option-btn" id="join-room-btn">
                    <span>🔗</span>
                    <span>Join Room</span>
                </button>
                <button class="option-btn" id="quick-match-btn">
                    <span>⚡</span>
                    <span>Quick Match</span>
                </button>
            </div>
            
            <!-- Create Room Section -->
            <div class="room-input-section" id="create-section">
                <div class="room-code-display">
                    <div class="room-code-label">Your Room Code:</div>
                    <div class="room-code" id="generated-code">XXXX</div>
                </div>
                <p class="waiting-message">Waiting for opponent to join...</p>
                <button class="back-btn" id="cancel-create-btn">Cancel</button>
            </div>
            
            <!-- Join Room Section -->
            <div class="room-input-section" id="join-section">
                <div class="input-group">
                    <label for="room-code-input">Enter Room Code:</label>
                    <input type="text" id="room-code-input" placeholder="XXXX" maxlength="4" />
                </div>
                <div class="btn-group">
                    <button class="btn btn-secondary" id="cancel-join-btn">Cancel</button>
                    <button class="btn btn-primary" id="join-btn">Join</button>
                </div>
            </div>
        </div>
    </div>
`;

export class OthelloLobby extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(othelloLobbyTemplate.content.cloneNode(true));
        
        this.currentSection = 'main';
        this.roomCode = null;
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Main options
        const createBtn = this.shadowRoot.getElementById('create-room-btn');
        const joinBtn = this.shadowRoot.getElementById('join-room-btn');
        const quickMatchBtn = this.shadowRoot.getElementById('quick-match-btn');
        
        createBtn.addEventListener('click', () => this.showCreateRoom());
        joinBtn.addEventListener('click', () => this.showJoinRoom());
        quickMatchBtn.addEventListener('click', () => this.startQuickMatch());
        
        // Create room section
        const cancelCreateBtn = this.shadowRoot.getElementById('cancel-create-btn');
        cancelCreateBtn.addEventListener('click', () => this.showMainOptions());
        
        // Join room section
        const cancelJoinBtn = this.shadowRoot.getElementById('cancel-join-btn');
        const joinRoomBtn = this.shadowRoot.getElementById('join-btn');
        const roomCodeInput = this.shadowRoot.getElementById('room-code-input');
        
        cancelJoinBtn.addEventListener('click', () => this.showMainOptions());
        joinRoomBtn.addEventListener('click', () => this.joinRoom());
        
        // Auto-uppercase room code input
        roomCodeInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
        
        // Enter key to join
        roomCodeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.joinRoom();
            }
        });
    }
    
    showMainOptions() {
        this.hideAllSections();
        this.shadowRoot.getElementById('main-options').style.display = 'flex';
        this.currentSection = 'main';
    }
    
    showCreateRoom() {
        this.hideAllSections();
        const createSection = this.shadowRoot.getElementById('create-section');
        createSection.classList.add('active');
        
        // Generate random room code
        this.roomCode = this.generateRoomCode();
        this.shadowRoot.getElementById('generated-code').textContent = this.roomCode;
        
        this.currentSection = 'create';
        
        // Navigate to online game with room code
        setTimeout(() => {
            router.navigate(`/game/othello/online?room=${this.roomCode}`);
        }, 1000);
    }
    
    showJoinRoom() {
        this.hideAllSections();
        const joinSection = this.shadowRoot.getElementById('join-section');
        joinSection.classList.add('active');
        
        this.currentSection = 'join';
        
        // Focus input
        setTimeout(() => {
            this.shadowRoot.getElementById('room-code-input').focus();
        }, 100);
    }
    
    joinRoom() {
        const input = this.shadowRoot.getElementById('room-code-input');
        const code = input.value.trim().toUpperCase();
        
        if (code.length !== 4) {
            alert('Please enter a valid 4-character room code');
            return;
        }
        
        // Navigate to online game with room code
        router.navigate(`/game/othello/online?room=${code}`);
    }
    
    startQuickMatch() {
        // Use a common room for quick matches
        const quickMatchRoom = 'QUICK';
        router.navigate(`/game/othello/online?room=${quickMatchRoom}`);
    }
    
    hideAllSections() {
        this.shadowRoot.getElementById('main-options').style.display = 'none';
        this.shadowRoot.getElementById('create-section').classList.remove('active');
        this.shadowRoot.getElementById('join-section').classList.remove('active');
    }
    
    generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 4; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
}

customElements.define('othello-lobby', OthelloLobby);
