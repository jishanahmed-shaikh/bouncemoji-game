import { describe, expect, it } from 'vitest';
import {
  BOARD_W,
  BREAK_CHANCE_MAX,
  PLATFORM_W_FLOOR,
  PLATFORM_W_START,
  breakChanceForScore,
  createGame,
  platformWidthForScore,
  restart,
  spawnPlatformAt,
} from '../src/game/state';

describe('platformWidthForScore', () => {
  it('starts at the full width', () => {
    expect(platformWidthForScore(0)).toBe(PLATFORM_W_START);
  });

  it('shrinks with score but never below the floor', () => {
    expect(platformWidthForScore(1000)).toBe(PLATFORM_W_FLOOR);
  });
});

describe('breakChanceForScore', () => {
  it('rises with score and caps at the max', () => {
    expect(breakChanceForScore(0)).toBeLessThan(breakChanceForScore(50));
    expect(breakChanceForScore(10000)).toBe(BREAK_CHANCE_MAX);
  });
});

describe('spawnPlatformAt', () => {
  it('keeps the platform fully inside the board width', () => {
    const p = spawnPlatformAt(-100, 0, () => 0.9);
    expect(p.x).toBeGreaterThanOrEqual(0);
    expect(p.x + p.w).toBeLessThanOrEqual(BOARD_W);
  });

  it('picks a break platform when the roll beats the break chance', () => {
    const p = spawnPlatformAt(-100, 50, () => 0.001);
    expect(p.kind).toBe('break');
  });
});

describe('createGame / restart', () => {
  it('starts on TITLE with the player resting on the first platform', () => {
    const state = createGame(() => 0.5);
    const first = state.platforms[0]!;
    expect(state.phase).toBe('TITLE');
    expect(state.player.x).toBeCloseTo(first.x + first.w / 2, 5);
  });

  it('resets score and phase', () => {
    const state = createGame(() => 0.5);
    state.score = 42;
    state.phase = 'GAME_OVER';
    restart(state, () => 0.5);
    expect(state.score).toBe(0);
    expect(state.phase).toBe('TITLE');
  });
});
