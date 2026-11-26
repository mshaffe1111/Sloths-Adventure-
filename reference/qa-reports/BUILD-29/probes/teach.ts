// BUILD-29 READY: Dot's teach line against the first stone and the first of each thing met, read from the BUILT draft (rule 27)
import '../../../../src/game/headlessDom.ts';
import { withTestStage } from '../../../../src/game/gen2/listed.ts';
import { buildGen2Stage } from '../../../../src/game/gen2/pipeline.ts';
import { STAGE_29, draft29Cfg, draft29Row, kitLib29 } from '../../../../src/game/gen2/worlds/w2Arc29.ts';
const seeds = (process.argv[2] ?? '1,2').split(',').map(Number);
for (const d of ['normal', 'easy'] as const) for (const seed of seeds) {
  const st = withTestStage({ [STAGE_29]: draft29Row() }, () => buildGen2Stage({ config: draft29Cfg(), kit: kitLib29(), seed, difficulty: d })) as unknown as Record<string, any>;
  if (seed === seeds[0] && d === 'normal') console.log(Object.keys(st).join(' '));
  const tips = (st.tips ?? st.dotTips ?? []).map((t: any) => `${t.id ?? t.tip ?? t.line}@${Math.round(t.x)}`);
  const sec = (st.gen2.sections as any[]).map((s) => `${s.template.replace('w2-29-', '')}@${Math.round(s.x0)}`);
  const first = (pred: (p: any) => boolean) => Math.round(Math.min(...st.platforms.filter(pred).map((p: any) => p.x)));
  console.log(d, seed, 'tips', tips.join(' '), '| sections', sec.join(' '), '| enemies', st.enemies.map((e: any) => Math.round(e.x)).join(','));
}
