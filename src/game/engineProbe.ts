/**
 * Ask the GAME how a press flies (ENG-SIM step 1, R-165.470; the spike R-165.462, t-eng-botsim cb7ccbbf7, tools/inspect/engineFork.ts).
 *
 * `probe(sim, pads, read)` flies the LIVE engine of a harness (RealPlay) ahead under candidate pads, through the harness's own frame,
 * then puts everything back exactly, so the bots can judge a press by what the engine does instead of by a hand-made copy of its physics.
 * A separate copy of the engine does not work: the stage clock keeps its time in a closure and the piece and field hosts read the live
 * engine through closures, so a copy stepped on its own moves the live run (the spike's item 1). What works:
 *  1. SNAPSHOT every object the harness reaches (its prototypes kept), and the module-level play stores (playStores.ts) and the phone's
 *     storage;
 *  2. FLY the live engine under the pads, with the run's own hooks swapped for the probe's: a fall, a hurt or a life lost is noted and
 *     ends the flight; the engine's callbacks (the screen's, or a bot's eyes) hear nothing; Math.random runs on the probe's own stream,
 *     so a probe never moves a roll and every probe flies the same;
 *  3. RESTORE every saved object IN PLACE (each keeps its identity, so every reference and closure into it stays right), the clock, the
 *     stores, the storage and Math.random. Objects made during the flight are dropped with the references to them.
 *
 * THE SHARE (step 2(c) of the spike: snapshot 2.86 -> 0.95 ms): objects that never change in play are not copied. They are the ones on
 * NEVER_CHANGES below, a DECLARED list (each path with why nothing writes it in play), deep-frozen at an engine's first probe, so a write
 * to one THROWS (the engine is strict-mode code): a wrong entry is loud, never a silent leak. The probe-equality gate
 * (tools/engine/probeEqual.test.ts) flies one seed of every world with the share on and proves the list holds there.
 *
 * Nothing in the game calls this: it is a tool for the bots and the tests (it ships in no chunk the game loads).
 */
import { savePlayStores, loadPlayStores } from './playStores.ts';

type Obj = Record<string | symbol, unknown>;
type Eng = Record<string, any>;

/** objects shared, never copied: the canvas, its context, images and sound (read, never stepped) */
const HOST = /Canvas|Context|Image|Audio|HTMLElement|Path2D|ImageBitmap|WebGL|OffscreenCanvas|Node$/;
/** the cue memo's tables (shared on purpose: see NEVER_CHANGES' last note) */
const SHARED = new WeakSet<object>();
const shared = (v: object): boolean => Object.isFrozen(v) || SHARED.has(v) || HOST.test(v.constructor?.name ?? '');

export interface ShareEntry {
  /** a path from the engine, as stageWalk names it: a field, then up to two keys (`[]` for any array index) */
  path: string;
  /** the object at the path and everything first met under it (true), or only the object itself (false) */
  deep: boolean;
  why: string;
}

/**
 * THE DECLARED SHARE: the engine's stage objects that nothing writes in play. Paths are first-met paths (stageWalk below: the engine's
 * currentStage, then drawPlats, then proto; an object reachable two ways is named by the first), so a platform the stage list holds is
 * named under its list and never frozen through a record that also points at it.
 */
export const NEVER_CHANGES: ReadonlyArray<ShareEntry> = [
  { path: 'currentStage.gen2', deep: true, why: "the generator's record of the roll (layout, sections, tags): built before play, read by draw, the bots and the tools" },
  { path: 'currentStage.rivers.[]', deep: true, why: "each river's path and banks as rolled: the water's flow reads them; the moving logs are their own objects on the engine" },
  { path: 'currentStage.meta.pieces', deep: true, why: "the stage's piece list as rolled: pieces/index.ts startPieces builds each piece's runtime state on the engine from it" },
  { path: 'currentStage.config', deep: false, why: 'the stage config object itself (its own fields: id, size, travel); a nested object it holds is not frozen' },
  { path: 'currentStage.proto.dress', deep: true, why: 'the dressing placed at the roll: drawn, never moved' },
  { path: 'currentStage.proto.decor', deep: true, why: 'the decor placed at the roll: drawn, never moved' },
  { path: 'currentStage.proto.beats', deep: true, why: "the stage's beat list as rolled: read by Dot's lines and the tools" },
  { path: 'currentStage.proto.gen2', deep: true, why: "the generator's record as the proto carries it: as currentStage.gen2" },
  // (engine.cueTables, the let-go cue memo, letGoCue.ts: its tables are built from the vine and the river path only and never written
  // after they are made, so the tables are shared, never copied. Not frozen: the Map is play state; cueFly puts its entries back.)
];
const STAGE_FIELDS = ['currentStage', 'drawPlats', 'proto'];

