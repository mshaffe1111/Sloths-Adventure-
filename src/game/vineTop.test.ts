// The vault off a climbing vine's top (vineTop.ts): straight up at the top lands on the wood there, whichever way he faces (STAGE-RULES
// §1 "straight up always climbs"; D46, the plain action lands with margin). Planted from 1-4's turn (B14c, 11-13): every climbing vine is
// cleared CLIMB_CLEAR px off the end of the bough it leads up to (pipeline.ts clearClimbs), and the engine's old finder looked for wood
// only from 10 px out, stopping at the first miss, so it never saw that bough and the vault went the way he faced: on a tower's
// turn-back he faces away from the storey above, vaulted off, fell and caught the vine again, over and over.
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { CLIMB_CLEAR, VAULT_GAP, ledgeOut, vaultSide } from './vineTop.ts';
import { RealPlay } from './realPlay.ts';
import type { Platform, Vine } from './types.ts';

const plank = (id: number, x0: number, x1: number, y: number): Platform => ({ id, x: x0, y, width: x1 - x0, height: 24, type: 'solid' }) as Platform;
const trunk = (id: number, x: number, topY: number, bottomY: number): Vine => ({ id, x, topY, bottomY, swaySpeed: 1.1, swayPhase: 0, vineType: 'tree_climb' }) as Vine;

/**
 * 1-4's first turn-back, as laid (Easy, tools/engine/library14.ts seed 1, t-b14@cbe090f0): he walks RIGHT along the storey 640-1197 to
 * the turn's vine, standing 18 px in from its tip (TOWER.vineIn 44, less CLIMB_CLEAR); the storey above runs back LEFT from its near
 * end at 1153, CLIMB_CLEAR px short of the vine.
 */
const TURN = { P: [plank(2, 640, 1197, 7601), plank(3, 853, 1153, 7320)], V: [trunk(1, 1179, 7320, 7601)] };

/** the finder as it was until 11-13 (engine.ts vaultSide): wood sampled from 10 px out, stopping at the first miss */
function oldSide(v: Vine, P: readonly Platform[], facing: 1 | -1): 1 | -1 {
  const reach = (dir: 1 | -1) => {
    let d = 0;
    while (d < 200) {
      const x = v.x + dir * (d + 10);
      if (!P.some((q) => !q.broken && q.type !== 'bouncy' && x >= q.x && x <= q.x + q.width && q.y >= v.topY - 16 && q.y <= v.topY + 30)) break;
      d += 10;
    }
    return d;
  };
  const l = reach(-1), r = reach(1);
  return l === r ? facing : r > l ? 1 : -1;
}

test('the vault finder sees the bough a cleared vine stands CLIMB_CLEAR px off, so straight up at 1-4\'s turn goes onto the storey above whichever way he faces (planted: the old finder sent him the way he faced)', () => {
  const { P, V: [v] } = TURN;
  assert.equal(v.x - (P[1].x + P[1].width), CLIMB_CLEAR, 'the planted turn is cleared as the lay clears it');
  assert.ok(ledgeOut(v, P, -1) > 0, 'the storey above is seen');
  assert.equal(ledgeOut(v, P, 1), 0, 'nothing at its height on the other side');
  assert.equal(vaultSide(v, P, 1), -1, 'facing the way he walked in (right), the vault goes left onto the storey above');
  assert.equal(vaultSide(v, P, -1), -1);
  // (the planted fault: the old finder, facing right, vaulted right into the air)
  assert.equal(oldSide(v, P, 1), 1);
});

test('wherever wood begins within 10 px of the vine (a trunk under a shelf, 4-3), the finder reads exactly what the old one read', () => {
  for (const [a, b] of [[-300, 50], [-5, 400], [-60, 60], [-200, 9], [-9, 9], [10, 300], [-300, -10]] as const) {
    const v = trunk(1, 500, 1000, 1300);
    const P = [plank(1, 500 + a, 500 + b, 1000), plank(2, 200, 800, 1300)];
    for (const f of [1, -1] as const) assert.equal(vaultSide(v, P, f), oldSide(v, P, f), `wood ${a}..${b}, facing ${f}`);
  }
});

test('wood that begins past VAULT_GAP is not a place the vault lands, and a far ledge never outweighs the near one', () => {
  const v = trunk(1, 500, 1000, 1300);
  assert.equal(ledgeOut(v, [plank(1, 500 + VAULT_GAP + 11, 900, 1000)], 1), 0, 'too far: not seen');
  assert.ok(ledgeOut(v, [plank(1, 500 + VAULT_GAP, 900, 1000)], 1) > 0, 'at the gap: seen');
  // (a long bough out of reach on his left, a short one in reach on his right: he goes right, whichever way he faces)
  const P = [plank(1, 100, 500 - VAULT_GAP - 11, 1000), plank(2, 500 + CLIMB_CLEAR, 500 + CLIMB_CLEAR + 60, 1000)];
  assert.equal(vaultSide(v, P, -1), 1);
  assert.equal(vaultSide(v, P, 1), 1);
});

/** the real engine at 30 fps on a bare stage of these pieces: he is put on the vine 100 px under its top facing `facing`; straight up only */
function vaultOn(P: Platform[], v: Vine, facing: 1 | -1): { on: number; x: number } {
  const sim = new RealPlay('1-1', 1);
  sim.bare(P.map((q) => ({ ...q })), [{ ...v }]);
  sim.climb(sim.vines[0], v.topY + 100);
  (sim.p as { facing: 1 | -1 }).facing = facing;
  for (let k = 0; k < 90; k++) {
    sim.frame({ up: true });
    if (k > 2 && !sim.p.climbing && sim.p.grounded) break;
  }
  return { on: sim.p.grounded && !sim.p.climbing ? sim.standingOn : -1, x: Math.round(sim.p.x) };
}

