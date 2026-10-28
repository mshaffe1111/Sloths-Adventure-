/**
 * Variety tools for the new stage generator (gen2): keep randomness fresh so two rolls of a stage, and two stages of a
 * world, don't come out alike. From the Gemini research (reference/GEMINI-PCG-RESEARCH.md Part 1 "True Variety" and
 * Part 2 §2 "2-Level Cooldown Queue"; ledger rows C1, C2, C4):
 *   ShuffleBag    every item once per bag, in a shuffled order (the Tetris randomizer), no repeat across a refill.
 *   CooldownQueue the last N ids used (14 chunk ids = about 2 stages of 7 chunks) are skipped while others are left.
 *   WorldOnce     a cooldown that never forgets inside one world run: no sub-block twice in a world.
 *   poissonPlace  1D spacing along the route: a minimum gap between pieces of the same kind, and no barren stretch
 *                 longer than maxGap without an interactive piece (filled from a filler list where it can be).
 *   pickWeighted  one weighted pick.
 * Everything takes the generator's seeded `rng` (a function giving 0..1), so the same seed always gives the same stage.
 * Self-contained on purpose: no imports, so any part of the generator can use it.
 */

/** A seeded random source: each call gives a number from 0 (inclusive) to 1 (exclusive). */
export type Rng = () => number;

/** A whole number from 0 to n - 1. */
const below = (rng: Rng, n: number) => Math.min(n - 1, Math.floor(rng() * n));

/** Shuffle a list in place (Fisher-Yates), so every order is equally likely. */
function shuffleInPlace<T>(rng: Rng, list: T[]): T[] {
  for (let i = list.length - 1; i > 0; i--) {
    const j = below(rng, i + 1);
    const t = list[i];
    list[i] = list[j];
    list[j] = t;
  }
  return list;
}

/**
 * Pick one item, each with a chance in proportion to its weight. Negative weights count as 0.
 * Gives undefined for an empty list; when every weight is 0 it picks evenly instead.
 */
export function pickWeighted<T>(rng: Rng, items: readonly T[], weight: (item: T, i: number) => number): T | undefined {
  if (items.length === 0) return undefined;
  const ws = items.map((it, i) => Math.max(0, weight(it, i) || 0));
  const total = ws.reduce((s, w) => s + w, 0);
  if (total <= 0) return items[below(rng, items.length)];
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) {
    if (ws[i] <= 0) continue;
    r -= ws[i];
    if (r < 0) return items[i];
  }
  // rounding can leave a hair over: give the last item that has weight
  for (let i = items.length - 1; i >= 0; i--) if (ws[i] > 0) return items[i];
  return undefined;
}

/**
 * A shuffle bag: all the items go in, get shuffled, and come out one by one. When the bag is empty it is filled
 * again and reshuffled. So every item turns up once per bag (or `count` times when weighted), nothing clusters,
 * and the first item of a new bag is never the item that ended the last one (no back-to-back repeat at a refill).
 * Items are compared with ===, so use ids or the same objects.
 */
export class ShuffleBag<T> {
  private rng: Rng;
  private contents: T[] = [];
  private bag: T[] = [];
  private last: T | undefined;
  private hasLast = false;

  /**
   * @param rng   the generator's seeded stream
   * @param items what goes in each bag
   * @param count how many copies of an item go in each bag (default 1; rounded down, 0 leaves it out)
   */
  constructor(rng: Rng, items: readonly T[] = [], count?: (item: T, i: number) => number) {
    this.rng = rng;
    this.fill(items, count);
  }

  /** Replace what goes in the bag and start a fresh bag (the no-repeat rule still holds against the last draw). */
  fill(items: readonly T[], count?: (item: T, i: number) => number): void {
    const all: T[] = [];
    items.forEach((it, i) => {
      const n = count ? Math.max(0, Math.floor(count(it, i))) : 1;
      for (let k = 0; k < n; k++) all.push(it);
    });
    this.contents = all;
    this.bag = [];
  }

  /** Items left in the current bag before it refills. */
  get size(): number {
    return this.bag.length;
  }

  /** Items in a full bag (copies counted). */
  get capacity(): number {
    return this.contents.length;
  }

