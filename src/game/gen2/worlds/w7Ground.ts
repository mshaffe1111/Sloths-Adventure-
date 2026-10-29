/**
 * gen2/worlds/w7Ground — World 7's building blocks (DESIGN.md B9): the old temple's floors, halls and walls, shared by every stage, and
 * each stage's own: 7-1 The Open Door and 7-6 Falling Floors (sprints), 7-3 Ten Chairs and 7-7 The Photograph (searches), 7-5 Stone
 * Sentries (a purge) and 7-9 The Golem's Hall (a gauntlet). The puzzle rooms are w7Rooms.ts; the kit is w7.ts.
 *
 * Crumbling tiles (World 7's mechanic) are NEVER needed (STAGE-RULES §1): a run of tiles always lies over a sunken hall whose floor
 * walks on underneath, HALL.depth below, with two hops out at its far end (`hall`). The tiles are the hurry: run across and skip the
 * hall (and whatever waits in it), or stand still and drop into it (soft: a walk, never a life). A tile is a tile's width (zones.ts
 * CRUMBLE_TILE_W), at most CRUMBLE_RUN_MAX in a row before a solid slab, stepping by CRUMBLE_STEP at most (levelCheck's rules), never on
 * the main route (pipeline SectionPiece.crumble), and the pipeline's checkStage proves every roll without its tiles. 7-1 teaches the
 * tiles on every roll, in a safe spot (w7Game.ts W7_REQUIRED): Pokey's line on the bank before them, nothing that hurts near.
 *
 * Beats. As World 6's: every beat is ground the route crosses (a plinth stepped up onto, a gap hopped, a wall climbed, an animal), no
 * flat much over 400 px without one, every rise one hop, every gap a share of the jump the difficulty allows, every dip soft with a
 * step out. A wall a brown vine climbs is a whole bank (out of a double jump's reach: the vine is the way up).
 *
 * Water (w7.ts header): the drains are dirty water, a third of a jump wide, banks of 360 px or more between them (no glide trap), and
 * no wide or second-jump gap over water (those are rubble pits: soft). Pokey's warning comes first (the pipeline's water warning, his line).
 *
 * Variety (STAGE-RULES §6, "a different mix of actions"): each stage's start gate opens the roll's THEME (W7_THEME), and each theme leans
 * on its own heavy beat: the tiles (Z), the brown-vine walls (V), the drains (J over water), the animals (C). The shared sections weigh
 * little (SHARED) so the theme carries the stage. Which stage holds which sections: W7_STAGE_ONLY (w7Game.ts forStage).
 */
import type { Phase, SectionPiece, SectionTemplate, Socket } from '../types.ts';

// ───────────────────────────── the themes ─────────────────────────────

export const W7_THEME = {
  /** tile galleries over the halls (7-1, 7-3, 7-6, 7-7, 7-9) */
  galleries: 'w7:galleries',
  /** brown vines up the old walls (7-1, 7-3, 7-7) */
  walls: 'w7:walls',
  /** dirty drains to hop (7-1, 7-6, 7-7) */
  drains: 'w7:drains',
  /** stepped tile stairs and long galleries (7-6) */
  stairs: 'w7:stairs',
  /** the sunken courtyards (the searches) */
  courtyard: 'w7:courtyard',
  /** the halls' hunters (7-5, 7-9) */
  cats: 'w7:cats',
  boas: 'w7:boas',
  harpies: 'w7:harpies',
} as const;
export type W7Theme = (typeof W7_THEME)[keyof typeof W7_THEME];

/** the lesson keys (w7.ts W7_LESSON) */
const CRUMBLE = 'crumble';
const BROWN = 'brown';

const SHARED = 0.3;

// ───────────────────────────── helpers ─────────────────────────────

type Opt = Partial<Socket>;
type W = SectionPiece['w'];
const LIVE: Phase[] = ['sho', 'ten', 'ketsu'];
const HOT: Phase[] = ['ten', 'ketsu'];

const bank = (key: string, w: W, place: SectionPiece['place'] = { kind: 'start' }, o: Partial<SectionPiece> = {}): SectionPiece => ({ key, shape: 'bank', w, place, ...o });
const up = (key: string, after: string, dy: number, w: W): SectionPiece => bank(key, w, { kind: 'walk', after, dy: -dy });
const down = (key: string, after: string, dy: number, w: W): SectionPiece => bank(key, w, { kind: 'walk', after, dy });
/** a drain hopped: dirty water, a third of a jump (STAGE-RULES §6); the bank after it 360 px or more */
const drain = (key: string, after: string, w: W, share: W = [0.3, 0.42]): SectionPiece => bank(key, w, { kind: 'pit', after, jump: 'jump', share, water: true });
/** a rubble pit: the jump's own width, soft */
const wide = (key: string, after: string, w: W, share: W = [0.76, 0.94]): SectionPiece => bank(key, w, { kind: 'pit', after, jump: 'jump', share }, { landing: true });
/** a wide rubble pit crossed with the second jump, soft */
const leap = (key: string, after: string, w: W, share: W = [0.5, 0.72]): SectionPiece => bank(key, w, { kind: 'pit', after, jump: 'double', share }, { landing: true });
/** n plinths after `after`: up onto each, down to a flat of `flat` px (keys `${p}k1`, `${p}f1`, ...) */
function plinths(p: string, after: string, n: number, flat: W, dy: [number, number] = [30, 38], kneeW: W = [150, 175]): { pieces: SectionPiece[]; last: string } {
  const out: SectionPiece[] = [];
  let prev = after;
  for (let i = 1; i <= n; i++) {
    const h = Math.round(dy[0] + ((dy[1] - dy[0]) * (i % 3)) / 2);
    out.push(up(`${p}k${i}`, prev, h, kneeW), down(`${p}f${i}`, `${p}k${i}`, h, flat));
    prev = `${p}f${i}`;
  }
  return { pieces: out, last: prev };
}

