/**
 * Timed zones: the signature rules of Worlds 3 and 4.
 *
 * A zone is a box of air that wakes up on a fixed rhythm: it sits idle, shows a warning, then is active for a while, and starts
 * over. Because the rhythm never changes and the warning is long, a zone can always be waited out, which is what keeps it fair.
 *   - World 3, the Mossy Grotto: SPORE clouds. Mushrooms puff out a sleepy cloud; inside it Pokey goes drowsy (slow, a shorter jump).
 *   - World 4, the Mist Cascades: WIND gusts. A gust pushes everything in the lane to one side, helping or hindering a jump.
 *
 *   - World 9, the Volcanic Jungle: lava GEYSERS. Vents rumble, then erupt in a column that burns anything standing in it.
 *   - World 10, the Stormy Highlands: LIGHTNING. Rods charge, then a bolt strikes down the same column. And iron SPIKES: a spike bed on
 *     the floor of a pit (always on: it hurts whoever stands in it, as a column does while firing).
 *   - World 5, the Orchid Sanctuary: sticky WEBS. Patches and web bridges that slow you to a crawl (always on).
 *   - World 6, the Deep Mangrove: the TIDE. A mudflat you can cross at low tide; when it rises it sweeps you back.
 *   - World 7, the Ancient Ruins: CRUMBLING tiles (see `crumble*` below and the platform's `crumbleAfter`).
 *   - World 8, the Twilight Treetops: DARKNESS. The screen goes dark; Pokey's lantern and the fireflies are the only light (always on).
 *
 * Everything here is pure (no canvas, no engine) so the generator, the validator, the engine, the drawing and the tests agree on what
 * a zone is doing at any moment.
 */

export type ZoneKind = 'spore' | 'wind' | 'geyser' | 'bolt' | 'web' | 'tide' | 'dark' | 'crumble' | 'spikes';

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
  /**
   * darkness: the fireflies and lanterns that light the way (world px). World 3's glowworms are `sleep`ing lights: dark until Pokey stands
   * still near them for a moment (GLOW_STILL), then they wake one after another and stay lit (engine.ts). `id` names one for its threads.
   */
  lights?: Array<{ x: number; y: number; r: number; sleep?: boolean; id?: number }>;
  /**
   * the puzzle kit's wind shutter (puzzleKit.ts 'shutter', World 4) has this gust lane shut: it is calm, whatever its rhythm says, until
   * the shutter opens again (the kit sets it each frame)
   */
  shut?: boolean;
  /** webs: a web bridge strung over a gap (painted as the silk bridge, zoneArt.ts), not a patch on the ground */
  bridge?: boolean;
  /** a 'bolt' column drawn and felt as World 10's drop gate (a portcullis over the wall-walk, w10DropArt.ts): caught under it, he is
   *  shoved back out the side he came in, and it costs a heart on Normal only */
  look?: 'portcullis' | 'gush' | 'barrel';
  /** ('barrel': World 10's rolling barrel, GRAB-BAG K: the zone is the barrel's lane along a wall; while it is active one barrel rolls the
   *  lane's length, `dir` the way, and only the barrel itself hurts: barrelX) ('gush': World 10's gutter spout, GRAB-BAG E: a column of storm water that knocks him back out and down while it pours, never a
   *  heart) a drop gate where it is taught: it shoves him out and never hurts, on either setting */
  gentle?: boolean;
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

/** World 3: how long Pokey must stand still for the glowworms near him to wake (s) */
export const GLOW_STILL = 0.7;
/** World 3: sleeping glowworms this far ahead of him (and a little behind) wake when he stands still, the far ones a moment later */
export const GLOW_REACH = { back: 260, ahead: 1050, speed: 900, fade: 0.6 } as const;

/** webs, darkness, crumbling ruins and spike beds never change: they are simply on */
export const isStatic = (z: Pick<Zone, 'kind'>) => z.kind === 'web' || z.kind === 'dark' || z.kind === 'crumble' || z.kind === 'spikes';

