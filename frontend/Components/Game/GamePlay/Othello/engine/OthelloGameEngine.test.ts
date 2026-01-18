import { describe, test, expect } from 'bun:test';
import { OthelloGameEngine } from './OthelloGameEngine';

describe('OthelloGameEngine', () => {
  test('initializes with correct starting state', () => {
    const engine = new OthelloGameEngine();
    const state = engine.getState();

    expect(state.currentPlayer).toBe('B');
    expect(state.score.black).toBe(2);
    expect(state.score.white).toBe(2);
    expect(state.isGameOver).toBe(false);
    expect(state.moveHistory).toHaveLength(0);
  });

  test('initializes with player IDs', () => {
    const engine = new OthelloGameEngine('player1', 'player2');
    const state = engine.getState();

    expect(state.blackPlayerId).toBe('player1');
    expect(state.whitePlayerId).toBe('player2');
  });

  test('makeMove() successfully makes a valid move', () => {
    const engine = new OthelloGameEngine();
    const result = engine.makeMove([3, 2]);

    expect(result).toBe(true);

    const state = engine.getState();
    expect(state.currentPlayer).toBe('W'); // Turn should switch
    expect(state.moveHistory).toHaveLength(1);
    expect(state.moveHistory[0]!.player).toBe('B');
    expect(state.moveHistory[0]!.coordinate).toEqual([3, 2]);
  });

  test('makeMove() rejects invalid move', () => {
    const engine = new OthelloGameEngine();
    const result = engine.makeMove([0, 0]); // Invalid move

    expect(result).toBe(false);
    expect(engine.getState().moveHistory).toHaveLength(0);
  });

  test('emits move event on successful move', (done) => {
    const engine = new OthelloGameEngine();

    engine.on('move', (event) => {
      const moveData = event.data as { move: any; state: any };
      expect(moveData.move.player).toBe('B');
      expect(moveData.move.coordinate).toEqual([3, 2]);
      done();
    });

    engine.makeMove([3, 2]);
  });

  test('emits invalidMove event on invalid move', (done) => {
    const engine = new OthelloGameEngine();

    engine.on('invalidMove', (event) => {
      const invalidMoveData = event.data as { coordinate: any; error: string };
      expect(invalidMoveData.coordinate).toEqual([0, 0]);
      expect(invalidMoveData.error).toBeDefined();
      done();
    });

    engine.makeMove([0, 0]);
  });

  test('emits stateChange event', (done) => {
    const engine = new OthelloGameEngine();

    engine.on('stateChange', (event) => {
      const stateChangeData = event.data as { state: any; action?: string };
      expect(stateChangeData.state).toBeDefined();
      expect(stateChangeData.state.currentPlayer).toBe('W');
      done();
    });

    engine.makeMove([3, 2]);
  });

  test('getValidMoves() returns correct moves', () => {
    const engine = new OthelloGameEngine();
    const validMoves = engine.getValidMoves();

    expect(validMoves.length).toBeGreaterThan(0);
    expect(validMoves).toContainEqual([3, 2]);
    expect(validMoves).toContainEqual([2, 3]);
  });

  test('reset() resets the game to initial state', () => {
    const engine = new OthelloGameEngine();

    // Make some moves
    engine.makeMove([3, 2]);
    engine.makeMove([2, 2]);

    expect(engine.getState().moveHistory.length).toBeGreaterThan(0);

    // Reset
    engine.reset();

    const state = engine.getState();
    expect(state.currentPlayer).toBe('B');
    expect(state.score.black).toBe(2);
    expect(state.score.white).toBe(2);
    expect(state.moveHistory).toHaveLength(0);
  });

  test('exportState() and importState() work correctly', () => {
    const engine1 = new OthelloGameEngine('player1', 'player2');

    // Make some moves
    engine1.makeMove([3, 2]);
    engine1.makeMove([2, 2]);

    // Export state
    const exportedState = engine1.exportState();

    // Create new engine and import state
    const engine2 = new OthelloGameEngine();
    engine2.importState(exportedState);

    // Verify states match
    const state1 = engine1.getState();
    const state2 = engine2.getState();

    expect(state2.currentPlayer).toBe(state1.currentPlayer);
    expect(state2.score).toEqual(state1.score);
    expect(state2.moveHistory.length).toBe(state1.moveHistory.length);
    expect(state2.blackPlayerId).toBe('player1');
    expect(state2.whitePlayerId).toBe('player2');
  });

  test('tracks move timestamps', () => {
    const engine = new OthelloGameEngine();
    const before = Date.now();

    engine.makeMove([3, 2]);

    const after = Date.now();
    const move = engine.getMoveHistory()[0]!;

    expect(move.timestamp).toBeGreaterThanOrEqual(before);
    expect(move.timestamp).toBeLessThanOrEqual(after);
  });

  test('records score after each move', () => {
    const engine = new OthelloGameEngine();

    engine.makeMove([3, 2]);

    const move = engine.getMoveHistory()[0]!;
    expect(move.scoreAfter).toBeDefined();
    expect(move.scoreAfter.black).toBeGreaterThan(0);
    expect(move.scoreAfter.white).toBeGreaterThan(0);
  });

  test('getPlayerId() returns correct player IDs', () => {
    const engine = new OthelloGameEngine('blackPlayer123', 'whitePlayer456');

    expect(engine.getPlayerId('B')).toBe('blackPlayer123');
    expect(engine.getPlayerId('W')).toBe('whitePlayer456');
  });

  test('event listeners can be removed with off()', () => {
    const engine = new OthelloGameEngine();
    let callCount = 0;

    const listener = () => {
      callCount++;
    };

    engine.on('move', listener);
    engine.makeMove([3, 2]);
    expect(callCount).toBe(1);

    engine.off('move', listener);
    engine.makeMove([2, 2]);
    expect(callCount).toBe(1); // Should not increment
  });

  test('game correctly identifies when it is over', () => {
    // Create a completely filled board
    const fullBoard = [
      ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'],
      ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'],
      ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'],
      ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'],
      ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'],
      ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'],
      ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'],
      ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],
    ];

    const gameOverEngine = new OthelloGameEngine(undefined, undefined, fullBoard as any);

    expect(gameOverEngine.isGameOver()).toBe(true);
    expect(gameOverEngine.getWinner()).toBe('B');
  });
});