/** a sunken hall's depth under the floor, and its two hops out (each one plain hop on Easy: under 0.9 of its 70 px) */
export const HALL = { depth: 120, step: 60, stepW: 100, tile: 110 } as const;

/**
 * A sunken hall after `after` with a run of crumbling tiles over it at the floor's height (the hurry), and the floor on past it
 * (`${p}b`, level with `after`). The tiles: `runs` runs of tiles with a solid slab (`${p}slab${i}`, 160 px) between two runs; `stair`
 * steps every second tile up CRUMBLE_STEP (40 px) and back. The hall's floor (`${p}hall`) runs under all of them, then a step
 * (`${p}s`) and the floor. From the last tile the floor is a short jump (HALL.stepW), or a drop to the step and a hop.
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
      out.push({ key: `${p}slab${r}`, shape: 'block', w: SLAB, h: 26, place: { kind: 'over', on: prev, at: 1, dy: 0 }, style: 'ruin', main: false });
      prev = `${p}slab${r}`;
      span += SLAB;
    }
    for (let i = 0; i < count; i++) {
      const k = `${p}t${++n}`;
      // (a stair: up 40 on the even tiles of a run, back down on the next; a slab and the floor past are level with the bank)
      const dy = stair ? (i % 2 === 1 ? -40 : i > 0 ? 40 : 0) : 0;
      out.push({ key: k, shape: 'block', w: HALL.tile, h: 26, place: { kind: 'over', on: prev, at: 1, dy }, crumble: true });
      tiles.push(k);
      prev = k;
      span += HALL.tile;
    }
    // (a stair ends a run level: a run of even length closes on its raised tile, so it steps down onto the slab or the floor's line)
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

/** a brown vine up an old wall at the end of `on` (the wall a whole bank, out of a double jump's reach), and down off its far side */
const wall = (vine: string, on: string, top: string, h: number, w: W, after: string, afterW: W): SectionPiece[] => [
  { key: vine, shape: 'vine', w: 0, place: { kind: 'climb', on, at: 1, h } },
  bank(top, w, { kind: 'over', on: vine, at: 0, dy: 0 }, { main: true }),
  down(after, top, h, afterW),
];

const petals = (id: string, on: string, t: Socket['t'], count = 2, span = 120, o: Opt = {}): Socket => ({ id, role: 'pickup', on, t, dn: 34, count, span, ...o });
const prop = (id: string, on: string, t: Socket['t'], allow: string[], o: Opt = {}): Socket => ({ id, role: 'prop', on, t, allow, ...o });
const scenery = (id: string, on: string, t: Socket['t'], chance = 0.6) => prop(id, on, t, ['scenery'], { chance });
const flag = (on: string, t: Socket['t']): Socket => ({ id: 'flag', role: 'flag', on, t });
const tip = (mechanic: string, on: string, t: Socket['t'] = 0.15, id = `tip-${mechanic}`): Socket => ({ id, role: 'tip', on, t, allow: [mechanic] });
const foe = (id: string, on: string, t: Socket['t'], kinds: string[], max: number, o: Opt = {}): Socket => ({ id, role: 'enemy', on, t, allow: kinds, maxThreat: max, easy: 'soften', ...o });
/** a relic's spot (the searches: the pipeline fills as many as the node's quota asks, the rest stay empty) */
const relic = (id: string, on: string, t: Socket['t'] = 0.5): Socket => ({ id, role: 'objective', on, t, dn: 30 });

const CATS = ['ocelot', 'jaguar'];
const SMALL = ['frog', 'tayra', 'ocelot'];
const HALLERS = ['boa', 'ocelot', 'frog'];

const midOf = (w: W) => (typeof w === 'number' ? w : (w[0] + w[1]) / 2);

/** a section's flag (when the pipeline puts one in it): the middle of its widest main floor with no animal on it, back from any lip */
function safeFlag(pieces: SectionPiece[], sockets: Socket[], first: string, last: string): Socket {
  const banks = pieces.filter((p) => p.main !== false && p.shape === 'bank' && !p.key.endsWith('hall') && p.place.kind !== 'over');
  const busy = new Set(sockets.filter((k) => k.role === 'enemy').map((k) => k.on));
  const gapped = (k: string) => k === last || pieces.some((q) => (q.place.kind === 'pit' || q.place.kind === 'jump' || q.place.kind === 'double' || q.place.kind === 'climb' || (q.place.kind === 'walk' && q.key.endsWith('hall'))) && ('after' in q.place ? q.place.after : 'on' in q.place ? q.place.on : '') === k);
  const spot = (p: SectionPiece) => (gapped(p.key) ? { t: 0.3, room: 0.3 * midOf(p.w) } : { t: 0.5, room: 999 });
  const score = (p: SectionPiece) => Math.min(spot(p).room, 300) + midOf(p.w) / 10 - (busy.has(p.key) ? 400 : 0) - (p.key === first ? 50 : 0);
  const p = [...banks].sort((a, b) => score(b) - score(a))[0];
  return flag(p.key, spot(p).t);
}

const section = (s: Omit<SectionTemplate, 'entry' | 'exit' | 'exitDy'> & { exitDy?: number; first?: string; last: string }): SectionTemplate => {
  const { first, last, exitDy, ...rest } = s;
  const sockets = rest.sockets.some((k) => k.role === 'flag') ? rest.sockets : [...rest.sockets, safeFlag(rest.pieces, rest.sockets, first ?? rest.pieces[0].key, last)];
  return { ...rest, sockets, entry: { piece: first ?? s.pieces[0].key, kind: 'ground' }, exit: { piece: last, kind: 'ground' }, exitDy: exitDy ?? 0 };
};

// ───────────────────────────── every stage: floors, plinths, rests ─────────────────────────────

