/**
 * gen2/worlds/w10Ground — World 10's building blocks (DESIGN.md B9): the fortress walls, battlements and gatehouses every stage shares,
 * the storm's hazards, and each stage's own: 10-1 The Door Made for Him (a sprint: it teaches the lightning rods and the spike beds on
 * every roll, w10Game.ts W10_REQUIRED), 10-3 Thunder (stealth: the storm watches the wall, hide behind the crates), 10-7 The Walls (a
 * purge) and 10-9 The Fortress Gate (a gauntlet). 10-6 The Iron Netting is the swing builder's (w10Swing.ts), with the shared rests
 * here. The puzzle rooms are w10Rooms.ts; the kit is w10.ts.
 *
 * The hazards (w10.ts header):
 *   rods     a lightning rod's column (SectionZone 'bolt'): it charges (the warning), then the bolt strikes. A row of rods is a timing
 *            beat (S): wait in the pocket between two columns (levelCheck holds every pocket to 110 px and every strike to 1.2 s).
 *   spikes   an iron spike bed in a shallow trough one hop deep (a gap rule's `spikes`): jump it; fall in and it costs a heart and a hop
 *            out (Normal). On Easy the trough is a plain soft pit.
 *   ramparts crumbling battlement slabs over a sunken wall-walk (SectionPiece.crumble, World 7's tiles): NEVER needed (STAGE-RULES §1).
 *            The walk underneath walks on, two hops out at its far end; the slabs are the hurry (`hall`).
 *   gusts    a gust lane over a gap between two walls (SectionZone 'gust'): it blows on a beat, helping or hindering the jump; wait for
 *            the lull (levelCheck: under 160 px/s, and a headwind still leaves the double jump).
 *   falls    the chasms between the walls are deep on Normal (a life) and soft on Easy; the second-jump gaps keep a soft pit (`soft`:
 *            a deadly second-jump gap is where the first-timer dies, STAGE-RULES §6), and banks between two deep gaps are 360 px or more
 *            (no glide trap: the leaf carries about 457 px).
 *
 * Beats. As Worlds 6 and 7: every beat is ground the route really crosses (a battlement stepped up onto, a gap jumped, a spike bed, a
 * rod's column, a gust, a soldier), no flat much over 400 px without one, every rise one hop, every gap a share of the jump the
 * difficulty allows, and an animal's flat long enough to stay 120 px from every hop on and off it (JUMP_CLEAR).
 *
 * Teaching (STAGE-RULES §1): 10-1 meets the rods and the spike beds first in safe spots on every roll (`w10-first-rods`,
 * `w10-first-spikes`, required), each with Pokey's line before it; 10-3's gate shows the storm's watch with a long calm and the crates
 * in reach; the purge's and the gauntlet's gates explain the shut shrine. The first soldier gets Pokey's line (w10.ts w10Finish).
 *
 * Variety (STAGE-RULES §6, "a different mix of actions"): each gated stage's gate opens the roll's THEME (W10_THEME), and each theme leans
 * on its own heavy beat: the rods (S), the spike beds (J), the ramparts (Z), the gusts (S over J); the guards (C) carry the fights. The
 * shared sections weigh little (SHARED) so the theme carries the stage. Which stage holds which sections: W10_STAGE_ONLY (w10Game.ts).
 */
import type { Phase, SectionPiece, SectionTemplate, SectionZone, Socket } from '../types.ts';

// ───────────────────────────── the themes ─────────────────────────────

export const W10_THEME = {
  /** lightning rods along the walls */
  rods: 'w10:rods',
  /** spike beds between the battlements */
  spikes: 'w10:spikes',
  /** crumbling ramparts over the sunken wall-walks */
  ramparts: 'w10:ramparts',
  /** gusts across the gaps between the walls */
  gusts: 'w10:gusts',
  /** timber perch posts up out of a chasm (GRAB-BAG I: 10-1) */
  perches: 'w10:perches',
  /** the watchtowers' iron stairs, balconies and scaffold walkways (GRAB-BAG G, H: 10-7) */
  towers: 'w10:towers',
  /** chain bridges over the chasms, guards on them (GRAB-BAG J: 10-7) */
  bridges: 'w10:bridges',
  /** drop gates over the wall-walk, a portcullis on a beat (GRAB-BAG D: 10-7) */
  drops: 'w10:drops',
  /** trapdoor grates over the chasms, open on a beat (GRAB-BAG F: 10-9) */
  trapdoors: 'w10:trapdoors',
  /** gutter spouts gushing storm water across the walk and the gaps on a beat (GRAB-BAG E: 10-6 taught, 10-9) */
  spouts: 'w10:spouts',
  /** 10-6's plain theme: the iron netting's chains alone (the swing builder's sections, no grab-bag piece) */
  chains: 'w10:chains',
  /** soldiers' lanterns sweeping the watched walls from their towers (GRAB-BAG L: 10-3) */
  lanterns: 'w10:lanterns',
  /** barrels rolled down the wall-walks from the towers (GRAB-BAG K: 10-7) */
  barrels: 'w10:barrels',
  /** chain lifts: planks on chains rising and sinking over the chasms (GRAB-BAG A, Matt's moving platforms: 10-1 taught, 10-6) */
  lifts: 'w10:lifts',
  /** counterweight planks: two on one chain, one up as the other comes down (GRAB-BAG B: 10-3 taught, 10-6) */
  counterweights: 'w10:counterweights',
  /** gear lifts: stone blocks on toothed racks, rising out of the walk to a ledge (GRAB-BAG C: 10-9 taught, 10-6) */
  gearlifts: 'w10:gearlifts',
} as const;
export type W10Theme = keyof typeof W10_THEME;
const THEMES = Object.keys(W10_THEME) as W10Theme[];

/** the lesson keys (w10.ts W10_LESSON) */
const BOLT = 'bolt';
const SPIKES = 'spikes';
const RAMPART = 'rampart';
const WIND = 'wind';
const STORM = 'storm';
const DROPGATE = 'dropgate';
const TRAP = 'trap';
const GUSH = 'gush';
const BARREL = 'barrel';
const LIFT = 'lift';
const CWEIGHT = 'cweight';
const GEAR = 'gear';

/** the weight of a section every roll may hold (the theme's weigh 1) */
const SHARED = 0.3;

// ───────────────────────────── helpers ─────────────────────────────

type Opt = Partial<Socket>;
type W = SectionPiece['w'];
const LIVE: Phase[] = ['sho', 'ten', 'ketsu'];
const HOT: Phase[] = ['ten', 'ketsu'];
const MID: Phase[] = ['ki', 'sho', 'ten', 'ketsu'];

const bank = (key: string, w: W, place: SectionPiece['place'] = { kind: 'start' }, o: Partial<SectionPiece> = {}): SectionPiece => ({ key, shape: 'bank', w, place, ...o });
/** a battlement step: up `dy` px onto a piece (a hop); `down` steps back down (a walk) */
const up = (key: string, after: string, dy: number, w: W): SectionPiece => bank(key, w, { kind: 'walk', after, dy: -dy });
const down = (key: string, after: string, dy: number, w: W): SectionPiece => bank(key, w, { kind: 'walk', after, dy });
/** a chasm between two walls: deep on Normal, soft on Easy; the bank after it 360 px or more where a chasm follows it */
const chasm = (key: string, after: string, w: W, share: W = [0.66, 0.86]): SectionPiece => bank(key, w, { kind: 'pit', after, jump: 'jump', share }, { landing: true });
/** a wide chasm: the jump's own width */
const wide = (key: string, after: string, w: W, share: W = [0.84, 0.96]): SectionPiece => bank(key, w, { kind: 'pit', after, jump: 'jump', share }, { landing: true });
/** a second-jump gap: it keeps a soft pit, whatever the world's falls (a deadly second-jump gap is where the first-timer dies) */
const leap = (key: string, after: string, w: W, share: W = [0.62, 0.82]): SectionPiece => bank(key, w, { kind: 'pit', after, jump: 'double', share, soft: true }, { landing: true });
/** an iron spike bed: a trough one hop deep full of spikes, jumped (a heart on Normal if he falls in; a plain soft pit on Easy) */
const spikes = (key: string, after: string, w: W, share: W = [0.7, 0.9]): SectionPiece => bank(key, w, { kind: 'pit', after, jump: 'jump', share, spikes: true }, { landing: true });
/** n battlements after `after`: up onto each, down to a flat of `flat` px (keys `${p}k1`, `${p}f1`, ...) */
function merlons(p: string, after: string, n: number, flat: W, dy: [number, number] = [30, 38], kneeW: W = [140, 165]): { pieces: SectionPiece[]; last: string } {
  const out: SectionPiece[] = [];
  let prev = after;
  for (let i = 1; i <= n; i++) {
    const h = Math.round(dy[0] + ((dy[1] - dy[0]) * (i % 3)) / 2);
    out.push(up(`${p}k${i}`, prev, h, kneeW), down(`${p}f${i}`, `${p}k${i}`, h, flat));
    prev = `${p}f${i}`;
  }
  return { pieces: out, last: prev };
}

/** a sunken wall-walk's depth under the battlements, its two hops out, a rampart slab's width (zones.ts CRUMBLE_TILE_W) */
export const HALL = { depth: 120, step: 60, stepW: 100, tile: 110 } as const;

/**
 * A sunken wall-walk after `after` with runs of crumbling rampart slabs over it at the floor's height (the hurry: World 7's `hall`),
 * and the wall on past it (`${p}b`, level with `after`). `runs` slabs per run with a solid slab (`${p}slab${i}`, 160 px) between runs;
 * `stair` steps every second slab up 40 px and back. The walk (`${p}hall`) runs under all of them, then a step (`${p}s`) and the wall.
 */
function hall(p: string, after: string, runs: number[], stair = false, bW: W = [300, 340]): { pieces: SectionPiece[]; last: string; tiles: string[] } {
  const SLAB = 160;
  const tiles: string[] = [];
  const out: SectionPiece[] = [];
  let prev = after;
  let n = 0;
  let span = 0;
  runs.forEach((count, r) => {
    if (r > 0) {
      out.push({ key: `${p}slab${r}`, shape: 'block', w: SLAB, h: 26, place: { kind: 'over', on: prev, at: 1, dy: 0 }, style: 'moss_stone', main: false });
      prev = `${p}slab${r}`;
      span += SLAB;
    }
    for (let i = 0; i < count; i++) {
      const k = `${p}t${++n}`;
      const dy = stair ? (i % 2 === 1 ? -40 : i > 0 ? 40 : 0) : 0;
      out.push({ key: k, shape: 'block', w: HALL.tile, h: 26, place: { kind: 'over', on: prev, at: 1, dy }, crumble: true });
      tiles.push(k);
      prev = k;
      span += HALL.tile;
    }
    if (stair && count % 2 === 0) {
      const k = `${p}t${++n}`;
      out.push({ key: k, shape: 'block', w: HALL.tile, h: 26, place: { kind: 'over', on: prev, at: 1, dy: 40 }, crumble: true });
      tiles.push(k);
      prev = k;
      span += HALL.tile;
    }
  });
  out.unshift(down(`${p}hall`, after, HALL.depth, span), up(`${p}s`, `${p}hall`, HALL.step, HALL.stepW), up(`${p}b`, `${p}s`, HALL.step, bW));
  return { pieces: out, last: `${p}b`, tiles };
}

const petals = (id: string, on: string, t: Socket['t'], count = 2, span = 120, o: Opt = {}): Socket => ({ id, role: 'pickup', on, t, dn: 34, count, span, ...o });
const prop = (id: string, on: string, t: Socket['t'], allow: string[], o: Opt = {}): Socket => ({ id, role: 'prop', on, t, allow, ...o });
const scenery = (id: string, on: string, t: Socket['t'], chance = 0.6) => prop(id, on, t, ['scenery'], { chance });
const flag = (on: string, t: Socket['t']): Socket => ({ id: 'flag', role: 'flag', on, t });
const tip = (mechanic: string, on: string, t: Socket['t'] = 0.15, id = `tip-${mechanic}`): Socket => ({ id, role: 'tip', on, t, allow: [mechanic] });
const foe = (id: string, on: string, t: Socket['t'], kinds: string[], max: number, o: Opt = {}): Socket => ({ id, role: 'enemy', on, t, allow: kinds, maxThreat: max, easy: 'soften', ...o });
/** crates or a barrel to hide behind (the bag alternates them) */
const hideAt = (id: string, on: string, t: Socket['t'] = 0.5) => prop(id, on, t, ['hide', 'cover']);
/** the storm watching the piece `on` (w10.ts: the watched stretch is that piece, clipped to the cover along it) */
const storm = (on: string, id = 'storm') => prop(id, on, 0.03, [STORM]);

/** a lightning rod on `on`, `at` along it */
const rod = (on: string, at: [number, number]): SectionZone => ({ kind: 'bolt', on, at });
/** a gust lane over the gap from `from` to `to` */
const gust = (from: string, to: string, dir: 1 | -1): SectionZone => ({ kind: 'gust', from, to, dir });

const GUARDS = ['soldier'];
const CATS = ['ocelot', 'jaguar'];
const SMALL = ['soldier', 'tayra', 'ocelot'];

const midOf = (w: W) => (typeof w === 'number' ? w : (w[0] + w[1]) / 2);

