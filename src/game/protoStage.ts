/**
 * protoStage — a hand-built 1-6 "First Lianas", the first stage designed the new way (2026-10-23 test, off by default).
 *
 * One idea, played in four beats (learn, develop, twist, finish), with a puzzle and two secrets:
 *   1. LEARN    two swing hollows with a soft mossy floor: a missed swing costs a few seconds, never a life;
 *   2. DEVELOP  a three-liana chain over the gorge, then climb a kapok and leap from its top to a liana only the top can reach;
 *   3. PUZZLE   the high canopy is a wall too tall to jump: push the hollow log against it and climb. Push the log the
 *               other way, under the low branch, and it reaches a hidden nook with a golden seed (secret 1);
 *   4. TWIST    the canopy road: a long branch creaks and snaps under Pokey, and two lianas hang below to catch him.
 *               A ledge far out over the forest floor holds a second seed that only the Leaf Glide (World 4) can reach:
 *               you see it now and come back for it later (secret 2);
 *   5. FINISH   four lianas home over the last gorge, to the Exit Shrine.
 *
 * Planned, details rolled (Matt's choice, 2026-10-23): the beats above are always there, in that order, and a seed (the dice) sets how
 * many vines each chain has, how far apart and how high they hang, the length of every stretch, the snakes, and the order inside a beat.
 * Every rolled piece is checked against the shared physics (protoCheck.ts) and rolled again if it fails (see protoStage.test.ts).
 */
import { fixPickups } from './flowerReach.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import type { Collectible, Enemy, LevelConfig, Platform, Rope, TreeStructure, Vine } from './types.ts';
import { JUMP_RISE, reachGlide, reachJump, SAFE } from './physics.ts';
import { HANG_DROP, ROPE_RISE, ROPE_SPEED } from './rope.ts';
import { findForStage } from './finds.ts';
import type { Bush, WatchZone } from './watcher.ts';
import { catchWindow, earlyCatch, jumpGrab, jumpReaches, landWindow, leapBand, maxRise } from './protoCheck.ts';
import type { W2Decor } from './riverArt.ts';
import { driftX, gapFor, LOG_DROP, LOG_HEIGHT, logLayout, surfaceBelowBank, type RiverZone } from './river.ts';
import type { SkillId } from './skills.ts';
import type { Zone } from './zones.ts';
import type { W3Decor } from './w3Art.ts';
import type { ThornVine } from './thornVine.ts';
import { ROCK, rockFits, type RockDrop } from './rockfall.ts';
import { PATIENCE, type PatienceSpot } from './patience.ts';
import type { Nest } from './eaglet.ts';
import { DOT_HELP, type Chime, type DotKnot } from './w4Kit.ts';
import { buildWaterfallSteps } from './w4Stage43.ts';
import type { CliffNest, NestKind } from './w4Nests.ts';
import { buildLongDrop } from './w4LongDrop.ts';
import type { FruitTree, W4Extras } from './w4Play.ts';
import type { Waterfall } from './waterfalls.ts';
import type { Capuchin } from './capuchin.ts';

export const PROTO_STAGE_ID = '1-6';
/** every stage built the new way so far (behind the New stages switch): stage id -> its plan */
export type StagePlan = 'proto' | 'ctest' | '1-1' | '1-2' | '1-3' | '1-4' | '1-5' | '1-7' | '1-8' | '1-9' | '3-1' | '3-2' | '3-3' | '3-4' | '3-5' | '3-6' | '3-7' | '3-8' | '3-9' | '4-1' | '4-2' | '4-3' | '4-4' | '4-5' | '4-6' | '4-7' | '4-8';
export const HAND_STAGES: Record<string, Exclude<StagePlan, 'ctest'>> = { '1-1': '1-1', '1-2': '1-2', '1-3': '1-3', '1-4': '1-4', '1-5': '1-5', '1-6': 'proto', '1-7': '1-7', '1-8': '1-8', '1-9': '1-9', '3-1': '3-1', '3-2': '3-2', '3-3': '3-3', '3-4': '3-4', '3-5': '3-5', '3-6': '3-6', '3-7': '3-7', '3-8': '3-8', '3-9': '3-9', '4-1': '4-1', '4-2': '4-2', '4-3': '4-3', '4-4': '4-4', '4-5': '4-5', '4-6': '4-6', '4-7': '4-7', '4-8': '4-8' };

/** the hand-built 1-6 is played instead of the generated one (saved on the device; ?proto=1 also turns it on) */
export function protoStageEnabled(): boolean {
  // the stages rebuilt from the stage plan are the game's stages since 2026-10-24 (Matt tested them): `?proto=0` plays the old ones.
  // Outside a browser (the generator's own tests) the generated stages are what is being checked, so they are built there; the
  // hand-built stages have their own tests (stage1x.test.ts, protoStage.test.ts), which call buildProtoStage directly.
  if (typeof location === 'undefined') return false;
  try {
    return !/[?&]proto=0\b/.test(location.search);
  } catch {
    return true;
  }
}
/** ground height, the water line, and the height of a bank of earth */
export const G = 580;
const WATER = 730;
const BANK_H = 90;

/** the pushable hollow log */
export const LOG = { w: 220, h: 100 } as const;

/** a short line shown above Pokey the first time he passes x */
/** `text` is for screen gestures (the default), `pad` and `keys` for the on-screen pad and a keyboard */
export interface StageHint {
  x: number; text: string; pad: string; keys: string; shown?: boolean;
  /** only when Pokey is this low or lower (fell to the floor) */
  belowY?: number;
  /** only when Pokey is this high or higher (a climbing stage: the hint waits for his height, not his x) */
  aboveY?: number;
}
/** leaves drawn in front of a hidden nook; they part when Pokey comes close */
export interface LeafCover { x: number; y: number; w: number; h: number }

export interface ProtoExtras {
  hints: StageHint[];
  covers: LeafCover[];
  /** the beats, for the blueprint and the tests: [x0, x1, name] */
  beats: Array<[number, number, string]>;
  /** pickups the last pass had to move to where he can get them (flowerReach.ts): a hand-built stage should need none */
  movedPickups?: number;
  /** hollows in climb trunks (1-4): drawn on the trunk at this height, glowing once he is close */
  hollows?: Array<{ x: number; y: number }>;
  /**
   * a ring of branches walled at its far end (1-9): snakes drop from the canopy in waves when he comes in, and the wall opens when
   * every one of them is down. Each drop names the surface it lands on. In 3-9's ring the prowlers leap in out of the dark instead.
   */
  ring?: { x0: number; x1: number; wallId: number; waves: Array<Array<{ x: number; surface: number; kind: 'snake' | 'boa' | 'ocelot' | 'jaguar' }>> };
  /** the collapse that chases him along the long branch (1-8: chase.ts) */
  chase?: import('./chase.ts').ChasePlan;
  /** bushes to hide in, and the stretches the eagle watches (1-7: watcher.ts) */
  bushes?: import('./watcher.ts').Bush[];
  watch?: import('./watcher.ts').WatchZone[];
  /** World 4's rocks, patience spots, falls and pools, chimes, Dot's knots, capuchins and fruit (w4Play.ts) */
  w4?: import('./w4Play.ts').W4Extras;
  /** World 3's sleeping thorn vines (3-5: thornVine.ts) */
  thorns?: import('./thornVine.ts').ThornVine[];
  /** World 3's painted dressing: stalactites, glowworm threads, ferns, the grotto mouth (protoStage.ts, drawn by w3Art.ts) */
  w3decor?: import('./w3Art.ts').W3Decor[];
  /** World 2's painted dressing: reeds, lily pads, the village's doors and signs, and its folk (w2Stages.ts, drawn by riverArt.ts) */
  decor?: import('./riverArt.ts').W2Decor[];
  /** 2-6: the climbs are the village's ladders (riverArt.ts drawLadder), not trunks */
  ladders?: boolean;
  /** 2-6: the face of the river bank the village is dug into, behind the whole climb (drawn by protoArt.ts drawEarthWall) */
  bankWall?: { x0: number; x1: number; top: number; bottom: number };
  /** the control test's mix: the seed and the stretches it drew, in order (logged when the run starts, so any run can be built again) */
  mix?: string;
  /** moves this stage lends him whether or not he has learned them yet (the control test's rope stretch needs Shimmy Rope) */
  grant?: SkillId[];
}

/** a small seeded random stream (mulberry32): the same seed always builds the same stage */
export function stream(seed: number) {
  let a = (seed * 2654435761) >>> 0;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    f: next,
    /** a number between a and b */
    r: (a: number, b: number) => a + (b - a) * next(),
    /** a whole number from a to b */
    i: (a: number, b: number) => a + Math.floor(next() * (b - a + 1)),
    chance: (p: number) => next() < p,
    pick: <T,>(xs: readonly T[]) => xs[Math.floor(next() * xs.length)],
    shuffle: <T,>(xs: T[]) => {
      for (let k = xs.length - 1; k > 0; k--) {
        const j = Math.floor(next() * (k + 1));
        [xs[k], xs[j]] = [xs[j], xs[k]];
      }
      return xs;
    },
  };
}

/**
 * Hearts on the harder stretches (Matt, 2026-10-24): beside every second checkpoint flag from the second on, a heart floats a jump
 * up over the flag, so a player who has been knocked about through the middle of a stage can top up before what comes next.
 * Returns the next free pickup id.
 */
export function heartsAtFlags(C: Collectible[], flags: Array<{ x: number; y: number }>, cid: number): number {
  const sorted = [...flags].sort((a, b) => a.x - b.x || b.y - a.y);
  sorted.forEach((f, i) => {
    if (i % 2 === 0) return;
    const hx = f.x + 70, hy = f.y - 60;
    // never on top of another pickup
    if (C.some((c) => Math.hypot(c.x - hx, c.y - hy) < 40)) return;
    C.push({ id: cid++, type: 'heart', x: hx, y: hy, collected: false, bobPhase: hx * 0.01 });
  });
  return cid;
}

/** the floor under a teaching swing: soft moss, high enough above the water that a miss costs a hop, not a life */
const HOLLOW_Y = 710;
/** the step out of a soft pit: the pit is 130 deep and one jump rises about 108, so 55 up and then 75 up, each an easy single jump */
const PIT_STEP = 55;
/** the tallest stump one jump from the ground climbs with room to spare */
const STUMP_REACH = 90;
/** how high a double jump lifts him (computed once from the physics) */
const RISE = maxRise();

/**
 * 1-2 The Petal Trail asks for 80 petals, not the generated stage's 33 (Matt, 2026-10-23): the trail holds about half again as many, so he
 * has to follow most of it, high and low, to open the sanctuary.
 */
export const PETAL_GOAL_12 = 80;
/** 1-5 More Petals asks for 90 (a step up from 1-2's 80), and holds about one and a half times that */
export const PETAL_GOAL_15 = 90;
/** 1-9 The Boa's Branches asks for 16 (24 to 31 to fight, the boas taking three hits each): two in three, not the generated 14 */
export const GUARD_GOAL_19 = 16;
/** 3-3 asks for 12 prowlers driven off (the stage holds about one and a half times that) */
export const PROWLER_GOAL_33 = 12;
/** 3-9 The Prowler's Ring: how many prowlers to drive off (the ring's own waves count too, on top of these) */
export const PROWLER_GOAL_39 = 14;
/** 3-6 asks for 5 of Grandma's things (the stage hides 7) */
export const GRANDMA_GOAL_36 = 5;
/** 3-7 Which Fern?: how many more of Grandma's things */
export const GRANDMA_GOAL_37 = 6;
/** 4-8 Nests on the Cliff asks for 8 chicks freed (the cliff holds 12 nests, one and a half times that) */
export const NEST_GOAL_48 = 8;
/** 4-8's falls: how far onto the shelf the water lands (the boulder's last stretch), and how far above the shelf it pours from */
const FALL_LIP = 60;
const FALL_HEAD = 280;
/** 1-3 Branch Snakes asks for 16 snakes, not 10: the stage holds about 25, so the punching it teaches is most of the way through */
export const SNAKE_GOAL_13 = 16;

/** the stage's length target: a quick, sure player (Matt) needs at least this long (s) */
export const EXPERT_SECONDS = 140;
/**
 * Each stage's own length (s, a quick, sure player), from World 4 on (Matt, 2026-10-25: "2 mins is the minimum. Stages should vary and
 * can go as long as 5 plus minutes"). A slower player takes about half as long again. A stage not listed takes EXPERT_SECONDS.
 */
export const STAGE_SECONDS: Record<string, number> = {
  '4-1': 120, // the climb (climbs count 20 s short of the others)
  '4-2': 180,
  '4-3': 210,
  '4-4': 170,
  '4-5': 140, // Matt: leave as is
  '4-6': 240,
  '4-7': 270, // the long glide down
  '4-8': 180,
  '4-9': 300, // the Aerie: the long climb before the Sky Sovereign
};
export const stageSeconds = (id: string): number => STAGE_SECONDS[id] ?? EXPERT_SECONDS;
/** 4-8's length (STAGE_SECONDS: about three minutes for a quick player) */
export const W48_SECONDS = stageSeconds('4-8');

export type PieceKind = 'rest' | 'hollow' | 'gorge' | 'kapok' | 'log' | 'canopy' | 'highrun' | 'stumps' | 'snakes' | 'river' | 'pond' | 'turtles' | 'cages';

/**
 * The hand-built 1-6, planned and rolled: the stage is always the same chain of beats (learn, develop, puzzle, twist, develop again,
 * finish), and the dice (`seed`) decide how many vines a chain has, how far apart and how high they hang, how long each stretch is,
 * where the snakes sit, the order of the pieces inside a beat, and the dressing. Every rolled piece is checked against the physics
 * (protoCheck.ts) and rolled again if a swing or a landing would not work.
 */
