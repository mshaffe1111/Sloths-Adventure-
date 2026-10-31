/**
 * gen2/worlds/w9Swing — World 9's swings (DESIGN.md B11), for 9-3 "Ember Canopy" (Swing over the glowing rock) and wherever the world's
 * kit (w9Game.ts) lets a light swing into another stage.
 *
 * The Volcanic Jungle swings on iron chains, not lianas: each hangs from a ring on a charred beam laid across two basalt columns, one
 * standing on the swing's own ledge and one on the perch past it (w9SwingArt.ts: nothing floats, STAGE-RULES §6), and swings by itself
 * like every liana (physics.ts, World 6's vine-fix). Its perch is sized by the core from the release window (pipeline lianaBand: Easy
 * 300 ms, Normal 167 ms) and lies past every jump and the leaf glide, raised about 80 px (RAISE, World 6's lesson), so the chain is the
 * way over, never a choice. Under it is the world's fall (w9.ts `pit`: the lava on Normal; Easy's falls are all soft, and its soft pit
 * climbs back to the chain's own ledge, pipeline backPit, never on to the perch). Chains keep a perch between every two swings
 * (levelCheck follows ledge -> liana -> ledge). A swing section is never mirrored.
 *
 * What World 6 and World 8 already paid for, kept here (STAGE-RULES §6):
 *   - a perch in front of a lower ledge is 190 px or more (levelCheck's jump links pass through walls: from the pit's floor under a swing
 *     it "jumps" through a narrow perch's face onto the ledge behind it, and the swing reads as optional);
 *   - hops between ledges over the lava are a third of a jump or so, never a second-jump gap, never to a lower stone (the first-timer);
 *   - a ledge where an animal stands is long enough to keep it 120 px from every hop on and off (JUMP_CLEAR);
 *   - every rise is one plain hop, every ledge a whole bank down to the ground (a wall reaches the floor), nothing crumbles.
 *
 * The section interface with the World 9 builder (gen2-w9, 2026-10-29): this file exports W9_SWING_SECTIONS only. Its sockets ask for
 * tags, never the world's ids: creatures 'small' / 'hunter' (as Worlds 6 and 8 tag theirs), scenery 'scenery'. The kit, its falls, Dot's
 * first-lava warning and which stage holds which section are w9.ts's and w9Game.ts's.
 */
import type { Phase, SectionPiece, SectionTemplate, Socket } from '../types.ts';

type W = SectionPiece['w'];
/** the tags the sockets ask for (w9.ts tags its creatures and scenery with these) */
export const W9S_TAG = { small: 'small', hunter: 'hunter', scenery: 'scenery' } as const;
const LIVE: Phase[] = ['sho', 'ten', 'ketsu'];

/**
 * 9-3's two themes (STAGE-RULES §6: rolls differ by the kind of action, not its order; the builder's 300-roll curation read 0.30 diversity
 * with every chain section open on every roll): a roll's gate (its start) opens one, and then only that theme's sections come, with the
 * first chain and the bucket room on every roll. `chains`: long runs of swings over the lava; `climbs`: the basalt walls, climbed by
 * their burnt vines, with a chain now and then; `crust`: quick hops over the cooled crust between single chains (w9Game.ts gives each
 * theme some of w9Ground's 9-3 ground too, and 9-3's start is always one of these gates).
 */
export const W9S_THEME = { chains: 'w9:t-chain-runs', climbs: 'w9:t-wall-climbs', crust: 'w9:t-crust-runs' } as const;
const inTheme = (t: SectionTemplate, theme: string): SectionTemplate => ({ ...t, uses: [...(t.uses ?? []), theme] });

