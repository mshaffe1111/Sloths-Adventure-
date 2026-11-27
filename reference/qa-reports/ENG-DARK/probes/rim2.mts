// is an unlit crossing made from the rim's own piece? the last grounded spot before it and the presses: npx tsx rim2.mts <bot> <setting> <seed> <rimX> <rimY> <tCross>
import path from 'node:path';
const root = process.cwd();
await import(path.join(root, 'src/game/headlessDom.ts'));
const { readyDraft } = await import(path.join(root, 'tools/engine/draft.ts')); readyDraft('3-1');
const cb = await import(path.join(root, 'tools/inspect/castBots.ts'));
const ft = await import(path.join(root, 'tools/inspect/firsttimer.ts'));
const [bot, setting, seed, rx, ry, tc] = process.argv.slice(2);
let last: any = null, lastStop: any = null, jumps: string[] = [], wasGr = true, done = false;
ft.firstTimer('3-1', Number(seed), cb.CAST_BOTS[bot][setting], { cap: Number(tc) + 0.5, dotSetting: true, onFrame(sim: any, b: any) {
  if (done) return;
  const t = sim.e.gameTime, p = sim.p;
  if (p.grounded) { const q = sim.platforms.find((q: any) => p.x >= q.x - 2 && p.x <= q.x + q.width + 2 && Math.abs(q.y - p.y) <= 4); last = { t, x: Math.round(p.x), y: Math.round(p.y), piece: q ? `${Math.round(q.x)}-${Math.round(q.x + q.width)}@${Math.round(q.y)}` : '?' }; }
  if (wasGr && !p.grounded && p.vy < 0) jumps.push(`${t.toFixed(2)}@${Math.round(p.x)},${Math.round(p.y)}`);
  wasGr = p.grounded;
  if (b.glowStop) lastStop = `${b.glowStop.rim.x},${Math.round(b.glowStop.rim.y)} t ${t.toFixed(2)}`;
  if (t >= Number(tc)) { done = true; console.log(`${bot} ${setting} ${seed} rim ${rx},${ry} at ${tc}: last grounded ${JSON.stringify(last)}; take-offs in last 3 s ${jumps.filter((j) => Number(j.split('@')[0]) > Number(tc) - 3).join(' ')}; last dark stop ${lastStop ?? 'none'}`); }
} });
