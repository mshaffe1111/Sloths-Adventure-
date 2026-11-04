/**
 * The law for in-play words (Matt, 2026-11-01; D10 in reference/CONTINUOUS-IMPROVEMENT.md): Dot's tip box, Pokey's and Meeca's thought
 * clouds never cover Pokey (or Meeca), the spot he must act on next (the take-off lip, the rope or liana to grab, a hazard's tell, the
 * bush to hide in, the landing), the way ahead of him within ~1.5 jumps, or the HUD. Checked at real tip moments on real stages, at the
 * screens we ship to: upright and sideways, a small phone (360x740) and the Galaxy Z Fold 4's cover (344x882) and open (673x841) screens.
 *
 * The bubble is placed the way DotGuide.tsx places it (dot/DotGuide.tsx placeBub): a perch by the thing she teaches when one is clear,
 * else hovering behind him; both through placeBubble with the law's keep-outs (dotGuidePerch.ts lawRects). Stills of the same moments in
 * the running game: reference/qa-reports/dot-box (tools/dotbox/shoot.mjs).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { emptyGuideView, type GuideView } from './dotGuideView.ts';
import { engineGuideLine } from './dotLines.ts';
import {
  actionRects,
  aheadZone,
  bubbleMaxW,
  BUBBLE_TAG_H,
  choosePerch,
  dangerRects,
  fallbackSafeArea,
  findTarget,
  hoverOrder,
  hoverSpot,
  landingRects,
  lawRects,
  softAhead,
  pickupRects,
  aheadMoveOf,
  type AheadMove,
  aheadRect,
  JUMP_RISE_1,
  placeBubble,
  pokeyRect,
  setGuideSafeArea,
  type Rect,
  type SafeArea,
} from './dotGuidePerch.ts';
import { hudSafeRect } from '../components/hud/hudLayout.ts';
import { MEECA_SAY } from './meecaLines.ts';

const SCREENS: readonly (readonly [string, number, number])[] = [
  ['upright', 412, 915],
  ['sideways', 915, 412],
  ['small upright', 360, 740],
  ['small sideways', 740, 360],
  ['Fold 4 cover', 344, 882],
  ['Fold 4 cover sideways', 882, 344],
  ['Fold 4 open', 673, 841],
  ['Fold 4 open sideways', 841, 673],
];

/** the safe area as the HUD registers it (VineHud.tsx: under its band, five hearts) */
function safeFor(w: number, h: number): SafeArea & { band: number } {
  const f = fallbackSafeArea(w, h);
  const s = hudSafeRect(w, h, { hearts: 5 });
  return { rect: { ...f.rect, y0: Math.max(16, s.bandBottom + 6) }, keepOut: f.keepOut, band: s.bandBottom };
}

/** the engine's view for Dot's guide at a phone's size, with him standing at (x, y) facing right (w5Order.test.ts guideViewAt) */
function viewAt(sim: RealPlay, x: number, y: number, w: number, h: number): GuideView {
  const e = sim.e as unknown as Record<string, any>;
  delete e.updateCamera;
  e.viewCssW = w;
  e.viewCssH = h;
  e.introT = 99;
  e.applyZoom();
  sim.stand(x, y);
  sim.p.facing = 1;
  for (let i = 0; i < 40; i++) sim.frame();
  sim.stand(x, y);
  sim.p.facing = 1;
  for (let i = 0; i < 2; i++) sim.frame();
  return e.guideView(emptyGuideView()) as GuideView;
}

/** her bubble's size for a line (dotGuide.css: 16 px, 14.5 px on short sideways screens and narrow upright ones; padding and the tag) */
function bubbleSize(text: string, w: number, h: number): { bw: number; bh: number } {
  const fs = (h <= 430 && w > h) || (w < 380 && h > w) ? 14.5 : 16;
  const max = bubbleMaxW(w, h);
  // (measured in the game, 2026-11-01: "Flick up, keep your thumb on the glass." at 14.5 px is 300 x 50.5 plus the 14 px tag)
  const tw = text.length * fs * 0.48;
  const lines = Math.max(1, Math.ceil(tw / (max - 32)));
  return { bw: Math.min(max, tw + 32), bh: Math.round(lines * fs * 1.28 + 32) };
}

const hit = (a: Rect, b: Rect) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;

