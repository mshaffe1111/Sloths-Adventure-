// BUILD-29-c: which of riverLay.ts bargeBound's four needs is false on the draft's barge (look, st.tempo, a liana over, the SAFE stand).
// npx tsx reference/qa-reports/BUILD-29/probes/barge29.ts <from> <count>
import '../../../../src/game/headlessDom.ts';
import { withTestStage } from '../../../../src/game/gen2/listed.ts';
import { buildGen2Stage } from '../../../../src/game/gen2/pipeline.ts';
import { STAGE_29, draft29Cfg, draft29Row, kitLib29 } from '../../../../src/game/gen2/worlds/w2Arc29.ts';
const from = Number(process.argv[2] ?? 1), count = Number(process.argv[3] ?? 3);
for (const d of ['normal', 'easy'] as const) for (let seed = from; seed < from + count; seed++) {
  const st = withTestStage({ [STAGE_29]: draft29Row() }, () => buildGen2Stage({ config: draft29Cfg(), kit: kitLib29(), seed, difficulty: d })) as any;
  for (const r of st.rivers ?? []) {
    if (r.speed === 0 || r.open || r.raft || r.flood) continue;
    const logs = st.platforms.filter((p: any) => p.type === 'drift' && p.drift && p.drift.x0 >= r.x0 - 1 && p.drift.x1 <= r.x1 + 1).map((p: any) => p.drift);
    const dd = logs[0]; if (!dd) continue;
    const solids = st.platforms.filter((p: any) => p.type === 'solid' && !p.broken);
    const near = solids.map((p: any) => ({ x: p.x, right: p.x + p.width, w: p.width, c: p.crumbleAfter, dr: !!p.drift })).sort((a: any, b: any) => Math.abs(a.right - r.x0) - Math.abs(b.right - r.x0))[0];
    const vines = (st.vines ?? []).filter((v: any) => v.x > r.x0 - 200 && v.x < r.x1 + 200).map((v: any) => Math.round(v.x));
    const spacing = (dd.x1 - dd.x0 + dd.width) / logs.length;
    console.log(`${d} s${seed} river x0=${r.x0} x1=${r.x1} way=${r.way ?? 1} logs=${logs.length} look=${dd.look} tempo=${st.tempo ? `${st.tempo.bar}/${st.tempo.easyStretch}` : 'NONE'} vinesNear=[${vines}] nearestStandRight=${near?.right} (gap ${near ? (near.right - r.x0).toFixed(1) : '-'}, w ${near?.w}, crumble ${near?.c}, drift ${near?.dr}) wait=${(spacing / dd.speed).toFixed(3)}s errs=${st.gen2.errors.filter((e: string) => /barge|log every/.test(e)).join(' | ').slice(0, 160)}`);
  }
}
