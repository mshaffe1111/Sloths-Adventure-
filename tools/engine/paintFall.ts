// R-165.292: a block whose style HAS a painter, drawn instead by code terrain because its size is outside what that painter draws (the
// fall-through). Matt's rule: anything that carries the look is painted (STAGE-RULES §4); VAR-1b found 1-7's landing log grown to 53 px
// drawn as a flat code slab ('ground') on 16/16 rolls, because protoArt.ts paints a moss stone only at exactly 50 px and a bank only from
// 90 px (or a soil bank), and nothing caught it.
//
// The rule reads the SAME decision the screen draws by: terrain.ts footingOf (it follows the engine's order: protoArt.ts
// paintedPlatforms takes the painted kit's pieces first, then terrain.ts terrainLook, the one function renderWorldObjects reads). A
// style "has a painter" in a stage when the same block (same style, type and flags) at SOME other height is drawn by a painter there; that
// is probed through the same two functions, so a painter's limit is read from the code, never typed here.
//
// Not a breach, on purpose: a style with NO painter at any height in that stage (the size is not the cause: no size would paint it, so it is
// missing art, a catalog and STAGE-RULES §4 question for Content, listed by the sweep as `unpainted` so it is seen, not hidden); a stage
// whose painted kit is off (a boss lair: engine.ts paintKit), where no painter runs at all.
import { footingOf, type FootingInput } from '../../src/game/terrain.ts';
import { groundBanks, groundCeilings, groundLine, groundSoil, insideOutline, paintedPlatforms, soilCover, SOIL_JOIN, SOIL_ROOM } from '../../src/game/protoArt.ts';
import { depthRuns, type DepthAt } from '../../src/game/groundPaint.ts';
import { ceilingAt, ceilingsOver, type Ceiling } from '../../src/game/groundStack.ts';
import type { Platform } from '../../src/game/types.ts';

/** what terrain draws by code (terrain.ts terrainLook): the ground, step, pillar and earth bodies, the code-drawn thin ledge sprites
 *  (platformArt.ts drawThin over thinArt.ts) and the floating islands. Every other footing is a painter, a piece's own art, or a drawer
 *  with its own look (bounce, fragile, drift, moving, bridge, river art, set piece) that a size cannot push into code terrain. */
export const CODE_TERRAIN: ReadonlySet<string> = new Set(['ground', 'step', 'pillar', 'earth', 'thin', 'island-log', 'island-slab', 'island-earth']);

/** the heights a painter is probed at: every whole unit up to the tallest block a stage lays (a bank reaches 400) */
export const PROBE_MAX = 420;

export interface PaintFall {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  style: string;
  type: string;
  /** what the screen draws it as (code terrain) */
  drawn: string;
  /** the heights this style's painter draws in this stage, as ranges ("1-49, 50, 90-420") */
  painter: string;
  /** the nearest height the painter draws */
  nearest: number;
}

/** whole heights in ranges: [1,2,3,50,90,91] -> "1-3, 50, 90-91" */
export function ranges(hs: number[]): string {
  const out: string[] = [];
  for (let i = 0; i < hs.length; ) {
    let j = i;
    while (j + 1 < hs.length && hs[j + 1] === hs[j] + 1) j++;
    out.push(i === j ? `${hs[i]}` : `${hs[i]}-${hs[j]}`);
    i = j + 1;
  }
  return out.join(', ');
}

/** the block's look and behaviour without where it is, how big or which laid piece it came from (`tag`: no painter reads it, terrain.ts,
 *  protoArt.ts, platformPlan.ts, w1Pits.ts): two blocks with the same key are painted at the same heights */
function key(p: Platform): string {
  const { id: _i, x: _x, y: _y, width: _w, height: _h, tag: _t, ...rest } = p as Platform & Record<string, unknown>;
  return JSON.stringify(rest);
}

/** the heights at which this block, as it is in every other way, is drawn by something other than code terrain */
function paintedHeights(p: Platform, f: FootingInput, cache: Map<string, number[]>): number[] {
  const k = key(p);
  const hit = cache.get(k);
  if (hit) return hit;
  const out: number[] = [];
  for (let h = 1; h <= PROBE_MAX; h++) {
    const q = { ...p, id: -1_000_000 - h, height: h } as Platform;
    const drawn = footingOf(q, { ...f, painted: paintedPlatforms([q]) }).drawn;
    if (!CODE_TERRAIN.has(drawn)) out.push(h);
  }
  cache.set(k, out);
  return out;
}