const petals = (id: string, on: string, t: Socket['t'], count = 2, span = 120): Socket => ({ id, role: 'pickup', on, t, dn: 34, count, span });
const foe = (id: string, on: string, t: Socket['t'], kinds: string[], max: number, o: Partial<Socket> = {}): Socket => ({ id, role: 'enemy', on, t, allow: kinds, maxThreat: max, easy: 'soften', ...o });
const scenery = (id: string, on: string, t: Socket['t'], chance = 0.6): Socket => ({ id, role: 'prop', on, t, allow: [W9S_TAG.scenery], chance });
const flag = (on: string, t: Socket['t']): Socket => ({ id: 'flag', role: 'flag', on, t });
const bank = (key: string, w: W, place: SectionPiece['place'] = { kind: 'start' }, o: Partial<SectionPiece> = {}): SectionPiece => ({ key, shape: 'bank', w, place, ...o });
const up = (key: string, after: string, dy: number, w: W): SectionPiece => bank(key, w, { kind: 'walk', after, dy: -dy });
const down = (key: string, after: string, dy: number, w: W): SectionPiece => bank(key, w, { kind: 'walk', after, dy });
/** a hop over the lava: a third of a jump or so (the first-timer's lesson over a deadly fall) */
const hop = (key: string, after: string, w: W, share: W = [0.3, 0.4]): SectionPiece => bank(key, w, { kind: 'pit', after, jump: 'jump', share }, { landing: true });
/** a chain past `after`'s end (its anchor 400-420 px over the ledge: the beam it hangs from, w9SwingArt.ts) */
const chain = (key: string, after: string): SectionPiece => ({ key, shape: 'liana', w: 0, place: { kind: 'swing', after, top: [400, 420] } });
/** a perch's height over the swing's ledge (World 6's RAISE: past the glide sooner, still in the swing's reach) */
export const RAISE = -80;
const perch = (key: string, after: string, w: W, dy: W = RAISE): SectionPiece => bank(key, w, { kind: 'land', after, dy }, { landing: true });
const climbWall = (vine: string, on: string, wall: string, h: number, w: W): SectionPiece[] => [
  { key: vine, shape: 'vine', w: 0, place: { kind: 'climb', on, at: 1, h } },
  bank(wall, w, { kind: 'over', on: vine, at: 0, dy: 0 }, { main: true }),
];

type SwingSpec = Omit<SectionTemplate, 'entry' | 'exit' | 'exitDy' | 'archetypes' | 'mirrorable'> & { first: string; last: string; archetypes?: SectionTemplate['archetypes'] };
const swingSection = (s: SwingSpec): SectionTemplate => {
  const { first, last, archetypes, ...rest } = s;
  return { archetypes: archetypes ?? ['vine_runner'], ...rest, entry: { piece: first, kind: 'ground' }, exit: { piece: last, kind: 'ground' }, exitDy: 0, mirrorable: false };
};

/** one chain over the glow, a basalt knee past it (the vine stage's first) */
const firstChain = swingSection({
  id: 'w9s-first-chain',
  name: 'one chain over the lava',
  phases: ['ki', 'sho'],
  difficulty: 3,
  weight: 2,
  // (once a stage: it is the stage's first chain; 9-3's curation found it twice in every roll)
  maxPerStage: 1,
  // (after the perch a step down and a hop over the crust: Easy has no animal here, and a plain knee left 3.6 s quiet)
  pieces: [bank('a', [220, 260]), chain('l1', 'a'), perch('b', 'l1', [220, 260]), down('b2', 'b', -RAISE, [130, 160]), hop('c', 'b2', [220, 260])],
  first: 'a',
  last: 'c',
  sockets: [petals('a', 'a', 0.35, 2, 80), petals('b', 'b', 0.4, 2, 80), petals('b2', 'b2', 0.5, 1), scenery('rock', 'c', [0.5, 0.8], 0.5), flag('c', 0.6)],
});

