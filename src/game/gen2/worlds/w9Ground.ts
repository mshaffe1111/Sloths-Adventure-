/**
 * gen2/worlds/w9Ground — World 9's ground building blocks (DESIGN.md B9): the basalt every stage shares, the geysers (9-1 teaches them), the
 * lava chasms, the cracked basalt over the cooled channels, the watched doorstep of 9-4, the warm air of 9-5 Vent Riding, the hunters of
 * 9-6 Ash Fields and 9-9 The Drake's Hoard, and the ledges of 9-8 Pell's Thread. The swings over the lava (9-3 Ember Canopy) and the
 * puzzle rooms are the swing builder's (gen2-w9-swing), on the same manifest (w9.ts).
 *
 * Beats. Every beat is ground the route really crosses (STAGE-RULES §6): a basalt step up (a step down is a walk), a chasm jumped, a geyser
 * waited out, an animal, a glide, the watcher's pass. No flat runs much over 400 px without one, so nothing is quiet for 2 s on Normal.
 * Every rise is one hop, every gap a share of the jump the difficulty allows.
 *
 * Falls (w9.ts header): a chasm is lava on Normal (a life), so a plain chasm is a third to a little over half of the jump envelope (`lava`,
 * STAGE-RULES §6), and the basalt between two chasms is 360 px or more (the leaf carries him over a shorter one and both chasms: the
 * glide trap, World 6's lesson). Wide (`wide`) and second-jump (`leap`) gaps keep a soft crust floor on every setting (w9Falls marks the
 * second-jump ones; `wide` is soft by its rule).
 *
 * Geysers (w9.ts emitters): a `geyser` prop socket lays a column over its piece. Two columns on one flat stand 200 px or more apart (the
 * check's safe pocket is 110 px between their edges); an animal never stands on a flat with a geyser (nothing stands in a zone), so the
 * geysers' flats are the geysers' and the animals have their own.
 *
 * Variety (STAGE-RULES §6: "a different mix of actions, not a different order"): each stage's gate opens one of its themes (W9_THEME), and
 * the themed sections `use` it; the themes lean on different heavy beats (geysers, chasms, animals, the cracked basalt, the glides).
 */
import { CRUMBLE_TILE_W } from '../../zones.ts';
import type { Phase, SectionPiece, SectionTemplate, Socket } from '../types.ts';
import { W9_LESSON } from './w9.ts';

// ───────────────────────────── the themes ─────────────────────────────

export const W9_THEME = {
  /** 9-1: the geysers' fields */
  vents: 'w9:t-vents',
  /** 9-1: the lava chasms, rising and falling basalt */
  chasms: 'w9:t-chasms',
  /** 9-1: the cracked basalt over the cooled channels */
  basalt: 'w9:t-basalt',
  /** 9-4: the watched doorstep among the obsidian spires */
  spires: 'w9:t-spires',
  /** 9-4: the watched doorstep in the ash ferns, with geysers */
  ferns: 'w9:t-ferns',
  /** 9-5: glides over the vents */
  glides: 'w9:t-glides',
  /** 9-5: a run of geysers between the glides */
  bursts: 'w9:t-bursts',
  /** 9-6 / 9-9: the cats */
  cats: 'w9:t-cats',
  /** 9-6 / 9-9: the harpies on the ash fields */
  harpies: 'w9:t-harpies',
  /** 9-6 / 9-9: the boas among the geysers */
  boas: 'w9:t-boas',
  /** 9-8: the high ledges */
  ledges: 'w9:t-ledges',
  /** 9-8: the cooled channels */
  channels: 'w9:t-channels',
} as const;
export type W9Theme = (typeof W9_THEME)[keyof typeof W9_THEME];

/** the weight of a section every roll may hold (the theme's weigh 1) */
const SHARED = 0.3;

// ───────────────────────────── helpers ─────────────────────────────

type Opt = Partial<Socket>;
type W = SectionPiece['w'];
const LIVE: Phase[] = ['sho', 'ten', 'ketsu'];
const HOT: Phase[] = ['ten', 'ketsu'];
const MID: Phase[] = ['ki', 'sho', 'ten'];
const ALL: Phase[] = ['ki', 'sho', 'ten', 'ketsu'];

const bank = (key: string, w: W, place: SectionPiece['place'] = { kind: 'start' }, o: Partial<SectionPiece> = {}): SectionPiece => ({ key, shape: 'bank', w, place, ...o });
/** a basalt step up `dy` px (a hop) or down (a walk) */
const up = (key: string, after: string, dy: number, w: W): SectionPiece => bank(key, w, { kind: 'walk', after, dy: -dy });
const down = (key: string, after: string, dy: number, w: W): SectionPiece => bank(key, w, { kind: 'walk', after, dy });
/** a lava chasm jumped: a third to a little over half of the envelope (a life on Normal) */
const lava = (key: string, after: string, w: W, share: W = [0.36, 0.56], landing = false): SectionPiece =>
  bank(key, w, { kind: 'pit', after, jump: 'jump', share }, landing ? { landing } : {});
/** a lava chasm up or down a step: a jump with a rise */
const lavaUp = (key: string, after: string, dy: W, w: W, share: W = [0.4, 0.58]): SectionPiece => bank(key, w, { kind: 'jump', after, dy, share }, { landing: true });
/** a wide chasm with a soft crust floor: the jump's own width (a real jump, never a life) */
const wide = (key: string, after: string, w: W, share: W = [0.76, 0.92]): SectionPiece => bank(key, w, { kind: 'pit', after, jump: 'jump', share, soft: true }, { landing: true });
/** a wide chasm crossed with the second jump, soft (w9Falls) */
const leap = (key: string, after: string, w: W, share: W = [0.5, 0.72]): SectionPiece => bank(key, w, { kind: 'pit', after, jump: 'double', share }, { landing: true });
/** a chasm only the leaf crosses (pipeline glideGap), soft and climbing back to the take-off (w9Falls) */
const glide = (key: string, after: string, w: W, share: W = [0.62, 0.8]): SectionPiece => bank(key, w, { kind: 'pit', after, jump: 'glide', share }, { landing: true });
/** n basalt knobs after `after`: up onto each, down to a flat of `flat` px (keys `${p}k1`, `${p}f1`, ...) */
function knobs(p: string, after: string, n: number, flat: W, dy: [number, number] = [30, 40], knobW: W = [140, 170]): { pieces: SectionPiece[]; last: string } {
  const out: SectionPiece[] = [];
  let prev = after;
  for (let i = 1; i <= n; i++) {
    const h = Math.round(dy[0] + ((dy[1] - dy[0]) * (i % 3)) / 2);
    out.push(up(`${p}k${i}`, prev, h, knobW), down(`${p}f${i}`, `${p}k${i}`, h, flat));
    prev = `${p}f${i}`;
  }
  return { pieces: out, last: prev };
}

