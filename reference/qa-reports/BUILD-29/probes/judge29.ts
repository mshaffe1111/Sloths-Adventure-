// scratch: the court judge's (lockedDrops) ONE margins on 2-9's draft, both settings, seeds 1..N, and the build's rerolls
import '../../../../src/game/headlessDom.ts';
import { withTestStage } from '../../../../src/game/gen2/listed.ts';
import { buildGen2Stage } from '../../../../src/game/gen2/pipeline.ts';
import { DRAFT_ID_29, draft29Cfg, draft29Row, kitLib29 } from '../../../../src/game/gen2/worlds/w2Arc29.ts';
import { lockedLianas } from '../../../../src/game/gen2/riverLay.ts';
import { setDifficulty } from '../../../../src/game/difficulty.ts';
const N = Number(process.argv[2] ?? 3), cfg = draft29Cfg(DRAFT_ID_29), row = draft29Row([], DRAFT_ID_29);
withTestStage({ [DRAFT_ID_29]: row }, () => {
  for (const d of ['normal', 'easy'] as const) for (let s = 1; s <= N; s++) {
    setDifficulty(d);
    const st = buildGen2Stage({ config: cfg, kit: kitLib29(DRAFT_ID_29), seed: s, difficulty: d });
    const L = lockedLianas(st as never, d).map(({ liana: v, drops: q }) => `x${Math.round(v.x)} len${Math.round(v.bottomY - v.topY)} one=${q.one} e${q.early.toFixed(2)} l${q.late.toFixed(2)}`);
    console.log(`TLEN=${process.env.TLEN ?? 410} ${d} s${s} seed${st.gen2.seed} rerolls ${JSON.stringify(st.gen2.rerolls)?.slice(0, 40)} | ${L.join(' | ')}`);
  }
  setDifficulty('normal');
});
