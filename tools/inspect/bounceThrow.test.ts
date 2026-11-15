// npx tsx --test tools/inspect/bounceThrow.test.ts   (CI: gates.yml, the engine tools' tests)
/**
 * The first-timer's bounce up a high bank (FIX-21, 11-15; level.md rule 21). 2-1's beat 7 lays World 2's lily at the foot of a bank
 * 236-240 px up: 206-210 over the cap, past a bounce's own 181 (PHYS.bounceV under gravUp), inside the bounce + air jump's 258
 * (pipeline.ts BOUNCE_REACH). The kid and the adult (castBots' CAST_BOTS) run onto the lily, which throws them (engine.ts, the run-into
 * spring) with no jump of theirs in progress: before, that throw was no jump at all, so it never failed, never became a double, and
 * the mushroom behind them was never gone back to (bounceBack is the tier bots'): rescued there on every seed (BUILD-21's 40-seed
 * table, 0/40 both). SKILLS.throws: the throw is his jump, planned as his jumps are (mem.plan: a double where one failed here, the second
 * flick near the top at his dblAt), and throwBack takes him back onto the mushroom that threw him short. Planted: switched off, the kid
 * is rescued at the bank (measured 11-15, seed 4 Normal: rescued at x 22,710 off, none on).
 */
import '../../src/game/headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from '../../src/game/realPlay.ts';
import { firstTimer, SKILLS } from './firsttimer.ts';
import { CAST_BOTS } from './castBots.ts';

/** the high bank: the mushroom with a face over 200 px just past it, on the built stage (never a data number, level.md rule 27) */
function highBank(seed: number): { x0: number; x1: number } {
  const P = new RealPlay('2-1', seed).platforms;
  for (const b of P) {
    if (b.type !== 'bouncy') continue;
    const w = P.find((q) => q.type === 'solid' && q.x >= b.x + b.width && q.x - (b.x + b.width) < 140 && b.y + b.height - q.y > 200);
    if (w) return { x0: b.x - 400, x1: w.x + w.width };
  }
  throw new Error(`2-1 seed ${seed}: no mushroom under a high bank`);
}
const atBank = (xs: number[], z: { x0: number; x1: number }) => xs.filter((x) => x >= z.x0 && x <= z.x1).length;

test('2-1 beat 7: the kid climbs the high bank off the lily, no rescue there; with SKILLS.throws off he is rescued there (planted)', () => {
  const seed = 4;
  const kid = CAST_BOTS.kid.normal!;
  const z = highBank(seed);
  const on = firstTimer('2-1', seed, kid, { cap: 1200, dotSetting: true });
  SKILLS.throws = false;
  let off;
  try { off = firstTimer('2-1', seed, kid, { cap: 1200, dotSetting: true }); } finally { SKILLS.throws = true; }
  assert.equal(atBank(on.rescueXs, z), 0, `on: no rescue at the bank (${z.x0}-${z.x1}); rescues at ${on.rescueXs.join(', ') || 'none'}`);
  assert.ok(atBank(off.rescueXs, z) > 0, `off (planted): rescued at the bank; rescues at ${off.rescueXs.join(', ') || 'none'}`);
});