describe('Undo/Redo Functionality', () => {
  test('canUndo() returns false initially', () => {
    const engine = new OthelloGameEngine();

    expect(engine.canUndo()).toBe(false);
  });

  test('canRedo() returns false initially', () => {
    const engine = new OthelloGameEngine();

    expect(engine.canRedo()).toBe(false);
  });

  test('canUndo() returns true after making a move', () => {
    const engine = new OthelloGameEngine();

    engine.makeMove([3, 2]);

    expect(engine.canUndo()).toBe(true);
  });

  test('undo() returns false when nothing to undo', () => {
    const engine = new OthelloGameEngine();

    const result = engine.undo();

    expect(result).toBe(false);
  });

  test('undo() successfully undoes a move', () => {
    const engine = new OthelloGameEngine();

    // Record initial state
    const initialState = engine.getState();
    const initialScore = initialState.score;
    const initialPlayer = initialState.currentPlayer;

    // Make a move
    engine.makeMove([3, 2]);

    const afterMoveState = engine.getState();
    expect(afterMoveState.currentPlayer).toBe('W');
    expect(afterMoveState.moveHistory).toHaveLength(1);

    // Undo the move
    const undoResult = engine.undo();

    expect(undoResult).toBe(true);

    // State should be back to initial
    const afterUndoState = engine.getState();
    expect(afterUndoState.currentPlayer).toBe(initialPlayer);
    expect(afterUndoState.score).toEqual(initialScore);
    expect(afterUndoState.moveHistory).toHaveLength(0);
  });

  test('canRedo() returns true after undo', () => {
    const engine = new OthelloGameEngine();

    engine.makeMove([3, 2]);
    engine.undo();

    expect(engine.canRedo()).toBe(true);
  });

  test('redo() returns false when nothing to redo', () => {
    const engine = new OthelloGameEngine();

    const result = engine.redo();

    expect(result).toBe(false);
  });

  test('redo() successfully redoes an undone move', () => {
    const engine = new OthelloGameEngine();

    // Make a move
    engine.makeMove([3, 2]);
    const afterMoveState = engine.getState();
    const afterMovePlayer = afterMoveState.currentPlayer;

    // Undo it
    engine.undo();

    // Redo it
    const redoResult = engine.redo();

    expect(redoResult).toBe(true);

    // Should be back to after-move state
    const afterRedoState = engine.getState();
    expect(afterRedoState.currentPlayer).toBe(afterMovePlayer);
  });

  test('undo/redo works for multiple moves', () => {
    const engine = new OthelloGameEngine();

    // Make multiple valid moves
    engine.makeMove([3, 2]); // Black
    engine.makeMove([2, 2]); // White

    expect(engine.getState().moveHistory).toHaveLength(2);

    // Undo all moves
    engine.undo(); // Undo White's move
    expect(engine.getState().moveHistory).toHaveLength(1);
    expect(engine.getState().currentPlayer).toBe('W');

    engine.undo(); // Undo Black's move
    expect(engine.getState().moveHistory).toHaveLength(0);
    expect(engine.getState().currentPlayer).toBe('B');

    // Redo all moves
    engine.redo();
    expect(engine.getState().moveHistory).toHaveLength(1);
    expect(engine.getState().currentPlayer).toBe('W');

    engine.redo();
    expect(engine.getState().moveHistory).toHaveLength(2);
    expect(engine.getState().currentPlayer).toBe('B');
  });

  test('making a new move clears redo stack', () => {
    const engine = new OthelloGameEngine();

    // Make moves
    engine.makeMove([3, 2]);
    engine.makeMove([2, 2]);

    // Undo one
    engine.undo();
    expect(engine.canRedo()).toBe(true);

    // Make a new move
    engine.makeMove([2, 4]);

    // Redo should no longer be available
    expect(engine.canRedo()).toBe(false);
  });

  test('reset() clears undo/redo stacks', () => {
    const engine = new OthelloGameEngine();

    // Make moves
    engine.makeMove([3, 2]);
    engine.makeMove([2, 2]);

    // Undo one
    engine.undo();

    expect(engine.canUndo()).toBe(true);
    expect(engine.canRedo()).toBe(true);

    // Reset
    engine.reset();

    // Both stacks should be empty
    expect(engine.canUndo()).toBe(false);
    expect(engine.canRedo()).toBe(false);
  });

  test('undo emits stateChange event', (done) => {
    const engine = new OthelloGameEngine();

    engine.makeMove([3, 2]);

    engine.on('stateChange', (event) => {
      const stateChangeData = event.data as { state: any; action?: string };
      expect(event.type).toBe('stateChange');
      expect(stateChangeData.action).toBe('undo');
      done();
    });

    engine.undo();
  });

  test('redo emits stateChange event', (done) => {
    const engine = new OthelloGameEngine();

    engine.makeMove([3, 2]);
    engine.undo();

    engine.on('stateChange', (event) => {
      const stateChangeData = event.data as { state: any; action?: string };
      expect(event.type).toBe('stateChange');
      expect(stateChangeData.action).toBe('redo');
      done();
    });

    engine.redo();
  });

  test('invalid move does not add to undo stack', () => {
    const engine = new OthelloGameEngine();

    // Try invalid move
    const result = engine.makeMove([0, 0]);

    expect(result).toBe(false);
    expect(engine.canUndo()).toBe(false);
  });
});
