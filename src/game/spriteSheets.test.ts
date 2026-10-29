import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SPRITES, warmSprites } from './spriteSheets.ts';
import { warmStageSheets } from './sheetWarm.ts';

const file = (u: string) => u.split('/').pop()!;

test("each creature's painted-pose sheets are real files, and the golden snake's three heads and the eagle's sheet are among them", () => {
  for (const [name, s] of Object.entries(SPRITES)) {
    assert.ok(s.urls().length > 0, name);
    for (const u of s.urls()) assert.ok(existsSync(fileURLToPath(u)), `${name}: ${u}`);
  }
  assert.deepEqual(SPRITES.goldsnake.urls().map(file).sort(), ['goldsnake-head.webp', 'goldsnake-sleep.webp', 'goldsnake-wake.webp']);
  assert.deepEqual(SPRITES.eagle.urls().map(file), ['eagle-atlas.webp']);
  assert.deepEqual(warmSprites(['nobody']), [], 'a name with no sprite adds nothing');
});

test("the stage start asks for the creatures' painted poses as well as their clips (QA 2026-10-29: 'blank wait goldsnake-head, eagle-atlas' mid-stage)", () => {
  const urls = warmStageSheets({ enemies: [{ type: 'snake' }], proto: { watch: [{}] } }).map(file);
  for (const f of ['goldsnake-anim.webp', 'goldsnake-head.webp', 'goldsnake-sleep.webp', 'goldsnake-wake.webp', 'eagle-anim.webp', 'eagle-atlas.webp']) {
    assert.ok(urls.includes(f), `${f} in ${urls.join(', ')}`);
  }
});
