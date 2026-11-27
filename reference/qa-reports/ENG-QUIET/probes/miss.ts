// ENG-QUIET-d: one bot run, every stall, rescue and life lost with the gen2 piece under it (rule 28 trace).
//   npx tsx reference/qa-reports/ENG-QUIET/probes/miss.ts <stage> <variant> <bot> <setting>
import { castRun, CAST_BOTS } from '../../../../tools/inspect/castBots.ts';
import { firstTimer } from '../../../../tools/inspect/firsttimer.ts';
import { piecesOf } from '../../../../tools/inspect/tierBots.ts';
const [stage, v, bot, setting] = process.argv.slice(2);
const pcs = piecesOf(stage, +v, setting as 'easy' | 'normal');
const at = (x: number) => { const p = pcs.find((q) => x >= q.x0 && x < q.x1); return p ? `${p.id}[${p.x0}..${p.x1}]` : '?'; };
const r = firstTimer(stage, +v, CAST_BOTS[bot][setting as 'easy' | 'normal']!, { cap: 1200, dotSetting: true });
console.log(`${stage} v${v} ${bot} ${setting}: end ${r.end} t ${r.time} rescues ${r.rescues} (at x ${JSON.stringify((r as any).rescueXs ?? '')})`);
for (const s of r.stuck as any[]) console.log(`  stuck t${s.t} dur${s.dur} x${Math.round(s.x)},${Math.round(s.y)} rescued=${s.rescued} ${s.what} @ ${at(s.x)}`);
for (const h of r.harms as any[]) console.log(`  harm ${h.kind} ${h.cause} t${h.t} x${Math.round(h.x)},${Math.round(h.y ?? 0)} @ ${at(h.x)}`);
if (process.argv.includes('--pieces')) console.log(pcs.map((p) => `${p.id}@${p.x0}`).join(' '));
