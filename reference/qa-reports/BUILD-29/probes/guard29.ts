// BUILD-29-c: G2's posted guard on 2-9's draft, BUILT: where he stands, his post and count flags, the barge's far bank, the goal. npx tsx .../guard29.ts <from> <count>
import '../../../../src/game/headlessDom.ts';
import { withTestStage } from '../../../../src/game/gen2/listed.ts';
import { buildGen2Stage } from '../../../../src/game/gen2/pipeline.ts';
import { STAGE_29, draft29Cfg, draft29Row, kitLib29 } from '../../../../src/game/gen2/worlds/w2Arc29.ts';
const from = Number(process.argv[2] ?? 1), count = Number(process.argv[3] ?? 3);
for (const d of ['normal', 'easy'] as const) for (let seed = from; seed < from + count; seed++) {
  const st = withTestStage({ [STAGE_29]: draft29Row() }, () => buildGen2Stage({ config: draft29Cfg(), kit: kitLib29(), seed, difficulty: d })) as any;
  const g = st.enemies.filter((e: any) => e.royal || e.uncounted || e.post !== undefined);
  const barge = (st.rivers ?? []).find((r: any) => st.platforms.some((p: any) => p.drift?.look === 'barge' && p.drift.x0 >= r.x0 - 1 && p.drift.x0 <= r.x1));
  const far = barge && st.platforms.find((p: any) => p.type === 'solid' && Math.abs(p.x - barge.x1) <= 2);
  console.log(`${d} s${seed}: guards ${g.map((e: any) => `x${Math.round(e.x)} y${Math.round(e.y)} post ${e.post} unc ${e.uncounted} royal ${e.royal}`).join('; ') || 'NONE'} | far bank ${far ? `${Math.round(far.x)}-${Math.round(far.x + far.width)}` : '?'} | foes ${st.enemies.length} goal ${st.config.targetCount} | exit ${Math.round(st.exitTotemX)} | errs ${st.gen2.errors.length} ${st.gen2.errors.join(' | ').slice(0, 200)}`);
}