/** a section's flag (when the pipeline puts one in it): the middle of its widest main floor with no animal on it, back from any lip */
function safeFlag(pieces: SectionPiece[], sockets: Socket[], zones: SectionZone[], first: string, last: string, mirrorable: boolean): Socket {
  const zoned = new Set(zones.flatMap((z) => (z.kind === 'bolt' ? [z.on] : z.kind === 'gust' ? [z.from, z.to] : [])));
  const banks = pieces.filter((p) => p.main !== false && p.shape === 'bank' && !p.key.endsWith('hall') && p.place.kind !== 'over' && !zoned.has(p.key));
  const pool = banks.length ? banks : pieces.filter((p) => p.main !== false && p.shape === 'bank');
  const busy = new Set(sockets.filter((k) => k.role === 'enemy').map((k) => k.on));
  const gapped = (k: string) => k === last || pieces.some((q) => (q.place.kind === 'pit' || q.place.kind === 'jump' || q.place.kind === 'double' || (q.place.kind === 'walk' && q.key.endsWith('hall'))) && 'after' in q.place && q.place.after === k);
  // (a flipped section runs the other way: its first piece is then its last, and a gap may follow either end)
  const spot = (p: SectionPiece) =>
    mirrorable ? (gapped(p.key) || p.key === first || ('after' in p.place && pieces.some((q) => q.key === (p.place as { after: string }).after) && p.place.kind !== 'walk') ? { t: 0.5, room: 0.5 * midOf(p.w) } : { t: 0.5, room: 999 }) : gapped(p.key) ? { t: 0.3, room: 0.3 * midOf(p.w) } : { t: 0.5, room: 999 };
  const score = (p: SectionPiece) => Math.min(spot(p).room, 300) + midOf(p.w) / 10 - (busy.has(p.key) ? 400 : 0) - (p.key === first ? 50 : 0);
  const p = [...pool].sort((a, b) => score(b) - score(a))[0];
  return flag(p.key, spot(p).t);
}

const section = (s: Omit<SectionTemplate, 'entry' | 'exit' | 'exitDy'> & { exitDy?: number; first?: string; last: string }): SectionTemplate => {
  const { first, last, exitDy, ...rest } = s;
  const sockets = rest.sockets.some((k) => k.role === 'flag') ? rest.sockets : [...rest.sockets, safeFlag(rest.pieces, rest.sockets, rest.zones ?? [], first ?? rest.pieces[0].key, last, rest.mirrorable)];
  return { ...rest, sockets, entry: { piece: first ?? s.pieces[0].key, kind: 'ground' }, exit: { piece: last, kind: 'ground' }, exitDy: exitDy ?? 0 };
};

// ───────────────────────────── every stage: walls, battlements, rests ─────────────────────────────

const landM = merlons('', 'a', 2, [180, 220]);
/** the start of a stage with no gate (10-6): a wall over two battlements, nothing that can hurt */
const landing = section({
  id: 'w10-landing',
  name: 'wall walk start',
  archetypes: 'any',
  phases: ['start'],
  difficulty: 1,
  pieces: [bank('a', [200, 240]), ...landM.pieces],
  last: landM.last,
  sockets: [scenery('banner', 'a', [0.4, 0.6], 0.8), petals('k1', 'k1', 0.5, 1), petals('f1', 'f1', 0.5, 2, 80), petals('k2', 'k2', 0.5, 1)],
  mirrorable: true,
});

const walkM = merlons('', 'a', 2, [180, 220]);
/** a stretch of wall walk over two battlements: petals, a flag, a brazier */
const wallWalk = section({
  id: 'w10-wall-walk',
  name: 'wall walk',
  archetypes: 'any',
  phases: ['rest', 'goal'],
  difficulty: 1,
  pieces: [bank('a', [180, 220]), ...walkM.pieces],
  last: walkM.last,
  sockets: [scenery('brazier', 'a', [0.3, 0.5]), petals('k1', 'k1', 0.5, 2, 80), flag('f1', 0.6), petals('k2', 'k2', 0.5, 1), scenery('banner', 'f2', [0.5, 0.7], 0.5)],
  mirrorable: true,
});

/** gatehouse steps: up two, down two, a flag at the top */
const gateSteps = section({
  id: 'w10-gatehouse-steps',
  name: 'gatehouse steps',
  archetypes: 'any',
  phases: ['rest', 'goal'],
  difficulty: 2,
  pieces: [bank('a', [180, 220]), up('r1', 'a', 34, [160, 190]), up('r2', 'r1', 30, [220, 260]), down('r3', 'r2', 30, [180, 210]), up('k', 'r3', 30, [150, 170]), down('c', 'k', 64, [200, 240])],
  last: 'c',
  sockets: [petals('r1', 'r1', 0.5, 1), flag('r2', 0.5), petals('r3', 'r3', 0.5, 1), petals('k', 'k', 0.5, 1), scenery('rack', 'c', [0.4, 0.6])],
  mirrorable: true,
});

/** a quiet guardroom roof: two low battlements, a cage hanging from its post (a breather that still has a hop in it) */
const guardRoof = section({
  id: 'w10-guard-roof',
  name: 'guardroom roof',
  archetypes: 'any',
  phases: ['rest', 'goal'],
  difficulty: 1,
  pieces: [bank('a', [160, 200]), up('k0', 'a', 30, [150, 170]), down('edge', 'k0', 30, [220, 260]), up('k1', 'edge', 30, [150, 170]), down('b', 'k1', 30, [180, 220])],
  last: 'b',
  sockets: [petals('k0', 'k0', 0.5, 1), scenery('cage', 'edge', 0.5, 0.8), flag('edge', 0.7), petals('k1', 'k1', 0.5, 1), petals('b', 'b', 0.5, 1)],
  mirrorable: true,
});

// ───────────────────────────── every stage: Ki to Ketsu (shared: they weigh little) ─────────────────────────────

/** a chasm, a battlement, a guard past it */
const gapKnee = section({
  id: 'w10-gap-merlon',
  name: 'chasm and battlement',
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten'],
  difficulty: 3,
  weight: SHARED,
  pieces: [bank('a', [360, 400]), chasm('b', 'a', [380, 420]), up('c', 'b', 36, [140, 160]), down('d', 'c', 36, [300, 340]), up('k2', 'd', 30, [140, 160]), down('e', 'k2', 30, [180, 220])],
  // (one more battlement off its end: a flat with no beat after the guard read quiet)
  last: 'e',
  sockets: [petals('a', 'a', 0.5, 2, 80), petals('c', 'c', 0.5, 1), foe('foe', 'd', [0.55, 0.65], SMALL, 3, { phases: LIVE, chance: 0.7 })],
  mirrorable: true,
});

/** up the wall: two jumps up onto higher battlements, then down a step */
const rise = section({
  id: 'w10-rise',
  name: 'rising walls',
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 4,
  weight: SHARED,
  pieces: [
    // (a battlement on the way to the jump: the run-up is a bank of 470 px or more, so a chasm before it is no glide trap)
    bank('a', [180, 220]),
    up('ka', 'a', 30, [140, 160]),
    down('a2', 'ka', 30, [180, 220]),
    bank('b', [320, 360], { kind: 'jump', after: 'a2', dy: [-50, -40], share: [0.55, 0.72] }, { landing: true }),
    up('k', 'b', 30, [140, 160]),
    down('c', 'k', 30, [180, 220]),
    down('d', 'c', 40, [200, 240]),
  ],
  last: 'd',
  exitDy: 0,
  sockets: [petals('ka', 'ka', 0.5, 1), petals('k', 'k', 0.5, 1), foe('foe', 'b', [0.45, 0.6], SMALL, 3, { phases: LIVE, chance: 0.6 }), scenery('banner', 'd', [0.4, 0.6])],
  mirrorable: true,
});

/** a second-jump gap between two walls (soft below) and a battlement after */
const doubleGap = section({
  id: 'w10-double-gap',
  name: 'second-jump gap',
  archetypes: 'any',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 5,
  weight: SHARED,
  pieces: [bank('a', [200, 240]), up('k0', 'a', 30, [140, 160]), down('a2', 'k0', 30, [180, 220]), leap('far', 'a2', [220, 260]), up('k', 'far', 32, [140, 160]), down('b', 'k', 32, [180, 220])],
  last: 'b',
  sockets: [petals('k0', 'k0', 0.5, 1), petals('k', 'k', 0.5, 1), foe('foe', 'far', [0.5, 0.6], ['tayra', 'ocelot'], 3, { phases: HOT, chance: 0.5 })],
  mirrorable: true,
});

/** a high battlement road over a sunken yard: the yard walks on under it (the road is a short cut, never needed) */
const highRoad = section({
  id: 'w10-high-road',
  name: 'high battlements',
  archetypes: 'any',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 4,
  weight: SHARED,
  pieces: [
    bank('a', [320, 360]),
    down('yard', 'a', 60, [420, 480]),
    up('b', 'yard', 60, [320, 360]),
    { key: 'road', shape: 'block', w: [200, 240], h: 26, place: { kind: 'over', on: 'yard', at: [0.25, 0.35], dy: -150 }, main: false, style: 'moss_stone' },
  ],
  last: 'b',
  sockets: [petals('road', 'road', 0.5, 3, 140), foe('foe', 'yard', [0.45, 0.6], SMALL, 3, { phases: LIVE, chance: 0.8 }), petals('b', 'b', 0.5, 1)],
  mirrorable: true,
});

// ───────────────────────────── 10-1 The Door Made for Him: the lessons and the sprint's gates ─────────────────────────────

/**
 * 10-1's first rods (required, Ki): Pokey's line on a quiet wall, then ONE rod alone in the middle of a long flat, nothing else near
 * (watch it charge and strike, walk past after), a battlement, then two rods with a pocket between
 */
const firstRods = section({
  id: 'w10-first-rods',
  name: 'first lightning rods',
  archetypes: 'any',
  phases: ['ki'],
  difficulty: 2,
  teaches: BOLT,
  pieces: [bank('a', [300, 340]), up('k', 'a', 30, [150, 170]), down('b', 'k', 30, [520, 560]), up('k2', 'b', 30, [150, 170]), down('c', 'k2', 30, [520, 560])],
  zones: [rod('b', [0.48, 0.52]), rod('c', [0.3, 0.34]), rod('c', [0.7, 0.74])],
  last: 'c',
  sockets: [tip(BOLT, 'a', 0.1), petals('k', 'k', 0.5, 1), petals('b1', 'b', 0.25, 1), petals('b2', 'b', 0.8, 1), petals('k2', 'k2', 0.5, 1), petals('c', 'c', 0.52, 1), flag('a', 0.55)],
  mirrorable: false,
});

/** 10-1's first spike beds (required): Pokey's line on a quiet wall, one short bed, a wall, then a bed and a battlement */
const firstSpikes = section({
  id: 'w10-first-spikes',
  name: 'first spike beds',
  archetypes: 'any',
  phases: ['ki', 'sho'],
  difficulty: 2,
  teaches: SPIKES,
  pieces: [bank('a', [320, 360]), spikes('b', 'a', [360, 400], [0.64, 0.74]), spikes('c', 'b', [300, 340], [0.74, 0.84]), up('k', 'c', 30, [140, 160]), down('d', 'k', 30, [220, 260])],
  last: 'd',
  sockets: [tip(SPIKES, 'a', 0.1), petals('b', 'b', 0.5, 2, 90), petals('k', 'k', 0.5, 1), scenery('rack', 'd', [0.4, 0.6], 0.7)],
  mirrorable: false,
});

/** a sprint gate (10-1): the netting's little door at the foot of the wall, a quiet walk over two battlements; it opens the roll's theme */
const sprintGate = (theme: W10Theme, extra: Socket[]): SectionTemplate => {
  const m = merlons('', 'a', 2, [200, 240]);
  return section({
    id: `w10-door-gate-${theme}`,
    name: `the door in the netting: ${theme}`,
    archetypes: ['sprint'],
    phases: ['start'],
    difficulty: 1,
    teaches: W10_THEME[theme],
    weight: 6,
    pieces: [bank('a', [220, 260]), ...m.pieces],
    last: m.last,
    sockets: [petals('k1', 'k1', 0.5, 1), petals('f1', 'f1', 0.5, 2, 80), petals('k2', 'k2', 0.5, 1), ...extra],
    mirrorable: false,
  });
};
const sprintGates: SectionTemplate[] = [
  sprintGate('perches', [scenery('rack', 'a', [0.5, 0.6], 0.9)]),
  sprintGate('lifts', [scenery('cage', 'a', [0.5, 0.6], 0.9)]),
  sprintGate('rods', [scenery('banner', 'a', [0.5, 0.6], 0.9)]),
  sprintGate('spikes', [scenery('rack', 'a', [0.5, 0.6], 0.9)]),
  sprintGate('ramparts', [scenery('cage', 'f1', [0.4, 0.5], 0.9)]),
  sprintGate('gusts', [scenery('brazier', 'a', [0.5, 0.6], 0.9)]),
];

// ───────────────────────────── the rods (theme) ─────────────────────────────

/** a long wall with three rods on their own beats, a battlement between two of them */
const rodRow = section({
  id: 'w10-rod-row',
  name: 'row of rods',
  archetypes: 'any',
  phases: MID,
  difficulty: 5,
  uses: [W10_THEME.rods, BOLT],
  pieces: [bank('a', [480, 520]), up('k', 'a', 30, [140, 160]), down('b', 'k', 30, [460, 500])],
  zones: [rod('a', [0.3, 0.34]), rod('a', [0.72, 0.76]), rod('b', [0.45, 0.55])],
  last: 'b',
  sockets: [petals('a1', 'a', 0.52, 1), petals('k', 'k', 0.5, 1), petals('b', 'b', 0.2, 1), foe('foe', 'b', [0.7, 0.8], SMALL, 3, { phases: LIVE, chance: 0.6 })],
  mirrorable: true,
});

/** rods either side of a chasm: wait for both to clear, then jump */
const rodGap = section({
  id: 'w10-rod-chasm',
  name: 'rods at the chasm',
  archetypes: 'any',
  phases: LIVE,
  difficulty: 6,
  uses: [W10_THEME.rods, BOLT],
  pieces: [bank('a', [380, 420]), chasm('b', 'a', [380, 420], [0.64, 0.8]), up('k', 'b', 32, [140, 160]), down('c', 'k', 32, [260, 300])],
  zones: [rod('a', [0.7, 0.74]), rod('b', [0.28, 0.32])],
  last: 'c',
  sockets: [petals('a', 'a', 0.3, 1), petals('k', 'k', 0.5, 1), foe('foe', 'c', [0.5, 0.6], GUARDS, 3, { phases: HOT, chance: 0.5 })],
  mirrorable: true,
});

