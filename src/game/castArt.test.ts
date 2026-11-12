// castArt's trap layout (ART-W1, 2026-11-12): the painted sapling that holds a trap's load stands on real ground, keeps its crown under
// the top of a sideways phone, hangs the load at its tested height and keeps its trunk off the handle; where it can't, a bough end holds
// the load instead (nothing floats).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TRUNK_TIE, layoutTrap, trunkScale, vineTileFrom } from './castArt.ts';
import { tintedTile } from './ropeArt.ts';
import { ROPE_RISE } from './rope.ts';
import { W1_TRAP_FRAMES, W1_TRAP_MEASURES } from './w1TrapsData.ts';
import type { Platform } from './types.ts';
import type { TrapPost } from './castPlay.types.ts';

const ground = (x: number, width: number, y: number, id = 1): Platform => ({ id, x, y, width, height: 40, type: 'solid' } as Platform);
const post = (o: Partial<TrapPost>): TrapPost => ({ id: 0, kind: 'vine', load: 'hive', x: 300, y: 1000, loadX: 470, loadY: 900, landY: 1000, ...o });

let boughs = 0; // (corners held)
test('on one long ground the sapling stands, under 265 units tall, its trunk clear of the handle, the load hung at its height', () => {
  for (const [hx, lx] of [[300, 440], [300, 470], [300, 490], [700, 520], [700, 560]]) {
    for (const load of ['hive', 'stone'] as const) {
      const p = post({ x: hx, loadX: lx, load });
      const lay = layoutTrap(p, [ground(0, 1400, 1000)]);
      assert.ok(lay.sap, `a sapling for handle ${hx}, load ${lx}`);
      const s = lay.sap!;
      assert.equal(s.y, 1000, 'its foot on the ground');
      assert.ok(s.k * W1_TRAP_FRAMES.sapling.h <= 265 + 1e-6, 'no taller than a sideways phone shows');
      const half = (W1_TRAP_MEASURES.sapling.footW * s.k) / 2;
      assert.ok(Math.abs(s.x - hx) >= half + 22, 'the root flare off the handle');
      const tall = load === 'hive' ? W1_TRAP_FRAMES.hiveHang.h * 0.25 : (W1_TRAP_FRAMES.stoneHang.h * 50) / W1_TRAP_FRAMES.stoneHang.w;
      const top = p.loadY - tall + (load === 'stone' ? 20 : 8);
      assert.ok(lay.hangY <= top + 1e-6 && lay.hangY >= top - 70, `the load hung from the crown (${top - lay.hangY})`);
      if (lay.bough) {
        assert.ok(lay.bough.k >= 0.15 && lay.bough.k <= 0.4, 'the bough end at a sane size');
        assert.ok(Math.sign(lay.bough.x - hx) === Math.sign(lx - hx), 'its stick on the bark between the handle and the load');
      } else {
        // (ART-W1B) beyond the load, the vine's corner over the handle hangs from a second sapling's crown: nothing floats
        assert.ok(lay.sap2, `a second sapling behind handle ${hx} (load ${lx}, ${load})`);
        const s2 = lay.sap2!;
        assert.equal(s2.y, 1000, "the second sapling's foot on the ground");
        assert.ok(s2.k * W1_TRAP_FRAMES.sapling2.h <= 225 + 1e-6, 'the second sapling no taller than 225');
        assert.ok(Math.sign(hx - s2.x) === Math.sign(lx - hx), 'it stands behind the handle, away from the load');
        assert.ok(Math.abs(s2.x - hx) >= (W1_TRAP_MEASURES.sapling2.footW * s2.k) / 2 + 22, 'its root flare off the handle');
        assert.ok(lay.hy <= p.loadY - 68 + 45 && lay.hy >= p.loadY - 68 - 40, `the corner at the vine line (${p.loadY - 68 - lay.hy})`);
      }
      boughs++;
    }
  }
  assert.equal(boughs, 10, "every trap's corner over the handle hangs from a bough end or a second sapling's crown");
});

