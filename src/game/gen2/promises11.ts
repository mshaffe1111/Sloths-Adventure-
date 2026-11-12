/**
 * Two of gen2 1-1's player promises, judged on a built stage, so the proven list holds only rolls that keep them (the lead, 11-06, the
 * 0.9.5 release rulings: "any roll with an unmarked floorless gap is dropped from the proven list"; "no new todo: the double-teach promise
 * goes into the proven-list filter"). Used by tools/engine/seedlist.ts (the build and its --check) and the tests:
 *   - floorlessGaps: an unmarked floorless gap World 1 reads as water (w1Pits.ts findW1Pits), outside any soft heartFalls zone (a soft
 *     level gap puts him back on the take-off and draws a painted pit floor): a fall nothing warns about;
 *   - doubleAfterTeach: right after the double's teach node, a gap only the second jump crosses, with safe ground or a soft zone under it.
 * R-165.61 (ADR-001 decision 8): both are entries of ONE PromiseRegistry (PROMISES_11), read by the pipeline's verdicts (verdicts.ts
 * judgeRoll, which seedList.ts and the seed list tool read): its `settings` say where each is judged, never a substring of its line. "Only
 * the second jump crosses" is judged on the flown arcs (reach.ts): one jump at its best fails (any timing, hold), a double flick from 70 px
 * crosses.
 */
import { jumpOK } from '../levelCheck.ts';
import { findW1Pits } from '../w1Pits.ts';
import type { Platform } from '../types.ts';
import type { Difficulty } from '../difficulty.ts';
import { BODY_H, lesserArcs, linkArcs } from './reach.ts';
import type { JudgedStage, PromiseDef, PromiseRegistry, Verdict } from './verdicts.types.ts';

type Zone = { x0: number; x1: number; soft?: boolean };
/** the stage `promiseBreaches11` reads as (this file's direct reader is 1-1's own, by name); the REGISTRY names no stage */
const ONE_ONE = '1-1';
interface Built { platforms: Platform[]; heartFalls?: Zone[]; waterY?: number; config: { levelHeight: number }; gen2?: { nodes?: Array<{ token: string; x0: number }>; brief?: { teaches?: string[] } } }

/** the narrowest slot he can fall into (the Critic, E0a attempt 2: seed 323 Normal's 23 px slot is no drop; his body is about 32 px) */
export const BODY_W = { px: 32, source: 'the Critic, E0a attempt 2 (seed 323 Normal x27200..27273)' } as const;

/**
 * World 1's floorless slots he can really fall into (w1Pits 'fall' gaps; the lead's ruling, 11-11, on the Critic's flight). A piece over
 * the slot closes the part it covers unless he can get under it: from EITHER lip, its underside at least his body's 48 px (reach.ts
 * BODY_H) over that lip's top, or from a floor inside the slot more than 10 px under it (seed 172: off block 146, top 906, he walks under the 838 deck). A
 * piece at lip level (top within 10 px) or plugging it closes it. Then the widest part left open: under BODY_W, his body cannot drop
 * through, no fall (seed 323: branch 128 leaves 23 px); BODY_W or wider, a fall.
 */
export function realFalls(platforms: readonly Platform[]): ReturnType<typeof findW1Pits> {
  return findW1Pits(platforms).filter((q) => {
    if (q.kind !== 'fall') return false;
    const solid = platforms.filter((p) => p.type === 'solid' && !p.broken && p.x < q.x1 && p.x + p.width > q.x0);
    const edge = platforms.filter((p) => p.type === 'solid' && (Math.abs(p.x + p.width - q.x0) <= 2 || Math.abs(p.x - q.x1) <= 2)).map((p) => p.y);
    // (he passes under a piece from a lip whose top stands BODY_H.px or more below its underside; or from a floor inside the slot more
    // than 10 px under its top. The Critic, fc1efb3b: from EITHER lip, never only the higher one)
    const lips = [q.top, ...edge];
    const passUnder = (p: Platform) => lips.some((L) => p.y + p.height <= L - BODY_H.px) || solid.some((f) => f !== p && f.y > p.y + 10);
    const cov = solid.filter((p) => !passUnder(p)).map((p) => [Math.max(q.x0, p.x), Math.min(q.x1, p.x + p.width)] as const).sort((a, b) => a[0] - b[0]);
    let at = q.x0, open = 0;
    for (const [a, b] of cov) { open = Math.max(open, a - at); at = Math.max(at, b); }
    open = Math.max(open, q.x1 - at);
    return open >= BODY_W.px;
  });
}

/** the unmarked floorless gaps outside a soft zone (x0..x1 each) */
export function floorlessGaps(st: Pick<Built, 'platforms' | 'heartFalls'>): Array<[number, number]> {
  const soft = (st.heartFalls ?? []).filter((z) => z.soft);
  return realFalls(st.platforms).filter((q) => !q.drop && !soft.some((z) => q.x0 >= z.x0 - 4 && q.x1 <= z.x1 + 4)).map((q) => [q.x0, q.x1]);
}

