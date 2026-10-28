export class Sound {
  private ctx: AudioContext | null = null;

  private ensure(): AudioContext | null {
    if (this.ctx) return this.ctx;
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    this.ctx = new Ctx();
    return this.ctx;
  }

  unlock(): void {
    const ctx = this.ensure();
    if (ctx && ctx.state === 'suspended') void ctx.resume();
  }

  private tone(freq: number, duration: number, opts: { type?: OscillatorType; gain?: number; glideTo?: number; delay?: number } = {}): void {
    const ctx = this.ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime + (opts.delay ?? 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = opts.type ?? 'sine';
    osc.frequency.setValueAtTime(freq, t0);
    if (opts.glideTo) osc.frequency.linearRampToValueAtTime(opts.glideTo, t0 + duration);
    const peak = opts.gain ?? 0.12;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(peak, t0 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  bounce(score = 0): void {
    const base = 220 + Math.min(score, 50) * 3;
    this.tone(base, 0.09, { type: 'triangle', gain: 0.12, glideTo: base * 2 });
  }

  crack(): void {
    this.tone(500, 0.1, { type: 'square', gain: 0.07, glideTo: 220 });
  }

  crash(): void {
    this.tone(180, 0.4, { type: 'sawtooth', gain: 0.12, glideTo: 30 });
  }

  milestone(): void {
    this.tone(660, 0.1, { type: 'sine', gain: 0.1 });
    this.tone(880, 0.12, { type: 'sine', gain: 0.09, delay: 0.08 });
  }

  newBest(): void {
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) =>
      this.tone(freq, 0.14, { type: 'triangle', gain: 0.1, delay: i * 0.09 }),
    );
  }

  startPad(): void {
    const ctx = this.ensure();
    if (!ctx) return;
    const master = ctx.createGain();
    master.gain.value = 0;
    master.gain.linearRampToValueAtTime(0.014, ctx.currentTime + 2);
    master.connect(ctx.destination);
    for (const freq of [130.81, 196]) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.connect(master);
      osc.start();
    }
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.08;
    lfoGain.gain.value = 0.007;
    lfo.connect(lfoGain).connect(master.gain);
    lfo.start();
  }
}
