import test from 'node:test';
import assert from 'node:assert/strict';
import { bossMaterial, ENEMY_ORDER, enemyIndex, hitArg, MATERIALS, materialFor, nextVariant, roarPitch, streakStage, unpackHit } from './combat.ts';
import { Playback } from './music.ts';
import { MENU_THEME, sceneForScreen, stageTempo } from './scenes.ts';
import { parseChord, shiftChord } from './theory.ts';
import { THEMES, themeById } from './themes.ts';

test('shiftChord moves the root and bass up and wraps around the octave', () => {
  const c = parseChord('Am/G');
  const up = shiftChord(c, 2);
  assert.equal(up.rootPc, (c.rootPc + 2) % 12);
  assert.equal(up.bassPc, (c.bassPc + 2) % 12);
  assert.deepEqual(up.tones, c.tones);
  assert.equal(shiftChord(c, 0), c);
  const b = parseChord('B');
  assert.equal(shiftChord(b, 2).rootPc, 1);
  assert.equal(shiftChord(b, -2).rootPc, 9);
});

test('the arrangement cycles through four passes and stages start on different ones', () => {
  for (const seed of [0, 1, 2, 3, 12345, 4000000001]) {
    const seen = new Set<number>();
    for (let loop = 0; loop < 4; loop++) seen.add(Playback.phaseOf(loop, seed));
    assert.equal(seen.size, 4, `seed ${seed} covers all four passes`);
    // a piece never opens on the breakdown or the key lift
    assert.ok(Playback.phaseOf(0, seed) <= 1);
  }
  assert.notEqual(Playback.phaseOf(0, 0), Playback.phaseOf(0, 1));
});

test('every stage gets its own seed and a gentle tempo', () => {
  const seeds = new Set<number>();
  for (let w = 1; w <= 10; w++) {
    for (let m = 1; m <= 10; m++) {
      const id = `${w}-${m}`;
      const s = sceneForScreen('playing', w, false, id, m)!;
      assert.ok(themeById(s.id));
      assert.ok(s.tempo! >= 0.85 && s.tempo! <= 1.15, `${id} tempo ${s.tempo}`);
      // the pause menu plays the menu music (the first stage's own tune), the same wherever the player was
      assert.equal(sceneForScreen('paused', w, false, id, m)!.id, MENU_THEME, 'pausing plays the menu music');
      seeds.add(s.seed!);
    }
  }
  assert.ok(seeds.size >= 95, `seeds are nearly all different (${seeds.size})`);
  // later stages of a world are a touch quicker on average
  const avg = (ms: number[]) => ms.reduce((a, m) => a + stageTempo(m * 7, m), 0) / ms.length;
  assert.ok(avg([8, 9, 10]) > avg([1, 2, 3]));
  // bosses play as written, and no level id means the plain version
  assert.equal(sceneForScreen('playing', 3, true, '3-10', 10)!.tempo, 1);
  assert.equal(sceneForScreen('playing', 3, false)!.seed, 0);
  assert.equal(sceneForScreen('title', 1, false)!.seed, undefined);
});

test('hits know what they landed on', () => {
  for (const heavy of [false, true]) {
    for (const m of MATERIALS) assert.deepEqual(unpackHit(hitArg(heavy, m)), { heavy, material: m });
  }
  assert.equal(materialFor('eagle'), 'feather');
  assert.equal(materialFor('jaguar'), 'fur');
  assert.equal(materialFor('caiman'), 'scale');
  assert.equal(materialFor('spider'), 'chitin');
  assert.equal(bossMaterial(7), 'armor');
  assert.equal(bossMaterial(2), 'generic');
  assert.deepEqual(unpackHit(0), { heavy: false, material: 'generic' });
  assert.equal(unpackHit(999).material, 'armor');
});

test('every enemy type has a number and every world a boss voice', () => {
  ENEMY_ORDER.forEach((t, i) => assert.equal(enemyIndex(t), i));
  assert.equal(enemyIndex('nonsense'), -1);
  const pitches = new Set<number>();
  for (let w = 1; w <= 10; w++) {
    const p = roarPitch(w);
    assert.ok(p >= 0.5 && p <= 1.5);
    pitches.add(p);
  }
  assert.ok(pitches.size >= 9, 'worlds sound different');
});

test('combo sparkle steps up at 3, 5 and 8 hits', () => {
  assert.deepEqual([0, 1, 2, 3, 4, 5, 7, 8, 20].map(streakStage), [0, 0, 0, 1, 1, 2, 2, 3, 3]);
});

test('an effect never plays the same version twice in a row, and every version gets used', () => {
  for (let last = -1; last < 4; last++) {
    const seen = new Set<number>();
    for (let i = 0; i <= 100; i++) {
      const v = nextVariant(last, 4, i / 100);
      assert.ok(v >= 0 && v < 4);
      if (last >= 0) assert.notEqual(v, last);
      seen.add(v);
    }
    assert.equal(seen.size, last < 0 ? 4 : 3);
  }
  assert.equal(nextVariant(0, 1, 0.5), 0);
});
