/**
 * engineFork (ENG-BOTSIM spike, R-165.462): a COPY of a live engine (engine.ts GameEngine, as RealPlay runs it) that can be stepped
 * forward N frames under a candidate pad without touching the live run. A deep copy of every object the engine reaches, prototypes
 * kept (so the copy runs the engine's own update), with three seams:
 *  - shared, never copied: frozen objects, functions, the canvas and its context, images, audio (they are read, never stepped);
 *  - the engine's OWN function fields (the harness's and the bot's hooks: guide, loseLife, damagePlayer, softFall...) close over the
 *    LIVE engine or run: on the copy they are replaced (the cosmetic no-ops kept, a death noted, the rest the engine's own method);
 *  - Math.random: the copy steps on its own stream (the live run's seeded stream is saved and put back), so a probe never moves a roll.
 */
import { DT } from '../../src/game/realPlay.ts';

type Obj = Record<string | symbol, unknown>;
const SHARE = (v: object): boolean => {
  if (Object.isFrozen(v)) return true;
  const n = v.constructor?.name ?? '';
  return /Canvas|Context|Image|Audio|HTMLElement|Path2D|ImageBitmap|WebGL|OffscreenCanvas|Node$/.test(n);
};

export interface ForkStats { objects: number; ms: number }

/** a deep copy of `root` with its prototypes, cycles and sharing kept (see the file's header) */
export function deepFork<T extends object>(root: T, stats?: ForkStats, seen = new Map<object, unknown>()): T {
  const t0 = performance.now();
  let n = 0;
  const c = (v: unknown): unknown => {
    if (v === null || typeof v !== 'object') return v;
    const hit = seen.get(v);
    if (hit !== undefined) return hit;
    if (SHARE(v)) return v;
    n++;
    if (Array.isArray(v)) {
      const a: unknown[] = new Array(v.length);
      seen.set(v, a);
      for (let i = 0; i < v.length; i++) a[i] = c(v[i]);
      return a;
    }
    if (v instanceof Map) {
      const m = new Map();
      seen.set(v, m);
      for (const [k, x] of v) m.set(c(k), c(x));
      return m;
    }
    if (v instanceof Set) {
      const s = new Set();
      seen.set(v, s);
      for (const x of v) s.add(c(x));
      return s;
    }
    if (ArrayBuffer.isView(v)) {
      const b = (v as unknown as { slice(): unknown }).slice();
      seen.set(v, b);
      return b;
    }
    if (v instanceof Date) return new Date(v.getTime());
    const o = Object.create(Object.getPrototypeOf(v)) as Obj;
    seen.set(v, o);
    for (const k of Reflect.ownKeys(v)) {
      const d = Object.getOwnPropertyDescriptor(v, k)!;
      if ('value' in d) d.value = c(d.value);
      Object.defineProperty(o, k, d);
    }
    return o;
  };
  const out = c(root) as T;
  if (stats) {
    stats.objects = n;
    stats.ms = performance.now() - t0;
  }
  return out;
}

/** the live engine's own function fields, by name (what a copy must not call through) */
export const ownFns = (e: object): string[] => Object.keys(e).filter((k) => typeof (e as Obj)[k] === 'function');

export interface Fork {
  e: Record<string, any>;
  input: Record<string, any>;
  /** a fall into the water, a pit or the mist, or a hurt, on the copy */
  died: string | null;
  stats: ForkStats;
}

/**
 * A copy of RealPlay `sim`'s engine, ready to step (stepFork). `keep`: the live engine's own function fields that are pure no-ops
 * (RealPlay's COSMETIC skips) and may be kept on the copy.
 */
