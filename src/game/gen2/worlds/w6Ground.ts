/**
 * gen2/worlds/w6Ground — World 6's ground building blocks (DESIGN.md B9): the mangrove banks and root knees every stage shares, the
 * flat water of 6-2 (hide in the roots while the spear watches from the water), the mudflats of 6-4 (cross while the tide is out), and
 * the hunters' banks of 6-5 The Spear and 6-9 Blackwater. The swings over the black water (6-1, 6-3, 6-7) and the puzzle rooms are the
 * swing builder's (gen2-w6-swing), on the same manifest (w6.ts).
 *
 * Every beat is ground the route really crosses (World 5's lesson, STAGE-RULES §6: a stump standing ON a bank is walked past): a knee
 * root stepped up onto and down off, a soft gap hopped, a mudflat stepped down into and out of, an animal on the bank. On its own
 * ground the gap between two beats is about 450 px at most. Every piece is placed by rule from the one before it, every rise is one hop,
 * every gap a share of the jump the difficulty allows, every dip a soft pit with a step out, and nothing crumbles.
 *
 * Water (w6.ts header): the gaps are soft until the core's water pits land. Every plain gap here is a third of a jump or so (`hop`:
 * 0.30-0.42 of the envelope, which is already 0.82 of the reach on Normal), so it can turn to water as it is; the second-jump gaps
 * (`leap`) must stay soft mud when it does (STAGE-RULES §6: no second-jump gaps over water): W6_MUD_GAPS lists them.
 *
 * Teaching (STAGE-RULES §1): each stage's start gate shows its thing first, on its own, and says Dot's line: 6-2's the watching water
 * (a long calm before the first pass, three roots in reach), 6-4's the tide (its post, then one short mudflat, no animal near), 6-5's
 * and 6-9's the shut shrine. The gate also opens the roll's THEME (W6_THEME): the sections of that theme come only after it, so each
 * roll leans its own way all through (World 5's arena: 0.21 -> 0.40 diversity with themes). The new animals (caiman, frog, tayra,
 * harpy) are taught where each is first laid, whichever section it is in: w6.ts w6Spawn notes them and w6Finish puts Dot's line before
 * the first of each kind.
 */
import type { Phase, SectionPiece, SectionTemplate, Socket } from '../types.ts';

// ───────────────────────────── the themes ─────────────────────────────

/** each roll's gate opens one theme; the themed sections `use` it (the pipeline's teaching gate keeps them out until it is open) */
export const W6_THEME = {
  /** 6-2: watched banks split by short soft gaps, frogs among the roots */
  pools: 'w6:pools',
  /** 6-2: reed beds on long watched banks, a high root road, a quick tayra */
  reeds: 'w6:reeds',
  /** 6-2: caimans lying on the watched banks between the roots */
  basking: 'w6:basking',
  /** 6-4: long mudflats, one after another */
  flats: 'w6:flats',
  /** 6-4: knee roots between short flats, frogs on the knees */
  knees: 'w6:knees',
  /** 6-4: channels to hop and caimans on the banks between flats */
  channels: 'w6:channels',
  /** 6-5 / 6-9: the cats' banks (ocelots, a jaguar) */
  cats: 'w6:cats',
  /** 6-5 / 6-9: the caimans' banks */
  caimans: 'w6:caimans',
  /** 6-5 / 6-9: the harpies' long flats and the quick tayras */
  harpies: 'w6:harpies',
  /** 6-9: the tide flats full of hunters (the tide was taught in 6-4) */
  tides: 'w6:tides',
} as const;
export type W6Theme = (typeof W6_THEME)[keyof typeof W6_THEME];

/** the tide's lesson key (w6.ts W6_LESSON.tide): Dot's line in 6-4's gates; known from 6-4 on (W6_MANIFEST.lessons) */
const TIDE = 'tide';
/** the watching water's lesson key (W6_LESSON.watch) */
const WATCH = 'watch';

// ───────────────────────────── helpers ─────────────────────────────

type Opt = Partial<Socket>;
const LIVE: Phase[] = ['sho', 'ten', 'ketsu'];
const HOT: Phase[] = ['ten', 'ketsu'];

const bank = (key: string, w: SectionPiece['w'], place: SectionPiece['place'] = { kind: 'start' }, o: Partial<SectionPiece> = {}): SectionPiece => ({ key, shape: 'bank', w, place, ...o });
/** a knee root or a mound: a step up `dy` px onto a piece; `down` steps back down (two hops the route takes) */
const up = (key: string, after: string, dy: number, w: SectionPiece['w']): SectionPiece => bank(key, w, { kind: 'walk', after, dy: -dy });
const down = (key: string, after: string, dy: number, w: SectionPiece['w']): SectionPiece => bank(key, w, { kind: 'walk', after, dy });
/** a soft gap hopped: a third of a jump or so (it can turn to water as it is) */
const hop = (key: string, after: string, w: SectionPiece['w'], share: SectionPiece['w'] = [0.3, 0.42], landing = false): SectionPiece =>
  bank(key, w, { kind: 'pit', after, jump: 'jump', share }, landing ? { landing } : {});
/** a wide soft gap crossed with the second jump: it stays soft mud when the water comes (W6_MUD_GAPS) */
const leap = (key: string, after: string, w: SectionPiece['w'], share: SectionPiece['w'] = [0.5, 0.72]): SectionPiece =>
  bank(key, w, { kind: 'pit', after, jump: 'double', share }, { landing: true });
