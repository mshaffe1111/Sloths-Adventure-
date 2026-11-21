import '../../../src/game/headlessDom.ts';
import { firstTimer } from '../../inspect/firsttimer.ts';
import { CAST_BOTS } from '../../inspect/castBots.ts';
import { loadSeedList } from '../../../src/game/gen2/seedList.ts';
await loadSeedList('2-5');
const [bot, setting, seed, x0, x1] = process.argv.slice(2);
const who = CAST_BOTS[bot][setting as 'normal']!;
let f = 0, last = '';
const r = firstTimer('2-5', Number(seed), who, { cap: 1200, dotSetting: true, onFrame: (sim: any) => {
  f++;
  const p = sim.p; if (p.x < Number(x0) || p.x > Number(x1)) return;
  const e = sim.e; const c = e.cast; if (!c) return;
  const m = c.members.filter((q: any) => !q.cleared && Math.abs(q.s.x - p.x) < 260).sort((a: any, b: any) => Math.abs(a.s.x - p.x) - Math.abs(b.s.x - p.x))[0];
  if (!m) return;
  const kb = m.e.kitBeat; const ph = kb ? e.clock.read(kb.clock, kb.shift ?? 0).phase : '-';
  const line = `ph ${m.s.phase} clk ${ph} dx ${Math.round(m.s.x - p.x)} gr ${p.grounded ? 1 : 0} vx ${Math.round(p.vx)} hp ${p.hp}${m.s.asleep ? ' ASLEEP' : ''}`;
  if (line !== last) { console.log(`f${f} t${(f / 30).toFixed(1)} x${Math.round(p.x)} ${line}`); last = line; }
} });
console.log('END', r.end, r.time, JSON.stringify(r.goal), 'rescues', r.rescues);
