const TAP_MAX_MOVE = 10;
const TAP_MAX_MS = 300;

export class Input {
  touching = false;
  x = 0;
  private downX = 0;
  private downY = 0;
  private downT = 0;
  tapped = false;

  down(x: number, y: number): void {
    this.touching = true;
    this.x = x;
    this.downX = x;
    this.downY = y;
    this.downT = Date.now();
  }

  move(x: number): void {
    this.x = x;
  }

  up(x: number, y: number): void {
    this.touching = false;
    const moved = Math.hypot(x - this.downX, y - this.downY);
    if (moved < TAP_MAX_MOVE && Date.now() - this.downT < TAP_MAX_MS) this.tapped = true;
  }

  consumeTap(): boolean {
    const t = this.tapped;
    this.tapped = false;
    return t;
  }
}
