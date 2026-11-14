/**
 * The piece hook (stagePiece.types.ts, pieces/index.ts; ENGINE-678 W0 HOOKS): a runtime piece registered in PIECE_KINDS is run by the
 * real engine through its ONE loop, on any stage, with no line of engine.ts written for it: started at the stage's start, stepped every
 * fixed step, drawn only on the layers it names and in the frame's order, put back on a respawn, and its hurt dealt through the one
 * damagePlayer. Then RIDE (t-pieces), the first real piece moved onto the hook: a ride carries him on its beat, and the old
 * moving-platform loop leaves its platform be.
 */
import { RealPlay } from './realPlay.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PIECE_KINDS, drawPieces } from './pieces/index.ts';
import { RIDE_PIECE } from './pieces/ridePiece.ts';
import { beatClock } from './beat.ts';
import { rideClock } from './gen2/rideLay.ts';
import { rideAt, sideToSide } from './ride.ts';
import { PIECE_LAYERS, type PieceHost, type PieceKind, type PieceLayer, type StagePiece } from './stagePiece.types.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import type { Platform } from './types.ts';

/** a planted piece that notes every call the hook makes of it, and hurts him once at a set step */
class Probe implements StagePiece {
  readonly kind = 'probe';
  readonly layers: readonly PieceLayer[] = ['world', 'screen'];
  steps = 0;
  respawns = 0;
  drawn: PieceLayer[] = [];
  hurtAt = -1;
  hurtsAsked = 0;
  step() {
    this.steps++;
  }
  draw(_ctx: CanvasRenderingContext2D, layer: PieceLayer) {
    this.drawn.push(layer);
  }
  respawn() {
    this.respawns++;
  }
  hurts(host: PieceHost) {
    this.hurtsAsked++;
    return this.steps === this.hurtAt ? { amount: 1, fromX: host.player.x + 40 } : null;
  }
}

/** run fn with a planted kind registered after the real ones, and always take it out again */
function withKind<T>(kind: PieceKind, fn: () => T): T {
  PIECE_KINDS.push(kind);
  try {
    return fn();
  } finally {
    PIECE_KINDS.splice(PIECE_KINDS.indexOf(kind), 1);
  }
}

type Eng = {
  pieces: StagePiece[];
  startPieces(): void;
  respawnAtCheckpoint(reason: 'pit', take?: boolean): void;
  clock: ReturnType<typeof beatClock>;
};

for (const id of ['1-2', '2-1', '3-3']) {
  test(`piece hook on ${id}: a registered piece starts, steps, hurts and respawns through the engine's one loop`, () => {
    const started: GeneratedStage[] = [];
    let probe: Probe | null = null;
    const kind: PieceKind = { id: 'probe', start: (stage) => (started.push(stage), (probe = new Probe())) };
    const r = withKind(kind, () => new RealPlay(id, 1));
    const e = r.e as unknown as Eng;
    // (started once, at the stage's start, with the stage the engine plays)
    assert.equal(started.length, 1, 'the kind is asked to start once at the stage start');
    assert.equal(started[0], r.stage);
    assert.ok(e.pieces.includes(probe!), "the started piece is on the engine's list");
    const p = probe!;
    // (stepped once each fixed step)
    for (let i = 0; i < 10; i++) r.frame();
    assert.equal(p.steps, 10, 'stepped once a step');
    assert.equal(p.hurtsAsked, 10, 'asked whether it hurts once a step');
    // (its hurt goes through the one damagePlayer: a heart and his safe time; then the safe time holds the next)
    r.safe = false;
    r.p.invincibleTimer = 0;
    const hp = r.p.hp;
    p.hurtAt = p.steps + 1;
    r.frame();
    assert.equal(r.p.hp, hp - 1, 'its hurt took one heart');
    assert.ok(r.p.invincibleTimer > 0, 'and gave him the safe time damagePlayer gives');
    assert.ok(r.p.vx < 0, 'knocked away from the piece (it hurt from his right)');
    // (put back on a respawn)
    e.respawnAtCheckpoint('pit', false);
    assert.equal(p.respawns, 1, 'respawn reached it');
  });
}

