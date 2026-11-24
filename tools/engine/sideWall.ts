// R-165.434: an invisible wall. A solid Pokey meets SIDE-ON must look different from the backdrop behind it. BUILD-26s found 2-6's
// soft-pit faces (24 x 94 solids under each lip) handed to the painted bank (protoArt.ts bankPainted: any block 90 px or taller),
// which paints only its soil fill there: no lip, no end, the same soil as the backdrop behind, so the wall cannot be seen.
//
// The rule reads the collider list and the SAME draw decision the screen uses (terrain.ts footingOf, as paintFall.ts does): a block is
// a side-on wall when one of its sides is open (no other solid touching that side) over at least his body's height; a side-on wall
// drawn as 'painted-bank' must be at least as wide as his body: the painter shows a bank against the soil behind by its lip and its end
// cap, and a block narrower than him gets soil fill only. A breach is a side-on wall the painted ground paints as backdrop soil.
// Evidence (TOOLS-1124b survey, 3 seeds a stage, both settings, 612 builds): main 0 breaches; 2-6 at b6a35d7e8 96, every one a 24 x 94
// soft-pit face. The 44 is his body's width, not a number read from the painter (a top-buried clause was tried and dropped: 797 hits on
// main, all wide banks with a piece resting on them, which draw fine). Wired into paintcheck.ts with NO known list (the lead, R-165.434).
// Planted: tools/engine/sideWall.test.ts (a 2-6 face added to main's 2-6 is RED; the stage as built and a body-wide block are GREEN).
import { footingOf, type FootingInput } from '../../src/game/terrain.ts';
import type { Platform } from '../../src/game/types.ts';

/** his body's collider (physics.ts / tower.ts BODY_H and engine.ts's 44 px width) */
export const BODY_H = 48, BODY_W = 44;

export interface SideWall { id: number; x: number; y: number; w: number; h: number; style: string; side: 'left' | 'right'; open: number; why: string }

/** the longest run of y in [y0, y1) not covered by the given spans */
function longestOpen(y0: number, y1: number, spans: Array<readonly [number, number]>): number {
  const s = spans.map(([a, b]) => [Math.max(a, y0), Math.min(b, y1)] as const).filter(([a, b]) => b > a).sort((p, q) => p[0] - q[0]);
  let best = 0, at = y0;
  for (const [a, b] of s) { if (a > at) best = Math.max(best, a - at); at = Math.max(at, b); }
  return Math.max(best, y1 - at);
}

export function sideWalls(platforms: readonly Platform[], f: FootingInput): SideWall[] {
  const solid = platforms.filter((p) => p.type !== 'bouncy' && !p.broken);
  const out: SideWall[] = [];
  for (const p of solid) {
    if (p.height < BODY_H) continue;
    if (footingOf(p, f).drawn !== 'painted-bank') continue;
    if (p.width >= BODY_W) continue;
    const others = solid.filter((q) => q !== p);
    for (const side of ['left', 'right'] as const) {
      const x = side === 'left' ? p.x - 1 : p.x + p.width + 1;
      const spans = others.filter((q) => q.x <= x && q.x + q.width >= x).map((q) => [q.y, q.y + q.height] as const);
      const open = longestOpen(p.y, p.y + p.height, spans);
      if (open < BODY_H) continue;
      const why = `painted as bank soil, narrower than his body (${BODY_W})`;
      out.push({ id: p.id, x: Math.round(p.x), y: Math.round(p.y), w: Math.round(p.width), h: Math.round(p.height), style: p.style ?? '-', side, open: Math.round(open), why });
    }
  }
  return out;
}