/** a cooled channel's depth under the basalt, and its hop out (one plain hop on Easy) */
const CHANNEL = { depth: 120, step: 60, stepW: 100 } as const;
const SLAB = 160;
/** the knob in a channel's floor */
const KNOB = 140;
/**
 * A cooled channel after `after` with runs of cracked basalt slabs over it at the floor's height (World 7's crumbling tiles: never
 * needed, a hurry over), a solid slab between two runs, and the floor on past it (`${p}b`, level with `after`). The channel's floor
 * (`${p}ch`) runs under them all, then a step (`${p}s`) and the floor.
 */
function channel(p: string, after: string, runs: number[], bW: W = [200, 240]): { pieces: SectionPiece[]; last: string } {
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
      // (a stair, World 7's: every second slab of a run up a step (40 px) and back down, so the hurry over them is hops, not a walk)
      const dy = i % 2 === 1 ? -40 : i > 0 ? 40 : 0;
      out.push({ key: k, shape: 'block', w: CRUMBLE_TILE_W, h: 26, place: { kind: 'over', on: prev, at: 1, dy }, crumble: true });
      prev = k;
      span += CRUMBLE_TILE_W;
    }
    // (a run of even length ends on its raised slab: one more back down, so it meets the slab or the floor level)
    if (count % 2 === 0) {
      const k = `${p}t${++n}`;
      out.push({ key: k, shape: 'block', w: CRUMBLE_TILE_W, h: 26, place: { kind: 'over', on: prev, at: 1, dy: 40 }, crumble: true });
      prev = k;
      span += CRUMBLE_TILE_W;
    }
  });
  // (the floor is two stretches with a knob between, a hop under the slabs: a long flat with nothing on it reads quiet)
  const half = Math.round((span - KNOB) / 2);
  out.unshift(
    down(`${p}ch`, after, CHANNEL.depth, half),
    up(`${p}chk`, `${p}ch`, 30, KNOB),
    down(`${p}ch2`, `${p}chk`, 30, span - KNOB - half),
    up(`${p}s`, `${p}ch2`, CHANNEL.step, CHANNEL.stepW),
    up(`${p}b`, `${p}s`, CHANNEL.step, bW),
  );
  return { pieces: out, last: `${p}b` };
}

const petals = (id: string, on: string, t: Socket['t'], count = 2, span = 120, o: Opt = {}): Socket => ({ id, role: 'pickup', on, t, dn: 34, count, span, ...o });
const prop = (id: string, on: string, t: Socket['t'], allow: string[], o: Opt = {}): Socket => ({ id, role: 'prop', on, t, allow, ...o });
/** a geyser over its piece (the lesson's, by its id, waits longer: w9.ts geyserBeat); Easy keeps every geyser (it is the world's beat) */
const geyser = (id: string, on: string, t: Socket['t']) => prop(id, on, t, ['geyser'], { easy: 'keep' });
/** a vent in the chasm after `on` (its emitter finds the chasm's floor past the lip: w9.ts) */
const vent = (id: string, on: string) => prop(id, on, 1, ['vent'], { easy: 'keep' });
const hideAt = (id: string, on: string, t: Socket['t'] = 0.5) => prop(id, on, t, ['hide', 'cover']);
/** the watched stretch over its own piece (w9.ts: the eagle over the doorstep) */
const watch = (on: string, t: Socket['t'] = 0.03, id = 'watch') => prop(id, on, t, ['watch']);
const scenery = (id: string, on: string, t: Socket['t'], chance = 0.6) => prop(id, on, t, ['scenery'], { chance });
const flag = (on: string, t: Socket['t']): Socket => ({ id: 'flag', role: 'flag', on, t });
const tip = (mechanic: string, on: string, t: Socket['t'] = 0.15, id = `tip-${mechanic}`): Socket => ({ id, role: 'tip', on, t, allow: [mechanic] });
const foe = (id: string, on: string, t: Socket['t'], kinds: string[], max: number, o: Opt = {}): Socket => ({ id, role: 'enemy', on, t, allow: kinds, maxThreat: max, easy: 'soften', ...o });
/** one of Pell's threads (9-8: the pipeline fills as many as the node's quota asks, the rest stay empty) */
const thread = (id: string, on: string, t: Socket['t'] = 0.5): Socket => ({ id, role: 'objective', on, t, dn: 30 });

const CATS = ['ocelot', 'jaguar'];
const SMALL = ['ocelot', 'tayra'];
const ANY = ['ocelot', 'jaguar', 'tayra', 'boa'];

const midOf = (w: W) => (typeof w === 'number' ? w : (w[0] + w[1]) / 2);

/**
 * Where a section's flag goes when it has none of its own: the middle of its widest main bank with no animal and no geyser on it, and back
 * from a lip (a respawn at a lip went straight back in: World 6's lesson); never a channel floor
 */
function safeFlag(pieces: SectionPiece[], sockets: Socket[], first: string, last: string, mirrorable: boolean): Socket {
  const busy = new Set(sockets.filter((k) => k.role === 'enemy' || k.allow?.includes('geyser')).map((k) => k.on));
  const banks = pieces.filter((p) => p.main !== false && p.shape === 'bank' && !/ch2?$/.test(p.key) && !busy.has(p.key));
  const pool = banks.length ? banks : pieces.filter((p) => p.shape === 'bank');
  const gapped = (k: string) => pieces.some((q) => (q.place.kind === 'pit' || q.place.kind === 'jump' || q.place.kind === 'double') && q.place.after === k);
  const after = (p: SectionPiece) => p.key === last || gapped(p.key);
  const before = (p: SectionPiece) => p.key === first || p.place.kind === 'pit' || p.place.kind === 'jump' || p.place.kind === 'double';
  const spot = (p: SectionPiece): { t: number; room: number } => {
    const w = midOf(p.w);
    if (mirrorable) return before(p) || after(p) ? { t: 0.5, room: w / 2 } : { t: 0.5, room: 999 };
    return after(p) ? { t: 0.3, room: 0.7 * w } : { t: 0.5, room: 999 };
  };
  const score = (p: SectionPiece) => Math.min(spot(p).room, 300) + midOf(p.w) / 10;
  const p = [...pool].sort((a, b) => score(b) - score(a))[0];
  return flag(p.key, spot(p).t);
}

/** the bones every section shares (and a safe flag, unless it names its own) */
const section = (s: Omit<SectionTemplate, 'entry' | 'exit' | 'exitDy'> & { exitDy?: number; first?: string; last: string }): SectionTemplate => {
  const { first, last, exitDy, ...rest } = s;
  const flagged = rest.sockets.some((k) => k.role === 'flag') ? rest.sockets : [...rest.sockets, safeFlag(rest.pieces, rest.sockets, first ?? rest.pieces[0].key, last, rest.mirrorable)];
  return { ...rest, sockets: flagged, entry: { piece: first ?? s.pieces[0].key, kind: 'ground' }, exit: { piece: last, kind: 'ground' }, exitDy: exitDy ?? 0 };
};

const GEYSER = W9_LESSON.geyser;
/** a geyser's wait, for the time model: the quiet spell he may land in the middle of, about half its cycle */
const GEYSER_WAIT = 1.6;

// ───────────────────────────── every stage: the start, the rests, the shrine's approach ─────────────────────────────

