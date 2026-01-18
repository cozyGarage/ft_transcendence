import { Board, Coordinate, getValidMoves, score, E } from './index';
import { lookupOpeningBook } from './openingBook';

/**
 * AI difficulty levels for the Othello bot
 * - easy: Random valid move selection
 * - medium: Greedy algorithm (maximizes immediate flips)
 * - hard: Minimax with alpha-beta pruning, move ordering, and transposition table
 */
export type BotDifficulty = 'easy' | 'medium' | 'hard';

/**
 * Position evaluation weights for the Minimax algorithm
 *
 * Strategic values for each board position:
 * - Corners (100): Most valuable, cannot be flipped
 * - Edge C-squares (-50): Dangerous, often lead to losing corners
 * - Edge X-squares (-20): Dangerous, adjacent to corners
 * - Edges (10): Moderately valuable, hard to flip
 * - Interior (-1 to 5): Less valuable, easily flipped
 *
 * This heuristic guides the AI towards strong positions and
 * away from weak ones during lookahead search.
 */
const POSITION_WEIGHTS = [
  [100, -20, 10, 5, 5, 10, -20, 100],
  [-20, -50, -2, -2, -2, -2, -50, -20],
  [10, -2, -1, -1, -1, -1, -2, 10],
  [5, -2, -1, -1, -1, -1, -2, 5],
  [5, -2, -1, -1, -1, -1, -2, 5],
  [10, -2, -1, -1, -1, -1, -2, 10],
  [-20, -50, -2, -2, -2, -2, -50, -20],
  [100, -20, 10, 5, 5, 10, -20, 100],
];

/**
 * Corner coordinates for quick lookup
 */
const CORNERS: Coordinate[] = [
  [0, 0],
  [0, 7],
  [7, 0],
  [7, 7],
];

/**
 * X-squares (diagonal to corners) - very dangerous positions
 */
const X_SQUARES: Coordinate[] = [
  [1, 1],
  [1, 6],
  [6, 1],
  [6, 6],
];

/**
 * C-squares (adjacent to corners on edges) - dangerous positions
 */
const C_SQUARES: Coordinate[] = [
  [0, 1],
  [1, 0],
  [0, 6],
  [1, 7],
  [6, 0],
  [7, 1],
  [6, 7],
  [7, 6],
];

/**
 * Edge positions (excluding corners and C-squares)
 */
const EDGE_POSITIONS: Coordinate[] = [
  [0, 2],
  [0, 3],
  [0, 4],
  [0, 5],
  [7, 2],
  [7, 3],
  [7, 4],
  [7, 5],
  [2, 0],
  [3, 0],
  [4, 0],
  [5, 0],
  [2, 7],
  [3, 7],
  [4, 7],
  [5, 7],
];

/**
 * Transposition table entry for caching evaluated positions
 */
interface TranspositionEntry {
  depth: number;
  score: number;
  flag: 'exact' | 'lower' | 'upper';
  bestMove?: Coordinate;
}

/**
 * Maximum transposition table size (entries)
 * ~10MB assuming ~100 bytes per entry
 */
const MAX_TT_SIZE = 100000;

/**
 * OthelloBot - AI opponent for Othello game
 *
 * Provides three difficulty levels with different strategies:
 *
 * **Easy**: Random selection from valid moves
 * - Unpredictable
 * - No strategic thinking
 * - Good for beginners
 *
 * **Medium**: Greedy algorithm
 * - Maximizes immediate disc flips
 * - Deterministic (same board → same move)
 * - Challenging for casual players
 *
 * **Hard**: Minimax with alpha-beta pruning + optimizations
 * - Move ordering (corners first, X-squares last)
 * - Transposition table (caches evaluated positions)
 * - Looks ahead 5 moves (depth 5)
 * - Position-based evaluation (corners valuable)
 * - Considers mobility (number of available moves)
 * - Should defeat most human players
 *
 * @example
 * ```typescript
 * // Create a hard AI playing as White
 * const bot = new OthelloBot('hard', 'W');
 *
 * // Get the AI's move
 * const move = bot.calculateMove(board);
 * if (move) {
 *   engine.makeMove(move);
 * }
 * ```
 */
