/**
 * gen2/worlds/w6Ground — World 6's ground building blocks (DESIGN.md B9): the mangrove banks and knee roots every stage shares, the
 * flat water of 6-2 (hide in the roots while the spear watches from the water), the mudflats of 6-4 (cross while the tide is out), and
 * the hunters' banks of 6-5 The Spear and 6-9 Blackwater. The swings over the black water (6-1, 6-3, 6-7) and the puzzle rooms are the
 * swing builder's (gen2-w6-swing), on the same manifest (w6.ts).
 *
 * Beats. Every beat is ground the route really crosses (World 5's lesson, STAGE-RULES §6: a stump standing ON a bank is walked past):
 * a knee root stepped up onto (a step DOWN is a plain walk to the inspector: only the way up is a hop), a soft gap hopped, a mudflat
 * crossed, an animal on the bank, the watcher's pass. No flat runs much over 400 px without one (a quick player's 1.4 s), so no stretch
 * is quiet for 2 s on Normal. Every piece is placed by rule from the one before it, every rise is one hop, every gap a share of the
 * jump the difficulty allows, every dip a soft pit with a step out, and nothing crumbles.
 *
 * Water (w6.ts header): most of World 6's stages are black water between the roots (a fall costs a life, Dot warns first on Easy),
 * 6-4 and 6-6 are mud. A plain gap (`hop`) is a third of a jump (0.30-0.42 of the envelope, which is already 0.82 of the reach on Normal:
 * 60 px), as STAGE-RULES §6 asks over water; a wide gap (`wide`, the jump's own width) and a second-jump gap (`leap`) are mud only:
 * W6_MUD_GAPS lists them and a water stage never holds them.
 *
 * Teaching (STAGE-RULES §1): each stage's start gate shows its thing first, on its own, and says Dot's line: 6-2's the watching water
 * (a long calm before the first pass, roots in reach), 6-4's the tide (its post, then one short mudflat, no animal near), 6-5's and
 * 6-9's the shut shrine. The new animals (caiman, frog, tayra, harpy) are taught where each is first laid, whichever section it is in:
 * w6.ts w6Spawn notes them and w6Finish puts Dot's line before the first of each kind.
 *
 * Variety (STAGE-RULES §6: "a different mix of actions, not a different order"). The gate also opens the roll's THEME (W6_THEME): the
 * sections of that theme come only after it (the pipeline's teaching gate), and each theme leans on its own heavy beat, so two rolls
 * differ all through: the zones (the watcher, the tide: Z), the animals (C), the wide jumps (J) or the knee roots (h). The shared
 * sections weigh little (SHARED) so the theme carries the stage.
 */
import type { Phase, SectionPiece, SectionTemplate, Socket } from '../types.ts';

// ───────────────────────────── the themes ─────────────────────────────

/** each roll's gate opens one theme; the themed sections `use` it */
export const W6_THEME = {
  /** 6-2, wide jumps: watched banks with wide soft gaps between, frogs */
  pools: 'w6:pools',
  /** 6-2, knee roots: reed beds on watched banks of knees, a high root road */
  reeds: 'w6:reeds',
  /** 6-2, animals: caimans lying on the watched banks between the roots, cats waiting */
  basking: 'w6:basking',
  /** 6-4, the tide: mudflat after mudflat */
  flats: 'w6:flats',
  /** 6-4, knee roots: runs of knees, frogs on them, a short flat between */
  knees: 'w6:knees',
  /** 6-4, wide jumps: channels too wide to hop, caimans on the banks */
  channels: 'w6:channels',
  /** 6-5 / 6-9, knee roots: the cats' banks */
  cats: 'w6:cats',
  /** 6-5 / 6-9, the tide: caimans in the tide flats (the tide was taught in 6-4) */
  caimans: 'w6:caimans',
  /** 6-5 / 6-9, wide jumps: the harpies' flats over wide channels, quick tayras */
  harpies: 'w6:harpies',
} as const;
export type W6Theme = (typeof W6_THEME)[keyof typeof W6_THEME];

/** the tide's and the watching water's lesson keys (w6.ts W6_LESSON): Dot's lines in 6-4's and 6-2's gates */
const TIDE = 'tide';
const WATCH = 'watch';

/** the weight of a section every roll may hold (the theme's weigh 1, and the stealth, run and arena ones 3 more for their stage) */
const SHARED = 0.3;

// ───────────────────────────── helpers ─────────────────────────────

type Opt = Partial<Socket>;
type W = SectionPiece['w'];
const LIVE: Phase[] = ['sho', 'ten', 'ketsu'];
const HOT: Phase[] = ['ten', 'ketsu'];

const bank = (key: string, w: W, place: SectionPiece['place'] = { kind: 'start' }, o: Partial<SectionPiece> = {}): SectionPiece => ({ key, shape: 'bank', w, place, ...o });
/** a knee root or a mound: a step up `dy` px onto a piece; `down` steps back down (the way up is a hop, the way down a walk) */
const up = (key: string, after: string, dy: number, w: W): SectionPiece => bank(key, w, { kind: 'walk', after, dy: -dy });
const down = (key: string, after: string, dy: number, w: W): SectionPiece => bank(key, w, { kind: 'walk', after, dy });
/** a soft gap hopped: a third of a jump or so (it can turn to water as it is) */
const hop = (key: string, after: string, w: W, share: W = [0.3, 0.42], landing = false): SectionPiece =>
  bank(key, w, { kind: 'pit', after, jump: 'jump', share }, landing ? { landing } : {});
/** a wide soft gap: the jump's own width (over 100 px on Normal, a real jump to the inspector); it stays mud (W6_MUD_GAPS) */
const wide = (key: string, after: string, w: W, share: W = [0.76, 0.94]): SectionPiece => bank(key, w, { kind: 'pit', after, jump: 'jump', share }, { landing: true });
/** a wide soft gap crossed with the second jump: it stays mud (W6_MUD_GAPS) */
const leap = (key: string, after: string, w: W, share: W = [0.5, 0.72]): SectionPiece => bank(key, w, { kind: 'pit', after, jump: 'double', share }, { landing: true });
/** a root road over `on`, off the main route: the high way past what is below */
const road = (key: string, on: string, at: W, dy: W, w: W): SectionPiece => ({ key, shape: 'branch', w, place: { kind: 'over', on, at, dy }, main: false });
/** n knee roots after `after`: up onto each and down off it to a flat of `flat` px (keys `${p}k1`, `${p}f1`, ...); the last flat's key */
function knees(p: string, after: string, n: number, flat: W, dy: [number, number] = [30, 38], kneeW: W = [150, 175]): { pieces: SectionPiece[]; last: string } {
  const out: SectionPiece[] = [];
  let prev = after;
  for (let i = 1; i <= n; i++) {
    const h = Math.round(dy[0] + ((dy[1] - dy[0]) * (i % 3)) / 2);
    out.push(up(`${p}k${i}`, prev, h, kneeW), down(`${p}f${i}`, `${p}k${i}`, h, flat));
    prev = `${p}f${i}`;
  }
  return { pieces: out, last: prev };
}

