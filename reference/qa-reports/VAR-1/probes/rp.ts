// VAR-1b probe: the real game's platforms and vines (RealPlay, the bots' coordinates) between x0 and x1. Relative imports (D83).
import '../../../../src/game/headlessDom.ts';
import { RealPlay } from '../../../../src/game/realPlay.ts';
import { setDifficulty } from '../../../../src/game/difficulty.ts';
const [id, v, d, x0, x1] = [process.argv[2], Number(process.argv[3]), process.argv[4] as 'normal' | 'easy', Number(process.argv[5]), Number(process.argv[6])];
setDifficulty(d);
const st: any = new RealPlay(id, v).stage;
const g = st.gen2 ?? st.proto?.gen2;
for (const s of g.sections) if (s.x1 > x0 && s.x0 < x1) console.log('SEC', s.template, s.node ?? '', Math.round(s.x0), Math.round(s.x1));
for (const p of st.platforms.filter((p: any) => p.x + p.width > x0 && p.x < x1).sort((a: any, b: any) => a.x - b.x))
  console.log('P', p.id, Math.round(p.x), Math.round(p.x + p.width), 'y', Math.round(p.y), 'h', Math.round(p.height), p.type, p.style ?? '', p.soil ? 'soil' : '', p.decorative ? 'deco' : '');
for (const q of [...(st.vines ?? []), ...(st.ropes ?? [])].filter((q: any) => (q.x ?? q.anchorX) > x0 && (q.x ?? q.anchorX) < x1)) console.log('V', JSON.stringify(q).slice(0, 160));