export class OthelloBot {
  private difficulty: BotDifficulty;
  private player: 'W' | 'B';
  private transpositionTable: Map<string, TranspositionEntry>;
  private nodesSearched: number = 0;
  private useOpeningBook: boolean = true;
  private moveHistory: Array<{ coordinate: Coordinate }> = [];

  /**
   * Creates a new AI bot
   *
   * @param difficulty - AI difficulty level (easy/medium/hard)
   * @param player - Which color the bot plays as ('W' for White, 'B' for Black)
   *
   * @example
   * ```typescript
   * const easyBot = new OthelloBot('easy', 'W');
   * const hardBot = new OthelloBot('hard', 'B');
   * ```
   */
  constructor(difficulty: BotDifficulty = 'medium', player: 'W' | 'B' = 'W') {
    this.difficulty = difficulty;
    this.player = player;
    this.transpositionTable = new Map();
  }

  /**
   * Gets the current difficulty level
   *
   * @returns The bot's difficulty setting
   */
  public getDifficulty(): BotDifficulty {
    return this.difficulty;
  }

  /**
   * Changes the difficulty level
   *
   * @param difficulty - New difficulty level
   */
  public setDifficulty(difficulty: BotDifficulty): void {
    this.difficulty = difficulty;
  }

  /**
   * Gets which player (color) the bot controls
   *
   * @returns 'W' for White or 'B' for Black
   */
  public getPlayer(): 'W' | 'B' {
    return this.player;
  }

  /**
   * Changes which player the bot controls
   *
   * @param player - Player color ('W' or 'B')
   */
  public setPlayer(player: 'W' | 'B'): void {
    this.player = player;
  }

  /**
   * Gets the number of nodes searched in the last calculation
   * Useful for performance analysis
   *
   * @returns Number of positions evaluated
   */
  public getNodesSearched(): number {
    return this.nodesSearched;
  }

  /**
   * Clears the transposition table
   * Call this when starting a new game
   */
  public clearTranspositionTable(): void {
    this.transpositionTable.clear();
  }

  /**
   * Gets the current transposition table size
   *
   * @returns Number of cached positions
   */
  public getTranspositionTableSize(): number {
    return this.transpositionTable.size;
  }

  /**
   * Calculates the best move for the current board state
   *
   * Uses the appropriate algorithm based on difficulty:
   * - Easy: Random selection
   * - Medium: Greedy (maximize immediate flips)
   * - Hard: Minimax with alpha-beta pruning, move ordering, and transposition table
   *
   * @param board - Current game board state
   * @returns Best move coordinate [x, y], or null if no valid moves exist
   *
   * @example
   * ```typescript
   * const bot = new OthelloBot('hard', 'W');
   * const move = bot.calculateMove(board);
   *
   * if (move) {
   *   const [x, y] = move;
   *   console.log(`AI chooses to play at (${x}, ${y})`);
   * } else {
   *   console.log('AI has no valid moves');
   * }
   * ```
   */
  public calculateMove(
    board: Board,
    moveHistory?: Array<{ coordinate: Coordinate }>
  ): Coordinate | null {
    this.nodesSearched = 0;
    const validMoves = getValidMoves(board);

    if (validMoves.length === 0) {
      return null;
    }

    // Update move history if provided
    if (moveHistory) {
      this.moveHistory = moveHistory;
    }

    // Check opening book first (only for hard difficulty and early game)
    if (this.useOpeningBook && this.difficulty === 'hard' && this.moveHistory.length < 12) {
      const bookMove = lookupOpeningBook(this.moveHistory);
      if (bookMove) {
        // Verify the book move is valid
        const isValid = validMoves.some((m) => m[0] === bookMove[0] && m[1] === bookMove[1]);
        if (isValid) {
          return bookMove;
        }
      }
    }

    switch (this.difficulty) {
      case 'easy':
        return this.getRandomMove(validMoves);
      case 'medium':
        return this.getGreedyMove(board, validMoves);
      case 'hard':
        return this.getMinimaxMove(board, validMoves);
      default:
        return this.getRandomMove(validMoves);
    }
  }

  /**
   * Enable or disable opening book usage
   */
  public setUseOpeningBook(use: boolean): void {
    this.useOpeningBook = use;
  }

