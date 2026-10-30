/**
 * gen2/worlds/w7Swing — World 7's swing and climb sections (DESIGN.md B11, B12 step 2): the lianas over the broken temple floor and the
 * brown vines up the old walls, with the ruin ground that joins them (reference/STORY-REWRITE.md "World 7: Ancient Ruins": "The vines on
 * the old walls hung brown. When he touched one, it didn't move."; statues; the courtyard of the ten stone chairs).
 *
 * The rules every section here keeps (STAGE-RULES §6 "World 6 on gen2", carried over):
 *   - a liana hangs past a ledge's end and the gap under it is the world's own fall (w7.ts `pit`): a soft pit climbs back to the swing's
 *     ledge (pipeline backPit), never on to the perch, so the swing is the only way on (no floor to walk under it);
 *   - a perch lies past every jump and the leaf glide and sits about 80 px over the swing's ledge (RAISE), stepping back down after it;
 *   - chains keep a stone perch between every two swings (levelCheck follows ledge -> liana -> ledge, never liana to liana);
 *   - no ledge just past a perch sits within a double jump (plus 40) of the soft pit's floor under the swing: levelCheck jumps through the
 *     perch from the pit's floor to it, and the swing reads as optional (a drop to a lower ledge after the perch did: w7SwingRoute.test.ts);
 *   - a hop over the fall is a third of a jump or so, never a lower stone, never a second-jump gap;
 *   - a wall a brown vine climbs is a whole bank down to the ground (a wall reaches the floor), too high to jump: the vine is the way up;
 *   - sections are 600-1700 px, plus 370 px a liana (w7Swing.test.ts); a liana section is never mirrored, nor one with a tip;
 *   - nothing here crumbles (World 7's crumbling floors are w7Ground's, and are never required: STAGE-RULES §1).
 *
 * World 7 is the "Alone" chapter: Dot is gone (STAGE-RULES §1, Matt 2026-10-29). The first climb says Pokey's own line for the brown
 * vines (w7.ts W7_TIPS.brown, the lesson w7Ground's walls teach too): no new line here.
 *
 * Which stages: the halls, 7-5 Stone Sentries (a purge) and 7-9 The Golem's Hall (a gauntlet) (W7S_STAGES): their themes are the halls'
 * hunters (w7Ground W7_THEME cats, boas, harpies), with no walls or galleries of their own, so the swings and climbs give them the heavy
 * beats the others' tiles and walls give theirs (STAGE-RULES §2 "Sameness"). The ruin floor between is w7Ground's.
 */
import type { Difficulty, SectionPiece, SectionTemplate, Socket, WorldKit } from '../types.ts';
import { W7_LESSON, W7_TAG } from './w7.ts';

// ───────────────────────────── the stages, the tags ─────────────────────────────

/** the stages these sections go to (w7Game.ts folds them in with withW7Swing) */
export const W7S_STAGES: readonly number[] = [5, 9];
/** the animals a swing or climb section may hold (w7.ts creature tags: the cats and the boa, World 7's halls) */
const SMALL = ['ocelot', W7_TAG.coil];
const HUNTERS = [W7_TAG.hunter, W7_TAG.coil];
/** the brown vines' lesson (w7.ts W7_LESSON.brown: Pokey's line on the first one, W7_TIPS) */
export const W7_VINES = W7_LESSON.brown;

// ───────────────────────────── helpers ─────────────────────────────

type Opt = Partial<Socket>;
const petals = (id: string, on: string, t: Socket['t'], count = 2, span = 120, o: Opt = {}): Socket => ({ id, role: 'pickup', on, t, dn: 34, count, span, ...o });
const foe = (id: string, on: string, t: Socket['t'], kinds: string[] = SMALL, max = 3, o: Opt = {}): Socket => ({ id, role: 'enemy', on, t, allow: kinds, maxThreat: max, easy: 'soften', ...o });
const prop = (id: string, on: string, t: Socket['t'], allow: string[], o: Opt = {}): Socket => ({ id, role: 'prop', on, t, allow, ...o });
/** a statue, an urn, a fallen column (w7.ts W7_PROPS, all tagged scenery) */
const scenery = (id: string, on: string, t: Socket['t'], chance = 0.6) => prop(id, on, t, [W7_TAG.scenery], { chance });
const tip = (on: string, key: string): Socket => ({ id: `tip-${key}`, role: 'tip', on, t: 0.1, allow: [key] });

