import {
  Board,
  Coordinate,
  TileValue,
  Score,
  createBoard,
  takeTurn,
  getValidMoves,
  isGameOver,
  getWinner,
  score,
  getAnnotatedBoard,
  B,
  W,
  E,
} from './index';
import { TimeControlManager, TimeControlConfig, PlayerTime } from './TimeControlManager';

/**
 * Position weights for board evaluation (same as OthelloBot)
 * Corners: +100 (most valuable)
 * X-squares (diagonal to corners): -50 (dangerous)
 * C-squares (adjacent to corners): -10 (risky)
 * Edges: +10 (stable)
 * Interior: -1 to +5 (less important)
 */
const POSITION_WEIGHTS: number[][] = [
  [100, -10, 10, 5, 5, 10, -10, 100],
  [-10, -50, -1, -1, -1, -1, -50, -10],
  [10, -1, 5, 1, 1, 5, -1, 10],
  [5, -1, 1, 0, 0, 1, -1, 5],
  [5, -1, 1, 0, 0, 1, -1, 5],
  [10, -1, 5, 1, 1, 5, -1, 10],
  [-10, -50, -1, -1, -1, -1, -50, -10],
  [100, -10, 10, 5, 5, 10, -10, 100],
];

/**
 * Represents a single move in the game
 */
export interface Move {
  player: 'W' | 'B';
  coordinate: Coordinate;
  timestamp: number;
  scoreAfter: Score;
}

/**
 * Represents the current state of the game
 */
export interface GameState {
  board: Board;
  score: Score;
  validMoves: Coordinate[];
  isGameOver: boolean;
  winner: 'W' | 'B' | null;
  moveHistory: Move[];
  currentPlayer: 'W' | 'B';
  blackPlayerId?: string;
  whitePlayerId?: string;
}

/**
 * Event types that the engine can emit
 */
export type Player = 'W' | 'B';

export type GameEventType = 'move' | 'gameOver' | 'invalidMove' | 'stateChange';

export interface MoveEventData {
  move: Move;
  state: GameState;
}

export interface GameOverEventData {
  winner: Player | null;
  state: GameState;
}

export interface InvalidMoveEventData {
  coordinate: Coordinate;
  error: string;
}

export interface StateChangeEventData {
  state: GameState;
  action?: 'undo' | 'redo';
}

export type GameEventData =
  | MoveEventData
  | GameOverEventData
  | InvalidMoveEventData
  | StateChangeEventData;

export interface GameEvent {
  type: GameEventType;
  data: GameEventData;
}

type EventListener = (event: GameEvent) => void;

/**
 * OthelloGameEngine - A framework-agnostic game engine for Othello
 *
 * This class manages the complete game state, handles move validation,
 * tracks history, and provides an event-based API for UI integration.
 *
 * Usage:
 * ```typescript
 * const engine = new OthelloGameEngine();
 * engine.on('stateChange', (event) => {
 *   // Update your UI based on event.data.state
 * });
 * engine.makeMove([3, 2]);
 * ```
 */
/**
 * Snapshot of the game state for undo/redo functionality
 */
interface GameSnapshot {
  board: BoardSnapshot;
  moveHistory: Move[];
  timeControlState?: string; // JSON string from TimeControlManager.exportState()
}

/**
 * Snapshot of the board state
 */
interface BoardSnapshot {
  tiles: TileValue[][];
  playerTurn: 'W' | 'B';
}

/**
 * OthelloGameEngine - A framework-agnostic game engine for Othello/Reversi
 *
 * This class provides a complete implementation of Othello game logic with:
 * - Move validation and execution
 * - Game state management
 * - Move history tracking
 * - Undo/Redo functionality
 * - Event-driven architecture for UI integration
 * - Player management
 * - Game serialization/deserialization
 *
 * @example
 * ```typescript
 * const engine = new OthelloGameEngine('player1', 'player2');
 *
 * // Listen for game events
 * engine.on('move', (event) => {
 *   console.log('Move made:', event.data.move);
 * });
 *
 * // Make a move
 * const success = engine.makeMove([3, 2]);
 * ```
 */
export class OthelloGameEngine {
  private board: Board;
  private moveHistory: Move[] = [];
  private listeners: Map<GameEventType, EventListener[]> = new Map();
  private blackPlayerId?: string;
  private whitePlayerId?: string;
  private timeControl?: TimeControlManager;
  private timeControlConfig?: TimeControlConfig;

  // Undo/Redo stacks
  private undoStack: GameSnapshot[] = [];
  private redoStack: GameSnapshot[] = [];

