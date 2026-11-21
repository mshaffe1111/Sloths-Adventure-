// The pacer passes BEHIND the banks (the lead's ruling (a), 11-21; ENG-27d): 2-7's mail boat is drawn behind the ground's earth (layer
// 'under', drawn before the bank's face), shows only over the race leg's water with its waterline on THAT river's surface, and is out of
// sight over every bank, swept along the whole leg of the out-and-back toy (gen2/toyHome.ts), both ways a leg can run.
// Planted (ENG-27d): with the boat on 'back' (over the earth, as ENG-27c drew it) test 1 went RED; with the clip to the water removed
// (drawn whole on the lane) tests 2 and 3 went RED.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import './headlessDom.ts';
import { buildGen2Stage } from './gen2/pipeline.ts';
import { towerCfg } from './gen2/toyTower.ts';
import { HOME_CODE, POST_CODE, homeKit } from './gen2/toyHome.ts';
import { PACER_PIECE, PacerPiece } from './pieces/pacerPiece.ts';
import { drawPieces } from './pieces/index.ts';
import { PACER_WATERLINE } from './pacerDraw.ts';
import { w2NextReady } from './w2NextArt.ts';
import { pacerX, type Pacer } from './pacer.ts';
import { PIECE_LAYERS, type PieceHost } from './stagePiece.types.ts';
import type { Platform } from './types.ts';

const ID = '2-97';
const build = (seed: number, code = HOME_CODE, difficulty: 'normal' | 'easy' = 'normal') =>
  buildGen2Stage({ config: { ...towerCfg(ID, 'sprint'), unlocked: true }, kit: homeKit(ID, code), seed, difficulty });

// (a picture that loads at once: the boat's sheet in, as on the page once stagePreload has it)
const G = globalThis as unknown as Record<string, unknown>;
G.Image ??= class {
  onload: (() => void) | null = null;
  width = 2313;
  height = 357;
  naturalWidth = 2313;
  naturalHeight = 357;
  complete = true;
  set src(_u: string) { setTimeout(() => this.onload?.(), 0); }
  decode() { return Promise.resolve(); }
};
async function sheetIn() {
  for (let i = 0; i < 50 && !w2NextReady(); i++) await new Promise((r) => setTimeout(r, 2));
  assert.ok(w2NextReady(), 'the boat sheet is in');
}

/** a 2D context that records every picture drawn into it (its box in world px) and the clip in force when it was drawn */
function recorder() {
  type Box = { x0: number; x1: number; y0: number; y1: number };
  const draws: Array<{ box: Box; clip: Box | null; mark?: string }> = [];
  let m = { a: 1, d: 1, e: 0, f: 0 };
  let clip: Box | null = null, path: Box | null = null;
  const stack: Array<{ m: typeof m; clip: Box | null }> = [];
  const g: Record<string, unknown> = {
    save: () => void stack.push({ m: { ...m }, clip }),
    restore: () => void ({ m, clip } = stack.pop() ?? { m, clip }),
    translate: (x: number, y: number) => void (m = { ...m, e: m.e + m.a * x, f: m.f + m.d * y }),
    scale: (x: number, y: number) => void (m = { ...m, a: m.a * x, d: m.d * y }),
    beginPath: () => void (path = null),
    rect: (x: number, y: number, w: number, h: number) => void (path = { x0: x, x1: x + w, y0: y, y1: y + h }),
    clip: () => void (clip = path && clip ? { x0: Math.max(clip.x0, path.x0), x1: Math.min(clip.x1, path.x1), y0: Math.max(clip.y0, path.y0), y1: Math.min(clip.y1, path.y1) } : path ?? clip),
    drawImage: (_src: unknown, ...a: number[]) => {
      const [dx, dy, dw, dh] = a.length >= 8 ? a.slice(4) : a;
      const xa = m.e + m.a * dx, xb = m.e + m.a * (dx + dw);
      draws.push({ box: { x0: Math.min(xa, xb), x1: Math.max(xa, xb), y0: m.f + m.d * dy, y1: m.f + m.d * (dy + dh) }, clip });
    },
  };
  const ctx = new Proxy(g, { get: (t, k) => (k in t ? t[k as string] : () => {}), set: (t, k, v) => ((t[k as string] = v), true) }) as unknown as CanvasRenderingContext2D;
  return { ctx, draws, mark: (name: string) => draws.push({ box: { x0: 0, x1: 0, y0: 0, y1: 0 }, clip: null, mark: name }) };
}