/** two chains, a basalt perch between */
const chainPair = swingSection({
  id: 'w9s-chain-pair',
  name: 'two chains, a perch between',
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 5,
  weight: 2,
  // (a hop over the crust after the second perch: 3.8 s quiet on Easy without it)
  pieces: [bank('a', [200, 240]), chain('l1', 'a'), perch('p1', 'l1', [190, 230]), down('p1d', 'p1', -RAISE, [140, 170]), chain('l2', 'p1d'), perch('b', 'l2', [220, 260]), down('c', 'b', -RAISE, [130, 160]), hop('d', 'c', [200, 240])],
  first: 'a',
  last: 'd',
  sockets: [petals('p1', 'p1', 0.5, 1), petals('b', 'b', 0.4, 2, 90), flag('d', 0.5)],
});

/** three chains, perches between (the ember canopy's long crossing) */
const chainRun3 = swingSection({
  id: 'w9s-chain-three',
  name: 'three chains over the lava',
  phases: ['ten', 'ketsu'],
  difficulty: 7,
  weight: 2,
  maxPerStage: 1,
  extraSeconds: 2,
  pieces: [
    bank('a', [150, 170]),
    chain('l1', 'a'),
    perch('p1', 'l1', [190, 210]),
    down('p1d', 'p1', -RAISE, [100, 110]),
    chain('l2', 'p1d'),
    perch('p2', 'l2', [190, 210]),
    down('p2d', 'p2', -RAISE, [100, 110]),
    chain('l3', 'p2d'),
    perch('b', 'l3', [190, 210]),
    down('c', 'b', -RAISE, [150, 170]),
  ],
  first: 'a',
  last: 'c',
  sockets: [petals('p1', 'p1', 0.5, 1), petals('p2', 'p2', 0.5, 1), petals('b', 'b', 0.4, 2, 90), flag('c', 0.5)],
});

/** a chain onto a basalt shelf, a climb up the burnt vine on the wall past it, and down the far side */
const chainClimb = swingSection({
  id: 'w9s-chain-climb',
  name: 'chain, then climb the basalt wall',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 5,
  weight: 2,
  // (the run down off the wall split by a hop over the crust: on Easy, with its animal gone, it read 3.9-4.8 s quiet)
  pieces: [bank('a', [200, 240]), chain('l1', 'a'), perch('b', 'l1', [260, 320]), ...climbWall('v', 'b', 'wall', 230, [220, 260]), down('c', 'wall', 230 - RAISE, [180, 210]), hop('d', 'c', [380, 420])],
  first: 'a',
  last: 'd',
  sockets: [petals('b', 'b', 0.4, 2, 80), petals('wall', 'wall', 0.5, 2, 90), petals('c', 'c', 0.5, 1), foe('foe', 'd', [0.55, 0.65], [W9S_TAG.small], 3, { phases: LIVE, chance: 0.5 })],
});

/** a chain onto a hunter's ledge: land, then deal with it */
const chainHunter = swingSection({
  id: 'w9s-chain-hunter',
  name: "a chain onto the hunter's ledge",
  phases: ['ten', 'ketsu'],
  difficulty: 6,
  weight: 2,
  pieces: [bank('a', [200, 240]), chain('l1', 'a'), perch('b', 'l1', [480, 540]), hop('c', 'b', [180, 220]), down('d', 'c', -RAISE, [200, 240])],
  first: 'a',
  last: 'd',
  sockets: [petals('b', 'b', 0.15, 2, 80), foe('foe', 'b', [0.55, 0.65], [W9S_TAG.hunter], 5), petals('c', 'c', 0.5, 1), flag('d', 0.6)],
});

/** cooled crust to hop, then a chain, a step down and back up */
const crustChain = swingSection({
  id: 'w9s-crust-chain',
  name: 'crust hops, then a chain',
  phases: ['ki', 'sho', 'ten'],
  difficulty: 5,
  weight: 2,
  pieces: [bank('a', [150, 180]), hop('k1', 'a', [150, 180]), hop('k2', 'k1', [170, 200]), chain('l1', 'k2'), perch('b', 'l1', [240, 270]), down('b2', 'b', 35 - RAISE, [130, 160]), up('c', 'b2', 35, [200, 240])],
  first: 'a',
  last: 'c',
  sockets: [petals('k1', 'k1', 0.5, 1), petals('k2', 'k2', 0.5, 1), petals('b', 'b', 0.5, 2, 80), flag('c', 0.5)],
});

