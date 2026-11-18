// VAR-1 probe: on fresh 1-8 rolls, does the chase split a node (more than 5 stretches), and which rest stands before it. Relative imports (D83).
import '../../../../src/game/headlessDom.ts';
import { buildGen2Stage } from '../../../../src/game/gen2/pipeline.ts';
import { listedStage } from '../../../../src/game/gen2/listed.ts';
import { generateAllLevels } from '../../../../src/game/worldsData.ts';
import { w1Finish } from '../../../../src/game/gen2/worlds/w1.ts';
import { LINES_18 } from '../../../../src/game/gen2/worlds/w1Arc18.ts';
const row = listedStage('1-8')!;
const cfg = generateAllLevels().find((c) => c.id === '1-8' && !(c as any).secret)!;
for (let seed = 1; seed <= Number(process.argv[2] ?? 20); seed++) for (const d of ['normal', 'easy'] as const) {
  let st: any;
  try { st = row.finish!(w1Finish(buildGen2Stage({ config: cfg, kit: row.kit(), seed, difficulty: d }) as never), d); } catch { continue; }
  if (st.gen2.errors?.length) continue;
  const moss = (st.proto.bushes ?? []).find((b: any) => b.kind === 'moss');
  const fx = st.proto.hints.find((q: any) => q.text === LINES_18.fork)?.x;
  const n = st.chase.stretches.length;
  const rests = st.gen2.sections.filter((s: any) => /rest/.test(s.template)).map((s: any) => s.template.replace('w1-18-rest', 'R'));
  if (n !== 5 || !moss || moss.x - fx < 800) console.log(seed, d, 'stretches', n, 'moss-line', moss ? Math.round(moss.x - fx) : 'none', rests.join(' '));
}
console.log('done');
