// The slung log (src/game/pieces/sling.ts): it swings level on its two ropes, carries him, can be boarded and left by a phone thumb on
// Normal and Easy in the real engine, is needed (the gap is too wide without it), and hangs from something (the bough, held by a kapok on
// each bank). Its label is in the engine's library (catalog.ts) with the designer's fields.
import test from 'node:test';
import assert from 'node:assert/strict';
import { SLING, slingAt, slingReach, slingRise, slingRopes, slungLog } from './pieces/sling.ts';
import { bareWorld, noisy, windowOf } from './pieces/pieceBot.ts';
import { jumpOK } from './levelCheck.ts';
import { LANDINGS, landingKind } from './mixer/catalog.ts';
import { DT } from './realPlay.ts';
import type { Platform } from './types.ts';

const BANK_Y = 1000;
/** two banks with a slung log between, its ends `near` px from each bank at the ends of its swing */
function course(easy: boolean, near = 60) {
  const w = easy ? SLING.width.easy : SLING.width.normal;
  const gap = Math.round(2 * (near + SLING.len * Math.sin(SLING.amp)) + w);
  const x0 = 1000, x1 = x0 + gap;
  const s = slungLog({ x0, x1, bankY: BANK_Y, easy })!;
  const A: Platform = { id: 1, x: 200, y: BANK_Y, width: x0 - 200, height: 400, type: 'solid', style: 'moss_stone' };
  const B: Platform = { id: 2, x: x1, y: BANK_Y, width: 800, height: 400, type: 'solid', style: 'moss_stone' };
  const L: Platform = { id: 3, ...s.log } as Platform;
  const boughs = s.boughs.map((b, i) => ({ id: 4 + i, ...b }) as Platform);
  return { A, B, L, boughs, trunks: s.trunks, x0, x1, gap };
}

test('the slung log swings level along its arc, reaching as far as the reach checks are told', () => {
  const { L } = course(false);
  const s = L.sling!;
  const at = { x: 0, y: 0 };
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let t = 0; t < s.period; t += DT) {
    slingAt(s, t, at);
    minX = Math.min(minX, at.x); maxX = Math.max(maxX, at.x); minY = Math.min(minY, at.y); maxY = Math.max(maxY, at.y);
  }
  assert.ok(Math.abs(maxX - s.restX - slingReach(s)) < 1.5 && Math.abs(s.restX - minX - slingReach(s)) < 1.5, 'it swings its reach each way');
  assert.equal(L.moveRange, Math.round(slingReach(s)), 'levelCheck / flowerReach see its whole span (baseX +- moveRange)');
  assert.ok(Math.abs(maxY - s.restY) < 0.5 && Math.abs(s.restY - minY - slingRise(s)) < 1, 'lowest at rest, rising at the ends');
});

test('it hangs from something: each rope runs up to a limb of a kapok on its bank, the limbs at their painted size, nothing in the gap', () => {
  for (const easy of [false, true]) {
    const { L, boughs, trunks, x0, x1 } = course(easy);
    const s = L.sling!;
    slingRopes(L, s).forEach((r, i) => {
      const bough = boughs[i];
      assert.ok(r.tx > bough.x + 20 && r.tx < bough.x + bough.width - 20, 'each tie is on its limb, not past its end');
      assert.equal(r.ty, bough.y, 'tied over the bough\'s top');
      // (equal ropes: the log stays level, every rope the same length at every moment)
      const at = { x: 0, y: 0 };
      for (const t of [0, s.period / 4, s.period / 2]) {
        slingAt(s, t, at);
        const len = Math.hypot(r.tx - (at.x + (r.ex - L.x)), r.ty - (at.y + (r.ey - L.y)));
        assert.ok(Math.abs(len - s.len) < 0.5, `rope length ${len.toFixed(1)} at t ${t}`);
      }
    });
    assert.equal(trunks.length, 2);
    assert.ok(trunks[0].x < x0 - 20 && trunks[1].x > x1 + 20, 'one kapok on each bank, none in the gap');
    trunks.forEach((t, i) => {
      const bough = boughs[i];
      assert.ok(t.x > bough.x && t.x < bough.x + bough.width, 'each limb grows from its kapok');
      assert.ok(t.topY < bough.y && t.bottomY > BANK_Y, 'the kapok runs from above its limb into its bank');
      // (World 1's painted bough is 179 px wide at its drawn height; the mixer's boughs run to about twice that)
      assert.ok(bough.width <= 400, `limb ${bough.width} px: no longer than the mixer's own boughs, so its painting is not smeared`);
    });
    assert.ok(boughs[0].x + boughs[0].width < boughs[1].x, 'two limbs, not one spanning the gap');
  }
});

