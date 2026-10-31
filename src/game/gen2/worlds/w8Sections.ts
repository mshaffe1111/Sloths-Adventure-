/**
 * gen2/worlds/w8Sections — World 8's ground building blocks (DESIGN.md B9): the twilight boughs every stage shares, the dark stretches
 * (8-1 "As the Light Goes" teaches them; World 6's dark props, w6Swing.ts, reused and pushed further: real jumps, a climb and a second
 * jump in the dark, every gap lit by a firefly), the bat roosts of 8-4, the night blooms of 8-2, the moonlight glides of 8-6, and the
 * hunters' boughs of 8-8 Night Hunters and 8-9 Monarch's Wood. The lianas are w8Swing.ts's, the puzzle rooms w8Rooms.ts's.
 *
 * The rules every section keeps (STAGE-RULES §1, §6, World 6 on gen2):
 *   - falls are soft (a lower bough and a step out), so the dark may hold real gaps; nothing stands in the dark, and each dark stretch
 *     steps down from a lit bough and up onto another (a flag can stand on either), never mirrored (Dot's line on 'in' comes first);
 *   - every beat is ground the route crosses (a knot stepped up onto, a gap jumped, a climb that is the only way on);
 *   - an animal stands on a flat long enough to keep 120 px from every take-off and landing (JUMP_CLEAR), so knot flats hold none;
 *   - a long flat carries a knot whatever stands on it (Easy drops animals);
 *   - a section with a tip on its first piece is never mirrored; a section that climbs or drops is never mirrored;
 *   - nothing crumbles.
 *
 * Variety (STAGE-RULES §6): the themed stages (8-2, 8-4, 8-8, 8-9) start at a gate that opens the roll's theme (W8_THEME), and each theme
 * leans on its own heavy beat (the dark, the animals, the climbs, the wide jumps), so two rolls differ all through.
 */
import type { Phase, SectionPiece, SectionTemplate, Socket } from '../types.ts';
import { darkEnds } from './w6Swing.ts';
import { W8_LESSON } from './w8.ts';

// ───────────────────────────── the themes ─────────────────────────────

export const W8_THEME = {
  /** 8-2: blooms on the high boughs (climbs) */
  highBlooms: 'w8:high-blooms',
  /** 8-2: blooms by the bat roosts (hide while they look: the roosts went from 8-4, now the hand-built Lantern Run, to 8-2; 8-2's
   *  blooms in the dark read alike 8-1's night on the look-alike measure) */
  roostBlooms: 'w8:roost-blooms',
  /** 8-2: blooms over the wide gaps (jumps, arcs) */
  gapBlooms: 'w8:gap-blooms',
  /** 8-4: tree hollows on long boughs (the roost and the cats) */
  hollows: 'w8:hollows',
  /** 8-4: leaf curtains on knotted boughs, gaps between */
  curtains: 'w8:curtains',
  /** 8-4: roosts in the dark's edge, climbs */
  climbs: 'w8:climbs',
  /** 8-8 / 8-9: the cats' boughs */
  cats: 'w8:cats',
  /** 8-8 / 8-9: the harpies' long boughs over wide gaps */
  harpies: 'w8:harpies',
  /** 8-8 / 8-9: the boa guards on the knots, the dark between */
  guards: 'w8:guards',
  /** the lit stages (8-1, 8-3, 8-5, 8-6): trunks to climb, in the light and the dark */
  climbers: 'w8:climbers',
  /** the lit stages: hunters on knotted boughs */
  prowlers: 'w8:prowlers',
  /** 8-1 and 8-6: wide gaps and second jumps, in the light and the dark */
  leapers: 'w8:leapers',
  /** the vine stages (8-3, 8-5): chains of lianas */
  chains: 'w8:chains',
  /** 8-1: the night comes on: dark stretch after dark stretch (8-1 has too little threat for the prowlers: its heat is the world's lowest) */
  night: 'w8:night',
  /** 8-6: the night wind: gusts through the canopy's gaps carry the glides (GRAB-BAG.md A: a timed beat 8-6's other themes lack) */
  gusts: 'w8:gusts',
} as const;

/** the themes each lit stage's gate may open (the themed stages' gates are their own: blooms, roosts, hunts) */
export const W8_LIT_THEMES: Readonly<Record<number, ReadonlyArray<keyof typeof W8_THEME>>> = {
  // (8-1's climbs are its dark trunks only: the lit trunks are 8-5's stretches, the look-alike measure)
  1: ['leapers', 'night'],
  // (8-6's trunks went to 8-5: a trunk, a glide and a trunk read as 8-5's climbing on the look-alike measure)
  6: ['prowlers', 'leapers', 'gusts'],
  // (the vine stages apart, STAGE-RULES §6 "Sameness": 8-3's lianas chain over the gaps, 8-5's lead to trunks to climb)
  3: ['prowlers', 'chains'],
  5: ['climbers'],
};

const SHARED = 0.3;
const DARK = W8_LESSON.dark;
const ROOST = W8_LESSON.roost;
const GLIDE = W8_LESSON.glide;

// ───────────────────────────── helpers ─────────────────────────────

type Opt = Partial<Socket>;
type W = SectionPiece['w'];
const LIVE: Phase[] = ['sho', 'ten', 'ketsu'];
const HOT: Phase[] = ['ten', 'ketsu'];

const bank = (key: string, w: W, place: SectionPiece['place'] = { kind: 'start' }, o: Partial<SectionPiece> = {}): SectionPiece => ({ key, shape: 'bank', w, place, ...o });
/** a knot or a fork: a step up `dy` px (one plain hop); `down` steps back down */
const up = (key: string, after: string, dy: number, w: W): SectionPiece => bank(key, w, { kind: 'walk', after, dy: -dy });
const down = (key: string, after: string, dy: number, w: W): SectionPiece => bank(key, w, { kind: 'walk', after, dy });
/** a short soft gap between boughs */
const hop = (key: string, after: string, w: W, share: W = [0.32, 0.45], landing = false): SectionPiece =>
  bank(key, w, { kind: 'pit', after, jump: 'jump', share }, landing ? { landing } : {});
/** a wide soft gap: the jump's own width (a real jump) */
const wide = (key: string, after: string, w: W, share: W = [0.72, 0.92]): SectionPiece => bank(key, w, { kind: 'pit', after, jump: 'jump', share }, { landing: true });
/** a soft gap only the second jump crosses */
const leap = (key: string, after: string, w: W, share: W = [0.5, 0.74]): SectionPiece => bank(key, w, { kind: 'pit', after, jump: 'double', share }, { landing: true });
/** a soft gap only the leaf crosses (on Normal; Easy's is shorter): pipeline glideGap */
const glide = (key: string, after: string, w: W, share: W = [0.8, 0.94]): SectionPiece => bank(key, w, { kind: 'pit', after, jump: 'glide', share }, { landing: true });
/** a climbing vine at the end of `on`, `h` px tall, and the bough it leads up onto (a whole bank: out of a double jump's reach) */
const climbWall = (vine: string, on: string, wall: string, h: number, w: W): SectionPiece[] => [
  { key: vine, shape: 'vine', w: 0, place: { kind: 'climb', on, at: 1, h } },
  bank(wall, w, { kind: 'over', on: vine, at: 0, dy: 0 }, { main: true }),
];

const petals = (id: string, on: string, t: Socket['t'], count = 2, span = 120, o: Opt = {}): Socket => ({ id, role: 'pickup', on, t, dn: 34, count, span, ...o });
const prop = (id: string, on: string, t: Socket['t'], allow: string[], o: Opt = {}): Socket => ({ id, role: 'prop', on, t, allow, ...o });
const hideAt = (id: string, on: string, t: Socket['t'] = 0.5) => prop(id, on, t, ['hide', 'cover']);
const roost = (on: string, t: Socket['t'] = 0.03, id = 'roost') => prop(id, on, t, ['roost']);
const scenery = (id: string, on: string, t: Socket['t'], chance = 0.6) => prop(id, on, t, ['scenery'], { chance });
const flag = (on: string, t: Socket['t']): Socket => ({ id: 'flag', role: 'flag', on, t });
const tip = (mechanic: string, on: string, t: Socket['t'] = 0.15, id = `tip-${mechanic}`): Socket => ({ id, role: 'tip', on, t, allow: [mechanic] });
const foe = (id: string, on: string, t: Socket['t'], kinds: string[], max: number, o: Opt = {}): Socket => ({ id, role: 'enemy', on, t, allow: kinds, maxThreat: max, easy: 'soften', ...o });

const CATS = ['ocelot', 'jaguar'];
const SMALL = ['ocelot', 'tayra', 'boa'];

const midOf = (w: W) => (typeof w === 'number' ? w : (w[0] + w[1]) / 2);
const gapKinds = new Set(['pit', 'jump', 'double']);

/**
 * Where a section's flag goes when the pipeline puts one in it: the middle of its widest lit bough with no animal on it and no gap after
 * it (else back from the lip), never inside the dark (the pieces between a dark stretch's two ends)
 */
function safeFlag(pieces: SectionPiece[], sockets: Socket[], first: string, last: string, mirrorable: boolean): Socket {
  const keys = pieces.map((p) => p.key);
  const from = sockets.find((k) => k.id === 'darkFrom')?.on;
  const to = sockets.find((k) => k.id === 'darkTo')?.on;
  const dark = new Set(from && to ? keys.slice(keys.indexOf(from), keys.indexOf(to) + 1) : []);
  const banks = pieces.filter((p) => p.main !== false && p.shape === 'bank' && !dark.has(p.key) && p.place.kind !== 'over');
  const busy = new Set(sockets.filter((k) => k.role === 'enemy').map((k) => k.on));
  const gapped = (k: string) => pieces.some((q) => gapKinds.has(q.place.kind) && 'after' in q.place && q.place.after === k);
  const after = (p: SectionPiece) => p.key === last || gapped(p.key);
  const before = (p: SectionPiece) => p.key === first || gapKinds.has(p.place.kind);
  const spot = (p: SectionPiece): { t: number; room: number } => {
    const w = midOf(p.w);
    if (mirrorable) return before(p) || after(p) ? { t: 0.5, room: w / 2 } : { t: 0.5, room: 999 };
    return after(p) ? { t: 0.3, room: 0.7 * w } : { t: 0.5, room: 999 };
  };
  const score = (p: SectionPiece) => Math.min(spot(p).room, 300) + midOf(p.w) / 10 - (busy.has(p.key) ? 400 : 0);
  const p = [...banks].sort((a, b) => score(b) - score(a))[0];
  return flag(p.key, spot(p).t);
}

