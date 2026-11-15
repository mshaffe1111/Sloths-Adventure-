/**
 * The rolling nut and the bouncing fruit (rolling.ts, pieces/rollingPiece.ts; 1-8.md NEW 2), in the REAL engine (realPlay.ts) on a
 * planted flat branch: no stage id, seed or x of the hazard's is the engine's. Each rule here was red before the piece existed (no
 * `rolling` piece starts, so nothing drops, nothing touches him) and is the design's: set off by his x, a drop-in tell of 0.5 s and
 * more, a thunk, then at him slower than his run; from the drop to reaching him at a full run a second or more; a hop clears a nut;
 * running under a fruit is never a touch, at a run, a walk or standing, Normal and Easy; jumping into it is; a teach bumps him with no
 * heart; after the crack a touch is a heart; a respawn sets every hazard ahead of his flag waiting again; a lay that cannot run fair is
 * refused by name.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay, type Pad } from './realPlay.ts';
import { setDifficulty } from './difficulty.ts';
import { arcTime, phasedPace, rollAhead, rollGroundProblems, rollMeetX, rollProblems, rollTeaches, rollTell, ROLL, type RollSpec } from './rolling.ts';
import { ROLLING_PIECE, type Rolling, type RollingPiece } from './pieces/rollingPiece.ts';
import { PHYS } from './physics.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import type { Platform } from './types.ts';

const Y = 500;
const DT = 1 / 30;
const NUT: RollSpec = { kind: 'low', dropX: 1500, speed: 120, bounce: 8 };
const FRUIT: RollSpec = { kind: 'high', dropX: 1500, speed: 140, bounce: 160 };

function world(specs: RollSpec[], opts: { easy?: boolean; chase?: GeneratedStage['chase'] } = {}) {
  setDifficulty(opts.easy ? 'easy' : 'normal');
  const r = new RealPlay('1-2', 1);
  const st = r.e.currentStage as GeneratedStage;
  st.rolling = specs;
  st.chase = opts.chase;
  r.bare([{ id: 1, x: 0, y: Y, width: 9000, height: 400, type: 'solid' } as Platform]);
  r.e.checkpoint = { x: 300, y: Y };
  r.stand(300, Y);
  r.safe = false;
  r.e.player.invincibleTimer = 0;
  r.e.player.hp = r.e.player.maxHp;
  const piece = (r.e as unknown as { pieces: Array<{ kind: string }> }).pieces.find((q) => q.kind === 'rolling') as RollingPiece | undefined;
  assert.ok(piece, 'the rolling piece starts on a stage that lays hazards');
  return { r, piece };
}

/** run him right (or as `pad` says) until `until` or `secs`; the frames where the first hazard changes phase and where it touched him */
function run(r: RealPlay, piece: RollingPiece, secs: number, pad: (h: Rolling, t: number) => Pad) {
  const h0 = piece.list[0];
  const out = { setOffMid: NaN, setOffT: NaN, landT: NaN, touchT: NaN, hearts: 0, minClear: Infinity, passed: false, bumpedVx: NaN };
  const hp0 = r.e.player.hp;
  let t = 0;
  for (let i = 0; i < Math.round(secs / DT); i++) {
    const h = piece.list[0];
    const was = h.phase, spent = h.spent;
    r.frame(pad(h, t));
    t += DT;
    const p = r.e.player;
    const mid = p.x;
    if (was === 'wait' && h.phase === 'drop') { out.setOffMid = h.spec.dropX - mid; out.setOffT = t; }
    if (was === 'drop' && h.phase === 'down') out.landT = t;
    if (!spent && h.spent) { out.touchT = t; out.bumpedVx = p.vx; }
    if (h.phase === 'down' && Math.abs(h.x - mid) < 30) out.minClear = Math.min(out.minClear, p.y - (h.y + 21) - ROLL.head);
    if (h.phase === 'down' && (h.x - mid) * -h.dir > 60) out.passed = true;
  }
  out.hearts = hp0 - r.e.player.hp;
  void h0;
  return out;
}

