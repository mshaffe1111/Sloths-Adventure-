// VARIETY-2, the lead's ruling 3:21 PM ET 11-13 (R-165.197/.200): findW1Pits judges each gap by its OWN lips (per-gap ground), stricter
// and consistent, never looser. PLANTED, red on today's single ground line (w1Pits.ts findOpenPits: G = the widest bank top over the WHOLE
// stage, so ground laid anywhere else moves what a gap here is). Kept OUT of CI until the per-gap ruler lands (a red test in the suite
// would fail every gate); then it moves to src/game/ beside the w1Pits tests and joins the suite.
// Run: npx tsx --test reference/qa-reports/VARIETY-2/ruler/perGapGround.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import '../../../../src/game/headlessDom.ts';
import { buildGen2Stage } from '../../../../src/game/gen2/pipeline.ts';
import { w1World } from '../../../../src/game/gen2/worlds/w1.ts';
import { generateAllLevels } from '../../../../src/game/worldsData.ts';
import { findW1Pits } from '../../../../src/game/w1Pits.ts';
import { floorlessGaps } from '../../../../src/game/gen2/promises11.ts';

const W1 = w1World();
const cfg = generateAllLevels().find((l) => l.id === '1-1')!;
const code = 'A P1< M> R X1_> R W>:8 R S E'; // (nodeMix's World 1 string 57, seed 58: floor.unmarked inside its log chain)
const kit = { ...W1, manifest: { ...W1.manifest, graphs: { ...W1.manifest.graphs!, list: [{ id: 'mix', archetype: 'sprint' as const, code }] } } };
const st = buildGen2Stage({ config: cfg, kit, seed: 58, difficulty: 'normal' });

test("a gap is judged by its own lips: wide ground laid 5,000 px past the stage's end changes nothing inside its log chain", () => {
  const chain = st.gen2.sections.find((q) => q.template === 'w1-log-chain');
  assert.ok(chain, 'string 57 seed 58 lays the log chain');
  const inside = (x0: number, x1: number) => x1 > chain.x0 && x0 < chain.x1;
  // (a bank of earth like the stage's own widest, wider than all of them together, at another height, far past the shrine)
  const banks = st.platforms.filter((p) => p.type === 'solid' && p.height >= 90);
  const end = Math.max(...st.platforms.map((p) => p.x + p.width));
  const far = { ...banks.sort((a, b) => b.width - a.width)[0], id: -1, x: end + 5000, y: 1269, width: 12000, height: 600 };
  const pits = (ps: typeof st.platforms) => findW1Pits(ps).filter((g) => inside(g.x0, g.x1)).map((g) => `${g.kind} ${Math.round(g.x0)}..${Math.round(g.x1)}${g.drop ? ' drop' : ''}`);
  assert.deepEqual(pits([...st.platforms, far]), pits(st.platforms), "the painter's pits inside the log chain moved with ground 5,000 px away");
  // (and the verdict that reads it, floor.unmarked)
  const verdict = (ps: typeof st.platforms) => floorlessGaps({ platforms: ps, heartFalls: st.heartFalls }).filter(([x0, x1]) => inside(x0, x1)).map(([x0, x1]) => `${Math.round(x0)}..${Math.round(x1)}`);
  assert.deepEqual(verdict([...st.platforms, far]), verdict(st.platforms), 'floor.unmarked inside the log chain moved with ground 5,000 px away');
});