/** the bones every section shares (and a safe flag, unless it names its own) */
const section = (s: Omit<SectionTemplate, 'entry' | 'exit' | 'exitDy'> & { exitDy?: number; first?: string; last: string }): SectionTemplate => {
  const { first, last, exitDy, ...rest } = s;
  const flagged = rest.sockets.some((k) => k.role === 'flag') ? rest.sockets : [...rest.sockets, safeFlag(rest.pieces, rest.sockets, first ?? rest.pieces[0].key, last, rest.mirrorable)];
  return { ...rest, sockets: flagged, entry: { piece: first ?? s.pieces[0].key, kind: 'ground' }, exit: { piece: last, kind: 'ground' }, exitDy: exitDy ?? 0 };
};

/** n knots after `after`: up onto each and down off it to a flat of `flat` px (keys `${p}k1`, `${p}f1`, ...) */
function knots(p: string, after: string, n: number, flat: W, dy: [number, number] = [32, 44], knotW: W = [140, 170]): { pieces: SectionPiece[]; last: string } {
  const out: SectionPiece[] = [];
  let prev = after;
  for (let i = 1; i <= n; i++) {
    const h = Math.round(dy[0] + ((dy[1] - dy[0]) * (i % 3)) / 2);
    out.push(up(`${p}k${i}`, prev, h, knotW), down(`${p}f${i}`, `${p}k${i}`, h, flat));
    prev = `${p}f${i}`;
  }
  return { pieces: out, last: prev };
}

/** a dark stretch's tip (its first piece, lit) and its two ends */
const darkTip = (on: string) => tip(DARK, on, 0.1, 'tip-dark');

// ───────────────────────────── every stage: the start, rests, the shrine's approach ─────────────────────────────

const landingK = knots('', 'a', 2, [160, 190]);
/**
 * The lit stages' gates (8-1, 8-3, 8-5, 8-6): the start, nothing that can hurt, which opens the roll's theme (W8_LIT_THEMES): the climbers'
 * gate has a short trunk, the leapers' a wide gap over soft moss, the prowlers' and the chains' two knots
 */
const litGate = (theme: 'climbers' | 'prowlers' | 'leapers' | 'chains' | 'night' | 'gusts'): SectionTemplate =>
  section({
    id: `w8-gate-${theme}`,
    name: `landing bough: ${theme}`,
    archetypes: 'any',
    phases: ['start'],
    difficulty: 1,
    teaches: W8_THEME[theme],
    weight: 6,
    pieces:
      theme === 'climbers'
        ? [bank('a', [220, 250]), ...climbWall('v', 'a', 'wall', 150, [200, 230]), down('b', 'wall', 150, [180, 210])]
        : theme === 'leapers'
          ? [bank('a', [240, 270]), wide('b', 'a', [200, 230], [0.6, 0.7]), up('k', 'b', 30, [130, 150]), down('c', 'k', 30, [160, 190])]
          : [bank('a', [200, 230]), ...landingK.pieces],
    last: theme === 'climbers' ? 'b' : theme === 'leapers' ? 'c' : landingK.last,
    sockets: [scenery('nest', 'a', [0.3, 0.5], 0.8), petals('a2', 'a', 0.8, 1)],
    mirrorable: false,
  });
const litGates = (['climbers', 'prowlers', 'leapers', 'chains', 'night', 'gusts'] as const).map(litGate);

const restK = knots('', 'a', 2, [160, 190]);
/** a broad bough over two knots: petals, a flag, fungus on the bark */
const restBough = section({
  id: 'w8-rest-bough',
  name: 'broad bough',
  archetypes: 'any',
  phases: ['rest', 'goal'],
  difficulty: 1,
  pieces: [bank('a', [160, 190]), ...restK.pieces],
  last: restK.last,
  sockets: [scenery('fungus', 'a', [0.3, 0.5]), petals('k1', 'k1', 0.5, 2, 80), flag('f1', 0.6), petals('k2', 'k2', 0.5, 1), scenery('nest', 'f2', [0.5, 0.7], 0.5)],
  mirrorable: true,
});

/** a fork in the branch: up two steps and down, a flag at the top */
const restFork = section({
  id: 'w8-rest-fork',
  name: 'branch fork',
  archetypes: 'any',
  phases: ['rest', 'goal'],
  difficulty: 2,
  pieces: [bank('a', [160, 190]), up('r1', 'a', 36, [150, 170]), up('r2', 'r1', 32, [180, 210]), down('r3', 'r2', 32, [130, 150]), up('k', 'r3', 30, [130, 150]), down('c', 'k', 66, [160, 190])],
  last: 'c',
  sockets: [petals('r1', 'r1', 0.5, 1), flag('r2', 0.5), petals('r3', 'r3', 0.5, 1), petals('k', 'k', 0.5, 1), scenery('fungus', 'c', [0.4, 0.6])],
  mirrorable: true,
});

/**
 * 8-6's rests (STAGE-RULES §6 "Sameness": a stage's rest is about a third of a 20 s stretch, and the plain boughs' rests made 8-1, 8-6
 * and 8-9 read alike on the look-alike measure): a short glide over a soft gap; the plain boughs' rests are the other stages', but 8-5's
 */
/** 8-5's rests: a low trunk to rest by (8-5 is the climbing stage; the plain boughs' rests read alike 8-3's) */
const restTrunk = section({
  id: 'w8-rest-trunk',
  name: 'a low trunk to rest by',
  archetypes: 'any',
  phases: ['rest', 'goal'],
  difficulty: 1,
  pieces: [bank('a', [220, 260]), ...climbWall('v', 'a', 'wall', 220, [200, 230]), down('b', 'wall', 220, [220, 260])],
  last: 'b',
  sockets: [scenery('fungus', 'a', [0.2, 0.4]), petals('wall', 'wall', 0.5, 2, 90), flag('b', 0.5), scenery('nest', 'b', [0.6, 0.8], 0.5)],
  mirrorable: false,
});
const restTrunkKnot = section({
  id: 'w8-rest-trunk-knot',
  name: 'a knot and a low trunk',
  archetypes: 'any',
  phases: ['rest', 'goal'],
  difficulty: 2,
  pieces: [bank('a', [160, 190]), up('k', 'a', 32, [140, 160]), down('b', 'k', 32, [180, 210]), ...climbWall('v', 'b', 'wall', 220, [200, 230]), down('c', 'wall', 220, [200, 240])],
  last: 'c',
  sockets: [petals('k', 'k', 0.5, 1), petals('wall', 'wall', 0.5, 2, 90), flag('c', 0.5)],
  mirrorable: false,
});
const restGlide = section({
  id: 'w8-rest-glide',
  name: 'a short glide to rest',
  archetypes: 'any',
  phases: ['rest', 'goal'],
  difficulty: 2,
  pieces: [bank('a', [240, 280]), glide('b', 'a', [260, 300], [0.66, 0.74]), up('k', 'b', 30, [140, 160]), down('c', 'k', 30, [180, 210])],
  last: 'c',
  sockets: [petals('a', 'a', 0.4, 2, 80), flag('b', 0.5), petals('k', 'k', 0.5, 1), scenery('fungus', 'c', [0.4, 0.6])],
  mirrorable: true,
});
const restGlideFork = section({
  id: 'w8-rest-glide-fork',
  name: 'up the fork, a short glide off it',
  archetypes: 'any',
  phases: ['rest', 'goal'],
  difficulty: 2,
  pieces: [bank('a', [180, 210]), up('r1', 'a', 34, [180, 210]), glide('b', 'r1', [220, 260], [0.66, 0.74]), down('c', 'b', 34, [200, 230])],
  last: 'c',
  sockets: [petals('r1', 'r1', 0.5, 1), flag('b', 0.5), petals('c', 'c', 0.5, 1), scenery('nest', 'c', [0.5, 0.7], 0.5)],
  mirrorable: true,
});

// ───────────────────────────── every stage: Ki to Ketsu on the lit boughs ─────────────────────────────

/** knots and short gaps, a small hunter past them */
const knotHops = section({
  id: 'w8-knot-hops',
  name: 'knots and gaps',
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten'],
  difficulty: 3,
  uses: [W8_THEME.prowlers],
  pieces: [bank('a', [180, 220]), up('k1', 'a', 36, [140, 160]), down('b', 'k1', 36, [160, 190]), hop('c', 'b', [170, 200]), up('k2', 'c', 40, [140, 160]), down('d', 'k2', 40, [320, 350]), up('k3', 'd', 30, [130, 150]), down('e', 'k3', 30, [150, 170])],
  last: 'e',
  sockets: [petals('k1', 'k1', 0.5, 1), petals('c', 'c', 0.5, 1), petals('k2', 'k2', 0.5, 1), foe('foe', 'd', [0.5, 0.6], SMALL, 3, { phases: LIVE, chance: 0.7 })],
  mirrorable: true,
});

/** a wide gap between boughs (a real jump), a knot, a hunter on the far bough */
const boughGap = section({
  id: 'w8-bough-gap',
  name: 'wide gap between boughs',
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 5,
  uses: [W8_THEME.leapers],
  pieces: [bank('near', [240, 280]), wide('far', 'near', [320, 350]), up('k', 'far', 36, [140, 160]), down('far2', 'k', 36, [180, 210])],
  last: 'far2',
  sockets: [petals('near', 'near', 0.5, 2, 90), foe('foe', 'far', [0.5, 0.6], SMALL, 3, { phases: LIVE, chance: 0.8 }), petals('k', 'k', 0.5, 1), scenery('fungus', 'far2', [0.5, 0.7])],
  mirrorable: true,
});