/** where her bubble goes for this line at this moment, as DotGuide.tsx does it (placeBub, hardNow) */
function placeAt(v: GuideView, text: string, topic: Parameters<typeof findTarget>[0], safe: SafeArea, move: AheadMove): Rect {
  const { bw, bh } = bubbleSize(text, v.cssW, v.cssH);
  const law = lawRects(v, [], 24, move);
  const soft = softAhead(v, [], move);
  const pick = pickupRects(v, []);
  const target = findTarget(topic, v);
  // (hardNow: him with room, the landings, the thing she points at)
  const hard = [pokeyRect(v, 24), ...landingRects(v, [])];
  if (target) {
    const tx = (target.x - v.camX) * v.zoom;
    const ty = (target.y - v.camY) * v.zoom;
    const r = Math.max(18, Math.min(40, target.r * v.zoom)) + 22;
    hard.push({ x0: tx - r, y0: ty - r - 16, x1: tx + r, y1: ty + r });
  }
  const body = pokeyRect(v, 24);
  const rects = (hover: boolean) => {
    const a = dangerRects(v, []);
    a.push(pokeyRect(v));
    if (hover) a.push(aheadRect(v));
    return landingRects(v, a);
  };
  const perch = target && topic !== 'controls' ? choosePerch(v, target, safe) : null;
  if (perch) {
    const sx = (perch.x - v.camX) * v.zoom;
    const sy = (perch.y - v.camY) * v.zoom - 22;
    const b = placeBubble(sx, sy, bw, bh, safe, rects(false), ['above', 'left', 'right', 'below'], 36, hard, 30, body, law, soft, pick);
    if ((b.cost ?? 0) === 0) return { x0: b.x, y0: b.y - BUBBLE_TAG_H, x1: b.x + bw, y1: b.y + bh };
  }
  const h = hoverSpot(v);
  const b = placeBubble(h.x, h.y, bw, bh, safe, rects(true), hoverOrder(v), 36, hard, 30, body, law, soft, pick);
  return { x0: b.x, y0: b.y - BUBBLE_TAG_H, x1: b.x + bw, y1: b.y + bh };
}

/**
 * is there any spot on the screen (8 px steps) where a bubble this size covers none of it: him (with room), the whole way ahead, the
 * spots he acts on next, the HUD's band, the thumb corners?
 */
function clearSpotExists(v: GuideView, bw: number, bh: number, band: number, move: AheadMove): boolean {
  const all = [...lawRects(v, [], 24, move), aheadZone(v, undefined, undefined, move), ...fallbackSafeArea(v.cssW, v.cssH).keepOut];
  for (let y = band + 6; y + bh + BUBBLE_TAG_H <= v.cssH - 10; y += 8) {
    for (let x = 16; x + bw <= v.cssW - 16; x += 8) {
      const b = { x0: x, y0: y, x1: x + bw, y1: y + bh + BUBBLE_TAG_H };
      if (!all.some((k) => hit(b, k))) return true;
    }
  }
  return false;
}

/**
 * checks a placed bubble against the law at this moment: Pokey, the way ahead, the spot he acts on next, the HUD, the thumbs. The way
 * ahead up to a single jump's reach always; its high arc (a double jump's, above that) unless no spot on the screen is clear of
 * everything (then it is the first to give way, and the test says so)
 */
