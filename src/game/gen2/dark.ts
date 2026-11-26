/**
 * gen2/dark — THE DARK as one brick any world lays (ENG-DARK, R-165.449; WORLD-3-PLAN F2): a stretch of `dark` zone (zones.ts) between two
 * props on a section's pieces (`darkEnds`), with its lights. LIFTED from World 6's darkZone (w6Swing.ts, which re-exports these names, so
 * Worlds 6 and 8 lay the same stretch, light for light: lockall). The end prop says which light hangs in it:
 *   - FIREFLY ('darkTo', Worlds 6 and 8): always lit, over the middle of every gap at the dark's ground, and dimmer ones along the way;
 *   - BARE ('darkToBare'): none (a room's own glow);
 *   - GLOW ('darkToGlow', World 3): sleeping glowworms (zones.ts GLOW_REACH: standing still wakes those within reach, up AND down from
 *     his feet), one over the landing of every rim in the stretch: a stop at a rim wakes the landing under it, never the whole shaft;
 *     every light sleeps but the cave mouth's (entryPieces: the landings he reaches from outside the dark are laid awake).
 *
 * THE VERDICT 'every gap lit 1 s ahead' (GAME-MAP B9; STAGE-RULES §4's dark rule: Normal 1 s, Easy 1.6 s), in two halves by name:
 *   - darkGaps (the laid stage): every rim in the dark has a light over its landing, and a sleeping one is woken by a stop on the rim's
 *     own piece (glowReaches); else the rim is named;
 *   - litAhead (a run): every rim he went over in the dark, its landing's light was lit DARK_AHEAD[setting] s before; else named (RED).
 * And a flag in the glowworms' dark (it may stand there: zones.ts keepsClear, the lead's ruling A, 11-25) is never a blind respawn:
 * darkFlags names one where standing still lights no glow within DARK_FLAG_LIT s, or none over his first landing.
 * No stage, seed or x lives here: every fact is the laid stage's.
 */
import type { Zone } from '../zones.ts';
import { GLOW_REACH, GLOW_STILL, glowReaches, keepsClear } from '../zones.ts';
import type { Platform } from '../types.ts';
import { LAND_HALF, PHYS } from '../physics.ts';
import { PAD_FAIR } from './rideLay.ts';
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
/** a flag in the glowworms' dark: standing still where he respawns lights a glow, his first landing's, within this (s; the lead, 11-25) */
export const DARK_FLAG_LIT = 1;

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
export interface DarkRim { piece: Platform; dir: -1 | 1; x: number; y: number; land: { x: number; y: number }; light: Light | null; onto: Platform; drop: boolean; runOff?: true }

/** a step off a rim comes down a body's width out (px) */
const STEP_OFF = 24;
/** is this end of `p` a rim (it does not run on into a neighbour at his height)? */
const isRim = (platforms: readonly Platform[], p: Platform, dir: -1 | 1) => {
  const x = dir > 0 ? p.x + p.width : p.x;
  return !platforms.some((q) => q !== p && standable(q) && x + dir * 12 >= q.x && x + dir * 12 <= q.x + q.width && Math.abs(q.y - p.y) <= 8);
};
/** every rim of every standable piece on the stage, in the dark or not */
function rimEnds(platforms: readonly Platform[]): Array<{ piece: Platform; dir: -1 | 1; x: number }> {
  const out: Array<{ piece: Platform; dir: -1 | 1; x: number }> = [];
  for (const p of platforms) if (standable(p)) for (const dir of [-1, 1] as const) if (isRim(platforms, p, dir)) out.push({ piece: p, dir, x: dir > 0 ? p.x + p.width : p.x });
  return out;
}
/** the piece a step off `from`'s rim going `dir` comes down on: the highest standable piece under a body's width out; null: none */
function stepOnto(platforms: readonly Platform[], from: Platform, dir: -1 | 1): Platform | null {
  const xs = (dir > 0 ? from.x + from.width : from.x) + dir * STEP_OFF;
  let under: Platform | null = null;
  for (const q of platforms) if (q !== from && standable(q) && xs >= q.x && xs <= q.x + q.width && q.y > from.y + 1 && (!under || q.y < under.y)) under = q;
  return under;
}