const landingK = knobs('', 'a', 2, [200, 240]);
/** the start of a stage with no gate (9-3): a plain basalt run over two knobs, nothing that can hurt */
const landing = section({
  id: 'w9-landing',
  name: 'basalt landing',
  archetypes: 'any',
  phases: ['start'],
  difficulty: 1,
  pieces: [bank('a', [200, 240]), ...landingK.pieces],
  last: landingK.last,
  sockets: [scenery('ohia', 'a', [0.4, 0.6], 0.8), petals('k1', 'k1', 0.5, 1), petals('f1', 'f1', 0.5, 2, 80), petals('k2', 'k2', 0.5, 1)],
  mirrorable: true,
});

/** a staircase of basalt, up two and down two, a flag at the top */
const restSteps = section({
  id: 'w9-rest-steps',
  name: 'basalt steps',
  archetypes: 'any',
  phases: ['rest', 'goal'],
  difficulty: 1,
  pieces: [bank('a', [180, 220]), up('r1', 'a', 34, [160, 190]), up('r2', 'r1', 30, [220, 260]), down('r3', 'r2', 30, [180, 210]), up('k', 'r3', 30, [150, 170]), down('c', 'k', 64, [150, 180])],
  last: 'c',
  sockets: [petals('r1', 'r1', 0.5, 1), flag('r2', 0.5), petals('r3', 'r3', 0.5, 1), petals('k', 'k', 0.5, 1), scenery('log', 'c', [0.4, 0.6])],
  mirrorable: false,
});

const ohiaK = knobs('', 'a', 2, [170, 200]);
/** a quiet run under the young ohia trees over two knobs, a flag between (a breather that still has a hop in it) */
const restOhia = section({
  id: 'w9-rest-ohia',
  name: 'ohia rest',
  archetypes: 'any',
  phases: ['rest', 'goal'],
  difficulty: 1,
  pieces: [bank('a', [180, 220]), ...ohiaK.pieces],
  last: ohiaK.last,
  sockets: [scenery('ohia', 'a', [0.3, 0.5], 1), petals('k1', 'k1', 0.5, 1), flag('f1', 0.55), petals('k2', 'k2', 0.5, 1), scenery('smoke', 'f2', [0.5, 0.7], 0.5)],
  mirrorable: true,
});

// ───────────────────────────── shared Ki to Ketsu (they weigh little) ─────────────────────────────

/** a lava chasm and a knob past it (the filler every theme keeps) */
const lavaHop = section({
  id: 'w9-lava-hop',
  name: 'lava chasm',
  archetypes: 'any',
  phases: ALL,
  difficulty: 4,
  weight: SHARED,
  pieces: [bank('a', [300, 340]), lava('b', 'a', [300, 340]), up('k', 'b', 34, [140, 160]), down('c', 'k', 34, [180, 220])],
  last: 'c',
  sockets: [petals('a', 'a', 0.5, 2, 80), petals('b', 'b', 0.5, 1), petals('k', 'k', 0.5, 1), scenery('smoke', 'c', [0.4, 0.6], 0.5)],
  mirrorable: true,
});

/** a step up out of a chasm onto higher basalt (one jump with a rise), a knob, a chasm back down */
const lavaRise = section({
  id: 'w9-lava-rise',
  name: 'chasm up and down',
  archetypes: 'any',
  phases: MID,
  difficulty: 5,
  weight: SHARED,
  pieces: [bank('a', [360, 400]), lavaUp('b', 'a', [-56, -44], [380, 420]), up('k', 'b', 30, [140, 160]), down('b2', 'k', 30, [200, 240]), lava('c', 'b2', [380, 420], [0.36, 0.5])],
  last: 'c',
  sockets: [petals('a', 'a', 0.45, 2, 90), petals('k', 'k', 0.5, 1), petals('b2', 'b2', 0.5, 1), foe('foe', 'c', [0.5, 0.6], ANY, 3, { phases: HOT, chance: 0.6 })],
  mirrorable: true,
});

/** a wide crust chasm (a real jump, soft), then a second-jump chasm (soft) */
const crustGaps = section({
  id: 'w9-crust-gaps',
  name: 'crust chasms',
  archetypes: 'any',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  weight: SHARED,
  pieces: [bank('a', [260, 300]), wide('b', 'a', [300, 340]), leap('c', 'b', [300, 340]), up('k', 'c', 32, [140, 160]), down('d', 'k', 32, [160, 200])],
  last: 'd',
  sockets: [petals('a', 'a', 0.5, 1), petals('b', 'b', 0.5, 2, 90), foe('foe', 'c', [0.5, 0.6], SMALL, 3, { phases: HOT, chance: 0.6 }), petals('k', 'k', 0.5, 1)],
  mirrorable: true,
});

/** a step down to lower basalt, a knob, a chasm along it */
const lavaDrop = section({
  id: 'w9-lava-drop',
  name: 'down to the chasm',
  archetypes: 'any',
  phases: MID,
  difficulty: 4,
  weight: SHARED,
  pieces: [bank('a', [220, 260]), down('b', 'a', 48, [200, 240]), up('k', 'b', 32, [140, 160]), down('b2', 'k', 32, [380, 420]), lava('c', 'b2', [380, 420])],
  last: 'c',
  exitDy: 48,
  sockets: [petals('b', 'b', 0.5, 1), petals('k', 'k', 0.5, 1), foe('foe', 'b2', [0.5, 0.6], SMALL, 3, { phases: LIVE, chance: 0.6 }), scenery('log', 'c', [0.4, 0.6], 0.5)],
  mirrorable: false,
});

// ───────────────────────────── the geysers ─────────────────────────────

/**
 * 9-1's lesson, on every roll of 9-1 (w9Game W9_REQUIRED): a wide flat with one geyser on a long quiet spell in the middle, Dot's line on
 * the way in, petals either side of it (wait, then walk past it), nothing else that can hurt
 */
const firstGeyser = section({
  id: 'w9-first-geyser',
  name: 'the first geyser',
  archetypes: 'any',
  phases: ['ki'],
  difficulty: 2,
  teaches: GEYSER,
  maxPerStage: 1,
  extraSeconds: GEYSER_WAIT * 2,
  pieces: [bank('a', [200, 240]), up('k', 'a', 30, [140, 160]), down('field', 'k', 30, [560, 600]), up('k2', 'field', 30, [140, 160]), down('b', 'k2', 30, [200, 240])],
  last: 'b',
  sockets: [tip(GEYSER, 'a', 0.2), petals('k', 'k', 0.5, 1), geyser('geyserLesson', 'field', 0.5), petals('p1', 'field', 0.2, 1), petals('p2', 'field', 0.8, 1), petals('k2', 'k2', 0.5, 1)],
  mirrorable: false,
});

/** two geysers on one flat, a knob after */
const geyserPair = section({
  id: 'w9-geyser-pair',
  name: 'two geysers',
  archetypes: 'any',
  phases: ALL,
  difficulty: 5,
  uses: [GEYSER],
  extraSeconds: GEYSER_WAIT * 2,
  pieces: [bank('a', [200, 240]), up('k', 'a', 32, [140, 160]), down('field', 'k', 32, [560, 600]), up('k2', 'field', 36, [140, 160]), down('b', 'k2', 36, [200, 240])],
  last: 'b',
  sockets: [petals('k', 'k', 0.5, 1), geyser('g1', 'field', 0.3), geyser('g2', 'field', 0.72), petals('mid', 'field', 0.51, 1), petals('k2', 'k2', 0.5, 1)],
  mirrorable: true,
});