/** a gap only the second jump crosses, a knot after it, a cat waiting */
const doubleGap = section({
  id: 'w8-double-gap',
  name: 'second-jump gap',
  archetypes: 'any',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 7,
  needs: ['double'],
  uses: [W8_THEME.leapers],
  pieces: [bank('near', [220, 260]), leap('far', 'near', [200, 240]), up('m', 'far', 36, [140, 160]), down('b', 'm', 36, [320, 350]), up('k', 'b', 30, [140, 160]), down('c', 'k', 30, [150, 180])],
  last: 'c',
  sockets: [petals('near', 'near', 0.5, 2, 90), petals('m', 'm', 0.5, 1), foe('foe', 'b', [0.5, 0.6], [...CATS, 'tayra'], 5, { phases: HOT, chance: 0.7 }), petals('k', 'k', 0.5, 1)],
  mirrorable: true,
});

/** the trunk: a climbing vine up a bough too high to jump, and down the far side (the climb is the way on) */
const trunkClimb = section({
  id: 'w8-trunk-climb',
  name: 'climb the trunk',
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten'],
  difficulty: 4,
  uses: [W8_THEME.climbers],
  pieces: [bank('a', [300, 360]), ...climbWall('v', 'a', 'wall', 210, [240, 280]), down('b', 'wall', 210, [320, 350]), up('k', 'b', 34, [130, 150]), down('b2', 'k', 34, [140, 160]), hop('c', 'b2', [180, 210])],
  last: 'c',
  sockets: [petals('a', 'a', 0.4, 2, 80), petals('wall', 'wall', 0.5, 3, 140), foe('foe', 'b', [0.5, 0.6], SMALL, 3, { phases: LIVE, chance: 0.6 })],
  mirrorable: false,
});

/** up a step onto a higher bough (one hop), a gap along it, a hunter there */
const rise = section({
  id: 'w8-rise',
  name: 'a step up the tree',
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten'],
  difficulty: 4,
  uses: [W8_THEME.leapers],
  pieces: [bank('a', [200, 240]), up('b', 'a', 50, [180, 220]), up('k', 'b', 30, [140, 160]), down('b2', 'k', 30, [160, 190]), hop('c', 'b2', [320, 350]), up('k2', 'c', 30, [130, 150]), down('d', 'k2', 30, [150, 170])],
  last: 'd',
  exitDy: -50,
  sockets: [petals('a', 'a', 0.5, 2, 90), scenery('fungus', 'b', [0.3, 0.5]), foe('foe', 'c', [0.5, 0.6], SMALL, 3, { phases: LIVE, chance: 0.8 })],
  mirrorable: false,
});

/** down a step to a lower bough, a knot, a gap along it */
const drop = section({
  id: 'w8-drop',
  name: 'a step down the tree',
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten'],
  difficulty: 4,
  uses: [W8_THEME.prowlers],
  pieces: [bank('a', [180, 220]), up('k', 'a', 30, [150, 170]), down('b2', 'k', 80, [320, 350]), up('k2', 'b2', 30, [140, 160]), down('b3', 'k2', 30, [160, 200]), hop('c', 'b3', [200, 240])],
  last: 'c',
  exitDy: 50,
  sockets: [petals('a', 'a', 0.5, 2, 90), foe('foe', 'b2', [0.5, 0.6], [...CATS, 'boa'], 5, { phases: HOT, chance: 0.6 }), petals('k2', 'k2', 0.5, 1), scenery('nest', 'c', [0.4, 0.6])],
  mirrorable: false,
});

/** climbers: two trunks in a row, a knot between (the climb is the only way on each time) */
const climbRun = section({
  id: 'w8-climb-run',
  name: 'two trunks',
  archetypes: 'any',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: [W8_THEME.climbers],
  pieces: [
    bank('a', [220, 250]),
    ...climbWall('v', 'a', 'wall', 210, [180, 210]),
    down('b', 'wall', 210, [160, 190]),
    up('k', 'b', 34, [130, 150]),
    down('c', 'k', 34, [180, 210]),
    ...climbWall('v2', 'c', 'wall2', 210, [180, 210]),
    down('d', 'wall2', 210, [180, 210]),
  ],
  last: 'd',
  sockets: [petals('wall', 'wall', 0.5, 2, 90), petals('k', 'k', 0.5, 1), petals('wall2', 'wall2', 0.5, 2, 90), scenery('fungus', 'd', [0.4, 0.6])],
  mirrorable: false,
});

/** prowlers: two hunters' flats with knots between and after */
const prowlBough = section({
  id: 'w8-prowl-bough',
  name: 'the prowlers\' bough',
  archetypes: 'any',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: [W8_THEME.prowlers],
  pieces: [bank('a', [180, 210]), up('k1', 'a', 34, [130, 150]), down('b', 'k1', 34, [320, 350]), up('k2', 'b', 40, [130, 150]), down('c', 'k2', 40, [320, 350]), up('k3', 'c', 30, [130, 150]), down('d', 'k3', 30, [150, 170])],
  last: 'd',
  sockets: [petals('k1', 'k1', 0.5, 1), foe('f1', 'b', [0.5, 0.6], SMALL, 3), petals('k2', 'k2', 0.5, 1), foe('f2', 'c', [0.5, 0.6], [...CATS, 'boa'], 5, { phases: HOT, chance: 0.8 }), petals('k3', 'k3', 0.5, 1)],
  mirrorable: true,
});

// ───────────────────────────── the dark (taught in 8-1; World 6's dark props) ─────────────────────────────
//
// A dark stretch is the engine's `dark` zone between the `darkFrom` and `darkTo` props (w6Swing.ts W6S_EMIT: a firefly's light over the
// middle of every gap, a dimmer one every 420 px). World 8's are longer than World 6's and hold real jumps, a second jump and a climb:
// the falls are soft, so the dark is a test of reading the light, never a blind jump into something deadly.

/** knots and short gaps in the dark (the first dark of a stage is its lesson) */
const darkBoughs = section({
  id: 'w8-dark-boughs',
  name: 'the dark boughs (run)',
  archetypes: 'any',
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 4,
  teaches: DARK,
  weight: 2,
  uses: [W8_THEME.prowlers],
  pieces: [
    bank('in', [180, 210]),
    down('a', 'in', 30, [170, 200]),
    hop('b', 'a', [170, 200]),
    up('k', 'b', 44, [130, 150]),
    down('c', 'k', 44, [150, 180]),
    hop('d', 'c', [170, 200]),
    hop('e', 'd', [180, 220]),
    up('out', 'e', 30, [200, 230]),
  ],
  last: 'out',
  sockets: [darkTip('in'), ...darkEnds('a', 'e'), petals('b', 'b', 0.5, 1), petals('k', 'k', 0.5, 1), petals('d', 'd', 0.5, 1), petals('e', 'e', 0.4, 2, 80)],
  mirrorable: false,
});

/** a real jump in the dark, the firefly over it, then knots */
const darkGap = section({
  id: 'w8-dark-gap',
  name: 'the dark gap (run)',
  archetypes: 'any',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  teaches: DARK,
  weight: 2,
  uses: [W8_THEME.leapers],
  pieces: [
    bank('in', [180, 210]),
    down('a', 'in', 30, [200, 240]),
    wide('b', 'a', [200, 240]),
    up('k', 'b', 40, [130, 150]),
    down('c', 'k', 40, [160, 190]),
    wide('d', 'c', [180, 220]),
    up('out', 'd', 30, [200, 230]),
  ],
  last: 'out',
  sockets: [darkTip('in'), ...darkEnds('a', 'd'), petals('b', 'b', 0.5, 1), petals('k', 'k', 0.5, 1), petals('d', 'd', 0.4, 2, 80)],
  mirrorable: false,
});

/** the trunk in the dark: a gap, the climbing vine in the firefly's light, down the far side, a gap out */
const darkClimb = section({
  id: 'w8-dark-climb',
  name: 'the dark trunk (run)',
  archetypes: 'any',
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  teaches: DARK,
  weight: 2,
  uses: [W8_THEME.climbers],
  pieces: [
    bank('in', [180, 210]),
    down('a', 'in', 30, [180, 220]),
    hop('b', 'a', [220, 260]),
    ...climbWall('v', 'b', 'wall', 210, [200, 240]),
    down('c', 'wall', 210, [170, 200]),
    hop('d', 'c', [200, 240]),
    up('out', 'd', 30, [200, 230]),
  ],
  last: 'out',
  sockets: [darkTip('in'), ...darkEnds('a', 'd'), petals('b', 'b', 0.4, 1), petals('wall', 'wall', 0.5, 2, 90), petals('d', 'd', 0.5, 1)],
  mirrorable: false,
});

/** the long dark: steps up and down, a short gap, then a gap only the second jump crosses (a ketsu) */
const darkLong = section({
  id: 'w8-dark-long',
  name: 'the long dark (run)',
  archetypes: 'any',
  phases: ['ten', 'ketsu'],
  difficulty: 8,
  teaches: DARK,
  needs: ['double'],
  maxPerStage: 1,
  weight: 2,
  uses: [W8_THEME.leapers],
  pieces: [
    bank('in', [170, 190]),
    down('a', 'in', 30, [150, 170]),
    up('b', 'a', 50, [120, 140]),
    hop('c', 'b', [140, 160]),
    down('d', 'c', 50, [150, 170]),
    leap('e', 'd', [160, 180]),
    up('f', 'e', 44, [120, 140]),
    down('g', 'f', 44, [150, 170]),
    up('out', 'g', 30, [180, 200]),
  ],
  last: 'out',
  sockets: [darkTip('in'), ...darkEnds('a', 'g'), petals('b', 'b', 0.5, 1), petals('c', 'c', 0.5, 1), petals('e', 'e', 0.5, 2, 80), petals('f', 'f', 0.5, 1)],
  mirrorable: false,
});

