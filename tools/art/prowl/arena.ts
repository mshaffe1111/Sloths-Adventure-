import { generateAllLevels } from '../../../src/game/worldsData.ts';
import { generateStage } from '../../../src/game/stageGenerator.ts';
import { landWindow, jumpGrab } from '../../../src/game/protoCheck.ts';
import { setTimedSwing } from '../../../src/game/physics.ts';
const c = generateAllLevels().find(l => l.id === '3-10')!;
const st = generateStage(c);
const v = st.vines.find(v => v.isSwingingVine || v.vineType === 'swing_liana');
console.log('vine', v && [Math.round(v.x), v.topY, v.bottomY, v.vineType]);
console.log('arena', st.arena);
const plats = st.platforms.filter(p => st.arena && p.x < st.arena.right && p.x + p.width > st.arena.left);
for (const p of plats) console.log('plat', p.id, Math.round(p.x), p.y, p.width);
if (v) for (const easy of [false, true]) { setTimedSwing(easy); for (const p of plats) { const dir = p.x > v.x ? 1 : -1; if (dir < 0) continue; console.log(easy ? 'easy' : 'normal', 'land on', p.id, landWindow(null, v, p)); } }
for (const p of plats) if (v) console.log('grab from', p.id, jumpGrab(p.x + p.width, p.y, v));