/** three geysers in a row on a long flat, a petal in each pocket */
const geyserRow = section({
  id: 'w9-geyser-row',
  name: 'a row of geysers',
  archetypes: 'any',
  phases: HOT,
  difficulty: 7,
  uses: [GEYSER],
  extraSeconds: GEYSER_WAIT * 3,
  pieces: [bank('a', [200, 240]), up('k', 'a', 34, [140, 160]), down('field', 'k', 34, [760, 800]), up('k2', 'field', 30, [140, 160]), down('b', 'k2', 30, [180, 220])],
  last: 'b',
  sockets: [geyser('g1', 'field', 0.2), geyser('g2', 'field', 0.5), geyser('g3', 'field', 0.8), petals('p1', 'field', 0.35, 1), petals('p2', 'field', 0.65, 1), petals('k2', 'k2', 0.5, 1)],
  mirrorable: true,
});

/** a geyser at the near lip of a lava chasm and another past the far one: wait, then run and jump */
const geyserChasm = section({
  id: 'w9-geyser-chasm',
  name: 'geysers either side of a chasm',
  archetypes: 'any',
  phases: LIVE,
  difficulty: 7,
  uses: [GEYSER],
  extraSeconds: GEYSER_WAIT * 2,
  pieces: [bank('a', [420, 460]), lava('b', 'a', [420, 460], [0.36, 0.5]), up('k', 'b', 30, [140, 160]), down('c', 'k', 30, [200, 240])],
  last: 'c',
  sockets: [geyser('g1', 'a', 0.72), petals('a', 'a', 0.3, 1), geyser('g2', 'b', 0.3), petals('b', 'b', 0.7, 1), petals('k', 'k', 0.5, 1)],
  mirrorable: true,
});

/** up a step onto a ledge with a geyser on it, and down the far side over a knob */
const geyserLedge = section({
  id: 'w9-geyser-ledge',
  name: 'geyser on the ledge',
  archetypes: 'any',
  phases: LIVE,
  difficulty: 6,
  uses: [GEYSER],
  extraSeconds: GEYSER_WAIT,
  pieces: [bank('a', [240, 280]), up('ledge', 'a', 56, [440, 480]), down('b', 'ledge', 28, [180, 220]), up('k', 'b', 34, [140, 160]), down('c', 'k', 62, [220, 260])],
  last: 'c',
  sockets: [petals('a', 'a', 0.5, 1), geyser('g', 'ledge', 0.5), petals('l1', 'ledge', 0.15, 1), petals('l2', 'ledge', 0.85, 1), petals('k', 'k', 0.5, 1), scenery('ohia', 'c', [0.5, 0.7], 0.5)],
  exitDy: 0,
  mirrorable: true,
});

// ───────────────────────────── the cracked basalt ─────────────────────────────

const ch1 = channel('', 'a', [3]);
/** a cooled channel with a run of cracked slabs over it: hurry across, or drop in and hop out the far side */
const basaltRun = section({
  id: 'w9-basalt-run',
  name: 'cracked basalt',
  archetypes: 'any',
  phases: MID,
  difficulty: 4,
  teaches: W9_LESSON.basalt,
  maxPerStage: 2,
  pieces: [bank('a', [240, 280]), ...ch1.pieces],
  last: ch1.last,
  sockets: [tip(W9_LESSON.basalt, 'a', 0.2), petals('t2', 't2', 0.5, 1, 0, { dn: 40 }), petals('ch', 'ch', 0.5, 2, 90), scenery('smoke', 'b', [0.5, 0.7], 0.5)],
  mirrorable: false,
});

const ch2 = channel('', 'a', [3, 2]);
/** a longer channel: two runs of cracked slabs with a solid slab between, an animal on the channel floor */
const basaltTwin = section({
  id: 'w9-basalt-twin',
  name: 'two runs of cracked basalt',
  archetypes: 'any',
  phases: LIVE,
  difficulty: 6,
  uses: [W9_LESSON.basalt],
  pieces: [bank('a', [240, 280]), ...ch2.pieces],
  last: ch2.last,
  sockets: [petals('t2', 't2', 0.5, 1, 0, { dn: 40 }), petals('slab', 'slab1', 0.5, 1, 0, { dn: 40 }), foe('foe', 'ch', [0.45, 0.55], SMALL, 3, { phases: HOT, chance: 0.6 }), petals('t4', 't4', 0.5, 1, 0, { dn: 40 })],
  mirrorable: true,
});

// ───────────────────────────── the hunters (every stage's later nodes; the arena's bread and butter) ─────────────────────────────

const huntK = knobs('', 'a', 2, [440, 470]);
/** a long basalt run over two knobs with hunters along it */
const hunterRun = section({
  id: 'w9-hunter-run',
  name: 'hunters on the basalt',
  archetypes: 'any',
  phases: LIVE,
  difficulty: 5,
  weight: SHARED,
  pieces: [bank('a', [440, 470]), ...huntK.pieces],
  last: huntK.last,
  sockets: [foe('f1', 'a', [0.5, 0.6], SMALL, 3), petals('k1', 'k1', 0.5, 1), foe('f2', 'f1', [0.45, 0.55], ANY, 3, { phases: LIVE, chance: 0.7 }), petals('k2', 'k2', 0.5, 1), foe('f3', 'f2', [0.5, 0.6], CATS, 5, { phases: HOT, chance: 0.6 })],
  mirrorable: true,
});

/** a cat on the near side of a chasm and a tayra on the far one */
const catChasm = section({
  id: 'w9-cat-chasm',
  name: 'cats either side of a chasm',
  archetypes: 'any',
  phases: LIVE,
  difficulty: 6,
  weight: SHARED,
  pieces: [bank('a', [520, 560]), lava('b', 'a', [480, 520], [0.38, 0.52]), up('k', 'b', 30, [140, 160]), down('c', 'k', 30, [200, 240])],
  last: 'c',
  sockets: [foe('cat', 'a', [0.4, 0.5], CATS, 5), petals('a', 'a', 0.85, 1), foe('small', 'b', [0.45, 0.55], SMALL, 3, { phases: HOT, chance: 0.7 }), petals('k', 'k', 0.5, 1)],
  mirrorable: true,
});

// ───────────────────────────── 9-1 Pepper Air's gates and themes ─────────────────────────────

