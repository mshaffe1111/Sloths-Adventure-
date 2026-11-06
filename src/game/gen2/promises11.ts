/**
 * Two of gen2 1-1's player promises, judged on a built stage, so the proven list holds only rolls that keep them (the lead, 11-06, the
 * 0.9.5 release rulings: "any roll with an unmarked floorless gap is dropped from the proven list"; "no new todo: the double-teach promise
 * goes into the proven-list filter"). Used by tools/engine/seedlist.ts (the build and its --check) and the tests:
 *   - floorlessGaps: an unmarked floorless gap World 1 reads as water (w1Pits.ts findW1Pits), outside any soft heartFalls zone (a soft
 *     level gap puts him back on the take-off and draws a painted pit floor): a fall nothing warns about;
 *   - doubleAfterTeach: right after the double's teach node, a gap only the second jump crosses, with safe ground or a soft zone under it.
 */
import { jumpOK } from '../levelCheck.ts';
import { findW1Pits } from '../w1Pits.ts';
import type { Platform } from '../types.ts';

type Zone = { x0: number; x1: number; soft?: boolean };
interface Built { platforms: Platform[]; heartFalls?: Zone[]; waterY?: number; config: { levelHeight: number }; gen2?: { nodes?: Array<{ token: string; x0: number }> } }

/** the unmarked floorless gaps outside a soft zone (x0..x1 each) */
export function floorlessGaps(st: Pick<Built, 'platforms' | 'heartFalls'>): Array<[number, number]> {
  const soft = (st.heartFalls ?? []).filter((z) => z.soft);
  return findW1Pits(st.platforms).filter((q) => q.kind === 'fall' && !q.drop && !soft.some((z) => q.x0 >= z.x0 - 4 && q.x1 <= z.x1 + 4)).map((q) => [q.x0, q.x1]);
}

/** from `tip` on, the first gap within 1,500 px a plain jump can't cross and a double can; safe: ground under it or a soft zone over it */
export function doubleGap(platforms: Platform[], tip: number, death: number, zones: readonly Zone[] = []): { a: Platform; b: Platform; safe: boolean } | undefined {
  const way: Platform[] = [];
  for (const p of platforms.filter((q) => q.type === 'solid' && q.x + q.width > tip).sort((a, b) => a.x - b.x)) {
    if (way.length && p.y > way[way.length - 1].y + 80) continue;
    way.push(p);
  }
  for (let i = 0; i + 1 < way.length; i++) {
    const [a, b] = [way[i], way[i + 1]];
    if (b.x - (a.x + a.width) < 40 || b.x > tip + 1500) continue;
    if (jumpOK(a, b, false).ok || !jumpOK(a, b, true).ok) continue;
    const mid = (a.x + a.width + b.x) / 2;
    return { a, b, safe: zones.some((z) => z.soft && mid >= z.x0 && mid <= z.x1) || platforms.some((p) => p !== a && p !== b && p.x <= mid && p.x + p.width >= mid && p.y > Math.max(a.y, b.y) && p.y < death) };
  }
  return undefined;
}

/** the double-teach promise's breach by name, or null when kept */
export function doubleAfterTeach(st: Built): string | null {
  const teach = (st.gen2?.nodes ?? []).find((n) => /^T\w*2/.test(n.token));
  if (!teach) return 'no double teach node';
  const g = doubleGap(st.platforms, teach.x0, st.waterY ?? st.config.levelHeight, st.heartFalls ?? []);
  if (!g) return `no gap only the second jump crosses within 1,500 px of the teach (x ${Math.round(teach.x0)})`;
  if (!g.safe) return `nothing under the double gap at ${Math.round(g.a.x + g.a.width)}`;
  return null;
}

/** every promise a roll breaks, by name (empty: it may be proven) */
export function promiseBreaches11(st: Built): string[] {
  const out: string[] = [];
  for (const [x0, x1] of floorlessGaps(st)) out.push(`an unmarked floorless gap at x ${Math.round(x0)}..${Math.round(x1)}`);
  const d = doubleAfterTeach(st);
  if (d) out.push(d);
  return out;
}
