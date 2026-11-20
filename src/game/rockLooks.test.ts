/**
 * R-165.338 (ENG-ROCK, 11-20): a world's painted hop rocks are not one stamped boulder. Each painted rock (protoArt.ts isPaintedRock)
 * takes one of its world's rock pictures (rockLooks.ts ROCK_FRAMES, the inventory's ids), plain or mirrored, picked by a hash of the
 * platform id, and never the same look as the rock before it along the stage. A world with one rock picture alternates its mirror.
 * Planted: a toy row of 6 World 2 rocks shows at least 2 pictures and no two neighbours alike (red before rockLooks.ts existed).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assignRockLooks, rockFramesOf, ROCK_FRAMES } from './rockLooks.ts';
import { isPaintedRock } from './protoArt.ts';
import { W2_ART } from './gen2/worlds/w2.ts';
import type { Platform } from './types.ts';

const rock = (id: number, x: number): Platform => ({ id, x, y: 400, width: 115, height: 50, type: 'solid', style: 'moss_stone' } as Platform);
const row = (ids: number[]) => ids.map((id, i) => rock(id, 300 + i * 260));
const key = (l: { frame: number; flip: boolean }) => `${l.frame}${l.flip ? 'm' : ''}`;

test('a toy row of 6 World 2 rocks: at least 2 pictures, no two neighbours alike', () => {
  const plats = row([11, 12, 13, 14, 15, 16]);
  assert.ok(plats.every(isPaintedRock));
  const looks = assignRockLooks(plats, rockFramesOf(2).length);
  const seq = plats.map((p) => looks.get(p.id)!);
  assert.equal(seq.length, 6);
  assert.ok(new Set(seq.map((l) => l.frame)).size >= 2, `pictures used: ${seq.map(key).join(' ')}`);
  for (let i = 1; i < seq.length; i++) assert.notEqual(key(seq[i]), key(seq[i - 1]), `rocks ${i - 1} and ${i} alike: ${seq.map(key).join(' ')}`);
});

test('every id pattern (runs of equal hashes too): no two neighbours alike, in every world, by x order not list order', () => {
  for (const w of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
    const n = rockFramesOf(w).length;
    for (let start = 0; start < 200; start++) {
      const ids = Array.from({ length: 8 }, (_, i) => start * 8 + i * (start % 3 === 0 ? 6 : 1));
      // (listed out of x order: the assignment walks the rocks left to right)
      const plats = row(ids).reverse();
      const looks = assignRockLooks(plats, n);
      const seq = [...plats].sort((a, b) => a.x - b.x).map((p) => looks.get(p.id)!);
      for (let i = 1; i < seq.length; i++) assert.notEqual(key(seq[i]), key(seq[i - 1]), `world ${w}, ids from ${start}: ${seq.map(key).join(' ')}`);
      assert.ok(seq.every((l) => l.frame >= 0 && l.frame < n));
    }
  }
});

test('the same stage gets the same rocks every time (by id, not by chance)', () => {
  const a = assignRockLooks(row([5, 9, 40, 41, 77]), 3);
  const b = assignRockLooks(row([5, 9, 40, 41, 77]), 3);
  assert.deepEqual([...a.entries()], [...b.entries()]);
});

test('only painted rocks get a look', () => {
  const plats = [...row([1, 2]), { ...rock(3, 900), height: 90 } as Platform];
  const looks = assignRockLooks(plats, 3);
  assert.ok(looks.has(1) && looks.has(2) && !looks.has(3));
});

test("World 2's rock list is the world data's (W2_ART.rock), each one in World 2's inventory, ready and in scale with Pokey", () => {
  assert.deepEqual([...ROCK_FRAMES[2]], [...W2_ART.rock]);
  const here = path.dirname(fileURLToPath(import.meta.url));
  const inv = JSON.parse(fs.readFileSync(path.join(here, 'art/inventory/w2.json'), 'utf8')) as { cols: string[]; rows: unknown[][] };
  const col = (n: string) => inv.cols.indexOf(n);
  for (const id of ROCK_FRAMES[2]) {
    const r = inv.rows.find((x) => x[col('id')] === id);
    assert.ok(r, `${id} not in World 2's inventory`);
    assert.notEqual(r[col('scale_ok')], false, `${id} is out of scale with Pokey`);
  }
});

test("a world with no list draws its kit boulder alone (mirrored by turns)", () => {
  assert.deepEqual(rockFramesOf(3), ['kit#boulder']);
  const looks = assignRockLooks(row([1, 2, 3, 4]), 1);
  assert.deepEqual([...looks.values()].map((l) => l.frame), [0, 0, 0, 0]);
});
