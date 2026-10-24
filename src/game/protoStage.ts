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
import { JUMP_RISE, reachGlide, reachJump } from './physics.ts';
import { HANG_DROP, ROPE_RISE, ROPE_SPEED } from './rope.ts';
import { findForStage } from './finds.ts';
import type { Bush, WatchZone } from './watcher.ts';
import { catchWindow, earlyCatch, jumpGrab, landWindow, maxRise } from './protoCheck.ts';

export const PROTO_STAGE_ID = '1-6';
/** every stage built the new way so far (behind the New stages switch): stage id -> its plan */
export type StagePlan = 'proto' | 'ctest' | '1-1' | '1-2' | '1-3' | '1-4' | '1-5' | '1-7' | '1-8' | '1-9';
export const HAND_STAGES: Record<string, Exclude<StagePlan, 'ctest'>> = { '1-1': '1-1', '1-2': '1-2', '1-3': '1-3', '1-4': '1-4', '1-5': '1-5', '1-6': 'proto', '1-7': '1-7', '1-8': '1-8', '1-9': '1-9' };

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
   * every one of them is down. Each drop names the surface it lands on.
   */
  ring?: { x0: number; x1: number; wallId: number; waves: Array<Array<{ x: number; surface: number; kind: 'snake' | 'boa' }>> };
  /** the collapse that chases him along the long branch (1-8: chase.ts) */
  chase?: import('./chase.ts').ChasePlan;
  /** bushes to hide in, and the stretches the eagle watches (1-7: watcher.ts) */
  bushes?: import('./watcher.ts').Bush[];
  watch?: import('./watcher.ts').WatchZone[];
  /** World 2's painted dressing: reeds, lily pads, the village's doors and signs, and its folk (w2Stages.ts, drawn by riverArt.ts) */
  decor?: import('./riverArt.ts').W2Decor[];
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
/** 1-3 Branch Snakes asks for 16 snakes, not 10: the stage holds about 25, so the punching it teaches is most of the way through */
export const SNAKE_GOAL_13 = 16;

/** the stage's length target: a quick, sure player (Matt) needs at least this long (s) */
export const EXPERT_SECONDS = 140;

export type PieceKind = 'rest' | 'hollow' | 'gorge' | 'kapok' | 'log' | 'canopy' | 'highrun' | 'stumps' | 'snakes';

/**
 * The hand-built 1-6, planned and rolled: the stage is always the same chain of beats (learn, develop, puzzle, twist, develop again,
 * finish), and the dice (`seed`) decide how many vines a chain has, how far apart and how high they hang, how long each stretch is,
 * where the snakes sit, the order of the pieces inside a beat, and the dressing. Every rolled piece is checked against the physics
 * (protoCheck.ts) and rolled again if a swing or a landing would not work.
 */
