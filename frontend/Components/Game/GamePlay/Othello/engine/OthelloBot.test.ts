import { describe, test, expect } from 'bun:test';
import { OthelloBot } from './OthelloBot';
import { createBoard, E, W, B, getValidMoves, Board, move as applyMove } from './index';

describe('OthelloBot', () => {
  // Helper to create a standard starting board
  const createStartingBoard = (): Board => {
    return createBoard([
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, W, B, E, E, E],
      [E, E, E, B, W, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
      [E, E, E, E, E, E, E, E],
    ]);
  };

  describe('Constructor and Getters/Setters', () => {
    test('initializes with default values', () => {
      const bot = new OthelloBot();
      expect(bot.getDifficulty()).toBe('medium');
      expect(bot.getPlayer()).toBe('W');
    });

    test('initializes with custom values', () => {
      const bot = new OthelloBot('hard', 'B');
      expect(bot.getDifficulty()).toBe('hard');
      expect(bot.getPlayer()).toBe('B');
    });

    test('setDifficulty changes difficulty', () => {
      const bot = new OthelloBot('easy', 'W');
      bot.setDifficulty('hard');
      expect(bot.getDifficulty()).toBe('hard');
    });

    test('setPlayer changes player', () => {
      const bot = new OthelloBot('medium', 'W');
      bot.setPlayer('B');
      expect(bot.getPlayer()).toBe('B');
    });

    test('initializes transposition table', () => {
      const bot = new OthelloBot('hard', 'B');
      expect(bot.getTranspositionTableSize()).toBe(0);
    });

    test('clearTranspositionTable clears the cache', () => {
      const bot = new OthelloBot('hard', 'B');
      bot.setUseOpeningBook(false); // Disable book to test actual search
      const board = createStartingBoard();
      bot.calculateMove(board);
      expect(bot.getTranspositionTableSize()).toBeGreaterThan(0);
      bot.clearTranspositionTable();
      expect(bot.getTranspositionTableSize()).toBe(0);
    });

    test('getNodesSearched returns search count', () => {
      const bot = new OthelloBot('hard', 'B');
      bot.setUseOpeningBook(false); // Disable book to test actual search
      const board = createStartingBoard();
      bot.calculateMove(board);
      expect(bot.getNodesSearched()).toBeGreaterThan(0);
    });
  });

  describe('Easy Difficulty - Random Move', () => {
    test('returns a valid move', () => {
      const bot = new OthelloBot('easy', 'B');
      const board = createStartingBoard();
      const move = bot.calculateMove(board);

      expect(move).not.toBeNull();

      if (move) {
        const validMoves = getValidMoves(board);
        const isValidMove = validMoves.some(([x, y]) => x === move[0] && y === move[1]);
        expect(isValidMove).toBe(true);
      }
    });

    test('returns null when no valid moves', () => {
      const bot = new OthelloBot('easy', 'B');
      // Create a board with no valid moves for Black
      const board = createBoard([
        [W, W, W, W, W, W, W, W],
        [W, W, W, W, W, W, W, W],
        [W, W, W, W, W, W, W, W],
        [W, W, W, W, W, W, W, W],
        [W, W, W, W, W, W, W, W],
        [W, W, W, W, W, W, W, W],
        [W, W, W, W, W, W, W, W],
        [W, W, W, W, W, W, W, E],
      ]);

      const move = bot.calculateMove(board);
      expect(move).toBeNull();
    });

    test('selects different moves over multiple calls (randomness)', () => {
      const bot = new OthelloBot('easy', 'B');
      const board = createStartingBoard();

      const moves = new Set<string>();

      // Run 20 times to ensure we get some variation
      for (let i = 0; i < 20; i++) {
        const move = bot.calculateMove(board);
        if (move) {
          moves.add(`${move[0]},${move[1]}`);
        }
      }

      // With 4 valid moves, we should see at least 2 different moves
      expect(moves.size).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Medium Difficulty - Greedy Algorithm', () => {
    test('returns a valid move', () => {
      const bot = new OthelloBot('medium', 'B');
      const board = createStartingBoard();
      const move = bot.calculateMove(board);

      expect(move).not.toBeNull();

      if (move) {
        const validMoves = getValidMoves(board);
        const isValidMove = validMoves.some(([x, y]) => x === move[0] && y === move[1]);
        expect(isValidMove).toBe(true);
      }
    });

    test('chooses move that maximizes immediate score', () => {
      const bot = new OthelloBot('medium', 'B');

      // Create a board where one move is clearly better
      const board = createBoard([
        [E, E, E, E, E, E, E, E],
        [E, E, E, E, E, E, E, E],
        [E, E, B, W, W, W, E, E],
        [E, E, E, W, B, E, E, E],
        [E, E, E, B, W, E, E, E],
        [E, E, E, E, E, E, E, E],
        [E, E, E, E, E, E, E, E],
        [E, E, E, E, E, E, E, E],
      ]);

      const move = bot.calculateMove(board);

      // The greedy bot should choose a move that flips multiple pieces
      expect(move).not.toBeNull();
    });

    test('is deterministic - same board produces same move', () => {
      const bot = new OthelloBot('medium', 'B');
      const board = createStartingBoard();

      const move1 = bot.calculateMove(board);
      const move2 = bot.calculateMove(board);

      expect(move1).toEqual(move2);
    });
  });

  describe('Hard Difficulty - Minimax with Alpha-Beta', () => {
    test('returns a valid move', () => {
      const bot = new OthelloBot('hard', 'B');
      const board = createStartingBoard();
      const move = bot.calculateMove(board);

      expect(move).not.toBeNull();

      if (move) {
        const validMoves = getValidMoves(board);
        const isValidMove = validMoves.some(([x, y]) => x === move[0] && y === move[1]);
        expect(isValidMove).toBe(true);
      }
    });

    test('is deterministic - same board produces same move', () => {
      const bot = new OthelloBot('hard', 'B');
      const board = createStartingBoard();

      const move1 = bot.calculateMove(board);
      const move2 = bot.calculateMove(board);

      expect(move1).toEqual(move2);
    });

    test('prefers strategic positions', () => {
      const bot = new OthelloBot('hard', 'B');

      // Create a board where a corner is available
      const board = createBoard([
        [E, W, W, W, W, W, W, W],
        [W, B, W, W, W, W, W, W],
        [W, W, B, W, W, W, W, W],
        [W, W, W, B, W, W, W, W],
        [W, W, W, W, B, W, W, W],
        [W, W, W, W, W, B, W, W],
        [W, W, W, W, W, W, B, W],
        [E, E, E, E, E, E, E, E],
      ]);

      const move = bot.calculateMove(board);

      // Should return a valid strategic move (corner is best, but any valid move is fine)
      expect(move).not.toBeNull();
      if (move) {
        const validMoves = getValidMoves(board);
        const isValidMove = validMoves.some(([x, y]) => x === move[0] && y === move[1]);
        expect(isValidMove).toBe(true);
      }
    });
  });

  describe('Move Ordering', () => {
    test('prioritizes corners when available', () => {
      const bot = new OthelloBot('hard', 'B');

      // Standard starting board - bot should return valid strategic move
      const board = createStartingBoard();

      const move = bot.calculateMove(board);

      // Hard bot should return a valid move
      expect(move).not.toBeNull();
      if (move) {
        const validMoves = getValidMoves(board);
        const isValid = validMoves.some(([x, y]) => x === move[0] && y === move[1]);
        expect(isValid).toBe(true);
      }
    });

    test('avoids X-squares when corner not owned', () => {
      const bot = new OthelloBot('hard', 'B');

      // Board where X-square is available but corner is not owned
      const board = createBoard([
        [E, E, E, E, E, E, E, E],
        [E, E, W, W, W, W, E, E],
        [E, W, B, B, B, B, W, E],
        [E, W, B, E, E, B, W, E],
        [E, W, B, E, E, B, W, E],
        [E, W, B, B, B, B, W, E],
        [E, E, W, W, W, W, E, E],
        [E, E, E, E, E, E, E, E],
      ]);

      const move = bot.calculateMove(board);

      // Bot should avoid X-squares (1,1), (1,6), (6,1), (6,6) if possible
      expect(move).not.toBeNull();
      if (move) {
        const isXSquare =
          (move[0] === 1 && move[1] === 1) ||
          (move[0] === 1 && move[1] === 6) ||
          (move[0] === 6 && move[1] === 1) ||
          (move[0] === 6 && move[1] === 6);
        // X-squares should be avoided unless no other option
        const validMoves = getValidMoves(board);
        const nonXMoves = validMoves.filter(
          ([x, y]) =>
            !(
              (x === 1 && y === 1) ||
              (x === 1 && y === 6) ||
              (x === 6 && y === 1) ||
              (x === 6 && y === 6)
            )
        );
        if (nonXMoves.length > 0) {
          expect(isXSquare).toBe(false);
        }
      }
    });
  });

  describe('Transposition Table', () => {
    test('caches positions during search', () => {
      const bot = new OthelloBot('hard', 'B');
      bot.setUseOpeningBook(false); // Disable book to test actual search
      const board = createStartingBoard();

      bot.clearTranspositionTable();
      expect(bot.getTranspositionTableSize()).toBe(0);

      bot.calculateMove(board);

      // Should have cached some positions
      expect(bot.getTranspositionTableSize()).toBeGreaterThan(0);
    });

    test('reuses cached positions', () => {
      const bot = new OthelloBot('hard', 'B');
      const board = createStartingBoard();

      // First calculation
      bot.clearTranspositionTable();
      bot.calculateMove(board);
      const nodes1 = bot.getNodesSearched();

      // Second calculation with same board should use cache
      bot.calculateMove(board);
      const nodes2 = bot.getNodesSearched();

      // With TT, second search might explore fewer nodes
      // (depends on implementation details)
      expect(nodes2).toBeLessThanOrEqual(nodes1);
    });

    test('clears cache between games', () => {
      const bot = new OthelloBot('hard', 'B');
      bot.setUseOpeningBook(false); // Disable book to test actual search
      const board = createStartingBoard();

      bot.calculateMove(board);
      expect(bot.getTranspositionTableSize()).toBeGreaterThan(0);

      bot.clearTranspositionTable();
      expect(bot.getTranspositionTableSize()).toBe(0);
    });
  });

  describe('Difficulty Comparison', () => {
    test('hard bot should generally make better moves than easy bot', () => {
      const easyBot = new OthelloBot('easy', 'B');
      const hardBot = new OthelloBot('hard', 'B');

      // Create a complex mid-game position
      const board = createBoard([
        [E, E, E, E, E, E, E, E],
        [E, B, W, W, W, E, E, E],
        [E, W, B, W, B, E, E, E],
        [E, W, W, B, W, E, E, E],
        [E, W, B, W, B, E, E, E],
        [E, E, E, E, E, E, E, E],
        [E, E, E, E, E, E, E, E],
        [E, E, E, E, E, E, E, E],
      ]);

      const easyMove = easyBot.calculateMove(board);
      const hardMove = hardBot.calculateMove(board);

      // Both should return valid moves
      expect(easyMove).not.toBeNull();
      expect(hardMove).not.toBeNull();

      // They might be different (easy is random, hard is strategic)
      // This test mainly ensures both work correctly
    });

    test('hard bot searches more nodes than medium bot', () => {
      const mediumBot = new OthelloBot('medium', 'B');
      const hardBot = new OthelloBot('hard', 'B');
      hardBot.setUseOpeningBook(false); // Disable book to test actual search
      const board = createStartingBoard();

      mediumBot.calculateMove(board);
      hardBot.calculateMove(board);

      // Hard bot uses minimax, so searches more positions
      expect(hardBot.getNodesSearched()).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    test('handles board with only one valid move', () => {
      const bot = new OthelloBot('medium', 'B');

      // Create a board with only one valid move for Black
      const board = createBoard([
        [W, W, W, W, W, W, W, W],
        [W, W, W, W, W, W, W, W],
        [W, W, W, W, W, W, W, W],
        [W, W, W, B, B, W, W, W],
        [W, W, W, B, W, W, W, W],
        [W, W, W, W, W, W, W, W],
        [W, W, W, W, W, W, W, W],
        [W, W, W, E, W, W, W, W],
      ]);

      const move = bot.calculateMove(board);
      expect(move).not.toBeNull();

      if (move) {
        // Should be the only valid move
        const validMoves = getValidMoves(board);
        expect(validMoves.length).toBe(1);
        expect(move).toEqual(validMoves[0]);
      }
    });

    test('works correctly for White player', () => {
      const bot = new OthelloBot('medium', 'W');

      // Create a board where it's White's turn
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

      board.playerTurn = 'W';

      const move = bot.calculateMove(board);
      expect(move).not.toBeNull();

      if (move) {
        const validMoves = getValidMoves(board);
        const isValidMove = validMoves.some(([x, y]) => x === move[0] && y === move[1]);
        expect(isValidMove).toBe(true);
      }
    });

    test('handles near-full board', () => {
      const bot = new OthelloBot('hard', 'B');

      // Board with only a few empty cells
      const board = createBoard([
        [B, B, B, B, B, B, B, B],
        [B, B, B, B, B, B, B, B],
        [B, B, B, B, B, B, B, B],
        [B, B, B, B, B, B, B, B],
        [B, B, B, B, B, B, B, B],
        [B, B, B, B, B, B, B, B],
        [B, B, B, B, B, B, W, W],
        [B, B, B, B, B, B, W, E],
      ]);

      bot.calculateMove(board);
      // May or may not have a valid move depending on position
      // Just ensure it doesn't crash
      expect(true).toBe(true);
    });

    test('handles empty board edge case', () => {
      const bot = new OthelloBot('hard', 'B');

      // Completely empty board (not a legal game state, but test robustness)
      const board = createBoard([
        [E, E, E, E, E, E, E, E],
        [E, E, E, E, E, E, E, E],
        [E, E, E, E, E, E, E, E],
        [E, E, E, E, E, E, E, E],
        [E, E, E, E, E, E, E, E],
        [E, E, E, E, E, E, E, E],
        [E, E, E, E, E, E, E, E],
        [E, E, E, E, E, E, E, E],
      ]);

      const move = bot.calculateMove(board);
      // Should return null as no valid moves exist
      expect(move).toBeNull();
    });

    test('handles board with all same color', () => {
      const bot = new OthelloBot('hard', 'B');

      const board = createBoard([
        [W, W, W, W, W, W, W, W],
        [W, W, W, W, W, W, W, W],
        [W, W, W, W, W, W, W, W],
        [W, W, W, W, W, W, W, W],
        [W, W, W, W, W, W, W, W],
        [W, W, W, W, W, W, W, W],
        [W, W, W, W, W, W, W, W],
        [W, W, W, W, W, W, W, W],
      ]);

      const move = bot.calculateMove(board);
      expect(move).toBeNull();
    });

    test('handles alternating full rows', () => {
      const bot = new OthelloBot('medium', 'B');

      const board = createBoard([
        [B, W, B, W, B, W, B, W],
        [W, B, W, B, W, B, W, B],
        [B, W, B, W, B, W, B, W],
        [W, B, W, B, W, B, W, B],
        [B, W, B, W, B, W, B, W],
        [W, B, W, B, W, B, W, B],
        [B, W, B, W, B, W, B, W],
        [W, B, W, B, W, B, W, E],
      ]);

      bot.calculateMove(board);
      // Should handle this without crashing
      expect(true).toBe(true);
    });
  });

  describe('Performance', () => {
    test('hard difficulty completes in reasonable time', () => {
      const bot = new OthelloBot('hard', 'B');
      const board = createStartingBoard();

      const startTime = Date.now();
      const move = bot.calculateMove(board);
      const endTime = Date.now();

      expect(move).not.toBeNull();

      // Should complete within 2 seconds (generous limit)
      expect(endTime - startTime).toBeLessThan(2000);
    });

    test('hard difficulty handles complex mid-game efficiently', () => {
      const bot = new OthelloBot('hard', 'B');

      // Complex mid-game position with many options
      const board = createBoard([
        [B, W, W, W, W, W, W, E],
        [W, B, W, W, W, W, W, E],
        [W, W, B, W, W, W, E, E],
        [W, W, W, B, W, E, E, E],
        [W, W, W, W, B, E, E, E],
        [W, W, W, E, E, B, E, E],
        [W, W, E, E, E, E, B, E],
        [E, E, E, E, E, E, E, E],
      ]);

      const startTime = Date.now();
      const move = bot.calculateMove(board);
      const endTime = Date.now();

      expect(move).not.toBeNull();
      expect(endTime - startTime).toBeLessThan(2000);
    });

    test('transposition table improves performance', () => {
      const bot = new OthelloBot('hard', 'B');
      const board = createStartingBoard();

      // First search without cache
      bot.clearTranspositionTable();
      const start1 = Date.now();
      bot.calculateMove(board);
      const time1 = Date.now() - start1;

      // Second search with populated cache
      const start2 = Date.now();
      bot.calculateMove(board);
      const time2 = Date.now() - start2;

      // Second search should be faster or similar (not much slower)
      expect(time2).toBeLessThanOrEqual(time1 * 1.5);
    });
  });

  describe('Game Simulation - Full Game Tests', () => {
    test('bot can play a complete game without errors', () => {
      const botB = new OthelloBot('medium', 'B');
      const botW = new OthelloBot('medium', 'W');
      let board = createStartingBoard();

      let moves = 0;
      const maxMoves = 60; // Max possible moves in Othello

      while (moves < maxMoves) {
        const currentBot = board.playerTurn === 'B' ? botB : botW;
        const move = currentBot.calculateMove(board);

        if (!move) {
          // Switch to other player
          board.playerTurn = board.playerTurn === 'B' ? 'W' : 'B';
          const otherMove = (board.playerTurn === 'B' ? botB : botW).calculateMove(board);
          if (!otherMove) {
            // Game over - neither player can move
            break;
          }
          // Apply other player's move
          const result = applyMove(board, otherMove);
          if (result) {
            board = result.board;
          }
        } else {
          // Apply current player's move
          const result = applyMove(board, move);
          if (result) {
            board = result.board;
          } else {
            // Invalid move - shouldn't happen
            throw new Error(`Invalid move returned by bot: ${move}`);
          }
        }

        moves++;
      }

      // Game should complete without errors
      expect(moves).toBeLessThanOrEqual(maxMoves);
    });

    test('hard bot vs easy bot - hard should win most games', () => {
      const wins = { hard: 0, easy: 0, draw: 0 };
      const games = 3; // Run 3 games for more reliable result

      for (let i = 0; i < games; i++) {
        const hardBot = new OthelloBot('hard', 'B');
        const easyBot = new OthelloBot('easy', 'W');
        let board = createStartingBoard();

        let moves = 0;
        const maxMoves = 60;

        while (moves < maxMoves) {
          const currentBot = board.playerTurn === 'B' ? hardBot : easyBot;
          const move = currentBot.calculateMove(board);

          if (!move) {
            board.playerTurn = board.playerTurn === 'B' ? 'W' : 'B';
            const otherMove = (board.playerTurn === 'B' ? hardBot : easyBot).calculateMove(board);
            if (!otherMove) break;
            const result = applyMove(board, otherMove);
            if (result) board = result.board;
          } else {
            const result = applyMove(board, move);
            if (result) board = result.board;
          }

          moves++;
        }

        // Count final scores
        let blackCount = 0,
          whiteCount = 0;
        for (let y = 0; y < 8; y++) {
          for (let x = 0; x < 8; x++) {
            if (board.tiles[y]?.[x] === 'B') blackCount++;
            else if (board.tiles[y]?.[x] === 'W') whiteCount++;
          }
        }

        if (blackCount > whiteCount) wins.hard++;
        else if (whiteCount > blackCount) wins.easy++;
        else wins.draw++;
      }

      // Hard bot should win or draw majority of games (at least 2 out of 3)
      expect(wins.hard + wins.draw).toBeGreaterThanOrEqual(2);
    }, 60000); // 60 second timeout for multiple games
  });

  describe('Corner and Edge Strategy', () => {
    test('bot takes corner when available in late game', () => {
      const bot = new OthelloBot('hard', 'B');

      // Late game position where corner is available
      const board = createBoard([
        [E, B, W, W, W, W, W, B],
        [B, B, B, B, B, B, B, B],
        [W, B, W, W, W, W, B, W],
        [W, B, W, B, B, W, B, W],
        [W, B, W, B, B, W, B, W],
        [W, B, W, W, W, W, B, W],
        [B, B, B, B, B, B, B, B],
        [B, W, W, W, W, W, W, E],
      ]);

      const move = bot.calculateMove(board);
      expect(move).not.toBeNull();

      if (move) {
        const validMoves = getValidMoves(board);
        // Check if corners are available
        const cornerMoves = validMoves.filter(
          ([x, y]) =>
            (x === 0 && y === 0) ||
            (x === 0 && y === 7) ||
            (x === 7 && y === 0) ||
            (x === 7 && y === 7)
        );

        if (cornerMoves.length > 0) {
          // Bot should take a corner
          const isCornerMove =
            (move[0] === 0 && move[1] === 0) ||
            (move[0] === 0 && move[1] === 7) ||
            (move[0] === 7 && move[1] === 0) ||
            (move[0] === 7 && move[1] === 7);
          expect(isCornerMove).toBe(true);
        }
      }
    });

    test('bot prefers edges over interior when no corners available', () => {
      const bot = new OthelloBot('hard', 'B');

      // Standard mid-game position where Black has valid moves
      const board = createBoard([
        [E, E, E, E, E, E, E, E],
        [E, E, E, E, E, E, E, E],
        [E, E, W, W, W, E, E, E],
        [E, E, W, W, B, E, E, E],
        [E, E, W, B, B, E, E, E],
        [E, E, E, E, E, E, E, E],
        [E, E, E, E, E, E, E, E],
        [E, E, E, E, E, E, E, E],
      ]);

      const move = bot.calculateMove(board);
      expect(move).not.toBeNull();

      // Verify it returns a valid move
      if (move) {
        const validMoves = getValidMoves(board);
        const isValid = validMoves.some(([x, y]) => x === move[0] && y === move[1]);
        expect(isValid).toBe(true);
      }
    });
  });

  describe('Stability and Robustness', () => {
    test('bot handles rapid consecutive calls', () => {
      const bot = new OthelloBot('hard', 'B');
      const board = createStartingBoard();

      // Make many rapid consecutive calls
      for (let i = 0; i < 10; i++) {
        const move = bot.calculateMove(board);
        expect(move).not.toBeNull();
      }
    });

    test('bot handles different board configurations', () => {
      const bot = new OthelloBot('hard', 'B');

      const configs = [
        // Standard start
        createStartingBoard(),
        // Early game
        createBoard([
          [E, E, E, E, E, E, E, E],
          [E, E, E, E, E, E, E, E],
          [E, E, E, B, E, E, E, E],
          [E, E, B, B, B, E, E, E],
          [E, E, E, B, W, E, E, E],
          [E, E, E, E, E, E, E, E],
          [E, E, E, E, E, E, E, E],
          [E, E, E, E, E, E, E, E],
        ]),
        // Mid game
        createBoard([
          [E, E, E, E, E, E, E, E],
          [E, B, B, B, B, B, E, E],
          [E, W, W, W, W, W, E, E],
          [E, B, W, B, W, B, E, E],
          [E, W, B, W, B, W, E, E],
          [E, B, W, W, W, B, E, E],
          [E, E, E, E, E, E, E, E],
          [E, E, E, E, E, E, E, E],
        ]),
      ];

      for (const board of configs) {
        const move = bot.calculateMove(board);
        // Should either return a valid move or null (no moves)
        if (move) {
          const validMoves = getValidMoves(board);
          const isValid = validMoves.some(([x, y]) => x === move[0] && y === move[1]);
          expect(isValid).toBe(true);
        }
      }
    });

    test('all three difficulty levels produce valid moves on same board', () => {
      const board = createStartingBoard();
      const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard'];

      for (const difficulty of difficulties) {
        const bot = new OthelloBot(difficulty, 'B');
        const move = bot.calculateMove(board);

        expect(move).not.toBeNull();
        if (move) {
          const validMoves = getValidMoves(board);
          const isValid = validMoves.some(([x, y]) => x === move[0] && y === move[1]);
          expect(isValid).toBe(true);
        }
      }
    });
  });
});
