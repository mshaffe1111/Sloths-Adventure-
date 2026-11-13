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
