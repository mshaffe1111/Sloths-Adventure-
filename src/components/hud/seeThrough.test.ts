import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyGuideView } from '../../game/dotGuideView.ts';
import { fadeCovered, needsUnder, type FadePiece } from './seeThrough.ts';

/** a fake element that records its class toggles */
function el() {
  const cls = new Set<string>();
  return { cls, classList: { toggle: (c: string, on: boolean) => (on ? cls.add(c) : cls.delete(c)), remove: (c: string) => cls.delete(c), contains: (c: string) => cls.has(c) } } as unknown as Element & { cls: Set<string> };
}

function view() {
  const v = emptyGuideView();
  v.live = true;
  v.cssW = 918;
  v.cssH = 370;
  v.zoom = 0.75;
  v.camX = 1000;
  v.camY = 200;
  // Pokey well below the HUD
  v.px = 1200;
  v.py = 600;
  return v;
}

test('a HUD piece fades when a pickup, a platform top, an animal or Pokey is under it, and comes back when clear (QA v189, 4-2 at 918x370)', () => {
  const v = view();
  const heart = el();
  const menu = el();
  // the third heart at the top left, the Menu leaf at the top right (screen px)
  const pieces: FadePiece[] = [
    { el: heart, x0: 60, y0: 8, x1: 82, y1: 30, on: false },
    { el: menu, x0: 860, y0: 4, x1: 906, y1: 66, on: false },
  ];
  assert.equal(fadeCovered(v, pieces), 0, 'nothing under them');
  // a column of flowers behind the hearts (screen (70, 20) is world (1000 + 70 / 0.75, 200 + 20 / 0.75))
  v.collectibles = [{ x: 1000 + 70 / 0.75, y: 200 + 20 / 0.75, type: 'flower', collected: false }];
  assert.equal(fadeCovered(v, pieces), 1);
  assert.ok(heart.cls.has('vh-see'), 'the heart fades');
  assert.ok(!menu.cls.has('vh-see'));
  // collected: it comes back
  v.collectibles = [{ x: 1000 + 70 / 0.75, y: 200 + 20 / 0.75, type: 'flower', collected: true }];
  assert.equal(fadeCovered(v, pieces), 0);
  assert.ok(!heart.cls.has('vh-see'));
  // a snake, a ledge top and Pokey himself under the Menu leaf all fade it
  const wx = 1000 + 880 / 0.75;
  const wy = 200 + 40 / 0.75;
  v.enemies = [{ x: wx, y: wy + 10, type: 'snake', defeated: false, width: 60, height: 40 }];
  assert.ok(needsUnder(v, 860, 4, 906, 66));
  v.enemies = [];
  v.platforms = [{ x: wx - 100, y: wy, width: 300, height: 40, type: 'solid' }];
  assert.ok(needsUnder(v, 860, 4, 906, 66));
  v.platforms = [];
  v.px = wx;
  v.py = wy + 20;
  assert.ok(needsUnder(v, 860, 4, 906, 66));
  // (the deep body of a big block under it is not "needed": only its top)
  v.px = 1200;
  v.py = 600;
  v.platforms = [{ x: wx - 100, y: wy - 300, width: 300, height: 600, type: 'solid' }];
  assert.equal(needsUnder(v, 860, 4, 906, 66), false);
});

test('the fade is off while no stage runs', () => {
  const v = view();
  v.live = false;
  const a = el();
  v.collectibles = [{ x: 1000 + 70 / 0.75, y: 200 + 20 / 0.75, type: 'flower', collected: false }];
  assert.equal(fadeCovered(v, [{ el: a, x0: 60, y0: 8, x1: 82, y1: 30, on: false }]), 0);
});