/** the night theme's dark stretches (8-1): the dark sections again, for the roll that leans on the dark */
const nightOf = (t: SectionTemplate, id: string): SectionTemplate => ({ ...t, id, name: t.name.replace('the dark', 'the night'), uses: [W8_THEME.night], weight: 3 });
const nightSections = [nightOf(darkBoughs, 'w8-night-boughs'), nightOf(darkGap, 'w8-night-gap'), nightOf(darkClimb, 'w8-night-climb')];

// ───────────────────────────── 8-2 Night Blooms: the harvest ─────────────────────────────

/** a harvest gate: the night blooms' first bough (no animal), and the roll's theme opens */
const bloomGate = (theme: 'highBlooms' | 'gapBlooms', name: string, extra: Socket[] = []): SectionTemplate =>
  section({
    id: `w8-bloom-gate-${theme}`,
    name: `night blooms: ${name} (pickups)`,
    archetypes: ['harvest'],
    phases: ['start'],
    difficulty: 1,
    teaches: W8_THEME[theme],
    weight: 6,
    // (8-2's blooms grow by the bat roosts, every stretch of them: the roosts are the stage's own, and Dot teaches them at the gate)
    pieces: [bank('a', [200, 240]), up('k', 'a', 34, [150, 170]), down('b', 'k', 34, [260, 300]), up('k2', 'b', 30, [140, 160]), down('c', 'k2', 30, [220, 260])],
    last: 'c',
    sockets: [tip(ROOST, 'a', 0.2), petals('a', 'a', 0.6, 2, 80), petals('k', 'k', 0.5, 1), roost('b', 0.03, 'roostLesson'), hideAt('h1', 'b', 0.55), petals('b', 'b', 0.3, 2, 80), petals('k2', 'k2', 0.5, 1), hideAt('h2', 'c', 0.5), ...extra],
    mirrorable: false,
  });
const bloomGates = [
  bloomGate('highBlooms', 'the high boughs', [scenery('nest', 'c', [0.5, 0.7], 0.8)]),
  bloomGate('gapBlooms', 'over the gaps', [scenery('fungus', 'c', [0.5, 0.7], 0.8)]),
];