/** what of the boat shows: each draw's box cut by its clip (x only: its height is the frame's) */
const shown = (d: { box: { x0: number; x1: number }; clip: { x0: number; x1: number } | null }) =>
  d.clip ? { x0: Math.max(d.box.x0, d.clip.x0), x1: Math.min(d.box.x1, d.clip.x1) } : { x0: d.box.x0, x1: d.box.x1 };

/** the banks that stand over the boat's lane on its leg: earth whose top is above the lane and reaches down past it */
const banksOver = (P: Pacer, plats: readonly Platform[]) => {
  const lo = Math.min(P.x0, P.x1), hi = Math.max(P.x0, P.x1);
  return plats.filter((q) => q.type !== 'drift' && !q.broken && q.x + q.width > lo && q.x < hi && q.y < P.lane && q.y + q.height >= P.lane);
};

const view = (x: number) => ({ x: x - 600, y: 0, w: 1200, h: 900, zoom: 1 });
const hostAt = (x: number) => ({ view: view(x) }) as unknown as PieceHost;
/** the boat put at `x` on its leg (its clock set so it is there) */
const put = (piece: PacerPiece, x: number) => {
  const P = piece.pacer;
  piece.clock = Math.max(0.01, ((x - P.x0) / (P.x1 - P.x0)) * P.seconds);
  assert.ok(Math.abs(pacerX(P, piece.clock) - x) < 0.5);
};

test("pacer behind the banks 1: drawn BEFORE the bank's face, where a bank stands over its lane (layer 'under', before the ground in the engine's frame)", async () => {
  await sheetIn();
  const st = build(1);
  const P = st.pacer!;
  const piece = PACER_PIECE.start(st as never, {} as PieceHost) as PacerPiece;
  // (a bank between two of the leg's rivers, its near edge (the way the boat runs) on the leg)
  const edgeOf = (b: Platform) => (P.dir < 0 ? b.x + b.width : b.x);
  const bank = banksOver(P, st.platforms).filter((b) => piece.waters.some((w) => Math.abs(w.x0 - edgeOf(b)) < 1 || Math.abs(w.x1 - edgeOf(b)) < 1)).sort((a, b) => b.width - a.width)[0];
  assert.ok(bank, 'a bank stands over the lane on the race leg beside a river (the ruling\'s case)');
  // (the boat at the bank's edge, half over the river beside it: the bank's face stands over its lane there)
  const edge = edgeOf(bank);
  put(piece, edge);
  // (the engine's frame, layer by layer in its order, the painted ground (its earth: the bank's face) where engine.ts draws it)
  const { ctx, draws, mark } = recorder();
  for (const layer of PIECE_LAYERS) {
    if (layer === 'back') mark('ground');
    drawPieces([piece], ctx, layer, hostAt(edge));
  }
  const boat = draws.findIndex((d) => !d.mark);
  const ground = draws.findIndex((d) => d.mark === 'ground');
  assert.ok(boat >= 0, 'the boat is drawn at the bank\'s edge (its water half)');
  assert.ok(boat < ground, `the boat is drawn before the bank's face (draw ${boat}, the ground ${ground}): behind the earth, never in it`);
  // (and the engine's frame is so: 'under' before the platforms and before the painted ground; 'back' over the painted earth)
  const src = readFileSync(new URL('./engine.ts', import.meta.url), 'utf8');
  const body = src.slice(src.indexOf('  public render() {'));
  const under = body.indexOf("drawPieces(this.pieces, ctx, 'under', this.pieceHost)");
  assert.ok(under > 0, "render() draws layer 'under'");
  assert.ok(under < body.indexOf('else renderWorldObjects(') && under < body.indexOf('drawProtoScene(ctx, this.platforms'), "'under' before the platforms and the painted ground");
  assert.ok(under < body.indexOf('this.drawRivers(ctx, world, true)') && under > body.indexOf('this.drawRivers(ctx, world, false)'), "'under' over the water's body, under its sheet");
});