/** a sprint gate (9-1): a plain run, nothing that can hurt, and the roll's theme opens */
const sprintGate = (theme: 'vents' | 'chasms' | 'basalt', name: string, extra: Socket[] = []): SectionTemplate => {
  const k = knobs('', 'a', 2, [200, 240]);
  return section({
    id: `w9-pepper-gate-${theme}`,
    name: `pepper air: ${name} (gate)`,
    archetypes: ['sprint'],
    phases: ['start'],
    difficulty: 1,
    teaches: W9_THEME[theme],
    weight: 6,
    pieces: [bank('a', [220, 260]), ...k.pieces],
    last: k.last,
    sockets: [petals('k1', 'k1', 0.5, 1), petals('f1', 'f1', 0.5, 2, 80), petals('k2', 'k2', 0.5, 1), ...extra],
    mirrorable: false,
  });
};
const pepperGates = [
  sprintGate('vents', 'the vent fields', [scenery('smoke', 'a', [0.5, 0.6], 0.9)]),
  sprintGate('chasms', 'the chasms', [scenery('ohia', 'a', [0.5, 0.6], 0.9)]),
  sprintGate('basalt', 'the cracked basalt', [scenery('log', 'a', [0.5, 0.6], 0.9)]),
];

const ventFieldK = knobs('', 'f', 1, [200, 240]);
/** vents: a geyser on each of two flats over a knob, a petal by each */
const ventField = section({
  id: 'w9-vent-field',
  name: 'vent field',
  archetypes: ['sprint'],
  phases: ALL,
  difficulty: 6,
  uses: [W9_THEME.vents, GEYSER],
  extraSeconds: GEYSER_WAIT * 2,
  pieces: [bank('a', [180, 220]), up('k', 'a', 32, [140, 160]), down('f', 'k', 32, [380, 420]), ...ventFieldK.pieces, up('k9', ventFieldK.last, 30, [140, 160]), down('g', 'k9', 30, [380, 420])],
  last: 'g',
  sockets: [geyser('g1', 'f', 0.5), petals('k', 'k', 0.5, 1), petals('k1', 'k1', 0.5, 1), geyser('g2', 'g', 0.5), petals('k9', 'k9', 0.5, 1)],
  mirrorable: true,
});

/** vents: a geyser on a ledge over a chasm's far side: land, wait, go */
const ventLanding = section({
  id: 'w9-vent-landing',
  name: 'chasm to a vent',
  archetypes: ['sprint'],
  phases: LIVE,
  difficulty: 7,
  uses: [W9_THEME.vents, GEYSER],
  extraSeconds: GEYSER_WAIT,
  pieces: [bank('a', [380, 420]), lava('b', 'a', [520, 560], [0.36, 0.5], true), up('k', 'b', 30, [140, 160]), down('c', 'k', 30, [200, 240])],
  last: 'c',
  sockets: [petals('a', 'a', 0.5, 1), geyser('g', 'b', 0.62), petals('b', 'b', 0.25, 1), petals('k', 'k', 0.5, 1)],
  mirrorable: true,
});

const chasmStepsK = knobs('', 'c', 1, [380, 420]);
/** chasms: three chasms with a rise and a fall, basalt of 360+ between */
const chasmChain = section({
  id: 'w9-chasm-chain',
  name: 'three chasms',
  archetypes: ['sprint'],
  phases: ALL,
  difficulty: 7,
  uses: [W9_THEME.chasms],
  pieces: [bank('a', [360, 400]), lava('b', 'a', [380, 420]), lavaUp('c', 'b', [-48, -36], [380, 420]), ...chasmStepsK.pieces, lava('d', chasmStepsK.last, [380, 420], [0.38, 0.54])],
  last: 'd',
  sockets: [petals('b', 'b', 0.5, 1), petals('c', 'c', 0.5, 1), petals('k1', 'k1', 0.5, 1), foe('foe', 'd', [0.5, 0.6], SMALL, 3, { phases: HOT, chance: 0.5 })],
  exitDy: -42,
  mirrorable: false,
});

/** chasms: a wide crust chasm then a lava chasm down a step, a cat on the low side */
const chasmDrop = section({
  id: 'w9-chasm-drop',
  name: 'wide chasm and a drop',
  archetypes: ['sprint'],
  phases: ALL,
  difficulty: 6,
  uses: [W9_THEME.chasms],
  pieces: [bank('a', [360, 400]), wide('b', 'a', [380, 420]), lavaUp('c', 'b', [40, 56], [520, 560], [0.38, 0.52])],
  last: 'c',
  exitDy: 48,
  sockets: [petals('a', 'a', 0.5, 1), petals('b', 'b', 0.5, 2, 90), foe('cat', 'c', [0.5, 0.6], CATS, 5, { phases: LIVE, chance: 0.7 })],
  mirrorable: false,
});

const bas3 = channel('', 'a', [3, 3]);
/** basalt: a long run of cracked slabs over the channel */
const basaltLong = section({
  id: 'w9-basalt-long',
  name: 'long cracked run',
  archetypes: ['sprint', 'relic_hunt'],
  phases: LIVE,
  difficulty: 6,
  uses: [W9_THEME.basalt, W9_LESSON.basalt],
  pieces: [bank('a', [240, 280]), ...bas3.pieces],
  last: bas3.last,
  sockets: [petals('t2', 't2', 0.5, 1, 0, { dn: 40 }), petals('t3', 't3', 0.5, 1, 0, { dn: 40 }), foe('foe', 'ch', [0.4, 0.6], SMALL, 3, { phases: HOT, chance: 0.6 }), scenery('log', 'b', [0.5, 0.7], 0.6)],
  mirrorable: true,
});

const bas4 = channel('x', 'b', [2, 3]);
/** basalt: a lava chasm, then a channel with two runs of slabs */
const basaltChasm = section({
  id: 'w9-basalt-chasm',
  name: 'chasm and cracked basalt',
  archetypes: ['sprint', 'relic_hunt'],
  phases: LIVE,
  difficulty: 7,
  uses: [W9_THEME.basalt, W9_LESSON.basalt],
  pieces: [bank('a', [360, 400]), lava('b', 'a', [380, 420]), ...bas4.pieces],
  last: bas4.last,
  sockets: [petals('a', 'a', 0.5, 1), petals('t1', 'xt1', 0.5, 1, 0, { dn: 40 }), petals('slab', 'xslab1', 0.5, 1, 0, { dn: 40 }), petals('t4', 'xt4', 0.5, 1, 0, { dn: 40 })],
  mirrorable: true,
});

// ───────────────────────────── 9-4 The Drake's Doorstep (stealth) ─────────────────────────────

const shore = knobs('s', 'step', 2, [220, 260], [28, 32], [150, 170]);
/** a stealth gate: Dot's line, then a long watched run with cover in reach, a long calm before the first pass, no animal */
const watchGate = (theme: 'spires' | 'ferns', name: string, extra: Socket[] = []): SectionTemplate =>
  section({
    id: `w9-watch-gate-${theme}`,
    name: `the doorstep: ${name} (cover)`,
    archetypes: ['stealth'],
    phases: ['start'],
    difficulty: 1,
    teaches: W9_THEME[theme],
    weight: 6,
    pieces: [bank('a', [220, 260]), up('knob', 'a', 30, [150, 170]), down('step', 'knob', 30, [240, 280]), ...shore.pieces],
    last: shore.last,
    sockets: [
      tip(W9_LESSON.watch, 'a', 0.2),
      petals('knob', 'knob', 0.5, 1),
      watch('step', 0.05, 'watchLesson'),
      hideAt('h1', 'step', 0.55),
      petals('sk1', 'sk1', 0.5, 1),
      watch('sf1', 0.05, 'watch2'),
      hideAt('h2', 'sf1', 0.5),
      petals('sk2', 'sk2', 0.5, 1),
      watch('sf2', 0.05, 'watch3'),
      hideAt('h3', 'sf2', 0.6),
      ...extra,
    ],
    mirrorable: false,
  });
