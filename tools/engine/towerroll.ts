// The fixture tower (src/game/gen2/toyTower.ts), rolled up and down on N seeds and both settings: each roll's errors by name, its
// storeys, height, flags along the route and the time model's seconds (R-165.170). No stage of the game is built here.
//   npx tsx tools/engine/towerroll.ts --seeds 24 [--flow up|down|arc] [--verbose]
import '../../src/game/headlessDom.ts';
import { buildGen2Stage } from '../../src/game/gen2/pipeline.ts';
import { arcKit, downKit, towerCfg, upKit } from '../../src/game/gen2/toyTower.ts';
const ARC_ID = '5-94';
import { validateStage } from '../../src/game/levelCheck.ts';
import { MODEL_FAST, MODEL_TYPICAL, modelStage } from '../../src/game/stageTime.ts';
import { routeAt } from '../../src/game/gen2/tower.ts';
const arg = (k: string) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined; };
const N = Number(arg('--seeds') ?? 24);
const only = arg('--flow');
const verbose = process.argv.includes('--verbose');
let bad = 0;
for (const flow of ['up', 'down', 'arc'] as const) {
  if (only && only !== flow) continue;
  for (const difficulty of ['normal', 'easy'] as const) for (let seed = 1; seed <= N; seed++) {
    const config = flow === 'arc' ? towerCfg(ARC_ID, 'ascent') : flow === 'up' ? towerCfg('5-3', 'ascent') : towerCfg('5-3', 'sprint', 'down');
    let line: string;
    try {
      const st = buildGen2Stage({ config, kit: flow === 'arc' ? arcKit(ARC_ID) : flow === 'up' ? upKit : downKit, seed, difficulty });
      const errs = [...(st.gen2.errors ?? [])];
      const v = validateStage(st);
      for (const e of v.errors) if (!errs.includes(e)) errs.push(`levelCheck: ${e}`);
      const T = st.gen2.tower!;
      const flags = (st.checkpoints ?? []).map((c) => Math.round(routeAt(T.route, c.x, c.y)));
      const ys = st.platforms.map((p) => p.y);
      line = `${flow} ${difficulty} ${seed}: ${errs.length ? 'FAIL' : 'clean'} sections ${st.gen2.sections.length} turns ${st.gen2.plan.filter((p) => p.join === 'turn').length} runouts ${T.runouts} height ${Math.max(...ys) - Math.min(...ys)} route ${Math.round(T.route.length)} flags [${flags.join(' ')}] foes ${st.enemies.length} typical ${Math.round(modelStage(st, MODEL_TYPICAL).total)}s fast ${Math.round(modelStage(st, MODEL_FAST).total)}s`;
      if (errs.length) { bad++; line += '\n    ' + errs.slice(0, verbose ? 99 : 4).join('\n    '); }
    } catch (e) { bad++; line = `${flow} ${difficulty} ${seed}: THREW ${(e as Error).message.slice(0, 300)}`; }
    console.log(line);
  }
}
console.log(bad ? `${bad} rolls not clean` : 'all clean');
process.exit(bad ? 1 : 0);