export function buildProtoStage(config: LevelConfig, seed = 1, plan: StagePlan = 'proto'): GeneratedStage & { proto: ProtoExtras } {
  if (plan === '1-4') return buildKapok(config, seed);
  if (plan === '3-4') return buildKapok(config, seed, false, true);
  if (plan === '4-1') return buildKapok(config, seed, false, false, true);
  if (plan === '4-3') return buildWaterfallSteps(config, seed);
  if (plan === '4-6') return buildKapok(config, seed, false, false, false, true);
  if (plan === '4-7') return buildLongDrop(config, seed);
  if (plan === '1-8') return buildLongBranch(config, seed);
  const R = stream(seed);
  const P: Platform[] = [];
  const V: Vine[] = [];
  const ROPES: Rope[] = [];
  const RIVERS: RiverZone[] = [];
  let MIX: string | undefined;
  const BUSHES: Bush[] = [];
  const ZONES: WatchZone[] = [];
  let RING: ProtoExtras['ring'];
  const T: TreeStructure[] = [];
  const E: Enemy[] = [];
  const C: Collectible[] = [];
  const checkpoints: Array<{ x: number; y: number; reached: boolean }> = [];
  const covers: LeafCover[] = [];
  const hints: StageHint[] = [];
  const beats: Array<[number, number, string]> = [];
  const pieces: Array<{ k: PieceKind; x0: number; x1: number }> = [];
  let pid = 1, vid = 1, tid = 1, eid = 1, cid = 1, seedN = 0;
  /** how long a quick, sure player takes (s): running at full speed, swinging at about 430 px/s, climbing at 220 px/s, pushing at 120 */
  let expert = 0;
  const RUN = 285, SWING = 430, CLIMB = 220, PUSH = 120;

  // ----- the drawing kit -----
  const bank = (x0: number, x1: number, y = G, style: Platform['style'] = 'log') => {
    const p: Platform = { id: pid++, x: x0, y, width: x1 - x0, height: BANK_H, type: 'solid', style };
    P.push(p);
    return p;
  };
  const branch = (x0: number, x1: number, y: number, type: Platform['type'] = 'solid', extra: Partial<Platform> = {}) => {
    const p: Platform = { id: pid++, x: x0, y, width: x1 - x0, height: 24, type, style: 'branch', ...extra };
    P.push(p);
    return p;
  };
  /**
   * a soft pit between two banks: a mossy floor, walled on both sides down to it. (Without the walls the floor stopped at the banks'
   * edges and there was open air under them, so walking along the floor carried him under a bank and off the end, into the water.)
   */
  const softPit = (edge: number, far: number) => {
    const wallTop = G + BANK_H;
    const wallH = HOLLOW_Y - wallTop + 4;
    P.push({ id: pid++, x: edge - 60, y: wallTop, width: 60, height: wallH, type: 'solid', style: 'moss_stone' });
    P.push({ id: pid++, x: far, y: wallTop, width: 60, height: wallH, type: 'solid', style: 'moss_stone' });
    bank(edge - 60, far + 60, HOLLOW_Y, 'moss_stone');
    // a low mossy step at the foot of the far wall: the pit is deeper than one jump rises, so without it only the second jump got him
    // out, and beginners who had not found the second jump were stuck there (the control test, 2026-10-23)
    // (a narrow pit gets its whole floor raised instead: a sliver of a step is no help)
    const sw = far - edge < 170 ? far - edge : 70;
    P.push({ id: pid++, x: far - sw, y: HOLLOW_Y - PIT_STEP, width: sw, height: PIT_STEP, type: 'solid', style: 'moss_stone' });
  };
  const block = (x0: number, x1: number, h: number) => {
    const p: Platform = { id: pid++, x: x0, y: G - h, width: x1 - x0, height: h, type: 'solid', style: 'moss_stone' };
    P.push(p);
    return p;
  };
  const liana = (x: number, topY: number, bottomY = topY + 340): Vine => {
    const v: Vine = { id: vid++, x, topY, bottomY, swaySpeed: 1.1, swayPhase: (x * 0.013) % 6.28, vineType: 'swing_liana', isSwingingVine: true };
    V.push(v);
    return v;
  };
  const trunk = (x: number, groundY: number, perchY: number) => {
    const tree: TreeStructure = { id: tid++, x, groundY, topY: perchY - 150, trunkWidth: 76, hasClimbVine: true, canopyRadius: 150 };
    T.push(tree);
    V.push({ id: vid++, x, topY: perchY - 2, bottomY: groundY - 6, swaySpeed: 0.9, swayPhase: (x * 0.007) % 6.28, vineType: 'tree_climb', treeId: tree.id });
  };
  const flower = (x: number, y: number, v: Collectible['botanicalVariant'] = 'orchid') =>
    C.push({ id: cid++, type: 'flower', botanicalVariant: v, x, y, collected: false, bobPhase: (x * 0.031) % 6.28 });
  const row = (x0: number, x1: number, y: number, n: number, v: Collectible['botanicalVariant'] = 'orchid') => {
    for (let i = 0; i < n; i++) flower(x0 + ((x1 - x0) * i) / Math.max(1, n - 1), y, v);
  };
  const arc = (x0: number, x1: number, yTop: number, n: number, v: Collectible['botanicalVariant'] = 'hibiscus') => {
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      flower(x0 + (x1 - x0) * t, yTop + 70 * (1 - Math.sin(Math.PI * t)), v);
    }
  };
  const snake = (x: number, surface: number, range = 90, asleep = false) => {
    E.push({
      asleep,
      id: eid++, type: 'snake', x, y: surface - 14, vx: 28, vy: 0, width: 38, height: 22, hp: 1, maxHp: 1, facing: R.chance(0.5) ? 1 : -1,
      patrolMinX: x - range / 2, patrolMaxX: x + range / 2, attackCooldown: 2, telegraphTimer: 0, isAttacking: false,
      animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0,
    } as Enemy);
  };
  const goldenSeed = (x: number, y: number) => {
    seedN++;
    C.push({ id: cid++, type: 'seed', x, y, collected: false, bobPhase: seedN, findId: `seed-${seedN}` });
  };
  const hint = (x: number, text: string, pad = text, keys = text, belowY?: number) => hints.push({ x, text, pad, keys, belowY });
  const said = new Set<string>();
  const once = (key: string, f: () => void) => {
    if (said.has(key)) return;
    said.add(key);
    f();
  };

  // ----- the ground: the cursor x is the open end of the bank Pokey is on (always at ground level G) -----
  let bankFrom = 0;
  let x = 0;
  const run = (len: number) => { x += len; };
  /** end the bank here (a gap or a wall follows) */
  const close = () => {
    if (x - bankFrom > 1) bank(bankFrom, x);
  };
  /** a new bank starts at `at` */
  const open = (at: number) => { bankFrom = at; x = at; };
  const flag = () => checkpoints.push({ x: x - 80, y: G, reached: false });

  // ----- the pieces. Each starts and ends on open ground at G; each one is checked as it is built. -----

  /** a stretch of forest floor with a few flowers */
  function rest(len: number) {
    const x0 = x;
    run(len);
    expert += len / RUN;
    if (len > 260) row(x0 + 80, x - 80, G - 34, Math.max(2, Math.round(len / 160)), R.pick(['orchid', 'hibiscus'] as const));
    pieces.push({ k: 'rest', x0, x1: x });
  }

  /**
   * vines over a gap. `soft`: a mossy floor below (a teaching swing). Rolled again until the jump grabs the first vine, every vine
   * catches the next, and the last one lands on the bank beyond.
   */
  function chain(n: number, soft: boolean, kind: PieceKind) {
    const x0 = x;
    run(R.r(150, 260));
    const edge = x;
    for (let tries = 0; tries < 12; tries++) {
      const easy = soft || tries > 6;
      const d0 = R.r(170, 200);
      const sp = Array.from({ length: n - 1 }, () => (easy ? R.r(300, 330) : R.r(315, 350)));
      const d1 = R.r(200, 240);
      const xs = [edge + d0];
      for (const s of sp) xs.push(xs[xs.length - 1] + s);
      const farX = xs[n - 1] + d1;
      // long vines hung from high up: whatever height a leap carries him at, the next vine is there to grab
      const tops = xs.map(() => (soft ? Math.round(R.r(190, 220)) : Math.round(R.r(140, 200))));
      const vs: Vine[] = xs.map((vx, k) => ({ id: -1 - k, x: vx, topY: tops[k], bottomY: Math.min(G + 30, tops[k] + 410), swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true }));
      const far: Platform = { id: -99, x: farX, y: G, width: 400, height: BANK_H, type: 'solid' };
      let ok = jumpGrab(edge, G, vs[0]) >= 4;
      for (let k = 0; ok && k < n - 1; k++) ok = catchWindow(vs[k], vs[k + 1]) > 0.6 && earlyCatch(vs[k], vs[k + 1]);
      if (ok) ok = landWindow(n > 1 ? vs[n - 2] : null, vs[n - 1], far) >= 8;
      if (!ok && tries < 11) continue;
      // build it
      close();
      if (soft) softPit(edge, farX);
      for (let k = 0; k < n; k++) {
        liana(xs[k], vs[k].topY, vs[k].bottomY);
        arc(k === 0 ? edge + 10 : (xs[k - 1] + xs[k]) / 2, k === n - 1 ? farX - 10 : (xs[k] + xs[k + 1]) / 2, Math.min(G - 150, vs[k].topY + 200), 4);
      }
      open(farX);
      run(R.r(120, 200));
      expert += (edge - x0) / RUN + (farX - edge) / SWING + 0.3 * n + (x - farX) / RUN;
      pieces.push({ k: kind, x0, x1: x });
      return;
    }
  }

  /** a kapok tree: climb it, step out on the branch at its top, leap for a vine that only the top can reach, swing over the gorge */
  function kapok() {
    const x0 = x;
    run(R.r(260, 360));
    const trunkX = x - R.r(150, 190);
    const perchY = Math.round(R.r(292, 312));
    const perchR = trunkX + R.r(140, 170);
    once('kapok', () => {
      hint(x0 + 40, 'That vine is too high. Climb the tree!');
      hint(x0 + 120, 'Flick up beside the trunk, keep your thumb up', 'Jump at the trunk, hold Pad up', 'Jump at the trunk, hold W or up');
    });
    for (let tries = 0; tries < 12; tries++) {
      const vx = perchR + R.r(160, 190);
      const top = Math.round(R.r(110, 135));
      const bottom = Math.min(perchY + 55, Math.floor(G - RISE - 32));
      const v: Vine = { id: -1, x: vx, topY: top, bottomY: bottom, swaySpeed: 1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true };
      const gap = Math.max(x + 380, vx + R.r(300, 340));
      const perch: Platform = { id: -2, x: trunkX - 40, y: perchY, width: perchR - trunkX + 40, height: 24, type: 'solid' };
      const far: Platform = { id: -99, x: gap, y: G, width: 400, height: BANK_H, type: 'solid' };
      const lands = landWindow(null, v, far) >= 8 && jumpGrab(perch.x + perch.width, perchY, v) >= 3;
      if (!lands && tries < 11) continue;
      trunk(trunkX, G, perchY);
      branch(perch.x, perch.x + perch.width, perchY);
      for (let i = 0; i < 4; i++) flower(trunkX, G - 70 - i * 55, 'hibiscus');
      close();
      liana(vx, top, bottom);
      arc(perch.x + perch.width, gap, top + 90, 5);
      open(gap);
      run(R.r(150, 220));
      expert += (trunkX - x0) / RUN + (G - perchY) / CLIMB + 1.2 + (gap - perch.x - perch.width) / SWING + (x - gap) / RUN;
      pieces.push({ k: 'kapok', x0, x1: x });
      return;
    }
  }

  /**
   * the fallen kapok: a wall too tall to jump, and a hollow log to push against it. Pushed the other way, against the mossy rock,
   * the log reaches a hidden nook with a golden seed. After the wall, a stretch of high canopy and a drop back to the ground.
   */
  function logPuzzle() {
    const x0 = x;
    run(R.r(140, 220));
    const rock = block(x, x + 90, 50);
    // the nook: a branch above the rock and the log's far left, hidden behind leaves (the log, against the rock, sits under it)
    const nookX = rock.x + 30;
    branch(nookX, nookX + 170, 325);
    goldenSeed(nookX + 85, 292);
    covers.push({ x: nookX - 30, y: 250, w: 230, h: 110 });
    run(90 + R.r(560, 760));
    const wallX = x;
    const logX = Math.round(R.r(rock.x + 200 + 100, wallX - LOG.w - 140));
    P.push({ id: pid++, x: logX, y: G - LOG.h, width: LOG.w, height: LOG.h, type: 'solid', style: 'log', push: { min: rock.x + rock.width, max: wallX - 55 } });
    row(logX + LOG.w + 40, wallX - 40, G - 34, 3);
    once('log', () => hint(logX - 160, 'Keep sliding into the log to push it', 'Hold the pad into the log to push it', 'Hold left or right into the log to push it'));
    close();
    // the high canopy: 230 px up (a double jump tops out near 175, plus 26 for catching the lip)
    const plateau = R.r(520, 820);
    bank(wallX, wallX + plateau, G - 230);
    row(wallX + 80, wallX + plateau - 80, G - 264, Math.round(plateau / 130));
    checkpoints.push({ x: wallX + 140, y: G - 230, reached: false });
    if (R.chance(0.6)) snake(wallX + plateau * R.r(0.55, 0.75), G - 230, 110);
    open(wallX + plateau);
    run(R.r(160, 240));
    expert += (logX - x0) / RUN + (wallX - 55 - LOG.w - logX) / PUSH + 2.5 + (x - wallX) / RUN;
    pieces.push({ k: 'log', x0, x1: x });
  }

  /**
   * the canopy road: up a trunk, along branches high over a safe forest floor. One long branch creaks and snaps, and two vines hang
   * below it to catch him. A trunk part way along climbs back up for anyone who falls. With `glideSeed`, a far ledge holds a seed
   * only the Leaf Glide reaches.
   */
  function canopy(glideSeed: boolean) {
    const x0 = x;
    run(R.r(160, 240));
    const t1 = x - 60;
    const y0 = Math.round(R.r(350, 390));
    trunk(t1, G, y0);
    for (let i = 0; i < 3; i++) flower(t1, G - 70 - i * 55, 'hibiscus');
    let bx = t1 - 50;
    const branches: Platform[] = [];
    const n = R.i(3, 5);
    const creakAt = R.i(1, n - 2);
    for (let k = 0; k < n; k++) {
      const y = k === 0 ? y0 : Math.round(Math.max(330, Math.min(410, branches[k - 1].y + R.r(-40, 40))));
      const w = k === creakAt ? R.r(400, 480) : R.r(260, 420);
      if (k === creakAt) {
        // joined to the branch before it, so he walks onto it and is standing on it when it goes
        const prev = branches[k - 1];
        const cb = branch(prev.x + prev.width, prev.x + prev.width + w, prev.y, 'fragile', { crumbleAfter: 0.55 });
        liana(cb.x + w * 0.45, prev.y - 160, prev.y + 200);
        liana(cb.x + w * 0.45 + 200, prev.y - 160, prev.y + 200);
        branches.push(cb);
        bx = cb.x + w;
        // the next branch is close enough that the second catch vine lands on it
        bx += R.r(70, 100);
        continue;
      }
      const b = branch(bx, bx + w, y);
      branches.push(b);
      if (k > 0 && k !== creakAt + 1 && R.chance(0.5)) snake(bx + w * 0.5, y, Math.min(140, w - 80));
      row(bx + 50, bx + w - 50, y - 34, Math.max(2, Math.round(w / 140)), 'hibiscus');
      bx += w + R.r(90, 140);
    }
    // the way back up, after the snapping branch
    const back = branches[creakAt + 1] ?? branches[branches.length - 1];
    trunk(back.x + Math.min(back.width - 40, 140), G, back.y);
    once('fell', () => hint(branches[creakAt].x + 100, 'Fell? Climb the next tree back up', 'Fell? Climb the next tree back up', 'Fell? Climb the next tree back up', 520));
    once('canopy', () => hint(t1 - 100, 'The canopy road'));
    const last = branches[branches.length - 1];
    x = last.x + last.width;
    if (glideSeed) {
      // out of reach from the floor (higher than a double jump lifts him), and out over a gap a double jump falls well short of
      // but the Leaf Glide crosses: the gap sits halfway between the two reaches
      const gy = Math.round(Math.min(last.y + 30, G - RISE - 30));
      const dy = last.y - gy;
      const gap = Math.round((reachJump(dy, true) + reachGlide(dy, true)) / 2);
      branch(x + gap, x + gap + 120, gy);
      goldenSeed(x + gap + 60, gy - 34);
      hint(x - 120, 'Something shiny, far away...');
      x += gap + 120 + 420;
    } else x += R.r(200, 300);
    // the forest floor under the whole road is one long safe bank (the bank before carries on under it)
    run(R.r(120, 200));
    expert += (x - x0) / RUN + (G - y0) / CLIMB + 1 + 0.35 * n;
    pieces.push({ k: 'canopy', x0, x1: x });
  }

  /** a run of vines high in the canopy: from a branch, over a safe forest floor, to a branch */
  function highRun() {
    const x0 = x;
    run(R.r(160, 220));
    const tX = x - 60;
    const y0 = Math.round(R.r(330, 370));
    trunk(tX, G, y0);
    const start = branch(tX - 50, tX + 200, y0);
    for (let tries = 0; tries < 12; tries++) {
      const n = R.i(2, 3);
      const xs = [start.x + start.width + R.r(150, 180)];
      for (let k = 1; k < n; k++) xs.push(xs[k - 1] + R.r(300, 340));
      const tops = xs.map(() => Math.round(R.r(110, 160)));
      const vs: Vine[] = xs.map((vx, k) => ({ id: -1 - k, x: vx, topY: tops[k], bottomY: Math.min(y0 + 120, tops[k] + 330), swaySpeed: 1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true }));
      const endB: Platform = { id: -99, x: xs[n - 1] + R.r(210, 240), y: Math.round(R.r(330, 380)), width: R.r(260, 360), height: 24, type: 'solid' };
      let ok = jumpGrab(start.x + start.width, y0, vs[0]) >= 3;
      for (let k = 0; ok && k < n - 1; k++) ok = catchWindow(vs[k], vs[k + 1]) > 0.6 && earlyCatch(vs[k], vs[k + 1]);
      if (ok) ok = landWindow(n > 1 ? vs[n - 2] : null, vs[n - 1], endB) >= 8;
      if (!ok && tries < 11) continue;
      for (const v of vs) liana(v.x, v.topY, v.bottomY);
      arc(start.x + start.width, endB.x, Math.min(...tops) + 160, 7);
      const eb = branch(endB.x, endB.x + endB.width, endB.y);
      row(eb.x + 40, eb.x + eb.width - 40, eb.y - 34, 2, 'hibiscus');
      // a trunk back up from the floor, for a missed vine
      trunk(xs[Math.min(1, n - 1)] + 60, G, y0 + 40 > 420 ? 420 : y0 + 40);
      branch(xs[Math.min(1, n - 1)] + 20, xs[Math.min(1, n - 1)] + 200, y0 + 40 > 420 ? 420 : y0 + 40);
      x = eb.x + eb.width + R.r(150, 250);
      expert += (tX - x0) / RUN + (G - y0) / CLIMB + 1 + (endB.x - start.x - start.width) / SWING + 0.3 * n + (x - endB.x) / RUN;
      pieces.push({ k: 'highrun', x0, x1: x });
      return;
    }
  }

  /** stumps and mossy rocks to hop up and over */
  function stumps() {
    const x0 = x;
    run(R.r(120, 200));
    const n = R.i(3, 5);
    let h = 0;
    let gap = 0;
    for (let k = 0; k < n; k++) {
      h = Math.max(50, Math.min(150, h + R.pick([50, 60, 70, -50] as const)));
      const w = R.r(90, 150);
      const top = k === 0 ? 50 : h;
      // too tall to reach from the ground with one jump: a low step in the gap before it, against its side, so dropping into the gap
      // is never a wall that only the second jump climbs (beginners gave up there, the control test, 2026-10-23)
      if (top > STUMP_REACH && gap > 0) block(x - Math.round(gap / 2), x, Math.max(40, top - 70));
      block(x, x + w, top);
      flower(x + w / 2, G - top - 34, 'orchid');
      gap = R.r(60, 120);
      run(w + gap);
    }
    run(R.r(80, 160));
    expert += (x - x0) / 240;
    pieces.push({ k: 'stumps', x0, x1: x });
  }

  /** a stretch with snakes on it (punch them, or hop them) */
  function snakes() {
    const x0 = x;
    const len = R.r(700, 1000);
    run(len);
    const m = R.i(1, 2);
    for (let k = 0; k < m; k++) snake(x0 + len * (0.35 + 0.35 * k) + R.r(-40, 40), G, 120);
    row(x0 + 80, x - 80, G - 34, Math.round(len / 180));
    expert += len / RUN + 1.5 * m;
    pieces.push({ k: 'snakes', x0, x1: x });
  }

  // ----- the plan: always the same beats, the dice fill them in -----
  const beat = (name: string, f: () => void) => {
    const b0 = x;
    f();
    beats.push([b0, x, name]);
  };
  const mixed = (...fs: Array<() => void>) => R.shuffle(fs).forEach((g) => g());

  /**
   * gaps to jump across, each wider than the last, over a soft mossy floor (a miss costs a hop back up, never a life):
   * half and three quarters of a single jump, then two that need the second jump
   */
  function gaps() {
    const x0 = x;
    run(R.r(200, 260));
    const one = reachJump(0, false), two = reachJump(0, true);
    for (const w of [one * 0.5, one * 0.75, two * 0.7, two * 0.85]) {
      const edge = x;
      close();
      const far = Math.round(edge + w);
      softPit(edge, far);
      flower(edge + w / 2, G - 120, 'hibiscus');
      open(far);
      run(R.r(260, 320));
    }
    expert += (x - x0) / RUN + 2;
    pieces.push({ k: 'stumps', x0, x1: x });
  }

  /** a tree to climb all the way up, and back down: flowers on the trunk and on the branch at the top */
  function climbTree() {
    const x0 = x;
    run(R.r(300, 360));
    const tX = x - 150;
    const perchY = 300;
    trunk(tX, G, perchY);
    branch(tX - 40, tX + 220, perchY);
    for (let i = 0; i < 4; i++) flower(tX, G - 70 - i * 60, 'hibiscus');
    row(tX + 60, tX + 190, perchY - 34, 2, 'orchid');
    run(R.r(200, 260));
    expert += (x - x0) / RUN + (2 * (G - perchY)) / CLIMB;
    pieces.push({ k: 'kapok', x0, x1: x });
  }

  /**
   * stepping stones: mossy pillars standing in a soft pit, at the heights given (px above the ground), each gap a share of what a jump
   * between those heights can reach (`share` of a single jump, or of a double jump when `dbl`). Lands on open ground after the last.
   */
  function pillars(heights: number[], share: [number, number], dbl = false) {
    const x0 = x;
    run(R.r(140, 200));
    const edge = x;
    close();
    let px = edge, prevTop = G;
    const tops: number[] = [];
    for (const h of heights) {
      const top = G - h;
      const gap = Math.round(reachJump(prevTop - top, dbl) * R.r(share[0], share[1]));
      const w = Math.round(R.r(110, 160));
      px += gap;
      P.push({ id: pid++, x: px, y: top, width: w, height: HOLLOW_Y - top + 10, type: 'solid', style: 'moss_stone' });
      flower(px + w / 2, top - 34, 'orchid');
      tops.push(top);
      px += w;
      prevTop = top;
    }
    const far = Math.round(px + reachJump(prevTop - G, dbl) * R.r(share[0], share[1]));
    softPit(edge, far);
    open(far);
    run(R.r(160, 240));
    expert += (x - x0) / RUN + 0.6 * heights.length;
    pieces.push({ k: 'stumps', x0, x1: x });
  }

  /** a mushroom that bounces Pokey up to a high branch nobody can jump to: a cache of petals and a golden seed (1-1's secret) */
  function mushroomCache() {
    const x0 = x;
    run(R.r(180, 240));
    const mx = x;
    P.push({ id: pid++, x: mx, y: G - 30, width: 70, height: 30, type: 'bouncy' });
    // higher than a double jump reaches from the ground, so only the mushroom gets him there
    const by = Math.round(G - RISE - 70);
    branch(mx - 40, mx + 230, by);
    row(mx + 10, mx + 200, by - 34, 4, 'hibiscus');
    goldenSeed(mx + 150, by - 70);
    run(R.r(320, 380));
    expert += (x - x0) / RUN + 1.5;
    pieces.push({ k: 'rest', x0, x1: x });
  }

  /**
   * the high road: a mushroom bounces him up onto a run of branches with small gaps between them (flowers along the top). Falling off
   * only drops him onto the ground path below, which runs the same way, so the high road is a bonus, never a trap.
   */
  function highRoad() {
    const x0 = x;
    run(R.r(160, 220));
    P.push({ id: pid++, x: x, y: G - 30, width: 70, height: 30, type: 'bouncy' });
    const y = Math.round(G - R.r(170, 200));
    let bx = x + 40;
    const n = R.i(3, 5);
    for (let k = 0; k < n; k++) {
      const w = Math.round(R.r(170, 260));
      branch(bx, bx + w, y);
      row(bx + 30, bx + w - 30, y - 34, 2, 'hibiscus');
      bx += w + Math.round(reachJump(0, false) * R.r(0.4, 0.6));
    }
    x = bx + R.r(100, 160);
    expert += (x - x0) / RUN + 1.2;
    pieces.push({ k: 'highrun', x0, x1: x });
  }

  if (plan === '1-1') {
    // 1-1 Into the Canopy: run and jump. Taught over soft moss, tested on stepping stones at three heights, and twisted at the end
    // into gaps only the second jump crosses. The touch coach teaches the gestures at the start (engine.ts), so the hints come later.
    beat('Learn: run and jump', () => {
      rest(R.r(700, 850));
      stumps();
      rest(R.r(250, 350));
      hint(x + 40, 'Jump the little gaps', 'Jump the little gaps', 'Jump the little gaps');
      const one = reachJump(0, false);
      for (const w of [one * 0.35, one * 0.45, one * 0.55]) {
        const edge = x;
        close();
        const far = Math.round(edge + w);
        softPit(edge, far);
        open(far);
        run(R.r(220, 300));
      }
      flag();
    });
    beat('Test: the stepping stones', () => {
      hint(x + 60, 'Hop from stone to stone', 'Hop from stone to stone', 'Hop from stone to stone');
      pillars([60, 120, 60], [0.5, 0.62]);
      rest(R.r(250, 350));
      pillars(R.shuffle([40, 100, 140, 80]), [0.55, 0.68]);
      mushroomCache();
      pillars([90, 30, 120, 60], [0.58, 0.7]);
      flag();
    });
    beat('Twist: the second jump', () => {
      hint(x + 60, 'Flick up again in the air to jump twice', 'Press Jump again in the air', 'Press Space again in the air');
      const two = reachJump(0, true);
      for (const w of [two * 0.62, two * 0.72, two * 0.82]) {
        run(R.r(220, 300));
        const edge = x;
        close();
        const far = Math.round(edge + w);
        softPit(edge, far);
        flower(edge + w / 2, G - 150, 'hibiscus');
        open(far);
      }
      run(R.r(200, 260));
      pillars([60, 140], [0.7, 0.8], true);
      flag();
    });
    beat('Finish', () => {
      // more of the same, rolled, until even a quick player needs two minutes
      let n = 0;
      while (expert < EXPERT_SECONDS - 10 && n < 24) {
        const k = n % 3;
        if (k === 0) pillars(R.shuffle([50, 110, 70, 130]), [0.55, 0.72], n > 2);
        else if (k === 1) highRoad();
        else { rest(R.r(250, 400)); stumps(); }
        n++;
        if (n % 3 === 0) flag();
      }
      rest(R.r(700, 900));
    });
  }

  /**
   * the petal stairs: stumps rising to a run of branches, the petals climbing with them. The forest floor carries on below (safe),
   * but the petals are up top. With `nook`, a branch above the run hides behind leaves that part as he comes close: more petals there.
   */
  function trailUp(nook: boolean) {
    const x0 = x;
    run(R.r(160, 220));
    const steps = [50, 100, 150];
    for (const h of steps) {
      const w = R.r(90, 120);
      block(x, x + w, h);
      flower(x + w / 2, G - h - 34, 'orchid');
      run(w + R.r(50, 80));
    }
    const y = G - Math.round(R.r(185, 200));
    let bx = x - 30;
    const n = R.i(3, 4);
    let nookAt = -1;
    for (let k = 0; k < n; k++) {
      const w = Math.round(R.r(220, 300));
      branch(bx, bx + w, y);
      row(bx + 40, bx + w - 40, y - 34, 2, 'orchid');
      if (k === n - 2) nookAt = bx + w * 0.5;
      bx += w + Math.round(reachJump(0, false) * R.r(0.35, 0.5));
    }
    if (nook && nookAt > 0) {
      // up a double jump from the run: a hidden shelf of petals behind leaves
      const ny = y - Math.round(R.r(140, 160));
      branch(nookAt - 60, nookAt + 160, ny);
      row(nookAt - 20, nookAt + 100, ny - 34, 3, 'hibiscus');
      // World 1's note waits on the shelf (the generated 1-2 places it itself; a hand-built stage has to: finds.ts, a note in stage 2)
      const note = findForStage(config.worldIndex, config.miniIndex);
      if (note && note.kind === 'note') C.push({ id: cid++, type: 'find', findId: note.id, hidden: false, x: nookAt + 140, y: ny - 40, collected: false, bobPhase: 0 });
      covers.push({ x: nookAt - 90, y: ny - 80, w: 280, h: 110 });
    }
    // the petals lead back down to the floor
    arc(bx - 60, bx + 160, y + 20, 3, 'orchid');
    x = bx + R.r(200, 260);
    expert += (x - x0) / RUN + 2;
    pieces.push({ k: 'highrun', x0, x1: x });
  }

  /**
   * the split trail: a high road of branches and the forest floor run side by side, and the petals swap between them. Each time
   * they go high a mushroom on the floor bounces him up; each time they go low he drops. Three drops in all.
   */
  function splitTrail() {
    const x0 = x;
    run(R.r(160, 220));
    const y = G - Math.round(R.r(175, 195));
    for (let k = 0; k < 3; k++) {
      // high: a mushroom up, then branches with petals
      P.push({ id: pid++, x: x, y: G - 30, width: 70, height: 30, type: 'bouncy' });
      let bx = x + 40;
      const n = R.i(2, 3);
      for (let j = 0; j < n; j++) {
        const w = Math.round(R.r(200, 280));
        branch(bx, bx + w, y);
        row(bx + 40, bx + w - 40, y - 34, 2, 'hibiscus');
        bx += w + Math.round(reachJump(0, false) * R.r(0.35, 0.5));
      }
      // low: the branches carry on overhead with nothing on them, and the petals are on the floor
      const lowLen = Math.round(R.r(520, 700));
      branch(bx, bx + lowLen, y);
      arc(bx - 40, bx + 120, y + 60, 2, 'orchid');
      row(bx + 160, bx + lowLen - 40, G - 34, Math.round(lowLen / 200), 'orchid');
      x = bx + lowLen + R.r(80, 140);
    }
    expert += (x - x0) / RUN + 4;
    pieces.push({ k: 'highrun', x0, x1: x });
  }

  /**
   * the goal is a real test when the stage holds about one and a half times it (two in three to find, room to miss some): the
   * finish is thinned evenly, the taught parts and the hidden shelf are left whole
   */
  function thinFinish(goal: number) {
    const fin = beats[beats.length - 1];
    const late = C.filter((c) => c.type === 'flower' && c.x >= fin[0]);
    const keep = Math.max(Math.round(late.length / 3), Math.round(goal * 1.5) - (C.filter((c) => c.type === 'flower').length - late.length));
    if (late.length > keep) {
      const step = late.length / (late.length - keep);
      const out = new Set<Collectible>();
      for (let i = 0; i < late.length - keep; i++) out.add(late[Math.min(late.length - 1, Math.floor(i * step + step / 2))]);
      for (let i = C.length - 1; i >= 0; i--) if (out.has(C[i])) C.splice(i, 1);
    }
  }

  if (plan === '1-2') {
    // 1-2 The Petal Trail: the petals show the way. Taught on the floor (they arc over each gap where the jump goes), tested up the
    // stumps to the branches overhead, twisted into a trail that swaps between high and low. The stage asks for 33 of them.
    beat('Learn: follow the petals', () => {
      rest(R.r(500, 650));
      hint(x - 200, 'Follow the petals', 'Follow the petals', 'Follow the petals');
      row(x - 160, x + 40, G - 34, 3, 'orchid');
      const one = reachJump(0, false);
      for (const w of [one * 0.4, one * 0.5, one * 0.6]) {
        run(R.r(160, 220));
        const edge = x;
        close();
        const far = Math.round(edge + w);
        softPit(edge, far);
        arc(edge - 50, far + 50, G - 110, 3, 'hibiscus');
        open(far);
      }
      run(R.r(160, 220));
      stumps();
      flag();
    });
    beat('Test: up to the branches', () => {
      hint(x + 60, 'The petals go up', 'The petals go up', 'The petals go up');
      trailUp(false);
      rest(R.r(300, 400));
      trailUp(true);
      flag();
    });
    beat('Twist: high and low', () => {
      hint(x + 60, 'Stay on the petals, high or low', 'Stay on the petals, high or low', 'Stay on the petals, high or low');
      splitTrail();
      flag();
    });
    beat('Finish', () => {
      let n = 0;
      while (expert < EXPERT_SECONDS - 10 && n < 24) {
        const k = n % 3;
        if (k === 0) trailUp(false);
        else if (k === 1) { rest(R.r(250, 400)); stumps(); }
        else highRoad();
        n++;
        if (n % 3 === 0) flag();
      }
      rest(R.r(700, 900));
    });
    thinFinish(PETAL_GOAL_12);
  }

  /** branches over a soft pit with a snake on most of them: punch it or hop over it (falling only drops him to the moss) */
  function snakeBranches(n: number, y: number) {
    const x0 = x;
    run(R.r(160, 220));
    const edge = x;
    close();
    let bx = edge + Math.round(reachJump(G - y, false) * R.r(0.45, 0.6));
    let m = 0;
    for (let k = 0; k < n; k++) {
      const w = Math.round(R.r(210, 280));
      const top = y + Math.round(R.r(-20, 20));
      branch(bx, bx + w, top);
      if (k !== 0 || n < 3) { snake(bx + w / 2, top, w - 90); m++; }
      else row(bx + 50, bx + w - 50, top - 34, 2, 'orchid');
      bx += w + Math.round(reachJump(0, false) * R.r(0.4, 0.55));
    }
    const far = Math.round(bx + 20);
    softPit(edge, far);
    open(far);
    run(R.r(200, 280));
    expert += (x - x0) / RUN + 1.6 * m;
    pieces.push({ k: 'snakes', x0, x1: x });
  }

  /**
   * a rope over a wide soft pit, a snake on the near ledge beside its end. Before Shimmy Rope is learned (clearing this stage) he drops
   * into the moss and climbs out the far side; after, he shimmies across. `bonus`: petals along under the rope for the shimmy.
   */
  function ropeGap(guard: boolean, bonus: boolean) {
    const x0 = x;
    run(R.r(260, 340));
    const edge = x;
    if (guard) snake(edge - 120, G, 140);
    close();
    const far = Math.round(edge + R.r(380, 430));
    softPit(edge, far);
    ROPES.push({ id: ROPES.length + 1, x0: edge - 44, x1: far + 44, y: G - 146, g0: G, g1: G, required: false });
    if (bonus) row(edge + 60, far - 60, G - 146 + 86 - 40, 3, 'hibiscus');
    open(far);
    run(R.r(220, 300));
    expert += (x - x0) / RUN + 2.5 + (guard ? 1.5 : 0);
    pieces.push({ k: 'snakes', x0, x1: x });
  }

  if (plan === '1-3') {
    // 1-3 Branch Snakes: punching. One snake asleep on a wide branch to learn on, then snakes on narrow branches (punch or hop),
    // then a snake guarding a rope: clearing the stage teaches Shimmy Rope, and a short rope near the end is there to try it on.
    beat('Learn: the sleeping snake', () => {
      rest(R.r(600, 750));
      const wx = x + 120;
      branch(wx, wx + 420, G - 90);
      snake(wx + 260, G - 90, 60, true);
      row(wx + 40, wx + 160, G - 124, 2, 'orchid');
      hint(wx - 80, 'Hop up beside the sleeping snake and tap to punch it', 'Hop up beside the sleeping snake and press Punch', 'Hop up beside the sleeping snake and press J to punch');
      run(R.r(700, 800));
      expert += 3;
      snakes();
      flag();
    });
    beat('Test: snakes on the branches', () => {
      hint(x + 60, 'Punch the snakes or hop over them', 'Punch the snakes or hop over them', 'Punch the snakes or hop over them');
      snakeBranches(3, G - 130);
      rest(R.r(250, 350));
      stumps();
      snakeBranches(4, G - 150);
      flag();
    });
    beat('Twist: the rope guard', () => {
      hint(x + 60, 'A snake guards the rope', 'A snake guards the rope', 'A snake guards the rope');
      ropeGap(true, false);
      snakes();
      ropeGap(true, true);
      flag();
    });
    beat('Finish', () => {
      let n = 0;
      while (expert < EXPERT_SECONDS - 10 && n < 24) {
        const k = n % 3;
        if (k === 0) snakeBranches(R.i(3, 4), G - Math.round(R.r(120, 160)));
        else if (k === 1) { rest(R.r(250, 400)); snakes(); }
        else { stumps(); rest(R.r(200, 300)); }
        n++;
        if (n % 3 === 0) flag();
      }
      // the short rope to try the new move on (it needs the skill this stage teaches, so it is a reason to come back)
      ropeGap(false, true);
      rest(R.r(600, 800));
    });
  }

  /** petals arcing over soft gaps only a double jump crosses: the top of each arc is higher than one jump reaches */
  function doubleArcs() {
    const x0 = x;
    run(R.r(180, 240));
    const two = reachJump(0, true);
    for (const w of [two * 0.66, two * 0.74, two * 0.8]) {
      const edge = x;
      close();
      const far = Math.round(edge + w);
      softPit(edge, far);
      arc(edge - 40, far + 40, Math.round(G - 20 - JUMP_RISE - 45), 3, 'hibiscus');
      open(far);
      run(R.r(240, 320));
    }
    expert += (x - x0) / RUN + 2;
    pieces.push({ k: 'stumps', x0, x1: x });
  }

  /**
   * creaking branches with petals on them, over safe ground: each one gives way a moment after he lands (and grows back), so he grabs
   * and keeps moving. Never needed to get through (the floor runs underneath), only to get the petals.
   */
  function creakRun() {
    const x0 = x;
    run(R.r(160, 220));
    block(x, x + 100, 60);
    flower(x + 50, G - 94, 'orchid');
    run(100 + R.r(50, 80));
    const y = G - Math.round(R.r(135, 150));
    const n = R.i(4, 5);
    for (let k = 0; k < n; k++) {
      const w = Math.round(R.r(150, 200));
      branch(x, x + w, y + Math.round(R.r(-12, 12)), 'fragile');
      row(x + 35, x + w - 35, y - 34, 2, 'hibiscus');
      run(w + Math.round(reachJump(0, false) * R.r(0.35, 0.5)));
    }
    run(R.r(160, 240));
    expert += (x - x0) / RUN + 1;
    pieces.push({ k: 'highrun', x0, x1: x });
  }

  /** a tree to climb, with World 1's keepsake hidden in a Hush Fern at the end of its branch (crouch beside it to search) */
  function fernTree() {
    const x0 = x;
    run(R.r(300, 360));
    const tX = x - 150;
    const perchY = 300;
    trunk(tX, G, perchY);
    branch(tX - 40, tX + 300, perchY);
    for (let i = 0; i < 4; i++) flower(tX, G - 70 - i * 60, 'hibiscus');
    row(tX + 60, tX + 160, perchY - 34, 2, 'orchid');
    const keep = findForStage(config.worldIndex, config.miniIndex);
    if (keep && keep.kind === 'keepsake') C.push({ id: cid++, type: 'find', findId: keep.id, hidden: true, x: tX + 250, y: perchY - 26, collected: false, bobPhase: 0 });
    run(R.r(260, 320));
    expert += (x - x0) / RUN + (2 * (G - perchY)) / CLIMB;
    pieces.push({ k: 'kapok', x0, x1: x });
  }

  /** a lookout up a trunk, and far out over the floor a ledge only the Leaf Glide reaches, with a golden seed (back after World 4) */
  function glideLookout() {
    const x0 = x;
    run(R.r(300, 360));
    const tX = x - 120;
    const perchY = 300;
    trunk(tX, G, perchY);
    branch(tX - 40, tX + 220, perchY);
    for (let i = 0; i < 3; i++) flower(tX, G - 70 - i * 70, 'orchid');
    // higher than a double jump from the floor, and past a double jump from the lookout, well inside a glide
    const gy = Math.round(G - RISE - 30);
    const dy = perchY - gy;
    const gap = Math.round((reachJump(dy, true) + reachGlide(dy, true)) / 2);
    const lx = tX + 220 + gap;
    branch(lx, lx + 120, gy);
    goldenSeed(lx + 60, gy - 34);
    hint(tX - 60, 'Something shiny, far away...', 'Something shiny, far away...', 'Something shiny, far away...', undefined);
    x = lx + 120 + R.r(380, 460);
    expert += (x - x0) / RUN + (2 * (G - perchY)) / CLIMB;
    pieces.push({ k: 'kapok', x0, x1: x });
  }

  if (plan === '1-5') {
    // 1-5 More Petals: everything so far, mixed. Every group of petals asks for a different move (a climb, a rope, a double jump, a
    // bounce, a punch), then the petals go onto creaking branches that give way: grab and keep moving. The keepsake hides in a fern
    // up a tree, and a seed far out from a lookout waits for the Leaf Glide.
    beat('Start', () => {
      rest(R.r(650, 800));
      flag();
    });
    beat('Test: a move for every group', () => {
      hint(x + 40, 'Every group of petals needs a different move', 'Every group of petals needs a different move', 'Every group of petals needs a different move');
      mixed(
        () => fernTree(),
        () => ropeGap(false, true),
        () => doubleArcs(),
        () => mushroomCache(),
        () => { rest(R.r(200, 300)); snakes(); },
      );
      flag();
    });
    beat('Twist: creaking branches', () => {
      hint(x + 60, 'Creaky branches! Grab the petals and keep moving', 'Creaky branches! Grab the petals and keep moving', 'Creaky branches! Grab the petals and keep moving');
      creakRun();
      rest(R.r(250, 350));
      creakRun();
      flag();
    });
    beat('Finish', () => {
      let n = 0;
      const pieceList = [() => ropeGap(false, true), () => creakRun(), () => doubleArcs(), () => { rest(R.r(250, 350)); stumps(); }, () => highRoad()];
      while (expert < EXPERT_SECONDS - 22 && n < 24) {
        pieceList[n % pieceList.length]();
        n++;
        if (n % 3 === 0) flag();
      }
      glideLookout();
      rest(R.r(700, 900));
    });
    thinFinish(PETAL_GOAL_15);
  }

  /** the bush sizes (px wide); each painting keeps its own shape */
  const BUSH_W = { tall: 124, wide: 176, fern: 150, grotto: 170 } as const;
  const bush = (bx: number, kind: Bush['kind'], extra: Partial<Bush> = {}) => {
    const b: Bush = { x: Math.round(bx), w: BUSH_W[kind], y: G, kind, ...extra };
    BUSHES.push(b);
    return b;
  };
  /** the time a stretch takes a quick player who waits out the eagle's passes in the bushes (calm, plus a warning and a sweep) */
  const watched = (len: number, calm: number) => (len / RUN) * ((calm + 4) / calm);

  /** bushes along the ground, `gap` apart, petals between them (a run, a bush, a run...) */
  function bushRow(n: number, gap: [number, number], kinds: Array<Bush['kind']>, calm: [number, number]) {
    const x0 = x;
    for (let k = 0; k < n; k++) {
      const g = R.r(gap[0], gap[1]);
      if (k > 0) row(x + 80, x + g - 80, G - 34, Math.max(1, Math.round(g / 260)), 'orchid');
      run(g);
      const kind = kinds[k % kinds.length];
      bush(x - BUSH_W[kind] / 2, kind);
    }
    run(R.r(260, 340));
    ZONES.push({ x0, x1: x, calm });
    expert += watched(x - x0, (calm[0] + calm[1]) / 2);
    pieces.push({ k: 'rest', x0, x1: x });
  }

  /**
   * one bush with a secret: a short trunk stands inside it, up to a branch path hidden behind leaves (a golden seed at its end).
   * From outside it looks like any other bush; climb up from inside it.
   */
  function secretBush(calm: [number, number]) {
    const x0 = x;
    run(R.r(380, 460));
    const b = bush(x - BUSH_W.tall / 2, 'tall');
    const tX = Math.round(b.x + b.w / 2);
    const perchY = Math.round(G - 160);
    trunk(tX, G, perchY);
    const end = tX + Math.round(R.r(360, 420));
    branch(tX - 40, end, perchY);
    row(tX + 70, end - 90, perchY - 34, 3, 'hibiscus');
    goldenSeed(end - 40, perchY - 34);
    covers.push({ x: tX + 30, y: perchY - 90, w: end - tX, h: 110 });
    run(R.r(520, 620));
    ZONES.push({ x0, x1: x, calm });
    expert += watched(x - x0, (calm[0] + calm[1]) / 2);
    pieces.push({ k: 'rest', x0, x1: x });
  }

  /** a rope over a wide soft pit with bushes hanging from it: shimmy from one to the next between the eagle's passes */
  function ropeBushes(calm: [number, number]) {
    const x0 = x;
    run(R.r(300, 380));
    bush(x - 200, 'wide');
    const edge = x;
    close();
    const far = Math.round(edge + R.r(980, 1100));
    softPit(edge, far);
    const ry = G - ROPE_RISE;
    ROPES.push({ id: ROPES.length + 1, x0: edge - 44, x1: far + 44, y: ry, g0: G, g1: G, required: false });
    const span = far - edge;
    // hanging just under the rope (by a few vine strands): his body, hanging from his hands, is inside the bush
    for (const u of [0.26, 0.52, 0.78]) bush(edge + span * u - 52, 'tall', { w: 104, y: ry + 6, hanging: true });
    for (const u of [0.13, 0.39, 0.65, 0.9]) flower(edge + span * u, ry + HANG_DROP - 26, 'orchid');
    open(far);
    run(R.r(260, 340));
    ZONES.push({ x0, x1: x, calm });
    expert += (edge - x0) / RUN + (span + 88) / ROPE_SPEED * ((calm[0] + calm[1]) / 2 + 4) / ((calm[0] + calm[1]) / 2) + (x - far) / RUN;
    pieces.push({ k: 'snakes', x0, x1: x });
  }

  if (plan === '1-7') {
    // 1-7 A Very Good Bush: hide from the eagle. Taught with long calms and big bushes close together, tested with the bushes farther
    // apart and shorter calms, then twisted onto a rope line with bushes hanging from it. One bush hides a way up to a secret path.
    beat('Start', () => {
      rest(R.r(600, 750));
      flag();
    });
    beat('Learn: hide in the bushes', () => {
      hint(x + 20, 'An eagle is watching. Slide down inside a bush to hide', 'An eagle is watching. Hold down inside a bush to hide', 'An eagle is watching. Hold down inside a bush to hide');
      bushRow(5, [380, 470], ['tall', 'tall', 'wide'], [7.5, 9]);
      flag();
    });
    beat('Test: farther apart', () => {
      hint(x + 40, 'Run when it has gone by', 'Run when it has gone by', 'Run when it has gone by');
      bushRow(3, [700, 820], ['wide', 'fern', 'tall'], [4.8, 6]);
      secretBush([4.8, 6]);
      stumps();
      bushRow(3, [740, 880], ['fern', 'tall', 'wide'], [4.6, 5.6]);
      flag();
    });
    beat('Twist: the rope line', () => {
      hint(x + 60, 'Bushes on the rope too. Hang inside one while it goes by', 'Bushes on the rope too. Hang inside one while it goes by', 'Bushes on the rope too. Hang inside one while it goes by');
      ropeBushes([4.6, 5.4]);
      flag();
    });
    beat('Finish', () => {
      let n = 0;
      while (expert < EXPERT_SECONDS - 10 && n < 12) {
        if (n % 2 === 0) bushRow(3, [720, 880], ['tall', 'wide', 'fern'], [4.4, 5.4]);
        else ropeBushes([4.4, 5.2]);
        n++;
        flag();
      }
      rest(R.r(700, 900));
    });
  }

  /** a coiled boa guarding a spot (it never moves; it rears, lunges about 130 px, and takes three hits) */
  const boa = (bx: number, surface: number, facing: 1 | -1 = -1) => {
    E.push({
      id: eid++, type: 'boa', x: Math.round(bx), y: surface - 16, vx: 0, vy: 0, width: 58, height: 26, hp: 3, maxHp: 3, facing,
      patrolMinX: bx - 12, patrolMaxX: bx + 12, attackCooldown: 1.2, telegraphTimer: 0, isAttacking: false,
      animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0,
    } as Enemy);
  };

  /** a wide branch over soft moss with one boa coiled in the middle of it: the way on is across the branch, past the guard */
  function guardBranch() {
    const x0 = x;
    run(R.r(180, 240));
    // a stump up to the branch, the branch over a soft pit, and the far side
    block(x, x + 100, 60);
    run(160);
    const y = G - Math.round(R.r(115, 130));
    const w = Math.round(R.r(520, 600));
    const edge = x;
    close();
    branch(edge - 40, edge + w, y);
    boa(edge + w * 0.55, y);
    row(edge + 40, edge + w * 0.3, y - 34, 2, 'orchid');
    const far = Math.round(edge + w + R.r(60, 100));
    softPit(edge, far);
    open(far);
    run(R.r(380, 460));
    // and no rest after it: a snake on the far bank (fighting on the move)
    snake(far + R.r(220, 300), G, 120);
    expert += (x - x0) / RUN + 5;
    pieces.push({ k: 'snakes', x0, x1: x });
  }

  /** a rope over a soft pit to a far bank where a boa waits, with room to land before it */
  function ropeGuard() {
    const x0 = x;
    ropeGap(false, false);
    // ropeGap leaves him past the far edge: the guard stands a little on
    boa(x + R.r(120, 180), G);
    run(R.r(380, 460));
    expert += 4;
    pieces.push({ k: 'snakes', x0, x1: x });
  }

  /** a wall of earth: the way over is up a trunk and across a branch, where a boa is coiled */
  function trunkGuard() {
    const x0 = x;
    run(R.r(260, 320));
    const tX = x - 120;
    const perchY = G - 260;
    trunk(tX, G, perchY);
    for (let i = 0; i < 3; i++) flower(tX, G - 70 - i * 60, 'hibiscus');
    const bEnd = tX + Math.round(R.r(380, 430));
    branch(tX - 40, bEnd, perchY);
    boa(tX + (bEnd - tX) * 0.6, perchY);
    // the high ground beyond: a wall from the floor (he cannot walk under it or jump onto it from below)
    const wx = bEnd + Math.round(R.r(90, 120));
    const ww = Math.round(R.r(480, 560));
    block(wx, wx + ww, 230);
    row(wx + 60, wx + ww - 60, G - 264, 3, 'orchid');
    x = wx + ww + R.r(160, 220);
    expert += (x - x0) / RUN + (G - perchY) / CLIMB + 5;
    pieces.push({ k: 'kapok', x0, x1: x });
  }

  /** a high branch path with a snake asleep on it and a golden seed beyond: hop over it while it sleeps, or knock it off */
  function sleepingGuard() {
    const x0 = x;
    run(R.r(200, 260));
    P.push({ id: pid++, x: x, y: G - 30, width: 70, height: 30, type: 'bouncy' });
    const y = Math.round(G - RISE - 60);
    const w = Math.round(R.r(420, 480));
    branch(x - 40, x - 40 + w, y);
    snake(x - 40 + w * 0.45, y, 60, true);
    goldenSeed(x - 40 + w - 50, y - 34);
    row(x + 10, x + 120, y - 34, 2, 'hibiscus');
    run(w + R.r(120, 200));
    expert += (x - x0) / RUN + 1.5;
    pieces.push({ k: 'rest', x0, x1: x });
  }

  /** the ring: branches around a clearing, walled at the far end; snakes drop in two waves and the wall opens when they are all down */
  function snakeRing() {
    const x0 = x;
    run(R.r(160, 220));
    const r0 = x;
    const W = Math.round(R.r(1050, 1150));
    const ly = G - 140, ty = G - 265;
    const L = branch(r0 + 140, r0 + 400, ly);
    const Rb = branch(r0 + W - 400, r0 + W - 140, ly);
    const Tp = branch(r0 + W / 2 - 160, r0 + W / 2 + 160, ty);
    row(Tp.x + 50, Tp.x + Tp.width - 50, ty - 34, 3, 'hibiscus');
    const wall = block(r0 + W, r0 + W + 120, 330);
    const mid = (p: Platform) => p.x + p.width / 2;
    RING = {
      x0: r0, x1: r0 + W, wallId: wall.id,
      waves: [
        [{ x: r0 + W * 0.45, surface: G, kind: 'snake' }, { x: mid(L), surface: ly, kind: 'snake' }, { x: mid(Rb), surface: ly, kind: 'snake' }],
        [{ x: r0 + W * 0.3, surface: G, kind: 'snake' }, { x: mid(Tp), surface: ty, kind: 'snake' }, { x: r0 + W * 0.7, surface: G, kind: 'snake' }, { x: r0 + W * 0.55, surface: G, kind: 'boa' }],
      ],
    };
    x = r0 + W + 120;
    run(R.r(260, 340));
    expert += (x - x0) / RUN + 16;
    pieces.push({ k: 'snakes', x0, x1: x });
  }

  if (plan === '1-9') {
    // 1-9 The Boa's Branches: fighting on the move. The boa's guards coil on the branches you have to cross: read the warning (it rears),
    // step out of the lunge, punch it while it recovers. Then guards past ropes and up trunks, and a ring where snakes drop from the
    // canopy until every one is down. A snake asleep on a high branch guards a seed.
    beat('Learn: one guard at a time', () => {
      rest(R.r(600, 750));
      hint(x + 40, 'A guard! Wait for it to rear and strike, then tap to punch it', 'A guard! Wait for it to rear and strike, then press Punch', 'A guard! Wait for it to rear and strike, then press J to punch');
      guardBranch();
      rest(R.r(250, 350));
      guardBranch();
      snakes();
      flag();
    });
    beat('Test: guards along the way', () => {
      ropeGuard();
      trunkGuard();
      flag();
      sleepingGuard();
      snakes();
      guardBranch();
      flag();
    });
    beat('Twist: the ring', () => {
      hint(x + 60, 'Snakes from above! Clear them all to open the way', 'Snakes from above! Clear them all to open the way', 'Snakes from above! Clear them all to open the way');
      snakeRing();
      flag();
    });
    beat('Finish', () => {
      let n = 0;
      while (expert < EXPERT_SECONDS - 10 && n < 12) {
        const k = n % 3;
        if (k === 0) guardBranch();
        else if (k === 1) { rest(R.r(250, 350)); snakes(); }
        else trunkGuard();
        n++;
        if (n % 2 === 0) flag();
      }
      rest(R.r(700, 900));
    });
  }

  // ----- the control test's own pieces: World 2's water and its animals, built on World 1's ground -----
  const SURF = G + surfaceBelowBank;
  const LOG_Y = G + LOG_DROP;
  /** a river with drifting logs; falling in only puts him back on the bank (a test is cheap to fail) */
  function riverCross(dir: 1 | -1, speed: number, logs: number, logW: number) {
    const x0 = x;
    run(R.r(140, 200));
    close();
    const rx0 = x;
    const gap = Math.round(gapFor(dir, speed));
    const width = (logs + 1) * (logW + gap) - logW;
    const rx1 = rx0 + width;
    const { count, period } = logLayout({ dir, speed, logW, gap, width });
    for (let i = 0; i < count; i++) {
      const pl: Platform = {
        id: pid++, x: rx0, y: LOG_Y, width: logW, height: LOG_HEIGHT, type: 'drift', style: 'log',
        drift: { x0: rx0, x1: rx1, dir, speed, width: logW, offset: (i * period) / count, baseY: LOG_Y },
      };
      pl.x = driftX(pl.drift!, 0);
      P.push(pl);
    }
    RIVERS.push({ x0: rx0, x1: rx1, surfaceY: SURF, dir, speed, safe: { backX: rx0 - 70, backY: G } });
    arc(rx0 + 50, rx1 - 50, G - 80, logs + 1, 'hibiscus');
    open(rx1);
    run(R.r(160, 220));
    expert += (x - x0) / RUN + width / (RUN * (dir === 1 ? 0.75 : 0.45)) + 1;
    pieces.push({ k: 'river', x0, x1: x });
  }
  /** still water crossed on lily pads (falling in puts him back on the bank) */
  function lilyPads(n: number) {
    const x0 = x;
    run(R.r(140, 190));
    close();
    const px0 = x;
    let px = px0;
    const one = reachJump(0, false);
    for (let i = 0; i < n; i++) {
      px += Math.round(one * R.r(0.42, 0.55));
      const w = Math.round(R.r(84, 104));
      P.push({ id: pid++, x: px, y: SURF - 8, width: w, height: 12, type: 'solid', lily: true });
      flower(px + w / 2, SURF - 60, 'hibiscus');
      px += w;
    }
    px += Math.round(one * R.r(0.42, 0.55));
    RIVERS.push({ x0: px0, x1: px, surfaceY: SURF, dir: 1, speed: 0, safe: { backX: px0 - 70, backY: G } });
    open(px);
    run(R.r(160, 220));
    expert += (x - x0) / RUN + n * 0.35;
    pieces.push({ k: 'pond', x0, x1: x });
  }
  /** snapping turtles along the ground: punch one from behind, or kick its shell into the others */
  function turtles() {
    const x0 = x;
    run(R.r(260, 320));
    const n = R.i(3, 4);
    for (let k = 0; k < n; k++) {
      run(R.r(150, 220));
      E.push({
        id: eid++, type: 'turtle', x, y: G - 14, vx: 22, vy: 0, width: 48, height: 24, hp: 1, maxHp: 1, facing: R.chance(0.5) ? 1 : -1,
        patrolMinX: x - 60, patrolMaxX: x + 60, attackCooldown: 1.5, telegraphTimer: 0, isAttacking: false,
        animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0,
      } as Enemy);
    }
    // (well clear of the flag that follows)
    run(R.r(440, 500));
    expert += (x - x0) / RUN + 2 * n;
    pieces.push({ k: 'turtles', x0, x1: x });
  }
  /** cages with a little one in each: punch a cage twice to break it */
  function cages() {
    const x0 = x;
    const kinds = R.shuffle(['capy', 'duck', 'otter'] as Array<'capy' | 'duck' | 'otter'>);
    for (const critter of kinds) {
      run(R.r(280, 360));
      C.push({ id: cid++, type: 'cage', x, y: G - 26, collected: false, bobPhase: 0, cageHp: 2, critter });
    }
    run(R.r(300, 360));
    expert += (x - x0) / RUN + 3;
    pieces.push({ k: 'cages', x0, x1: x });
  }

  /**
   * the control test: move everything built from `x0` on (ground, branches, vines, trunks, ropes, bushes, water, animals, pickups,
   * hints) `dx` further along, and the cursor with it, leaving a longer stretch of ground before it
   */
  function shiftFrom(x0: number, dx: number) {
    dx = Math.round(dx);
    for (const p of P) {
      if (p.x >= x0) {
        p.x += dx;
        if (p.drift) p.drift = { ...p.drift, x0: p.drift.x0 + dx, x1: p.drift.x1 + dx };
        if (p.push) p.push = { min: p.push.min + dx, max: p.push.max + dx };
      } else if (p.drift && p.drift.x0 >= x0) p.drift = { ...p.drift, x0: p.drift.x0 + dx, x1: p.drift.x1 + dx };
    }
    for (const v of V) if (v.x >= x0) v.x += dx;
    for (const t of T) if (t.x >= x0) t.x += dx;
    for (const r of ROPES) if (r.x0 >= x0 - 60) { r.x0 += dx; r.x1 += dx; }
    for (const b of BUSHES) if (b.x >= x0) b.x += dx;
    for (const z of ZONES) if (z.x0 >= x0) { z.x0 += dx; z.x1 += dx; }
    for (const r of RIVERS) if (r.x0 >= x0) { r.x0 += dx; r.x1 += dx; if (r.safe) r.safe = { ...r.safe, backX: r.safe.backX + dx }; }
    for (const e of E) if (e.x >= x0) { e.x += dx; e.patrolMinX += dx; e.patrolMaxX += dx; }
    for (const c of C) if (c.x >= x0) c.x += dx;
    for (const h of hints) if (h.x >= x0) h.x += dx;
    for (const c of covers) if (c.x >= x0) c.x += dx;
    if (RING && RING.x0 >= x0) RING = { ...RING, x0: RING.x0 + dx, x1: RING.x1 + dx, waves: RING.waves.map((w) => w.map((d) => ({ ...d, x: d.x + dx }))) };
    if (bankFrom >= x0) bankFrom += dx;
    x += dx;
    expert += dx / RUN;
  }

  if (plan === 'ctest') {
    // The control test (Matt, 2026-10-24): the basics every run, then six short stretches drawn from the whole game, two of each kind
    // (moving about, fighting, and the rest: the eagle and the water). Every run is a different mix (the caller gives each run a new
    // seed: playRecorder.ts ctestSeed), so across runs every stretch gets played, and stretches can be compared tester by tester.
    // The seed and the mix are logged when the run starts, so any run can be built again (?mix=<seed>).
    beat('Run and stop', () => {
      hint(x + 60, 'Run to the flowers and stop on them');
      run(450);
      row(x, x + 160, G - 34, 3, 'orchid');
      run(550);
      hint(x - 250, 'Now turn around and run back a little');
      run(250);
      flag();
    });
    beat('Short hops', () => {
      hint(x + 60, 'Hop up the stumps');
      stumps();
      flag();
    });
    beat('Long jumps', () => {
      hint(x + 60, 'Jump the gaps. The last two need a second jump');
      gaps();
      flag();
    });
    type Stretch = { name: string; tip: [string, string, string]; build: () => void };
    const same = (t: string): [string, string, string] => [t, t, t];
    const moving: Stretch[] = [
      { name: 'Climb', tip: same('Climb to the top of the tree, then back down'), build: () => climbTree() },
      { name: 'Swing', tip: same('Jump into the vine to grab it, jump again to let go'), build: () => { chain(1, true, 'hollow'); rest(R.r(250, 350)); chain(2, true, 'hollow'); } },
      { name: 'Rope', tip: ['Jump up into the rope to grab it, then slide to move along', 'Jump up into the rope, then hold left or right', 'Jump up into the rope, then hold left or right'], build: () => { ropeGap(false, true); ropeGap(false, true); } },
      { name: 'Crumbling branches', tip: same('Creaky branches! Grab the petals and keep moving'), build: () => creakRun() },
      { name: 'Bounce', tip: same('Land on the mushroom to bounce up high'), build: () => { highRoad(); mushroomCache(); } },
      { name: 'Stepping stones', tip: same('Hop from stone to stone'), build: () => pillars(R.shuffle([60, 110, 70, 130]), [0.55, 0.68]) },
      { name: 'Double jumps', tip: same('Jump, then jump again in the air to cross'), build: () => doubleArcs() },
      { name: 'Canopy road', tip: same('Climb up and cross the high branches'), build: () => canopy(false) },
      { name: 'High vines', tip: same('Climb the tree, then swing across the vines'), build: () => highRun() },
      { name: 'Push the log', tip: same('Push the log against the wall, then climb up'), build: () => logPuzzle() },
    ];
    const fighting: Stretch[] = [
      { name: 'Snakes', tip: same('Punch and kick the snakes'), build: () => { snakes(); } },
      { name: 'Snakes on branches', tip: same('Punch the snakes or hop over them'), build: () => snakeBranches(3, G - 130) },
      { name: 'Boa guard', tip: same('A guard! Wait for it to strike, then punch it'), build: () => guardBranch() },
      { name: 'Sleeping snake', tip: same('Sneak past the sleeping snake, or knock it off'), build: () => sleepingGuard() },
      { name: 'Snake ring', tip: same('Snakes from above! Clear them all to open the way'), build: () => snakeRing() },
      { name: 'Snapping turtles', tip: same('Hit a turtle from behind, or kick its shell'), build: () => turtles() },
      { name: 'Cages', tip: same('Punch each cage twice to free the little one'), build: () => cages() },
    ];
    const other: Stretch[] = [
      { name: 'Hide from the eagle', tip: ['An eagle is watching. Slide down inside a bush to hide', 'An eagle is watching. Hold down inside a bush to hide', 'An eagle is watching. Hold down inside a bush to hide'], build: () => bushRow(4, [420, 520], ['tall', 'wide', 'fern'], [6.5, 8]) },
      { name: 'River logs', tip: same('Hop on the logs and ride them across'), build: () => { riverCross(1, 55, 2, 190); rest(R.r(260, 340)); riverCross(-1, 55, 2, 185); } },
      { name: 'Lily pads', tip: same('Hop across the lily pads'), build: () => lilyPads(5) },
    ];
    const drawn = R.shuffle([...R.shuffle(moving).slice(0, 2), ...R.shuffle(fighting).slice(0, 2), ...R.shuffle(other).slice(0, 2)]);
    // an animal's patch keeps this far from every flag (levelCheck.ts SAFE_APPROACH is 200), so a respawn never lands beside one
    const CLEAR = 240;
    for (const st of drawn) {
      beat(st.name, () => {
        const flagAt = x - 80;
        const foes = E.length;
        rest(R.r(160, 220));
        hint(x - 60, ...st.tip);
        const from = x;
        st.build();
        // too near the flag behind? slide the whole stretch on (everything it built since `from`)
        const near = E.slice(foes).reduce((m, e) => Math.min(m, e.patrolMinX - flagAt), Infinity);
        if (near < CLEAR) shiftFrom(from, CLEAR - near);
        // and room before the next flag
        const far = E.slice(foes).reduce((m, e) => Math.max(m, e.patrolMaxX), -Infinity);
        if (x - 80 - far < CLEAR) run(CLEAR - (x - 80 - far));
        flag();
      });
    }
    beat('Finish', () => rest(700));
    MIX = `seed ${seed}: ${drawn.map((d) => d.name).join(', ')}`;
    // no secrets in a test
    for (let i = C.length - 1; i >= 0; i--) if (C[i].type === 'seed' || C[i].type === 'find') C.splice(i, 1);
    // a piece's own flag can sit by its own animal (the log's high ground): that animal stays home
    const nearFlag = (e: Enemy) => checkpoints.some((f) => Math.abs(e.y - f.y) < 400 && (f.x >= e.patrolMinX - CLEAR && f.x <= e.patrolMaxX + CLEAR));
    for (let i = E.length - 1; i >= 0; i--) if (nearFlag(E[i])) E.splice(i, 1);
    // where two stretches meet, a flower can land on another or inside a branch: the later one goes
    const solid = (c: Collectible) => P.some((p) => p.type !== 'drift' && !p.push && c.x >= p.x && c.x <= p.x + p.width && c.y > p.y + 2 && c.y < p.y + p.height - 2);
    for (let i = C.length - 1; i >= 0; i--) {
      const c = C[i];
      if (c.type !== 'flower') continue;
      if (solid(c) || C.some((o, j) => j < i && o.type === 'flower' && Math.hypot(o.x - c.x, o.y - c.y) < 40)) C.splice(i, 1);
    }
    covers.length = 0;
  }

  if (plan === 'proto') {
  beat('Start', () => rest(R.r(600, 800)));
  beat('Learn: swing over soft moss', () => {
    hint(x + 120, 'Flick up into the vine to grab it', 'Jump into the vine to grab it', 'Jump into the vine to grab it');
    chain(1, true, 'hollow');
    rest(R.r(300, 500));
    hint(x + 40, 'Flick up again as you swing forward', 'Press Jump as you swing forward', 'Press Space as you swing forward');
    chain(2, true, 'hollow');
    rest(R.r(250, 400));
    chain(R.i(2, 3), true, 'hollow');
    stumps();
    flag();
  });
  beat('Develop: the gorge and the tall kapok', () => {
    chain(R.i(2, 3), false, 'gorge');
    mixed(() => snakes(), () => rest(R.r(300, 500)));
    flag();
    kapok();
    chain(3, false, 'gorge');
    flag();
  });
  beat('Puzzle: the fallen log', () => {
    rest(R.r(200, 320));
    logPuzzle();
    flag();
  });
  beat('Twist: the canopy road', () => {
    canopy(true);
    flag();
    highRun();
    flag();
  });
  beat('Develop again: higher and wider', () => {
    mixed(() => stumps(), () => snakes());
    kapok();
    flag();
    chain(R.i(3, 4), false, 'gorge');
    flag();
    // then more of the world's pieces, rolled from the kit, until even a quick, sure player needs the stage's minimum time
    // (the finish adds about 10 s); a flag after every second piece
    const kit: Array<() => void> = [
      () => chain(R.i(3, 4), false, 'gorge'),
      () => kapok(),
      () => highRun(),
      () => { stumps(); snakes(); },
      () => canopy(false),
    ];
    let last = -1, count = 0;
    while (expert < EXPERT_SECONDS - 10 && count < 16) {
      let k = R.i(0, kit.length - 1);
      if (k === last) k = (k + 1) % kit.length;
      last = k;
      kit[k]();
      if (++count % 2 === 0) flag();
      rest(R.r(150, 320));
    }
  });
  beat('Finish: the long swing home', () => {
    rest(R.r(250, 400));
    chain(4, false, 'gorge');
    rest(R.r(700, 900));
    // the walk to the shrine makes up any last seconds the dice left short
    if (expert < EXPERT_SECONDS) rest((EXPERT_SECONDS - expert) * RUN + 60);
  });
  }

  // ======================================================================================================================
  // World 3, the Mossy Grotto (2026-10-24, three stages at a time): World 1's pieces in the grotto's kit, with the grotto's own things.
  // Mushrooms puff sleepy spores on a beat (zones.ts). Stretches of real dark where the glowworms hang asleep on their threads until
  // Pokey stands still and listens; then they wake, glow and light the way, and stay lit (the story: he stopped to listen, and the
  // glowworms noticed). Prowlers (ocelots, and a jaguar or two) in 3-3. Dressed with Matt's grotto sheets (w3Art.ts).
  const GZ: Zone[] = [];
  const W3D: W3Decor[] = [];
  let glowN = 1;
  /** a spore cloud over [x0, x1], puffed by mushrooms at `emit`, on the World 3 beat (6.4 s: 1 s warning, 2.2 s of cloud) */
  const sporeZone = (x0: number, x1: number, emit: number[]) =>
    GZ.push({ kind: 'spore', x0, x1, top: G - 220, bottom: G + 40, baseY: G, dir: 1, period: 6.4, warn: 1.0, active: 2.2, force: 0, offset: R.r(0, 6.4), emit });
  /** a stretch of grotto floor under a spore cloud: wait for it to clear, or walk through drowsy (nothing to lose) */
  function sporeRest(len: number) {
    const x0 = x;
    rest(len);
    sporeZone(x0 + 80, x - 80, [x0 + 150, x0 + len / 2, x - 150]);
    expert += 2.5;
  }
  /** a gap with a cloud on both sides of it: jump it while the air is clear */
  function sporeGap() {
    const x0 = x;
    run(R.r(300, 360));
    const edge = x;
    close();
    const far = Math.round(edge + reachJump(0, false) * R.r(0.55, 0.68));
    softPit(edge, far);
    arc(edge - 30, far + 30, G - 110, 4);
    open(far);
    run(R.r(300, 360));
    sporeZone(edge - 150, far + 150, [edge - 110, far + 100]);
    expert += (x - x0) / RUN + 3;
    pieces.push({ k: 'stumps', x0, x1: x });
  }
  /**
   * a stretch of real dark: the glowworms hang asleep on their threads, one over the start and one over every gap. Standing still for a
   * moment wakes the ones ahead (zones.ts GLOW_STILL / GLOW_REACH), and they stay lit. Gaps are soft (a mossy floor below). `ferns`:
   * a fern to stop in before each gap (3-2's eyes cannot see him in one). Returns where the stops are, for the stealth stretches.
   */
  function glowDark(len: number, gaps: number, opts: { ferns?: boolean } = {}): number[] {
    const x0 = x;
    run(260);
    const zx0 = x - 200;
    const lights: NonNullable<Zone['lights']> = [];
    const stops: number[] = [x - 90];
    const glow = (gx: number, gy = G - Math.round(R.r(150, 175))) => lights.push({ x: Math.round(gx), y: gy, r: 260, sleep: true, id: glowN++ });
    glow(x - 40);
    const seg = Math.max(260, (len - 260) / (gaps + 1));
    for (let i = 0; i < gaps; i++) {
      run(seg);
      const edge = x;
      close();
      const far = Math.round(edge + reachJump(0, false) * R.r(0.5, 0.66));
      softPit(edge, far);
      flower(edge + (far - edge) / 2, G - 110, 'orchid');
      glow((edge + far) / 2);
      open(far);
      run(R.r(80, 120));
      stops.push(edge - 120);
    }
    run(seg);
    // a glowworm every 450 px or so along the flat too, so once they wake the whole way is lit
    for (let gx = zx0 + 450; gx < x - 150; gx += 450) if (!lights.some((l) => Math.abs(l.x - gx) < 220)) glow(gx);
    GZ.push({ kind: 'dark', x0: zx0, x1: x - 40, top: G - 700, bottom: G + 260, baseY: G, dir: 1, period: 1, warn: 0, active: 1, force: 0, offset: 0, lights });
    // out of the dark before anything else (a flag never stands in it)
    run(220);
    if (opts.ferns) for (const sx of stops) bush(sx - BUSH_W.grotto / 2, 'grotto');
    // a stop to listen at the start, and wherever the lit reach runs out
    expert += (x - x0) / RUN + 1.2 * Math.ceil((x - x0) / 1000) + 0.8 * gaps;
    pieces.push({ k: 'rest', x0, x1: x });
    return stops;
  }
  /** an ocelot (two hits, quick) or a jaguar (three hits, pounces) prowling its patch of ground */
  const prowler = (kind: 'ocelot' | 'jaguar', px: number, surface: number, range = 160) => {
    const big = kind === 'jaguar';
    E.push({
      id: eid++, type: kind, x: Math.round(px), y: surface - (big ? 24 : 18), vx: (R.chance(0.5) ? -1 : 1) * (big ? 42 : 55), vy: 0,
      width: big ? 64 : 48, height: big ? 38 : 28, hp: big ? 3 : 2, maxHp: big ? 3 : 2, facing: R.chance(0.5) ? 1 : -1,
      patrolMinX: Math.round(px - range / 2), patrolMaxX: Math.round(px + range / 2), attackCooldown: big ? 1.2 : 2.5, telegraphTimer: 0, isAttacking: false,
      animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0,
    } as Enemy);
  };
  /** a trail of giant pawprints pressed in the mud */
  const prints = (x0: number, x1: number) => {
    for (let px = x0; px < x1; px += R.r(170, 230)) W3D.push({ n: 'pawprint', x: Math.round(px), b: G + 10, w: Math.round(R.r(92, 110)), flip: R.chance(0.3) });
  };
  /** a stretch of floor with prowlers on it, well inside its ends */
  function prowlFloor(kinds: Array<'ocelot' | 'jaguar'>) {
    const x0 = x;
    const len = R.r(900, 1100) + 260 * (kinds.length - 1);
    run(len);
    // well inside the stretch: a flag may stand at either end of it, and no patch of ground comes within SAFE_APPROACH of one
    const a = x0 + 330, b = x - 410;
    kinds.forEach((k, i) => prowler(k, kinds.length === 1 ? (a + b) / 2 : a + ((b - a) * i) / (kinds.length - 1), G, 180));
    row(x0 + 80, x - 80, G - 34, Math.round(len / 200));
    prints(x0 + 60, x0 + Math.min(500, len - 60));
    expert += len / RUN + 2.2 * kinds.length;
    pieces.push({ k: 'snakes', x0, x1: x });
  }
  /** limestone shelves over a soft pit with ocelots on them (punch them, or hop them) */
  function prowlShelves(n: number, y: number) {
    const x0 = x;
    run(R.r(160, 220));
    const edge = x;
    close();
    let bx = edge + Math.round(reachJump(G - y, false) * R.r(0.45, 0.6));
    let m = 0;
    for (let k = 0; k < n; k++) {
      const w = Math.round(R.r(240, 300));
      const top = y + Math.round(R.r(-20, 20));
      branch(bx, bx + w, top);
      if (k !== 0 || n < 3) { prowler('ocelot', bx + w / 2, top, w - 100); m++; }
      else row(bx + 50, bx + w - 50, top - 34, 2, 'orchid');
      bx += w + Math.round(reachJump(0, false) * R.r(0.4, 0.55));
    }
    const far = Math.round(bx + 20);
    softPit(edge, far);
    open(far);
    run(R.r(320, 380));
    expert += (x - x0) / RUN + 2.2 * m;
    pieces.push({ k: 'snakes', x0, x1: x });
  }

  if (plan === '3-1') {
    // 3-1 Into the Grotto: follow the glowworm light down into the grotto. Run and hop on the grotto's stones, wait out the sleepy
    // spores, and in the twist meet the dark: stand still, and the glowworms wake.
    beat('Start: the grotto mouth', () => {
      rest(R.r(560, 680));
      W3D.push({ n: 'grottoMouth', x: x - 140, b: G + 8, w: 320 });
      hint(x - 420, 'Into the grotto!');
      rest(R.r(320, 420));
      flag();
    });
    beat('Learn: the grotto stones', () => {
      stumps();
      rest(R.r(250, 350));
      pillars([60, 120, 60], [0.5, 0.62]);
      rest(R.r(250, 350));
      flag();
    });
    beat('Develop: the sleepy spores', () => {
      hint(x + 40, 'Mushrooms puff sleepy spores. Wait for them to clear');
      sporeRest(R.r(640, 760));
      sporeGap();
      pillars(R.shuffle([40, 100, 140, 80]), [0.55, 0.68]);
      sporeGap();
      flag();
    });
    beat('Twist: the dark', () => {
      hint(x + 60, 'Too dark to see. Stand still and listen...');
      glowDark(R.r(900, 1100), 0);
      rest(R.r(220, 320));
      glowDark(R.r(1200, 1400), 1);
      flag();
    });
    beat('Finish', () => {
      let n = 0;
      while (expert < EXPERT_SECONDS - 10 && n < 24) {
        const k = n % 4;
        if (k === 0) pillars(R.shuffle([50, 110, 70, 130]), [0.55, 0.7]);
        else if (k === 1) sporeGap();
        else if (k === 2) highRoad();
        else { rest(R.r(250, 400)); stumps(); }
        n++;
        if (n % 3 === 0) flag();
      }
      rest(R.r(700, 900));
    });
  }

  if (plan === '3-2') {
    // 3-2 Glowworm Path: something is watching. First the dark alone (stop and listen, and the glowworms light the gaps), then the eyes
    // alone (hide in the ferns while they look), then both: stop inside a fern, where the eyes cannot see him and the glowworms can.
    beat('Start', () => {
      rest(R.r(600, 750));
      flag();
    });
    beat('Learn: stop and listen', () => {
      hint(x + 20, 'Too dark to see the way. Stand still and listen...');
      glowDark(R.r(1000, 1200), 1);
      rest(R.r(240, 320));
      glowDark(R.r(1400, 1600), 2);
      flag();
    });
    beat('Develop: something is watching', () => {
      hint(x + 20, 'Eyes in the dark! Slide down inside a fern to hide', 'Eyes in the dark! Hold down inside a fern to hide', 'Eyes in the dark! Hold down inside a fern to hide');
      bushRow(4, [420, 520], ['grotto'], [7, 8.5]);
      flag();
      bushRow(3, [680, 800], ['grotto'], [5, 6.2]);
      flag();
    });
    beat('Twist: the eyes in the dark', () => {
      hint(x + 20, 'Stop inside a fern. The eyes cannot see you there, and the glowworms can');
      const x0 = x;
      glowDark(R.r(1400, 1600), 2, { ferns: true });
      ZONES.push({ x0, x1: x, calm: [5.5, 6.8] });
      expert += 4;
      flag();
    });
    beat('Finish', () => {
      let n = 0;
      while (expert < EXPERT_SECONDS - 10 && n < 12) {
        if (n % 2 === 0) bushRow(3, [700, 860], ['grotto'], [4.6, 5.6]);
        else {
          const x0 = x;
          glowDark(R.r(1200, 1500), 2, { ferns: true });
          ZONES.push({ x0, x1: x, calm: [5, 6.2] });
          expert += 4;
        }
        n++;
        flag();
      }
      rest(R.r(700, 900));
    });
  }

  if (plan === '3-3') {
    // 3-3 Footprints in a Circle: drive off the prowlers circling in the dark. One ocelot on open ground to learn on, then ocelots on
    // the limestone shelves, then a jaguar (three hits, and it pounces), and in the finish, prowlers in the dark by glowworm light.
    const placed = () => E.filter((e) => e.type === 'ocelot' || e.type === 'jaguar').length;
    beat('Start', () => {
      const x0 = x;
      rest(R.r(640, 760));
      prints(x0 + 200, x - 80);
      hint(x0 + 120, 'Footprints... a prowler is near');
      flag();
    });
    beat('Learn: a prowler', () => {
      hint(x + 40, 'A prowler! Punch it twice, or kick it');
      prowlFloor(['ocelot']);
      rest(R.r(240, 320));
      prowlFloor(['ocelot', 'ocelot']);
      flag();
    });
    beat('Develop: on the shelves', () => {
      prowlShelves(3, G - 130);
      rest(R.r(250, 350));
      stumps();
      prowlShelves(4, G - 150);
      flag();
    });
    beat('Twist: the big one', () => {
      hint(x + 40, 'A jaguar! Three hits, and jump when it crouches to pounce');
      prowlFloor(['jaguar']);
      sporeGap();
      prowlFloor(['ocelot', 'jaguar']);
      flag();
    });
    beat('Finish', () => {
      let n = 0;
      while ((expert < EXPERT_SECONDS - 10 || placed() < Math.ceil(PROWLER_GOAL_33 * 1.5)) && n < 16) {
        const k = n % 3;
        if (k === 0) prowlShelves(R.i(3, 4), G - Math.round(R.r(120, 160)));
        else if (k === 1) {
          // the dark between the fights: wait for the glowworms, then on
          glowDark(R.r(900, 1100), 1);
        } else { rest(R.r(250, 400)); prowlFloor([R.chance(0.35) ? 'jaguar' : 'ocelot']); }
        n++;
        if (n % 2 === 0) flag();
      }
      rest(R.r(700, 900));
    });
  }


  // ----- 3-5 Sleeping Vines: the old thorn vines (thornVine.ts) -----
  const THORNS: ThornVine[] = [];
  /** a thorn vine hanging over the path at vx: its bud just over his head, dozing `sleep` seconds a cycle */
  const thornAt = (vx: number, sleep: [number, number]) =>
    THORNS.push({ x: Math.round(vx), top: G - 470, bud: G - 112, reach: 105, sleep: R.r(sleep[0], sleep[1]), stir: 1.1, look: 1.7, offset: R.r(0, 10) });
  /**
   * a row of thorn vines, `spacing` apart: room to stand between two of them and freeze. `pits`: every other vine hangs over a soft pit,
   * hopped while it sleeps.
   */
  function vineRow(n: number, sleep: [number, number], spacing: [number, number], pits = false) {
    const x0 = x;
    run(R.r(260, 320));
    for (let k = 0; k < n; k++) {
      if (pits && k % 2 === 1) {
        const w = Math.round(reachJump(0, false) * R.r(0.45, 0.55));
        run(R.r(spacing[0], spacing[1]) - w / 2);
        const edge = x;
        close();
        const far = edge + w;
        softPit(edge, far);
        thornAt((edge + far) / 2, sleep);
        open(far);
        // (the next vine is measured from this one, so the pocket between them stays as wide as the rest)
        x -= w / 2;
        continue;
      } else {
        run(R.r(spacing[0], spacing[1]));
        thornAt(x, sleep);
      }
      // a flower in the pocket before each vine: where he stands to wait
      flower(x - R.r(150, 180), G - 40, 'orchid');
    }
    run(R.r(300, 380));
    expert += (x - x0) / RUN + n * 1.4;
    pieces.push({ k: 'rest', x0, x1: x });
  }

  // ----- 3-6 Grandma's Things: what Dot hid in the ferns -----
  // (3-7's things are others of hers: Dot hid a great many things)
  const THINGS = plan === '3-7' ? ['teacup', 'spectacles', 'thimble', 'ball of wool', 'seed pouch'] : ['locket', 'rattle', 'teddy bear', 'bell'];
  let thingsPlaced = 0;
  /** one of Grandma's things in a fern at px on the surface: crouch beside it to find it (engine.ts, a hidden relic) */
  const thingFern = (px: number, surface: number) => {
    const id = cid++;
    C.push({ id, type: 'relic', hidden: true, x: Math.round(px), y: surface - 26, collected: false, bobPhase: 0, thing: THINGS[id % THINGS.length] });
    thingsPlaced++;
    // nothing else in the fern: a flower there would hide it (and give it away)
    for (let i = C.length - 2; i >= 0; i--) if (C[i].type === 'flower' && Math.abs(C[i].x - px) < 90 && Math.abs(C[i].y - (surface - 26)) < 90) C.splice(i, 1);
  };
  /** a fern that holds nothing, the same as the rest (all ferns look alike) */
  const plainFern = (px: number, surface = G) => W3D.push({ n: 'fern', x: Math.round(px), b: surface + 6, w: 150, flip: R.chance(0.5) });
  /** a stretch of floor with ferns along it, one of them hiding a thing */
  function fernPatch(ferns: number) {
    const x0 = x;
    const len = 300 + ferns * R.r(190, 230);
    run(len);
    const hide = R.i(0, ferns - 1);
    for (let k = 0; k < ferns; k++) {
      const fx = x0 + 200 + ((len - 400) * k) / Math.max(1, ferns - 1);
      if (k === hide) thingFern(fx, G);
      else plainFern(fx);
    }
    expert += len / RUN + 3;
    pieces.push({ k: 'snakes', x0, x1: x });
  }

  if (plan === '3-5') {
    // 3-5 Sleeping Vines: the old thorn vines Grandma said were asleep. One of them moved. Pass under them while they sleep; when one
    // opens an eye, freeze (or duck) until it dozes off again. World 3's keepsake, the medal, is in a Hush Fern along the way.
    beat('Start', () => {
      rest(R.r(600, 720));
      hint(x - 300, 'Grandma said the old thorn vines were asleep...');
      flag();
    });
    beat('Learn: one vine', () => {
      hint(x + 40, 'When a vine opens an eye, freeze! Move on when it sleeps');
      vineRow(1, [5, 6], [380, 420]);
      vineRow(2, [4.5, 5.5], [380, 440]);
      flag();
    });
    beat('Develop: a row of them', () => {
      vineRow(4, [3.6, 4.6], [340, 420]);
      flag();
      // the keepsake: the medal, in a Hush Fern on a quiet stretch
      const keep = findForStage(config.worldIndex, config.miniIndex);
      const k0 = x;
      rest(R.r(560, 640));
      if (keep && keep.kind === 'keepsake') C.push({ id: cid++, type: 'find', findId: keep.id, hidden: true, x: Math.round(k0 + (x - k0) / 2), y: G - 26, collected: false, bobPhase: 0 });
      expert += 3;
      vineRow(4, [3.6, 4.4], [360, 430], true);
      flag();
    });
    beat('Twist: vines in the dark', () => {
      hint(x + 40, 'In the dark, standing still does two things');
      const z0 = x;
      glowDark(R.r(1500, 1700), 1);
      // the vines hang between the glowworms, clear of where the dark starts
      for (let vx = z0 + 640; vx < x - 420; vx += R.r(380, 460)) if (!P.some((pl) => pl.style === 'moss_stone' && vx > pl.x - 120 && vx < pl.x + pl.width + 120)) thornAt(vx, [3.6, 4.4]);
      expert += 3;
      flag();
    });
    beat('Finish', () => {
      let n = 0;
      while (expert < EXPERT_SECONDS - 10 && n < 16) {
        const k = n % 3;
        if (k === 0) vineRow(R.i(3, 4), [3.4, 4.2], [340, 420], n > 2);
        else if (k === 1) { rest(R.r(240, 340)); stumps(); }
        else sporeGap();
        n++;
        if (n % 2 === 0) flag();
      }
      rest(R.r(700, 900));
    });
  }

  if (plan === '3-6') {
    // 3-6 Grandma's Things: Dot hid Grandma's things in the ferns, a LOT of ferns, very fast, because there were boots. Crouch beside a
    // fern that rustles on its own. On the floor first, then up on the grotto's stones, past the spores, and in the dark.
    beat('Start', () => {
      rest(R.r(560, 680));
      hint(x - 340, "Dot hid Grandma's things in the ferns. Crouch beside one that rustles", "Dot hid Grandma's things in the ferns. Hold down beside one that rustles", "Dot hid Grandma's things in the ferns. Hold down beside one that rustles");
      flag();
    });
    beat('Learn: the rustling fern', () => {
      fernPatch(3);
      rest(R.r(240, 320));
      fernPatch(4);
      flag();
    });
    beat('Develop: up high and past the spores', () => {
      // on top of the stones: the highest pillar's top holds a fern
      const x0 = x;
      pillars([60, 130, 90], [0.5, 0.62]);
      const tops = P.filter((pl) => pl.style === 'moss_stone' && pl.x > x0 && pl.y < G - 100);
      const hi = tops.sort((a, b) => a.y - b.y)[0];
      if (hi) thingFern(hi.x + hi.width / 2, hi.y);
      sporeRest(R.r(620, 720));
      fernPatch(3);
      flag();
    });
    beat('Twist: ferns in the dark', () => {
      hint(x + 40, 'Ferns in the dark too. Stand still, and the glowworms help you look');
      const stops = glowDark(R.r(1300, 1500), 1);
      // a fern at the first stop, and plain ones about
      thingFern(stops[0] + 160, G);
      plainFern(stops[0] + 420);
      flag();
    });
    beat('Finish', () => {
      let n = 0;
      while ((expert < EXPERT_SECONDS - 10 || thingsPlaced < GRANDMA_GOAL_36 + 2) && n < 16) {
        const k = n % 3;
        if (k === 0) fernPatch(R.i(3, 4));
        else if (k === 1) highRoad();
        else { rest(R.r(240, 340)); stumps(); }
        n++;
        if (n % 2 === 0) flag();
      }
      rest(R.r(700, 900));
    });
  }

  // ----- 3-7 Which Fern?: Grandma's things, among everything the grotto has taught so far -----
  /**
   * a row of thorn vines with a fern under each: crouching beside a fern to search is also keeping still, so a vine that wakes while he
   * searches lets him be. One fern of the row holds a thing; the others are only ferns.
   */
  function vineFerns(n: number, sleep: [number, number], spacing: [number, number]) {
    const x0 = x;
    run(R.r(260, 320));
    const hide = R.i(0, n - 1);
    for (let k = 0; k < n; k++) {
      run(R.r(spacing[0], spacing[1]));
      thornAt(x, sleep);
      // the fern a little to one side of the vine, still well inside its reach
      const fx = x + (R.chance(0.5) ? -1 : 1) * Math.round(R.r(30, 50));
      if (k === hide) thingFern(fx, G);
      else plainFern(fx);
    }
    run(R.r(300, 380));
    expert += (x - x0) / RUN + n * 1.6 + 1.5;
    pieces.push({ k: 'rest', x0, x1: x });
  }
  /**
   * ferns the eyes watch: hiding ferns (bushes) and searching ferns in turn. A search takes a moment out in the open, so it is done
   * between the eyes' passes, and the next hiding fern is never far.
   */
  function watchedFerns(n: number, calm: [number, number]) {
    const x0 = x;
    const hide = R.i(0, n - 1);
    for (let k = 0; k < n; k++) {
      run(R.r(300, 360));
      bush(x - BUSH_W.grotto / 2, 'grotto');
      run(R.r(260, 320));
      if (k === hide) thingFern(x, G);
      else plainFern(x);
    }
    run(R.r(300, 360));
    bush(x - BUSH_W.grotto / 2, 'grotto');
    run(R.r(260, 340));
    ZONES.push({ x0, x1: x, calm });
    expert += watched(x - x0, (calm[0] + calm[1]) / 2) + 2;
    pieces.push({ k: 'rest', x0, x1: x });
  }

  if (plan === '3-7') {
    // 3-7 Which Fern?: all ferns look alike, and Dot has apologized to twelve of them. More of Grandma's things, hidden among everything
    // the grotto has taught: a fern under a sleeping vine (crouching to search is keeping still), ferns the eyes watch (search between
    // their passes), and in the twist ferns under vines in the dark, where crouching does three things at once.
    beat('Start', () => {
      rest(R.r(560, 680));
      hint(x - 340, 'More of Grandma\'s things. Crouch beside a fern that rustles', 'More of Grandma\'s things. Hold down beside a fern that rustles', 'More of Grandma\'s things. Hold down beside a fern that rustles');
      fernPatch(3);
      flag();
    });
    beat('Learn: a fern under a vine', () => {
      hint(x - 200, 'Searching is keeping still. A vine that wakes leaves you be');
      vineFerns(2, [4.6, 5.4], [420, 480]);
      rest(R.r(240, 320));
      vineFerns(3, [4.2, 5], [400, 460]);
      flag();
    });
    beat('Develop: ferns the eyes watch', () => {
      hint(x + 40, 'The eyes are back. Search between their looks, and hide in the next fern');
      watchedFerns(2, [6.5, 7.5]);
      flag();
      sporeRest(R.r(600, 700));
      watchedFerns(3, [5.8, 6.8]);
      flag();
    });
    beat('Twist: ferns in the dark, under the vines', () => {
      hint(x + 40, 'In the dark, under a vine, crouching by a fern does three things at once');
      const z0 = x;
      const stops = glowDark(R.r(1500, 1700), 1);
      // a vine over the first stop, with the fern that hides a thing under it; plain ferns about
      const vx = stops[0] + 150;
      thornAt(vx, [4.2, 5]);
      thingFern(vx + 40, G);
      plainFern(stops[0] + 470);
      for (let fx = z0 + 900; fx < x - 500; fx += R.r(420, 520)) if (!P.some((pl) => pl.style === 'moss_stone' && fx > pl.x - 140 && fx < pl.x + pl.width + 140)) plainFern(fx);
      expert += 3;
      flag();
    });
    beat('Finish', () => {
      let n = 0;
      while ((expert < EXPERT_SECONDS - 10 || thingsPlaced < GRANDMA_GOAL_37 + 2) && n < 16) {
        const k = n % 4;
        if (k === 0) vineFerns(R.i(3, 4), [3.8, 4.6], [380, 450]);
        else if (k === 1) fernPatch(R.i(4, 5));
        else if (k === 2) watchedFerns(R.i(2, 3), [5.2, 6.2]);
        else { rest(R.r(240, 340)); stumps(); }
        n++;
        if (n % 2 === 0) flag();
      }
      rest(R.r(700, 900));
    });
  }

  // ----- 3-8 Thorn Vine Swing: lianas with old thorn vines hanging in the gaps between them -----
  /**
   * a chain of lianas (chain(): every vine catches the next) with a thorn vine hanging in each gap between two of them, low enough
   * that the leap from one to the next passes through its reach. Hanging on a liana he is out of its sight (thornVine.ts), so he waits
   * there while it looks and leaps while it sleeps. Neighbouring vines keep different rhythms.
   */
  function thornChain(n: number, soft: boolean, sleep: [number, number]) {
    const before = V.length;
    chain(n, soft, soft ? 'hollow' : 'gorge');
    const ls = V.slice(before).filter((v) => v.isSwingingVine).sort((a, b) => a.x - b.x);
    for (let k = 0; k + 1 < ls.length; k++) {
      const mx = Math.round((ls[k].x + ls[k + 1].x) / 2);
      // the bud just above the highest his feet go in that leap, and its reach down to the floor of the gap: a leap taken while it
      // looks always passes through it, and the next liana (60 px of grab either side) is clear of it
      const reach = Math.min(95, Math.round((ls[k + 1].x - ls[k].x) / 2 - 70));
      const band = leapBand(ls[k], ls[k + 1], mx, reach) ?? [G - 260, G - 120];
      const bud = Math.round(band[0] - 8);
      const sl = R.r(sleep[0], sleep[1]);
      THORNS.push({ x: mx, top: Math.min(bud - 200, ls[k].topY), bud, reach, below: Math.round(band[1] - bud + 40), sleep: sl, stir: 1.1, look: 1.8, offset: R.r(0, sl + 2.9) });
      expert += 1.4;
    }
  }

  if (plan === '3-8') {
    // 3-8 Thorn Vine Swing: swing past the thorn vines without touching the thorns. A sloth hanging on a liana is the stillest thing
    // in the forest, so the vines cannot see him there: ride the liana while the vine in the next gap looks, and leap while it sleeps.
    // The timed swing's gold ring says when to let go; the vine's eye says whether. World 3's photo album is in a fern on the way.
    beat('Start', () => {
      rest(R.r(600, 720));
      hint(x - 320, 'Thorn vines hang between the lianas. Swing past without touching the thorns');
      flag();
    });
    beat('Learn: one vine in the gap', () => {
      // (said on the walk up, so Dot's line is gone by the time he is on the liana: it hangs where the vine and he are)
      hint(x - 260, 'Hang on while the thorn vine looks. Let go while it sleeps');
      thornChain(2, true, [4.8, 5.6]);
      rest(R.r(260, 340));
      thornChain(2, true, [4.4, 5.2]);
      flag();
    });
    beat('Develop: a longer chain', () => {
      thornChain(3, false, [4.2, 5]);
      flag();
      // the photo album, in a Hush Fern on a quiet stretch between the chains
      const book = findForStage(config.worldIndex, config.miniIndex);
      const b0 = x;
      rest(R.r(560, 660));
      if (book && book.kind === 'book') C.push({ id: cid++, type: 'find', findId: book.id, hidden: true, x: Math.round(b0 + (x - b0) / 2), y: G - 26, collected: false, bobPhase: 0 });
      expert += 3;
      thornChain(3, false, [4, 4.8]);
      flag();
    });
    beat('Twist: a vine over the landing', () => {
      hint(x - 260, 'One hangs over the landing too. Land, and freeze if it wakes');
      thornChain(3, false, [3.8, 4.6]);
      // the far bank: a sleeping vine just past where he lands (3-5's rule: on the ground, standing still is safe)
      const landX = x;
      run(R.r(220, 280));
      thornAt(x, [3.6, 4.4]);
      run(R.r(300, 360));
      expert += (x - landX) / RUN + 1.6;
      flag();
    });
    beat('Finish', () => {
      let n = 0;
      while (expert < EXPERT_SECONDS - 10 && n < 14) {
        const k = n % 3;
        if (k === 0) thornChain(R.i(3, 4), false, [3.6, 4.4]);
        else if (k === 1) { rest(R.r(240, 340)); stumps(); }
        else vineRow(R.i(2, 3), [3.6, 4.4], [360, 430]);
        n++;
        flag();
      }
      rest(R.r(700, 900));
    });
  }

  // ----- 3-9 The Prowler's Ring: a ring of clawed limestone, and the prowlers it belongs to -----
  /**
   * the ring: limestone shelves round a floor, walled at its far end. When he comes in, ocelots and then a jaguar leap in out of the
   * dark at its edge in waves (engine.ts updateRing), and the wall gives way when every one is down.
   */
  function prowlerRing() {
    const x0 = x;
    run(R.r(180, 240));
    const r0 = x;
    const W = Math.round(R.r(1150, 1250));
    const ly = G - 140, ty = G - 270;
    const L = branch(r0 + 160, r0 + 420, ly);
    const Rb = branch(r0 + W - 420, r0 + W - 160, ly);
    const Tp = branch(r0 + W / 2 - 170, r0 + W / 2 + 170, ty);
    row(Tp.x + 50, Tp.x + Tp.width - 50, ty - 34, 3, 'orchid');
    // a heart on the high shelf: the ring is a long fight
    C.push({ id: cid++, type: 'heart', x: Math.round(Tp.x + Tp.width / 2), y: ty - 80, collected: false, bobPhase: 0 });
    const wall = block(r0 + W, r0 + W + 120, 330);
    const mid = (pl: Platform) => pl.x + pl.width / 2;
    RING = {
      x0: r0, x1: r0 + W, wallId: wall.id,
      waves: [
        [{ x: r0 + W * 0.5, surface: G, kind: 'ocelot' }, { x: mid(L), surface: ly, kind: 'ocelot' }],
        [{ x: r0 + W * 0.35, surface: G, kind: 'ocelot' }, { x: mid(Rb), surface: ly, kind: 'ocelot' }, { x: r0 + W * 0.65, surface: G, kind: 'ocelot' }],
        [{ x: r0 + W * 0.55, surface: G, kind: 'jaguar' }, { x: mid(Tp), surface: ty, kind: 'ocelot' }],
      ],
    };
    // the scratched floor: pawprints round the ring
    prints(r0 + 120, r0 + W - 120);
    // Matt's ring pieces: a clawed pillar at the way in, a low scratched wall and old bones inside, and the way out a cracked pillar that
    // lies broken once the ring is cleared (it stands over the wall block, and is drawn only while the block stands, then the broken one)
    W3D.push({ n: 'pillar', x: r0 + 30, b: G + 6, w: 150 });
    W3D.push({ n: 'ringWall', x: r0 + W * 0.5, b: G + 8, w: 250 });
    W3D.push({ n: 'bones', x: r0 + W * 0.28, b: G + 6, w: 120 });
    W3D.push({ n: 'pillarCracked', x: r0 + W + 60, b: G + 6, w: 170, front: true, wall: wall.id });
    W3D.push({ n: 'pillarBroken', x: r0 + W + 60, b: G + 8, w: 300, wall: wall.id, whenBroken: true });
    x = r0 + W + 120;
    run(R.r(260, 340));
    expert += (x - x0) / RUN + 24;
    pieces.push({ k: 'snakes', x0, x1: x });
  }

  if (plan === '3-9') {
    // 3-9 The Prowler's Ring: break out of the ring. The prowlers again, now all together: ocelots on the floor and the shelves, a jaguar,
    // the dark between fights, and the ring, where they leap in out of the dark in waves until every one is down and the way opens.
    const placed = () => E.filter((e) => e.type === 'ocelot' || e.type === 'jaguar').length;
    beat('Start', () => {
      const x0 = x;
      rest(R.r(620, 740));
      prints(x0 + 200, x - 80);
      hint(x0 + 120, 'Pawprints in a circle, and they all go one way...');
      flag();
    });
    beat('Learn: two at once', () => {
      hint(x + 40, 'Two prowlers! Keep one in front of you');
      prowlFloor(['ocelot', 'ocelot']);
      rest(R.r(240, 320));
      prowlShelves(3, G - 140);
      flag();
    });
    beat('Develop: the jaguar, and the dark', () => {
      prowlFloor(['jaguar', 'ocelot']);
      flag();
      glowDark(R.r(1000, 1200), 1);
      prowlShelves(4, G - 150);
      flag();
    });
    beat('Twist: the ring', () => {
      hint(x + 60, 'The ring! They will come out of the dark. Drive them all off to open the way');
      prowlerRing();
      flag();
    });
    beat('Finish', () => {
      let n = 0;
      while ((expert < EXPERT_SECONDS - 10 || placed() < Math.ceil(PROWLER_GOAL_39 * 1.4)) && n < 16) {
        const k = n % 4;
        if (k === 0) prowlShelves(R.i(3, 4), G - Math.round(R.r(120, 160)));
        else if (k === 1) { rest(R.r(250, 400)); prowlFloor([R.chance(0.4) ? 'jaguar' : 'ocelot', 'ocelot']); }
        else if (k === 2) glowDark(R.r(900, 1100), 1);
        else sporeGap();
        n++;
        if (n % 2 === 0) flag();
      }
      rest(R.r(700, 900));
    });
  }

  // ======================================================================================================================
  // World 4, the Mist Cascades (2026-10-25): the leaf, and the wind. Gusts blow on a beat (zones.ts), and bamboo chimes on posts beside
  // each gust lane ring and swing the way the next gust will blow while it warns (w4Kit.ts chimeLean): read them, and jump with the
  // wind behind you or wait for it to drop. The leaf is taught here (learned on clearing 4-1) but no drop needs it before 4-7.
  const W4C: Chime[] = [];
  /** a gust lane over [x0, x1] (`dir` +1: behind him, -1: into his face), with its chimes on a post at `chimeX` */
  const gustZone = (x0: number, x1: number, dir: 1 | -1, chimeX: number, force = 120) => {
    GZ.push({ kind: 'wind', x0: Math.round(x0), x1: Math.round(x1), top: G - 560, bottom: G + 40, baseY: G, dir, period: 2.8 + 1.4 + 2.2, warn: 1.4, active: 2.2, force, offset: Math.round(R.r(0, 6.4) * 10) / 10 });
    W4C.push({ x: Math.round(chimeX), y: G, zone: GZ.length - 1 });
  };
  /**
   * the leaf, taught: up a trunk to a perch that ends at the edge of a soft pit, and a gap a double jump still crosses (from the perch
   * or from the ground: the leaf makes it easy, it is never needed). Petals trail down the way the leaf drifts.
   */
  function leafDrop(share: number) {
    const x0 = x;
    run(R.r(280, 340));
    const tX = x - 130;
    const perchY = Math.round(G - R.r(230, 270));
    trunk(tX, G, perchY);
    branch(tX - 40, x, perchY);
    for (let i = 0; i < 3; i++) flower(tX, G - 70 - i * 55, 'hibiscus');
    const edge = x;
    close();
    const gap = Math.round(reachJump(0, true) * share);
    const far = edge + gap;
    softPit(edge, far);
    for (let i = 1; i <= 4; i++) {
      const u = i / 5;
      flower(Math.round(edge + gap * u), Math.round(perchY - 10 + (G - 70 - perchY) * u * u), 'orchid');
    }
    open(far);
    run(R.r(260, 320));
    expert += (tX - x0) / RUN + (G - perchY) / CLIMB + 1.2 + (x - edge) / RUN;
    pieces.push({ k: 'canopy', x0, x1: x });
  }
  /**
   * a gap with a gust lane over it. Behind him (+1): a plain jump crosses it, and with the gust a glide carries far out to petals only
   * the wind reaches. Into his face (-1): small enough that the double jump still makes it in the gust (levelCheck), easy in the calm.
   */
  function gustGap(dir: 1 | -1) {
    const x0 = x;
    run(R.r(320, 380));
    const edge = x;
    close();
    const one = reachJump(0, false);
    // (the level check keeps every gap under a gust within a safe plain jump, and a headwind's within the double jump)
    const gap = Math.round(dir > 0 ? Math.min(one * R.r(0.68, 0.74), SAFE.gap1 - 12) : Math.min(one * 0.6, SAFE.gap2 - 120 * 0.7 - 40));
    const far = edge + gap;
    softPit(edge, far);
    if (dir > 0) arc(edge + 20, far + 140, G - 175, 5, 'hibiscus');
    else flower(edge + gap / 2, G - 110, 'orchid');
    open(far);
    run(R.r(320, 380));
    gustZone(edge - 170, far + 110, dir, edge - 120);
    expert += (x - x0) / RUN + (dir < 0 ? 3.2 : 1.2);
    pieces.push({ k: 'rest', x0, x1: x });
  }

  /**
   * the secret: a tall trunk to a perch 400 px up, and out past its end a little ledge with a golden seed, too far for any jump and too
   * high to reach from the ground: only the leaf drifts that far. The ground runs on underneath, so a try costs nothing.
   */
  function leafSecret() {
    const x0 = x;
    run(R.r(300, 360));
    const tX = x - 140;
    const perchY = G - 400;
    trunk(tX, G, perchY);
    const perch = branch(tX - 40, tX + 170, perchY);
    row(perch.x + 70, perch.x + perch.width - 30, perchY - 34, 2, 'hibiscus');
    const drop = 160;
    const lx = Math.round(perch.x + perch.width + reachJump(-drop, true) * 1.08);
    branch(lx, lx + 130, perchY + drop);
    goldenSeed(lx + 25, perchY + drop - 34);
    hint(x0 + 40, 'Something shiny, far out from the top of that tree...');
    x = Math.max(x, lx + 130 + 260);
    expert += (tX - x0) / RUN + (x - tX) / RUN;
    pieces.push({ k: 'rest', x0, x1: x });
  }

  /**
   * the leaf on the wind (4-2's second twist): up a trunk to a high perch at the edge of a soft pit, and a gust lane behind him out over
   * the pit and the far bank, its chimes on the end of the perch. The lane stops just above the ground (nothing he stands on is in it but
   * the perch's end, so no gust shoves him along a bank): it is the air the leaf drifts through. Open the leaf as the chimes swing his way
   * and the gust carries it far out along the petals; in the calm the leaf, or the second jump, still crosses (the pit is leafDrop's).
   */
  function gustLeaf() {
    const x0 = x;
    run(R.r(300, 360));
    const tX = x - 150;
    const perchY = Math.round(G - R.r(260, 290));
    trunk(tX, G, perchY);
    branch(tX - 40, x, perchY);
    for (let i = 0; i < 3; i++) flower(tX, G - 70 - i * 55, 'hibiscus');
    const edge = x;
    close();
    const gap = Math.round(reachJump(0, true) * R.r(0.78, 0.86));
    const far = edge + gap;
    softPit(edge, far);
    // the petals ride the wind: two just off the perch, then a long high line out over the far bank, where the gust carries the leaf
    // (each one a double jump from the bank, so the wind and the leaf are never needed for them)
    for (let i = 1; i <= 2; i++) flower(edge + 70 * i, perchY + 12 * i, 'orchid');
    for (let i = 0; i < 4; i++) flower(Math.round(far - 60 + 150 * i), Math.round(G - 185 + 7 * i), 'orchid');
    GZ.push({ kind: 'wind', x0: edge - 20, x1: far + 420, top: G - 600, bottom: G - 24, baseY: G, dir: 1, period: 2.8 + 1.4 + 2.2, warn: 1.4, active: 2.2, force: 120, offset: Math.round(R.r(0, 6.4) * 10) / 10 });
    W4C.push({ x: edge - 12, y: perchY, zone: GZ.length - 1 });
    open(far);
    run(R.r(480, 560));
    expert += (tX - x0) / RUN + (G - perchY) / CLIMB + 1.6 + (x - edge) / RUN;
    pieces.push({ k: 'canopy', x0, x1: x });
  }

  /**
   * the wind turns (4-2's second twist): stepping stones over a soft pit under two gust lanes, the first behind him and the second in his
   * face. The first lane's chimes stand on the bank; the second's on the broad stone in the middle, where the wind turns. Each gap keeps
   * the gust rules (a plain jump with the wind behind, the double jump into it), so he hops with the first gust, then waits on the broad
   * stone for the second to drop.
   */
  function turnStones() {
    const x0 = x;
    run(R.r(300, 360));
    const edge = x;
    close();
    const one = reachJump(0, false);
    const tail = () => Math.round(Math.min(one * R.r(0.6, 0.68), SAFE.gap1 - 12));
    const head = () => Math.round(Math.min(one * R.r(0.5, 0.55), SAFE.gap2 - 120 * 0.7 - 40));
    const stones: Platform[] = [];
    const stone = (gap: number, h: number, w: number) => {
      const last = stones[stones.length - 1];
      const sx = (last ? last.x + last.width : edge) + gap;
      const p: Platform = { id: pid++, x: sx, y: G - h, width: w, height: HOLLOW_Y - (G - h) + 10, type: 'solid', style: 'moss_stone' };
      P.push(p);
      stones.push(p);
      flower(sx + w / 2, G - h - 34, 'orchid');
      return p;
    };
    stone(tail(), Math.round(R.r(45, 65)), Math.round(R.r(140, 170)));
    stone(tail(), Math.round(R.r(70, 95)), Math.round(R.r(140, 170)));
    const mid = stone(tail(), Math.round(R.r(60, 85)), Math.round(R.r(230, 270)));
    stone(head(), Math.round(R.r(80, 105)), Math.round(R.r(130, 160)));
    stone(head(), Math.round(R.r(50, 75)), Math.round(R.r(130, 160)));
    const lastS = stones[stones.length - 1];
    const far = lastS.x + lastS.width + head();
    softPit(edge, far);
    const turn = Math.round(mid.x + mid.width * 0.45);
    gustZone(edge - 170, turn, 1, edge - 120);
    gustZone(turn, far + 110, -1, turn + 30);
    W4C[W4C.length - 1].y = mid.y;
    open(far);
    run(R.r(320, 380));
    expert += (x - x0) / RUN + 0.6 * stones.length + 1.2 + 3.2;
    pieces.push({ k: 'stumps', x0, x1: x });
  }

  if (plan === '4-2') {
    // 4-2 First Glide: learn the leaf over soft moss, then the chimes and the gusts behind him, then the twist: gusts into his face,
    // waited out. A canopy road with a seed only the leaf reaches (the secret). Open the leaf and drift across the falls to the shrine.
    beat('Start: the falls', () => {
      rest(R.r(560, 680));
      hint(x - 420, 'Across the falls to the shrine!');
      rest(R.r(260, 340));
      flag();
    });
    beat('Learn: the leaf', () => {
      hint(x + 40, 'Your leaf! Flick up, then keep your thumb on the glass as you fall', 'Your leaf! Hold Jump as you fall', 'Your leaf! Hold Space as you fall');
      leafDrop(0.72);
      rest(R.r(240, 320));
      leafDrop(0.86);
      flag();
    });
    beat('Develop: the chimes', () => {
      hint(x + 40, 'Hear the chimes? They ring before the wind blows. Jump with it behind you');
      gustGap(1);
      rest(R.r(220, 300));
      gustGap(1);
      flag();
    });
    beat('Twist: into the wind', () => {
      hint(x + 40, 'The chimes swing back at you: the wind will blow against you. Wait for it to drop');
      gustGap(-1);
      rest(R.r(220, 300));
      gustGap(-1);
      rest(R.r(200, 260));
      leafSecret();
      flag();
    });
    beat('Twist again: the wind turns', () => {
      // the leaf and the gusts together: a high wind that carries the leaf far, then a crossing where the wind turns halfway over
      hint(x + 40, 'Wind up high! Open your leaf as the chimes swing your way, and ride it far');
      gustLeaf();
      rest(R.r(220, 300));
      flag();
      hint(x + 40, 'The wind turns halfway across! The chimes on the big stone tell you the second gust');
      turnStones();
      rest(R.r(220, 300));
      gustLeaf();
      flag();
    });
    beat('Finish', () => {
      // 4-2 runs three minutes (STAGE_SECONDS); the walk to the shrine (rest(700..900), at least 2.4 s) closes it
      let n = 0;
      while (expert + 2.5 < stageSeconds('4-2') && n < 40) {
        const k = n % 5;
        if (k === 0) leafDrop(R.r(0.78, 0.88));
        else if (k === 1) gustGap(R.chance(0.5) ? 1 : -1);
        else if (k === 2) pillars(R.shuffle([50, 110, 70, 130]), [0.55, 0.7]);
        else if (k === 3) highRoad();
        else if (R.chance(0.5)) turnStones();
        else gustLeaf();
        rest(R.r(220, 300));
        n++;
        if (n % 3 === 0) flag();
      }
      rest(R.r(700, 900));
    });
  }

  // 4-5 The Sovereign's Dive (2026-10-25): the Sky Sovereign herself hunts along the foot of the cliffs, the way the eagle did in 1-7
  // (watcher.ts: calm, a scream and her shadow at the edge, then the sweep). Hide from her the old way, crouched in a bush, or the World
  // 4 way: stand behind a curtain of water pouring off the cliff (waterfalls.ts `veil`; the engine counts it as hidden). Capuchin
  // lookouts sit on the path watching the stretch ahead of them: seen in the open, one stares, then screeches and brings her pass early.
  // Punch the fruit down from the tree before its stretch and it goes off to eat (capuchin.ts), and sees nothing while it eats.
  const W4X: W4Extras = {};
  if (plan === '4-5') {
    const FALLS4: Waterfall[] = (W4X.falls = []);
    const MONKEYS: Capuchin[] = (W4X.monkeys = []);
    const FRUIT: FruitTree[] = (W4X.fruit = []);
    /** a curtain's width: room for him to stand inside it with a step to spare either side */
    const VEIL_W = 140;
    /** the fruit hangs this high (a standing punch knocks it down: w4Play reaches 70 px from his fist) */
    const FRUIT_Y = G - 85;
    /** a curtain of water centred on cx, from far above the view down onto the path */
    const veil = (cx: number) => FALLS4.push({ id: FALLS4.length + 1, x: Math.round(cx - VEIL_W / 2), width: VEIL_W, top: G - 1100, bottom: G, veil: true });
    type Cover = Bush['kind'] | 'fall';
    /** a place to hide, centred on the cursor */
    const cover = (kind: Cover) => (kind === 'fall' ? veil(x) : bush(x - BUSH_W[kind] / 2, kind));
    /** cover along the ground `gap` apart (a run, a place to hide, a run...), petals between, under her watch */
    function coverRow(n: number, gap: [number, number], kinds: Cover[], calm: [number, number]) {
      const x0 = x;
      for (let k = 0; k < n; k++) {
        const g = R.r(gap[0], gap[1]);
        if (k > 0) row(x + 80, x + g - 80, G - 34, Math.max(1, Math.round(g / 260)), 'orchid');
        run(g);
        cover(kinds[k % kinds.length]);
      }
      run(R.r(260, 340));
      ZONES.push({ x0, x1: x, calm });
      expert += watched(x - x0, (calm[0] + calm[1]) / 2);
      pieces.push({ k: 'rest', x0, x1: x });
    }
    /** a lookout sitting on the path at mx, watching sx0..x1, and its fruit tree (`trunk` 1: the trunk stands right of the fruit) */
    function lookout(sx0: number, mx: number, x1: number, fruitX: number, trunk?: 1) {
      MONKEYS.push({ job: 'lookout', x: Math.round(mx), y: G, x0: Math.round(sx0), x1: Math.round(x1) });
      FRUIT.push({ x: Math.round(fruitX), y: FRUIT_Y, ground: G, ...(trunk ? { trunk } : {}) });
    }
    /**
     * a lookout on the path, watching the stretch ahead of it (to at most 1150 px past it: w4Play steps monkeys within 1200 px of him),
     * with cover along the stretch for her passes. Its fruit tree stands just short of the stretch: punch the fruit down from there and
     * it walks back to eat.
     */
    function lookoutRun(kinds: Cover[], gap: [number, number], calm: [number, number]) {
      const x0 = x;
      run(R.r(240, 300));
      const tx = x;
      const sx0 = tx + 110;
      const mx = sx0 + R.r(40, 80);
      x = mx;
      for (const kind of kinds) {
        const g = R.r(gap[0], gap[1]);
        row(x + 80, x + g - 80, G - 34, Math.max(1, Math.round(g / 260)), 'orchid');
        run(g);
        cover(kind);
      }
      run(R.r(200, 240));
      lookout(sx0, mx, Math.min(x, mx + 1150), tx);
      run(R.r(160, 220));
      ZONES.push({ x0, x1: x, calm });
      expert += watched(x - x0, (calm[0] + calm[1]) / 2) + 1.5;
      pieces.push({ k: 'rest', x0, x1: x });
    }
    /**
     * two lookouts in a row: the first one's fruit is the old trick, and its stretch ends in a curtain of water. The second one's tree
     * stands just past that curtain, low enough to punch from inside the water, where neither of them (nor she) can see him.
     */
    function lookoutPair(calm: [number, number]) {
      const x0 = x;
      run(R.r(240, 300));
      const tA = x;
      const a0 = tA + 110;
      const mA = a0 + R.r(40, 80);
      x = mA;
      run(R.r(360, 420));
      cover(R.pick(['tall', 'fern'] as const));
      row(x + 80, x + 300, G - 34, 2, 'orchid');
      run(R.r(380, 440));
      const fx = x;
      veil(fx);
      lookout(a0, mA, fx, tA);
      // the second tree, just outside the water: from inside it, facing on, his fist reaches it (w4Play: 70 px)
      const tB = fx + VEIL_W / 2 + 15;
      const mB = tB + R.r(170, 210);
      x = mB;
      run(R.r(360, 420));
      cover(R.pick(['fall', 'wide'] as const));
      run(R.r(300, 360));
      lookout(fx + VEIL_W / 2, mB, Math.min(x, mB + 1150), tB, 1);
      run(R.r(160, 220));
      ZONES.push({ x0, x1: x, calm });
      expert += watched(x - x0, (calm[0] + calm[1]) / 2) + 3;
      pieces.push({ k: 'rest', x0, x1: x });
    }
    /**
     * the secret: one curtain hides a trunk in the hollow behind it, up to a branch path behind leaves with a golden seed at its end.
     * From outside it looks like any other curtain; climb up from inside the water.
     */
    function secretFall(calm: [number, number]) {
      const x0 = x;
      run(R.r(380, 460));
      veil(x);
      const tX = Math.round(x);
      const perchY = Math.round(G - 160);
      trunk(tX, G, perchY);
      const end = tX + Math.round(R.r(360, 420));
      branch(tX - 40, end, perchY);
      row(tX + 90, end - 90, perchY - 34, 3, 'hibiscus');
      goldenSeed(end - 40, perchY - 34);
      covers.push({ x: tX + VEIL_W / 2, y: perchY - 90, w: end - tX - VEIL_W / 2 + 20, h: 110 });
      run(R.r(520, 620));
      ZONES.push({ x0, x1: x, calm });
      expert += watched(x - x0, (calm[0] + calm[1]) / 2);
      pieces.push({ k: 'rest', x0, x1: x });
    }

    beat('Start: the cliff path', () => {
      rest(R.r(560, 680));
      hint(x - 420, 'The Sky Sovereign is hunting along the cliffs. Stay under cover!');
      rest(R.r(200, 260));
      flag();
    });
    beat('Learn: under cover', () => {
      hint(x + 20, 'Her shadow! Slide down inside a bush to hide', 'Her shadow! Hold down inside a bush to hide', 'Her shadow! Hold down inside a bush to hide');
      coverRow(3, [380, 460], ['tall', 'wide', 'fern'], [7.5, 9]);
      hint(x + 20, 'Stand behind a waterfall. She cannot see you through the water');
      coverRow(4, [400, 480], ['fall'], [7, 8.5]);
      flag();
    });
    beat('Develop: the lookout', () => {
      hint(x + 20, 'A monkey lookout! If it sees you, it calls her. Tap to punch the fruit down, and it will go and eat', 'A monkey lookout! If it sees you, it calls her. Press Punch to knock the fruit down, and it will go and eat', 'A monkey lookout! If it sees you, it calls her. Press J to knock the fruit down, and it will go and eat');
      lookoutRun(['fall', 'wide'], [380, 440], [6, 7.5]);
      rest(R.r(240, 320));
      coverRow(3, [640, 780], ['fall', 'fern', 'fall'], [5, 6.2]);
      flag();
    });
    beat('Twist: two lookouts', () => {
      hint(x + 20, 'Two lookouts! Knock the second fruit down from behind the waterfall');
      lookoutPair([5, 6]);
      rest(R.r(220, 300));
      secretFall([5, 6]);
      stumps();
      flag();
    });
    beat('Finish', () => {
      let n = 0;
      while (expert < EXPERT_SECONDS - 10 && n < 16) {
        const k = n % 3;
        if (k === 0) coverRow(3, [700, 860], R.shuffle<Cover>(['fall', 'wide', 'fall']), [4.6, 5.6]);
        else if (k === 1) lookoutRun(R.shuffle<Cover>(['fall', 'tall']), [400, 460], [4.8, 5.8]);
        else lookoutPair([4.6, 5.6]);
        rest(R.r(220, 300));
        n++;
        if (n % 2 === 0) flag();
      }
      rest(R.r(700, 900));
    });
  }

  // ----- 4-4 Crosswind: lianas over the gorges, and gusts blowing across them -----
  /** Dot's knots (w4Kit.ts DotKnot) and the rocks coming loose over a landing (rockfall.ts) */
  const W4K: DotKnot[] = [];
  const W4R: RockDrop[] = [];
  /** how hard a crosswind gust blows (px/s; the level check allows up to 160) */
  const CROSS = 140;
  /**
   * a crosswind gorge: a chain of lianas where every vine catches the next in the calm (chain()'s checks), with its first gap wide, and a
   * gust lane over the whole chain, its chimes on a post at the near edge. In the wide gap a plain leap in the calm falls about half the
   * time and the second jump always makes it; a gust behind him (`dir` +1) carries a plain leap over; a gust in his face (-1) pulls it
   * short, so he hangs on and lets it blow past (wind only pushes him in the air: on the vine he is safe). The gust behind is checked
   * too, so it never carries him past the next vine or the far bank. `soft`: a mossy floor under it (taught). `rock`: rocks come loose
   * over the far bank's landing, so he waits on the last vine for the shadow.
   */
  function windChain(n: number, dir: 1 | -1, soft: boolean, rock = false) {
    const x0 = x;
    run(R.r(240, 320));
    const edge = x;
    for (let tries = 0; tries < 16; tries++) {
      const easy = soft || tries > 8;
      const d0 = R.r(150, 175);
      const wide = easy ? R.r(375, 392) : R.r(388, 412);
      const sp = Array.from({ length: n - 1 }, (_, k) => (k === 0 ? wide : R.r(300, 330)));
      const d1 = R.r(200, 240);
      const xs = [edge + d0];
      for (const s of sp) xs.push(xs[xs.length - 1] + s);
      const farX = xs[n - 1] + d1;
      const tops = xs.map(() => (soft ? Math.round(R.r(190, 215)) : Math.round(R.r(150, 200))));
      const vs: Vine[] = xs.map((vx, k) => ({ id: -1 - k, x: vx, topY: tops[k], bottomY: Math.min(G + 30, tops[k] + 410), swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true }));
      const far: Platform = { id: -99, x: farX, y: G, width: 400, height: BANK_H, type: 'solid' };
      let ok = jumpGrab(edge, G, vs[0]) >= 4;
      for (let k = 0; ok && k < n - 1; k++) {
        ok = catchWindow(vs[k], vs[k + 1]) > 0.6 && earlyCatch(vs[k], vs[k + 1]) && catchWindow(vs[k], vs[k + 1], CROSS) > 0.6 && earlyCatch(vs[k], vs[k + 1], 0.5, CROSS);
      }
      if (ok) ok = landWindow(n > 1 ? vs[n - 2] : null, vs[n - 1], far) >= 8 && landWindow(n > 1 ? vs[n - 2] : null, vs[n - 1], far, CROSS) >= 8;
      if (!ok && tries < 15) continue;
      close();
      if (soft) softPit(edge, farX);
      for (let k = 0; k < n; k++) {
        liana(xs[k], vs[k].topY, vs[k].bottomY);
        arc(k === 0 ? edge + 10 : (xs[k - 1] + xs[k]) / 2, k === n - 1 ? farX - 10 : (xs[k] + xs[k + 1]) / 2, Math.min(G - 150, vs[k].topY + 200), 4);
      }
      // the lane: from just behind the first vine (where the first leap starts) to just short of the far bank, so no ground stands in it
      gustZone(xs[0] - 50, farX - 10, dir, edge - 80, CROSS);
      open(farX);
      if (rock) {
        const rx = Math.round(farX + R.r(80, 110));
        const r: RockDrop = { x: rx, top: G - 470, land: G, every: Math.round(R.r(5, 5.6) * 10) / 10, warn: 1.4, offset: Math.round(R.r(0, 5) * 10) / 10 };
        if (rockFits(r)) W4R.push(r);
        run(R.r(380, 440));
      } else run(R.r(140, 200));
      expert += (edge - x0) / RUN + (farX - edge) / SWING + 0.3 * n + 2.4 + (rock ? 2 : 0) + (x - farX) / RUN;
      pieces.push({ k: soft ? 'hollow' : 'gorge', x0, x1: x });
      return;
    }
  }

  /**
   * where a knotted vine ends while it is tied (w4Play.ts tiedBottom): its knot, low enough to be on screen above him while he waits
   * there, and well out of reach of any jump (his hands would need to come within 30 px of it, and the double jump stops 35 short)
   */
  const KNOT_Y = Math.round(G - RISE - 66);
  /**
   * Dot's knot: the gorge's first liana hangs over the end of the bank, tied up out of reach (it ends at its knot, w4Play.ts). Standing
   * still beside it at the edge sends Dot up to pick it loose, and it drops down for him: a jump from under it grabs it, and the swing
   * carries him out over the gorge; the rest of the chain is as chain() rolls it. No jump reaches the tied-up vine or the second one, so
   * the knot is the way across. In the calm: the knot is the lesson here. (He waits between the vine and the edge, so the knot and Dot
   * are a little left of him: in landscape that keeps them clear of the menu button at the top of the screen.)
   *
   * `dir` (4-4's second twist, the knot in the wind): a gust lane over the whole gorge, from just past the bank's end to just short of the
   * far bank, its chimes on the bank behind the knotted vine. The gap after the short second vine is the wide one (windChain's): with
   * the gust behind him a plain leap makes it, in his face it falls short, so he waits for Dot, then waits on the short vine for the
   * chimes. Every leap is checked with the gust behind as well as in the calm (it never carries him past a vine or the far bank).
   */
  function knotChain(n: number, dir?: 1 | -1) {
    const x0 = x;
    run(R.r(400, 480));
    const edge = x;
    const wind = dir ? CROSS : 0;
    for (let tries = 0; tries < (dir ? 24 : 14); tries++) {
      const k0 = edge - R.r(95, 108);
      // the second vine is short and hangs from high up, far enough out that no jump from the bank reaches it (jumpReaches), and still
      // caught by every leap from the knotted vine
      const xs = [k0, edge + R.r(288, 300)];
      for (let k = 2; k < n; k++) xs.push(xs[k - 1] + (dir && k === 2 ? R.r(378, 402) : R.r(300, 330)));
      const farX = xs[n - 1] + R.r(200, 240);
      const tops = xs.map((_, k) => Math.round(k === 0 ? R.r(148, 160) : R.r(140, 180)));
      const bottoms = xs.map((_, k) => (k === 0 ? G - 40 : k === 1 ? 390 : Math.min(G + 30, tops[k] + 410)));
      const vs: Vine[] = xs.map((vx, k) => ({ id: -1 - k, x: vx, topY: tops[k], bottomY: bottoms[k], swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true }));
      const tied: Vine = { ...vs[0], bottomY: KNOT_Y };
      const far: Platform = { id: -99, x: farX, y: G, width: 400, height: BANK_H, type: 'solid' };
      // freed, a jump from the bank under it grabs it; tied up, no jump from anywhere on the bank does, nor to the second vine
      let ok = jumpGrab(xs[0] + 60, G, vs[0]) >= 6 && !jumpReaches(bankFrom, edge, G, tied) && !jumpReaches(bankFrom, edge + 15, G, vs[1]);
      for (let k = 0; ok && k < n - 1; k++) {
        ok = catchWindow(vs[k], vs[k + 1]) > 0.6 && earlyCatch(vs[k], vs[k + 1]);
        if (ok && dir) ok = catchWindow(vs[k], vs[k + 1], wind) > 0.6 && earlyCatch(vs[k], vs[k + 1], 0.5, wind);
      }
      if (ok) ok = landWindow(vs[n - 2], vs[n - 1], far) >= 8 && (!dir || landWindow(vs[n - 2], vs[n - 1], far, wind) >= 8);
      // in the wind, the wide gap is one the gust in his face really does pull short
      if (ok && dir) ok = catchWindow(vs[1], vs[2], -wind) < catchWindow(vs[1], vs[2]) - 0.3;
      if (!ok && tries < (dir ? 23 : 13)) continue;
      close();
      const lv = xs.map((vx, k) => liana(vx, vs[k].topY, vs[k].bottomY));
      for (let k = 1; k < n; k++) arc(k === 1 ? edge + 60 : (xs[k - 1] + xs[k]) / 2, k === n - 1 ? farX - 10 : (xs[k] + xs[k + 1]) / 2, Math.min(G - 150, vs[k].topY + 200), 4);
      W4K.push({ x: lv[0].x, y: KNOT_Y, x0: lv[0].x + 30, x1: edge - 6, ground: G, releases: { kind: 'vine', id: lv[0].id } });
      // (the chimes stand behind the knotted vine, clear of the spot where he waits for Dot)
      if (dir) gustZone(edge + 20, farX - 10, dir, k0 - R.r(70, 90), CROSS);
      open(farX);
      run(R.r(140, 200));
      expert += (edge - x0) / RUN + 0.6 + 0.9 + 1.1 + 0.8 + (farX - edge) / SWING + 0.3 * n + (dir ? 2.4 : 0) + (x - farX) / RUN;
      pieces.push({ k: 'gorge', x0, x1: x });
      return;
    }
  }

  /**
   * the secret: another knot, over a quiet stretch of floor, and out past the end of its swing a branch higher than any jump from the
   * floor reaches, behind leaves, with a golden seed on it. Dot frees the vine, the vine's leap lands on the branch. The floor runs on
   * underneath, so nothing is lost by passing it by.
   */
  function knotSecret() {
    const x0 = x;
    run(R.r(320, 380));
    const kx = x;
    for (let tries = 0; tries < 12; tries++) {
      const top = Math.round(R.r(170, 210));
      const v: Vine = { id: -1, x: kx, topY: top, bottomY: G - 20, swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true };
      const by = Math.round(G - RISE - R.r(40, 60));
      const bx = Math.round(kx + R.r(230, 290));
      const ledge: Platform = { id: -99, x: bx, y: by, width: 150, height: 24, type: 'solid' };
      if ((landWindow(null, v, ledge) < 8 || jumpReaches(kx - 420, kx + 420, G, { ...v, bottomY: KNOT_Y })) && tries < 11) continue;
      const lv = liana(kx, top, G - 20);
      W4K.push({ x: kx, y: KNOT_Y, x0: kx + 30, x1: kx + 110, ground: G, releases: { kind: 'vine', id: lv.id } });
      branch(bx, bx + 150, by);
      goldenSeed(bx + 95, by - 34);
      covers.push({ x: bx - 30, y: by - 90, w: 210, h: 120 });
      hint(kx - 260, 'Another vine tied up in the trees... what is it for?');
      x = Math.max(x, bx + 150 + 300);
      expert += (x - x0) / RUN;
      pieces.push({ k: 'rest', x0, x1: x });
      return;
    }
  }

  if (plan === '4-4') {
    // 4-4 Crosswind: swing the gorges while gusts blow across them. The chimes at each gorge's edge swing the way the next gust will
    // blow: let go with it behind you and it carries the leap over the wide gap; with it in your face, hang on until it drops (on the
    // vine he is safe, the wind only pushes him in the air). In the calm the second jump always makes it. Then Dot's knot, a vine tied up
    // out of reach that she frees when he stands still under it, and rocks coming loose over a landing. A second knot hides the seed.
    beat('Start', () => {
      rest(R.r(600, 720));
      hint(x - 380, 'The wind blows across the gorges here. Listen for the chimes');
      rest(R.r(200, 260));
      flag();
    });
    beat('Learn: the wind behind you', () => {
      hint(x + 40, 'The chimes swing the way the wind will blow. Let go with it behind you, and it carries you over');
      windChain(2, 1, true);
      rest(R.r(220, 300));
      hint(x + 40, 'No wind? Then add your second jump as you fly', 'No wind? Then press Jump again as you fly', 'No wind? Then press Space again as you fly');
      windChain(2, 1, true);
      flag();
    });
    beat('Develop: into the wind, and Dot\'s knot', () => {
      hint(x + 40, 'The chimes swing back at you: the wind will blow against you. Hang on to the vine until it drops');
      windChain(2, -1, true);
      rest(R.r(240, 320));
      flag();
      hint(x + 60, 'That vine is tied up out of reach. Walk up to the knot and wait there');
      knotChain(3);
      rest(R.r(220, 300));
      windChain(3, R.chance(0.5) ? 1 : -1, false);
      flag();
    });
    beat('Twist: rocks on the landing', () => {
      hint(x + 40, 'Rocks fall on the next landing! Hang on until the shadow comes and the rock falls, then let go');
      windChain(3, R.chance(0.5) ? 1 : -1, false, true);
      flag();
      // two gorges back to back, the wind each way
      const d = R.chance(0.5) ? 1 : -1;
      windChain(2, d, false);
      windChain(2, d > 0 ? -1 : 1, false);
      flag();
    });
    beat('Twist again: knots in the wind', () => {
      // what the stage taught, two at a time: Dot's knot over a gorge the gusts blow across (wait for Dot, then for the chimes), and
      // the wind in his face over a landing the rocks fall on (hang on through the gust and the rock both)
      hint(x + 60, 'A knot, and the wind over the gorge! Wait for Dot, then hang on until the chimes say go');
      knotChain(4, R.chance(0.5) ? 1 : -1);
      rest(R.r(240, 320));
      flag();
      hint(x + 40, 'Wind in your face and rocks on the landing: hang on for the gust and the rock both');
      windChain(3, -1, false, true);
      rest(R.r(240, 320));
      flag();
      knotChain(3, R.chance(0.5) ? 1 : -1);
      flag();
    });
    beat('Finish', () => {
      // 4-4 runs 170 s (STAGE_SECONDS); the walk to the shrine (rest(700..900), at least 2.4 s) closes it
      let n = 0;
      while (expert + 2.5 < stageSeconds('4-4') && n < 30) {
        const k = n % 3;
        if (k === 0) {
          windChain(R.i(2, 3), R.chance(0.5) ? 1 : -1, false, n === 3);
          // (a flag follows: keep it clear of the rocks)
          if (n === 3) rest(R.r(200, 260));
        } else if (k === 1) {
          if (n === 1) knotSecret();
          else { rest(R.r(240, 320)); stumps(); }
        } else windChain(R.i(3, 4), R.chance(0.5) ? 1 : -1, false);
        n++;
        if (n % 2 === 0) flag();
      }
      rest(R.r(700, 900));
    });
  }

  // 4-8 Nests on the Cliff (2026-10-25): eaglet chicks caught in old netting on the cliff nests (w4Nests.ts). Two blows tear a
  // netting open (a 'cage', as in World 2); each nest is a small puzzle with a World 4 idea in it, each taught where it first comes:
  // a vine tied up out of reach that Dot unties (w4Kit.ts DotKnot), a fall pouring between him and the nest that a boulder rolled under
  // its spout stops (waterfalls.ts plug), a capuchin guard pacing the nest's ledge that a gust knocks over (capuchin.ts), and a branch
  // too far out for any jump that only the leaf reaches (needed from 4-7 on). The second twist puts two of them together. A freed
  // chick's parent swoops down and its wingbeats blow a tailwind along the stretch ahead for a few seconds. The forest floor runs
  // under everything: a miss is a climb back, never a life.
  if (plan === '4-8') {
    const KNOTS: DotKnot[] = (W4X.knots = []);
    const FALLS8: Waterfall[] = (W4X.falls = []);
    const GUARDS: Capuchin[] = (W4X.monkeys = []);
    const NESTS: CliffNest[] = (W4X.cliffNests = []);
    /** the seconds a quick player spends at a nest: two blows, and the parent's swoop */
    const FREE = 1.8;
    /** the seconds Dot takes, from standing still under a knot to the vine on the ground */
    const DOT = DOT_HELP.ask + DOT_HELP.fly + DOT_HELP.pick + 0.8;
    /** a chick in a nest at cx on platform pl (`also`: the second idea in a nest that needs two) */
    const nest = (cx: number, pl: Platform, kind: NestKind, also?: NestKind) => {
      const id = cid++;
      C.push({ id, type: 'cage', x: Math.round(cx), y: pl.y - 26, collected: false, bobPhase: 0, cageHp: 2, critter: 'eaglet' });
      NESTS.push({ cageId: id, kind, ...(also ? { also } : {}), platformId: pl.id, x: Math.round(cx), y: pl.y });
    };
    /** the way up to a ledge at y from the floor at x: a trunk, or (`rope`) a vine down the cliff tied up under its knot for Dot */
    const wayUp = (vx: number, y: number, rope: boolean) => {
      if (!rope) trunk(vx, G, y);
      else {
        const id = vid++;
        V.push({ id, x: vx, topY: y - 2, bottomY: G - 6, swaySpeed: 0.9, swayPhase: 0, vineType: 'tree_climb', rope: true });
        KNOTS.push({ x: vx, y: y + 16, x0: vx - 44, x1: vx + 44, ground: G, releases: { kind: 'vine', id } });
      }
      // (up the climb, the top one well under the ledge)
      for (let i = 0; i < 3; i++) flower(vx, Math.round(G - 80 - (i * (G - y - 140)) / 2), 'hibiscus');
      return (G - y) / CLIMB + (rope ? DOT : 0);
    };
    /** the plain one, to learn the netting on: a nest on a low rock by the path */
    function plainNest() {
      const x0 = x;
      run(R.r(300, 360));
      const rock = block(x, x + 180, 50);
      nest(x + 110, rock, 'plain');
      run(180 + R.r(420, 500));
      expert += (x - x0) / RUN + 0.5 + FREE;
      pieces.push({ k: 'cages', x0, x1: x });
    }
    /**
     * a ledge up the cliff, far higher than a jump, and a vine down from it tied up out of reach under its knot: stand still under it
     * and Dot flies up and unties it, and it drops to the ground. `high`: the nest is a hop further up, on a second ledge.
     */
    function knotNest(high: boolean) {
      const x0 = x;
      run(R.r(320, 380));
      const vx = Math.round(x);
      const y = Math.round(G - R.r(250, 265));
      const ledge = branch(vx - 40, vx + Math.round(R.r(260, 300)), y);
      expert += wayUp(vx, y, true);
      let top = ledge;
      if (high) {
        const rise = Math.round(R.r(90, 110));
        const gap = Math.round(reachJump(rise, false) * R.r(0.4, 0.5));
        const nx = ledge.x + ledge.width + gap;
        top = branch(nx, nx + Math.round(R.r(220, 250)), y - rise);
        row(ledge.x + 120, ledge.x + ledge.width - 30, y - 34, 2, 'orchid');
      }
      nest(top.x + top.width - 70, top, 'knot');
      x = Math.max(x, top.x + top.width) + R.r(300, 360);
      expert += (vx - x0) / RUN + (top.x + top.width - vx) / RUN + (high ? 1 : 0) + FREE + 0.8 + (x - top.x - top.width) / RUN;
      pieces.push({ k: 'kapok', x0, x1: x });
    }
    /**
     * a shelf up a trunk, and water pouring down from a spout high on the cliff, past the shelf's end and over the gap to the nest's
     * ledge, from higher than any jump goes: in pouring water a jump is pushed down (and the leaf folds). Roll the boulder along the
     * shelf to its end, under the spout, and the water runs off it instead; then the gap is a jump from the top of the boulder.
     */
    function fallNest() {
      const x0 = x;
      run(R.r(320, 380));
      const tX = Math.round(x);
      const sy = Math.round(G - R.r(230, 245));
      const shelfEnd = tX + Math.round(R.r(360, 400));
      branch(tX - 40, shelfEnd, sy);
      expert += wayUp(tX, sy, false);
      const BW = 100, BH = 84;
      const boulder: Platform = { id: pid++, x: tX + 70, y: sy - BH, width: BW, height: BH, type: 'solid', style: 'moss_stone', push: { min: tX + 60, max: shelfEnd } };
      P.push(boulder);
      const gap = Math.round(R.r(220, 240));
      // (the water lands on the shelf's last stretch too, where the boulder stops; it starts higher than a double jump off the boulder)
      FALLS8.push({ id: FALLS8.length + 1, x: shelfEnd - FALL_LIP, width: gap + FALL_LIP, top: sy - FALL_HEAD, bottom: G, plug: { platformId: boulder.id, atX: shelfEnd - BW } });
      const nl = branch(shelfEnd + gap, shelfEnd + gap + Math.round(R.r(200, 240)), sy + Math.round(R.r(0, 16)));
      nest(nl.x + nl.width - 70, nl, 'fall');
      x = nl.x + nl.width + R.r(300, 360);
      expert += (tX - x0) / RUN + 0.5 + (shelfEnd - BW - tX - 70) / PUSH + 1.2 + 1.4 + nl.width / RUN + FREE + 0.8 + (x - nl.x - nl.width) / RUN;
      pieces.push({ k: 'log', x0, x1: x });
    }
    /**
     * a ledge up a trunk (or a knotted vine) with a capuchin pacing it: on its feet it will not let him by (nor over: it leaps up at
     * him). Chimes on a post below ring before each gust along the cliff, and a gust knocks it over for a while. The nest is at the
     * ledge's far end; or (`glide`) the ledge is a high perch and the nest is out on a branch only the leaf reaches from its far end,
     * with the gust behind him.
     */
    function guardNest(rope: boolean, glide: boolean) {
      const x0 = x;
      run(R.r(340, 400));
      const tX = Math.round(x);
      const chimeX = tX - 150;
      const gy = Math.round(glide ? G - R.r(335, 350) : G - R.r(230, 245));
      const end = tX + Math.round(R.r(440, 480));
      const ledge = branch(tX - 40, end, gy);
      expert += wayUp(tX, gy, rope);
      const gx0 = tX + 120, gx1 = end - 180;
      GUARDS.push({ job: 'guard', x: Math.round((gx0 + gx1) / 2), y: gy, x0: gx0, x1: gx1 });
      gustZone(tX - 220, end + 60, 1, chimeX);
      let last = end;
      if (glide) {
        const nb = glideOut(ledge);
        nest(nb.x + nb.width - 70, nb, 'guard', 'glide');
        last = nb.x + nb.width;
      } else nest(end - 60, ledge, 'guard', rope ? 'knot' : undefined);
      x = last + R.r(320, 380);
      expert += (tX - x0) / RUN + 3.6 + (end - tX) / RUN + (glide ? 1.6 : 0) + FREE + 0.8 + (x - last) / RUN;
      pieces.push({ k: 'kapok', x0, x1: x });
    }
    /**
     * out from the end of a high perch: the nest's branch a little lower, too far for any jump (and far higher than a jump from the
     * floor), easy for the leaf. Petals trail down the way the leaf drifts.
     */
    function glideOut(perch: Platform) {
      const drop = Math.round(R.r(50, 70));
      const gap = Math.round((reachJump(-drop, true) + reachGlide(-drop, true)) / 2);
      const bx = perch.x + perch.width + gap;
      const nb = branch(bx, bx + Math.round(R.r(170, 200)), perch.y + drop);
      for (let i = 1; i <= 3; i++) {
        const u = i / 4;
        flower(Math.round(perch.x + perch.width + gap * u), Math.round(perch.y - 20 + (drop + 50) * u), 'orchid');
      }
      return nb;
    }
    /**
     * up a tall trunk (or a knotted vine) to a perch, and the nest out on a branch only the leaf reaches. `secret`: farther out again,
     * from the nest's branch, a little ledge with a golden seed only a second glide reaches.
     */
    function glideNest(secret: boolean, rope: boolean) {
      const x0 = x;
      run(R.r(320, 380));
      const tX = Math.round(x);
      const py = Math.round(G - R.r(335, 355));
      const perch = branch(tX - 40, tX + 170, py);
      expert += wayUp(tX, py, rope);
      const nb = glideOut(perch);
      nest(nb.x + nb.width - 70, nb, 'glide', rope ? 'knot' : undefined);
      let end = nb.x + nb.width;
      if (secret) {
        const sx = Math.round(end + (reachJump(-40, true) + reachGlide(-40, true)) / 2);
        branch(sx, sx + 120, nb.y + 40);
        goldenSeed(sx + 60, nb.y + 40 - 34);
        hint(nb.x - 200, 'Something shiny, far out past that nest...');
        end = sx + 120;
      }
      x = end + R.r(320, 380);
      expert += (tX - x0) / RUN + 1 + (nb.x - perch.x - perch.width) / 330 + FREE + 0.8 + (x - nb.x - nb.width) / RUN;
      pieces.push({ k: 'canopy', x0, x1: x });
    }
    /** the forest floor between two nests: far enough apart that no glide from one reaches the next one's ledges */
    const between = () => rest(R.r(420, 500));

    beat('Start: the cliff path', () => {
      rest(R.r(560, 680));
      hint(x - 420, 'Eaglet chicks are caught in old netting on the cliff nests. Free them!');
      rest(R.r(200, 260));
      hint(x + 40, 'Tap twice to tear the netting', 'Press Punch twice to tear the netting', 'Press J twice to tear the netting');
      plainNest();
      hint(x - 300, 'Its parent can reach it now! Feel its wings blow you along?');
      rest(R.r(200, 260));
      flag();
    });
    beat('Learn: Dot and the boulder', () => {
      hint(x + 40, 'That vine is tied up out of reach. Stand still under the knot and Dot will fly up');
      knotNest(false);
      between();
      hint(x + 40, 'Water pours between you and that nest. Climb up and keep sliding into the boulder to roll it under the water', 'Water pours between you and that nest. Climb up and hold the pad into the boulder to roll it under the water', 'Water pours between you and that nest. Climb up and hold right into the boulder to roll it under the water');
      fallNest();
      rest(R.r(200, 260));
      flag();
    });
    beat('Develop: the guard', () => {
      hint(x + 40, 'A capuchin guards that nest! When the chimes ring, the wind will knock it over');
      guardNest(false, false);
      rest(R.r(200, 260));
      flag();
      between();
      knotNest(true);
      rest(R.r(200, 260));
      flag();
    });
    beat('Twist: by leaf', () => {
      hint(x + 40, 'That nest is too far to jump to. Climb up, jump, and keep your thumb on the glass to open your leaf', 'That nest is too far to jump to. Climb up, jump, and hold Jump to open your leaf', 'That nest is too far to jump to. Climb up, jump, and hold Space to open your leaf');
      glideNest(false, false);
      between();
      fallNest();
      rest(R.r(200, 260));
      flag();
    });
    beat('Twist: two at once', () => {
      // (the order is rolled; each says what it needs)
      const combos: Array<() => void> = [
        () => {
          hint(x + 40, 'Dot first, then your leaf: the vine takes you up to a perch, and the nest is a glide away');
          glideNest(false, true);
        },
        () => {
          hint(x + 40, 'Another guard, and its ledge is tied up too. Dot first, then wait for the chimes');
          guardNest(true, false);
        },
        () => {
          hint(x + 40, 'A guard on the high perch! When the wind knocks it over, run past and glide with the wind behind you');
          guardNest(false, true);
        },
      ];
      R.shuffle(combos).forEach((f, i) => {
        if (i) between();
        f();
        rest(R.r(200, 260));
        flag();
      });
    });
    beat('Finish', () => {
      between();
      guardNest(false, false);
      between();
      flag();
      // the cliff path on toward the shrine, until a quick player has had about three minutes, then the last nest
      let n = 0;
      while (expert < W48_SECONDS - 20 && n < 24) {
        const k = n % 3;
        if (k === 0) gustGap(1);
        else if (k === 1) pillars(R.shuffle([50, 110, 70, 130]), [0.55, 0.7]);
        else highRoad();
        rest(R.r(220, 300));
        n++;
        if (n % 2 === 0) flag();
      }
      between();
      glideNest(true, false);
      rest(R.r(700, 900));
      // (the walk to the shrine makes up any last seconds the dice left short)
      if (expert < W48_SECONDS) rest((W48_SECONDS - expert) * RUN + 60);
    });
  }

  if (plan === '3-2') {
    // World 3's note (Meeca, in plain sight: a Keeper's Bell) on the quiet floor just before the eyes
    const note = findForStage(config.worldIndex, config.miniIndex);
    const at = beats.find((b) => b[2].startsWith('Develop'));
    if (note && note.kind === 'note' && at) C.push({ id: cid++, type: 'find', findId: note.id, hidden: false, x: Math.round(at[0] + 170), y: G - 26, collected: false, bobPhase: 0 });
  }
  // the walk to the shrine makes up any last seconds the dice left short
  if ((config.worldIndex === 3 || config.worldIndex === 4) && expert < EXPERT_SECONDS) rest((EXPERT_SECONDS - expert) * RUN + 60);

  // the grotto's dressing behind every stretch of floor: stalagmites, glowing mushrooms, a clawed rock; stalactites and glowworm threads
  // hanging from the roof (no ferns in 3-2, where a fern is a hiding place)
  if (config.worldIndex === 3) {
    const darkAt = (px: number) => GZ.some((z) => z.kind === 'dark' && px > z.x0 - 80 && px < z.x1 + 80);
    for (const pc of pieces) {
      if (pc.k !== 'rest' && pc.k !== 'snakes') continue;
      for (let cx = pc.x0 + R.r(80, 200); cx < pc.x1 - 80; cx += R.r(280, 460)) {
        const kinds = plan === '3-2' ? (['stalagmites', 'mushrooms', 'clawRock', 'stalagmites'] as const) : (['stalagmites', 'mushrooms', 'fern', 'stalagmites', 'clawRock'] as const);
        const k = R.pick(kinds);
        const w = k === 'stalagmites' ? R.r(140, 200) : k === 'mushrooms' ? R.r(84, 110) : k === 'fern' ? R.r(140, 180) : R.r(100, 130);
        const busy = BUSHES.some((b) => cx > b.x - 60 && cx < b.x + b.w + 60) || C.some((c) => (c.hidden || c.type === 'find') && Math.abs(c.x - cx) < 170) || W3D.some((d) => d.n === 'fern' && Math.abs(d.x - cx) < 170);
        if (!busy) W3D.push({ n: k, x: Math.round(cx), b: G + 8, w: Math.round(w), flip: R.chance(0.5) });
        if (R.chance(0.5)) {
          const hangLit = !darkAt(cx) && R.chance(0.45);
          W3D.push({ n: hangLit ? 'glowLit' : 'stalactite', x: Math.round(cx + R.r(-90, 90)), b: G - 480, w: Math.round(hangLit ? R.r(70, 90) : R.r(110, 150)), hang: true, flip: R.chance(0.5) });
        }
      }
    }
  }
  const exitX = x - 260;
  close();
  C.push({ id: cid++, type: 'exit_totem', x: exitX, y: G - 30, collected: false, bobPhase: 0 });

  const width = Math.ceil(x + 20);
  const cfg: LevelConfig = { ...config, levelWidth: width, levelHeight: Math.max(config.levelHeight, 900), ...(plan === '1-2' ? { targetCount: PETAL_GOAL_12 } : plan === '1-3' ? { targetCount: SNAKE_GOAL_13 } : plan === '1-5' ? { targetCount: PETAL_GOAL_15 } : plan === '1-9' ? { targetCount: GUARD_GOAL_19 } : plan === '3-3' ? { targetCount: PROWLER_GOAL_33 } : plan === '3-6' ? { targetCount: GRANDMA_GOAL_36 } : plan === '3-7' ? { targetCount: GRANDMA_GOAL_37 } : plan === '3-9' ? { targetCount: PROWLER_GOAL_39 } : plan === '4-8' ? { targetCount: NEST_GOAL_48 } : {}) };
  cid = heartsAtFlags(C, checkpoints, cid);
  // every flower where he can get it (nothing tucked under a branch, nothing out of reach: flowerReach.ts)
  const movedPickups = fixPickups({ platforms: P, vines: V, ropes: ROPES, waterY: WATER }, C);
  return {
    config: cfg,
    trees: T,
    platforms: P,
    vines: V,
    ropes: ROPES,
    enemies: E,
    boss: null,
    collectibles: C,
    spawnX: 140,
    spawnY: G,
    exitTotemX: exitX,
    exitTotemY: G,
    checkpoints: checkpoints.sort((a, b) => a.x - b.x),
    waterY: WATER,
    meta: { attempt: seed, chunks: pieces.map((p) => p.k), width, pieces: pieces.map((p) => ({ k: p.k, x0: p.x0, x1: p.x1 })), timing: { layoutSeconds: expert, decorSeconds: 0, route: width } },
    ...(RIVERS.length ? { rivers: RIVERS } : {}),
    ...(GZ.length ? { zones: GZ } : {}),
    proto: {
      ...(W3D.length ? { w3decor: W3D } : {}),
      ...(THORNS.length ? { thorns: THORNS } : {}),
      hints: hints.sort((a, b) => a.x - b.x), covers, beats, movedPickups, ...(BUSHES.length ? { bushes: BUSHES } : {}), ...(ZONES.length ? { watch: ZONES } : {}), ...(RING ? { ring: RING } : {}),
      ...(MIX ? { mix: MIX, grant: ['shimmy'] as SkillId[] } : {}),
      ...(W4C.length || W4K.length || W4R.length || Object.keys(W4X).length ? { w4: { ...W4X, ...(W4C.length ? { chimes: W4C } : {}), ...(W4K.length ? { knots: W4K } : {}), ...(W4R.length ? { rocks: W4R } : {}) } } : {}),
    },
  };
}
// ---------------------------------------------------------------------------------------------------------------------------
// 1-4 Up the Kapok: the first climbing stage, built from the floor up

