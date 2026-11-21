import { homeStage } from '../../../tools/inspect/homeToys.ts';
import { findRoute } from '../../../tools/inspect/route.ts';
const st = homeStage(1);
const r = findRoute(st as never, [], { spurs: true });
r.segs.forEach((g, i) => { if (g.x0 > 16300 || g.x1 > 16300) console.log(i, g.kind, Math.round(g.x0), Math.round(g.y0), '->', Math.round(g.x1), Math.round(g.y1)); });
for (const rv of st.rivers ?? []) if (rv.x1 > 15500) console.log('river', Math.round(rv.x0), Math.round(rv.x1), 'surf', Math.round(rv.surfaceY), 'dir', rv.dir, 'way', rv.way, 'safe', JSON.stringify(rv.safe));
for (const p of st.platforms.filter((q) => q.x + q.width > 16300 && q.x < 18700 && q.y > 900).sort((a, b) => a.x - b.x)) console.log('plat', p.id, p.type, Math.round(p.x), Math.round(p.x + p.width), 'y', Math.round(p.y), 'h', Math.round(p.height), p.drift ? `drift ${Math.round(p.drift.x0)}-${Math.round(p.drift.x1)} d${p.drift.dir}` : '');
