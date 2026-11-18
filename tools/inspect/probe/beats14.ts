// POLISH-1 probe (scratch): seconds a bot spends per section, from an FT_FRAMES trace (the piece he last stood on)
import { readFileSync } from 'node:fs';
import { RealPlay } from '../../../src/game/realPlay.ts';
import { setDifficulty } from '../../../src/game/difficulty.ts';
const [stage, setting, seed, trace] = process.argv.slice(2);
setDifficulty(setting as never);
const st: any = new RealPlay(stage, Number(seed)).stage;
const secs = new Map<string, string>(st.gen2.sections.map((s: any) => [s.uid, s.template]));
const byId = new Map<number, any>(st.platforms.map((p: any) => [p.id, p]));
let cur = 'start', last = 0; const tot = new Map<string, number>(); const order: string[] = [];
for (const l of readFileSync(trace, 'utf8').split('\n')) {
  const m = l.match(/^\s+f ([\d.]+) .* on (-?\d+)/); if (!m) continue;
  const t = +m[1], id = +m[2];
  tot.set(cur, (tot.get(cur) ?? 0) + (t - last)); last = t;
  const p = byId.get(id); if (!p?.tag) continue;
  const name = secs.get(String(p.tag).split(':')[0]) ?? String(p.tag);
  if (name !== cur) { cur = name; if (!order.includes(name)) order.push(name); }
}
for (const k of order) console.log(k.padEnd(22), (tot.get(k) ?? 0).toFixed(1));
console.log('total', last.toFixed(1));
