import { describe, test, expect } from 'bun:test';
import { TimeControlManager } from './TimeControlManager';
import { OthelloGameEngine } from './OthelloGameEngine';

describe('TimeControlManager', () => {
  describe('Initialization', () => {
    test('initializes with correct default values', () => {
      const config = { initialTime: 300000, increment: 5000 };
      const timeControl = new TimeControlManager(config);

      const timeRemaining = timeControl.getTimeRemaining();
      expect(timeRemaining.black).toBe(300000);
      expect(timeRemaining.white).toBe(300000);
    });
  });

  describe('Clock Management', () => {
    test('startClock() activates the clock for specified player', async () => {
      const config = { initialTime: 1000, increment: 0 };
      const timeControl = new TimeControlManager(config);

      timeControl.startClock('B');

      await new Promise((resolve) => setTimeout(resolve, 100));

      const time = timeControl.getTimeRemaining();
      expect(time.black).toBeLessThan(1000);
      expect(time.white).toBe(1000);
      timeControl.stopClock();
    });

    test('stopClock() stops the active clock and adds increment', async () => {
      const config = { initialTime: 1000, increment: 500 };
      const timeControl = new TimeControlManager(config);

      timeControl.startClock('B');
      await new Promise((resolve) => setTimeout(resolve, 100));

      timeControl.stopClock();
      const time = timeControl.getTimeRemaining();

      // Time should have increased due to increment
      expect(time.black).toBeGreaterThan(1000);
      expect(time.white).toBe(1000);
    });
  });

  describe('Timeout Detection', () => {
    test('isTimeOut() returns false when time remains', () => {
      const config = { initialTime: 300000, increment: 0 };
      const timeControl = new TimeControlManager(config);

      expect(timeControl.isTimeOut('B')).toBe(false);
      expect(timeControl.isTimeOut('W')).toBe(false);
    });

    test('isTimeOut() returns true when time expires', async () => {
      const config = { initialTime: 50, increment: 0 };
      const timeControl = new TimeControlManager(config);

      timeControl.startClock('B');
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(timeControl.isTimeOut('B')).toBe(true);
      expect(timeControl.isTimeOut('W')).toBe(false);
    });
  });

  describe('Pause and Resume', () => {
    test('pause() stops time from decreasing', async () => {
      const config = { initialTime: 1000, increment: 0 };
      const timeControl = new TimeControlManager(config);

      timeControl.startClock('B');
      await new Promise((resolve) => setTimeout(resolve, 50));

      timeControl.pause();
      const timeBefore = timeControl.getTimeRemaining().black;

      await new Promise((resolve) => setTimeout(resolve, 100));

      const timeAfter = timeControl.getTimeRemaining().black;
      expect(timeAfter).toBe(timeBefore);
    });

    test('resume() continues the clock from where it was paused', async () => {
      const config = { initialTime: 1000, increment: 0 };
      const timeControl = new TimeControlManager(config);

      timeControl.startClock('B');
      await new Promise((resolve) => setTimeout(resolve, 50));

      timeControl.pause();
      const timeAtPause = timeControl.getTimeRemaining().black;

      await new Promise((resolve) => setTimeout(resolve, 100));

      timeControl.resume();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const timeAfterResume = timeControl.getTimeRemaining().black;
      expect(timeAfterResume).toBeLessThan(timeAtPause);
      timeControl.stopClock();
    });
  });

  describe('State Export/Import', () => {
    test('exportState() returns valid JSON string', () => {
      const config = { initialTime: 300000, increment: 5000 };
      const timeControl = new TimeControlManager(config);

      const state = timeControl.exportState();
      expect(() => JSON.parse(state)).not.toThrow();
    });

    test('importState() correctly restores state', async () => {
      const config = { initialTime: 300000, increment: 5000 };
      const timeControl1 = new TimeControlManager(config);

      timeControl1.startClock('B');
      await new Promise((resolve) => setTimeout(resolve, 100));
      timeControl1.stopClock();

      const state = timeControl1.exportState();

      const timeControl2 = new TimeControlManager(config);
      timeControl2.importState(state);

      const time1 = timeControl1.getTimeRemaining();
      const time2 = timeControl2.getTimeRemaining();

      expect(time2.black).toBe(time1.black);
      expect(time2.white).toBe(time1.white);
    });
  });

  describe('Increment System', () => {
    test('zero increment does not add time', async () => {
      const config = { initialTime: 1000, increment: 0 };
      const timeControl = new TimeControlManager(config);

      timeControl.startClock('B');
      await new Promise((resolve) => setTimeout(resolve, 100));

      timeControl.stopClock();
      const time = timeControl.getTimeRemaining().black;

      expect(time).toBeLessThan(1000);
      expect(time).toBeGreaterThan(0);
    });

    test('positive increment adds time after move', async () => {
      const config = { initialTime: 1000, increment: 500 };
      const timeControl = new TimeControlManager(config);

      timeControl.startClock('B');
      const timeBefore = timeControl.getTimeRemaining().black;

      await new Promise((resolve) => setTimeout(resolve, 50));

      timeControl.stopClock();
      const timeAfter = timeControl.getTimeRemaining().black;

      // After stopClock, increment should be added
      expect(timeAfter).toBeGreaterThan(timeBefore);
    });
  });
});