/** the kapok's width (the engine keeps him inside it) and the margin nothing is built in */
const KAPOK_W = 3200;
const KAPOK_MARGIN = 90;
/**
 * 4-6's mist: the wide ledge at the foot of each hidden column (it catches every miss from the column), the three lanes the small
 * hidden ledges stand in (their middles this far apart) and how wide they are, how long standing still takes to settle the mist (s),
 * and the seconds the climb below leaves for the mist and the nests
 */
const MIST_FOOT = 560;
const MIST_LANE = 150;
const MIST_STEP = 130;
const MIST_FILL = 3;
const MIST_LEAVES = 64;

/**
 * 1-4 Up the Kapok: going up. Learn: climb a trunk to its branch, twice, straight up from the floor. Test: a zigzag of rope, branch and
 * trunk, back and forth across the tree (with a hidden hollow up a side trunk: a golden seed). Twist: one long rope across the widest
 * gap, near the top. Finish: the last trunk to the crown and the shrine. A fall only drops him to a lower branch or the floor: it costs
 * the climb, never a life. Built from y = 0 upward and shifted down at the end, so the crown sits near the top of the stage.
 *
 * `village` (2-6 Up the Bank Houses, w2Stages.ts): the same climb up the riverbank village. World 2's kit paints it (bamboo posts, plank
 * porches, earth), the porches get the village's round doors, windows and washing, the secret hollow is a lit round window instead,
 * and Gruntlewick waits at the top with his scroll.
 *
 * `grotto` (3-4 The Sinkhole): the same climb up the wall of the sinkhole toward the moonlight. World 3's kit paints it (root columns,
 * limestone shelves), prowling ocelots stand in for the snakes, and Matt's grotto pieces dress it: moss hanging under the shelves,
 * glowing mushrooms and ferns on them, stalactites and glowworm threads up in the dark.
 *
 * `cliff` (4-1 The Broken Ledge, World 4's first stage): the same climb back up the cliff after the ledge broke away under him. Bits of
 * the broken ledge keep coming loose: on some of the wide ledges a rock drops on its own rhythm, its shadow growing first (rockfall.ts),
 * so the new thing to learn is to stop short and go once it has fallen. The first one is on a ledge of its own, with nothing else to
 * do there. At the top the way to the shrine is a gap too wide to jump, and a curled fern frond at its edge: stand still beside it and
 * it unrolls into a bridge (patience.ts: "slow is not stopped"). Clearing it teaches the Leaf Glide (skills.ts).
 *
 * `mist` (4-6 Above the Mist): the same climb up the cliff, then up through a bank of mist toward the eagle nests. In the mist the way
 * up is a column of small hidden ledges: stand still on the wide ledge at its foot and the mist settles and shows them (patience.ts,
 * kind 'mist'); move and it slowly rises again, so the way must be remembered. The ledges are solid all along, and the wide ledge at
 * the foot of each column catches every miss, so a slip costs a look, never a life. The first column is two ledges, then four, then
 * five. Above the mist the nests: eaglets asleep on wide ledges (eaglet.ts); move near one while they look about and their wings blow
 * him back a few steps, so go while they sleep and stand still while they look. The first nest is alone on its ledge, then a ledge
 * with two on different rhythms, then the crown and the shrine. No glide is needed (4-7 is the first stage that needs the leaf).
 */