/** how far out (px) a RUN off a rim carries him before he has fallen `drop` px: `frac` of a full run (PHYS.maxRun) held, gravDown to
 *  maxFall */
const runFly = (drop: number, frac = 1) => {
  const cap = PHYS.maxFall ** 2 / (2 * PHYS.gravDown);
  const t = drop <= cap ? Math.sqrt((2 * drop) / PHYS.gravDown) : PHYS.maxFall / PHYS.gravDown + (drop - cap) / PHYS.maxFall;
  return PHYS.maxRun * frac * t;
};
/** the run speeds a RUN off is judged at, as fractions of a full run: he leaves an edge at any speed up to it, and the air steer slows or
 *  speeds him on the way down. Judged at full speed alone, the touchdowns between a step off and a full run went unread: the 3-1 x40 on
 *  a5e15a74d went over a sleeping rim 8 times, each one 0-35 px past a touchdown at 154-285 px/s (child Normal 22: off 106's end at
 *  285 px/s, steered to 154 and back to 268, down 174 px onto 590-811 29 px from its left rim), ENG-DARK box 16. Half a run up: down
 *  to a tenth, the lay woke 1604 of 6168 lights and lit 30 of 970 darks whole (probes/runoff.mts); half to full woke 114 and lit none.
 *  Under a step off's reach (STEP_OFF) the step off's own check (ii) reads it */
const RUN_FRACS = [1, 0.9, 0.8, 0.7, 0.6, 0.5];
/** where a RUN off `from`'s rim going `dir` comes down (a rim with no stop: he runs off it at full speed, ENG-DARK box 14): the first
 *  piece his arc meets (the highest standable piece below his feet whose top his middle crosses within LAND_HALF of its ends), and
 *  where on it he touches down (kept on the piece); null: none */
function runOnto(platforms: readonly Platform[], from: Platform, dir: -1 | 1, frac = 1): { on: Platform; x: number } | null {
  const rim = dir > 0 ? from.x + from.width : from.x;
  let best: { on: Platform; x: number } | null = null;
  for (const q of platforms) {
    if (q === from || !standable(q) || q.y <= from.y + 1 || (best && q.y >= best.on.y)) continue;
    const fly = runFly(q.y - from.y, frac);
    if (fly < STEP_OFF) continue;
    const x = rim + dir * fly;
    if (x < q.x - LAND_HALF || x > q.x + q.width + LAND_HALF) continue;
    best = { on: q, x: Math.max(q.x, Math.min(q.x + q.width, x)) };
  }
  return best;
}

/**
 * Where a step or hop over the rim at (`x`, `y`) going `dir` lands, inside the box: the nearest piece across at about his height
 * (a hop, its near end), else the first piece under the rim a body's width out (a drop). Null: nothing in the box.
 */
function landingOf(platforms: readonly Platform[], from: Platform, dir: -1 | 1, box: { x0: number; x1: number; top: number; bottom: number }): { x: number; y: number; on: Platform; drop: boolean } | null {
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
  if (across) return { x: Math.round(dir > 0 ? across.x + 30 : across.x + across.width - 30), y: across.y, on: across, drop: false };
  return dropLanding(platforms, from, dir, box, 30);
}
/** where a STEP off `from`'s rim going `dir` comes down inside the box (a hop rim's other way down: he can step off instead of
 *  hopping): the highest piece under the rim a body's width out, below his feet, `ahead` px on from where he touches down (0: the
 *  touchdown itself), kept 20 px inside the piece; null: none */
