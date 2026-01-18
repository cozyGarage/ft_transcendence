// Online Othello Game Component with WebSocket Integration
import { OthelloWebSocketManager } from '/Utils/OthelloWebSocketManager.js';

const othelloOnlineTemplate = document.createElement('template');

othelloOnlineTemplate.innerHTML = /*html*/ `
    <link rel="stylesheet" href="/Components/Game/GamePlay/Othello/styles/OthelloGame.css">
    <link rel="stylesheet" href="/Utils/utils.css">
    
    <div class="othello-container">
        <div class="connection-status" id="connection-status">
            <p>Connecting to game...</p>
        </div>
        
        <div class="game-header">
            <div class="player-info black-player">
                <div class="player-avatar"></div>
                <div class="player-details">
                    <h3 id="black-player-name">Player 1</h3>
                    <div class="score black-score">2</div>
                </div>
            </div>
            <div class="vs-indicator">VS</div>
            <div class="player-info white-player">
                <div class="player-avatar"></div>
                <div class="player-details">
                    <h3 id="white-player-name">Player 2</h3>
                    <div class="score white-score">2</div>
                </div>
            </div>
        </div>
        
        <div class="game-board-container">
            <div class="othello-board" id="othello-board">
                <!-- 8x8 grid will be generated here -->
            </div>
        </div>
        
        <div class="game-controls">
            <button class="control-btn" id="exit-btn">✕ Exit</button>
        </div>
        
        <div class="game-status">
            <p id="status-text">Waiting for game to start...</p>
        </div>
    </div>
`;

export class OthelloOnlineGame extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(othelloOnlineTemplate.content.cloneNode(true));
        
        // Game state
        this.board = null;
        this.currentPlayer = 'B';
        this.myColor = null;
        this.roomName = null;
        this.wsManager = null;
        this.gameStarted = false;
        
        this.setupEventListeners();
    }
    
    connectedCallback() {
        // Get room name from URL or generate one
        const urlParams = new URLSearchParams(window.location.search);
        this.roomName = urlParams.get('room') || `game_${Date.now()}`;
        
        // Initialize WebSocket connection
        this.wsManager = new OthelloWebSocketManager(
            this.roomName,
            (event) => this.handleGameUpdate(event)
        );
        this.wsManager.connect();
        
        this.createBoard();
    }
    
    disconnectedCallback() {
        if (this.wsManager) {
            this.wsManager.disconnect();
        }
    }
    
    createBoard() {
        const boardEl = this.shadowRoot.getElementById('othello-board');
        boardEl.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.dataset.row = row;
                tile.dataset.col = col;
                
                const disc = document.createElement('div');
                disc.className = 'disc';
                tile.appendChild(disc);
                
                tile.addEventListener('click', () => this.handleTileClick(row, col));
                boardEl.appendChild(tile);
            }
        }
    }
    
    handleTileClick(row, col) {
        if (!this.gameStarted) return;
        if (this.currentPlayer !== this.myColor) return;
        
        // Send move to server via WebSocket
        this.wsManager.makeMove(row, col);
    }
    
    handleGameUpdate(event) {
        switch (event.type) {
            case 'player_assigned':
                this.myColor = event.color;
                this.updateConnectionStatus(`You are ${event.color === 'B' ? 'Black' : 'White'}`);
                break;
                
            case 'game_start':
                this.gameStarted = true;
                this.board = event.board;
                this.currentPlayer = event.currentPlayer;
                this.updateConnectionStatus('Game started!');
                setTimeout(() => {
                    this.shadowRoot.getElementById('connection-status').style.display = 'none';
                }, 2000);
                this.updateUI();
                break;
                
            case 'move_made':
                this.board = event.board;
                this.currentPlayer = event.currentPlayer;
                this.updateUI();
                break;
                
            case 'game_over':
                this.board = event.board;
                this.handleGameOver(event.winner, event.score);
                break;
                
            case 'player_disconnected':
                this.updateStatus('Opponent disconnected. You win!');
                this.gameStarted = false;
                break;
                
            case 'error':
                console.error('Game error:', event.message);
                break;
        }
    }
    
    updateConnectionStatus(message) {
        const statusEl = this.shadowRoot.getElementById('connection-status');
        statusEl.querySelector('p').textContent = message;
    }
    
    updateUI() {
        if (!this.board) return;
        
        // Update board
        const tiles = this.shadowRoot.querySelectorAll('.tile');
        
        this.board.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const index = rowIndex * 8 + colIndex;
                const tile = tiles[index];
                const disc = tile.querySelector('.disc');
                
                // Remove all classes
                disc.className = 'disc';
                tile.classList.remove('valid-move');
                
                // Add appropriate class
                if (cell === 'B') {
                    disc.classList.add('black');
                } else if (cell === 'W') {
                    disc.classList.add('white');
                }
            });
        });
        
        // Update scores
        const score = this.getScore(this.board);
        this.shadowRoot.querySelector('.black-score').textContent = score.B;
        this.shadowRoot.querySelector('.white-score').textContent = score.W;
        
        // Update status
        this.updateStatus();
    }
    
    updateStatus() {
        const statusText = this.shadowRoot.getElementById('status-text');
        const isMyTurn = this.currentPlayer === this.myColor;
        const color = this.currentPlayer === 'B' ? 'Black' : 'White';
        
        if (isMyTurn) {
            statusText.textContent = `Your turn - Place a ${color.toLowerCase()} disc`;
        } else {
            statusText.textContent = `Opponent's turn - ${color} to move`;
        }
    }
    
    getScore(board) {
        let blackCount = 0;
        let whiteCount = 0;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (board[row][col] === 'B') blackCount++;
                if (board[row][col] === 'W') whiteCount++;
            }
        }
        return { B: blackCount, W: whiteCount };
    }
    
    handleGameOver(winner, score) {
        const statusText = this.shadowRoot.getElementById('status-text');
        
        if (winner === null) {
            statusText.textContent = `Game Over - It's a tie! (${score.B} - ${score.W})`;
        } else {
            const didIWin = winner === this.myColor;
            const winnerName = didIWin ? 'You win' : 'You lose';
            statusText.textContent = `Game Over - ${winnerName}! (${score.B} - ${score.W})`;
        }
        
        this.gameStarted = false;
        
        // TODO: Save game result to backend
        this.saveGameResult(winner, score);
    }
    
    async saveGameResult(winner, score) {
        try {
            const result = winner === this.myColor ? 'win' : (winner === null ? 'draw' : 'lose');
            const myScore = this.myColor === 'B' ? score.B : score.W;
            const opponentScore = this.myColor === 'B' ? score.W : score.B;
            
            const response = await fetch('/api/game/othello/history/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: JSON.stringify({
                    player_score: myScore,
                    opponent_score: opponentScore,
                    result: result,
                    game_mode: 'online',
                    move_count: 0, // TODO: Track actual move count
                    game_duration: null
                })
            });
            
            if (response.ok) {
                console.log('Game result saved successfully');
            }
        } catch (error) {
            console.error('Failed to save game result:', error);
        }
    }
    
    setupEventListeners() {
        const exitBtn = this.shadowRoot.getElementById('exit-btn');
        
        exitBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to exit?')) {
                if (this.wsManager) {
                    this.wsManager.disconnect();
                }
                window.history.back();
            }
        });
    }
}

customElements.define('othello-online-game', OthelloOnlineGame);
