/**
 * Opening Book for Othello
 *
 * Well-known openings in Othello with their best responses.
 * Move coordinates are in [col, row] format (0-indexed).
 * Row 0 is top, row 7 is bottom.
 *
 * Standard notation mapping:
 * - d3 = column d (index 3), row 3 (from bottom) = row index 5
 * - c4 = column c (index 2), row 4 (from bottom) = row index 4
 * - f5 = column f (index 5), row 5 (from bottom) = row index 3
 *
 * Major opening families:
 * 1. Diagonal Opening - d3 response (most common)
 * 2. Perpendicular Opening - f5, d6, c5... (popular among experts)
 * 3. Parallel Opening - generally weaker but can surprise
 */

export interface OpeningMove {
  move: [number, number]; // [col, row]
  name?: string;
  children?: Record<string, OpeningMove>;
}

/**
 * Opening book data structure
 * Key format: move sequence as comma-separated notation (e.g., "d3,c3,c4")
 */
export interface OpeningBook {
  [sequence: string]: {
    bestMove: [number, number];
    name?: string;
    evaluation?: number; // -64 to +64
  };
}

/**
 * Expanded Othello Opening Book
 *
 * Standard starting position has discs at:
 * - d4: White, e4: Black
 * - d5: Black, e5: White
 *
 * Black moves first. Initial legal moves for Black: c4, d3, e6, f5
 *
 * This book contains 40+ opening positions covering major lines.
 */
export const OPENING_BOOK: OpeningBook = {
  // ============================================================
  // FIRST MOVE OPTIONS (all equivalent by symmetry, d3 preferred)
  // ============================================================
  '': { bestMove: [3, 5], name: 'Diagonal Opening (d3)' }, // d3

  // ============================================================
  // DIAGONAL OPENING FAMILY (d3)
  // ============================================================

  // --- Tiger Opening (d3, c3) ---
  d3: { bestMove: [2, 5], name: 'Tiger' }, // c3
  'd3,c3': { bestMove: [2, 4], name: 'Tiger' }, // c4
  'd3,c3,c4': { bestMove: [2, 3], name: 'Tiger Line' }, // c5
  'd3,c3,c4,c5': { bestMove: [1, 5], name: 'Tiger Extension' }, // b3
  'd3,c3,c4,c5,b3': { bestMove: [2, 2], name: 'Deep Tiger' }, // c6

  // --- Rabbit Opening (d3, c5) ---
  'd3,c5': { bestMove: [5, 2], name: 'Rabbit' }, // f6
  'd3,c5,f6': { bestMove: [4, 2], name: 'Rabbit Line' }, // e6
  'd3,c5,f6,e6': { bestMove: [5, 3], name: 'Rabbit Continuation' }, // f5
  'd3,c5,f6,e6,f5': { bestMove: [3, 2], name: 'Rabbit Extended' }, // d6

  // --- Cow Opening (d3, c5, d6) ---
  'd3,c5,d6': { bestMove: [5, 3], name: 'Cow' }, // f5
  'd3,c5,d6,f5': { bestMove: [2, 5], name: 'Cow Line' }, // c3
  'd3,c5,d6,f5,c3': { bestMove: [2, 4], name: 'Cow Extension' }, // c4

  // --- Snake Opening (d3, c3, c4, e3) ---
  'd3,c3,c4,e3': { bestMove: [3, 6], name: 'Snake' }, // d2
  'd3,c3,c4,e3,d2': { bestMove: [4, 2], name: 'Snake Line' }, // e6
  'd3,c3,c4,e3,d2,e6': { bestMove: [2, 3], name: 'Snake Extended' }, // c5

  // --- Shaman/Chimney Opening (d3, e3) ---
  'd3,e3': { bestMove: [5, 3], name: 'Shaman/Chimney' }, // f5
  'd3,e3,f5': { bestMove: [5, 2], name: 'Shaman Line' }, // f6
  'd3,e3,f5,f6': { bestMove: [4, 2], name: 'Shaman Extended' }, // e6
  'd3,e3,f5,f6,e6': { bestMove: [2, 5], name: 'Shaman Deep' }, // c3

  // --- Buffalo Opening (d3, c5, b5) ---
  'd3,c5,b5': { bestMove: [5, 3], name: 'Buffalo' }, // f5
  'd3,c5,b5,f5': { bestMove: [4, 5], name: 'Buffalo Line' }, // e3

  // --- Bat Opening (d3, c5, b4) ---
  'd3,c5,b4': { bestMove: [5, 3], name: 'Bat' }, // f5

  // ============================================================
  // PERPENDICULAR OPENING FAMILY (f5, d6)
  // ============================================================

  // --- Alternative first move ---
  f5: { bestMove: [3, 2], name: 'Perpendicular' }, // d6
  'f5,d6': { bestMove: [2, 3], name: 'Perpendicular Line' }, // c5
  'f5,d6,c5': { bestMove: [5, 4], name: 'Perpendicular Main' }, // f4
  'f5,d6,c5,f4': { bestMove: [4, 5], name: 'Rose Opening' }, // e3
  'f5,d6,c5,f4,e3': { bestMove: [3, 5], name: 'Rose Line' }, // d3
  'f5,d6,c5,f4,e3,d3': { bestMove: [5, 2], name: 'Rose Extended' }, // f6

  // --- Inoue Opening ---
  'f5,d6,c5,f4,e3,c6': { bestMove: [3, 5], name: 'Inoue Opening' }, // d3

  // --- Central Tiger ---
  'f5,d6,c3': { bestMove: [3, 5], name: 'Central Tiger' }, // d3
  'f5,d6,c3,d3': { bestMove: [2, 4], name: 'Central Tiger Line' }, // c4
  'f5,d6,c3,d3,c4': { bestMove: [2, 3], name: 'Central Tiger Extended' }, // c5

  // ============================================================
  // PARALLEL OPENING FAMILY (c4) - generally weaker
  // ============================================================

  c4: { bestMove: [4, 5], name: 'Parallel' }, // e3
  'c4,e3': { bestMove: [5, 4], name: 'Parallel Line' }, // f4
  'c4,e3,f4': { bestMove: [2, 5], name: 'Parallel Response' }, // c3
  'c4,e3,f4,c3': { bestMove: [3, 5], name: 'Parallel Extended' }, // d3

  // --- Rose Opening (c4, c5) ---
  'c4,c5': { bestMove: [4, 5], name: 'Rose' }, // e3
  'c4,c5,e3': { bestMove: [4, 2], name: 'Rose Line' }, // e6
  'c4,c5,e3,e6': { bestMove: [3, 2], name: 'Rose Extended' }, // d6

  // --- Heath Opening (c4, c3) ---
  'c4,c3': { bestMove: [3, 5], name: 'Heath' }, // d3
  'c4,c3,d3': { bestMove: [2, 3], name: 'Heath Line' }, // c5
  'c4,c3,d3,c5': { bestMove: [1, 5], name: 'Heath Extended' }, // b3

  // ============================================================
  // E6 OPENING VARIATIONS
  // ============================================================

  e6: { bestMove: [5, 3], name: 'E6 Opening' }, // f5
  'e6,f5': { bestMove: [5, 4], name: 'E6-F5 Line' }, // f4
  'e6,f5,f4': { bestMove: [4, 5], name: 'E6 Main Line' }, // e3
  'e6,f5,f4,e3': { bestMove: [3, 5], name: 'E6 Extended' }, // d3

  // --- E6, d6 variation ---
  'e6,d6': { bestMove: [2, 3], name: 'E6-D6' }, // c5
  'e6,d6,c5': { bestMove: [2, 4], name: 'E6-D6 Line' }, // c4

  // ============================================================
  // ADDITIONAL COMMON LINES
  // ============================================================

  // --- F5 opening with f6 response ---
  'f5,f6': { bestMove: [4, 5], name: 'F5-F6' }, // e3
  'f5,f6,e3': { bestMove: [3, 2], name: 'F5-F6 Line' }, // d6
  'f5,f6,e3,d6': { bestMove: [2, 5], name: 'F5-F6 Extended' }, // c3

  // --- F5 opening with f4 response ---
  'f5,f4': { bestMove: [4, 5], name: 'Parallel F5' }, // e3
  'f5,f4,e3': { bestMove: [2, 2], name: 'Parallel F5 Line' }, // c6

  // --- D3, e3, c4 line ---
  'd3,e3,c4': { bestMove: [2, 5], name: 'Diagonal-Parallel Hybrid' }, // c3

  // --- D3, c3, b4 line ---
  'd3,c3,b4': { bestMove: [2, 4], name: 'Tiger-Bat Hybrid' }, // c4

  // --- D3, c3, d2 line ---
  'd3,c3,d2': { bestMove: [4, 5], name: 'Early D2 Response' }, // e3
};