/** rods on the flats between battlements, a guard at the end */
const rodMerlons = (() => {
  const m = merlons('', 'a', 3, [300, 340]);
  return section({
    id: 'w10-rod-merlons',
    name: 'rods between battlements',
    archetypes: 'any',
    phases: LIVE,
    difficulty: 6,
    uses: [W10_THEME.rods, BOLT],
    pieces: [bank('a', [260, 300]), ...m.pieces],
    zones: [rod('f1', [0.45, 0.55]), rod('f2', [0.45, 0.55]), rod('f3', [0.3, 0.4])],
    last: m.last,
    sockets: [petals('k1', 'k1', 0.5, 1), petals('k2', 'k2', 0.5, 1), petals('k3', 'k3', 0.5, 1), scenery('brazier', 'a', [0.3, 0.5])],
    mirrorable: true,
  });
})();

/** a rod on a raised battlement block in the middle of a wall: jump over the column while it is quiet, or wait (ketsu: a guard behind) */
const rodStairs = section({
  id: 'w10-rod-stairs',
  name: 'rods up the stair',
  archetypes: 'any',
  phases: HOT,
  difficulty: 7,
  uses: [W10_THEME.rods, BOLT],
  pieces: [bank('a', [300, 340]), up('s1', 'a', 34, [260, 300]), up('s2', 's1', 34, [260, 300]), down('s3', 's2', 34, [240, 280]), down('b', 's3', 34, [420, 460])],
  zones: [rod('s1', [0.45, 0.55]), rod('s2', [0.45, 0.55]), rod('s3', [0.45, 0.55])],
  last: 'b',
  sockets: [petals('s1', 's1', 0.2, 1), petals('s2', 's2', 0.85, 1), foe('foe', 'b', [0.55, 0.65], GUARDS, 3, { phases: HOT, chance: 0.7 })],
  mirrorable: true,
});

// ───────────────────────────── the spike beds (theme) ─────────────────────────────

/** three spike beds in a row, walls between */
const spikeRun = section({
  id: 'w10-spike-run',
  name: 'spike beds',
  archetypes: 'any',
  phases: MID,
  difficulty: 5,
  uses: [W10_THEME.spikes, SPIKES],
  pieces: [bank('a', [300, 340]), spikes('b', 'a', [260, 300]), spikes('c', 'b', [260, 300]), spikes('d', 'c', [300, 340])],
  last: 'd',
  sockets: [petals('a', 'a', 0.5, 1), petals('b', 'b', 0.5, 1), petals('c', 'c', 0.5, 1), foe('foe', 'd', [0.5, 0.6], SMALL, 3, { phases: LIVE, chance: 0.6 })],
  mirrorable: true,
});

/** a battlement, a spike bed off its top (a jump down and across), a guard past it */
const spikeMerlon = section({
  id: 'w10-spike-merlon',
  name: 'spikes off the battlement',
  archetypes: 'any',
  phases: LIVE,
  difficulty: 6,
  uses: [W10_THEME.spikes, SPIKES],
  pieces: [bank('a', [300, 340]), up('k', 'a', 36, [200, 240]), spikes('b', 'k', [340, 380], [0.8, 0.94]), up('k2', 'b', 30, [140, 160]), down('c', 'k2', 66, [320, 360])],
  last: 'c',
  sockets: [petals('k', 'k', 0.5, 1), petals('k2', 'k2', 0.5, 1), foe('foe', 'c', [0.55, 0.65], SMALL, 3, { phases: LIVE, chance: 0.7 })],
  mirrorable: true,
});

/** a spike bed, then a chasm (the combination, Ketsu) */
const spikeChasm = section({
  id: 'w10-spike-chasm',
  name: 'spikes then the chasm',
  archetypes: 'any',
  phases: HOT,
  difficulty: 7,
  uses: [W10_THEME.spikes, SPIKES],
  pieces: [bank('a', [260, 300]), spikes('b', 'a', [380, 420], [0.84, 0.94]), wide('c', 'b', [380, 420]), up('k', 'c', 32, [140, 160]), down('d', 'k', 32, [220, 260])],
  last: 'd',
  sockets: [petals('a', 'a', 0.5, 1), petals('b', 'b', 0.5, 1), petals('k', 'k', 0.5, 1)],
  mirrorable: true,
});

/** a wide yard of spike beds and a guard between them (the purge's spikes) */
const spikeYard = section({
  id: 'w10-spike-yard',
  name: 'guarded spike yard',
  archetypes: ['purge', 'gauntlet'],
  phases: LIVE,
  difficulty: 6,
  maxPerStage: 3,
  uses: [W10_THEME.spikes, SPIKES],
  pieces: [bank('a', [300, 340]), spikes('b', 'a', [560, 600]), spikes('c', 'b', [300, 340])],
  last: 'c',
  sockets: [petals('a', 'a', 0.5, 1), foe('g', 'b', [0.45, 0.55], GUARDS, 3), petals('c', 'c', 0.5, 1)],
  mirrorable: true,
});

// ───────────────────────────── the ramparts (theme) ─────────────────────────────

const ramp1 = hall('h', 'a', [3]);
/** a rampart gallery: three crumbling slabs over a sunken wall-walk (run across, or drop and walk under) */
const rampartGallery = section({
  id: 'w10-rampart-gallery',
  name: 'crumbling rampart',
  archetypes: 'any',
  phases: MID,
  difficulty: 5,
  teaches: RAMPART,
  uses: [W10_THEME.ramparts],
  pieces: [bank('a', [300, 340]), ...ramp1.pieces],
  last: ramp1.last,
  sockets: [tip(RAMPART, 'a', 0.2), petals('t', ramp1.tiles[1], 0.5, 1), petals('hall', 'hhall', 0.5, 2, 120), foe('foe', 'hb', [0.5, 0.6], SMALL, 3, { phases: LIVE, chance: 0.6 })],
  mirrorable: false,
});

const ramp2 = hall('h', 'a', [2, 3]);
/** two runs of slabs with a solid slab between, a guard on the walk under them */
const rampartTwin = section({
  id: 'w10-rampart-twin',
  name: 'rampart over the guard',
  archetypes: 'any',
  phases: LIVE,
  difficulty: 6,
  uses: [W10_THEME.ramparts, RAMPART],
  pieces: [bank('a', [300, 340]), ...ramp2.pieces],
  last: ramp2.last,
  sockets: [petals('t', ramp2.tiles[3], 0.5, 1), foe('g', 'hhall', [0.4, 0.6], SMALL, 3, { phases: LIVE, chance: 0.8 }), petals('b', 'hb', 0.5, 1)],
  mirrorable: false,
});

const ramp3 = hall('h', 'a', [4], true);
/** a stair of slabs (up 40, down 40) over the walk */
const rampartStair = section({
  id: 'w10-rampart-stair',
  name: 'rampart stair',
  archetypes: 'any',
  phases: HOT,
  difficulty: 7,
  uses: [W10_THEME.ramparts, RAMPART],
  pieces: [bank('a', [300, 340]), ...ramp3.pieces],
  last: ramp3.last,
  sockets: [petals('t', ramp3.tiles[1], 0.5, 1), petals('hall', 'hhall', 0.6, 2, 100), foe('g', 'hb', [0.55, 0.7], GUARDS, 3, { phases: HOT, chance: 0.5 })],
  mirrorable: false,
});

const ramp4 = hall('h', 'c', [3]);
/** a chasm, then a rampart (the combination) */
const rampartChasm = section({
  id: 'w10-rampart-chasm',
  name: 'chasm then the rampart',
  archetypes: 'any',
  phases: HOT,
  difficulty: 7,
  uses: [W10_THEME.ramparts, RAMPART],
  pieces: [bank('a', [360, 400]), chasm('c', 'a', [380, 420], [0.69, 0.86]), ...ramp4.pieces],
  last: ramp4.last,
  sockets: [foe('foe', 'a', [0.3, 0.4], SMALL, 3, { phases: LIVE, chance: 0.6 }), petals('t', ramp4.tiles[1], 0.5, 1), petals('b', 'hb', 0.5, 1)],
  mirrorable: false,
});

// ───────────────────────────── the gusts (theme) ─────────────────────────────

/** a chasm with a gust across it (a headwind or a tailwind, by the flip): jump in the lull */
const gustGap = section({
  id: 'w10-gust-chasm',
  name: 'gust over the chasm',
  archetypes: 'any',
  phases: MID,
  difficulty: 5,
  teaches: WIND,
  uses: [W10_THEME.gusts],
  pieces: [bank('a', [380, 420]), chasm('b', 'a', [400, 440], [0.64, 0.76]), up('k', 'b', 30, [140, 160]), down('c', 'k', 30, [220, 260])],
  zones: [gust('a', 'b', -1)],
  last: 'c',
  sockets: [tip(WIND, 'a', 0.1), petals('k', 'k', 0.5, 1), scenery('banner', 'c', [0.5, 0.7], 0.6)],
  mirrorable: false,
});

/** two gusty chasms, a wall of 380 px or more between (no glide trap), the second gust the other way */
const gustPair = section({
  id: 'w10-gust-pair',
  name: 'two gusts',
  archetypes: 'any',
  phases: LIVE,
  difficulty: 6,
  uses: [W10_THEME.gusts, WIND],
  pieces: [bank('a', [360, 400]), chasm('b', 'a', [400, 440], [0.64, 0.76]), chasm('c', 'b', [380, 420], [0.64, 0.76])],
  zones: [gust('a', 'b', 1), gust('b', 'c', -1)],
  last: 'c',
  sockets: [petals('b', 'b', 0.5, 2, 90), foe('g', 'c', [0.6, 0.7], GUARDS, 3, { phases: HOT, chance: 0.5 })],
  mirrorable: true,
});

/** a gust over a rising jump onto a higher wall, then down a battlement */
const gustRise = section({
  id: 'w10-gust-rise',
  name: 'gust up the wall',
  archetypes: 'any',
  phases: HOT,
  difficulty: 7,
  uses: [W10_THEME.gusts, WIND],
  pieces: [
    bank('a', [380, 420]),
    bank('b', [400, 440], { kind: 'jump', after: 'a', dy: [-46, -38], share: [0.58, 0.74] }, { landing: true }),
    up('k', 'b', 30, [140, 160]),
    down('c', 'k', 30, [200, 240]),
    down('d', 'c', 38, [240, 280]),
  ],
  zones: [gust('a', 'b', -1)],
  last: 'd',
  sockets: [petals('b', 'b', 0.5, 1), petals('k', 'k', 0.5, 1), foe('g', 'd', [0.5, 0.6], SMALL, 3, { phases: HOT, chance: 0.4 })],
  mirrorable: true,
});

/** a gust over a second-jump gap (soft below: the double jump is the way when the gust blows against him) */
const gustLeap = section({
  id: 'w10-gust-leap',
  name: 'gust over the second jump',
  archetypes: 'any',
  phases: LIVE,
  difficulty: 6,
  uses: [W10_THEME.gusts, WIND],
  pieces: [bank('a', [380, 420]), leap('b', 'a', [380, 420], [0.59, 0.74]), up('k', 'b', 32, [140, 160]), down('c', 'k', 32, [220, 260])],
  zones: [gust('a', 'b', 1)],
  last: 'c',
  sockets: [petals('a', 'a', 0.4, 1), petals('k', 'k', 0.5, 1)],
  mirrorable: true,
});

// ───────────────────────────── 10-3 Thunder: the storm watches the wall ─────────────────────────────

/** the stealth gate's watched wall: a wall and two battlements, a crate stack on each flat (the storm covers them all) */
const stormShore = merlons('s', 'wall', 2, [220, 260], [28, 32], [140, 160]);
/** a stealth gate: Pokey's line, then a long watched wall with crates in reach, a long calm before the first pass, no animal */
const stormGate = (theme: W10Theme, extra: Socket[] = []): SectionTemplate =>
  section({
    id: `w10-storm-gate-${theme}`,
    name: `the storm on the wall: ${theme} (cover)`,
    archetypes: ['stealth'],
    phases: ['start'],
    difficulty: 1,
    teaches: W10_THEME[theme],
    weight: 6,
    pieces: [bank('a', [220, 260]), up('k', 'a', 30, [140, 160]), down('wall', 'k', 30, [240, 280]), ...stormShore.pieces],
    last: stormShore.last,
    sockets: [
      tip(STORM, 'a', 0.2),
      petals('k', 'k', 0.5, 1),
      // (the lesson's calm: stormCalm's [9, 11] and a first pass that only warns, from this socket's name)
      storm('wall', 'stormLesson'),
      hideAt('h1', 'wall', 0.45),
      petals('sk1', 'sk1', 0.5, 1),
      hideAt('h2', 'sf1'),
      petals('sk2', 'sk2', 0.5, 1),
      hideAt('h3', 'sf2', 0.6),
      ...extra,
    ],
    mirrorable: false,
  });
const stormGates: SectionTemplate[] = [
  stormGate('rods', [scenery('banner', 'a', [0.5, 0.6], 0.8)]),
  stormGate('spikes'),
  stormGate('ramparts', [scenery('brazier', 'a', [0.5, 0.6], 0.8)]),
  stormGate('gusts', [scenery('rack', 'a', [0.5, 0.6], 0.8)]),
  stormGate('lanterns', [scenery('cage', 'a', [0.5, 0.6], 0.8)]),
  stormGate('counterweights', [scenery('rack', 'a', [0.5, 0.6], 0.8)]),
];

