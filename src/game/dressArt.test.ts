/**
 * ART's one-picture pieces in the dressing (dressArt.ts ONE_DRESS) are sized and stood as the inventory says (Matt 11-11: "to scale with
 * Pokey"; R-165.107): each one's file, its picture's size, its pokey_scale and, for a piece he stands in, its floor line, equal to its row
 * in src/game/art/inventory/w1.json, and its drawn height that share of his 89.1.
 *   npx tsx --test src/game/dressArt.test.ts
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dressSize, ONE_DRESS, signsClearOfFlags, SIGN_FLAG_GAP, type DressPiece, type OneName } from './dressArt.ts';
import type { Platform } from './types.ts';
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

test('a leaf-sign a flag came down beside steps aside along its own bank, clear of the flag and of the other sign; with no room it stays', () => {
  const bank = (x: number, width: number, y = 500) => ({ id: x, x, y, width, height: 300, type: 'solid', style: 'moss_stone' }) as Platform;
  const sign = (x: number): DressPiece => ({ n: 'w15-leafsign-up', x, b: 500 });
  const st = { platforms: [bank(0, 400)], checkpoints: [{ x: 200, y: 500 }], proto: { dress: [sign(210), sign(330)] } };
  signsClearOfFlags(st);
  const [a, b] = st.proto.dress;
  assert.ok(Math.abs(a.x - 200) >= SIGN_FLAG_GAP && a.x >= 25 && a.x <= 375, `stepped to ${a.x}`);
  assert.ok(Math.abs(a.x - b.x) >= 70, `onto the other sign: ${a.x}, ${b.x}`);
  const tight = { platforms: [bank(0, 120)], checkpoints: [{ x: 60, y: 500 }], proto: { dress: [sign(60)] } };
  signsClearOfFlags(tight);
  assert.equal(tight.proto.dress[0].x, 60, 'no room on its bank: it stays');
  const far = { platforms: [bank(0, 400)], checkpoints: [{ x: 200, y: 200 }], proto: { dress: [sign(210)] } };
  signsClearOfFlags(far);
  assert.equal(far.proto.dress[0].x, 210, 'a flag on another level is not on it');
});
