// a cast bot's frames near one dark rim (ENG-DARK-i, the 32 N loop): GEN2_DRAFT=3-1 npx tsx <this> <bot> <setting> <seed> <rimX> <rimY> <t0> <t1>
// one line per frame within 300 px of the rim between t0 and t1: t, x, y, vx, grounded, facing, the wake time of every light within 400 px
import path from 'node:path';
const root = process.cwd();
const [bot, setting, seed, rx, ry, t0, t1] = process.argv.slice(2);
const { readyDraft } = await import(path.join(root, 'tools/engine/draft.ts'));
readyDraft('3-1');
const cb = await import(path.join(root, 'tools/inspect/castBots.ts'));
const ft = await import(path.join(root, 'tools/inspect/firsttimer.ts'));
const who = cb.CAST_BOTS[bot][setting];
let f = 0;
const r = ft.firstTimer('3-1', Number(seed), who, { cap: Number(t1) + 1, dotSetting: true, onFrame: (sim: any) => {
  f++;
  const t = f / 30, p = sim.e.p ?? sim.p;
  if (t < Number(t0) || t > Number(t1)) return;
  if (Math.abs(p.x - Number(rx)) > 300 || Math.abs(p.y - Number(ry)) > 300) return;
  const wakes: string[] = [];
  for (const z of sim.stage.zones ?? []) if (z.kind === 'dark') for (const l of z.lights ?? []) if (l.id !== undefined && Math.hypot(l.x - Number(rx), l.y - Number(ry)) < 400) wakes.push(`${l.id}${l.sleep ? '' : 'A'}:${sim.e.glowWake?.get(l.id)?.toFixed(2) ?? '-'}`);
  console.log(t.toFixed(2), Math.round(p.x), Math.round(p.y), (p.vx ?? 0).toFixed(1), p.grounded ? 'G' : 'air', p.facing, p.climbing ? 'climb' : '', 'gt', sim.e.gameTime?.toFixed(2), wakes.join(' '));
} });
console.log('end', r.end, r.time, JSON.stringify(r.dark).slice(0, 600));