/** a chain, then a quick run of crust hops (swing, hop, hop, hop) */
const chainRun = swingSection({
  id: 'w9s-chain-run',
  name: 'a chain, then the crust (run)',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 5,
  weight: 2,
  pieces: [bank('a', [200, 240]), chain('l1', 'a'), perch('b', 'l1', [200, 240]), up('k1', 'b', 45, [100, 130]), down('c', 'k1', 45 - RAISE, [130, 160]), hop('d', 'c', [160, 190]), hop('e', 'd', [340, 380])],
  first: 'a',
  last: 'e',
  sockets: [petals('b', 'b', 0.5, 1), petals('k1', 'k1', 0.5, 1), petals('d', 'd', 0.5, 1), foe('foe', 'e', [0.55, 0.65], [W9S_TAG.small], 3, { phases: LIVE, chance: 0.5 })],
});

/** a chain onto a high shelf, a drop to the ledge under it, and a second chain from there */
const chainDrop = swingSection({
  id: 'w9s-chain-drop',
  name: 'a chain, a drop, another chain',
  phases: ['ten', 'ketsu'],
  difficulty: 6,
  weight: 2,
  pieces: [
    bank('a', [200, 230]),
    chain('l1', 'a'),
    perch('b', 'l1', [200, 240]),
    down('b2', 'b', 60 - RAISE, [220, 260]),
    chain('l2', 'b2'),
    perch('d', 'l2', [220, 260]),
    down('e', 'd', -RAISE, [150, 180]),
    up('f', 'e', 60, [200, 240]),
  ],
  first: 'a',
  last: 'f',
  sockets: [petals('b', 'b', 0.5, 1), petals('b2', 'b2', 0.5, 2, 80), petals('d', 'd', 0.5, 1), scenery('rock', 'f', [0.5, 0.8], 0.4), flag('f', 0.6)],
});

/** a chain onto a wide shelf, a drop onto the ledge past it, and the burnt vine up the wall beyond */
const chainDropClimb = swingSection({
  id: 'w9s-chain-drop-climb',
  name: 'chain, drop, climb the wall',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  weight: 2,
  pieces: [
    bank('a', [200, 240]),
    chain('l1', 'a'),
    perch('b', 'l1', [220, 250]),
    down('b2', 'b', -RAISE, [160, 190]),
    ...climbWall('v', 'b2', 'wall', 200, [200, 240]),
    // (split by a hop: 3.4-3.8 s quiet on Easy with its animal gone)
    down('c', 'wall', 200, [160, 190]),
    hop('d', 'c', [280, 320]),
  ],
  first: 'a',
  last: 'd',
  sockets: [petals('b', 'b', 0.5, 1), petals('b2', 'b2', 0.5, 1), petals('wall', 'wall', 0.5, 2, 90), petals('c', 'c', 0.5, 1), foe('foe', 'd', [0.55, 0.65], [W9S_TAG.small], 3, { phases: ['ten', 'ketsu'], chance: 0.4 })],
});

/** World 9's chain sections (the vine stage: w9Game.ts) */
// ───────────────────────────── the climbs (9-3's walls theme) ─────────────────────────────

/** a basalt wall, its burnt vine climbed, the top run, and down off it over a hop (no chain: the climb is the beat) */
const wallClimb = swingSection({
  id: 'w9s-wall-climb',
  name: 'climb the basalt wall',
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 5,
  weight: 2,
  pieces: [bank('a', [220, 260]), ...climbWall('v', 'a', 'wall', 240, [260, 300]), down('c', 'wall', 240, [160, 190]), hop('d', 'c', [200, 240])],
  first: 'a',
  last: 'd',
  sockets: [petals('a', 'a', 0.4, 1), petals('wall', 'wall', 0.5, 2, 100), petals('c', 'c', 0.5, 1), scenery('rock', 'd', [0.5, 0.8], 0.4)],
});

