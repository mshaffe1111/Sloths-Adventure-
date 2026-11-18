import '../../src/game/headlessDom.ts';
import { RealPlay } from '../../src/game/realPlay.ts';
const r = new RealPlay(process.argv[2] ?? '1-4', Number(process.argv[3] ?? 1));
const V = r.vines.filter((v) => v.vineType === 'tree_climb');
console.log('tree_climb', V.length, 'swing', r.vines.length - V.length);
for (const v of V.slice(0, 14)) {
  const near = r.platforms.filter((q) => Math.abs(q.y - v.topY) < 40 && q.x - 60 < v.x && q.x + q.width + 60 > v.x).map((q) => `${q.id}:${Math.round(q.x)}-${Math.round(q.x + q.width)}@${Math.round(q.y)}`);
  console.log(v.id, 'x', Math.round(v.x), 'top', Math.round(v.topY), 'bot', Math.round(v.bottomY), v.field ? 'field' : '', v.pair ? 'pair' + v.pair : '', 'top-wood', near.join(' '));
}
