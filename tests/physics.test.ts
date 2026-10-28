import { describe, expect, it } from 'vitest';
import { landsOn, wrapX } from '../src/game/physics';
import { BOARD_W, PLAYER_R, type Platform } from '../src/game/state';

function platform(x: number, y: number, w = 150): Platform {
  return { x, y, w, kind: 'normal', broken: false };
}

describe('wrapX', () => {
  it('leaves in-bounds x unchanged', () => {
    expect(wrapX(BOARD_W / 2)).toBe(BOARD_W / 2);
  });

  it('wraps off the left edge to the right side', () => {
    expect(wrapX(-PLAYER_R - 5)).toBeCloseTo(BOARD_W + PLAYER_R - 5, 5);
  });

  it('wraps off the right edge to the left side', () => {
    expect(wrapX(BOARD_W + PLAYER_R + 5)).toBeCloseTo(-PLAYER_R + 5, 5);
  });
});

describe('landsOn', () => {
  it('is false while still rising (vy <= 0)', () => {
    expect(landsOn(100, 200, 190, -500, platform(50, 195))).toBe(false);
  });

  it('is true when falling feet cross the platform top with x overlap', () => {
    expect(landsOn(100, 120, 130, 400, platform(50, 160))).toBe(true);
  });

  it('is false when the player is not horizontally over the platform', () => {
    expect(landsOn(500, 120, 130, 400, platform(50, 160, 100))).toBe(false);
  });

  it('is false for an already-broken platform', () => {
    const p = platform(50, 160);
    p.broken = true;
    expect(landsOn(100, 120, 130, 400, p)).toBe(false);
  });
});
