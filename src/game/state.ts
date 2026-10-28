export const BOARD_W = 720;
export const BOARD_H = 1280;
export const PLAYER_R = 34;
export const GRAVITY = 1700;
export const BOUNCE_VY = -820;
export const CAMERA_THRESHOLD_Y = BOARD_H * 0.42;

export const PLATFORM_H = 26;
export const PLATFORM_W_START = 150;
export const PLATFORM_W_FLOOR = 90;
export const PLATFORM_W_SHRINK_PER_PT = 0.6;
export const GAP_MIN = 120;
export const GAP_MAX = 170;
export const BREAK_CHANCE_MAX = 0.28;
export const SCROLL_PER_POINT = 10;

export type Phase = 'TITLE' | 'PLAYING' | 'GAME_OVER';
export type PlatformKind = 'normal' | 'break';

export interface Platform {
  x: number;
  y: number;
  w: number;
  kind: PlatformKind;
  broken: boolean;
}

export interface Player {
  x: number;
  y: number;
  vy: number;
  targetX: number;
  squash: number;
  facingDir: number;
}

export interface GameState {
  phase: Phase;
  player: Player;
  platforms: Platform[];
  scrollY: number;
  score: number;
  rng: () => number;
}

export function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function platformWidthForScore(score: number): number {
  return Math.max(PLATFORM_W_FLOOR, PLATFORM_W_START - score * PLATFORM_W_SHRINK_PER_PT);
}

export function breakChanceForScore(score: number): number {
  return Math.min(BREAK_CHANCE_MAX, 0.04 + score * 0.004);
}

export function spawnPlatformAt(y: number, score: number, rng: () => number): Platform {
  const w = platformWidthForScore(score);
  const x = rng() * (BOARD_W - w);
  const kind: PlatformKind = rng() < breakChanceForScore(score) ? 'break' : 'normal';
  return { x, y, w, kind, broken: false };
}

function initialPlatforms(rng: () => number): Platform[] {
  const platforms: Platform[] = [
    { x: BOARD_W / 2 - PLATFORM_W_START / 2, y: BOARD_H - 120, w: PLATFORM_W_START, kind: 'normal', broken: false },
  ];
  let y = BOARD_H - 120;
  while (y > -200) {
    y -= GAP_MIN + rng() * (GAP_MAX - GAP_MIN);
    platforms.push(spawnPlatformAt(y, 0, rng));
  }
  return platforms;
}

export function createGame(rng: () => number = Math.random): GameState {
  const platforms = initialPlatforms(rng);
  const first = platforms[0]!;
  return {
    phase: 'TITLE',
    player: {
      x: first.x + first.w / 2,
      y: first.y - PLAYER_R,
      vy: 0,
      targetX: first.x + first.w / 2,
      squash: 0,
      facingDir: 1,
    },
    platforms,
    scrollY: 0,
    score: 0,
    rng,
  };
}

export function restart(state: GameState, rng: () => number = Math.random): void {
  const fresh = createGame(rng);
  state.phase = fresh.phase;
  state.player = fresh.player;
  state.platforms = fresh.platforms;
  state.scrollY = fresh.scrollY;
  state.score = fresh.score;
  state.rng = fresh.rng;
}