/** two walls: climb one, drop to a shelf between, climb the next, and down */
const twinClimb = swingSection({
  id: 'w9s-twin-climb',
  name: 'two basalt walls',
  phases: ['ten', 'ketsu'],
  difficulty: 6,
  weight: 2,
  pieces: [
    bank('a', [200, 230]),
    ...climbWall('v1', 'a', 'w1', 220, [200, 230]),
    down('m', 'w1', 120, [200, 230]),
    ...climbWall('v2', 'm', 'w2', 210, [200, 230]),
    down('c', 'w2', 310, [160, 190]),
    hop('d', 'c', [200, 240]),
  ],
  first: 'a',
  last: 'd',
  sockets: [petals('w1', 'w1', 0.5, 1), petals('m', 'm', 0.5, 1), petals('w2', 'w2', 0.5, 2, 90), flag('d', 0.6)],
});

/** up a wall, a chain off its top over the lava, the perch, and down the far side */
const climbChain = swingSection({
  id: 'w9s-climb-chain',
  name: 'climb, then a chain off the top',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  weight: 2,
  pieces: [
    bank('a', [200, 240]),
    ...climbWall('v', 'a', 'wall', 200, [220, 250]),
    chain('l1', 'wall'),
    perch('b', 'l1', [220, 260]),
    down('c', 'b', 200 - RAISE, [160, 190]),
    hop('d', 'c', [200, 240]),
  ],
  first: 'a',
  last: 'd',
  sockets: [petals('wall', 'wall', 0.5, 1), petals('b', 'b', 0.5, 2, 80), petals('c', 'c', 0.5, 1), flag('d', 0.6)],
});

// ───────────────────────────── 9-3's gates (its start: the roll's theme opens) ─────────────────────────────

/** a plain basalt run over two knobs, nothing that can hurt, and the roll's theme opens (w9Ground's landing, with a theme) */
const gate = (theme: keyof typeof W9S_THEME, name: string, extra: Socket[]): SectionTemplate => ({
  id: `w9s-gate-${theme}`,
  name: `ember canopy: ${name} (gate)`,
  archetypes: ['vine_runner'],
  phases: ['start'],
  difficulty: 1,
  teaches: W9S_THEME[theme],
  weight: 6,
  pieces: [bank('a', [220, 260]), up('k1', 'a', 30, [130, 160]), down('f1', 'k1', 30, [220, 260]), up('k2', 'f1', 30, [130, 160]), down('c', 'k2', 30, [200, 240])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('k1', 'k1', 0.5, 1), petals('f1', 'f1', 0.5, 2, 80), petals('k2', 'k2', 0.5, 1), ...extra],
  mirrorable: false,
});
export const W9S_GATES: readonly SectionTemplate[] = [
  gate('chains', 'the chain runs', [scenery('ohia', 'a', [0.5, 0.6], 0.9)]),
  gate('climbs', 'the basalt walls', [scenery('rock', 'a', [0.5, 0.6], 0.9)]),
  gate('crust', 'the crust runs', [scenery('smoke', 'a', [0.5, 0.6], 0.9)]),
];

/** World 9's chain sections (the vine stage: w9Game.ts): its gates, the first chain (every roll), and each theme's own */
export const W9_SWING_SECTIONS: readonly SectionTemplate[] = [
  ...W9S_GATES,
  firstChain,
  ...[chainPair, chainRun3, chainDrop, chainHunter].map((t) => inTheme(t, W9S_THEME.chains)),
  ...[crustChain, chainRun].map((t) => inTheme(t, W9S_THEME.crust)),
  ...[chainClimb, chainDropClimb, wallClimb, twinClimb, climbChain].map((t) => inTheme(t, W9S_THEME.climbs)),
];
