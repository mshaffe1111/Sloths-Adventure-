import { homeStage } from '../../../tools/inspect/homeToys.ts';
const st = homeStage(1);
const T = st.gen2.tower!;
console.log('flow', T.flow, 'legs', T.legs!.map((g) => `${g.travel} ${Math.round(g.x0)}..${Math.round(g.x1)} y${Math.round(g.y0)}..${Math.round(g.y1)}`).join(' | '));
for (const p of st.platforms.filter((q) => (q.y === 700 && q.x <= 12167 && q.x + q.width >= 12167) || (q.y === 1605 && q.x <= 12167 && q.x + q.width >= 12100))) console.log('plat', p.id, p.type, Math.round(p.x), Math.round(p.x + p.width), p.y, p.height);
