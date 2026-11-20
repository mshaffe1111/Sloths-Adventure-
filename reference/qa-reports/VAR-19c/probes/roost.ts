// VAR-19c probe: each roost beat's boa, its roost(s) and its pieces on raw seeds (w1Arc19.test.ts's build). usage: npx tsx roost.ts <seeds> <d>
import '../../../../src/game/headlessDom.ts';
import { buildGen2Stage } from '../../../../src/game/gen2/pipeline.ts';
import { listedStage } from '../../../../src/game/gen2/listed.ts';
import { generateAllLevels } from '../../../../src/game/worldsData.ts';
const cfg = generateAllLevels().find((c) => c.id === '1-9' && !c.secret)!;
const d = (process.argv[3] ?? 'normal') as 'normal' | 'easy';
for (const seed of (process.argv[2] ?? '1').split(',').map(Number)) {
  const row = listedStage('1-9')!;
  const st: any = row.finish!(buildGen2Stage({ config: cfg, kit: row.kit(), seed, difficulty: d }), d);
  for (const q of st.gen2.sections.filter((q: any) => /roost/.test(q.template))) {
    const boas = st.enemies.filter((e: any) => e.type === 'boa' && e.x >= q.x0 && e.x < q.x1).map((e: any) => Math.round(e.x + e.width / 2));
    const roosts = (st.proto.gen2?.roosts ?? []).filter((r: any) => r.x >= q.x0 - 200 && r.x < q.x1 + 200).map((r: any) => Math.round(r.x));
    console.log(`seed ${seed} ${d} ${q.template} ${q.x0}..${q.x1} boas ${boas} roosts ${roosts} all roosts ${(st.proto.gen2?.roosts ?? []).map((r: any) => Math.round(r.x))}`);
  }
}
