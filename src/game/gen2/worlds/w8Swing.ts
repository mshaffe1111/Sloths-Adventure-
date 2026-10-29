/**
 * gen2/worlds/w8Swing — World 8's swing and climb sections (DESIGN.md B9, B12 step 2), for the vine stages 8-3 "Long Swings" and 8-5
 * "Next Branch" (stagePlan.ts; reference/STORY-REWRITE.md "World 8: Twilight Treetops"), and any other World 8 stage the main kit
 * (w8Game.ts) gives them to.
 *
 * The Twilight Treetops: the light has gone, the fireflies come out, and Pokey's lantern and the fireflies are the only light (zones.ts
 * 'dark', always on). Boughs and hollow trunks high in the canopy, lianas hanging between the trees, climbing vines up the trunks. So
 * the rules every section here keeps (STAGE-RULES §6, "World 6 on gen2", and the first-timer lessons):
 *   - every swing, climb and hop of a section is in its dark stretch, and the stretch is lit enough to judge: the firefly swarm over
 *     every gap (levelCheck: r 150 or more within 120 px of the gap's middle), a swarm on every liana (its pivot, at grip height, so the
 *     whole swing shows), one over each perch, a dim one every 420 px; Pokey's lantern (210 px) does the rest;
 *   - a stretch goes lit bough ('in', a lantern hanging over it), dark, lit bough ('out'), all level (a stretch dropped below its lit
 *     bough sinks the soft pit under its swing past the boughs' feet, and they float over it), never mirrored, so a flag can stand on the lit
 *     boughs (flags never stand in the dark: the core keeps them out of a zone) and Dot's line on 'in' comes before the dark;
 *   - nothing stands in the dark (the core keeps animals and flags out of a zone): an animal waits on a lit bough;
 *   - under a liana: the stage's fall (a soft pit under the canopy whose climb goes back to the swing's own bough, pipeline backPit, never
 *     on to the perch: the swing is the only way on); a perch lies past every jump and the glide, raised 80 px (RAISE) and stepping back
 *     down after it;
 *   - gaps in the dark are hops of a third of a jump at most, never a lower bough, never a second-jump gap (a gap in the dark is a blind
 *     jump: STAGE-RULES §6);
 *   - each section is 600-1700 px plus 370 px a liana (w8Swing.test.ts); a bough is a whole bank down to the ground (a wall reaches the
 *     floor); nothing crumbles.
 *
 * The dark is laid by this file's props (W8S_PROP: a stretch's two ends, emitters W8S_EMIT): the main World 8 kit may lay the world's
 * darkness its own way, and these sections then keep only their lights (w8SwingLights). What has no painted art yet: the firefly swarms
 * and the lantern are drawn by the engine's darkness (zoneArt.ts drawDarkness), a small code-drawn glow (STAGE-RULES §4); the boughs and
 * trunks are the world's ground art (the main kit's).
 */
import type { Zone } from '../../zones.ts';
import type { Difficulty, Phase, PropDef, PropEmitter, SectionPiece, SectionTemplate, Socket, StageSink, WorldKit } from '../types.ts';
import { withW8Rooms } from './w8Rooms.ts';

// ───────────────────────────── the tags (what these sections ask the World 8 manifest for) ─────────────────────────────

export const W8S_TAG = {
  /** a small night animal (stomped or punched in one: a frog, a spider, a tayra) */
  small: 'small',
  /** a night hunter (an ocelot, the night harpy) */
  hunter: 'hunter',
  /** moss, a firefly lantern hook, a hollow knot: scenery on a bough */
  scenery: 'scenery',
} as const;

// ───────────────────────────── helpers ─────────────────────────────

type Opt = Partial<Socket>;
const petals = (id: string, on: string, t: Socket['t'], count = 2, span = 120, o: Opt = {}): Socket => ({ id, role: 'pickup', on, t, dn: 34, count, span, ...o });
/** an animal: `kinds` creature ids or tags it may be; `max` the most threat it may take (always on a lit bough: none stands in the dark) */
const foe = (id: string, on: string, t: Socket['t'], kinds: string[] = [W8S_TAG.small], max = 3, o: Opt = {}): Socket => ({ id, role: 'enemy', on, t, allow: kinds, maxThreat: max, easy: 'soften', ...o });
const scenery = (id: string, on: string, t: Socket['t'], chance = 0.6): Socket => ({ id, role: 'prop', on, t, allow: [W8S_TAG.scenery], chance });
const flag = (on: string, t: Socket['t']): Socket => ({ id: 'flag', role: 'flag', on, t });