const bank = (key: string, w: SectionPiece['w'], place: SectionPiece['place'] = { kind: 'start' }, o: Partial<SectionPiece> = {}): SectionPiece => ({ key, shape: 'bank', w, place, ...o });
/** a temple step up `dy` px (one plain hop), or down */
const up = (key: string, after: string, dy: number, w: SectionPiece['w']): SectionPiece => bank(key, w, { kind: 'walk', after, dy: -dy });
const down = (key: string, after: string, dy: number, w: SectionPiece['w']): SectionPiece => bank(key, w, { kind: 'walk', after, dy });
/** a hop over a break in the floor: a third of a jump or so */
const hop = (key: string, after: string, w: SectionPiece['w'], share: SectionPiece['w'] = [0.3, 0.42]): SectionPiece =>
  bank(key, w, { kind: 'pit', after, jump: 'jump', share }, { landing: true });

/** a liana past `after`'s end, its anchor 400-420 px up (a longer one throws him further: its perch can lie past the glide) */
const liana = (key: string, after: string): SectionPiece => ({ key, shape: 'liana', w: 0, place: { kind: 'swing', after, top: [400, 420] } });
/** how far a perch sits above its swing's ledge (STAGE-RULES §6: a level perch past the glide is out of the calm swing's reach) */
const RAISE = -80;
/** the perch past a liana, a landing (Easy widens it); the gap under it is the world's fall */
const perch = (key: string, after: string, w: SectionPiece['w'], dy: SectionPiece['w'] = RAISE): SectionPiece => bank(key, w, { kind: 'land', after, dy }, { landing: true });
/** a brown vine at the end of `on`, `h` px tall, and the temple wall it leads up onto (a whole bank: out of a double jump's reach) */
const climbWall = (vine: string, on: string, wall: string, h: number, w: SectionPiece['w']): SectionPiece[] => [
  { key: vine, shape: 'vine', w: 0, place: { kind: 'climb', on, at: 1, h } },
  bank(wall, w, { kind: 'over', on: vine, at: 0, dy: 0 }, { main: true }),
];

const LIVE: SectionTemplate['phases'] = ['sho', 'ten', 'ketsu'];
const ALL: SectionTemplate['archetypes'] = 'any';

// ───────────────────────────── the lianas over the broken temple floor ─────────────────────────────
//
// A liana swings by itself (physics.ts vineAngle: Matt, 2026-10-28, Donkey Kong Country): up and down climb, left and right only turn
// him, letting go is the only choice. The core sizes each perch from the release window (pipeline lianaBand, physics.ts pressWindow:
// Normal 167 ms, Easy 300 ms), and costs each liana (period - window) / 2 + period / 2 in the time model (lianaSeconds).

/** one swing, ledge to perch: the first of a stage, a perch wide enough to walk on from */
const firstSwing: SectionTemplate = {
  id: 'w7s-first-swing',
  name: 'one swing over the broken floor',
  archetypes: ALL,
  phases: ['ki', 'sho'],
  difficulty: 3,
  pieces: [bank('a', [200, 240]), liana('l1', 'a'), perch('b', 'l1', [240, 290]), up('step', 'b', 40, [110, 140]), down('c', 'step', 40 - RAISE, [180, 220])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('a', 'a', 0.35, 2, 80), petals('b', 'b', 0.4, 2, 80), petals('step', 'step', 0.5, 1), scenery('statue', 'c', [0.5, 0.8], 0.5)],
  weight: 2,
  mirrorable: false,
};

/** two swings with a fallen lintel between: swing, land, swing */
const swingPair: SectionTemplate = {
  id: 'w7s-swing-pair',
  name: 'two swings, a lintel between',
  archetypes: ALL,
  phases: LIVE,
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
  sockets: [petals('p1', 'p1', 0.5, 1), petals('b', 'b', 0.3, 2, 90), foe('foe', 'b', [0.7, 0.9], SMALL, 1.5, { phases: ['ten', 'ketsu'], chance: 0.5 })],
  weight: 2,
  mirrorable: false,
};

/** three swings over the great hall's broken floor, stone perches between (a swing stage's climax) */
const swingChain: SectionTemplate = {
  id: 'w7s-swing-chain',
  name: 'three swings over the great hall',
  archetypes: ALL,
  phases: ['ten', 'ketsu'],
  difficulty: 7,
  maxPerStage: 1,
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

/** the stair, then a swing off its top step: hops up, the swing, down the far side */
const stairSwing: SectionTemplate = {
  id: 'w7s-stair-swing',
  name: 'up the stair, then a swing',
  archetypes: ALL,
  phases: ['sho', 'ten'],
  difficulty: 5,
  pieces: [
    bank('a', [140, 170]),
    up('s1', 'a', 50, [110, 140]),
    up('s2', 's1', 50, [140, 170]),
    liana('l1', 's2'),
    perch('b', 'l1', [200, 240]),
    down('b2', 'b', 50 - RAISE, [120, 140]),
    up('k', 'b2', 40, [90, 110]),
    down('c', 'k', 90, [180, 220]),
  ],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('s1', 's1', 0.5, 1), petals('s2', 's2', 0.4, 1), petals('b', 'b', 0.5, 2, 80), foe('foe', 'c', [0.6, 0.85], SMALL, 2.5, { phases: ['ten'], chance: 0.5 })],
  weight: 2,
  mirrorable: false,
};

