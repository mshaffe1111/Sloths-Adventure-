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
import type { Zone } from '../../zones.ts';
import type { Difficulty, Phase, PropDef, PropEmitter, SectionPiece, SectionTemplate, Socket, StageSink, WorldKit } from '../types.ts';
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
  pieces: [bank('a', [200, 240]), up('knee', 'a', 40, [140, 170]), down('b', 'knee', 40, [240, 280]), up('knee2', 'b', 40, [110, 140]), down('c', 'knee2', 40, [160, 200])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: 0,
  sockets: [scenery('lilies', 'a', [0.2, 0.4]), petals('knee', 'knee', 0.5, 2, 80), flag('b', 0.5), petals('knee2', 'knee2', 0.5, 1), scenery('snag', 'c', [0.6, 0.8], 0.5)],
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
  pieces: [bank('a', [160, 200]), hop('b', 'a', [420, 480], [0.3, 0.4]), up('mid', 'b', 40, [110, 140]), down('b2', 'mid', 40, [320, 380]), up('knee', 'b2', 40, [140, 170]), down('c', 'knee', 40, [180, 220])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: 0,
  sockets: [
    watch('b'),
    hideAt('h1', 'b', 0.15),
    petals('pb', 'b', 0.55, 2, 90),
    hideAt('h2', 'b', 0.9),
    petals('mid', 'mid', 0.5, 1),
    hideAt('h3', 'b2', 0.5),
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

/** a liana past `after`'s end: its anchor 400-420 px up (the core's default is 360-420; a longer one throws him further, so its perch
 *  can lie past the leaf glide's reach with the release window kept) */
const liana = (key: string, after: string): SectionPiece => ({ key, shape: 'liana', w: 0, place: { kind: 'swing', after, top: [400, 420] } });
/**
 * How far a perch sits above its swing's ledge (dy, up is negative): 80 px (the lead, 2026-10-29, from gen2-core 842a81c under vine-fix's
 * calmer swing). A level perch past the leaf glide's 477 px is out of the calmer swing's reach (levelCheck links 480-510 px at most);
 * raised 80 px, the glide reaches only ~307 px and the swing links 440-480 px. Each raised perch steps back down after it (`down`), so a
 * section ends level with where it began.
 */
const RAISE = -80;
/**
 * the perch past a liana (`dy` from the swing's ledge), a landing (Easy widens it). The gap under the swing is black water (core
 * `water: true`): a soft pit there would let him walk under the liana and out the far side, and the swing would be optional (the lead,
 * 2026-10-28; Matt on Meeca's stage). So the swing is the only way on, and a miss costs a life, warned by Dot first (WATER_WARN)
 */
const perch = (key: string, after: string, w: SectionPiece['w'], dy: SectionPiece['w'] = RAISE): SectionPiece => bank(key, w, { kind: 'land', after, dy, water: true }, { landing: true });
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
  pieces: [bank('a', [200, 240]), liana('l1', 'a'), perch('b', 'l1', [240, 290]), up('knee', 'b', 40, [110, 140]), down('c', 'knee', 40 - RAISE, [180, 220])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('a', 'a', 0.35, 2, 80), petals('b', 'b', 0.4, 2, 80), petals('knee', 'knee', 0.5, 1), scenery('lilies', 'c', [0.5, 0.8], 0.5)],
  weight: 2,
  mirrorable: false,
};

/** two swings with a root perch between: swing, land, swing */
const swingPair: SectionTemplate = {
  id: 'w6s-swing-pair',
  name: 'two swings, a root between',
  archetypes: ['vine_runner', 'sprint'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 5,
  pieces: [
    bank('a', [180, 220]),
    liana('l1', 'a'),
    perch('p1', 'l1', [180, 230]),
    down('p1d', 'p1', -RAISE, [140, 170]),
    liana('l2', 'p1d'),
    perch('b', 'l2', [200, 240]),
    down('c', 'b', -RAISE, [180, 220]),
  ],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('p1', 'p1', 0.5, 1), petals('b', 'b', 0.3, 2, 90), foe('foe', 'b', [0.7, 0.9], ['frog'], 1.5, { phases: ['ten', 'ketsu'], chance: 0.5 })],
  weight: 2,
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
    bank('a', [140, 170]),
    liana('l1', 'a'),
    perch('p1', 'l1', [150, 180]),
    down('p1d', 'p1', -RAISE, [110, 130]),
    liana('l2', 'p1d'),
    perch('p2', 'l2', [150, 180]),
    down('p2d', 'p2', -RAISE, [110, 130]),
    liana('l3', 'p2d'),
    perch('b', 'l3', [160, 190]),
    down('c', 'b', -RAISE, [140, 170]),
  ],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('p1', 'p1', 0.5, 1), petals('p2', 'p2', 0.5, 1), petals('b', 'b', 0.4, 2, 90)],
  weight: 2,
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
    down('c', 'wall', 230 - RAISE, [240, 300]),
  ],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('b', 'b', 0.4, 2, 80), petals('wall', 'wall', 0.5, 2, 90), foe('foe', 'c', [0.6, 0.85], SMALL, 2.5, { phases: LIVE, chance: 0.5 })],
  weight: 2,
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
  pieces: [bank('a', [180, 220]), liana('l1', 'a'), perch('b', 'l1', [380, 440]), up('mid', 'b', 40, [110, 140]), down('b2', 'mid', 40, [280, 340]), up('knee', 'b2', 40, [130, 160]), down('c', 'knee', 40 - RAISE, [160, 200])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: 0,
  sockets: [watch('b', 0.6), hideAt('h1', 'b', 0.3), petals('pb', 'b', 0.6, 2, 80), hideAt('h2', 'b', 0.95), petals('mid', 'mid', 0.5, 1), hideAt('h3', 'b2', 0.6), petals('knee', 'knee', 0.5, 1)],
  weight: 2,
  mirrorable: false,
};