for (const [name, code] of [['HOME_CODE', HOME_CODE], ['POST_CODE', POST_CODE]] as const) {
  test(`pacer behind the banks 2 (${name}): swept along its whole leg, nothing of it shows over a bank that stands over its lane; over a river it shows, its waterline on THAT river's surface`, async () => {
    await sheetIn();
    for (const seed of [1, 2, 3]) {
      const st = build(seed, code);
      const P = st.pacer!;
      const piece = PACER_PIECE.start(st as never, {} as PieceHost) as PacerPiece;
      const banks = banksOver(P, st.platforms);
      assert.ok(banks.length >= 3, `seed ${seed}: banks over the lane`);
      const rivers = piece.waters;
      assert.ok(rivers.length >= 3, `seed ${seed}: the leg's rivers`);
      let onWater = 0;
      const lo = Math.min(P.x0, P.x1), hi = Math.max(P.x0, P.x1);
      for (let x = lo + 1; x < hi; x += 15) {
        put(piece, x);
        const { ctx, draws } = recorder();
        drawPieces([piece], ctx, 'under', hostAt(x));
        for (const d of draws) {
          const s = shown(d);
          if (s.x1 - s.x0 < 0.5) continue;
          for (const b of banks) {
            const over = Math.min(s.x1, b.x + b.width) - Math.max(s.x0, b.x);
            assert.ok(over <= 0.5, `seed ${seed} boat at ${x}: ${Math.round(over)} px of it over the bank ${Math.round(b.x)}-${Math.round(b.x + b.width)} (top ${b.y}, lane ${P.lane}): floating over the land`);
          }
          // (each part shown sits on the river it is over: its waterline on that river's surface)
          const r = rivers.find((w) => s.x0 >= w.x0 - 0.5 && s.x1 <= w.x1 + 0.5);
          assert.ok(r, `seed ${seed} boat at ${x}: a part shown (${Math.round(s.x0)}-${Math.round(s.x1)}) over no one river's water`);
          const waterline = d.box.y0 + (d.box.y1 - d.box.y0) * PACER_WATERLINE;
          assert.ok(Math.abs(waterline - r.surfaceY) < 0.5, `seed ${seed} boat at ${x}: waterline ${Math.round(waterline)} on a river at ${r.surfaceY} (sunk or floating)`);
          onWater++;
        }
        // (its middle over a river's water, wider than the boat: it shows there, whole)
        const mid = rivers.find((w) => x - 125 > w.x0 && x + 125 < w.x1);
        if (mid) assert.ok(draws.length === 1 && shown(draws[0]).x1 - shown(draws[0]).x0 > 230, `seed ${seed} boat at ${x}: whole over the river ${Math.round(mid.x0)}-${Math.round(mid.x1)}`);
      }
      assert.ok(onWater > 20, `seed ${seed}: seen on the water along the leg (${onWater} draws)`);
    }
  });
}

test('pacer behind the banks 3: the leg\'s rivers stand at different heights, and it rides each one\'s own surface (never the lowest everywhere)', async () => {
  await sheetIn();
  // (seed 3: the race leg's rivers stand from 1427 to 1507; the lane is the lowest)
  const st = build(3);
  const P = st.pacer!;
  const piece = PACER_PIECE.start(st as never, {} as PieceHost) as PacerPiece;
  const heights = [...new Set(piece.waters.map((w) => w.surfaceY))];
  assert.ok(heights.length >= 3 && Math.max(...heights) - Math.min(...heights) >= 40, `the rivers stand apart: ${heights.join(', ')}`);
  const high = piece.waters.filter((w) => w.surfaceY <= P.lane - 40 && w.x1 - w.x0 > 300)[0];
  assert.ok(high, 'a river 40 px+ over the lane');
  const x = (high.x0 + high.x1) / 2;
  put(piece, x);
  const { ctx, draws } = recorder();
  drawPieces([piece], ctx, 'under', hostAt(x));
  assert.equal(draws.length, 1);
  const waterline = draws[0].box.y0 + (draws[0].box.y1 - draws[0].box.y0) * PACER_WATERLINE;
  assert.ok(Math.abs(waterline - high.surfaceY) < 0.5, `on the river at ${high.surfaceY}: waterline ${Math.round(waterline)} (the lane ${P.lane} would sink it ${P.lane - high.surfaceY} px)`);
});