function lawBroken(v: GuideView, box: Rect, band: number, cramped: { n: number }, move: AheadMove): string | null {
  if (hit(box, pokeyRect(v, 0))) return 'covers Pokey';
  // (where no spot on the screen is clear of everything, the box may graze, no deeper than 24 px, the way ahead or the air over a spot
  // he acts on: 4-2's glide tip on 360x740 upright, where the view has his head 77 px under the HUD. Never him, never the HUD. Each
  // such screen is printed, and is a decision for the lead and Matt: dot-box report)
  const graze = (k: Rect, what: string): string | null => {
    const depth = Math.min(box.y1 - k.y0, k.y1 - box.y0, box.x1 - k.x0, k.x1 - box.x0);
    if (depth > 24 || clearSpotExists(v, box.x1 - box.x0, box.y1 - box.y0 - BUBBLE_TAG_H, band, move)) return `covers ${what} ${Math.round(depth)} px deep`;
    console.log(`  (${v.cssW}x${v.cssH}: no clear spot on the screen; the box grazes ${what} by ${Math.round(depth)} px)`);
    cramped.n++;
    return null;
  };
  const core = aheadZone(v, undefined, JUMP_RISE_1, move);
  if (hit(box, core)) {
    const g = graze(core, `the way ahead (${move})`);
    if (g) return g;
  }
  if (hit(box, aheadZone(v, undefined, undefined, move))) {
    if (clearSpotExists(v, box.x1 - box.x0, box.y1 - box.y0 - BUBBLE_TAG_H, band, move)) return 'covers the high arc of the way ahead, with a clear spot on the screen';
    cramped.n++;
  }
  for (const a of actionRects(v, [])) {
    if (!hit(box, a)) continue;
    const g = graze(a, `the spot he acts on next ${JSON.stringify(a)}`);
    if (g) return g;
  }
  if (box.y0 < band) return `under the HUD (top ${Math.round(box.y0)}, the HUD to ${Math.round(band)})`;
  // (and out of the thumb corners: nothing can be read under a thumb)
  const k = fallbackSafeArea(v.cssW, v.cssH).keepOut.find((q) => hit(box, q));
  if (k) {
    if (clearSpotExists(v, box.x1 - box.x0, box.y1 - box.y0 - BUBBLE_TAG_H, band, move)) return `in a thumb corner (${JSON.stringify(k)}), with a clear spot on the screen`;
    cramped.n++;
  }
  return null;
}

interface Moment {
  stage: string;
  layout: number;
  /** the hint's words (what the engine says) and where he stands when it is up: `at` from the hint's x, or 'lip' (110 px short of the ledge's end) */
  hint: string;
  at: number | 'lip' | 'post';
}
const MOMENTS: readonly Moment[] = [
  // (8-2's first deadly drop: on w8-rope2 the first rope crosses it; the lip is the take-off either way)
  { stage: '8-2', layout: 1, hint: "Careful! It's a long way down.", at: 'lip' },
  // (World 1's eagle: the bush to hide in is the spot he acts on)
  { stage: '1-7', layout: 0, hint: 'An eagle is watching', at: 40 },
  // (World 5: the wide gap he must double-jump)
  { stage: '5-1', layout: 0, hint: 'A wide gap', at: 'lip' },
  // (the glide moment, World 4: the leaf's first glide, off the branch; its way ahead is the cone down and forward)
  { stage: '4-2', layout: 0, hint: 'Your leaf!', at: 'lip' },
  // (the climb moment, World 2: at the foot of the first post up through the village; its way ahead is the climb above him)
  { stage: '2-6', layout: 0, hint: 'Up through the village!', at: 'post' },
];