const hold = (): Pad => ({ right: true });

test('rolling: a nut is set off by his x, drops in for its tell (0.5 s+), lands and rolls at him slower than his run; from the drop to him at a full run is 1 s and more', () => {
  for (const easy of [false, true]) {
    const { r, piece } = world([NUT], { easy });
    const o = run(r, piece, 8, hold);
    const tell = rollTell(easy);
    assert.ok(tell >= 0.5, `the tell is ${tell} s`);
    assert.ok(o.setOffMid <= rollAhead(NUT, easy) && o.setOffMid > rollAhead(NUT, easy) - 2 * PHYS.maxRun * DT - 1, `set off ${o.setOffMid.toFixed(0)} px ahead (rollAhead ${rollAhead(NUT, easy)})`);
    assert.ok(Math.abs(o.landT - o.setOffT - tell) < DT * 1.5, `${easy ? 'Easy' : 'Normal'}: landed ${(o.landT - o.setOffT).toFixed(2)} s after its drop began`);
    assert.ok(o.touchT - o.setOffT >= ROLL.seen - DT, `${easy ? 'Easy' : 'Normal'}: reached him ${(o.touchT - o.setOffT).toFixed(2)} s after it dropped in`);
    assert.ok(Math.abs(piece.list[0].vx) < PHYS.maxRun, 'it rolls slower than his run');
    assert.equal(o.hearts, 1, 'no hop, no teach, no chase: a touch is a heart');
  }
  setDifficulty('normal');
});

// (ENG-CL (7): the quiet line's beat for a hazard stands where it meets him, tools/inspect/beats.ts findBeats; the place is the
// hazard's own geometry, rollMeetX, held here to the real engine at 30 fps: a nut's touch, a fruit's pass over his middle)
test('rolling: rollMeetX is where the real engine meets him at a full run (a nut touches him there; a fruit passes over him there or nearer its drop), both settings', () => {
  for (const easy of [false, true]) {
    for (const spec of [NUT, FRUIT]) {
      const { r, piece } = world([spec], { easy });
      let meet = NaN, best = Infinity;
      for (let i = 0; i < Math.round(8 / DT); i++) {
        const h = piece.list[0];
        const spent = h.spent;
        r.frame(hold());
        const mid = r.e.player.x;
        if (spec.kind === 'low') { if (!spent && h.spent && Number.isNaN(meet)) meet = mid; }
        else if (h.phase === 'down' && Math.abs(h.x - mid) < best) { best = Math.abs(h.x - mid); meet = mid; }
      }
      const at = `${easy ? 'Easy' : 'Normal'} ${spec.kind}`;
      assert.ok(!Number.isNaN(meet), `${at}: it never met him`);
      // (within two frames of his full run, 19 px: a nut at rollMeetX; a fruit phases its arcs to meet him mid-arc, so it may hold back and
      // pass over him later, but never before rollMeetX and never past its own drop)
      const m = rollMeetX(spec, easy), tol = 2 * PHYS.maxRun * DT;
      const ok = spec.kind === 'low' ? Math.abs(meet - m) <= tol : meet >= m - tol && meet <= spec.dropX + tol;
      assert.ok(ok, `${at}: met at ${meet.toFixed(0)}, rollMeetX ${m.toFixed(0)}, its drop ${spec.dropX}`);
    }
  }
  setDifficulty('normal');
});

test('rolling: a hop as it closes clears a nut (no touch, he runs on past it), both settings', () => {
  for (const easy of [false, true]) {
    const { r, piece } = world([NUT], { easy });
    let pressed = false;
    const o = run(r, piece, 8, (h) => {
      const p = r.e.player;
      const gap = h.x - (p.x + p.width / 2);
      if (!pressed && h.phase === 'down' && gap < 70 && gap > 0) { pressed = true; return { right: true, press: true }; }
      return { right: true, jump: pressed && r.e.player.vy < 0 };
    });
    assert.ok(pressed, 'he hopped');
    assert.ok(Number.isNaN(o.touchT), `${easy ? 'Easy' : 'Normal'}: the nut touched him at ${o.touchT.toFixed(2)} s`);
    assert.equal(o.hearts, 0);
    assert.ok(o.passed, 'and he is past it');
  }
  setDifficulty('normal');
});

