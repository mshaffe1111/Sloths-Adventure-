/**
 * World 1's section versions (the variety pass, 2026-10-28; reference/STAGE-RULES.md §2 "Variety across rolls", ledger rows C1, C3, C4).
 *
 * The 200-roll tool (tools/inspect/era.ts) found every World 1 stage 96-100% alike from roll to roll: the platforms moved, but the
 * order of things to do never changed. So each stage's main sections (Develop / Twist / Finish, and the Start where it was always the
 * same) now come in two or three authored versions, each with its own rhythm of moves (hops and jumps, swings and climbs, fights, the
 * eagle), and the layout roll picks one version per section:
 *   - the pick is a ShuffleBag draw on a stream of its own (seeded by the stage and the layout number), so the stage's own dice, which
 *     place the platforms, are untouched by it;
 *   - sections that share a pool (1-1, 1-2 and 1-5 take Develop and Twist bodies from one pool of World 1 pieces) go through a
 *     CooldownQueue, so a stage never uses the same pool body twice;
 *   - a player's next roll of a stage repeats none of the versions of their last one where it can help it (layoutMemory.ts, with
 *     w1RollDistance: a cheap stand-in for the era tool's action 3-grams, since the versions are what make the 3-grams differ).
 * Every version keeps the stage's lesson: the same tip comes first, the move is taught before it can hurt, and the stage is two
 * minutes or longer on every roll (the finish runs until the quick player's clock says so).
 *
 * The versions build with the stage builder's own pieces (protoStage.ts buildPlan), handed in as a W1Kit: nothing here places a
 * platform by itself, so every rule a piece already keeps (soft moss under every gap, a hop out of every pit, a rest after a burst)
 * holds in every version.
 */
import { CooldownQueue, ShuffleBag, type Rng } from './gen2/variety.ts';

/** World 1's stages with section versions (1-6 is the 'proto' plan; 1-10, the boss lair, has one designed layout) */
export type W1Stage = '1-1' | '1-2' | '1-3' | '1-4' | '1-5' | '1-6' | '1-7' | '1-8' | '1-9';
export type Slot = 'start' | 'develop' | 'twist' | 'finish';
const SLOTS: readonly Slot[] = ['start', 'develop', 'twist', 'finish'];

/** the stage builder's dice (protoStage.ts stream) */
export interface Dice {
  f: () => number;
  r: (a: number, b: number) => number;
  i: (a: number, b: number) => number;
  chance: (p: number) => boolean;
  pick: <T>(xs: readonly T[]) => T;
  shuffle: <T>(xs: T[]) => T[];
}

type Hop = 'log' | 'dip' | 'leap';
type Bush = 'tall' | 'wide' | 'fern' | 'grotto';

