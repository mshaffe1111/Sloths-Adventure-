/**
 * ncount12.ts (the Critic, attempt-3 audit): how many of the new step-down beat `N` a 1-2 roll holds, as the packet writes its rhythms.
 *   npx tsx reference/qa-reports/CRITIC-1-2-packet/ncount12.ts [seeds=120]
 * The Designer's own kit and FLOWN stand-in (reference/specs/sims/supply12.ts); N per section is read off CONTENT-1-2-relay.md's rhythm
 * column (the fewest N of a section's versions, so this is the LOW count). STAGE-RULES §0 rule 3: no beat repeated to fill time.
 */
import '../../../src/game/headlessDom.ts';
import { buildGen2Stage } from '../../../src/game/gen2/pipeline.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import { HARVEST_12, kit12 } from '../../specs/sims/supply12.ts';
const N_OF: Record<string, number> = { 'w1-two-lifts-12': 6, 'w1-one-lift-12': 3, 'w1-stair-test-12': 6, 'w1-bank-wall-12': 6, 'w1-bounce-wall-12': 5, 'w1-mushroom-log-12': 3, 'w1-drop-bounce-12': 2, 'w1-dip-bounce-12': 1, 'w1-root-steps': 3, 'w1-stair-lift': 5, 'w1-cap-lift': 3, 'w1-under-roots-fork': 2, 'w1-note-hollow': 2, 'w1-thorn-chain-rise': 1 };
const RUN_OF: Record<string, number> = { 'w1-two-lifts-12': 3, 'w1-one-lift-12': 3, 'w1-stair-test-12': 6, 'w1-bank-wall-12': 6, 'w1-bounce-wall-12': 5, 'w1-mushroom-log-12': 3, 'w1-root-steps': 3, 'w1-stair-lift': 5, 'w1-cap-lift': 3 };
const c12 = generateAllLevels().find((c: any) => c.id === '1-2')!;
const config = { ...c12, id: '1-1', miniIndex: 1 };
const n = Number(process.argv[2] ?? 120);
for (const gid of Object.keys(HARVEST_12)) {
  const tot: number[] = []; let long = 0, built = 0;
  for (let seed = 1; seed <= n; seed++) {
    try {
      const st: any = buildGen2Stage({ config, kit: kit12(gid, true), seed, difficulty: 'normal' });
      const plan: any[] = st.gen2.plan ?? []; built++;
      tot.push(plan.reduce((s, p) => s + (N_OF[p.template] ?? 0), 0));
      if (plan.some((p) => (RUN_OF[p.template] ?? 0) >= 5)) long++;
    } catch { /* no roll */ }
  }
  tot.sort((a, b) => a - b);
  console.log(`${gid}: ${built} rolls; N beats a roll: min ${tot[0]} median ${tot[tot.length >> 1]} max ${tot[tot.length - 1]}; rolls with 10 or more: ${tot.filter((x) => x >= 10).length}; rolls holding a run of 5 or 6 N in a row: ${long}`);
}
