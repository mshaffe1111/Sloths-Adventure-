// RUNS #12 #13: the Easy kid's jump bot (tools/inspect/jumps.ts inspectJumps, the noisy-thumb Monte Carlo, 200 trials a jump) on one rise
// onto one landing, laid alone: a long bank, a gap, the landing (rise R above the bank, width W), a gap, a long bank. Built on 1-1's own
// Easy config so the assist is 1-1's. Prints the kid's success on the jump onto the landing and the jump off it (and the adult's on Normal).
//   npx tsx tools/engine/runs/risewidth.ts
import '../../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import { generateStage, setLayoutVariant } from '../../../src/game/stageGenerator.ts';
import { easyStage } from '../../../src/game/easyMode.ts';
import { withGoals } from '../../../src/game/goals.ts';
import { findRoute } from '../../inspect/route.ts';
import { inspectJumps, ADULT, KID } from '../../inspect/jumps.ts';
const c = generateAllLevels().find((l) => l.id === '1-1')!;
const base: Record<string, any> = {};
for (const s of ['easy', 'normal'] as const) { setLayoutVariant(1); base[s] = s === 'easy' ? easyStage(withGoals(generateStage({ ...c, unlocked: true }, 'easy'))) : withGoals(generateStage({ ...c, unlocked: true }, 'normal')); setLayoutVariant(null); }
const GY = 1200;
console.log('rise px, landing px, gap px: kid Easy onto / off | adult Normal onto / off  (jump bot success, 200 trials)');
for (const rise of [40, 50, 60, 70]) for (const w of [90, 110, 130, 150, 220, 300]) for (const gap of [80, 110]) {
  const cells: string[] = [];
  for (const s of ['easy', 'normal'] as const) {
    const st = base[s];
    const P = [
      { id: 1, x: 0, y: GY, width: 600, height: 120, type: 'solid', style: 'moss_stone' },
      { id: 2, x: 600 + gap, y: GY - rise, width: w, height: 24, type: 'solid', style: 'branch' },
      { id: 3, x: 600 + gap + w + gap, y: GY, width: 600, height: 120, type: 'solid', style: 'moss_stone' },
    ];
    const stage = { ...st, platforms: P, vines: [], ropes: [], enemies: [], collectibles: [], checkpoints: [], spawnX: 100, spawnY: GY, exitTotemX: P[2].x + 500, exitTotemY: GY, config: { ...st.config, levelWidth: P[2].x + 600 }, meta: undefined, proto: undefined };
    const route = findRoute(stage as any);
    const js = inspectJumps(stage as any, route, s === 'easy', s === 'easy' ? KID : ADULT, () => false);
    const on = js.find((j) => j.landW === w && j.rise === rise) ?? js[0];
    const off = js.find((j) => j !== on);
    cells.push(`${on?.rate?.toFixed(3) ?? 'none'} / ${off?.rate?.toFixed(3) ?? 'none'}`);
  }
  console.log(`  +${rise} onto ${w} px, gap ${gap}: kid ${cells[0]} | adult ${cells[1]}`);
}
