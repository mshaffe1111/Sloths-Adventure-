/**
 * gen2/dark — THE DARK as one brick any world lays (ENG-DARK, R-165.449; WORLD-3-PLAN F2): a stretch of `dark` zone (zones.ts) between two
 * props on a section's pieces (`darkEnds`), with its lights. LIFTED from World 6's darkZone (w6Swing.ts, which re-exports these names, so
 * Worlds 6 and 8 lay the same stretch, light for light: lockall). The end prop says which light hangs in it:
 *   - FIREFLY ('darkTo', Worlds 6 and 8): always lit, over the middle of every gap at the dark's ground, and dimmer ones along the way;
 *   - BARE ('darkToBare'): none (a room's own glow);
 *   - GLOW ('darkToGlow', World 3): sleeping glowworms (zones.ts GLOW_REACH: standing still wakes those within reach, up AND down from
 *     his feet), one over the landing of every rim in the stretch: a stop at a rim wakes the landing under it, never the whole shaft.
 *
 * THE VERDICT 'every gap lit 1 s ahead' (GAME-MAP B9; STAGE-RULES §4's dark rule: Normal 1 s, Easy 1.6 s), in two halves by name:
 *   - darkGaps (the laid stage): every rim in the dark has a light over its landing, and a sleeping one is woken by a stop on the rim's
 *     own piece (glowReaches); else the rim is named;
 *   - litAhead (a run): every rim he went over in the dark, its landing's light was lit DARK_AHEAD[setting] s before; else named (RED).
 * No stage, seed or x lives here: every fact is the laid stage's.
 */
import type { Zone } from '../zones.ts';
import { glowReaches } from '../zones.ts';
import type { Platform } from '../types.ts';
import type { PropDef, PropEmitter, Socket, StageSink } from './types.ts';

/** the props that lay a dark stretch: its start; its end with the firefly's lights, with none (a room's end), or with glowworms */
export const DARK_PROP = { darkFrom: 'darkFrom', darkTo: 'darkTo', darkToBare: 'darkToBare', darkToGlow: 'darkToGlow' } as const;
/** the dark's props as World 6 has always laid them (its kit lists these: no glow end) */
export const DARK_PROPS: PropDef[] = [
  { id: DARK_PROP.darkFrom, tags: [DARK_PROP.darkFrom], w: 10, minApart: 0 },
  { id: DARK_PROP.darkTo, tags: [DARK_PROP.darkTo], w: 10, minApart: 0 },
  { id: DARK_PROP.darkToBare, tags: [DARK_PROP.darkToBare], w: 10, minApart: 0 },
];
/** and the glowworms' end, for a kit that lays them (World 3) */
export const DARK_GLOW_PROPS: PropDef[] = [...DARK_PROPS, { id: DARK_PROP.darkToGlow, tags: [DARK_PROP.darkToGlow], w: 10, minApart: 0 }];

/** the dark's box over its ground, and the firefly's lights: over a gap, and along the way (World 6's numbers, unchanged) */
export const DARK_ZONE = { up: 800, down: 400, gapLight: 190, wayLight: 130, every: 420, lightUp: 90 } as const;
/** a glow stretch's box past its highest and lowest ends (px), and its glowworm's light */
export const DARK_GLOW = { above: 320, below: 260, light: 190 } as const;
/** STAGE-RULES §4: every gap in the dark reads at least this long ahead (s) */
export const DARK_AHEAD = { normal: 1, easy: 1.6 } as const;

type Lights = NonNullable<Zone['lights']>;
type Light = Lights[number];
export type DarkLights = boolean | 'glow';

/** a dark stretch's two ends, as sockets on its first and last pieces: `lights` true the firefly's, false none, 'glow' glowworms */
export const darkEnds = (from: string, to: string, lights: DarkLights = true): Socket[] => [
  { id: 'darkFrom', role: 'prop', on: from, t: 0, allow: [DARK_PROP.darkFrom], easy: 'keep' },
  { id: 'darkTo', role: 'prop', on: to, t: 1, allow: [lights === 'glow' ? DARK_PROP.darkToGlow : lights ? DARK_PROP.darkTo : DARK_PROP.darkToBare], easy: 'keep' },
];

