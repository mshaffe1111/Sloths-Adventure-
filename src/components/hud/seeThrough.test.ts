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

test('a HUD piece fades when a pickup, an animal or Pokey is under it, and comes back when clear (QA v189, 4-2 at 918x370)', () => {
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
  // a snake and Pokey himself under the Menu leaf fade it
  const wx = 1000 + 880 / 0.75;
  const wy = 200 + 40 / 0.75;
  v.enemies = [{ x: wx, y: wy + 10, type: 'snake', defeated: false, width: 60, height: 40 }];
  assert.ok(needsUnder(v, 860, 4, 906, 66));
  v.enemies = [];
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

test("a log, a bank or a branch top under the hearts never fades them: the HUD stays over the world (R-164.7, Matt's still 03, 1-5)", () => {
  // (Matt's 1-5, 2:27 AM: two high logs' tops lay under the fourth and fifth hearts and the lives plate, which faded to 30%, so the logs
  // and a berry cluster read as drawn over his hearts and lives)
  const v = view();
  const heart = el(), lives = el();
  const pieces: FadePiece[] = [
    { el: heart, x0: 120, y0: 8, x1: 150, y1: 34, on: false },
    { el: lives, x0: 30, y0: 40, x1: 100, y1: 70, on: false },
  ];
  v.platforms = [
    { x: 1000 + 60 / 0.75, y: 200 + 22 / 0.75, width: 240, height: 90, type: 'solid' },
    { x: 1000 - 40, y: 200 + 50 / 0.75, width: 200, height: 24, type: 'solid' },
  ];
  assert.equal(fadeCovered(v, pieces), 0, 'a ledge top is the world, not something the HUD hides');
  assert.ok(!heart.cls.has('vh-see') && !lives.cls.has('vh-see'));
  // (Pokey climbing up there still shows through, as before)
  v.px = 1000 + 125 / 0.75;
  v.py = 200 + 30 / 0.75;
  assert.equal(fadeCovered(v, pieces), 1);
});
