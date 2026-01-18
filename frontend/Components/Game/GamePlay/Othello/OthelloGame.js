// Othello Game Component - Pure JavaScript Version
import { 
    createInitialBoard, 
    getValidMoves, 
    makeMove, 
    getScore, 
    isGameOver, 
    getWinner, 
    getAIMove 
} from './engine/SimpleEngine.js';

const othelloGameTemplate = document.createElement('template');

othelloGameTemplate.innerHTML = /*html*/ `
    <link rel="stylesheet" href="/Components/Game/GamePlay/Othello/styles/OthelloGame.css">
    <link rel="stylesheet" href="/Utils/utils.css">
    
    <div class="othello-container">
        <div class="game-header">
            <div class="player-info black-player">
                <div class="player-avatar"></div>
                <div class="player-details">
                    <h3>You</h3>
                    <div class="score black-score">2</div>
                </div>
            </div>
            <div class="vs-indicator">VS</div>
            <div class="player-info white-player">
                <div class="player-avatar"></div>
                <div class="player-details">
                    <h3>AI</h3>
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
            <button class="control-btn" id="undo-btn">↶ Undo</button>
            <button class="control-btn" id="restart-btn">⟳ Restart</button>
            <button class="control-btn" id="exit-btn">✕ Exit</button>
        </div>
        
        <div class="game-status">
            <p id="status-text">Your turn - Place a black disc</p>
        </div>
    </div>
`;

export class OthelloGame extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(othelloGameTemplate.content.cloneNode(true));
        
        // Game state
        this.board = null;
        this.currentPlayer = 'B';
        this.playerColor = 'B'; // Player is black
        this.aiColor = 'W'; // AI is white
        this.aiDifficulty = 'medium'; // easy, medium, hard
        this.isAIThinking = false;
        this.moveHistory = [];
        
        this.initGame();
        this.setupEventListeners();
    }
    
    initGame() {
        this.board = createInitialBoard();
        this.currentPlayer = 'B';
        this.moveHistory = [];
        this.isAIThinking = false;
        
        this.createBoard();
        this.updateUI();
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
        if (this.isAIThinking) return;
        if (isGameOver(this.board)) return;
        if (this.currentPlayer !== this.playerColor) return;
        
        const validMoves = getValidMoves(this.board, this.currentPlayer);
        const isValid = validMoves.some(([r, c]) => r === row && c === col);
        
        if (!isValid) return;
        
        // Save state for undo
        this.moveHistory.push(this.board.map(row => [...row]));
        
        // Make move
        makeMove(this.board, row, col, this.currentPlayer);
        this.switchPlayer();
        this.updateUI();
        
        // Check if AI can move
        if (!isGameOver(this.board) && this.currentPlayer === this.aiColor) {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'B' ? 'W' : 'B';
        
        // Auto-pass if no valid moves
        const validMoves = getValidMoves(this.board, this.currentPlayer);
        if (validMoves.length === 0 && !isGameOver(this.board)) {
            this.currentPlayer = this.currentPlayer === 'B' ? 'W' : 'B';
        }
    }
    
    makeAIMove() {
        this.isAIThinking = true;
        const statusText = this.shadowRoot.getElementById('status-text');
        statusText.textContent = 'AI is thinking...';
        
        setTimeout(() => {
            const aiMove = getAIMove(this.board, this.aiColor, this.aiDifficulty);
            
            if (aiMove) {
                this.moveHistory.push(this.board.map(row => [...row]));
                makeMove(this.board, aiMove[0], aiMove[1], this.aiColor);
                this.switchPlayer();
                this.updateUI();
            }
            
            this.isAIThinking = false;
        }, 300);
    }
    
    updateUI() {
        // Update board
        const tiles = this.shadowRoot.querySelectorAll('.tile');
        const validMoves = getValidMoves(this.board, this.currentPlayer);
        
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
                
                // Highlight valid moves for player
                if (this.currentPlayer === this.playerColor) {
                    const isValid = validMoves.some(
                        ([r, c]) => r === rowIndex && c === colIndex
                    );
                    if (isValid) {
                        tile.classList.add('valid-move');
                    }
                }
            });
        });
        
        // Update scores
        const score = getScore(this.board);
        this.shadowRoot.querySelector('.black-score').textContent = score.B;
        this.shadowRoot.querySelector('.white-score').textContent = score.W;
        
        // Update status
        const statusText = this.shadowRoot.getElementById('status-text');
        if (isGameOver(this.board)) {
            const winner = getWinner(this.board);
            if (winner === null) {
                statusText.textContent = `Game Over - It's a tie! (${score.B} - ${score.W})`;
            } else {
                const winnerName = winner === this.playerColor ? 'You win' : 'AI wins';
                statusText.textContent = `Game Over - ${winnerName}! (${score.B} - ${score.W})`;
            }
        } else {
            const currentPlayerName = this.currentPlayer === this.playerColor ? 'Your' : "AI's";
            const color = this.currentPlayer === 'B' ? 'black' : 'white';
            statusText.textContent = `${currentPlayerName} turn - Place a ${color} disc`;
        }
    }
    
    setupEventListeners() {
        const undoBtn = this.shadowRoot.getElementById('undo-btn');
        const restartBtn = this.shadowRoot.getElementById('restart-btn');
        const exitBtn = this.shadowRoot.getElementById('exit-btn');
        
        undoBtn.addEventListener('click', () => {
            if (this.moveHistory.length > 0) {
                this.board = this.moveHistory.pop();
                this.currentPlayer = this.currentPlayer === 'B' ? 'W' : 'B';
                
                // Undo AI move too
                if (this.moveHistory.length > 0 && this.currentPlayer === this.aiColor) {
                    this.board = this.moveHistory.pop();
                    this.currentPlayer = this.currentPlayer === 'B' ? 'W' : 'B';
                }
                
                this.updateUI();
            }
        });
        
        restartBtn.addEventListener('click', () => {
            this.initGame();
        });
        
        exitBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to exit?')) {
                window.history.back();
            }
        });
    }
}

customElements.define('othello-game', OthelloGame);
