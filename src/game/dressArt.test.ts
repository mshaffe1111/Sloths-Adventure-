/**
 * ART's one-picture pieces in the dressing (dressArt.ts ONE_DRESS) are sized and stood as the inventory says (Matt 11-11: "to scale with
 * Pokey"; R-165.107): each one's file, its picture's size, its pokey_scale and, for a piece he stands in, its floor line, equal to its row
 * in src/game/art/inventory/w1.json, and its drawn height that share of his 89.1.
 *   npx tsx --test src/game/dressArt.test.ts
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dressSize, ONE_DRESS, type OneName } from './dressArt.ts';
import { Inventory, type InventoryFile } from './art/inventory.ts';

const W1 = new Inventory(JSON.parse(readFileSync(new URL('./art/inventory/w1.json', import.meta.url), 'utf8')) as InventoryFile);

test("every one-picture piece is its inventory row: the file, the picture's size, the scale against Pokey, the floor line", () => {
  for (const n of Object.keys(ONE_DRESS) as OneName[]) {
    const d = ONE_DRESS[n] as { url: string; w: number; h: number; scale: number; walkY?: number };
    const row = W1.byId(`hf1113/${n}`);
    assert.ok(row, `${n}: no inventory row hf1113/${n}`);
    assert.equal(row.file, `src/assets/w1-1113/${n}.webp`, n);
    assert.ok(d.url.endsWith(`w1-1113/${n}.webp`), `${n}: ${d.url}`);
    assert.deepEqual([d.w, d.h, d.scale], [row.w, row.h, row.pokey_scale], n);
    if (row.walk_y !== null && row.layer === 'platform') assert.equal(d.walkY, row.walk_y, `${n}: its floor line`);
    const { w, h } = dressSize(n);
    assert.ok(Math.abs(h - row.pokey_scale! * 89.1) < 0.01 && Math.abs(w / h - row.w / row.h) < 1e-6, `${n}: drawn ${w.toFixed(1)} x ${h.toFixed(1)}`);
  }
});