/** from `tip` on, the first gap within 1,500 px one jump at its best can't cross and a double flick can (reach.ts, flown, `setting`);
 *  safe: ground under it or a soft zone over it */
export function doubleGap(platforms: Platform[], tip: number, death: number, zones: readonly Zone[] = [], setting: Difficulty, stageId: string): { a: Platform; b: Platform; safe: boolean } | undefined {
  const lesser = lesserArcs(setting, stageId), taught = linkArcs(setting, stageId);
  const way: Platform[] = [];
  for (const p of platforms.filter((q) => q.type === 'solid' && q.x + q.width > tip).sort((a, b) => a.x - b.x)) {
    if (way.length && p.y > way[way.length - 1].y + 80) continue;
    way.push(p);
  }
  for (let i = 0; i + 1 < way.length; i++) {
    const [a, b] = [way[i], way[i + 1]];
    if (b.x - (a.x + a.width) < 40 || b.x > tip + 1500) continue;
    if (jumpOK(a, b, false, lesser).ok || !jumpOK(a, b, true, taught).ok) continue;
    const mid = (a.x + a.width + b.x) / 2;
    return { a, b, safe: zones.some((z) => z.soft && mid >= z.x0 && mid <= z.x1) || platforms.some((p) => p !== a && p !== b && p.x <= mid && p.x + p.width >= mid && p.y > Math.max(a.y, b.y) && p.y < death) };
  }
  return undefined;
}

/** the double-teach promise: its breach by name and line, or null when kept */
export function doubleAfterTeach(st: Built, setting: Difficulty, stageId: string): { id: 'teach.double-no-gap-after' | 'teach.double-gap-unsafe'; line: string; x0: number; x1: number } | null {
  const teach = (st.gen2?.nodes ?? []).find((n) => /^T\w*2/.test(n.token));
  if (!teach) return { id: 'teach.double-no-gap-after', line: 'no double teach node', x0: 0, x1: 0 };
  const g = doubleGap(st.platforms, teach.x0, st.waterY ?? st.config.levelHeight, st.heartFalls ?? [], setting, stageId);
  if (!g) return { id: 'teach.double-no-gap-after', line: `no gap only the second jump crosses within 1,500 px of the teach (x ${Math.round(teach.x0)})`, x0: Math.round(teach.x0), x1: Math.round(teach.x0 + 1500) };
  if (!g.safe) return { id: 'teach.double-gap-unsafe', line: `nothing under the double gap at ${Math.round(g.a.x + g.a.width)}`, x0: Math.round(g.a.x + g.a.width), x1: Math.round(g.b.x) };
  return null;
}

/** what a promise reads: the judged stage and the built stage it came from */
type WithBuilt = JudgedStage & { built?: Built };
const builtOf = (st: JudgedStage): Built => {
  const b = (st as WithBuilt).built;
  if (!b) throw new Error(`promises11: ${st.stageId} ${st.setting} was judged without its built stage`);
  return b;
};
// (packet E12 item 3: the double's promises run on a judged stage whose BRIEF teaches the double, GraphBrief.teaches; 1-1's does)
const teachPromise = (id: 'teach.double-no-gap-after' | 'teach.double-gap-unsafe'): PromiseDef => ({
  id, stages: 'all', settings: ['normal'],
  judge: (st) => { const d = builtOf(st).gen2?.brief?.teaches?.includes('double') ? doubleAfterTeach(builtOf(st), st.setting, st.stageId) : null; return d && d.id === id ? [{ name: id, setting: st.setting, at: { x0: d.x0, x1: d.x1 }, line: d.line }] : []; },
});

/** the judged stages' promises (1-1's first), ONE definition for the pipeline's verdicts, the seed list and the tests (ADR-001 decision
 *  8): Easy has no double gap (bands.md §2), so the double's promises are judged on Normal only, by `settings`. Every judged stage
 *  (reach.ts JUDGED: the pipeline judges no other) is held to `floor.unmarked` */
export const PROMISES_11: PromiseRegistry = [
  {
    id: 'floor.unmarked', stages: 'all', settings: ['normal', 'easy'],
    judge: (st) => floorlessGaps(builtOf(st)).map(([x0, x1]): Verdict => ({ name: 'floor.unmarked', setting: st.setting, at: { x0: Math.round(x0), x1: Math.round(x1) }, line: `an unmarked floorless gap at x ${Math.round(x0)}..${Math.round(x1)}` })),
  },
  teachPromise('teach.double-no-gap-after'),
  teachPromise('teach.double-gap-unsafe'),
];

/** every promise a roll breaks on `setting`, by its line (empty: kept), from the registry: the ones not judged there are skipped */
export function promiseBreaches11(st: Built, setting: Difficulty = 'normal'): string[] {
  const js = { stageId: ONE_ONE, setting, policy: 'no-lethal', drops: [], asks: [], built: st } as unknown as JudgedStage;
  return PROMISES_11.filter((p) => p.settings.includes(setting)).flatMap((p) => p.judge(js).map((v) => v.line));
}
