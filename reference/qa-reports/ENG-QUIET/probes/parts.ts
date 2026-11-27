// ENG-QUIET: every quiet stretch over 4 s on a listed stage, broken into the route's own pieces (deadTime's measure, analyze.ts:24).
//   npx tsx reference/qa-reports/ENG-QUIET/probes/parts.ts <stage> <seed> [min=4] [normal|easy]
import '../../../../src/game/headlessDom.ts';
import { buildGen2Stage } from '../../../../src/game/gen2/pipeline.ts';
import { listedStage, playFinish } from '../../../../src/game/gen2/listed.ts';
import { withGoals } from '../../../../src/game/goals.ts';
import { pickRoute } from '../../../../tools/inspect/eraRoll.ts';
import { deadTime, NORMAL_GAP } from '../../../../tools/inspect/analyze.ts';
import { stageSource } from '../../../../tools/engine/libstage.ts';
import { lianaDrops, lockedLianas } from '../../../../src/game/gen2/riverLay.ts';
import { lianasOver, onRiver } from '../../../../src/game/river.ts';
const id = process.argv[2] ?? '2-9', seed = Number(process.argv[3] ?? 1), min = Number(process.argv[4] ?? 4), diff = (process.argv[5] ?? 'normal') as 'normal';
const { kit, cfg } = stageSource(id); const row = listedStage(id)!;
const st0 = buildGen2Stage({ config: cfg, kit: kit(), seed, difficulty: diff }) as any;
const st = playFinish(row, structuredClone(st0), diff) as any;
const R = pickRoute(cfg.objectiveType, withGoals({ ...st } as never) as never) as any;
const U = R.used; const br = U.br; const segs = U.route.segs as any[];
const dn = deadTime(br.beats, br.total, NORMAL_GAP, U.samples);
const goal = st.gen2.sections.filter((q: any) => q.phase === 'goal').pop(); const gx = goal ? goal.x0 : Infinity;
const sec = (x: number) => { const q = st.gen2.sections.find((q: any) => x >= q.x0 && x <= q.x1); return q ? (q.id ?? q.template) : '?'; };
// the beat clock: t = base + delay; find the base range of each stretch from the beats around it
const B = br.beats as any[];
console.log(`${id} s${seed} ${diff}: total ${br.total.toFixed(1)} move ${br.moveTotal.toFixed(1)}; quiet stretches > ${min} s`);
for (const d of dn.list) {
  const lo = Math.min(d.x0, d.x1), hi = Math.max(d.x0, d.x1); if (lo >= gx || d.counted <= min) continue;
  const prev = B.filter((b) => b.t + b.dur + b.act <= d.t0 + 1e-6).pop(); const next = B.find((b) => b.t >= d.t1 - 1e-6);
  const b0 = prev ? prev.base + prev.act : 0, b1 = next ? next.base : br.moveTotal;
  console.log(`\n${d.sec.toFixed(2)} s x${Math.round(lo)}-${Math.round(hi)} ${sec((lo + hi) / 2)} | after "${prev?.what}" (act ${prev?.act.toFixed(2)} dur ${prev?.dur.toFixed(2)}) | before "${next?.what}" | move-clock ${(b1 - b0).toFixed(2)} s, waits inside ${(d.sec - (b1 - b0)).toFixed(2)} s`);
  const tie = B.filter((b) => prev && Math.abs(b.base - prev.base) < 0.05).map((b) => `${b.letter}:${b.what} act ${b.act.toFixed(2)} dur ${b.dur.toFixed(2)}`);
  console.log(`  beats at the stretch's start base: ${tie.join(' | ')}`);
  // the share quietOf counts (listRules.ts:38: the goal run-out excluded)
  console.log(`  quietOf share ${(hi > gx ? (gx - lo) / Math.max(1, hi - lo) : 1).toFixed(2)} -> counts ${(d.counted * (hi > gx ? (gx - lo) / Math.max(1, hi - lo) : 1)).toFixed(2)} s`);
  let t = 0; const parts: Record<string, number> = {};
  for (const s of segs) {
    const a = t, z = t + s.dt; t = z;
    const ov = Math.max(0, Math.min(z, b1) - Math.max(a, b0)); if (ov <= 1e-6) continue;
    const key = s.kind + (s.note ? `(${s.note})` : '');
    parts[key] = (parts[key] ?? 0) + ov;
    if (s.kind === 'lianaDrop') {
      const r = (st.rivers ?? []).find((q: any) => st.vines.some((v: any) => Math.abs(v.x - s.x0) < 1 && lianasOver([v], q).length));
      const v = st.vines.find((q: any) => Math.abs(q.x - s.x0) < 1);
      const logs = st.platforms.filter((p: any) => p.type === 'drift' && p.drift && r && onRiver(p.drift, r)).map((p: any) => p.drift);
      const un = logs.length ? lianaDrops(v, logs, diff) : undefined; const lk = lockedLianas(st, diff).find((q: any) => q.liana.id === v?.id)?.drops;
      console.log(`    let-go parts: swing-out ${(Math.abs(s.x1 - s.x0) / 430).toFixed(2)} + flat 1.20 + wait/2 ${un ? (un.wait / 2).toFixed(2) : '-'} (route uses the UNLOCKED grid: worst ${un?.wait.toFixed(2)}, vine period ${un?.period.toFixed(2)}) | LOCKED (lockedDrops): worst ${lk?.wait.toFixed(2)} window ${lk?.window.toFixed(2)} oneLands ${lk?.one} share ${lk?.share.toFixed(2)}`);
    }
    console.log(`  ${s.kind.padEnd(8)} ${ov.toFixed(2)} s of ${s.dt.toFixed(2)}  x${Math.round(s.x0)}->${Math.round(s.x1)} y${Math.round(s.y0)}->${Math.round(s.y1)} ${s.note ?? ''} ${s.plat?.type ?? ''}${s.plat?.lay?.clock ? ' clock' : ''}`);
  }
  console.log('  SUM ' + Object.entries(parts).map(([k, v]) => `${k} ${v.toFixed(2)}`).join(', '));
}
