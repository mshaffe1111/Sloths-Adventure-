// ENG-QUIET-d: a bot run's frames between two x, printed when his state changes (rule 28 trace: x, frame, what took him).
//   npx tsx reference/qa-reports/ENG-QUIET/probes/frames.ts <stage> <variant> <bot> <setting> <x0> <x1> [maxLines]
import { CAST_BOTS } from '../../../../tools/inspect/castBots.ts';
import { firstTimer } from '../../../../tools/inspect/firsttimer.ts';
const [stage, v, bot, setting, a, b, m] = process.argv.slice(2);
let f = 0, last = '', lines = 0; const max = +(m ?? 80);
firstTimer(stage, +v, CAST_BOTS[bot][setting as 'easy' | 'normal']!, { cap: 1200, dotSetting: true, onFrame: (sim: any) => {
  f++; const p = sim.p ?? sim.engine?.player ?? sim.player; if (!p || p.x < +a || p.x > +b || lines >= max) return;
  const s = `${p.grounded ? 'G' : 'A'}${p.onVine || p.vine ? 'V' : ''}${p.inWater || p.swimming ? 'W' : ''} vx${Math.sign(Math.round(p.vx))}`;
  if (s !== last) { console.log(`f${f} t${(f / 30).toFixed(1)} x${Math.round(p.x)} y${Math.round(p.y)} vy${Math.round(p.vy)} ${s}`); last = s; lines++; }
} });
