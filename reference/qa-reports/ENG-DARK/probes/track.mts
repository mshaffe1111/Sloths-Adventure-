// ENG-DARK box 14: his track every 3rd frame between t0 and t1 (x, y, vx, grounded, glowStop rim), firstTimer as darkBots plays it
// GEN2_DRAFT=3-1 npx tsx <this> <BOT e.g. FT_ADULT> <setting> <seed> <t0> <t1> [cap]
import path from 'node:path';
const root = process.cwd();
await import(path.join(root, 'src/game/headlessDom.ts'));
const { readyDraft } = await import(path.join(root, 'tools/engine/draft.ts'));
readyDraft('3-1');
const ft = await import(path.join(root, 'tools/inspect/firsttimer.ts'));
const [who, setting, seed, t0, t1, cap] = process.argv.slice(2);
let n = 0;
const r = ft.firstTimer('3-1', Number(seed), { ...ft[who], setting }, { cap: Number(cap ?? 60), onFrame(sim: any, b: any) {
  const t = sim.e.gameTime;
  if (t < Number(t0) || t > Number(t1) || n++ % 3) return;
  const g = b.glowStop;
  console.log(t.toFixed(2), Math.round(sim.p.x), Math.round(sim.p.y), Math.round(sim.p.vx), sim.p.grounded ? 'G' : 'air', g ? `stop ${g.rim.x},${g.rim.y}${g.rim.runOff ? ' run' : ''}` : '');
} });
console.log(JSON.stringify(r.dark?.unlit));
