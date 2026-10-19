/**
 * Timed zones: the signature rules of Worlds 3 and 4.
 *
 * A zone is a box of air that wakes up on a fixed rhythm: it sits idle, shows a warning, then is active for a while, and starts
 * over. Because the rhythm never changes and the warning is long, a zone can always be waited out, which is what keeps it fair.
 *   - World 3, the Mossy Grotto: SPORE clouds. Mushrooms puff out a sleepy cloud; inside it Slomatt goes drowsy (slow, a shorter jump).
 *   - World 4, the Mist Cascades: WIND gusts. A gust pushes everything in the lane to one side, helping or hindering a jump.
 *
 * Everything here is pure (no canvas, no engine) so the generator, the validator, the engine, the drawing and the tests agree on what
 * a zone is doing at any moment.
 */

export type ZoneKind = 'spore' | 'wind';

export interface Zone {
  kind: ZoneKind;
  /** the box, in world px */
  x0: number;
  x1: number;
  top: number;
  bottom: number;
  /** the ground (or stone top) the mushrooms stand on, for drawing */
  baseY: number;
  /** wind: +1 blows to the right, -1 to the left. Spores ignore it (they drift a little with it) */
  dir: 1 | -1;
  /** seconds for one whole cycle */
  period: number;
  /** the warning before it wakes (mushrooms swell / the gust starts to whistle) */
  warn: number;
  /** how long it is active */
  active: number;
  /** seconds into the cycle at game time 0 (staggers neighbouring zones) */
  offset: number;
  /** wind: px per second it pushes a player in the air (half that on the ground) */
  force: number;
  /** x positions of the mushrooms that puff the cloud (spores) */
  emit?: number[];
}

export type ZonePhase = 'idle' | 'warn' | 'active';

export interface ZoneState {
  phase: ZonePhase;
  /** how far through the current phase, 0..1 */
  u: number;
  /** 0..1: how hard it is acting right now (ramps in and out so a cloud or gust never snaps on) */
  strength: number;
  /** seconds until the zone is next active (0 if it is active now) */
  untilActive: number;
}

/** the ramp at either end of the active phase */
export const ZONE_RAMP = 0.35;

export const idleTime = (z: Pick<Zone, 'period' | 'warn' | 'active'>) => z.period - z.warn - z.active;

export function zoneState(z: Zone, t: number): ZoneState {
  const s = (((t + z.offset) % z.period) + z.period) % z.period;
  const idle = idleTime(z);
  if (s < idle) return { phase: 'idle', u: s / idle, strength: 0, untilActive: z.period - z.active - s };
  if (s < idle + z.warn) return { phase: 'warn', u: (s - idle) / z.warn, strength: 0, untilActive: idle + z.warn - s };
  const a = s - idle - z.warn;
  const ramp = Math.min(1, a / ZONE_RAMP, (z.active - a) / ZONE_RAMP);
  return { phase: 'active', u: a / z.active, strength: Math.max(0, ramp), untilActive: 0 };
}

/** is the point inside the zone's box? */
export const inZone = (z: Zone, x: number, y: number) => x >= z.x0 && x <= z.x1 && y >= z.top && y <= z.bottom;

/** every zone of one kind that holds the point */
export function zonesAt(zones: readonly Zone[] | undefined, kind: ZoneKind, x: number, y: number): Zone[] {
  if (!zones) return [];
  const out: Zone[] = [];
  for (const z of zones) if (z.kind === kind && inZone(z, x, y)) out.push(z);
  return out;
}

/** the strongest effect of this kind on the point right now, 0..1 (and the zone that causes it) */
export function zoneEffect(zones: readonly Zone[] | undefined, kind: ZoneKind, x: number, y: number, t: number): { strength: number; zone: Zone | null } {
  let best = 0;
  let zone: Zone | null = null;
  for (const z of zonesAt(zones, kind, x, y)) {
    const s = zoneState(z, t).strength;
    if (s > best) { best = s; zone = z; }
  }
  return { strength: best, zone };
}

// ---------------------------------------------------------------------------
// Drowsiness (World 3)
// ---------------------------------------------------------------------------

/** a drowsy player runs at this fraction of full speed... */
export const DROWSY_SPEED = 0.5;
/** ...and jumps this fraction as hard */
export const DROWSY_JUMP = 0.84;
/** the drowsiness lingers this long after leaving the cloud */
export const DROWSY_LINGER = 0.7;

// ---------------------------------------------------------------------------
// Wind (World 4)
// ---------------------------------------------------------------------------

/** the share of a gust's push that reaches a player standing on the ground */
export const WIND_GROUND_SHARE = 0.4;