/** a swing onto a hall where a hunter prowls: land, then deal with it */
const swingHunter: SectionTemplate = {
  id: 'w7s-swing-hunter',
  name: "swing into the hunter's hall",
  archetypes: ALL,
  phases: ['ten', 'ketsu'],
  difficulty: 6,
  pieces: [bank('a', [180, 220]), liana('l1', 'a'), perch('b', 'l1', [460, 540]), hop('c', 'b', [160, 200]), down('d', 'c', -RAISE, [160, 200])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'd', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('b', 'b', 0.2, 2, 80), foe('foe', 'b', [0.55, 0.75], HUNTERS, 3), petals('c', 'c', 0.5, 1)],
  weight: 2,
  mirrorable: false,
};

/** a swing, then the colonnade's stubs at a run (a sprint's rhythm: swing, hop, hop, hop) */
const swingRun: SectionTemplate = {
  id: 'w7s-swing-run',
  name: 'a swing, then the stubs (run)',
  archetypes: ALL,
  phases: LIVE,
  difficulty: 5,
  weight: 2,
  pieces: [
    bank('a', [160, 190]),
    liana('l1', 'a'),
    perch('b', 'l1', [180, 210]),
    up('k1', 'b', 45, [100, 130]),
    down('c', 'k1', 45 - RAISE, [120, 150]),
    hop('d', 'c', [150, 180]),
    hop('e', 'd', [150, 170]),
    // (a knee at the end: on Easy, with fewer animals, the run still ends on a hop)
    up('k2', 'e', 40, [90, 100]),
    down('f', 'k2', 40, [190, 220]),
  ],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'f', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('b', 'b', 0.5, 1), petals('k1', 'k1', 0.5, 1), petals('d', 'd', 0.5, 1), petals('k2', 'k2', 0.5, 1), foe('foe', 'f', [0.6, 0.85], SMALL, 2.5, { phases: LIVE, chance: 0.5 })],
  mirrorable: false,
};

// ───────────────────────────── the brown vines up the old walls ─────────────────────────────
//
// levelCheck measures a jump from ledge edge to ledge edge and never sees a wall standing between (and the inspector's quick route follows
// its graph), so a narrow wall is "glided through" in the check: the climb reads as optional and its beat is never counted (STAGE-RULES §6,
// "a climb detour is invisible"). So the top of every old wall is a walk of its own, 530 px or more (the wall, a plinth on it, the wall
// again: wider than the leaf glide from the vine's foot, even dropping 80 px), and every wall top stands more than a double jump (185 px,
// plus 40) over each ledge beside it; a section that ends coming down off a wall ends on a ledge 260 px or more, so the next section's
// wall top is out of a glide from it. Proof: w7SwingRoute.test.ts (the quick route climbs every brown vine).

/** how high a wall stands over the ledge its vine starts on: more than a double jump, plus 40 */
const WALL = 230;
/**
 * the top of an old wall: the wall over the vine, a plinth on it (a hop up and down), the wall again, `last` the piece that ends it; with
 * `two`, a second plinth and a stretch between (a hop more along the top: the walk along a wall top is otherwise a quiet 4 s)
 */
const wallTop = (vine: string, on: string, wall: string, h: number, last: string, two = false): SectionPiece[] => [
  ...climbWall(vine, on, wall, h, two ? [160, 180] : [200, 230]),
  up(`${wall}Plinth`, wall, 40, two ? [100, 120] : [130, 160]),
  ...(two
    ? [down(`${wall}Mid`, `${wall}Plinth`, 40, [110, 130]), up(`${wall}Plinth2`, `${wall}Mid`, 40, [100, 120]), bank(last, [160, 180], { kind: 'walk', after: `${wall}Plinth2`, dy: 40 }, { main: true })]
    : [bank(last, [200, 230], { kind: 'walk', after: `${wall}Plinth`, dy: 40 }, { main: true })]),
];

