// BUILD-29: which brick each node of the draft laid, seed 1 Normal (npx tsx reference/qa-reports/BUILD-29/probes/nodes.ts)
import '../../../../src/game/headlessDom.ts';
import { withTestStage } from '../../../../src/game/gen2/listed.ts';
import { buildGen2Stage } from '../../../../src/game/gen2/pipeline.ts';
import { STAGE_29, draft29Cfg, draft29Row, kitLib29 } from '../../../../src/game/gen2/worlds/w2Arc29.ts';
const d = (process.argv[2] ?? 'normal') as 'normal' | 'easy';
const st = withTestStage({ [STAGE_29]: draft29Row() }, () => buildGen2Stage({ config: draft29Cfg(), kit: kitLib29(), seed: Number(process.argv[3] ?? 1), difficulty: d }));
const g = st.gen2 as unknown as Record<string, unknown>;
console.log(Object.keys(g).join(' '));
for (const s of (g.sections ?? g.route ?? []) as Array<Record<string, unknown>>) console.log(JSON.stringify(s).slice(0, 160));
