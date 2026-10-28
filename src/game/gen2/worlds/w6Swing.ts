/**
 * gen2/worlds/w6Swing — World 6's swing sections, root perches and dark-root stretches (DESIGN.md B9, phase 3), for 6-1 "The Root Maze",
 * 6-3 "Root to Root", 6-6 "Lights in the Roots" and 6-7 "Through the Roots" (stagePlan.ts; reference/STORY-REWRITE.md "World 6").
 *
 * The Deep Mangrove: roots stand up out of flat black water in a maze; the water between them costs a life (manifest pit 'water', on
 * Easy too, with Dot's warning first: pipeline WATER_WARN). So the rules every section here keeps (STAGE-RULES §6, the first-timer lessons):
 *   - World 6's gaps are soft until the core's water pits land (w6.ts header); a hop over what will be water is a third to a half of a jump, never a lower stone, never a second-jump gap (those go over a soft root floor);
 *   - a root perch is a whole bank down to the ground (a wall reaches the floor); every rise is one plain hop;
 *   - nothing crumbles.
 *
 * This file's first part is the ground the swings join: root islands (start, rests, the shrine's approach), root knees to hop, root
 * perches stepping up and down, a long root the water watches (6-2's lesson: duck into the roots). Every beat is ground the route
 * crosses (a knee stepped onto and off, a hop over the water): a stump standing on a bank is walked past (STAGE-RULES §6). The liana sections (a chain of ledge -> liana -> ledge, never liana to liana: levelCheck follows a swing
 * from a ledge to a ledge) and the dark-root stretches lit by the firefly come once the gen2 core's liana piece and dark zone land.
 */
import type { Difficulty, Phase, SectionPiece, SectionTemplate, Socket, WorldKit } from '../types.ts';
import { withW6Rooms } from './w6Rooms.ts';

// ───────────────────────────── the tags (World 6's manifest, gen2/worlds/w6.ts W6_TAG, names what these ask for) ─────────────────────────────

export const W6S_TAG = {
  /** the watched water (w6.ts prop 'watch'): the spear rises and looks along the bank; taught in 6-2 */
  watch: 'watch',
  /** a root den or a reed bed to duck into while it looks */
  hide: 'hide',
  cover: 'cover',
  /** lily pads, snags: scenery at the water's edge */
  scenery: 'scenery',
  /** what keeps a vine stage's bag on its swings (pipeline WANT.vine_runner) */
  swing: 'swing',
  /** a sprint's want (pipeline WANT.sprint) */
  run: 'run',
} as const;
/** the watching water's lesson key (w6.ts W6_LESSON.watch; taught in 6-2) */
const WATCH = 'watch';
const SMALL = ['frog', 'tayra', 'ocelot'];

// ───────────────────────────── helpers ─────────────────────────────

type Opt = Partial<Socket>;
const petals = (id: string, on: string, t: Socket['t'], count = 2, span = 120, o: Opt = {}): Socket => ({ id, role: 'pickup', on, t, dn: 34, count, span, ...o });
/** an animal: `kinds` creature ids or tags it may be; `max` the most threat it may take */
const foe = (id: string, on: string, t: Socket['t'], kinds: string[] = SMALL, max = 3, o: Opt = {}): Socket => ({ id, role: 'enemy', on, t, allow: kinds, maxThreat: max, easy: 'soften', ...o });
const prop = (id: string, on: string, t: Socket['t'], allow: string[], o: Opt = {}): Socket => ({ id, role: 'prop', on, t, allow, ...o });
const scenery = (id: string, on: string, t: Socket['t'], chance = 0.6) => prop(id, on, t, [W6S_TAG.scenery], { chance });
const hideAt = (id: string, on: string, t: Socket['t']) => prop(id, on, t, [W6S_TAG.hide, W6S_TAG.cover]);
const watch = (on: string, t: Socket['t'] = 0.5, id = 'watch') => prop(id, on, t, [W6S_TAG.watch]);
const flag = (on: string, t: Socket['t']): Socket => ({ id: 'flag', role: 'flag', on, t });

const LIVE: Phase[] = ['sho', 'ten', 'ketsu'];

