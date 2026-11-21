// BUILD-23d trace tool (not a gate): cageBot's skill-off plant run (middle, seed 1) with heron phases, the no-line deadlock: npx tsx tools/engine/runs/_plant23.ts 300
import '../../../src/game/headlessDom.ts';
import { FirstTimerRun, FT_MIDDLE, CAGE_SKILL, freshPhone, rng } from '../../inspect/firsttimer.ts';
for (const k of Object.keys(CAGE_SKILL) as Array<keyof typeof CAGE_SKILL>) (CAGE_SKILL as any)[k] = false;
freshPhone(FT_MIDDLE.setting);
Math.random = rng(1 * 7919 + 13);
const run = new FirstTimerRun('2-3', 1, FT_MIDDLE, { cap: Number(process.argv[2] ?? 900) });
const T = (run as any);
const orig = T.sim.frame.bind(T.sim);
let k = 0;
T.sim.frame = (inp: any) => { const r = orig(inp); if (++k % 30 === 0 && T.sim.p.x > 19800 && T.sim.p.x < 21000) { const e: any = T.e; console.log(T.t.toFixed(0), Math.round(T.sim.p.x), JSON.stringify(inp), (e.follow?.herons ?? []).map((h: any) => h.s.phase + ':' + h.s.t.toFixed(1) + '/' + h.s.dur.toFixed(1)).join(' '), 'hiding', T.hiding, 'watch', JSON.stringify(e.watchState ?? null)?.slice(0, 80)); } return r; };
run.play();
const e: any = run.e;
console.log('end', run.end, 't', run.t.toFixed(1), 'x', Math.round(run.sim.p.x), 'exit', Math.round(e.exitTotemX), 'rescues', run.rescues);
