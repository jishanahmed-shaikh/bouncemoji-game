import type { Input } from './input';
import {
  BOARD_H,
  BOUNCE_VY,
  CAMERA_THRESHOLD_Y,
  GRAVITY,
  PLAYER_R,
  SCROLL_PER_POINT,
  restart,
  spawnPlatformAt,
  type GameState,
} from './state';
import { landsOn, wrapX } from './physics';

export interface LoopHooks {
  onBounce(score: number): void;
  onBreak(): void;
  onMilestone(): void;
  onGameOver(score: number): void;
}

const FOLLOW_RATE = 18;
const SQUASH_DECAY = 7;
const SPAWN_LOOKAHEAD = 200;

export function step(state: GameState, input: Input, dt: number, hooks: LoopHooks): void {
  if (state.phase === 'TITLE') {
    if (input.consumeTap()) {
      state.phase = 'PLAYING';
      state.player.vy = BOUNCE_VY;
    }
    return;
  }
  if (state.phase === 'GAME_OVER') {
    if (input.consumeTap()) restart(state, state.rng);
    return;
  }

  const scoreBefore = state.score;
  const player = state.player;
  if (input.touching) player.targetX = input.x;
  const follow = 1 - Math.exp(-FOLLOW_RATE * dt);
  player.facingDir = player.targetX > player.x + 1 ? 1 : player.targetX < player.x - 1 ? -1 : player.facingDir;
  player.x = wrapX(player.x + (player.targetX - player.x) * follow);
  player.squash = Math.max(0, player.squash - SQUASH_DECAY * dt);

  const prevY = player.y;
  player.vy += GRAVITY * dt;
  player.y += player.vy * dt;

  for (const platform of state.platforms) {
    if (landsOn(player.x, prevY, player.y, player.vy, platform)) {
      player.y = platform.y - PLAYER_R;
      player.vy = BOUNCE_VY;
      player.squash = 1;
      hooks.onBounce(state.score);
      if (platform.kind === 'break') {
        platform.broken = true;
        hooks.onBreak();
      }
      break;
    }
  }

  if (player.y < CAMERA_THRESHOLD_Y) {
    const shift = CAMERA_THRESHOLD_Y - player.y;
    player.y = CAMERA_THRESHOLD_Y;
    for (const platform of state.platforms) platform.y += shift;
    state.scrollY += shift;
    state.score = Math.floor(state.scrollY / SCROLL_PER_POINT);
    if (Math.floor(state.score / 10) > Math.floor(scoreBefore / 10)) hooks.onMilestone();
  }

  let topY = Math.min(...state.platforms.map((p) => p.y));
  while (topY > -SPAWN_LOOKAHEAD) {
    topY -= 120 + state.rng() * 50;
    state.platforms.push(spawnPlatformAt(topY, state.score, state.rng));
  }
  if (state.platforms.length > 40) {
    state.platforms = state.platforms.filter((p) => p.y < BOARD_H + 150);
  }

  if (player.y - PLAYER_R > BOARD_H) {
    state.phase = 'GAME_OVER';
    hooks.onGameOver(state.score);
  }
}