/** what the versions build with: protoStage.ts buildPlan's pieces, each starting and ending on open ground (see their notes there) */
export interface W1Kit {
  R: Dice;
  /** the cursor (the open end of the bank he is on) */
  readonly x: number;
  /** a quick, sure player's seconds so far */
  readonly expert: number;
  /** the quick player's two minutes, in the builder's own clock */
  readonly EXPERT: number;
  /** the ground level */
  readonly G: number;
  hint: (x: number, text: string, pad?: string, keys?: string) => void;
  flag: () => void;
  run: (len: number) => void;
  rest: (len: number) => void;
  // ----- hops and jumps (1-1 on)
  logHop: (h?: number) => void;
  dip: (share?: number) => void;
  leap: (share?: number) => void;
  busy: (n: number, kinds?: readonly Hop[], restAfter?: number) => void;
  lowStumps: () => void;
  stumps: () => void;
  pillars: (heights: number[], share: [number, number], dbl?: boolean, plain?: boolean) => void;
  /** soft gaps of these widths (px), a run of ground after each; `arcs`: petals over each where the jump goes */
  gapRun: (widths: number[], after: [number, number], arcs?: boolean) => void;
  /** the 1-1 practice shelf for the second jump (over flat ground: a miss lands him back on the path) */
  practiceShelf: () => void;
  reachOne: number;
  reachTwo: number;
  mushroomCache: () => void;
  /** a wall only a mushroom bounce gets him up (`first`: the bounce's tip comes first) */
  bounceWall: (first?: boolean, rock?: boolean) => void;
  /** a mushroom up to n branches 240 over the ground, ending on a wall's top only they reach (`dbl`: gaps for the second jump) */
  highLeaps: (n: number, dbl?: boolean, first?: boolean, snakes?: boolean) => void;
  highRoadOver: () => void;
  homeRun: (kinds?: ReadonlyArray<'log' | 'dip'>) => void;
  // ----- the petal trail (1-2 on)
  trailUp: (nook: boolean) => void;
  petalClimb: () => void;
  petalPerch: () => void;
  splitTrail: () => void;
  dipArc: () => void;
  doubleArcs: (tight?: boolean) => void;
  // ----- snakes and ropes (1-3 on)
  snakeBranches: (n: number, y: number) => void;
  ropeGap: (guard: boolean, bonus: boolean, tight?: boolean) => void;
  snakeWalk: (m: number) => void;
  snakeLedge: () => void;
  // ----- climbs (1-4 on), creaking branches (1-5 on)
  climbTree: (tight?: boolean) => void;
  /** a wall too tall to jump with a trunk beside it: up the trunk, across its branch onto the high ground (1-5 on) */
  climbWall: () => void;
  fernTree: () => void;
  glideLookout: () => void;
  creakRun: () => void;
  // ----- swings and the canopy (1-6 on)
  chain: (n: number, soft: boolean, rocks?: boolean) => void;
  kapok: () => void;
  canopy: (glideSeed: boolean) => void;
  highRun: () => void;
  logPuzzle: (busyTop?: boolean) => void;
  seesawRoom: (demo: boolean) => void;
  seesawTwist: () => void;
  // ----- the eagle (1-7)
  bushRow: (n: number, gap: [number, number], kinds: Bush[], calm: [number, number], rocks?: boolean) => void;
  secretBush: (calm: [number, number]) => void;
  ropeBushes: (calm: [number, number]) => void;
  acornMeadow: (calm: [number, number]) => void;
  // ----- the boa's guards (1-9)
  guardBranch: (low?: boolean) => void;
  ropeGuard: () => void;
  trunkGuard: () => void;
  sleepingGuard: () => void;
  snakeRing: () => void;
}

type Build = (k: W1Kit) => void;
interface Version {
  id: string;
  build: Build;
  /** a pool body: no stage uses it twice (CooldownQueue) */
  pool?: string;
  /** the roll's rhythm this version belongs to (a roll draws one rhythm, and its tagged sections follow it); untagged: any roll */
  beat?: string;
}
type Table = Partial<Record<Slot, Version[]>> & { rhythms?: readonly string[] };

// ---------------------------------------------------------------- picking ----------------------------------------------------------------

