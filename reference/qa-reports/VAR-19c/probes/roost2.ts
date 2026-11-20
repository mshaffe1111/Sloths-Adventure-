// VAR-19c probe: a raw seed's roost beat in full: the section before it, its pieces, its boas and roosts. usage: npx tsx roost2.ts <seed> <d>
import '../../../../src/game/headlessDom.ts';
import { buildGen2Stage } from '../../../../src/game/gen2/pipeline.ts';
import { listedStage } from '../../../../src/game/gen2/listed.ts';
import { generateAllLevels } from '../../../../src/game/worldsData.ts';
const cfg = generateAllLevels().find((c) => c.id === '1-9' && !c.secret)!;
const [seed, d] = [Number(process.argv[2] ?? 1), (process.argv[3] ?? 'normal') as 'normal' | 'easy'];
const row = listedStage('1-9')!;
const st: any = row.finish!(buildGen2Stage({ config: cfg, kit: row.kit(), seed, difficulty: d }), d);
const secs: any[] = st.gen2.sections;
const i = secs.findIndex((q) => q.template === 'w1-19-roost');
for (const q of secs.slice(Math.max(0, i - 1), i + 1)) {
  console.log(`${q.template} ${q.x0}..${q.x1} uid ${q.uid}`);
  for (const p of st.platforms.filter((p: any) => p.tag?.startsWith(`${q.uid}:`))) console.log(`  ${p.tag.split(':')[1]} ${p.type} ${Math.round(p.x)}..${Math.round(p.x + p.width)} y${Math.round(p.y)}`);
}
console.log('boas', st.enemies.filter((e: any) => e.type === 'boa').map((e: any) => `${Math.round(e.x)}@${Math.round(e.y)}`).join(' '));
console.log('roosts', JSON.stringify(st.proto.gen2?.roosts));
console.log('errors', JSON.stringify(st.gen2.errors ?? []));
console.log('flags', JSON.stringify((st.checkpoints ?? st.flags ?? []).map((c: any) => Math.round(c.x))), Object.keys(st).filter((k) => /flag|check|safe/i.test(k)));
