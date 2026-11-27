/**
 * The moonbeam and the moonflower step (ENG-MOON, 3-4.md NEW 1; R-165.449). One clock moves the beam (clock.ts cyclePos), and every
 * flower's open window is worked out from that same clock, exactly, as a LightClock (zones.ts, ADR-004): the flower is solid while its
 * clock's window is open. Nothing here keeps state, so the play, the verdicts and the bots read the same answer at every t.
 *
 *  - A SWING band rests on walls[0] for `rest` s, slides to walls[1] in `slide` s, rests, slides back (period 2 x (rest + slide)); it
 *    lights x within `half` of its centre, at every height.
 *  - A RISING band's top climbs from `from` up to `to` (world y, `to` above `from`) at `rise` px/s, `h` px tall, then starts again (after
 *    `rest` s at the foot); it lights y within [top, top + h], at every x within `half` of `x`.
 *
 * A flower opens BLOOM s after the band reaches it (it stays closed through a touch shorter than that), stays open while it is lit, and
 * droops `droop` s after the band leaves (the warning frames: still solid), then closes (not solid: he falls through, as a broken
 * crumble does).
 */
import { cyclePos } from './clock.ts';
import type { LightClock } from './zones.ts';

/** the seconds a flower takes to open once the band reaches it (3-4.md: bloom OPEN 0.4 s; w3flight35.ts OPEN) */
export const BLOOM = 0.4;

export type MoonBand =
  | { kind: 'swing'; walls: readonly [number, number]; rest: number; slide: number; half: number; offset: number }
  | { kind: 'rise'; x: number; half: number; from: number; to: number; rise: number; h: number; rest: number; offset: number };

/** one band's period (s) */
export function bandPeriod(b: MoonBand): number {
  return b.kind === 'swing' ? 2 * (b.rest + b.slide) : b.rest + (b.from - b.to) / b.rise;
}

/** a piece of the band's motion over one period: its coordinate (swing: the centre's x; rise: the top's y) goes from c0 to c1, linearly,
 *  over phase [p0, p1) */
interface Leg { p0: number; p1: number; c0: number; c1: number }
function legs(b: MoonBand): Leg[] {
  if (b.kind === 'swing') {
    const [a, z] = b.walls;
    const r = b.rest, s = b.slide;
    return [
      { p0: 0, p1: r, c0: a, c1: a },
      { p0: r, p1: r + s, c0: a, c1: z },
      { p0: r + s, p1: 2 * r + s, c0: z, c1: z },
      { p0: 2 * r + s, p1: 2 * (r + s), c0: z, c1: a },
    ];
  }
  const up = (b.from - b.to) / b.rise;
  return [
    ...(b.rest > 0 ? [{ p0: 0, p1: b.rest, c0: b.from, c1: b.from }] : []),
    { p0: b.rest, p1: b.rest + up, c0: b.from, c1: b.to },
  ];
}
const coordAt = (l: Leg, p: number) => (l.p1 === l.p0 ? l.c0 : l.c0 + ((l.c1 - l.c0) * (p - l.p0)) / (l.p1 - l.p0));

/** where the band is at t: the lit box's centre x and its top and bottom (world px; a swing lights every height) */
export function bandAt(b: MoonBand, t: number): { x: number; top: number; bottom: number } {
  const p = cyclePos(t, b.offset, bandPeriod(b));
  const ls = legs(b);
  const l = ls.find((q) => p >= q.p0 && p < q.p1) ?? ls[ls.length - 1];
  const c = coordAt(l, p);
  return b.kind === 'swing' ? { x: c, top: -Infinity, bottom: Infinity } : { x: b.x, top: c, bottom: c + b.h };
}

/** is the point (x, y) inside the band at t? (the beam's own 'lit': zones.ts litRing reads it, one definition) */
export function bandCovers(b: MoonBand, x: number, y: number, t: number): boolean {
  const at = bandAt(b, t);
  return Math.abs(x - at.x) <= b.half && y >= at.top && y <= at.bottom;
}

