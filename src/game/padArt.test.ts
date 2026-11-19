// FIX-284 (Matt 11-18, "Why is that one lily pad so huge?"; R-165.284): a big lily pad is about two Pokeys wide, still clearly bigger than a
// small one, and every pond piece he stands on is drawn with its painted top exactly on the floor that holds him (art = floor): no painted
// rim over the water where he cannot stand, no floor past the painting where he would stand on air. The crown lily stays giant.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PAD_LAY, PAD_SIZES } from './gen2/rideLay.ts';
import { HERO_SPRITE_SCALE, HERO_UNITS } from './heroSprite.ts';
import { pondBox, pondTopSpan, type PondPiece } from './riverArt.ts';

/** Pokey's drawn standing height (89.1 units: heroSprite.ts HERO_UNITS x HERO_SPRITE_SCALE; LESSONS D41): the scale's 1.0 */
const POKEY = HERO_UNITS * HERO_SPRITE_SCALE;

test('a big pad is about two Pokeys wide and clearly bigger than a small one; the crown lily stays giant', () => {
  const big = PAD_SIZES.big.w / POKEY, small = PAD_SIZES.small.w / POKEY, crown = PAD_LAY.crownW / POKEY;
  assert.ok(big >= 1.8 && big <= 2.2, `a big pad is ${big.toFixed(2)} Pokeys wide (want about 2: Matt 11-18)`);
  assert.ok(PAD_SIZES.big.w / PAD_SIZES.small.w >= 1.3, `a big pad is only ${(PAD_SIZES.big.w / PAD_SIZES.small.w).toFixed(2)}x a small one`);
  assert.ok(crown >= 3, `the crown lily is ${crown.toFixed(2)} Pokeys wide (it stays giant)`);
});

test('every pond piece he stands on is drawn with its painted top exactly on its floor (art = floor), mirrored or not', () => {
  const stood: PondPiece[] = ['small', 'smallSunk', 'big', 'bigSunk', 'giant'];
  const floors = [PAD_SIZES.small.w, PAD_SIZES.big.w, PAD_LAY.crownW];
  for (const n of stood) for (const F of floors) {
    const cx = 1000, [x0, x1] = pondTopSpan(n, cx, 600, F);
    assert.ok(Math.abs(x0 - (cx - F / 2)) < 0.5 && Math.abs(x1 - (cx + F / 2)) < 0.5, `${n} on a ${F} px floor: painted top ${x0.toFixed(1)}-${x1.toFixed(1)}, floor ${cx - F / 2}-${cx + F / 2}`);
    // mirrored about the floor's centre (riverArt blitPond's flip), the top lands on the same span
    const b = pondBox(n, cx, 600, F);
    const m0 = 2 * cx - x1, m1 = 2 * cx - x0;
    assert.ok(Math.abs(m0 - (cx - F / 2)) < 0.5 && Math.abs(m1 - (cx + F / 2)) < 0.5, `${n} mirrored`);
    // drawn no wider than its floor allows: the painting overhangs its floor by under 1% each side (the measured transparent margin)
    assert.ok(b.w <= F * 1.02, `${n} on ${F}: drawn ${b.w.toFixed(1)} px wide over a ${F} px floor`);
  }
});

test('his feet stand inside the painted pad, never on its far rim or in the water: the floor line sits 30-55% down the painting', () => {
  // the painting's top edge is the far rim, its bottom the near rim under the water; the floor (surfaceY - 8, padPiece) must fall on the
  // dish between them (FIX-284 stills: 0.46 on a 180 px big pad)
  for (const [n, F] of [['big', PAD_SIZES.big.w], ['small', PAD_SIZES.small.w], ['giant', PAD_LAY.crownW]] as const) {
    const surfaceY = 600, floorY = surfaceY - 8, b = pondBox(n, 1000, surfaceY, F);
    const share = (floorY - b.y) / b.h;
    assert.ok(share >= 0.3 && share <= 0.55, `${n} on ${F}: his feet ${(share * 100).toFixed(0)}% down the painting`);
  }
});
