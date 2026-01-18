/**
 * Othello Engine - Core Game Logic
 *
 * This module provides the foundational game logic for Othello/Reversi,
 * including board representation, move validation, and game state management.
 *
 * @module othello-engine
 */

// Re-export the main engine class
export { OthelloGameEngine } from './OthelloGameEngine';
export type {
  Move,
  GameState,
  GameEvent,
  GameEventType,
  MoveEventData,
  GameOverEventData,
  InvalidMoveEventData,
  StateChangeEventData,
} from './OthelloGameEngine';

// Re-export the AI bot
export { OthelloBot } from './OthelloBot';
export type { BotDifficulty } from './OthelloBot';

// Re-export time control
export { TimeControlManager } from './TimeControlManager';
export type { TimeControlConfig, PlayerTime, TimeControlState } from './TimeControlManager';

// Re-export opening book
export {
  lookupOpeningBook,
  getOpeningName,
  buildSequenceKey,
  moveToNotation,
  notationToMove,
  OPENING_BOOK,
} from './openingBook';
export type { OpeningBook, OpeningMove } from './openingBook';

/**
 * Tile value types
 * - 'W': White disc
 * - 'B': Black disc
 * - 'E': Empty cell
 * - 'P': Possible move (for UI annotation)
 */
export type TileValue = 'W' | 'B' | 'E' | 'P';

/**
 * Board coordinate as [x, y] where x is column (0-7) and y is row (0-7)
 */
export type Coordinate = [number, number];

/**
 * Game board state
 */
export interface Board {
  /** Current player's turn */
  playerTurn: 'W' | 'B';
  /** 8x8 grid of tile values */
  tiles: TileValue[][];
}

/**
 * Score for both players
 */
export interface Score {
  /** Number of black discs on the board */
  black: number;
  /** Number of white discs on the board */
  white: number;
}

/**
 * Direction modifier for checking adjacent tiles
 */
export interface Direction {
  /** X-axis modifier (-1, 0, or 1) */
  xMod: number;
  /** Y-axis modifier (-1, 0, or 1) */
  yMod: number;
}

/**
 * Map of direction names to direction modifiers
 */
export interface Directions {
  [key: string]: Direction;
}

// Constants

/** White player/disc constant */
export const W: 'W' = 'W';

/** Black player/disc constant */
export const B: 'B' = 'B';

/** Empty cell constant */
export const E: 'E' = 'E';

/** Possible move annotation constant (for UI) */
export const P: 'P' = 'P';

/**
 * Creates a new game board with the specified tiles
 *
 * @param tiles - 8x8 grid of tile values
 * @returns Board object with Black player starting first
 *
 * @example
 * ```typescript
 * const board = createBoard([
 *   [E, E, E, E, E, E, E, E],
 *   // ... remaining rows
 * ]);
 * ```
 */
export const createBoard = (tiles: TileValue[][]): Board => ({
  playerTurn: B,
  tiles,
});

/**
 * Gets the tile value at a specific coordinate
 *
 * @param board - Game board
 * @param coordinate - [x, y] position to check
 * @returns Tile value at the coordinate
 * @throws Error if coordinate is out of bounds
 *
 * @example
 * ```typescript
 * const value = tile(board, [3, 3]); // 'W' or 'B' or 'E'
 * ```
 */
export const tile = (board: Board, [x, y]: Coordinate): TileValue => {
  const row = board.tiles[y];
  if (!row) {
    throw new Error('Out of bounds: invalid row index');
  }
  const value = row[x];
  if (value === undefined) {
    throw new Error('Out of bounds: invalid column index');
  }
  return value;
};

/**
 * Calculates the current score (disc count) for both players
 *
 * @param board - Game board to score
 * @returns Object with black and white disc counts
 *
 * @example
 * ```typescript
 * const { black, white } = score(board);
 * console.log(`Black: ${black}, White: ${white}`);
 * ```
 */
export const score = (board: Board): Score => {
  let blackCount = 0;
  let whiteCount = 0;

  for (let y = 0; y < board.tiles.length; ++y) {
    const row = board.tiles[y];
    if (!row) continue;
    for (let x = 0; x < row.length; ++x) {
      const tileVal = row[x];
      if (tileVal === undefined) continue;
      if (tileVal === B) {
        blackCount++;
      } else if (tileVal === W) {
        whiteCount++;
      }
    }
  }

  return {
    black: blackCount,
    white: whiteCount,
  };
};

