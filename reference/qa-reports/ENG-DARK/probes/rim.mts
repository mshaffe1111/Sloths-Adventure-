// one unlit crossing, frame by frame: npx tsx rim.mts <bot> <setting> <seed> <rimX> <rimY> <t0> <t1>
import path from 'node:path';
const root = process.cwd();
await import(path.join(root, 'src/game/headlessDom.ts'));
const { readyDraft } = await import(path.join(root, 'tools/engine/draft.ts')); readyDraft('3-1');
const cb = await import(path.join(root, 'tools/inspect/castBots.ts'));
const ft = await import(path.join(root, 'tools/inspect/firsttimer.ts'));
const [bot, setting, seed, rx, ry, t0, t1] = process.argv.slice(2);
let n = 0;
ft.firstTimer('3-1', Number(seed), cb.CAST_BOTS[bot][setting], { cap: Number(t1) + 1, dotSetting: true, onFrame(sim: any, b: any) {
  const t = sim.e.gameTime; if (t < Number(t0) || t > Number(t1)) return;
  const rims = b.glowRims ?? [];
  const r = rims.filter((q: any) => Math.abs(q.x - Number(rx)) < 3 && Math.abs(q.y - Number(ry)) < 3);
  const wk = r.map((q: any) => `${q.runOff ? 'runOff ' : ''}light ${q.light?.id} woke ${sim.e.glowWake.get(q.light?.id)?.toFixed?.(2)}`).join('; ');
  const g = b.glowStop; const p = sim.p;
  if (n++ % 2 === 0) console.log(`${t.toFixed(2)} x ${p.x.toFixed(0)} y ${p.y.toFixed(0)} vx ${p.vx.toFixed(0)} vy ${p.vy.toFixed(0)} gr ${p.grounded ? 1 : 0} f ${p.facing} stop ${g ? `${g.rim.x},${Math.round(g.rim.y)} since ${g.since.toFixed(2)} turn ${g.turn ?? '-'}` : '-'} gave ${b.glowGaveUp?.size} | rim ${r.length ? wk : 'NOT a glow rim'}`);
} });