function dropLanding(platforms: readonly Platform[], from: Platform, dir: -1 | 1, box: { x0: number; x1: number; top: number; bottom: number }, ahead: number): { x: number; y: number; on: Platform; drop: true } | null {
  const xs = (dir > 0 ? from.x + from.width : from.x) + dir * STEP_OFF;
  let under: Platform | null = null;
  for (const q of platforms) {
    if (q === from || !standable(q) || q.x + q.width < box.x0 || q.x > box.x1 || q.y < box.top || q.y > box.bottom) continue;
    if (xs < q.x || xs > q.x + q.width || q.y <= from.y + 1) continue;
    if (!under || q.y < under.y) under = q;
  }
  return under ? { x: Math.round(Math.max(under.x + 20, Math.min(under.x + under.width - 20, xs + dir * ahead))), y: under.y, on: under, drop: true } : null;
}
/** the light over a hop rim's step-off landing (the lay's second light, glowZone): the nearest of `lights` reaching that landing; null:
 *  the rim is a drop, has no step-off landing in the box, or no light reaches it */
function stepLight(platforms: readonly Platform[], r: DarkRim, z: Zone): Light | null {
  if (r.drop) return null;
  const s = dropLanding(platforms, r.piece, r.dir, z, 0);
  if (!s) return null;
  let light: Light | null = null;
  for (const l of z.lights ?? []) if (Math.hypot(l.x - s.x, l.y - s.y) <= l.r && (!light || Math.hypot(l.x - s.x, l.y - s.y) < Math.hypot(light.x - s.x, light.y - s.y))) light = l;
  return light;
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
        if (!isRim(stage.platforms, p, dir)) continue;
        const land = landingOf(stage.platforms, p, dir, z);
        if (!land) continue;
        // (the light nearest the landing that reaches it)
        let light: Light | null = null;
        for (const l of z.lights) if (Math.hypot(l.x - land.x, l.y - land.y) <= l.r && (!light || Math.hypot(l.x - land.x, l.y - land.y) < Math.hypot(light.x - land.x, light.y - land.y))) light = l;
        out.push({ piece: p, dir, x: Math.round(x), y: p.y, land: { x: land.x, y: land.y }, light, onto: land.on, drop: land.drop });
      }
    }
  }
  return out;
}

/**
 * The ENTRY landings of a dark box: every piece a step off a rim OUTSIDE the box comes down on. He arrives there from the light
 * outside, with no stop in the dark behind him to wake what lies ahead, so the lights over the landings of that piece's rims are laid
 * awake: the cave mouth is lit (the lead's ruling (ii), 11-25). Only those: every other light in the dark sleeps.
 */
export function entryPieces(platforms: readonly Platform[], box: { x0: number; x1: number; top: number; bottom: number }): Set<Platform> {
  const out = new Set<Platform>();
  for (const u of rimEnds(platforms)) {
    if (u.x >= box.x0 && u.x <= box.x1 && u.piece.y >= box.top && u.piece.y <= box.bottom) continue;
    const on = stepOnto(platforms, u.piece, u.dir);
    if (on) out.add(on);
  }
  return out;
}

/**
 * The lights of a glowworm dark laid AWAKE (every other light sleeps), read with all of them asleep:
 *   - the cave mouth: a rim of a piece he reaches from outside the dark (entryPieces) has the light over its landing (the one the
 *     verdicts read) awake (the lead's ruling (ii), 11-25);
 *   - a RUN off a rim with no stop of its own (outside the dark, or its landing's light awake) comes down far out at full speed: each
 *     dark rim of the piece it lands on, the way he runs, nearer his stopping distance (Easy's, the longer) than the touchdown, that no
 *     stop on the piece he left wakes (runOffs' stops: there he stops, runOffRims), has its light awake too, and so on from the rims that wakes (darkLandings' (iii),
 *     runOffs; ENG-DARK box 14).
 */
export function awakeLights(platforms: readonly Platform[], z: Zone): Set<Light> {
  const own = z.lights ?? [];
  const copy = own.map((l) => ({ ...l, sleep: true }));
  const asleep: Zone = { ...z, lights: copy };
  const mouth = entryPieces(platforms, asleep);
  for (const r of darkRims({ platforms, zones: [asleep] })) if (r.light && mouth.has(r.piece)) r.light.sleep = false;
  const ends = rimEnds(platforms), stop = darkStop('easy');
  for (let woke = true; woke; ) {
    woke = false;
    for (const { n, stops } of runOffs(platforms, darkRims({ platforms, zones: [asleep] }), ends, stop)) {
      if (stops) continue;
      n.light!.sleep = false;
      woke = true;
    }
  }
  return new Set(own.filter((_, i) => !copy[i].sleep));
}