test('the gap needs it: without the log no jump crosses, with it each leg is a short hop', () => {
  for (const easy of [false, true]) {
    const { A, B } = course(easy, 30);
    assert.equal(jumpOK(A, B, true).ok, false, `even the narrowest gap it hangs in (${B.x - A.x - A.width} px) is too wide for a double jump`);
  }
  assert.equal(slungLog({ x0: 0, x1: 300, bankY: 0, easy: false }), null, 'too narrow a gap: it would knock the banks');
  assert.equal(slungLog({ x0: 0, x1: 800, bankY: 0, easy: false }), null, 'too wide: the ends of its swing are out of a hop');
});

test('real engine: he rides a whole swing standing on it, carried, never slipping off', () => {
  for (const setting of ['normal', 'easy'] as const) {
    const { A, B, L } = course(setting === 'easy');
    const rp = bareWorld([A, B, L], setting);
    rp.t = 0;
    rp.stand(L.x + L.width / 2, L.y);
    rp.frame();
    rp.frame();
    const log = rp.platforms.find((p) => p.id === 3)!;
    // (where on it he stands once he is on it: the frame he was put there the log moved under him before he stood)
    const rel = rp.p.x - log.x;
    let off = 0;
    let worst = 0;
    for (let i = 0; i < Math.round((2 * L.sling!.period) / DT); i++) {
      rp.frame();
      if (rp.standingOn !== 3) off++;
      worst = Math.max(worst, Math.abs(rp.p.x - log.x - rel));
    }
    assert.equal(off, 0, `${setting}: he stays on it for two swings`);
    assert.ok(worst < 2, `${setting}: carried with it (drifted ${worst.toFixed(1)} px along it)`);
  }
});

/** the next moment from t0 that the log's near end has swung within `cue` px of the near bank (the board cue a player waits for) */
const boardCue = (L: Platform, x0: number, cue: number) => (t0: number) => {
  const at = { x: 0, y: 0 };
  for (let t = t0; t < t0 + 20; t += DT) if (slingAt(L.sling!, t, at).x - x0 <= cue) return t;
  return t0;
};
/** the next moment from t0 that its far end has swung within `cue` px of the far bank */
const offCue = (L: Platform, x1: number, cue: number) => (t0: number) => {
  const at = { x: 0, y: 0 };
  for (let t = t0; t < t0 + 20; t += DT) if (x1 - (slingAt(L.sling!, t, at).x + L.width) <= cue) return t;
  return t0;
};

test('real engine: the press windows to board and to leave it are wide on Normal and Easy (STAGE-RULES §1b: 167 / 300 ms)', () => {
  for (const setting of ['normal', 'easy'] as const) {
    const easy = setting === 'easy';
    const { A, B, L, x0 } = course(easy);
    const rp = bareWorld([A, B, L], setting);
    const hold = easy ? 0.16 : 0.2;
    const on = windowOf(rp, { from: { x: x0 - 14, y: BANK_Y }, to: 3, dir: 1 }, L.sling!.period, hold);
    const off = windowOf(rp, { from: { x: x0 - 14, y: BANK_Y, on: 3, edge: easy ? 32 : 22 }, to: 2, dir: 1 }, L.sling!.period, hold);
    const min = easy ? 300 : 167;
    assert.ok(on.longestMs >= min * 3, `${setting}: board window ${on.longestMs} ms`);
    assert.ok(off.longestMs >= min * 3, `${setting}: leave window ${off.longestMs} ms`);
  }
});

test('real engine: the first-timer\'s thumbs make it across (Gemini floors: Normal 70%, the Easy kid 85%)', () => {
  for (const setting of ['normal', 'easy'] as const) {
    const easy = setting === 'easy';
    const { A, B, L, x0, x1 } = course(easy);
    const rp = bareWorld([A, B, L], setting);
    const board = noisy(rp, { from: { x: x0 - 14, y: BANK_Y }, to: 3, dir: 1 }, setting, boardCue(L, x0, 70), 40, 11);
    const leave = noisy(rp, { from: { x: x0 - 14, y: BANK_Y, on: 3, edge: easy ? 32 : 22 }, to: 2, dir: 1 }, setting, offCue(L, x1, 70), 40, 12);
    const floor = easy ? 0.85 : 0.7;
    assert.ok(board >= floor, `${setting}: boards ${Math.round(board * 100)}%`);
    assert.ok(leave >= floor, `${setting}: leaves ${Math.round(leave * 100)}%`);
  }
});

test('its label is in the library: a moving log on ropes, may float, World 2 on', () => {
  const { L } = course(false);
  const k = landingKind(L as Platform & Record<string, unknown>);
  assert.equal(k.length, 1, `one label (${k.map((q) => q.name).join(', ')})`);
  assert.equal(k[0].name, 'slung log');
  const e = LANDINGS.find((q) => q.name === 'slung log')!;
  assert.equal(e.mayFloat, 'yes');
  assert.ok(!e.worlds.includes(1), 'not in World 1: moving platforms are taught at 2-7');
});