/** the band's lit windows over the point (x, y), as [from, len) in its cycle's phase, joined across the period's end (a window that
 *  wraps has from + len > period). Exact: the motion is linear on every leg */
export function litWindows(b: MoonBand, x: number, y: number): Array<{ from: number; len: number }> {
  const P = bandPeriod(b);
  // the coordinate's lit range: swing, the centre within `half` of x (and every y); rise, the top within [y - h, y] (and x within half)
  let lo: number, hi: number;
  if (b.kind === 'swing') { lo = x - b.half; hi = x + b.half; }
  else {
    if (Math.abs(x - b.x) > b.half) return [];
    lo = y - b.h; hi = y;
  }
  const raw: Array<[number, number]> = [];
  for (const l of legs(b)) {
    if (l.p1 <= l.p0) continue;
    if (l.c0 === l.c1) { if (l.c0 >= lo && l.c0 <= hi) raw.push([l.p0, l.p1]); continue; }
    // the phases where c0 + (c1 - c0) u is in [lo, hi], u in [0, 1]
    const k = (l.c1 - l.c0) / (l.p1 - l.p0);
    let a = l.p0 + (lo - l.c0) / k, z = l.p0 + (hi - l.c0) / k;
    if (a > z) [a, z] = [z, a];
    a = Math.max(a, l.p0); z = Math.min(z, l.p1);
    if (z > a) raw.push([a, z]);
  }
  // join touching pieces, then the last to the first across the period's end
  const out: Array<[number, number]> = [];
  for (const [a, z] of raw) {
    const last = out[out.length - 1];
    if (last && a - last[1] < 1e-9) last[1] = Math.max(last[1], z);
    else out.push([a, z]);
  }
  if (out.length > 1 && out[0][0] < 1e-9 && P - out[out.length - 1][1] < 1e-9) {
    const tail = out.pop()!;
    out[0] = [tail[0], out[0][1] + P];
  }
  if (out.length === 1 && out[0][0] < 1e-9 && P - out[0][1] < 1e-9) return [{ from: 0, len: Infinity }];
  return out.map(([a, z]) => ({ from: a, len: z - a }));
}

/** a flower's open windows as LightClocks (zones.ts): open from BLOOM s after the band reaches it until `droop` s after it leaves; a
 *  touch shorter than BLOOM opens nothing. A flower the band always lights is open for good (len Infinity). Empty: it never opens */
export function flowerClocks(b: MoonBand, x: number, y: number, droop: number): LightClock[] {
  const P = bandPeriod(b);
  const out: LightClock[] = [];
  for (const w of litWindows(b, x, y)) {
    if (w.len === Infinity) { out.push({ period: P, from: 0, len: Infinity, offset: b.offset }); continue; }
    if (w.len <= BLOOM) continue;
    out.push({ period: P, from: (w.from + BLOOM) % P, len: Math.min(P, w.len - BLOOM + droop), offset: b.offset });
  }
  return out;
}

/** is a flower with these clocks open (solid) at t? (a window may run over the period's end: its phase is read both ways round) */
export function flowerOpen(cs: readonly LightClock[], t: number): boolean {
  for (const c of cs) {
    if (c.len === Infinity) return true;
    const into = (((cyclePos(t, c.offset, c.period) - c.from) % c.period) + c.period) % c.period;
    if (into < c.len) return true;
  }
  return false;
}

/** seconds the flower stays open from t (0: closed now); the verdicts' and the bot's read */
export function flowerLeft(cs: readonly LightClock[], t: number): number {
  let best = 0;
  for (const c of cs) {
    if (c.len === Infinity) return Infinity;
    const into = (((cyclePos(t, c.offset, c.period) - c.from) % c.period) + c.period) % c.period;
    if (into < c.len) best = Math.max(best, c.len - into);
  }
  return best;
}

