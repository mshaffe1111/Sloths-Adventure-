// VAR-19c probe: the route's steps inside the named sections of one layout (letter, x, y, what) and the pieces there (key x..x+w @y).
// usage: npx tsx steps.ts <stage> <layout> <normal|easy> <section-substring>
import '../../../../src/game/headlessDom.ts';
import { build } from '../../../../tools/validate/core.ts';
const [id, v, s, sub] = [process.argv[2], Number(process.argv[3]), process.argv[4] as 'normal' | 'easy', process.argv[5]];
const b = build(id, v, s); const st: any = b.stage;
for (const q of st.gen2.sections.filter((q: any) => q.template.includes(sub))) {
  console.log(`${q.template} ${q.x0}..${q.x1}`);
  for (const p of st.platforms.filter((p: any) => p.tag?.startsWith(`${q.uid}:`))) console.log(`  piece ${p.tag.split(':')[1]} ${p.type} ${Math.round(p.x)}..${Math.round(p.x + p.width)} y${Math.round(p.y)}`);
  for (const p of b.steps.filter((p) => p.x >= q.x0 - 60 && p.x < q.x1 + 60)) console.log(`  step ${p.m} x${Math.round(p.x)} y${Math.round(p.y)} ${p.what}`);
}