export function forkSim(sim: { e: Record<string, any> }): Fork {
  const live = sim.e;
  const stats: ForkStats = { objects: 0, ms: 0 };
  const e = deepFork(live, stats) as Record<string, any>;
  const proto = Object.getPrototypeOf(live) as Record<string, any>;
  const f: Fork = { e, input: e.input as Record<string, any>, died: null, stats };
  for (const k of ownFns(live)) {
    const fn = live[k] as (...a: unknown[]) => unknown;
    // (RealPlay's cosmetic skips are argument-free no-ops: keep them; anything else is a hook over the live run)
    if (fn.length === 0 && /^\s*\(\)\s*=>\s*\{\s*\}\s*$/.test(fn.toString())) continue;
    if (k === 'loseLife') e[k] = (reason?: string) => { f.died ??= reason ?? 'life'; };
    else if (k === 'softFall') e[k] = () => { f.died ??= 'soft'; return true; };
    else if (k === 'damagePlayer') e[k] = () => { f.died ??= 'hurt'; };
    else if (k === 'guide' || k === 'helpAsk' || k === 'onGuide') e[k] = () => {};
    else if (typeof proto[k] === 'function') delete e[k];
    else e[k] = () => {};
  }
  return f;
}

/** the copy's own Math.random stream (a fixed seed: every probe flies the same) */
const probeRng = (): (() => number) => {
  let s = 0x2545f491;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** one frame of the copy under the FakeInput pad fields (RealPlay.frame's FakeInput branch, the parts a jump and a steer use) */
export function stepFork(f: Fork, pad: { left?: boolean; right?: boolean; jump?: boolean; press?: boolean; up?: boolean; down?: boolean }): void {
  const inp = f.input;
  const s = inp.state as Record<string, unknown>;
  const dir = pad.left && !pad.right ? -1 : pad.right && !pad.left ? 1 : 0;
  if (pad.press || dir !== inp.last.dir || !!pad.down !== inp.last.down || !!pad.up !== inp.last.up) inp.moves++;
  inp.last = { ...inp.last, dir, down: !!pad.down, up: !!pad.up };
  s.left = !!pad.left && !pad.right;
  s.right = !!pad.right && !pad.left;
  s.down = !!pad.down;
  s.up = !!pad.up || !!pad.jump || !!pad.press;
  s.jumpHeld = !!pad.jump || !!pad.press;
  if (pad.press) {
    s.jumpPressed = true;
    inp.jumpBuffer = 0.16;
  }
  const p = f.e.player as Record<string, number>;
  p.invincibleTimer = Math.max(p.invincibleTimer, 1e9);
  const mr = Math.random;
  Math.random = (f.e.__probeRng ??= probeRng()) as () => number;
  try {
    f.e.update(DT);
  } finally {
    Math.random = mr;
  }
}

/**
 * SNAPSHOT + RESTORE (the design that works: the copy above shares the engine's closures, the stage clock's time and the piece and field
 * hosts, which read the LIVE engine): save every object the engine reaches, fly the LIVE engine N frames, then write every saved object
 * back IN PLACE (each keeps its identity, so every reference and closure into it stays right) and put the clock back (its time lives in
 * a closure: clock.ts stageClock). Objects made during the probe are dropped with the references to them.
 */
export interface Snap { pairs: Map<object, unknown>; time: number; random: () => number; ms: number }

export function snapshot(e: Record<string, any>): Snap {
  const pairs = new Map<object, unknown>();
  const st: ForkStats = { objects: 0, ms: 0 };
  deepFork(e, st, pairs);
  return { pairs, time: e.gameTime as number, random: Math.random, ms: st.ms };
}

export function restore(e: Record<string, any>, s: Snap): number {
  const t0 = performance.now();
  const back = new Map<unknown, unknown>();
  for (const [live, copy] of s.pairs) back.set(copy, live);
  const b = (v: unknown): unknown => (v !== null && typeof v === 'object' && back.has(v) ? back.get(v) : v);
  for (const [live, copy] of s.pairs) {
    if (Array.isArray(live)) {
      const c = copy as unknown[];
      live.length = c.length;
      for (let i = 0; i < c.length; i++) live[i] = b(c[i]);
    } else if (live instanceof Map) {
      live.clear();
      for (const [k, v] of copy as Map<unknown, unknown>) live.set(b(k), b(v));
    } else if (live instanceof Set) {
      live.clear();
      for (const v of copy as Set<unknown>) live.add(b(v));
    } else if (ArrayBuffer.isView(live)) {
      (live as unknown as { set(a: unknown): void }).set(copy);
    } else if (live instanceof Date) {
      live.setTime((copy as Date).getTime());
    } else {
      const c = copy as Obj;
      const l = live as Obj;
      for (const k of Reflect.ownKeys(l)) if (!Object.prototype.hasOwnProperty.call(c, k)) delete l[k];
      for (const k of Reflect.ownKeys(c)) {
        const d = Object.getOwnPropertyDescriptor(c, k)!;
        if (!('value' in d)) continue;
        const ld = Object.getOwnPropertyDescriptor(l, k);
        if (ld && !('value' in ld)) continue;
        if (ld && !ld.writable) continue;
        if (ld) l[k] = b(d.value);
        else Object.defineProperty(l, k, { ...d, value: b(d.value) });
      }
    }
  }
  e.gameTime = s.time;
  Math.random = s.random;
  return performance.now() - t0;
}

/** a fingerprint of everything the engine reaches (each object by first-met order, numbers exact): for proving a restore complete */
export function graphPrint(root: object): string {
  const ids = new Map<object, number>();
  const out: string[] = [];
  const w = (v: unknown): void => {
    if (v === null || typeof v !== 'object') {
      out.push(typeof v === 'function' ? 'f' : typeof v === 'number' ? String(v) : JSON.stringify(v) ?? 'u');
      return;
    }
    const id = ids.get(v);
    if (id !== undefined) return void out.push('#' + id);
    if (SHARE(v)) return void out.push('S');
    ids.set(v, ids.size);
    if (Array.isArray(v)) { out.push('[' + v.length); v.forEach(w); return void out.push(']'); }
    if (v instanceof Map) { out.push('M' + v.size); for (const [k, x] of v) { w(k); w(x); } return; }
    if (v instanceof Set) { out.push('T' + v.size); for (const x of v) w(x); return; }
    if (ArrayBuffer.isView(v)) return void out.push('B' + Array.from(v as unknown as ArrayLike<number>).join(','));
    out.push('{');
    for (const k of Reflect.ownKeys(v)) {
      const d = Object.getOwnPropertyDescriptor(v, k)!;
      out.push(String(k));
      if ('value' in d) w(d.value);
    }
    out.push('}');
  };
  w(root);
  return out.join(' ');
}

/**
 * Fly the LIVE engine `pads.length` frames under `pads` (FakeInput's fields, as stepFork), reading `read` after each frame, then put it
 * back exactly. The engine's own hooks (the bot's loseLife, damagePlayer, softFall, guide) are swapped for the probe's (a death noted)
 * and come back with the restore. Returns what `read` said on each frame and whether he died.
 */
export function probe<R>(e: Record<string, any>, pads: ReadonlyArray<Parameters<typeof stepFork>[1]>, read: (e: Record<string, any>, i: number) => R | 'stop'): { rows: R[]; died: string | null; ms: number } {
  const t0 = performance.now();
  const s = snapshot(e);
  const f: Fork = { e, input: e.input as Record<string, any>, died: null, stats: { objects: s.pairs.size, ms: s.ms } };
  e.loseLife = (reason?: string) => { f.died ??= reason ?? 'life'; };
  e.softFall = () => { f.died ??= 'soft'; return true; };
  e.damagePlayer = () => { f.died ??= 'hurt'; };
  e.guide = () => {};
  const rows: R[] = [];
  try {
    for (let i = 0; i < pads.length && !f.died; i++) {
      stepFork(f, pads[i]);
      const r = read(e, i);
      if (r === 'stop') break;
      rows.push(r);
    }
  } finally {
    restore(e, s);
  }
  return { rows, died: f.died, ms: performance.now() - t0 };
}