/** a watched wall with crates at each end and in the middle, a guard at the far end */
const stormWall = section({
  id: 'w10-storm-wall',
  name: 'watched wall cover',
  archetypes: ['stealth'],
  phases: MID,
  difficulty: 4,
  weight: 0.25,
  pieces: [bank('a', [260, 300]), up('k', 'a', 30, [140, 160]), down('wall', 'k', 30, [560, 600]), up('k2', 'wall', 30, [140, 160]), down('b', 'k2', 30, [480, 520])],
  last: 'b',
  sockets: [storm('wall'), hideAt('h1', 'wall', 0.15), petals('w', 'wall', 0.32, 1), hideAt('h2', 'wall', 0.52), hideAt('h3', 'wall', 0.88), petals('k2', 'k2', 0.5, 1), foe('g', 'b', [0.5, 0.6], GUARDS, 3, { phases: LIVE, chance: 0.8 })],
  mirrorable: true,
});

/** each flat between the battlements watched on its own, a crate or barrel on each */
const stormSteps = (() => {
  const m = merlons('', 'a', 3, [260, 300]);
  return section({
    id: 'w10-storm-steps',
    name: 'watched battlements cover',
    archetypes: ['stealth'],
    phases: MID,
    difficulty: 5,
    weight: 0.25,
    pieces: [bank('a', [260, 300]), ...m.pieces],
    last: m.last,
    sockets: [storm('f1', 'storm1'), hideAt('h1', 'f1', 0.35), storm('f2', 'storm2'), hideAt('h2', 'f2', 0.35), storm('f3', 'storm3'), hideAt('h3', 'f3', 0.35), petals('k2', 'k2', 0.5, 1)],
    mirrorable: true,
  });
})();

/** a watched wall across a chasm: crates on both sides of the jump */
const stormGap = section({
  id: 'w10-storm-chasm',
  name: 'watched chasm cover',
  archetypes: ['stealth'],
  phases: LIVE,
  difficulty: 6,
  weight: 0.25,
  pieces: [bank('a', [420, 460]), chasm('b', 'a', [440, 480], [0.64, 0.78])],
  last: 'b',
  sockets: [storm('a', 'stormA'), hideAt('h1', 'a', 0.35), storm('b', 'stormB'), hideAt('h2', 'b', 0.3), hideAt('h3', 'b', 0.8), petals('b', 'b', 0.55, 1)],
  mirrorable: true,
});

/** a watched wall with rods on it: the storm's watch and the rods' beat together (Ten, Ketsu) */
const stormRods = section({
  id: 'w10-storm-rods',
  name: 'watched rods cover',
  archetypes: ['stealth'],
  phases: LIVE,
  difficulty: 7,
  uses: [W10_THEME.rods, BOLT],
  weight: 2,
  pieces: [bank('a', [260, 300]), up('k', 'a', 30, [140, 160]), down('wall', 'k', 30, [640, 680]), up('k2', 'wall', 30, [140, 160]), down('b', 'k2', 30, [240, 280])],
  zones: [rod('wall', [0.3, 0.34]), rod('wall', [0.66, 0.7])],
  last: 'b',
  sockets: [storm('wall'), hideAt('h1', 'wall', 0.12), hideAt('h2', 'wall', 0.5), hideAt('h3', 'wall', 0.9), petals('k2', 'k2', 0.5, 1)],
  mirrorable: true,
});

/** a watched rampart: the cover is on the walk below; run the slabs in the calm, or drop and hide */
const stormRamp = hall('h', 'a', [3]);
const stormRampart = section({
  id: 'w10-storm-rampart',
  name: 'watched rampart cover',
  archetypes: ['stealth'],
  phases: LIVE,
  difficulty: 6,
  uses: [W10_THEME.ramparts, RAMPART],
  weight: 2,
  pieces: [bank('a', [300, 340]), ...stormRamp.pieces],
  last: stormRamp.last,
  sockets: [storm('hhall'), hideAt('h1', 'hhall', 0.3), hideAt('h2', 'hhall', 0.8), hideAt('h3', 'hb', 0.5), petals('t', stormRamp.tiles[1], 0.5, 1)],
  mirrorable: false,
});

/** watched spike beds: crates on the walls between the beds */
const stormSpikes = section({
  id: 'w10-storm-spikes',
  name: 'watched spike beds cover',
  archetypes: ['stealth'],
  phases: LIVE,
  difficulty: 6,
  uses: [W10_THEME.spikes, SPIKES],
  weight: 2,
  pieces: [bank('a', [360, 400]), spikes('b', 'a', [380, 420]), spikes('c', 'b', [340, 380])],
  last: 'c',
  sockets: [storm('a', 'stormA'), hideAt('h1', 'a', 0.4), storm('b', 'stormB'), hideAt('h2', 'b', 0.45), storm('c', 'stormC'), hideAt('h3', 'c', 0.5)],
  mirrorable: true,
});

/** watched walls across a gusty chasm: hide on the near wall, cross in a calm and a lull */
const stormGusts = section({
  id: 'w10-storm-gusts',
  name: 'watched gusts cover',
  archetypes: ['stealth'],
  phases: LIVE,
  difficulty: 6,
  uses: [W10_THEME.gusts, WIND],
  weight: 2,
  pieces: [bank('a', [440, 480]), chasm('b', 'a', [440, 480], [0.62, 0.74])],
  zones: [gust('a', 'b', -1)],
  last: 'b',
  sockets: [storm('a', 'stormA'), hideAt('h1', 'a', 0.3), storm('b', 'stormB'), hideAt('h2', 'b', 0.45), hideAt('h3', 'b', 0.88), petals('b', 'b', 0.65, 1)],
  mirrorable: true,
});

/** watched battlements with a rod on each flat: hide, wait for the strike, move on (the rods theme's stealth) */
const stormRodSteps = (() => {
  const m = merlons('', 'a', 2, [360, 400]);
  return section({
    id: 'w10-storm-rod-steps',
    name: 'watched rod battlements cover',
    archetypes: ['stealth'],
    phases: LIVE,
    difficulty: 7,
    uses: [W10_THEME.rods, BOLT],
    weight: 2,
    pieces: [bank('a', [260, 300]), ...m.pieces],
    zones: [rod('f1', [0.68, 0.72]), rod('f2', [0.68, 0.72])],
    last: m.last,
    sockets: [storm('f1', 'storm1'), hideAt('h1', 'f1', 0.3), storm('f2', 'storm2'), hideAt('h2', 'f2', 0.3), petals('k1', 'k1', 0.5, 1), petals('k2', 'k2', 0.5, 1)],
    mirrorable: true,
  });
})();

/** a soldier walking a watched wall between two crate stacks: wait behind one for both the storm and the guard (the fight is a choice) */
const stormPatrol = section({
  id: 'w10-storm-patrol',
  name: 'watched patrol cover',
  archetypes: ['stealth'],
  phases: LIVE,
  difficulty: 6,
  weight: 1.5,
  uses: [W10_THEME.spikes],
  pieces: [bank('a', [240, 280]), up('k', 'a', 30, [140, 160]), down('wall', 'k', 30, [740, 780]), up('k2', 'wall', 30, [140, 160]), down('b', 'k2', 30, [200, 240])],
  last: 'b',
  sockets: [storm('wall'), hideAt('h1', 'wall', 0.1), foe('g', 'wall', [0.48, 0.52], GUARDS, 3), hideAt('h2', 'wall', 0.9), petals('k2', 'k2', 0.5, 1)],
  mirrorable: true,
});

/** a high battlement road over a watched yard: up on the road the flash finds him; down in the yard the crates hide him, and a cat waits */
const stormYard = section({
  id: 'w10-storm-yard',
  name: 'watched yard cover',
  archetypes: ['stealth'],
  phases: LIVE,
  difficulty: 6,
  weight: 1.5,
  uses: [W10_THEME.ramparts],
  pieces: [
    bank('a', [300, 340]),
    down('yard', 'a', 60, [700, 740]),
    up('b', 'yard', 60, [300, 340]),
    { key: 'road', shape: 'block', w: [220, 260], h: 26, place: { kind: 'over', on: 'yard', at: [0.3, 0.36], dy: -150 }, main: false, style: 'moss_stone' },
  ],
  last: 'b',
  sockets: [storm('yard'), hideAt('h1', 'yard', 0.1), foe('c', 'yard', [0.48, 0.54], ['ocelot', 'soldier', 'tayra'], 3), hideAt('h2', 'yard', 0.9), petals('road', 'road', 0.5, 3, 160)],
  mirrorable: true,
});

// ───────────────────────────── 10-7 The Walls and 10-9 The Fortress Gate: the guards ─────────────────────────────

/** a hunt gate (10-7 purge, 10-9 gauntlet): Pokey explains the shut shrine before any guard, and the roll's theme opens */
const huntGate = (theme: W10Theme, line: 'hunt' | 'fight'): SectionTemplate => {
  const m = merlons('', 'a', 2, [220, 260]);
  return section({
    id: `w10-${line}-gate-${theme}`,
    name: `${line === 'hunt' ? 'the walls' : 'the fortress gate'}: ${theme} (arena gate)`,
    archetypes: [line === 'hunt' ? 'purge' : 'gauntlet'],
    phases: ['start'],
    difficulty: 1,
    teaches: W10_THEME[theme],
    weight: 6,
    pieces: [bank('a', [240, 280]), ...m.pieces],
    last: m.last,
    sockets: [tip(line, 'a', 0.15), petals('k1', 'k1', 0.5, 1), petals('k2', 'k2', 0.5, 1), scenery(theme === 'rods' ? 'banner' : theme === 'spikes' ? 'rack' : theme === 'ramparts' ? 'cage' : 'brazier', 'f2', [0.5, 0.7], 0.8)],
    mirrorable: false,
  });
};
const huntGates: SectionTemplate[] = THEMES.flatMap((theme) => (['hunt', 'fight'] as const).map((line) => huntGate(theme, line)));

/** a long wall with a battlement between two guards, and one more battlement off its end (the arena's bread and butter) */
const guardWall = section({
  id: 'w10-guard-wall',
  name: 'guards on the wall arena',
  archetypes: ['purge', 'gauntlet'],
  phases: MID,
  difficulty: 5,
  weight: 2,
  pieces: [bank('a', [440, 480]), up('k', 'a', 30, [140, 160]), down('b', 'k', 30, [440, 480]), up('k2', 'b', 30, [140, 160]), down('c', 'k2', 30, [200, 240])],
  last: 'c',
  sockets: [foe('g1', 'a', [0.5, 0.6], GUARDS, 3), petals('k', 'k', 0.5, 1), foe('g2', 'b', [0.45, 0.55], SMALL, 3, { phases: LIVE }), petals('k2', 'k2', 0.5, 1)],
  mirrorable: true,
});

/** a sunken yard between two walls: guards and a cat in it either side of a rod, stairs down and up */
const guardYard = section({
  id: 'w10-guard-yard',
  name: 'guard yard arena',
  archetypes: ['purge', 'gauntlet'],
  phases: LIVE,
  difficulty: 6,
  maxPerStage: 3,
  weight: 2,
  uses: [W10_THEME.rods, BOLT],
  pieces: [bank('a', [240, 280]), down('s', 'a', 40, [140, 160]), down('yard', 's', 40, [620, 680]), up('s2', 'yard', 40, [140, 160]), up('b', 's2', 40, [260, 300])],
  // (a rod at the foot of the stairs: the fight is past it, and on Easy, with fewer guards, the yard still has its beat)
  zones: [rod('yard', [0.2, 0.24])],
  last: 'b',
  sockets: [petals('a', 'a', 0.5, 1), foe('g1', 'yard', [0.46, 0.52], GUARDS, 3), foe('g2', 'yard', [0.78, 0.84], [...GUARDS, ...CATS], 5, { phases: HOT, chance: 0.8 }), petals('s2', 's2', 0.5, 1)],
  mirrorable: true,
});

/** guards between rods: fight in the pockets, never in a column */
const guardRods = section({
  id: 'w10-guard-rods',
  name: 'guards between rods arena',
  archetypes: ['purge', 'gauntlet'],
  phases: MID,
  difficulty: 7,
  maxPerStage: 2,
  uses: [W10_THEME.rods, BOLT],
  pieces: [bank('a', [300, 340]), up('k', 'a', 30, [140, 160]), down('b', 'k', 30, [720, 760]), up('k2', 'b', 30, [140, 160]), down('c', 'k2', 30, [240, 280])],
  zones: [rod('b', [0.12, 0.14]), rod('b', [0.86, 0.88])],
  last: 'c',
  sockets: [foe('g1', 'b', [0.42, 0.48], GUARDS, 3), foe('g2', 'b', [0.58, 0.62], GUARDS, 3, { phases: HOT, chance: 0.6 }), petals('k2', 'k2', 0.5, 1)],
  mirrorable: true,
});

/** a harpy's long wall and a tayra past a chasm */
const harpyWall = section({
  id: 'w10-harpy-wall',
  name: 'harpy wall arena',
  archetypes: ['purge', 'gauntlet'],
  phases: HOT,
  difficulty: 7,
  maxPerStage: 3,
  pieces: [bank('a', [300, 340]), up('k', 'a', 30, [140, 160]), down('flat', 'k', 30, [600, 640]), chasm('b', 'flat', [460, 500], [0.64, 0.8])],
  last: 'b',
  sockets: [petals('k', 'k', 0.5, 1), foe('harpy', 'flat', [0.45, 0.55], ['harpy'], 4), foe('t', 'b', [0.5, 0.6], ['tayra', 'soldier'], 3, { phases: HOT, chance: 0.6 })],
  mirrorable: true,
});

