/**
 * World 2's next sheet: the King's Barge (ENG-29-e G3). Its footing in the draw path (w2NextArt.ts BARGE_DECK) is the inventory row's
 * (w2-next#barge walk_y / walk_x0 / walk_x1), its packed frame is the cut's size, and a river row's log draws it with the deck as the log's
 * whole top: ART-W3-b's ruling, a 384-390 px log draws the barge 505-510 px whole, deck 386 of 507 at 2.513 cut px a unit.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import './headlessDom.ts';
import { Inventory, type InventoryFile } from './art/inventory.ts';
import { BARGE_DECK, W2_NEXT_FRAMES, w2NextFrame } from './w2NextArt.ts';
import { bargeBox, logPaint } from './riverArt.ts';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const inv = new Inventory(JSON.parse(fs.readFileSync(`${ROOT}src/game/art/inventory/w2.json`, 'utf8')) as InventoryFile);

test('the barge: the draw path stands him on the inventory\'s footing, on the packed frame', () => {
  const row = inv.byId('w2-next#barge');
  assert.ok(row, 'w2-next#barge is in World 2\'s inventory');
  assert.equal(row.file, 'src/assets/w2-next/w2-next.webp', 'packed into the shipped sheet');
  assert.deepEqual([row.walk_y, row.walk_x0, row.walk_x1], [BARGE_DECK.y, BARGE_DECK.x0, BARGE_DECK.x1]);
  const f = w2NextFrame('w2-next#barge');
  assert.ok(f, 'the sheet holds the barge');
  assert.deepEqual([f.w, f.h], [row.w, row.h], 'the frame is the cut at its own size');
  // (no frame overlaps another on the sheet)
  const all = Object.entries(W2_NEXT_FRAMES);
  for (const [a, A] of all) for (const [b, B] of all) {
    if (a >= b) continue;
    assert.ok(A.x + A.w <= B.x || B.x + B.w <= A.x || A.y + A.h <= B.y || B.y + B.h <= A.y, `${a} and ${b} overlap`);
  }
});

test('the barge: a 386 px log draws it 507 px whole, the deck its top, the stern and prow past its ends', () => {
  const b = bargeBox(386);
  assert.ok(Math.abs(b.w - 507) < 1.5, `whole ${b.w.toFixed(1)}`);
  assert.ok(Math.abs(b.left + 386 + b.right - b.w) < 1e-6, 'stern + deck + prow = the whole barge');
  assert.ok(b.left > 0 && b.right > 0, 'the stern and the prow overhang the log');
  assert.ok(b.deck > 0 && b.deck < b.h, 'the deck is inside the painting, the hull under it');
  // (the river's waterline sits under the deck, at the painting's foot: logPaint's barkFoot for a barge)
  const p = logPaint({ width: 386, drift: { look: 'barge' } });
  assert.equal(p.barkTop, 0);
  assert.ok(Math.abs(p.barkFoot - (b.h - b.deck)) < 1e-6);
  // (a plain log keeps its own painting)
  assert.notEqual(logPaint({ width: 386 }).h, b.h);
});
