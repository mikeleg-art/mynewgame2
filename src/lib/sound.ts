/**
 * Tiny WebAudio synth — zero audio assets, all sounds generated on the fly.
 * AudioContext is created lazily on the first user gesture (browser policy).
 */

class SoundFX {
  private ctx: AudioContext | null = null;
  enabled = true;

  private ac(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  /** Warm up on first user interaction. */
  unlock(): void {
    this.ac();
  }

  private tone(
    freq: number,
    dur: number,
    opts: { type?: OscillatorType; gain?: number; delay?: number; slideTo?: number } = {}
  ): void {
    if (!this.enabled) return;
    const ctx = this.ac();
    if (!ctx) return;
    const { type = 'sine', gain = 0.12, delay = 0, slideTo } = opts;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  private noise(dur: number, gain = 0.08, delay = 0): void {
    if (!this.enabled) return;
    const ctx = this.ac();
    if (!ctx) return;
    const t0 = ctx.currentTime + delay;
    const frames = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const g = ctx.createGain();
    g.gain.value = gain;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    src.connect(filter).connect(g).connect(ctx.destination);
    src.start(t0);
  }

  click(): void {
    this.tone(700, 0.06, { type: 'triangle', gain: 0.06 });
  }

  place(): void {
    this.noise(0.08, 0.1);
    this.tone(190, 0.1, { type: 'triangle', gain: 0.14, slideTo: 120 });
  }

  invalid(): void {
    this.tone(160, 0.12, { type: 'square', gain: 0.05, slideTo: 110 });
  }

  /** Ascending sparkle; more lines = longer run. */
  clear(lines: number): void {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1568];
    const n = Math.min(2 + lines, notes.length);
    for (let i = 0; i < n; i++) {
      this.tone(notes[i], 0.16, { type: 'triangle', gain: 0.11, delay: i * 0.055 });
    }
    this.noise(0.15, 0.05);
  }

  combo(streak: number): void {
    const base = 660 * Math.pow(1.06, Math.min(streak, 10));
    this.tone(base, 0.1, { type: 'sine', gain: 0.09 });
    this.tone(base * 1.25, 0.12, { type: 'sine', gain: 0.09, delay: 0.07 });
  }

  levelUp(): void {
    const notes = [392, 523.25, 659.25, 783.99];
    notes.forEach((f, i) => this.tone(f, 0.14, { type: 'square', gain: 0.06, delay: i * 0.09 }));
  }

  gameOver(): void {
    const notes = [523.25, 415.3, 329.63, 261.63];
    notes.forEach((f, i) => this.tone(f, 0.22, { type: 'triangle', gain: 0.1, delay: i * 0.16 }));
  }

  best(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => this.tone(f, 0.16, { type: 'triangle', gain: 0.12, delay: i * 0.1 }));
  }
}

export const sfx = new SoundFX();
