// BUILD-27d: per roll, each post door's letter x against the jetty's race line (px past it; 855 = 3 s at a full run), both settings
import '../../../../src/game/headlessDom.ts';
import { buildGen2Stage } from '../../../../src/game/gen2/pipeline.ts';
import { listedStage, worldFinish } from '../../../../src/game/gen2/listed.ts';
import { generateAllLevels } from '../../../../src/game/worldsData.ts';
import { LINES_27 } from '../../../../src/game/gen2/worlds/w2Arc27.ts';
const cfg = generateAllLevels().find((c) => c.id === '2-7' && !c.secret)!;
const [a, b] = (process.argv[2] ?? '1-40').split('-').map(Number);
const worst: Record<string, number> = {};
for (const d of ['normal', 'easy'] as const) for (let s = a; s <= b; s++) {
  const row = listedStage('2-7')!;
  let st: any;
  try { st = worldFinish(row)(buildGen2Stage({ config: cfg, kit: row.kit(), seed: s, difficulty: d }) as never, false, d); } catch { console.log(d, s, 'refused'); continue; }
  const race = st.proto.hints.find((q: any) => q.text === LINES_27.race);
  const post = st.post ?? st.proto?.post;
  const cs = st.collectibles ?? st.proto?.collectibles ?? [];
  const xs = (post?.doors ?? []).map((dr: any) => { const c = cs.find((q: any) => q.id === dr.letter); return c ? Math.round(c.x - race.x) : NaN; }).sort((p: number, q: number) => p - q);
  xs.forEach((v: number, i: number) => { worst[`${d} letter ${i + 1}`] = Math.min(worst[`${d} letter ${i + 1}`] ?? Infinity, v); });
  console.log(d, s, 'doors', xs.length, 'past race line', xs.join(' '));
}
console.log('WORST', JSON.stringify(worst));
