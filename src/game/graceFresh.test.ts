/**
 * The steer pause after a put-back ends on a fresh input in the harness as it does in the game (ENG-16F, R-165.246). engine.ts softFall
 * (and the flag respawn) pause steering 0.35 s "for a thumb still held from before the fall: a fresh touch or key counts at once"
 * (engine.ts inputGrace, graceMoves): the game's InputEngine counts a fresh input (inputEngine.ts fresh(): a jump flick, triggerTouchUp;
 * a new direction, triggerTouchMove, which the gesture layer sends only when the direction changes, touchGestures.ts setDir). The bots'
 * and the tests' harness (realPlay.ts FakeInput) counted none, so every hop a bot made within 0.35 s of a put-back went straight up for
 * the rest of the pause: 1-6 Normal kid seed 1 jumped at the chain's first liana twice that way, straight up and into the thorns, and was
 * rescued (ENG-16F frames 65.40-66.20). Any stage, any world: the real engine at 30 fps on a bare world, the engine's own put-back.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import type { Pad } from './realPlay.ts';
import type { Platform } from './types.ts';

const g = globalThis as { location?: unknown };
g.location ??= { search: '' };

/** a bare floor; he runs right, holding it, then the engine puts him back (softFall) and `after` is played frame by frame */
function putBack(after: Pad[]): number[] {
  const r = new RealPlay('1-1', 1);
  const floor: Platform = { id: 1, x: 0, y: 800, width: 6000, height: 40, type: 'solid' };
  r.bare([floor]);
  r.stand(400, 800);
  for (let f = 0; f < 20; f++) r.frame({ right: true });
  const e = r.e as unknown as { softOn: boolean; softAt: { x: number; y: number } | null; softFall(): boolean };
  e.softOn = true;
  e.softAt = { x: 900, y: 800 };
  assert.ok(e.softFall(), 'the engine put him back');
  const vx: number[] = [];
  for (const pad of after) {
    r.frame(pad);
    vx.push(Math.round(r.p.vx));
  }
  return vx;
}

test('put back with the steer still held: the pause holds him (no fresh input), as the game does', () => {
  const vx = putBack(Array.from({ length: 8 }, () => ({ right: true })));
  assert.deepEqual(vx, [0, 0, 0, 0, 0, 0, 0, 0], 'a thumb held from before the fall walked him on inside the pause');
});

test('put back, then a jump flick with the steer held: the flick is a fresh input, so the steer counts from that frame (inputEngine.ts fresh)', () => {
  const vx = putBack([{ right: true }, { right: true, press: true, jump: true }, { right: true, jump: true }, { right: true, jump: true }]);
  assert.equal(vx[0], 0, 'before the flick the pause holds');
  assert.ok(vx[2] > 0 && vx[3] > vx[2], `after the flick he still went straight up: vx ${vx.join(', ')}`);
});

test('put back, then a new direction: a fresh input, the steer counts at once (touchGestures.ts setDir sends only a change)', () => {
  const vx = putBack([{ right: true }, {}, { left: true }, { left: true }]);
  assert.ok(vx[3] < 0, `a new direction was held off by the pause: vx ${vx.join(', ')}`);
});