export function buildKapok(config: LevelConfig, seed: number, village = false, grotto = false, cliff = false, mist = false): GeneratedStage & { proto: ProtoExtras } {
  const R = stream(seed);
  const W = KAPOK_W;
  const P: Platform[] = [];
  const V: Vine[] = [];
  const T: TreeStructure[] = [];
  const E: Enemy[] = [];
  const C: Collectible[] = [];
  const ROPES: Rope[] = [];
  const checkpoints: Array<{ x: number; y: number; reached: boolean }> = [];
  const hints: StageHint[] = [];
  const beats: Array<[number, number, string]> = [];
  const hollows: Array<{ x: number; y: number }> = [];
  const villageWindows: Array<{ x: number; y: number }> = [];
  let pid = 1, vid = 1, tid = 1, eid = 1, cid = 1, seedN = 0;
  let expert = 0;
  const RUN = 285, CLIMB = 220;

  const ledge = (x0: number, x1: number, y: number) => {
    const p: Platform = { id: pid++, x: Math.round(x0), y: Math.round(y), width: Math.round(x1 - x0), height: 24, type: 'solid', style: 'branch' };
    P.push(p);
    return p;
  };
  const trunk = (x: number, groundY: number, perchY: number) => {
    const tree: TreeStructure = { id: tid++, x, groundY, topY: perchY - 150, trunkWidth: 76, hasClimbVine: true, canopyRadius: 150 };
    T.push(tree);
    V.push({ id: vid++, x, topY: perchY - 2, bottomY: groundY - 6, swaySpeed: 0.9, swayPhase: (x * 0.007) % 6.28, vineType: 'tree_climb', treeId: tree.id });
  };
  /** is there already a branch across this span within about a body's height and a half of y (above or below)? */
  const blocked = (x0: number, x1: number, y: number) => P.some((p) => p !== P[0] && p.x < x1 + 30 && p.x + p.width > x0 - 30 && Math.abs(p.y - y) < 130);
  const flower = (x: number, y: number, v: Collectible['botanicalVariant'] = 'orchid') =>
    C.push({ id: cid++, type: 'flower', botanicalVariant: v, x: Math.round(x), y: Math.round(y), collected: false, bobPhase: (x * 0.031) % 6.28 });
  const row = (x0: number, x1: number, y: number, n: number, v: Collectible['botanicalVariant'] = 'orchid') => {
    for (let i = 0; i < n; i++) flower(x0 + ((x1 - x0) * i) / Math.max(1, n - 1), y, v);
  };
  const snake = (x: number, surface: number, range: number) => {
    E.push({
      id: eid++, type: 'snake', x, y: surface - 14, vx: 28, vy: 0, width: 38, height: 22, hp: 1, maxHp: 1, facing: R.chance(0.5) ? 1 : -1,
      patrolMinX: x - range / 2, patrolMaxX: x + range / 2, attackCooldown: 2, telegraphTimer: 0, isAttacking: false,
      animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0,
    } as Enemy);
  };
  const hint = (text: string, pad: string, keys: string, aboveY?: number) => hints.push({ x: 0, text, pad, keys, aboveY });

  // the floor: the whole width, so a fall is never more than a climb back
  P.push({ id: pid++, x: 0, y: 0, width: W, height: BANK_H, type: 'solid', style: 'log' });

  /** 4-1: the fern frond at the cliff top */
  let spot: PatienceSpot | undefined;
  /** 4-6: the mist's spots, one at the foot of each hidden column, and the eagle nests above it */
  const mistSpots: PatienceSpot[] = [];
  const nests: Nest[] = [];
  /** where he stands now, and which way the climb is heading across the tree */
  let cur: Platform;
  let dir: 1 | -1 = 1;
  /** a trunk up from `cur` (near its end on the way he is heading), to a branch growing out to the right of it */
  const climb = (h0: number, flowers = 3) => {
    let h = h0;
    // (kept far enough from the right edge for the branch it grows: the trunk moves in along the branch he is on)
    const tX = Math.round(Math.max(cur.x + 40, Math.min(dir === 1 ? cur.x + cur.width - 60 : cur.x + 60, W - KAPOK_MARGIN - 220)));
    // the branch at the top grows out to the right of the trunk, never past the edge of the tree
    const pw = Math.max(170, Math.min(Math.round(R.r(260, 320)), W - KAPOK_MARGIN - tX));
    // a little higher if another branch is already in the way
    for (let k = 0; k < 3 && blocked(tX - 40, tX + pw, cur.y - h); k++) h += 70;
    const y = cur.y - h;
    trunk(tX, cur.y, y);
    for (let i = 0; i < flowers; i++) flower(tX, cur.y - 70 - ((h - 110) * i) / Math.max(1, flowers - 1), 'hibiscus');
    expert += h / CLIMB + 0.8;
    cur = ledge(tX - 40, tX + pw, y);
    return tX;
  };
  /** the room left past `cur` on the side he is heading */
  const room = () => (dir === 1 ? W - KAPOK_MARGIN - (cur.x + cur.width) : cur.x - KAPOK_MARGIN);
  /** a rope from the end of `cur` across a gap to a new branch at the same height (Shimmy Rope: needed from 1-4) */
  const rope = (gap: number, w: number, under = 3) => {
    const y = cur.y;
    const at = (d: 1 | -1) => (d === 1 ? cur.x + cur.width + gap : cur.x - gap - w);
    const fits = (d: 1 | -1) => (d === 1 ? W - KAPOK_MARGIN - (cur.x + cur.width) : cur.x - KAPOK_MARGIN) >= gap + w && !blocked(at(d), at(d) + w, y);
    if (!fits(dir) && fits(dir === 1 ? -1 : 1)) dir = dir === 1 ? -1 : 1;
    else if (room() < gap + w) dir = dir === 1 ? -1 : 1;
    const nx0 = at(dir);
    const next = ledge(nx0, nx0 + w, y);
    const a = dir === 1 ? cur : next, b = dir === 1 ? next : cur;
    ROPES.push({ id: ROPES.length + 1, x0: a.x + a.width - 44, x1: b.x + 44, y: y - ROPE_RISE, g0: y, g1: y, required: true });
    // petals under the rope, at the height he hangs (only a shimmy reaches them)
    if (under) row(a.x + a.width + 70, b.x - 70, y - ROPE_RISE + HANG_DROP - 26, under, 'orchid');
    row(next.x + 50, next.x + next.width - 50, y - 34, 2, 'hibiscus');
    expert += 1.2 + (b.x - a.x - a.width + 88) / ROPE_SPEED + w / RUN;
    cur = next;
  };
  /** a few short hops along and up branches */
  const hops = (n: number) => {
    for (let k = 0; k < n; k++) {
      const w = Math.round(R.r(180, 240));
      const rise = Math.round(R.r(20, 60));
      const gap = Math.round(reachJump(rise, false) * R.r(0.4, 0.55));
      const at = (d: 1 | -1) => (d === 1 ? cur.x + cur.width + gap : cur.x - gap - w);
      const fits = (d: 1 | -1) => (d === 1 ? W - KAPOK_MARGIN - (cur.x + cur.width) : cur.x - KAPOK_MARGIN) >= gap + w && !blocked(at(d), at(d) + w, cur.y - rise);
      if (!fits(dir)) {
        if (fits(dir === 1 ? -1 : 1)) dir = dir === 1 ? -1 : 1;
        else return; // no room either way: the trunk that follows takes him up instead
      }
      const nx0 = at(dir);
      cur = ledge(nx0, nx0 + w, cur.y - rise);
      flower(nx0 + w / 2, cur.y - 34, 'orchid');
      expert += (gap + w) / RUN + 0.5;
    }
  };
  const flag = () => checkpoints.push({ x: Math.round(cur.x + cur.width / 2), y: cur.y, reached: false });
  const beat = (name: string, f: () => void) => {
    const b0 = cur ? cur.y : 0;
    f();
    beats.push([b0, cur.y, name]);
  };

  // ---- Learn: up two trunks from the floor
  cur = P[0];
  beat('Learn: up the trunk', () => {
    cur = { ...P[0], x: 300, width: 400 } as Platform; // the patch of floor the first trunk stands on
    if (village) hint('Up through the village! Slide up a post to climb', 'Up through the village! Hold up on a post to climb', 'Up through the village! Hold up on a post to climb');
    else if (grotto) hint('Up the sinkhole, toward the moonlight! Slide up a root to climb', 'Up the sinkhole, toward the moonlight! Hold up on a root to climb', 'Up the sinkhole, toward the moonlight! Hold up on a root to climb');
    else if (mist) hint('Up toward the eagle nests, above the mist! Slide up a trunk to climb', 'Up toward the eagle nests, above the mist! Hold up on a trunk to climb', 'Up toward the eagle nests, above the mist! Hold up on a trunk to climb');
    else if (cliff) hint('The ledge broke away! Climb back up. Slide up a trunk to climb', 'The ledge broke away! Climb back up. Hold up on a trunk to climb', 'The ledge broke away! Climb back up. Hold up on a trunk to climb');
    else hint('Slide up on the trunk to climb', 'Hold up on the trunk to climb', 'Hold up on the trunk to climb');
    climb(Math.round(R.r(280, 320)), 4);
    row(cur.x + 80, cur.x + cur.width - 30, cur.y - 34, 2, 'hibiscus');
    climb(Math.round(R.r(260, 300)), 3);
    flag();
  });

  // ---- Test: across and up, rope, branch and trunk, back and forth; a side trunk with a hollow
  beat('Test: zigzag up', () => {
    hint('Jump up to the rope, then slide along it', 'Jump up to the rope, then hold the way to go', 'Jump up to the rope, then hold the way to go', cur.y + 10);
    rope(Math.round(R.r(390, 440)), Math.round(R.r(300, 360)));
    climb(Math.round(R.r(270, 320)));
    // (a long branch: the side trunk stands at its near end, the way on at its far end)
    rope(Math.round(R.r(390, 450)), Math.round(R.r(410, 450)));
    // the secret: a side trunk at the near end of this branch, up to a dead end, with a hollow halfway (a golden seed inside)
    {
      const sx = Math.round(dir === 1 ? cur.x + 60 : cur.x + cur.width - 60);
      const h = Math.round(R.r(380, 420));
      trunk(sx, cur.y, cur.y - h);
      const hy = Math.round(cur.y - h * 0.5);
      if (!village) hollows.push({ x: sx, y: hy });
      else villageWindows.push({ x: sx, y: hy });
      seedN++;
      C.push({ id: cid++, type: 'seed', x: sx, y: hy + 4, collected: false, bobPhase: seedN, findId: `seed-${seedN}` });
      const top = ledge(sx - 40, sx + 150, cur.y - h);
      row(top.x + 70, top.x + top.width - 25, top.y - 34, 2, 'hibiscus');
    }
    climb(Math.round(R.r(270, 320)));
    flag();
    hops(R.i(2, 3));
    climb(Math.round(R.r(260, 300)));
    // more of the same until even a quick climber needs most of two minutes (the twist and the crown add the rest)
    let n = 0;
    // (4-6 leaves room for the mist and the nests, which take a while)
    while (expert < EXPERT_SECONDS - (mist ? MIST_LEAVES : 32) && n < 30) {
      if (n % 3 === 2) hops(R.i(2, 3));
      else rope(Math.round(R.r(390, 460)), Math.round(R.r(300, 380)), n % 2 ? 3 : 0);
      // from the third run on, a snake now and then on a wide branch (the punch learned in 1-3 comes back)
      // (the sinkhole is a quiet climb toward the moonlight: nothing prowls on its shelves)
      // (the cliff has its falling rocks instead)
      if (n >= 2 && cur.width >= 320 && R.chance(0.4) && !grotto && !cliff && !mist) snake(cur.x + cur.width / 2, cur.y, cur.width - 140);
      climb(Math.round(R.r(260, 320)));
      n++;
      if (n % 2 === 0) flag();
    }
  });

  // ---- 4-6's twist: up through the mist, three hidden columns, each shown by standing still at its foot
  if (mist) beat('Twist: the mist', () => {
    // up a trunk to the first wide ledge, at the foot of the mist
    const tX = Math.round(dir === 1 ? cur.x + cur.width - 60 : cur.x + 60);
    const out: 1 | -1 = W - KAPOK_MARGIN - (tX - 40) >= MIST_FOOT ? 1 : -1;
    const span = (y: number) => (out === 1 ? [tX - 40, tX - 40 + MIST_FOOT, y] : [tX + 40 - MIST_FOOT, tX + 40, y]) as [number, number, number];
    let h = Math.round(R.r(280, 310));
    for (let k = 0; k < 3 && blocked(...span(cur.y - h)); k++) h += 70;
    trunk(tX, cur.y, cur.y - h);
    for (let i = 0; i < 3; i++) flower(tX, cur.y - 70 - ((h - 110) * i) / 2, 'hibiscus');
    expert += h / CLIMB + 0.8;
    // (no petals here or anywhere in the mist: they are drawn over it, and would give the hidden ledges away)
    cur = ledge(...span(cur.y - h));
    flag();
    const sizes = [2, 4, 5];
    sizes.forEach((n, k) => {
      const foot = cur;
      const cx = Math.round(foot.x + foot.width / 2);
      if (k === 0) hint('Thick mist! Stand still here and it settles to show the ledges. Then remember the way', 'Thick mist! Stand still here and it settles to show the ledges. Then remember the way', 'Thick mist! Stand still here and it settles to show the ledges. Then remember the way', foot.y + 10);
      if (k === 1) hint('Further up this time. Stand still, look hard, and remember', 'Further up this time. Stand still, look hard, and remember', 'Further up this time. Stand still, look hard, and remember', foot.y + 10);
      // the column: one small ledge to a step, in one of three lanes (left, middle, right of the foot), never the same lane twice
      // running unless the dice say so; each a plain hop up from the last
      const rise = R.i(66, 72);
      const hidden: number[] = [];
      let lane = R.i(-1, 1);
      let last = foot;
      for (let i = 1; i <= n; i++) {
        if (i > 1) lane += R.chance(0.2) ? 0 : R.pick([-1, 1].filter((m) => Math.abs(lane + m) <= 1));
        const lx = cx + lane * MIST_LANE;
        last = ledge(lx - MIST_STEP / 2, lx + MIST_STEP / 2, foot.y - i * rise);
        hidden.push(last.id);
        expert += 0.8;
      }
      // the next wide ledge over the top of the column (it catches the next column's misses in turn), shifted a little
      const lastX = last.x + last.width / 2;
      const nx = Math.round(Math.max(lastX - 200, Math.min(lastX + 200, Math.max(KAPOK_MARGIN + MIST_FOOT / 2, Math.min(W - KAPOK_MARGIN - MIST_FOOT / 2, cx + R.r(-90, 90))))));
      const top = ledge(nx - MIST_FOOT / 2, nx + MIST_FOOT / 2, foot.y - (n + 1) * rise);
      hidden.push(top.id);
      // the band it settles: from just under the foot (the first foot stands clear, below the mist) to just over the next wide ledge
      mistSpots.push({
        kind: 'mist', x0: cx - 100, x1: cx + 100, y: foot.y, fill: MIST_FILL, hides: hidden,
        area: { top: top.y - 30, bottom: k === 0 ? foot.y - 40 : foot.y + 40 },
        view: { x: cx, y: Math.round((foot.y + top.y) / 2) },
      });
      expert += MIST_FILL + PATIENCE.settle + 1.2;
      cur = top;
    });
    flag();
  });

  // ---- Twist: the long rope across the widest gap, with the whole crown around him
  if (!mist) beat('Twist: the long rope', () => {
    // set out from the side of the tree that leaves the most room
    dir = cur.x + cur.width / 2 < W / 2 ? 1 : -1;
    hint('A long way across. Keep sliding', 'A long way across. Keep holding the way to go', 'A long way across. Keep holding the way to go', cur.y + 10);
    const gap = Math.min(Math.round(R.r(900, 1050)), Math.round(room() - 340));
    rope(gap, 340, 6);
    flag();
  });

  // ---- Finish: up to the crown and the shrine
  beat('Finish: the crown', () => {
    if (mist) {
      // 4-6: above the mist, the eagle nests. Up a trunk at the end of the ledge to a long ledge with a nest in its middle, alone
      // (taught), then a longer one with two nests on different rhythms; the crown and the shrine beyond.
      const nestLedge = (len: number, at: number[], reach: number, first: boolean) => {
        const goRight = W - KAPOK_MARGIN - (cur.x + cur.width) >= cur.x - KAPOK_MARGIN;
        const tX = Math.round(goRight ? cur.x + cur.width - 60 : cur.x + 60);
        const d: 1 | -1 = goRight ? 1 : -1;
        const x0 = d === 1 ? tX - 40 : tX + 40 - len;
        let h = Math.round(R.r(280, 310));
        for (let k = 0; k < 3 && blocked(x0, x0 + len, cur.y - h); k++) h += 70;
        trunk(tX, cur.y, cur.y - h);
        // (from a little way up the trunk: its foot is still in the top of the mist)
        for (let i = 0; i < 3; i++) flower(tX, cur.y - 140 - ((h - 180) * i) / 2, 'hibiscus');
        expert += h / CLIMB + 0.8;
        cur = ledge(x0, x0 + len, cur.y - h);
        const e = d === 1 ? cur.x : cur.x + cur.width;
        if (first) hint('Sleeping eaglets! Go while they sleep. When one peeks up, stand still', 'Sleeping eaglets! Go while they sleep. When one peeks up, stand still', 'Sleeping eaglets! Go while they sleep. When one peeks up, stand still', cur.y + 10);
        for (const u of at) {
          const x = Math.round(e + d * u);
          const every = Math.round(R.r(5.4, 6.4) * 10) / 10;
          nests.push({ x, y: cur.y, x0: x - reach, x1: x + reach, every, offset: Math.round(R.r(0, every) * 10) / 10 });
          expert += 2.4;
        }
        // petals between the nests and past them (worth the wait)
        row(e + d * 90, e + d * (at[0] - reach - 40), cur.y - 34, 2, 'hibiscus');
        expert += len / RUN;
        dir = d;
      };
      nestLedge(900, [450], 230, true);
      // (the flag where he arrives, clear of the nest)
      checkpoints.push({ x: Math.round((dir === 1 ? cur.x : cur.x + cur.width) + dir * 100), y: cur.y, reached: false });
      nestLedge(1100, [350, 750], 170, false);
      // the crown, up a trunk at the far end of the nests (so they are always passed), out the way there is room
      const tX = Math.round(dir === 1 ? cur.x + cur.width - 60 : cur.x + 60);
      const out = dir === 1 ? W - KAPOK_MARGIN - (tX - 40) >= 560 : tX + 40 - KAPOK_MARGIN < 560;
      const top = cur.y - 300;
      trunk(tX, cur.y, top);
      expert += 300 / CLIMB + 1;
      cur = out ? ledge(tX - 40, tX + 520, top) : ledge(tX - 520, tX + 40, top);
      row(cur.x + 80, cur.x + 300, top - 34, 3, 'hibiscus');
      return;
    } else {
      climb(Math.round(R.r(280, 320)));
      hops(2);
    }
    // the crown: a wide branch with the shrine on it
    if (room() < 620) dir = dir === 1 ? -1 : 1;
    const tX = Math.round(dir === 1 ? cur.x + cur.width - 60 : cur.x + 60);
    const top = cur.y - 300;
    trunk(tX, cur.y, top);
    expert += 300 / CLIMB + 1;
    if (!cliff) {
      cur = ledge(tX - 40, Math.min(W - KAPOK_MARGIN, tX + 560), top);
      row(cur.x + 80, cur.x + 300, top - 34, 3, 'hibiscus');
      return;
    }
    // the cliff top: a ledge, the gap, and the fern frond at its edge that bridges it for a sloth who waits. The bridge goes toward
    // the side of the stage with the room for it; the shrine's ledge is beyond.
    const lw = 300, fw = 300;
    const gap = Math.round(reachJump(0, true) + 110);
    const right = W - KAPOK_MARGIN - (tX + lw) >= gap + fw;
    const spotLedge = right ? ledge(tX - 40, tX + lw, top) : ledge(tX - lw + 40, tX + 40, top);
    row(spotLedge.x + 60, spotLedge.x + spotLedge.width - 60, top - 34, 2, 'hibiscus');
    const edge = right ? spotLedge.x + spotLedge.width : spotLedge.x;
    const farX0 = right ? edge + gap : edge - gap - fw;
    // the bridge: solid in the stage data (the reachability check counts it), held away by the engine until the frond unrolls (w4Play.ts)
    const bridge = ledge(right ? edge : farX0 + fw, right ? farX0 : edge, top);
    bridge.art = 'frond';
    spot = { kind: 'frond', x0: right ? edge - 120 : edge + 20, x1: right ? edge - 20 : edge + 120, y: top, fill: 4, platformId: bridge.id, dir: right ? 1 : -1 };
    hint('A curled-up fern at the edge. Stand still beside it, and be patient', 'A curled-up fern at the edge. Stand still beside it, and be patient', 'A curled-up fern at the edge. Stand still beside it, and be patient', top + 10);
    expert += 4 + PATIENCE.settle + gap / RUN;
    cur = ledge(farX0, farX0 + fw, top);
    row(cur.x + 60, cur.x + 160, top - 34, 2, 'hibiscus');
  });

  // shift down: the crown sits 400 px under the top of the stage, the floor 120 px over its bottom
  const crown = cur;
  const decor: W2Decor[] = [];
  if (village) {
    // the village on its porches: a round door on every wide one (clear of the posts and the rope ends), a lit window or washing on
    // the others, a chimney and Gruntlewick with his scroll up top, and the lit window where 1-4 has its hollow
    // (only the posts that stand on or rise from this porch, and the ropes tied to it, are in the way)
    const clear = (p: Platform, x: number, half: number) =>
      V.every((v) => v.vineType !== 'tree_climb' || v.topY > p.y + 10 || v.bottomY < p.y - 10 || Math.abs(v.x - x) > half + 40) &&
      ROPES.every((r) => (r.g0 !== p.y && r.g1 !== p.y) || (Math.abs(r.x0 - x) > half + 30 && Math.abs(r.x1 - x) > half + 30));
    let k = 0;
    for (const p of P) {
      if (p === P[0] || p === crown || p.width < 220) continue;
      // try the middle of the porch, then a third of the way along from each end
      const spots = [0.5, 0.33, 0.67].map((u) => p.x + p.width * u);
      const kind = k % 3;
      const half = kind === 0 ? 70 : kind === 1 ? 36 : 85;
      const at = spots.find((x) => clear(p, x, half));
      if (at === undefined) continue;
      k++;
      if (kind === 0) {
        decor.push({ n: 'doorRoof', x: at, b: p.y + 6, w: 150, flip: k % 2 === 0 });
        decor.push({ n: 'lantern', x: at + (k % 2 === 0 ? -92 : 92), b: p.y - 62, w: 26 });
      }
      else if (kind === 1) decor.push({ n: 'window', x: at, b: p.y - 16, w: 62 });
      else decor.push({ n: 'laundry', x: at, b: p.y + 4, w: 160 });
    }
    for (const w of villageWindows) decor.push({ n: 'window', x: w.x, b: w.y + 34, w: 70 });
    decor.push({ n: 'rooftop', x: crown.x + 150, b: crown.y + 4, w: 170 });
    decor.push({ n: 'bell', x: crown.x + crown.width - 330, b: crown.y + 4, w: 96 });
    decor.push({ cel: 'tc.hat_shout', x: crown.x + crown.width - 60, b: crown.y + 2, k: 0.42, flip: true });
    // the floor at the bottom is the river's bank, with reeds
    decor.push({ n: 'reedTall', x: 160, b: 6, w: 64 }, { n: 'reedShort', x: W - 200, b: 6, w: 90 });
  }
  const w3decor: W3Decor[] = [];
  if (grotto) {
    // the sinkhole: moss hanging under the shelves, mushrooms and ferns on them, the clawed rock and stalagmites on the floor,
    // stalactites and glowworm threads up in the dark (clear of the root columns and the ropes)
    const clear = (x: number, y: number, half: number) =>
      V.every((v) => v.vineType !== 'tree_climb' || v.topY > y + 10 || v.bottomY < y - 10 || Math.abs(v.x - x) > half + 30) &&
      ROPES.every((r) => Math.abs(r.y + ROPE_RISE - y) > 20 || (Math.abs(r.x0 - x) > half + 30 && Math.abs(r.x1 - x) > half + 30));
    let k = 0;
    for (const p of P) {
      if (p === P[0] || p.width < 180) continue;
      const at = [0.5, 0.3, 0.7].map((u) => p.x + p.width * u).find((x) => clear(x, p.y, 50));
      if (at === undefined) continue;
      const kind = k++ % 4;
      if (kind === 0) w3decor.push({ n: 'mushrooms', x: at, b: p.y + 6, w: 80 });
      else if (kind === 1) w3decor.push({ n: 'fern', x: at, b: p.y + 6, w: 120, flip: k % 2 === 0 });
      else if (kind === 2) w3decor.push({ n: 'mossCurtain', x: p.x + p.width / 2, b: p.y + 14, w: Math.min(220, p.width * 0.7), hang: true });
      else w3decor.push({ n: 'glowLit', x: at, b: p.y + 20, w: 60, hang: true });
    }
    for (let fx = 200; fx < W - 200; fx += R.r(420, 620)) w3decor.push({ n: R.pick(['stalagmites', 'clawRock', 'mushrooms'] as const), x: Math.round(fx), b: 8, w: Math.round(R.r(110, 170)) });
    // Matt's sinkhole sheet: the sinkhole's wet walls rising either side of the climb, and water trickling down to the floor
    const top = Math.min(...P.map((p) => p.y)) - 300;
    const tileW = 340, tileH = Math.round((340 * 1200) / 1054);
    for (const wx of [tileW / 2 - 40, W - tileW / 2 + 40]) for (let wb = 8; wb > top; wb -= tileH - 6) w3decor.unshift({ n: 'wallTile', x: Math.round(wx), b: Math.round(wb), w: tileW, flip: wx > W / 2 });
    for (const tx of [tileW + 60, W - tileW - 60]) w3decor.push({ n: 'trickle', x: Math.round(tx), b: 8, w: 96 });
  }
  // 4-1: rocks coming loose over the wide ledges of the middle of the climb, clear of every trunk and rope end on that ledge (he can
  // always stop beside one to wait). One rock to a ledge, never on the first ledges (the climb is learned first) or the top.
  const rocks: RockDrop[] = [];
  if (cliff) {
    const ledges = P.filter((p) => p !== P[0] && p !== crown && p.y < P[0].y - 600 && p.y > crown.y + 500 && p.width >= 260 && p.id !== spot?.platformId).sort((a, b) => b.y - a.y);
    const climbsAt = (p: Platform) => [
      ...V.filter((v) => v.topY <= p.y + 10 && v.bottomY >= p.y - 10).map((v) => v.x),
      ...ROPES.filter((r) => r.g0 === p.y || r.g1 === p.y).flatMap((r) => [r.x0, r.x1]),
    ];
    for (let k = 0; k < ledges.length && rocks.length < 7; k += 2) {
      const p = ledges[k];
      const busy = climbsAt(p);
      const rx = [0.5, 0.38, 0.62].map((u) => Math.round(p.x + p.width * u)).find((rx) => busy.every((bx) => Math.abs(bx - rx) > ROCK.radius + 90));
      if (rx === undefined) continue;
      // it falls from the underside of whatever ledge hangs over this one, or from high above
      const over = P.filter((q) => q.y < p.y - 60 && q.x < rx + ROCK.radius && q.x + q.width > rx - ROCK.radius).reduce((m, q) => Math.max(m, q.y + 24), p.y - 460);
      const r: RockDrop = { x: rx, top: over, land: p.y, every: Math.round(R.r(4.6, 5.6) * 10) / 10, warn: 1.4, offset: Math.round(R.r(0, 5) * 10) / 10 };
      if (!rockFits(r)) continue;
      if (!rocks.length) hint('Rocks are coming loose! Wait for the shadow, then go once it has fallen', 'Rocks are coming loose! Wait for the shadow, then go once it has fallen', 'Rocks are coming loose! Wait for the shadow, then go once it has fallen', p.y + 10);
      rocks.push(r);
      expert += 1.6;
    }
  }

  const shift = 400 - crown.y;
  for (const r of rocks) { r.top += shift; r.land += shift; }
  if (spot) spot.y += shift;
  for (const m of mistSpots) {
    m.y += shift;
    m.area!.top += shift;
    m.area!.bottom += shift;
    m.view!.y += shift;
  }
  for (const n of nests) n.y += shift;
  for (const d of w3decor) d.b += shift;
  for (const p of P) p.y += shift;
  for (const v of V) { v.topY += shift; v.bottomY += shift; }
  for (const t of T) { t.groundY += shift; t.topY += shift; }
  for (const c of C) c.y += shift;
  for (const e of E) e.y += shift;
  for (const r of ROPES) { r.y += shift; r.g0 += shift; r.g1 += shift; }
  for (const cp of checkpoints) cp.y += shift;
  for (const h of hollows) h.y += shift;
  for (const d of decor) d.b += shift;
  for (const h of hints) if (h.aboveY !== undefined) h.aboveY += shift;
  for (const b of beats) { b[0] += shift; b[1] += shift; }
  const floorY = P[0].y;
  const H = floorY + 120;
  // the bank's face rises from the floor to just under the top porch, where the village opens onto the sky
  const bankWall = village ? { x0: 0, x1: W, top: crown.y + 40, bottom: floorY + 10 } : undefined;
  const exitX = Math.round(crown.x + crown.width - 140);
  C.push({ id: cid++, type: 'exit_totem', x: exitX, y: crown.y - 30, collected: false, bobPhase: 0 });
  cid = heartsAtFlags(C, checkpoints, cid);

  const movedPickups = fixPickups({ platforms: P, vines: V, ropes: ROPES }, C);
  const cfg: LevelConfig = { ...config, levelWidth: W, levelHeight: H };
  return {
    config: cfg,
    trees: T,
    platforms: P,
    vines: V,
    ropes: ROPES,
    enemies: E,
    boss: null,
    collectibles: C,
    spawnX: 200,
    spawnY: floorY,
    exitTotemX: exitX,
    exitTotemY: crown.y,
    checkpoints: checkpoints.sort((a, b) => b.y - a.y),
    meta: { attempt: seed, chunks: [], width: W, timing: { layoutSeconds: expert, decorSeconds: 0, route: H } },
    proto: {
      hints, covers: [], beats, movedPickups, hollows, ...(decor.length ? { decor } : {}), ...(w3decor.length ? { w3decor } : {}), ...(bankWall ? { bankWall, ladders: true } : {}),
      ...(cliff ? { w4: { rocks, patience: spot ? [spot] : [] } } : {}),
      ...(mist ? { w4: { patience: mistSpots, nests } } : {}),
    },
  };
}

