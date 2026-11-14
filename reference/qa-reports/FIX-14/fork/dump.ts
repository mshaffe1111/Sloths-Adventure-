import { RealPlay } from '../../../../src/game/realPlay.ts';
import { setDifficulty } from '../../../../src/game/difficulty.ts';
const seed = +(process.argv[2] ?? 4), easy = process.argv[3] === 'easy';
setDifficulty(easy ? 'easy' : 'normal');
const rp = new RealPlay('1-4', seed);
const st: any = rp.stage;
const secs = st.gen2?.sections ?? st.proto?.gen2?.sections ?? [];
console.log('sections', secs.map((s: any) => s.template).join(' '));
const want = new Set((process.argv[4] ?? 's10,s11,s12').split(','));
const tag = (q: any) => String(q.tag ?? '');
for (const q of st.platforms.filter((q: any) => want.has(tag(q).split(':')[0]))) console.log('P', q.id, tag(q), Math.round(q.x), Math.round(q.y), Math.round(q.width), q.creak ? 'creak' : '', q.broken ? 'broken' : '', q.style ?? '');
for (const v of st.vines.filter((v: any) => want.has(tag(v).split(':')[0]))) console.log('V', v.id, tag(v), Math.round(v.x), Math.round(v.topY), Math.round(v.bottomY), v.off ? 'off' : '');
if (process.argv[5]) {
  const [x0, x1, y0, y1] = process.argv[5].split(',').map(Number);
  for (const q of st.platforms.filter((q: any) => q.x < x1 && q.x + q.width > x0 && q.y > y0 && q.y < y1)) console.log('AREA P', q.id, tag(q), Math.round(q.x), Math.round(q.y), Math.round(q.width), Math.round(q.height), q.style ?? '', q.decorative ? 'deco' : '', q.broken ? 'broken' : '');
  for (const v of st.vines.filter((v: any) => v.x > x0 && v.x < x1 && v.bottomY > y0 && v.topY < y1)) console.log('AREA V', v.id, tag(v), Math.round(v.x), Math.round(v.topY), Math.round(v.bottomY), v.vineType, v.off ? 'off' : '');
}