/** a stream of its own for the picks (mulberry32 on the stage and the layout number), so the stage's own dice are untouched */
function pickStream(stage: string, seed: number): Rng {
  let h = 2166136261 >>> 0;
  for (const ch of `w1:${stage}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  let a = (h ^ Math.imul(seed >>> 0, 2654435761)) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** the versions this roll of the stage uses, one per section that has versions */
export function w1Pick(stage: W1Stage, seed: number): Partial<Record<Slot, string>> {
  const table = SECTIONS[stage];
  const rng = pickStream(stage, seed);
  const used = new CooldownQueue<string>(8);
  const out: Partial<Record<Slot, string>> = {};
  // the roll's rhythm first (hops, bounces, swings...): the sections tagged with it are the ones this roll draws from, so a roll is
  // one character from end to end, and the next roll another
  const rhythm = table.rhythms?.length ? new ShuffleBag(rng, table.rhythms).draw() : undefined;
  for (const slot of SLOTS) {
    const all = table[slot];
    if (!all?.length) continue;
    const fits = all.filter((v) => !v.beat || v.beat === rhythm);
    const vs = fits.length ? fits : all;
    const bag = new ShuffleBag(rng, vs);
    // draw until a version whose pool body this stage has not used yet (a bag holds each once, so this ends)
    let v = bag.draw()!;
    for (let k = 1; k < vs.length && v.pool && !used.allows(v.pool); k++) v = bag.draw()!;
    if (v.pool) used.use(v.pool);
    out[slot] = v.id;
  }
  return out;
}

/** how much two rolls of a stage differ, 0 (the same versions throughout) to 1 (no section the same), weighted by section length */
export function w1RollDistance(stage: W1Stage, a: number, b: number): number {
  const pa = w1Pick(stage, a), pb = w1Pick(stage, b);
  let all = 0, diff = 0;
  for (const slot of SLOTS) {
    if (!pa[slot]) continue;
    const w = slot === 'finish' ? 2 : 1;
    all += w;
    if (pa[slot] !== pb[slot]) diff += w;
  }
  return all ? diff / all : 1;
}

export const isW1Stage = (id: string): id is W1Stage => /^1-[1-9]$/.test(id);

/** build this roll's version of a section (the section's tip, if any, is the caller's: it comes first in every version) */
export function w1Section(k: W1Kit, stage: W1Stage, slot: Slot, seed: number): string {
  const id = w1Pick(stage, seed)[slot];
  const v = SECTIONS[stage][slot]?.find((s) => s.id === id);
  if (!v) throw new Error(`no ${slot} version for ${stage}`);
  v.build(k);
  return v.id;
}

/**
 * the finish's pieces drawn from a shuffle bag until the quick player's clock reaches `until` (a flag after every `flagEvery`), after
 * `lead` if given (a first piece that keeps a new tip in the finish clear of the twist's)
 */
function fillTo(k: W1Kit, until: number, lead: Build | null, pieces: Build[], flagEvery = 3, cap = 24) {
  const bag = new ShuffleBag(k.R.f, pieces.map((_, i) => i));
  let n = 0;
  lead?.(k);
  while (k.expert < until && n < cap) {
    pieces[bag.draw()!](k);
    n++;
    if (n % flagEvery === 0) k.flag();
  }
}

// ---------------------------------------------------------------- the versions ----------------------------------------------------------------

/**
 * The shared pool for 1-1, 1-2 and 1-5 (the three looked alike: their whole action mix over 0.78): bodies built from World 1's hop
 * and bounce pieces, each with its own rhythm. A stage takes its Develop and its Twist from here (never the same body twice), and each
 * stage's own lesson piece stays in its sections, so the three keep their characters.
 */
const POOL = {
  /** stepping stones and low stumps: a long run of hops */
  stones: (k: W1Kit) => {
    k.pillars(k.R.pick([[40, 80, 110, 70], [50, 100, 70, 40], [40, 90, 60, 100]]), [0.55, 0.68], false, true);
    k.lowStumps();
    k.busy(1, ['dip']);
  },
  /** bounces: the high road over busy ground, a dip, the high road again */
  bounces: (k: W1Kit) => {
    k.highRoadOver();
    k.busy(1, ['dip']);
    k.highRoadOver();
  },
  /** hop, dip, hop: rocks and dips one after the other, a short rest after each three */
  hopDip: (k: W1Kit) => {
    k.busy(3, ['log', 'dip']);
    k.busy(3, ['dip', 'log']);
  },
} as const;

const SECTIONS: Record<W1Stage, Table> = {
  // 1-1 Into the Canopy: run and jump. The stones are its lesson (Develop), the second jump its twist; the finish practises both.
  // Three rhythms: hops along stones and dips; bounces up walls and hops along high branches; the second jump over wide gaps.
  '1-1': {
    rhythms: ['hop', 'bounce', 'mix'],
    develop: [
      {
        id: 'stones', build: (k) => {
          // (the second jump is not taught yet: every stone one plain jump up, every gap a hop deep)
          k.pillars([60, 110, 60], [0.5, 0.62], false, true);
          k.busy(k.R.i(1, 2));
          k.pillars(k.R.pick([[40, 80, 110, 70], [50, 100, 70, 40], [40, 90, 60, 100]]), [0.55, 0.68], false, true);
          k.mushroomCache();
          k.dip();
          k.pillars([60, 30, 90, 60], [0.58, 0.7], false, true);
        },
      },
      {
        id: 'stumpStones', pool: 'stones', build: (k) => {
          k.pillars([60, 110, 60], [0.5, 0.62], false, true);
          k.lowStumps();
          k.busy(2, ['dip']);
          k.mushroomCache();
          POOL.stones(k);
        },
      },
      {
        id: 'stoneDips', pool: 'hopDip', build: (k) => {
          k.pillars([60, 110, 60], [0.5, 0.62], false, true);
          POOL.hopDip(k);
          k.mushroomCache();
          k.lowStumps();
        },
      },
    ],
    twist: [
      {
        // three soft gaps, each wider, then level stones far apart: the second jump across, never up
        id: 'gaps', beat: 'mix', build: (k) => {
          k.practiceShelf();
          k.gapRun([k.reachTwo * 0.62, k.reachTwo * 0.72, k.reachTwo * 0.82], [220, 300]);
          k.run(k.R.r(200, 260));
          k.pillars([60, 70, 50], [0.6, 0.72], true, true);
        },
      },
      {
        // the second jump high up: a mushroom to branches over the ground, the gaps between them for the second jump
        // (the bounce's tip a good way after the second jump's, so Dot's two lines are not on top of each other)
        id: 'highLeaps', beat: 'bounce', build: (k) => {
          k.practiceShelf();
          k.gapRun([k.reachTwo * 0.62], [200, 260]);
          k.pillars([60, 70, 50], [0.6, 0.72], true, true);
          k.busy(2, ['leap', 'dip']);
          k.highLeaps(3, true, true);
          k.highLeaps(4, true);
        },
      },
      {
        // the second jump from stone to stone: two runs of level stones far apart
        id: 'stoneLeaps', beat: 'hop', build: (k) => {
          k.practiceShelf();
          k.gapRun([k.reachTwo * 0.62, k.reachTwo * 0.72], [200, 260]);
          k.pillars([60, 70, 50], [0.6, 0.72], true, true);
          k.busy(2, ['leap', 'dip']);
          k.pillars([50, 60, 60, 50], [0.6, 0.72], true, true);
        },
      },
    ],
    finish: [
      {
        // bounce and hop: up a wall, down off it, a dip or a rock, the next wall
        id: 'hopBounce', beat: 'mix', build: (k) => fillTo(k, k.EXPERT - 10, null, [
          (k) => k.bounceWall(true, false),
          (k) => { k.bounceWall(true, false); k.run(k.R.r(60, 90)); k.logHop(); },
          (k) => { k.bounceWall(true, false); k.leap(); },
        ]),
      },
      {
        // up and along: the high branches, one run after another, the second jump in some of them
        id: 'bounceRun', beat: 'bounce', build: (k) => fillTo(k, k.EXPERT - 10, null, [
          (k) => k.highLeaps(k.R.i(4, 5), k.R.chance(0.5), true),
          (k) => { k.highLeaps(3, false, true); k.bounceWall(true); },
          (k) => k.highLeaps(5, true, true),
        ]),
      },
      {
        // stones and dips: hops up the stones, low stumps, rocks and dips
        id: 'stoneRoad', beat: 'hop', build: (k) => fillTo(k, k.EXPERT - 10, null, [
          (k) => POOL.stones(k),
          (k) => k.busy(3, ['log', 'dip', 'leap']),
          (k) => { k.lowStumps(); k.pillars(k.R.pick([[50, 80, 60, 70], [60, 70, 50, 80]]), [0.55, 0.7], true, true); },
        ]),
      },
    ],
  },
  // 1-2 The Petal Trail: the petals show the way, up and down. Every roll climbs the stairs to the hidden shelf (World 1's note waits
  // there); the rest is the roll's rhythm: stairs and stones, bounces up to the branches, or the trail swapping high and low.
  '1-2': {
    rhythms: ['stairs', 'bounce', 'mix'],
    start: [
      { id: 'stumps', beat: 'stairs', build: (k) => k.lowStumps() },
      { id: 'perch', beat: 'bounce', build: (k) => { k.petalPerch(); k.petalPerch(); } },
      { id: 'perchStumps', beat: 'mix', build: (k) => { k.lowStumps(); k.petalPerch(); } },
    ],
    develop: [
      { id: 'stairs', beat: 'stairs', pool: 'stones', build: (k) => { k.trailUp(false); POOL.stones(k); k.trailUp(true); } },
      { id: 'tree', beat: 'bounce', pool: 'bounces', build: (k) => { k.petalClimb(); k.highLeaps(3, false, true); k.trailUp(true); } },
      { id: 'climb', beat: 'mix', build: (k) => { k.petalClimb(); k.trailUp(true); k.bounceWall(true, false); k.petalPerch(); } },
    ],
    twist: [
      { id: 'split', beat: 'mix', build: (k) => k.splitTrail() },
      {
        // high on the branches over the ground, low over the dips, high again
        id: 'highLow', beat: 'bounce', build: (k) => { k.highLeaps(3, false, true); k.busy(2, ['dip']); k.highLeaps(4, false); k.busy(1, ['dip']); },
      },
      {
        // low along the stones, up the stairs, low again
        id: 'stairsLow', beat: 'stairs', pool: 'hopDip', build: (k) => { POOL.hopDip(k); k.trailUp(false); k.lowStumps(); k.busy(2, ['dip', 'log']); },
      },
    ],
    finish: [
      {
        id: 'swap', beat: 'mix', build: (k) => fillTo(k, k.EXPERT - 10, null, [
          (k) => k.splitTrail(),
          (k) => k.bounceWall(true, false),
          (k) => { k.bounceWall(true, false); k.petalPerch(); },
        ]),
      },
      {
        id: 'bounces', beat: 'bounce', build: (k) => fillTo(k, k.EXPERT - 10, null, [
          (k) => k.petalClimb(),
          (k) => k.highLeaps(k.R.i(3, 5), false, true),
          (k) => { k.bounceWall(true); k.petalPerch(); },
        ]),
      },
      {
        id: 'stairs', beat: 'stairs', build: (k) => fillTo(k, k.EXPERT - 10, null, [
          (k) => k.trailUp(false),
          (k) => POOL.stones(k),
          (k) => { k.lowStumps(); k.dipArc(); k.busy(2, ['log', 'dip']); },
        ]),
      },
    ],
  },
  // 1-3 Branch Snakes: punching. The roll's rhythm: snakes up on the branches (punch or hop them over the moss), snakes on the
  // ground between rocks and dips, or the two mixed with low ledges and bounces. Every twist starts at a rope with its guard.
  '1-3': {
    rhythms: ['branches', 'ground', 'mix'],
    start: [
      { id: 'walk', beat: 'ground', build: (k) => k.snakeWalk(2) },
      { id: 'branch', beat: 'branches', build: (k) => { k.snakeWalk(1); k.snakeBranches(2, k.G - 120); } },
      { id: 'ledge', beat: 'mix', build: (k) => { k.snakeLedge(); k.busy(1); k.snakeLedge(); } },
    ],
    develop: [
      { id: 'branches', beat: 'branches', build: (k) => { k.snakeBranches(3, k.G - 130); k.busy(1); k.lowStumps(); k.snakeBranches(4, k.G - 150); } },
      { id: 'ground', beat: 'ground', build: (k) => { k.snakeBranches(3, k.G - 130); k.snakeWalk(2); k.lowStumps(); k.snakeWalk(2); } },
      { id: 'ledges', beat: 'mix', build: (k) => { k.snakeBranches(3, k.G - 130); k.snakeLedge(); k.busy(1); k.snakeLedge(); k.snakeBranches(3, k.G - 150); } },
    ],
    twist: [
      { id: 'ropeBranches', beat: 'branches', build: (k) => { k.ropeGap(true, false, true); k.snakeBranches(3, k.G - 140); k.ropeGap(true, true, true); } },
      { id: 'ropeWalk', beat: 'ground', build: (k) => { k.ropeGap(true, false, true); k.snakeWalk(1); k.ropeGap(true, true, true); } },
      { id: 'ropeLedge', beat: 'mix', build: (k) => { k.ropeGap(true, false, true); k.bounceWall(true, false); k.snakeLedge(); k.ropeGap(true, true, true); } },
    ],
    finish: [
      {
        id: 'branches', beat: 'branches', build: (k) => fillTo(k, k.EXPERT - 10, null, [
          (k) => k.snakeBranches(k.R.i(3, 4), k.G - Math.round(k.R.r(120, 160))),
          (k) => { k.snakeBranches(3, k.G - 130); k.dip(); },
          (k) => { k.lowStumps(); k.snakeBranches(4, k.G - 150); },
        ]),
      },
      {
        id: 'ground', beat: 'ground', build: (k) => fillTo(k, k.EXPERT - 10, null, [
          (k) => { k.busy(1); k.snakeWalk(2); },
          (k) => { k.lowStumps(); k.snakeWalk(1); },
          (k) => { k.snakeWalk(2); k.busy(1, ['dip']); },
        ]),
      },
      {
        id: 'ledges', beat: 'mix', build: (k) => fillTo(k, k.EXPERT - 10, null, [
          (k) => { k.bounceWall(true, false); k.snakeLedge(); k.snakeLedge(); },
          (k) => k.highLeaps(5, false, true, true),
          (k) => { k.highLeaps(4, true, true, true); k.snakeWalk(1); },
        ]),
      },
    ],
  },
  '1-4': {},
  // 1-5 More Petals: everything so far, mixed. The roll's rhythm leans on one family of moves: climbs and ropes, fights, or bounces
  // and jumps (each version still asks for several moves, and the keepsake's fern tree and the creaking branches are in every roll).
  '1-5': {
    rhythms: ['climb', 'fight', 'bounce'],
    develop: [
      {
        id: 'everything', beat: 'fight', build: (k) => {
          const groups: Build[] = [
            (k) => { k.logHop(); k.fernTree(); k.dipArc(); },
            (k) => k.ropeGap(false, true, true),
            (k) => k.doubleArcs(true),
            (k) => { k.dipArc(); k.mushroomCache(); },
            (k) => k.snakeLedge(),
          ];
          k.R.shuffle(groups).forEach((g) => g(k));
        },
      },
      {
        id: 'climbs', beat: 'climb', build: (k) => {
          k.climbWall(); k.ropeGap(false, true, true); k.logHop(); k.fernTree(); k.dipArc(); k.climbWall(); k.snakeLedge(); k.doubleArcs(true); k.dipArc(); k.mushroomCache();
        },
      },
      {
        id: 'bounces', beat: 'bounce', pool: 'bounces', build: (k) => {
          k.highLeaps(3, true, true); k.ropeGap(false, true, true); k.logHop(); k.fernTree(); k.dipArc(); k.bounceWall(); k.snakeLedge(); k.doubleArcs(true); k.dipArc(); k.mushroomCache();
        },
      },
    ],
    twist: [
      { id: 'creak', beat: 'fight', build: (k) => { k.creakRun(); k.busy(1); k.creakRun(); k.dipArc(); } },
      { id: 'creakRope', beat: 'climb', build: (k) => { k.creakRun(); k.ropeGap(false, true, true); k.creakRun(); k.dipArc(); } },
      { id: 'creakHigh', beat: 'bounce', build: (k) => { k.creakRun(); k.highLeaps(3, false, true); k.creakRun(); k.dipArc(); } },
    ],
    finish: [
      {
        id: 'fights', beat: 'fight', build: (k) => fillTo(k, k.EXPERT - 22, null, [
          (k) => { k.snakeLedge(); k.dipArc(); },
          (k) => { k.snakeWalk(1); k.creakRun(); k.dipArc(); },
          (k) => { k.snakeLedge(); k.snakeWalk(2); k.dipArc(); },
        ]),
      },
      {
        id: 'climbs', beat: 'climb', build: (k) => fillTo(k, k.EXPERT - 22, null, [
          (k) => k.climbWall(),
          (k) => { k.climbWall(); k.ropeGap(false, true, true); },
          (k) => { k.creakRun(); k.dipArc(); k.climbWall(); },
        ]),
      },
      {
        id: 'bounces', beat: 'bounce', build: (k) => fillTo(k, k.EXPERT - 22, null, [
          (k) => { k.doubleArcs(true); k.bounceWall(true, false); },
          (k) => k.highLeaps(5, true, true),
          (k) => k.highLeaps(4, false, true),
        ]),
      },
    ],
  },
  '1-6': {},
  // 1-7 A Very Good Bush: hide from the eagle. The roll's rhythm: bush rows on the ground, the rope line with bushes on it, or open
  // stretches out of the eagle's sight (bounces and hops) between the watched ones. The secret bush and the acorn meadow are in every
  // roll; the finish runs a minute past the meadow.
  '1-7': {
    rhythms: ['bushes', 'rope', 'open'],
    develop: [
      {
        id: 'bushes', beat: 'bushes', build: (k) => {
          k.bushRow(3, [700, 820], ['wide', 'fern', 'tall'], [6.5, 8], true); k.secretBush([6.5, 8]); k.lowStumps();
          k.bushRow(3, [740, 880], ['fern', 'tall', 'wide'], [6, 7.5], true);
        },
      },
      {
        id: 'rope', beat: 'rope', build: (k) => {
          k.bushRow(2, [700, 820], ['wide', 'fern'], [6.5, 8], true); k.secretBush([6.5, 8]); k.bounceWall(true, false);
          k.bushRow(2, [740, 880], ['tall', 'wide'], [6, 7.5], true); k.bounceWall(true, false);
        },
      },
      {
        id: 'open', beat: 'open', build: (k) => {
          k.bushRow(2, [700, 820], ['wide', 'tall'], [6.5, 8], true); k.secretBush([6.5, 8]); k.highLeaps(4, false, true);
          k.bushRow(2, [740, 880], ['fern', 'wide'], [6, 7.5], true); k.highLeaps(4, true, true);
        },
      },
    ],
    finish: [
      {
        id: 'bushes', beat: 'bushes', build: (k) => fillTo(k, k.EXPERT + 62, null, [
          (k) => k.bushRow(3, [720, 880], ['tall', 'wide', 'fern'], [6, 7.5], true),
          (k) => k.ropeBushes([6, 7]),
          (k) => { k.bushRow(2, [720, 860], ['fern', 'tall'], [6, 7.5], true); k.lowStumps(); },
        ], 1, 12),
      },
      {
        // the eagle's stretches with a wall to bounce up between them, out of its sight
        id: 'rope', beat: 'rope', build: (k) => fillTo(k, k.EXPERT + 62, null, [
          (k) => { k.ropeBushes([6, 7]); k.bounceWall(true, false); },
          (k) => { k.bounceWall(true, false); k.bushRow(2, [720, 860], ['wide', 'tall'], [6, 7.5], true); k.bounceWall(true, false); },
          (k) => { k.bounceWall(true, false); k.bounceWall(true, false); },
        ], 1, 12),
      },
      {
        id: 'open', beat: 'open', build: (k) => fillTo(k, k.EXPERT + 62, null, [
          (k) => { k.bushRow(2, [720, 860], ['tall', 'fern'], [6, 7.5], true); k.highLeaps(5, false, true); },
          (k) => { k.highLeaps(4, true, true); k.highLeaps(4, false, true); },
          (k) => { k.highLeaps(5, true, true); k.bushRow(2, [720, 860], ['wide', 'tall'], [6, 7.5], true); },
        ], 1, 12),
      },
    ],
  },
  '1-8': {},
  // 1-9 The Boa's Branches: fighting on the move. The roll's rhythm: guards on the branches over the moss, guards up the trunks on the
  // way over walls, or snakes on the high branches a mushroom bounces him up to. The ring is every roll's twist; the sleeping guard
  // keeps its seed in every roll.
  '1-9': {
    rhythms: ['branch', 'climb', 'leap'],
    develop: [
      { id: 'branches', beat: 'branch', build: (k) => { k.ropeGuard(); k.guardBranch(true); k.flag(); k.sleepingGuard(); k.snakeWalk(1); k.guardBranch(true); } },
      { id: 'trunks', beat: 'climb', build: (k) => { k.trunkGuard(); k.snakeWalk(1); k.flag(); k.sleepingGuard(); k.trunkGuard(); k.snakeWalk(2); } },
      { id: 'leaps', beat: 'leap', build: (k) => { k.highLeaps(4, false, true, true); k.guardBranch(true); k.flag(); k.sleepingGuard(); k.highLeaps(5, false, true, true); } },
    ],
    twist: [
      { id: 'ringBranch', beat: 'branch', build: (k) => { k.snakeRing(); k.dip(); k.guardBranch(true); } },
      { id: 'ringClimb', beat: 'climb', build: (k) => { k.snakeRing(); k.trunkGuard(); } },
      { id: 'ringLeap', beat: 'leap', build: (k) => { k.snakeRing(); k.highLeaps(3, true, true); } },
    ],
    finish: [
      {
        id: 'branches', beat: 'branch', build: (k) => fillTo(k, k.EXPERT - 10, null, [
          (k) => k.guardBranch(true),
          (k) => { k.snakeBranches(3, k.G - 130); k.busy(1); },
          (k) => { k.guardBranch(true); k.snakeBranches(3, k.G - 140); },
        ], 2, 12),
      },
      {
        id: 'trunks', beat: 'climb', build: (k) => fillTo(k, k.EXPERT - 10, null, [
          (k) => { k.trunkGuard(); k.snakeWalk(1); },
          (k) => { k.snakeWalk(1); k.trunkGuard(); },
          (k) => { k.climbWall(); k.snakeWalk(2); },
        ], 2, 12),
      },
      {
        id: 'leaps', beat: 'leap', build: (k) => fillTo(k, k.EXPERT - 10, null, [
          (k) => k.highLeaps(5, false, true, true),
          (k) => k.highLeaps(4, true, true, true),
          (k) => { k.bounceWall(true, false); k.guardBranch(true); },
        ], 2, 12),
      },
    ],
  },
};
