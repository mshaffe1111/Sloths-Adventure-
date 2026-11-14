// The climbing vine's settle (vineFeel.ts, FEEL-VINE R-165.214; Matt 11-13 on 1-4: getting on or off a vine and the jump between vines
// felt "not very smooth"). Planted from the measure on the real engine at 30 fps (tools/inspect/vineFeel.ts): before the settle the
// screen showed a 40 px snap at a grab from beside a trunk, 49 px and a dead stop at a jump caught on one, 25 px at the vault off a top,
// 40 px at each push between two field vines, 50 px at a leap caught on the next, and 17 px where a climb ran into an uncleared bough.
// A snap that came back fails here. The BODY must still snap exactly as before: every reach, vault and verdict number is measured from
// it, so a test also proves the body is untouched (no stage, seed or rule moves).
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { carry, drawnOff, newSettle, settleStep, SETTLE_MAX, climbEnd } from './vineFeel.ts';
import { RealPlay, DT } from './realPlay.ts';
import { setDifficulty } from './difficulty.ts';
import { moves, trace, jerk, lagAfter } from '../../tools/inspect/vineFeel.ts';

/** the drawn path of a settle from offset d0 (px) and rate v0 (px/s), n frames */
function path(d0: number, v0: number, n: number): number[] {
  const s = newSettle();
  settleStep(s, DT, 0, 0, false);
  carry(s, -d0, 0, v0, 0, 0, 0);
  const out = [s.x];
  for (let i = 0; i < n; i++) {
    settleStep(s, DT, 0, 0, false);
    out.push(s.x);
  }
  return out;
}

test('a 40 px snap from rest settles in a quarter second with no frame over 12 px (a run is 9.5), no overshoot, and is gone', () => {
  const P = path(40, 0, 12);
  assert.equal(P[0], 40, 'the snap is carried: he is drawn where he was');
  for (let i = 1; i < P.length; i++) {
    assert.ok(Math.abs(P[i] - P[i - 1]) <= 12, `frame ${i} moves ${(P[i] - P[i - 1]).toFixed(1)} px`);
    assert.ok(P[i] >= 0 && P[i] <= P[i - 1], `frame ${i} overshoots or turns back (${P[i].toFixed(2)})`);
  }
  assert.ok(P[5] < 4, `5 frames (167 ms) on he is ${P[5].toFixed(1)} px off his body: his paws must be on the vine`);
  assert.equal(P[12], 0, 'the settle ends');
});

test('a catch carries his speed: the frame after it moves on at least at the speed he had (no dead stop), never lurches, never turns back', () => {
  // (he was 48 px short of the vine, moving toward it at 268 px/s: the jump at a trunk on 1-4, measured; the catch frame itself moves
  // him on at his own speed, engine.ts, and the spring takes over from there)
  const P = path(-48, 268, 10);
  const first = P[1] - P[0];
  assert.ok(first >= 268 * DT && first <= 1.6 * 268 * DT, `first frame ${first.toFixed(1)} px vs ${(268 * DT).toFixed(1)} at his speed`);
  for (let i = 1; i < P.length; i++) assert.ok(P[i] >= P[i - 1] - 1e-9 && P[i] <= 0, `frame ${i} at ${P[i].toFixed(2)}`);
});

test('a respawn, a flag or a placement is never blurred: a body jump past SETTLE_MAX clears the settle, and nothing outside the climb is carried once he has let go', () => {
  const s = newSettle();
  settleStep(s, DT, 100, 100, true);
  carry(s, 30, 0);
  assert.equal(s.x, -30);
  settleStep(s, DT, 100 + SETTLE_MAX + 1, 100, true);
  assert.deepEqual([s.x, s.y, s.vx, s.vy], [0, 0, 0, 0]);
  // (a climb ended at (100, 100); he is put 50 px away and is no longer climbing: nothing is carried or drawn off)
  climbEnd(s, 100, 100);
  assert.deepEqual(drawnOff(s, 150, 100, false), { x: 0, y: 0 });
  settleStep(s, DT, 150, 100, false);
  assert.deepEqual([s.x, s.y], [0, 0]);
});

test('a push from outside the climb (a bough he climbed into) is drawn from where the climb left him, the same frame', () => {
  const s = newSettle();
  settleStep(s, DT, 0, 441, true);
  climbEnd(s, 0, 441);
  // (the bough's body put him on its top, 24 px up, after the climb's block: drawn where he was)
  assert.deepEqual(drawnOff(s, 0, 417, true), { x: 0, y: 24 });
  settleStep(s, DT, 0, 417, true);
  assert.ok(s.y > 0 && s.y < 24, `then it settles (${s.y.toFixed(1)})`);
});

// The real engine, on every move the measurer finds from the stage's own vines (no stage data in the engine): a grab from beside a
// trunk and a jump at one, the vault off a top facing each way, the push between two field vines and the leap across. Proven on World 1's
// tower (1-4: cleared vines, a vine field), 1-5 (a trunk standing at its bough's very end) and World 6's 6-1, on both settings.
for (const [id, seed] of [['1-4', 1], ['1-5', 1], ['6-1', 1]] as const) {
  test(`${id}: every vine move draws with no snap (worst jerk 12 px, was 17-50) while the body snaps exactly as before`, () => {
    for (const d of ['normal', 'easy'] as const) {
      setDifficulty(d);
      const n = moves(new RealPlay(id, seed)).length;
      assert.ok(n >= 3, `${d}: the measurer finds the grab and the vault on ${id} (${n} moves)`);
      for (let i = 0; i < n; i++) {
        const r = new RealPlay(id, seed);
        const m = moves(r)[i];
        m.setup();
        const T = trace(r, m.pads);
        const body = jerk(T, false), drawn = jerk(T, true);
        assert.ok(body.max >= 15, `${d} ${m.name}: the body still snaps (${body.max.toFixed(1)} px): every reach is measured from it`);
        assert.ok(drawn.max <= 12, `${d} ${m.name}: drawn jerk ${drawn.max.toFixed(1)} px at f${drawn.at} (body ${body.max.toFixed(1)})`);
        assert.ok(lagAfter(T, 5) <= 4, `${d} ${m.name}: 5 frames on he is drawn ${lagAfter(T, 5).toFixed(1)} px off his body`);
      }
    }
    setDifficulty('normal');
  });
}