const watchGates = [watchGate('spires', 'the obsidian spires', [scenery('smoke', 'a', [0.5, 0.6], 0.8)]), watchGate('ferns', 'the ash ferns', [scenery('ohia', 'a', [0.5, 0.6], 0.8)])];

const spireK = knobs('', 'a', 2, [320, 360], [30, 36]);
/** spires: a long watched run of three flats over knobs, a spire on each */
const spireRun = section({
  id: 'w9-spire-run',
  name: 'watched spires',
  archetypes: ['stealth'],
  phases: ALL,
  difficulty: 5,
  uses: [W9_THEME.spires],
  extraSeconds: 3,
  pieces: [bank('a', [320, 360]), ...spireK.pieces],
  last: spireK.last,
  sockets: [watch('a', 0.05), hideAt('h1', 'a', 0.6), petals('k1', 'k1', 0.5, 1), watch('f1', 0.05, 'watch2'), hideAt('h2', 'f1', 0.55), petals('k2', 'k2', 0.5, 1), watch('f2', 0.05, 'watch3'), hideAt('h3', 'f2', 0.6)],
  mirrorable: true,
});

/** spires: a watched run, a lava chasm, a watched run (the chasm is jumped in a calm) */
const spireChasm = section({
  id: 'w9-spire-chasm',
  name: 'watched chasm',
  archetypes: ['stealth'],
  phases: LIVE,
  difficulty: 7,
  uses: [W9_THEME.spires],
  extraSeconds: 3,
  pieces: [bank('a', [380, 420]), lava('b', 'a', [380, 420], [0.36, 0.5]), up('k', 'b', 30, [140, 160]), down('c', 'k', 30, [320, 360])],
  last: 'c',
  sockets: [watch('a', 0.05), hideAt('h1', 'a', 0.5), petals('b0', 'b', 0.2, 1), watch('b', 0.05, 'watch2'), hideAt('h2', 'b', 0.6), watch('c', 0.05, 'watch3'), hideAt('h3', 'c', 0.55), foe('foe', 'c', [0.85, 0.9], SMALL, 3, { phases: HOT, chance: 0.4 })],
  mirrorable: true,
});

const fernK = knobs('', 'a', 1, [440, 480], [30, 36]);
/** ferns: a watched run with ferns, and a geyser on its last flat between two ferns */
const fernVents = section({
  id: 'w9-fern-vents',
  name: 'watched ferns and a geyser',
  archetypes: ['stealth'],
  phases: LIVE,
  difficulty: 7,
  uses: [W9_THEME.ferns, GEYSER],
  extraSeconds: 3 + GEYSER_WAIT,
  pieces: [bank('a', [320, 360]), ...fernK.pieces, up('k2', fernK.last, 30, [140, 160]), down('c', 'k2', 30, [300, 340])],
  last: 'c',
  sockets: [watch('a', 0.05), hideAt('h1', 'a', 0.6), petals('k1', 'k1', 0.5, 1), watch('f1', 0.05, 'watch2'), hideAt('h2', 'f1', 0.2), geyser('g', 'f1', 0.6), hideAt('h3', 'c', 0.55), petals('k2', 'k2', 0.5, 1)],
  mirrorable: true,
});

/** ferns: two watched flats either side of a crust chasm (soft), ferns on both */
const fernGap = section({
  id: 'w9-fern-gap',
  name: 'watched crust chasm',
  archetypes: ['stealth'],
  phases: ALL,
  difficulty: 6,
  uses: [W9_THEME.ferns],
  extraSeconds: 3,
  pieces: [bank('a', [360, 400]), wide('b', 'a', [380, 420]), up('k', 'b', 30, [140, 160]), down('c', 'k', 30, [240, 280])],
  last: 'c',
  sockets: [watch('a', 0.05), hideAt('h1', 'a', 0.55), petals('b0', 'b', 0.2, 1), watch('b', 0.05, 'watch2'), hideAt('h2', 'b', 0.6), petals('k', 'k', 0.5, 1)],
  mirrorable: true,
});

// ───────────────────────────── 9-5 Vent Riding (sprint) ─────────────────────────────

/** a vent-riding gate (9-5): Dot's line about the warm air, a first glide over a vent (a soft chasm), and the roll's theme opens */
const ventGate = (theme: 'glides' | 'bursts', name: string): SectionTemplate =>
  section({
    id: `w9-vent-gate-${theme}`,
    name: `vent riding: ${name} (gate)`,
    archetypes: ['sprint'],
    phases: ['start'],
    difficulty: 2,
    teaches: W9_THEME[theme],
    weight: 6,
    pieces: [bank('a', [300, 340]), up('k', 'a', 30, [140, 160]), down('lip', 'k', 30, [300, 340]), glide('b', 'lip', [320, 360], [0.55, 0.65]), up('k2', 'b', 30, [140, 160]), down('c', 'k2', 30, [200, 240])],
    last: 'c',
    sockets: [tip(W9_LESSON.vent, 'a', 0.2), petals('k', 'k', 0.5, 1), vent('vent', 'lip'), petals('b', 'b', 0.5, 1), petals('k2', 'k2', 0.5, 1)],
    mirrorable: false,
  });
const ventGates = [ventGate('glides', 'the glides'), ventGate('bursts', 'the bursts')];

/** glides: two glides over vents with basalt between (360+, glide trap rule: these chasms are soft) */
const glideTwin = section({
  id: 'w9-glide-twin',
  name: 'two glides over the vents',
  archetypes: ['sprint'],
  phases: ALL,
  difficulty: 6,
  uses: [W9_THEME.glides],
  pieces: [bank('a', [340, 380]), glide('b', 'a', [380, 420]), up('k', 'b', 30, [140, 160]), down('b2', 'k', 30, [240, 280]), glide('c', 'b2', [320, 360])],
  last: 'c',
  sockets: [vent('v1', 'a'), petals('b', 'b', 0.5, 1), petals('k', 'k', 0.5, 1), vent('v2', 'b2'), foe('foe', 'c', [0.5, 0.6], SMALL, 3, { phases: HOT, chance: 0.4 })],
  mirrorable: false,
});

/** glides: a glide over a vent up onto a high ledge, a lava chasm down off it */
const glideHigh = section({
  id: 'w9-glide-high',
  name: 'glide to the high ledge',
  archetypes: ['sprint'],
  phases: LIVE,
  difficulty: 7,
  uses: [W9_THEME.glides],
  pieces: [bank('a', [340, 380]), glide('b', 'a', [440, 480], [0.6, 0.72]), lava('c', 'b', [380, 420], [0.36, 0.5])],
  last: 'c',
  sockets: [vent('v1', 'a'), petals('b', 'b', 0.5, 2, 100), petals('c', 'c', 0.5, 1), scenery('ohia', 'c', [0.6, 0.8], 0.5)],
  mirrorable: false,
});

