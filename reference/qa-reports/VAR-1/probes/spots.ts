// VAR-1b probe: the still spots of a layout (RealPlay coordinates): each rest section's middle and each climb vine (not a liana), with
// the section it is in. Prints "x:pick" pairs for stills2.mjs. Relative imports (D83).
import '../../../../src/game/headlessDom.ts';
import { RealPlay } from '../../../../src/game/realPlay.ts';
import { setDifficulty } from '../../../../src/game/difficulty.ts';
const [id, v, d] = [process.argv[2], Number(process.argv[3]), process.argv[4] as 'normal' | 'easy'];
setDifficulty(d);
const st: any = new RealPlay(id, v).stage;
const g = st.gen2 ?? st.proto?.gen2;
const sec = (x: number) => g.sections.find((s: any) => x >= s.x0 && x < s.x1)?.template ?? '-';
const out: string[] = [];
for (const s of g.sections) if (/rest-(dip|hump|stumps|hollow|shelf|moss|knots|crook|split|saddle)$/.test(s.template)) { console.log('REST', s.template, Math.round(s.x0), Math.round(s.x1)); out.push(`${Math.round((s.x0 + s.x1) / 2)}:low`); }
for (const q of st.vines ?? []) if (!q.isSwingingVine && q.vineType !== 'swing_liana') { console.log('CLIMB', sec(q.x), Math.round(q.x), q.topY, q.bottomY, q.vineType); out.push(`${Math.round(q.x) + 60}:high`); }
console.log('SPOTS', out.join(' '));