  /** The next item, without drawing it. Refills the bag first when it is empty. Undefined when the bag holds nothing. */
  peek(): T | undefined {
    if (this.bag.length === 0) this.refill();
    return this.bag.length ? this.bag[this.bag.length - 1] : undefined;
  }

  /** Draw the next item. Undefined only when the bag holds nothing at all. */
  draw(): T | undefined {
    if (this.bag.length === 0) this.refill();
    if (this.bag.length === 0) return undefined;
    const it = this.bag.pop() as T;
    this.last = it;
    this.hasLast = true;
    return it;
  }

  private refill(): void {
    if (this.contents.length === 0) return;
    const b = shuffleInPlace(this.rng, this.contents.slice());
    // the next draw is the end of the list: if it repeats the last draw, swap in a different item from a random spot
    const top = b.length - 1;
    if (this.hasLast && b[top] === this.last) {
      const others: number[] = [];
      for (let i = 0; i < top; i++) if (b[i] !== this.last) others.push(i);
      if (others.length) {
        const j = others[below(this.rng, others.length)];
        b[top] = b[j];
        b[j] = this.last as T;
      }
    }
    this.bag = b;
  }
}

/**
 * Remembers the last N ids used and keeps them out while other choices are left (Gemini: the last 14 chunk ids,
 * so no chunk comes back within about 2 stages). Also used for decor sets, so a world's look isn't the same two
 * stages in a row (STAGE-RULES §4).
 */
export class CooldownQueue<K> {
  /** oldest first */
  protected recent: K[] = [];
  readonly length: number;

  /** @param length how many recent ids are blocked (default 14; Infinity never forgets) */
  constructor(length = 14) {
    this.length = Math.max(0, length);
  }

  /** True when the id has not been used within the last N. */
  allows(id: K): boolean {
    return !this.recent.includes(id);
  }

  /** Note that the id was just used. Using it again moves it to the newest end. */
  use(id: K): void {
    const at = this.recent.indexOf(id);
    if (at >= 0) this.recent.splice(at, 1);
    this.recent.push(id);
    while (this.recent.length > this.length) this.recent.shift();
  }

  /** The blocked ids, oldest first. */
  blocked(): readonly K[] {
    return this.recent.slice();
  }

  /** Forget everything (a new world or a new run). */
  clear(): void {
    this.recent = [];
  }

  /**
   * Pick and use the first candidate the cooldown allows, in the order given (shuffle or bag the candidates first
   * for variety). When every candidate is blocked, fall back to the one used longest ago. Undefined for no candidates.
   * @param idOf how to get a candidate's id (default: the candidate is its own id)
   */
  pick<C>(candidates: readonly C[], idOf: (c: C) => K = (c) => c as unknown as K): C | undefined {
    if (candidates.length === 0) return undefined;
    let chosen = candidates.find((c) => this.allows(idOf(c)));
    if (chosen === undefined) {
      let best = Infinity;
      for (const c of candidates) {
        const at = this.recent.indexOf(idOf(c));
        if (at < best) {
          best = at;
          chosen = c;
        }
      }
    }
    if (chosen !== undefined) this.use(idOf(chosen));
    return chosen;
  }
}

/**
 * A cooldown that never forgets within one world run: no sub-block (or other piece id) twice in a world.
 * When every candidate has been used it falls back to the one used longest ago. Call `newWorld()` between worlds.
 */
export class WorldOnce<K> extends CooldownQueue<K> {
  constructor() {
    super(Infinity);
  }

  /** True when the id was already used in this world. */
  used(id: K): boolean {
    return !this.allows(id);
  }

  /** Start a new world run. */
  newWorld(): void {
    this.clear();
  }
}

/** A piece along the route: where it is (x, in px) and what kind it is. */
export interface RoutePiece {
  x: number;
  kind: string;
}

/** A stretch of route with no interactive piece, from x `from` to x `to`. */
export interface RouteGap<P> {
  from: number;
  to: number;
  /** filler pieces put in it (empty for one that could not be filled at all) */
  added: P[];
}

