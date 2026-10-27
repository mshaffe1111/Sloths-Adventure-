/**
 * What the inspector says about one stage (dead time, rests, the action string, the goal, the length), and how alike two stages are.
 * Pure functions over the beats (beats.ts), so they can be tested on their own.
 */
import { WEIGHT, type Beat, type Letter, type Sample } from './beats.ts';

export const NORMAL_GAP = 2.0;
export const EASY_GAP = 3.0;
/** the action string's walk: one W for every 1.5 s of beat-free movement */
export const WALK_SEC = 1.5;
export const WINDOW = 20;
export const COS_FLAG = 0.78;
export const WIN_FLAG = 0.28;
/** two windows of one stage this close are "the same pattern twice" */
export const REPEAT_FLAG = 0.08;

export interface Dead { t0: number; t1: number; x0: number; x1: number; y0: number; y1: number; sec: number }

/** stretches with no beat for longer than `gap` seconds (the start to the first beat and the last beat to the shrine count too) */
export function deadTime(beats: Beat[], total: number, gap: number, samples: Sample[]): { list: Dead[]; total: number; longest: number } {
  const list: Dead[] = [];
  let end = 0;
  let endBase = 0;
  const at = (base: number) => {
    // the route point at a time on the movement clock
    let lo = 0, hi = samples.length - 1;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; if (samples[m].base <= base) lo = m; else hi = m - 1; }
    return samples[lo] ?? { x: 0, y: 0 };
  };
  const push = (t0: number, t1: number, b0: number, b1: number) => {
    if (t1 - t0 > gap) {
      const p0 = at(b0), p1 = at(b1);
      list.push({ t0, t1, x0: p0.x, x1: p1.x, y0: p0.y, y1: p1.y, sec: t1 - t0 });
    }
  };
  for (const b of beats) {
    push(end, b.t, endBase, b.base);
    if (b.t + b.dur + b.act > end) { end = b.t + b.dur + b.act; endBase = b.base + b.act; }
  }
  push(end, total, endBase, samples.length ? samples[samples.length - 1].base : 0);
  return { list, total: list.reduce((s, d) => s + d.sec, 0), longest: list.reduce((m, d) => Math.max(m, d.sec), 0) };
}

export interface Burst { t0: number; t1: number; beats: number; rest: number | null; ok: boolean }

/**
 * A burst is a run of beats less than 1.5 s apart that adds up to a weight of 4 or more (two animals, a swing and two jumps...).
 * After each one the inspector looks for a rest before the next beat: at least 1 s of plain walking on still ground (no beat means no
 * animal, hazard or puzzle on it). A burst that ends at the shrine needs no rest.
 */
export function restCheck(beats: Beat[], total: number, samples: Sample[]): { bursts: Burst[]; noRest: number } {
  const bursts: Burst[] = [];
  let i = 0;
  while (i < beats.length) {
    let j = i;
    let end = beats[i].t + beats[i].dur + beats[i].act;
    let w = WEIGHT[beats[i].letter] * beats[i].count;
    while (j + 1 < beats.length && beats[j + 1].t - end < 1.5) {
      j++;
      end = Math.max(end, beats[j].t + beats[j].dur + beats[j].act);
      w += WEIGHT[beats[j].letter] * beats[j].count;
    }
    if (w >= 4 && j - i >= 1) {
      const nextBase = j + 1 < beats.length ? beats[j + 1].base : Infinity;
      const fromBase = beats[j].base + beats[j].act;
      let rest: number | null = null;
      if (nextBase === Infinity) rest = null;
      else {
        // the longest stretch of plain walking on still ground between the burst and the next beat
        let best = 0, run = 0, prev = -1;
        for (const s of samples) {
          if (s.base < fromBase || s.base > nextBase) continue;
          const still = s.seg.kind === 'walk' && (!s.seg.plat || (s.seg.plat.type === 'solid' && !s.seg.plat.chase));
          if (still && prev >= 0) run += s.base - prev;
          else run = 0;
          prev = s.base;
          best = Math.max(best, run);
        }
        rest = best;
      }
      bursts.push({ t0: beats[i].t, t1: end, beats: j - i + 1, rest, ok: rest === null || rest >= 1.0 });
    }
    i = j + 1;
  }
  return { bursts, noRest: bursts.filter((b) => !b.ok).length };
}

export interface Token { l: Letter; t: number }

/** the beats as letters in order, with a W for every 1.5 s of walking between them */
export function actionTokens(beats: Beat[], total: number): Token[] {
  const out: Token[] = [];
  let end = 0;
  const walks = (t0: number, t1: number) => {
    const n = Math.floor((t1 - t0) / WALK_SEC);
    for (let k = 0; k < n; k++) out.push({ l: 'W', t: t0 + k * WALK_SEC });
  };
  for (const b of beats) {
    walks(end, b.t);
    out.push({ l: b.letter, t: b.t });
    end = Math.max(end, b.t + b.dur + b.act);
  }
  walks(end, total);
  return out;
}
export const tokenString = (tokens: Token[]) => tokens.map((x) => x.l).join('');

