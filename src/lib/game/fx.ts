/**
 * Tiny canvas particle engine for Blocky Pop!
 * Zero dependencies — stars, hearts, sparkles and confetti drawn on the fly.
 * The canvas is attached by the GameScreen and shared app-wide via singleton.
 */

type Shape = 'star' | 'heart' | 'circle' | 'spark' | 'confetti';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  g: number;
  drag: number;
  age: number;
  ttl: number;
  size: number;
  color: string;
  shape: Shape;
  rot: number;
  vr: number;
  wobble: number;
};

export type BurstOpts = {
  count?: number;
  colors?: string[];
  shapes?: Shape[];
  speed?: number;
  spread?: number;
  gravity?: number;
  size?: number;
  ttl?: number;
  angle?: number;
};

export type RainOpts = {
  count?: number;
  colors?: string[];
  duration?: number;
  speed?: number;
};

const TAU = Math.PI * 2;

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

class FXEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private parts: Particle[] = [];
  private raf = 0;
  private last = 0;
  private raining = 0; // remaining rain emitter time (ms)

  attach(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', this.resize);
  }

  detach(): void {
    this.canvas = null;
    this.ctx = null;
    this.parts = [];
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    window.removeEventListener('resize', this.resize);
  }

  private resize = (): void => {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(window.innerWidth * dpr);
    this.canvas.height = Math.floor(window.innerHeight * dpr);
    this.canvas.style.width = `${window.innerWidth}px`;
    this.canvas.style.height = `${window.innerHeight}px`;
    if (this.ctx) this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  /** Radial explosion of cute shapes. */
  burst(x: number, y: number, opts: BurstOpts = {}): void {
    const {
      count = 10,
      colors = ['#ffffff'],
      shapes = ['circle', 'spark'],
      speed = 240,
      spread = TAU,
      gravity = 620,
      size = 7,
      ttl = 0.8,
      angle = -Math.PI / 2,
    } = opts;
    for (let i = 0; i < count; i++) {
      const a = angle + rand(-spread / 2, spread / 2);
      const v = speed * rand(0.45, 1.15);
      this.parts.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        g: gravity,
        drag: rand(0.988, 0.996),
        age: 0,
        ttl: ttl * rand(0.7, 1.25),
        size: size * rand(0.55, 1.35),
        color: pick(colors),
        shape: pick(shapes),
        rot: rand(0, TAU),
        vr: rand(-7, 7),
        wobble: rand(0, TAU),
      });
    }
    this.kick();
  }

  /** Confetti rain from the top of the screen. */
  rain(opts: RainOpts = {}): void {
    const { count = 80, colors = ['#ffffff'], duration = 1600, speed = 160 } = opts;
    this.rainColors = colors;
    this.rainSpeed = speed;
    this.raining = Math.max(this.raining, duration);
    const perTick = Math.max(1, Math.round(count / (duration / 16)));
    this.rainPerTick = perTick;
    this.kick();
  }

  private rainColors: string[] = ['#ffffff'];
  private rainSpeed = 160;
  private rainPerTick = 4;

  private kick(): void {
    if (!this.ctx) return;
    if (!this.raf) {
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.tick);
    }
  }

  private tick = (now: number): void => {
    const ctx = this.ctx;
    if (!ctx || !this.canvas) {
      this.raf = 0;
      return;
    }
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;

    // emit rain while active
    if (this.raining > 0) {
      this.raining -= dt * 1000;
      for (let i = 0; i < this.rainPerTick; i++) {
        this.parts.push({
          x: rand(0, window.innerWidth),
          y: rand(-40, -10),
          vx: rand(-40, 40),
          vy: this.rainSpeed * rand(0.7, 1.4),
          g: 260,
          drag: 0.995,
          age: 0,
          ttl: rand(1.6, 2.6),
          size: rand(5, 10),
          color: pick(this.rainColors),
          shape: pick(['confetti', 'star', 'heart', 'circle'] as Shape[]),
          rot: rand(0, TAU),
          vr: rand(-6, 6),
          wobble: rand(0, TAU),
        });
      }
      if (this.raining <= 0) this.raining = 0;
    }

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    let alive = false;
    for (const p of this.parts) {
      p.age += dt;
      if (p.age >= p.ttl) continue;
      alive = true;
      p.vy += p.g * dt;
      p.vx *= p.drag;
      p.vy *= p.drag;
      p.x += p.vx * dt + Math.sin(p.wobble + p.age * 9) * 14 * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      const k = 1 - p.age / p.ttl; // life ratio
      ctx.save();
      ctx.globalAlpha = Math.min(1, k * 1.8);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      const s = p.size * (0.5 + 0.5 * k);
      switch (p.shape) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(0, 0, s / 2, 0, TAU);
          ctx.fill();
          break;
        case 'spark':
          ctx.beginPath();
          ctx.moveTo(0, -s / 2);
          ctx.lineTo(s / 5, 0);
          ctx.lineTo(0, s / 2);
          ctx.lineTo(-s / 5, 0);
          ctx.closePath();
          ctx.fill();
          break;
        case 'confetti':
          ctx.fillRect(-s / 2, -s / 3.4, s, s / 1.7);
          break;
        case 'star':
          drawStar(ctx, s);
          break;
        case 'heart':
          drawHeart(ctx, s);
          break;
      }
      ctx.restore();
    }
    this.parts = this.parts.filter((p) => p.age < p.ttl && p.y < window.innerHeight + 60);

    if (alive || this.raining > 0) {
      this.raf = requestAnimationFrame(this.tick);
    } else {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      this.raf = 0;
    }
  };
}

function drawStar(ctx: CanvasRenderingContext2D, s: number): void {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? s / 2 : s / 4.4;
    const a = (i / 10) * TAU - Math.PI / 2;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function drawHeart(ctx: CanvasRenderingContext2D, s: number): void {
  const w = s / 1.5;
  ctx.beginPath();
  ctx.moveTo(0, w * 0.32);
  ctx.bezierCurveTo(w * 0.5, -w * 0.28, w * 1.05, w * 0.34, 0, w * 0.95);
  ctx.bezierCurveTo(-w * 1.05, w * 0.34, -w * 0.5, -w * 0.28, 0, w * 0.32);
  ctx.closePath();
  ctx.fill();
}

export const fx = new FXEngine();

/** Handy palettes */
export const CANDY = ['#ff7eb9', '#ffd93d', '#6ee7b7', '#7cc0ff', '#c4a5ff', '#ff9d76', '#ffffff'];
export const GOLD = ['#ffd93d', '#ffe98a', '#ffb300', '#ffffff'];