test('rolling: running, walking or standing under a fruit is never a touch (its arc is phased to him: mid-arc over his drawn head by 15 px+), both settings', () => {
  // (standing: he runs up until it is set off, then stands still under it)
  const ways: Array<[string, (h: Rolling) => Pad]> = [['a run', hold], ['standing', (h) => (h.phase === 'wait' ? { right: true } : {})]];
  for (const easy of [false, true]) {
    for (const [name, pad] of ways) {
      const { r, piece } = world([FRUIT], { easy });
      const o = run(r, piece, 10, pad);
      assert.ok(Number.isNaN(o.touchT), `${easy ? 'Easy' : 'Normal'}, ${name}: the fruit touched him at ${o.touchT.toFixed(2)} s`);
      assert.ok(o.passed, `${easy ? 'Easy' : 'Normal'}, ${name}: it passed him`);
      assert.ok(o.minClear >= ROLL.headClear - 1, `${easy ? 'Easy' : 'Normal'}, ${name}: over his drawn head by ${o.minClear.toFixed(1)} px as it passed`);
    }
  }
  // (a walk: the thumb on three frames, off two)
  const { r, piece } = world([FRUIT]);
  let i = 0;
  const o = run(r, piece, 16, () => (i++ % 5 < 3 ? { right: true } : {}));
  assert.ok(Number.isNaN(o.touchT) && o.passed, `a walk: touched at ${o.touchT}`);
  setDifficulty('normal');
});

test('rolling: jumping into a fruit as it comes over is a touch', () => {
  const { r, piece } = world([FRUIT]);
  let pressed = false;
  const o = run(r, piece, 10, (h) => {
    const p = r.e.player;
    if (!pressed && h.phase === 'down' && h.x - p.x < 150 && h.x > p.x) { pressed = true; return { right: true, press: true }; }
    return { right: true, jump: pressed };
  });
  assert.ok(pressed);
  assert.ok(!Number.isNaN(o.touchT), 'a jump up into the fruit meets it');
  assert.equal(o.hearts, 1);
});

test('rolling: a teach (before the first crack) only bumps him back, no heart, and is spent; after the crack the same nut costs a heart', () => {
  const chase = { stretches: [{ start: 2600, end: 4000 }] };
  assert.equal(rollTeaches(NUT, chase), true, 'before the crack: a teach');
  assert.equal(rollTeaches({ ...NUT, dropX: 3000 }, chase), false, 'after it: a heart');
  assert.equal(rollTeaches(NUT, undefined), false, 'no chase: a heart');
  assert.equal(rollTeaches({ ...NUT, teach: true }, undefined), true, 'said outright');
  const { r, piece } = world([{ ...NUT, teach: true }]);
  const o = run(r, piece, 8, hold);
  assert.ok(!Number.isNaN(o.touchT), 'it touched him');
  assert.equal(o.hearts, 0, 'a teach costs no heart');
  assert.ok(o.bumpedVx < 0, `bumped back (vx ${o.bumpedVx})`);
  assert.equal(piece.list[0].spent, true);
  assert.equal(r.e.player.invincibleTimer <= 1e8 ? r.e.player.invincibleTimer < 0.5 : true, true, 'no safe time asked (no hurt)');
});