describe('OthelloGameEngine with Time Control', () => {
  describe('Initialization', () => {
    test('initializes with time control enabled', () => {
      const engine = new OthelloGameEngine(undefined, undefined, undefined, {
        initialTime: 5000,
        increment: 100,
      });

      expect(engine.hasTimeControl()).toBe(true);
    });

    test('initializes without time control when config not provided', () => {
      const engine = new OthelloGameEngine();
      expect(engine.hasTimeControl()).toBe(false);
      expect(engine.getTimeRemaining()).toBeNull();
    });

    test('starts with black player clock running', async () => {
      const engine = new OthelloGameEngine(undefined, undefined, undefined, {
        initialTime: 5000,
        increment: 100,
      });

      const time = engine.getTimeRemaining();
      expect(time).not.toBeNull();

      if (time) {
        await new Promise((resolve) => setTimeout(resolve, 100));

        const timeAfter = engine.getTimeRemaining();
        if (timeAfter) {
          expect(timeAfter.black).toBeLessThan(5000);
        }
      }
    });
  });

  describe('Move Integration', () => {
    test('clock switches to next player after move', async () => {
      const engine = new OthelloGameEngine(undefined, undefined, undefined, {
        initialTime: 5000,
        increment: 100,
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const blackTimeBefore = engine.getTimeRemaining();

      // Make a move (black player)
      engine.makeMove([2, 3]);

      const timeAfterMove = engine.getTimeRemaining();

      if (blackTimeBefore && timeAfterMove) {
        // Black's clock should have stopped and received increment
        expect(timeAfterMove.black).toBeGreaterThanOrEqual(blackTimeBefore.black);

        const whiteTimeBefore = timeAfterMove.white;

        // Now white's clock should be running
        await new Promise((resolve) => setTimeout(resolve, 100));

        const finalTime = engine.getTimeRemaining();
        if (finalTime) {
          expect(finalTime.white).toBeLessThan(whiteTimeBefore);
        }
      }
    });

    test('invalid move does not stop the clock', async () => {
      const engine = new OthelloGameEngine(undefined, undefined, undefined, {
        initialTime: 5000,
        increment: 100,
      });

      await new Promise((resolve) => setTimeout(resolve, 50));

      // Try invalid move
      engine.makeMove([0, 0]);

      const timeAfter = engine.getTimeRemaining();

      // Clock should still be running for black
      await new Promise((resolve) => setTimeout(resolve, 50));

      const timeFinal = engine.getTimeRemaining();

      if (timeAfter && timeFinal) {
        expect(timeFinal.black).toBeLessThan(timeAfter.black);
      }
    });
  });

  describe('Pause and Resume', () => {
    test('pauseTime() stops clock', async () => {
      const engine = new OthelloGameEngine(undefined, undefined, undefined, {
        initialTime: 5000,
        increment: 100,
      });

      await new Promise((resolve) => setTimeout(resolve, 50));

      engine.pauseTime();
      const timeBefore = engine.getTimeRemaining();

      await new Promise((resolve) => setTimeout(resolve, 100));

      const timeAfter = engine.getTimeRemaining();

      if (timeBefore && timeAfter) {
        expect(timeAfter.black).toBe(timeBefore.black);
      }
    });

    test('resumeTime() restarts clock', async () => {
      const engine = new OthelloGameEngine(undefined, undefined, undefined, {
        initialTime: 5000,
        increment: 100,
      });

      await new Promise((resolve) => setTimeout(resolve, 50));

      engine.pauseTime();
      const timeBefore = engine.getTimeRemaining();

      await new Promise((resolve) => setTimeout(resolve, 100));

      engine.resumeTime();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const timeAfter = engine.getTimeRemaining();

      if (timeBefore && timeAfter) {
        expect(timeAfter.black).toBeLessThan(timeBefore.black);
      }
    });
  });

  describe('Undo/Redo with Time Control', () => {
    test('undo and redo work with time control', async () => {
      const engine = new OthelloGameEngine(undefined, undefined, undefined, {
        initialTime: 5000,
        increment: 100,
      });

      await new Promise((resolve) => setTimeout(resolve, 50));

      engine.makeMove([2, 3]);
      const timeAfterMove = engine.getTimeRemaining();

      engine.undo();
      engine.redo();

      const timeAfterRedo = engine.getTimeRemaining();

      if (timeAfterMove && timeAfterRedo) {
        // Times should be approximately the same
        expect(Math.abs(timeAfterRedo.black - timeAfterMove.black)).toBeLessThan(200);
        expect(Math.abs(timeAfterRedo.white - timeAfterMove.white)).toBeLessThan(200);
      }
    });
  });

  describe('Reset with Time Control', () => {
    test('reset() restarts time control', async () => {
      const engine = new OthelloGameEngine(undefined, undefined, undefined, {
        initialTime: 5000,
        increment: 100,
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      engine.makeMove([2, 3]);
      engine.reset();

      const time = engine.getTimeRemaining();

      if (time) {
        // Allow for small timing variations (within 100ms)
        expect(time.black).toBeGreaterThanOrEqual(4900);
        expect(time.black).toBeLessThanOrEqual(5000);
        expect(time.white).toBe(5000);

        // Black's clock should be running again
        await new Promise((resolve) => setTimeout(resolve, 100));

        const timeAfter = engine.getTimeRemaining();
        if (timeAfter) {
          expect(timeAfter.black).toBeLessThan(5000);
        }
      }
    });
  });
});