/** the end of a dark stretch filled first, waiting for the other (in sink.extras: one at a time, a section's own two) */
const OPEN = 'w6sDarkFrom';
/** the next glowworm's id on this stage (sink.extras: each sleeping light has its own, the engine's wake map is by id) */
const GLOW_ID = 'darkGlowId';

/** the ground under x (a piece whose top is within a step of the dark's ground): no ground, a gap the firefly hangs over */
function groundAt(out: StageSink, x: number, y: number): boolean {
  return out.platforms.some((p) => x >= p.x && x <= p.x + p.width && p.y >= y - 140 && p.y <= y + 40);
}

/** the firefly's dark stretch from `x0` to `x1` at the ground `y`, with its lights (or none): World 6's, unchanged */
function fireflyZone(out: StageSink, x0: number, y: number, x1: number, lights: boolean): Zone {
  const L: Lights = [];
  if (lights) {
    // (a light over the middle of every gap)
    let gap0: number | null = null;
    for (let x = x0; x <= x1; x += 10) {
      const g = !groundAt(out, x, y);
      if (g && gap0 === null) gap0 = x;
      if (!g && gap0 !== null) {
        L.push({ x: Math.round((gap0 + x) / 2), y: y - DARK_ZONE.lightUp, r: DARK_ZONE.gapLight });
        gap0 = null;
      }
    }
    // (and a dimmer one along the way where none is near)
    for (let x = x0 + 200; x < x1 - 120; x += DARK_ZONE.every) if (!L.some((l) => Math.abs(l.x - x) < 220)) L.push({ x, y: y - DARK_ZONE.lightUp + 20, r: DARK_ZONE.wayLight });
    L.sort((a, b) => a.x - b.x);
  }
  return { kind: 'dark', x0: Math.round(x0), x1: Math.round(x1), top: y - DARK_ZONE.up, bottom: y + DARK_ZONE.down, baseY: y, dir: 1, period: 1, warn: 0, active: 1, force: 0, offset: 0, lights: L };
}

// ───────────────────────────── the rims in the dark (the glowworms' places and the verdict's) ─────────────────────────────

/** a piece he stands on and walks off (a crumbling tile is ground too: he stands on it until it goes) */
const standable = (p: Platform) => p.type === 'solid' || p.type === 'fragile';

/** a rim in the dark: the end of a piece he goes over (`dir` outward), where he lands, and the light over that landing */
export interface DarkRim { piece: Platform; dir: -1 | 1; x: number; y: number; land: { x: number; y: number }; light: Light | null }

/**
 * Where a step or hop over the rim at (`x`, `y`) going `dir` lands, inside the box: the nearest piece across at about his height
 * (a hop, its near end), else the first piece under the rim a body's width out (a drop). Null: nothing in the box.
 */
function landingOf(platforms: readonly Platform[], from: Platform, dir: -1 | 1, box: { x0: number; x1: number; top: number; bottom: number }): { x: number; y: number } | null {
  const rim = dir > 0 ? from.x + from.width : from.x;
  const inBox = (q: Platform) => q !== from && standable(q) && q.x + q.width >= box.x0 && q.x <= box.x1 && q.y >= box.top && q.y <= box.bottom;
  // (a hop across: a piece starting within a long hop out, its top within a step of his)
  let across: Platform | null = null;
  for (const q of platforms) {
    if (!inBox(q) || Math.abs(q.y - from.y) > 60) continue;
    const near = dir > 0 ? q.x : q.x + q.width;
    const d = (near - rim) * dir;
    if (d < 0 || d > 320) continue;
    if (!across || (dir > 0 ? q.x < across.x : q.x + q.width > across.x + across.width)) across = q;
  }
  if (across) return { x: Math.round(dir > 0 ? across.x + 30 : across.x + across.width - 30), y: across.y };
  // (a drop: the highest piece under the rim, a body's width out, below his feet)
  const xs = rim + dir * 24;
  let under: Platform | null = null;
  for (const q of platforms) {
    if (!inBox(q) || xs < q.x || xs > q.x + q.width || q.y <= from.y + 1) continue;
    if (!under || q.y < under.y) under = q;
  }
  return under ? { x: Math.round(Math.max(under.x + 20, Math.min(under.x + under.width - 20, xs + dir * 30))), y: under.y } : null;
}

