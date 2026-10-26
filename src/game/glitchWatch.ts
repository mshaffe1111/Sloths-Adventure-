/**
 * glitchWatch — small detectors the control test uses to put glitches from real phones in the log (playRecorder.ts), for a QA team that
 * reads the log from a sheet and cannot see the screen. Pure: no window, no clock of their own (the caller passes the time in ms), and
 * nothing allocated per frame (fixed ring buffers), so feeding them every frame costs next to nothing. The QA guide to the lines they
 * produce is tools/playtesters/LOG_EVENTS.md.
 */

/** how often one kind of line may be logged, and how many of it a session keeps */
export const RATE_MS = 1000;
export const CAP_DEFAULT = 50;
export const CAPS: Record<string, number> = {
  err: 30,
  stall: 120,
  long: 80,
  hidden: 60,
  shown: 60,
  screen: 40,
  fullscreen: 30,
  contextlost: 10,
  contextrestored: 10,
  quality: 30,
  blank: 80,
  camjump: 40,
  blink: 30,
  jitter: 40,
  flipflop: 40,
};

/**
 * Each kind at most once a second, and at most its cap a session. `allow` returns -1 when the line must be dropped; otherwise how many of
 * that kind were dropped since the last one kept (so the line can say "+3"). Reaching the cap is reported once (`capped`).
 */
export class RateLimiter {
  private last = new Map<string, number>();
  private count = new Map<string, number>();
  private dropped = new Map<string, number>();
  /** set to a kind the moment it reaches its cap (the caller logs that once, then clears it) */
  capped = '';
  constructor(private readonly rateMs = RATE_MS, private readonly caps: Record<string, number> = CAPS, private readonly capDefault = CAP_DEFAULT) {}

  allow(kind: string, now: number): number {
    const n = this.count.get(kind) ?? 0;
    const cap = this.caps[kind] ?? this.capDefault;
    if (n >= cap) return -1;
    const last = this.last.get(kind);
    if (last !== undefined && now - last < this.rateMs) {
      this.dropped.set(kind, (this.dropped.get(kind) ?? 0) + 1);
      return -1;
    }
    this.last.set(kind, now);
    this.count.set(kind, n + 1);
    if (n + 1 === cap) this.capped = kind;
    const d = this.dropped.get(kind) ?? 0;
    if (d) this.dropped.set(kind, 0);
    return d;
  }

  /** ms until a kind may be logged again (0: now) */
  wait(kind: string, now: number): number {
    const last = this.last.get(kind);
    return last === undefined ? 0 : Math.max(0, this.rateMs - (now - last));
  }

  /** the kind has reached its cap for the session */
  full(kind: string): boolean {
    return (this.count.get(kind) ?? 0) >= (this.caps[kind] ?? this.capDefault);
  }

  /** how many of a kind were kept this session */
  kept(kind: string): number {
    return this.count.get(kind) ?? 0;
  }
}

