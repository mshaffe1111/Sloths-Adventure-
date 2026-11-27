import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyGuideView, type GuideView } from './dotGuideView.ts';
import { fallbackSafeArea, hoverOrder, hoverSpot, landingRects, lawRects, placeBubble, pokeyRect, softAhead, type Rect } from './dotGuidePerch.ts';

/**
 * R-165.456 (FIX-CARD-DOWN): on a stage that travels DOWN, the way on is below Pokey, so Dot's card sits ABOVE him and never covers the
 * ledge he drops to (3-1's grotto mouth, upright: "Too dark to see..." sat under him, over the steps and the glowworm he must read).
 * The card's place comes from the stage's travel (GuideView.travel), never its id. Every other stage keeps the place it had.
 */
const overlaps = (a: Rect, b: Rect) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
const TAG = 16;

/** Pokey on a ledge near the right edge, high on the screen (a way down's camera), facing left, with the next ledge below to his left */
function downView(w: number, h: number, travel?: GuideView['travel']): { v: GuideView; below: Rect } {
  const v = emptyGuideView();
  v.live = true;
  v.cssW = w;
  v.cssH = h;
  v.zoom = 1;
  v.facing = -1;
  v.grounded = true;
  v.pw = 60;
  v.ph = 70;
  v.px = w - 110;
  // (where a way down's camera holds his feet: about 36% down upright, 48% sideways, as ENG-DARK's 3-1 stills show)
  v.py = Math.round(h * (h > w ? 0.36 : 0.48));
  if (travel) (v as { travel?: GuideView['travel'] }).travel = travel;
  const ledge = { x: w - 140, y: v.py, width: 140, height: 40, type: 'solid' as const };
  const next = { x: 30, y: v.py + 170, width: 200, height: 40, type: 'solid' as const };
  v.platforms = [ledge, next];
  // the landing below: the next ledge and the air over it where he lands (and reads what is there)
  const below = { x0: next.x, y0: next.y - 80, x1: next.x + next.width, y1: next.y + 14 };
  return { v, below };
}

/** where DotGuide's hover places her card: the same keep-outs in the same order (DotGuide.tsx hardNow / placeBub) */
function place(v: GuideView, bw: number, bh: number): Rect {
  const safe = fallbackSafeArea(v.cssW, v.cssH);
  const law = lawRects(v, [], 24, 'jump');
  const soft = softAhead(v, [], 'jump');
  const hard = [pokeyRect(v, 24)];
  landingRects(v, hard);
  const s = hoverSpot(v);
  const b = placeBubble(s.x, s.y, bw, bh, safe, [pokeyRect(v)], hoverOrder(v), 28, hard, 18, pokeyRect(v, 24), law, soft, []);
  return { x0: b.x, y0: b.y - TAG, x1: b.x + bw, y1: b.y + bh };
}

for (const [w, h, bw, bh] of [
  [390, 844, 296, 72],
  [360, 740, 296, 72],
  [844, 390, 340, 64],
  [740, 360, 320, 64],
] as const) {
  test(`a way down, ${w}x${h}: Dot's card sits above Pokey (sideways: beside him, above his feet), off the landing below him (R-165.456)`, () => {
    const { v, below } = downView(w, h, 'down');
    const card = place(v, bw, bh);
    const p = pokeyRect(v, 0);
    assert.ok(!overlaps(card, below), `the card (${card.x0},${card.y0})-(${card.x1},${card.y1}) covers the landing below him`);
    if (h > w) assert.ok(card.y1 <= p.y0 + 8, `upright: the card's bottom ${card.y1} is not above his head ${p.y0}`);
    // (sideways the band from the HUD to his head is shorter than the card: it sits beside him, in the band above his feet, never under)
    else assert.ok(card.y1 <= p.y1 && (card.x1 <= p.x0 || card.x0 >= p.x1), `sideways: the card (${card.x0},${card.y0})-(${card.x1},${card.y1}) is not beside him above his feet ${p.y1}`);
  });

  test(`a run, ${w}x${h}: the same scene keeps the place it had (the travel changes nothing but a way down)`, () => {
    const a = place(downView(w, h).v, bw, bh);
    const b = place(downView(w, h, 'right').v, bw, bh);
    assert.deepEqual(b, a);
  });
}