export interface PaintFallResult {
  breaches: PaintFall[];
  /** styles drawn by code terrain with no painter at any height in this stage (not a breach: see the header) */
  unpainted: Array<{ id: number; x: number; style: string; h: number; drawn: string }>;
}

/** every fall-through on a built stage, given the footing input the engine gives terrain (terrain.ts footingsFor) */
export function paintFalls(platforms: Platform[], f: FootingInput, cache: Map<string, number[]> = new Map()): PaintFallResult {
  const breaches: PaintFall[] = [];
  const unpainted: PaintFallResult['unpainted'] = [];
  for (const p of platforms) {
    const drawn = footingOf(p, f).drawn;
    if (!CODE_TERRAIN.has(drawn)) continue;
    const hs = paintedHeights(p, f, cache);
    if (!hs.length) {
      unpainted.push({ id: p.id, x: Math.round(p.x), style: p.style ?? '-', h: p.height, drawn });
      continue;
    }
    const nearest = hs.reduce((a, b) => (Math.abs(b - p.height) < Math.abs(a - p.height) ? b : a));
    breaches.push({ id: p.id, x: Math.round(p.x), y: Math.round(p.y), w: Math.round(p.width), h: p.height, style: p.style ?? '-', type: p.type, drawn, painter: ranges(hs), nearest });
  }
  return { breaches, unpainted };
}

// R-165.441 (D136): a painted bank's top, or the room for him over it, under a LATER-painted bank's soil. drawGround paints the banks
// lowest first and a bank's soil ran on down out of sight, so a high bank's soil was one column over every floor under it (SHIPPED 1-4's
// summit: a dark pillar through the sky the whole height of the climb, the start floor's lip cut; 2-6 beat A: a porch's lip erased),
// and the rule above passed both: it reads which drawer a block is ASSIGNED to, never what reaches the screen. This one reads the soil
// as drawn: protoArt.ts groundSoil, the outlines drawGround cuts each bank's soil to, in its paint order.
// Not a breach, on purpose: where two banks' soils meet (SOIL_JOIN units, a unit past an end either side), and a tuck (a gap under his
// height: a pit's floor under its walls, painted first so the walls' faces cover its ends).
export interface SoilOver {
  /** the later-painted bank whose soil covers */
  over: { id: number; x: number; y: number; w: number; h: number };
  /** the bank whose top (or the room for him over it) is covered */
  under: { id: number; x: number; y: number; w: number };
  /** units of that top covered */
  covered: number;
  /** the room between the two (the under bank's top less the over bank's bottom) */
  gap: number;
}

/** every painted bank's top under a later-painted bank's soil, on a built stage with its paint state set (paintStage.ts) */
/** a stage with a stacked leg (2-7): the soil as drawn is clipped clear of the air under each ceiling over its bank (protoArt.ts drawGround
 *  clipAbove), so a point under the ceiling's line is no soil; set the stage's stack zones first, as engine.ts does (paintcheck.ts) */
const airUnder = (cs: readonly Ceiling[]) => (x: number, y: number) => cs.some((c) => y >= ceilingAt(c, x));

export function soilOvers(platforms: Platform[], regions = groundSoil(groundBanks(platforms), undefined, groundCeilings(platforms)), cs: readonly Ceiling[] = groundCeilings(platforms)): SoilOver[] {
  const out: SoilOver[] = [];
  const box = regions.map((r) => {
    let x0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const [x, y] of r.pts) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
    return { x0, x1, y1 };
  });
  for (let i = 0; i < regions.length; i++) {
    const a = regions[i].p;
    for (let j = 0; j < i; j++) {
      const b = regions[j].p;
      const gap = b.y - (a.y + a.height);
      if (b === a || gap < SOIL_ROOM || box[i].y1 < b.y - SOIL_ROOM || Math.min(box[i].x1, b.x + b.width) - Math.max(box[i].x0, b.x) <= SOIL_JOIN) continue;
      const over = cs.length ? ceilingsOver(a, cs) : [];
      const n = soilCover(regions[i].pts, b, over.length ? airUnder(over) : undefined);
      if (n > SOIL_JOIN) out.push({ over: { id: a.id, x: Math.round(a.x), y: Math.round(a.y), w: Math.round(a.width), h: a.height }, under: { id: b.id, x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width) }, covered: n, gap: Math.round(gap) });
    }
  }
  return out;
}