/** guards on two walls over a gusty chasm */
const guardGusts = section({
  id: 'w10-guard-gusts',
  name: 'guards over the gusts arena',
  archetypes: ['purge', 'gauntlet'],
  phases: MID,
  difficulty: 7,
  maxPerStage: 2,
  uses: [W10_THEME.gusts, WIND],
  pieces: [bank('a', [520, 560]), chasm('b', 'a', [520, 560], [0.64, 0.74])],
  zones: [gust('a', 'b', -1)],
  last: 'b',
  sockets: [foe('g1', 'a', [0.3, 0.4], GUARDS, 3), foe('g2', 'b', [0.6, 0.7], [...GUARDS, 'tayra'], 3, { phases: LIVE })],
  mirrorable: true,
});

/** two guards on the walk under a rampart */
const guardRamp = hall('h', 'a', [3, 2], false, [480, 520]);
const guardRampart = section({
  id: 'w10-guard-rampart',
  name: 'guards under the rampart arena',
  archetypes: ['purge', 'gauntlet'],
  phases: MID,
  difficulty: 7,
  maxPerStage: 2,
  uses: [W10_THEME.ramparts, RAMPART],
  pieces: [bank('a', [300, 340]), ...guardRamp.pieces],
  last: guardRamp.last,
  sockets: [foe('g1', 'hhall', [0.35, 0.45], GUARDS, 3), foe('g2', 'hb', [0.55, 0.65], SMALL, 3, { phases: LIVE }), petals('t', guardRamp.tiles[1], 0.5, 1)],
  mirrorable: false,
});

/** 10-7: soldiers walking the flats between three battlements */
const wallPatrol = (() => {
  const m = merlons('', 'a', 2, [420, 460]);
  return section({
    id: 'w10-wall-patrol',
    name: 'wall patrol arena',
    archetypes: ['purge', 'gauntlet'],
    phases: LIVE,
    difficulty: 6,
    maxPerStage: 3,
    weight: 2,
    pieces: [bank('a', [300, 340]), ...m.pieces],
    last: m.last,
    sockets: [petals('a', 'a', 0.5, 1), foe('g1', 'f1', [0.5, 0.6], GUARDS, 3), petals('k2', 'k2', 0.5, 1), foe('g2', 'f2', [0.45, 0.55], [...GUARDS, 'tayra'], 3, { phases: HOT })],
    mirrorable: true,
  });
})();

/** 10-7: a watchtower's steps up and over, a tayra or a harpy on the far wall */
const towerSteps = section({
  id: 'w10-tower-steps',
  name: 'watchtower steps arena',
  archetypes: ['purge', 'gauntlet'],
  phases: LIVE,
  difficulty: 6,
  maxPerStage: 3,
  pieces: [bank('a', [240, 280]), up('s1', 'a', 34, [150, 170]), up('s2', 's1', 34, [180, 220]), down('s3', 's2', 34, [150, 170]), down('b', 's3', 34, [460, 500]), up('k', 'b', 30, [140, 160]), down('c', 'k', 30, [200, 240])],
  last: 'c',
  sockets: [petals('s1', 's1', 0.5, 1), petals('s2', 's2', 0.5, 1), foe('f', 'b', [0.45, 0.55], ['tayra', 'harpy', 'soldier'], 4), petals('k', 'k', 0.5, 1)],
  mirrorable: true,
});

/** 10-9: the yard under the portcullis: a rod at the foot of its stairs, two soldiers and a jaguar */
const portcullisYard = section({
  id: 'w10-portcullis-yard',
  name: 'portcullis yard arena',
  archetypes: ['gauntlet'],
  phases: HOT,
  difficulty: 8,
  weight: 2,
  maxPerStage: 2,
  uses: [BOLT],
  pieces: [bank('a', [240, 260]), down('s', 'a', 40, [130, 150]), down('yard', 's', 40, [680, 720]), up('s2', 'yard', 40, [130, 150]), up('b', 's2', 40, [260, 300])],
  // (a rod at the foot of the stairs, under the portcullis: its beat stays on Easy, where the guards are fewer)
  zones: [rod('yard', [0.14, 0.17])],
  last: 'b',
  sockets: [foe('g1', 'yard', [0.4, 0.45], GUARDS, 3), foe('j', 'yard', [0.62, 0.66], ['jaguar', 'soldier'], 5), foe('g2', 'yard', [0.86, 0.9], GUARDS, 3, { chance: 0.7 }), petals('s2', 's2', 0.5, 1)],
  mirrorable: true,
});

/** 10-9: the gatehouse run: a spike bed, a soldier, a rod, a chasm (everything the world taught, in a row) */
const gatehouseRun = section({
  id: 'w10-gatehouse-run',
  name: 'gatehouse run arena',
  archetypes: ['gauntlet'],
  phases: HOT,
  difficulty: 9,
  maxPerStage: 2,
  weight: 2,
  uses: [W10_THEME.spikes, SPIKES, BOLT],
  pieces: [bank('a', [280, 320]), spikes('b', 'a', [420, 460], [0.84, 0.94]), up('k', 'b', 30, [140, 160]), down('c', 'k', 30, [340, 380]), chasm('d', 'c', [240, 280], [0.74, 0.9])],
  zones: [rod('c', [0.5, 0.56])],
  last: 'd',
  sockets: [foe('g', 'b', [0.42, 0.5], GUARDS, 3), petals('k', 'k', 0.5, 1), petals('d', 'd', 0.5, 1)],
  mirrorable: true,
});

/** 10-9's approach: the outer wall under the gatehouse, a soldier on it, a battlement and a rod past it (the gauntlet's gentle start) */
const gateApproach = section({
  id: 'w10-gate-approach',
  name: 'outer wall arena',
  archetypes: ['gauntlet'],
  phases: ['ki', 'sho'],
  difficulty: 4,
  maxPerStage: 1,
  uses: [BOLT],
  pieces: [bank('a', [460, 500]), up('k', 'a', 30, [140, 160]), down('b', 'k', 30, [360, 400]), up('k2', 'b', 30, [140, 160]), down('c', 'k2', 30, [220, 260])],
  zones: [rod('b', [0.48, 0.52])],
  last: 'c',
  sockets: [foe('g', 'a', [0.45, 0.55], GUARDS, 3), petals('k', 'k', 0.5, 1), petals('k2', 'k2', 0.5, 1), scenery('banner', 'c', [0.4, 0.6], 0.6)],
  mirrorable: true,
});

/** 10-9: the drawbridge chains: a battlement, a wide chasm, a second-jump gap (soft), soldiers on the far wall */
const drawbridge = section({
  id: 'w10-drawbridge',
  name: 'drawbridge chains arena',
  archetypes: ['gauntlet'],
  phases: MID,
  difficulty: 8,
  maxPerStage: 2,
  pieces: [bank('a', [220, 260]), up('k', 'a', 30, [140, 160]), down('a2', 'k', 30, [240, 280]), wide('b', 'a2', [320, 360]), leap('c', 'b', [400, 440])],
  last: 'c',
  sockets: [petals('k', 'k', 0.5, 1), petals('b', 'b', 0.5, 1), foe('g1', 'c', [0.55, 0.62], GUARDS, 3), scenery('cage', 'a', [0.3, 0.5], 0.6)],
  mirrorable: true,
});

// ───────────────────────────── the grab bag's pieces on hand (GRAB-BAG.md G, H, I, J; w10PieceArt.ts) ─────────────────────────────

/**
 * I. Perch posts (10-1's own theme): timber posts with a plank on a bracket, stuck up out of a chasm (w10var 'perch-b'): a run of short
 * precise hops over a soft floor (a slip costs a climb back, never a life: World 8's knot perches' numbers). Up, down, up.
 */
const perchPost = (key: string, after: string, dy: number, share: W = [0.4, 0.55]): SectionPiece => ({ key, shape: 'branch', style: 'w10_perch', w: [84, 98], place: { kind: 'jump', after, dy, share, soft: true } });
const perchLand = (key: string, after: string, dy: number, w: W): SectionPiece => bank(key, w, { kind: 'jump', after, dy, share: [0.4, 0.55], soft: true }, { landing: true });
const perchRun = section({
  id: 'w10-perch-run',
  name: 'perch posts over the chasm',
  archetypes: 'any',
  phases: MID,
  difficulty: 5,
  uses: [W10_THEME.perches],
  pieces: [bank('a', [300, 340]), perchPost('p1', 'a', -30), perchPost('p2', 'p1', 18), perchPost('p3', 'p2', -24), perchLand('b', 'p3', 36, [260, 300])],
  last: 'b',
  sockets: [flag('a', 0.5), petals('a', 'a', 0.4, 1), petals('p1', 'p1', 0.5, 1, 0), petals('p3', 'p3', 0.5, 1, 0), petals('b', 'b', 0.5, 2, 80), foe('foe', 'b', [0.7, 0.8], SMALL, 3, { phases: HOT, chance: 0.4 })],
  mirrorable: true,
});
/** four posts rising to a high battlement, and down off it */
const perchClimb = section({
  id: 'w10-perch-climb',
  name: 'up the perch posts',
  archetypes: 'any',
  phases: LIVE,
  difficulty: 6,
  uses: [W10_THEME.perches],
  pieces: [bank('a', [240, 280]), perchPost('p1', 'a', -34), perchPost('p2', 'p1', -28), perchPost('p3', 'p2', 12), perchPost('p4', 'p3', -30), perchLand('hi', 'p4', -10, [220, 260]), down('b', 'hi', 90, [260, 300])],
  last: 'b',
  sockets: [flag('hi', 0.5), petals('p2', 'p2', 0.5, 1, 0), petals('p4', 'p4', 0.5, 1, 0), petals('hi', 'hi', 0.5, 2, 80), petals('b', 'b', 0.5, 1)],
  mirrorable: true,
});
/** posts either side of a rod: wait out the bolt on the bank, then hop the posts */
const perchRods = section({
  id: 'w10-perch-rods',
  name: 'perch posts by a rod',
  archetypes: 'any',
  phases: HOT,
  difficulty: 7,
  uses: [W10_THEME.perches, BOLT],
  pieces: [bank('a', [380, 420]), perchPost('p1', 'a', -26), perchPost('p2', 'p1', 20), perchLand('b', 'p2', 6, [300, 340]), perchPost('p3', 'b', -30), perchLand('c', 'p3', 30, [260, 300])],
  zones: [rod('a', [0.68, 0.72]), rod('b', [0.5, 0.55])],
  last: 'c',
  sockets: [flag('c', 0.3), petals('p1', 'p1', 0.5, 1, 0), petals('p2', 'p2', 0.5, 1, 0), petals('p3', 'p3', 0.5, 1, 0), petals('c', 'c', 0.5, 1)],
  mirrorable: true,
});

/**
 * G, H. The watchtowers (10-7's own theme): the iron stair bolted up a tower face (w10b 'iron-stair', a run of hops up), the stone balconies
 * jutting from it (w10b 'balcony', jumps up), and the iron scaffold walkway along its top (w10b 'scaffold') where a guard walks. Every
 * floor under them is soft (a miss is a climb back: STAGE-RULES §6, falls in climbs). Never mirrored: flipped, the climb runs down, and
 * on Easy the soft pits' steps turn a descent into a quiet walk (pieceCheck, 2026-10-31).
 */
const tread = (key: string, after: string, dy: number): SectionPiece => ({ key, shape: 'branch', style: 'w10_stair', w: [88, 100], place: { kind: 'jump', after, dy, share: [0.3, 0.4], soft: true } });
const treads = (p: string, after: string, rise: number[]): { pieces: SectionPiece[]; last: string; total: number } => {
  const out: SectionPiece[] = [];
  let prev = after;
  let total = 0;
  rise.forEach((r, i) => {
    out.push(tread(`${p}${i + 1}`, prev, -r));
    total += r;
    prev = `${p}${i + 1}`;
  });
  return { pieces: out, last: prev, total };
};
const balcony = (key: string, after: string, dy: number, share: W = [0.42, 0.56]): SectionPiece => ({ key, shape: 'branch', style: 'w10_balcony', w: [120, 140], place: { kind: 'jump', after, dy, share, soft: true }, landing: true });
const walkway = (key: string, after: string, dy: number, w: W): SectionPiece => ({ key, shape: 'branch', style: 'w10_scaffold', w, place: { kind: 'jump', after, dy, share: [0.3, 0.42], soft: true }, landing: true });

const st1 = treads('s', 'a', [42, 40, 44]);
/** up the iron stair to the scaffold walkway, a guard on it, and down the far side */
const ironStair = section({
  id: 'w10-iron-stair',
  name: 'iron stair to the scaffold arena',
  archetypes: ['purge'],
  phases: MID,
  difficulty: 5,
  uses: [W10_THEME.towers],
  pieces: [bank('a', [300, 340]), ...st1.pieces, walkway('hi', st1.last, -36, [300, 340]), down('b', 'hi', st1.total + 36, [300, 340])],
  last: 'b',
  sockets: [flag('a', 0.5), petals('s2', 's2', 0.5, 1, 0), foe('g', 'hi', [0.55, 0.65], GUARDS, 3), petals('b', 'b', 0.5, 1), scenery('brazier', 'a', [0.2, 0.3], 0.6)],
  mirrorable: false,
});
/** balconies up the tower face, the top of the tower, and a drop to the wall past it */
const balconyClimb = section({
  id: 'w10-balcony-climb',
  name: 'tower balconies',
  archetypes: ['purge'],
  phases: LIVE,
  difficulty: 6,
  uses: [W10_THEME.towers],
  pieces: [bank('a', [220, 260]), balcony('l1', 'a', -60), balcony('l2', 'l1', -54), balcony('l3', 'l2', -50), perchLand('hi', 'l3', -12, [180, 210]), bank('c', [200, 230], { kind: 'jump', after: 'hi', dy: 176, share: [0.55, 0.7], soft: true }, { landing: true })],
  last: 'c',
  sockets: [flag('hi', 0.5), petals('l1', 'l1', 0.5, 1, 0), petals('l3', 'l3', 0.5, 1, 0), foe('g', 'c', [0.6, 0.7], ['soldier', 'harpy'], 4, { phases: HOT, chance: 0.6, easy: 'keep' })],
  mirrorable: false,
});
const st2 = treads('s', 'k', [40, 42]);
/** a guard's flat, the iron stair up to two walkways with a balcony between, and down */
const towerRun = section({
  id: 'w10-tower-run',
  name: 'stair, walkway and balcony arena',
  archetypes: ['purge'],
  phases: HOT,
  difficulty: 7,
  uses: [W10_THEME.towers],
  pieces: [bank('a', [300, 340]), up('k', 'a', 30, [120, 140]), ...st2.pieces, walkway('w1', st2.last, -30, [200, 230]), balcony('l', 'w1', -40, [0.4, 0.5]), walkway('w2', 'l', 30, [250, 280]), down('b', 'w2', st2.total + 30 + 40 - 30 + 30, [200, 240])],
  last: 'b',
  sockets: [flag('b', 0.25), foe('g1', 'a', [0.45, 0.55], GUARDS, 3), petals('l', 'l', 0.5, 1, 0), foe('g2', 'w2', [0.5, 0.6], SMALL, 3, { phases: HOT, chance: 0.6 }), petals('b', 'b', 0.5, 1)],
  mirrorable: false,
});

