/**
 * The vine snake (vineSnake.ts, pieces/vineSnakePiece.ts; 1-6.md NEW 2, ENG-S2) and the host's let-go (stagePiece.types.ts
 * PieceHost.letGo, engine.ts letGoOfLiana). Planted: each test goes red without the piece registered, or without letGo (planted.out.txt).
 *   - its route, tell and touch, pure;
 *   - through the REAL engine (RealPlay) on two worlds' own lianas: it rides the liana's swing; its tell never takes his hold; coming
 *     down onto his hands it makes him let go (a hop, no heart) and he cannot catch that liana again in the air; held below where it turns,
 *     it never touches him; rising from the foot it takes a low hold and leaves a high one.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { beatClock, beatDef } from './beat.ts';
import { LET_GO } from './physics.ts';
import { PIECE_KINDS } from './pieces/index.ts';
import { handsAlong, VINE_SNAKE_PIECE } from './pieces/vineSnakePiece.ts';
import type { PieceHost, StagePiece } from './stagePiece.types.ts';
import type { Vine } from './types.ts';
import { FALSE_LIANA, onVine, SNAKE, snakeBeatFaults, snakeNow, snakeTouches, type VineSnake } from './vineSnake.ts';

const LEN = 410;
const at = (sn: VineSnake, phase: 'off' | 'warn' | 'on', u = 0) => snakeNow(sn, LEN, { phase, u });

test('its route: down-off passes all the way off the foot; down-back turns at its reach and goes back into the bough; up rises to its reach and goes back off the foot; every trip ends with all of it off the vine', () => {
  const off: VineSnake = { route: 'down-off', clock: 'c' };
  assert.equal(at(off, 'on', 0).head, 0);
  assert.equal(at(off, 'on', 1).head, LEN + SNAKE.body);
  assert.equal(onVine(at(off, 'on', 1), LEN), null, 'down-off ends off the foot');
  const back: VineSnake = { route: 'down-back', clock: 'c', reach: 0.5 };
  const turn = at(back, 'on', 0.5);
  assert.equal(turn.head, LEN * 0.5, 'waits at its reach');
  assert.ok(at(back, 'on', 0.2).dir === 1 && at(back, 'on', 0.8).dir === -1, 'down, then back up head first');
  assert.equal(onVine(at(back, 'on', 1), LEN), null, 'down-back ends in the bough');
  assert.ok(Math.max(...[0, 0.1, 0.3, 0.5, 0.7, 0.9, 1].map((u) => at(back, 'on', u).head)) <= LEN * 0.5 + 1e-9, 'never past its reach');
  const up: VineSnake = { route: 'up', clock: 'c', reach: 0.4 };
  assert.equal(at(up, 'on', 0).head, LEN);
  assert.equal(at(up, 'on', 0.5).head, LEN * 0.6, 'rises to its reach from the foot');
  assert.ok(Math.min(...[0, 0.2, 0.5, 0.8, 1].map((u) => at(up, 'on', u).head)) >= LEN * 0.6 - 1e-9, 'never above its reach');
  assert.equal(onVine(at(up, 'on', 1), LEN), null, 'up ends off the foot');
  assert.equal(at(up, 'off').shown, false);
});

test('its tell: shown at its start end, touching nothing, even with his hands right there; a beat with a tell under 0.5 s (or none) is a fault', () => {
  const down: VineSnake = { route: 'down-off', clock: 'c' };
  const up: VineSnake = { route: 'up', clock: 'c' };
  const td = at(down, 'warn');
  const tu = at(up, 'warn');
  assert.ok(td.shown && td.tell && !td.live && td.head === 0);
  assert.ok(tu.shown && tu.tell && tu.head === LEN);
  for (let h = 0; h <= LEN; h += 5) assert.ok(!snakeTouches(td, LEN, h) && !snakeTouches(tu, LEN, h), `the tell touched his hands at ${h}`);
  // (and travelling it does touch, from the first frame it is over his hands)
  assert.ok(snakeTouches(at(down, 'on', 0.3), LEN, at(down, 'on', 0.3).head - 20));
  assert.deepEqual(snakeBeatFaults(down, beatDef('c', 8, 0.6, 4).phases), []);
  assert.equal(snakeBeatFaults(down, beatDef('c', 8, 0.4, 4).phases).length, 1, 'a 0.4 s tell is a fault');
  assert.equal(snakeBeatFaults(down, [{ name: 'off', seconds: 4 }, { name: 'on', seconds: 4 }]).length, 1, 'no tell is a fault');
  assert.equal(snakeBeatFaults({ ...down, reach: 1.5 }, beatDef('c', 8, 0.6, 4).phases).length, 1);
});

type Eng = { pieces: StagePiece[]; pieceHost: PieceHost; clock: ReturnType<typeof beatClock>; gameTime: number; startPieces(): void; damagePlayer(n: number, x?: number): void };

/** the stage's first liana with a snake on a beat (period 8 s: off 3.4, tell 0.6, trip 4), and the engine's clock and pieces made again */
function snaked(id: string, sn: Omit<VineSnake, 'clock'>, easy = false) {
  const r = new RealPlay(id, 1);
  const e = r.e as unknown as Eng;
  const v = r.stage.vines.find((q) => q.vineType !== 'tree_climb' && (q.swingAmp ?? 0) > 0) as Vine;
  assert.ok(v, `${id} has a swinging liana`);
  v.snake = { ...sn, clock: 'snake' };
  r.stage.clocks = [...(r.stage.clocks ?? []), beatDef('snake', 8, 0.6, 4)];
  e.clock = beatClock(r.stage.clocks, easy, 0);
  e.startPieces();
  let hearts = 0;
  const dmg = e.damagePlayer.bind(e);
  e.damagePlayer = (n: number, x?: number) => ((hearts += n), dmg(n, x));
  return { r, e, v, hearts: () => hearts, piece: () => e.pieces.find((p) => p.kind === 'vine-snake') as (StagePiece & { letGos: number }) | undefined };
}

