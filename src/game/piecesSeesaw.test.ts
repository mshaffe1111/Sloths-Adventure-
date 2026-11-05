// The counterweight seesaw as a route piece (src/game/pieces/seesaw.ts): the kit's seesaw (1-6's room) on the route. Its own weight
// rules: Pokey alone on the far end tips it down to the floor, under a bank he cannot reach; pushed onto the near end, the log holds it
// down and the far end stays up under him as the step. Played through in the real engine on Normal and Easy.
import test from 'node:test';
import assert from 'node:assert/strict';
import { SEESAW, link, seesawCrossing } from './pieces/seesaw.ts';
import { bareWorld, rng } from './pieces/pieceBot.ts';
import { jumpOK } from './levelCheck.ts';
import { LANDINGS, landingKind } from './mixer/catalog.ts';
import { DT, type RealPlay } from './realPlay.ts';
import type { Platform } from './types.ts';

const G = 1000;
function course() {
  const c = seesawCrossing({ x: 200, floorY: G });
  const floor = { id: 1, ...c.floor } as Platform;
  const log = { id: 2, ...c.log } as Platform;
  const L = { id: 3, ...c.ends[0], seesaw: { ...c.ends[0].seesaw! } } as Platform;
  const R = { id: 4, ...c.ends[1], seesaw: { ...c.ends[1].seesaw! } } as Platform;
  link(L, R);
  const bank = { id: 5, ...c.bank } as Platform;
  return { floor, log, L, R, bank };
}
const by = (rp: RealPlay, id: number) => rp.platforms.find((p) => p.id === id)!;
function settle(rp: RealPlay, s: number) { for (let i = 0; i < Math.round(s / DT); i++) rp.frame(); }

test('the bank is out of reach from the floor and from a lowered end; from the raised end it is a second jump', () => {
  const { floor, L, R, bank } = course();
  assert.equal(jumpOK(floor, bank, true).ok, false, 'the floor to the bank: too high, even with the second jump');
  assert.equal(jumpOK({ ...R, y: G } as Platform, bank, true).ok, false, 'a lowered far end: too high');
  assert.equal(jumpOK(R, bank, true).ok, true, 'the raised far end: a second jump up');
  assert.equal(jumpOK(R, bank, false).ok, false, 'not a single jump (it asks the second jump, as 1-6 does)');
  assert.ok(L.y === G && R.y === G - SEESAW.rise, 'at rest the near end is down, the far end up');
});

test('real engine: alone on the far end his weight tips it down to the floor (the log is needed)', () => {
  for (const setting of ['normal', 'easy'] as const) {
    const { floor, log, L, R, bank } = course();
    const rp = bareWorld([floor, { ...log, x: 220 }, L, R, bank], setting);
    rp.stand(R.x + R.width / 2, R.y);
    settle(rp, 1.2);
    assert.ok(Math.abs(by(rp, 4).y - G) < 1, `${setting}: the far end went down under him (${by(rp, 4).y})`);
    assert.ok(Math.abs(by(rp, 3).y - (G - SEESAW.rise)) < 1, 'and the near end up');
  }
});

/** the whole crossing as a player does it, in the real engine: walk into the log and push it till it stops, hop onto it, on onto the far
 *  end, and the second jump to the bank (the second flick `second` s after the first, the thumb down `hold` s each). True if he stands
 *  on the bank */
function cross(setting: 'normal' | 'easy', hold: number, second: number): boolean {
  const { floor, log, L, R, bank } = course();
  const rp = bareWorld([floor, log, L, R, bank], setting);
  rp.stand(log.x - 40, G);
  // push: walk right until the log stops moving
  let last = -1, still = 0;
  for (let i = 0; i < 300 && still < 8; i++) { rp.frame({ right: true }); const x = by(rp, 2).x; still = Math.abs(x - last) < 0.01 ? still + 1 : 0; last = x; }
  // hop onto the log, then walk on onto the raised far end
  rp.frame({ press: true, right: true });
  for (let i = 0; i < 60; i++) { rp.frame({ jump: i < 6, right: true }); if (rp.p.grounded && (rp.standingOn === 2 || rp.standingOn === 4)) break; }
  for (let i = 0; i < 90 && rp.standingOn !== 4; i++) rp.frame({ right: true, press: rp.p.grounded && rp.standingOn === 2 && i % 15 === 0, jump: i % 15 < Math.round(hold / DT) });
  if (rp.standingOn !== 4) return false;
  for (let i = 0; i < 90 && rp.p.x < by(rp, 4).x + by(rp, 4).width - 24; i++) rp.frame({ right: true });
  // the second jump up to the bank
  const t2 = Math.round(second / DT), h = Math.round(hold / DT);
  for (let i = 0; i < 90; i++) {
    rp.frame({ press: i === 0 || i === t2, jump: i < h || (i > t2 && i < t2 + h), right: true });
    if (i > 3 && rp.p.grounded) break;
  }
  settle(rp, 0.3);
  return (rp.standingOn as number) === 5;
}

test('real engine: pushed onto the near end, the log holds it, and he gets up the step to the bank (Normal and Easy thumbs)', () => {
  for (const setting of ['normal', 'easy'] as const) {
    const r = rng(setting === 'easy' ? 3 : 4);
    let ok = 0;
    const N = 20;
    // (the second flick when he feels the first jump top out: 0.25-0.4 s in; the thumb down 0.15-0.3 s each)
    for (let k = 0; k < N; k++) if (cross(setting, 0.15 + r() * 0.15, 0.25 + r() * 0.15)) ok++;
    assert.ok(ok / N >= (setting === 'easy' ? 0.85 : 0.7), `${setting}: up ${ok} of ${N}`);
  }
});

test('its label is in the library: a built piece on the ground (its pivot stands on the floor), never floating', () => {
  const { L, R } = course();
  for (const p of [L, R]) assert.deepEqual(landingKind(p as Platform & Record<string, unknown>).map((q) => q.name), ['counterweight seesaw']);
  const e = LANDINGS.find((q) => q.name === 'counterweight seesaw')!;
  assert.equal(e.mayFloat, 'no');
});