/** the drooping part of a flower's window at t, 0..1 (0: fully open or closed; rising to 1 as it closes): the warning frames' draw */
export function flowerDroop(cs: readonly LightClock[], t: number, droop: number): number {
  const left = flowerLeft(cs, t);
  if (left <= 0 || left === Infinity || droop <= 0 || left > droop) return 0;
  return 1 - left / droop;
}

// ───────────────────────────── the stage's moon: a zone's beam, and the flowers in its box ─────────────────────────────

type Setting = 'normal' | 'easy';
/** a 'moon' zone's data (zones.ts Zone.moon): each setting's band (Easy is the design's own numbers, not a stretch: 3-4.md rest 4.8 /
 *  droop 1.6 / rise 55, band 400) and droop. World px */
export interface MoonDef {
  band: Readonly<Record<Setting, MoonBand>>;
  droop: Readonly<Record<Setting, number>>;
  /** where the shaft comes in (the mouth, world px): the beam is drawn as a slanted shaft from here to the band */
  mouth: { x: number; y: number };
}

/** the band moved (the pipeline's shifts) */
export function moveBand(b: MoonBand, dx: number, dy: number): MoonBand {
  return b.kind === 'swing'
    ? { ...b, walls: [b.walls[0] + dx, b.walls[1] + dx] }
    : { ...b, x: b.x + dx, from: b.from + dy, to: b.to + dy };
}
/** the band mirrored about x = sum / 2 (a leg laid left): the walls swap sides, so the band starts on the mirrored first wall */
export function mirrorBand(b: MoonBand, sum: number): MoonBand {
  return b.kind === 'swing' ? { ...b, walls: [sum - b.walls[0], sum - b.walls[1]] } : { ...b, x: sum - b.x };
}
/** a moon zone moved by (dx, dy), in place (pipeline.ts's shifts call it with the zone's own) */
export function moveMoon(m: MoonDef, dx: number, dy: number): void {
  m.band = { normal: moveBand(m.band.normal, dx, dy), easy: moveBand(m.band.easy, dx, dy) };
  m.mouth = { x: m.mouth.x + dx, y: m.mouth.y + dy };
}
export function mirrorMoon(m: MoonDef, sum: number): void {
  m.band = { normal: mirrorBand(m.band.normal, sum), easy: mirrorBand(m.band.easy, sum) };
  m.mouth = { x: sum - m.mouth.x, y: m.mouth.y };
}

interface FlowerPlatform { id: number; x: number; y: number; width: number; moonflower?: boolean }
interface MoonZone { kind: string; x0: number; x1: number; top: number; bottom: number; moon?: MoonDef }
/** one moonflower step on a setting: its platform, the zone whose beam opens it, its open windows */
export interface Flower<P extends FlowerPlatform = FlowerPlatform> { p: P; zone: MoonZone; clocks: LightClock[]; droop: number }

/** every moonflower step of a stage on a setting, with its open windows (read at its top's middle: where he stands). A flower in no
 *  moon zone has no clocks (it never opens: the verdict names it) */
export function moonFlowers<P extends FlowerPlatform>(stage: { platforms: readonly P[]; zones?: readonly MoonZone[] }, setting: Setting): Flower<P>[] {
  const out: Flower<P>[] = [];
  for (const p of stage.platforms) {
    if (!p.moonflower) continue;
    const cx = p.x + p.width / 2;
    const zone = (stage.zones ?? []).find((z) => z.kind === 'moon' && z.moon && cx >= z.x0 && cx <= z.x1 && p.y >= z.top && p.y <= z.bottom);
    const droop = zone?.moon?.droop[setting] ?? 0;
    out.push({ p, zone: zone ?? { kind: 'none', x0: 0, x1: 0, top: 0, bottom: 0 }, clocks: zone?.moon ? flowerClocks(zone.moon.band[setting], cx, p.y, droop) : [], droop });
  }
  return out;
}

