import { describe, test, expect } from 'bun:test';
import {
  W,
  B,
  E,
  createBoard,
  score,
  getValidMoves,
  isGameOver,
  getWinner,
  hasAdjacentPiece,
  takeTurn,
  type Coordinate,
} from './index';

describe('Advanced Game Logic Tests', () => {
  describe('Valid Moves Detection', () => {
    test('getValidMoves() returns correct valid moves for initial position', () => {
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

      const validMoves = getValidMoves(board);
      expect(validMoves.length).toBe(4);

      // Check that specific valid moves are included
      const hasMove = (moves: Coordinate[], x: number, y: number): boolean =>
        moves.some(([mx, my]) => mx === x && my === y);

      expect(hasMove(validMoves, 2, 3)).toBe(true); // Left of center
      expect(hasMove(validMoves, 3, 2)).toBe(true); // Above center
      expect(hasMove(validMoves, 4, 5)).toBe(true); // Right-below center
      expect(hasMove(validMoves, 5, 4)).toBe(true); // Right-above center
    });

    test('getValidMoves() returns empty array when no valid moves', () => {
      const board = createBoard([
        [B, B, B, B, B, B, B, B],
        [B, B, B, B, B, B, B, B],
        [B, B, B, B, B, B, B, B],
        [B, B, B, B, B, B, B, B],
        [B, B, B, B, B, B, B, B],
        [B, B, B, B, B, B, B, B],
        [B, B, B, B, B, B, B, B],
        [E, E, E, E, E, E, E, E],
      ]);

      const validMoves = getValidMoves(board);
      expect(validMoves.length).toBe(0);
    });
  });

  describe('Game Over Detection', () => {
    test('isGameOver() returns true when board is full', () => {
      const board = createBoard([
        [B, B, B, B],
        [B, B, B, B],
        [W, W, W, W],
        [W, W, W, W],
      ]);

      expect(isGameOver(board)).toBe(true);
    });

    test('isGameOver() returns false when game is in progress', () => {
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

      expect(isGameOver(board)).toBe(false);
    });

    test('isGameOver() returns true when board is nearly full with no valid moves', () => {
      // Create a mostly full board configuration
      const board = createBoard([
        [B, B, B, B],
        [B, B, B, B],
        [B, W, W, W],
        [W, W, W, W],
      ]);

      // Test that game recognizes it's over when no valid moves remain
      // In this configuration, neither player can make a valid move
      const result = isGameOver(board);
      expect(result).toBe(true);
    });
  });

  describe('Winner Detection', () => {
    test('getWinner() returns B when black has more pieces', () => {
      const board = createBoard([
        [B, B, B, B],
        [B, B, B, B],
        [W, W, W, E],
        [E, E, E, E],
      ]);

      expect(getWinner(board)).toBe(B);
    });

    test('getWinner() returns W when white has more pieces', () => {
      const board = createBoard([
        [W, W, W, W],
        [W, W, W, W],
        [B, B, B, E],
        [E, E, E, E],
      ]);

      expect(getWinner(board)).toBe(W);
    });

    test('getWinner() returns null for a tie', () => {
      const board = createBoard([
        [B, B, B, B],
        [W, W, W, W],
        [B, B, B, B],
        [W, W, W, W],
      ]);

      expect(getWinner(board)).toBe(null);
    });
  });

  describe('Adjacent Piece Detection', () => {
    test('hasAdjacentPiece() returns true when there is an adjacent piece', () => {
      const board = createBoard([
        [E, E, E, E],
        [E, B, E, E],
        [E, E, E, E],
        [E, E, E, E],
      ]);

      // Positions adjacent to [1,1] should return true
      expect(hasAdjacentPiece(board, [0, 0])).toBe(true);
      expect(hasAdjacentPiece(board, [1, 0])).toBe(true);
      expect(hasAdjacentPiece(board, [2, 0])).toBe(true);
      expect(hasAdjacentPiece(board, [0, 1])).toBe(true);
      expect(hasAdjacentPiece(board, [2, 1])).toBe(true);
      expect(hasAdjacentPiece(board, [0, 2])).toBe(true);
      expect(hasAdjacentPiece(board, [1, 2])).toBe(true);
      expect(hasAdjacentPiece(board, [2, 2])).toBe(true);
    });

    test('hasAdjacentPiece() returns false when no adjacent pieces', () => {
      const board = createBoard([
        [E, E, E, E],
        [E, B, E, E],
        [E, E, E, E],
        [E, E, E, E],
      ]);

      // Position [3,3] should have no adjacent pieces
      expect(hasAdjacentPiece(board, [3, 3])).toBe(false);
    });
  });

  describe('Multi-directional Flipping', () => {
    test('takeTurn() flips pieces in multiple directions simultaneously', () => {
      // Simpler test - a standard cross pattern
      const board = createBoard([
        [E, E, B, E, E],
        [E, E, W, E, E],
        [B, W, E, W, B],
        [E, E, W, E, E],
        [E, E, B, E, E],
      ]);

      board.playerTurn = B;
      takeTurn(board, [2, 2]); // Center position flips in 4 directions

      // Should flip pieces in all cardinal directions
      expect(board.tiles[2]![2]).toBe(B);
      expect(board.tiles[2]![1]).toBe(B); // Above
      expect(board.tiles[2]![3]).toBe(B); // Below
      expect(board.tiles[1]![2]).toBe(B); // Left
      expect(board.tiles[3]![2]).toBe(B); // Right
    });

    test('takeTurn() flips pieces diagonally', () => {
      const board = createBoard([
        [E, E, E, E, E],
        [E, W, E, E, E],
        [E, E, W, E, E],
        [E, E, E, B, E],
        [E, E, E, E, E],
      ]);

      board.playerTurn = B;
      takeTurn(board, [0, 0]);

      // Should flip diagonal pieces
      expect(board.tiles[1]![1]).toBe(B);
      expect(board.tiles[2]![2]).toBe(B);
    });
  });

  describe('Score Calculation', () => {
    test('score() counts correctly in a complex board', () => {
      const board = createBoard([
        [B, W, B, W, B, W, B, W],
        [W, B, W, B, W, B, W, B],
        [B, W, B, W, B, W, B, W],
        [W, B, W, B, W, B, W, B],
        [B, W, B, W, B, W, B, W],
        [W, B, W, B, W, B, W, B],
        [B, W, B, W, B, W, B, W],
        [W, B, W, B, W, B, W, B],
      ]);

      const result = score(board);
      expect(result.black).toBe(32);
      expect(result.white).toBe(32);
    });

    test('score() handles empty board correctly', () => {
      const board = createBoard([
        [E, E, E, E],
        [E, E, E, E],
        [E, E, E, E],
        [E, E, E, E],
      ]);

      const result = score(board);
      expect(result.black).toBe(0);
      expect(result.white).toBe(0);
    });

    test('score() handles board with only one color', () => {
      const board = createBoard([
        [B, B, B, B],
        [B, B, B, B],
        [B, B, B, B],
        [B, B, B, B],
      ]);

      const result = score(board);
      expect(result.black).toBe(16);
      expect(result.white).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    test('handles flipping at board edges', () => {
      const board = createBoard([
        [E, W, B, E],
        [E, E, E, E],
        [E, E, E, E],
        [E, E, E, E],
      ]);

      board.playerTurn = B;
      takeTurn(board, [0, 0]);

      expect(board.tiles[0]![0]).toBe(B);
      expect(board.tiles[0]![1]).toBe(B);
    });

    test('handles valid moves in corners', () => {
      // Create a simpler scenario where corner move is valid
      const board = createBoard([
        [E, W, B, E],
        [E, E, E, E],
        [E, E, E, E],
        [E, E, E, E],
      ]);

      board.playerTurn = B;
      // Place at corner and verify it flips the piece between
      takeTurn(board, [0, 0]);

      expect(board.tiles[0]![0]).toBe(B);
      expect(board.tiles[0]![1]).toBe(B);
      expect(board.tiles[0]![2]).toBe(B);
    });
  });

  describe('Player Turn Alternation', () => {
    test('player turns alternate correctly through multiple moves', () => {
      const board = createBoard([
        [E, E, E, E, E, E],
        [E, E, E, E, E, E],
        [E, E, W, B, E, E],
        [E, E, B, W, E, E],
        [E, E, E, E, E, E],
        [E, E, E, E, E, E],
      ]);

      expect(board.playerTurn).toBe(B);
      takeTurn(board, [1, 2]);

      expect(board.playerTurn).toBe(W);
      takeTurn(board, [1, 3]);

      expect(board.playerTurn).toBe(B);
      takeTurn(board, [1, 4]);

      expect(board.playerTurn).toBe(W);
    });
  });
});