/**
 * J. Chain bridges (10-7's own theme): the painted chain bridge slung across a chasm (gemini w9w10-bridges 'chain-bridge'), a hop on
 * and off at its ends, a guard on its span: a fight on a narrow bridge. The floor under every bridge is soft (a knock off it is a climb
 * back, never a life).
 */
const span = (key: string, after: string, w: W): SectionPiece => ({ key, shape: 'branch', style: 'w10_bridge', w, place: { kind: 'jump', after, dy: [-6, 6], share: [0.14, 0.22], soft: true }, landing: true });
const offSpan = (key: string, after: string, w: W): SectionPiece => bank(key, w, { kind: 'jump', after, dy: [-6, 6], share: [0.14, 0.22], soft: true }, { landing: true });
const bridgeFight = section({
  id: 'w10-bridge-fight',
  name: 'guard on the chain bridge arena',
  archetypes: ['purge'],
  phases: MID,
  difficulty: 5,
  uses: [W10_THEME.bridges],
  pieces: [bank('a', [300, 340]), span('br', 'a', [440, 480]), offSpan('b', 'br', [300, 340])],
  last: 'b',
  sockets: [flag('a', 0.5), petals('a', 'a', 0.5, 1), foe('g', 'br', [0.5, 0.6], GUARDS, 3), petals('b', 'b', 0.4, 2, 80)],
  mirrorable: true,
});
/** two bridges with a battlement tower between them, a guard on each span */
const bridgePair = section({
  id: 'w10-bridge-pair',
  name: 'two chain bridges arena',
  archetypes: ['purge'],
  phases: LIVE,
  difficulty: 7,
  maxPerStage: 2,
  uses: [W10_THEME.bridges],
  pieces: [bank('a', [300, 340]), span('br1', 'a', [340, 380]), offSpan('t', 'br1', [200, 240]), span('br2', 't', [360, 400]), offSpan('b', 'br2', [200, 240])],
  last: 'b',
  sockets: [flag('a', 0.5), foe('g1', 'br1', [0.5, 0.6], GUARDS, 3), foe('g2', 'br2', [0.45, 0.55], [...GUARDS, 'tayra'], 3, { phases: HOT, chance: 0.7 }), petals('b', 'b', 0.5, 1)],
  mirrorable: true,
});
/** a bridge to a rod's wall: the bolt on the far bank is the beat, the guard on the span the fight */
const bridgeRods = section({
  id: 'w10-bridge-rods',
  name: 'chain bridge to the rod arena',
  archetypes: ['purge'],
  phases: HOT,
  difficulty: 7,
  uses: [W10_THEME.bridges, BOLT],
  pieces: [bank('a', [240, 280]), span('br', 'a', [440, 480]), offSpan('b', 'br', [440, 480]), up('k', 'b', 30, [140, 160]), down('c', 'k', 30, [220, 260])],
  zones: [rod('b', [0.3, 0.34])],
  last: 'c',
  sockets: [flag('k', 0.5), foe('g', 'br', [0.45, 0.55], GUARDS, 3), petals('b', 'b', 0.7, 1)],
  mirrorable: true,
});

/**
 * D. Drop gates (10-7's own theme): a gatehouse over the wall-walk whose portcullis drops on a beat (zones.ts 'bolt', look 'portcullis':
 * it rattles 1.2 s, stays down 1.1 s, is up 3.3 s or more; w10DropArt.ts). Run under while it's up. Caught, he is shoved back out the side
 * he came in (a heart on Normal). The first one is taught where a miss costs nothing (`gentle`), with his line before it.
 */
const dropGate = (on: string, at: [number, number], gentle = false): SectionZone => ({ kind: 'bolt', on, at, look: 'portcullis', ...(gentle ? { gentle: true } : {}) });
const dropFirst = section({
  id: 'w10-drop-first',
  name: 'the first drop gate',
  archetypes: ['purge'],
  phases: ['ki', 'sho'],
  difficulty: 3,
  teaches: DROPGATE,
  uses: [W10_THEME.drops],
  maxPerStage: 1,
  pieces: [bank('a', [300, 340]), up('k', 'a', 30, [140, 160]), down('b', 'k', 30, [460, 500])],
  zones: [dropGate('b', [0.5, 0.55], true)],
  last: 'b',
  sockets: [flag('a', 0.6), tip(DROPGATE, 'a', 0.2), petals('k', 'k', 0.5, 1), petals('b', 'b', 0.85, 1)],
  mirrorable: false,
});
/** two gates on one long wall, out of step: through the first, wait in the pocket, through the second; a guard past them (no animal
 *  is topped up between the gates: `main: false`) */
const dropRow = section({
  id: 'w10-drop-row',
  name: 'drop gates in a row',
  archetypes: ['purge'],
  phases: LIVE,
  difficulty: 6,
  uses: [W10_THEME.drops, DROPGATE],
  pieces: [bank('a', [560, 600], { kind: 'start' }, { main: false }), up('k', 'a', 30, [140, 160]), down('b', 'k', 30, [400, 440])],
  zones: [dropGate('a', [0.24, 0.28]), dropGate('a', [0.72, 0.76])],
  last: 'b',
  sockets: [flag('k', 0.5), petals('a', 'a', 0.5, 1), foe('g', 'b', [0.55, 0.65], GUARDS, 3)],
  mirrorable: true,
});
/** a drop gate into a guard's yard: through it, and the fight is on the far side */
const dropYard = section({
  id: 'w10-drop-yard',
  name: 'drop gate to the guard yard arena',
  archetypes: ['purge'],
  phases: MID,
  difficulty: 5,
  uses: [W10_THEME.drops, DROPGATE],
  pieces: [bank('a', [360, 400]), down('s', 'a', 40, [140, 160]), down('yard', 's', 40, [560, 600]), up('s2', 'yard', 40, [140, 160]), up('b', 's2', 40, [240, 280])],
  zones: [dropGate('a', [0.5, 0.55])],
  last: 'b',
  sockets: [flag('s2', 0.5), petals('a', 'a', 0.15, 1), foe('g1', 'yard', [0.5, 0.56], GUARDS, 3), foe('g2', 'yard', [0.8, 0.86], [...GUARDS, ...CATS], 5, { phases: HOT, chance: 0.6 }), petals('s2', 's2', 0.5, 1)],
  mirrorable: true,
});
/** up the battlements to a gate on the high walk, a chasm off its far end (Ten, Ketsu) */
const dropHigh = (() => {
  const m = merlons('', 'a', 2, [340, 380]);
  return section({
    id: 'w10-drop-high',
    name: 'drop gate on the high walk',
    archetypes: ['purge'],
    phases: HOT,
    difficulty: 7,
    uses: [W10_THEME.drops, DROPGATE],
    pieces: [bank('a', [240, 280]), ...m.pieces, chasm('c', m.last, [300, 340])],
    zones: [dropGate('f2', [0.45, 0.5])],
    last: 'c',
    sockets: [flag('k1', 0.5), petals('k1', 'k1', 0.5, 1), petals('k2', 'k2', 0.5, 1), foe('g', 'c', [0.5, 0.6], SMALL, 3, { chance: 0.6 })],
    mirrorable: true,
  });
})();
/**
 * F. Trapdoor grates (10-9's own theme): an iron grate laid flush over a chasm a double jump wide (w10_trap; trapdoor.ts): it shudders, swings
 * open on its beat and clangs shut. Walk it while it's shut, or take the double jump: both ways over are fair. The pit under it is soft. The grate overlaps both lips by 10 px whatever the gap rolls (its near end at the near bank's end less 10 px, its width
 * the widest double-jump gap, 230 px, plus 20), so there is never a crack to slip through.
 */
const TRAP_BANK = 320;
const grate = (key: string, on: string): SectionPiece => ({ key, shape: 'branch', style: 'w10_trap', w: 250, h: 30, place: { kind: 'over', on, at: (TRAP_BANK - 10) / TRAP_BANK, dy: 0 }, main: true });
// (the pit under a grate is soft on both settings: a grate that opens under him is a fall of one step and a climb back, never a life;
// the first-timer bot, which does not read the shudder, lost lives over and over at void-floored grates on Normal, 2026-10-31)
const trapGap = (key: string, after: string, w: W): SectionPiece => bank(key, w, { kind: 'pit', after, jump: 'double', share: [0.86, 0.9], soft: true }, { landing: true });
const trapFirst = section({
  id: 'w10-trap-first',
  name: 'the first trapdoor grate',
  archetypes: ['gauntlet'],
  phases: ['ki', 'sho'],
  difficulty: 3,
  teaches: TRAP,
  uses: [W10_THEME.trapdoors],
  maxPerStage: 1,
  pieces: [bank('a', TRAP_BANK), grate('g', 'a'), trapGap('b', 'a', [300, 340])],
  last: 'b',
  sockets: [flag('a', 0.4), tip(TRAP, 'a', 0.15), petals('b', 'b', 0.5, 2, 80)],
  mirrorable: false,
});
/** two grates out of step with a stone pocket between: cross one, wait in the pocket, cross the next (no animal is topped up onto the
 *  pocket: `main: false`, pipeline topUpFoes) */
const trapRow = section({
  id: 'w10-trap-row',
  name: 'trapdoor grates in a row',
  archetypes: ['gauntlet'],
  phases: LIVE,
  difficulty: 6,
  uses: [W10_THEME.trapdoors, TRAP],
  pieces: [bank('a', TRAP_BANK), grate('g1', 'a'), { ...trapGap('p', 'a', TRAP_BANK), main: false }, grate('g2', 'p'), trapGap('b', 'p', [300, 340])],
  last: 'b',
  sockets: [flag('p', 0.5), petals('b', 'b', 0.4, 1), foe('g', 'b', [0.65, 0.75], GUARDS, 3, { phases: HOT, chance: 0.6 })],
  mirrorable: true,
});
/** a grate to a guard's wall: across, and the fight is on the far side */
const trapGuard = section({
  id: 'w10-trap-guard',
  name: 'trapdoor grate to the guard arena',
  archetypes: ['gauntlet'],
  phases: MID,
  difficulty: 5,
  uses: [W10_THEME.trapdoors, TRAP],
  pieces: [bank('a', TRAP_BANK), grate('g', 'a'), trapGap('b', 'a', [460, 500]), up('k', 'b', 30, [140, 160]), down('c', 'k', 30, [220, 260])],
  last: 'c',
  sockets: [flag('k', 0.5), foe('g1', 'b', [0.55, 0.65], GUARDS, 3)],
  mirrorable: true,
});
/** a grate, then spikes: across on the beat, then jump the bed (Ten, Ketsu) */
const trapSpikes = section({
  id: 'w10-trap-spikes',
  name: 'trapdoor grate then the spike bed',
  archetypes: ['gauntlet'],
  phases: HOT,
  difficulty: 7,
  uses: [W10_THEME.trapdoors, TRAP, SPIKES],
  pieces: [bank('a', TRAP_BANK), grate('g', 'a'), trapGap('b', 'a', [300, 340]), spikes('c', 'b', [300, 340]), up('k', 'c', 30, [140, 160]), down('d', 'k', 30, [220, 260])],
  last: 'd',
  sockets: [flag('k', 0.5), petals('b', 'b', 0.5, 1)],
  mirrorable: true,
});
/**
 * 10-6's gates (the Iron Netting, a vine runner): each roll opens one theme, as the other stages' gates do: the chains alone, or the
 * gutter spouts among the swings (and, once World 9's riser lands, the chain lifts and counterweights: GRAB-BAG A, B).
 */
const netGate = (theme: W10Theme, extra: Socket[]): SectionTemplate => {
  const m = merlons('', 'a', 2, [200, 240]);
  return section({
    id: `w10-net-gate-${theme}`,
    name: `the iron netting: ${theme}`,
    archetypes: ['vine_runner'],
    phases: ['start'],
    difficulty: 1,
    teaches: W10_THEME[theme],
    weight: 6,
    pieces: [bank('a', [220, 260]), ...m.pieces],
    last: m.last,
    sockets: [petals('k1', 'k1', 0.5, 1), petals('f1', 'f1', 0.5, 2, 80), petals('k2', 'k2', 0.5, 1), ...extra],
    mirrorable: false,
  });
};
const netGates: SectionTemplate[] = [
  netGate('chains', [scenery('cage', 'a', [0.5, 0.6], 0.9)]),
  netGate('spouts', [scenery('brazier', 'a', [0.5, 0.6], 0.9)]),
  netGate('lifts', [scenery('banner', 'a', [0.5, 0.6], 0.9)]),
  netGate('counterweights', [scenery('rack', 'a', [0.5, 0.6], 0.9)]),
  netGate('gearlifts', [scenery('brazier', 'a', [0.5, 0.6], 0.9)]),
];