for (const id of ['6-3', '2-4']) {
  test(`${id}, the real engine: a snake coming down his liana makes him let go when it reaches his hands (a hop, no heart), never in its tell, and he cannot catch that liana again in the air`, () => {
    const { r, e, v, hearts, piece } = snaked(id, { route: 'down-off' });
    assert.ok(piece(), 'the piece started from the liana\'s data');
    const len = v.bottomY - v.topY;
    r.swing(v, { angle: 0.1, omega: 0.3, len: 300 });
    const hands = handsAlong(300, len);
    let goneAt = -1;
    let tellFrames = 0;
    let hopVy = 0;
    let recaught = false;
    for (let i = 0; i < 30 * 8; i++) {
      const read = e.clock.read('snake');
      const was = r.p.isVineSwinging;
      r.frame();
      if (read.phase === 'warn') {
        tellFrames++;
        assert.ok(r.p.isVineSwinging, `${id}: let go in the snake's tell (frame ${i})`);
      }
      if (read.phase === 'off') assert.ok(r.p.isVineSwinging || goneAt >= 0, `${id}: let go with no snake there (frame ${i})`);
      if (was && !r.p.isVineSwinging && goneAt < 0) {
        goneAt = i;
        hopVy = r.p.vy;
        // (where the snake was on the step he let go: the piece's own read of the clock that step)
        const n = (piece() as unknown as { now: ReturnType<typeof snakeNow>[] }).now[0];
        assert.ok(n.live, 'only while it travels');
        assert.ok(n.head >= hands - SNAKE.touch - 1, `${id}: let go before it reached his hands (head ${n.head.toFixed(0)}, hands ${hands.toFixed(0)})`);
        assert.ok(n.head <= hands + 40, `${id}: it passed his hands before he let go (head ${n.head.toFixed(0)}, hands ${hands.toFixed(0)})`);
      }
      if (goneAt >= 0 && !r.p.grounded && r.p.isVineSwinging && r.p.swingVineId === v.id) recaught = true;
      if (goneAt >= 0 && r.p.grounded) break;
    }
    assert.ok(tellFrames >= 17, `${id}: the tell ran (${tellFrames} frames at 30 fps)`);
    assert.ok(goneAt >= 0, `${id}: he never let go`);
    assert.ok(hopVy < 0 && hopVy > LET_GO.hop - 120, `${id}: a hop up, not a fall or a leap (vy ${hopVy.toFixed(0)})`);
    assert.equal(recaught, false, `${id}: he caught the same liana again in the air`);
    assert.equal(hearts(), 0, `${id}: it cost a heart`);
    assert.equal(piece()!.letGos, 1);
  });

  test(`${id}, the real engine: a snake that turns a body above his hands never touches him; one rising from the foot takes a low hold and leaves a high one`, () => {
    {
      const { r, e, v } = snaked(id, { route: 'down-back', reach: 0.4 });
      const len = v.bottomY - v.topY;
      r.swing(v, { angle: 0.1, omega: 0.3, len: len - 12 });
      assert.ok(handsAlong(len - 12, len) > 0.4 * len + SNAKE.touch, 'the hold is below its turn');
      let saw = 0;
      for (let i = 0; i < 30 * 8; i++) {
        if (e.clock.read('snake').phase === 'on') saw++;
        r.frame();
        assert.ok(r.p.isVineSwinging, `${id}: let go of a hold below the snake's turn (frame ${i})`);
      }
      assert.ok(saw > 100, 'the snake made its whole trip');
    }
    for (const [len0, takes] of [[0, true], [1, false]] as const) {
      const { r, v, piece } = snaked(id, { route: 'up', reach: 0.5 });
      const len = v.bottomY - v.topY;
      // (low: his hands near the foot; high: his hands near the anchor, above where it stops)
      const hold = len0 === 0 ? len - 12 : 120;
      r.swing(v, { angle: 0.1, omega: 0.3, len: hold });
      let left = false;
      for (let i = 0; i < 30 * 8 && !left; i++) {
        r.frame();
        left = !r.p.isVineSwinging;
      }
      assert.equal(left, takes, `${id}: a rising snake ${takes ? 'did not take' : 'took'} a ${len0 === 0 ? 'low' : 'high'} hold`);
      assert.equal(piece()!.letGos, takes ? 1 : 0);
    }
  });
}

