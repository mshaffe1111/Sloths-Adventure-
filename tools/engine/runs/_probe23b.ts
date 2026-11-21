// BUILD-23d trace tool (not a gate): lineFaults (incl. the child check, R-165.363) on 2-3's rolls, both settings: npx tsx tools/engine/runs/_probe23b.ts 1-100
import '../../../src/game/headlessDom.ts';
import { buildStage } from '../libstage.ts';
import { listedStage, playFinish } from '../../../src/game/gen2/listed.ts';
import { W2_FOLLOW } from '../../../src/game/gen2/worlds/w2.ts';
import { lineFaults } from '../../../src/game/gen2/lineFaults.ts';
const seeds = (process.argv[2] ?? '1-6').split('-').map(Number);
for (let seed = seeds[0]; seed <= (seeds[1] ?? seeds[0]); seed++) for (const d of ['normal', 'easy'] as const) {
  const st: any = playFinish(listedStage('2-3')!, buildStage('2-3', seed, d), d);
  const water = (safe: boolean) => (st.rivers ?? []).filter((r: any) => !!r.safe === safe).map((r: any) => ({ x0: r.x0, x1: r.x1, y: r.surfaceY }));
  const f = lineFaults({ platforms: st.platforms, vines: st.vines, collectibles: st.collectibles, exitTotemX: st.exitTotemX, bushes: st.proto.bushes, watch: st.proto.watch, safeWater: water(true), deepWater: water(false), dir: 1 }, W2_FOLLOW, d === 'easy');
  console.log(`seed ${seed} ${d}: ${f.length ? '\n  ' + f.join('\n  ') : 'clean'}`);
}
