/**
 * E3's support check, its secondary half (Matt, 2026-11-05: "if they're part of the platforms, they can float... I just don't want
 * secondary objects like rocks and other things, lily pads, to be floating"): every dressing prop a builder places, in every list the
 * game draws them from (proto.dress and dress: dressArt.ts; proto.mixDress: w1NewArt.ts; proto.kitDecor: puzzleArt.ts; proto.decor:
 * riverArt.ts; proto.w3decor: w3Art.ts; proto.bushes), judged by its family's footing (the designer's labels, catalog.ts PROP_FAMILIES):
 *   - fly: may sit in open air;
 *   - hang: hangs from a landing or a trunk at its top (dressArt draws a hanging piece from its anchor, b);
 *   - water: on a water surface (a river, a water zone) or a landing at its bank edge;
 *   - every other family: its foot (b) on a landing's top, under its middle half.
 * Moved here from tools/engine/propsupport.ts (which now calls it) so stage.ts gates it and a test can plant a floating prop. The
 * landings' own secondaries (stones, mushrooms, lily pads) are support.ts's.
 */
import { dressSize } from '../dressArt.ts';
import { CLUE_NAME, CLUE_W, w1DressWidth } from '../w1NewArt.ts';
import { propFamily } from './catalog.ts';

/** pieces that are part of a drawn structure the landing list does not hold (a W2 bank house, W2's canopy over it, World 3's cave
 *  ceiling and walls): they rest on that structure, so this check cannot judge them from the landings; counted apart */
export const PROP_STRUCTURE: Record<string, string> = {
  'proto.decor:porch': 'part of a W2 bank house', 'proto.decor:window': 'part of a W2 bank house', 'proto.decor:door': 'part of a W2 bank house',
  'proto.decor:rooftop': 'part of a W2 bank house', 'proto.decor:chimney': 'part of a W2 bank house', 'proto.decor:limbShort': 'a limb of the W2 canopy tree',
  'proto.decor:canopy': 'the W2 canopy over the village', 'proto.w3decor:stalactite': "hangs from World 3's cave ceiling", 'proto.w3decor:mossCurtain': "hangs from World 3's cave ceiling",
  'proto.w3decor:wallTile': "World 3's cave wall", 'proto.w3decor:glowLit': "a glow on World 3's cave wall",
};
export interface PropItem { n: string; x: number; b: number; w?: number; list: string }
export interface PropBreach extends PropItem { family: string; why: string }

/** every prop a built stage draws, as centre x, foot b and width (all are drawn centred on x but the bushes, which run from x over their
 *  width; a kit piece with `far` is the distant backdrop, drawn in parallax, and stands on nothing in the play layer: not listed) */
export function propItems(s: any): PropItem[] {
  return [
    ...(s.proto?.dress ?? s.dress ?? []).map((d: any) => ({ n: d.n, x: d.x, b: d.b, list: s.proto?.dress ? 'proto.dress' : 'dress' })),
    ...(s.proto?.mixDress ?? []).map((d: any) => ({ n: d.n, x: d.x, b: d.b, w: w1DressWidth(d.n) || undefined, list: 'proto.mixDress' })),
    ...(s.proto?.kitDecor ?? []).filter((d: any) => !d.far).map((d: any) => ({ n: d.n, x: d.x, b: d.b, w: d.w, list: 'proto.kitDecor' })),
    ...(s.proto?.decor ?? []).map((d: any) => ({ n: d.n ?? d.cel, x: d.x, b: d.b, w: d.w, list: 'proto.decor' })),
    ...(s.proto?.w3decor ?? []).map((d: any) => ({ n: d.n, x: d.x, b: d.b, w: d.w, list: 'proto.w3decor' })),
    ...(s.proto?.bushes ?? []).map((d: any) => ({ n: d.kind ?? 'bush', x: d.x + d.w / 2, b: d.y, w: d.w, list: 'proto.bushes' })),
  ].filter((d) => d.n && Number.isFinite(d.x) && Number.isFinite(d.b));
}