export interface PoissonOptions<P extends RoutePiece> {
  /** the generator's seeded stream */
  rng: Rng;
  /** smallest distance in px between two pieces of the same kind (kinds left out have no minimum) */
  minGap: Readonly<Record<string, number>>;
  /** smallest distance in px between any two pieces, whatever their kinds (default 0) */
  minGapAny?: number;
  /** longest stretch in px allowed with no interactive piece */
  maxGap: number;
  /** pieces already fixed (hand-placed, puzzle keys): never dropped, but they count for both gaps */
  fixed?: readonly P[];
  /** templates to fill barren stretches with (their x is replaced); tried in a rotating order so kinds vary */
  fillers?: readonly P[];
  /** where the route starts and ends: when given, the stretches before the first and after the last piece count too */
  start?: number;
  end?: number;
  /** which pieces count as interactive for maxGap (default: all of them) */
  interactive?: (p: P) => boolean;
}

export interface PoissonResult<P> {
  /** every piece kept: fixed, accepted candidates and fillers, sorted by x */
  placed: P[];
  /** candidates left out because they were too close to a piece already placed */
  rejected: P[];
  /** stretches over maxGap that fillers fixed */
  filled: RouteGap<P>[];
  /** stretches still over maxGap after filling (the generator must fix these some other way) */
  unfilled: RouteGap<P>[];
}

/**
 * 1D Poisson spacing along a stage's route. Candidates are taken in the order given (put the important ones first):
 * a candidate is kept only if no piece of the same kind is within `minGap[kind]` px and no piece at all within
 * `minGapAny`. Then every stretch longer than `maxGap` with no interactive piece is filled from `fillers`, stepping
 * along it so no part stays barren, still obeying the minimum gaps. What could not be filled is reported, so the
 * generator can never leave a barren run without knowing.
 */
export function poissonPlace<P extends RoutePiece>(candidates: readonly P[], opt: PoissonOptions<P>): PoissonResult<P> {
  const { rng, minGap, maxGap } = opt;
  const anyGap = opt.minGapAny ?? 0;
  const isActive = opt.interactive ?? (() => true);
  const placed: P[] = [...(opt.fixed ?? [])];
  const rejected: P[] = [];

  const fits = (kind: string, x: number) => {
    const same = minGap[kind] ?? 0;
    for (const p of placed) {
      const d = Math.abs(p.x - x);
      if (d < anyGap) return false;
      if (p.kind === kind && d < same) return false;
    }
    return true;
  };

  for (const c of candidates) {
    if (fits(c.kind, c.x)) placed.push(c);
    else rejected.push(c);
  }

  const fillers = (opt.fillers ?? []).filter((f) => isActive(f));
  const filled: RouteGap<P>[] = [];
  const unfilled: RouteGap<P>[] = [];

  /** try to put one filler somewhere in (from, from + maxGap], nearer the far end so few fillers are needed */
  const placeOne = (from: number, to: number): P | undefined => {
    if (fillers.length === 0) return undefined;
    const hi = Math.min(from + maxGap, to);
    const xs: number[] = [];
    for (let k = 0; k < 4; k++) xs.push(from + (hi - from) * (0.6 + 0.4 * rng()));
    for (let k = 10; k >= 1; k--) xs.push(from + ((hi - from) * k) / 10);
    const startAt = below(rng, fillers.length);
    for (const x of xs) {
      if (!(x > from && x < to)) continue;
      for (let k = 0; k < fillers.length; k++) {
        const f = fillers[(startAt + k) % fillers.length];
        if (fits(f.kind, x)) return { ...f, x };
      }
    }
    return undefined;
  };

  const marks = placed.filter((p) => isActive(p)).map((p) => p.x);
  if (opt.start !== undefined) marks.push(opt.start);
  if (opt.end !== undefined) marks.push(opt.end);
  marks.sort((a, b) => a - b);

  for (let i = 0; i + 1 < marks.length; i++) {
    const a = marks[i];
    const b = marks[i + 1];
    if (b - a <= maxGap) continue;
    const added: P[] = [];
    let cur = a;
    while (b - cur > maxGap) {
      const p = placeOne(cur, b);
      if (!p) break;
      placed.push(p);
      added.push(p);
      cur = p.x;
    }
    if (added.length) filled.push({ from: a, to: b, added });
    if (b - cur > maxGap) unfilled.push({ from: cur, to: b, added: [] });
  }

  placed.sort((p, q) => p.x - q.x);
  return { placed, rejected, filled, unfilled };
}
