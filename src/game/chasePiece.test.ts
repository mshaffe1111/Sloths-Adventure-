/**
 * The laid chase on the piece hook (pieces/chasePiece.ts; chase.ts ChaseLay; ENGINE-678 B1), through the real engine (RealPlay) on two
 * worlds' stages, both settings: a runner in stride is never caught and the branch falls behind him stretch by stretch; the front stops
 * at each living fork and never catches him there; one who stops is caught within the row's stop budget and goes back to his flag a
 * heart down (not a life) with the branch whole from there; a fall off the branch is the same; Easy's front never runs over 200 px/s.
 * And the hook's `toFlag` hurt, for any piece: a heart and back to the flag, every piece put back.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { setDifficulty } from './difficulty.ts';
import { PIECE_KINDS } from './pieces/index.ts';
import { CHASE_PIECE } from './pieces/chasePiece.ts';
import { CHASE_ROWS, type ChaseLay, type ChaseRun } from './chase.ts';
import type { PieceHost, PieceKind, PieceLayer, StagePiece } from './stagePiece.types.ts';
import type { Platform } from './types.ts';

type Eng = {
  pieces: StagePiece[];
  checkpoint: { x: number; y: number };
  respawnAtCheckpoint(reason: 'pit', take?: boolean): void;
  chase: unknown;
  easy: boolean;
};
const DT = 1 / 30;
const Y = 600;

/** a test branch: a run-up, a stretch, a living fork, the last stretch, a far fork. Sections of 200 px (the lay's, not the engine's) */
function branch(): { plats: Platform[]; lay: ChaseLay; forks: Platform[] } {
  const plats: Platform[] = [];
  let id = 1;
  const solid = (x0: number, x1: number, chase: boolean) => {
    for (let x = x0; x < x1; x += 200) plats.push({ id: id++, x, y: Y, width: Math.min(200, x1 - x), height: 40, type: 'solid', ...(chase ? { chase: true } : {}) });
  };
  solid(0, 600, false);
  solid(600, 4000, true);
  const fork1 = { id: id++, x: 4000, y: Y, width: 400, height: 40, type: 'solid' } as Platform;
  plats.push(fork1);
  solid(4400, 7400, true);
  const fork2 = { id: id++, x: 7400, y: Y, width: 600, height: 40, type: 'solid' } as Platform;
  plats.push(fork2);
  return { plats, lay: { stretches: [{ start: 1000, end: 4000 }, { start: 4400, end: 7400, last: true }] }, forks: [fork1, fork2] };
}

/** a RealPlay on this stage and setting, swapped for the test branch with its chase laid, his flag at `flagX` */
function onBranch(id: string, easy: boolean, flagX = 300) {
  setDifficulty(easy ? 'easy' : 'normal');
  try {
    const r = new RealPlay(id, 1);
    const e = r.e as unknown as Eng;
    const b = branch();
    r.stage.chase = b.lay;
    r.bare(b.plats);
    e.checkpoint = { x: flagX, y: Y };
    r.safe = false;
    const piece = e.pieces.find((pc) => pc.kind === CHASE_PIECE.id);
    assert.ok(piece, 'the lay starts one chase piece');
    return { r, e, b, piece: piece as StagePiece & { run: ChaseRun } };
  } finally {
    setDifficulty('normal');
  }
}

for (const id of ['1-2', '2-1']) {
  for (const easy of [false, true]) {
    const set = easy ? 'Easy' : 'Normal';
    test(`chase piece ${id} ${set}: in stride he is never caught; the branch falls behind him; each front stops at its fork, which stays whole`, () => {
      const { r, e, b, piece } = onBranch(id, easy);
      assert.equal(e.easy, easy, `the engine runs ${set}`);
      assert.equal(piece.run.row, easy ? CHASE_ROWS.easy : CHASE_ROWS.normal, `the ${set} row`);
      r.stand(400, Y);
      const hp = r.p.hp;
      let last = r.p.x;
      let fastest = 0;
      for (let i = 0; i < 30 * 45 && r.p.x < 7600; i++) {
        const before = piece.run.fronts.map((f) => (f.active ? f.front : NaN));
        r.frame({ right: true });
        assert.ok(r.p.x >= last - 1, `never sent back (at ${r.p.x.toFixed(0)})`);
        last = r.p.x;
        // (a front's move this step, from a step it was already running)
        piece.run.fronts.forEach((f, k) => (fastest = Number.isNaN(before[k]) ? fastest : Math.max(fastest, (f.front - before[k]) / DT)));
      }
      assert.ok(r.p.x >= 7600, `he ran the branch to the far fork (x ${r.p.x.toFixed(0)})`);
      assert.equal(r.p.hp, hp, 'never caught: no heart lost');
      assert.equal(r.died, false);
      // (both stretches fell behind him to their forks; the forks are whole)
      for (const pl of b.plats.filter((q) => q.chase && q.x + q.width <= 3900)) assert.equal(pl.broken, true, `section at ${pl.x} fell`);
      for (const f of b.forks) assert.ok(!f.broken, 'a living fork never falls');
      piece.run.fronts.forEach((f, k) => assert.ok(f.front <= b.lay.stretches[k].end, 'no front past its fork'));
      // (Easy's row, measured in play: never over 200 px/s nor his run; Normal's finale is the only front faster than his run)
      if (easy) assert.ok(fastest <= 200 + 1e-6, `Easy front at most 200 px/s (fastest ${fastest.toFixed(1)})`);
    });

    test(`chase piece ${id} ${set}: he stops on a stretch: caught within the stop budget, a heart (not a life), back at his flag, the branch whole`, () => {
      const { r, e, b, piece } = onBranch(id, easy);
      r.stand(b.lay.stretches[0].start + 10, Y);
      const hp = r.p.hp;
      let t = 0;
      while (r.p.hp === hp && t < 10) (r.frame(), (t += DT));
      // (the front sets off `behind` back of the crack's start, chase.ts stepChase: he stands 10 px past it; it moves from the next step)
      const row = piece.run.row;
      const budget = (10 + row.behind - row.catchAt) / row.base + DT;
      assert.ok(Math.abs(t - budget) < 2 * DT, `caught after ${t.toFixed(2)} s; the ${set} budget is ${budget.toFixed(2)} s`);
      assert.equal(r.p.hp, hp - 1, 'a heart');
      assert.equal(r.died, false, 'not a life');
      assert.ok(Math.abs(r.p.x - e.checkpoint.x) < 40, `back at his flag (x ${r.p.x.toFixed(0)})`);
      assert.ok(b.plats.every((pl) => !pl.broken), 'the branch whole again from his flag');
      assert.equal(piece.run.fronts[0].active, false, 'the collapse waits for him to pass its crack again (his flag is before it)');
    });

    test(`chase piece ${id} ${set}: still on a living fork for 20 s he is never caught, even at its very edge; a fall off the branch is a heart and the flag`, () => {
      const { r, b, piece } = onBranch(id, easy, 4200);
      r.stand(4004, Y);
      const hp = r.p.hp;
      r.wait(20);
      assert.equal(r.p.hp, hp, 'never caught on the fork');
      assert.equal(piece.run.fronts[0].front, b.lay.stretches[0].end, 'the front rests at the fork');
      // (off the branch: under it by the off line, over a stretch)
      r.fly(2000, Y + 320, 0, 0, 0);
      r.frame();
      assert.equal(r.p.hp, hp - 1, 'a heart');
      assert.equal(r.died, false, 'not a life');
      assert.ok(Math.abs(r.p.x - 4200) < 40, 'back at his flag on the fork');
      assert.ok(b.plats.filter((pl) => pl.x >= 4000).every((pl) => !pl.broken), 'ahead of the fork whole');
    });
  }
}