test('rolling: on a respawn every hazard ahead of his flag waits to drop again; one behind it is gone', () => {
  const { r, piece } = world([{ ...NUT, dropX: 900 }, { ...NUT, dropX: 2600 }]);
  run(r, piece, 4, hold);
  assert.notEqual(piece.list[0].phase, 'wait');
  r.stand(1200, Y);
  (piece as unknown as { respawn(h: unknown): void }).respawn((r.e as unknown as { pieceHost: unknown }).pieceHost);
  assert.equal(piece.list[0].phase, 'gone', 'behind his flag: gone');
  assert.equal(piece.list[1].phase, 'wait', 'ahead of it: waiting again');
});

test('rolling: a lay that cannot run fair is refused by name (the lay and the piece call the same check)', () => {
  assert.deepEqual(rollProblems([NUT, FRUIT]), []);
  const bad = rollProblems([{ ...NUT, speed: 300 }, { ...NUT, bounce: 60 }, { ...FRUIT, bounce: 90 }]);
  assert.equal(bad.length, 3, bad.join('; '));
  assert.ok(/not under his run/.test(bad[0]) && /not a hop/.test(bad[1]) && /through his head/.test(bad[2]), bad.join('; '));
  const st = { rolling: [{ ...FRUIT, bounce: 90 }], config: { levelHeight: 900 } } as unknown as GeneratedStage;
  const err = console.error;
  console.error = () => {};
  assert.equal(ROLLING_PIECE.start(st, {} as never), null, 'the piece refuses it');
  console.error = err;
  assert.equal(ROLLING_PIECE.start({ config: { levelHeight: 900 } } as unknown as GeneratedStage, {} as never), null, 'no hazards, no piece');
});

test('rolling: the fruit phases each arc to meet him mid-arc, inside its band', () => {
  const T = arcTime(160);
  // (him 600 px ahead running at it: the first arc that reaches him is met at its middle)
  const u = phasedPace(1000, 400, PHYS.maxRun, -1, 140, 160);
  const meet = (400 - 1000) / (u - PHYS.maxRun);
  const k = Math.floor(meet / T);
  assert.ok(Math.abs(meet - (k + 0.5) * T) < 0.01, `met ${meet.toFixed(3)} s in, arcs of ${T.toFixed(3)} s`);
  assert.ok(Math.abs(u) >= 140 * ROLL.phaseLo - 1e-9 && Math.abs(u) <= 140 * ROLL.phaseHi + 1e-9);
});

test('rolling: the shortest tap (one frame), pressed in time, clears a nut at a full run; a held hop has a wide window', () => {
  const windowOf = (holdF: number) => {
    let ok = 0;
    for (let at = 10; at <= 140; at += 5) {
      const { r, piece } = world([NUT]);
      let pressed = false, n = 0;
      const o = run(r, piece, 8, (h) => {
        const p = r.e.player;
        const gap = h.x - (p.x + p.width / 2);
        if (!pressed && h.phase === 'down' && gap < at) { pressed = true; return { right: true, press: true }; }
        return { right: true, jump: pressed && ++n < holdF };
      });
      if (pressed && Number.isNaN(o.touchT)) ok++;
    }
    return ok;
  };
  const tap = windowOf(1), held = windowOf(3);
  assert.ok(tap >= 2, `a one-frame tap clears it from ${tap} of the press points 5 px apart`);
  assert.ok(held >= 4 && held > tap, `a three-frame hop: ${held}`);
});

test('rolling: a hazard whose run-in holds a rock he must hop, or a gap, is refused by name', () => {
  const floor = { x: 0, y: 500, width: 4000, height: 400, type: 'solid' as const };
  assert.deepEqual(rollGroundProblems([NUT], [floor]), []);
  const rock = { x: 1300, y: 440, width: 60, height: 60, type: 'solid' as const };
  assert.ok(/a wall at x 1300/.test(rollGroundProblems([NUT], [floor, rock]).join()), 'a rock in the run-in');
  const gap = [{ ...floor, width: 1200 }, { ...floor, x: 1320, width: 2000 }];
  assert.ok(/a gap at x 12/.test(rollGroundProblems([NUT], gap).join()), 'a gap in the run-in');
});
