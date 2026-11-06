/**
 * The stage variety measure (the lead's 9:12 PM order, Matt's choice after playing Rolls A/B/C: the era h:J diversity is retired as the
 * judge; this reads the full node code AND the realised pieces). Two token streams per roll:
 *   - PIECES (any stage, gen2 or not): the stage's standable pieces left to right, each token its kind (the designer's LABELS through
 *     catalog.landingKind; a mushroom by its type, a bank told from a stone by its body) with how it is reached from the piece before
 *     (the rise class and the gap class). This is what the player meets, so a stage built from one section four times reads as one
 *     pattern four times, whatever it is called.
 *   - CODE (gen2 rolled graphs): the realised node code, gen2.code, one token per node (job, content, move, shape, tempo).
 * Per roll: INNER variety, the share of a stream's 3-grams that are distinct (1 = nothing repeats; a repeated stretch drives it down).
 * Per stage: DISTINCTNESS, the mean over roll pairs of 1 - cosine of their 3-gram profiles (0 = every roll alike).
 * The pass lines come from old 1-1 (calibrate first: tools/engine/variety.ts prints old 1-1's numbers and the reason for each line).
 */
import type { Platform } from './types.ts';
import { landingKind } from './mixer/catalog.ts';
import { JUMP_RISE } from './physics.ts';

/** what one roll is, for the measure: its platforms, and its node code when it has one */
export interface VarietyRoll { platforms: readonly Platform[]; code?: readonly string[] }

/** a piece's kind token: a mushroom by its type (gen2 stamps a stone style on it); a bank (a body of 90 px or more) told from a stone */
function kindOf(p: Platform): string {
  if (p.type === 'bouncy') return 'mush';
  const k = landingKind(p as Platform & Record<string, unknown>)[0]?.name ?? `${p.type}/${p.style ?? '-'}`;
  if (k === 'mossy stone') return p.height >= 90 ? 'bank' : 'stone';
  return k.replace(/\s+/g, '-');
}

/** the standable pieces, left to right (a sliver under 20 px is a seam, not a piece) */
function pieces(ps: readonly Platform[]): Platform[] {
  return ps.filter((p) => p.width >= 20 && p.type !== 'moving').slice().sort((a, b) => a.x - b.x || a.y - b.y);
}

/** the PIECES stream: kind, then the rise class (U2 a double's rise, U up, D down, = level) and the gap class (w walk-on, j a jump, J past a single) */
export function pieceTokens(ps: readonly Platform[]): string[] {
  const L = pieces(ps);
  return L.map((p, i) => {
    const q = L[i - 1];
    if (!q) return kindOf(p);
    const up = q.y - p.y, gap = p.x - (q.x + q.width);
    const rise = up > JUMP_RISE + 20 ? 'U2' : up > 20 ? 'U' : up < -20 ? 'D' : '=';
    const g = gap <= 20 ? 'w' : gap <= 175 ? 'j' : 'J';
    return `${kindOf(p)}${rise}${g}`;
  });
}

const grams = (ts: readonly string[]): Map<string, number> => {
  const m = new Map<string, number>();
  for (let i = 0; i + 2 < ts.length; i++) { const g = `${ts[i]} ${ts[i + 1]} ${ts[i + 2]}`; m.set(g, (m.get(g) ?? 0) + 1); }
  return m;
};
/** a stream's INNER variety: distinct 3-grams over all 3-grams (1 when nothing repeats) */
export function innerVariety(ts: readonly string[]): number {
  const g = grams(ts);
  const total = [...g.values()].reduce((a, b) => a + b, 0);
  return total ? g.size / total : 0;
}
function cosine(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0, na = 0, nb = 0;
  for (const [k, v] of a) { na += v * v; dot += v * (b.get(k) ?? 0); }
  for (const v of b.values()) nb += v * v;
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}
/** the DISTINCTNESS of a stage's rolls on one stream: mean over pairs of 1 - cosine of 3-gram profiles; and each roll's own mean */
export function distinctness(streams: ReadonlyArray<readonly string[]>): { mean: number; perRoll: number[] } {
  const G = streams.map(grams);
  const per = G.map(() => [] as number[]);
  let sum = 0, n = 0;
  for (let i = 0; i < G.length; i++) for (let j = i + 1; j < G.length; j++) {
    const d = 1 - cosine(G[i], G[j]);
    sum += d; n++; per[i].push(d); per[j].push(d);
  }
  return { mean: n ? sum / n : 0, perRoll: per.map((xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0)) };
}