test('the foot never stands over a gap: with no ground where it would go, a bough end holds the load', () => {
  // the handle's ledge ends at the handle; the load's ledge is a short patch: nowhere for the root flare
  const lay = layoutTrap(post({}), [ground(260, 60, 1000), ground(440, 60, 1000, 2)]);
  if (lay.sap) {
    const s = lay.sap;
    const on = [ground(260, 60, 1000), ground(440, 60, 1000, 2)].some((g) => s.x - 20 >= g.x - 4 && s.x + 20 <= g.x + g.width + 4);
    assert.ok(on, 'a sapling found is on a ledge');
  } else assert.equal(lay.hangY, lay.hy, 'the bough end holds the load at the vine line');
});

test("a vine's tree (Rope.look 'vine'): its arm holds the vine at the tie, its foot on the ground, at about its usual size at a rope's height", () => {
  const T = W1_TRAP_FRAMES.trunk;
  const usual = T.units / T.h;
  const y = 400;
  for (const drop of [ROPE_RISE, ROPE_RISE + 60]) {
    const k = trunkScale(y, y + drop);
    // (the frame's tie row lands on the vine, its bottom row on the ground: nothing floats, nothing sinks)
    assert.equal(Math.round(y + (W1_TRAP_MEASURES.trunk.foot[1] - TRUNK_TIE.y) * k), y + drop);
    if (drop === ROPE_RISE) assert.ok(Math.abs(k / usual - 1) <= 0.1, `${(k / usual).toFixed(2)} of its usual size over level ground`);
  }
  // (the tie is on the arm's bark, inside the leaves: short of the arm's furthest leaf, and the frame reaches on past it)
  assert.ok(TRUNK_TIE.x < W1_TRAP_MEASURES.trunk.armTip[0] && TRUNK_TIE.fore > 0 && TRUNK_TIE.back + TRUNK_TIE.fore === T.w);
});

/** a canvas that records its bakes; `lose()` makes it report a 2D context loss (canvasLost.ts asks isContextLost) */
function bakeable(made: unknown[]) {
  let lost = false;
  const cv = {
    width: 0, height: 0,
    getContext: () => ({ isContextLost: () => lost, translate() {}, rotate() {}, drawImage() {}, fillRect() {}, set globalCompositeOperation(_v: string) {}, set fillStyle(_v: string) {} }),
    addEventListener() {},
    lose() { lost = true; },
  };
  made.push(cv);
  return cv;
}

test("the vine's tile and the tinted rope tile are baked again when the phone takes their canvas back (LESSONS D6: a lost copy draws nothing)", () => {
  const made: Array<ReturnType<typeof bakeable>> = [];
  const make = () => bakeable(made) as unknown as HTMLCanvasElement;
  const cache: { cv: HTMLCanvasElement | null } = { cv: null };
  const sheet = {} as CanvasImageSource;
  const a = vineTileFrom(sheet, cache, make);
  assert.ok(a, 'baked');
  assert.equal(made.length, 1, 'baked once');
  assert.equal(vineTileFrom(sheet, cache, make), a, 'kept while it holds its picture');
  made[0].lose();
  const b = vineTileFrom(sheet, cache, make);
  assert.ok(b && b !== a, 'a new copy after the loss');
  assert.equal(made.length, 2, 'baked again after the loss');
  // (its pair in ropeArt.ts: the lairs' tinted ropes)
  const g = globalThis as { document?: unknown };
  const doc = g.document;
  const made2: Array<ReturnType<typeof bakeable>> = [];
  g.document = { createElement: () => bakeable(made2) };
  try {
    const im = {} as HTMLImageElement;
    const t1 = tintedTile(im, '#7f7');
    assert.ok(t1);
    assert.equal(made2.length, 1);
    assert.equal(tintedTile(im, '#7f7'), t1);
    made2[0].lose();
    const t2 = tintedTile(im, '#7f7');
    assert.ok(t2 && t2 !== t1, 'a new tinted copy after the loss');
    assert.equal(made2.length, 2, 'the tinted tile baked again after the loss');
  } finally {
    g.document = doc;
  }
});
