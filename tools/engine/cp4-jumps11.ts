// CP4: STAGE-RULES §1b's per-jump floors on the mixer's 1-1, judged as it teaches: single jumps only before n7 (the double teach), the
// double allowed from n7 on (1-1 is EARLY_DOUBLE in the level check, so the route may take double lines there). 16 rolls, both settings.
import '../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../src/game/worldsData.ts';
import { generateStage, setLayoutVariant } from '../../src/game/stageGenerator.ts';
import { easyStage } from '../../src/game/easyMode.ts';
import { withGoals } from '../../src/game/goals.ts';
import { findRoute } from '../inspect/route.ts';
import { inspectJumps, ADULT, KID } from '../inspect/jumps.ts';
const c = generateAllLevels().find((l) => l.id === '1-1')!;
for (const setting of ['normal', 'easy'] as const) {
  const worst: number[] = []; let under = 0, n = 0, preN = 0, preU = 0;
  for (let v = 1; v <= 16; v++) {
    setLayoutVariant(v);
    const st: any = setting === 'easy' ? easyStage(withGoals(generateStage({ ...c, unlocked: true }, 'easy'))) : withGoals(generateStage({ ...c, unlocked: true }, 'normal'));
    setLayoutVariant(null);
    const teach = st.meta.mix.explain.find((e: any) => e.idea === 'double gap')?.x0 ?? Infinity;
    // (before the teach: the stage up to the double gap, judged as a stage where the double does not count yet (mission 2), so the
    // route is a single-jump one; from the teach on, the whole stage's route with the double allowed)
    const exitAt = (st.platforms.filter((p: any) => p.x + p.width <= teach + 5 && p.type === 'solid').sort((a: any, b: any) => b.x + b.width - (a.x + a.width))[0]);
    const pre = { ...st, config: { ...st.config, miniIndex: 2 }, platforms: st.platforms.filter((p: any) => p.x < teach), vines: st.vines.filter((q: any) => q.x < teach), exitTotemX: exitAt.x + exitAt.width - 40, exitTotemY: exitAt.y, collectibles: st.collectibles.filter((q: any) => q.x < teach && q.type !== 'exit_totem').concat([{ id: 99999, type: 'exit_totem', x: exitAt.x + exitAt.width - 40, y: exitAt.y - 30, collected: false, bobPhase: 0 }]) };
    const preRoute = findRoute(pre as any);
    if (preRoute.traced === 'failed') console.log(`  ${setting} roll ${v}: no single-jump route to the double teach`);
    const js = [...inspectJumps(pre as any, preRoute, setting === 'easy', setting === 'easy' ? KID : ADULT, () => false),
      ...inspectJumps(st, findRoute(st), setting === 'easy', setting === 'easy' ? KID : ADULT, () => true).filter((j: any) => j.x >= teach)];
    const floor = setting === 'easy' ? 0.85 : 0.7;
    const rate = (j: any) => j.rate ?? 0;
    n += js.length; under += js.filter((j: any) => rate(j) < floor).length;
    preN += js.filter((j: any) => j.x < teach).length; preU += js.filter((j: any) => j.x < teach && rate(j) < floor).length;
    for (const j of js.filter((j: any) => rate(j) < floor)) console.log(`  ${setting} roll ${v}: jump at x ${j.x} y ${j.y} gap ${j.gap} rise ${j.rise} landW ${j.landW} rate ${j.rate} ${j.x < teach ? 'before' : 'after'} the double teach; ${j.why?.join('; ')}`);
    worst.push(Math.min(...js.map(rate)));
  }
  worst.sort((a, b) => a - b);
  console.log(`${setting}: jumps on the route ${n} over 16 rolls; under the floor ${under} (before the double teach: ${preU} of ${preN}); worst jump per roll ${worst.map((w) => w.toFixed(2)).join(' ')}`);
}