  /**
   * Check if opening book is enabled
   */
  public isOpeningBookEnabled(): boolean {
    return this.useOpeningBook;
  }

  /**
   * Easy difficulty: Randomly selects from valid moves
   *
   * Provides unpredictable play with no strategic thinking.
   * Good for beginners to practice against.
   *
   * @param validMoves - Array of valid move coordinates
   * @returns Randomly selected move
   * @throws Error if no valid moves available
   * @private
   */
  private getRandomMove(validMoves: Coordinate[]): Coordinate {
    const randomIndex = Math.floor(Math.random() * validMoves.length);
    const move = validMoves[randomIndex];
    if (!move) {
      throw new Error('No valid moves available');
    }
    return move;
  }

  /**
   * Medium difficulty: Greedy algorithm
   *
   * Selects the move that maximizes immediate disc flips.
   * Deterministic - always chooses the same move for the same board state.
   *
   * Strategy:
   * 1. Try each valid move
   * 2. Count resulting disc difference
   * 3. Choose move with highest immediate score gain
   *
   * @param board - Current game board
   * @param validMoves - Array of valid move coordinates
   * @returns Move that maximizes immediate score
   * @throws Error if no valid moves available
   * @private
   */
  private getGreedyMove(board: Board, validMoves: Coordinate[]): Coordinate {
    const firstMove = validMoves[0];
    if (!firstMove) {
      throw new Error('No valid moves available');
    }

    let bestMove = firstMove;
    let bestScore = -Infinity;

    for (const move of validMoves) {
      const clonedBoard = this.cloneBoard(board);
      this.simulateMove(clonedBoard, move);

      const moveScore = this.evaluateScore(clonedBoard);

      if (moveScore > bestScore) {
        bestScore = moveScore;
        bestMove = move;
      }
    }

    return bestMove;
  }

  /**
   * Hard difficulty: Minimax algorithm with alpha-beta pruning
   *
   * Looks ahead 5 moves and uses position-based evaluation.
   * Includes move ordering and transposition table for efficiency.
   *
   * Strategy:
   * 1. Order moves by strategic value (corners first, X-squares last)
   * 2. Check transposition table for cached evaluations
   * 3. Search game tree to depth 5
   * 4. Evaluate positions using:
   *    - Position weights (corners valuable, C/X squares dangerous)
   *    - Mobility (more available moves is better)
   *    - Disc count
   * 5. Use alpha-beta pruning to skip unnecessary branches
   * 6. Cache results in transposition table
   * 7. Choose move leading to best evaluated position
   *
   * @param board - Current game board
   * @param validMoves - Array of valid move coordinates
   * @returns Move with highest minimax evaluation
   * @throws Error if no valid moves available
   * @private
   */
  private getMinimaxMove(board: Board, validMoves: Coordinate[]): Coordinate {
    const depth = 5; // Look ahead 5 moves (increased from 4)
    const firstMove = validMoves[0];
    if (!firstMove) {
      throw new Error('No valid moves available');
    }

    // Order moves for better pruning
    const orderedMoves = this.orderMoves(validMoves, board);

    let bestMove = orderedMoves[0] || firstMove;
    let bestScore = -Infinity;
    let alpha = -Infinity;
    const beta = Infinity;

    for (const move of orderedMoves) {
      const clonedBoard = this.cloneBoard(board);
      this.simulateMove(clonedBoard, move);

      const moveScore = this.minimaxWithTT(clonedBoard, depth - 1, alpha, beta, false);

      if (moveScore > bestScore) {
        bestScore = moveScore;
        bestMove = move;
      }

      alpha = Math.max(alpha, bestScore);
    }

    return bestMove;
  }

  /**
   * Orders moves by strategic priority for better alpha-beta pruning
   *
   * Move ordering is critical for alpha-beta efficiency:
   * - Best moves first = more pruning = faster search
   * - Can improve search speed by 10-100x
   *
   * Priority order:
   * 1. Corners (highest value, always good)
   * 2. Edges (stable positions)
   * 3. Interior moves (neutral)
   * 4. C-squares (dangerous, but sometimes necessary)
   * 5. X-squares (most dangerous, avoid if possible)
   *
   * @param moves - Unordered array of valid moves
   * @param board - Current board state for context
   * @returns Moves sorted by strategic priority
   * @private
   */
  private orderMoves(moves: Coordinate[], board: Board): Coordinate[] {
    const scored = moves.map((move) => ({
      move,
      score: this.getMoveOrderScore(move, board),
    }));

    // Sort descending by score (best moves first)
    scored.sort((a, b) => b.score - a.score);

    return scored.map((s) => s.move);
  }