const petals = (id: string, on: string, t: Socket['t'], count = 2, span = 120, o: Opt = {}): Socket => ({ id, role: 'pickup', on, t, dn: 34, count, span, ...o });
const prop = (id: string, on: string, t: Socket['t'], allow: string[], o: Opt = {}): Socket => ({ id, role: 'prop', on, t, allow, ...o });
/** a root den or a reed bed to hide in (the bag alternates them) */
const hideAt = (id: string, on: string, t: Socket['t'] = 0.5) => prop(id, on, t, ['hide', 'cover']);
/** the watched water over the stretch `on` is part of (w6.ts covers the whole run); at its start, so it keeps out of the animals' way
 *  (the spacing pass holds every animal 120 px from any prop and any hop or gap) */
const watch = (on: string, t: Socket['t'] = 0.03, id = 'watch') => prop(id, on, t, ['watch']);
const tide = (id: string, on: string, t: Socket['t'] = 0.5) => prop(id, on, t, ['tide']);
const scenery = (id: string, on: string, t: Socket['t'], chance = 0.6) => prop(id, on, t, ['scenery'], { chance });
const flag = (on: string, t: Socket['t']): Socket => ({ id: 'flag', role: 'flag', on, t });
const tip = (mechanic: string, on: string, t: Socket['t'] = 0.15, id = `tip-${mechanic}`): Socket => ({ id, role: 'tip', on, t, allow: [mechanic] });
/** an animal: `kinds` are creature ids it may be; `max` the most threat it may take */
const foe = (id: string, on: string, t: Socket['t'], kinds: string[], max: number, o: Opt = {}): Socket => ({ id, role: 'enemy', on, t, allow: kinds, maxThreat: max, easy: 'soften', ...o });
/** the post and its tide, linked (both or neither: w6.ts W6_PAIRS) */
const postAndTide = (postOn: string, postT: Socket['t'], mudOn: string, mudT: Socket['t'] = 0.5, id = ''): Socket[] => [
  { id: `post${id}`, role: 'source', on: postOn, t: postT },
  { id: `tide${id}`, role: 'receptor', on: mudOn, t: mudT, link: `post${id}`, allow: ['tide'] },
];
/** a mudflat: a step down into the mud from `after`, and its key (the step out is the next piece's `up`) */
const mud = (key: string, after: string, w: W): SectionPiece => down(key, after, 50, w);

const CATS = ['ocelot', 'jaguar'];
const SMALL = ['frog', 'tayra', 'ocelot'];

/** the bones every section shares */
const section = (s: Omit<SectionTemplate, 'entry' | 'exit' | 'exitDy'> & { exitDy?: number; first?: string; last: string }): SectionTemplate => {
  const { first, last, exitDy, ...rest } = s;
  return { ...rest, entry: { piece: first ?? s.pieces[0].key, kind: 'ground' }, exit: { piece: last, kind: 'ground' }, exitDy: exitDy ?? 0 };
};

// ───────────────────────────── every stage: banks, knees, rests, the shrine's approach ─────────────────────────────

const bankKnees = knees('', 'a', 2, [180, 220]);
/** a stretch of mangrove bank over two knee roots: petals, a flag, lily pads at the water's edge */
const bankWalk = section({
  id: 'w6-bank',
  name: 'mangrove bank',
  archetypes: 'any',
  phases: ['rest', 'goal'],
  difficulty: 1,
  pieces: [bank('a', [180, 220]), ...bankKnees.pieces],
  last: bankKnees.last,
  sockets: [scenery('lilies', 'a', [0.3, 0.5]), petals('k1', 'k1', 0.5, 2, 80), flag('f1', 0.6), petals('k2', 'k2', 0.5, 1), scenery('snag', 'f2', [0.5, 0.7], 0.5)],
  mirrorable: true,
});

/** a little staircase of roots, up two and down two, a flag at the top */
const rootSteps = section({
  id: 'w6-root-steps',
  name: 'root steps',
  archetypes: 'any',
  phases: ['rest', 'goal'],
  difficulty: 2,
  pieces: [bank('a', [180, 220]), up('r1', 'a', 34, [160, 190]), up('r2', 'r1', 30, [220, 260]), down('r3', 'r2', 30, [180, 210]), up('k', 'r3', 30, [150, 170]), down('c', 'k', 64, [200, 240])],
  last: 'c',
  sockets: [petals('r1', 'r1', 0.5, 1), flag('r2', 0.5), petals('r3', 'r3', 0.5, 1), petals('k', 'k', 0.5, 1), scenery('snag', 'c', [0.4, 0.6])],
  mirrorable: true,
});

/** a quiet bank with lily pads at the water's edge, two low knees (a breather that still has a hop in it) */
const lilyRest = section({
  id: 'w6-lily-rest',
  name: 'lily bank',
  archetypes: 'any',
  phases: ['rest', 'goal'],
  difficulty: 1,
  pieces: [bank('a', [160, 200]), up('k0', 'a', 30, [150, 170]), down('edge', 'k0', 30, [220, 260]), up('k1', 'edge', 30, [150, 170]), down('b', 'k1', 30, [180, 220])],
  last: 'b',
  sockets: [petals('k0', 'k0', 0.5, 1), scenery('lilies', 'edge', 0.5, 1), flag('edge', 0.7), petals('k1', 'k1', 0.5, 1), petals('b', 'b', 0.5, 1)],
  mirrorable: true,
});

const landingKnees = knees('', 'a', 2, [180, 220]);
/**
 * The start of a stage with no gate (the vine stages, 6-6): a plain bank over two knees, nothing that can hurt. The stages with a gate
 * (6-2, 6-4, 6-5, 6-9) always start at their gate, which opens the roll's theme (W6_STAGE_SKIP keeps this one out of them)
 */
const landing = section({
  id: 'w6-landing',
  name: 'landing bank',
  archetypes: 'any',
  phases: ['start'],
  difficulty: 1,
  pieces: [bank('a', [180, 220]), ...landingKnees.pieces],
  last: landingKnees.last,
  sockets: [scenery('lilies', 'a', [0.4, 0.6], 0.8), petals('k1', 'k1', 0.5, 1), petals('f1', 'f1', 0.5, 2, 80), petals('k2', 'k2', 0.5, 1)],
  mirrorable: true,
});

// ───────────────────────────── every stage: Ki to Ketsu (shared: they weigh little) ─────────────────────────────

