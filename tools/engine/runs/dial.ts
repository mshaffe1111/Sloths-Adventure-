// RUNS #64 #66 #73: the mixer's difficulty dial swept on one stage. The mixer reads d from the config's world and stage
// (src/game/mixer/w1mix.ts:884, d = (0.1 (w-1) + 0.2 (s-1)/8) / 1.1), so the same plan is built at d = 0 (w1 s1), 0.45 (w6 s1) and 1
// (w10 s9) by handing generateStage a config with those indexes; the built stage is then given back its own config, so the bots' assist
// and the clock read it as the stage it is. 16 layouts x 2 settings. Per d: the quick clock (stageTime MODEL_FAST), bursts laid, the
// largest rise laid, and the noisy jump bots on the main route (tools/inspect/jumps.ts: adult on Normal, kid on Easy).
//   SID=1-5 npx tsx tools/engine/runs/dial.ts
import '../../../src/game/headlessDom.ts';
import { generateAllLevels } from '../../../src/game/worldsData.ts';
import { generateStage, setLayoutVariant } from '../../../src/game/stageGenerator.ts';
import { easyStage } from '../../../src/game/easyMode.ts';
import { withGoals } from '../../../src/game/goals.ts';
import { modelAll } from '../../../src/game/stageTime.ts';
import { findRoute } from '../../inspect/route.ts';
import { inspectJumps, ADULT, KID } from '../../inspect/jumps.ts';
const id = process.env.SID ?? '1-5';
const c = generateAllLevels().find((l) => l.id === id)!;
const DIALS: Array<[string, number, number]> = [['d 0', 1, 1], ['d 0.45', 6, 1], ['d 1', 10, 9]];
const med = (v: number[]) => { const a = [...v].sort((x, y) => x - y); return a[a.length >> 1]; };
for (const setting of ['normal', 'easy'] as const) for (const [name, w, s] of DIALS) {
  const clock: number[] = [], bursts: number[] = [], rise: number[] = [], mean: number[] = [], worst: number[] = [], under: number[] = [];
  for (let v = 1; v <= 16; v++) {
    setLayoutVariant(v);
    const cfg = { ...c, unlocked: true, worldIndex: w, miniIndex: s };
    let st: any;
    try { st = setting === 'easy' ? easyStage(withGoals(generateStage(cfg, 'easy'))) : withGoals(generateStage(cfg, 'normal')); } finally { setLayoutVariant(null); }
    st.config = { ...st.config, worldIndex: c.worldIndex, miniIndex: c.miniIndex };
    clock.push(Math.round(modelAll(st).fast.total));
    bursts.push(st.meta.mix.explain.filter((e: any) => e.node > 0 && /burst/.test(e.why)).length);
    const P = st.platforms.filter((p: any) => !p.soil && !p.decorative && !p.catch).sort((a: any, b: any) => a.x - b.x);
    let r = 0; for (let i = 1; i < P.length; i++) if (P[i].x - (P[i - 1].x + P[i - 1].width) > 20 && P[i].x - (P[i - 1].x + P[i - 1].width) < 300) r = Math.max(r, P[i - 1].y - P[i].y);
    rise.push(r);
    const js = inspectJumps(st, findRoute(st), setting === 'easy', setting === 'easy' ? KID : ADULT, () => true).filter((j) => j.rate !== null);
    const rates = js.map((j) => j.rate as number);
    mean.push(rates.reduce((a, b) => a + b, 0) / Math.max(1, rates.length)); worst.push(Math.min(...rates)); under.push(rates.filter((x) => x < (setting === 'easy' ? 0.85 : 0.7)).length);
  }
  console.log(`${id} ${setting} ${name}: clock ${med(clock)} s (${Math.min(...clock)}-${Math.max(...clock)}); bursts laid ${med(bursts)}; largest rise ${med(rise)} px (max ${Math.max(...rise)}); jump bot mean ${med(mean).toFixed(3)}, worst jump ${med(worst).toFixed(3)} (min ${Math.min(...worst).toFixed(3)}), jumps under the floor ${med(under)} (max ${Math.max(...under)})`);
}