/** bursts: a glide over a vent, then two geysers on the landing flat */
const burstLanding = section({
  id: 'w9-burst-landing',
  name: 'glide into the geysers',
  archetypes: ['sprint'],
  phases: ALL,
  difficulty: 7,
  uses: [W9_THEME.bursts, GEYSER],
  extraSeconds: GEYSER_WAIT * 2,
  pieces: [bank('a', [340, 380]), glide('b', 'a', [580, 620]), up('k', 'b', 30, [140, 160]), down('c', 'k', 30, [200, 240])],
  last: 'c',
  sockets: [vent('v1', 'a'), geyser('g1', 'b', 0.42), geyser('g2', 'b', 0.8), petals('b', 'b', 0.12, 1), petals('k', 'k', 0.5, 1)],
  mirrorable: false,
});

/** bursts: a geyser row between two glides */
const burstRow = section({
  id: 'w9-burst-row',
  name: 'geysers between the glides',
  archetypes: ['sprint'],
  phases: HOT,
  difficulty: 8,
  uses: [W9_THEME.bursts, GEYSER],
  extraSeconds: GEYSER_WAIT * 2,
  pieces: [bank('a', [540, 580]), glide('b', 'a', [360, 400])],
  last: 'b',
  sockets: [geyser('g1', 'a', 0.25), geyser('g2', 'a', 0.62), petals('a', 'a', 0.44, 1), vent('v1', 'a'), petals('b', 'b', 0.5, 1)],
  mirrorable: false,
});

// ───────────────────────────── 9-6 Ash Fields (purge), 9-9 The Drake's Hoard (gauntlet) ─────────────────────────────

/** a hunt gate: Dot explains the shut shrine before any animal, and the roll's theme opens */
const huntGate = (theme: 'cats' | 'harpies' | 'boas', line: 'hunt' | 'fight'): SectionTemplate => {
  const k = knobs('', 'a', 2, [220, 260]);
  return section({
    id: `w9-${line}-gate-${theme}`,
    name: `${line === 'hunt' ? 'the ash fields' : "the Drake's hoard"}: ${theme} (arena gate)`,
    archetypes: [line === 'hunt' ? 'purge' : 'gauntlet'],
    phases: ['start'],
    difficulty: 1,
    teaches: W9_THEME[theme],
    weight: 6,
    pieces: [bank('a', [220, 260]), ...k.pieces],
    last: k.last,
    sockets: [tip(line === 'hunt' ? W9_LESSON.hunt : W9_LESSON.fight, 'a', 0.15), petals('k1', 'k1', 0.5, 1), petals('f1', 'f1', 0.5, 2, 80), petals('k2', 'k2', 0.5, 1), scenery('log', 'f2', [0.5, 0.7], 0.7)],
    mirrorable: false,
  });
};
const huntGates = (['cats', 'harpies', 'boas'] as const).flatMap((t) => (['hunt', 'fight'] as const).map((l) => huntGate(t, l)));

const catDenK = knobs('', 'a', 1, [500, 540], [32, 40]);
/** cats: two cats on two long flats over a knob */
const catDen = section({
  id: 'w9-cat-den',
  name: 'the cats on the ash',
  archetypes: ['purge', 'gauntlet'],
  phases: ALL,
  difficulty: 6,
  uses: [W9_THEME.cats],
  pieces: [bank('a', [500, 540]), ...catDenK.pieces],
  last: catDenK.last,
  sockets: [foe('f1', 'a', [0.5, 0.6], CATS, 5), petals('k1', 'k1', 0.5, 1), foe('f2', 'f1', [0.45, 0.55], CATS, 5, { phases: LIVE })],
  mirrorable: true,
});

/** cats: a lava chasm with a jaguar waiting past it */
const jaguarLeap = section({
  id: 'w9-jaguar-leap',
  name: 'jaguar past the chasm',
  archetypes: ['purge', 'gauntlet'],
  phases: LIVE,
  difficulty: 8,
  uses: [W9_THEME.cats],
  pieces: [bank('a', [380, 420]), lava('b', 'a', [560, 600], [0.36, 0.5], true), up('k', 'b', 30, [140, 160]), down('c', 'k', 30, [200, 240])],
  last: 'c',
  sockets: [petals('a', 'a', 0.5, 1), foe('jag', 'b', [0.55, 0.65], ['jaguar'], 5), petals('k', 'k', 0.5, 1)],
  mirrorable: true,
});

/** harpies: a long ash field with a harpy, a knob, a small hunter */
const harpyField = section({
  id: 'w9-harpy-field',
  name: 'harpy on the ash field',
  archetypes: ['purge', 'gauntlet'],
  phases: ALL,
  difficulty: 7,
  uses: [W9_THEME.harpies],
  pieces: [bank('a', [540, 580]), up('k', 'a', 34, [140, 160]), down('b', 'k', 34, [480, 520])],
  last: 'b',
  sockets: [foe('harpy', 'a', [0.5, 0.6], ['harpy'], 4), petals('k', 'k', 0.5, 1), foe('small', 'b', [0.45, 0.55], SMALL, 3, { phases: LIVE })],
  mirrorable: true,
});

/** harpies: two harpy flats either side of a crust chasm */
const harpyGap = section({
  id: 'w9-harpy-gap',
  name: 'harpies across the chasm',
  archetypes: ['purge', 'gauntlet'],
  phases: HOT,
  difficulty: 8,
  uses: [W9_THEME.harpies],
  pieces: [bank('a', [540, 580]), wide('b', 'a', [540, 580])],
  last: 'b',
  sockets: [foe('h1', 'a', [0.45, 0.55], ['harpy', 'jaguar'], 5), foe('h2', 'b', [0.5, 0.6], ['harpy', 'tayra'], 4, { phases: HOT })],
  mirrorable: true,
});

/** boas: a boa on a flat between two geyser flats */
const boaVents = section({
  id: 'w9-boa-vents',
  name: 'boa between the geysers',
  archetypes: ['purge', 'gauntlet'],
  phases: LIVE,
  difficulty: 7,
  uses: [W9_THEME.boas, GEYSER],
  extraSeconds: GEYSER_WAIT * 2,
  pieces: [bank('a', [300, 340]), up('k', 'a', 32, [140, 160]), down('boa', 'k', 32, [460, 500]), up('k2', 'boa', 34, [140, 160]), down('c', 'k2', 34, [300, 340])],
  last: 'c',
  sockets: [geyser('g1', 'a', 0.5), petals('k', 'k', 0.5, 1), foe('boa', 'boa', [0.45, 0.55], ['boa'], 3), petals('k2', 'k2', 0.5, 1), geyser('g2', 'c', 0.5)],
  mirrorable: true,
});

