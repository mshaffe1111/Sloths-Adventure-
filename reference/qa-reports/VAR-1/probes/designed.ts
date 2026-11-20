// VAR-1b probe: the designed layout's (variant null) platforms and vines between x0 and x1, with sections. Relative imports (D83).
import '../../../../src/game/headlessDom.ts';
import { generateStage, setLayoutVariant } from '../../../../src/game/stageGenerator.ts';
import { generateAllLevels } from '../../../../src/game/worldsData.ts';
const [id, x0, x1] = [process.argv[2], Number(process.argv[3]), Number(process.argv[4])];
const l = generateAllLevels().find((c) => c.id === id && !c.secret)!;
setLayoutVariant(null);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const st: any = generateStage(l);
const g = st.gen2 ?? st.proto?.gen2;
for (const s of g.sections) if (s.x1 > x0 && s.x0 < x1) console.log('SEC', s.template, Math.round(s.x0), Math.round(s.x1));
for (const p of st.platforms.filter((p: { x: number; width: number }) => p.x + p.width > x0 && p.x < x1).sort((a: { x: number }, b: { x: number }) => a.x - b.x))
  console.log('P', p.id, Math.round(p.x), Math.round(p.x + p.width), 'y', p.y, 'h', p.height, p.type, p.style ?? '', p.tag ?? '');
for (const v of st.vines.filter((v: { x: number }) => v.x > x0 && v.x < x1)) console.log('V', Math.round(v.x), v.topY, v.bottomY, v.vineType);
