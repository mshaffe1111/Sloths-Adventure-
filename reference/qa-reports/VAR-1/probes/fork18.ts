// VAR-1 probe: 1-8's fork line, moss bushes, chase stretches and sections on one roll (as w1Arc18.test.ts builds it). Relative imports (D83).
import '../../../../src/game/headlessDom.ts';
import { buildGen2Stage } from '../../../../src/game/gen2/pipeline.ts';
import { listedStage } from '../../../../src/game/gen2/listed.ts';
import { generateAllLevels } from '../../../../src/game/worldsData.ts';
import { w1Finish } from '../../../../src/game/gen2/worlds/w1.ts';
import { LINES_18 } from '../../../../src/game/gen2/worlds/w1Arc18.ts';
const d = (process.argv[3] ?? 'normal') as 'normal' | 'easy';
const row = listedStage('1-8')!;
const cfg = generateAllLevels().find((c) => c.id === '1-8' && !(c as any).secret)!;
const st: any = row.finish!(w1Finish(buildGen2Stage({ config: cfg, kit: row.kit(), seed: Number(process.argv[2] ?? 4), difficulty: d }) as never), d);
const h = st.proto.hints.find((q: any) => q.text === LINES_18.fork);
console.log('fork line', JSON.stringify(h).slice(0, 200));
console.log('bushes', JSON.stringify((st.proto.bushes ?? []).map((b: any) => [b.kind, Math.round(b.x), b.w])));
console.log('stretches', JSON.stringify(st.chase.stretches.map((s: any) => [Math.round(s.start), Math.round(s.end)])));
for (const s of st.gen2.sections) console.log(s.template, Math.round(s.x0), Math.round(s.x1));
console.log('flags', JSON.stringify((st.checkpoints ?? []).map((c: any) => Math.round(c.x))));