/** every line for a stage's rolls: per roll its inner variety and distinctness on both streams; per stage the means and the minima */
export function stageVariety(rolls: readonly VarietyRoll[]) {
  const P = rolls.map((r) => pieceTokens(r.platforms));
  const C = rolls.map((r) => r.code ?? []);
  const hasCode = C.every((c) => c.length > 0);
  const dP = distinctness(P), dC = hasCode ? distinctness(C) : null;
  const perRoll = rolls.map((_, i) => ({
    pieceInner: innerVariety(P[i]), pieceDistinct: dP.perRoll[i],
    ...(hasCode ? { codeInner: innerVariety(C[i]), codeDistinct: dC!.perRoll[i] } : {}),
  }));
  return {
    pieceDistinct: dP.mean, pieceInnerMin: Math.min(...perRoll.map((r) => r.pieceInner)),
    ...(dC ? { codeDistinct: dC.mean, codeInnerMin: Math.min(...perRoll.map((r) => r.codeInner!)) } : {}),
    perRoll,
  };
}

/** how many separate times a stream's most repeated stretch of `k` tokens occurs (never overlapping itself: a run of stepping stones,
 *  one rhythm repeating inside one stretch, is one occurrence; a section laid again elsewhere is another) */
export function maxRepeat(ts: readonly string[], k: number): number {
  const m = new Map<string, number[]>();
  for (let i = 0; i + k <= ts.length; i++) { const g = ts.slice(i, i + k).join(' '); (m.get(g) ?? m.set(g, []).get(g)!).push(i); }
  let best = 0;
  for (const at of m.values()) {
    let n = 0, next = -Infinity;
    for (const i of at) if (i >= next) { n++; next = i + k; }
    best = Math.max(best, n);
  }
  return best;
}
/** the longest run of one token, back to back */
export function longestRun(ts: readonly string[]): number {
  let best = 0, run = 0;
  ts.forEach((t, i) => { run = i && t === ts[i - 1] ? run + 1 : 1; best = Math.max(best, run); });
  return best;
}

/**
 * The pass lines, each with its reason. CALIBRATED ON OLD 1-1 FIRST (main 68b31e66, 16 rolls, rollVariants(16)), measured 11-05 about 9:17 PM ET:
 * pieces distinctness 0.237; pieces inner variety per roll 0.18-0.36. (For the record, same measure: the floor-road trial 4fd9e992 0.388
 * and 0.33-0.50; gen2 1-1 on w1World at engine-core c2710323, 8 clean rolls, 0.524 and 0.64-0.75, code distinctness 0.937, code inner 1.0.)
 *  - DISTINCT: the stage's rolls differ from each other at least as much as old 1-1's do (0.237): new replaces old only if it is no
 *    less varied across rolls than what it replaces.
 *  - INNER: every roll is at least as varied inside as old 1-1's MOST varied roll (0.36): "variety first" (Matt), and old 1-1 is the
 *    feel to keep, not the template, so no roll may be less varied than old 1-1 at its best.
 *  - REPEAT: no stretch of 9 pieces (a short section's worth: the 25th percentile of gen2 1-1's 214 laid sections, median 12) occurs 3 or
 *    more times in a roll: NODES.md §5, "each variation used at most about twice" (Matt).
 *  - CODE (a rolled graph): the node code's rolls differ at least as much as the pieces must (0.237), and no node token runs 3 times back
 *    to back (the same rule, on structure). A stage with no node code is not judged on code; the piece lines still bind.
 */
export const VARIETY_BARS = { distinct: 0.237, inner: 0.36, repeatLen: 9, repeatMax: 2, codeDistinct: 0.237, codeRun: 2 } as const;

/** every line a stage's rolls break, by name, with the roll; empty when the stage passes */
export function varietyBreaches(rolls: ReadonlyArray<VarietyRoll & { id?: string }>): string[] {
  const B = VARIETY_BARS, out: string[] = [];
  const v = stageVariety(rolls);
  if (v.pieceDistinct < B.distinct) out.push(`distinct: rolls differ ${v.pieceDistinct.toFixed(3)} (pieces), under ${B.distinct}`);
  rolls.forEach((r, i) => {
    const name = r.id ?? `roll ${i + 1}`, P = pieceTokens(r.platforms);
    if (v.perRoll[i].pieceInner < B.inner) out.push(`inner: ${name} ${v.perRoll[i].pieceInner.toFixed(3)} (pieces), under ${B.inner}`);
    const rep = maxRepeat(P, B.repeatLen);
    if (rep > B.repeatMax) out.push(`repeat: ${name} has a ${B.repeatLen}-piece stretch ${rep} times (at most ${B.repeatMax})`);
    if (r.code?.length && longestRun(r.code) > B.codeRun) out.push(`code run: ${name} has one node token ${longestRun(r.code)} times back to back`);
  });
  if (v.codeDistinct !== undefined && v.codeDistinct < B.codeDistinct) out.push(`code distinct: rolls differ ${v.codeDistinct.toFixed(3)} (code), under ${B.codeDistinct}`);
  return out;
}