const LIVE: Phase[] = ['sho', 'ten', 'ketsu'];

const bank = (key: string, w: SectionPiece['w'], place: SectionPiece['place'] = { kind: 'start' }, o: Partial<SectionPiece> = {}): SectionPiece => ({ key, shape: 'bank', w, place, ...o });
/** a knot on the bough or a step to the next bough: `dy` px up (one plain hop), or down */
const up = (key: string, after: string, dy: number, w: SectionPiece['w']): SectionPiece => bank(key, w, { kind: 'walk', after, dy: -dy });
const down = (key: string, after: string, dy: number, w: SectionPiece['w']): SectionPiece => bank(key, w, { kind: 'walk', after, dy });
/** a hop to the next bough: a third of a jump or so (in the dark: never more, STAGE-RULES §6) */
const hop = (key: string, after: string, w: SectionPiece['w'], share: SectionPiece['w'] = [0.28, 0.36], landing = false): SectionPiece =>
  bank(key, w, { kind: 'pit', after, jump: 'jump', share }, landing ? { landing } : {});

/** a liana past `after`'s end, its anchor 400-420 px up (a longer one throws him further: its perch lies past the glide, window kept) */
const liana = (key: string, after: string): SectionPiece => ({ key, shape: 'liana', w: 0, place: { kind: 'swing', after, top: [400, 420] } });
/**
 * How far a perch sits above its swing's bough (dy, up is negative): 80 px, as World 6 (STAGE-RULES §6: a level perch past the glide is
 * out of the calm swing's reach; raised 80 px, the glide reaches only ~307 px and the swing 440-480). Each raised perch steps back down
 * after it, so a section ends level with where it began.
 */
export const RAISE = -80;
/** the perch past a liana, a landing (Easy widens it); the fall under it is the stage's (a soft pit's climb goes back to the swing's bough) */
const perch = (key: string, after: string, w: SectionPiece['w'], dy: SectionPiece['w'] = RAISE): SectionPiece => bank(key, w, { kind: 'land', after, dy }, { landing: true });
/** a climbing vine at the end of `on`, `h` px tall, and the bough it leads up onto (a whole trunk: out of a double jump's reach) */
const climbWall = (vine: string, on: string, wall: string, h: number, w: SectionPiece['w']): SectionPiece[] => [
  { key: vine, shape: 'vine', w: 0, place: { kind: 'climb', on, at: 1, h } },
  bank(wall, w, { kind: 'over', on: vine, at: 0, dy: 0 }, { main: true }),
];

// ───────────────────────────── the dark, and the fireflies' light ─────────────────────────────

/** the dark swing's lesson key and Dot's line (new, needs Matt's approval; Dot is back in World 8: STAGE-RULES §1) */
export const W8_DARK_SWING = 'w8:dark-swing';
/** the trunk climb's in the dark */
export const W8_DARK_CLIMB = 'w8:dark-climb';
export const W8S_TIPS: Record<string, string> = {
  [W8_DARK_SWING]: 'Fireflies on the vine. Watch it swing, then jump.', // (new, needs Matt's approval)
  [W8_DARK_CLIMB]: 'Climb up into the dark. Your lantern goes too.', // (new, needs Matt's approval)
};
export const W8S_NEW_LINES: readonly string[] = Object.values(W8S_TIPS);

/** the props that lay a dark stretch: its start, its end (with the fireflies' lights), and a room's end (no lights: the room's own) */
export const W8S_PROP = { darkFrom: 'w8sDarkFrom', darkTo: 'w8sDarkTo', darkToBare: 'w8sDarkToBare', lantern: 'w8sLantern' } as const;
export const W8S_PROPS: PropDef[] = [
  { id: W8S_PROP.darkFrom, tags: [W8S_PROP.darkFrom], w: 10, minApart: 0 },
  { id: W8S_PROP.darkTo, tags: [W8S_PROP.darkTo], w: 10, minApart: 0 },
  { id: W8S_PROP.darkToBare, tags: [W8S_PROP.darkToBare], w: 10, minApart: 0 },
  // (a lantern hung over a lit bough: a picture and its light; the stretch's ends are lit by it)
  { id: W8S_PROP.lantern, tags: [W8S_PROP.lantern], w: 30, minApart: 0 },
];