  /**
   * Calculates a priority score for move ordering
   *
   * Higher scores = searched first = better pruning if good move
   *
   * @param move - Move to score
   * @param board - Current board state
   * @returns Priority score (higher = search first)
   * @private
   */
  private getMoveOrderScore(move: Coordinate, board: Board): number {
    const [x, y] = move;

    // Corners are always excellent - highest priority
    if (this.isCorner(move)) {
      return 1000;
    }

    // X-squares are very dangerous - lowest priority unless corner is taken
    if (this.isXSquare(move)) {
      // Check if adjacent corner is already taken by us
      const adjacentCorner = this.getAdjacentCorner(move);
      if (adjacentCorner) {
        const [cx, cy] = adjacentCorner;
        const cornerTile = board.tiles[cy]?.[cx];
        if (cornerTile === this.player) {
          return 100; // Safe if we own the corner
        }
      }
      return -100; // Very dangerous otherwise
    }

    // C-squares are dangerous - low priority unless corner is taken
    if (this.isCSquare(move)) {
      const adjacentCorner = this.getAdjacentCornerForC(move);
      if (adjacentCorner) {
        const [cx, cy] = adjacentCorner;
        const cornerTile = board.tiles[cy]?.[cx];
        if (cornerTile === this.player) {
          return 50; // Safe if we own the corner
        }
      }
      return -50; // Dangerous otherwise
    }

    // Edges are good - medium-high priority
    if (this.isEdge(move)) {
      return 30;
    }

    // Use position weight for interior moves
    const weight = POSITION_WEIGHTS[y]?.[x] ?? 0;
    return weight;
  }

  /**
   * Checks if a move is a corner position
   * @private
   */
  private isCorner(move: Coordinate): boolean {
    return CORNERS.some(([cx, cy]) => move[0] === cx && move[1] === cy);
  }

  /**
   * Checks if a move is an X-square (diagonal to corner)
   * @private
   */
  private isXSquare(move: Coordinate): boolean {
    return X_SQUARES.some(([xx, xy]) => move[0] === xx && move[1] === xy);
  }

  /**
   * Checks if a move is a C-square (adjacent to corner on edge)
   * @private
   */
  private isCSquare(move: Coordinate): boolean {
    return C_SQUARES.some(([cx, cy]) => move[0] === cx && move[1] === cy);
  }

  /**
   * Checks if a move is on an edge (excluding corners and C-squares)
   * @private
   */
  private isEdge(move: Coordinate): boolean {
    return EDGE_POSITIONS.some(([ex, ey]) => move[0] === ex && move[1] === ey);
  }

  /**
   * Gets the corner adjacent to an X-square
   * @private
   */
  private getAdjacentCorner(xSquare: Coordinate): Coordinate | null {
    const [x, y] = xSquare;
    if (x === 1 && y === 1) return [0, 0];
    if (x === 1 && y === 6) return [0, 7];
    if (x === 6 && y === 1) return [7, 0];
    if (x === 6 && y === 6) return [7, 7];
    return null;
  }

  /**
   * Gets the corner adjacent to a C-square
   * @private
   */
  private getAdjacentCornerForC(cSquare: Coordinate): Coordinate | null {
    const [x, y] = cSquare;
    if ((x === 0 && y === 1) || (x === 1 && y === 0)) return [0, 0];
    if ((x === 0 && y === 6) || (x === 1 && y === 7)) return [0, 7];
    if ((x === 6 && y === 0) || (x === 7 && y === 1)) return [7, 0];
    if ((x === 6 && y === 7) || (x === 7 && y === 6)) return [7, 7];
    return null;
  }

