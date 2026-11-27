// ENG-29-i: the model per grip (LIANA_RIVER.grips set to one grip at a time), 2-9's draft, LOCK29 and NOMARGIN=1 as the engine read.
import '../../../../src/game/headlessDom.ts';
import { withTestStage } from '../../../../src/game/gen2/listed.ts';
import { buildGen2Stage } from '../../../../src/game/gen2/pipeline.ts';
import { DRAFT_ID_29, draft29Cfg, draft29Row, kitLib29 } from '../../../../src/game/gen2/worlds/w2Arc29.ts';
import { LIANA_RIVER, lockedLianas } from '../../../../src/game/gen2/riverLay.ts';
const R = LIANA_RIVER as unknown as { grips: number[] };
// (the stage is built with both grips, as the game builds it; only the read after it is per grip: the generator reads the judge)
const G0 = R.grips;
for (const d of ['normal', 'easy'] as const) for (const seed of [1, 2]) {
  R.grips = G0;
  const st = withTestStage({ [DRAFT_ID_29]: draft29Row([], DRAFT_ID_29) }, () => buildGen2Stage({ config: draft29Cfg(DRAFT_ID_29), kit: kitLib29(DRAFT_ID_29), seed, difficulty: d }));
  for (const g of [0.7, 0.95]) { R.grips = [g]; for (const q of lockedLianas(st, d)) console.log(`M ${process.env.LOCK29} ${d} s${seed} x${Math.round(q.liana.x)} g${g} one=${q.drops.one} ${q.drops.early.toFixed(2)} ${q.drops.late.toFixed(2)}`); }
}