/**
 * The dark's box over its ground, and the fireflies: a swarm over every gap (`gap`, levelCheck's r 150+), over every liana's pivot at
 * grip height (`liana`: r 260 reaches the whole swing, ±0.45 rad of a 400 px vine), over each perch past a liana (`perch`), and a dim one
 * along the way every `every` px where none is near (`way`). `reach` is the liana's pivot past its bough's end (pipeline LIANA.reach
 * 160-190: its middle).
 */
export const W8_DARK = { up: 800, down: 400, gap: 190, liana: 260, lianaUp: 120, perch: 200, perchUp: 170, way: 130, every: 420, lightUp: 90, reach: 175 } as const;

/** a dark stretch's two ends, as sockets on its first and last pieces */
export const darkEnds = (from: string, to: string, lights = true): Socket[] => [
  { id: 'darkFrom', role: 'prop', on: from, t: 0, allow: [W8S_PROP.darkFrom], easy: 'keep' },
  { id: 'darkTo', role: 'prop', on: to, t: 1, allow: [lights ? W8S_PROP.darkTo : W8S_PROP.darkToBare], easy: 'keep' },
];
/** a lantern over a lit bough (where the stretch is entered or left) */
const lantern = (id: string, on: string, t: Socket['t']): Socket => ({ id, role: 'prop', on, t, allow: [W8S_PROP.lantern], easy: 'keep' });

/** the end of a dark stretch filled first, waiting for the other (in sink.extras: one at a time, a section's own two) */
const OPEN = 'w8sDarkFrom';
/** the lanterns hung so far (sink.extras): each lights its bough */
export const W8_LANTERNS = 'w8sLanterns';

/** the ground under x (a piece whose top is within a step of the dark's ground): none is a gap the fireflies hang over */
function groundAt(out: StageSink, x: number, y: number): boolean {
  return out.platforms.some((p) => x >= p.x && x <= p.x + p.width && p.y >= y - 140 && p.y <= y + 40);
}

type Light = NonNullable<Zone['lights']>[number];
/**
 * The fireflies over the stretch x0..x1 on ground y: over every gap, on every liana and its perch (sink.extras.lianas: the gap under each
 * swing), and a dim one along the way. Exported so a World 8 kit that lays its darkness its own way can light these sections the same.
 */
export function w8SwingLights(out: StageSink, x0: number, y: number, x1: number): Light[] {
  const L: Light[] = [];
  // (a swarm over the middle of every gap)
  let gap0: number | null = null;
  for (let x = x0; x <= x1; x += 10) {
    const g = !groundAt(out, x, y);
    if (g && gap0 === null) gap0 = x;
    if (!g && gap0 !== null) {
      L.push({ x: Math.round((gap0 + x) / 2), y: y - W8_DARK.lightUp, r: W8_DARK.gap });
      gap0 = null;
    }
  }
  // (every liana whose gap lies in the stretch: its pivot at grip height, and its perch)
  const lianas = (out.extras.lianas ?? []) as Array<{ x0?: number; x1?: number }>;
  for (const l of lianas) {
    if (l.x0 === undefined || l.x1 === undefined || l.x0 < x0 - 20 || l.x0 > x1) continue;
    L.push({ x: Math.round(l.x0 + W8_DARK.reach), y: y - W8_DARK.lianaUp, r: W8_DARK.liana });
    L.push({ x: Math.round(l.x1 + 60), y: y - W8_DARK.perchUp, r: W8_DARK.perch });
  }
  // (and a dimmer one along the way where none is near)
  for (let x = x0 + 200; x < x1 - 120; x += W8_DARK.every) if (!L.some((l) => Math.abs(l.x - x) < 220)) L.push({ x, y: y - W8_DARK.lightUp + 20, r: W8_DARK.way });
  return L.sort((a, b) => a.x - b.x);
}

/** the dark stretch from x0 to x1, with the fireflies (or none: a room's dark, lit by the room's own) */
function darkZone(out: StageSink, x0: number, y: number, x1: number, lights: boolean): Zone {
  return {
    kind: 'dark', x0: Math.round(x0), x1: Math.round(x1), top: y - W8_DARK.up, bottom: y + W8_DARK.down, baseY: y, dir: 1, period: 1, warn: 0, active: 1, force: 0, offset: 0,
    lights: lights ? w8SwingLights(out, x0, y, x1) : [],
  };
}

/**
 * The dark props' emitters: the first end filled remembers its spot, the second lays the dark between them (either order works). The end
 * socket says whether the fireflies hang in it. A lantern lights its bough (into the next dark zone laid, and kept in sink.extras for the
 * kit's drawing).
 */