/** 3-4's numbers, flown (3-4.md 'The numbers, FLOWN'; w3flight35.ts beam): Normal rest 3.6 / slide 2.4 / droop 1.0 / rise 70 px/s, band
 *  300; Easy rest 4.8 / slide 2.4 / droop 1.6 / rise 55 px/s, band 400 (Easy is the design's own numbers, not a stretch) */
export const MOON = {
  normal: { rest: 3.6, slide: 2.4, droop: 1.0, rise: 70, h: 300 },
  easy: { rest: 4.8, slide: 2.4, droop: 1.6, rise: 55, h: 400 },
} as const;
/** the band's reach past the stair's own ends (px): it lights the whole stair at rest, its stones' lips included */
export const MOON_PAD = 40;
/** how far over the band the mouth is (px): the shaft slants in from up there */
export const MOON_MOUTH = 520;

/**
 * Lay a moon over its steps (the section's zone, pipeline.ts): marks each step a moonflower and returns the zone, its box over the
 * stair with room under it (where a fall from a flower lands) and over it. `dir`: the section's way across (-1 laid mirrored), so a
 * swing's far wall is mirrored with it. A swing on the RIGHT-hand wall runs half a period behind (rest + slide), so every swing in a
 * stage is the one beam going wall to wall (the same walls, the same motion, whichever storey laid it)
 */
export function layMoon(
  steps: ReadonlyArray<{ x: number; y: number; width: number; moonflower?: true }>,
  band: 'rest' | 'swing' | 'rise',
  far: number,
  dir: 1 | -1,
): { x0: number; x1: number; top: number; bottom: number; moon: MoonDef } {
  for (const p of steps) p.moonflower = true;
  const x0 = Math.min(...steps.map((p) => p.x)) - MOON_PAD;
  const x1 = Math.max(...steps.map((p) => p.x + p.width)) + MOON_PAD;
  const hi = Math.min(...steps.map((p) => p.y));
  const lo = Math.max(...steps.map((p) => p.y));
  const c = (x0 + x1) / 2, half = (x1 - x0) / 2;
  const across = far * dir;
  const mk = (s: 'normal' | 'easy'): MoonBand => {
    const n = MOON[s];
    if (band === 'rise') {
      // the top starts under the lowest flower and climbs until the band's foot is over the highest; then it starts again
      return { kind: 'rise', x: c, half, from: lo + 2, to: hi - n.h - 2, rise: n.rise, h: n.h, rest: n.rest, offset: 0 };
    }
    if (band === 'rest' || !across) return { kind: 'swing', walls: [c, c], rest: n.rest, slide: n.slide, half, offset: 0 };
    const right = across < 0;
    const walls: [number, number] = [c, c + across];
    return { kind: 'swing', walls, rest: n.rest, slide: n.slide, half, offset: right ? n.rest + n.slide : 0 };
  };
  const wallsX = band === 'swing' && across ? [c, c + across] : [c, c];
  const moon: MoonDef = {
    band: { normal: mk('normal'), easy: mk('easy') },
    droop: { normal: MOON.normal.droop, easy: MOON.easy.droop },
    mouth: { x: (wallsX[0] + wallsX[1]) / 2, y: hi - MOON_MOUTH },
  };
  const bx0 = Math.min(x0, ...wallsX.map((x) => x - half)), bx1 = Math.max(x1, ...wallsX.map((x) => x + half));
  return { x0: bx0, x1: bx1, top: hi - 300, bottom: lo + 200, moon };
}

/**
 * ONE beam (3-4.md beat 4: 'the beam swings wall to wall'): every swing moon of a stage is set to the same band, between the leftmost
 * and the rightmost of their stairs' middles, on the stage's one clock (offset 0), so storeys anywhere across the shaft are lit by the
 * one beam as it passes (a stair between the walls is lit twice a period: litWindows). In place; translation-free, so it may run
 * before or after the layout's shifts. Rest and rise moons keep their own.
 */
