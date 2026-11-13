// VARIETY-2 repro (the lead's rulings 3:21 and 3:27 PM ET 11-13, R-165.197/.200): findW1Pits must judge each gap by its OWN lips. Today it
// reads ONE ground line G for the whole stage (w1Pits.ts findOpenPits: the widest bank top), so ground laid far away moves what a gap here
// is. RED today (exit 1, output pasted in RED.txt beside this); the per-gap ruler job turns this into its planted test in src/game/.
// Run: npx tsx reference/qa-reports/VARIETY-2/ruler/perGapGround.repro.ts
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
const chain = st.gen2.sections.find((q) => q.template === 'w1-log-chain')!;
const inside = (x0: number, x1: number) => x1 > chain.x0 && x0 < chain.x1;
// (a bank of earth like the stage's own widest, wider than all of them together, at another height, 5,000 px past the shrine)
const banks = st.platforms.filter((p) => p.type === 'solid' && p.height >= 90);
const end = Math.max(...st.platforms.map((p) => p.x + p.width));
const far = { ...banks.sort((a, b) => b.width - a.width)[0], id: -1, x: end + 5000, y: 1269, width: 12000, height: 600 };
const pits = (ps: typeof st.platforms) => findW1Pits(ps).filter((g) => inside(g.x0, g.x1)).map((g) => `${g.kind} ${Math.round(g.x0)}..${Math.round(g.x1)}${g.drop ? ' drop' : ''}`);
const verdict = (ps: typeof st.platforms) => floorlessGaps({ platforms: ps, heartFalls: st.heartFalls }).filter(([x0, x1]) => inside(x0, x1)).map(([x0, x1]) => `${Math.round(x0)}..${Math.round(x1)}`);
const rows = [
  ['painter pits in the log chain', pits(st.platforms), pits([...st.platforms, far])],
  ['floor.unmarked in the log chain', verdict(st.platforms), verdict([...st.platforms, far])],
] as const;
let red = false;
console.log(`string 57 seed 58, log chain x ${chain.x0}..${chain.x1}; far ground: x ${far.x}, y ${far.y}, ${far.width} px wide`);
for (const [what, a, b] of rows) {
  const same = JSON.stringify(a) === JSON.stringify(b);
  red ||= !same;
  console.log(`${same ? 'SAME' : 'MOVED'} ${what}: as laid ${JSON.stringify(a)} | with the far ground ${JSON.stringify(b)}`);
}
console.log(red ? 'RED: a gap here is judged by ground 5,000 px away (the single ground line)' : 'GREEN: each gap judged by its own lips');
process.exit(red ? 1 : 0);