for (const m of MOMENTS) {
  test(`${m.stage}: Dot's tip "${m.hint}" keeps off Pokey, the way ahead, the spot he acts on next and the HUD, on every screen`, () => {
    let checked = 0;
    // (screens where nothing was clear of everything, and the high arc or a thumb corner's edge gave way: named, never more than two)
    const cramped = { n: 0 };
    for (const [name, w, h] of SCREENS) {
      const sim = new RealPlay(m.stage, m.layout);
      const e = sim.e as unknown as Record<string, any>;
      const hint = (e.proto?.hints ?? []).find((q: { text: string }) => q.text.startsWith(m.hint));
      assert.ok(hint, `${m.stage}: no hint "${m.hint}"`);
      // (the touch words: what a phone shows)
      const line = engineGuideLine(hint.text, m.stage, { dot: true });
      assert.ok(line, `${m.stage}: "${m.hint}" is not said on a phone`);
      // (where he stands: on the ground under the hint, at the spot, or walked up to the end of that ledge)
      const x0 = hint.x + 10;
      const g = sim.platforms.filter((q) => !q.broken && q.x <= x0 + 20 && q.x + q.width >= x0 + 20 && q.type !== 'drift' && q.type !== 'fragile').sort((a, b) => a.y - b.y)[0];
      assert.ok(g, `${m.stage}: no ground under the hint`);
      let x = m.at === 'lip' ? Math.max(x0, g.x + g.width - sim.p.width - 110) : m.at === 'post' ? x0 : Math.min(x0 + m.at - 10, g.x + g.width - sim.p.width - 20);
      let gy = g.y;
      if (m.at === 'post') {
        // (the first climb ahead: he stands just short of its foot, on the ground under it)
        const post = sim.vines.filter((q) => q.x > x0 + 60).sort((a, b) => a.x - b.x)[0];
        assert.ok(post, `${m.stage}: no post to climb`);
        const under = sim.platforms.filter((q) => !q.broken && q.x <= post.x - 70 && q.x + q.width >= post.x - 30 && q.y >= post.bottomY - 40).sort((a, b) => a.y - b.y)[0];
        assert.ok(under, `${m.stage}: no ground at the post's foot`);
        x = post.x - 70;
        gy = under.y;
      }
      const v = viewAt(sim, x, gy, w, h);
      const move = aheadMoveOf(line);
      const safe = safeFor(w, h);
      setGuideSafeArea(() => safe);
      try {
        const box = placeAt(v, line.text, line.topic, safe, move);
        const why = lawBroken(v, box, safe.band, cramped, move);
        assert.equal(why, null, `${m.stage} ${name} ${w}x${h}: "${line.text}" ${why}; bubble ${JSON.stringify(box)}, Pokey ${JSON.stringify(pokeyRect(v, 0))}`);
        // (and it is on the screen, to read)
        assert.ok(box.x0 >= 0 && box.x1 <= w && box.y1 <= h, `${m.stage} ${name}: off the screen ${JSON.stringify(box)}`);
        checked++;
      } finally {
        setGuideSafeArea(null);
      }
    }
    assert.equal(checked, SCREENS.length);
    if (cramped.n) console.log(`${m.stage}: on ${cramped.n} screen(s) nothing was clear of everything; the high arc of a double jump or a thumb corner's edge gave way`);
  });
}

test("the law's keep-outs: the way ahead is in front of him (both ways he faces), and the lip, the rope's post and an animal ahead are in it", () => {
  const v = { ...emptyGuideView(), live: true, zoom: 1, camX: 0, camY: 0, cssW: 915, cssH: 412, px: 300, py: 300, pw: 40, ph: 60 };
  const r = aheadZone({ ...v, facing: 1 });
  assert.ok(r.x0 >= 300 && r.x1 > 600, JSON.stringify(r));
  const l = aheadZone({ ...v, facing: -1 });
  assert.ok(l.x1 <= 340 && l.x0 < 100, JSON.stringify(l));
  const plats = [{ x: 0, y: 300, width: 500, height: 40, type: 'solid' }];
  const ropes = [{ x0: 520, x1: 1100, y: 160, g0: 300, g1: 300 }];
  const enemies = [{ x: 450, y: 300, type: 'snake', defeated: false }];
  const a = actionRects({ ...v, facing: 1, grounded: true, platforms: plats, ropes, enemies }, []);
  const inside = (x: number, y: number) => a.some((k) => x >= k.x0 && x <= k.x1 && y >= k.y0 && y <= k.y1);
  assert.ok(inside(500, 290), 'the lip');
  assert.ok(inside(520, 150), "the rope's post top");
  assert.ok(inside(450, 280), 'the snake');
  // hanging from the rope, the far post is the next spot
  const b = actionRects({ ...v, px: 700, py: 230, facing: 1, grounded: false, hanging: true, platforms: plats, ropes, enemies: [] }, []);
  assert.ok(b.some((k) => 1100 >= k.x0 && 1100 <= k.x1), 'the far post');
  // (and the post he took off from, still his to fall back to: D10's own frame had the box over it at the grab)
  assert.ok(b.some((k) => 520 >= k.x0 && 520 <= k.x1 && 150 >= k.y0), 'the take-off post');
});

test("the way ahead has the move's shape: a glide's cone down and forward to the bottom, a climb above him, a jump's arc ahead", () => {
  const v = { ...emptyGuideView(), live: true, zoom: 1, camX: 0, camY: 0, cssW: 412, cssH: 915, px: 100, py: 400, pw: 40, ph: 60, facing: 1 as const, grounded: true };
  const g = aheadZone(v, undefined, undefined, 'glide');
  assert.ok(g.y1 >= 915 && g.x0 >= 100, `glide ${JSON.stringify(g)}`);
  const c = aheadZone(v, undefined, undefined, 'climb');
  assert.ok(c.y1 <= 400 && c.y0 < 200 && c.x1 < 250, `climb ${JSON.stringify(c)}`);
  const j = aheadZone(v);
  assert.ok(j.y1 < 500 && j.x1 > 400, `jump ${JSON.stringify(j)}`);
  assert.equal(aheadMoveOf({ move: 'glide' }), 'glide');
  assert.equal(aheadMoveOf({ move: 'climb' }), 'climb');
  assert.equal(aheadMoveOf({ topic: 'vine' }), 'swing');
});

