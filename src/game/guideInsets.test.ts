// Dot's bubble and its Skip tips button keep clear of the phone's insets (the notch sideways, the gesture bar): clipcheck found the Skip
// button inside the right 48 px on a 915 x 412 phone (11-06), because the guide's safe rect had only the fallback's 16 px gutter. The HUD
// now hands Dot a rect kept clear of the insets (VineHud.tsx with dotGuidePerch.ts clearOfInsets); every bubble is placed in it.
import test from 'node:test';
import assert from 'node:assert/strict';
import { clearOfInsets, fallbackSafeArea, placeBubble, type SafeArea } from './dotGuidePerch.ts';

const SIDE = { w: 915, h: 412, ins: { top: 0, right: 48, bottom: 21, left: 48 } };
const UP = { w: 412, h: 915, ins: { top: 48, right: 0, bottom: 24, left: 0 } };

test("the guide's rect is clear of the phone's insets, sideways and upright, and never wider than the fallback's", () => {
  for (const { w, h, ins } of [SIDE, UP]) {
    const f = fallbackSafeArea(w, h).rect;
    const r = clearOfInsets(f, ins, w, h);
    assert.ok(r.x0 >= ins.left + 8 && r.x1 <= w - ins.right - 8, JSON.stringify(r));
    assert.ok(r.y0 >= ins.top + 4 && r.y1 <= h - ins.bottom - 4, JSON.stringify(r));
    assert.ok(r.x0 >= f.x0 && r.x1 <= f.x1 && r.y0 >= f.y0 && r.y1 <= f.y1, 'only ever narrower');
  }
  // (no insets: the fallback's own gutter stands)
  assert.deepEqual(clearOfInsets({ x0: 16, y0: 60, x1: 899, y1: 402 }, { top: 0, right: 0, bottom: 0, left: 0 }, 915, 412), { x0: 16, y0: 60, x1: 899, y1: 402 });
});

test('planted: a bubble placed hard against the right edge sideways stays out of the 48 px notch band with the rect; it did not without', () => {
  const { w, h, ins } = SIDE;
  const f = fallbackSafeArea(w, h);
  const bw = 300, bh = 90;
  // Dot at the far right, as she flies to a thing near the screen's edge
  const at = (safe: SafeArea) => placeBubble(w - 30, 200, bw, bh, safe, []);
  const before = at(f);
  assert.ok(before.x + bw > w - ins.right, `planted: the old rect let it into the notch band (right edge ${before.x + bw})`);
  const after = at({ ...f, rect: clearOfInsets(f.rect, ins, w, h) });
  assert.ok(after.x + bw <= w - ins.right - 8, `right edge ${after.x + bw} is clear of the ${ins.right} px inset`);
});