// ---------------------------------------------------------------------------------------------------------------------------
// 1-8 The Long Branch: the chase (World 1's special stage)

/** one section of the long branch: one painted tile (Matt's repeating log, 370 x 100, drawn 60 high) */
export const BRANCH_TILE = 222;

/**
 * 1-8 The Long Branch: a huge branch high in the canopy, and a chase (chase.ts). Learn: run the branch, calm, a couple of easy gaps.
 * Test: it cracks and starts to fall away behind him; gaps, snakes, a swing over a break, a trunk up to a higher branch, a drop to a
 * lower one, and a fast line above for players who never stop. Twist: the collapse speeds up, the branch thins to its tip, and the
 * last liana swings him off it to the shrine on the next tree. Caught or off the branch: a heart, back to the flag (chase.ts).
 */
function buildLongBranch(config: LevelConfig, seed: number): GeneratedStage & { proto: ProtoExtras } {
  const R = stream(seed);
  const P: Platform[] = [];
  const V: Vine[] = [];
  const T: TreeStructure[] = [];
  const E: Enemy[] = [];
  const C: Collectible[] = [];
  const checkpoints: Array<{ x: number; y: number; reached: boolean }> = [];
  const hints: StageHint[] = [];
  const beats: Array<[number, number, string]> = [];
  let pid = 1, vid = 1, tid = 1, eid = 1, cid = 1, seedN = 0;
  let expert = 0;
  const RUN = 285, SWING = 430, CLIMB = 220;
  const TILE = BRANCH_TILE;
  let x = 0;
  let level = G;

  const flower = (fx: number, fy: number, v: Collectible['botanicalVariant'] = 'orchid') =>
    C.push({ id: cid++, type: 'flower', botanicalVariant: v, x: Math.round(fx), y: Math.round(fy), collected: false, bobPhase: (fx * 0.031) % 6.28 });
  const row = (x0: number, x1: number, fy: number, n: number, v: Collectible['botanicalVariant'] = 'orchid') => {
    for (let i = 0; i < n; i++) flower(x0 + ((x1 - x0) * i) / Math.max(1, n - 1), fy, v);
  };
  const hint = (hx: number, text: string) => hints.push({ x: hx, text, pad: text, keys: text });
  const flag = () => checkpoints.push({ x: Math.round(x - TILE / 2), y: level, reached: false });
  /** n sections of branch at the current height */
  const sec = (n: number, w = TILE) => {
    for (let k = 0; k < n; k++) {
      P.push({ id: pid++, x: Math.round(x), y: level, width: w, height: 40, type: 'solid', chase: true });
      x += w;
    }
    expert += (n * w) / RUN;
  };
  const gap = (w: number) => {
    x += Math.round(w);
    expert += w / RUN + 0.15;
  };
  const snake = (sx: number, range: number) => {
    E.push({
      id: eid++, type: 'snake', x: sx, y: level - 14, vx: 28, vy: 0, width: 38, height: 22, hp: 1, maxHp: 1, facing: -1,
      patrolMinX: sx - range / 2, patrolMaxX: sx + range / 2, attackCooldown: 2, telegraphTimer: 0, isAttacking: false,
      animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0,
    } as Enemy);
    expert += 1;
  };
  const one = reachJump(0, false), two = reachJump(0, true);

  /** a break in the branch with one liana over it (checked against the swing physics), landing on the branch beyond */
  const swingGap = () => {
    const edge = x;
    for (let tries = 0; tries < 14; tries++) {
      const easy = tries > 8;
      const d0 = R.r(170, 200);
      const d1 = easy ? R.r(190, 220) : R.r(200, 245);
      const top = Math.round(level - R.r(360, 400));
      const v: Vine = { id: -1, x: edge + d0, topY: top, bottomY: Math.min(level + 30, top + 410), swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true };
      const far: Platform = { id: -99, x: edge + d0 + d1, y: level, width: TILE * 3, height: 40, type: 'solid' };
      if (!(jumpGrab(edge, level, v) >= 4 && landWindow(null, v, far) >= 8) && tries < 13) continue;
      V.push({ ...v, id: vid++, swayPhase: (v.x * 0.013) % 6.28 });
      row(edge + 30, edge + d0 + d1 - 30, Math.min(level - 150, top + 200), 3, 'hibiscus');
      x = Math.round(edge + d0 + d1);
      expert += (d0 + d1) / SWING + 0.6;
      return;
    }
  };
  /** the branch meets a trunk: climb it to a higher branch that carries on */
  const climbUp = (h: number) => {
    const tX = Math.round(x - 60);
    const tree: TreeStructure = { id: tid++, x: tX, groundY: level, topY: level - h - 150, trunkWidth: 76, hasClimbVine: true, canopyRadius: 150 };
    T.push(tree);
    V.push({ id: vid++, x: tX, topY: level - h - 2, bottomY: level - 6, swaySpeed: 0.9, swayPhase: (tX * 0.007) % 6.28, vineType: 'tree_climb', treeId: tree.id });
    for (let i = 0; i < 3; i++) flower(tX, level - 70 - i * 60, 'hibiscus');
    level -= h;
    x = tX - 40;
    expert += h / CLIMB + 0.8;
  };
  /** a short drop to a lower branch */
  const dropDown = (h: number) => {
    gap(Math.round(one * R.r(0.3, 0.45)));
    level += h;
  };
  /** the fast line: a few short branches above the main one (petals, and at its end a golden seed), for players who never stop */
  const fastLine = () => {
    const y0 = level;
    let fx = x + TILE * 0.6;
    const hy = y0 - Math.round(R.r(140, 155));
    for (let k = 0; k < 3; k++) {
      const w = 170;
      P.push({ id: pid++, x: Math.round(fx), y: hy, width: w, height: 40, type: 'solid', chase: true });
      row(fx + 40, fx + w - 40, hy - 34, 2, 'hibiscus');
      if (k === 2) {
        seedN++;
        C.push({ id: cid++, type: 'seed', x: Math.round(fx + w - 30), y: hy - 40, collected: false, bobPhase: seedN, findId: `seed-${seedN}` });
      }
      fx += w + Math.round(one * R.r(0.45, 0.55));
    }
  };
  const beat = (name: string, f: () => void) => {
    const b0 = x;
    f();
    beats.push([b0, x, name]);
  };

  // ---- Learn: the long branch, calm
  beat('Learn: the long branch', () => {
    sec(4);
    hint(300, 'This branch goes on and on');
    row(x - TILE * 3, x - 60, level - 34, 3, 'hibiscus');
    gap(one * 0.4);
    sec(3);
    // World 1's book hides in a Hush Fern here, in the calm before the chase (stage 8 holds the book: finds.ts); nobody can crouch
    // and search once the branch is falling
    const book = findForStage(config.worldIndex, config.miniIndex);
    if (book && book.kind === 'book') C.push({ id: cid++, type: 'find', findId: book.id, hidden: true, x: Math.round(x - TILE * 1.5), y: level - 26, collected: false, bobPhase: 0 });
    gap(one * 0.5);
    sec(3);
    flag();
    sec(2);
  });
  const start = x;

  // ---- Test: it breaks behind him; keep moving
  beat('Test: keep moving', () => {
    sec(4);
    row(x - TILE * 3, x - 80, level - 34, 3, 'orchid');
    gap(one * R.r(0.45, 0.55));
    sec(3);
    snake(x - TILE * 1.5, TILE * 1.6);
    sec(2);
    gap(two * R.r(0.62, 0.7));
    sec(3);
    flag();
    swingGap();
    sec(3);
    climbUp(Math.round(R.r(190, 220)));
    sec(4);
    fastLine();
    sec(4);
    flag();
    dropDown(Math.round(R.r(120, 160)));
    sec(3);
    snake(x - TILE * 1.5, TILE * 1.6);
    sec(2);
    // more of the same, rolled, until even a quick player needs most of two minutes
    let n = 0;
    while (expert < EXPERT_SECONDS - 22 && n < 40) {
      const k = n % 5;
      if (k === 0) { gap(one * R.r(0.45, 0.6)); sec(3); }
      else if (k === 1) { gap(two * R.r(0.6, 0.72)); sec(3); row(x - TILE * 2, x - 60, level - 34, 2, 'orchid'); }
      else if (k === 2) { swingGap(); sec(3); }
      else if (k === 3) { sec(2); snake(x - TILE, TILE * 1.4); sec(2); }
      else { if (level < G - 100) dropDown(Math.round(R.r(120, 160))); else climbUp(Math.round(R.r(180, 210))); sec(3); }
      n++;
      if (n % 3 === 0) flag();
    }
    sec(2);
    flag();
  });

  // ---- Twist: it breaks for good: faster, the branch thins to its tip, and the last liana swings him off to the shrine
  let finalFrom = 0;
  let end = 0;
  beat('Twist: the last liana', () => {
    finalFrom = x;
    hint(x + 60, 'It is all coming down. The vine at the end!');
    sec(3);
    gap(one * 0.5);
    sec(3);
    // the tip: the last section (drawn from the sheet's branch end)
    P.push({ id: pid++, x: Math.round(x), y: level, width: TILE, height: 40, type: 'solid', chase: true, chaseTip: true });
    x += TILE;
    expert += TILE / RUN;
    // the last liana, out over the gap between the trees, and the shrine on the next tree's crown
    const edge = x;
    let vx = edge + 185, top = level - 380;
    for (let tries = 0; tries < 14; tries++) {
      const d0 = R.r(170, 195);
      const t = Math.round(level - R.r(360, 395));
      const v: Vine = { id: -1, x: edge + d0, topY: t, bottomY: Math.min(level + 30, t + 410), swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true };
      const far: Platform = { id: -99, x: edge + d0 + 230, y: level, width: 900, height: BANK_H, type: 'solid' };
      vx = v.x;
      top = t;
      if (jumpGrab(edge, level, v) >= 4 && landWindow(null, v, far) >= 8) break;
    }
    V.push({ id: vid++, x: Math.round(vx), topY: top, bottomY: Math.min(level + 30, top + 410), swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true });
    end = Math.round(vx);
    x = Math.round(vx + 230);
    expert += 415 / SWING + 0.6;
  });
  // the next tree's crown: solid, and the shrine on it
  const crown: Platform = { id: pid++, x: Math.round(x), y: level, width: 900, height: 40, type: 'solid', crown: true };
  P.push(crown);
  row(crown.x + 80, crown.x + 340, level - 34, 3, 'hibiscus');
  const exitX = crown.x + 620;
  C.push({ id: cid++, type: 'exit_totem', x: exitX, y: level - 30, collected: false, bobPhase: 0 });
  x = crown.x + crown.width;
  expert += 620 / RUN;

  // nothing should sit under the branch; the stage is as tall as the deepest branch needs, plus the fall
  const lowest = Math.max(...P.map((p) => p.y));
  const movedPickups = fixPickups({ platforms: P, vines: V }, C);
  const width = Math.ceil(x + 20);
  const cfg: LevelConfig = { ...config, levelWidth: width, levelHeight: Math.max(config.levelHeight, lowest + 320) };
  return {
    config: cfg,
    trees: T,
    platforms: P,
    vines: V,
    ropes: [],
    enemies: E,
    boss: null,
    collectibles: C,
    spawnX: 140,
    spawnY: G,
    exitTotemX: exitX,
    exitTotemY: level,
    checkpoints: checkpoints.sort((a, b) => a.x - b.x),
    meta: { attempt: seed, chunks: [], width, timing: { layoutSeconds: expert, decorSeconds: 0, route: width } },
    proto: { hints: hints.sort((a, b) => a.x - b.x), covers: [], beats, movedPickups, chase: { start, end, finalFrom } },
  };
}

