// ENG-SNAP: a frame trace of a tier bot on the snapper toy (snapToys.ts), the snapper's phase, its bar and his distance to it
// npx tsx tools/engine/runs/snaptoytrace.ts <which> <bot> <setting> <variant> [quiet]
import '../../../src/game/headlessDom.ts';
import { firstTimer } from '../../inspect/firsttimer.ts';
import { CAST_BOTS } from '../../inspect/castBots.ts';
import { onSnapper, snapperSeed, snapperStage, atSnapper, SNAPPER_ID, type ToySnapper } from '../../inspect/snapToys.ts';
const [which, bot, setting, v, quiet] = process.argv.slice(2);
const seed = snapperSeed(which as ToySnapper);
const who = CAST_BOTS[bot][setting as 'normal']!;
let f = 0, last = '';
const r = onSnapper(which as ToySnapper, seed, setting as 'normal', () => firstTimer(SNAPPER_ID, Number(v), who, { cap: 600, onFrame: (sim: any) => {
  f++;
  if (quiet) return;
  const p = sim.p; const e = sim.e; const c = e.cast; if (!c) return;
  const m = c.members.find((q: any) => q.def && q.e.kitBeat);
  if (!m || Math.abs(m.s.x - p.x) > 260) return;
  const kb = m.e.kitBeat; const ph = e.clock.read(kb.clock, kb.shift ?? 0).phase;
  const line = `ph ${m.s.phase}${m.cleared ? ' CLEARED' : ''} clk ${ph} dx ${Math.round(m.s.x - p.x)} gr ${p.grounded ? 1 : 0} vx ${Math.round(p.vx)} hp ${p.hp}${m.s.asleep ? ' ASLEEP' : ''}`;
  if (line !== last) { console.log(`f${f} t${(f / 30).toFixed(1)} x${Math.round(p.x)} ${line}`); last = line; }
} }));
console.log('END', JSON.stringify(atSnapper(r, snapperStage(which as ToySnapper, seed, setting as 'normal'))), 'time', r.time, 'rescues', (r as any).rescues);
