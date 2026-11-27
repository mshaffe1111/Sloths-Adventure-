import '../../../../src/game/headlessDom.ts';
import { withTestStage } from '../../../../src/game/gen2/listed.ts';
import { buildGen2Stage } from '../../../../src/game/gen2/pipeline.ts';
import { DRAFT_ID_29, draft29Cfg, draft29Row, kitLib29 } from '../../../../src/game/gen2/worlds/w2Arc29.ts';
import { lockedLianas } from '../../../../src/game/gen2/riverLay.ts';
const seeds = (process.argv[2] ?? '1,2').split(',').map(Number);
for (const d of ['normal', 'easy'] as const) {
  let e = 9, l = 9; const rows: string[] = []; const faults: string[] = [];
  for (const seed of seeds) {
    const st = withTestStage({ [DRAFT_ID_29]: draft29Row([], DRAFT_ID_29) }, () => buildGen2Stage({ config: draft29Cfg(DRAFT_ID_29), kit: kitLib29(DRAFT_ID_29), seed, difficulty: d }));
    for (const q of lockedLianas(st, d)) { e = Math.min(e, q.drops.early); l = Math.min(l, q.drops.late); rows.push(`s${seed} x${Math.round(q.liana.x)} ${q.drops.early.toFixed(2)}/${q.drops.late.toFixed(2)} one=${q.drops.one}`); }
    faults.push(...st.gen2.errors.filter((f) => /ONE/.test(f)).map((f) => `s${seed}: ${f}`));
  }
  console.log(process.env.LOCK29, d, 'worst', e.toFixed(2), '/', l.toFixed(2), '|', rows.join('; '));
  for (const f of faults) console.log('  ', f.slice(0, 220));
}
