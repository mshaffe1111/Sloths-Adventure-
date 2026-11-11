/** mainflag12.ts (the Critic, attempt-7 audit): the pickups written in 1-2's 11 reused sections, by the `main` flag of the piece each stands on.
 *   npx tsx reference/qa-reports/CRITIC-1-2-packet/mainflag12.ts
 * A stump (w1.ts:158) carries no `main` at all; only an off-path piece is `main: false` (w1.ts:1504 reads it so). */
import '../../../src/game/headlessDom.ts';
import { w1World } from '../../../src/game/gen2/worlds/w1.ts';
const M: any = w1World().manifest;
const tally: Record<string, number> = { 'main: true': 0, 'main: false': 0, 'main unset': 0 };
const KEEP = new Set(['w1-stump-stile', 'w1-stone-zigzag', 'w1-hollow-twoway', 'w1-dropdown-stair', 'w1-floor-dash', 'w1-bank-stair-fork', 'w1-stair-run', 'w1-bank-run', 'w1-zigzag-run', 'w1-stump-descent', 'w1-stair-gap-twist']);
const bySec: string[] = [];
for (const s of M.sections.filter((q: any) => KEEP.has(q.id))) {
  const t = { t: 0, f: 0, u: 0 };
  for (const v of s.subBlocks[0].versions) {
    const pieces = new Map<string, any>([...s.pieces, ...v.pieces].map((p: any) => [p.key, p]));
    for (const k of (v.sockets ?? []).filter((q: any) => q.role === 'pickup')) {
      const p = pieces.get(k.on); const n = k.count ?? 1;
      if (!p) continue;
      if (p.main === true) { t.t += n; tally['main: true'] += n; } else if (p.main === false) { t.f += n; tally['main: false'] += n; } else { t.u += n; tally['main unset'] += n; }
    }
  }
  bySec.push(`${s.id.replace('w1-', '')} ${t.t}/${t.f}/${t.u}`);
}
console.log('pickups written in the 11 reused sections, by the piece they stand on:', JSON.stringify(tally));
console.log('per section (true/false/unset):', bySec.join('  '));
