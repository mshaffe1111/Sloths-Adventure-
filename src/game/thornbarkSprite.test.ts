import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { THORNBARK_FRAMES } from './thornbarkAtlasData.ts';
import { THORNBARK_DEF } from './bossDefs.ts';

const NAMES = /^(idle|rest|march\d|gallop\d|roar|hook|overhead|claw|knuckle|kick|tail|leapprep|block)$/;

test('every frame name the Thornbark pick and story card use is in the atlas', () => {
  for (const file of ['./thornbarkSprite.ts', './storyArt.ts']) {
    const src = readFileSync(new URL(file, import.meta.url), 'utf8');
    const body = file.includes('storyArt') ? src.slice(src.indexOf("case 'thornbark'"), src.indexOf("case 'daisy'")) : src;
    const names = new Set([...body.matchAll(/'([a-z0-9]+)'/g)].map((m) => m[1]));
    let seen = 0;
    for (const n of names) if (NAMES.test(n)) { assert.ok(THORNBARK_FRAMES[n], `${file}: frame ${n}`); seen++; }
    assert.ok(seen >= 3, `${file} names some poses`);
  }
});

test('each frame has a size and a body anchor', () => {
  for (const [n, f] of Object.entries(THORNBARK_FRAMES)) {
    assert.ok(f.w > 8 && f.h > 8, `${n} size`);
    assert.ok(Number.isFinite(f.ax) && Number.isFinite(f.ay), `${n} anchor`);
  }
});

test('every move of the Thornbark brain is drawn with a pose (tell and act)', () => {
  const src = readFileSync(new URL('./thornbarkSprite.ts', import.meta.url), 'utf8');
  for (const mv of Object.keys(THORNBARK_DEF.moves)) assert.ok(src.includes(`'${mv}'`), `${mv} has a pose in the pick`);
});

test('the painted Thornbark is big enough to match his hitbox', () => {
  assert.ok(THORNBARK_DEF.h >= 100 && THORNBARK_DEF.w >= 80);
});