/** is (x, y) inside the zone's box? */
const inBox = (z: Zone, x: number, y: number) => x >= z.x0 && x <= z.x1 && y >= z.top && y <= z.bottom;

/** every rim of every dark zone on the stage that lights a gap or rim (any zone with lights), each with its landing and the light over it */
export function darkRims(stage: { platforms: readonly Platform[]; zones?: readonly Zone[] }): DarkRim[] {
  const out: DarkRim[] = [];
  for (const z of stage.zones ?? []) {
    if (z.kind !== 'dark' || !z.lights?.length) continue;
    for (const p of stage.platforms) {
      if (!standable(p)) continue;
      for (const dir of [-1, 1] as const) {
        const x = dir > 0 ? p.x + p.width : p.x;
        if (!inBox(z, x, p.y)) continue;
        // (an end that runs on into a neighbour at his height is no rim)
        if (stage.platforms.some((q) => q !== p && standable(q) && x + dir * 12 >= q.x && x + dir * 12 <= q.x + q.width && Math.abs(q.y - p.y) <= 8)) continue;
        const land = landingOf(stage.platforms, p, dir, z);
        if (!land) continue;
        // (the light nearest the landing that reaches it)
        let light: Light | null = null;
        for (const l of z.lights) if (Math.hypot(l.x - land.x, l.y - land.y) <= l.r && (!light || Math.hypot(l.x - land.x, l.y - land.y) < Math.hypot(light.x - land.x, light.y - land.y))) light = l;
        out.push({ piece: p, dir, x: Math.round(x), y: p.y, land, light });
      }
    }
  }
  return out;
}

/** the glowworms' dark stretch between the ends `a` and `b`: a box over both ends' ground, one sleeping light over every rim's landing */
function glowZone(out: StageSink, a: { x: number; y: number }, b: { x: number; y: number }): Zone {
  const y0 = Math.min(a.y, b.y), y1 = Math.max(a.y, b.y);
  const z: Zone = { kind: 'dark', x0: Math.round(a.x), x1: Math.round(b.x), top: y0 - DARK_GLOW.above, bottom: y1 + DARK_GLOW.below, baseY: y1, dir: 1, period: 1, warn: 0, active: 1, force: 0, offset: 0, lights: [] };
  // (the rims are read with a stand-in light that covers everything, so every rim's landing is found; then one glowworm over each landing)
  const probe: Zone = { ...z, lights: [{ x: 0, y: 0, r: 1e9 }] };
  let id = (out.extras[GLOW_ID] as number | undefined) ?? 1;
  for (const r of darkRims({ platforms: out.platforms, zones: [probe] })) {
    const at = { x: r.land.x, y: r.land.y - DARK_ZONE.lightUp };
    if (z.lights!.some((l) => Math.hypot(l.x - at.x, l.y - at.y) < 70)) continue;
    z.lights!.push({ x: at.x, y: at.y, r: DARK_GLOW.light, sleep: true, id: id++ });
  }
  out.extras[GLOW_ID] = id;
  z.lights!.sort((p, q) => p.y - q.y || p.x - q.x);
  return z;
}

/**
 * The dark props' emitters: the first end filled remembers its spot, the second lays the dark between them (a mirrored section reads its
 * sockets 1 - t, so its "end" comes first: either order works). The end socket says which lights hang in it.
 */
export const DARK_EMIT: Record<string, PropEmitter> = {
  darkFrom: (f, _p, out) => darkEnd(out, f.x, f.y, null),
  darkTo: (f, _p, out) => darkEnd(out, f.x, f.y, true),
  darkToBare: (f, _p, out) => darkEnd(out, f.x, f.y, false),
  darkToGlow: (f, _p, out) => darkEnd(out, f.x, f.y, 'glow'),
};
function darkEnd(out: StageSink, x: number, y: number, lights: DarkLights | null) {
  const open = out.extras[OPEN] as { x: number; y: number; lights: DarkLights | null } | undefined;
  if (!open) {
    out.extras[OPEN] = { x, y, lights };
    return;
  }
  delete out.extras[OPEN];
  const [a, b] = open.x <= x ? [open, { x, y, lights }] : [{ x, y, lights }, open];
  if (b.x - a.x < 100) return;
  const kind = open.lights ?? lights;
  out.zones.push(kind === 'glow' ? glowZone(out, a, b) : fireflyZone(out, a.x, a.y, b.x, kind !== false));
}