/** the glowworms' dark stretch between the ends `a` and `b`: a box over both ends' ground, one light over every rim's landing, asleep
 *  but at the cave mouth (entryPieces) */
function glowZone(out: StageSink, a: { x: number; y: number }, b: { x: number; y: number }): Zone {
  const y0 = Math.min(a.y, b.y), y1 = Math.max(a.y, b.y);
  const z: Zone = { kind: 'dark', x0: Math.round(a.x), x1: Math.round(b.x), top: y0 - DARK_GLOW.above, bottom: y1 + DARK_GLOW.below, baseY: y1, dir: 1, period: 1, warn: 0, active: 1, force: 0, offset: 0, lights: [] };
  // (the rims are read with a stand-in light that covers everything, so every rim's landing is found; then one glowworm over each landing)
  const probe: Zone = { ...z, lights: [{ x: 0, y: 0, r: 1e9 }] };
  let id = (out.extras[GLOW_ID] as number | undefined) ?? 1;
  for (const r of darkRims({ platforms: out.platforms, zones: [probe] })) {
    // (over the landing, but never deeper under the rim than a stop on it reaches (GLOW_REACH.down): a wall-side rim's long drop keeps
    //  its light where its stop wakes it, still over the landing. A HOP rim gets a second light over its step-off landing: a player can
    //  step off instead of hopping, or turn back there, and that edge is lit too (the lead's ruling, 11-25); it hangs over where he
    //  touches down, so it reaches the edges he comes down by)
    const step = r.drop ? null : dropLanding(out.platforms, r.piece, r.dir, z, 0);
    for (const land of step ? [r.land, step] : [r.land]) {
      const at = { x: land.x, y: Math.min(land.y - DARK_ZONE.lightUp, r.y + GLOW_REACH.down) };
      if (z.lights!.some((l) => Math.hypot(l.x - at.x, l.y - at.y) < 70)) continue;
      z.lights!.push({ x: at.x, y: at.y, r: DARK_GLOW.light, sleep: true, id: id++ });
    }
  }
  // (the cave mouth is lit, and every landing a run off a rim with no stop comes down too near: awakeLights; every other light sleeps)
  const awake = awakeLights(out.platforms, z);
  for (const l of z.lights!) if (awake.has(l)) l.sleep = false;
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

/** the reaction a landing in the dark is given before he brakes (s): rideLay's PAD_FAIR.react, the fairness reaction a landing on a pad
 *  already uses (the lead's ruling, 11-25: no new number); Easy scales it by the dark's own Easy factor (DARK_AHEAD, STAGE-RULES §4) */
export const DARK_LAND_REACT = { normal: PAD_FAIR.react, easy: (PAD_FAIR.react * DARK_AHEAD.easy) / DARK_AHEAD.normal } as const;
/** how far he runs on after landing at a run before he stands (px): his reaction at run speed, then the brake from full run */
export const darkStop = (setting: 'normal' | 'easy') => PHYS.maxRun * DARK_LAND_REACT[setting] + PHYS.maxRun ** 2 / (2 * PHYS.groundDec);

/**
 * 'every drop onto a dark rim's piece lands at least his stopping distance from that rim, or he sees that rim's edge' (the lead's
 * rulings, 11-25): a step off ANY rim (in the dark or not) comes down a body's width out, and each dark rim of the piece he lands on,
 * its light asleep, is darkStop away from that spot along the rim's way, or:
 *   - (i) the rim he stepped off is itself a dark rim: judged as he plays it, the face-the-rim stop, then a slow step off. It passes when
 *     the edge he lands toward lies inside that rim's own landing light (the light darkGaps proves the stop wakes), or that stop wakes
 *     the edge's own light by the time it has woken its own and DARK_AHEAD more; an edge behind the landing is not one he lands toward;
 *   - (ii) a rim outside the dark gives no stop: the lay lights its landing (entryPieces: the cave mouth is lit, its lights awake), so
 *     it passes on room or an awake light only. Names; empty: kept.
 */
export function darkLandings(stage: { platforms: readonly Platform[]; zones?: readonly Zone[] }, setting: 'normal' | 'easy'): string[] {
  const out: string[] = [];
  const rims = darkRims(stage);
  const ends = rimEnds(stage.platforms);
  const stop = darkStop(setting);
  const seen = new Set<string>();
  for (const n of rims) {
    if (!n.light?.sleep) continue;
    const nl = n.light;
    for (const u of ends) {
      if (u.piece === n.piece || stepOnto(stage.platforms, u.piece, u.dir) !== n.piece) continue;
      const room = (n.x - (u.x + u.dir * STEP_OFF)) * n.dir;
      if (room >= stop) continue;
      const ud = rims.find((m) => m.piece === u.piece && m.dir === u.dir);
      // (a drop off a DARK rim is judged as he plays it (the lead's ruling (i), 11-25): he makes the face-the-rim stop, which wakes the
      //  rim's own landing light (darkGaps), then steps off slowly toward u.dir; it passes when the edge he lands toward lies inside that
      //  light. An edge BEHIND that landing (n.dir against u.dir) is not one he lands toward: the slow step carries him away from it, and
      //  he reaches it only by turning back on its piece by choice, never on the drop's way)
      //  A step off a HOP rim (ud.drop false) takes no exemption: he steps off it by choice and can turn back on the piece he lands on,
      //  so every edge there is judged; the lay's second light over that step-off landing (stepLight) lights it when it reaches the
      //  edge and a stop at the hop rim, facing over it, wakes it (the lead's ruling A on 33 N, 11-25)
      const sz = ud && !ud.drop ? (stage.zones ?? []).find((z) => z.kind === 'dark' && !!z.lights?.length && inBox(z, ud.x, ud.y)) : undefined;
      const sl = ud && sz ? stepLight(stage.platforms, ud, sz) : null;
      let lit = !!ud && ((ud.drop && n.dir !== u.dir) || (!!ud.light && Math.hypot(ud.light.x - n.x, ud.light.y - n.y) <= ud.light.r)
        || (!!sl && Math.hypot(sl.x - n.x, sl.y - n.y) <= sl.r && Number.isFinite(litAfter(sl, ud.x - ud.dir * 10, ud.y, ud.dir))));
      if (ud && !lit) {
        const p = u.piece;
        for (let x = p.x + 10; x <= p.x + p.width - 10 && !lit; x += 10) {
          const own = ud.light ? litAfter(ud.light, x, p.y, u.dir) : 0;
          lit = Number.isFinite(own) && litAfter(nl, x, p.y, u.dir) <= own + DARK_AHEAD[setting] + 1e-6;
        }
      }
      const key = `${u.x},${u.piece.y},${n.x},${n.y}`;
      if (lit || seen.has(key)) continue;
      seen.add(key);
      out.push(`dark: a step off lands him ${Math.round(room)} px from a dark rim, under his stopping distance ${Math.round(stop)} px (${setting}), its light asleep${ud ? '' : ', the rim he left outside the dark'}: the rim at x ${Math.round(u.x)}, y ${Math.round(u.piece.y)} (${u.dir > 0 ? 'right' : 'left'} end of ${Math.round(u.piece.x)}-${Math.round(u.piece.x + u.piece.width)}) onto ${at(n)}`);
    }
  }
  // (iii) a RUN off a rim with no stop of its own comes down far out at full speed: passes when a stop there wakes the rim it meets
  //  (runOffs' stops: the bot's and the player's stop, runOffRims) or that rim's own light is laid awake (awakeLights) (ENG-DARK box 14)
  for (const { u, uds, n, room, stops } of runOffs(stage.platforms, rims, ends, stop)) {
    if (stops) continue;
    out.push(`dark: a running step off lands him ${Math.round(room)} px from a dark rim, under his stopping distance ${Math.round(stop)} px (${setting}), its light asleep, the rim he left ${uds.length ? 'lit, no stop there wakes it' : 'outside the dark'}: the rim at x ${Math.round(u.x)}, y ${Math.round(u.piece.y)} (${u.dir > 0 ? 'right' : 'left'} end of ${Math.round(u.piece.x)}-${Math.round(u.piece.x + u.piece.width)}) onto ${at(n)}`);
  }
  return out;
}

/**
 * Every RUN off a rim with no stop of its own (outside every dark; or in the dark with its landing's light awake: the stop, the bot's
 * and the player's, is where that light sleeps) that comes down nearer than `stop` to a sleeping dark rim the way he runs: he runs off
 * at full speed and touches down far out (runOnto), not a body's width out, and slides on (ENG-DARK box 14: the 3-1 trial ran off a
 * ledge at 268 px/s, flew 92 px and landed 7 px from a sleeping rim). No pass for an awake light that shows that edge: touching down
 * that near it at a run he cannot stop however well he sees it (roll 1 adult Normal: 10 px from x 673, y 3850 under the lit landing of
 * x 556, y 3672). `stops`: the edge he leaves is in the dark and a stop on its piece, facing over it, wakes that rim's light (litAfter):
 * a stop the bot makes there (runOffRims, glowWait) and a player makes, who sees a dark rim ahead of his landing; the others, no stop
 * can light, are the lay's to light (awakeLights). One entry per (rim left, rim met).
 */
function runOffs(platforms: readonly Platform[], rims: readonly DarkRim[], ends: ReadonlyArray<{ piece: Platform; dir: -1 | 1; x: number }>, stop: number) {
  const out: Array<{ u: { piece: Platform; dir: -1 | 1; x: number }; uds: DarkRim[]; n: DarkRim; run: { on: Platform; x: number }; room: number; stops: boolean }> = [];
  for (const u of ends) {
    // (an edge in two overlapping darks is a rim of each: its own stop applies if any of its landings' lights sleeps)
    const uds = rims.filter((m) => m.piece === u.piece && m.dir === u.dir);
    // (an edge with a stop of its own is judged too: the stop ends when ITS landing's light is lit, and he runs off from it like any
    //  other run. Skipped, the child on Normal 22 stood 63 px from 106's left end until its landing's light woke, ran off at 268 px/s
    //  and touched down on 590-811 at its sleeping left rim, the middle the same; 8 such went over in the x40 on a5e15a74d, ENG-DARK
    //  box 16. Its stop then also waits for the rim the run meets (runOffRims, glowWait))
    // (every run speed, RUN_FRACS: one entry per rim met, at the fastest speed that meets it)
    const met = new Set<DarkRim>();
    for (const frac of RUN_FRACS) {
      const run = runOnto(platforms, u.piece, u.dir, frac);
      if (!run) continue;
      for (const n of rims) {
        if (met.has(n) || n.piece !== run.on || n.dir !== u.dir || !n.light?.sleep) continue;
        const room = (n.x - run.x) * n.dir;
        if (room >= stop) continue;
        met.add(n);
        let stops = false;
        const p = u.piece;
        for (let x = p.x + 10; uds.length && x <= p.x + p.width - 10 && !stops; x += 10) stops = Number.isFinite(litAfter(n.light, x, p.y, u.dir));
        out.push({ u, uds, n, run, room, stops });
      }
    }
  }
  return out;
}

/**
 * The bot's stop for a run off (glowWait): each edge in the dark, its own landing lit, whose run comes down within `setting`'s stopping
 * distance of a sleeping dark rim that a stop on its piece wakes (runOffs' stops), as a rim to stop at whose light is that rim's: he
 * stands at the edge he would run off until that light is lit DARK_AHEAD, then goes (ENG-DARK box 14). runOff marks it: never a jump's stop.
 */
export function runOffRims(stage: { platforms: readonly Platform[]; zones?: readonly Zone[] }, setting: 'normal' | 'easy'): DarkRim[] {
  const rims = darkRims(stage);
  return runOffs(stage.platforms, rims, rimEnds(stage.platforms), darkStop(setting)).filter((q) => q.stops).map(({ u, n, run }) => ({
    piece: u.piece, dir: u.dir, x: Math.round(u.x), y: u.piece.y, land: { x: Math.round(run.x), y: run.on.y }, light: n.light, onto: run.on, drop: true, runOff: true,
  }));
}

/** how long a stop at (`x`, `feet`) facing `facing` takes to light `l` (s): Infinity out of reach; an always-lit light (the cave mouth's)
 *  0, but only within the same reach: an awake light far off lights nothing where he stands */
export function litAfter(l: Light, x: number, feet: number, facing: -1 | 1): number {
  if (!glowReaches(l, x, feet, facing)) return Infinity;
  return l.sleep ? GLOW_STILL + Math.max(0, (l.x - x) * facing) / GLOW_REACH.speed : 0;
}

/** the glowworm-dark zones a flag at (x, y) stands in */
const glowDarkAt = (zones: readonly Zone[] | undefined, x: number, y: number) => (zones ?? []).filter((z) => z.kind === 'dark' && !keepsClear(z) && inBox(z, x, y));
/** does standing still at a flag at (x, y), facing either way, light one of these within DARK_FLAG_LIT s? */
const flagLit = (lights: readonly Light[], x: number, y: number) => lights.some((l) => Math.min(litAfter(l, x, y, 1), litAfter(l, x, y, -1)) <= DARK_FLAG_LIT + 1e-6);

/**
 * A flag in the glowworms' dark is never a blind respawn (the lead's ruling with A, 11-25): standing still at it, he lights a glow within
 * DARK_FLAG_LIT s (and the way on from there is darkGaps' business: every rim's landing woken by a stop on its piece). Names each flag
 * that fails; empty: kept.
 */
export function darkFlags(stage: { zones?: readonly Zone[]; checkpoints?: ReadonlyArray<{ x: number; y: number }> }): string[] {
  const out: string[] = [];
  for (const c of stage.checkpoints ?? []) {
    const zs = glowDarkAt(stage.zones, c.x, c.y);
    if (zs.length && !flagLit(zs.flatMap((z) => z.lights ?? []), c.x, c.y)) out.push(`dark: a flag at x ${Math.round(c.x)}, y ${Math.round(c.y)} in the glowworms' dark lights no glow within ${DARK_FLAG_LIT} s of standing still`);
  }
  return out;
}

/**
 * The lay's half of darkFlags (any world's: the pipeline calls it on the stage's last flags): a flag in the glowworms' dark that would
 * light nothing in time gets a glowworm of its own, hung over it, asleep like the rest.
 */
export function glowFlags(out: StageSink, flags: ReadonlyArray<{ x: number; y: number }>): void {
  const first = (out.extras[GLOW_ID] as number | undefined) ?? 1;
  let id = first;
  for (const c of flags) {
    const zs = glowDarkAt(out.zones, c.x, c.y);
    if (!zs.length || flagLit(zs.flatMap((z) => z.lights ?? []), c.x, c.y)) continue;
    zs[0].lights!.push({ x: Math.round(c.x), y: Math.round(c.y - DARK_ZONE.lightUp), r: DARK_GLOW.light, sleep: true, id: id++ });
  }
  // (the counter is written only where a glowworm was hung: a stage with no glowworm dark keeps its extras, so its build is unchanged)
  if (id !== first) out.extras[GLOW_ID] = id;
}

/** one rim he went over in a run: when (game s), and when its landing's light woke (game s; -Infinity always lit, undefined never);
 *  `climbed`: he passed its end on a climb (a trunk or vine he holds), not a drop: its own kind, never 'went over' (the lead's ruling, 11-25) */
export interface RimCrossing { rim: DarkRim; t: number; litAt: number | undefined; climbed?: true }

/**
 * 'every gap lit 1 s ahead', a run's half (names; empty: GREEN): every rim in the dark he went over, its landing's light was lit at
 * least DARK_AHEAD[setting] s before he went. A dark gap he reaches before its light is named: RED.
 */
export function litAhead(crossings: readonly RimCrossing[], setting: 'normal' | 'easy'): string[] {
  const need = DARK_AHEAD[setting];
  const out: string[] = [];
  for (const c of crossings) {
    // (a climb down a trunk past a rim is no blind drop: he holds on and sees as he goes; RimWatch records it as its own kind)
    if (c.climbed) continue;
    const lead = c.litAt === undefined ? -Infinity : c.t - c.litAt;
    if (lead < need - 1e-6) out.push(`dark: went over ${at(c.rim)} at ${c.t.toFixed(2)} s ${c.litAt === undefined ? 'with its landing dark' : `${lead.toFixed(2)} s after its light woke`} (needs ${need} s)`);
  }
  return out;
}

/**
 * A run's rim crossings from its frames (the harness's watcher): he goes over a rim the first frame he is past its piece's end, having
 * stood on the piece (on the ground or off it: the game's grace keeps him 'grounded' a moment past an edge); passed on a climb (a
 * trunk grab past the rim, PlayerState.climbing), the crossing is kind `climbed`. `lit(light)`: the game time the light woke (-Infinity for one always lit, undefined still asleep).
 */
export class RimWatch {
  readonly crossings: RimCrossing[] = [];
  private onPiece: Platform | null = null;
  /** he left the ground past a rim ABOVE its height (a jump): counted (at the pass) once he sinks below the rim's height or grabs a
   *  vine, dropped when he lands back on its piece or on higher ground past it (the lead's rulings, 11-25: going over means leaving the
   *  ground past the rim; a jump UP over the rim onto higher ground is no way into the dark below) */
  private over: RimCrossing | null = null;
  constructor(readonly rims: readonly DarkRim[]) {}
  /** he was put somewhere (a rescue's put-back, a placement past a puzzle room): he left the piece by no way of his own, and a put-back
   *  is no going over: the watch starts again from where he is put (expert Normal 25 of c15's 3-1 x40, ENG-DARK box 22: a rescue took
   *  him from x 800 on 648-885 to 261 px under it, and the next frame counted the rim at x 648 gone over dark) */
  put(): void {
    this.onPiece = null;
    this.over = null;
  }
  step(t: number, p: { x: number; y: number; grounded: boolean; climbing?: boolean }, lit: (l: Light) => number | undefined) {
    if (this.over) {
      const o = this.over, rim = o.rim;
      if (p.climbing) { this.over = null; this.crossings.push({ ...o, climbed: true }); }
      else if (!p.grounded && p.y > rim.piece.y + 4) { this.over = null; this.crossings.push(o); }
      else if (p.grounded) {
        this.over = null;
        const back = p.x >= rim.piece.x && p.x <= rim.piece.x + rim.piece.width && Math.abs(p.y - rim.piece.y) <= 4;
        const higher = p.y < rim.piece.y - 4 && (p.x - rim.x) * rim.dir > 0;
        if (!back && !higher) this.crossings.push(o);
      } else return;
    }
    // (on a rim's piece: he is there; standing past its end on the game's grace he is still on it: a grounded slide he turns back from
    //  is no going over (the lead's ruling, 11-25))
    const on = p.grounded ? this.rims.find((r) => p.x >= r.piece.x && p.x <= r.piece.x + r.piece.width && Math.abs(p.y - r.piece.y) <= 4)?.piece : undefined;
    if (on) { this.onPiece = on; return; }
    if (!this.onPiece) return;
    const from = this.onPiece;
    // (standing on other ground, not at the piece's height: he left it some other way (a vine, its other end, a rescue); walking past
    //  its end down there is no crossing of it: the KID's 3-1 draft run counted a rim 281 px over his head)
    if (p.grounded && Math.abs(p.y - from.y) > 4) { this.onPiece = null; return; }
    if (p.grounded && !p.climbing) return;
    const r = this.rims.find((q) => q.piece === from && (q.dir > 0 ? p.x > from.x + from.width : p.x < from.x));
    if (!r) return;
    this.onPiece = null;
    const c: RimCrossing = { rim: r, t, litAt: r.light ? (r.light.sleep ? lit(r.light) : -Infinity) : undefined };
    if (p.climbing) this.crossings.push({ ...c, climbed: true });
    else if (p.y > from.y + 4) this.crossings.push(c);
    else this.over = c;
  }
}