/** every object under the engine's stage fields, by the path it was first met on (field.key.key: two levels named, deeper keep it) */
export function stageWalk(e: Eng): Map<object, string> {
  const at = new Map<object, string>();
  const go = (v: unknown, path: string, depth: number): void => {
    if (v === null || typeof v !== 'object' || at.has(v) || Object.isFrozen(v) || HOST.test(v.constructor?.name ?? '')) return;
    at.set(v, path);
    const name = (k: string | symbol) => (depth < 2 ? `${path}.${/^\d+$/.test(String(k)) ? '[]' : String(k)}` : path);
    if (Array.isArray(v)) v.forEach((x) => go(x, name('0'), depth + 1));
    else if (v instanceof Map) for (const [k, x] of v) { go(k, path, depth + 1); go(x, name('val'), depth + 1); }
    else if (v instanceof Set) for (const x of v) go(x, path, depth + 1);
    else if (!ArrayBuffer.isView(v)) for (const k of Reflect.ownKeys(v)) {
      const d = Object.getOwnPropertyDescriptor(v, k)!;
      if ('value' in d) go(d.value, name(k), depth + 1);
    }
  };
  for (const f of STAGE_FIELDS) go(e[f], f, 0);
  return at;
}

/** does a first-met path fall under a share entry */
export const sharedPath = (path: string, s: ShareEntry): boolean => path === s.path || (s.deep && path.startsWith(s.path + '.'));

export const SHARE_STATS = { frozen: 0, kept: 0 };
const prepared = new WeakSet<object>();
/** freeze the declared share on this engine (once per engine) and note the cue memo's tables */
function prepareShare(e: Eng): void {
  const ct = e.cueTables;
  if (ct instanceof Map) {
    SHARED.add(ct);
    for (const t of ct.values()) if (t && typeof t === 'object') SHARED.add(t);
  }
  if (prepared.has(e)) return;
  prepared.add(e);
  for (const [o, path] of stageWalk(e)) {
    if (!NEVER_CHANGES.some((s) => sharedPath(path, s))) continue;
    // (a frozen Map or Set still takes set / add, and a typed array cannot be frozen: those are copied as before)
    if (o instanceof Map || o instanceof Set || ArrayBuffer.isView(o)) { SHARE_STATS.kept++; continue; }
    Object.freeze(o);
    SHARE_STATS.frozen++;
  }
}

/**
 * The let-go cue memo around a flight (engine.cueTables). Its tables are shared, never copied (each a pure function of its key: the vine,
 * the hold, the facing and the river's log path, letGoCue.ts letGoTable), but WHICH tables the memo holds is play state: it is capped
 * (at 8 it is cleared), so a probe that built a table ahead of the live run would move the moment of a later clear (the gate saw the
 * memo hold one table more after a probe, and one fewer at a run's end). So the flight works on the live Map and the probe puts the
 * Map's entries back as it found them, in order; the tables a probe built are kept here, per stage, and lent to the next flight, so a
 * probe never builds the same table twice. The live run never reads this side memo: it builds its own tables at its own moments.
 */
const probeCue = new WeakMap<object, Map<string, unknown>>();
function cueFly(e: Eng): (() => void) | null {
  const live = e.cueTables;
  const stage = e.currentStage;
  if (!(live instanceof Map) || stage === null || typeof stage !== 'object') return null;
  const kept = [...live];
  const had = new Set(live.keys());
  let side = probeCue.get(stage);
  if (!side) probeCue.set(stage, (side = new Map()));
  // (lent up to the memo's own cap; a flight that fills it clears it as the live run would: harmless, every table is pure)
  for (const [k, t] of side) if (live.size < 8 && !live.has(k)) live.set(k, t);
  const lent = side;
  return () => {
    for (const [k, t] of live) if (!had.has(k)) lent.set(k, t);
    live.clear();
    for (const [k, t] of kept) live.set(k, t);
  };
}

/** a deep copy of `root` with its prototypes, cycles and sharing kept; `seen` maps each live object to its copy */
export function deepFork<T extends object>(root: T, seen = new Map<object, unknown>()): T {
  const c = (v: unknown): unknown => {
    if (v === null || typeof v !== 'object') return v;
    const hit = seen.get(v);
    if (hit !== undefined) return hit;
    if (shared(v)) return v;
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
    if (v instanceof Date) {
      const d = new Date(v.getTime());
      seen.set(v, d);
      return d;
    }
    const o = Object.create(Object.getPrototypeOf(v)) as Obj;
    seen.set(v, o);
    for (const k of Reflect.ownKeys(v)) {
      const d = Object.getOwnPropertyDescriptor(v, k)!;
      if ('value' in d) d.value = c(d.value);
      Object.defineProperty(o, k, d);
    }
    return o;
  };
  return c(root) as T;
}