const colPl = plinths('', 'a', 2, [180, 220]);
/** a colonnade: two low plinths, a statue facing the temple, a flag */
const colonnade = section({
  id: 'w7-colonnade',
  name: 'colonnade',
  archetypes: 'any',
  phases: ['rest', 'goal'],
  difficulty: 1,
  pieces: [bank('a', [180, 220]), ...colPl.pieces],
  last: colPl.last,
  sockets: [prop('statue', 'a', [0.3, 0.5], ['scenery'], { chance: 0.8 }), petals('k1', 'k1', 0.5, 2, 80), flag('f1', 0.6), petals('k2', 'k2', 0.5, 1), scenery('urn', 'f2', [0.5, 0.7], 0.5)],
  mirrorable: true,
});

/** temple steps: up two, down two, a flag at the top */
const templeSteps = section({
  id: 'w7-temple-steps',
  name: 'temple steps',
  archetypes: 'any',
  phases: ['rest', 'goal'],
  difficulty: 2,
  pieces: [bank('a', [180, 220]), up('r1', 'a', 34, [160, 190]), up('r2', 'r1', 30, [220, 260]), down('r3', 'r2', 30, [180, 210]), up('k', 'r3', 30, [150, 170]), down('c', 'k', 64, [200, 240])],
  last: 'c',
  sockets: [petals('r1', 'r1', 0.5, 1), flag('r2', 0.5), petals('r3', 'r3', 0.5, 1), petals('k', 'k', 0.5, 1), scenery('brazier', 'c', [0.4, 0.6])],
  mirrorable: true,
});

/** a quiet floor by a fallen column, two low plinths (a breather with a hop in it) */
const columnRest = section({
  id: 'w7-column-rest',
  name: 'fallen column floor',
  archetypes: 'any',
  phases: ['rest', 'goal'],
  difficulty: 1,
  pieces: [bank('a', [160, 200]), up('k0', 'a', 30, [150, 170]), down('mid', 'k0', 30, [240, 280]), up('k1', 'mid', 30, [150, 170]), down('b', 'k1', 30, [180, 220])],
  last: 'b',
  sockets: [petals('k0', 'k0', 0.5, 1), scenery('column', 'mid', 0.5, 1), flag('mid', 0.7), petals('k1', 'k1', 0.5, 1), petals('b', 'b', 0.5, 1)],
  mirrorable: true,
});

/** a plinth and a rubble gap, a small animal past it */
const plinthHop = section({
  id: 'w7-plinth-hop',
  name: 'plinth and gap',
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten'],
  difficulty: 3,
  weight: SHARED,
  pieces: [bank('a', [300, 340]), wide('b', 'a', [260, 300], [0.4, 0.55]), up('c', 'b', 38, [140, 160]), down('d', 'c', 38, [260, 300]), up('k', 'd', 30, [140, 160]), down('e', 'k', 30, [160, 200])],
  last: 'e',
  sockets: [petals('a', 'a', 0.5, 2, 80), petals('c', 'c', 0.5, 1), foe('cat', 'd', [0.5, 0.6], SMALL, 3, { phases: LIVE, chance: 0.6 }), petals('k', 'k', 0.5, 1), relic('r', 'e', 0.6)],
  mirrorable: true,
});

/** a step up onto a higher floor, a plinth along it, a rubble gap */
const stepUp = section({
  id: 'w7-step-up',
  name: 'a step up',
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten'],
  difficulty: 4,
  weight: SHARED,
  pieces: [bank('a', [200, 240]), up('b', 'a', 48, [180, 220]), up('k', 'b', 30, [140, 160]), down('b2', 'k', 30, [200, 240]), wide('c', 'b2', [340, 380])],
  last: 'c',
  exitDy: -48,
  sockets: [petals('a', 'a', 0.5, 2, 90), scenery('urn', 'b', [0.3, 0.5]), foe('foe', 'c', [0.55, 0.7], ['ocelot', 'tayra'], 3, { phases: LIVE, chance: 0.8 })],
  mirrorable: false,
});

/** a step down to a lower floor, a plinth, a rubble gap */
const stepDown = section({
  id: 'w7-step-down',
  name: 'a step down',
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten'],
  difficulty: 4,
  weight: SHARED,
  pieces: [bank('a', [180, 220]), up('k', 'a', 30, [150, 170]), down('b2', 'k', 78, [200, 240]), up('k2', 'b2', 30, [140, 160]), down('b3', 'k2', 30, [160, 200]), wide('c', 'b3', [340, 380])],
  last: 'c',
  exitDy: 48,
  sockets: [petals('a', 'a', 0.5, 2, 90), foe('frog', 'b2', 0.55, ['frog'], 1.5, { phases: LIVE, chance: 0.7 }), foe('foe', 'c', [0.6, 0.75], CATS, 3, { phases: HOT, chance: 0.6 }), relic('r', 'c', 0.4)],
  mirrorable: false,
});

/** a wide rubble pit only the second jump crosses, a plinth after it */
const rubbleLeap = section({
  id: 'w7-rubble-leap',
  name: 'wide rubble pit',
  archetypes: 'any',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 7,
  weight: SHARED,
  needs: ['double'],
  pieces: [bank('near', [200, 240]), leap('far', 'near', [200, 240]), up('m', 'far', 36, [140, 160]), down('b', 'm', 36, [300, 340]), up('k', 'b', 30, [140, 160]), down('c', 'k', 30, [160, 200])],
  last: 'c',
  sockets: [petals('near', 'near', 0.5, 2, 90), petals('m', 'm', 0.5, 1), foe('foe', 'b', [0.5, 0.65], ['ocelot', 'tayra', 'frog'], 3, { phases: HOT, chance: 0.7 })],
  mirrorable: true,
});

// ───────────────────────────── the tiles (crumbling: never needed) ─────────────────────────────

const firstHall = hall('', 'a', [2]);
/**
 * 7-1's lesson (required, w7Game.ts): Pokey's line on the floor before them, two tiles over a shallow hall, petals over the tiles,
 * nothing that hurts anywhere near. Stand still and he drops into the hall and hops out: the tiles teach themselves.
 */