// ───────────────────────────── the verdict: every gap lit 1 s ahead ─────────────────────────────

const at = (r: DarkRim) => `the rim at x ${r.x}, y ${Math.round(r.y)} (${r.dir > 0 ? 'right' : 'left'} end of ${Math.round(r.piece.x)}-${Math.round(r.piece.x + r.piece.width)})`;

/**
 * 'every gap lit 1 s ahead', the laid stage's half (names; empty: kept): every rim in the dark has a light over its landing, and a
 * sleeping light is woken by a stop on the rim's own piece, facing the rim (glowReaches from some spot he can stand on), so a player who stops can
 * always see where he lands before he goes.
 */
export function darkGaps(stage: { platforms: readonly Platform[]; zones?: readonly Zone[] }): string[] {
  const out: string[] = [];
  for (const r of darkRims(stage)) {
    if (!r.light) { out.push(`dark: a gap with no light: ${at(r)}, its landing at x ${r.land.x}, y ${Math.round(r.land.y)}`); continue; }
    if (!r.light.sleep) continue;
    const p = r.piece, light = r.light;
    let wakes = false;
    for (let x = p.x + 10; x <= p.x + p.width - 10 && !wakes; x += 10) wakes = glowReaches(light, x, p.y, r.dir);
    if (!wakes) out.push(`dark: a sleeping light no stop wakes: ${at(r)}, the light at x ${Math.round(light.x)}, y ${Math.round(light.y)}`);
  }
  return out;
}

/** one rim he went over in a run: when (game s), and when its landing's light woke (game s; -Infinity always lit, undefined never) */
export interface RimCrossing { rim: DarkRim; t: number; litAt: number | undefined }

/**
 * 'every gap lit 1 s ahead', a run's half (names; empty: GREEN): every rim in the dark he went over, its landing's light was lit at
 * least DARK_AHEAD[setting] s before he went. A dark gap he reaches before its light is named: RED.
 */
export function litAhead(crossings: readonly RimCrossing[], setting: 'normal' | 'easy'): string[] {
  const need = DARK_AHEAD[setting];
  const out: string[] = [];
  for (const c of crossings) {
    const lead = c.litAt === undefined ? -Infinity : c.t - c.litAt;
    if (lead < need - 1e-6) out.push(`dark: went over ${at(c.rim)} at ${c.t.toFixed(2)} s ${c.litAt === undefined ? 'with its landing dark' : `${lead.toFixed(2)} s after its light woke`} (needs ${need} s)`);
  }
  return out;
}

/**
 * A run's rim crossings from its frames (the harness's watcher): he goes over a rim the first frame he is past its piece's end, having
 * stood on the piece (on the ground or off it: the game's grace keeps him 'grounded' a moment past an edge). `lit(light)`: the game time the light woke (-Infinity for one always lit, undefined still asleep).
 */
export class RimWatch {
  readonly crossings: RimCrossing[] = [];
  private onPiece: Platform | null = null;
  constructor(readonly rims: readonly DarkRim[]) {}
  step(t: number, p: { x: number; y: number; grounded: boolean }, lit: (l: Light) => number | undefined) {
    // (on a rim's piece: he is there; past its end he has gone over, in the air or on the game's grace past an edge, whichever comes first)
    const on = p.grounded ? this.rims.find((r) => p.x >= r.piece.x && p.x <= r.piece.x + r.piece.width && Math.abs(p.y - r.piece.y) <= 4)?.piece : undefined;
    if (on) { this.onPiece = on; return; }
    if (!this.onPiece) return;
    const from = this.onPiece;
    const r = this.rims.find((q) => q.piece === from && (q.dir > 0 ? p.x > from.x + from.width : p.x < from.x));
    if (!r) return;
    this.onPiece = null;
    this.crossings.push({ rim: r, t, litAt: r.light ? (r.light.sleep ? lit(r.light) : -Infinity) : undefined });
  }
}