/** a root road over `on`, off the main route: the high way past what is below */
const road = (key: string, on: string, at: SectionPiece['w'], dy: SectionPiece['w'], w: SectionPiece['w']): SectionPiece => ({ key, shape: 'branch', w, place: { kind: 'over', on, at, dy }, main: false });

const petals = (id: string, on: string, t: Socket['t'], count = 2, span = 120, o: Opt = {}): Socket => ({ id, role: 'pickup', on, t, dn: 34, count, span, ...o });
const prop = (id: string, on: string, t: Socket['t'], allow: string[], o: Opt = {}): Socket => ({ id, role: 'prop', on, t, allow, ...o });
/** a root den or a reed bed to hide in (the bag alternates them) */
const hideAt = (id: string, on: string, t: Socket['t']) => prop(id, on, t, ['hide', 'cover']);
const watch = (on: string, t: Socket['t'] = 0.5, id = 'watch') => prop(id, on, t, ['watch']);
const tide = (id: string, on: string, t: Socket['t'] = 0.5) => prop(id, on, t, ['tide']);
const scenery = (id: string, on: string, t: Socket['t'], chance = 0.6) => prop(id, on, t, ['scenery'], { chance });
const flag = (on: string, t: Socket['t']): Socket => ({ id: 'flag', role: 'flag', on, t });
const tip = (mechanic: string, on: string, t: Socket['t'] = 0.15, id = `tip-${mechanic}`): Socket => ({ id, role: 'tip', on, t, allow: [mechanic] });
/** an animal: `kinds` are creature ids (or tags) it may be; `max` the most threat it may take */
const foe = (id: string, on: string, t: Socket['t'], kinds: string[], max: number, o: Opt = {}): Socket => ({ id, role: 'enemy', on, t, allow: kinds, maxThreat: max, easy: 'soften', ...o });
/** the post and its tide, linked (both or neither: w6.ts W6_PAIRS) */
const postAndTide = (postOn: string, postT: Socket['t'], mudOn: string, mudT: Socket['t'] = 0.5): Socket[] => [
  { id: 'post', role: 'source', on: postOn, t: postT },
  { id: 'tide', role: 'receptor', on: mudOn, t: mudT, link: 'post', allow: ['tide'] },
];

const KNOWN_CATS = ['ocelot', 'jaguar'];
const SMALL = ['frog', 'tayra', 'ocelot'];

// ───────────────────────────── every stage: banks, knees, rests, the shrine's approach ─────────────────────────────

/** a stretch of mangrove bank over one knee root: petals, a flag, lily pads at the water's edge */
const bankWalk: SectionTemplate = {
  id: 'w6-bank',
  name: 'mangrove bank',
  archetypes: 'any',
  phases: ['start', 'rest', 'goal', 'ki'],
  difficulty: 1,
  pieces: [bank('a', [320, 380]), up('knee', 'a', 36, [180, 220]), down('b', 'knee', 36, [320, 400])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'b', kind: 'ground' },
  exitDy: 0,
  sockets: [scenery('lilies', 'a', [0.3, 0.5]), petals('knee', 'knee', 0.5, 2, 80), flag('b', 0.6), scenery('snag', 'b', [0.8, 0.9], 0.5)],
  mirrorable: true,
};

/** two knee roots up and two down: a little staircase of roots, a flag at the top */
const rootSteps: SectionTemplate = {
  id: 'w6-root-steps',
  name: 'root steps',
  archetypes: 'any',
  phases: ['start', 'rest', 'ki', 'goal'],
  difficulty: 2,
  pieces: [
    bank('a', [300, 360]),
    up('r1', 'a', 34, [180, 220]),
    up('r2', 'r1', 30, [260, 320]),
    down('r3', 'r2', 30, [180, 220]),
    down('b', 'r3', 34, [260, 320]),
  ],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'b', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('r1', 'r1', 0.5, 1), flag('r2', 0.5), petals('r3', 'r3', 0.5, 1), scenery('snag', 'b', [0.4, 0.6])],
  mirrorable: true,
};

/** a quiet bank with lily pads, one soft step down to the water's edge and back up (a breather) */
const lilyRest: SectionTemplate = {
  id: 'w6-lily-rest',
  name: 'lily bank',
  archetypes: 'any',
  phases: ['rest', 'goal'],
  difficulty: 1,
  pieces: [bank('a', [300, 360]), down('edge', 'a', 30, [240, 300]), up('b', 'edge', 30, [280, 340])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'b', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('a', 'a', 0.5, 2, 80), scenery('lilies', 'edge', 0.5, 1), flag('b', 0.5)],
  mirrorable: true,
};

// ───────────────────────────── every stage: Ki to Ketsu ─────────────────────────────

/** a soft gap, a knee root, a small animal past it */
const stumpHop: SectionTemplate = {
  id: 'w6-stump-hop',
  name: 'knee and gap',
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten'],
  difficulty: 3,
  pieces: [bank('a', [300, 360]), hop('b', 'a', [300, 360]), up('c', 'b', 40, [200, 240]), down('d', 'c', 40, [320, 380])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'd', kind: 'ground' },
  exitDy: 0,
  sockets: [
    petals('a', 'a', 0.5, 2, 80),
    foe('frog', 'b', [0.5, 0.6], ['frog'], 1.5, { phases: LIVE, chance: 0.7 }),
    petals('c', 'c', 0.5, 1),
    foe('cat', 'd', [0.6, 0.75], KNOWN_CATS, 3, { phases: HOT, chance: 0.6 }),
  ],
  mirrorable: true,
};

