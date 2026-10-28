import { BOARD_W, PLAYER_R, type Platform } from './state';

export function wrapX(x: number): number {
  const w = BOARD_W;
  if (x < -PLAYER_R) return x + w + PLAYER_R * 2;
  if (x > w + PLAYER_R) return x - w - PLAYER_R * 2;
  return x;
}

export function landsOn(playerX: number, prevY: number, nextY: number, vy: number, platform: Platform): boolean {
  if (vy <= 0 || platform.broken) return false;
  const feetPrev = prevY + PLAYER_R;
  const feetNext = nextY + PLAYER_R;
  const top = platform.y;
  if (feetPrev > top || feetNext < top) return false;
  return playerX + PLAYER_R * 0.6 > platform.x && playerX - PLAYER_R * 0.6 < platform.x + platform.w;
}
