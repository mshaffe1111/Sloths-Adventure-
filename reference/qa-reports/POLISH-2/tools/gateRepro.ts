// POLISH-2 probe: Matt's case (R-165.212): on a field vine under a shut fig gate, every way up; does he ever stand above the bough?
import { RealPlay } from '../../../../src/game/realPlay.ts';
const r = new RealPlay('1-4', 1);
const st: any = r.stage;
const e: any = r.e;
for (const g of st.gates) {
  const b = r.platforms.find((q) => q.id === g.platform)!;
  const fieldVines = r.vines.filter((v: any) => v.field && v.x >= b.x - 4 && v.x <= b.x + b.width + 4 && Math.abs(v.topY - b.y) <= 30);
  for (const v of fieldVines) for (const plan of ['up', 'jump', 'jumpL', 'jumpR', 'upjumpR'] as const) {
    const r2 = new RealPlay('1-4', 1);
    const v2 = r2.vines.find((q) => q.id === v.id)!;
    r2.climb(v2, v2.topY + 40);
    let minY = 1e9, above = false, standAbove = false;
    for (let i = 0; i < 90; i++) {
      const pad: any = plan === 'up' ? { up: true } : plan === 'jump' ? { press: i % 10 === 0, jump: true } : plan === 'jumpL' ? { press: i % 10 === 0, jump: true, left: true } : plan === 'jumpR' ? { press: i % 10 === 0, jump: true, right: true } : { up: i < 30, press: i === 30 || i === 45, jump: i >= 30, right: i >= 30 };
      r2.frame(pad);
      minY = Math.min(minY, r2.p.y);
      if (r2.p.y < b.y - 2) above = true;
      if (r2.p.grounded && r2.p.y <= b.y + 1) standAbove = true;
    }
    if (above || standAbove) console.log(`gate ${g.id} vine ${v.id} (top ${Math.round(v.topY)} bough ${Math.round(b.y)}) ${plan}: minY ${Math.round(minY)} above=${above} stoodAtOrAbove=${standAbove} end (${Math.round(r2.p.x)},${Math.round(r2.p.y)}) climbing=${r2.p.climbing}`);
  }
}
console.log('done');
