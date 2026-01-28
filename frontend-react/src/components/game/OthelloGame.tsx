import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import { clsx } from 'clsx';

type CellState = 'empty' | 'black' | 'white';

const BOARD_SIZE = 8;
const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],          [0, 1],
  [1, -1], [1, 0], [1, 1]
];

export default function OthelloGame() {
  const { resetGame } = useGameStore();
  const [board, setBoard] = useState<CellState[][]>(initializeBoard());
  const [currentPlayer, setCurrentPlayer] = useState<'black' | 'white'>('black');
  const [validMoves, setValidMoves] = useState<boolean[][]>(getValidMoves(initializeBoard(), 'black'));

  function initializeBoard(): CellState[][] {
    const newBoard: CellState[][] = Array(BOARD_SIZE).fill(null).map(() => 
      Array(BOARD_SIZE).fill('empty')
    );
    newBoard[3][3] = 'white';
    newBoard[3][4] = 'black';
    newBoard[4][3] = 'black';
    newBoard[4][4] = 'white';
    return newBoard;
  }

  function getValidMoves(boardState: CellState[][], player: 'black' | 'white'): boolean[][] {
    const moves: boolean[][] = Array(BOARD_SIZE).fill(null).map(() => 
      Array(BOARD_SIZE).fill(false)
    );

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (boardState[row][col] === 'empty' && isValidMove(boardState, row, col, player)) {
          moves[row][col] = true;
        }
      }
    }

    return moves;
  }

  function isValidMove(boardState: CellState[][], row: number, col: number, player: 'black' | 'white'): boolean {
    const opponent = player === 'black' ? 'white' : 'black';

    for (const [dx, dy] of DIRECTIONS) {
      let x = row + dx;
      let y = col + dy;
      let foundOpponent = false;

      while (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE) {
        if (boardState[x][y] === opponent) {
          foundOpponent = true;
        } else if (boardState[x][y] === player && foundOpponent) {
          return true;
        } else {
          break;
        }
        x += dx;
        y += dy;
      }
    }

    return false;
  }

  function makeMove(row: number, col: number) {
    if (!validMoves[row][col]) return;

    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = currentPlayer;

    // Flip pieces
    const opponent = currentPlayer === 'black' ? 'white' : 'black';

    for (const [dx, dy] of DIRECTIONS) {
      const toFlip: [number, number][] = [];
      let x = row + dx;
      let y = col + dy;

      while (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE) {
        if (newBoard[x][y] === opponent) {
          toFlip.push([x, y]);
        } else if (newBoard[x][y] === currentPlayer) {
          toFlip.forEach(([fx, fy]) => {
            newBoard[fx][fy] = currentPlayer;
          });
          break;
        } else {
          break;
        }
        x += dx;
        y += dy;
      }
    }

    setBoard(newBoard);

    // Switch player
    const nextPlayer = currentPlayer === 'black' ? 'white' : 'black';
    const nextValidMoves = getValidMoves(newBoard, nextPlayer);
    
    // Check if next player has valid moves
    const hasValidMoves = nextValidMoves.some(row => row.some(cell => cell));
    
    if (hasValidMoves) {
      setCurrentPlayer(nextPlayer);
      setValidMoves(nextValidMoves);
    } else {
      // Check if current player can still move
      const currentValidMoves = getValidMoves(newBoard, currentPlayer);
      const currentHasValidMoves = currentValidMoves.some(row => row.some(cell => cell));
      
      if (currentHasValidMoves) {
        setValidMoves(currentValidMoves);
      } else {
        // Game over
        setValidMoves(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(false)));
      }
    }
  }

  const blackCount = board.flat().filter(cell => cell === 'black').length;
  const whiteCount = board.flat().filter(cell => cell === 'white').length;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-between w-full max-w-lg mb-4">
        <Button variant="ghost" onClick={resetGame} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back
        </Button>
        <h2 className="text-2xl font-bold text-white">Othello</h2>
        <div className="w-20" />
      </div>

      {/* Score */}
      <div className="flex items-center gap-8 mb-4">
        <div className={clsx(
          'flex items-center gap-2 px-4 py-2 rounded-lg',
          currentPlayer === 'black' && 'ring-2 ring-primary'
        )}>
          <div className="w-6 h-6 rounded-full bg-gray-900 border-2 border-gray-700" />
          <span className="text-white font-bold">{blackCount}</span>
        </div>
        <div className={clsx(
          'flex items-center gap-2 px-4 py-2 rounded-lg',
          currentPlayer === 'white' && 'ring-2 ring-primary'
        )}>
          <div className="w-6 h-6 rounded-full bg-white" />
          <span className="text-white font-bold">{whiteCount}</span>
        </div>
      </div>

      {/* Board */}
      <div className="bg-green-800 p-2 rounded-lg">
        <div className="grid grid-cols-8 gap-1">
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => makeMove(rowIndex, colIndex)}
                className={clsx(
                  'w-12 h-12 rounded-sm flex items-center justify-center transition-all',
                  'bg-green-700 hover:bg-green-600',
                  validMoves[rowIndex][colIndex] && 'ring-2 ring-primary ring-inset'
                )}
              >
                {cell !== 'empty' && (
                  <div
                    className={clsx(
                      'w-10 h-10 rounded-full transition-all duration-300',
                      cell === 'black' ? 'bg-gray-900 shadow-lg' : 'bg-white shadow-lg'
                    )}
                  />
                )}
              </button>
            ))
          )}
        </div>
      </div>

      <p className="text-gray-500">
        {currentPlayer === 'black' ? "Black's" : "White's"} turn
      </p>
    </div>
  );
}