export const W8S_EMIT: Record<string, PropEmitter> = {
  [W8S_PROP.darkFrom]: (f, _p, out) => darkEnd(out, f.x, f.y, null),
  [W8S_PROP.darkTo]: (f, _p, out) => darkEnd(out, f.x, f.y, true),
  [W8S_PROP.darkToBare]: (f, _p, out) => darkEnd(out, f.x, f.y, false),
  [W8S_PROP.lantern]: (f, _p, out) => {
    ((out.extras[W8_LANTERNS] ??= []) as Array<{ x: number; y: number }>).push({ x: Math.round(f.x), y: Math.round(f.y) });
  },
};
function darkEnd(out: StageSink, x: number, y: number, lights: boolean | null) {
  const open = out.extras[OPEN] as { x: number; y: number; lights: boolean | null } | undefined;
  if (!open) {
    out.extras[OPEN] = { x, y, lights };
    return;
  }
  delete out.extras[OPEN];
  const [a, b] = open.x <= x ? [open, { x, y, lights }] : [{ x, y, lights }, open];
  if (b.x - a.x < 100) return;
  out.zones.push(darkZone(out, a.x, a.y, b.x, (open.lights ?? lights) !== false));
}

const swingTip = (on: string): Socket => ({ id: 'tip-dark-swing', role: 'tip', on, t: 0.1, allow: [W8_DARK_SWING] });
const climbTip = (on: string): Socket => ({ id: 'tip-dark-climb', role: 'tip', on, t: 0.1, allow: [W8_DARK_CLIMB] });
/** a lit bough, where a stretch is entered or left */
const IN: [number, number] = [170, 200];
const OUT: [number, number] = [170, 210];

// ───────────────────────────── the lit boughs the dark stretches join ─────────────────────────────

/** a lantern bough: a knot to step over, petals, a flag (the start, a rest, the shrine's approach); lit, so no dark here */
const lanternBough: SectionTemplate = {
  id: 'w8s-lantern-bough',
  name: 'a lantern bough',
  archetypes: ['vine_runner', 'sprint'],
  phases: ['start', 'rest', 'goal'],
  difficulty: 1,
  pieces: [bank('a', [220, 260]), up('knot', 'a', 40, [140, 170]), down('b', 'knot', 40, [260, 300]), up('knot2', 'b', 40, [110, 140]), down('c', 'knot2', 40, [160, 200])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: 0,
  sockets: [lantern('lamp', 'a', [0.3, 0.6]), petals('knot', 'knot', 0.5, 2, 80), flag('b', 0.5), lantern('lamp2', 'b', 0.8), petals('knot2', 'knot2', 0.5, 1), scenery('moss', 'c', [0.6, 0.8], 0.5)],
  mirrorable: true,
};

/** bough steps in the lantern's light: up a knot, up again, down, down, a short hop to the next bough */
const boughSteps: SectionTemplate = {
  id: 'w8s-bough-steps',
  name: 'bough steps by lantern light',
  archetypes: ['vine_runner', 'sprint'],
  phases: ['ki', 'sho', 'ten', 'rest'],
  difficulty: 3,
  pieces: [bank('a', [180, 220]), up('b', 'a', 60, [150, 180]), up('c', 'b', 60, [170, 200]), down('d', 'c', 60, [130, 160]), down('e', 'd', 60, [130, 160]), hop('f', 'e', [260, 320], [0.3, 0.4], true)],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'f', kind: 'ground' },
  exitDy: 0,
  sockets: [lantern('lamp', 'a', 0.5), petals('b', 'b', 0.5, 1), petals('c', 'c', 0.5, 2, 90), scenery('moss', 'e', 0.5, 0.4), foe('foe', 'f', [0.6, 0.8], [W8S_TAG.small], 2.5, { phases: LIVE, chance: 0.5 })],
  mirrorable: true,
};

// ───────────────────────────── the swings in the dark ─────────────────────────────
//
// A liana swings by itself (physics.ts vineAngle: Normal 2.85 s, Easy 3.3 s, at most 0.45 rad; up and down climb, left and right only
// turn him; letting go is the only choice). Each hangs past a bough's end and its perch is sized by the core from the release window
// (pipeline lianaBand on physics.ts pressWindow: Easy 300 ms, Normal 167 ms), so the gap under it is wider than any jump: the swing is
// the way over. Chains keep a perch between every two swings (levelCheck follows ledge -> liana -> ledge, never liana to liana).