const bank = (key: string, w: SectionPiece['w'], place: SectionPiece['place'] = { kind: 'start' }, o: Partial<SectionPiece> = {}): SectionPiece => ({ key, shape: 'bank', w, place, ...o });
/** a root knee or a perch: a step up `dy` px (one plain hop), or down */
const up = (key: string, after: string, dy: number, w: SectionPiece['w']): SectionPiece => bank(key, w, { kind: 'walk', after, dy: -dy });
const down = (key: string, after: string, dy: number, w: SectionPiece['w']): SectionPiece => bank(key, w, { kind: 'walk', after, dy });
/** a hop over the water: a third of a jump or so (soft now, water once the core's water pits land: w6.ts header) */
const hop = (key: string, after: string, w: SectionPiece['w'], share: SectionPiece['w'] = [0.3, 0.42], landing = true): SectionPiece =>
  bank(key, w, { kind: 'pit', after, jump: 'jump', share }, landing ? { landing } : {});

// ───────────────────────────── the ground the swings join ─────────────────────────────

/** a root island: a knee to step over, petals, a flag (the start, a rest, the shrine's approach) */
const rootIsland: SectionTemplate = {
  id: 'w6s-root-island',
  name: 'root island',
  archetypes: ['vine_runner', 'sprint'],
  phases: ['start', 'rest', 'goal'],
  difficulty: 1,
  pieces: [bank('a', [220, 260]), up('knee', 'a', 40, [160, 200]), down('b', 'knee', 40, [240, 280])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'b', kind: 'ground' },
  exitDy: 0,
  sockets: [scenery('lilies', 'a', [0.2, 0.4]), petals('knee', 'knee', 0.5, 2, 80), flag('b', 0.55), scenery('snag', 'b', [0.8, 0.9], 0.5)],
  mirrorable: true,
};

/** root knees: three short hops over the black water, petals on each knee */
const rootKnees: SectionTemplate = {
  id: 'w6s-root-knees',
  name: 'root knees over the water',
  archetypes: ['vine_runner', 'sprint'],
  phases: ['ki', 'sho', 'ten'],
  difficulty: 3,
  pieces: [bank('a', [160, 200]), hop('b', 'a', [170, 210]), hop('c', 'b', [170, 210]), hop('d', 'c', [240, 300])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'd', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('a', 'a', 0.4, 2, 80), petals('b', 'b', 0.5, 1), petals('c', 'c', 0.5, 1), foe('foe', 'd', [0.7, 0.85], ['frog'], 1.5, { phases: LIVE, chance: 0.6 })],
  mirrorable: true,
};

/** root perches stepping up, one hop each, then down, and a hop over the water */
const perchSteps: SectionTemplate = {
  id: 'w6s-perch-steps',
  name: 'root perches up and down',
  archetypes: ['vine_runner', 'sprint'],
  phases: ['ki', 'sho', 'ten', 'rest'],
  difficulty: 3,
  pieces: [bank('a', [160, 200]), up('b', 'a', 60, [150, 180]), up('c', 'b', 60, [170, 200]), down('d', 'c', 60, [130, 160]), down('e', 'd', 60, [130, 160]), hop('f', 'e', [240, 300])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'f', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('b', 'b', 0.5, 1), petals('c', 'c', 0.5, 2, 90), scenery('snag', 'e', 0.5, 0.4), foe('foe', 'f', [0.6, 0.8], SMALL, 2.5, { phases: LIVE, chance: 0.5 })],
  mirrorable: true,
};

