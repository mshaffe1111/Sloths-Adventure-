import '/home/user/Sloths-Adventure-/src/game/headlessDom.ts';
import '/home/user/Sloths-Adventure-/tools/engine/draft.ts';
import { buildStage } from '/home/user/Sloths-Adventure-/tools/engine/libstage.ts';
const [d, s, Y] = [process.env.D!, Number(process.env.S), Number(process.env.Y)];
const st: any = buildStage('3-1', s, d as any);
const secs = st.gen2.sections; console.log(Object.keys(secs[0]).join(' '));
console.log(secs.map((q: any) => q.uid + ':' + q.template + '@' + q.node + '[' + Math.round(q.x0) + '-' + Math.round(q.x1) + ']').join(' '));
for (const q of []) { const y0 = Math.min(q.entry.y, q.exit.y) - 260, y1 = Math.max(q.entry.y, q.exit.y) + 260; if (Y >= y0 && Y <= y1) console.log(q.uid, q.template, q.node, 'x', Math.round(q.x0), Math.round(q.x1), 'in', Math.round(q.entry.x), Math.round(q.entry.y), 'out', Math.round(q.exit.x), Math.round(q.exit.y), q.mirrored ? 'M' : '', q.join ?? ''); }
const near = st.platforms.filter((p: any) => p.y > Y - 200 && p.y < Y + 520).sort((a: any, b: any) => a.y - b.y);
for (const p of near) console.log(' plat', p.id, p.x, p.x + p.width, p.y, p.type, p.cut ?? '', (p as any).tag ?? '', (p as any).towerCatch ? 'CATCH' : '');