/**
 * Checks if a coordinate is outside the board boundaries
 *
 * @param board - Game board
 * @param coordinate - [x, y] position to check
 * @returns true if coordinate is out of bounds
 * @internal
 */
const isOutOfBounds = (board: Board, [x, y]: Coordinate): boolean =>
  x < 0 || y < 0 || x >= board.tiles.length || y >= board.tiles.length;

/**
 * Checks if a coordinate has at least one adjacent piece (not empty)
 * Used as an optimization to quickly reject impossible moves
 *
 * @param board - Game board
 * @param coord - [x, y] position to check
 * @returns true if at least one adjacent cell contains a disc
 *
 * @example
 * ```typescript
 * if (!hasAdjacentPiece(board, [3, 2])) {
 *   // This move can't be valid (no pieces nearby)
 * }
 * ```
 */
export const hasAdjacentPiece = (board: Board, coord: Coordinate): boolean => {
  const [xCoord, yCoord] = coord;
  for (let x = xCoord - 1; x <= xCoord + 1; x++) {
    for (let y = yCoord - 1; y <= yCoord + 1; y++) {
      // don't check the original coord, only adjacent coords
      if (x === xCoord && y === yCoord) {
        continue;
      }
      if (isOutOfBounds(board, [x, y])) {
        continue;
      }
      const row = board.tiles[y];
      if (row && row[x] !== E) {
        return true;
      }
    }
  }
  return false;
};

/**
 * All 8 directions for checking flippable pieces
 * @internal
 */
const DIRECTIONS: Directions = {
  top: {
    xMod: 0,
    yMod: -1,
  },
  'top-right': {
    xMod: 1,
    yMod: -1,
  },
  right: {
    xMod: 1,
    yMod: 0,
  },
  'bottom-right': {
    xMod: 1,
    yMod: 1,
  },
  bottom: {
    xMod: 0,
    yMod: 1,
  },
  'bottom-left': {
    xMod: -1,
    yMod: 1,
  },
  left: {
    xMod: -1,
    yMod: 0,
  },
  'top-left': {
    xMod: -1,
    yMod: -1,
  },
};

/**
 * Finds all directions in which opponent pieces can be flipped from a given position
 *
 * @param board - Game board
 * @param coordinate - Starting [x, y] position
 * @returns Array of direction names where flips are possible
 * @internal
 *
 * Algorithm:
 * 1. For each of 8 directions from the starting position
 * 2. Check if adjacent cell has opponent's color
 * 3. Continue in that direction until finding:
 *    - Current player's piece (flippable) → add direction
 *    - Empty cell or edge (not flippable) → skip direction
 */
const findFlippableDirections = (board: Board, [xCoord, yCoord]: Coordinate): string[] => {
  const startColor = tile(board, [xCoord, yCoord]);
  const alternateColor = startColor === W ? B : W;
  const flippableDirections: string[] = [];

  for (const dirName in DIRECTIONS) {
    const dirModifier = DIRECTIONS[dirName];
    if (!dirModifier) continue;
    let x = xCoord + dirModifier.xMod;
    let y = yCoord + dirModifier.yMod;

    if (!isOutOfBounds(board, [x, y]) && tile(board, [x, y]) === alternateColor) {
      let isAlternateColor = true;

      do {
        x += dirModifier.xMod;
        y += dirModifier.yMod;

        if (isOutOfBounds(board, [x, y])) {
          isAlternateColor = false;
        } else {
          const nextTile = tile(board, [x, y]);
          if (nextTile === E) {
            isAlternateColor = false;
          } else if (nextTile === startColor) {
            flippableDirections.push(dirName);
            isAlternateColor = false;
          }
        }
      } while (isAlternateColor);
    }
  }

  return flippableDirections;
};

/**
 * Flips all opponent pieces in the specified directions
 *
 * @param board - Game board (mutated in place)
 * @param directions - Direction names to flip pieces in
 * @param coordinate - Starting [x, y] position
 * @internal
 *
 * This function modifies the board state by changing opponent pieces
 * to the current player's color in each specified direction.
 */
