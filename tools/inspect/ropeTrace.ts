/**
 * ropeTrace: the first-timer bot on one stage roll, with every rope moment logged (a grab, a let-go and how, a fall near a rope and where
 * it came from), to see why a first-timer loses hearts at the ropes.
 *   npx tsx tools/inspect/ropeTrace.ts 8-2 1 normal
 */
import { RealPlay } from '../../src/game/realPlay.ts';
import { FT_ADULT, FT_KID, firstTimer } from './firsttimer.ts';

const [id = '8-2', seedS = '1', diff = 'normal', trialS = '0'] = process.argv.slice(2);
const who = diff === 'easy' ? FT_KID : FT_ADULT;
const log: string[] = [];
const orig = RealPlay.prototype.frame;
let last: any = null;
let hangFrom: any = null;
RealPlay.prototype.frame = function (pad: any = {}) {
  const p = this.p;
  const before = { hanging: !!p.hanging, x: p.x, y: p.y, hp: p.hp, grounded: p.grounded };
  orig.call(this, pad);
  const ropes = this.ropes;
  const near = ropes.find((r: any) => p.x > r.x0 - 250 && p.x < r.x1 + 250);
  const tag = near ? `rope ${near.id} [${Math.round(near.x0)}..${Math.round(near.x1)}]` : '';
  if (!before.hanging && p.hanging) { hangFrom = { x: before.x, t: this.t }; log.push(`${this.t.toFixed(1)} GRAB ${tag} at x ${Math.round(p.x)}`); }
  if (before.hanging && !p.hanging) {
    const how = p.hp < before.hp ? 'HURT' : pad.down ? 'down' : pad.press || pad.jump ? 'JUMP' : 'end/other';
    log.push(`${this.t.toFixed(1)} LETGO ${tag} at x ${Math.round(p.x)} (${how}; vx ${Math.round(p.vx)} vy ${Math.round(p.vy)}) pad ${JSON.stringify(pad)}`);
  }
  if (p.hp < before.hp && near) log.push(`${this.t.toFixed(1)} HEART ${tag} now x ${Math.round(p.x)} was x ${Math.round(before.x)} y ${Math.round(before.y)} hanging ${before.hanging}`);
  last = before;
};
const r = firstTimer(id, Number(seedS), who, { trial: Number(trialS) } as any);
console.log(log.join('\n'));
console.log(`end ${r.end} t ${r.time} goal ${r.goal.got}/${r.goal.need} softFalls ${r.softFalls} lives ${r.harms.filter((h) => h.kind === 'life').length} rescues ${r.rescues}`);
