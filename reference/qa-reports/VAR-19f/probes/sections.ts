// VAR-19f probe: on a LISTED layout (Play's build, RealPlay), every section's template and x range, the tagged pieces in it and every
// enemy (kind, x, y), to place the stills. usage: DIFF=normal|easy npx tsx sections.ts <stage> <layout>
import '../../../../src/game/headlessDom.ts';
import { RealPlay } from '../../../../src/game/realPlay.ts';
import { setDifficulty } from '../../../../src/game/difficulty.ts';
const [stage, v] = process.argv.slice(2);
setDifficulty((process.env.DIFF ?? 'normal') as 'normal' | 'easy');
const st: any = new RealPlay(stage, Number(v)).stage;
for (const q of st.gen2.sections) {
  const pcs = st.platforms.filter((p: any) => p.tag && p.x < q.x1 && p.x + p.width > q.x0).map((p: any) => `${p.tag.split(':')[1]}@${Math.round(p.x)}-${Math.round(p.x + p.width)} y${Math.round(p.y)}`);
  const en = (st.enemies ?? []).filter((e: any) => e.x >= q.x0 && e.x < q.x1).map((e: any) => `${e.type ?? e.kind}@${Math.round(e.x)},${Math.round(e.y)}`);
  console.log(`${q.template} ${q.x0}..${q.x1} | ${pcs.join(' ')} | enemies: ${en.join(' ')}`);
}