export function buildProtoStage(config: LevelConfig, seed = 1, plan: StagePlan = 'proto'): GeneratedStage & { proto: ProtoExtras } {
  if (plan === '1-4') return buildKapok(config, seed);
  if (plan === '1-8') return buildLongBranch(config, seed);
  const R = stream(seed);
  const P: Platform[] = [];
  const V: Vine[] = [];
  const ROPES: Rope[] = [];
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
    for (let k = 0; k < n; k++) {
      h = Math.max(50, Math.min(150, h + R.pick([50, 60, 70, -50] as const)));
      const w = R.r(90, 150);
      block(x, x + w, k === 0 ? 50 : h);
      flower(x + w / 2, G - (k === 0 ? 50 : h) - 34, 'orchid');
      run(w + R.r(60, 120));
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
  const BUSH_W = { tall: 124, wide: 176, fern: 150 } as const;
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

  if (plan === 'ctest') {
    // the control test: the same stage for every player (the seed is fixed by the caller), one skill per stretch, cheap to fail
    beat('Run and stop', () => {
      hint(x + 60, 'Run to the flowers and stop on them', 'Run to the flowers and stop on them', 'Run to the flowers and stop on them');
      run(500);
      row(x, x + 160, G - 34, 3, 'orchid');
      run(700);
      hint(x - 300, 'Now turn around and run back a little', 'Now turn around and run back a little', 'Now turn around and run back a little');
      run(300);
      flag();
    });
    beat('Short hops', () => {
      hint(x + 60, 'Hop up the stumps');
      stumps();
      stumps();
      flag();
    });
    beat('Long jumps', () => {
      hint(x + 60, 'Jump the gaps. The last two need a second jump', 'Jump the gaps. The last two need a second jump', 'Jump the gaps. The last two need a second jump');
      gaps();
      flag();
    });
    beat('Climb up and down', () => {
      hint(x + 60, 'Climb to the top of the tree, then climb back down', 'Climb to the top of the tree, then climb back down', 'Climb to the top of the tree, then climb back down');
      climbTree();
      rest(300);
      climbTree();
      flag();
    });
    beat('Swing', () => {
      hint(x + 120, 'Jump into the vine to grab it, jump again to let go');
      chain(1, true, 'hollow');
      rest(R.r(300, 400));
      chain(2, true, 'hollow');
      rest(R.r(300, 400));
      chain(3, true, 'hollow');
      flag();
    });
    beat('Fight', () => {
      hint(x + 60, 'Punch and kick the snakes', 'Punch and kick the snakes', 'Punch and kick the snakes');
      snakes();
      rest(300);
      snakes();
      flag();
    });
    beat('Finish', () => rest(700));
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
  const exitX = x - 260;
  close();
  C.push({ id: cid++, type: 'exit_totem', x: exitX, y: G - 30, collected: false, bobPhase: 0 });

  const width = Math.ceil(x + 20);
  const cfg: LevelConfig = { ...config, levelWidth: width, levelHeight: Math.max(config.levelHeight, 900), ...(plan === '1-2' ? { targetCount: PETAL_GOAL_12 } : plan === '1-3' ? { targetCount: SNAKE_GOAL_13 } : plan === '1-5' ? { targetCount: PETAL_GOAL_15 } : plan === '1-9' ? { targetCount: GUARD_GOAL_19 } : {}) };
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
    proto: { hints: hints.sort((a, b) => a.x - b.x), covers, beats, movedPickups, ...(BUSHES.length ? { bushes: BUSHES } : {}), ...(ZONES.length ? { watch: ZONES } : {}), ...(RING ? { ring: RING } : {}) },
  };
}
// ---------------------------------------------------------------------------------------------------------------------------
// 1-4 Up the Kapok: the first climbing stage, built from the floor up

/** the kapok's width (the engine keeps him inside it) and the margin nothing is built in */
const KAPOK_W = 3200;
const KAPOK_MARGIN = 90;

/**
 * 1-4 Up the Kapok: going up. Learn: climb a trunk to its branch, twice, straight up from the floor. Test: a zigzag of rope, branch and
 * trunk, back and forth across the tree (with a hidden hollow up a side trunk: a golden seed). Twist: one long rope across the widest
 * gap, near the top. Finish: the last trunk to the crown and the shrine. A fall only drops him to a lower branch or the floor: it costs
 * the climb, never a life. Built from y = 0 upward and shifted down at the end, so the crown sits near the top of the stage.
 */
function buildKapok(config: LevelConfig, seed: number): GeneratedStage & { proto: ProtoExtras } {
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
    hint('Slide up on the trunk to climb', 'Hold up on the trunk to climb', 'Hold up on the trunk to climb');
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
      hollows.push({ x: sx, y: hy });
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
    while (expert < EXPERT_SECONDS - 32 && n < 30) {
      if (n % 3 === 2) hops(R.i(2, 3));
      else rope(Math.round(R.r(390, 460)), Math.round(R.r(300, 380)), n % 2 ? 3 : 0);
      // from the third run on, a snake now and then on a wide branch (the punch learned in 1-3 comes back)
      if (n >= 2 && cur.width >= 320 && R.chance(0.4)) snake(cur.x + cur.width / 2, cur.y, cur.width - 140);
      climb(Math.round(R.r(260, 320)));
      n++;
      if (n % 2 === 0) flag();
    }
  });

  // ---- Twist: the long rope across the widest gap, with the whole crown around him
  beat('Twist: the long rope', () => {
    // set out from the side of the tree that leaves the most room
    dir = cur.x + cur.width / 2 < W / 2 ? 1 : -1;
    hint('A long way across. Keep sliding', 'A long way across. Keep holding the way to go', 'A long way across. Keep holding the way to go', cur.y + 10);
    const gap = Math.min(Math.round(R.r(900, 1050)), Math.round(room() - 340));
    rope(gap, 340, 6);
    flag();
  });

  // ---- Finish: up to the crown and the shrine
  beat('Finish: the crown', () => {
    climb(Math.round(R.r(280, 320)));
    hops(2);
    // the crown: a wide branch with the shrine on it
    if (room() < 620) dir = dir === 1 ? -1 : 1;
    const tX = Math.round(dir === 1 ? cur.x + cur.width - 60 : cur.x + 60);
    const top = cur.y - 300;
    trunk(tX, cur.y, top);
    expert += 300 / CLIMB + 1;
    cur = ledge(tX - 40, Math.min(W - KAPOK_MARGIN, tX + 560), top);
    row(cur.x + 80, cur.x + 300, top - 34, 3, 'hibiscus');
  });

  // shift down: the crown sits 400 px under the top of the stage, the floor 120 px over its bottom
  const crown = cur;
  const shift = 400 - crown.y;
  for (const p of P) p.y += shift;
  for (const v of V) { v.topY += shift; v.bottomY += shift; }
  for (const t of T) { t.groundY += shift; t.topY += shift; }
  for (const c of C) c.y += shift;
  for (const e of E) e.y += shift;
  for (const r of ROPES) { r.y += shift; r.g0 += shift; r.g1 += shift; }
  for (const cp of checkpoints) cp.y += shift;
  for (const h of hollows) h.y += shift;
  for (const h of hints) if (h.aboveY !== undefined) h.aboveY += shift;
  for (const b of beats) { b[0] += shift; b[1] += shift; }
  const floorY = P[0].y;
  const H = floorY + 120;
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
    proto: { hints, covers: [], beats, movedPickups, hollows },
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
