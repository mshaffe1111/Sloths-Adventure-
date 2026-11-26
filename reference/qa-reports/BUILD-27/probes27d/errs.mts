// BUILD-27d: the gen2 errors of 2-7's laid rolls, both settings, with where the water sections sit (seeds from argv: a-b)
import '../../../../src/game/headlessDom.ts';
import { buildGen2Stage } from '../../../../src/game/gen2/pipeline.ts';
import { listedStage, worldFinish } from '../../../../src/game/gen2/listed.ts';
import { generateAllLevels } from '../../../../src/game/worldsData.ts';
const [a, b] = (process.argv[2] ?? '1-10').split('-').map(Number);
const cfg = generateAllLevels().find((c) => c.id === '2-7' && !c.secret)!;
for (const d of ['normal', 'easy'] as const) for (let s = a; s <= b; s++) {
  const row = listedStage('2-7')!;
  try {
    const st: any = worldFinish(row)(buildGen2Stage({ config: cfg, kit: row.kit(), seed: s, difficulty: d }) as never, false, d);
    const secs = st.gen2.sections.map((q: any) => `${q.template.replace('w2-27-', '')}@${Math.round(q.x0)}`).join(' ');
    console.log(d, s, JSON.stringify(st.gen2.errors ?? []), d === 'normal' && s === a ? secs : '');
  } catch (e) { console.log(d, s, 'THROWS', String(e).slice(0, 120)); }
}