export function oneBeam(zones: ReadonlyArray<{ kind: string; moon?: MoonDef }>): void {
  const swings = zones.filter((z) => z.kind === 'moon' && z.moon && z.moon.band.normal.kind === 'swing' && z.moon.band.normal.walls[0] !== z.moon.band.normal.walls[1]);
  if (!swings.length) return;
  const mids = swings.map((z) => (z.moon!.band.normal as Extract<MoonBand, { kind: 'swing' }>).walls[0]);
  const a = Math.min(...mids), b = Math.max(...mids);
  for (const z of swings) {
    const m = z.moon!;
    const set = (s: 'normal' | 'easy') => {
      const o = m.band[s] as Extract<MoonBand, { kind: 'swing' }>;
      return { ...o, walls: [a, b === a ? a + (o.walls[1] - o.walls[0]) : b] as [number, number], offset: 0 };
    };
    m.band = { normal: set('normal'), easy: set('easy') };
    m.mouth = { x: (a + b) / 2, y: m.mouth.y };
  }
}

/** the least open window a flower may have, from the band reaching it to its close (s): the flown stair time of a 0.5 s reader plus the
 *  margin (3-4.md 'A storey in the beam': Normal 0.4 + 3.6 + 1.0 = 5.0 s, Easy 0.4 + 4.8 + 1.6 = 6.8 s) */
export const MOON_WINDOW = { normal: 5.0, easy: 6.8 } as const;
/** how far under a flower its own storey's stone may be (px): the stair's full rise (3 x 100) and its last step */
export const MOON_STONE_DROP = 400;

/**
 * The moon's verdicts on a laid stage, by name (empty: kept): (1) every flower opens, and every open window it has (band arrival to
 * close: BLOOM + its clock's len) is at least MOON_WINDOW of the setting; (2) every flower stands over its own storey's stone (a
 * solid piece, not a flower, under its whole width within MOON_STONE_DROP px), so a closing flower drops him onto stone, never a fall.
 */
export function moonVerdicts(stage: { platforms: ReadonlyArray<FlowerPlatform & { type?: string; broken?: boolean }>; zones?: readonly MoonZone[] }, setting: Setting): string[] {
  const out: string[] = [];
  const R = Math.round;
  for (const f of moonFlowers(stage, setting)) {
    const at = `moon: the flower at x ${R(f.p.x)}, y ${R(f.p.y)} (${setting})`;
    if (!f.clocks.length) out.push(`${at} never opens`);
    // (a swing whose beam never leaves its stair: a swing flower open for good is a dead swing, never shipped (the lead, ENG-MOON-b). A
    //  swing's walls far enough apart are the kit's (its storeys' stairs at opposite walls); a rest band (walls the same) stays open by design)
    const b = f.zone.moon?.band[setting];
    if (b?.kind === 'swing' && b.walls[0] !== b.walls[1] && f.clocks.some((c) => c.len === Infinity)) out.push(`${at} never closes: its swing's beam never leaves it (walls ${R(b.walls[0])}-${R(b.walls[1])}, half ${R(b.half)}: the storeys' stairs must stand at opposite walls)`);
    for (const c of f.clocks) if (c.len !== Infinity && c.len + BLOOM < MOON_WINDOW[setting] - 1e-6) out.push(`${at} is open ${(c.len + BLOOM).toFixed(2)} s, under ${MOON_WINDOW[setting]} s`);
    const stone = stage.platforms.some((q) => !q.moonflower && q.type !== 'bouncy' && q.y > f.p.y && q.y <= f.p.y + MOON_STONE_DROP && q.x <= f.p.x && q.x + q.width >= f.p.x + f.p.width);
    if (!stone) out.push(`${at} stands over no stone of its storey (a closing flower would drop him into a fall)`);
  }
  return out;
}