  /**
   * Creates a new Othello game engine
   * @param blackPlayerId - Optional ID for the black player
   * @param whitePlayerId - Optional ID for the white player
   * @param initialBoard - Optional initial board state (for loading saved games)
   * @param timeControlConfig - Optional time control configuration
   */
  constructor(
    blackPlayerId?: string,
    whitePlayerId?: string,
    initialBoard?: TileValue[][],
    timeControlConfig?: TimeControlConfig
  ) {
    this.blackPlayerId = blackPlayerId;
    this.whitePlayerId = whitePlayerId;

    // Store time control config for reset
    this.timeControlConfig = timeControlConfig;

    // Initialize time control if configured
    if (timeControlConfig) {
      this.timeControl = new TimeControlManager(timeControlConfig);
    }

    // Initialize with standard Othello starting position
    const startingBoard = initialBoard || [
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, W, B, E, E, E],
      [E, E, E, B, W, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
    ];

    this.board = createBoard(startingBoard);

    // Start black's clock if time control is enabled
    if (this.timeControl) {
      this.timeControl.startClock('B');
    }
  }

  /**
   * Create a deep clone of the board for snapshot
   */
  private cloneBoard(board: Board): BoardSnapshot {
    return {
      tiles: board.tiles.map((row) => [...row]),
      playerTurn: board.playerTurn,
    };
  }

  /**
   * Create a snapshot of the entire game state
   */
  private createSnapshot(): GameSnapshot {
    return {
      board: this.cloneBoard(this.board),
      moveHistory: [...this.moveHistory],
      timeControlState: this.timeControl ? this.timeControl.exportState() : undefined,
    };
  }

  /**
   * Restore game state from a snapshot
   */
  private restoreSnapshot(snapshot: GameSnapshot): void {
    this.board.tiles = snapshot.board.tiles.map((row) => [...row]);
    this.board.playerTurn = snapshot.board.playerTurn;
    this.moveHistory = [...snapshot.moveHistory];

    // Restore time control state if available
    if (this.timeControl && snapshot.timeControlState) {
      this.timeControl.importState(snapshot.timeControlState);
    }
  }