// ---------------------------------------------------------------------------------------------------------------------------
// golden seeds: the secrets, saved per stage

const seedKey = (stageId: string, n: string) => `sloth_seed_${stageId}_${n}`;
export function seedFound(stageId: string, n: string): boolean {
  try {
    return localStorage.getItem(seedKey(stageId, n)) === '1';
  } catch {
    return false;
  }
}
export function markSeedFound(stageId: string, n: string) {
  try {
    localStorage.setItem(seedKey(stageId, n), '1');
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------------------------------------------------------
// drawing: the log, the seeds and the leaves over the nook

export function drawPushLog(ctx: CanvasRenderingContext2D, p: Platform, t: number) {
  const { x, y, width: w, height: h } = p;
  const r = h / 2;
  ctx.save();
  // shadow
  ctx.fillStyle = 'rgba(20, 30, 10, 0.28)';
  ctx.beginPath();
  ctx.ellipse(x + w / 2, y + h + 2, w * 0.55, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  // body
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, '#9a6a3c');
  g.addColorStop(0.45, '#7a4f2a');
  g.addColorStop(1, '#4f321b');
  ctx.fillStyle = g;
  ctx.strokeStyle = '#2e1d0f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + r * 0.5, y);
  ctx.lineTo(x + w - r * 0.5, y);
  ctx.ellipse(x + w - r * 0.5, y + r, r * 0.5, r, 0, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(x + r * 0.5, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // bark lines
  ctx.strokeStyle = 'rgba(46, 29, 15, 0.55)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    const yy = y + h * (0.22 + i * 0.19);
    ctx.beginPath();
    ctx.moveTo(x + r * 0.6 + i * 6, yy);
    ctx.bezierCurveTo(x + w * 0.4, yy - 4, x + w * 0.6, yy + 4, x + w - r * 0.7, yy);
    ctx.stroke();
  }
  // moss on top
  ctx.fillStyle = '#5f9a3a';
  ctx.beginPath();
  ctx.ellipse(x + w * 0.45, y + 3, w * 0.32, 6, 0, Math.PI, 0);
  ctx.fill();
  // the hollow end, facing the player
  ctx.fillStyle = '#b98a55';
  ctx.strokeStyle = '#2e1d0f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(x + r * 0.5, y + r, r * 0.5, r, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#2b1a0c';
  ctx.beginPath();
  ctx.ellipse(x + r * 0.5, y + r, r * 0.3, r * 0.66, 0, 0, Math.PI * 2);
  ctx.fill();
  // a small "push me" shimmer the first seconds of the stage
  const a = 0.25 + 0.2 * Math.sin(t * 3);
  ctx.strokeStyle = `rgba(255, 236, 160, ${a})`;
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 3, y - 3, w + 6, h + 6);
  ctx.restore();
}

export function drawSeed(ctx: CanvasRenderingContext2D, c: Collectible, t: number) {
  const bob = Math.sin(t * 2.2 + c.bobPhase) * 4;
  const x = c.x, y = c.y + bob;
  ctx.save();
  const glow = ctx.createRadialGradient(x, y, 2, x, y, 34);
  glow.addColorStop(0, 'rgba(255, 226, 120, 0.85)');
  glow.addColorStop(1, 'rgba(255, 200, 60, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, 34, 0, Math.PI * 2);
  ctx.fill();
  // the seed: a fat golden teardrop with a little sprout
  const g = ctx.createLinearGradient(x - 10, y - 14, x + 10, y + 14);
  g.addColorStop(0, '#fff3b0');
  g.addColorStop(0.5, '#f2b632');
  g.addColorStop(1, '#b8741a');
  ctx.fillStyle = g;
  ctx.strokeStyle = '#6b3d0c';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x, y - 15);
  ctx.bezierCurveTo(x + 13, y - 4, x + 12, y + 14, x, y + 14);
  ctx.bezierCurveTo(x - 12, y + 14, x - 13, y - 4, x, y - 15);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#58a33c';
  ctx.strokeStyle = '#24451a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(x + 6, y - 17, 7, 3.5, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // sparkle
  const s = (Math.sin(t * 4 + c.bobPhase) + 1) / 2;
  ctx.fillStyle = `rgba(255,255,255,${0.5 + 0.5 * s})`;
  ctx.beginPath();
  ctx.arc(x - 4, y - 5, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** leaves in front of the hidden nook: thick until Pokey comes within reach, then they part */
export function drawLeafCover(ctx: CanvasRenderingContext2D, cv: LeafCover, px: number, py: number, t: number) {
  const near = Math.max(0, 1 - Math.hypot(px - (cv.x + cv.w / 2), py - (cv.y + cv.h / 2)) / 260);
  const alpha = 1 - 0.8 * Math.min(1, near * 1.6);
  if (alpha <= 0.02) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  const n = 14;
  for (let i = 0; i < n; i++) {
    const fx = cv.x + ((i * 37) % cv.w);
    const fy = cv.y + ((i * 53) % cv.h);
    const sway = Math.sin(t * 1.3 + i) * 3;
    ctx.fillStyle = i % 3 === 0 ? '#2f6b2a' : i % 3 === 1 ? '#3f8a35' : '#24521f';
    ctx.beginPath();
    ctx.ellipse(fx + sway, fy, 34, 16, (i % 5) * 0.6 - 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