/** the sideways velocity the wind adds to a player this frame */
export function windPush(zones: readonly Zone[] | undefined, x: number, y: number, t: number, grounded: boolean): number {
  const { strength, zone } = zoneEffect(zones, 'wind', x, y, t);
  if (!zone) return 0;
  return zone.dir * zone.force * strength * (grounded ? WIND_GROUND_SHARE : 1);
}

// ---------------------------------------------------------------------------
// What each stage teaches
// ---------------------------------------------------------------------------

/** the shape of one piece of a zone stage */
export type ZoneShape = 'meadow' | 'gap' | 'stones';

export interface ZonePiece {
  kind: ZoneKind;
  shape: ZoneShape;
  /** stones: how many */
  count: number;
  /** wind only: +1 pushes the way you run (helps a jump), -1 against you (shortens it) */
  dir: 1 | -1;
  period: number;
  warn: number;
  active: number;
  force: number;
}

const spore = (shape: ZoneShape, count = 0, period = 6.4, active = 2.2): ZonePiece => ({
  kind: 'spore', shape, count, dir: 1, period, warn: 1.0, active, force: 0,
});
/** `idle` is the quiet spell between gusts: later stages shorten it a little, but never below two seconds */
const gust = (shape: ZoneShape, dir: 1 | -1, force = 120, idle = 2.8, active = 2.2): ZonePiece => ({
  kind: 'wind', shape, count: 0, dir, period: idle + 1.1 + active, warn: 1.1, active, force,
});

/**
 * World 3, stage by stage (stage 1 first). One idea at a time: first a cloud on open ground that just slows you (nothing to lose), then a
 * cloud over a gap with a long quiet spell, then stepping stones that each have a cloud of their own on a different beat.
 */
export function sporeRecipes(mini: number): ZonePiece[] {
  const table: ZonePiece[][] = [
    [spore('meadow')],
    [spore('gap', 0, 7.2, 2.0)],
    [spore('gap', 0, 7.0, 2.2), spore('meadow')],
    [spore('stones', 2, 7.0, 2.0), spore('gap', 0, 6.6, 2.2)],
    [spore('stones', 3, 7.0, 2.2), spore('gap', 0, 6.4, 2.4)],
    [spore('gap', 0, 6.4, 2.4), spore('stones', 3, 6.8, 2.4)],
    [spore('stones', 3, 6.6, 2.4), spore('gap', 0, 6.2, 2.5), spore('stones', 4, 6.6, 2.4)],
    [spore('gap', 0, 6.2, 2.5), spore('stones', 4, 6.4, 2.5), spore('gap', 0, 6.0, 2.6)],
    [spore('stones', 4, 6.4, 2.5), spore('gap', 0, 6.0, 2.6), spore('stones', 4, 6.2, 2.6)],
  ];
  return table[Math.max(0, Math.min(table.length - 1, mini - 1))].map((p) => ({ ...p }));
}

/**
 * World 4: a gust on open ground that shoves you along (a tailwind, harmless), then gusts over a small gap that carry you across, then
 * headwinds that shorten the jump so the double jump matters, then both on one stage.
 */
export function windRecipes(mini: number): ZonePiece[] {
  const table: ZonePiece[][] = [
    [gust('meadow', 1)],
    [gust('gap', 1, 110)],
    [gust('gap', 1, 120), gust('meadow', -1, 110)],
    [gust('gap', -1, 110), gust('gap', 1, 125)],
    [gust('gap', -1, 120, 2.6, 2.2), gust('gap', 1, 130)],
    [gust('gap', 1, 135), gust('gap', -1, 125, 2.4, 2.3), gust('meadow', -1, 130)],
    [gust('gap', -1, 130, 2.4, 2.3), gust('gap', 1, 140), gust('gap', -1, 130, 2.2, 2.4)],
    [gust('gap', 1, 140), gust('gap', -1, 135, 2.2, 2.4), gust('gap', -1, 140, 2.1, 2.4), gust('meadow', 1, 140)],
    [gust('gap', -1, 140, 2.1, 2.5), gust('gap', 1, 150, 2.2, 2.4), gust('gap', -1, 140, 2.1, 2.5), gust('gap', 1, 150, 2.2, 2.4)],
  ];
  return table[Math.max(0, Math.min(table.length - 1, mini - 1))].map((p) => ({ ...p }));
}

/** the pieces of a zone world stage (empty for other worlds) */
export function zoneRecipes(world: number, mini: number): ZonePiece[] {
  if (world === 3) return sporeRecipes(mini);
  if (world === 4) return windRecipes(mini);
  return [];
}

/** how much extra ground a piece needs (px), so the stage can be made as much longer */
export function pieceWidth(p: ZonePiece): number {
  if (p.shape === 'meadow') return 520;
  if (p.shape === 'gap') return 700;
  return 220 + p.count * 230;
}