test('the real engine: at 1-4\'s turn, straight up lands him on the storey above facing either way (planted: facing right, as he walks in, he vaulted off and caught the vine again)', () => {
  const { P, V: [v] } = TURN;
  for (const f of [1, -1] as const) assert.equal(vaultOn(P, v, f).on, 3, `facing ${f > 0 ? 'right' : 'left'}`);
  // (and its mirror, a turn-back on a storey that runs left)
  const M = P.map((q) => ({ ...q, x: 2000 - q.x - q.width }));
  for (const f of [1, -1] as const) assert.equal(vaultOn(M, { ...v, x: 2000 - v.x }, f).on, 3, `mirrored, facing ${f > 0 ? 'right' : 'left'}`);
});

test('the real engine: VAULT_GAP promises no more than the vault gives, with margin (a bough beginning 12 px past it is still landed)', () => {
  const v = trunk(1, 500, 1000, 1300);
  const P = [plank(1, 200, 800, 1300), plank(2, 500 + VAULT_GAP + 12, 900, 1000)];
  assert.equal(vaultOn(P, v, 1).on, 2);
});

// ── the 80 px vine-top rule (R-165.206, FIX-14c): a climbable vine's top keeps TOP_ROOM of ledge to any OPEN end ──────────────────────
import { TOP_ROOM, topRoom, topRoomShort } from './vineTop.ts';

/** the real engine: he climbs `v` to its top holding up and `side` (the vault the short way, a thumb that slid), then lets go; where does
 *  he come to rest: the piece he stands on, or -1 (falling past it) */
function vaultSideways(P: Platform[], v: Vine, side: 'left' | 'right'): number {
  const sim = new RealPlay('1-1', 1);
  sim.bare(P.map((q) => ({ ...q })), [{ ...v }]);
  sim.climb(sim.vines[0], v.topY + 100);
  let k = 0;
  for (; k < 90 && sim.p.climbing; k++) sim.frame({ up: true, [side]: true });
  for (let j = 0; j < 30; j++) sim.frame({});
  return sim.p.grounded && !sim.p.climbing && Math.abs(sim.p.y - v.topY) < 30 ? sim.standingOn : -1;
}

test('the real engine: a vine TOP_ROOM from a ledge\'s open end keeps him on it when the vault goes the short way; 20 px (1-4\'s crown, its sure vine) put him off', () => {
  const floor = plank(1, 0, 1400, 1600);
  for (const side of ['left', 'right'] as const) {
    const d = side === 'left' ? -1 : 1;
    // the ledge runs 400 px the long way and TOP_ROOM the short way
    const at = (room: number) => (d < 0 ? plank(2, 600 - room, 1000, 1000) : plank(2, 200, 600 + room, 1000));
    assert.equal(vaultSideways([floor, at(TOP_ROOM)], trunk(1, 600, 1000, 1600), side), 2, `${side}: ${TOP_ROOM} px keeps him on`);
    assert.equal(vaultSideways([floor, at(20)], trunk(1, 600, 1000, 1600), side), -1, `${side}: planted, 20 px puts him off`);
  }
});

test('topRoom: touching pieces at one height are one ledge, the stage\'s edge and a step beside are no open end; topRoomShort flags only an open end inside TOP_ROOM (planted: FIX-14b\'s 26-34 px were piece seams and walls)', () => {
  const W = 1280;
  // (1-4 seed 3's turn at the wall, as laid: the vine 26 px from a seam at 114, the ledge on to 334, the wall at 0)
  const seam = [plank(1, 0, 114, 5995), plank(2, 114, 334, 5995)];
  const t = topRoom(trunk(1, 88, 5995, 6476), seam, W)!;
  assert.deepEqual([t.x0, t.x1, t.on, t.openLeft, t.openRight], [0, 334, true, false, true]);
  assert.equal(topRoomShort(trunk(1, 88, 5995, 6476), seam, W), null, 'a seam is not an end; the stage edge is a wall');
  // the crown's sure vine as it was: 20 px from the mid's open end over the stair
  assert.match(topRoomShort(trunk(1, 420, 1000, 1240), [plank(1, 400, 680, 1000), plank(2, 260, 360, 1060)], W) ?? '', /20 px to the open left end 400/);
  // a step up beside the end (wood within 60 px over it) or a step down within 40 is no walk-off
  assert.equal(topRoomShort(trunk(1, 420, 1000, 1240), [plank(1, 400, 680, 1000), plank(2, 200, 400, 950)], W), null);
  assert.equal(topRoomShort(trunk(1, 420, 1000, 1240), [plank(1, 400, 680, 1000), plank(2, 200, 400, 1030)], W), null);
  // a creaking bough is no ledge to count on (it gives): the end beside it is open
  assert.match(topRoomShort(trunk(1, 420, 1000, 1240), [plank(1, 400, 680, 1000), { ...plank(2, 200, 400, 1000), type: 'fragile', creak: 1.6 }], W) ?? '', /open left end 400/);
  // in front of a bough's face (CLIMB_CLEAR): only the far end is ahead of him
  assert.equal(topRoomShort(trunk(1, 400 - CLIMB_CLEAR, 1000, 1240), [plank(1, 400, 680, 1000)], W), null);
  assert.match(topRoomShort(trunk(1, 400 - CLIMB_CLEAR, 1000, 1240), [plank(1, 400, 440, 1000)], W) ?? '', /open right end 440/);
  assert.equal(TOP_ROOM, 80, 'his grab reach 54 + half his body 22, rounded up (FIX-14)');
});
