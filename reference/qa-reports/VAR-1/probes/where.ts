// VAR-1 probe: where each section lies on a listed layout (the game's own build), for stills. Relative imports (D83).
import '../../../../src/game/headlessDom.ts';
import { RealPlay } from '../../../../src/game/realPlay.ts';
import { setDifficulty } from '../../../../src/game/difficulty.ts';
const [id, v, d, pat] = [process.argv[2], Number(process.argv[3]), process.argv[4] as 'normal' | 'easy', new RegExp(process.argv[5] ?? 'rest')];
setDifficulty(d);
const st: any = new RealPlay(id, v).stage;
for (const s of (st.gen2 ?? st.proto?.gen2).sections) if (pat.test(s.template)) console.log(s.template, Math.round(s.x0), Math.round(s.x1));