test('chase piece: a stage that lays no chase starts none; the hand-built 1-8 keeps its own collapse (proto.chase) and starts none', () => {
  const plain = new RealPlay('1-2', 1);
  assert.ok(!(plain.e as unknown as Eng).pieces.some((pc) => pc.kind === CHASE_PIECE.id));
  const old = new RealPlay('1-8', 1);
  const e = old.e as unknown as Eng;
  assert.ok(e.chase, "1-8's old collapse runs (engine.ts)");
  assert.ok(!e.pieces.some((pc) => pc.kind === CHASE_PIECE.id), 'and no chase piece beside it');
});

test('chase piece: a lay that cannot run is refused by name, never run', () => {
  const r = new RealPlay('1-2', 1);
  const e = r.e as unknown as Eng;
  const b = branch();
  r.stage.chase = { stretches: [{ start: 1000, end: 4000 }, { start: 3000, end: 5000 }] };
  const err = console.error;
  const said: string[] = [];
  console.error = (m: string) => said.push(m);
  try {
    r.bare(b.plats);
  } finally {
    console.error = err;
  }
  assert.ok(!e.pieces.some((pc) => pc.kind === CHASE_PIECE.id));
  assert.match(said.join(' '), /chase lay refused: stretch 1/);
});

/** a planted piece that asks for a heart and the flag once, at a set step, and notes its respawns */
class FlagProbe implements StagePiece {
  readonly kind = 'flag-probe';
  readonly layers: readonly PieceLayer[] = [];
  steps = 0;
  respawns = 0;
  at = -1;
  step() {
    this.steps++;
  }
  respawn() {
    this.respawns++;
  }
  hurts(host: PieceHost) {
    return this.steps === this.at ? { amount: 1, fromX: host.player.x + 40, toFlag: true } : null;
  }
}

for (const id of ['1-2', '3-3']) {
  test(`piece hook on ${id}: a piece's toFlag hurt is a heart and back to his flag (no knock, safe time or not), every piece put back`, () => {
    let probe: FlagProbe | null = null;
    const kind: PieceKind = { id: 'flag-probe', start: () => (probe = new FlagProbe()) };
    PIECE_KINDS.push(kind);
    let r: RealPlay;
    try {
      r = new RealPlay(id, 1);
    } finally {
      PIECE_KINDS.splice(PIECE_KINDS.indexOf(kind), 1);
    }
    const e = r.e as unknown as Eng;
    const p = probe!;
    for (let i = 0; i < 5; i++) r.frame();
    const flag = { x: r.p.x, y: r.p.y };
    e.checkpoint = flag;
    for (let i = 0; i < 20; i++) r.frame({ right: true });
    assert.ok(r.p.x - flag.x > 30, 'he walked off his flag');
    // (his safe time does not hold it off: a catch is a catch, as the hand-built chase's is)
    r.safe = true;
    const hp = r.p.hp;
    const respawns = p.respawns;
    p.at = p.steps + 1;
    r.frame();
    assert.equal(r.p.hp, hp - 1, 'a heart');
    assert.equal(r.died, false, 'not a life');
    assert.ok(Math.abs(r.p.x - flag.x) < 2 && Math.abs(r.p.y - flag.y) < 60, `back at his flag (${r.p.x.toFixed(0)}, ${r.p.y.toFixed(0)})`);
    assert.equal(p.respawns, respawns + 1, 'the piece was put back by its respawn');
  });
}
