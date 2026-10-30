/**
 * The world map's painted trail (Matt, 2026-10-30: each world's trail its own painted look): where each painted piece goes along the
 * path between the stages. The path is the map's own smooth curve (Catmull-Rom through the stage points, as WorldMap.tsx draws it);
 * pieces are laid an even distance apart along it, each turned to follow it, with the stretch (the stage before it) it belongs to, so
 * a cleared stretch can show in full colour and the road still ahead dimmed.
 */
export interface Pt {
  x: number;
  y: number;
}
export interface TrailStamp {
  x: number;
  y: number;
  /** degrees, the way the trail runs */
  angle: number;
  /** the stretch: 0 runs from the first stage to the second */
  seg: number;
  /** which of the world's pieces (0..3), in a fixed order so the trail never shuffles between draws */
  v: number;
}

/** the cubic for stretch i of the curve through pts (the same control points as WorldMap's curve()) */
function cubic(pts: Pt[], i: number): [Pt, Pt, Pt, Pt] {
  const p0 = pts[i - 1] || pts[i];
  const p1 = pts[i];
  const p2 = pts[i + 1];
  const p3 = pts[i + 2] || p2;
  return [p1, { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 }, { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 }, p2];
}

function at(c: [Pt, Pt, Pt, Pt], t: number): Pt {
  const u = 1 - t;
  return {
    x: u * u * u * c[0].x + 3 * u * u * t * c[1].x + 3 * u * t * t * c[2].x + t * t * t * c[3].x,
    y: u * u * u * c[0].y + 3 * u * u * t * c[1].y + 3 * u * t * t * c[2].y + t * t * t * c[3].y,
  };
}

/** the pieces along the whole trail, `spacing` apart (measured along the curve), starting half a spacing in */
export function trailStamps(pts: Pt[], spacing: number): TrailStamp[] {
  const out: TrailStamp[] = [];
  if (pts.length < 2 || !(spacing > 0)) return out;
  let next = spacing / 2;
  let walked = 0;
  let n = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const c = cubic(pts, i);
    const STEPS = 48;
    let prev = at(c, 0);
    for (let k = 1; k <= STEPS; k++) {
      const p = at(c, k / STEPS);
      const len = Math.hypot(p.x - prev.x, p.y - prev.y);
      while (len > 0 && walked + len >= next) {
        const f = (next - walked) / len;
        out.push({ x: prev.x + (p.x - prev.x) * f, y: prev.y + (p.y - prev.y) * f, angle: (Math.atan2(p.y - prev.y, p.x - prev.x) * 180) / Math.PI, seg: i, v: (n * 3 + (n >> 2)) % 4 });
        n++;
        next += spacing;
      }
      walked += len;
      prev = p;
    }
  }
  return out;
}