const boaK = knobs('', 'a', 2, [440, 480]);
/** boas: boas coiled on the flats between knobs, a tayra at the end */
const boaKnobs = section({
  id: 'w9-boa-knobs',
  name: 'coiled boas',
  archetypes: ['purge', 'gauntlet'],
  phases: ALL,
  difficulty: 6,
  uses: [W9_THEME.boas],
  pieces: [bank('a', [440, 480]), ...boaK.pieces],
  last: boaK.last,
  sockets: [foe('b1', 'a', [0.5, 0.6], ['boa'], 3), petals('k1', 'k1', 0.5, 1), foe('b2', 'f1', [0.45, 0.55], ['boa', 'tayra'], 3, { phases: LIVE }), petals('k2', 'k2', 0.5, 1), foe('t', 'f2', [0.5, 0.6], ['tayra', 'ocelot'], 3, { phases: HOT, chance: 0.7 })],
  mirrorable: true,
});

// ───────────────────────────── 9-8 Pell's Thread (search) ─────────────────────────────

/** a search gate: Dot explains the shut shrine (Pell's threads), and the roll's theme opens */
const threadGate = (theme: 'ledges' | 'channels'): SectionTemplate => {
  const k = knobs('', 'a', 2, [220, 260]);
  return section({
    id: `w9-thread-gate-${theme}`,
    name: `pell's thread: ${theme} (gate)`,
    archetypes: ['relic_hunt'],
    phases: ['start'],
    difficulty: 1,
    teaches: W9_THEME[theme],
    weight: 6,
    pieces: [bank('a', [220, 260]), ...k.pieces],
    last: k.last,
    sockets: [tip(W9_LESSON.threads, 'a', 0.15), petals('k1', 'k1', 0.5, 1), petals('f1', 'f1', 0.5, 2, 80), petals('k2', 'k2', 0.5, 1), scenery('ohia', 'f2', [0.5, 0.7], 0.7)],
    mirrorable: false,
  });
};
const threadGates = [threadGate('ledges'), threadGate('channels')];

/** ledges: up a basalt stair to a high ledge (a thread on it), a chasm down off its end */
const highLedge = section({
  id: 'w9-high-ledge',
  name: 'thread on the high ledge',
  archetypes: ['relic_hunt'],
  phases: ALL,
  difficulty: 5,
  uses: [W9_THEME.ledges],
  pieces: [bank('a', [240, 280]), up('s1', 'a', 52, [160, 180]), up('top', 's1', 52, [340, 380]), lavaUp('c', 'top', [80, 96], [400, 440], [0.4, 0.55])],
  last: 'c',
  exitDy: -16,
  sockets: [petals('s1', 's1', 0.5, 1), thread('r', 'top', 0.6), petals('top', 'top', 0.25, 1), foe('foe', 'c', [0.5, 0.6], SMALL, 3, { phases: HOT, chance: 0.6 })],
  mirrorable: false,
});

/** ledges: a thread on a ledge over the run (a jump up from a knob), a hunter below */
const overLedge = section({
  id: 'w9-over-ledge',
  name: 'thread over the run',
  archetypes: ['relic_hunt'],
  phases: LIVE,
  difficulty: 6,
  uses: [W9_THEME.ledges],
  pieces: [bank('a', [520, 560]), up('k', 'a', 34, [140, 160]), down('b', 'k', 34, [300, 340]), { key: 'shelf', shape: 'branch', w: [200, 240], place: { kind: 'over', on: 'b', at: 0.3, dy: -150 }, main: false }],
  last: 'b',
  sockets: [foe('foe', 'a', [0.45, 0.55], ANY, 5), petals('k', 'k', 0.5, 1), thread('r', 'shelf', 0.6), petals('shelf', 'shelf', 0.3, 1)],
  mirrorable: true,
});

const chT = channel('', 'a', [3]);
/** channels: a thread on the channel floor under the cracked slabs */
const channelThread = section({
  id: 'w9-channel-thread',
  name: 'thread in the channel',
  archetypes: ['relic_hunt'],
  phases: ALL,
  difficulty: 5,
  uses: [W9_THEME.channels, W9_LESSON.basalt],
  pieces: [bank('a', [240, 280]), ...chT.pieces],
  last: chT.last,
  sockets: [thread('r', 'ch', 0.5), petals('t2', 't2', 0.5, 1, 0, { dn: 40 }), scenery('smoke', 'b', [0.5, 0.7], 0.5)],
  mirrorable: true,
});

/** channels: a lava chasm, a thread past a geyser */
const ventThread = section({
  id: 'w9-vent-thread',
  name: 'thread past a geyser',
  archetypes: ['relic_hunt'],
  phases: LIVE,
  difficulty: 7,
  uses: [W9_THEME.channels, GEYSER],
  extraSeconds: GEYSER_WAIT,
  pieces: [bank('a', [360, 400]), lava('b', 'a', [520, 560], [0.36, 0.5], true), up('k', 'b', 30, [140, 160]), down('c', 'k', 30, [240, 280])],
  last: 'c',
  sockets: [petals('a', 'a', 0.5, 1), geyser('g', 'b', 0.45), thread('r', 'b', 0.85), petals('k', 'k', 0.5, 1)],
  mirrorable: true,
});

// ───────────────────────────── the list ─────────────────────────────

export const W9_GROUND_SECTIONS: SectionTemplate[] = [
  landing,
  restSteps,
  restOhia,
  lavaHop,
  lavaRise,
  crustGaps,
  lavaDrop,
  firstGeyser,
  geyserPair,
  geyserRow,
  geyserChasm,
  geyserLedge,
  basaltRun,
  basaltTwin,
  hunterRun,
  catChasm,
  ...pepperGates,
  ventField,
  ventLanding,
  chasmChain,
  chasmDrop,
  basaltLong,
  basaltChasm,
  ...watchGates,
  spireRun,
  spireChasm,
  fernVents,
  fernGap,
  ...ventGates,
  glideTwin,
  glideHigh,
  burstLanding,
  burstRow,
  ...huntGates,
  catDen,
  jaguarLeap,
  harpyField,
  harpyGap,
  boaVents,
  boaKnobs,
  ...threadGates,
  highLedge,
  overLedge,
  channelThread,
  ventThread,
];

/**
 * The sections only some stages hold (STAGE-RULES §2 "Sameness": no two stages alike): each stage's gates and themed sections are its own;
 * the shared ones go where their archetypes and phases allow. 9-5's glides are 9-5's; 9-1's themes are 9-1's.
 */
export const W9_STAGE_ONLY: Readonly<Record<string, readonly number[]>> = Object.fromEntries([
  ...[...pepperGates, ventField, ventLanding, chasmChain, chasmDrop, basaltLong, basaltChasm].map((s) => [s.id, [1]] as const),
  ...[...ventGates, glideTwin, glideHigh, burstLanding, burstRow].map((s) => [s.id, [5]] as const),
  ...[...watchGates, spireRun, spireChasm, fernVents, fernGap].map((s) => [s.id, [4]] as const),
  ...[...threadGates, highLedge, overLedge, channelThread, ventThread].map((s) => [s.id, [8]] as const),
  ...huntGates.map((s) => [s.id, s.archetypes.includes('purge') ? [6] : [9]] as const),
  ...[catDen, jaguarLeap, harpyField, harpyGap, boaVents, boaKnobs].map((s) => [s.id, [6, 9]] as const),
  // (the start of the vine stage only: every other stage starts at its gate)
  [landing.id, [3]] as const,
]);
