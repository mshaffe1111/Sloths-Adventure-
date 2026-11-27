import { homeStage } from '../../../tools/inspect/homeToys.ts';
import { findRoute } from '../../../tools/inspect/route.ts';
const st = homeStage(1);
const r = findRoute(st as never, [], { spurs: true });
console.log('traced', r.traced, 'segs', r.segs.length);
for (const g of r.segs.slice(0, 14)) console.log(g.kind, Math.round(g.x0), Math.round(g.y0), '->', Math.round(g.x1), Math.round(g.y1));