/**
 * Convert move coordinate to algebraic notation
 * [col, row] where row 0 = top → notation row 8
 */
export function moveToNotation(move: [number, number]): string {
  const [col, row] = move;
  const colLetter = String.fromCharCode(97 + col); // a-h
  const rowNumber = 8 - row; // row 0 = 8, row 7 = 1
  return `${colLetter}${rowNumber}`;
}

/**
 * Convert algebraic notation to coordinate
 * d3 → [3, 5] (col d = 3, row 3 from bottom = row index 5)
 */
export function notationToMove(notation: string): [number, number] {
  if (notation.length < 2) {
    throw new Error(
      `Invalid move notation "${notation}": expected at least 2 characters (e.g., "d3").`
    );
  }

  const colChar = notation.charAt(0).toLowerCase();
  if (colChar < 'a' || colChar > 'h') {
    throw new Error(`Invalid move notation "${notation}": column must be between "a" and "h".`);
  }

  const rowNumber = parseInt(notation.slice(1), 10);
  if (Number.isNaN(rowNumber) || rowNumber < 1 || rowNumber > 8) {
    throw new Error(`Invalid move notation "${notation}": row must be a number between 1 and 8.`);
  }

  const col = colChar.charCodeAt(0) - 97; // a=0, b=1, ...
  const row = 8 - rowNumber; // 8→0, 7→1, ... 1→7
  return [col, row];
}

/**
 * Build sequence key from move history
 */
export function buildSequenceKey(moves: Array<{ coordinate: [number, number] }>): string {
  return moves.map((m) => moveToNotation(m.coordinate)).join(',');
}

/**
 * Look up best move from opening book
 * @param moveHistory - Array of previous moves
 * @returns Best move coordinate or null if not in book
 */
export function lookupOpeningBook(
  moveHistory: Array<{ coordinate: [number, number] }>
): [number, number] | null {
  const key = buildSequenceKey(moveHistory);
  const entry = OPENING_BOOK[key];

  if (entry) {
    return entry.bestMove;
  }

  return null;
}

/**
 * Get opening name for current position
 */
export function getOpeningName(
  moveHistory: Array<{ coordinate: [number, number] }>
): string | null {
  const key = buildSequenceKey(moveHistory);
  const entry = OPENING_BOOK[key];
  return entry?.name || null;
}

/**
 * Get the number of positions in the opening book
 */
export function getOpeningBookSize(): number {
  return Object.keys(OPENING_BOOK).length;
}
