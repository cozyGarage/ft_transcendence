import { describe, expect, test } from 'bun:test';
import {
  lookupOpeningBook,
  getOpeningName,
  buildSequenceKey,
  moveToNotation,
  notationToMove,
  OPENING_BOOK,
} from './openingBook';

describe('Opening Book', () => {
  describe('moveToNotation', () => {
    test('converts [0, 0] to a8', () => {
      expect(moveToNotation([0, 0])).toBe('a8');
    });

    test('converts [7, 7] to h1', () => {
      expect(moveToNotation([7, 7])).toBe('h1');
    });

    test('converts [3, 5] to d3', () => {
      expect(moveToNotation([3, 5])).toBe('d3');
    });

    test('converts [4, 4] to e4', () => {
      expect(moveToNotation([4, 4])).toBe('e4');
    });
  });

  describe('notationToMove', () => {
    test('converts a8 to [0, 0]', () => {
      expect(notationToMove('a8')).toEqual([0, 0]);
    });

    test('converts h1 to [7, 7]', () => {
      expect(notationToMove('h1')).toEqual([7, 7]);
    });

    test('converts d3 to [3, 5]', () => {
      expect(notationToMove('d3')).toEqual([3, 5]);
    });

    test('round-trip conversion works', () => {
      const coord: [number, number] = [5, 4];
      const notation = moveToNotation(coord);
      expect(notationToMove(notation)).toEqual(coord);
    });
  });

  describe('buildSequenceKey', () => {
    test('returns empty string for no moves', () => {
      expect(buildSequenceKey([])).toBe('');
    });

    test('builds single move key', () => {
      const moves = [{ coordinate: [3, 5] as [number, number] }]; // d3
      expect(buildSequenceKey(moves)).toBe('d3');
    });

    test('builds multi-move key', () => {
      const moves = [
        { coordinate: [3, 5] as [number, number] }, // d3
        { coordinate: [2, 5] as [number, number] }, // c3
        { coordinate: [2, 4] as [number, number] }, // c4
      ];
      expect(buildSequenceKey(moves)).toBe('d3,c3,c4');
    });
  });

  describe('lookupOpeningBook', () => {
    test('returns d3 move for empty history (starting position)', () => {
      const move = lookupOpeningBook([]);
      // d3 = col d (3), row 3 from bottom = row index 5
      expect(move).toEqual([3, 5]);
    });

    test('returns null for unknown position', () => {
      const moves = [
        { coordinate: [0, 0] as [number, number] },
        { coordinate: [1, 1] as [number, number] },
        { coordinate: [2, 2] as [number, number] },
      ];
      const move = lookupOpeningBook(moves);
      expect(move).toBeNull();
    });

    test('returns book move for known opening', () => {
      // After d3, the book suggests c3
      const moves = [{ coordinate: [3, 5] as [number, number] }]; // d3
      const move = lookupOpeningBook(moves);
      expect(move).toEqual([2, 5]); // c3
    });
  });

  describe('getOpeningName', () => {
    test('returns opening name for starting position', () => {
      const name = getOpeningName([]);
      expect(name).toBe('Diagonal Opening (d3)');
    });

    test('returns null for unknown position', () => {
      const moves = [{ coordinate: [0, 0] as [number, number] }];
      const name = getOpeningName(moves);
      expect(name).toBeNull();
    });

    test('returns Tiger for d3', () => {
      const moves = [{ coordinate: [3, 5] as [number, number] }]; // d3
      const name = getOpeningName(moves);
      expect(name).toBe('Tiger');
    });
  });

  describe('OPENING_BOOK', () => {
    test('contains expected number of entries', () => {
      const entries = Object.keys(OPENING_BOOK);
      expect(entries.length).toBeGreaterThanOrEqual(10);
    });

    test('all entries have valid bestMove coordinates', () => {
      for (const entry of Object.values(OPENING_BOOK)) {
        const [col, row] = entry.bestMove;
        expect(col).toBeGreaterThanOrEqual(0);
        expect(col).toBeLessThanOrEqual(7);
        expect(row).toBeGreaterThanOrEqual(0);
        expect(row).toBeLessThanOrEqual(7);
      }
    });
  });
});
