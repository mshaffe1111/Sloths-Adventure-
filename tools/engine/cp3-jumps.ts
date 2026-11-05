// CP3: STAGE-RULES §1b's per-jump floors on the mixed 1-5 (the noisy-thumb bots, tools/inspect/jumps.ts, every jump on the main
// route): the Normal adult clears each jump at least 70% of the time, the Easy kid at least 85%. 16 rolls, both settings.
import '../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { generateStage, setLayoutVariant } from '../../src/game/stageGenerator.ts';
import { easyStage } from '../../src/game/easyMode.ts';
import { withGoals } from '../../src/game/goals.ts';
import { findRoute } from '../inspect/route.ts';
import { inspectJumps, ADULT, KID } from '../inspect/jumps.ts';
const c = generateAllLevels().find((l) => l.id === '1-5')!;
for (const setting of ['normal', 'easy'] as const) {
  const worst: number[] = []; let under = 0, n = 0;
  for (let v = 1; v <= 16; v++) {
    setLayoutVariant(v);
    const st: any = setting === 'easy' ? easyStage(withGoals(generateStage({ ...c, unlocked: true }, 'easy'))) : withGoals(generateStage({ ...c, unlocked: true }, 'normal'));
    setLayoutVariant(null);
    const js = inspectJumps(st, findRoute(st), setting === 'easy', setting === 'easy' ? KID : ADULT);
    const rates = js.map((j: any) => j.success ?? j.ok ?? j.rate);
    const floor = setting === 'easy' ? 0.85 : 0.7;
    n += js.length; under += rates.filter((r: number) => r < floor).length;
    worst.push(Math.min(...rates));
    for (const j of js as any[]) if ((j.rate ?? 0) < (setting === 'easy' ? 0.85 : 0.7)) console.log(`  ${setting} roll ${v}: jump at x ${Math.round(j.x)} y ${Math.round(j.y)} gap ${j.gap} rise ${j.rise} landW ${j.landW} rate ${j.rate} unflyable ${!!j.unflyable} dbl ${j.dbl} why ${j.why.join('; ')}`);
  }
  worst.sort((a, b) => a - b);
  console.log(`${setting}: jumps on the route ${n} over 16 rolls; under the floor ${under}; worst jump per roll ${worst.map((w) => w.toFixed(2)).join(' ')}`);
}