// (INT-R5d, 11-25: R-165.441 x the stacked legs) a bank a stacked leg's ceiling runs under whose drawn soil stops SHORT of that ceiling's
// line: the backdrop shows between its bottom and the ceiling's underside. The soil fix (cut from main, no stacked leg) hung 2-7's upper-leg
// banks: their soil stopped at their own bottom over a second underside, 120+ over the line where the release drew the ceiling's own
// underside (normal layout 0, bank #1 x 3881-4521: bottom 917, the line 1039 and down). Read from the soil as drawn (groundSoil with
// the stage's ceilings): sampled across the bank, clear of its ends (an end's face curves in), where the line runs under its collider.
export interface SoilShort {
  bank: { id: number; x: number; y: number; w: number; h: number };
  /** units of the bank's width whose soil stops short of the ceiling's line */
  short: number;
  /** the most backdrop between the soil and the line (units) */
  gap: number;
}
const SHORT_STEP = 8, SHORT_END = 40, SHORT_MIN = 48;
// (where a bank's soil ENDS: under its collider's foot, within his height, with the line lower still. A soil that runs on (drawn to the
// line and clipped there) never ends there except where an open end's face leans in past x, a few samples at most: a breach needs more
// than his width, SHORT_MIN, of the bank short)
export function soilShorts(platforms: Platform[], cs: readonly Ceiling[] = groundCeilings(platforms), regions = groundSoil(groundBanks(platforms), undefined, cs)): SoilShort[] {
  const out: SoilShort[] = [];
  if (!cs.length) return out;
  for (const { p, pts } of regions) {
    const over = ceilingsOver(p, cs);
    if (!over.length) continue;
    const foot = p.y + p.height, high = Math.max(p.y + 10, foot - 40);
    let short = 0, gap = 0;
    for (let x = p.x + SHORT_END; x <= p.x + p.width - SHORT_END; x += SHORT_STEP) {
      const lines = over.filter((c) => x >= c.x0 && x <= c.x1).map((c) => ceilingAt(c, x));
      if (!lines.length) continue;
      const line = Math.min(...lines);
      if (line <= foot + 2) continue;
      const low = Math.min(line - 2, foot + SOIL_ROOM);
      if (!insideOutline(pts, x, high) || insideOutline(pts, x, low)) continue;
      // (where it ends, over that line)
      let y = low;
      while (y > high && !insideOutline(pts, x, y)) y -= 2;
      short += SHORT_STEP; gap = Math.max(gap, Math.round(line - y));
    }
    if (short > SHORT_MIN) out.push({ bank: { id: p.id, x: Math.round(p.x), y: Math.round(p.y), w: Math.round(p.width), h: p.height }, short, gap });
  }
  return out;
}

/**
 * R-165.451 (2-6's beat A, the lead 11-25): a straight-sided lighter block in a bank's soil. The darkening with depth is drawn in bands
 * that follow the ground line (groundPaint.ts shadeSoil over depthRuns, the line protoArt.ts groundLine sets while it paints a square);
 * where two neighbouring bands start their darkening far apart, the soil shows a straight vertical edge between them. On t-build-26 a hung
 * bank's top (2-6's storeys, thousands of px up) stood in the line, and under the start floor's soil the darkening's start jumped 192-224
 * px at x 1040-1056 and 176-192: the block (FIX-SOIL-b c22702edc left hung banks out of the line, R-165.441). The gate reads the bands as
 * the square painter draws them: the same line built from the same banks and ceilings (protoArt.ts paintTile), cut by the same function.
 */
export interface DepthStep {
  x: number;
  y: number;
  bank: string;
  /** how far the darkening's start moves between the two bands (px) */
  jump: number;
}
/** the most the darkening's start may move between two neighbouring bands (px): the eased line over LINE_REACH moves it at most a few
 *  px a strip; the block was 176-224 */
export const DEPTH_STEP_MAX = 48;
export function depthSteps(platforms: readonly Platform[], line?: DepthAt): DepthStep[] {
  const banks = groundBanks(platforms);
  const at = line ?? groundLine(banks as Platform[], groundCeilings(platforms, banks));
  const out: DepthStep[] = [];
  for (const b of banks) {
    const r = depthRuns(b.x, b.x + b.width, at);
    for (let i = 1; i < r.length; i++) {
      const a = r[i - 1], c = r[i];
      const jump = Math.abs(c.vt + (c.vb - c.vt) * 0.5 - (a.vt + (a.vb - a.vt) * 0.5));
      if (jump > DEPTH_STEP_MAX) out.push({ x: Math.round(c.x0), y: Math.round(b.y), bank: `${Math.round(b.x)}-${Math.round(b.x + b.width)}@${Math.round(b.y)}`, jump: Math.round(jump) });
    }
  }
  return out;
}
