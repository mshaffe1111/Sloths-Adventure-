// VAR-19d probe: on a LISTED layout (Play's build, RealPlay), the section and piece under each x, both settings, with the piece's top
// and its neighbours' tops. usage: npx tsx where.ts <stage> <layout> <x> [<x> ...]
import '../../../../src/game/headlessDom.ts';
import { RealPlay } from '../../../../src/game/realPlay.ts';
import { setDifficulty } from '../../../../src/game/difficulty.ts';
const [stage, v, ...xs] = process.argv.slice(2);
setDifficulty('normal');
const st: any = new RealPlay(stage, Number(v)).stage;
for (const x of xs.map(Number)) {
  const q = st.gen2.sections.find((s: any) => x >= s.x0 && x < s.x1);
  const near = st.platforms.filter((p: any) => p.x <= x + 160 && p.x + p.width >= x - 160 && p.tag).sort((a: any, b: any) => a.x - b.x);
  console.log(`x ${x}: ${q?.template} (${q?.x0}..${q?.x1}) | ` + near.map((p: any) => `${p.tag.split(':')[1]}@${Math.round(p.x)}-${Math.round(p.x + p.width)} y${Math.round(p.y)}`).join(' '));
}
