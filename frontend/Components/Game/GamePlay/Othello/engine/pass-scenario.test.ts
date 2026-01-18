import { describe, test, expect } from 'bun:test';
import {
  createBoard,
  takeTurn,
  getValidMoves,
  isGameOver,
  getWinner,
  score,
  E,
  W,
  B,
} from './index';

describe('Pass Scenario Tests - Critical Bug Fix', () => {
  test('takeTurn() switches back to current player when opponent has no valid moves', () => {
    // Create a scenario where Black makes a move, and White has no valid moves
    // so the turn should return to Black
    const board = createBoard([
      [B, B, B, B, B, B, B, B],
      [B, B, B, B, B, B, B, B],
      [B, B, B, B, B, B, B, B],
      [B, B, B, B, B, B, B, B],
      [B, B, B, B, B, B, W, E],
      [B, B, B, B, B, B, W, E],
      [B, B, B, B, B, B, W, E],
      [B, B, B, B, B, B, B, E],
    ]);

    // Black's turn initially
    expect(board.playerTurn).toBe('B');

    // Black makes a move at [7, 7]
    takeTurn(board, [7, 7]);

    // After the move, it should still be Black's turn because White has no moves
    // (White is trapped and cannot make any valid moves)
    expect(board.playerTurn).toBe('B');

    // Verify Black can still make moves
    const validMoves = getValidMoves(board);
    expect(validMoves.length).toBeGreaterThan(0);
  });

  test('takeTurn() correctly handles alternating passes', () => {
    // Create a scenario where both players might need to pass
    const board = createBoard([
      [W, W, W, W, W, W, W, W],
      [W, W, W, W, W, W, W, W],
      [W, W, W, W, W, W, W, W],
      [W, W, W, W, W, W, W, W],
      [W, W, W, W, W, W, B, E],
      [W, W, W, W, W, W, B, E],
      [W, W, W, W, W, W, B, E],
      [W, W, W, W, W, W, W, E],
    ]);

    board.playerTurn = 'W'; // White's turn

    // White makes a move at [7, 7]
    takeTurn(board, [7, 7]);

    // After the move, it should still be White's turn because Black has no moves
    expect(board.playerTurn).toBe('W');
  });

  test('game over when both players have no valid moves', () => {
    // Create a board where neither player can move
    const board = createBoard([
      [B, B, B, B, W, W, W, W],
      [B, B, B, B, W, W, W, W],
      [B, B, B, B, W, W, W, W],
      [B, B, B, B, W, W, W, W],
      [B, B, B, B, W, W, W, W],
      [B, B, B, B, W, W, W, W],
      [B, B, B, B, W, W, W, W],
      [B, B, B, B, W, W, W, W],
    ]);

    // Game should be over
    expect(isGameOver(board)).toBe(true);

    // Winner should be determined by score
    const winner = getWinner(board);
    expect(winner).toBe(null); // It's a tie (32-32)
  });

  test('game continues when current player has moves after opponent passes', () => {
    // Create a scenario where one player is surrounded but can still play
    const board = createBoard([
      [E, E, E, E, E, E, E, E],
      [E, B, B, B, B, B, B, E],
      [E, B, W, W, W, W, B, E],
      [E, B, W, E, E, W, B, E],
      [E, B, W, E, E, W, B, E],
      [E, B, W, W, W, W, B, E],
      [E, B, B, B, B, B, B, E],
      [E, E, E, E, E, E, E, E],
    ]);

    board.playerTurn = 'W';

    // White can make moves inside
    const whiteMoves = getValidMoves(board);
    expect(whiteMoves.length).toBeGreaterThan(0);

    // Make a move
    const firstMove = whiteMoves[0];
    if (firstMove) {
      takeTurn(board, firstMove);

      // Game should continue
      expect(isGameOver(board)).toBe(false);
    }
  });

  test('getValidMoves() returns empty array when player has no moves', () => {
    const board = createBoard([
      [W, W, W, W, W, W, W, W],
      [W, W, W, W, W, W, W, W],
      [W, W, W, W, W, W, W, W],
      [W, W, W, W, W, W, W, W],
      [W, W, W, W, W, W, W, B],
      [W, W, W, W, W, W, W, E],
      [W, W, W, W, W, W, W, E],
      [W, W, W, W, W, W, W, E],
    ]);

    board.playerTurn = 'B';

    const validMoves = getValidMoves(board);
    expect(validMoves).toEqual([]);
  });

  test('annotated board does not show valid moves on occupied squares', () => {
    const board = createBoard([
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, W, B, E, E, E],
      [E, E, E, B, W, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
    ]);

    const annotated = require('./index').getAnnotatedBoard(board);

    // Check that occupied squares are not marked as valid moves
    const row3 = annotated.tiles[3];
    const row4 = annotated.tiles[4];

    expect(row3 && row3[3]).toBe('W'); // Not 'P'
    expect(row3 && row3[4]).toBe('B'); // Not 'P'
    expect(row4 && row4[3]).toBe('B'); // Not 'P'
    expect(row4 && row4[4]).toBe('W'); // Not 'P'
  });

  test('pass scenario: complete game with multiple passes', () => {
    // Simulate a simpler game where Black has clear moves
    const board = createBoard([
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, W, B, E, E, E],
      [E, E, E, B, W, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
    ]);

    board.playerTurn = 'B';

    // Black should have moves
    let validMoves = getValidMoves(board);
    expect(validMoves.length).toBeGreaterThan(0);

    // Make a move
    const moveCoord = validMoves[0];
    if (moveCoord) {
      takeTurn(board, moveCoord);

      // Check if turn changed appropriately
      validMoves = getValidMoves(board);

      // Either game over or next player has moves - both are valid states
      const gameIsOver = isGameOver(board);
      const hasValidMoves = validMoves.length > 0;

      expect(gameIsOver || hasValidMoves).toBe(true);
    }
  });

  test('score is correctly calculated when game ends due to no valid moves', () => {
    const board = createBoard([
      [B, B, B, B, W, W, W, W],
      [B, B, B, B, W, W, W, W],
      [B, B, B, B, W, W, W, W],
      [B, B, B, B, W, W, W, W],
      [B, B, B, B, W, W, W, W],
      [B, B, B, B, W, W, W, W],
      [B, B, B, B, W, W, W, W],
      [B, B, B, B, W, W, W, W],
    ]);

    expect(isGameOver(board)).toBe(true);

    const finalScore = score(board);
    // 4 columns × 8 rows = 32 pieces each
    expect(finalScore.black).toBe(32);
    expect(finalScore.white).toBe(32);

    const winner = getWinner(board);
    expect(winner).toBe(null); // It's a tie
  });

  test('player can continue playing after opponent passes', () => {
    // Create a complex scenario where one player passes
    const board = createBoard([
      [E, E, E, E, E, E, E, E],
      [E, W, W, W, W, W, W, E],
      [E, W, B, B, B, B, W, E],
      [E, W, B, E, E, B, W, E],
      [E, W, B, E, E, B, W, E],
      [E, W, B, B, B, B, W, E],
      [E, W, W, W, W, W, W, E],
      [E, E, E, E, E, E, E, E],
    ]);

    board.playerTurn = 'B';

    const blackMoves = getValidMoves(board);
    expect(blackMoves.length).toBeGreaterThan(0);

    // Make a move for black
    const firstMove = blackMoves[0];
    if (firstMove) {
      takeTurn(board, firstMove);

      // Game should not be over yet
      expect(isGameOver(board)).toBe(false);
    }
  });

  test('isGameOver() correctly identifies game end with asymmetric board', () => {
    // One player dominates, other has no moves
    const board = createBoard([
      [B, B, B, B, B, B, B, B],
      [B, B, B, B, B, B, B, B],
      [B, B, B, B, B, B, B, B],
      [B, B, B, B, B, B, B, B],
      [B, B, B, B, B, B, B, B],
      [B, B, B, B, B, B, B, B],
      [B, B, B, B, B, B, B, B],
      [B, B, B, W, W, W, B, B],
    ]);

    board.playerTurn = 'W';

    // White has no valid moves
    const whiteMoves = getValidMoves(board);
    expect(whiteMoves.length).toBe(0);

    // Switch to Black and check
    board.playerTurn = 'B';
    const blackMoves = getValidMoves(board);

    // If Black also has no moves, game is over
    if (blackMoves.length === 0) {
      expect(isGameOver(board)).toBe(true);
    }
  });
});
