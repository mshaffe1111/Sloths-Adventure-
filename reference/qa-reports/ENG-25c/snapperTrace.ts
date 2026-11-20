// npx tsx reference/qa-reports/ENG-25c/snapperTrace.ts <snapper|snapper-asleep> <tier> <setting> <variant>   (ENG-25c: a snapper toy run near
// the snapper: his x, the snapper's x and phase, the pad; and how the run ended)
import { RealPlay } from '../../../src/game/realPlay.ts';
import { atSnapper, snapperRun, snapperSeed, snapperStage, type ToySnapper } from '../../../tools/inspect/snapToys.ts';

const [which, tier, setting, v] = process.argv.slice(2);
const seed = snapperSeed(which as ToySnapper);
const st = snapperStage(which as ToySnapper, seed);
const m0 = st.enemies.find((e) => e.type === 'turtle')!;
const orig = RealPlay.prototype.frame;
let last = '';
RealPlay.prototype.frame = function (pad = {}) {
  const p = this.p;
  const c = (this as any).e.cast as { members: Array<{ s: { x: number; y: number; phase: string; leaving?: boolean }; cleared: boolean }> } | null;
  const m = c?.members?.[0];
  if (Math.abs(p.x - m0.x) < 400) {
    const line = `x ${p.x.toFixed(0)} y ${p.y.toFixed(0)} g ${p.grounded ? 1 : 0} | it x ${m?.s.x.toFixed(0)} ${m?.s.phase}${m?.cleared ? ' CLEARED' : ''} | pad ${JSON.stringify(pad)}`;
    if (line !== last) console.log(`t ${this.t.toFixed(2)} ${line}`);
    last = line;
  }
  return orig.call(this, pad);
};
const r = snapperRun(which as ToySnapper, tier as never, setting as never, seed, Number(v));
console.log(JSON.stringify(atSnapper(r, st)), `seed ${seed}, it starts at x ${m0.x}, patch ${m0.patrolMinX}-${m0.patrolMaxX}`);