/** a soft gap onto a long bank over a knee, a hunter on the far side */
const mudGap: SectionTemplate = {
  id: 'w6-mud-gap',
  name: 'mud gap',
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 4,
  pieces: [bank('near', [340, 400]), hop('far', 'near', [380, 440], [0.32, 0.42], true), up('m', 'far', 36, [180, 220]), down('far2', 'm', 36, [300, 360])],
  entry: { piece: 'near', kind: 'ground' },
  exit: { piece: 'far2', kind: 'ground' },
  exitDy: 0,
  sockets: [
    petals('near', 'near', 0.45, 2, 90),
    scenery('lilies', 'far', [0.2, 0.3]),
    foe('foe', 'far2', [0.55, 0.7], ['ocelot', 'tayra', 'frog'], 3, { phases: LIVE }),
    petals('m', 'm', 0.5, 1),
  ],
  mirrorable: true,
};

/** a step up onto a higher bank (one hop), a gap along it, a hunter there */
const rise: SectionTemplate = {
  id: 'w6-rise',
  name: 'a step up',
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten'],
  difficulty: 4,
  pieces: [bank('a', [380, 440]), up('b', 'a', 48, [320, 380]), hop('c', 'b', [400, 480])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: -48,
  sockets: [petals('a', 'a', 0.5, 2, 90), scenery('snag', 'b', [0.3, 0.5]), foe('foe', 'c', [0.55, 0.75], ['ocelot', 'tayra'], 3, { phases: LIVE, chance: 0.8 })],
  mirrorable: false,
};

/** a step down to a lower bank, a gap along it, a frog by the water */
const drop: SectionTemplate = {
  id: 'w6-drop',
  name: 'a step down',
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten'],
  difficulty: 4,
  pieces: [bank('a', [380, 440]), down('b', 'a', 48, [320, 380]), hop('c', 'b', [400, 480])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: 48,
  sockets: [petals('a', 'a', 0.5, 2, 90), foe('frog', 'b', [0.4, 0.6], ['frog'], 1.5, { phases: LIVE, chance: 0.7 }), scenery('lilies', 'c', [0.2, 0.3]), foe('foe', 'c', [0.6, 0.8], KNOWN_CATS, 3, { phases: HOT, chance: 0.6 })],
  mirrorable: false,
};

/** a wide soft gap only the second jump crosses (it stays mud when the water comes), a knee after it */
const doubleGap: SectionTemplate = {
  id: 'w6-double-gap',
  name: 'wide mud gap',
  archetypes: 'any',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 7,
  needs: ['double'],
  pieces: [bank('near', [360, 420]), leap('far', 'near', [360, 420]), up('m', 'far', 36, [180, 220]), down('b', 'm', 36, [320, 380])],
  entry: { piece: 'near', kind: 'ground' },
  exit: { piece: 'b', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('near', 'near', 0.5, 2, 90), petals('m', 'm', 0.5, 1), foe('foe', 'b', [0.55, 0.75], ['ocelot', 'tayra', 'frog'], 3, { phases: HOT, chance: 0.7 })],
  mirrorable: true,
};

/** a high road of roots over a bank of knees: up out of the way, or down among the animals */
const rootRoad: SectionTemplate = {
  id: 'w6-root-road',
  name: 'root road',
  archetypes: 'any',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  pieces: [
    bank('a', [300, 360]),
    up('m1', 'a', 36, [180, 220]),
    down('b', 'm1', 36, [420, 500]),
    road('road', 'b', [0.1, 0.2], [-100, -90], [320, 380]),
    up('m2', 'b', 36, [180, 220]),
    down('c', 'm2', 36, [280, 340]),
  ],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: 0,
  sockets: [
    petals('m1', 'm1', 0.5, 1),
    petals('road', 'road', 0.5, 3, 240),
    foe('foe', 'b', [0.55, 0.7], ['ocelot', 'tayra', 'frog'], 3),
    petals('m2', 'm2', 0.5, 1),
    foe('foe2', 'c', [0.6, 0.75], KNOWN_CATS, 5, { phases: HOT, chance: 0.6 }),
  ],
  mirrorable: true,
};

// ───────────────────────────── 6-2 Flat Water: hide in the roots while the water watches ─────────────────────────────

/** a stealth gate: Dot's line, then a long watched shore with three roots to hide in, a long calm before the first pass, no animal */
const watchGate = (theme: keyof typeof W6_THEME, name: string, shoreW: SectionPiece['w'], extra: Socket[] = []): SectionTemplate => ({
  id: `w6-watch-gate-${theme}`,
  name: `flat water: ${name} (cover)`,
  archetypes: ['stealth'],
  phases: ['start'],
  difficulty: 1,
  teaches: W6_THEME[theme],
  weight: 6,
  pieces: [bank('a', [380, 440]), up('knee', 'a', 30, [160, 200]), down('shore', 'knee', 30, shoreW)],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'shore', kind: 'ground' },
  exitDy: 0,
  sockets: [
    tip(WATCH, 'a', 0.2),
    petals('knee', 'knee', 0.5, 1),
    // (the lesson's calm: watchCalm's [9, 11], from this socket's name)
    watch('shore', 0.5, 'watchLesson'),
    hideAt('h1', 'shore', 0.1),
    petals('p1', 'shore', 0.3, 2, 100),
    hideAt('h2', 'shore', 0.5),
    petals('p2', 'shore', 0.7, 2, 100),
    hideAt('h3', 'shore', 0.9),
    ...extra,
  ],
  mirrorable: false,
});

const watchGates: SectionTemplate[] = [
  watchGate('pools', 'the pools', [880, 960]),
  watchGate('reeds', 'the reed beds', [900, 1000], [scenery('lilies', 'a', [0.5, 0.6], 0.8)]),
  watchGate('basking', 'the basking banks', [880, 960], [scenery('snag', 'a', [0.55, 0.65], 0.8)]),
];

/** pools: two watched banks with a soft gap between, a root at each end of each, a frog between them */
const watchPools: SectionTemplate = {
  id: 'w6-watch-pools',
  name: 'watched pools cover',
  archetypes: ['stealth'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 5,
  uses: [W6_THEME.pools],
  pieces: [bank('a', [480, 540]), hop('b', 'a', [500, 560], [0.3, 0.4], true)],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'b', kind: 'ground' },
  exitDy: 0,
  sockets: [
    watch('a'),
    hideAt('h1', 'a', 0.14),
    petals('pa', 'a', 0.5, 2, 90),
    hideAt('h2', 'a', 0.86),
    watch('b', 0.5, 'watch2'),
    hideAt('h3', 'b', 0.16),
    foe('frog', 'b', [0.45, 0.55], ['frog'], 1.5, { phases: LIVE }),
    hideAt('h4', 'b', 0.86),
  ],
  mirrorable: true,
};

/** pools again, over a knee root: watched on both sides of it */
const poolKnee: SectionTemplate = {
  id: 'w6-pool-knee',
  name: 'pool and knee cover',
  archetypes: ['stealth'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: [W6_THEME.pools],
  pieces: [bank('a', [400, 460]), up('knee', 'a', 36, [180, 220]), down('b', 'knee', 36, [400, 460]), hop('c', 'b', [360, 420])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: 0,
  sockets: [
    watch('b'),
    hideAt('h1', 'a', 0.3),
    hideAt('h2', 'knee', 0.5),
    foe('frog', 'b', [0.4, 0.5], ['frog'], 1.5),
    hideAt('h3', 'b', 0.85),
    petals('c', 'c', 0.5, 2, 90),
    foe('frog2', 'c', [0.7, 0.8], ['frog'], 1.5, { phases: HOT, chance: 0.6 }),
  ],
  mirrorable: true,
};

/** reeds: a long watched bank of reed beds over two knees, a tayra running the far end */
const watchReeds: SectionTemplate = {
  id: 'w6-watch-reeds',
  name: 'watched reeds cover',
  archetypes: ['stealth'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 5,
  uses: [W6_THEME.reeds],
  pieces: [bank('a', [340, 400]), up('k1', 'a', 30, [160, 200]), down('b', 'k1', 30, [340, 400]), up('k2', 'b', 30, [160, 200]), down('c', 'k2', 30, [380, 440])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: 0,
  sockets: [
    watch('b'),
    hideAt('h1', 'a', 0.5),
    hideAt('h2', 'b', 0.5),
    petals('k2', 'k2', 0.5, 1),
    hideAt('h3', 'c', 0.3),
    foe('foe', 'c', [0.6, 0.75], ['tayra'], 2.5, { phases: LIVE, chance: 0.8 }),
  ],
  mirrorable: true,
};

/** reeds under a high root road: the road is the way over the watched bank, the reeds the way through it */
const reedRoad: SectionTemplate = {
  id: 'w6-reed-road',
  name: 'reeds under the road cover',
  archetypes: ['stealth'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: [W6_THEME.reeds],
  pieces: [
    bank('a', [300, 360]),
    up('k1', 'a', 34, [180, 220]),
    down('b', 'k1', 34, [520, 600]),
    road('road', 'b', [0.15, 0.2], [-100, -92], [340, 400]),
    hop('c', 'b', [340, 400]),
  ],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: 0,
  sockets: [
    watch('b'),
    hideAt('h1', 'a', 0.5),
    hideAt('h2', 'b', 0.2),
    petals('road', 'road', 0.5, 3, 260),
    hideAt('h3', 'b', 0.78),
    foe('foe', 'c', [0.55, 0.7], ['tayra', 'ocelot'], 3, { phases: HOT }),
  ],
  mirrorable: false,
};

/** basking: a caiman lies on a watched bank between two roots; hop the knee and slip past it in a calm */
const baskBank: SectionTemplate = {
  id: 'w6-bask-bank',
  name: 'basking caiman cover',
  archetypes: ['stealth'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: [W6_THEME.basking],
  pieces: [bank('a', [300, 360]), up('knee', 'a', 34, [180, 220]), down('b', 'knee', 34, [700, 800])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'b', kind: 'ground' },
  exitDy: 0,
  sockets: [
    hideAt('h1', 'a', 0.4),
    petals('knee', 'knee', 0.5, 1),
    watch('b'),
    hideAt('h2', 'b', 0.12),
    foe('caiman', 'b', [0.48, 0.52], ['caiman'], 4),
    hideAt('h3', 'b', 0.9),
  ],
  mirrorable: true,
};

/** basking: a soft gap onto a watched bank, a caiman, then a frog by the water */
const baskGap: SectionTemplate = {
  id: 'w6-bask-gap',
  name: 'caiman past the gap cover',
  archetypes: ['stealth'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 5,
  uses: [W6_THEME.basking],
  pieces: [bank('a', [340, 400]), hop('b', 'a', [700, 800], [0.3, 0.4], true), up('knee', 'b', 30, [160, 200]), down('c', 'knee', 30, [280, 340])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: 0,
  sockets: [
    hideAt('h1', 'a', 0.5),
    watch('b'),
    hideAt('h2', 'b', 0.15),
    foe('caiman', 'b', [0.5, 0.56], ['caiman'], 4, { phases: LIVE }),
    hideAt('h3', 'b', 0.88),
    foe('frog', 'c', [0.5, 0.7], ['frog'], 1.5, { phases: HOT, chance: 0.6 }),
  ],
  mirrorable: true,
};

/** any stealth roll: a watched bank of roots under a knee, a cat waiting at the end (the shared pressure of all three themes) */
const watchKnees: SectionTemplate = {
  id: 'w6-watch-knees',
  name: 'watched knees cover',
  archetypes: ['stealth'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  pieces: [bank('a', [420, 480]), up('knee', 'a', 36, [200, 240]), down('b', 'knee', 36, [420, 480])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'b', kind: 'ground' },
  exitDy: 0,
  sockets: [watch('a'), hideAt('h1', 'a', 0.2), hideAt('h2', 'a', 0.85), petals('knee', 'knee', 0.5, 1), watch('b', 0.5, 'watch2'), hideAt('h3', 'b', 0.3), foe('cat', 'b', [0.6, 0.75], ['ocelot'], 3, { phases: HOT, chance: 0.7 })],
  mirrorable: true,
};

// ───────────────────────────── 6-4 Low Tide: cross the mudflats while the tide is out ─────────────────────────────

/** a sprint gate: Dot's line and the tide post on the bank, then one short mudflat (no animal near), and out the far side */
const tideGate = (theme: keyof typeof W6_THEME, name: string, mudW: SectionPiece['w'], extra: Socket[] = []): SectionTemplate => ({
  id: `w6-tide-gate-${theme}`,
  name: `low tide: ${name} run`,
  archetypes: ['sprint'],
  phases: ['start'],
  difficulty: 1,
  teaches: W6_THEME[theme],
  weight: 6,
  pieces: [bank('a', [440, 500]), down('mud', 'a', 50, mudW), up('b', 'mud', 50, [320, 380])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'b', kind: 'ground' },
  exitDy: 0,
  sockets: [tip(TIDE, 'a', 0.15), petals('a', 'a', 0.45, 2, 80), ...postAndTide('a', 0.85, 'mud'), petals('mud', 'mud', 0.5, 2, 120), ...extra],
  mirrorable: false,
});

const tideGates: SectionTemplate[] = [
  tideGate('flats', 'the long flats', [300, 340], [scenery('snag', 'b', [0.5, 0.7], 0.8)]),
  tideGate('knees', 'the knee roots', [260, 300], [petals('b', 'b', 0.6, 1)]),
  tideGate('channels', 'the channels', [260, 300], [scenery('lilies', 'b', [0.5, 0.7], 0.8)]),
];

/** a mudflat: down into the mud, across while it is low, up the far bank (any roll of 6-4 or 6-9: W6_STAGE_ONLY) */
const mudflat: SectionTemplate = {
  id: 'w6-mudflat',
  name: 'mudflat run',
  archetypes: ['sprint', 'gauntlet'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 4,
  pieces: [bank('a', [300, 360]), down('mud', 'a', 50, [320, 380]), up('b', 'mud', 50, [380, 440])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'b', kind: 'ground' },
  exitDy: 0,
  sockets: [...postAndTide('a', 0.7, 'mud'), petals('mud', 'mud', 0.5, 2, 140), foe('foe', 'b', [0.55, 0.7], ['frog', 'tayra'], 2.5, { phases: LIVE, chance: 0.8 })],
  mirrorable: false,
};

/** flats: one long mudflat after another, a knee between, the second on its own beat */
const twinFlats: SectionTemplate = {
  id: 'w6-twin-flats',
  name: 'two mudflats run',
  archetypes: ['sprint', 'gauntlet'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: [W6_THEME.flats],
  pieces: [bank('a', [260, 300]), down('mud1', 'a', 50, [320, 380]), up('knee', 'mud1', 50, [180, 220]), down('mud2', 'knee', 50, [300, 360]), up('b', 'mud2', 50, [320, 380])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'b', kind: 'ground' },
  exitDy: 0,
  sockets: [...postAndTide('a', 0.6, 'mud1'), petals('knee', 'knee', 0.5, 1), tide('tide2', 'mud2'), foe('foe', 'b', [0.55, 0.75], ['tayra', 'ocelot'], 3, { phases: HOT, chance: 0.7 })],
  mirrorable: false,
};

/** flats: a long flat with a soft gap at its far end (cross it, then hop out) */
const longFlat: SectionTemplate = {
  id: 'w6-long-flat',
  name: 'long mudflat run',
  archetypes: ['sprint', 'gauntlet'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 5,
  uses: [W6_THEME.flats],
  pieces: [bank('a', [280, 320]), down('mud', 'a', 50, [380, 420]), up('b', 'mud', 50, [240, 280]), hop('c', 'b', [320, 380])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: 0,
  sockets: [...postAndTide('a', 0.6, 'mud'), petals('mud', 'mud', 0.5, 3, 200), foe('foe', 'c', [0.5, 0.7], ['frog', 'tayra'], 2.5, { phases: LIVE, chance: 0.7 })],
  mirrorable: false,
};

/** knees: knee roots between two short flats, a frog on a knee */
const kneeFlats: SectionTemplate = {
  id: 'w6-knee-flats',
  name: 'knee roots and flats run',
  archetypes: ['sprint'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 5,
  uses: [W6_THEME.knees],
  pieces: [
    bank('a', [260, 300]),
    up('k1', 'a', 36, [240, 280]),
    down('a2', 'k1', 36, [200, 240]),
    down('mud', 'a2', 50, [260, 300]),
    up('b', 'mud', 50, [220, 260]),
    up('k2', 'b', 36, [260, 300]),
    down('c', 'k2', 36, [220, 260]),
  ],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: 0,
  sockets: [
    foe('frog', 'k1', 0.5, ['frog'], 1.5, { phases: LIVE, chance: 0.7 }),
    ...postAndTide('a2', 0.5, 'mud'),
    petals('mud', 'mud', 0.5, 2, 100),
    foe('frog2', 'k2', 0.5, ['frog'], 1.5, { phases: HOT, chance: 0.6 }),
    petals('c', 'c', 0.5, 1),
  ],
  mirrorable: false,
};

/** a run of three knees up and down, petals on top, a tayra at the end (any run or hunt) */
const kneeRun: SectionTemplate = {
  id: 'w6-knee-run',
  name: 'knee root run',
  archetypes: ['sprint', 'gauntlet', 'purge'],
  phases: ['ki', 'sho', 'ten'],
  difficulty: 4,
  pieces: [
    bank('a', [240, 280]),
    up('k1', 'a', 36, [180, 220]),
    down('b', 'k1', 36, [200, 240]),
    up('k2', 'b', 44, [180, 220]),
    down('c', 'k2', 44, [200, 240]),
    up('k3', 'c', 36, [180, 220]),
    down('d', 'k3', 36, [300, 360]),
  ],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'd', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('k1', 'k1', 0.5, 1), petals('k2', 'k2', 0.5, 1), petals('k3', 'k3', 0.5, 1), foe('foe', 'd', [0.55, 0.7], ['tayra', 'frog'], 2.5, { phases: LIVE, chance: 0.7 })],
  mirrorable: true,
};

/** two soft channels to hop, a caiman on the bank between them (any run or hunt) */
const channelHop: SectionTemplate = {
  id: 'w6-channels',
  name: 'channels run',
  archetypes: ['sprint', 'gauntlet', 'purge'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 5,
  pieces: [bank('a', [300, 360]), hop('b', 'a', [460, 520]), hop('c', 'b', [300, 360])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('a', 'a', 0.5, 2, 80), foe('caiman', 'b', [0.45, 0.55], ['caiman'], 4, { phases: LIVE }), scenery('lilies', 'c', [0.4, 0.6])],
  mirrorable: true,
};

/** channels: a channel, then a mudflat, then a caiman on the far bank */
const channelFlat: SectionTemplate = {
  id: 'w6-channel-flat',
  name: 'channel and flat run',
  archetypes: ['sprint'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: [W6_THEME.channels],
  pieces: [bank('a', [260, 300]), hop('b', 'a', [280, 320]), down('mud', 'b', 50, [300, 340]), up('c', 'mud', 50, [480, 540])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('a', 'a', 0.5, 1), ...postAndTide('b', 0.5, 'mud'), petals('mud', 'mud', 0.5, 2, 120), foe('caiman', 'c', [0.55, 0.65], ['caiman'], 4, { phases: HOT })],
  mirrorable: false,
};

// ───────────────────────────── 6-5 The Spear and 6-9 Blackwater: the hunters' banks ─────────────────────────────

/** a hunt gate (6-5 purge, 6-9 gauntlet): Dot explains the shut shrine before any animal, and the roll's theme opens */
const huntGate = (theme: keyof typeof W6_THEME, line: 'hunt' | 'fight', name: string, pieces: SectionPiece[], exit: string, sockets: Socket[]): SectionTemplate => ({
  id: `w6-${line}-gate-${theme}`,
  name: `${name} (arena gate)`,
  archetypes: [line === 'hunt' ? 'purge' : 'gauntlet'],
  phases: ['start'],
  difficulty: 1,
  teaches: W6_THEME[theme],
  weight: 6,
  pieces,
  entry: { piece: pieces[0].key, kind: 'ground' },
  exit: { piece: exit, kind: 'ground' },
  exitDy: 0,
  sockets: [tip(line, pieces[0].key, 0.15), ...sockets],
  mirrorable: false,
});

const gatePieces = (kind: 'knee' | 'gap'): SectionPiece[] =>
  kind === 'knee' ? [bank('a', [360, 420]), up('m', 'a', 36, [180, 220]), down('b', 'm', 36, [340, 400])] : [bank('a', [360, 420]), hop('b', 'a', [380, 440], [0.3, 0.38])];

const huntGates: SectionTemplate[] = [
  huntGate('cats', 'hunt', 'the cats\' banks', gatePieces('knee'), 'b', [petals('m', 'm', 0.5, 2, 80), scenery('snag', 'b', [0.4, 0.6], 0.8)]),
  huntGate('caimans', 'hunt', 'the caimans\' banks', gatePieces('gap'), 'b', [scenery('lilies', 'a', [0.5, 0.6], 0.8), petals('b', 'b', 0.5, 2, 90)]),
  huntGate('harpies', 'hunt', 'the harpies\' flats', gatePieces('knee'), 'b', [petals('m', 'm', 0.5, 1), petals('b', 'b', 0.6, 2, 90)]),
  huntGate('cats', 'fight', 'the blackwater cats', gatePieces('gap'), 'b', [petals('b', 'b', 0.5, 2, 90), scenery('snag', 'a', [0.5, 0.6], 0.8)]),
  huntGate('caimans', 'fight', 'the blackwater caimans', gatePieces('knee'), 'b', [petals('m', 'm', 0.5, 2, 80), scenery('lilies', 'b', [0.4, 0.6], 0.8)]),
  huntGate('harpies', 'fight', 'the blackwater flats', gatePieces('gap'), 'b', [petals('b', 'b', 0.5, 2, 90)]),
  huntGate('tides', 'fight', 'the blackwater tide', [bank('a', [380, 440]), down('mud', 'a', 50, [260, 300]), up('b', 'mud', 50, [300, 360])], 'b', [
    ...postAndTide('a', 0.8, 'mud'),
    petals('mud', 'mud', 0.5, 2, 100),
  ]),
];

/** any hunt: a bank over a knee with hunters on both sides (the arena's bread and butter) */
const hunterBank: SectionTemplate = {
  id: 'w6-hunter-bank',
  name: 'hunters bank arena',
  archetypes: ['purge', 'gauntlet'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 5,
  pieces: [bank('a', [420, 480]), up('m', 'a', 36, [200, 240]), down('b', 'm', 36, [560, 640])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'b', kind: 'ground' },
  exitDy: 0,
  sockets: [foe('f1', 'a', [0.55, 0.7], SMALL, 3), petals('m', 'm', 0.5, 1), foe('f2', 'b', [0.35, 0.45], SMALL, 3, { phases: LIVE }), foe('f3', 'b', [0.8, 0.88], KNOWN_CATS, 5, { phases: HOT, chance: 0.7 })],
  mirrorable: true,
};

/** any hunt: a sunken yard (a step down and back up) with two animals in it */
const sunkenYard: SectionTemplate = {
  id: 'w6-sunken-yard',
  name: 'sunken yard arena',
  archetypes: ['purge', 'gauntlet'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  pieces: [bank('a', [280, 320]), down('yard', 'a', 46, [760, 860]), up('b', 'yard', 46, [280, 320])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'b', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('a', 'a', 0.5, 1), foe('f1', 'yard', [0.25, 0.32], SMALL, 3), petals('yard', 'yard', 0.5, 2, 80), foe('f2', 'yard', [0.72, 0.8], KNOWN_CATS, 5, { phases: LIVE }), scenery('snag', 'b', [0.5, 0.7])],
  mirrorable: true,
};

/** cats: an ocelot past a soft gap, a jaguar on the high bank after a knee */
const catBanks: SectionTemplate = {
  id: 'w6-cat-banks',
  name: 'cats bank arena',
  archetypes: ['purge', 'gauntlet'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: [W6_THEME.cats],
  pieces: [bank('a', [300, 360]), hop('b', 'a', [440, 500], [0.32, 0.42], true), up('m', 'b', 40, [200, 240]), down('c', 'm', 40, [500, 580])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('a', 'a', 0.5, 2, 80), foe('f1', 'b', [0.5, 0.65], ['ocelot'], 3), petals('m', 'm', 0.5, 1), foe('f2', 'c', [0.5, 0.65], ['jaguar', 'ocelot'], 5, { phases: LIVE })],
  mirrorable: true,
};

/** cats: the jaguar's roots, two knees and a gap, the big cat at the end */
const jaguarRoots: SectionTemplate = {
  id: 'w6-jaguar-roots',
  name: 'jaguar roots arena',
  archetypes: ['purge', 'gauntlet'],
  phases: ['ten', 'ketsu'],
  difficulty: 8,
  uses: [W6_THEME.cats],
  pieces: [bank('a', [300, 340]), up('k1', 'a', 40, [180, 220]), down('b', 'k1', 40, [380, 440]), hop('c', 'b', [560, 640], [0.34, 0.42], true)],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('k1', 'k1', 0.5, 1), foe('f1', 'b', [0.5, 0.6], ['ocelot', 'tayra'], 3), foe('f2', 'c', [0.55, 0.65], ['jaguar'], 5)],
  mirrorable: true,
};

/** caimans: a caiman on the bank past the gap, a frog on the knee after it */
const caimanBank: SectionTemplate = {
  id: 'w6-caiman-bank',
  name: 'caiman bank arena',
  archetypes: ['purge', 'gauntlet'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: [W6_THEME.caimans],
  pieces: [bank('a', [320, 380]), hop('b', 'a', [560, 640], [0.3, 0.4], true), up('m', 'b', 36, [200, 240]), down('c', 'm', 36, [340, 400])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('a', 'a', 0.5, 2, 80), foe('caiman', 'b', [0.5, 0.6], ['caiman'], 4), foe('frog', 'm', 0.5, ['frog'], 1.5, { phases: LIVE, chance: 0.7 }), foe('f2', 'c', [0.55, 0.7], ['tayra', 'ocelot'], 3, { phases: HOT, chance: 0.7 })],
  mirrorable: true,
};

/** caimans: two caimans on two banks over a channel */
const caimanPair: SectionTemplate = {
  id: 'w6-caiman-pair',
  name: 'two caimans arena',
  archetypes: ['purge', 'gauntlet'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 7,
  uses: [W6_THEME.caimans],
  pieces: [bank('a', [520, 600]), hop('b', 'a', [520, 600], [0.32, 0.42], true)],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'b', kind: 'ground' },
  exitDy: 0,
  sockets: [foe('c1', 'a', [0.55, 0.65], ['caiman'], 4), scenery('lilies', 'b', [0.15, 0.25]), foe('c2', 'b', [0.55, 0.65], ['caiman'], 4, { phases: LIVE })],
  mirrorable: true,
};

/** harpies: a long flat for the harpy to slide on, a knee to jump onto out of its way */
const harpyFlat: SectionTemplate = {
  id: 'w6-harpy-flat',
  name: 'harpy flat arena',
  archetypes: ['purge', 'gauntlet'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 7,
  uses: [W6_THEME.harpies],
  pieces: [bank('a', [300, 340]), up('m', 'a', 36, [180, 220]), down('flat', 'm', 36, [700, 800]), up('m2', 'flat', 36, [180, 220]), down('b', 'm2', 36, [240, 280])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'b', kind: 'ground' },
  exitDy: 0,
  sockets: [petals('m', 'm', 0.5, 1), foe('harpy', 'flat', [0.45, 0.55], ['harpy'], 4), petals('m2', 'm2', 0.5, 1), foe('f2', 'a', [0.4, 0.6], ['tayra'], 2.5, { phases: HOT, chance: 0.6 })],
  mirrorable: true,
};

/** harpies: tayras scurrying a gap's two banks */
const tayraBanks: SectionTemplate = {
  id: 'w6-tayra-banks',
  name: 'tayra banks arena',
  archetypes: ['purge', 'gauntlet'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 5,
  uses: [W6_THEME.harpies],
  pieces: [bank('a', [440, 500]), hop('b', 'a', [440, 500], [0.3, 0.4], true), up('m', 'b', 36, [180, 220]), down('c', 'm', 36, [280, 320])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'c', kind: 'ground' },
  exitDy: 0,
  sockets: [foe('t1', 'a', [0.55, 0.7], ['tayra'], 2.5), foe('t2', 'b', [0.45, 0.6], ['tayra'], 2.5, { phases: LIVE }), petals('m', 'm', 0.5, 1), foe('f3', 'c', [0.5, 0.6], ['harpy', 'ocelot'], 4, { phases: HOT, chance: 0.6 })],
  mirrorable: true,
};

/** tides (6-9): a mudflat whose far bank holds a hunter, the tide on its own beat */
const tideHunt: SectionTemplate = {
  id: 'w6-tide-hunt',
  name: 'tide hunters arena',
  archetypes: ['gauntlet'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 7,
  uses: [W6_THEME.tides],
  pieces: [bank('a', [340, 400]), down('mud', 'a', 50, [320, 380]), up('b', 'mud', 50, [520, 600])],
  entry: { piece: 'a', kind: 'ground' },
  exit: { piece: 'b', kind: 'ground' },
  exitDy: 0,
  sockets: [foe('f1', 'a', [0.3, 0.45], SMALL, 3), ...postAndTide('a', 0.8, 'mud'), foe('f2', 'b', [0.45, 0.6], ['ocelot', 'caiman', 'jaguar'], 5), petals('b', 'b', 0.85, 1)],
  mirrorable: false,
};

// ───────────────────────────── the list ─────────────────────────────

export const W6_GROUND_SECTIONS: SectionTemplate[] = [
  bankWalk,
  rootSteps,
  lilyRest,
  stumpHop,
  mudGap,
  rise,
  drop,
  doubleGap,
  rootRoad,
  ...watchGates,
  watchPools,
  poolKnee,
  watchReeds,
  reedRoad,
  baskBank,
  baskGap,
  watchKnees,
  ...tideGates,
  mudflat,
  twinFlats,
  longFlat,
  kneeFlats,
  kneeRun,
  channelHop,
  channelFlat,
  ...huntGates,
  hunterBank,
  sunkenYard,
  catBanks,
  jaguarRoots,
  caimanBank,
  caimanPair,
  harpyFlat,
  tayraBanks,
  tideHunt,
];

/** the second-jump gaps (section id -> its piece landed on): they stay soft mud when World 6's gaps turn to water (STAGE-RULES §6) */
export const W6_MUD_GAPS: Readonly<Record<string, readonly string[]>> = { 'w6-double-gap': ['far'] };

/**
 * The sections only some stages of World 6 hold (the rest go where their archetypes and phases allow): 6-4's tide gates and its own
 * flats and knees are Low Tide's, so 6-6 Lights in the Roots (a sprint too) is not a second tide stage. w6.ts w6Kit filters by it.
 */
export const W6_STAGE_ONLY: Readonly<Record<string, readonly number[]>> = Object.fromEntries(
  [...tideGates.map((s) => s.id), 'w6-twin-flats', 'w6-long-flat', 'w6-knee-flats', 'w6-channel-flat', 'w6-mudflat'].map((id) => [id, [4, 9]]),
);
