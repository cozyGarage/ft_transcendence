// Simplified JavaScript Othello Engine
// Based on the TypeScript version but pure JS for immediate browser compatibility

// Constants
const E = 'E'; // Empty
const B = 'B'; // Black
const W = 'W'; // White

// Create initial board
export function createInitialBoard() {
    const board = Array(8).fill(null).map(() => Array(8).fill(E));
    board[3][3] = W;
    board[3][4] = B;
    board[4][3] = B;
    board[4][4] = W;
    return board;
}

// Get valid moves for current player
export function getValidMoves(board, player) {
    const moves = [];
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
    ];
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (board[row][col] !== E) continue;
            
            for (const [dr, dc] of directions) {
                if (wouldFlip(board, row, col, dr, dc, player).length > 0) {
                    moves.push([row, col]);
                    break;
                }
            }
        }
    }
    return moves;
}

// Check if placing a piece would flip any opponent pieces
function wouldFlip(board, row, col, dr, dc, player) {
    const opponent = player === B ? W : B;
    const toFlip = [];
    let r = row + dr;
    let c = col + dc;
    
    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
        if (board[r][c] === E) break;
        if (board[r][c] === opponent) {
            toFlip.push([r, c]);
        } else if (board[r][c] === player) {
            return toFlip.length > 0 ? toFlip : [];
        }
        r += dr;
        c += dc;
    }
    return [];
}

// Make a move
export function makeMove(board, row, col, player) {
    if (board[row][col] !== E) return false;
    
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
    ];
    
    let flipped = [];
    for (const [dr, dc] of directions) {
        flipped = flipped.concat(wouldFlip(board, row, col, dr, dc, player));
    }
    
    if (flipped.length === 0) return false;
    
    board[row][col] = player;
    for (const [r, c] of flipped) {
        board[r][c] = player;
    }
    return true;
}

// Count pieces
export function getScore(board) {
    let blackCount = 0;
    let whiteCount = 0;
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (board[row][col] === B) blackCount++;
            if (board[row][col] === W) whiteCount++;
        }
    }
    return { B: blackCount, W: whiteCount };
}

// Check if game is over
export function isGameOver(board) {
    return getValidMoves(board, B).length === 0 && getValidMoves(board, W).length === 0;
}

// Get winner
export function getWinner(board) {
    const score = getScore(board);
    if (score.B > score.W) return B;
    if (score.W > score.B) return W;
    return null; // Tie
}

// Simple AI - Random valid move (Easy)
export function getAIMove(board, player, difficulty = 'easy') {
    const validMoves = getValidMoves(board, player);
    if (validMoves.length === 0) return null;
    
    if (difficulty === 'easy') {
        // Random move
        return validMoves[Math.floor(Math.random() * validMoves.length)];
    } else if (difficulty === 'medium') {
        // Greedy - choose move that flips most pieces
        let bestMove = validMoves[0];
        let maxFlips = 0;
        
        for (const move of validMoves) {
            const testBoard = board.map(row => [...row]);
            makeMove(testBoard, move[0], move[1], player);
            const score = getScore(testBoard);
            const flips = player === B ? score.B : score.W;
            if (flips > maxFlips) {
                maxFlips = flips;
                bestMove = move;
            }
        }
        return bestMove;
    }
    // For 'hard', use medium for now
    return getAIMove(board, player, 'medium');
}