export function zoneState(z: Zone, t: number): ZoneState {
  if (z.shut) return { phase: 'idle', u: 0, strength: 0, untilActive: Infinity };
  if (isStatic(z)) return { phase: 'active', u: 0, strength: 1, untilActive: 0 };
  const s = (((t + z.offset) % z.period) + z.period) % z.period;
  const idle = idleTime(z);
  if (s < idle) return { phase: 'idle', u: s / idle, strength: 0, untilActive: z.period - z.active - s };
  if (s < idle + z.warn) return { phase: 'warn', u: (s - idle) / z.warn, strength: 0, untilActive: idle + z.warn - s };
  const a = s - idle - z.warn;
  const r = Math.min(ZONE_RAMP, z.active / 3);
  const ramp = Math.min(1, a / r, (z.active - a) / r);
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
// Columns (Worlds 9 and 10)
// ---------------------------------------------------------------------------

/** geysers and bolts hurt: a zone of these kinds burns whoever is inside it while it is firing (a spike bed always) */
export const isDamaging = (z: Pick<Zone, 'kind'>) => z.kind === 'geyser' || z.kind === 'bolt' || z.kind === 'spikes';

/** a column is dangerous once it is at least this far into its burst (so the first instant of the ramp is a grace) */
export const COLUMN_HOT = 0.5;

/** a rolling barrel's size (World 10, GRAB-BAG K): its half width and its height over the lane */
export const BARREL = { half: 22, h: 40 } as const;
/** where a barrel lane's barrel is at time t (world x of its middle), or null while none is rolling */
export function barrelX(z: Zone, t: number): number | null {
  const st = zoneState(z, t);
  if (st.phase !== 'active') return null;
  return z.dir === 1 ? z.x0 + st.u * (z.x1 - z.x0) : z.x1 - st.u * (z.x1 - z.x0);
}

/** the firing damaging zone that overlaps the box, if any */
export function columnHit(zones: readonly Zone[] | undefined, x: number, y: number, w: number, h: number, t: number): Zone | null {
  if (!zones) return null;
  for (const z of zones) {
    if (!isDamaging(z) || x + w < z.x0 || x > z.x1 || y + h < z.top || y > z.bottom) continue;
    if (z.look === 'barrel') {
      // (only the barrel hurts: over it, or beside it, he is fine)
      const bx = barrelX(z, t);
      if (bx === null || x + w < bx - BARREL.half || x > bx + BARREL.half || y + h < z.baseY - BARREL.h) continue;
      return z;
    }
    if (zoneState(z, t).strength >= COLUMN_HOT) return z;
  }
  return null;
}

/**
 * Hot air over a vent (World 9, Matt's "hot-air lift from vents"): with the leaf open over a vent, Pokey rises on the warm air. It
 * lifts him anywhere above the column up to VENT_LIFT_H over its top, and inside the column too while it is not erupting (while it
 * erupts, the column itself burns as before). The level check never counts on it, so it is a gift, never a must.
 */
export const VENT_LIFT_H = 340;
export function ventLift(zones: readonly Zone[] | undefined, x: number, y: number, t: number): boolean {
  if (!zones) return false;
  for (const z of zones) {
    if (z.kind !== 'geyser' || x < z.x0 || x > z.x1 || y < z.top - VENT_LIFT_H || y > z.bottom) continue;
    if (y < z.top || zoneState(z, t).phase !== 'active') return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Drowsiness (World 3)
// ---------------------------------------------------------------------------

/** a player in the thick of a cloud runs at this fraction of full speed... */
export const DROWSY_SPEED = 0.5;
/**
 * ...and launches at this fraction of a jump's speed. Height goes with the square of that (0.95 gives 90% of the rise), so a jump inside a
 * cloud still reaches every platform the generator calls safe (SAFE.rise1 is 82% of a full jump); it is the cloud's slowing that costs time.
 */
export const DROWSY_JUMP = 0.95;
/** the drowsiness ends the moment the cloud does: nothing lingers, so a cloud that has cleared is a cloud that is gone */
export const DROWSY_LINGER = 0;
/** below this much cloud there is no effect at all (the thin edge of a puff is just a sight, not a spell) */
export const DROWSY_MIN = 0.15;

/** how drowsy a point in the cloud is, 0..1: follows the cloud's own thickness, so it comes on and goes off with what you see */
export const drowsyLevel = (strength: number) => (strength > DROWSY_MIN ? Math.min(1, strength) : 0);
/** the run speed share at this drowsiness (1 when awake) */
export const drowsySpeed = (level: number) => 1 - (1 - DROWSY_SPEED) * level;
/** the jump speed share at this drowsiness (1 when awake) */
export const drowsyJump = (level: number) => 1 - (1 - DROWSY_JUMP) * level;
/**
 * The spell a spore cloud is clear and he is fully awake again, counted from the moment the cloud has gone and the lingering sleep has
 * worn off to the moment the next one wakes. A crossing starts and ends inside it, and a jump that starts awake stays full strength
 * to the landing (engine: flightClear), so every cloud can be crossed on its beat. No cloud may leave less than this.
 */
export const SPORE_CLEAR_MIN = 3.0;
export const sporeClearTime = (z: Pick<Zone, 'period' | 'active'>) => z.period - z.active - DROWSY_LINGER;

// ---------------------------------------------------------------------------
// Wind (World 4)
// ---------------------------------------------------------------------------

/** the share of a gust's push that reaches a player standing on the ground */
export const WIND_GROUND_SHARE = 0.4;

/** the sideways velocity the wind adds to a player this frame */
export function windPush(zones: readonly Zone[] | undefined, x: number, y: number, t: number, grounded: boolean): number {
  const { strength, zone } = zoneEffect(zones, 'wind', x, y, t);
  let push = zone ? zone.dir * zone.force * strength * (grounded ? WIND_GROUND_SHARE : 1) : 0;
  // the rising tide sweeps whoever is in the mudflat toward the bank they came from, grounded or not
  const tide = zoneEffect(zones, 'tide', x, y, t);
  if (tide.zone) push += tide.zone.dir * tide.zone.force * tide.strength;
  return push;
}

// ---------------------------------------------------------------------------
// Drag (Worlds 5 and 6): sticky webs and the mudflat slow you down
// ---------------------------------------------------------------------------

export const WEB_SPEED = 0.4;
export const WEB_JUMP = 0.85;
/** the mudflat: a little slow at low tide, much slower once the water is up */
export const TIDE_SPEED = { low: 0.78, rising: 0.72, high: 0.5 } as const;

/** what the zones under the player do to their run speed and jump, 1 = nothing */
export function zoneDrag(zones: readonly Zone[] | undefined, x: number, y: number, t: number): { speed: number; jump: number } {
  let speed = 1;
  let jump = 1;
  if (!zones) return { speed, jump };
  for (const z of zones) {
    if (!inZone(z, x, y)) continue;
    if (z.kind === 'web') { speed *= WEB_SPEED; jump *= WEB_JUMP; }
    else if (z.kind === 'tide') {
      const ph = zoneState(z, t).phase;
      speed *= ph === 'idle' ? TIDE_SPEED.low : ph === 'warn' ? TIDE_SPEED.rising : TIDE_SPEED.high;
    }
  }
  return { speed, jump };
}

// ---------------------------------------------------------------------------
// Crumbling tiles (World 7)
// ---------------------------------------------------------------------------

/** seconds a crumbling ruin tile holds after it is first stepped on, by stage: the early ones are generous */
export function crumbleTime(mini: number): number {
  return Math.round((0.85 - 0.03 * (Math.max(1, Math.min(9, mini)) - 1)) * 100) / 100;
}
/** one tile's width and the most tiles in a row before a solid slab to rest on */
export const CRUMBLE_TILE_W = 110;
export const CRUMBLE_RUN_MAX = 4;
/** the tiles of a staircase run step up and down by this much */
export const CRUMBLE_STEP = 40;

// ---------------------------------------------------------------------------
// What each stage teaches
// ---------------------------------------------------------------------------

/** the shape of one piece of a zone stage */
export type ZoneShape = 'meadow' | 'gap' | 'stones' | 'columns' | 'patch' | 'web' | 'trough' | 'ruins' | 'dark';

export interface ZonePiece {
  kind: ZoneKind;
  shape: ZoneShape;
  /** stones / columns: how many */
  count: number;
  /** wind only: +1 pushes the way you run (helps a jump), -1 against you (shortens it) */
  dir: 1 | -1;
  period: number;
  warn: number;
  active: number;
  force: number;
  /** webs, tides and darkness: how long the zone is, px */
  len: number;
}

const spore = (shape: ZoneShape, count = 0, period = 6.4, active = 2.2): ZonePiece => ({
  kind: 'spore', shape, count, dir: 1, period, warn: 1.0, active, force: 0, len: 0,
});
/** `idle` is the quiet spell between gusts: later stages shorten it a little, but never below two seconds */
const gust = (shape: ZoneShape, dir: 1 | -1, force = 120, idle = 2.8, active = 2.2): ZonePiece => ({
  kind: 'wind', shape, count: 0, dir, period: idle + 1.1 + active, warn: 1.1, active, force, len: 0,
});

const column = (kind: 'geyser' | 'bolt', shape: ZoneShape, count: number, idle: number, active: number, warn = 1.2): ZonePiece => ({
  kind, shape, count, dir: 1, period: idle + warn + active, warn, active, force: 0, len: 0,
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
    [spore('gap', 0, 6.2, 2.5), spore('stones', 4, 6.4, 2.5), spore('gap', 0, 6.4, 2.6)],
    [spore('stones', 4, 6.4, 2.5), spore('gap', 0, 6.4, 2.6), spore('stones', 4, 6.4, 2.6)],
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

/**
 * World 9: vents on open ground. One vent you can watch, then rows of them on staggered beats with a safe pocket between each, then vents
 * on both sides of a gap. The quiet spell shrinks a little as the world goes on but never below two seconds.
 */
export function geyserRecipes(mini: number): ZonePiece[] {
  const g = (shape: ZoneShape, n: number, idle: number, active = 0.9) => column('geyser', shape, n, idle, active, 1.3);
  const table: ZonePiece[][] = [
    [g('columns', 1, 3.0)],
    [g('columns', 2, 3.0)],
    [g('columns', 2, 2.8), g('gap', 2, 2.8)],
    [g('columns', 3, 2.6)],
    [g('gap', 2, 2.6), g('columns', 3, 2.5)],
    [g('columns', 3, 2.4), g('gap', 2, 2.4)],
    [g('columns', 3, 2.3), g('gap', 2, 2.3), g('columns', 2, 2.3)],
    [g('columns', 4, 2.2, 1.0), g('gap', 2, 2.2, 1.0), g('columns', 3, 2.2, 1.0)],
    [g('columns', 4, 2.1, 1.0), g('gap', 2, 2.1, 1.0), g('columns', 4, 2.1, 1.0)],
  ];
  return table[Math.max(0, Math.min(table.length - 1, mini - 1))].map((p) => ({ ...p }));
}

/** World 10: the same idea, but the strike is fast: a longer warning and a very short bolt */
export function boltRecipes(mini: number): ZonePiece[] {
  const b = (shape: ZoneShape, n: number, idle: number) => column('bolt', shape, n, idle, 0.4, 1.2);
  const table: ZonePiece[][] = [
    [b('columns', 1, 3.0)],
    [b('columns', 2, 3.0)],
    [b('columns', 2, 2.8), b('gap', 2, 2.8)],
    [b('columns', 3, 2.6)],
    [b('gap', 2, 2.6), b('columns', 3, 2.5)],
    [b('columns', 3, 2.4), b('gap', 2, 2.4)],
    [b('columns', 3, 2.3), b('gap', 2, 2.3), b('columns', 2, 2.3)],
    [b('columns', 4, 2.2), b('gap', 2, 2.2), b('columns', 3, 2.2)],
    [b('columns', 4, 2.1), b('gap', 2, 2.1), b('columns', 4, 2.1)],
  ];
  return table[Math.max(0, Math.min(table.length - 1, mini - 1))].map((p) => ({ ...p }));
}

const still = (kind: 'web' | 'dark', shape: ZoneShape, len: number, count = 0): ZonePiece => ({
  kind, shape, count, dir: 1, period: 1, warn: 0, active: 1, force: 0, len,
});

/**
 * World 5: webs. First a small patch with a branch to hop over it, then web bridges across gaps too wide to jump (you have to
 * walk them, slowly), then long mixed runs.
 */
export function webRecipes(mini: number): ZonePiece[] {
  const patch = (len: number) => still('web', 'patch', len);
  const bridge = (len: number) => still('web', 'web', len);
  const table: ZonePiece[][] = [
    [patch(150)],
    [patch(200)],
    [bridge(220)],
    [patch(220), bridge(260)],
    [bridge(300), patch(240)],
    [bridge(320), bridge(280), patch(200)],
    [patch(260), bridge(340), bridge(300)],
    [bridge(360), bridge(320), patch(240)],
    [bridge(380), patch(280), bridge(360), bridge(320)],
  ];
  return table[Math.max(0, Math.min(table.length - 1, mini - 1))].map((p) => ({ ...p }));
}

/** the tide's beat: a long low spell to cross in, then a rise you can see coming, then high water */
const tide = (len: number, low: number, active = 2.2, warn = 1.8): ZonePiece => ({
  kind: 'tide', shape: 'trough', count: 0, dir: -1, period: low + warn + active, warn, active, force: 190, len,
});

/** World 6: one short mudflat, then longer ones, then several in a row on different beats */
export function tideRecipes(mini: number): ZonePiece[] {
  const table: ZonePiece[][] = [
    [tide(240, 7.0)],
    [tide(280, 6.8)],
    [tide(300, 6.6), tide(260, 6.6)],
    [tide(320, 6.4), tide(280, 6.2)],
    [tide(340, 6.2), tide(260, 6.0)],
    [tide(360, 6.0), tide(300, 5.8)],
    [tide(380, 5.8), tide(320, 5.6), tide(260, 5.6)],
    [tide(400, 5.6), tide(340, 5.4), tide(300, 5.4)],
    [tide(420, 5.4), tide(360, 5.2), tide(320, 5.2)],
  ];
  return table[Math.max(0, Math.min(table.length - 1, mini - 1))].map((p) => ({ ...p }));
}

/** the low tide must outlast the walk across the mud, with a second to spare */
export const tideCrossTime = (len: number) => len / (PHYS_RUN * TIDE_SPEED.low * 0.8) + 1.0;
const PHYS_RUN = 285;

/** World 7: runs of crumbling tiles (`count` tiles, with a solid slab to rest on after every few) */
export function ruinRecipes(mini: number): ZonePiece[] {
  const run = (n: number): ZonePiece => ({ kind: 'crumble', shape: 'ruins', count: n, dir: 1, period: 1, warn: 0, active: 1, force: 0, len: 0 });
  const table: number[][] = [[3], [4], [4, 3], [5], [5, 4], [6, 4], [6, 5, 4], [7, 6, 5], [8, 6, 6]];
  return table[Math.max(0, Math.min(table.length - 1, mini - 1))].map(run);
}

/** World 8: dark stretches with a firefly swarm over every gap (`count` gaps) */
export function darkRecipes(mini: number): ZonePiece[] {
  const d = (len: number, gaps: number) => still('dark', 'dark', len, gaps);
  const table: ZonePiece[][] = [
    [d(520, 0)],
    [d(620, 1)],
    [d(700, 1)],
    [d(760, 2)],
    [d(560, 1), d(760, 2)],
    [d(800, 2), d(620, 1)],
    [d(840, 3), d(700, 2)],
    [d(700, 2), d(900, 3), d(700, 2)],
    [d(900, 3), d(760, 2), d(900, 3)],
  ];
  return table[Math.max(0, Math.min(table.length - 1, mini - 1))].map((p) => ({ ...p }));
}

/** the pieces of a zone world stage (empty for other worlds) */
export function zoneRecipes(world: number, mini: number): ZonePiece[] {
  if (world === 3) return sporeRecipes(mini);
  if (world === 4) return windRecipes(mini);
  if (world === 5) return webRecipes(mini);
  if (world === 6) return tideRecipes(mini);
  if (world === 7) return ruinRecipes(mini);
  if (world === 8) return darkRecipes(mini);
  if (world === 9) return geyserRecipes(mini);
  if (world === 10) return boltRecipes(mini);
  return [];
}

/** how much extra ground a piece needs (px), so the stage can be made as much longer */
export function pieceWidth(p: ZonePiece): number {
  if (p.shape === 'meadow') return 520;
  if (p.shape === 'patch') return 560 + p.len;
  if (p.shape === 'web') return 520 + p.len;
  if (p.shape === 'trough') return 520 + p.len;
  if (p.shape === 'ruins') return 520 + p.count * (CRUMBLE_TILE_W + 16);
  if (p.shape === 'dark') return 520 + p.len;
  if (p.shape === 'gap') return p.kind === 'geyser' || p.kind === 'bolt' ? 900 : 700;
  if (p.shape === 'columns') return 330 + p.count * 210;
  return 220 + p.count * 230;
}