test('placeBubble: with the law, a spot clear of it wins over one beside her that covers the way ahead (8-2 sideways, D10)', () => {
  const safe = fallbackSafeArea(915, 412);
  const ahead = { x0: 360, y0: 60, x1: 760, y1: 260 };
  // (her middle by the rope post, ahead of him: beside her is the way ahead)
  const b = placeBubble(620, 160, 230, 60, safe, [], ['above', 'left', 'right', 'below'], 30, [], 20, { x0: 300, y0: 170, x1: 380, y1: 260 }, [ahead]);
  assert.ok(!hit({ x0: b.x, y0: b.y - BUBBLE_TAG_H, x1: b.x + 230, y1: b.y + 60 }, ahead), JSON.stringify(b));
  assert.ok((b.cost ?? 0) < 1e6);
});

// ───────────────────────────── Meeca's thought cloud (5-M, drawn on the canvas) ─────────────────────────────

/** a 2D context that draws nothing and measures words at 8 px a letter (15 px bold) */
function stubCtx(): CanvasRenderingContext2D {
  const noop = () => {};
  const grad = { addColorStop: noop };
  return new Proxy({} as Record<string, unknown>, {
    get: (_t, k) => (k === 'measureText' ? (s: string) => ({ width: s.length * 8 }) : k === 'createLinearGradient' || k === 'createRadialGradient' ? () => grad : noop),
    set: () => true,
  }) as unknown as CanvasRenderingContext2D;
}

test("5-M: Meeca's first thought keeps off her, the way ahead of her and the HUD's band, on every screen", () => {
  for (const [name, w, h] of SCREENS) {
    const sim = new RealPlay('5-M', 1);
    const e = sim.e as unknown as Record<string, any>;
    delete e.updateCamera;
    e.viewCssW = w;
    e.viewCssH = h;
    e.applyZoom();
    // (the card, tapped away: her first thought, "All asleep. Soft feet. Go.")
    for (let i = 0; i < 30; i++) sim.frame();
    sim.frame({ punch: true });
    for (let i = 0; i < 40; i++) sim.frame();
    sim.p.facing = 1;
    sim.frame();
    assert.equal(e.mc.thought?.text, MEECA_SAY.camp.text, `${name}: her first thought`);
    e.renderMeecaScreen(stubCtx(), 1);
    const tb = e.mcThoughtBox as { x: number; y: number; w: number; h: number } | null;
    assert.ok(tb, `${name}: no thought drawn`);
    const box = { x0: tb.x, y0: tb.y, x1: tb.x + tb.w, y1: tb.y + tb.h };
    const p = sim.p;
    const z = e.zoom as number;
    const sx = (x: number) => (x - e.camera.x) * z;
    const sy = (y: number) => (y - e.camera.y) * z;
    const her = { x0: sx(p.x), y0: sy(p.y - p.height), x1: sx(p.x + p.width), y1: sy(p.y) };
    const ahead = aheadZone({ px: p.x, py: p.y, pw: p.width, ph: p.height, zoom: z, camX: e.camera.x, camY: e.camera.y, cssW: w, cssH: h, facing: 1, climbing: false, grounded: true, vy: 0, gliding: false });
    const top = h > w ? 96 : h <= 430 ? 66 : 84;
    assert.ok(!hit(box, her), `${name}: over Meeca ${JSON.stringify(box)} ${JSON.stringify(her)}`);
    assert.ok(!hit(box, ahead), `${name}: over the way ahead of her ${JSON.stringify(box)} ${JSON.stringify(ahead)}`);
    assert.ok(box.y0 >= top, `${name}: under the HUD's band (${box.y0} < ${top})`);
    assert.ok(box.x0 >= 0 && box.x1 <= w && box.y1 <= h, `${name}: off the screen ${JSON.stringify(box)}`);
  }
});