  /**
   * Subscribe to game events
   * @param eventType - The type of event to listen for
   * @param listener - Callback function to handle the event
   */
  public on(eventType: GameEventType, listener: EventListener): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    // Avoid non-null assertion by ensuring the array exists and then pushing
    let list = this.listeners.get(eventType);
    if (!list) {
      list = [];
      this.listeners.set(eventType, list);
    }
    list.push(listener);
  }

  /**
   * Unsubscribe from game events
   * @param eventType - The type of event to stop listening for
   * @param listener - The callback function to remove
   */
  public off(eventType: GameEventType, listener: EventListener): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit an event to all registered listeners
   */
  private emit(eventType: GameEventType, data: GameEventData): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.forEach((listener) => listener({ type: eventType, data }));
    }
  }

  /**
   * Make a move on the board
   * @param coordinate - The [x, y] coordinate to place a piece
   * @returns true if the move was successful, false otherwise
   */
  public makeMove(coordinate: Coordinate): boolean {
    try {
      const currentPlayer = this.board.playerTurn;

      // Check for timeout if time control is enabled
      if (this.timeControl) {
        if (this.timeControl.isTimeOut(currentPlayer)) {
          this.emit('invalidMove', {
            coordinate,
            error: `${currentPlayer === 'B' ? 'Black' : 'White'} ran out of time!`,
          });

          // Emit game over due to timeout
          const winner = currentPlayer === 'B' ? W : B;
          this.emit('gameOver', { winner, state: this.getState() });
          return false;
        }
      }

      // Save current state to undo stack BEFORE making the move
      this.undoStack.push(this.createSnapshot());

      // Clear redo stack when a new move is made
      this.redoStack = [];

      // Attempt the move
      takeTurn(this.board, coordinate);

      // Stop clock for current player and add increment
      if (this.timeControl) {
        this.timeControl.stopClock();
      }

      // Record the move in history
      const move: Move = {
        player: currentPlayer,
        coordinate,
        timestamp: Date.now(),
        scoreAfter: score(this.board),
      };
      this.moveHistory.push(move);

      // Start clock for next player
      if (this.timeControl) {
        const nextPlayer = this.board.playerTurn;
        this.timeControl.startClock(nextPlayer);
      }

      // Emit events
      this.emit('move', { move, state: this.getState() });
      this.emit('stateChange', { state: this.getState() });

      // Check if game is over
      if (isGameOver(this.board)) {
        const winner = getWinner(this.board);

        // Stop time control when game ends
        if (this.timeControl) {
          this.timeControl.stopClock();
        }

        this.emit('gameOver', { winner, state: this.getState() });
      }

      return true;
    } catch (error) {
      // Remove the snapshot we just added since move failed
      this.undoStack.pop();
      this.emit('invalidMove', { coordinate, error: (error as Error).message });
      return false;
    }
  }

  /**
   * Undo the last move
   * @returns true if undo was successful, false if nothing to undo
   */
  public undo(): boolean {
    if (this.undoStack.length === 0) {
      return false;
    }

    // Pause time control during undo
    if (this.timeControl) {
      this.timeControl.pause();
    }

    // Save current state to redo stack
    this.redoStack.push(this.createSnapshot());

    // Restore previous state
    const previousState = this.undoStack.pop();
    if (previousState) {
      this.restoreSnapshot(previousState);
    }

    // Resume time control for current player
    if (this.timeControl && !isGameOver(this.board)) {
      this.timeControl.resume();
    }

    // Emit state change event
    this.emit('stateChange', { state: this.getState(), action: 'undo' });

    return true;
  }

  /**
   * Redo a previously undone move
   * @returns true if redo was successful, false if nothing to redo
   */
  public redo(): boolean {
    if (this.redoStack.length === 0) {
      return false;
    }

    // Pause time control during redo
    if (this.timeControl) {
      this.timeControl.pause();
    }

    // Save current state to undo stack
    this.undoStack.push(this.createSnapshot());

    // Restore redo state
    const redoState = this.redoStack.pop();
    if (redoState) {
      this.restoreSnapshot(redoState);
    }

    // Resume time control for current player
    if (this.timeControl && !isGameOver(this.board)) {
      this.timeControl.resume();
    }

    // Emit state change event
    this.emit('stateChange', { state: this.getState(), action: 'redo' });

    return true;
  }

  /**
   * Check if undo is available
   * @returns true if there are moves to undo
   */
  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /**
   * Check if redo is available
   * @returns true if there are moves to redo
   */
  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * Get the current game state
   * @returns Complete game state including board, score, history, etc.
   */
  public getState(): GameState {
    return {
      board: this.board,
      score: score(this.board),
      validMoves: getValidMoves(this.board),
      isGameOver: isGameOver(this.board),
      winner: isGameOver(this.board) ? getWinner(this.board) : null,
      moveHistory: [...this.moveHistory],
      currentPlayer: this.board.playerTurn,
      blackPlayerId: this.blackPlayerId,
      whitePlayerId: this.whitePlayerId,
    };
  }

  /**
   * Get the board with valid moves annotated
   * @returns Board with 'P' markers showing valid moves
   */
  public getAnnotatedBoard(): Board {
    return getAnnotatedBoard(this.board);
  }

  /**
   * Get the move history
   * @returns Array of all moves made in the game
   */
  public getMoveHistory(): Move[] {
    return [...this.moveHistory];
  }

  /**
   * Get the current score
   * @returns Current score for both players
   */
  public getScore(): Score {
    return score(this.board);
  }

  /**
   * Get all valid moves for the current player
   * @returns Array of valid coordinates
   */
  public getValidMoves(): Coordinate[] {
    return getValidMoves(this.board);
  }

  /**
   * Check if the game is over
   * @returns true if the game has ended
   */
  public isGameOver(): boolean {
    return isGameOver(this.board);
  }

  /**
   * Get the winner (only valid if game is over)
   * @returns 'W', 'B', or null for a tie
   */
  public getWinner(): 'W' | 'B' | null {
    return isGameOver(this.board) ? getWinner(this.board) : null;
  }

  /**
   * Evaluate the current board position for the Egaroucid-style graph
   * Returns a value from -64 to +64 representing disc advantage
   * Positive = Black advantage, Negative = White advantage
   *
   * Uses a weighted evaluation combining:
   * - Position value (corner control, edge stability)
   * - Mobility (available moves)
   * - Disc count
   *
   * @returns Evaluation score normalized to approximate disc difference
   */
  public evaluatePosition(): number {
    const currentScore = score(this.board);
    const validMoves = getValidMoves(this.board);

    // Switch player temporarily to check opponent mobility
    const originalPlayer = this.board.playerTurn;
    this.board.playerTurn = this.board.playerTurn === 'B' ? 'W' : 'B';
    const opponentMoves = getValidMoves(this.board);
    this.board.playerTurn = originalPlayer;

    // Position value based on strategic importance (from Black's perspective)
    let positionValue = 0;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const row = this.board.tiles[y];
        const tile = row ? row[x] : undefined;
        const weightRow = POSITION_WEIGHTS[y];
        const weight = weightRow ? weightRow[x] : 0;

        if (tile === B) {
          positionValue += weight ?? 0;
        } else if (tile === W) {
          positionValue -= weight ?? 0;
        }
      }
    }

    // Mobility value (more moves = better)
    const myMoves = this.board.playerTurn === 'B' ? validMoves.length : opponentMoves.length;
    const theirMoves = this.board.playerTurn === 'B' ? opponentMoves.length : validMoves.length;
    const mobilityValue = (myMoves - theirMoves) * 3;

    // Simple disc difference
    const discDiff = currentScore.black - currentScore.white;

    // Combine: position is most important early, disc count matters more late game
    const totalPieces = currentScore.black + currentScore.white;
    const isEndgame = totalPieces > 50;

    if (isEndgame) {
      // In endgame, actual disc count matters more
      return Math.max(-64, Math.min(64, discDiff * 2));
    }

    // Normalize to -64 to +64 range
    // Position weight ranges from about -800 to +800, scale it down
    const normalizedEval = positionValue / 10 + mobilityValue + discDiff * 0.5;
    return Math.max(-64, Math.min(64, Math.round(normalizedEval)));
  }

  /**
   * Get remaining time for both players
   * @returns Object with black and white time remaining, or null if time control is disabled
   */
  public getTimeRemaining(): PlayerTime | null {
    return this.timeControl ? this.timeControl.getTimeRemaining() : null;
  }

  /**
   * Pause the time control
   * Useful for game pauses or when switching away from the game
   */
  public pauseTime(): void {
    if (this.timeControl) {
      this.timeControl.pause();
    }
  }

  /**
   * Resume the time control after pausing
   */
  public resumeTime(): void {
    if (this.timeControl && !isGameOver(this.board)) {
      this.timeControl.resume();
    }
  }

  /**
   * Check if time control is enabled for this game
   * @returns true if time control is active
   */
  public hasTimeControl(): boolean {
    return !!this.timeControl;
  }

  /**
   * Restore time state (for page refresh recovery)
   * @param blackTime - Time remaining for black in milliseconds
   * @param whiteTime - Time remaining for white in milliseconds
   * @param currentPlayer - Current player whose clock should be running
   */
  public restoreTimeState(blackTime: number, whiteTime: number, currentPlayer: 'B' | 'W'): void {
    if (!this.timeControl) return;

    this.timeControl.setTimeRemaining('B', blackTime);
    this.timeControl.setTimeRemaining('W', whiteTime);
    this.timeControl.startClock(currentPlayer);
  }

  /**
   * Reset the game to its initial state
   */
  public reset(): void {
    const startingBoard = [
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, W, B, E, E, E],
      [E, E, E, B, W, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
    ];

    this.board = createBoard(startingBoard);
    this.moveHistory = [];

    // Clear undo/redo stacks
    this.undoStack = [];
    this.redoStack = [];

    // Reset time control if enabled
    if (this.timeControlConfig) {
      this.timeControl = new TimeControlManager(this.timeControlConfig);
      this.timeControl.startClock('B'); // Start black's clock
    }

    this.emit('stateChange', { state: this.getState() });
  }

  /**
   * Get the player ID for a given color
   * @param color - 'W' or 'B'
   * @returns The player ID, or undefined if not set
   */
  public getPlayerId(color: 'W' | 'B'): string | undefined {
    return color === 'B' ? this.blackPlayerId : this.whitePlayerId;
  }

  /**
   * Export the game state as JSON (for saving/loading)
   * @returns JSON string of the complete game state
   */
  public exportState(): string {
    return JSON.stringify({
      board: this.board,
      moveHistory: this.moveHistory,
      blackPlayerId: this.blackPlayerId,
      whitePlayerId: this.whitePlayerId,
    });
  }

  /**
   * Import a saved game state
   * @param stateJson - JSON string from exportState()
   */
  public importState(stateJson: string): void {
    const state = JSON.parse(stateJson);
    this.board = state.board;
    this.moveHistory = state.moveHistory;
    this.blackPlayerId = state.blackPlayerId;
    this.whitePlayerId = state.whitePlayerId;

    this.emit('stateChange', { state: this.getState() });
  }
}
