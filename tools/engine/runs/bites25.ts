// ENG-SNAP: every snapper bite a cast bot takes on 2-5, with the 40 frames before it (the snapper's phase, its bar, his distance)
// npx tsx tools/engine/runs/bites25.ts <bot> <setting> <seed> [frames]
import '../../../src/game/headlessDom.ts';
import { firstTimer } from '../../inspect/firsttimer.ts';
import { CAST_BOTS } from '../../inspect/castBots.ts';
import { loadSeedList } from '../../../src/game/gen2/seedList.ts';
await loadSeedList('2-5');
const [bot, setting, seed, back] = process.argv.slice(2);
const keep = Number(back ?? 40);
let f = 0, hp = -1, last = '';
const ring: string[] = [];
const r = firstTimer('2-5', Number(seed), CAST_BOTS[bot][setting as 'normal']!, { cap: 1200, dotSetting: true, onFrame: (sim: any) => {
  f++;
  const p = sim.p, c = sim.e.cast;
  const m = c?.members.filter((q: any) => !q.cleared && q.e.kitBeat).sort((a: any, b: any) => Math.abs(a.s.x - p.x) - Math.abs(b.s.x - p.x))[0];
  if (!m) return;
  const ph = sim.e.clock.read(m.e.kitBeat.clock, m.e.kitBeat.shift ?? 0).phase;
  const line = `f${f} x${Math.round(p.x)} gr ${p.grounded ? 1 : 0} vx ${Math.round(p.vx)} | ${m.s.phase} clk ${ph} dx ${Math.round(m.s.x - p.x)} dy ${Math.round(m.s.y - p.y)} hp ${p.hp}`;
  if (line.replace(/^f\d+ /, '') !== last) { ring.push(line); last = line.replace(/^f\d+ /, ''); }
  if (ring.length > keep) ring.shift();
  if (hp >= 0 && p.hp < hp && (m.s.phase === 'act' || m.s.phase === 'recover') && Math.abs(m.s.x - p.x) < 80) console.log(`BITE at f${f}\n${ring.join('\n')}\n`);
  hp = p.hp;
} });
console.log('END', r.end, r.time, 'rescues', r.rescues);