/** a soft gap, a knee root, a small animal past it */
const stumpHop = section({
  id: 'w6-stump-hop',
  name: 'knee and gap',
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten'],
  difficulty: 3,
  weight: SHARED,
  pieces: [bank('a', [180, 220]), hop('b', 'a', [300, 340]), up('c', 'b', 38, [160, 190]), down('d', 'c', 38, [260, 300])],
  last: 'd',
  sockets: [petals('a', 'a', 0.5, 2, 80), foe('frog', 'b', [0.5, 0.6], ['frog'], 1.5, { phases: LIVE, chance: 0.7 }), petals('c', 'c', 0.5, 1), foe('cat', 'd', [0.6, 0.75], CATS, 3, { phases: HOT, chance: 0.6 })],
  mirrorable: true,
});

/** a soft gap onto a bank over a knee, a hunter on the far side */
const mudGap = section({
  id: 'w6-mud-gap',
  name: 'mud gap',
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 4,
  weight: SHARED,
  pieces: [bank('near', [200, 240]), hop('far', 'near', [300, 340], [0.32, 0.42], true), up('m', 'far', 36, [180, 220]), down('far2', 'm', 36, [280, 320])],
  last: 'far2',
  sockets: [petals('near', 'near', 0.45, 2, 90), scenery('lilies', 'far', [0.2, 0.3]), petals('m', 'm', 0.5, 1), foe('foe', 'far2', [0.5, 0.65], ['ocelot', 'tayra', 'frog'], 3, { phases: LIVE })],
  mirrorable: true,
});

/** a step up onto a higher bank (one hop), a knee and a gap along it, a hunter there */
const rise = section({
  id: 'w6-rise',
  name: 'a step up',
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten'],
  difficulty: 4,
  weight: SHARED,
  pieces: [bank('a', [200, 240]), up('b', 'a', 48, [280, 320]), hop('c', 'b', [300, 340])],
  last: 'c',
  exitDy: -48,
  sockets: [petals('a', 'a', 0.5, 2, 90), scenery('snag', 'b', [0.3, 0.5]), foe('foe', 'c', [0.5, 0.7], ['ocelot', 'tayra'], 3, { phases: LIVE, chance: 0.8 })],
  mirrorable: false,
});

/** a step down to a lower bank, a knee, a gap along it, a frog by the water */
const drop = section({
  id: 'w6-drop',
  name: 'a step down',
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten'],
  difficulty: 4,
  weight: SHARED,
  pieces: [bank('a', [180, 220]), up('k', 'a', 30, [150, 170]), down('b2', 'k', 78, [240, 280]), hop('c', 'b2', [300, 340])],
  last: 'c',
  exitDy: 48,
  sockets: [petals('a', 'a', 0.5, 2, 90), foe('frog', 'b2', 0.55, ['frog'], 1.5, { phases: LIVE, chance: 0.7 }), scenery('lilies', 'c', [0.2, 0.3]), foe('foe', 'c', [0.6, 0.8], CATS, 3, { phases: HOT, chance: 0.6 })],
  mirrorable: false,
});

/** a wide soft gap only the second jump crosses (it stays mud), a knee after it */
const doubleGap = section({
  id: 'w6-double-gap',
  name: 'wide mud gap',
  archetypes: 'any',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 7,
  weight: SHARED,
  needs: ['double'],
  pieces: [bank('near', [200, 240]), leap('far', 'near', [300, 340]), up('m', 'far', 36, [180, 220]), down('b', 'm', 36, [240, 280])],
  last: 'b',
  sockets: [petals('near', 'near', 0.5, 2, 90), petals('m', 'm', 0.5, 1), foe('foe', 'b', [0.5, 0.7], ['ocelot', 'tayra', 'frog'], 3, { phases: HOT, chance: 0.7 })],
  mirrorable: true,
});

/** a high road of roots over a bank of knees: up out of the way, or down among the animals */
const roadKnees = knees('', 'b', 1, [260, 300]);
const rootRoad = section({
  id: 'w6-root-road',
  name: 'root road',
  archetypes: 'any',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  weight: SHARED,
  pieces: [bank('a', [200, 240]), up('m1', 'a', 36, [180, 220]), down('b', 'm1', 36, [380, 440]), road('road', 'b', [0.1, 0.2], [-100, -90], [320, 380]), ...roadKnees.pieces],
  last: roadKnees.last,
  sockets: [petals('m1', 'm1', 0.5, 1), petals('road', 'road', 0.5, 3, 240), foe('foe', 'b', [0.55, 0.7], ['ocelot', 'tayra', 'frog'], 3), petals('k1', 'k1', 0.5, 1), foe('foe2', 'f1', [0.5, 0.7], CATS, 5, { phases: HOT, chance: 0.6 })],
  mirrorable: true,
});

// ───────────────────────────── 6-2 Flat Water: hide in the roots while the water watches ─────────────────────────────

/** the stealth gates' watched shore: a bank and two knees, a root to hide in on each flat (the watch covers them all: w6.ts) */
const shore = knees('s', 'shore', 2, [200, 240], [28, 32], [150, 170]);
/** a stealth gate: Dot's line, then a long watched shore with roots in reach, a long calm before the first pass, no animal */
const watchGate = (theme: keyof typeof W6_THEME, name: string, extra: Socket[] = []): SectionTemplate =>
  section({
    id: `w6-watch-gate-${theme}`,
    name: `flat water: ${name} (cover)`,
    archetypes: ['stealth'],
    phases: ['start'],
    difficulty: 1,
    teaches: W6_THEME[theme],
    weight: 6,
    pieces: [bank('a', [200, 240]), up('knee', 'a', 30, [150, 180]), down('shore', 'knee', 30, [200, 240]), ...shore.pieces],
    last: shore.last,
    sockets: [
      tip(WATCH, 'a', 0.2),
      petals('knee', 'knee', 0.5, 1),
      // (the lesson's calm: watchCalm's [9, 11], from this socket's name)
      watch('shore', 0.03, 'watchLesson'),
      hideAt('h1', 'shore'),
      petals('sk1', 'sk1', 0.5, 1),
      hideAt('h2', 'sf1'),
      petals('sk2', 'sk2', 0.5, 1),
      hideAt('h3', 'sf2', 0.6),
      ...extra,
    ],
    mirrorable: false,
  });

const watchGates: SectionTemplate[] = [
  watchGate('pools', 'the pools'),
  watchGate('reeds', 'the reed beds', [scenery('lilies', 'a', [0.5, 0.6], 0.8)]),
  watchGate('basking', 'the basking banks', [scenery('snag', 'a', [0.55, 0.65], 0.8)]),
];