/** the props over air on a built stage; `onStructure` and `unlabelled` collect what this check cannot judge (never passed, never failed) */
export function propBreaches(s: any, out: { onStructure?: Record<string, number>; unlabelled?: Set<string> } = {}): PropBreach[] {
  const P: any[] = s.platforms ?? [];
  const trunks: any[] = [...(s.trees ?? []), ...(s.proto?.trunks ?? [])];
  const water: Array<{ x0: number; x1: number; y: number }> = [...(s.rivers ?? []).map((r: any) => ({ x0: r.x0, x1: r.x1, y: r.surfaceY })), ...(s.proto?.water ?? [])];
  const bad: PropBreach[] = [];
  for (const d of propItems(s)) {
    const struct = PROP_STRUCTURE[`${d.list}:${d.n}`];
    if (struct) { if (out.onStructure) out.onStructure[struct] = (out.onStructure[struct] ?? 0) + 1; continue; }
    const fam = propFamily(d.n);
    if (!fam) { out.unlabelled?.add(d.n); continue; }
    if (fam.family === 'fly') continue;
    let sz = { w: d.w ?? 60, h: 60 }; if (d.w === undefined) try { sz = dressSize(d.n as never); } catch { /* no frame: 60 px */ }
    const mid0 = d.x - sz.w / 4, mid1 = d.x + sz.w / 4;
    // (on a piece's top, never hung under it: on a thin piece, a log or a bough 24 px thick, a foot lower than 60% of its thickness is at
    // its underside, a prop hung under it (the lead, 11-05: a mushroom stalk under a floating log on the mixed 1-1); 30 px into a deep bank)
    const onTop = P.some((p) => p.x <= mid1 && p.x + p.width >= mid0 && d.b - p.y >= -12 && d.b - p.y <= Math.min(30, (p.height ?? 24) * 0.6));
    let ok = onTop, why = 'nothing under its foot';
    if (fam.family === 'hang') { ok = P.some((p) => p.x <= d.x + 10 && p.x + p.width >= d.x - 10 && d.b >= p.y - 10 && d.b <= p.y + (p.height ?? 24) + 30) || trunks.some((t) => Math.abs((t.x ?? 0) + (t.width ?? 0) / 2 - d.x) < 120); why = 'nothing to hang from at its top'; }
    if (fam.family === 'water') { ok = onTop || water.some((z) => d.x >= z.x0 && d.x <= z.x1 && Math.abs(d.b - z.y) <= 24); why = 'no water surface or bank under it'; }
    if (!ok) bad.push({ ...d, x: Math.round(d.x), b: Math.round(d.b), family: fam.family, why });
  }
  return bad;
}

/**
 * Nothing dressed over the way out (the lead, 11-05, on the mixed 1-1's upright still: a big white frond over the door's right post): no
 * dressing piece's drawn box overlaps the exit door's (sanctuaryDoor.ts: the world's painted gate, GATE_H tall, its ground at the stage's
 * exitTotemY; DOOR_HALF either side of exitTotemX, the gate's posts with a little room). A flat decal on the ground in front of it (the
 * bootprint) lies under the door's ground line, so it never counts.
 */
export const DOOR_HALF = 140, DOOR_H = 250;
export function dressOverDoor(s: any): PropItem[] {
  return propItems(s).filter((d) => inDoorBox(d, s));
}
/** a dressing piece's drawn box inside the exit door's (the door gate's own box: dressOverDoor; protoStage.ts placeDress keeps clear of it) */
export function inDoorBox(d: { n: string; x: number; b: number; w?: number }, s: { exitTotemX?: number; exitTotemY?: number }): boolean {
  const x = s.exitTotemX!, g = s.exitTotemY!;
  if (!(x > 0) || !Number.isFinite(g)) return false;
  const d0 = x - DOOR_HALF, d1 = x + DOOR_HALF, top = g - DOOR_H;
  let sz = { w: d.w ?? 60, h: 60 }; if (d.w === undefined) try { sz = dressSize(d.n as never); } catch { /* no frame: 60 px */ }
  // (the clue decal lies flat from the piece top down, CLUE_H deep: w1NewArt.ts cluePlace)
  if (d.n === CLUE_NAME) sz = { w: CLUE_W, h: 0 };
  const x0 = d.x - sz.w / 2, x1 = d.x + sz.w / 2, y0 = d.b - sz.h, y1 = d.b;
  return x1 > d0 && x0 < d1 && y1 > top && y0 < g - 2 && sz.h > 0;
}

/**
 * Nothing dressed THROUGH a thin platform (the lead, 11-05, on a still of the mixed 1-1: a tall mushroom standing on a pit's floor drawn
 * up behind a small floating log reads as one hung under it): no dressing piece's drawn box crosses a thin platform (a log, a bough, a
 * plank: 40 px or less) that it does not stand on. Flat decals (the clue) and flyers never count.
 */
export function dressThroughPlatform(s: any): PropBreach[] {
  const thin = (s.platforms ?? []).filter((p: any) => !p.broken && (p.height ?? 24) <= 40);
  const out: PropBreach[] = [];
  for (const d of propItems(s)) {
    if (d.n === CLUE_NAME || PROP_STRUCTURE[`${d.list}:${d.n}`]) continue;
    const fam = propFamily(d.n);
    if (!fam || fam.family === 'fly' || fam.family === 'hang') continue;
    let sz = { w: d.w ?? 60, h: 60 }; if (d.w === undefined) try { sz = dressSize(d.n as never); } catch { /* no frame: 60 px */ }
    const x0 = d.x - sz.w / 3, x1 = d.x + sz.w / 3, top = d.b - sz.h * 0.85;
    const hit = thin.find((p: any) => p.x < x1 && p.x + p.width > x0 && p.y + (p.height ?? 24) > top && p.y + (p.height ?? 24) < d.b - 6);
    if (hit) out.push({ ...d, x: Math.round(d.x), b: Math.round(d.b), family: fam.family, why: `drawn through a ${Math.round(hit.width)} px platform at y ${Math.round(hit.y)} it does not stand on` });
  }
  return out;
}