/** root knees to hop, then a swing onto a root, a step down and back up */
const kneesSwing: SectionTemplate = {
  id: 'w6s-knees-swing',
  name: 'knees, then a swing',
  archetypes: ['vine_runner', 'sprint'],
  phases: ['sho', 'ten'],
  difficulty: 5,
  pieces: [bank('a', [130, 160]), hop('k1', 'a', [140, 170]), hop('k2', 'k1', [160, 190]), liana('l1', 'k2'), perch('b', 'l1', [190, 220]), down('b2', 'b', 35 - RAISE, [120, 150]), up('c', 'b2', 35, [180, 220])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('k1', 'k1', 0.5, 1), petals('k2', 'k2', 0.5, 1), petals('b', 'b', 0.5, 2, 80), foe('foe', 'c', [0.6, 0.85], SMALL, 2.5, { phases: ['ten'], chance: 0.5 })],
  weight: 2,
  mirrorable: false,
};

/** a swing onto a root bank where a hunter prowls: land, then deal with it */
const swingHunter: SectionTemplate = {
  id: 'w6s-swing-hunter',
  name: 'swing onto the hunter\'s bank',
  archetypes: ['vine_runner', 'sprint'],
  phases: ['ten', 'ketsu'],
  difficulty: 6,
  pieces: [bank('a', [180, 220]), liana('l1', 'a'), perch('b', 'l1', [460, 540]), hop('c', 'b', [160, 200]), down('d', 'c', -RAISE, [160, 200])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'd', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('b', 'b', 0.2, 2, 80), foe('foe', 'b', [0.55, 0.75], ['tayra', 'ocelot', 'frog'], 3), petals('c', 'c', 0.5, 1)],
  weight: 2,
  mirrorable: false,
};

/** a swing onto a root, a drop onto a low root below it, and a climbing vine up the root wall past it */
const swingDropClimb: SectionTemplate = {
  id: 'w6s-swing-drop-climb',
  name: 'swing, drop, climb the root wall (run)',
  archetypes: ['vine_runner', 'sprint'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  weight: 2,
  pieces: [
    bank('a', [180, 220]),
    liana('l1', 'a'),
    perch('b', 'l1', [200, 240]),
    down('b2', 'b', 80 - RAISE, [140, 170]),
    ...climbWall('v', 'b2', 'wall', 200, [200, 240]),
    down('c', 'wall', 120, [200, 240]),
  ],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('a', 'a', 0.4, 1), petals('b', 'b', 0.5, 1), petals('b2', 'b2', 0.5, 1), petals('wall', 'wall', 0.5, 2, 90), foe('foe', 'c', [0.6, 0.85], SMALL, 2.5, { phases: ['ten', 'ketsu'], chance: 0.4 })],
  mirrorable: false,
};

/** a swing, then a quick run of knees and hops (a sprint's rhythm: swing, hop, hop, hop) */
const swingRun: SectionTemplate = {
  id: 'w6s-swing-run',
  name: 'a swing, then the knees (run)',
  archetypes: ['vine_runner', 'sprint'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 5,
  weight: 2,
  pieces: [
    bank('a', [180, 220]),
    liana('l1', 'a'),
    perch('b', 'l1', [200, 240]),
    up('k1', 'b', 45, [100, 130]),
    down('c', 'k1', 45 - RAISE, [120, 150]),
    hop('d', 'c', [150, 180]),
    hop('e', 'd', [220, 260]),
  ],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'e', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('b', 'b', 0.5, 1), petals('k1', 'k1', 0.5, 1), petals('d', 'd', 0.5, 1), foe('foe', 'e', [0.6, 0.85], ['frog', 'tayra'], 2.5, { phases: LIVE, chance: 0.5 })],
  mirrorable: false,
};