/** one swing in the dark, bough to bough: the first of a stage (Dot's line on the lit bough before it), a perch wide enough to walk on */
const firstSwing: SectionTemplate = {
  id: 'w8s-first-swing',
  name: 'one swing in the dark',
  archetypes: ['vine_runner', 'sprint'],
  phases: ['ki', 'sho'],
  difficulty: 3,
  teaches: W8_DARK_SWING,
  pieces: [bank('in', IN), down('a', 'in', 0, [180, 220]), liana('l1', 'a'), perch('b', 'l1', [240, 290]), up('knot', 'b', 40, [110, 140]), down('c', 'knot', 40 - RAISE, [150, 180]), up('out', 'c', 0, OUT)],
  entry: { piece: 'in', kind: 'ground' },
  exit: { piece: 'out', kind: 'ground' },
  exitDy: 0,
  sockets: [swingTip('in'), lantern('lamp', 'in', 0.5), ...darkEnds('a', 'c'), petals('a', 'a', 0.35, 1), petals('b', 'b', 0.4, 2, 80), petals('knot', 'knot', 0.5, 1), scenery('moss', 'out', [0.5, 0.8], 0.5)],
  weight: 2,
  mirrorable: false,
};

/** two swings with a bough between: swing, land, swing */
const swingPair: SectionTemplate = {
  id: 'w8s-swing-pair',
  name: 'two swings in the dark, a bough between',
  archetypes: ['vine_runner', 'sprint'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 5,
  teaches: W8_DARK_SWING,
  pieces: [
    bank('in', IN),
    down('a', 'in', 0, [160, 200]),
    liana('l1', 'a'),
    perch('p1', 'l1', [180, 230]),
    down('p1d', 'p1', -RAISE, [140, 170]),
    liana('l2', 'p1d'),
    perch('b', 'l2', [200, 240]),
    down('c', 'b', -RAISE, [130, 160]),
    up('out', 'c', 0, OUT),
  ],
  entry: { piece: 'in', kind: 'ground' },
  exit: { piece: 'out', kind: 'ground' },
  exitDy: 0,
  sockets: [swingTip('in'), lantern('lamp', 'in', 0.5), ...darkEnds('a', 'c'), petals('p1', 'p1', 0.5, 1), petals('b', 'b', 0.3, 2, 90), foe('foe', 'out', [0.6, 0.85], [W8S_TAG.small], 2, { phases: ['ten', 'ketsu'], chance: 0.5 })],
  weight: 2,
  mirrorable: false,
};

/**
 * three swings, boughs between: the long way through the dark (a vine stage's climax). Its perches are wide (190 px and more): the level
 * check's jump links pass through walls, so from the soft pit's floor under a swing it "jumps" through a narrow perch's trunk onto the
 * low bough behind it (STAGE-RULES §6), and the swing reads as optional. To keep inside the section's size, the dark starts on the
 * lit bough itself (its far end) and ends at the last perch's end.
 */
const swingChain: SectionTemplate = {
  id: 'w8s-swing-chain',
  name: 'three swings through the dark',
  archetypes: ['vine_runner'],
  phases: ['ten', 'ketsu'],
  difficulty: 7,
  teaches: W8_DARK_SWING,
  pieces: [
    bank('in', [200, 220]),
    liana('l1', 'in'),
    perch('p1', 'l1', [190, 210]),
    down('p1d', 'p1', -RAISE, [100, 110]),
    liana('l2', 'p1d'),
    perch('p2', 'l2', [190, 210]),
    down('p2d', 'p2', -RAISE, [100, 110]),
    liana('l3', 'p2d'),
    perch('b', 'l3', [190, 210]),
    down('out', 'b', -RAISE, [160, 180]),
  ],
  entry: { piece: 'in', kind: 'ground' },
  exit: { piece: 'out', kind: 'ground' },
  exitDy: 0,
  sockets: [
    swingTip('in'),
    lantern('lamp', 'in', 0.2),
    { id: 'darkFrom', role: 'prop', on: 'in', t: 0.75, allow: [W8S_PROP.darkFrom], easy: 'keep' },
    { id: 'darkTo', role: 'prop', on: 'b', t: 1, allow: [W8S_PROP.darkTo], easy: 'keep' },
    petals('p1', 'p1', 0.5, 1),
    petals('p2', 'p2', 0.5, 1),
    petals('b', 'b', 0.4, 2, 90),
    lantern('lamp2', 'out', 0.6),
  ],
  weight: 2,
  mirrorable: false,
  maxPerStage: 2,
  extraSeconds: 2,
};

/** a swing onto a bough, a climbing vine up the trunk past it (too high to jump), and down the far side */
const swingClimb: SectionTemplate = {
  id: 'w8s-swing-climb',
  name: 'swing, then climb the trunk in the dark',
  archetypes: ['vine_runner', 'sprint'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 5,
  teaches: W8_DARK_SWING,
  pieces: [
    bank('in', IN),
    down('a', 'in', 0, [160, 200]),
    liana('l1', 'a'),
    perch('b', 'l1', [260, 320]),
    ...climbWall('v', 'b', 'wall', 230, [220, 260]),
    down('c', 'wall', 230 - RAISE, [160, 200]),
    up('out', 'c', 0, OUT),
  ],
  entry: { piece: 'in', kind: 'ground' },
  exit: { piece: 'out', kind: 'ground' },
  exitDy: 0,
  sockets: [swingTip('in'), lantern('lamp', 'in', 0.5), ...darkEnds('a', 'c'), petals('b', 'b', 0.4, 2, 80), petals('wall', 'wall', 0.5, 2, 90), foe('foe', 'out', [0.6, 0.85], [W8S_TAG.small], 2.5, { phases: LIVE, chance: 0.5 })],
  weight: 2,
  mirrorable: false,
};

/** a hollow trunk with a climbing vine up it, petals at the top, down again: the climb in the dark taught safely (no liana) */
const trunkClimb: SectionTemplate = {
  id: 'w8s-trunk-climb',
  name: 'climb the trunk in the dark',
  archetypes: ['vine_runner', 'sprint'],
  phases: ['ki', 'sho', 'rest'],
  difficulty: 2,
  teaches: W8_DARK_CLIMB,
  pieces: [bank('in', IN), down('a', 'in', 0, [260, 320]), ...climbWall('v', 'a', 'wall', 220, [240, 280]), down('b', 'wall', 220, [200, 240]), hop('c', 'b', [200, 240]), up('out', 'c', 0, OUT)],
  entry: { piece: 'in', kind: 'ground' },
  exit: { piece: 'out', kind: 'ground' },
  exitDy: 0,
  sockets: [climbTip('in'), lantern('lamp', 'in', 0.5), ...darkEnds('a', 'c'), petals('a', 'a', 0.4, 2, 80), petals('wall', 'wall', 0.5, 3, 140), scenery('moss', 'out', 0.6, 0.5)],
  mirrorable: false,
};

/** bough hops in the dark, then a swing onto a bough, a step down and back up */
const hopsSwing: SectionTemplate = {
  id: 'w8s-hops-swing',
  name: 'hops, then a swing, in the dark',
  archetypes: ['vine_runner', 'sprint'],
  phases: ['sho', 'ten'],
  difficulty: 5,
  teaches: W8_DARK_SWING,
  pieces: [
    bank('in', IN),
    down('a', 'in', 0, [130, 160]),
    hop('k1', 'a', [140, 170]),
    hop('k2', 'k1', [170, 200]),
    liana('l1', 'k2'),
    perch('b', 'l1', [190, 220]),
    down('b2', 'b', 35 - RAISE, [120, 150]),
    up('c', 'b2', 35, [140, 170]),
    up('out', 'c', 0, OUT),
  ],
  entry: { piece: 'in', kind: 'ground' },
  exit: { piece: 'out', kind: 'ground' },
  exitDy: 0,
  sockets: [swingTip('in'), lantern('lamp', 'in', 0.5), ...darkEnds('a', 'c'), petals('k1', 'k1', 0.5, 1), petals('k2', 'k2', 0.5, 1), petals('b', 'b', 0.5, 2, 80), foe('foe', 'out', [0.6, 0.85], [W8S_TAG.small], 2.5, { phases: ['ten'], chance: 0.5 })],
  weight: 2,
  mirrorable: false,
};

/** a swing through the dark onto a long lit bough where a night hunter prowls: land, then deal with it */
const swingHunter: SectionTemplate = {
  id: 'w8s-swing-hunter',
  name: 'swing onto the hunter\'s bough',
  archetypes: ['vine_runner', 'sprint'],
  phases: ['ten', 'ketsu'],
  difficulty: 6,
  teaches: W8_DARK_SWING,
  pieces: [bank('in', IN), down('a', 'in', 0, [160, 200]), liana('l1', 'a'), perch('b', 'l1', [200, 240]), down('c', 'b', -RAISE, [140, 170]), up('out', 'c', 0, [440, 520])],
  entry: { piece: 'in', kind: 'ground' },
  exit: { piece: 'out', kind: 'ground' },
  exitDy: 0,
  sockets: [swingTip('in'), lantern('lamp', 'in', 0.5), ...darkEnds('a', 'c'), petals('b', 'b', 0.4, 2, 80), lantern('lamp2', 'out', 0.2), foe('foe', 'out', [0.55, 0.75], [W8S_TAG.hunter, W8S_TAG.small], 3), petals('out', 'out', 0.9, 1)],
  weight: 2,
  mirrorable: false,
};

/** a swing onto a bough, a drop onto the bough below it, and a climbing vine up the trunk past it (the perch is wide: a bough low
 *  behind a narrow perch is "reached" from the pit's floor through its trunk by the level check, swingChain) */
const swingDropClimb: SectionTemplate = {
  id: 'w8s-swing-drop-climb',
  name: 'swing, drop, climb the trunk (run)',
  archetypes: ['vine_runner', 'sprint'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  teaches: W8_DARK_SWING,
  weight: 2,
  pieces: [
    bank('in', IN),
    down('a', 'in', 0, [160, 200]),
    liana('l1', 'a'),
    perch('b', 'l1', [220, 250]),
    down('b2', 'b', -RAISE, [140, 170]),
    ...climbWall('v', 'b2', 'wall', 200, [200, 240]),
    down('c', 'wall', 200, [160, 200]),
    up('out', 'c', 0, OUT),
  ],
  entry: { piece: 'in', kind: 'ground' },
  exit: { piece: 'out', kind: 'ground' },
  exitDy: 0,
  sockets: [swingTip('in'), lantern('lamp', 'in', 0.5), ...darkEnds('a', 'c'), petals('b', 'b', 0.5, 1), petals('b2', 'b2', 0.5, 1), petals('wall', 'wall', 0.5, 2, 90), foe('foe', 'out', [0.6, 0.85], [W8S_TAG.small], 2.5, { phases: ['ten', 'ketsu'], chance: 0.4 })],
  mirrorable: false,
};

/** a swing, then a quick run of knots and hops in the dark (a sprint's rhythm: swing, hop, hop, hop) */
const swingRun: SectionTemplate = {
  id: 'w8s-swing-run',
  name: 'a swing, then the knots (run)',
  archetypes: ['vine_runner', 'sprint'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 5,
  teaches: W8_DARK_SWING,
  weight: 2,
  pieces: [
    bank('in', IN),
    down('a', 'in', 0, [160, 200]),
    liana('l1', 'a'),
    perch('b', 'l1', [200, 240]),
    up('k1', 'b', 45, [100, 130]),
    down('c', 'k1', 45 - RAISE, [120, 150]),
    hop('d', 'c', [150, 180]),
    hop('e', 'd', [170, 200]),
    up('out', 'e', 0, OUT),
  ],
  entry: { piece: 'in', kind: 'ground' },
  exit: { piece: 'out', kind: 'ground' },
  exitDy: 0,
  sockets: [swingTip('in'), lantern('lamp', 'in', 0.5), ...darkEnds('a', 'e'), petals('b', 'b', 0.5, 1), petals('k1', 'k1', 0.5, 1), petals('d', 'd', 0.5, 1), foe('foe', 'out', [0.6, 0.85], [W8S_TAG.small], 2.5, { phases: LIVE, chance: 0.5 })],
  mirrorable: false,
};

/** up a trunk in the dark, along the high bough, and a swing off its far end down to a bough lower than it (the climb, then the swing) */
const climbSwing: SectionTemplate = {
  id: 'w8s-climb-swing',
  name: 'climb the trunk, swing off the top',
  archetypes: ['vine_runner'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  teaches: W8_DARK_CLIMB,
  weight: 2,
  pieces: [
    bank('in', IN),
    down('a', 'in', 0, [200, 240]),
    ...climbWall('v', 'a', 'wall', 200, [220, 260]),
    liana('l1', 'wall'),
    // (the perch past it: the core moves it up or down to where the window and the check meet, never a wider swing)
    perch('b', 'l1', [220, 260], 200 + RAISE),
    down('c', 'b', -RAISE, [150, 180]),
    up('out', 'c', 0, OUT),
  ],
  entry: { piece: 'in', kind: 'ground' },
  exit: { piece: 'out', kind: 'ground' },
  exitDy: 0,
  sockets: [climbTip('in'), lantern('lamp', 'in', 0.5), ...darkEnds('a', 'c'), petals('a', 'a', 0.4, 1), petals('wall', 'wall', 0.4, 2, 90), petals('b', 'b', 0.5, 1)],
  mirrorable: false,
};

/** bough hops in the dark: short hops, a knot, the fireflies over every gap (the dark's own rhythm between the swings) */
const darkHops: SectionTemplate = {
  id: 'w8s-dark-hops',
  name: 'bough hops in the dark (run)',
  archetypes: ['vine_runner', 'sprint'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 5,
  teaches: W8_DARK_SWING,
  pieces: [
    bank('in', IN),
    down('a', 'in', 0, [160, 190]),
    hop('b', 'a', [170, 210]),
    up('k', 'b', 45, [120, 150]),
    down('c', 'k', 45, [140, 170]),
    hop('d', 'c', [160, 200]),
    hop('e', 'd', [170, 210]),
    up('out', 'e', 0, OUT),
  ],
  entry: { piece: 'in', kind: 'ground' },
  exit: { piece: 'out', kind: 'ground' },
  exitDy: 0,
  sockets: [lantern('lamp', 'in', 0.5), ...darkEnds('a', 'e'), petals('b', 'b', 0.5, 1), petals('k', 'k', 0.5, 1), petals('d', 'd', 0.5, 1), petals('e', 'e', 0.4, 2, 80), foe('foe', 'out', [0.6, 0.85], [W8S_TAG.small], 2, { phases: LIVE, chance: 0.5 })],
  weight: 1,
  mirrorable: false,
};

// ───────────────────────────── the set ─────────────────────────────

/** World 8's swing and climb sections: the lit boughs, the swings and climbs in the dark */
export const W8_SWING_SECTIONS: readonly SectionTemplate[] = [
  lanternBough, boughSteps,
  firstSwing, swingPair, swingChain, swingClimb, trunkClimb, hopsSwing, swingHunter, swingDropClimb, swingRun, climbSwing, darkHops,
];

/**
 * Which vine stage takes which sections (STAGE-RULES §2 "Sameness", §6 "the swing and ground stages had to keep their sections apart":
 * two stages drawing one bag read alike and fail curation's `--apart`). 8-3 "Long Swings" leans on the lianas (pairs, the chain, swings
 * into runs and onto the hunter's bough); 8-5 "Next Branch" on bough to bough, up the trunks and swings off them (the climbs, the drop,
 * the dark hops). Both open with the lantern boughs, the bough steps and the first swing (it teaches the dark swing). A section not
 * listed goes to every stage.
 */
export const W8S_STAGES: Record<string, readonly number[]> = {
  [swingPair.id]: [3],
  [swingChain.id]: [3],
  [hopsSwing.id]: [3],
  [swingRun.id]: [3],
  [swingHunter.id]: [3],
  [trunkClimb.id]: [5],
  [swingClimb.id]: [5],
  [swingDropClimb.id]: [5],
  [climbSwing.id]: [5],
  [darkHops.id]: [5],
};
/** the swing sections stage `stage` holds */
export const w8SwingFor = (stage: number): SectionTemplate[] => W8_SWING_SECTIONS.filter((s) => !W8S_STAGES[s.id] || W8S_STAGES[s.id].includes(stage));

/**
 * A World 8 kit for stage `stage` with its swing sections (w8SwingFor), their props and lines, and that stage's puzzle room joined (the
 * world's own manifest, w8.ts, stays as it is: w8Game.ts folds the lists together)
 */
export function withW8Swing(kit: WorldKit, stage: number, difficulty: Difficulty = 'normal'): WorldKit {
  const k = withW8Rooms(kit, stage, difficulty);
  const M = k.manifest;
  const have = new Set(M.sections.map((s) => s.id));
  return {
    ...k,
    emit: { ...W8S_EMIT, ...(k.emit ?? {}) },
    manifest: {
      ...M,
      sections: [...M.sections, ...w8SwingFor(stage).filter((s) => !have.has(s.id))],
      props: [...M.props, ...W8S_PROPS.filter((p) => !M.props.some((q) => q.id === p.id))],
      tips: { ...W8S_TIPS, ...(M.tips ?? {}) },
    },
  };
}
