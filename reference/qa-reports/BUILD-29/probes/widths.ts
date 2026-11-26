// BUILD-29 READY (rule 27): the built draft's stone and pad floors (x, width, the water before each) in beats 1 and 3, seed 1 both settings
import '../../../../src/game/headlessDom.ts';
import { withTestStage } from '../../../../src/game/gen2/listed.ts';
import { buildGen2Stage } from '../../../../src/game/gen2/pipeline.ts';
import { STAGE_29, draft29Cfg, draft29Row, kitLib29 } from '../../../../src/game/gen2/worlds/w2Arc29.ts';
for (const d of ['normal', 'easy'] as const) {
  const st = withTestStage({ [STAGE_29]: draft29Row() }, () => buildGen2Stage({ config: draft29Cfg(), kit: kitLib29(), seed: 1, difficulty: d })) as any;
  for (const name of ['w2-29-hear', 'w2-29-pads']) {
    const s = st.gen2.sections.find((q: any) => q.template === name);
    const ps = st.platforms.filter((p: any) => p.x >= s.x0 && p.x < s.x1).sort((a: any, b: any) => a.x - b.x);
    console.log(d, name, ps.map((p: any, i: number) => `${Math.round(p.x)}+${Math.round(p.width)}${i ? ` (gap ${Math.round(p.x - ps[i - 1].x - ps[i - 1].width)})` : ''}${p.pad ? ':' + (p.pad.by ?? p.pad.kind ?? 'pad') : ''}`).join(' '));
  }
}
