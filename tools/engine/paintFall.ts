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
import { paintedPlatforms } from '../../src/game/protoArt.ts';
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

/** the block's look and behaviour without where it is or how big: two blocks with the same key are painted at the same heights */
function key(p: Platform): string {
  const { id: _i, x: _x, y: _y, width: _w, height: _h, ...rest } = p as Platform & Record<string, unknown>;
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