test("piece hook: render() draws every layer once, in the frame's order: 'world' behind him, 'front' over him, 'screen' after the world", () => {
  // (the headless canvas steps the engine but cannot paint its scenery, so the call sites are pinned in render()'s own text)
  const src = readFileSync(new URL('./engine.ts', import.meta.url), 'utf8');
  const body = src.slice(src.indexOf('  public render() {'), src.indexOf('\n  }\n', src.indexOf('  public render() {')));
  const at = (needle: string) => {
    const i = body.indexOf(needle);
    assert.ok(i >= 0 && body.indexOf(needle, i + 1) < 0, `render() has "${needle}" exactly once`);
    return i;
  };
  const layer = Object.fromEntries(PIECE_LAYERS.map((l) => [l, at(`drawPieces(this.pieces, ctx, '${l}', this.pieceHost)`)]));
  const traps = at('drawTraps(ctx, this.cast.traps');
  const hero = body.lastIndexOf('drawHeroSloth(');
  const bushes = at('this.drawBushes(ctx)');
  const worldEnd = at('ctx.restore(); // end world transform');
  assert.ok(traps < layer.world && layer.world < hero, "'world' is after the platforms and traps, before he is drawn");
  assert.ok(hero < bushes && bushes < layer.front && layer.front < worldEnd, "'front' is over him, with the bushes, inside the world");
  assert.ok(worldEnd < layer.screen, "'screen' is after the world transform ends");
  assert.equal(src.split('drawPieces(').length - 1, PIECE_LAYERS.length, 'no other drawPieces call: one per layer');
});

test('piece hook: the registry asks a piece to draw only on the layers it names', () => {
  const p = new Probe();
  const host = {} as PieceHost;
  for (const layer of ['world', 'front', 'screen'] as const) drawPieces([p], {} as CanvasRenderingContext2D, layer, host);
  assert.deepEqual(p.drawn, ['world', 'screen']);
});

test('piece hook: a stage that lays none of a kind starts none of it (no ride, no ride piece)', () => {
  const r = new RealPlay('1-2', 1);
  const e = r.e as unknown as Eng;
  assert.ok(!r.platforms.some((pl) => pl.ride), '1-2 lays no ride');
  assert.ok(!e.pieces.some((pc) => pc.kind === RIDE_PIECE.id));
});

for (const id of ['1-2', '2-1']) {
  test(`RIDE on the hook (${id}): a ride keeps its beat, carries him, and the old moving-platform loop leaves it be`, () => {
    const r = new RealPlay(id, 1);
    const e = r.e as unknown as Eng;
    const ground: Platform = { id: 1, x: 0, y: 600, width: 400, height: 40, type: 'solid' };
    const path = sideToSide(700, 600, 150);
    const log: Platform = { id: 2, x: path[0].x, y: 600, width: 120, height: 24, type: 'moving', ride: { clock: 'river', path, w: 120 }, moveRange: 999, moveSpeed: 9 };
    r.bare([ground, log]);
    e.clock = beatClock([rideClock('river', { period: 4, tell: 1, on: 2 })], false, 0);
    e.startPieces();
    assert.deepEqual(e.pieces.map((pc) => pc.kind), ['ride'], 'one ride piece, started from the platforms');
    r.stand(log.x + 60, log.y);
    r.frame();
    assert.equal(r.standingOn, log.id, 'he stands on the ride');
    let carried = 0;
    for (let i = 0; i < 90; i++) {
      const x0 = r.p.x, lx0 = log.x;
      r.frame();
      const at = rideAt(log.ride!, e.clock.read('river'));
      // (where its beat puts it, exactly: the sine mover's moveRange/moveSpeed would put it anywhere else)
      assert.equal(log.x, at.x, `frame ${i}: the ride is where its beat puts it`);
      if (log.x !== lx0 && r.standingOn === log.id) {
        assert.ok(Math.abs(r.p.x - x0 - (log.x - lx0)) < 1e-9, `frame ${i}: he rode the log's move`);
        carried++;
      }
    }
    assert.ok(carried > 10, `carried on ${carried} frames`);
    // (a respawn puts the ride where its beat says now)
    log.x = -5000;
    e.respawnAtCheckpoint('pit', false);
    assert.equal(log.x, rideAt(log.ride!, e.clock.read('river')).x, 'respawn put the ride back on its beat');
  });
}