/** a long root bank the water watches (6-2 taught it): roots to duck into while the spear looks, a knee at each end */
const watchedRoot: SectionTemplate = {
  id: 'w6s-watched-root',
  name: 'the watched root cover',
  archetypes: ['vine_runner'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 5,
  uses: [WATCH],
  pieces: [bank('a', [160, 200]), hop('b', 'a', [760, 860], [0.3, 0.4]), up('knee', 'b', 40, [140, 170]), down('c', 'knee', 40, [180, 220])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: 0,
  sockets: [
    watch('b'),
    hideAt('h1', 'b', 0.1),
    petals('pb', 'b', 0.32, 2, 90),
    hideAt('h2', 'b', 0.5),
    hideAt('h3', 'b', 0.9),
    petals('knee', 'knee', 0.5, 1),
    foe('foe', 'c', [0.6, 0.8], ['frog'], 1.5, { phases: ['ten', 'ketsu'], chance: 0.5 }),
  ],
  mirrorable: true,
};

/** root humps: up, down, up, down, then a wider hop (a sprint's quick ground) */
const humpRun: SectionTemplate = {
  id: 'w6s-hump-run',
  name: 'root humps (run)',
  archetypes: ['vine_runner', 'sprint'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 4,
  pieces: [
    bank('a', [140, 180]),
    up('h1', 'a', 50, [110, 140]),
    down('b', 'h1', 50, [160, 200]),
    up('h2', 'b', 60, [110, 140]),
    down('c', 'h2', 60, [140, 180]),
    hop('d', 'c', [260, 320], [0.36, 0.45]),
  ],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'd', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('h1', 'h1', 0.5, 1), petals('h2', 'h2', 0.5, 1), foe('foe', 'd', [0.55, 0.8], SMALL, 3, { phases: LIVE, chance: 0.6 })],
  mirrorable: true,
};

// ───────────────────────────── the swings over the black water ─────────────────────────────
//
// A liana swings by itself (Matt, 2026-10-28: a fixed amplitude and period on the game clock; up and down climb, left and right only
// turn him; letting go carries the vine's speed at his grip). Each liana hangs past a ledge's end and its perch is sized by the core
// from the release window (pipeline lianaBand: Easy 300 ms, Normal 167 ms), so the gap under it is wider than any jump: the swing is
// the way over. Chains keep a root perch between every two swings (levelCheck follows ledge -> liana -> ledge, never liana to liana).
// A liana section is never mirrored, and needs the swing move (the core infers it).

const liana = (key: string, after: string): SectionPiece => ({ key, shape: 'liana', w: 0, place: { kind: 'swing', after } });
/** the perch past a liana (`dy` from the swing's ledge), a landing (Easy widens it) */
const perch = (key: string, after: string, w: SectionPiece['w'], dy: SectionPiece['w'] = 0): SectionPiece => bank(key, w, { kind: 'land', after, dy }, { landing: true });
/** a climbing vine at the end of `on`, `h` px tall, and the root wall it leads up onto (a whole bank: out of a double jump's reach) */
const climbWall = (vine: string, on: string, wall: string, h: number, w: SectionPiece['w']): SectionPiece[] => [
  { key: vine, shape: 'vine', w: 0, place: { kind: 'climb', on, at: 1, h } },
  bank(wall, w, { kind: 'over', on: vine, at: 0, dy: 0 }, { main: true }),
];

/** one swing over the water, root to root: the first of a stage, a perch wide enough to walk on from */
const firstSwing: SectionTemplate = {
  id: 'w6s-first-swing',
  name: 'one swing over the water',
  archetypes: ['vine_runner', 'sprint'],
  phases: ['ki', 'sho'],
  difficulty: 3,
  pieces: [bank('a', [220, 280]), liana('l1', 'a'), perch('b', 'l1', [380, 460])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'b', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('a', 'a', 0.35, 2, 80), petals('b', 'b', 0.3, 2, 100), scenery('lilies', 'b', [0.7, 0.85], 0.5)],
  mirrorable: false,
};

/** two swings with a root perch between: swing, land, swing */
const swingPair: SectionTemplate = {
  id: 'w6s-swing-pair',
  name: 'two swings, a root between',
  archetypes: ['vine_runner', 'sprint'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 5,
  pieces: [bank('a', [180, 220]), liana('l1', 'a'), perch('p1', 'l1', [180, 230], [-30, 20]), liana('l2', 'p1'), perch('b', 'l2', [300, 380])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'b', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('p1', 'p1', 0.5, 1), petals('b', 'b', 0.3, 2, 90), foe('foe', 'b', [0.7, 0.9], ['frog'], 1.5, { phases: ['ten', 'ketsu'], chance: 0.5 })],
  mirrorable: false,
};

/** three swings, root perches between: the long way over the black water (a vine stage's climax) */
const swingChain: SectionTemplate = {
  id: 'w6s-swing-chain',
  name: 'three swings over the black water',
  archetypes: ['vine_runner'],
  phases: ['ten', 'ketsu'],
  difficulty: 7,
  pieces: [
    bank('a', [160, 200]),
    liana('l1', 'a'),
    perch('p1', 'l1', [160, 200], [-20, 20]),
    liana('l2', 'p1'),
    perch('p2', 'l2', [160, 200], [-20, 20]),
    liana('l3', 'p2'),
    perch('b', 'l3', [260, 320]),
  ],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'b', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('p1', 'p1', 0.5, 1), petals('p2', 'p2', 0.5, 1), petals('b', 'b', 0.4, 2, 90)],
  mirrorable: false,
  extraSeconds: 2,
};

/** a swing onto a root bank, a climbing vine up its root wall (too high to jump), and down the far side */
const swingClimb: SectionTemplate = {
  id: 'w6s-swing-climb',
  name: 'swing, then climb the root wall',
  archetypes: ['vine_runner', 'sprint'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 5,
  pieces: [
    bank('a', [180, 220]),
    liana('l1', 'a'),
    perch('b', 'l1', [260, 320]),
    ...climbWall('v', 'b', 'wall', 230, [220, 260]),
    down('c', 'wall', 230, [240, 300]),
  ],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('b', 'b', 0.4, 2, 80), petals('wall', 'wall', 0.5, 2, 90), foe('foe', 'c', [0.6, 0.85], SMALL, 2.5, { phases: LIVE, chance: 0.5 })],
  mirrorable: false,
};

/** a root wall with a climbing vine up it, petals at the top, down again (the climb taught safely, no water) */
const vineWall: SectionTemplate = {
  id: 'w6s-vine-wall',
  name: 'climb the root wall',
  archetypes: ['vine_runner', 'sprint'],
  phases: ['ki', 'sho', 'rest'],
  difficulty: 2,
  pieces: [bank('a', [300, 360]), ...climbWall('v', 'a', 'wall', 220, [240, 280]), down('b', 'wall', 220, [200, 260]), hop('c', 'b', [220, 280])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('a', 'a', 0.4, 2, 80), petals('wall', 'wall', 0.5, 3, 140), scenery('snag', 'c', 0.6, 0.5)],
  mirrorable: false,
};

/** "the water is watching": a swing onto a long watched root bank, roots to duck into while the spear looks (6-2 taught it) */
const swingWatch: SectionTemplate = {
  id: 'w6s-swing-watch',
  name: 'swing onto the watched root cover',
  archetypes: ['vine_runner'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: [WATCH],
  pieces: [bank('a', [180, 220]), liana('l1', 'a'), perch('b', 'l1', [700, 800]), up('knee', 'b', 40, [130, 160]), down('c', 'knee', 40, [160, 200])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: 0,
  sockets: [watch('b', 0.55), hideAt('h1', 'b', 0.2), petals('pb', 'b', 0.4, 2, 80), hideAt('h2', 'b', 0.6), hideAt('h3', 'b', 0.92), petals('knee', 'knee', 0.5, 1)],
  mirrorable: false,
};

/** root knees to hop, then a swing down onto a lower root and a step back up */
const kneesSwing: SectionTemplate = {
  id: 'w6s-knees-swing',
  name: 'knees, then a swing down',
  archetypes: ['vine_runner', 'sprint'],
  phases: ['sho', 'ten'],
  difficulty: 5,
  pieces: [bank('a', [150, 190]), hop('k1', 'a', [150, 180]), hop('k2', 'k1', [180, 220]), liana('l1', 'k2'), perch('b', 'l1', [220, 260], [30, 40]), up('c', 'b', 35, [240, 300])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('k1', 'k1', 0.5, 1), petals('k2', 'k2', 0.5, 1), petals('b', 'b', 0.5, 2, 80), foe('foe', 'c', [0.6, 0.85], SMALL, 2.5, { phases: ['ten'], chance: 0.5 })],
  mirrorable: false,
};

/** a swing onto a root bank where a hunter prowls: land, then deal with it */
const swingHunter: SectionTemplate = {
  id: 'w6s-swing-hunter',
  name: 'swing onto the hunter\'s bank',
  archetypes: ['vine_runner', 'sprint'],
  phases: ['ten', 'ketsu'],
  difficulty: 6,
  pieces: [bank('a', [180, 220]), liana('l1', 'a'), perch('b', 'l1', [460, 540]), hop('c', 'b', [220, 260])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('b', 'b', 0.2, 2, 80), foe('foe', 'b', [0.55, 0.75], ['tayra', 'ocelot', 'frog'], 3), petals('c', 'c', 0.5, 1)],
  mirrorable: false,
};

// ───────────────────────────── the set ─────────────────────────────

/** World 6's swing-stage sections: the root ground, the swings and climbs (the dark-root stretches join them with the core's dark zone) */
export const W6_SWING_SECTIONS: readonly SectionTemplate[] = [
  rootIsland, rootKnees, perchSteps, watchedRoot, humpRun,
  firstSwing, swingPair, swingChain, swingClimb, vineWall, swingWatch, kneesSwing, swingHunter,
];

/**
 * World 6's kit for stage `stage` with the swing sections and that stage's puzzle room joined (the world's own manifest, gen2/worlds/w6.ts, stays as it is: the
 * lead folds the lists together, step G)
 */
export function withW6Swing(kit: WorldKit, stage: number, difficulty: Difficulty = 'normal'): WorldKit {
  const k = withW6Rooms(kit, stage, difficulty);
  const have = new Set(k.manifest.sections.map((s) => s.id));
  return { ...k, manifest: { ...k.manifest, sections: [...k.manifest.sections, ...W6_SWING_SECTIONS.filter((s) => !have.has(s.id))] } };
}
