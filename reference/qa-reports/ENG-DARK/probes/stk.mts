// stuck spots with y and t for one cast row, run in the tree's cwd: npx tsx stk.mts <bot> <setting> <seed> [t0 t1 every]
import path from 'node:path';
const root = process.cwd();
await import(path.join(root, 'src/game/headlessDom.ts'));
const { readyDraft } = await import(path.join(root, 'tools/engine/draft.ts')); readyDraft('3-1');
const cb = await import(path.join(root, 'tools/inspect/castBots.ts'));
const ft = await import(path.join(root, 'tools/inspect/firsttimer.ts'));
const [bot, setting, seed, t0, t1, ev] = process.argv.slice(2);
const who = cb.CAST_BOTS[bot][setting];
let n = 0;
const r = ft.firstTimer('3-1', Number(seed), who, { cap: 1200, dotSetting: true, onFrame(sim: any) {
  const t = sim.e.gameTime; if (t0 === undefined || t < Number(t0) || t > Number(t1) || n++ % Number(ev ?? 6)) return;
  console.log('F', t.toFixed(1), Math.round(sim.p.x), Math.round(sim.p.y), Math.round(sim.p.vx), Math.round(sim.p.vy), sim.p.grounded ? 'G' : 'a', sim.p.onVine ? 'V' : '');
} });
console.log('END', r.end, r.time, 'rescues', r.rescues);
for (const s of r.stuck) console.log('S', s.x, s.y, s.t, s.dur, s.rescued ? 'R' : '-', s.what);