const firstTiles = section({
  id: 'w7-first-tiles',
  name: 'the first cracked tiles',
  archetypes: 'any',
  phases: ['ki'],
  difficulty: 1,
  teaches: CRUMBLE,
  maxPerStage: 1,
  pieces: [bank('a', [340, 380]), ...firstHall.pieces],
  last: firstHall.last,
  sockets: [tip(CRUMBLE, 'a', 0.1), petals('t', 't1', 0.5, 3, 200), petals('hall', 'hall', 0.5, 2, 120), scenery('urn', 'b', [0.5, 0.7], 0.8)],
  mirrorable: false,
});

/** a gallery: three tiles over a hall, a hunter waiting in the hall below them */
const gal3 = hall('', 'a', [3]);
const gallery = section({
  id: 'w7-gallery',
  name: 'tile gallery over a hall',
  archetypes: ['sprint', 'relic_hunt', 'gauntlet'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 4,
  uses: [CRUMBLE, W7_THEME.galleries],
  pieces: [bank('a', [300, 340]), ...gal3.pieces],
  last: gal3.last,
  sockets: [petals('t', 't2', 0.5, 3, 240), foe('foe', 'hall', [0.45, 0.55], HALLERS, 3, { phases: LIVE, chance: 0.7 }), relic('r', 'hall', 0.3), scenery('brazier', 'b', [0.5, 0.7])],
  mirrorable: false,
});

/** a long gallery: three tiles, a slab, three more, a long hall under them with two animals */
const galLong = hall('', 'a', [3, 3]);
const longGallery = section({
  id: 'w7-long-gallery',
  name: 'long tile gallery',
  archetypes: ['sprint', 'relic_hunt', 'gauntlet'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: [CRUMBLE, W7_THEME.galleries],
  pieces: [bank('a', [240, 280]), ...galLong.pieces],
  last: galLong.last,
  sockets: [petals('t', 't2', 0.5, 2, 200), petals('slab', 'slab1', 0.5, 1), petals('t5', 't5', 0.5, 2, 200), foe('f1', 'hall', [0.2, 0.3], HALLERS, 3, { phases: LIVE }), foe('f2', 'hall', [0.72, 0.8], [...CATS, 'boa'], 5, { phases: HOT, chance: 0.6 }), relic('r', 'hall', 0.5)],
  mirrorable: false,
});

/** two halls back to back, a plinth floor between, tiles over each */
const twinA = hall('h1', 'a', [2]);
const twinB = hall('h2', 'h1b', [3]);
const twinHalls = section({
  id: 'w7-twin-halls',
  name: 'two tiled halls',
  archetypes: ['sprint', 'relic_hunt', 'gauntlet'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 5,
  uses: [CRUMBLE, W7_THEME.galleries],
  pieces: [bank('a', [220, 260]), ...twinA.pieces, ...twinB.pieces],
  last: twinB.last,
  sockets: [petals('t1', 'h1t1', 0.5, 2, 160), foe('f1', 'h2hall', [0.5, 0.6], HALLERS, 3, { phases: LIVE, chance: 0.7 }), petals('t2', 'h2t2', 0.5, 3, 240), relic('r', 'h1hall', 0.5)],
  mirrorable: false,
});

/** a tile stair: up and down by 40 over a hall (a hop on each raised tile), a frog in the hall */
const stairHall = hall('', 'a', [3], true);
const tileStair = section({
  id: 'w7-tile-stair',
  name: 'tile stair over a hall',
  archetypes: ['sprint'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 5,
  uses: [CRUMBLE, W7_THEME.stairs],
  pieces: [bank('a', [300, 340]), ...stairHall.pieces],
  last: stairHall.last,
  sockets: [petals('t2', 't2', 0.5, 1), petals('t3', 't3', 0.5, 1), foe('foe', 'hall', [0.45, 0.6], ['frog', 'boa'], 3, { phases: LIVE, chance: 0.7 }), scenery('column', 'b', [0.5, 0.7])],
  mirrorable: false,
});

/** a long stair: two stepped runs and a slab, the hall under them, a cat in it */
const stairLongHall = hall('', 'a', [3, 3], true);
const longStair = section({
  id: 'w7-long-stair',
  name: 'long tile stair',
  archetypes: ['sprint'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 7,
  uses: [CRUMBLE, W7_THEME.stairs],
  pieces: [bank('a', [240, 280]), ...stairLongHall.pieces],
  last: stairLongHall.last,
  sockets: [petals('t2', 't2', 0.5, 1), petals('slab', 'slab1', 0.5, 1), petals('t5', 't5', 0.5, 1), foe('f1', 'hall', [0.25, 0.35], HALLERS, 3, { phases: LIVE }), foe('f2', 'hall', [0.7, 0.8], CATS, 5, { phases: HOT, chance: 0.6 })],
  mirrorable: false,
});

/** stairs: a stair, a plinth floor, then a flat run of four tiles over a second hall */
const sfA = hall('h1', 'a', [3], true, [220, 240]);
const sfB = hall('h2', 'h1b', [4], false, [200, 220]);
const stairFlat = section({
  id: 'w7-stair-flat',
  name: 'tile stair and run',
  archetypes: ['sprint'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: [CRUMBLE, W7_THEME.stairs],
  pieces: [bank('a', [220, 260]), ...sfA.pieces, ...sfB.pieces],
  last: sfB.last,
  sockets: [petals('t2', 'h1t2', 0.5, 1), foe('f1', 'h1hall', [0.5, 0.6], ['frog'], 1.5, { phases: LIVE, chance: 0.6 }), petals('t6', 'h2t2', 0.5, 3, 260), foe('f2', 'h2hall', [0.5, 0.6], HALLERS, 3, { phases: HOT, chance: 0.6 })],
  mirrorable: false,
});

// ───────────────────────────── the brown vines up the old walls ─────────────────────────────

/** the first wall: a brown vine up it (Pokey's line on the first one of a stage), petals on top, down the far side */
const brownWall = section({
  id: 'w7-brown-wall',
  name: 'brown vine up an old wall',
  archetypes: ['sprint', 'relic_hunt'],
  phases: ['ki', 'sho'],
  difficulty: 3,
  uses: [W7_THEME.walls],
  teaches: BROWN,
  pieces: [bank('a', [320, 360]), ...wall('v', 'a', 'top', 220, [240, 280], 'b', [260, 300])],
  last: 'b',
  sockets: [tip(BROWN, 'a', 0.2), petals('top', 'top', 0.5, 3, 140), relic('r', 'top', 0.7), scenery('figs', 'b', [0.5, 0.7])],
  mirrorable: false,
});

/** a wall, then a rubble gap past its foot, a cat on the far floor */
const wallGap = section({
  id: 'w7-wall-gap',
  name: 'wall and rubble gap',
  archetypes: ['sprint', 'relic_hunt'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 5,
  uses: [W7_THEME.walls],
  pieces: [bank('a', [260, 300]), ...wall('v', 'a', 'top', 230, [220, 260], 'b', [200, 240]), wide('c', 'b', [340, 380])],
  last: 'c',
  sockets: [petals('top', 'top', 0.5, 2, 100), relic('r', 'top', 0.6), foe('foe', 'c', [0.55, 0.7], CATS, 5, { phases: LIVE, chance: 0.7 })],
  mirrorable: false,
});

/** two walls, a plinth floor between them */
const doubleWall = section({
  id: 'w7-double-wall',
  name: 'two old walls',
  archetypes: ['sprint', 'relic_hunt'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: [W7_THEME.walls],
  pieces: [bank('a', [240, 280]), ...wall('v1', 'a', 'top1', 220, [200, 240], 'b', [260, 300]), up('k', 'b', 30, [140, 160]), down('b2', 'k', 30, [180, 220]), ...wall('v2', 'b2', 'top2', 240, [200, 240], 'c', [240, 280])],
  last: 'c',
  sockets: [petals('top1', 'top1', 0.5, 2, 90), petals('k', 'k', 0.5, 1), foe('foe', 'b', [0.45, 0.6], SMALL, 3, { phases: HOT, chance: 0.6 }), petals('top2', 'top2', 0.5, 2, 90), relic('r', 'top2', 0.5)],
  mirrorable: false,
});

/** a cat at a wall's foot: past it to the vine, up and over */
const wallCat = section({
  id: 'w7-wall-cat',
  name: 'guarded wall',
  archetypes: ['sprint', 'relic_hunt'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: [W7_THEME.walls],
  pieces: [bank('a', [200, 240]), up('k', 'a', 30, [140, 160]), down('foot', 'k', 30, [420, 460]), ...wall('v', 'foot', 'top', 220, [240, 280], 'b', [280, 320])],
  last: 'b',
  sockets: [petals('k', 'k', 0.5, 1), foe('foe', 'foot', [0.35, 0.45], [...CATS, 'boa'], 5, { phases: LIVE }), petals('top', 'top', 0.5, 3, 140), relic('r', 'b', 0.6)],
  mirrorable: false,
});

// ───────────────────────────── the drains (dirty water) ─────────────────────────────

/** a drain to hop, a plinth on the far floor */
const drainHop = section({
  id: 'w7-drain',
  name: 'dirty drain',
  archetypes: ['sprint', 'relic_hunt'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 4,
  uses: [W7_THEME.drains],
  pieces: [bank('a', [360, 400]), drain('b', 'a', [380, 420]), up('k', 'b', 32, [140, 160]), down('c', 'k', 32, [200, 240])],
  last: 'c',
  sockets: [petals('a', 'a', 0.45, 2, 90), foe('frog', 'b', [0.55, 0.65], ['frog', 'tayra'], 2.5, { phases: LIVE, chance: 0.7 }), petals('k', 'k', 0.5, 1), relic('r', 'c', 0.5)],
  mirrorable: true,
});

/** two drains with a long floor between, an animal on it */
const drainPair = section({
  id: 'w7-drain-pair',
  name: 'two drains',
  archetypes: ['sprint', 'relic_hunt'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 5,
  uses: [W7_THEME.drains],
  pieces: [bank('a', [360, 400]), drain('b', 'a', [420, 460]), drain('c', 'b', [360, 400])],
  last: 'c',
  sockets: [petals('a', 'a', 0.5, 1), foe('foe', 'b', [0.45, 0.55], SMALL, 3, { phases: LIVE }), scenery('urn', 'c', [0.4, 0.6]), relic('r', 'c', 0.7)],
  mirrorable: true,
});

/** a drain, a step up onto a plinth floor, a rubble gap (soft) after it */
const drainRise = section({
  id: 'w7-drain-rise',
  name: 'drain and rubble',
  archetypes: ['sprint', 'relic_hunt'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: [W7_THEME.drains],
  pieces: [bank('a', [360, 400]), drain('b', 'a', [360, 400]), up('k', 'b', 34, [140, 160]), down('b2', 'k', 34, [200, 240]), wide('c', 'b2', [300, 340])],
  last: 'c',
  sockets: [petals('a', 'a', 0.5, 2, 90), petals('k', 'k', 0.5, 1), foe('foe', 'c', [0.55, 0.7], [...CATS, 'frog'], 5, { phases: HOT, chance: 0.6 })],
  mirrorable: true,
});

// ───────────────────────────── the searches: courtyards (7-3, 7-7) ─────────────────────────────

/** a sunken courtyard: a step down, a relic in it, a frog, two hops out */
const courtyard = section({
  id: 'w7-courtyard',
  name: 'sunken courtyard search',
  archetypes: ['relic_hunt'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 4,
  uses: [W7_THEME.courtyard],
  pieces: [bank('a', [200, 240]), down('yard', 'a', 60, [460, 500]), up('k', 'yard', 30, [140, 160]), down('yard2', 'k', 30, [200, 240]), up('b', 'yard2', 60, [240, 280])],
  last: 'b',
  sockets: [scenery('statue', 'a', [0.4, 0.6]), relic('r', 'yard', 0.3), foe('foe', 'yard', [0.7, 0.8], ['frog', 'boa'], 3, { phases: LIVE, chance: 0.7 }), petals('k', 'k', 0.5, 1), relic('r2', 'yard2', 0.5)],
  mirrorable: true,
});

/** two courtyards side by side, a plinth between, relics in each */
const twinCourts = section({
  id: 'w7-twin-courts',
  name: 'twin courtyards search',
  archetypes: ['relic_hunt'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 5,
  uses: [W7_THEME.courtyard],
  pieces: [bank('a', [200, 240]), down('y1', 'a', 60, [380, 420]), up('m', 'y1', 60, [200, 240]), down('y2', 'm', 60, [380, 420]), up('b', 'y2', 60, [240, 280])],
  last: 'b',
  sockets: [relic('r1', 'y1', 0.5), foe('f1', 'y1', [0.75, 0.82], ['frog'], 1.5, { phases: LIVE, chance: 0.6 }), petals('m', 'm', 0.5, 2, 90), relic('r2', 'y2', 0.4), foe('f2', 'y2', [0.75, 0.82], ['boa', 'ocelot'], 3, { phases: HOT, chance: 0.6 })],
  mirrorable: true,
});

/** a courtyard with a rubble gap in its floor and a high floor past it */
const courtGap = section({
  id: 'w7-court-gap',
  name: 'broken courtyard search',
  archetypes: ['relic_hunt'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: [W7_THEME.courtyard],
  pieces: [bank('a', [200, 240]), down('yard', 'a', 60, [240, 280]), up('yk', 'yard', 30, [140, 160]), down('yard1', 'yk', 30, [180, 200]), wide('yard2', 'yard1', [300, 340]), up('b', 'yard2', 60, [240, 280])],
  last: 'b',
  sockets: [relic('r', 'yard', 0.4), petals('yk', 'yk', 0.5, 1), petals('y2', 'yard2', 0.4, 2, 90), foe('foe', 'yard2', [0.7, 0.8], ['ocelot', 'tayra'], 3, { phases: LIVE, chance: 0.6 }), relic('r2', 'b', 0.5)],
  mirrorable: true,
});

/**
 * 7-3 Ten Chairs: the courtyard of the ring (a long floor, a ring of ten stone chairs and a plain eleventh, one knocked over: the
 * story's wayside line), a relic beside it
 */
const chairRing = section({
  id: 'w7-chair-ring',
  name: 'the ring of chairs search',
  archetypes: ['relic_hunt'],
  phases: ['sho', 'ten'],
  difficulty: 3,
  maxPerStage: 1,
  weight: 3,
  pieces: [bank('a', [200, 240]), up('k', 'a', 30, [150, 170]), down('ring', 'k', 30, [520, 560]), up('k2', 'ring', 30, [150, 170]), down('b', 'k2', 30, [200, 240])],
  last: 'b',
  sockets: [petals('k', 'k', 0.5, 1), prop('chairs', 'ring', 0.5, ['ring'], { easy: 'keep' }), relic('r', 'ring', 0.85), petals('k2', 'k2', 0.5, 1), scenery('statue', 'b', [0.5, 0.7], 0.8)],
  mirrorable: false,
});

// ───────────────────────────── the gates (each stage's start: its theme, and Pokey's line for a shut shrine) ─────────────────────────────

const gateFloor = (extra: Socket[] = []): { pieces: SectionPiece[]; last: string; sockets: Socket[] } => {
  const p = plinths('', 'a', 2, [200, 240]);
  return { pieces: [bank('a', [240, 280]), ...p.pieces], last: p.last, sockets: [petals('k1', 'k1', 0.5, 1), petals('k2', 'k2', 0.5, 1), ...extra] };
};

const gate = (id: string, name: string, theme: W7Theme, archetypes: SectionTemplate['archetypes'], line: string | null, extra: Socket[] = []): SectionTemplate => {
  const g = gateFloor(extra);
  return section({
    id,
    name,
    archetypes,
    phases: ['start'],
    difficulty: 1,
    teaches: theme,
    weight: 6,
    pieces: g.pieces,
    last: g.last,
    sockets: [...(line ? [tip(line, 'a', 0.15)] : []), ...g.sockets],
    mirrorable: false,
  });
};

/** 7-1 The Open Door: the temple door stands open (an archway on the first floor) */
const doorGates = (['galleries', 'walls', 'drains'] as const).map((t) =>
  gate(`w7-door-gate-${t}`, `the open door: ${t}`, W7_THEME[t], ['sprint'], null, [prop('arch', 'a', [0.5, 0.6], ['scenery'], { chance: 1 })]),
);
/** 7-6 Falling Floors */
const floorGates = (['stairs', 'galleries', 'drains'] as const).map((t) => gate(`w7-floor-gate-${t}`, `falling floors: ${t}`, W7_THEME[t], ['sprint'], null, [scenery('column', 'f1', [0.4, 0.6], 0.8)]));
/** the searches (7-3, 7-7): Pokey says the shrine is sealed until the relics are found */
const searchGates = (['courtyard', 'walls', 'galleries'] as const).map((t) =>
  gate(`w7-search-gate-${t}`, `the search: ${t}`, W7_THEME[t], ['relic_hunt'], 'relics', [scenery('statue', 'f1', [0.4, 0.6], 0.8)]),
);
/** 7-5 (a purge) and 7-9 (a gauntlet): the shut shrine */
const huntGates = (['cats', 'boas', 'harpies'] as const).flatMap((t) => [
  gate(`w7-hunt-gate-${t}`, `the sentries' halls: ${t} (arena gate)`, W7_THEME[t], ['purge'], 'hunt', [scenery('brazier', 'f1', [0.4, 0.6], 0.8)]),
  gate(`w7-fight-gate-${t}`, `the golem's hall: ${t} (arena gate)`, W7_THEME[t], ['gauntlet'], 'fight', [scenery('statue', 'f1', [0.4, 0.6], 0.8)]),
]);

// ───────────────────────────── 7-5 and 7-9: the halls' hunters ─────────────────────────────

const guardPl = plinths('', 'a', 2, [280, 320]);
/** any hunt: a floor over two plinths, hunters along it */
const guardFloor = section({
  id: 'w7-guard-floor',
  name: 'guarded floor arena',
  archetypes: ['purge', 'gauntlet'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 5,
  weight: SHARED / 2,
  pieces: [bank('a', [340, 380]), ...guardPl.pieces],
  last: guardPl.last,
  sockets: [foe('f1', 'a', [0.55, 0.7], SMALL, 3), petals('k1', 'k1', 0.5, 1), foe('f2', 'f1', [0.4, 0.6], SMALL, 3, { phases: LIVE }), petals('k2', 'k2', 0.5, 1), foe('f3', 'f2', [0.5, 0.7], [...CATS, 'boa'], 5, { phases: HOT, chance: 0.7 })],
  mirrorable: true,
});

/** any hunt: a sunken hall (down and back up, a plinth in its second half), two animals in it */
const sunkenHall = section({
  id: 'w7-sunken-hall',
  name: 'sunken hall arena',
  archetypes: ['purge', 'gauntlet'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  weight: SHARED / 2,
  pieces: [bank('a', [180, 220]), down('yard', 'a', 46, [380, 420]), up('mid', 'yard', 30, [160, 190]), down('yard2', 'mid', 30, [180, 200]), up('yk', 'yard2', 20, [90, 110]), down('yard3', 'yk', 20, [170, 190]), up('b', 'yard3', 46, [260, 300])],
  last: 'b',
  sockets: [petals('a', 'a', 0.5, 1), foe('f1', 'yard', [0.45, 0.6], SMALL, 3), petals('mid', 'mid', 0.5, 1), foe('f2', 'yard3', [0.4, 0.6], [...CATS, 'boa'], 5, { phases: LIVE }), scenery('column', 'b', [0.5, 0.7])],
  mirrorable: true,
});

const catPl = plinths('', 'a', 3, [260, 300], [30, 40]);
/** cats: three plinths, an ocelot on each flat between (hop, fight, hop) */
const catHalls = section({
  id: 'w7-cat-halls',
  name: 'cats plinths arena',
  archetypes: ['purge', 'gauntlet'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: [W7_THEME.cats],
  pieces: [bank('a', [200, 240]), ...catPl.pieces],
  last: catPl.last,
  sockets: [petals('k1', 'k1', 0.5, 1), foe('f1', 'f1', [0.45, 0.6], ['ocelot'], 3), petals('k2', 'k2', 0.5, 1), foe('f2', 'f2', [0.45, 0.6], ['ocelot', 'tayra'], 3, { phases: LIVE }), petals('k3', 'k3', 0.5, 1), foe('f3', 'f3', [0.5, 0.6], CATS, 5, { phases: HOT, chance: 0.6 })],
  mirrorable: true,
});

const jagPl = plinths('', 'a', 2, [360, 400], [32, 44]);
/** cats: the jaguar's court, two plinths, the big cat at the end */
const jaguarCourt = section({
  id: 'w7-jaguar-court',
  name: 'jaguar court arena',
  archetypes: ['purge', 'gauntlet'],
  phases: ['ten', 'ketsu'],
  difficulty: 8,
  uses: [W7_THEME.cats],
  pieces: [bank('a', [260, 300]), ...jagPl.pieces],
  last: jagPl.last,
  sockets: [petals('k1', 'k1', 0.5, 1), foe('f1', 'f1', [0.5, 0.6], ['ocelot', 'tayra'], 3), petals('k2', 'k2', 0.5, 1), foe('f2', 'f2', [0.5, 0.65], ['jaguar', 'ocelot'], 5)],
  mirrorable: true,
});

/** boas: coiled in the corners of a sunken hall, a frog between */
const boaHall = section({
  id: 'w7-boa-hall',
  name: 'boa hall arena',
  archetypes: ['purge', 'gauntlet'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: [W7_THEME.boas],
  pieces: [bank('a', [200, 240]), down('yard', 'a', 60, [560, 600]), up('k', 'yard', 30, [140, 160]), down('yard2', 'k', 30, [300, 340]), up('b', 'yard2', 60, [240, 280])],
  last: 'b',
  sockets: [foe('b1', 'yard', [0.2, 0.3], ['boa'], 3), foe('fr', 'yard', [0.75, 0.82], ['frog'], 1.5, { phases: LIVE }), petals('k', 'k', 0.5, 1), foe('b2', 'yard2', [0.55, 0.65], ['boa', 'ocelot'], 3, { phases: LIVE })],
  mirrorable: true,
});

const btA = hall('h1', 'a', [3], false, [240, 260]);
const btB = hall('h2', 'h1b', [3], false, [240, 260]);
/** boas: two tiled halls, a boa coiled in each (the tiles skip them, but a hunt needs its fights) */
const boaTwin = section({
  id: 'w7-boa-twin',
  name: 'two boa halls arena',
  archetypes: ['purge', 'gauntlet'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 7,
  uses: [CRUMBLE, W7_THEME.boas],
  pieces: [bank('a', [280, 300]), ...btA.pieces, ...btB.pieces],
  last: btB.last,
  sockets: [petals('t1', 'h1t2', 0.5, 2, 160), foe('b1', 'h1hall', [0.45, 0.55], ['boa'], 3), foe('f1', 'h1b', [0.5, 0.6], ['frog'], 1.5, { phases: LIVE, chance: 0.6 }), foe('b2', 'h2hall', [0.45, 0.55], ['boa', 'ocelot'], 3, { phases: LIVE })],
  mirrorable: false,
});

/** boas: the gallery hunt (7-9): a hall of boas under a tile run (the tiles skip them; a gauntlet still needs its fights) */
const boaGal = hall('', 'a', [3]);
const boaGallery = section({
  id: 'w7-boa-gallery',
  name: 'boa gallery arena',
  archetypes: ['purge', 'gauntlet'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 7,
  uses: [CRUMBLE, W7_THEME.boas],
  pieces: [bank('a', [340, 380]), ...boaGal.pieces],
  last: boaGal.last,
  sockets: [foe('f1', 'a', [0.4, 0.5], SMALL, 3), petals('t', 't2', 0.5, 2, 200), foe('b1', 'hall', [0.45, 0.55], ['boa'], 3, { phases: LIVE }), foe('f2', 'b', [0.55, 0.7], ['ocelot', 'tayra'], 3, { phases: HOT, chance: 0.6 })],
  mirrorable: false,
});

/** harpies: a long floor for the harpy to slide on, past a rubble gap */
const harpyFloor = section({
  id: 'w7-harpy-floor',
  name: 'harpy floor arena',
  archetypes: ['purge', 'gauntlet'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 7,
  uses: [W7_THEME.harpies],
  pieces: [bank('a', [360, 400]), wide('flat', 'a', [460, 500], [0.45, 0.6]), wide('b', 'flat', [360, 400], [0.45, 0.6])],
  last: 'b',
  sockets: [petals('a', 'a', 0.5, 1), foe('harpy', 'flat', [0.45, 0.55], ['harpy'], 4), foe('f2', 'b', [0.4, 0.6], ['tayra'], 2.5, { phases: HOT, chance: 0.6 })],
  mirrorable: true,
});

/** harpies: a tayra on the floor, a brown-vine wall, the harpy on the long floor past it */
const harpyWall = section({
  id: 'w7-harpy-wall',
  name: 'harpy wall arena',
  archetypes: ['purge', 'gauntlet'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: [W7_THEME.harpies],
  pieces: [bank('a', [380, 420]), ...wall('v', 'a', 'top', 220, [220, 260], 'b', [460, 500])],
  last: 'b',
  sockets: [foe('t1', 'a', [0.35, 0.45], ['tayra', 'frog'], 2.5), petals('top', 'top', 0.5, 2, 90), foe('harpy', 'b', [0.5, 0.6], ['harpy', 'tayra'], 4, { phases: LIVE })],
  mirrorable: false,
});

/** harpies: two walls, tayras on the floors between */
const tayraWalls = section({
  id: 'w7-tayra-walls',
  name: 'tayra walls arena',
  archetypes: ['purge', 'gauntlet'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 8,
  uses: [W7_THEME.harpies],
  pieces: [bank('a', [300, 340]), ...wall('v1', 'a', 'top1', 220, [200, 240], 'b', [400, 440]), ...wall('v2', 'b', 'top2', 230, [200, 240], 'c', [360, 400])],
  last: 'c',
  sockets: [foe('t1', 'a', [0.35, 0.45], ['tayra'], 2.5), petals('top1', 'top1', 0.5, 2, 90), foe('t2', 'b', [0.45, 0.55], ['tayra', 'ocelot'], 3, { phases: LIVE }), foe('h', 'c', [0.55, 0.65], ['harpy', 'jaguar'], 5, { phases: HOT, chance: 0.6 })],
  mirrorable: false,
});

// ───────────────────────────── the list ─────────────────────────────

export const W7_GROUND_SECTIONS: SectionTemplate[] = [
  colonnade,
  templeSteps,
  columnRest,
  plinthHop,
  stepUp,
  stepDown,
  rubbleLeap,
  firstTiles,
  gallery,
  longGallery,
  twinHalls,
  tileStair,
  longStair,
  stairFlat,
  brownWall,
  wallGap,
  doubleWall,
  wallCat,
  drainHop,
  drainPair,
  drainRise,
  courtyard,
  twinCourts,
  courtGap,
  chairRing,
  ...doorGates,
  ...floorGates,
  ...searchGates,
  ...huntGates,
  guardFloor,
  sunkenHall,
  catHalls,
  jaguarCourt,
  boaHall,
  boaTwin,
  boaGallery,
  harpyFloor,
  harpyWall,
  tayraWalls,
];

/** the sections that hold crumbling tiles (the tests hold each to the tile rules, and every roll to not needing them) */
export const W7_TILE_SECTIONS: readonly string[] = W7_GROUND_SECTIONS.filter((s) => s.pieces.some((p) => p.crumble)).map((s) => s.id);

/**
 * The sections only some stages of World 7 hold (stage numbers); the rest go where their archetypes and phases allow. The two sprints
 * keep apart (7-1 the door, its galleries, walls and drains; 7-6 the stairs and long galleries), and so do the two searches' gates
 * (both searches use the same gates and courtyards: their rooms and the ring set them apart).
 */
export const W7_STAGE_ONLY: Readonly<Record<string, readonly number[]>> = Object.fromEntries([
  ...doorGates.map((s) => [s.id, [1]] as const),
  ...floorGates.map((s) => [s.id, [6]] as const),
  ['w7-first-tiles', [1]] as const,
  ['w7-chair-ring', [3]] as const,
  ...['w7-tile-stair', 'w7-long-stair', 'w7-stair-flat'].map((id) => [id, [6]] as const),
  ...['w7-brown-wall', 'w7-wall-gap', 'w7-double-wall', 'w7-wall-cat'].map((id) => [id, [1, 3, 7]] as const),
  ...['w7-gallery', 'w7-long-gallery', 'w7-twin-halls'].map((id) => [id, [1, 3, 6, 7, 9]] as const),
  ...['w7-drain', 'w7-drain-pair', 'w7-drain-rise'].map((id) => [id, [1, 6, 7]] as const),
]);
