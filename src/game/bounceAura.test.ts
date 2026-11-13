// The gold rim on a bounce plant hugs its painted cap (F12, 11-12): it was centred 2 px under the cap's top with a 30 px half-height,
// so the cap filled only its lower half and the upper half was an empty dark pool with the white cue in it, which read on a phone as a
// pickup ring with nothing in it (the 1-2 kit stills, EN-W thorn-bed-*.jpg). Now the rim is the cap's own box from the atlas frame
// (bounceAtlasData.ts), every world, and nothing is drawn while the cap's picture is not in.
//   npx tsx --test src/game/bounceAura.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import './headlessDom.ts';
import { bounceAuraBox, capBox } from './bounceArt.ts';
import { BOUNCE_FRAMES } from './bounceAtlasData.ts';
import type { Platform } from './types.ts';

const pad = (id: number, width: number): Platform => ({ id, x: 1000, y: 800, width, height: 30, type: 'bouncy' }) as Platform;
/** readable.ts drawAura: the ring's bright edge sits at about 1.15 of the half-size, the pool reaches 1.65 */
const RIM = 1.15, POOL = 1.65;
/** bounceArt.ts drawBounce: the cue is a triangle from 24 to 14 px over the cap's top */
const CUE = { top: 24, base: 14 };

test('the rim is the painted cap: centred on it, inside it, every world and width (red on the old ring: centre 2 px under the top, half-height 30)', () => {
  for (let w = 1; w <= 10; w++) for (const width of [70, 100, 140]) {
    const p = pad(2, width);
    const b = capBox(p, w);
    const cf = BOUNCE_FRAMES[`cap-w${w}`];
    const k = (width * (cf.span ?? 1.1)) / (cf.w * (cf.cw ?? 1));
    const capBottom = p.y + (cf.rim ?? 0.8) * cf.h * k;
    const tag = `w${w} width ${width}`;
    assert.ok(Math.abs(b.cx - (p.x + width / 2)) < 1, `${tag}: centred over the pad`);
    assert.ok(b.cy - b.ry >= p.y - 1 && b.cy + b.ry <= capBottom + 1, `${tag}: the box is the cap (${b.cy - b.ry}..${b.cy + b.ry} in ${p.y}..${capBottom})`);
    assert.ok(b.rx >= width * 0.45 && b.rx <= width * 0.65, `${tag}: as wide as the cap (${b.rx})`);
    // (the cue stays above the rim: it marks the plant, it is not in an empty ring)
    assert.ok(b.cy - RIM * b.ry > p.y - CUE.base, `${tag}: the rim's top edge (${(b.cy - RIM * b.ry).toFixed(1)}) is under the cue's base (${p.y - CUE.base})`);
    // (the pool's empty part over the cap is a sliver, not half the ring: under 40% of the pool's height)
    const over = Math.max(0, p.y - (b.cy - POOL * b.ry));
    assert.ok(over / (2 * POOL * b.ry) < 0.4, `${tag}: ${Math.round((100 * over) / (2 * POOL * b.ry))}% of the pool stands over the cap`);
  }
  // (the old ring, planted: centre p.y + 2, half-height 30: 76% of its pool stood over the cap's top)
  const old = { cy: 802, ry: 30 };
  assert.ok((800 - (old.cy - POOL * old.ry)) / (2 * POOL * old.ry) > 0.4, 'the planted old ring fails the same measure');
});

test('no rim while the cap is not drawn: before the sheet is in, bounceAuraBox gives nothing (an empty ring is what we are removing)', () => {
  for (let w = 1; w <= 10; w++) assert.equal(bounceAuraBox(pad(2, 70), w), null, `w${w}`);
  assert.equal(bounceAuraBox(pad(3, 70), 8), null, "World 8's leaf, its sheet not in");
});

test("the engine draws the mushrooms' rim from bounceAuraBox, never the old fixed ring", () => {
  const src = fs.readFileSync(new URL('./engine.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(src, /drawAura\(ctx, 'take', world\.id, pl\.width \* 0\.55, 30,/);
  assert.match(src, /bounceAuraBox\(pl, world\.id\)/);
});
