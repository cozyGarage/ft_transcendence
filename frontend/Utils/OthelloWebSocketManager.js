// Othello WebSocket Manager for Frontend
// Handles real-time multiplayer connections

class OthelloWebSocketManager {
    constructor(roomName, onGameUpdate) {
        this.roomName = roomName;
        this.onGameUpdate = onGameUpdate;
        this.socket = null;
        this.playerColor = null;
        this.isConnected = false;
    }
    
    connect() {
        const wsUrl = `ws://${window.location.host}/ws/othello/${this.roomName}/`;
        this.socket = new WebSocket(wsUrl);
        
        this.socket.onopen = () => {
            console.log('Othello WebSocket connected');
            this.isConnected = true;
        };
        
        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
        };
        
        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
        
        this.socket.onclose = () => {
            console.log('Othello WebSocket disconnected');
            this.isConnected = false;
        };
    }
    
    handleMessage(data) {
        switch (data.type) {
            case 'player_assigned':
                this.playerColor = data.color;
                this.onGameUpdate({
                    type: 'player_assigned',
                    color: data.color,
                    message: data.message
                });
                break;
                
            case 'game_start':
                this.onGameUpdate({
                    type: 'game_start',
                    board: data.board,
                    currentPlayer: data.current_player
                });
                break;
                
            case 'move_made':
                this.onGameUpdate({
                    type: 'move_made',
                    board: data.board,
                    currentPlayer: data.current_player,
                    row: data.row,
                    col: data.col
                });
                break;
                
            case 'game_over':
                this.onGameUpdate({
                    type: 'game_over',
                    board: data.board,
                    winner: data.winner,
                    score: data.score
                });
                break;
                
            case 'player_disconnected':
                this.onGameUpdate({
                    type: 'player_disconnected',
                    message: data.message
                });
                break;
                
            case 'error':
                this.onGameUpdate({
                    type: 'error',
                    message: data.message
                });
                break;
                
            case 'chat':
                this.onGameUpdate({
                    type: 'chat',
                    message: data.message,
                    sender: data.sender
                });
                break;
        }
    }
    
    makeMove(row, col) {
        if (!this.isConnected) {
            console.error('Not connected to WebSocket');
            return;
        }
        
        this.socket.send(JSON.stringify({
            type: 'make_move',
            row: row,
            col: col
        }));
    }
    
    sendChat(message) {
        if (!this.isConnected) {
            console.error('Not connected to WebSocket');
            return;
        }
        
        this.socket.send(JSON.stringify({
            type: 'chat',
            message: message
        }));
    }
    
    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
    }
}

export { OthelloWebSocketManager };