const flipTiles = (board: Board, directions: string[], [xCoord, yCoord]: Coordinate): void => {
  const flipColor = tile(board, [xCoord, yCoord]);
  for (const dirName of directions) {
    const dirModifier = DIRECTIONS[dirName];
    if (!dirModifier) continue;
    let x = xCoord + dirModifier.xMod;
    let y = yCoord + dirModifier.yMod;

    while (tile(board, [x, y]) !== flipColor) {
      const row = board.tiles[y];
      if (!row) break;
      row[x] = flipColor;
      x += dirModifier.xMod;
      y += dirModifier.yMod;
    }
  }
};

/**
 * Alternates between players
 *
 * @param player - Current player
 * @returns Opposite player
 * @internal
 */
const alternatePlayer = (player: 'W' | 'B'): 'W' | 'B' => (player === B ? W : B);

/**
 * Executes a move on the board
 *
 * This is the core game logic function that:
 * 1. Places a piece at the specified coordinate
 * 2. Flips all opponent pieces in valid directions
 * 3. Switches to the next player
 * 4. Handles auto-pass if next player has no valid moves
 *
 * @param board - Game board (mutated in place)
 * @param coord - [x, y] coordinate to place piece
 * @throws Error if coordinate is occupied or move doesn't flip any pieces
 *
 * @example
 * ```typescript
 * try {
 *   takeTurn(board, [2, 3]);
 *   console.log('Move successful');
 * } catch (error) {
 *   console.error('Invalid move:', error.message);
 * }
 * ```
 */
export const takeTurn = (board: Board, coord: Coordinate): void => {
  const [x, y] = coord;
  const row = board.tiles[y];
  if (!row || row[x] !== E) {
    throw new Error('Error: You cannot place a piece on an occupied square.');
  }

  // First place the piece temporarily to check for flippable directions
  row[x] = board.playerTurn;
  const flippableDirections = findFlippableDirections(board, coord);

  // A move is only valid if it flips at least one opponent piece
  if (flippableDirections.length === 0) {
    row[x] = E; // Revert the placement
    throw new Error('Error: This move does not flip any opponent pieces.');
  }

  flipTiles(board, flippableDirections, coord);

  // Switch to the next player
  board.playerTurn = alternatePlayer(board.playerTurn);

  // CRITICAL FIX: If the next player has no valid moves, switch back
  // This handles the "pass" scenario in Othello
  const nextPlayerHasMoves = getValidMoves(board).length > 0;
  if (!nextPlayerHasMoves && !isGameOver(board)) {
    // Next player must pass - switch back to current player
    board.playerTurn = alternatePlayer(board.playerTurn);
  }
};

/**
 * Creates a deep copy of the board
 *
 * @param board - Board to clone
 * @returns New board with same state
 * @internal
 */
const cloneBoard = (board: Board): Board => ({
  playerTurn: board.playerTurn,
  tiles: board.tiles.map((row) => [...row]),
});

/**
 * Result of a move operation
 */
export interface MoveResult {
  /** New board state after the move */
  board: Board;
  /** Whether the move was successful */
  success: boolean;
}

/**
 * Executes a move and returns a new board (immutable version)
 *
 * Unlike `takeTurn`, this function does not mutate the input board.
 * Instead, it creates a copy and applies the move.
 *
 * @param board - Original game board (not modified)
 * @param coord - [x, y] coordinate to place piece
 * @returns MoveResult with new board and success status, or null if invalid move
 *
 * @example
 * ```typescript
 * const result = move(board, [2, 3]);
 * if (result) {
 *   console.log('New board:', result.board);
 * } else {
 *   console.log('Invalid move');
 * }
 * ```
 */
export const move = (board: Board, coord: Coordinate): MoveResult | null => {
  const newBoard = cloneBoard(board);
  try {
    takeTurn(newBoard, coord);
    return { board: newBoard, success: true };
  } catch {
    return null;
  }
};

/**
 * Checks if a move is valid for the current player
 *
 * A move is valid if:
 * 1. The target cell is empty
 * 2. The move flips at least one opponent piece
 *
 * @param board - Game board
 * @param coord - [x, y] coordinate to check
 * @returns true if the move is valid for the current player
 *
 * @example
 * ```typescript
 * if (isValidMove(board, [2, 3])) {
 *   takeTurn(board, [2, 3]);
 * }
 * ```
 */