export interface Snap {
  pairs: Map<object, unknown>;
  time: number;
}

/** save every object `root` reaches (each live object -> its copy), and the engine's clock */
export function snapshot(root: object, e: Eng): Snap {
  const pairs = new Map<object, unknown>();
  deepFork(root, pairs);
  return { pairs, time: e.gameTime as number };
}

/** write every saved object back in place, and the clock (its time lives in a closure: clock.ts stageClock) */
export function restore(e: Eng, s: Snap): void {
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
        if (ld && (!('value' in ld) || !ld.writable)) continue;
        if (ld) l[k] = b(d.value);
        else Object.defineProperty(l, k, { ...d, value: b(d.value) });
      }
    }
  }
  e.gameTime = s.time;
}

/** a fingerprint of everything `root` reaches (each object by first-met order, numbers exact): for proving a restore complete */
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
    if (HOST.test(v.constructor?.name ?? '')) return void out.push('S');
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

/** the probe's own Math.random stream (a fixed seed: every probe flies the same) */
const probeRng = (): (() => number) => {
  let s = 0x2545f491;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

type Phone = Array<[string, string]> | null;
const phone = (): Phone => {
  if (typeof localStorage === 'undefined') return null;
  const out: Array<[string, string]> = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k !== null) out.push([k, localStorage.getItem(k) ?? '']);
  }
  return out;
};
const putPhone = (p: Phone): void => {
  if (!p || typeof localStorage === 'undefined') return;
  localStorage.clear();
  for (const [k, v] of p) localStorage.setItem(k, v);
};

/** where a probe's time goes (a tool prints it) */
export const PROBE_STATS = { n: 0, snap: 0, fly: 0, rest: 0, frames: 0, objects: 0 };

export interface Probed<R> {
  /** what `read` said after each frame flown */
  rows: R[];
  /** a fall into the water, a pit or the mist ('water', 'pit', 'soft'), a hurt ('hurt') or a life lost, in the flight */
  died: string | null;
  frames: number;
  ms: number;
}

/** the harness a probe flies: its engine, and its own frame (RealPlay.frame: the pad as the touch input gives it to the engine) */
export interface ProbeSim<P> {
  readonly e: Eng;
  frame(pad: P): void;
}

/**
 * Fly `sim`'s live engine `pads.length` frames under `pads`, through `sim.frame`, reading `read` after each frame ('stop' ends the
 * flight early), then put everything back exactly (the file's header). A death ends the flight. `share: false` copies the declared
 * share too (the gate compares both).
 */
export function probe<P, R>(sim: ProbeSim<P>, pads: ReadonlyArray<P>, read: (e: Eng, i: number) => R | 'stop', opts: { share?: boolean } = {}): Probed<R> {
  const t0 = performance.now();
  const e = sim.e;
  if (opts.share !== false) prepareShare(e);
  const s = snapshot(sim, e);
  const cue = cueFly(e);
  const stores = savePlayStores();
  const ph = phone();
  const mr = Math.random;
  const t1 = performance.now();
  let died: string | null = null;
  e.loseLife = (reason?: string) => { died ??= reason ?? 'life'; };
  e.softFall = () => { died ??= 'soft'; return true; };
  e.damagePlayer = () => { died ??= 'hurt'; };
  const cb = e.callbacks as Record<string, unknown> | undefined;
  if (cb) for (const k of Object.keys(cb)) if (typeof cb[k] === 'function') cb[k] = () => {};
  const rows: R[] = [];
  let frames = 0;
  let t2 = t1;
  try {
    Math.random = probeRng();
    for (let i = 0; i < pads.length && !died; i++) {
      sim.frame(pads[i]);
      frames++;
      const r = read(e, i);
      if (r === 'stop') break;
      rows.push(r);
    }
  } finally {
    t2 = performance.now();
    Math.random = mr;
    restore(e, s);
    cue?.();
    loadPlayStores(stores);
    putPhone(ph);
  }
  const t3 = performance.now();
  const q = PROBE_STATS;
  q.n++; q.snap += t1 - t0; q.fly += t2 - t1; q.rest += t3 - t2; q.frames += frames; q.objects += s.pairs.size;
  return { rows, died, frames, ms: t3 - t0 };
}
