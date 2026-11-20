// npx tsx reference/qa-reports/ENG-25c/biteTrace.ts <row> <tier> <setting> <variant>   (ENG-25c: a toy run's frames at the snap pond:
// where he stands, the count of the stone under him (padPiece.ts snapCount: 4 = biting), his press; and every hit and life it took)
import { RealPlay } from '../../../src/game/realPlay.ts';
import { snapCount } from '../../../src/game/pieces/padPiece.ts';
import { fixtureSeed, pondOf, snapRun, snapStage, type ToySnap } from '../../../tools/inspect/snapToys.ts';

const [row, tier, setting, v] = process.argv.slice(2);
const seed = fixtureSeed(row as ToySnap);
const pond = pondOf(snapStage(row as ToySnap, seed, setting as never));
const orig = RealPlay.prototype.frame;
RealPlay.prototype.frame = function (pad = {}) {
  const p = this.p;
  if (p.x > pond.x0 - 120 && p.x < pond.x1 + 40) {
    const on = this.platforms.find((q) => q.id === this.standingOn);
    const counts = this.platforms.filter((q) => q.pad?.on === 'bites').map((q) => snapCount(q) ?? '-').join('');
    console.log(`t ${this.t.toFixed(2)} x ${p.x.toFixed(1)} y ${p.y.toFixed(1)} vx ${p.vx.toFixed(0)} g ${p.grounded ? 1 : 0} on ${on ? (on.pad?.on === 'bites' ? `snap@${on.x}:${snapCount(on)}` : `floor@${on.x}`) : '-'} counts ${counts} hp ${p.hp} pad ${JSON.stringify(pad)}`);
  }
  return orig.call(this, pad);
};
const r = snapRun(row as ToySnap, tier as never, setting as never, seed, Number(v));
console.log(`pond ${pond.x0}-${pond.x1}; ` + r.harms.map((h) => `${h.kind} ${h.cause} x ${Math.round(h.x)} t ${h.t}`).join('; '));