export const isValidMove = (board: Board, coord: Coordinate): boolean => {
  const [x, y] = coord;
  const row = board.tiles[y];
  if (!row || row[x] !== E) {
    return false;
  }

  // Temporarily place the piece and check for flippable directions
  row[x] = board.playerTurn;
  const flippableDirections = findFlippableDirections(board, coord);
  row[x] = E; // Revert

  return flippableDirections.length > 0;
};

/**
 * Gets all valid moves for the current player
 *
 * Scans the entire board and returns coordinates of all cells
 * where the current player can make a valid move.
 *
 * @param board - Game board
 * @returns Array of [x, y] coordinates representing valid moves
 *
 * @example
 * ```typescript
 * const moves = getValidMoves(board);
 * console.log(`Current player has ${moves.length} valid moves`);
 * moves.forEach(([x, y]) => {
 *   console.log(`Valid move at (${x}, ${y})`);
 * });
 * ```
 */
export const getValidMoves = (board: Board): Coordinate[] => {
  const validMoves: Coordinate[] = [];
  for (let y = 0; y < board.tiles.length; y++) {
    const row = board.tiles[y];
    if (!row) continue;
    for (let x = 0; x < row.length; x++) {
      if (isValidMove(board, [x, y])) {
        validMoves.push([x, y]);
      }
    }
  }
  return validMoves;
};

/**
 * Checks if the game is over
 *
 * Game ends when:
 * 1. The board is completely full, OR
 * 2. Both players have no valid moves
 *
 * @param board - Game board
 * @returns true if the game has ended
 *
 * @example
 * ```typescript
 * if (isGameOver(board)) {
 *   const winner = getWinner(board);
 *   console.log(winner ? `${winner} wins!` : 'Tie game!');
 * }
 * ```
 */
export const isGameOver = (board: Board): boolean => {
  // Check if board is full
  const isBoardFull = board.tiles.every((row) => row.every((tile) => tile !== E));
  if (isBoardFull) {
    return true;
  }

  // Check if current player has valid moves
  const currentPlayerHasMoves = getValidMoves(board).length > 0;
  if (currentPlayerHasMoves) {
    return false;
  }

  // Check if other player has valid moves
  const originalPlayer = board.playerTurn;
  board.playerTurn = alternatePlayer(board.playerTurn);
  const otherPlayerHasMoves = getValidMoves(board).length > 0;
  board.playerTurn = originalPlayer; // Restore

  return !otherPlayerHasMoves;
};

/**
 * Determines the winner of the game
 *
 * @param board - Game board
 * @returns 'B' if black wins, 'W' if white wins, or null for a tie
 *
 * @example
 * ```typescript
 * const winner = getWinner(board);
 * if (winner === B) {
 *   console.log('Black wins!');
 * } else if (winner === W) {
 *   console.log('White wins!');
 * } else {
 *   console.log('Tie game!');
 * }
 * ```
 */
export const getWinner = (board: Board): 'W' | 'B' | null => {
  const scores = score(board);
  if (scores.black > scores.white) {
    return B;
  } else if (scores.white > scores.black) {
    return W;
  }
  return null; // Tie
};

/**
 * Annotates a single square with 'P' if it's a valid move
 *
 * @param square - Current tile value
 * @param board - Game board
 * @param coord - [x, y] coordinate
 * @returns Annotated tile value ('P' for possible moves)
 * @internal
 */
const annotateSquare = (square: TileValue, board: Board, coord: Coordinate): TileValue =>
  square !== E ? square : isValidMove(board, coord) ? P : E;

/**
 * Creates a copy of the board with valid moves annotated as 'P'
 *
 * Useful for UI to display possible move indicators without
 * modifying the actual game state.
 *
 * @param board - Game board
 * @returns New board with valid moves marked as 'P'
 *
 * @example
 * ```typescript
 * const annotated = getAnnotatedBoard(board);
 * // Use annotated board for rendering UI hints
 * // Original board remains unchanged
 * ```
 */
export const getAnnotatedBoard = (board: Board): Board => ({
  ...board,
  tiles: board.tiles.map((row, y) => row.map((square, x) => annotateSquare(square, board, [x, y]))),
});