/** a temple wall with a brown vine up it, petals along the top, down again: the climb shown safely, Pokey's line first (World 7's first) */
const vineWall: SectionTemplate = {
  id: 'w7s-vine-wall',
  name: 'climb the brown vine',
  archetypes: ALL,
  phases: ['ki', 'sho', 'rest'],
  difficulty: 2,
  teaches: W7_VINES,
  pieces: [bank('a', [260, 300]), ...wallTop('v', 'a', 'wall', WALL, 'top', true), down('b', 'top', WALL, [180, 220]), hop('c', 'b', [200, 240])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: 0,
  sockets: [tip('a', W7_VINES), petals('a', 'a', 0.5, 2, 80), petals('wall', 'wall', 0.5, 2, 90), petals('plinth', 'wallPlinth', 0.5, 1), scenery('statue', 'c', 0.6, 0.5)],
  mirrorable: false,
};

/** two walls, the second on top of the first: up a brown vine, up the next from the first wall's top, along the top, and down in two drops */
const wallPair: SectionTemplate = {
  id: 'w7s-wall-pair',
  name: 'two old walls, two vines',
  archetypes: ALL,
  phases: LIVE,
  difficulty: 5,
  uses: [W7_VINES],
  pieces: [
    // (wide: a glide from a higher ledge before the section falls short of the first wall's top)
    bank('a', [320, 350]),
    ...climbWall('v1', 'a', 'w1', WALL, [210, 240]),
    ...wallTop('v2', 'w1', 'w2', WALL, 'top'),
    // (down a stair, a knee on it: 320 px or more, so a glide off the first wall's top, dropping to the floor, falls short of the floor
    // past it; the knee keeps the way down from going quiet)
    down('d', 'top', WALL, [130, 140]),
    up('dk', 'd', 40, [90, 100]),
    down('d2', 'dk', 40, [100, 110]),
    down('c', 'd2', WALL, [150, 170]),
  ],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('w1', 'w1', 0.4, 2, 80), petals('w2', 'w2', 0.5, 2, 90), petals('plinth', 'w2Plinth', 0.5, 1), foe('foe', 'c', [0.6, 0.85], SMALL, 2.5, { phases: ['ten', 'ketsu'], chance: 0.5 })],
  weight: 2,
  mirrorable: false,
};

/** a swing onto a ledge under a wall, and the brown vine up it (out of a jump from the perch), along the top, then down */
const swingClimb: SectionTemplate = {
  id: 'w7s-swing-climb',
  name: 'swing, then climb the old wall',
  archetypes: ALL,
  phases: LIVE,
  difficulty: 5,
  uses: [W7_VINES],
  pieces: [
    bank('a', [180, 220]),
    liana('l1', 'a'),
    perch('b', 'l1', [220, 260]),
    ...wallTop('v', 'b', 'wall', WALL, 'top', true),
    // (down in two steps: a glide from the perch, dropping to the floor, falls short of it past the wall's top)
    down('d', 'top', 150, [110, 130]),
    down('c', 'd', WALL - RAISE - 150, [200, 240]),
  ],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('b', 'b', 0.4, 2, 80), petals('wall', 'wall', 0.5, 2, 90), petals('plinth', 'wallPlinth', 0.5, 1), foe('foe', 'c', [0.6, 0.85], SMALL, 2.5, { phases: LIVE, chance: 0.5 })],
  weight: 2,
  mirrorable: false,
};

/** up a brown vine onto a high wall, along its top, a swing off its end over the broken floor, and down: the climb and the swing in one */
const climbSwing: SectionTemplate = {
  id: 'w7s-climb-swing',
  name: 'climb the wall, swing off its top',
  archetypes: ALL,
  phases: ['ten', 'ketsu'],
  difficulty: 7,
  uses: [W7_VINES],
  maxPerStage: 1,
  pieces: [
    bank('a', [200, 240]),
    ...wallTop('v', 'a', 'wall', WALL, 'top'),
    liana('l1', 'top'),
    perch('b', 'l1', [200, 240]),
    // (down in two drops with a knee between: the way down keeps a hop)
    down('b2', 'b', 155, [110, 130]),
    up('k', 'b2', 40, [80, 100]),
    down('c', 'k', 195, [200, 240]),
  ],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('a', 'a', 0.4, 2, 80), petals('wall', 'wall', 0.5, 1), petals('plinth', 'wallPlinth', 0.5, 1), petals('b', 'b', 0.5, 2, 80), petals('b2', 'b2', 0.5, 1)],
  weight: 2,
  mirrorable: false,
  extraSeconds: 1,
};

// ───────────────────────────── the set ─────────────────────────────

/** World 7's swing and climb sections */
export const W7_SWING_SECTIONS: readonly SectionTemplate[] = [
  firstSwing, swingPair, swingChain, stairSwing, swingHunter, swingRun,
  vineWall, wallPair, swingClimb, climbSwing,
];

/**
 * World 7's kit for stage `stage` with the swing and climb sections joined, for the stages that take them (W7S_STAGES; none for the rest).
 * The world's own manifest (gen2/worlds/w7.ts) stays as it is: w7Game.ts folds this in.
 */
export function withW7Swing(kit: WorldKit, stage: number, _difficulty: Difficulty = 'normal'): WorldKit {
  if (!W7S_STAGES.includes(stage)) return kit;
  const M = kit.manifest;
  const have = new Set(M.sections.map((s) => s.id));
  return { ...kit, manifest: { ...M, sections: [...M.sections, ...W7_SWING_SECTIONS.filter((s) => !have.has(s.id))] } };
}
