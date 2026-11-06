/**
 * E3's support check (Matt, 11-05: "Rocks can't float"): every landing whose label says it may not float (the designer's LABELS, read
 * per world: catalog.ts mayFloatIn) has its drawn body end on something solid: a landing's top, a drawn water surface, or the stage's
 * floor, within 8 px under it anywhere along its width. What is drawn, and how far down, is terrain's own footing (terrain.ts
 * footingOf), so the check agrees with the screen; a piece drawn on down out of sight (a bank of earth, a stalk) stands on the ground.
 * A water piece (a lily pad, a drift log) must sit on a drawn water zone.
 */
import type { Platform } from '../types.ts';
import { footingsFor } from '../terrain.ts';
import { mayFloatIn, landingKind, LANDINGS } from './catalog.ts';

/** a piece this check cannot judge from the landings: one drawn by its own art or a set piece, which draws its own supports */
export interface SupportUnjudged { id: number; kind: string; drawn: string }
export interface SupportBreach { id: number; x: number; y: number; w: number; kind: string; drawn: string; air: number | 'pit'; why: string }
const SLACK = 8;

type Trunk = { x: number; topY: number; bottomY: number };
/** a trunk or post holds a tree piece when it stands within 220 px of it (the designer's label for boughs and creaky limbs) and reaches
 *  its underside (a post planted under a bough starts 16 px under its top; 10 px of slack). The mixer plants trunks by this same rule */
export const holds = (t: Trunk, p: { x: number; y: number; width: number }) => Math.max(p.x - t.x, t.x - (p.x + p.width), 0) <= 220 && t.topY <= p.y + 26 && t.bottomY >= p.y;
type StageIn = { platforms: Platform[]; proto?: { water?: Array<{ x0: number; x1: number; y: number }>; trunks?: Trunk[] }; trees?: Array<{ x: number; topY: number; groundY: number }>; rivers?: Array<{ x0: number; x1: number; surfaceY: number }>; config: { levelHeight: number } };
/** the check's breaches, and the pieces it cannot judge (listed apart: never passed and never failed) */
export function supportCheck(st: StageIn, world: number): { breaches: SupportBreach[]; unjudged: SupportUnjudged[] } {
  const unjudged: SupportUnjudged[] = [];
  const breaches = supportBreaches(st, world, unjudged);
  return { breaches, unjudged };
}
export function supportBreaches(st: StageIn, world: number, unjudged: SupportUnjudged[] = []): SupportBreach[] {
  const P = st.platforms.filter((p) => !p.broken);
  const feet = footingsFor(st as never, world);
  const water = [...(st.rivers ?? []).map((r) => ({ x0: r.x0, x1: r.x1, y: r.surfaceY })), ...(st.proto?.water ?? [])];
  // (a tree piece stands on a trunk: one within 220 px of it that reaches its height, the designer's label for boughs and creaky limbs)
  const trunks: Trunk[] = [...(st.proto?.trunks ?? []), ...(st.trees ?? []).map((t) => ({ x: t.x, topY: t.topY, bottomY: t.groundY }))];
  const onTrunk = (p: Platform) => trunks.some((t) => holds(t, p));
  const out: SupportBreach[] = [];
  for (const p of P) {
    const mf = mayFloatIn(p as never, world);
    const f = feet.get(p.id)!;
    const kind = landingKind(p as never)[0]?.name ?? '?';
    // (its own art or a set piece draws its own supports: not judged here)
    if (/^own art|^set piece/.test(f.drawn)) { if (mf === 'no' || mf === 'water') unjudged.push({ id: p.id, kind, drawn: f.drawn }); continue; }
    if (mf === 'water') {
      // (a drift log rides its track over the river, starting under a bank: its track is what must be on water)
      const d = (p as Platform & { drift?: { x0: number; x1: number } }).drift;
      const x0 = d ? d.x0 : p.x, x1 = d ? d.x1 : p.x + p.width;
      if (!water.some((z) => x0 < z.x1 && x1 > z.x0 && Math.abs(p.y + p.height - z.y) <= 24 + p.height)) out.push({ id: p.id, x: p.x, y: p.y, w: p.width, kind, drawn: f.drawn, air: 'pit', why: 'a water piece off any drawn water' });
      continue;
    }
    if (mf !== 'no' || !Number.isFinite(f.bodyBottom)) continue;
    const el = LANDINGS.find((k) => k.match(p as never))?.element;
    if ((el === 'tree' || kind === 'bough') && !(kind === 'bough' && [3, 4, 7, 9].includes(world)) && onTrunk(p)) continue;
    const bottom = f.bodyBottom;
    const under = [
      ...P.filter((q) => q !== p && q.x < p.x + p.width && q.x + q.width > p.x && q.y >= bottom - SLACK).map((q) => q.y),
      ...water.filter((z) => z.x0 < p.x + p.width && z.x1 > p.x && z.y >= bottom - SLACK).map((z) => z.y),
      // (a piece it stands on whose body reaches past its drawn bottom: a stone step seated on a deep bank, its drawn earth sunk into the
      // bank's, gen2 1-1's rolls: the bank holds it; one standing clear of it over air is still judged, support.test.ts plants both)
      ...P.filter((q) => q !== p && q.x < p.x + p.width && q.x + q.width > p.x && Math.abs(q.y - (p.y + p.height)) <= SLACK && q.y + q.height >= bottom).map(() => bottom),
    ];
    const near = Math.min(...under, st.config.levelHeight);
    if (near - bottom > SLACK) out.push({ id: p.id, x: p.x, y: p.y, w: p.width, kind, drawn: f.drawn, air: under.length ? Math.round(near - bottom) : 'pit', why: 'a piece that never floats with open air under its drawn body' });
  }
  return out;
}
