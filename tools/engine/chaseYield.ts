/**
 * tools/engine/chaseYield.ts — how often a K graph lays a clean chase on World 1's real kit (ENG-B4; B3's yield, measured the same
 * way): 30 rolls of the fixture graph at stage 8 on 1-1's brief and reach scope, both settings; prints laid / refused and each
 * refusal's reason, and the stretch lengths. Read-only (builds stages in memory). Usage: npx tsx tools/engine/chaseYield.ts [code] [n]
 */
import '../../src/game/headlessDom.ts';
import { buildGen2Stage } from '../../src/game/gen2/pipeline.ts';
import { withTestStage } from '../../src/game/gen2/listed.ts';
import { JUDGED } from '../../src/game/gen2/reach.ts';
import { w1World } from '../../src/game/gen2/worlds/w1.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import type { WorldKit } from '../../src/game/gen2/types.ts';
import type { LevelConfig } from '../../src/game/types.ts';

const code = process.argv[2] ?? 'A T P F R K R K R S E';
const n = Number(process.argv[3] ?? 30);
const ends = process.argv[4] as 'quiet' | 'finale' | undefined;
const W1 = w1World();
const ID = '1-98';
const CFG: LevelConfig = { ...generateAllLevels().find((l) => l.id === '1-1')!, id: ID, miniIndex: 8 };
const BRIEF = { ...W1.manifest.graphs!.briefs['1-1'], branching: 'none' as const, deal: undefined, ...(ends ? { ends } : {}) };
const G = W1.manifest.graphs!;
const sections = W1.manifest.sections.map((t) => (t.feel?.includes('1-1') ? { ...t, feel: [...t.feel, ID] } : t));
const owns = W1.manifest.owns?.['1-1'] ? { owns: { ...W1.manifest.owns, [ID]: W1.manifest.owns['1-1'] } } : {};
const kit: WorldKit = { ...W1, manifest: { ...W1.manifest, sections, ...owns, graphs: { ...G, list: [{ id: 'k', archetype: 'sprint', code }], briefs: { ...G.briefs, [ID]: BRIEF } } } };
for (const difficulty of ['normal', 'easy'] as const) {
  let ok = 0, clean = 0;
  const why = new Map<string, number>();
  const lens: number[] = [];
  const other = new Map<string, number>();
  for (let seed = 1; seed <= n; seed++) {
    const st = withTestStage({ [ID]: { kit: () => kit, seeds: [], scope: JUDGED['1-1'] } }, () => buildGen2Stage({ config: CFG, kit, seed, difficulty }));
    const errs = st.gen2.errors.filter((e) => /^chase:|^flags:/.test(e));
    if (!st.gen2.errors.length) clean++;
    if (st.chase && !errs.length) { ok++; lens.push(...st.chase.stretches.map((s) => Math.round(s.end - s.start))); }
    for (const e of errs) { const k = e.replace(/\d+/g, '#'); why.set(k, (why.get(k) ?? 0) + 1); }
    if (!errs.length && st.gen2.errors.length) for (const e of st.gen2.errors) { const k = e.replace(/\d+/g, '#').slice(0, 90); other.set(k, (other.get(k) ?? 0) + 1); }
  }
  console.log(`${difficulty}: ${ok} laid / ${n - ok} refused (clean rolls, no error at all: ${clean}); stretches ${lens.length ? `${Math.min(...lens)}-${Math.max(...lens)} px, ${(lens.length / Math.max(1, ok)).toFixed(1)} a stage` : 'none'}`);
  for (const [k, v] of [...why].sort((a, b) => b[1] - a[1])) console.log(`  ${v}x ${k}`);
  for (const [k, v] of [...other].sort((a, b) => b[1] - a[1]).slice(0, 5)) console.log(`  (other) ${v}x ${k}`);
}