/**
 * E. Gutter spouts (10-6's theme, and 10-9's): a stone spout block on the walk, its iron pipe pouring storm water on a beat (zones.ts
 * 'bolt', look 'gush'; GUSH; w10DropArt.ts). It gurgles and drips first; caught in the gush he is knocked back out, and down if he was
 * jumping: never a heart. Wait on the lip for it to stop. The first one pours over a flat walk, with the line before it.
 */
const gush = (on: string, at: [number, number]): SectionZone => ({ kind: 'bolt', on, at, look: 'gush' });
const spoutFirst = section({
  id: 'w10-spout-first',
  name: 'the first gutter spout',
  archetypes: 'any',
  phases: ['ki', 'sho'],
  difficulty: 3,
  teaches: GUSH,
  uses: [W10_THEME.spouts],
  maxPerStage: 1,
  pieces: [bank('a', [300, 340]), up('k', 'a', 30, [140, 160]), down('b', 'k', 30, [480, 520])],
  zones: [gush('b', [0.42, 0.46])],
  last: 'b',
  sockets: [flag('a', 0.6), tip(GUSH, 'a', 0.2), petals('k', 'k', 0.5, 1), petals('b', 'b', 0.85, 1)],
  mirrorable: false,
});
/** a spout at the lip of a chasm: it pours where he takes off; wait for it to stop, then jump */
const spoutGap = section({
  id: 'w10-spout-gap',
  name: 'gutter spout at the chasm',
  archetypes: 'any',
  phases: LIVE,
  difficulty: 5,
  uses: [W10_THEME.spouts, GUSH],
  pieces: [bank('a', [380, 420]), { ...chasm('b', 'a', [300, 340], [0.6, 0.72]), place: { kind: 'pit', after: 'a', jump: 'jump', share: [0.6, 0.72], soft: true } }, up('k', 'b', 30, [140, 160]), down('c', 'k', 30, [220, 260])],
  zones: [gush('a', [0.86, 0.88])],
  last: 'c',
  sockets: [flag('k', 0.5), petals('b', 'b', 0.5, 1), petals('c', 'c', 0.5, 1)],
  mirrorable: true,
});
/** two spouts on one wall, out of step: through one in its lull, wait between, through the next */
const spoutPair = section({
  id: 'w10-spout-pair',
  name: 'two gutter spouts',
  archetypes: 'any',
  phases: LIVE,
  difficulty: 6,
  uses: [W10_THEME.spouts, GUSH],
  pieces: [bank('a', [600, 640], { kind: 'start' }, { main: false }), up('k', 'a', 30, [140, 160]), down('b', 'k', 30, [300, 340])],
  zones: [gush('a', [0.28, 0.3]), gush('a', [0.74, 0.76])],
  last: 'b',
  sockets: [flag('k', 0.5), petals('a', 'a', 0.52, 1), petals('b', 'b', 0.5, 1)],
  mirrorable: true,
});
/** a spout, then a guard on the far wall (the gauntlet's) */
const spoutGuard = section({
  id: 'w10-spout-guard',
  name: 'gutter spout to the guard arena',
  archetypes: ['gauntlet'],
  phases: MID,
  difficulty: 6,
  uses: [W10_THEME.spouts, GUSH],
  pieces: [bank('a', [380, 420]), { ...chasm('b', 'a', [460, 500], [0.6, 0.72]), place: { kind: 'pit', after: 'a', jump: 'jump', share: [0.6, 0.72], soft: true } }, up('k', 'b', 30, [140, 160]), down('c', 'k', 30, [220, 260])],
  zones: [gush('a', [0.86, 0.88])],
  last: 'c',
  sockets: [flag('k', 0.5), foe('g', 'b', [0.55, 0.65], GUARDS, 3)],
  mirrorable: true,
});
/**
 * L. Lantern sweeps (10-3's own theme): a soldier's lantern on a watchtower sweeps its stretch of wall (watcher.ts, look 'lantern':
 * the storm's watch and its numbers, drawn as a beam from the tower, w10DropArt.ts): get behind the crates as it passes. Its first pass
 * over each stretch only warns; his own line the first time.
 */
const lanternAt = (on: string) => prop('lantern', on, 0.05, ['lantern']);
const lanternWall = section({
  id: 'w10-lantern-wall',
  name: 'lantern-swept wall cover',
  archetypes: ['stealth'],
  phases: MID,
  difficulty: 5,
  weight: 2,
  uses: [W10_THEME.lanterns],
  pieces: [bank('a', [260, 300]), up('k', 'a', 30, [140, 160]), down('wall', 'k', 30, [640, 680]), up('k2', 'wall', 30, [140, 160]), down('b', 'k2', 30, [280, 320])],
  last: 'b',
  sockets: [lanternAt('wall'), hideAt('h1', 'wall', 0.14), petals('w', 'wall', 0.33, 1), hideAt('h2', 'wall', 0.52), hideAt('h3', 'wall', 0.88), petals('k2', 'k2', 0.5, 1)],
  mirrorable: true,
});
/** a swept wall, then a chasm to a guard's wall: hide, cross, fight */
const lanternSteps = section({
  id: 'w10-lantern-steps',
  name: 'lantern-swept wall over a chasm cover',
  archetypes: ['stealth'],
  phases: LIVE,
  difficulty: 6,
  weight: 1,
  uses: [W10_THEME.lanterns],
  pieces: [bank('a', [220, 260]), up('k', 'a', 30, [140, 160]), down('w1', 'k', 30, [400, 440]), chasm('w2', 'w1', [400, 440], [0.66, 0.78]), up('k2', 'w2', 30, [140, 160]), down('b', 'k2', 30, [220, 260])],
  last: 'b',
  sockets: [prop('lanternA', 'w1', 0.05, ['lantern']), hideAt('h1', 'w1', 0.6), petals('k', 'k', 0.5, 1), foe('g', 'w2', [0.55, 0.65], GUARDS, 3, { chance: 0.8 }), petals('k2', 'k2', 0.5, 1)],
  mirrorable: true,
});
/** a swept wall with a guard patrolling the far end: hide from the beam, then the fight */
const lanternGuard = section({
  id: 'w10-lantern-guard',
  name: 'lantern-swept wall and a guard cover',
  archetypes: ['stealth'],
  phases: HOT,
  difficulty: 7,
  weight: 2,
  uses: [W10_THEME.lanterns],
  pieces: [bank('a', [200, 220]), up('k', 'a', 30, [120, 140]), down('wall', 'k', 30, [500, 540]), chasm('b', 'wall', [360, 400]), up('k2', 'b', 30, [120, 140]), down('c', 'k2', 30, [200, 220])],
  last: 'c',
  sockets: [lanternAt('wall'), hideAt('h1', 'wall', 0.2), hideAt('h2', 'wall', 0.62), petals('w', 'wall', 0.42, 1), foe('g', 'b', [0.5, 0.6], GUARDS, 3, { chance: 0.8 }), petals('k2', 'k2', 0.5, 1)],
  mirrorable: true,
});
/**
 * K. Rolling barrels (10-7's own theme): a stack of barrels at the far end of a wall-walk; one rocks (the warning), then rolls the walk's
 * length toward him in 1.2 s (zones.ts 'bolt', look 'barrel'; BARREL_LANE; w10DropArt.ts). Jump it, or be off the walk when it comes. A
 * hit is a heart on Normal and a push on Easy, and never where it is taught. No animal stands on a lane (levelCheck: none in a zone).
 */
const barrels = (on: string, gentle = false): SectionZone => ({ kind: 'bolt', on, at: [0.5, 0.5], look: 'barrel', dir: -1, ...(gentle ? { gentle: true } : {}) });
const barrelFirst = section({
  id: 'w10-barrel-first',
  name: 'the first rolling barrels',
  archetypes: ['purge'],
  phases: ['ki', 'sho'],
  difficulty: 3,
  teaches: BARREL,
  uses: [W10_THEME.barrels],
  maxPerStage: 1,
  pieces: [bank('a', [300, 340]), up('k', 'a', 30, [140, 160]), down('lane', 'k', 30, [520, 560]), up('k2', 'lane', 30, [140, 160]), down('b', 'k2', 30, [240, 280])],
  zones: [barrels('lane', true)],
  last: 'b',
  sockets: [flag('a', 0.6), tip(BARREL, 'a', 0.2), petals('k', 'k', 0.5, 1), petals('k2', 'k2', 0.5, 1)],
  mirrorable: false,
});
/** a long walk with barrels down it, a guard past it */
const barrelRun = section({
  id: 'w10-barrel-run',
  name: 'barrels down the wall-walk',
  archetypes: ['purge'],
  phases: LIVE,
  difficulty: 6,
  uses: [W10_THEME.barrels, BARREL],
  pieces: [bank('a', [240, 280]), up('k', 'a', 30, [140, 160]), down('lane', 'k', 30, [620, 660]), up('k2', 'lane', 30, [140, 160]), down('b', 'k2', 30, [400, 440])],
  zones: [barrels('lane')],
  last: 'b',
  sockets: [flag('k', 0.5), petals('lane', 'lane', 0.5, 1), foe('g', 'b', [0.55, 0.65], GUARDS, 3)],
  mirrorable: true,
});
/** two walks a battlement apart, each with its own barrels out of step */
const barrelSteps = (() => {
  const m = merlons('', 'a', 2, [420, 460]);
  return section({
    id: 'w10-barrel-steps',
    name: 'barrels on two walks',
    archetypes: ['purge'],
    phases: HOT,
    difficulty: 7,
    uses: [W10_THEME.barrels, BARREL],
    pieces: [bank('a', [260, 300]), ...m.pieces],
    zones: [barrels('f1'), barrels('f2')],
    last: m.last,
    sockets: [flag('k1', 0.5), petals('k2', 'k2', 0.5, 1)],
    mirrorable: true,
  });
})();
/** barrels down to a guard's yard: off the lane, the fight */
const barrelYard = section({
  id: 'w10-barrel-yard',
  name: 'barrels to the guard yard arena',
  archetypes: ['purge'],
  phases: MID,
  difficulty: 6,
  uses: [W10_THEME.barrels, BARREL],
  pieces: [bank('a', [220, 240]), up('k', 'a', 30, [120, 140]), down('lane', 'k', 30, [460, 500]), down('s', 'lane', 40, [120, 140]), down('yard', 's', 40, [440, 480]), up('s2', 'yard', 40, [120, 140]), up('b', 's2', 40, [200, 220])],
  zones: [barrels('lane')],
  last: 'b',
  sockets: [flag('k', 0.5), foe('g1', 'yard', [0.45, 0.55], GUARDS, 3), foe('g2', 'yard', [0.8, 0.86], [...GUARDS, ...CATS], 5, { phases: HOT, chance: 0.6 })],
  mirrorable: true,
});
/**
 * A, B, C. World 10's moving platforms on World 9's riser (gen2 place 'raft', lift.ts `bob`; the engine rides them, levelCheck reaches them
 * at both stops, the bots wait for the top): a `raft` bob drawn as the iron-banded plank on its chains (A, 'w10_lift'), two of them half a
 * cycle apart on one chain over a wheel with the counterweight (B, 'w10_cw', w10Game.ts sets the pair's phases), and a `piston` drawn as the
 * stone block on its toothed rack beside the great cog (C, 'w10_gear'); w10PieceArt.ts drawW10Bob. Each first one is over a soft pit with
 * its line before it (Pokey's in 10-1 and 10-3, Dot's in 10-9).
 */
const chainLift = (key: string, after: string, w: W, share: W = [0.55, 0.7], soft = false, style: 'w10_lift' | 'w10_cw' = 'w10_lift'): SectionPiece =>
  ({ key, shape: 'raft', style, w, place: { kind: 'raft', after, bob: 'raft', share, ...(soft ? { soft: true } : {}) }, landing: true });
const offLift = (key: string, after: string, w: W, share: W = [0.55, 0.7], soft = false): SectionPiece =>
  bank(key, w, { kind: 'pit', after, jump: 'jump', share, ...(soft ? { soft: true } : {}) }, { landing: true });
const gearLift = (key: string, after: string, w: W = [110, 130]): SectionPiece => ({ key, shape: 'raft', style: 'w10_gear', w, place: { kind: 'raft', after, bob: 'piston' } });
/** the time model's wait at a moving plank (about a third of its cycle) and a gear lift's ride */
const LIFT_WAIT = 1.2;
const GEAR_RIDE = 2.4;