// ───────────────────────────── 6-6: the dark roots, and the firefly's light ─────────────────────────────
//
// "The roots go dark. Let the firefly light the way." A dark stretch is the engine's `dark` zone (zones.ts; World 8's darkness) over a
// run of roots, laid by a pair of props at its ends (W6S_PROP darkFrom, darkTo: their emitters push the zone into StageSink.zones), with the
// firefly's lights hanging over every gap (r 190) and a dimmer one every 420 px, so the dark is never total. Gaps in the dark are soft
// (STAGE-RULES §6: a gap in the dark over water is a blind jump), a hop a third of a jump at most; nothing stands in the dark (the core
// keeps animals and flags out of a zone). The first dark stretch of a stage says Dot's line before it (its tip socket).

/** the dark's lesson key and Dot's line (new, needs Matt's approval) */
export const W6_DARK = 'w6:dark';
export const W6S_TIPS: Record<string, string> = { [W6_DARK]: 'The roots go dark. Stay in the firefly\'s light.' };

/** the props that lay a dark stretch: its start, its end (with the firefly's lights), and a room's end (no lights: its firefly is the
 *  room's own glow, puzzleKit 'glow') */
export const W6S_PROP = { darkFrom: 'darkFrom', darkTo: 'darkTo', darkToBare: 'darkToBare' } as const;
export const W6S_PROPS: PropDef[] = [
  { id: W6S_PROP.darkFrom, tags: [W6S_PROP.darkFrom], w: 10, minApart: 0 },
  { id: W6S_PROP.darkTo, tags: [W6S_PROP.darkTo], w: 10, minApart: 0 },
  { id: W6S_PROP.darkToBare, tags: [W6S_PROP.darkToBare], w: 10, minApart: 0 },
];
/** the dark's box over its ground, and the firefly's lights: over a gap, and along the way */
export const DARK_ZONE = { up: 800, down: 400, gapLight: 190, wayLight: 130, every: 420, lightUp: 90 } as const;

/** a dark stretch's two ends, as sockets on its first and last pieces */
export const darkEnds = (from: string, to: string, lights = true): Socket[] => [
  { id: 'darkFrom', role: 'prop', on: from, t: 0, allow: [W6S_PROP.darkFrom], easy: 'keep' },
  { id: 'darkTo', role: 'prop', on: to, t: 1, allow: [lights ? W6S_PROP.darkTo : W6S_PROP.darkToBare], easy: 'keep' },
];

/** the end of a dark stretch filled first, waiting for the other (in sink.extras: one at a time, a section's own two) */
const OPEN = 'w6sDarkFrom';

/** the ground under x (a piece whose top is within a step of the dark's ground): no ground, a gap the firefly hangs over */
function groundAt(out: StageSink, x: number, y: number): boolean {
  return out.platforms.some((p) => x >= p.x && x <= p.x + p.width && p.y >= y - 140 && p.y <= y + 40);
}