/** a short error line: the message, then file:line:col (just the file's name), at most `max` characters */
export function errLine(message: unknown, file?: string, line?: number, col?: number, max = 160): string {
  let m = typeof message === 'string' ? message : message instanceof Error ? `${message.name}: ${message.message}` : String(message);
  m = m.replace(/\s+/g, ' ').trim();
  const f = file ? file.split(/[?#]/)[0].split('/').pop() : '';
  const at = f ? ` @${f}${line ? `:${line}` : ''}${col ? `:${col}` : ''}` : '';
  const room = Math.max(20, max - at.length);
  if (m.length > room) m = m.slice(0, room - 1) + '…';
  return (m + at).slice(0, max);
}

/** where an Error was thrown, from its stack: the first frame's file, line and column (the format differs by browser) */
export function errWhere(err: unknown): { file?: string; line?: number; col?: number } {
  const stack = err instanceof Error && typeof err.stack === 'string' ? err.stack : '';
  const m = /([^\s()@]+):(\d+):(\d+)\)?\s*$/m.exec(stack.split('\n').slice(0, 4).join('\n'));
  return m ? { file: m[1], line: Number(m[2]), col: Number(m[3]) } : {};
}

/** the same error message at most `times` a session */
export class ErrSeen {
  private seen = new Map<string, number>();
  constructor(private readonly times = 3) {}
  /** true when this message may be logged again */
  take(key: string): boolean {
    const n = this.seen.get(key) ?? 0;
    if (n >= this.times) return false;
    this.seen.set(key, n + 1);
    return true;
  }
}

const RING = 32;

/**
 * Shaking back and forth along one axis (the camera, or Pokey): the motion flips direction more than `flips` times inside `windowMs`
 * while everything it reached stays inside `amp` px. A move smaller than `still` px is no move at all (rounding, a clamp settling).
 * Normal following, a pan or a swing moves much further between turns; a jitter is many turns in a few pixels.
 */
export class JitterWatch {
  private prev = NaN;
  private dir = 0;
  private t = new Float64Array(RING);
  private v = new Float64Array(RING);
  private head = 0;
  private n = 0;
  /** the spread of the turns when it last fired (px), for the log line */
  span = 0;
  /** turns counted when it last fired */
  turns = 0;
  constructor(
    private readonly flips = 6,
    private readonly amp = 12,
    private readonly windowMs = 1000,
    private readonly still = 0.05,
  ) {}

  reset() {
    this.prev = NaN;
    this.dir = 0;
    this.n = 0;
  }

  /** one sample (position, ms); true when it is shaking (and the count starts over) */
  feed(pos: number, now: number): boolean {
    const prev = this.prev;
    this.prev = pos;
    if (prev !== prev) return false; // NaN: the first sample
    const d = pos - prev;
    if (d < this.still && d > -this.still) return false;
    const dir = d > 0 ? 1 : -1;
    const was = this.dir;
    this.dir = dir;
    if (was === 0 || was === dir) return false;
    // a turn: kept with where it turned
    this.t[this.head] = now;
    this.v[this.head] = prev;
    this.head = (this.head + 1) % RING;
    if (this.n < RING) this.n++;
    // the turns inside the window, and how far apart they lie
    let count = 0;
    let lo = Infinity;
    let hi = -Infinity;
    for (let k = 1; k <= this.n; k++) {
      const i = (this.head - k + RING) % RING;
      if (now - this.t[i] > this.windowMs) break;
      count++;
      const x = this.v[i];
      if (x < lo) lo = x;
      if (x > hi) hi = x;
    }
    if (count > this.flips && hi - lo < this.amp) {
      this.span = hi - lo;
      this.turns = count;
      this.n = 0;
      return true;
    }
    return false;
  }
}

/**
 * Pokey's state see-sawing in one spot (standing / falling at a platform's edge is the classic): the state changes more than `flips`
 * times inside `windowMs` while he stays inside `spread` px across. `a` and `b` are the last two states, for the log line.
 */
export class FlipFlopWatch {
  private cur = '';
  private t = new Float64Array(RING);
  private x = new Float64Array(RING);
  private head = 0;
  private n = 0;
  a = '';
  b = '';
  changes = 0;
  constructor(
    private readonly flips = 6,
    private readonly spread = 24,
    private readonly windowMs = 1000,
  ) {}

  reset() {
    this.cur = '';
    this.n = 0;
  }

  /** his state this tick (a short code; the same string each time costs nothing) and x; true when it is flip-flopping */
  feed(state: string, x: number, now: number): boolean {
    if (state === this.cur) return false;
    const prev = this.cur;
    this.cur = state;
    if (!prev) return false;
    this.t[this.head] = now;
    this.x[this.head] = x;
    this.head = (this.head + 1) % RING;
    if (this.n < RING) this.n++;
    let count = 0;
    let lo = Infinity;
    let hi = -Infinity;
    for (let k = 1; k <= this.n; k++) {
      const i = (this.head - k + RING) % RING;
      if (now - this.t[i] > this.windowMs) break;
      count++;
      const v = this.x[i];
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
    if (count > this.flips && hi - lo < this.spread) {
      this.a = prev;
      this.b = state;
      this.changes = count;
      this.n = 0;
      return true;
    }
    return false;
  }
}

/**
 * A piece of the HUD or an overlay appearing over and over: shown (mounted, or a new line in it) more than `times` times inside
 * `windowMs`. True when it is blinking (and its count starts over).
 */
export class BlinkWatch {
  private seen = new Map<string, number[]>();
  constructor(
    private readonly times = 4,
    private readonly windowMs = 2000,
  ) {}

  shown(name: string, now: number): boolean {
    let ts = this.seen.get(name);
    if (!ts) this.seen.set(name, (ts = []));
    ts.push(now);
    while (ts.length && now - ts[0] > this.windowMs) ts.shift();
    if (ts.length > this.times) {
      ts.length = 0;
      return true;
    }
    return false;
  }
}

/** the frame times of one 5 s window: mean and spread (standard deviation), and how many were over `slowMs` */
export function frameSpread(frames: ArrayLike<number>, slowMs = 50): { mean: number; sd: number; over: number } {
  const n = frames.length;
  if (!n) return { mean: 0, sd: 0, over: 0 };
  let sum = 0;
  let over = 0;
  for (let i = 0; i < n; i++) {
    sum += frames[i];
    if (frames[i] > slowMs) over++;
  }
  const mean = sum / n;
  let sq = 0;
  for (let i = 0; i < n; i++) sq += (frames[i] - mean) ** 2;
  return { mean, sd: Math.sqrt(sq / n), over };
}