/** high blooms: a trunk to climb to a bough of blooms, down the far side, a knot */
const bloomClimb = section({
  id: 'w8-bloom-climb',
  name: 'blooms up the trunk (pickups)',
  archetypes: ['harvest'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 4,
  uses: [W8_THEME.highBlooms],
  pieces: [
    bank('a', [220, 250]),
    ...climbWall('v', 'a', 'wall', 210, [180, 200]),
    up('wk', 'wall', 30, [130, 150]),
    down('w2', 'wk', 30, [160, 180]),
    down('b', 'w2', 210, [320, 350]),
    up('k', 'b', 34, [140, 160]),
    down('c', 'k', 34, [150, 180]),
  ],
  last: 'c',
  sockets: [petals('a', 'a', 0.4, 2, 80), petals('wall', 'wall', 0.5, 2, 100), petals('wk', 'wk', 0.5, 1), petals('w2', 'w2', 0.5, 2, 90), roost('b', 0.03, 'roostHere1'), hideAt('h1', 'b', 0.45), foe('foe', 'c', [0.5, 0.6], SMALL, 3, { phases: LIVE, chance: 0.6 }), petals('k', 'k', 0.5, 1)],
  mirrorable: false,
});

/** high blooms: a step up the tree, two knots on the high bough, blooms on each */
const bloomHigh = section({
  id: 'w8-bloom-high',
  name: 'blooms on the high bough (pickups)',
  archetypes: ['harvest'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 5,
  uses: [W8_THEME.highBlooms],
  pieces: [bank('a', [180, 220]), up('b', 'a', 50, [180, 220]), up('b2', 'b', 46, [160, 190]), up('k', 'b2', 30, [140, 160]), down('c', 'k', 30, [320, 350]), down('d', 'c', 96, [150, 170]), up('k2', 'd', 30, [130, 150]), down('e', 'k2', 30, [150, 170])],
  last: 'e',
  sockets: [petals('b', 'b', 0.5, 2, 80), petals('b2', 'b2', 0.5, 2, 80), petals('k', 'k', 0.5, 1), roost('c', 0.03, 'roostHere1'), hideAt('h1', 'c', 0.5), foe('foe', 'e', [0.4, 0.6], [...CATS, 'boa'], 5, { phases: HOT, chance: 0.7 })],
  mirrorable: false,
});

/** dark blooms: a dark stretch, a bloom on every knot (they glow a little in the dark: engine.ts) */
const bloomDark = section({
  id: 'w8-bloom-dark',
  name: 'blooms in the dark (pickups, run)',
  archetypes: ['harvest'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 5,
  teaches: DARK,
  pieces: [
    bank('in', [170, 190]),
    down('a', 'in', 30, [160, 180]),
    up('k1', 'a', 40, [120, 140]),
    down('b', 'k1', 40, [140, 160]),
    hop('c', 'b', [150, 170]),
    up('k2', 'c', 44, [120, 140]),
    down('d', 'k2', 44, [140, 160]),
    wide('e', 'd', [170, 190]),
    up('out', 'e', 30, [180, 200]),
  ],
  last: 'out',
  sockets: [darkTip('in'), ...darkEnds('a', 'e'), petals('k1', 'k1', 0.5, 1), petals('b', 'b', 0.5, 2, 70), petals('k2', 'k2', 0.5, 1), petals('d', 'd', 0.5, 2, 70), petals('e', 'e', 0.5, 2, 80)],
  mirrorable: false,
});

/** gap blooms: wide gaps with blooms on the far boughs, a hunter on the last */
const bloomGaps = section({
  id: 'w8-bloom-gaps',
  name: 'blooms over the gaps (pickups)',
  archetypes: ['harvest'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 5,
  uses: [W8_THEME.gapBlooms],
  pieces: [bank('a', [220, 260]), wide('b', 'a', [200, 240]), up('k', 'b', 36, [140, 160]), down('c', 'k', 36, [160, 190]), wide('d', 'c', [320, 350]), up('k2', 'd', 30, [130, 150]), down('e', 'k2', 30, [150, 170])],
  last: 'e',
  sockets: [roost('a', 0.03, 'roostHere1'), hideAt('h1', 'a', 0.45), petals('a', 'a', 0.75, 1), petals('b', 'b', 0.5, 2, 80), petals('k', 'k', 0.5, 1), foe('foe', 'd', [0.5, 0.6], SMALL, 3, { phases: LIVE, chance: 0.7 }), petals('d', 'd', 0.85, 1)],
  mirrorable: true,
});

/** gap blooms: a second-jump gap, a bloom row on the far bough */
const bloomLeap = section({
  id: 'w8-bloom-leap',
  name: 'blooms past the long gap (pickups)',
  archetypes: ['harvest'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 7,
  needs: ['double'],
  uses: [W8_THEME.gapBlooms],
  pieces: [bank('a', [220, 260]), leap('b', 'a', [320, 350]), up('k', 'b', 36, [140, 160]), down('c', 'k', 36, [160, 190]), hop('d', 'c', [200, 240])],
  last: 'd',
  sockets: [roost('a', 0.03, 'roostHere1'), hideAt('h1', 'a', 0.45), petals('a', 'a', 0.8, 1), foe('foe', 'b', [0.55, 0.65], [...CATS, 'tayra'], 5, { phases: HOT, chance: 0.7 }), petals('b', 'b', 0.2, 2, 80), petals('k', 'k', 0.5, 1), petals('d', 'd', 0.5, 2, 80)],
  mirrorable: true,
});

// ───────────────────────────── 8-4 Bat Roosts: creep past the roosts ─────────────────────────────

/** a roost gate: Dot's line, a long watched bough with hiding places in reach, a long calm before the first waking, no animal */
const roostGate = (theme: 'hollows' | 'curtains' | 'climbs', name: string, extra: Socket[] = []): SectionTemplate => {
  const k = knots('s', 'shore', 2, [200, 240], [28, 32], [150, 170]);
  return section({
    id: `w8-roost-gate-${theme}`,
    name: `bat roosts: ${name} (cover)`,
    archetypes: ['stealth'],
    phases: ['start'],
    difficulty: 1,
    teaches: W8_THEME[theme],
    weight: 6,
    pieces: [bank('a', [200, 240]), up('knot', 'a', 30, [150, 180]), down('shore', 'knot', 30, [200, 240]), ...k.pieces],
    last: k.last,
    sockets: [
      tip(ROOST, 'a', 0.2),
      petals('knot', 'knot', 0.5, 1),
      roost('shore', 0.03, 'roostLesson'),
      hideAt('h1', 'shore'),
      petals('sk1', 'sk1', 0.5, 1),
      hideAt('h2', 'sf1'),
      petals('sk2', 'sk2', 0.5, 1),
      hideAt('h3', 'sf2', 0.6),
      ...extra,
    ],
    mirrorable: false,
  });
};
const roostGates = [
  roostGate('hollows', 'the hollow boughs', [scenery('fungus', 'a', [0.5, 0.6], 0.8)]),
  roostGate('curtains', 'the leaf curtains', [scenery('nest', 'a', [0.55, 0.65], 0.8)]),
  roostGate('climbs', 'up the roost tree'),
];

const hollowK = knots('', 'a2', 2, [300, 330]);
/** hollows: a long watched bough, hollows along it, a cat on the far flat */
const roostHollows = section({
  id: 'w8-roost-hollows',
  name: 'the hollow bough cover',
  archetypes: ['stealth'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 5,
  uses: [W8_THEME.hollows],
  pieces: [bank('a', [180, 200]), up('ak', 'a', 30, [140, 160]), down('a2', 'ak', 30, [200, 230]), ...hollowK.pieces],
  last: hollowK.last,
  sockets: [roost('a'), hideAt('h1', 'a', 0.4), petals('ak', 'ak', 0.5, 1), hideAt('h2', 'a2', 0.5), petals('k1', 'k1', 0.5, 1), hideAt('h3', 'f1', 0.2), foe('cat', 'f1', [0.6, 0.7], CATS, 5), petals('k2', 'k2', 0.5, 1), foe('f2', 'f2', [0.55, 0.65], SMALL, 3, { phases: LIVE })],
  mirrorable: true,
});

/** hollows: two watched boughs with a wide gap between, a hollow at each end */
const roostHollowGap = section({
  id: 'w8-roost-hollow-gap',
  name: 'the hollows over the gap cover',
  archetypes: ['stealth'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: [W8_THEME.hollows],
  pieces: [bank('a', [180, 200]), up('ak', 'a', 30, [140, 160]), down('a2', 'ak', 30, [200, 240]), wide('b', 'a2', [200, 240]), up('bk', 'b', 30, [140, 160]), down('b2', 'bk', 30, [320, 350]), up('ck', 'b2', 30, [130, 150]), down('c', 'ck', 30, [150, 170])],
  last: 'c',
  sockets: [roost('a'), hideAt('h1', 'a2', 0.4), petals('ak', 'ak', 0.5, 1), hideAt('h2', 'b', 0.5), petals('bk', 'bk', 0.5, 1), hideAt('h3', 'b2', 0.15), foe('foe', 'b2', [0.6, 0.7], [...CATS, 'boa'], 5, { phases: LIVE })],
  mirrorable: true,
});

/** curtains: knots on a watched bough, a leaf curtain on each flat */
const roostCurtains = section({
  id: 'w8-roost-curtains',
  name: 'the leaf curtains cover',
  archetypes: ['stealth'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 5,
  uses: [W8_THEME.curtains],
  pieces: [bank('a', [170, 200]), up('k1', 'a', 34, [140, 160]), down('f1', 'k1', 34, [180, 210]), wide('b', 'f1', [180, 210]), up('k2', 'b', 36, [140, 160]), down('f2', 'k2', 36, [180, 210]), wide('c', 'f2', [200, 230])],
  last: 'c',
  sockets: [roost('a', 0.03, 'roostHere1'), hideAt('h1', 'f1', 0.5), petals('k1', 'k1', 0.5, 1), roost('b', 0.03, 'roostHere2'), hideAt('h2', 'f2', 0.5), petals('k2', 'k2', 0.5, 1), petals('c', 'c', 0.5, 2, 80)],
  mirrorable: true,
});

/** curtains: short gaps between curtained boughs (each bough its own roost: roostHere) */
const roostCurtainGaps = section({
  id: 'w8-roost-curtain-gaps',
  name: 'the curtained gaps cover',
  archetypes: ['stealth'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: [W8_THEME.curtains],
  pieces: [bank('a', [220, 240]), wide('b', 'a', [220, 240]), up('k', 'b', 34, [130, 150]), down('c', 'k', 34, [150, 170]), wide('d', 'c', [310, 330]), up('dk', 'd', 30, [120, 140]), down('e', 'dk', 30, [140, 160])],
  last: 'e',
  sockets: [roost('a', 0.03, 'roostHere1'), hideAt('h1', 'a', 0.6), roost('b', 0.03, 'roostHere2'), hideAt('h2', 'b', 0.55), petals('k', 'k', 0.5, 1), petals('c', 'c', 0.5, 1), foe('foe', 'd', [0.55, 0.65], SMALL, 3, { phases: LIVE, chance: 0.7 })],
  mirrorable: true,
});

/** climbs: a trunk up to the roost tree's high bough, down the far side, a hunter past it (the roosts are the dark edge's and the long bough's) */
const roostClimb = section({
  id: 'w8-roost-climb',
  name: 'the roost tree climb cover',
  archetypes: ['stealth'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: [W8_THEME.climbs],
  pieces: [
    bank('a', [220, 250]),
    ...climbWall('v', 'a', 'wall', 210, [220, 250]),
    up('wk', 'wall', 30, [130, 150]),
    down('w2', 'wk', 30, [200, 230]),
    down('b', 'w2', 210, [160, 190]),
    hop('c', 'b', [320, 350]),
    up('ck', 'c', 30, [130, 150]),
    down('d', 'ck', 30, [150, 170]),
  ],
  last: 'd',
  // (no roost on the trunk's top: a wait for the bats right after the climb left 3.5 s with nothing to do, the inspector's dead time)
  sockets: [petals('a', 'a', 0.4, 2, 80), petals('wall', 'wall', 0.5, 2, 90), petals('wk', 'wk', 0.5, 1), scenery('nest', 'w2', [0.4, 0.6]), foe('foe', 'c', [0.55, 0.65], SMALL, 3, { phases: LIVE, chance: 0.8 })],
  mirrorable: false,
});

/** climbs: the roost tree's two trunks (climbRun, for the climbs roll of 8-4) */
const roostTrunks: SectionTemplate = { ...climbRun, id: 'w8-roost-trunks', name: 'the roost tree\'s trunks', archetypes: ['stealth'], uses: [W8_THEME.climbs] };

/** climbs: the roost's dark edge: a dark stretch, then a watched bough with a hollow */
const roostDark = section({
  id: 'w8-roost-dark',
  name: 'the dark under the roost cover (run)',
  archetypes: ['stealth'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  teaches: DARK,
  pieces: [
    bank('in', [180, 210]),
    down('a', 'in', 30, [180, 210]),
    hop('b', 'a', [180, 210]),
    up('k', 'b', 40, [130, 150]),
    down('c', 'k', 40, [170, 200]),
    up('out', 'c', 30, [240, 270]),
    up('k2', 'out', 30, [140, 160]),
    down('d', 'k2', 30, [200, 230]),
  ],
  last: 'd',
  sockets: [darkTip('in'), ...darkEnds('a', 'c'), petals('b', 'b', 0.5, 1), petals('k', 'k', 0.5, 1), roost('out', 0.03, 'roostOut'), hideAt('h1', 'out', 0.6), petals('k2', 'k2', 0.5, 1), hideAt('h2', 'd', 0.6)],
  mirrorable: false,
});

/** curtains: a leaf curtain at each side of a gap only the second jump crosses, and a wide gap after */
const roostCurtainLeap = section({
  id: 'w8-roost-curtain-leap',
  name: 'the curtained leap cover',
  archetypes: ['stealth'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 7,
  needs: ['double'],
  uses: [W8_THEME.curtains],
  pieces: [bank('a', [240, 270]), leap('b', 'a', [240, 270]), up('k', 'b', 34, [140, 160]), down('c', 'k', 34, [160, 190]), wide('d', 'c', [200, 230])],
  last: 'd',
  sockets: [roost('a', 0.03, 'roostHere1'), hideAt('h1', 'a', 0.6), roost('b', 0.03, 'roostHere2'), hideAt('h2', 'b', 0.6), petals('k', 'k', 0.5, 1), petals('d', 'd', 0.5, 2, 80)],
  mirrorable: true,
});

/** hollows: the hunters' roost: two cats' flats under the roost, a hollow by each */
const roostProwl = section({
  id: 'w8-roost-prowl',
  name: 'the prowled roost cover',
  archetypes: ['stealth'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 7,
  uses: [W8_THEME.hollows],
  pieces: [bank('a', [180, 210]), up('k1', 'a', 30, [140, 160]), down('b', 'k1', 30, [320, 350]), up('k2', 'b', 30, [140, 160]), down('c', 'k2', 30, [320, 350]), up('k3', 'c', 30, [130, 150]), down('d', 'k3', 30, [150, 170])],
  last: 'd',
  sockets: [roost('a'), hideAt('h1', 'a', 0.5), petals('k1', 'k1', 0.5, 1), hideAt('h2', 'b', 0.15), foe('f1', 'b', [0.6, 0.7], SMALL, 3), petals('k2', 'k2', 0.5, 1), hideAt('h3', 'c', 0.15), foe('f2', 'c', [0.6, 0.7], CATS, 5, { phases: LIVE })],
  mirrorable: true,
});

/** any roost stage: a long watched bough with a hollow and a curtain, a boa guard past them */
const roostLong = section({
  id: 'w8-roost-long',
  name: 'the long roost bough cover',
  archetypes: ['stealth'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 7,
  weight: SHARED * 2,
  pieces: [bank('a', [180, 210]), up('k1', 'a', 34, [140, 160]), down('b', 'k1', 34, [220, 250]), up('k2', 'b', 30, [140, 160]), down('c', 'k2', 30, [320, 350]), up('k3', 'c', 30, [130, 150]), down('d', 'k3', 30, [150, 170])],
  last: 'd',
  sockets: [roost('a'), hideAt('h1', 'a', 0.5), petals('k1', 'k1', 0.5, 1), hideAt('h2', 'b', 0.5), petals('k2', 'k2', 0.5, 1), hideAt('h3', 'c', 0.15), foe('foe', 'c', [0.6, 0.7], ['boa', 'ocelot'], 3, { phases: HOT, chance: 0.7 })],
  mirrorable: true,
});

/** 8-2's roost blooms: the roosts' gate and stretches as a harvest (blooms by the roosts), the roost theme's own in 8-2 */
const asBlooms = (t: SectionTemplate, id: string): SectionTemplate => ({ ...t, id, name: `${t.name.replace(' (cover)', '')}: blooms (pickups)`, archetypes: ['harvest'], uses: [W8_THEME.roostBlooms] });
const roostBlooms: SectionTemplate[] = [
  { ...asBlooms(roostGates[0], 'w8-bloom-gate-roostBlooms'), uses: undefined, teaches: W8_THEME.roostBlooms },
  asBlooms(roostHollows, 'w8-bloom-roost-hollows'),
  asBlooms(roostCurtains, 'w8-bloom-roost-curtains'),
  asBlooms(roostLong, 'w8-bloom-roost-long'),
  asBlooms(roostCurtainGaps, 'w8-bloom-roost-gaps'),
];

// ───────────────────────────── 8-6 Glide by Moonlight ─────────────────────────────

/** the first moonlight glide: a long run-up, one gap only the leaf crosses (Dot's line), a broad bough past it */
const glideFirst = section({
  id: 'w8-glide-first',
  name: 'the first moonlight glide (run)',
  archetypes: ['sprint'],
  phases: ['ki', 'sho'],
  difficulty: 4,
  teaches: GLIDE,
  maxPerStage: 1,
  pieces: [bank('a', [340, 380]), glide('b', 'a', [300, 340], [0.8, 0.88]), up('k', 'b', 34, [140, 160]), down('c', 'k', 34, [200, 240])],
  last: 'c',
  sockets: [tip(GLIDE, 'a', 0.3), petals('a', 'a', 0.4, 2, 80), petals('b', 'b', 0.5, 2, 80), petals('k', 'k', 0.5, 1), scenery('nest', 'c', [0.5, 0.7])],
  mirrorable: false,
});

/** two glides with a knotted bough between */
const glidePair = section({
  id: 'w8-glide-pair',
  name: 'two moonlight glides (run)',
  archetypes: ['sprint'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: [GLIDE, W8_THEME.leapers],
  pieces: [bank('a', [220, 260]), glide('b', 'a', [180, 220]), up('k', 'b', 36, [140, 160]), down('c', 'k', 36, [180, 220]), glide('d', 'c', [260, 300])],
  last: 'd',
  sockets: [petals('a', 'a', 0.5, 1), petals('b', 'b', 0.5, 1), petals('k', 'k', 0.5, 1), petals('d', 'd', 0.5, 2, 80)],
  mirrorable: true,
});

/** climb the trunk, then glide off its high bough down to a far one */
const glideTrunk = section({
  id: 'w8-glide-trunk',
  name: 'climb, then glide from the high bough (run)',
  archetypes: ['sprint'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: [GLIDE, W8_THEME.climbers],
  pieces: [bank('a', [260, 300]), ...climbWall('v', 'a', 'wall', 220, [200, 240]), down('b', 'wall', 60, [180, 220]), glide('c', 'b', [420, 460]), down('d', 'c', 160, [200, 240])],
  last: 'd',
  exitDy: 0,
  sockets: [petals('a', 'a', 0.4, 2, 80), petals('wall', 'wall', 0.5, 2, 80), petals('b', 'b', 0.5, 1), foe('foe', 'c', [0.55, 0.65], SMALL, 3, { phases: LIVE, chance: 0.6 })],
  mirrorable: false,
});

/** a glide onto a hunter's bough */
const glideHunter = section({
  id: 'w8-glide-hunter',
  name: 'glide onto the hunter\'s bough (run)',
  archetypes: ['sprint'],
  phases: ['ten', 'ketsu'],
  difficulty: 7,
  uses: [GLIDE, W8_THEME.prowlers],
  pieces: [bank('a', [220, 260]), up('k', 'a', 34, [140, 160]), down('b', 'k', 34, [180, 220]), glide('c', 'b', [440, 480]), hop('d', 'c', [200, 240])],
  last: 'd',
  sockets: [petals('k', 'k', 0.5, 1), petals('b', 'b', 0.5, 1), foe('foe', 'c', [0.55, 0.65], [...CATS, 'tayra'], 5, { phases: LIVE }), petals('d', 'd', 0.5, 2, 80)],
  mirrorable: true,
});

/** a glide over the dark (the firefly lights the far bough), knots on in the dark */
const glideDark = section({
  id: 'w8-glide-dark',
  name: 'glide into the dark (run)',
  archetypes: ['sprint'],
  phases: ['ten', 'ketsu'],
  difficulty: 7,
  teaches: DARK,
  uses: [GLIDE],
  pieces: [
    bank('in', [200, 240]),
    down('a', 'in', 30, [200, 240]),
    glide('b', 'a', [200, 240]),
    up('k', 'b', 40, [130, 150]),
    down('c', 'k', 40, [170, 200]),
    hop('d', 'c', [180, 210]),
    up('out', 'd', 30, [200, 230]),
  ],
  last: 'out',
  sockets: [darkTip('in'), ...darkEnds('a', 'd'), petals('b', 'b', 0.5, 2, 80), petals('k', 'k', 0.5, 1), petals('d', 'd', 0.5, 1)],
  mirrorable: false,
});

/** leapers: a gap only the second jump crosses, a knot, then a glide (8-6 holds no plain jumps' sections: each of its stretches glides) */
const glideLeap = section({
  id: 'w8-glide-leap',
  name: 'second jump, then glide (run)',
  archetypes: ['sprint'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 7,
  needs: ['double'],
  uses: [GLIDE, W8_THEME.leapers],
  pieces: [bank('a', [220, 260]), leap('b', 'a', [200, 240]), up('k', 'b', 34, [140, 160]), down('c', 'k', 34, [180, 220]), glide('d', 'c', [240, 280])],
  last: 'd',
  sockets: [petals('a', 'a', 0.5, 2, 80), petals('k', 'k', 0.5, 1), petals('c', 'c', 0.5, 1), petals('d', 'd', 0.5, 2, 80)],
  mirrorable: true,
});

/** prowlers: a hunter's long bough, a knot, then a glide over to the next */
const glideProwl = section({
  id: 'w8-glide-prowl',
  name: 'past the hunter, then glide (run)',
  archetypes: ['sprint'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: [GLIDE, W8_THEME.prowlers],
  pieces: [bank('a', [320, 350]), up('k', 'a', 34, [140, 160]), down('b', 'k', 34, [180, 220]), glide('c', 'b', [240, 280]), up('k2', 'c', 30, [130, 150]), down('d', 'k2', 30, [160, 190])],
  last: 'd',
  sockets: [foe('foe', 'a', [0.5, 0.6], SMALL, 3, { phases: LIVE }), petals('k', 'k', 0.5, 1), petals('c', 'c', 0.5, 2, 80), petals('k2', 'k2', 0.5, 1)],
  mirrorable: true,
});

/**
 * 8-6's night wind (GRAB-BAG.md A): a gust blows through the gap on a rhythm, the painted wind racing along it (zoneArt.ts drawGust)
 * after its warning; it blows the way he glides, so a glide on the gust carries further (the far petals), and a glide in the lull still
 * lands. Its own theme, so a roll has the wind or it doesn't
 */
const glideGust = section({
  id: 'w8-glide-gust',
  name: 'glide on the night wind (run)',
  archetypes: ['sprint'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: [GLIDE, W8_THEME.gusts],
  pieces: [bank('a', [260, 300]), glide('b', 'a', [220, 260]), up('k', 'b', 34, [140, 160]), down('c', 'k', 34, [180, 220])],
  last: 'c',
  zones: [{ kind: 'wind', on: 'b' }],
  sockets: [petals('a', 'a', 0.35, 2, 80), petals('b', 'b', 0.7, 2, 80), petals('k', 'k', 0.5, 1), scenery('fungus', 'c', [0.5, 0.7], 0.5)],
  mirrorable: true,
});

/** two gusty gaps with a knotted bough between, the second gust on its own beat */
const glideGustPair = section({
  id: 'w8-glide-gust-pair',
  name: 'two glides on the night wind (run)',
  archetypes: ['sprint'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 7,
  uses: [GLIDE, W8_THEME.gusts],
  pieces: [bank('a', [240, 280]), glide('b', 'a', [200, 240]), up('k', 'b', 36, [140, 160]), down('c', 'k', 36, [200, 240]), glide('d', 'c', [240, 280])],
  last: 'd',
  zones: [{ kind: 'wind', on: 'b' }, { kind: 'wind', on: 'd', idle: [3, 3.6] }],
  sockets: [petals('a', 'a', 0.5, 1), petals('k', 'k', 0.5, 1), petals('c', 'c', 0.4, 1), petals('d', 'd', 0.6, 2, 80)],
  mirrorable: true,
});

/** the wind and a hunter: a gust over the gap onto the hunter's long bough */
const glideGustHunter = section({
  id: 'w8-glide-gust-hunter',
  name: 'on the wind to the hunter\'s bough (run)',
  archetypes: ['sprint'],
  phases: ['ten', 'ketsu'],
  difficulty: 7,
  uses: [GLIDE, W8_THEME.gusts],
  pieces: [bank('a', [240, 280]), glide('b', 'a', [420, 460]), up('k', 'b', 30, [130, 150]), down('c', 'k', 30, [170, 200])],
  last: 'c',
  zones: [{ kind: 'wind', on: 'b' }],
  sockets: [petals('a', 'a', 0.5, 1), foe('foe', 'b', [0.6, 0.7], SMALL, 3, { phases: LIVE }), petals('k', 'k', 0.5, 1)],
  mirrorable: true,
});

// ───────────────────────────── 8-8 Night Hunters and 8-9 Monarch's Wood: the hunters' boughs ─────────────────────────────

/** a hunt gate: Dot explains the shut shrine before any animal, and the roll's theme opens */
const huntGate = (theme: 'cats' | 'harpies' | 'guards', line: 'hunt' | 'fight'): SectionTemplate => {
  const k = knots('', 'a', 2, [170, 200]);
  return section({
    id: `w8-${line}-gate-${theme}`,
    name: `the ${line === 'hunt' ? 'night hunters' : "Monarch's wood"}: ${theme} (arena gate)`,
    archetypes: [line === 'hunt' ? 'purge' : 'gauntlet'],
    phases: ['start'],
    difficulty: 1,
    teaches: W8_THEME[theme],
    weight: 6,
    pieces: [bank('a', [200, 230]), ...k.pieces, up('b', k.last, 40, [200, 230])],
    last: 'b',
    sockets: [tip(line === 'hunt' ? W8_LESSON.hunt : W8_LESSON.fight, 'a', 0.15), petals('k1', 'k1', 0.5, 1), petals('k2', 'k2', 0.5, 1), scenery(theme === 'cats' ? 'fungus' : 'nest', 'b', [0.4, 0.6], 0.8)],
    exitDy: -40,
    mirrorable: false,
  });
};
// (8-8 hunts the harpies and the small cats, 8-9 fights the jaguars and the boa guards: w8.ts W8_STAGE_FOES)
const huntGates = [huntGate('cats', 'hunt'), huntGate('harpies', 'hunt'), huntGate('cats', 'fight'), huntGate('guards', 'fight')];

const hunterK = knots('', 'a', 2, [320, 350]);
/** any hunt: a bough over two knots with hunters along it */
const hunterBough = section({
  id: 'w8-hunter-bough',
  name: 'hunters bough arena',
  archetypes: ['purge', 'gauntlet'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 5,
  weight: SHARED / 2,
  pieces: [bank('a', [340, 370]), ...hunterK.pieces],
  last: hunterK.last,
  sockets: [foe('f1', 'a', [0.55, 0.65], SMALL, 3), petals('k1', 'k1', 0.5, 1), foe('f2', 'f1', [0.5, 0.6], SMALL, 3, { phases: LIVE }), petals('k2', 'k2', 0.5, 1), foe('f3', 'f2', [0.5, 0.6], [...CATS, 'boa'], 5, { phases: HOT, chance: 0.7 })],
  mirrorable: true,
});

/** any hunt: a sunken fork (a step down and back up, a knot in it) with two animals in it */
const sunkenFork = section({
  id: 'w8-sunken-fork',
  name: 'sunken fork arena',
  archetypes: ['purge', 'gauntlet'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  weight: SHARED / 2,
  pieces: [bank('a', [160, 190]), down('yard', 'a', 46, [340, 370]), up('mid', 'yard', 30, [150, 170]), down('yard2', 'mid', 30, [320, 350]), up('b', 'yard2', 46, [190, 220])],
  last: 'b',
  sockets: [petals('a', 'a', 0.5, 1), foe('f1', 'yard', [0.5, 0.6], SMALL, 3), petals('mid', 'mid', 0.5, 1), foe('f2', 'yard2', [0.5, 0.6], [...CATS, 'boa'], 5, { phases: LIVE }), scenery('fungus', 'b', [0.5, 0.7])],
  mirrorable: true,
});

/** cats: an ocelot's bough, a wide gap, the jaguar's bough */
const catBoughs = section({
  id: 'w8-cat-boughs',
  name: 'cats boughs arena',
  archetypes: ['purge', 'gauntlet'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: [W8_THEME.cats],
  pieces: [bank('a', [340, 370]), up('k', 'a', 34, [140, 160]), down('b', 'k', 34, [160, 190]), up('m', 'b', 40, [130, 150]), down('c', 'm', 40, [340, 370]), up('k2', 'c', 30, [140, 160]), down('d', 'k2', 30, [150, 180])],
  last: 'd',
  sockets: [foe('f1', 'a', [0.55, 0.65], ['ocelot'], 3), petals('k', 'k', 0.5, 1), foe('f2', 'c', [0.5, 0.6], CATS, 5, { phases: LIVE }), petals('k2', 'k2', 0.5, 1)],
  mirrorable: true,
});

/** cats: the jaguar's high bough (a climb up to it), down again */
const jaguarHigh = section({
  id: 'w8-jaguar-high',
  name: 'jaguar high bough arena',
  archetypes: ['purge', 'gauntlet'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 7,
  uses: [W8_THEME.cats],
  pieces: [
    bank('a', [220, 250]),
    ...climbWall('v', 'a', 'wall', 210, [340, 370]),
    up('wk', 'wall', 30, [130, 150]),
    down('w2', 'wk', 30, [150, 170]),
    down('b', 'w2', 210, [320, 350]),
    up('bk', 'b', 30, [130, 150]),
    down('c', 'bk', 30, [150, 170]),
  ],
  last: 'c',
  sockets: [petals('a', 'a', 0.4, 2, 80), foe('f1', 'wall', [0.5, 0.6], ['jaguar'], 5), foe('f2', 'b', [0.55, 0.65], ['ocelot', 'tayra'], 3, { phases: HOT, chance: 0.7 })],
  mirrorable: false,
});

/** cats: two trunks with a cat on each high bough */
const catTrunks = section({
  id: 'w8-cat-trunks',
  name: 'cats up the trunks arena',
  archetypes: ['purge', 'gauntlet'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 7,
  uses: [W8_THEME.cats],
  pieces: [
    bank('a', [200, 230]),
    ...climbWall('v', 'a', 'wall', 210, [340, 370]),
    down('b', 'wall', 210, [160, 190]),
    up('k', 'b', 34, [130, 150]),
    down('c', 'k', 34, [160, 190]),
    ...climbWall('v2', 'c', 'wall2', 210, [340, 370]),
    down('d', 'wall2', 210, [160, 190]),
  ],
  last: 'd',
  sockets: [foe('f1', 'wall', [0.55, 0.65], ['ocelot', 'tayra'], 3), petals('k', 'k', 0.5, 1), foe('f2', 'wall2', [0.55, 0.65], CATS, 5, { phases: LIVE })],
  mirrorable: false,
});

/** harpies: a long bough for the harpy's slide, a wide gap, another */
const harpyBough = section({
  id: 'w8-harpy-bough',
  name: 'harpy bough arena',
  archetypes: ['purge', 'gauntlet'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: [W8_THEME.harpies],
  pieces: [bank('a', [400, 430]), up('k', 'a', 34, [140, 160]), down('b', 'k', 34, [160, 190]), wide('c', 'b', [400, 430]), up('ck', 'c', 30, [130, 150]), down('d', 'ck', 30, [150, 170])],
  last: 'd',
  sockets: [foe('f1', 'a', [0.5, 0.6], ['harpy'], 4), petals('k', 'k', 0.5, 1), petals('b', 'b', 0.5, 1), foe('f2', 'c', [0.5, 0.6], ['harpy', 'tayra'], 4, { phases: LIVE })],
  mirrorable: true,
});

/** harpies: a second-jump gap between two harpy boughs */
const harpyLeap = section({
  id: 'w8-harpy-leap',
  name: 'harpy leap arena',
  archetypes: ['purge', 'gauntlet'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 8,
  needs: ['double'],
  uses: [W8_THEME.harpies],
  pieces: [bank('a', [400, 430]), up('ak', 'a', 30, [130, 150]), down('a2', 'ak', 30, [150, 170]), leap('b', 'a2', [400, 430]), up('k', 'b', 30, [140, 160]), down('c', 'k', 30, [150, 180])],
  last: 'c',
  sockets: [foe('f1', 'a', [0.45, 0.55], ['harpy', 'ocelot'], 4), foe('f2', 'b', [0.5, 0.6], ['harpy', 'jaguar'], 5, { phases: LIVE }), petals('k', 'k', 0.5, 1)],
  mirrorable: true,
});

/** harpies: two wide gaps between the harpies' boughs */
const harpyGaps = section({
  id: 'w8-harpy-gaps',
  name: 'harpy gaps arena',
  archetypes: ['purge', 'gauntlet'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 7,
  uses: [W8_THEME.harpies],
  pieces: [bank('a', [160, 180]), wide('b', 'a', [380, 400]), up('bk', 'b', 30, [120, 140]), down('b2', 'bk', 30, [140, 160]), wide('d', 'b2', [380, 400]), up('e', 'd', 30, [140, 160])],
  last: 'e',
  sockets: [foe('f1', 'b', [0.5, 0.6], ['harpy', 'tayra'], 4), petals('bk', 'bk', 0.5, 1), foe('f2', 'd', [0.5, 0.6], ['harpy', 'ocelot'], 4, { phases: LIVE }), petals('e', 'e', 0.5, 1)],
  exitDy: -30,
  mirrorable: false,
});

/** guards: boa guards on long knotted boughs */
const boaKnots = section({
  id: 'w8-boa-knots',
  name: 'boa guards arena',
  archetypes: ['purge', 'gauntlet'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 5,
  uses: [W8_THEME.guards],
  pieces: [bank('a', [330, 360]), up('k', 'a', 36, [140, 160]), down('b', 'k', 36, [330, 360]), hop('c', 'b', [180, 210])],
  last: 'c',
  sockets: [foe('f1', 'a', [0.55, 0.65], ['boa'], 3), petals('k', 'k', 0.5, 1), foe('f2', 'b', [0.5, 0.6], ['boa', 'tayra'], 3, { phases: LIVE }), petals('c', 'c', 0.5, 2, 80)],
  mirrorable: true,
});

/** guards: a guard's bough, the dark beyond it (nothing in the dark), another guard past it */
const guardDark = section({
  id: 'w8-guard-dark',
  name: 'guards and the dark arena (run)',
  archetypes: ['purge', 'gauntlet'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 7,
  teaches: DARK,
  pieces: [
    bank('in', [330, 350]),
    down('a', 'in', 30, [160, 180]),
    hop('b', 'a', [160, 180]),
    wide('d', 'b', [160, 180]),
    up('out', 'd', 30, [330, 350]),
    up('ok', 'out', 30, [120, 140]),
    down('e', 'ok', 30, [140, 160]),
  ],
  last: 'e',
  sockets: [foe('f1', 'in', [0.35, 0.45], ['boa', 'ocelot'], 3), darkTip('in'), ...darkEnds('a', 'd'), petals('b', 'b', 0.5, 1), petals('d', 'd', 0.5, 1), foe('f2', 'out', [0.55, 0.65], ['boa', 'tayra'], 3, { phases: LIVE })],
  mirrorable: false,
});

/** guards: the guards' night: a second dark stretch, a guard at each lit end (World 8's fights in the dark: nothing stands in it) */
const guardNight: SectionTemplate = { ...guardDark, id: 'w8-guard-night', name: 'guards and the night arena (run)', uses: [W8_THEME.guards], weight: 2 };

/** guards: knots on knots, a boa on the long flat */
const guardKnots = section({
  id: 'w8-guard-knots',
  name: 'guards on the knots arena',
  archetypes: ['purge', 'gauntlet'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 6,
  uses: [W8_THEME.guards],
  pieces: [bank('a', [140, 160]), ...knots('', 'a', 2, [130, 150], [32, 44], [120, 140]).pieces, hop('b', 'f2', [320, 340]), ...knots('b', 'b', 2, [130, 150], [32, 44], [120, 140]).pieces],
  last: 'bf2',
  sockets: [petals('k1', 'k1', 0.5, 1), petals('k2', 'k2', 0.5, 1), foe('f1', 'b', [0.5, 0.6], ['boa', 'tayra'], 3), petals('bk1', 'bk1', 0.5, 1), petals('bk2', 'bk2', 0.5, 1)],
  mirrorable: true,
});

// ───────────────────────────── 8-9 Monarch's Wood: its own boughs (8-8 Night Hunters is the stage before: no two alike) ─────────────

/** the Monarch's wood's dark: a longer stretch with a second-jump gap in it, a guard at each lit end (8-9's required dark) */
const monarchDark = section({
  id: 'w8-monarch-dark',
  name: 'the Monarch\'s dark arena (run)',
  archetypes: ['gauntlet'],
  phases: ['sho', 'ten', 'ketsu'],
  difficulty: 8,
  teaches: DARK,
  needs: ['double'],
  pieces: [
    bank('in', [320, 340]),
    down('a', 'in', 30, [150, 170]),
    up('k', 'a', 44, [120, 140]),
    down('b', 'k', 44, [150, 170]),
    leap('c', 'b', [150, 170]),
    hop('e', 'c', [150, 170]),
    up('out', 'e', 30, [320, 340]),
  ],
  last: 'out',
  sockets: [foe('f1', 'in', [0.35, 0.45], ['boa', 'ocelot'], 3), darkTip('in'), ...darkEnds('a', 'e'), petals('k', 'k', 0.5, 1), petals('c', 'c', 0.5, 1), foe('f2', 'out', [0.55, 0.65], ['jaguar', 'harpy'], 5, { phases: LIVE })],
  mirrorable: false,
});

/** cats: a wide gap between two cats' boughs, a knot after */
const monarchCats = section({
  id: 'w8-monarch-cats',
  name: 'the Monarch\'s cats arena',
  archetypes: ['gauntlet'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 7,
  uses: [W8_THEME.cats],
  pieces: [bank('a', [340, 370]), up('k', 'a', 36, [130, 150]), down('b', 'k', 36, [160, 190]), ...climbWall('v', 'b', 'wall', 210, [340, 370]), down('c', 'wall', 210, [160, 190]), up('k2', 'c', 30, [130, 150]), down('d', 'k2', 30, [150, 170])],
  last: 'd',
  sockets: [foe('f1', 'a', [0.5, 0.6], CATS, 5), petals('k', 'k', 0.5, 1), foe('f2', 'wall', [0.55, 0.65], ['jaguar'], 5, { phases: LIVE }), petals('k2', 'k2', 0.5, 1)],
  mirrorable: false,
});

/** harpies: a second-jump gap, then a wide one, harpies on the far boughs */
const monarchHarpies = section({
  id: 'w8-monarch-harpies',
  name: 'the Monarch\'s harpies arena',
  archetypes: ['gauntlet'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 8,
  needs: ['double'],
  uses: [W8_THEME.harpies],
  pieces: [bank('a', [160, 180]), leap('b', 'a', [380, 400]), up('bk', 'b', 30, [120, 140]), down('b2', 'bk', 30, [140, 160]), wide('c', 'b2', [380, 400]), up('d', 'c', 30, [140, 160])],
  last: 'd',
  sockets: [foe('f1', 'b', [0.5, 0.6], ['harpy'], 4), petals('bk', 'bk', 0.5, 1), foe('f2', 'c', [0.5, 0.6], ['harpy', 'jaguar'], 5, { phases: LIVE }), petals('d', 'd', 0.5, 1)],
  exitDy: -30,
  mirrorable: false,
});

/** guards: the Monarch's guard posts: three long flats, a knot between each (the guards' theme's animals stand here: the dark holds none) */
const monarchGuardPosts = section({
  id: 'w8-monarch-guard-posts',
  name: 'the Monarch\'s guard posts arena',
  archetypes: ['gauntlet'],
  phases: ['ki', 'sho', 'ten', 'ketsu'],
  difficulty: 7,
  weight: 2,
  uses: [W8_THEME.guards],
  pieces: [bank('a', [340, 370]), up('k1', 'a', 36, [130, 150]), down('b', 'k1', 36, [340, 370]), up('k2', 'b', 40, [130, 150]), down('c', 'k2', 40, [340, 370]), up('k3', 'c', 30, [130, 150]), down('d', 'k3', 30, [150, 170])],
  last: 'd',
  sockets: [foe('f1', 'a', [0.5, 0.6], ['boa', 'ocelot'], 3), petals('k1', 'k1', 0.5, 1), foe('f2', 'b', [0.5, 0.6], ['boa', 'tayra'], 3, { phases: LIVE }), petals('k2', 'k2', 0.5, 1), foe('f3', 'c', [0.5, 0.6], ['jaguar', 'boa'], 5, { phases: LIVE }), petals('k3', 'k3', 0.5, 1)],
  mirrorable: true,
});

/** guards: boas on the knots and a short dark between */
const monarchGuards: SectionTemplate = { ...nightOf(darkBoughs, 'w8-monarch-guard-dark'), name: 'the Monarch\'s guards in the dark (run)', archetypes: ['gauntlet'], uses: [W8_THEME.guards], weight: 2 };

// ───────────────────────────── the list, and which stage holds which ─────────────────────────────

export const W8_SECTIONS: SectionTemplate[] = [
  ...litGates, restBough, restFork, restTrunk, restTrunkKnot, restGlide, restGlideFork,
  knotHops, boughGap, doubleGap, trunkClimb, rise, drop, climbRun, prowlBough,
  darkBoughs, darkGap, darkClimb, darkLong, ...nightSections,
  ...bloomGates, bloomClimb, bloomHigh, bloomDark, bloomGaps, bloomLeap, ...roostBlooms,
  ...roostGates, roostHollows, roostHollowGap, roostCurtains, roostCurtainGaps, roostCurtainLeap, roostProwl, roostClimb, roostTrunks, roostDark, roostLong,
  glideFirst, glidePair, glideTrunk, glideHunter, glideDark, glideLeap, glideProwl,
  glideGust, glideGustPair, glideGustHunter,
  ...huntGates, hunterBough, sunkenFork, catBoughs, catTrunks, jaguarHigh, harpyBough, harpyGaps, harpyLeap, boaKnots, guardDark, guardNight, guardKnots,
  monarchDark, monarchCats, monarchHarpies, monarchGuards, monarchGuardPosts,
];

/** the shared fillers, kept out of the themed stages (8-2, 8-4, 8-8, 8-9: there the theme carries the stage) */
const FILLERS = ['w8-knot-hops', 'w8-bough-gap', 'w8-double-gap', 'w8-trunk-climb', 'w8-rise', 'w8-drop', 'w8-climb-run', 'w8-prowl-bough'];
/** the dark sections of the lit stages (the themed stages hold their own dark ones) */
const DARKS = ['w8-dark-boughs', 'w8-dark-gap', 'w8-dark-climb', 'w8-dark-long'];

/** section id -> the stages of World 8 that may hold it (unlisted: any stage its archetype and phases allow) */
export const W8_STAGE_ONLY: Readonly<Record<string, readonly number[]>> = {
  // (the lit boughs' fillers and dark stretches are 8-1's alone: 8-3 and 8-5 swing, 8-6 glides, and a 20 s stretch of plain boughs
  // shared between them read alike on the look-alike measure, STAGE-RULES §6 "Sameness")
  ...Object.fromEntries(FILLERS.map((id) => [id, [1]])),
  // (each stage's rests: 8-5's at a trunk, 8-6's with a glide, the plain boughs' the others')
  'w8-rest-bough': [1, 2, 3, 8, 9],
  'w8-rest-fork': [1, 2, 3, 8, 9],
  'w8-rest-trunk': [5],
  'w8-rest-trunk-knot': [5],
  'w8-rest-glide': [6],
  'w8-rest-glide-fork': [6],
  ...Object.fromEntries(DARKS.map((id) => [id, [1]])),
  // (the long dark is 8-1's; each lit gate its stages')
  'w8-dark-long': [1],
  // (the shared arenas made every fight theme read alike: the themes carry 8-8 and 8-9; kept for no stage today)
  'w8-hunter-bough': [],
  'w8-sunken-fork': [],
  // (8-8 and 8-9 are neighbours: each theme's sections are split between them, and 8-9 has its own dark)
  'w8-cat-boughs': [8],
  'w8-cat-trunks': [8],
  'w8-harpy-bough': [8],
  'w8-harpy-gaps': [8],
  'w8-boa-knots': [8],
  'w8-guard-knots': [8],
  'w8-guard-dark': [8],
  'w8-jaguar-high': [9],
  'w8-guard-night': [9],
  // (8-9 has no harpies, and its dark is its own: the Monarch's guards' dark boughs read as 8-1's night)
  'w8-harpy-leap': [],
  'w8-monarch-harpies': [],
  'w8-monarch-guard-dark': [],
  // (the moonlight glides are 8-6's: Glide by Moonlight)
  ...Object.fromEntries(['w8-glide-first', 'w8-glide-pair', 'w8-glide-trunk', 'w8-glide-hunter', 'w8-glide-dark', 'w8-glide-leap', 'w8-glide-prowl', 'w8-glide-gust', 'w8-glide-gust-pair', 'w8-glide-gust-hunter'].map((id) => [id, [6]])),
  ...Object.fromEntries(nightSections.map((t) => [t.id, [1]])),
  ...Object.fromEntries((['climbers', 'prowlers', 'leapers', 'chains', 'night', 'gusts'] as const).map((t) => [`w8-gate-${t}`, Object.keys(W8_LIT_THEMES).map(Number).filter((st) => W8_LIT_THEMES[st].includes(t))])),
};
