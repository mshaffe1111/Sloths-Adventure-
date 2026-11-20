// ENG-SNAP: where a cast bot's help-ladder rescues come on 2-5 (a jump of more than 60 px in one frame), with the nearest snapper
// npx tsx tools/engine/runs/rescue25.ts <bot> <setting> <seed> [frames of trace before each]
import '../../../src/game/headlessDom.ts';
import { firstTimer } from '../../inspect/firsttimer.ts';
import { CAST_BOTS } from '../../inspect/castBots.ts';
import { loadSeedList } from '../../../src/game/gen2/seedList.ts';
await loadSeedList('2-5');
const [bot, setting, seed, back] = process.argv.slice(2);
const keep = Number(back ?? 0);
let lastX = -1, f = 0;
const ring: string[] = [];
const r = firstTimer('2-5', Number(seed), CAST_BOTS[bot][setting as 'normal']!, { cap: 1200, dotSetting: true, onFrame: (sim: any) => {
  f++;
  const p = sim.p, c = sim.e.cast;
  const m = c?.members.filter((q: any) => !q.cleared && q.e.kitBeat).sort((a: any, b: any) => Math.abs(a.s.x - p.x) - Math.abs(b.s.x - p.x))[0];
  const ph = m ? sim.e.clock.read(m.e.kitBeat.clock, m.e.kitBeat.shift ?? 0).phase : '-';
  const line = `f${f} x${Math.round(p.x)} y${Math.round(p.y)} gr ${p.grounded ? 1 : 0} vx ${Math.round(p.vx)} vy ${Math.round(p.vy)}${p.climbing ? " CLIMB" : ""}${p.hanging ? " HANG" : ""}${p.isVineSwinging ? " SWING" : ""}${m ? ` | snap ${m.s.phase} clk ${ph} dx ${Math.round(m.s.x - p.x)} dy ${Math.round(m.s.y - p.y)}${m.s.asleep ? ' ASLEEP' : ''}` : ''}`;
  if (keep) { ring.push(line); if (ring.length > keep) ring.shift(); }
  if (lastX >= 0 && Math.abs(p.x - lastX) > 60) { console.log(`RESCUE ${lastX} -> ${Math.round(p.x)} at f${f}`); if (keep) console.log(ring.join('\n')); }
  lastX = Math.round(p.x);
} });
console.log('END', r.end, r.time, 'rescues', r.rescues);