/** pools: two watched banks with a wide soft gap between, a root at each end of each, a frog on the far one */
const watchPools = section({
  id: 'w6-watch-pools',
  name: 'watched pools cover',
  archetypes: ['stealth'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 5,
  uses: [W6_THEME.pools],
  pieces: [bank('a', [300, 340]), hop('b', 'a', [300, 340]), hop('c', 'b', [300, 340]), hop('d', 'c', [280, 320])],
  last: 'd',
  sockets: [
    watch('a'), hideAt('h1', 'a'), watch('b', 0.03, 'watch2'), hideAt('h2', 'b'), watch('c', 0.03, 'watch3'), hideAt('h3', 'c', 0.35),
    foe('frog', 'c', [0.75, 0.8], ['frog'], 1.5, { phases: LIVE, chance: 0.7 }), watch('d', 0.03, 'watch4'), hideAt('h4', 'd'),
  ],
  mirrorable: true,
});

/** pools: three banks over two wide gaps, a knee on the middle one, frogs */
const poolChain = section({
  id: 'w6-pool-chain',
  name: 'pool chain cover',
  archetypes: ['stealth'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: [W6_THEME.pools],
  pieces: [bank('a', [260, 300]), hop('b', 'a', [260, 300]), hop('c', 'b', [260, 300]), hop('d', 'c', [300, 340])],
  last: 'd',
  sockets: [watch('a'), hideAt('h1', 'a'), watch('b', 0.03, 'watch2'), hideAt('h2', 'b'), watch('c', 0.03, 'watch3'), hideAt('h3', 'c'), watch('d', 0.03, 'watch4'), hideAt('h4', 'd', 0.35), petals('d', 'd', 0.75, 1)],
  mirrorable: true,
});

/** pools: one long watched bank between two wide gaps, roots along it */
const poolLong = section({
  id: 'w6-pool-long',
  name: 'long pool cover',
  archetypes: ['stealth'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 5,
  uses: [W6_THEME.pools],
  pieces: [bank('a', [260, 300]), hop('b', 'a', [320, 360]), hop('c', 'b', [260, 300])],
  last: 'c',
  sockets: [hideAt('h1', 'a'), watch('b'), hideAt('h2', 'b', 0.25), petals('b', 'b', 0.55, 1), hideAt('h3', 'b', 0.8), watch('c', 0.03, 'watch2'), hideAt('h4', 'c'), foe('frog', 'c', [0.75, 0.8], ['frog'], 1.5, { phases: HOT, chance: 0.7 })],
  mirrorable: true,
});

const reedKnees = knees('', 'a', 3, [170, 200], [30, 38], [140, 160]);
/** reeds: a long watched bank of reed beds over three knees, a tayra running the far end */
const watchReeds = section({
  id: 'w6-watch-reeds',
  name: 'watched reeds cover',
  archetypes: ['stealth'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 5,
  uses: [W6_THEME.reeds],
  pieces: [bank('a', [150, 180]), ...reedKnees.pieces, up('k4', reedKnees.last, 30, [140, 160]), down('f4', 'k4', 30, [260, 300])],
  last: 'f4',
  sockets: [watch('a'), hideAt('h1', 'f1'), petals('k2', 'k2', 0.5, 1), hideAt('h2', 'f2'), hideAt('h3', 'f3'), hideAt('h4', 'f4', 0.25), foe('foe', 'f4', [0.62, 0.7], ['tayra'], 2.5, { phases: LIVE, chance: 0.6 })],
  mirrorable: true,
});

const reedRunKnees = knees('', 'a', 3, [170, 200], [30, 40], [140, 160]);
/** reeds: four knees in a row through the reed beds, a hunter at the end once it is busier */
const reedRun = section({
  id: 'w6-reed-run',
  name: 'reed knees cover',
  archetypes: ['stealth'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: [W6_THEME.reeds],
  pieces: [bank('a', [150, 180]), ...reedRunKnees.pieces, up('k4', reedRunKnees.last, 34, [140, 160]), down('f4', 'k4', 34, [280, 320])],
  last: 'f4',
  sockets: [watch('a'), hideAt('h1', 'f1'), petals('k2', 'k2', 0.5, 1), hideAt('h2', 'f2'), hideAt('h3', 'f3'), hideAt('h4', 'f4', 0.25), foe('foe', 'f4', [0.62, 0.7], ['tayra', 'ocelot'], 3, { phases: HOT, chance: 0.6 })],
  mirrorable: true,
});

const reedStairKnees = knees('', 'top', 2, [160, 190], [30, 34], [130, 150]);
/** reeds: a staircase of knees up onto a high watched bank and its reeds, and on across the water at that height */
const reedStairs = section({
  id: 'w6-reed-stairs',
  name: 'reed stairs cover',
  archetypes: ['stealth'],
  phases: ['ki', 'sho', 'ten'],
  difficulty: 4,
  uses: [W6_THEME.reeds],
  pieces: [bank('a', [150, 180]), up('s1', 'a', 34, [140, 160]), up('top', 's1', 30, [200, 240]), ...reedStairKnees.pieces, hop('c', reedStairKnees.last, [200, 240])],
  last: 'c',
  exitDy: -64,
  sockets: [hideAt('h1', 'a', 0.5), watch('top'), hideAt('h2', 'top', 0.5), hideAt('h3', 'f1'), petals('k2', 'k2', 0.5, 1), hideAt('h4', 'f2'), hideAt('h5', 'c', 0.5)],
  // (never flipped: the stairs go up, which is where the hops are, and the exit stays above the entry)
  mirrorable: false,
});

/** any stealth roll: two watched banks over a knee, a root on each, a frog or a cat waiting at the end */
const watchKnees = section({
  id: 'w6-watch-knees',
  name: 'watched knees cover',
  archetypes: ['stealth'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 4,
  weight: SHARED,
  pieces: [bank('a', [180, 220]), up('k', 'a', 34, [150, 170]), down('b', 'k', 34, [200, 240]), up('k2', 'b', 30, [150, 170]), down('c', 'k2', 30, [280, 320])],
  last: 'c',
  sockets: [watch('a'), hideAt('h1', 'a', 0.3), petals('k', 'k', 0.5, 1), hideAt('h2', 'b', 0.5), petals('k2', 'k2', 0.5, 1), hideAt('h3', 'c', 0.3), foe('foe', 'c', [0.65, 0.75], ['frog', 'ocelot'], 3, { phases: LIVE, chance: 0.7 })],
  mirrorable: true,
});

/** basking: a caiman lies on a watched bank between two roots; hop the knee and slip past it in a calm */
const baskBank = section({
  id: 'w6-bask-bank',
  name: 'basking caiman cover',
  archetypes: ['stealth'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: [W6_THEME.basking],
  pieces: [bank('a', [300, 340]), up('k', 'a', 30, [160, 190]), down('b', 'k', 30, [380, 420]), hop('c', 'b', [300, 340])],
  last: 'c',
  sockets: [
    watch('a'), hideAt('h1', 'a', 0.25), foe('frog', 'a', [0.72, 0.78], ['frog'], 1.5), hideAt('h2', 'b', 0.12), foe('caiman', 'b', [0.6, 0.65], ['caiman'], 3),
    watch('c', 0.03, 'watch2'), hideAt('h3', 'c', 0.3), foe('frog2', 'c', [0.72, 0.78], ['frog'], 1.5, { phases: HOT }),
  ],
  mirrorable: true,
});

/** basking: a soft gap onto a watched bank, a caiman, then a cat by the water */
const baskGap = section({
  id: 'w6-bask-gap',
  name: 'caiman past the gap cover',
  archetypes: ['stealth'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 5,
  uses: [W6_THEME.basking],
  pieces: [bank('a', [300, 340]), hop('b', 'a', [460, 500], [0.3, 0.4], true), hop('c', 'b', [300, 340])],
  last: 'c',
  sockets: [hideAt('h1', 'a'), watch('b'), hideAt('h2', 'b', 0.15), foe('caiman', 'b', [0.55, 0.62], ['caiman'], 3, { phases: LIVE }), hideAt('h3', 'b', 0.9), hideAt('h4', 'c', 0.3), foe('frog', 'c', [0.72, 0.78], ['frog'], 1.5, { phases: LIVE })],
  mirrorable: true,
});

/** basking: frogs on three banks over short gaps, a root on each */
const baskFrogs = section({
  id: 'w6-bask-frogs',
  name: 'frog banks cover',
  archetypes: ['stealth'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 5,
  uses: [W6_THEME.basking],
  pieces: [bank('a', [320, 360]), hop('b', 'a', [320, 360]), hop('c', 'b', [300, 340])],
  last: 'c',
  sockets: [
    watch('a'), hideAt('h1', 'a', 0.2), foe('f1', 'a', [0.7, 0.78], ['frog'], 1.5), watch('b', 0.03, 'watch2'), hideAt('h2', 'b', 0.2), foe('f2', 'b', [0.7, 0.78], ['frog', 'tayra'], 2.5),
    watch('c', 0.03, 'watch3'), hideAt('h3', 'c', 0.3), foe('f3', 'c', [0.72, 0.8], ['frog'], 1.5, { phases: HOT }),
  ],
  mirrorable: true,
});

/** basking: two animals on one watched bank (a frog and a cat), the roots between */
const baskPair = section({
  id: 'w6-bask-pair',
  name: 'two on the bank cover',
  archetypes: ['stealth'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: [W6_THEME.basking],
  pieces: [bank('a', [300, 340]), up('k', 'a', 32, [160, 190]), down('b', 'k', 32, [300, 340]), up('k2', 'b', 30, [160, 190]), down('c', 'k2', 30, [200, 240])],
  last: 'c',
  sockets: [watch('a'), hideAt('h1', 'a', 0.15), foe('f1', 'a', [0.6, 0.7], ['frog', 'tayra'], 2.5), hideAt('h2', 'b', 0.2), foe('f2', 'b', [0.6, 0.7], ['ocelot', 'caiman'], 3, { phases: LIVE }), hideAt('h3', 'c', 0.5)],
  mirrorable: true,
});

// ───────────────────────────── 6-4 Low Tide: cross the mudflats while the tide is out ─────────────────────────────

/** a sprint gate: Dot's line and the tide post on the bank, then one short mudflat (no animal near), and out the far side */
const tideGate = (theme: keyof typeof W6_THEME, name: string, extra: Socket[] = []): SectionTemplate =>
  section({
    id: `w6-tide-gate-${theme}`,
    name: `low tide: ${name} run`,
    archetypes: ['sprint'],
    phases: ['start'],
    difficulty: 1,
    teaches: W6_THEME[theme],
    weight: 6,
    pieces: [bank('a', [200, 240]), up('k', 'a', 30, [150, 180]), down('a2', 'k', 30, [200, 240]), mud('mud', 'a2', [260, 300]), up('b', 'mud', 50, [220, 260]), up('k2', 'b', 30, [150, 180]), down('c', 'k2', 30, [200, 240])],
    last: 'c',
    sockets: [tip(TIDE, 'a', 0.15), petals('k', 'k', 0.5, 1), ...postAndTide('a2', 0.6, 'mud'), petals('mud', 'mud', 0.5, 2, 120), petals('k2', 'k2', 0.5, 1), ...extra],
    mirrorable: false,
  });

const tideGates: SectionTemplate[] = [
  tideGate('flats', 'the long flats', [scenery('snag', 'c', [0.5, 0.7], 0.8)]),
  tideGate('knees', 'the knee roots'),
  tideGate('channels', 'the channels', [scenery('lilies', 'b', [0.4, 0.6], 0.8)]),
];

/** a mudflat: down into the mud, across while it is low, up the far bank over a knee (any roll of 6-4) */
const mudflat = section({
  id: 'w6-mudflat',
  name: 'mudflat run',
  archetypes: ['sprint', 'gauntlet'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 4,
  weight: SHARED,
  pieces: [bank('a', [200, 240]), mud('mud', 'a', [300, 340]), up('b', 'mud', 50, [240, 280]), up('k', 'b', 30, [160, 190]), down('c', 'k', 30, [260, 300])],
  last: 'c',
  sockets: [...postAndTide('a', 0.6, 'mud'), petals('mud', 'mud', 0.5, 2, 140), foe('foe', 'c', [0.5, 0.65], ['frog', 'tayra'], 2.5, { phases: LIVE, chance: 0.8 })],
  mirrorable: false,
});

/** flats: one mudflat after another, a knee between, the second on its own beat */
const twinFlats = section({
  id: 'w6-twin-flats',
  name: 'two mudflats run',
  archetypes: ['sprint'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 5,
  uses: [W6_THEME.flats],
  pieces: [bank('a', [180, 220]), mud('mud1', 'a', [300, 340]), up('knee', 'mud1', 50, [200, 240]), mud('mud2', 'knee', [280, 320]), up('b', 'mud2', 50, [260, 300])],
  last: 'b',
  sockets: [...postAndTide('a', 0.6, 'mud1'), foe('frog', 'knee', 0.5, ['frog'], 1.5, { phases: LIVE, chance: 0.7 }), tide('tide2', 'mud2'), foe('foe', 'b', [0.55, 0.7], ['frog', 'tayra'], 2.5)],
  mirrorable: false,
});

/** flats: three short flats in a row, each with its own tide */
const tripleFlats = section({
  id: 'w6-triple-flats',
  name: 'three mudflats run',
  archetypes: ['sprint'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: [W6_THEME.flats],
  pieces: [bank('a', [180, 220]), mud('m1', 'a', [240, 280]), up('k1', 'm1', 50, [160, 200]), mud('m2', 'k1', [240, 280]), up('k2', 'm2', 50, [160, 200]), mud('m3', 'k2', [240, 280]), up('b', 'm3', 50, [240, 280])],
  last: 'b',
  sockets: [...postAndTide('a', 0.5, 'm1'), tide('t2', 'm2'), tide('t3', 'm3'), foe('frog', 'k1', 0.5, ['frog'], 1.5, { chance: 0.7 }), petals('k2', 'k2', 0.5, 1), foe('foe', 'b', [0.5, 0.7], ['tayra', 'frog'], 2.5, { phases: LIVE })],
  mirrorable: false,
});

/** flats: a long flat with a soft gap at its far end (cross it, then hop out) */
const longFlat = section({
  id: 'w6-long-flat',
  name: 'long mudflat run',
  archetypes: ['sprint'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 5,
  uses: [W6_THEME.flats],
  pieces: [bank('a', [180, 220]), mud('mud', 'a', [360, 400]), up('b', 'mud', 50, [220, 260]), hop('c', 'b', [300, 340])],
  last: 'c',
  sockets: [...postAndTide('a', 0.5, 'mud'), petals('mud', 'mud', 0.5, 3, 200), foe('foe', 'c', [0.5, 0.7], ['frog', 'tayra'], 2.5, { phases: LIVE, chance: 0.6 })],
  mirrorable: false,
});

const kneeRunK = knees('', 'a', 3, [200, 240], [32, 44]);
/** knees: a run of three knees up and down, petals on top, a frog on one, a tayra at the end */
const kneeRun = section({
  id: 'w6-knee-run',
  name: 'knee root run',
  archetypes: ['sprint'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 4,
  uses: [W6_THEME.knees],
  pieces: [bank('a', [180, 220]), ...kneeRunK.pieces],
  last: kneeRunK.last,
  sockets: [petals('k1', 'k1', 0.5, 1), foe('frog', 'k2', 0.5, ['frog'], 1.5, { phases: LIVE, chance: 0.7 }), petals('k3', 'k3', 0.5, 1), foe('foe', 'f3', [0.5, 0.7], ['tayra', 'frog'], 2.5, { phases: HOT, chance: 0.6 })],
  mirrorable: true,
});

const kneeFlatsK = knees('b', 'b', 2, [200, 240]);
/** knees: knee roots, a short flat, knee roots again, frogs on the knees */
const kneeFlats = section({
  id: 'w6-knee-flats',
  name: 'knee roots and flat run',
  archetypes: ['sprint'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 5,
  uses: [W6_THEME.knees],
  pieces: [bank('a', [220, 260]), up('k1', 'a', 36, [220, 260]), down('a2', 'k1', 36, [200, 240]), mud('mud', 'a2', [240, 280]), up('b', 'mud', 50, [200, 240]), ...kneeFlatsK.pieces],
  last: kneeFlatsK.last,
  sockets: [foe('frog', 'k1', 0.5, ['frog'], 1.5, { phases: LIVE, chance: 0.7 }), ...postAndTide('a2', 0.5, 'mud'), petals('mud', 'mud', 0.5, 2, 100), foe('frog2', 'bk2', 0.5, ['frog'], 1.5, { phases: HOT, chance: 0.6 }), petals('bk1', 'bk1', 0.5, 1)],
  mirrorable: false,
});

const kneeHighK = knees('', 'top', 2, [170, 200], [30, 36], [140, 160]);
/** knees: up a tall root (two steps), along its knees, and down */
const kneeHigh = section({
  id: 'w6-knee-high',
  name: 'tall root run',
  archetypes: ['sprint'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: [W6_THEME.knees],
  pieces: [bank('a', [160, 200]), up('s', 'a', 40, [150, 170]), up('top', 's', 40, [180, 220]), ...kneeHighK.pieces, down('c', kneeHighK.last, 80, [260, 300])],
  last: 'c',
  sockets: [petals('s', 's', 0.5, 1), foe('frog', 'top', 0.5, ['frog'], 1.5, { phases: LIVE }), petals('k1', 'k1', 0.5, 1), petals('k2', 'k2', 0.5, 1), foe('foe', 'c', [0.5, 0.7], ['tayra'], 2.5, { phases: HOT, chance: 0.6 })],
  mirrorable: true,
});

/** channels: two wide channels to jump, a caiman on the bank between them */
const channelJump = section({
  id: 'w6-channels',
  name: 'channels run',
  archetypes: ['sprint'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 5,
  uses: [W6_THEME.channels],
  pieces: [bank('a', [280, 320]), wide('b', 'a', [400, 460]), wide('c', 'b', [280, 320])],
  last: 'c',
  sockets: [petals('a', 'a', 0.5, 2, 80), foe('caiman', 'b', [0.5, 0.6], ['caiman'], 3, { phases: LIVE }), scenery('lilies', 'c', [0.4, 0.6])],
  mirrorable: true,
});

/** channels: a wide channel, then a mudflat, then a caiman on the far bank */
const channelFlat = section({
  id: 'w6-channel-flat',
  name: 'channel and flat run',
  archetypes: ['sprint'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: [W6_THEME.channels],
  pieces: [bank('a', [240, 280]), wide('b', 'a', [260, 300]), mud('mud', 'b', [260, 300]), up('c', 'mud', 50, [380, 440])],
  last: 'c',
  sockets: [petals('a', 'a', 0.5, 1), ...postAndTide('b', 0.5, 'mud'), petals('mud', 'mud', 0.5, 2, 120), foe('caiman', 'c', [0.55, 0.65], ['caiman'], 3, { phases: LIVE })],
  mirrorable: false,
});

/** channels: three wide channels, short banks between them (petals over each) */
const channelRow = section({
  id: 'w6-channel-row',
  name: 'channel row run',
  archetypes: ['sprint'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 7,
  uses: [W6_THEME.channels],
  pieces: [bank('a', [220, 260]), wide('b', 'a', [220, 260]), wide('c', 'b', [220, 260]), wide('d', 'c', [300, 340])],
  last: 'd',
  sockets: [petals('b', 'b', 0.5, 1), petals('c', 'c', 0.5, 1), foe('foe', 'd', [0.55, 0.7], ['frog', 'tayra'], 2.5, { phases: HOT, chance: 0.6 })],
  mirrorable: true,
});

// ───────────────────────────── 6-5 The Spear and 6-9 Blackwater: the hunters' banks ─────────────────────────────

/** a hunt gate (6-5 purge, 6-9 gauntlet): Dot explains the shut shrine before any animal, and the roll's theme opens */
const huntGate = (theme: keyof typeof W6_THEME, line: 'hunt' | 'fight', name: string, pieces: SectionPiece[], last: string, sockets: Socket[]): SectionTemplate =>
  section({
    id: `w6-${line}-gate-${theme}`,
    name: `${name} (arena gate)`,
    archetypes: [line === 'hunt' ? 'purge' : 'gauntlet'],
    phases: ['start'],
    difficulty: 1,
    teaches: W6_THEME[theme],
    weight: 6,
    pieces,
    last,
    sockets: [tip(line, pieces[0].key, 0.15), ...sockets],
    mirrorable: false,
  });

const gateKnees = knees('', 'a', 2, [200, 240]);
const gateFor = (theme: 'cats' | 'caimans' | 'harpies'): { pieces: SectionPiece[]; last: string; sockets: Socket[] } =>
  theme === 'cats'
    ? {
        pieces: [bank('a', [200, 240]), ...gateKnees.pieces, mud('mud', gateKnees.last, [240, 280]), up('b', 'mud', 50, [220, 260])],
        last: 'b',
        sockets: [petals('k1', 'k1', 0.5, 1), petals('k2', 'k2', 0.5, 1), ...postAndTide('f2', 0.6, 'mud'), scenery('snag', 'b', [0.4, 0.6], 0.8)],
      }
    : theme === 'caimans'
      ? {
          pieces: [bank('a', [200, 240]), up('k', 'a', 30, [150, 180]), down('a2', 'k', 30, [200, 240]), mud('mud', 'a2', [260, 300]), up('b', 'mud', 50, [240, 280])],
          last: 'b',
          sockets: [petals('k', 'k', 0.5, 1), ...postAndTide('a2', 0.6, 'mud'), petals('mud', 'mud', 0.5, 2, 100), scenery('lilies', 'b', [0.5, 0.7], 0.8)],
        }
      : {
          pieces: [bank('a', [220, 260]), hop('b', 'a', [300, 340]), mud('mud', 'b', [240, 280]), up('c', 'mud', 50, [240, 280])],
          last: 'c',
          sockets: [petals('b', 'b', 0.3, 1), ...postAndTide('b', 0.75, 'mud'), petals('mud', 'mud', 0.5, 2, 90)],
        };

const huntGates: SectionTemplate[] = (['cats', 'caimans', 'harpies'] as const).flatMap((theme) =>
  (['hunt', 'fight'] as const).map((line) => {
    const g = gateFor(theme);
    const where = line === 'hunt' ? 'mangrove' : 'blackwater';
    return huntGate(theme, line, `the ${where} ${theme}`, g.pieces, g.last, g.sockets);
  }),
);

const hunterKnees = knees('', 'a', 2, [280, 320]);
/** any hunt: a bank over two knees with hunters along it (the arena's bread and butter) */
const hunterBank = section({
  id: 'w6-hunter-bank',
  name: 'hunters bank arena',
  archetypes: ['purge', 'gauntlet'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 5,
  weight: SHARED / 2,
  pieces: [bank('a', [340, 380]), ...hunterKnees.pieces],
  last: hunterKnees.last,
  sockets: [foe('f1', 'a', [0.55, 0.7], SMALL, 3), petals('k1', 'k1', 0.5, 1), foe('f2', 'f1', [0.4, 0.6], SMALL, 3, { phases: LIVE }), petals('k2', 'k2', 0.5, 1), foe('f3', 'f2', [0.5, 0.7], CATS, 5, { phases: HOT, chance: 0.7 })],
  mirrorable: true,
});

/** any hunt: a sunken yard (a step down and back up) with two animals in it */
const sunkenYard = section({
  id: 'w6-sunken-yard',
  name: 'sunken yard arena',
  archetypes: ['purge', 'gauntlet'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  weight: SHARED / 2,
  pieces: [bank('a', [180, 220]), down('yard', 'a', 46, [380, 420]), up('mid', 'yard', 30, [160, 190]), down('yard2', 'mid', 30, [380, 420]), up('b', 'yard2', 46, [260, 300])],
  last: 'b',
  sockets: [petals('a', 'a', 0.5, 1), foe('f1', 'yard', [0.45, 0.6], SMALL, 3), petals('mid', 'mid', 0.5, 1), foe('f2', 'yard2', [0.45, 0.6], CATS, 5, { phases: LIVE }), scenery('snag', 'b', [0.5, 0.7])],
  mirrorable: true,
});

const catKnees = knees('', 'b2', 2, [280, 320]);
/** cats: an ocelot on the bank, a mudflat at its foot, more cats over the knees past it */
const catBanks = section({
  id: 'w6-cat-banks',
  name: 'cats bank arena',
  archetypes: ['purge', 'gauntlet'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: [W6_THEME.cats],
  pieces: [bank('a', [200, 240]), up('m', 'a', 36, [160, 190]), down('b', 'm', 36, [320, 360]), mud('mud', 'b', [240, 280]), up('b2', 'mud', 50, [200, 240]), ...catKnees.pieces],
  last: catKnees.last,
  sockets: [petals('m', 'm', 0.5, 1), foe('f1', 'b', [0.4, 0.5], ['ocelot'], 3), ...postAndTide('b', 0.9, 'mud'), petals('k1', 'k1', 0.5, 1), foe('f2', 'f2', [0.5, 0.6], ['ocelot', 'tayra'], 3, { phases: LIVE })],
  mirrorable: true,
});

const jagKnees = knees('', 'a', 3, [360, 400], [32, 44]);
/** cats: the jaguar's roots, three knees, the big cat at the end */
const jaguarRoots = section({
  id: 'w6-jaguar-roots',
  name: 'jaguar roots arena',
  archetypes: ['purge', 'gauntlet'],
  phases: ['ten', 'ketsu'],
  difficulty: 8,
  uses: [W6_THEME.cats],
  pieces: [bank('a', [260, 300]), ...jagKnees.pieces],
  last: jagKnees.last,
  sockets: [petals('k1', 'k1', 0.5, 1), foe('f1', 'f1', [0.5, 0.6], ['ocelot', 'tayra'], 3), petals('k2', 'k2', 0.5, 1), foe('f2', 'f3', [0.5, 0.65], ['jaguar'], 5)],
  mirrorable: true,
});

const prowlKnees = knees('', 'a', 2, [300, 340]);
/** cats: two ocelots, one on each flat between the knees */
const prowlKneesS = section({
  id: 'w6-prowl-knees',
  name: 'ocelot knees arena',
  archetypes: ['purge', 'gauntlet'],
  phases: ['ki', 'sho', 'ten'],
  difficulty: 5,
  uses: [W6_THEME.cats],
  pieces: [bank('a', [200, 240]), ...prowlKnees.pieces],
  last: prowlKnees.last,
  sockets: [petals('k1', 'k1', 0.5, 1), foe('f1', 'f1', [0.45, 0.6], ['ocelot'], 3), petals('k2', 'k2', 0.5, 1), foe('f2', 'f2', [0.45, 0.6], ['ocelot', 'tayra'], 3, { phases: LIVE })],
  mirrorable: true,
});

/** caimans: a caiman on the bank past a mudflat, a frog after it */
const caimanFlat = section({
  id: 'w6-caiman-flat',
  name: 'caiman flat arena',
  archetypes: ['purge', 'gauntlet'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: [W6_THEME.caimans],
  pieces: [bank('a', [180, 220]), mud('mud', 'a', [280, 320]), up('b', 'mud', 50, [380, 440]), up('k', 'b', 30, [160, 190]), down('c', 'k', 30, [240, 280])],
  last: 'c',
  sockets: [...postAndTide('a', 0.5, 'mud'), foe('caiman', 'b', [0.5, 0.6], ['caiman'], 3), petals('k', 'k', 0.5, 1), foe('frog', 'c', [0.5, 0.7], ['frog'], 1.5, { phases: LIVE, chance: 0.7 })],
  mirrorable: false,
});

/** caimans: two caimans on two banks with a mudflat between */
const caimanPair = section({
  id: 'w6-caiman-pair',
  name: 'two caimans arena',
  archetypes: ['purge', 'gauntlet'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 7,
  uses: [W6_THEME.caimans],
  pieces: [bank('a', [380, 420]), mud('mud', 'a', [260, 300]), up('b', 'mud', 50, [380, 420])],
  last: 'b',
  sockets: [foe('c1', 'a', [0.5, 0.6], ['caiman'], 3), ...postAndTide('a', 0.9, 'mud'), foe('c2', 'b', [0.5, 0.6], ['caiman'], 3, { phases: LIVE })],
  mirrorable: false,
});

/** caimans: the tide flats full of hunters, two flats on their own beats */
const tideHunt = section({
  id: 'w6-tide-hunt',
  name: 'tide hunters arena',
  archetypes: ['purge', 'gauntlet'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 7,
  uses: [W6_THEME.caimans],
  pieces: [bank('a', [240, 280]), mud('m1', 'a', [260, 300]), up('b', 'm1', 50, [340, 380]), mud('m2', 'b', [240, 280]), up('c', 'm2', 50, [280, 320])],
  last: 'c',
  sockets: [foe('f1', 'a', [0.35, 0.45], SMALL, 3), ...postAndTide('a', 0.85, 'm1'), foe('f2', 'b', [0.45, 0.6], ['ocelot', 'caiman'], 4), tide('t2', 'm2'), petals('c', 'c', 0.6, 1)],
  mirrorable: false,
});

/** harpies: a long flat for the harpy to slide on, past a wide channel */
const harpyFlat = section({
  id: 'w6-harpy-flat',
  name: 'harpy flat arena',
  archetypes: ['purge', 'gauntlet'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 7,
  uses: [W6_THEME.harpies],
  pieces: [bank('a', [260, 300]), hop('flat', 'a', [440, 500]), hop('b', 'flat', [260, 300])],
  last: 'b',
  sockets: [petals('a', 'a', 0.5, 1), foe('harpy', 'flat', [0.45, 0.55], ['harpy'], 4), foe('f2', 'b', [0.4, 0.6], ['tayra'], 2.5, { phases: HOT, chance: 0.6 })],
  mirrorable: true,
});

/** harpies: tayras scurrying the banks of two wide channels */
const tayraBanks = section({
  id: 'w6-tayra-banks',
  name: 'tayra banks arena',
  archetypes: ['purge', 'gauntlet'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 5,
  uses: [W6_THEME.harpies],
  pieces: [bank('a', [320, 360]), hop('b', 'a', [320, 360]), hop('c', 'b', [300, 340])],
  last: 'c',
  sockets: [foe('t1', 'a', [0.5, 0.65], ['tayra'], 2.5), foe('t2', 'b', [0.45, 0.6], ['tayra'], 2.5, { phases: LIVE }), foe('f3', 'c', [0.5, 0.6], ['harpy', 'ocelot'], 4, { phases: HOT, chance: 0.6 })],
  mirrorable: true,
});

/** harpies: three wide channels, a harpy on the last long bank */
const harpyChannels = section({
  id: 'w6-harpy-channels',
  name: 'harpy channels arena',
  archetypes: ['purge', 'gauntlet'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 8,
  uses: [W6_THEME.harpies],
  pieces: [bank('a', [220, 260]), hop('b', 'a', [220, 260]), hop('c', 'b', [420, 480])],
  last: 'c',
  sockets: [petals('b', 'b', 0.5, 1), foe('harpy', 'c', [0.5, 0.6], ['harpy', 'tayra'], 4)],
  mirrorable: true,
});

// ───────────────────────────── the list ─────────────────────────────

export const W6_GROUND_SECTIONS: SectionTemplate[] = [
  landing,
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
  poolChain,
  poolLong,
  watchReeds,
  reedRun,
  reedStairs,
  watchKnees,
  baskBank,
  baskGap,
  baskFrogs,
  baskPair,
  ...tideGates,
  mudflat,
  twinFlats,
  tripleFlats,
  longFlat,
  kneeRun,
  kneeFlats,
  kneeHigh,
  channelJump,
  channelFlat,
  channelRow,
  ...huntGates,
  hunterBank,
  sunkenYard,
  catBanks,
  jaguarRoots,
  prowlKneesS,
  caimanFlat,
  caimanPair,
  tideHunt,
  harpyFlat,
  tayraBanks,
  harpyChannels,
];

/**
 * The wide and second-jump gaps (section id -> the pieces landed on): soft mud only (STAGE-RULES §6: no gap over water past a third of a
 * jump, no second-jump gap over water), so a water stage never holds them (w6.ts w6Kit)
 */
export const W6_MUD_GAPS: Readonly<Record<string, readonly string[]>> = {
  'w6-double-gap': ['far'],
  'w6-channels': ['b', 'c'],
  'w6-channel-flat': ['b'],
  'w6-channel-row': ['b', 'c', 'd'],
};

/**
 * The shared fillers kept out of the themed stages (6-2, 6-4, 6-5, 6-9): there the theme's own sections carry the stage (a filler with
 * one ticket in the bag still took half the picks), and the vine stages and 6-6 keep them. w6.ts w6Kit filters by it.
 */
export const W6_STAGE_SKIP: Readonly<Record<string, readonly number[]>> = Object.fromEntries(
  ['w6-landing', 'w6-stump-hop', 'w6-mud-gap', 'w6-rise', 'w6-drop', 'w6-double-gap', 'w6-root-road'].map((id) => [id, [2, 4, 5, 9]] as const),
);

/**
 * The sections only some stages of World 6 hold (the rest go where their archetypes and phases allow): Low Tide's gates and its own
 * flats, knees and channels, so 6-6 Lights in the Roots (a sprint too) is not a second tide stage. w6.ts w6Kit filters by it.
 */
export const W6_STAGE_ONLY: Readonly<Record<string, readonly number[]>> = Object.fromEntries([
  ...[...tideGates.map((s) => s.id), 'w6-twin-flats', 'w6-triple-flats', 'w6-long-flat', 'w6-knee-run', 'w6-knee-flats', 'w6-knee-high', 'w6-channels', 'w6-channel-flat', 'w6-channel-row'].map(
    (id) => [id, [4]] as const,
  ),
  ['w6-mudflat', [4]] as const,
]);