/** the dark stretch from the open start to `x1`, with the firefly's lights (or none) */
function darkZone(out: StageSink, x0: number, y: number, x1: number, lights: boolean): Zone {
  const L: NonNullable<Zone['lights']> = [];
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

/**
 * The dark props' emitters: the first end filled remembers its spot, the second lays the dark between them (a mirrored section reads its
 * sockets 1 - t, so its "end" comes first: either order works). The end socket says whether the firefly's lights hang in it.
 */
export const W6S_EMIT: Record<string, PropEmitter> = {
  darkFrom: (f, _p, out) => darkEnd(out, f.x, f.y, null),
  darkTo: (f, _p, out) => darkEnd(out, f.x, f.y, true),
  darkToBare: (f, _p, out) => darkEnd(out, f.x, f.y, false),
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

const darkTip = (on: string): Socket => ({ id: 'tip-dark', role: 'tip', on, t: 0.1, allow: [W6_DARK] });

/** a run of roots in the dark: knees and soft hops, the firefly over each gap */
const darkRoots: SectionTemplate = {
  id: 'w6s-dark-roots',
  name: 'the dark roots (run)',
  archetypes: ['sprint'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 5,
  teaches: W6_DARK,
  pieces: [
    bank('a', [200, 240]),
    hop('b', 'a', [180, 220], [0.3, 0.38], false),
    up('k', 'b', 45, [120, 150]),
    down('c', 'k', 45, [160, 200]),
    hop('d', 'c', [180, 220], [0.3, 0.38], false),
    hop('e', 'd', [240, 280], [0.3, 0.38], false),
  ],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'e', kind: 'ground' },
  exitDy: 0,
  sockets: [darkTip('a'), ...darkEnds('a', 'e'), petals('b', 'b', 0.5, 1), petals('k', 'k', 0.5, 1), petals('d', 'd', 0.5, 1), petals('e', 'e', 0.4, 2, 80)],
  weight: 2,
  mirrorable: true,
};

/** roots stepping up and down in the dark, a hop between */
const darkSteps: SectionTemplate = {
  id: 'w6s-dark-steps',
  name: 'the dark root steps (run)',
  archetypes: ['sprint'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  teaches: W6_DARK,
  pieces: [
    bank('a', [180, 220]),
    up('b', 'a', 55, [130, 160]),
    hop('c', 'b', [140, 170], [0.3, 0.38], false),
    up('d', 'c', 55, [130, 160]),
    hop('e', 'd', [150, 180], [0.3, 0.38], false),
    down('f', 'e', 55, [110, 130]),
    down('g', 'f', 55, [180, 220]),
  ],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'g', kind: 'ground' },
  exitDy: 0,
  sockets: [darkTip('a'), ...darkEnds('a', 'g'), petals('b', 'b', 0.5, 1), petals('c', 'c', 0.5, 1), petals('d', 'd', 0.5, 1), petals('e', 'e', 0.5, 1)],
  weight: 2,
  mirrorable: true,
};

/** a long dark: knees, hops and a step, two runs of the firefly's light (the climax of 6-6) */
const darkLong: SectionTemplate = {
  id: 'w6s-dark-long',
  name: 'the long dark (run)',
  archetypes: ['sprint'],
  phases: ['ten', 'ketsu'],
  difficulty: 7,
  teaches: W6_DARK,
  maxPerStage: 1,
  pieces: [
    bank('a', [160, 200]),
    hop('b', 'a', [150, 180], [0.3, 0.38], false),
    hop('c', 'b', [150, 180], [0.3, 0.38], false),
    up('k', 'c', 50, [110, 140]),
    down('d', 'k', 50, [150, 180]),
    hop('e', 'd', [160, 200], [0.3, 0.38], false),
    up('f', 'e', 50, [120, 150]),
    down('g', 'f', 50, [200, 240]),
  ],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'g', kind: 'ground' },
  exitDy: 0,
  sockets: [darkTip('a'), ...darkEnds('a', 'g'), petals('b', 'b', 0.5, 1), petals('c', 'c', 0.5, 1), petals('k', 'k', 0.5, 1), petals('e', 'e', 0.5, 1), petals('f', 'f', 0.5, 1)],
  weight: 2,
  mirrorable: true,
};

/** a root wall in the dark: a hop, the climbing vine up it in the firefly's light, down the far side, a hop out */
const darkClimb: SectionTemplate = {
  id: 'w6s-dark-climb',
  name: 'the dark root wall (run)',
  archetypes: ['sprint'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  teaches: W6_DARK,
  weight: 2,
  pieces: [
    bank('a', [180, 220]),
    hop('b', 'a', [220, 260], [0.3, 0.38], false),
    ...climbWall('v', 'b', 'wall', 220, [200, 240]),
    down('c', 'wall', 220, [160, 200]),
    hop('d', 'c', [220, 260], [0.3, 0.38], false),
  ],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'd', kind: 'ground' },
  exitDy: 0,
  sockets: [darkTip('a'), ...darkEnds('a', 'd'), petals('b', 'b', 0.4, 1), petals('wall', 'wall', 0.5, 2, 90), petals('d', 'd', 0.5, 1)],
  mirrorable: false,
};

// ───────────────────────────── the set ─────────────────────────────

/** World 6's swing-stage sections: the root ground, the swings and climbs, the dark roots */
export const W6_SWING_SECTIONS: readonly SectionTemplate[] = [
  rootIsland, rootKnees, perchSteps, watchedRoot, humpRun,
  firstSwing, swingPair, swingChain, swingClimb, vineWall, swingWatch, kneesSwing, swingHunter, swingDropClimb, swingRun,
  darkRoots, darkSteps, darkLong, darkClimb,
];

/**
 * World 6's kit for stage `stage` with the swing sections and that stage's puzzle room joined (the world's own manifest, gen2/worlds/w6.ts, stays as it is: the
 * lead folds the lists together, step G)
 */
export function withW6Swing(kit: WorldKit, stage: number, difficulty: Difficulty = 'normal'): WorldKit {
  const k = withW6Rooms(kit, stage, difficulty);
  const M = k.manifest;
  const have = new Set(M.sections.map((s) => s.id));
  return {
    ...k,
    emit: { ...W6S_EMIT, ...(k.emit ?? {}) },
    manifest: {
      ...M,
      sections: [...M.sections, ...W6_SWING_SECTIONS.filter((s) => !have.has(s.id))],
      props: [...M.props, ...W6S_PROPS.filter((p) => !M.props.some((q) => q.id === p.id))],
      tips: { ...W6S_TIPS, ...(M.tips ?? {}) },
    },
  };
}
