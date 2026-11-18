// npx tsx reference/qa-reports/ENG-25b/waterTrace.ts <row> <tier> <setting> <variant> <x0> <x1>   (frames near the pond's lip: the pad, his body)
import { RealPlay } from '../../../src/game/realPlay.ts';
import { fixtureSeed, snapRun, type ToySnap } from '../../../tools/inspect/snapToys.ts';

const [row, tier, setting, v, x0, x1] = process.argv.slice(2);
const orig = RealPlay.prototype.frame;
RealPlay.prototype.frame = function (pad = {}) {
  const p = this.p;
  if (p.x > Number(x0) && p.x < Number(x1)) console.log(`t ${this.t.toFixed(2)} x ${p.x.toFixed(1)} y ${p.y.toFixed(1)} vx ${p.vx.toFixed(0)} vy ${p.vy.toFixed(0)} g ${p.grounded} on ${this.standingOn} pad ${JSON.stringify(pad)}`);
  return orig.call(this, pad);
};
const r = snapRun(row as ToySnap, tier as never, setting as never, fixtureSeed(row as ToySnap), Number(v));
console.log(r.harms.map((h) => `${h.kind} ${h.cause} x ${Math.round(h.x)} t ${h.t}`).join('; '));
