import { BOARD_H, BOARD_W, PLAYER_R, type GameState, type Platform } from '../game/state';

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const bgImg = new Image();
let bgReady = false;
bgImg.onload = () => { bgReady = true; };
bgImg.src = 'assets/bg.jpg';

export function drawSky(ctx: CanvasRenderingContext2D): void {
  if (bgReady) {
    ctx.drawImage(bgImg, 0, 0, BOARD_W, BOARD_H);
  } else {
    const grad = ctx.createLinearGradient(0, 0, 0, BOARD_H);
    grad.addColorStop(0, 'hsl(210, 70%, 14%)');
    grad.addColorStop(1, 'hsl(240, 60%, 6%)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, BOARD_W, BOARD_H);
  }
  const vignette = ctx.createRadialGradient(BOARD_W / 2, BOARD_H * 0.4, BOARD_H * 0.25, BOARD_W / 2, BOARD_H * 0.4, BOARD_H * 0.75);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,10,0.45)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, BOARD_W, BOARD_H);
}

const STARS = Array.from({ length: 28 }, (_, i) => ({
  x: (i * 97 + 31) % BOARD_W,
  y: (i * 53) % 2000,
  r: 1.5 + (i % 3),
}));

export function drawParallax(ctx: CanvasRenderingContext2D, scrollY: number): void {
  const offset = scrollY * 0.4;
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  for (const s of STARS) {
    const y = ((s.y + offset) % 2000) - 360;
    ctx.globalAlpha = 0.25 + (s.r / 4) * 0.4;
    ctx.beginPath();
    ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawPad(ctx: CanvasRenderingContext2D, p: Platform): void {
  const isBreak = p.kind === 'break';
  const h = 22;
  const rim = isBreak ? '#ff6b5c' : '#5ad1ff';
  const glow = isBreak ? 'rgba(255,107,92,0.55)' : 'rgba(90,209,255,0.55)';

  ctx.save();

  ctx.shadowColor = glow;
  ctx.shadowBlur = 14;
  const body = ctx.createLinearGradient(0, p.y, 0, p.y + h);
  body.addColorStop(0, isBreak ? '#332027' : '#1b2334');
  body.addColorStop(1, isBreak ? '#1a1115' : '#0d111c');
  ctx.fillStyle = body;
  roundRect(ctx, p.x, p.y, p.w, h, h * 0.4);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.strokeStyle = rim;
  ctx.lineWidth = 2.4;
  ctx.shadowColor = glow;
  ctx.shadowBlur = 8;
  roundRect(ctx, p.x + 1.2, p.y + 1.2, p.w - 2.4, h - 2.4, h * 0.35);
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  roundRect(ctx, p.x + 5, p.y + 3, p.w - 10, h * 0.3, h * 0.15);
  ctx.fill();

  if (isBreak) {
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(p.x + p.w * 0.32, p.y + 2);
    ctx.lineTo(p.x + p.w * 0.46, p.y + h * 0.5);
    ctx.lineTo(p.x + p.w * 0.36, p.y + h - 2);
    ctx.stroke();
  }

  ctx.restore();
}

export function drawPlatforms(ctx: CanvasRenderingContext2D, platforms: Platform[]): void {
  for (const p of platforms) {
    if (p.broken) continue;
    drawPad(ctx, p);
  }
}

export function drawPlayer(ctx: CanvasRenderingContext2D, state: GameState): void {
  const { x, y, squash, facingDir, vy } = state.player;
  const sx = 1 + squash * 0.3;
  const sy = 1 - squash * 0.3;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sx, sy);
  ctx.shadowColor = 'rgba(255,214,92,0.6)';
  ctx.shadowBlur = 16;
  ctx.fillStyle = '#ffd65c';
  ctx.beginPath();
  ctx.arc(0, 0, PLAYER_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  const rising = vy < -100;
  const ex = PLAYER_R * 0.28 * facingDir;
  const ey = rising ? -PLAYER_R * 0.08 : PLAYER_R * 0.02;
  ctx.fillStyle = '#2a1a00';
  ctx.beginPath();
  ctx.arc(ex - PLAYER_R * 0.12, ey - PLAYER_R * 0.1, PLAYER_R * 0.1, 0, Math.PI * 2);
  ctx.arc(ex + PLAYER_R * 0.12, ey - PLAYER_R * 0.1, PLAYER_R * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  if (rising) {
    ctx.arc(ex, ey + PLAYER_R * 0.18, PLAYER_R * 0.14, 0, Math.PI, false);
  } else {
    ctx.arc(ex, ey + PLAYER_R * 0.12, PLAYER_R * 0.14, Math.PI, Math.PI * 2, false);
  }
  ctx.lineWidth = PLAYER_R * 0.08;
  ctx.strokeStyle = '#2a1a00';
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();
}

export function drawHud(ctx: CanvasRenderingContext2D, state: GameState): void {
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff8e8';
  ctx.font = '800 48px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.shadowColor = 'rgba(255,214,92,0.5)';
  ctx.shadowBlur = 14;
  ctx.fillText(`${state.score}`, BOARD_W / 2, 70);
  ctx.shadowBlur = 0;
}

function pillButton(ctx: CanvasRenderingContext2D, cx: number, cy: number, text: string): void {
  ctx.font = '700 26px system-ui, -apple-system, Segoe UI, sans-serif';
  const w = ctx.measureText(text).width + 64;
  ctx.save();
  ctx.shadowColor = 'rgba(255,214,92,0.5)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = '#ffd65c';
  roundRect(ctx, cx - w / 2, cy - 32, w, 64, 32);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#2a1a00';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cx, cy + 2);
  ctx.textBaseline = 'alphabetic';
}

export function drawAvatarBadge(ctx: CanvasRenderingContext2D, avatar: HTMLImageElement | null): void {
  if (!avatar) return;
  const r = 34;
  const cx = 70;
  const cy = 70;
  ctx.save();
  ctx.shadowColor = 'rgba(255,214,92,0.5)';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 3, 0, Math.PI * 2);
  ctx.strokeStyle = '#ffd65c';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(avatar, cx - r, cy - r, r * 2, r * 2);
  ctx.restore();
}

export function drawTitle(ctx: CanvasRenderingContext2D, pulseT: number): void {
  drawSky(ctx);
  drawParallax(ctx, pulseT * 40);
  const cx = BOARD_W / 2;

  ctx.save();
  ctx.translate(cx, 420);
  ctx.scale(1, 1 - Math.abs(Math.sin(pulseT * 2)) * 0.08);
  ctx.shadowColor = 'rgba(255,214,92,0.6)';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#ffd65c';
  ctx.beginPath();
  ctx.arc(0, 0, 60, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#2a1a00';
  ctx.beginPath();
  ctx.arc(-16, -8, 7, 0, Math.PI * 2);
  ctx.arc(16, -8, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#2a1a00';
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(0, 10, 16, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff8e8';
  ctx.shadowColor = 'rgba(255,214,92,0.45)';
  ctx.shadowBlur = 24;
  ctx.font = '800 60px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.fillText('BOUNCEMOJI', cx, 560);
  ctx.shadowBlur = 0;
  ctx.font = '500 20px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.fillStyle = 'rgba(255,248,232,0.75)';
  ctx.fillText('drag to steer · bounce higher', cx, 598);

  const pulse = 1 + Math.sin(pulseT * 4) * 0.06;
  ctx.save();
  ctx.translate(cx, 680);
  ctx.scale(pulse, pulse);
  pillButton(ctx, 0, 0, 'TAP TO START');
  ctx.restore();
}

export function drawGameOver(ctx: CanvasRenderingContext2D, state: GameState, best: number): void {
  ctx.fillStyle = 'rgba(10,6,0,0.78)';
  ctx.fillRect(0, 0, BOARD_W, BOARD_H);
  const cx = BOARD_W / 2;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff8e8';
  ctx.font = '800 48px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.fillText('GAME OVER', cx, BOARD_H / 2 - 120);
  ctx.font = '700 40px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.fillText(`${state.score}`, cx, BOARD_H / 2 - 56);
  ctx.font = '500 18px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.fillStyle = 'rgba(255,248,232,0.75)';
  ctx.fillText(state.score > best ? 'new best!' : `best: ${best}`, cx, BOARD_H / 2 - 24);
  ctx.font = '600 16px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.fillStyle = 'rgba(255,248,232,0.6)';
  ctx.fillText('view leaderboard', cx, BOARD_H / 2 + 8);
  pillButton(ctx, cx, BOARD_H / 2 + 90, 'TAP TO RETRY');
}

export const LEADERBOARD_HIT = { x: BOARD_W / 2 - 90, y: BOARD_H / 2 - 10, w: 180, h: 30 };