const liftFirst = section({
  id: 'w10-lift-first',
  name: 'the first chain lift',
  archetypes: ['sprint', 'vine_runner'],
  phases: ['ki', 'sho'],
  difficulty: 3,
  teaches: LIFT,
  uses: [W10_THEME.lifts],
  maxPerStage: 1,
  extraSeconds: LIFT_WAIT * 2,
  pieces: [bank('a', [320, 360]), chainLift('r', 'a', [160, 180], [0.45, 0.55], true), offLift('b', 'r', [300, 340], [0.45, 0.55], true), up('k', 'b', 30, [140, 160]), down('c', 'k', 30, [180, 220])],
  last: 'c',
  sockets: [flag('a', 0.6), tip(LIFT, 'a', 0.2), petals('r', 'r', 0.5, 1), petals('k', 'k', 0.5, 1)],
  mirrorable: false,
});
const liftPair = section({
  id: 'w10-lift-pair',
  name: 'two chain lifts',
  archetypes: ['sprint', 'vine_runner'],
  phases: LIVE,
  difficulty: 5,
  uses: [W10_THEME.lifts, LIFT],
  extraSeconds: LIFT_WAIT * 2,
  pieces: [bank('a', [260, 300]), chainLift('r1', 'a', [150, 170]), chainLift('r2', 'r1', [150, 170]), offLift('b', 'r2', [300, 340]), up('k', 'b', 32, [140, 160]), down('c', 'k', 32, [180, 220])],
  last: 'c',
  sockets: [flag('k', 0.5), petals('r1', 'r1', 0.5, 1), petals('r2', 'r2', 0.5, 1), petals('b', 'b', 0.5, 1)],
  mirrorable: true,
});
const liftRow = section({
  id: 'w10-lift-row',
  name: 'a row of chain lifts',
  archetypes: ['sprint', 'vine_runner'],
  phases: ['sho', 'ten'],
  difficulty: 6,
  uses: [W10_THEME.lifts, LIFT],
  extraSeconds: LIFT_WAIT * 3,
  pieces: [bank('a', [240, 280]), chainLift('r1', 'a', [140, 160]), chainLift('r2', 'r1', [140, 160]), chainLift('r3', 'r2', [140, 160]), offLift('b', 'r3', [320, 360]), up('k', 'b', 30, [140, 160]), down('c', 'k', 30, [160, 200])],
  last: 'c',
  sockets: [flag('k', 0.5), petals('r1', 'r1', 0.5, 1), petals('r2', 'r2', 0.5, 1), petals('r3', 'r3', 0.5, 1)],
  mirrorable: true,
});
/** lifts onto a rod's wall: wait out the plank, then the bolt (10-1's) */
const liftRods = section({
  id: 'w10-lift-rods',
  name: 'chain lifts to a rod',
  archetypes: ['sprint'],
  phases: HOT,
  difficulty: 7,
  uses: [W10_THEME.lifts, LIFT, BOLT],
  extraSeconds: LIFT_WAIT * 2,
  pieces: [bank('a', [240, 280]), chainLift('r1', 'a', [150, 170]), chainLift('r2', 'r1', [150, 170]), offLift('b', 'r2', [420, 460]), up('k', 'b', 32, [140, 160]), down('c', 'k', 32, [200, 240])],
  zones: [rod('b', [0.6, 0.64])],
  last: 'c',
  sockets: [flag('k', 0.5), petals('r1', 'r1', 0.5, 1), petals('r2', 'r2', 0.5, 1), petals('b', 'b', 0.2, 1)],
  mirrorable: true,
});

const cwFirst = section({
  id: 'w10-cw-first',
  name: 'the first counterweight planks',
  archetypes: ['stealth', 'vine_runner'],
  phases: ['ki', 'sho'],
  difficulty: 3,
  teaches: CWEIGHT,
  uses: [W10_THEME.counterweights],
  maxPerStage: 1,
  extraSeconds: LIFT_WAIT * 2,
  pieces: [bank('a', [320, 360]), chainLift('r1', 'a', [150, 170], [0.45, 0.55], true, 'w10_cw'), chainLift('r2', 'r1', [150, 170], [0.45, 0.55], true, 'w10_cw'), offLift('b', 'r2', [300, 340], [0.45, 0.55], true), up('k', 'b', 30, [140, 160]), down('c', 'k', 30, [180, 220])],
  last: 'c',
  sockets: [flag('a', 0.6), tip(CWEIGHT, 'a', 0.2), petals('r1', 'r1', 0.5, 1), petals('r2', 'r2', 0.5, 1), petals('k', 'k', 0.5, 1)],
  mirrorable: false,
});
/** a counterweight pair to a watched wall (10-3: the planks, then hide from the storm) */
const cwStorm = section({
  id: 'w10-cw-storm',
  name: 'counterweight planks to a watched wall cover',
  archetypes: ['stealth'],
  phases: LIVE,
  difficulty: 6,
  weight: 2,
  uses: [W10_THEME.counterweights, CWEIGHT],
  extraSeconds: LIFT_WAIT * 2,
  pieces: [bank('a', [240, 280]), chainLift('r1', 'a', [150, 170], [0.55, 0.7], false, 'w10_cw'), chainLift('r2', 'r1', [150, 170], [0.55, 0.7], false, 'w10_cw'), offLift('wall', 'r2', [560, 600]), up('k', 'wall', 30, [140, 160]), down('c', 'k', 30, [200, 240])],
  last: 'c',
  sockets: [petals('r1', 'r1', 0.5, 1), petals('r2', 'r2', 0.5, 1), storm('wall'), hideAt('h1', 'wall', 0.2), hideAt('h2', 'wall', 0.65), petals('k', 'k', 0.5, 1)],
  mirrorable: true,
});
/** two pairs in a row, a pocket between (10-6, 10-3) */
const cwRow = section({
  id: 'w10-cw-row',
  name: 'two counterweight pairs',
  archetypes: ['stealth', 'vine_runner'],
  phases: ['sho', 'ten'],
  difficulty: 6,
  uses: [W10_THEME.counterweights, CWEIGHT],
  extraSeconds: LIFT_WAIT * 4,
  pieces: [bank('a', [240, 280]), chainLift('r1', 'a', [140, 160], [0.55, 0.7], false, 'w10_cw'), chainLift('r2', 'r1', [140, 160], [0.55, 0.7], false, 'w10_cw'), offLift('p', 'r2', [180, 220]), chainLift('r3', 'p', [140, 160], [0.55, 0.7], false, 'w10_cw'), chainLift('r4', 'r3', [140, 160], [0.55, 0.7], false, 'w10_cw'), offLift('b', 'r4', [260, 300])],
  last: 'b',
  sockets: [flag('a', 0.5), petals('r2', 'r2', 0.5, 1), petals('p', 'p', 0.5, 1), petals('r3', 'r3', 0.5, 1)],
  mirrorable: true,
});

const gearFirst = section({
  id: 'w10-gear-first',
  name: 'the first gear lift',
  archetypes: ['gauntlet', 'vine_runner'],
  phases: ['ki', 'sho'],
  difficulty: 3,
  teaches: GEAR,
  uses: [W10_THEME.gearlifts],
  maxPerStage: 1,
  extraSeconds: GEAR_RIDE,
  pieces: [bank('a', [300, 340]), gearLift('g', 'a'), up('t', 'g', 0, [260, 300]), down('s', 't', 100, [140, 160]), down('c', 's', 110, [220, 260])],
  last: 'c',
  sockets: [flag('a', 0.55), tip(GEAR, 'a', 0.2), petals('t', 't', 0.3, 1), petals('s', 's', 0.5, 1)],
  mirrorable: false,
});
/** two gear lifts: up one to a ledge, along it, up the next, then down the steps */
const gearPair = section({
  id: 'w10-gear-pair',
  name: 'two gear lifts',
  archetypes: ['gauntlet', 'vine_runner'],
  phases: LIVE,
  difficulty: 6,
  uses: [W10_THEME.gearlifts, GEAR],
  extraSeconds: GEAR_RIDE * 2,
  pieces: [bank('a', [260, 300]), gearLift('g1', 'a'), up('t1', 'g1', 0, [220, 260]), gearLift('g2', 't1'), up('t2', 'g2', 0, [240, 280]), down('s1', 't2', 110, [140, 160]), down('s2', 's1', 110, [140, 160]), down('s3', 's2', 100, [140, 160]), down('c', 's3', 100, [200, 240])],
  last: 'c',
  sockets: [flag('a', 0.5), petals('t1', 't1', 0.5, 1), petals('s1', 's1', 0.5, 1), petals('s3', 's3', 0.5, 1)],
  mirrorable: false,
});
/** a gear lift up to a guard's high walk (the gauntlet's) */
const gearGuard = section({
  id: 'w10-gear-guard',
  name: 'gear lift to the guard arena',
  archetypes: ['gauntlet'],
  phases: MID,
  difficulty: 6,
  uses: [W10_THEME.gearlifts, GEAR],
  extraSeconds: GEAR_RIDE,
  pieces: [bank('a', [260, 300]), gearLift('g', 'a'), up('t', 'g', 0, [420, 460]), down('s', 't', 110, [140, 160]), down('c', 's', 110, [220, 260])],
  last: 'c',
  sockets: [flag('a', 0.5), foe('g1', 't', [0.55, 0.65], GUARDS, 3), petals('s', 's', 0.5, 1)],
  mirrorable: false,
});
const W10_RISER_SECTIONS: SectionTemplate[] = [liftFirst, liftPair, liftRow, liftRods, cwFirst, cwStorm, cwRow, gearFirst, gearPair, gearGuard];
const W10_BAG_SECTIONS: SectionTemplate[] = [...W10_RISER_SECTIONS, barrelFirst, barrelRun, barrelSteps, barrelYard, lanternWall, lanternSteps, lanternGuard, ...netGates, spoutFirst, spoutGap, spoutPair, spoutGuard, trapFirst, trapRow, trapGuard, trapSpikes, perchRun, perchClimb, perchRods, ironStair, balconyClimb, towerRun, bridgeFight, bridgePair, bridgeRods, dropFirst, dropRow, dropYard, dropHigh];

// ───────────────────────────── the list ─────────────────────────────

export const W10_GROUND_SECTIONS: SectionTemplate[] = [
  landing,
  wallWalk,
  gateSteps,
  guardRoof,
  gapKnee,
  rise,
  doubleGap,
  highRoad,
  firstRods,
  firstSpikes,
  ...sprintGates,
  rodRow,
  rodGap,
  rodMerlons,
  rodStairs,
  spikeRun,
  spikeMerlon,
  spikeChasm,
  spikeYard,
  rampartGallery,
  rampartTwin,
  rampartStair,
  rampartChasm,
  gustGap,
  gustPair,
  gustRise,
  gustLeap,
  ...stormGates,
  stormWall,
  stormSteps,
  stormGap,
  stormRods,
  stormRampart,
  stormSpikes,
  stormGusts,
  stormRodSteps,
  stormPatrol,
  stormYard,
  ...huntGates,
  guardWall,
  guardYard,
  guardRods,
  harpyWall,
  guardGusts,
  guardRampart,
  wallPatrol,
  towerSteps,
  portcullisYard,
  gatehouseRun,
  drawbridge,
  gateApproach,
  ...W10_BAG_SECTIONS,
];

/** the ids of the required lessons (w10Game.ts W10_REQUIRED) */
export const W10_LESSON_SECTIONS = { rods: firstRods.id, spikes: firstSpikes.id } as const;

/**
 * The sections only some stages of World 10 hold (the rest go where their archetypes, phases and themes allow): the plain start is the
 * vine stage's (the others start at their gate); the lessons are 10-1's.
 */
export const W10_STAGE_ONLY: Readonly<Record<string, readonly number[]>> = {
  [landing.id]: [6],
  [firstRods.id]: [1],
  [firstSpikes.id]: [1],
  // (each stage keeps its own sections, so no 20 s stretch is alike between two of them, curation's --apart: 10-1 the sprint's themes and
  // the shared fillers; 10-3 the storm's watched walls; 10-7 The Walls' arenas, rods and spikes; 10-9 The Fortress Gate's, ramparts,
  // gusts and rods; the rests go everywhere)
  ...Object.fromEntries(
    [gapKnee, rise, doubleGap, highRoad, rodRow, rodGap, rodMerlons, rodStairs, spikeRun, spikeMerlon, spikeChasm, rampartGallery, rampartTwin, rampartStair, rampartChasm, gustGap, gustPair, gustRise, gustLeap].map((s) => [s.id, [1]] as const),
  ),
  ...Object.fromEntries([guardWall, guardYard, spikeYard, harpyWall, wallPatrol, towerSteps].map((s) => [s.id, [7]] as const)),
  ...Object.fromEntries([guardRods, guardGusts, guardRampart, portcullisYard, gatehouseRun, drawbridge, gateApproach].map((s) => [s.id, [9]] as const)),
  // (the purge opens rods or spikes; the gauntlet any of the four: each gate's theme has its own arenas there)
  ...Object.fromEntries(huntGates.filter((g) => g.id.startsWith('w10-hunt-gate-') && !/rods|spikes|towers|bridges|drops|barrels/.test(g.id)).map((g) => [g.id, [] as number[]] as const)),
  ...Object.fromEntries(netGates.map((s) => [s.id, [6]] as const)),
  ...Object.fromEntries([spoutFirst, spoutGap, spoutPair].map((s) => [s.id, [6, 9]] as const)),
  [spoutGuard.id]: [9],
  ...Object.fromEntries([lanternWall, lanternSteps, lanternGuard].map((s) => [s.id, [3]] as const)),
  ...Object.fromEntries([barrelFirst, barrelRun, barrelSteps, barrelYard].map((s) => [s.id, [7]] as const)),
  // (the moving platforms: each taught in its own stage, and all three again in 10-6, the Iron Netting's own themes)
  ...Object.fromEntries([liftFirst, liftPair, liftRow].map((s) => [s.id, [1, 6]] as const)),
  [liftRods.id]: [1],
  ...Object.fromEntries([cwFirst, cwRow].map((s) => [s.id, [3, 6]] as const)),
  [cwStorm.id]: [3],
  ...Object.fromEntries([gearFirst, gearPair].map((s) => [s.id, [6, 9]] as const)),
  [gearGuard.id]: [9],
  ...Object.fromEntries([trapFirst, trapRow, trapGuard, trapSpikes].map((s) => [s.id, [9]] as const)),
  // (the grab bag's themes: the perches are 10-1's, the towers and bridges 10-7's; no other stage opens them)
  ...Object.fromEntries(huntGates.filter((g) => g.id.startsWith('w10-fight-gate-') && /-(perches|towers|bridges|drops|chains|lanterns|barrels|lifts|counterweights)$/.test(g.id)).map((g) => [g.id, [] as number[]] as const)),
  ...Object.fromEntries([perchRun, perchClimb, perchRods].map((s) => [s.id, [1]] as const)),
  ...Object.fromEntries([ironStair, balconyClimb, towerRun, bridgeFight, bridgePair, bridgeRods, dropFirst, dropRow, dropYard, dropHigh].map((s) => [s.id, [7]] as const)),
};
