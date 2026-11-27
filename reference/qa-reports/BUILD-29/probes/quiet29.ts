// BUILD-29-h: EVERY quiet stretch over 4 s on 2-9 (Normal), not only the worst (listRules.ts quietOf's own measure), named by section.
//   npx tsx reference/qa-reports/BUILD-29/probes/quiet29.ts <from> <count>
import '../../../../src/game/headlessDom.ts';
import { buildGen2Stage } from '../../../../src/game/gen2/pipeline.ts';
import { listedStage, playFinish } from '../../../../src/game/gen2/listed.ts';
import { withGoals } from '../../../../src/game/goals.ts';
import { pickRoute } from '../../../../tools/inspect/eraRoll.ts';
import { deadTime, NORMAL_GAP } from '../../../../tools/inspect/analyze.ts';
import { stageSource } from '../../../../tools/engine/libstage.ts';
const from = Number(process.argv[2] ?? 1), count = Number(process.argv[3] ?? 6);
const { kit, cfg } = stageSource('2-9'); const row = listedStage('2-9')!;
for (let seed = from; seed < from + count; seed++) {
  const st0 = buildGen2Stage({ config: cfg, kit: kit(), seed, difficulty: 'normal' }) as any;
  const st = playFinish(row, structuredClone(st0), 'normal') as any;
  const R = pickRoute(cfg.objectiveType, withGoals({ ...st } as never) as never) as any;
  const dn = deadTime(R.used.br.beats, R.used.br.total, NORMAL_GAP, R.used.samples);
  const goal = st.gen2.sections.filter((q: any) => q.phase === 'goal').pop(); const gx = goal ? goal.x0 : Infinity;
  const out: string[] = [];
  for (const d of dn.list) {
    const lo = Math.min(d.x0, d.x1), hi = Math.max(d.x0, d.x1); if (lo >= gx || d.counted <= 4) continue;
    const s = st.gen2.sections.find((q: any) => (lo + hi) / 2 >= q.x0 && (lo + hi) / 2 <= q.x1);
    out.push(`${d.counted.toFixed(1)} s x ${Math.round(lo)}-${Math.round(hi)} ${s ? s.id ?? s.template ?? '?' : '?'}`);
  }
  console.log(`seed ${seed}: ${out.join(' | ') || 'none over 4 s'}`);
}
