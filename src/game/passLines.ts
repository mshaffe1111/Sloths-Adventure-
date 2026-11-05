/**
 * Pass lines from measured reference rows, never from profile words (the designer's 12:48 ruling: words set no numbers; the lead, 11-05).
 * Each row is a stage's reference, measured: 1-1's are old 1-1's own medians on main, 16 layouts x 2 settings (engine-runs
 * reference/engine/runs/out/old12/layout.txt; ENGINE-SPEC "1-1 for the builder" §E). The measure is engine-runs' own (tools/engine/runs/
 * layout.py `zones` on CP1's measure2.py `landings`), ported line for line; passLines.test.ts holds it to old 1-1's numbers on main.
 */
import type { Platform, Rope } from './types.ts';

/** a stage's lines: the median over its Normal builds must reach each one */
export interface PassLines {
  splitsMin: number;
  twoRoadMin: number;
  /** the rest of the stage's own lines, judged by stage.ts on engine-runs' measures (ENGINE-SPEC "1-1 for the builder" §E.2) */
  floatMax?: number;
  view?: { pickupsUpright: number; pickupsSideways: number; hazardKinds: number; standingKinds: number; upperHalfMin: number };
  ideasMin?: number;
  /** boughs and creaky pieces (catch branches count) as a share of the landings, median over builds */
  /** distinct surface kinds a build (CP1's kinds, measure2.py kind), median over builds, at least this (R2 lesson 1: variety) */
  surfaceKindsMin?: number;
  boughShareMax?: number;
  upDownMin?: number;
  newEveryPxMax?: number;
  source: string;
}
export const REFERENCE: Readonly<Record<string, PassLines>> = {
  '1-1': {
    splitsMin: 34, twoRoadMin: 0.61, floatMax: 0.253,
    view: { pickupsUpright: 4, pickupsSideways: 7, hazardKinds: 0, standingKinds: 4, upperHalfMin: 0.98 },
    ideasMin: 4, upDownMin: 0.8, newEveryPxMax: 572, boughShareMax: 0.253, surfaceKindsMin: 4.5,
    source: "old 1-1 on main, medians over 16 layouts x 2 (engine-runs out/old12/layout.txt; ENGINE-SPEC '1-1 for the builder' §E.2); surface kinds: old 1-1's median 4.5 (range 4-5), dump.ts on main, 16 layouts",
  },
};

/** CP1's landings, less climbs and lianas (layout.py zones): every standable top (soil walls are not one) and every rope */
function landings(st: { platforms: Platform[]; ropes?: Rope[] }): Array<[number, number, number]> {
  const L: Array<[number, number, number]> = st.platforms.filter((p) => !p.soil).map((p) => [p.x, p.x + p.width, p.y]);
  for (const r of st.ropes ?? []) L.push([r.x0, r.x1, r.y]);
  return L;
}
/** two standable tops `dist` px or more apart in height within 90 px of each x, for over 300 px: a split (and its share of the stage) */
export function splitsOf(st: { platforms: Platform[]; ropes?: Rope[] }, dist = 120): { splits: number; twoRoad: number } {
  const L = landings(st);
  const x0 = Math.min(...L.map((q) => q[0])), x1 = Math.max(...L.map((q) => q[1]));
  const W = Math.max(...st.platforms.map((p) => p.x + p.width));
  const zones: Array<[number, number]> = [];
  let run = 0, x = x0;
  while (x < x1) {
    const ys = [...new Set(L.filter((q) => q[0] - 90 <= x && x <= q[1] + 90).map((q) => q[2]))].sort((a, b) => a - b);
    if (ys.length >= 2 && ys[ys.length - 1] - ys[0] >= dist) run += 20;
    else {
      if (run > 300) zones.push([x - run, x]);
      run = 0;
    }
    x += 20;
  }
  if (run > 300) zones.push([x - run, x]);
  return { splits: zones.length, twoRoad: Math.round((zones.reduce((s, [a, b]) => s + b - a, 0) / W) * 1000) / 1000 };
}
/** the median of a list */
export const median = (v: number[]) => { const s = [...v].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
/** a stage's lines against its reference row: what falls short (empty: it passes; no row: no lines to judge) */
export function judgeLines(id: string, measured: Array<{ splits: number; twoRoad: number }>): string[] {
  const ref = REFERENCE[id];
  if (!ref) return [];
  const s = median(measured.map((m) => m.splits)), t = median(measured.map((m) => m.twoRoad));
  const out: string[] = [];
  if (s < ref.splitsMin) out.push(`splits at 120 px: median ${s}, line ${ref.splitsMin} (${ref.source})`);
  if (t < ref.twoRoadMin) out.push(`two-road share: median ${t}, line ${ref.twoRoadMin} (${ref.source})`);
  return out;
}
