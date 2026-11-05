/**
 * stoneHold — what holds up a stone piece the renderer is about to draw (Matt, 2026-11-05 10:39 AM ET: "Rocks can't float... I understand
 * the floating logs... Rocks shouldn't be floating"; and 10:00 AM ET: anchoring everything "is too much and it clutters the screen").
 * Pure: no canvas. The painters ask it only for pieces they draw AS STONE (World 3, 4, 7 and 9's kit slab, the painted boulder, World
 * 7's crumble frames, terrain.ts's stone looks), so the answer follows the art, not the data's style.
 *
 *   null       held already: it rests on a piece, spans bank to bank, is set into a bank's face, or tops a climb trunk or a scenery trunk
 *   column     open air, with ground within STONE_COLUMN_MAX under it: drawn on one or two columns (columnArt.ts) down to that ground
 *   kin        open air over a deeper drop, no ground, or a piece that moves: drawn as its world's platform kin (a log), which may float
 *
 * Render only: no landing moves (tools/engine/stonelock.ts holds every stage's build identical). The gate that checks the result on the
 * real draw is tools/engine/stonecheck.mjs.
 */
import type { Platform } from './types.ts';

/** the deepest open drop a stone piece is drawn on columns over (world px from its underside to the ground); deeper, it becomes kin */
export const STONE_COLUMN_MAX = 300;

export type StoneHold = null | { kind: 'column'; cols: Array<{ x: number; w: number; bottom: number }> } | { kind: 'kin' };

interface Climb { vineType?: string; x: number; topY: number; bottomY?: number; rope?: boolean }
interface Trunk { x: number; topY: number; bottomY: number; w?: number }

const rockish = (q: Platform) => (q.height === 50 && q.style === 'moss_stone') || q.art === 'rock';
const ground = (q: Platform) => !q.broken && (q.height >= 50 || !!q.soil) && !rockish(q) && q.type !== 'moving';
const solidish = (q: Platform) => !q.broken && q.type !== 'moving' && q.type !== 'drift';
const meets = (p: Platform, q: Platform, side: number) => q !== p && (side < 0 ? Math.abs(q.x + q.width - p.x) <= 6 : Math.abs(p.x + p.width - q.x) <= 6);

const cache = new WeakMap<Platform, { n: number; hold: StoneHold }>();

/** the stage's whole piece list, climbs and trunks (engine.ts at stage start): terrain.ts is handed only the pieces it draws */
let stage: { platforms: readonly Platform[]; climbs: readonly Climb[]; trunks: readonly Trunk[] } = { platforms: [], climbs: [], trunks: [] };
export function setStoneStage(platforms: readonly Platform[], climbs: readonly Climb[], trunks: readonly Trunk[]) {
  stage = { platforms, climbs, trunks };
}
/** stoneHold against the stage set by setStoneStage */
export function stoneHoldInStage(p: Platform): StoneHold {
  return stoneHold(p, stage.platforms, stage.climbs, stage.trunks);
}

/** what holds stone piece p up, among the stage's platforms, climb trunks and scenery trunks (cached per piece and stage size) */
export function stoneHold(p: Platform, platforms: readonly Platform[], climbs: readonly Climb[] = [], trunks: readonly Trunk[] = []): StoneHold {
  const hit = cache.get(p);
  if (hit && hit.n === platforms.length) return hit.hold;
  const hold = judge(p, platforms, climbs, trunks);
  cache.set(p, { n: platforms.length, hold });
  return hold;
}

function judge(p: Platform, platforms: readonly Platform[], climbs: readonly Climb[], trunks: readonly Trunk[]): StoneHold {
  // (a piece that moves is in the air by its nature: never a rock)
  if (p.type === 'moving' || p.drift) return { kind: 'kin' };
  const b = p.y + p.height;
  const x0 = p.x, x1 = p.x + p.width;
  // rests on a piece
  for (const q of platforms) if (q !== p && solidish(q) && q.x < x1 - 4 && q.x + q.width > x0 + 4 && b - 2 <= q.y && q.y <= b + 4) return null;
  // tops a climb trunk (a perch) or stands on a scenery trunk
  for (const v of climbs) if (v.vineType === 'tree_climb' && !v.rope && v.x >= x0 - 4 && v.x <= x1 + 4 && Math.abs(v.topY - p.y) <= 30) return null;
  for (const t of trunks) {
    const half = 42 * (t.w ?? 1);
    if (t.x + half > x0 + 8 && t.x - half < x1 - 8 && t.topY <= p.y + 10 && t.bottomY >= b) return null;
  }
  // set into a bank's face, or a row of pieces end to end that meets a bank (or a held piece) at both ends
  const face = (q: Platform, side: number) => platforms.some((z) => ground(z) && meets(q, z, side) && z.y <= q.y + q.height && z.y + z.height >= q.y + q.height);
  const row = [p];
  for (const side of [-1, 1]) {
    let cur = p;
    for (let k = 0; k < 40; k++) {
      const nx = platforms.find((q) => !row.includes(q) && solidish(q) && q.height < 50 && meets(cur, q, side) && Math.abs(q.y - cur.y) <= 6);
      if (!nx) break;
      if (side < 0) row.unshift(nx);
      else row.push(nx);
      cur = nx;
    }
  }
  const end = (q: Platform, side: number) => face(q, side) || platforms.some((z) => meets(q, z, side) && !row.includes(z) && solidish(z) && Math.abs(z.y - q.y) <= 6 && ground(z));
  if (end(row[0], -1) && end(row[row.length - 1], 1)) return null;
  if (row.length === 1 && (face(p, -1) || face(p, 1))) return null;
  // open air: columns down to the ground if it is near enough and nothing stands in the way, else its kin
  const cw = Math.max(34, Math.min(64, Math.round(p.width * 0.36)));
  const at = p.width <= 240 ? [p.x + p.width / 2] : [p.x + p.width * 0.22, p.x + p.width * 0.78];
  const cols = at.map((cx) => ({ x: Math.round(cx - cw / 2), w: cw, bottom: 0 }));
  for (const c of cols) {
    let first: Platform | null = null;
    for (const q of platforms) {
      if (q === p || !solidish(q) || q.y <= b || q.x >= c.x + c.w || q.x + q.width <= c.x) continue;
      if (!first || q.y < first.y) first = q;
    }
    if (!first || !ground(first) || first.y - b > STONE_COLUMN_MAX) return { kind: 'kin' };
    c.bottom = first.y;
  }
  return { kind: 'column', cols };
}