test('the host\'s letGo: nothing when he swings on nothing; off the liana with a hop, his jumps his own again, and that liana not caught until he is down', () => {
  const r = new RealPlay('6-3', 1);
  const e = r.e as unknown as Eng & { swungOff: number };
  r.stand(r.stage.spawnX, r.stage.spawnY);
  assert.equal(e.pieceHost.letGo(), false);
  const v = r.stage.vines.find((q) => q.vineType !== 'tree_climb') as Vine;
  r.swing(v, { angle: 0.3, omega: 0.8, len: 300 });
  r.frame();
  const vx = r.p.vx;
  assert.equal(e.pieceHost.letGo(), true);
  assert.equal(r.p.isVineSwinging, false);
  assert.equal(r.p.vy, LET_GO.hop);
  assert.ok(Math.abs(r.p.vx - vx * LET_GO.keep) < 1e-9);
  assert.equal(r.p.jumpsLeft, 2);
  assert.equal(e.swungOff, v.id);
  assert.equal(e.pieceHost.letGo(), false, 'twice is nothing');
});

test('the vine snake is a registered piece, and a stage with no snake starts none', () => {
  assert.ok(PIECE_KINDS.includes(VINE_SNAKE_PIECE));
  const r = new RealPlay('6-3', 1);
  assert.equal((r.e as unknown as Eng).pieces.filter((p) => p.kind === 'vine-snake').length, 0);
});

for (const id of ['6-3', '2-4']) {
  test(`${id}, the real engine: a FALSE liana (the snake hanging still) startles when he takes it: he hops off, it is not there to catch again, it drops onto the floor below, slithers off away from him and is gone; whole again when he respawns`, () => {
    const r = new RealPlay(id, 1);
    const e = r.e as unknown as Eng & { respawnAtCheckpoint(reason: 'pit', take?: boolean): void };
    const v = r.stage.vines.find((q) => q.vineType !== 'tree_climb') as Vine;
    v.swingAmp = 0;
    v.snake = { route: 'still' };
    const len = v.bottomY - v.topY;
    // (1-6's moss under it: a floor 140 px under its foot; anything else between is taken out)
    const moss = { id: 99998, x: v.x - 300, y: v.bottomY + 140, width: 600, height: 200, type: 'solid' } as const;
    e.pieces = [];
    r.bare([moss as never], [v]);
    r.stage.vines = [v];
    e.startPieces();
    const piece = e.pieces.find((q) => q.kind === 'vine-snake') as unknown as { startled: Array<{ x: number; y: number; floor: number | null; t: number; away: number } | null>; letGos: number };
    assert.ok(piece, 'the piece started from the false liana');
    assert.equal(r.vines[0].swingAngle ?? 0, 0);
    r.swing(v, { angle: 0, omega: 0, len: 200 });
    r.p.x = v.x - 4;
    r.frame();
    assert.equal(r.p.isVineSwinging, false, `${id}: he still holds the false liana`);
    assert.ok(r.p.vy < 0, 'a hop');
    assert.equal(v.off, true, 'it is not there to catch');
    assert.equal(piece.letGos, 1);
    const st = piece.startled[0]!;
    assert.ok(st && st.away === 1, 'it goes away from him (he took it from its left)');
    // (it falls with him and lands on the moss; meanwhile he can never catch it again, even jumping at it from the moss)
    let landed = -1;
    for (let i = 0; i < 90; i++) {
      r.frame();
      assert.ok(!(r.p.isVineSwinging && r.p.swingVineId === v.id), `${id}: caught the startled false liana (frame ${i})`);
      if (landed < 0 && st.floor !== null) landed = i;
    }
    assert.ok(landed >= 0 && landed < 30, `${id}: it landed on the moss (frame ${landed})`);
    assert.equal(st.floor, moss.y);
    assert.ok(st.x > v.x + 50, `${id}: it slithered off (${Math.round(st.x - v.x)} px)`);
    assert.ok(st.t >= FALSE_LIANA.slither, 'and is gone');
    r.stand(v.x, moss.y);
    r.frame();
    r.fly(v.x, v.topY + len / 2, 0, -50);
    for (let i = 0; i < 10; i++) {
      r.frame({ up: true });
      assert.ok(!r.p.isVineSwinging, `${id}: caught a false liana that is gone`);
    }
    // (he respawns: it hangs again, and can be taken again)
    e.respawnAtCheckpoint('pit');
    assert.equal(v.off, false);
    assert.equal(piece.startled[0], null);
  });
}