  /**
   * Generates a hash key for the board state
   *
   * Used for transposition table lookup.
   * Format: string of 64 characters (E/B/W) + player turn
   *
   * @param board - Board to hash
   * @returns Unique string key for this position
   * @private
   */
  private getBoardHash(board: Board): string {
    let hash = '';
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const tile = board.tiles[y]?.[x] ?? E;
        hash += tile;
      }
    }
    return hash + board.playerTurn;
  }

  /**
   * Minimax with transposition table lookup
   *
   * Enhanced minimax that:
   * 1. Checks transposition table before searching
   * 2. Stores results after searching
   * 3. Uses move ordering for better pruning
   *
   * @param board - Current board state
   * @param depth - Remaining search depth
   * @param alpha - Alpha bound for pruning
   * @param beta - Beta bound for pruning
   * @param isMaximizing - Whether current player is maximizing
   * @returns Evaluated score for this position
   * @private
   */
  private minimaxWithTT(
    board: Board,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean
  ): number {
    this.nodesSearched++;
    const hash = this.getBoardHash(board);

    // Check transposition table
    const ttEntry = this.transpositionTable.get(hash);
    if (ttEntry && ttEntry.depth >= depth) {
      if (ttEntry.flag === 'exact') {
        return ttEntry.score;
      } else if (ttEntry.flag === 'lower') {
        alpha = Math.max(alpha, ttEntry.score);
      } else if (ttEntry.flag === 'upper') {
        beta = Math.min(beta, ttEntry.score);
      }
      if (alpha >= beta) {
        return ttEntry.score;
      }
    }

    const validMoves = getValidMoves(board);

    // Terminal conditions
    if (depth === 0 || validMoves.length === 0) {
      const evaluation = this.evaluatePosition(board);
      return evaluation;
    }

    // Order moves for better pruning
    const orderedMoves = this.orderMoves(validMoves, board);

    const originalAlpha = alpha;
    let bestScore: number;
    let bestMove: Coordinate | undefined;

    if (isMaximizing) {
      bestScore = -Infinity;

      for (const move of orderedMoves) {
        const clonedBoard = this.cloneBoard(board);
        this.simulateMove(clonedBoard, move);

        const evaluation = this.minimaxWithTT(clonedBoard, depth - 1, alpha, beta, false);

        if (evaluation > bestScore) {
          bestScore = evaluation;
          bestMove = move;
        }
        alpha = Math.max(alpha, evaluation);

        if (beta <= alpha) {
          break; // Beta cutoff
        }
      }
    } else {
      bestScore = Infinity;

      for (const move of orderedMoves) {
        const clonedBoard = this.cloneBoard(board);
        this.simulateMove(clonedBoard, move);

        const evaluation = this.minimaxWithTT(clonedBoard, depth - 1, alpha, beta, true);

        if (evaluation < bestScore) {
          bestScore = evaluation;
          bestMove = move;
        }
        beta = Math.min(beta, evaluation);

        if (beta <= alpha) {
          break; // Alpha cutoff
        }
      }
    }

    // Store in transposition table (with size limit)
    if (this.transpositionTable.size < MAX_TT_SIZE) {
      let flag: 'exact' | 'lower' | 'upper';
      if (bestScore <= originalAlpha) {
        flag = 'upper';
      } else if (bestScore >= beta) {
        flag = 'lower';
      } else {
        flag = 'exact';
      }

      this.transpositionTable.set(hash, {
        depth,
        score: bestScore,
        flag,
        bestMove,
      });
    }

    return bestScore;
  }

  /**
   * Evaluates board position using only disc count
   *
   * Simple heuristic for greedy algorithm:
   * Returns positive if bot is winning, negative if losing.
   *
   * @param board - Board to evaluate
   * @returns Score difference from bot's perspective
   * @private
   */
  private evaluateScore(board: Board): number {
    const scores = score(board);
    return this.player === 'B' ? scores.black - scores.white : scores.white - scores.black;
  }

  /**
   * Evaluates board position using multiple heuristics
   *
   * Comprehensive evaluation for minimax algorithm combining:
   * 1. **Position Value**: Strategic importance of occupied squares
   *    - Corners: +100 (most valuable)
   *    - C-squares: -50 (dangerous, lead to losing corners)
   *    - Edges: +10 (stable)
   *    - Interior: -1 to +5 (less important)
   *
   * 2. **Mobility**: Number of available moves (×5 weight)
   *    - More moves = better position
   *    - Restricting opponent is valuable
   *
   * 3. **Disc Count**: Simple disc difference
   *    - Secondary consideration (can mislead early game)
   *
   * @param board - Board to evaluate
   * @returns Weighted score from bot's perspective
   * @private
   */
  private evaluatePosition(board: Board): number {
    const scores = score(board);
    const validMoves = getValidMoves(board);

    // Switch player to check opponent mobility
    const originalPlayer = board.playerTurn;
    board.playerTurn = board.playerTurn === 'B' ? 'W' : 'B';
    const opponentMoves = getValidMoves(board);
    board.playerTurn = originalPlayer;

    // Position value based on strategic importance
    let positionValue = 0;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const row = board.tiles[y];
        const tile = row ? row[x] : undefined;
        const weightRow = POSITION_WEIGHTS[y];
        const weight = weightRow ? weightRow[x] : 0;

        if (tile === this.player) {
          positionValue += weight ?? 0;
        } else if (tile !== E && tile !== undefined) {
          positionValue -= weight ?? 0;
        }
      }
    }

    // Mobility value (more moves is better)
    const mobilityValue =
      board.playerTurn === this.player
        ? (validMoves.length - opponentMoves.length) * 5
        : (opponentMoves.length - validMoves.length) * 5;

    // Disc count value
    const discValue =
      this.player === 'B' ? scores.black - scores.white : scores.white - scores.black;

    // Weighted combination of all factors
    return positionValue + mobilityValue + discValue;
  }

  /**
   * Creates a deep copy of the board
   *
   * Necessary for lookahead search to avoid mutating the actual game state.
   * Copies both the tile array and the playerTurn property.
   *
   * @param board - Board to clone
   * @returns New board with copied state
   * @private
   */
  private cloneBoard(board: Board): Board {
    return {
      tiles: board.tiles.map((row) => [...row]),
      playerTurn: board.playerTurn,
    };
  }

  /**
   * Simulates a move on the board (mutates the board in place)
   *
   * Efficient move simulation for lookahead search.
   * Does NOT validate the move - assumes it's valid.
   *
   * Steps:
   * 1. Place piece at coordinate
   * 2. Check all 8 directions for opponent pieces to flip
   * 3. Flip captured pieces
   * 4. Switch to opponent's turn
   *
   * @param board - Board to modify (mutated in place)
   * @param coord - [x, y] coordinate for the move
   * @private
   *
   * Note: This is a simplified, optimized version used only for
   * AI lookahead. Does not emit events or update history.
   */
  private simulateMove(board: Board, coord: Coordinate): void {
    const [x, y] = coord;
    const row = board.tiles[y];
    if (!row) return;

    row[x] = board.playerTurn;

    // Flip pieces in all 8 directions
    const directions = [
      [-1, -1],
      [0, -1],
      [1, -1],
      [-1, 0],
      [1, 0],
      [-1, 1],
      [0, 1],
      [1, 1],
    ];

    const currentPlayer = board.playerTurn;
    const opponent = currentPlayer === 'B' ? 'W' : 'B';

    for (const [dx, dy] of directions) {
      if (dx === undefined || dy === undefined) continue;
      const toFlip: Coordinate[] = [];
      let nx = x + dx;
      let ny = y + dy;

      // Collect opponent pieces in this direction
      while (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
        const targetRow = board.tiles[ny];
        const targetTile = targetRow ? targetRow[nx] : undefined;

        if (targetTile !== opponent) break;

        toFlip.push([nx, ny]);
        nx += dx;
        ny += dy;
      }

      // If we end on our own piece, flip all collected pieces
      if (nx >= 0 && nx < 8 && ny >= 0 && ny < 8) {
        const endRow = board.tiles[ny];
        const endTile = endRow ? endRow[nx] : undefined;

        if (endTile === currentPlayer && toFlip.length > 0) {
          for (const [fx, fy] of toFlip) {
            const flipRow = board.tiles[fy];
            if (flipRow) {
              flipRow[fx] = currentPlayer;
            }
          }
        }
      }
    }

    // Switch player
    board.playerTurn = opponent;
  }
}