/** weighted 3-gram profile, walks stripped */
export function profile(tokens: Token[]): Map<string, number> {
  const s = tokens.filter((x) => x.l !== 'W').map((x) => x.l);
  const m = new Map<string, number>();
  for (let i = 0; i + 2 < s.length; i++) {
    const g = s[i] + s[i + 1] + s[i + 2];
    m.set(g, (m.get(g) ?? 0) + WEIGHT[s[i]] + WEIGHT[s[i + 1]] + WEIGHT[s[i + 2]]);
  }
  return m;
}
export function cosine(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0, na = 0, nb = 0;
  for (const [k, v] of a) { na += v * v; const w = b.get(k); if (w) dot += v * w; }
  for (const v of b.values()) nb += v * v;
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

/** weighted edit distance: inserting or deleting a letter costs its weight, swapping one for another costs the mean of the two */
export function editDistance(a: Letter[], b: Letter[]): number {
  const n = a.length, m = b.length;
  let prev = new Float64Array(m + 1);
  let cur = new Float64Array(m + 1);
  for (let j = 1; j <= m; j++) prev[j] = prev[j - 1] + WEIGHT[b[j - 1]];
  for (let i = 1; i <= n; i++) {
    cur[0] = prev[0] + WEIGHT[a[i - 1]];
    for (let j = 1; j <= m; j++) {
      const sub = a[i - 1] === b[j - 1] ? 0 : (WEIGHT[a[i - 1]] + WEIGHT[b[j - 1]]) / 2;
      cur[j] = Math.min(prev[j - 1] + sub, prev[j] + WEIGHT[a[i - 1]], cur[j - 1] + WEIGHT[b[j - 1]]);
    }
    [prev, cur] = [cur, prev];
  }
  return prev[m];
}
const weightOf = (s: Letter[]) => s.reduce((t, l) => t + WEIGHT[l], 0);

export interface Win { t: number; s: Letter[]; w: number }
/**
 * 20-second windows, one starting every 2 s. A window whose beats (walks left out) weigh less than 6 is mostly walking and is left
 * out of the comparisons: two quiet stretches always look alike, and dead time is reported on its own.
 */
export function windows(tokens: Token[], total: number): Win[] {
  const out: Win[] = [];
  for (let t = 0; t + WINDOW <= Math.max(total, WINDOW); t += 2) {
    const s = tokens.filter((x) => x.t >= t && x.t < t + WINDOW).map((x) => x.l);
    const w = weightOf(s);
    if (w - 0.2 * s.filter((l) => l === 'W').length >= 6) out.push({ t, s, w });
  }
  return out;
}
export const winDistance = (a: Win, b: Win) => editDistance(a.s, b.s) / Math.max(a.w, b.w);

/** the closest pair of windows between two stages */
export function closestWindows(a: Win[], b: Win[]): { d: number; ta: number; tb: number; sa: string; sb: string } | null {
  let best: { d: number; ta: number; tb: number; sa: string; sb: string } | null = null;
  for (const x of a) for (const y of b) {
    // (a cheap lower bound: the weight difference alone)
    if (best && Math.abs(x.w - y.w) / Math.max(x.w, y.w) >= best.d) continue;
    const d = winDistance(x, y);
    if (!best || d < best.d) best = { d, ta: x.t, tb: y.t, sa: x.s.join(''), sb: y.s.join('') };
  }
  return best;
}

/** windows of one stage, at least 20 s apart, that are near-identical */
export function repeats(ws: Win[]): Array<{ ta: number; tb: number; d: number; s: string }> {
  const out: Array<{ ta: number; tb: number; d: number; s: string }> = [];
  for (let i = 0; i < ws.length; i++) for (let j = i + 1; j < ws.length; j++) {
    if (ws[j].t - ws[i].t < WINDOW) continue;
    const d = winDistance(ws[i], ws[j]);
    if (d < REPEAT_FLAG) out.push({ ta: ws[i].t, tb: ws[j].t, d, s: ws[i].s.join('') });
  }
  // one per first window
  const seen = new Set<number>();
  return out.sort((p, q) => p.d - q.d).filter((r) => (seen.has(r.ta) || seen.has(r.tb) ? false : (seen.add(r.ta), seen.add(r.tb), true)));
}

/** beats per 5 s around each point of the stage, for the strip */
export function density(beats: Beat[], total: number, step = 1): number[] {
  const out: number[] = [];
  for (let t = 0; t < total; t += step) {
    let n = 0;
    for (const b of beats) if (b.t + b.dur + b.act >= t - 2.5 && b.t <= t + 2.5) n += b.count;
    out.push(n);
  }
  return out;
}
