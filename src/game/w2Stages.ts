/**
 * World 2, the Sunlit Riverbank, built by hand (2026-10-24, three stages at a time): 2-1 Down to the River, 2-2 Petals for the Crown and
 * 2-3 Stuck in the Reeds. Each is one idea played in beats (learn, develop, twist, finish) the way World 1's stages are (protoStage.ts),
 * planned and rolled: the beats are always there in order, and a seed rolls the lengths, the spacing and the dressing.
 *
 * The world's rule is the river: logs drift across between two banks and never stop (river.ts). 2-1 teaches it over a river that costs
 * no life (a splash puts him back on the bank), then deep rivers, then one that flows back toward him. 2-2 gathers flowers above the logs
 * and across a lily pond. 2-3 hides three reed cages in the reeds, one out on an island, one up a mooring post.
 *
 * Painted from Matt's World 2 sheets (riverArt.ts): the river, the logs, lily pads, reeds, and the village at the end of 2-1 with its round
 * doors, its PLEASE BE PATIENT sign and the mailman, who has been carrying the same parcel since the spring.
 */
import { fixPickups } from './flowerReach.ts';
import { PAST_SHRINE } from './rules.ts';
import { findForStage } from './finds.ts';
import { reachJump } from './physics.ts';
import { catchWindow, earlyCatch, jumpGrab, landWindow } from './protoCheck.ts';
import { buildKapok, EXPERT_SECONDS, G, stream, type ProtoExtras, type StageHint } from './protoStage.ts';
import { gapFor, driftX, logLayout, LOG_DROP, LOG_HEIGHT, surfaceBelowBank, type RiverZone } from './river.ts';
import type { W2Decor } from './riverArt.ts';
import { W2_FRAMES } from './w2PropsData.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import { SAFE_APPROACH } from './levelCheck.ts';
import { addKitPlatforms, kitPlatId, type Anchor, type RoomSpec, type RoomTips } from './puzzleKit.ts';
import type { Collectible, Enemy, LevelConfig, Platform, TreeStructure, Vine } from './types.ts';
import { buildW2Sections, w2Picks, type W2Kit, type W2Look, type W2Plan } from './w2Sections.ts';

export type { W2Plan } from './w2Sections.ts';
export const W2_STAGES: Record<string, W2Plan> = {
  '2-1': '2-1',
  '2-2': '2-2',
  '2-3': '2-3',
  '2-4': '2-4',
  '2-5': '2-5',
  '2-6': '2-6',
  '2-7': '2-7',
  '2-8': '2-8',
  '2-9': '2-9',
};

/** 2-2 asks for 80 flowers for the king's crown (the stage holds about one and a half times that) */
export const FLOWER_GOAL_22 = 80;
/** 2-5 asks for 14 snappers chased off (the stage holds about 21) */
export const SNAPPER_GOAL_25 = 14;
/** 2-3: five little ones to free (capybaras, ducklings and otters), each in a reed cage on a pulley */
export const CAGES_23 = 5;
/** 2-8 Reed Cages asks for 7 more little ones (the stage holds about one and a half times that) */
export const CAGES_28 = 7;
/** 2-9 The River King's Court asks for 14 of the court's guards and snappers (it holds about one and a half times that) */
export const COURT_GOAL_29 = 14;
/** a reed island's top in a rising river: just above the still water (it starts 20 px below), so the water covers it as it rises */
export const ISLAND_TOP = 600;
/**
 * px of plain bank from the spawn before a stage's first danger (World 2): more than four seconds of walking at his top run (285 px/s),
 * so Dot's first tip (she waits 2.5 s at a stage's start: dotGuide.ts CALM) is up before anything can hurt him (stageStart.test.ts)
 */
export const START_WALK = 1150;
/** the stages with puzzle rooms (puzzleKit.ts): the reed cages on their pulleys (2-3, 2-8), the ferry's sluice (2-2), the court's bell (2-9) */
export const W2_PUZZLES: ReadonlySet<string> = new Set(['2-2', '2-3', '2-8', '2-9']);
/** a stone weighs this much in a counter-basket (puzzleKit.ts ITEM.stone) */
const STONE = 2;
/** a hanging cage's pool: a hop across, the cage over its middle; how far over the bank the cage comes up, its floor dropping open */
const POOL_W = 130;
const CAGE_UP = 50;
type Critter = 'capy' | 'duck' | 'otter';

const WATER = 730;
const BANK_H = 90;
/** the river's surface, and where a log rides */
export const SURFACE = G + surfaceBelowBank;
const LOG_Y = G + LOG_DROP;

/**
 * 2-6 (World 1's climb, built up the bank houses: protoStage.ts buildKapok): no animal's patch within 200 px of a flag (levelCheck
 * SAFE_APPROACH; 123 of 200 rolls had one, 2026-10-28). Its patrol is cut back to stop short of the flag; one standing too near to cut
 * back loses the flag instead (the flags either side of it still hold).
 */
function clearFlags<S extends GeneratedStage>(st: S): S {
  const away = SAFE_APPROACH + 8;
  const flags = st.checkpoints ?? [];
  for (const e of st.enemies) {
    if (e.type === 'eagle') continue;
    for (let i = flags.length - 1; i >= 0; i--) {
      const f = flags[i];
      if (Math.abs(e.y - f.y) >= 400) continue;
      if (Math.abs(e.x - f.x) < away) flags.splice(i, 1);
      else if (f.x < e.x) e.patrolMinX = Math.max(e.patrolMinX, f.x + away);
      else e.patrolMaxX = Math.min(e.patrolMaxX, f.x - away);
    }
  }
  return st;
}

export function buildW2Stage(config: LevelConfig, seed = 1, plan: W2Plan): GeneratedStage & { proto: ProtoExtras } {
  // 2-6 Up the Bank Houses: World 1's climbing stage (1-4) built up the riverbank village instead of the kapok
  if (plan === '2-6') return clearFlags(buildKapok(config, seed, true));
  const R = stream(seed * 7 + 2);
  const P: Platform[] = [];
  const V: Vine[] = [];
  const T: TreeStructure[] = [];
  const E: Enemy[] = [];
  const C: Collectible[] = [];
  const rivers: RiverZone[] = [];
  const decor: W2Decor[] = [];
  const checkpoints: Array<{ x: number; y: number; reached: boolean }> = [];
  const hints: StageHint[] = [];
  const beats: Array<[number, number, string]> = [];
  const pieces: Array<{ k: string; x0: number; x1: number }> = [];
  let pid = 1,
    eid = 1,
    cid = 1,
    seedN = 0;
  let expert = 0;
  const RUN = 285;
  const one = reachJump(0, false);
  /** the bank's dressing for this roll (w2Sections.ts w2Picks): set before the sections are built */
  let look: W2Look = 'reeds';

  // ----- the kit -----
  const bank = (x0: number, x1: number, y = G) => {
    const p: Platform = {
      id: pid++,
      x: x0,
      y,
      width: x1 - x0,
      height: BANK_H + (G - y),
      type: 'solid',
      style: 'log',
    };
    P.push(p);
    return p;
  };
  const flower = (x: number, y: number, v: Collectible['botanicalVariant'] = 'hibiscus') =>
    C.push({
      id: cid++,
      type: 'flower',
      botanicalVariant: v,
      x,
      y,
      collected: false,
      bobPhase: (x * 0.031) % 6.28,
    });
  const row = (x0: number, x1: number, y: number, n: number, v: Collectible['botanicalVariant'] = 'lotus') => {
    for (let i = 0; i < n; i++) flower(x0 + ((x1 - x0) * i) / Math.max(1, n - 1), y, v);
  };
  const arc = (x0: number, x1: number, yTop: number, n: number, v: Collectible['botanicalVariant'] = 'hibiscus', lift = 60) => {
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      flower(x0 + (x1 - x0) * t, yTop + lift * (1 - Math.sin(Math.PI * t)), v);
    }
  };
  const heart = (x: number, y: number) =>
    C.push({
      id: cid++,
      type: 'heart',
      x,
      y,
      collected: false,
      bobPhase: x * 0.01,
    });
  const snake = (x: number, surface: number, range = 110) => {
    E.push({
      id: eid++,
      type: 'snake',
      x,
      y: surface - 14,
      vx: 28,
      vy: 0,
      width: 38,
      height: 22,
      hp: 1,
      maxHp: 1,
      facing: R.chance(0.5) ? 1 : -1,
      patrolMinX: x - range / 2,
      patrolMaxX: x + range / 2,
      attackCooldown: 2,
      telegraphTimer: 0,
      isAttacking: false,
      animTimer: 0,
      hitFlashTimer: 0,
      defeated: false,
      koTimer: 0,
      behaviorTimer: 0,
    } as Enemy);
  };
  /** a river snapper (predatorAI.ts 'turtle') patrolling its patch of bank */
  const turtle = (tx: number, surface = G, range = 120) => {
    E.push({
      id: eid++, type: 'turtle', x: tx, y: surface - 14, vx: 22, vy: 0, width: 48, height: 24, hp: 1, maxHp: 1, facing: R.chance(0.5) ? 1 : -1,
      patrolMinX: tx - range / 2, patrolMaxX: tx + range / 2, attackCooldown: 1.5, telegraphTimer: 0, isAttacking: false,
      animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0,
    } as Enemy);
  };
  /** one of the river king's guards (2-9): a royal snapper, upright with a spear, marching his patch (predatorAI.ts, `royal`) */
  const guard = (gx: number, surface = G, range = 120) => {
    E.push({
      id: eid++, type: 'turtle', royal: true, x: gx, y: surface - 14, vx: 20, vy: 0, width: 36, height: 66, hp: 2, maxHp: 2, facing: R.chance(0.5) ? 1 : -1,
      patrolMinX: gx - range / 2, patrolMaxX: gx + range / 2, attackCooldown: 1.6, telegraphTimer: 0, isAttacking: false,
      animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0,
    } as Enemy);
  };
  const goldenSeed = (x: number, y: number) => {
    seedN++;
    C.push({
      id: cid++,
      type: 'seed',
      x,
      y,
      collected: false,
      bobPhase: seedN,
      findId: `seed-${seedN}`,
    });
  };
  const hint = (x: number, text: string, pad = text, keys = text) => hints.push({ x, text, pad, keys });
  const reeds = (x: number, b: number, front = false) => {
    const kind = R.pick(['reedTall', 'reedShort', 'reedLean'] as const);
    decor.push({
      n: kind,
      x,
      b,
      w: kind === 'reedTall' ? R.r(58, 74) : kind === 'reedShort' ? R.r(80, 100) : R.r(62, 78),
      flip: R.chance(0.5),
      front,
    });
  };
  const piece = (n: W2Decor['n'], x: number, b: number, w: number, extra: Partial<W2Decor> = {}) => decor.push({ n, x, b, w, ...extra });
  /**
   * a stretch of bank dressed in the roll's look (STAGE-RULES §4: a fresh roll changes it, a retry keeps it): reeds; the moorings, a
   * mooring pole or a spare log pulled up on the bank; or the cottages, a round door with its window, or the washing out
   */
  const dress = (dx: number, b: number) => {
    if (look === 'moorings') {
      if (R.chance(0.5)) piece('pole', dx, b + 4, 64, { flip: R.chance(0.5) });
      else piece('logShort', dx, b + 6, 110, { flip: R.chance(0.5) });
    } else if (look === 'cottages') {
      if (R.chance(0.5)) {
        piece('door', dx, b + 6, 160, { flip: R.chance(0.5) });
        piece('window', dx + 130, b - 30, 70);
      } else piece('laundry', dx, b + 4, 170);
    } else reeds(dx, b + 4);
  };

  // the cursor: x is the open end of the bank Pokey is on
  let bankFrom = 0;
  let bankY = G;
  let x = 0;
  const run = (len: number) => {
    x += len;
  };
  const close = (): Platform | null => (x - bankFrom > 1 ? bank(bankFrom, x, bankY) : null);
  const open = (at: number, y = G) => {
    bankFrom = at;
    x = at;
    bankY = y;
  };
  /**
   * a flag at the open end of the bank. An animal's patch too near it (a snake's bank just before) walks the bank on until the flag is
   * well clear of it (levelCheck: nothing that bites within 200 px of a safe spot)
   */
  const flag = () => {
    const near = () => E.reduce((m, e) => Math.min(m, Math.abs(e.y - bankY) < 400 ? Math.max(0, e.patrolMinX - (x - 80), x - 80 - e.patrolMaxX) : Infinity), Infinity);
    const d = near();
    if (d < 230) {
      run(240 - d);
      expert += (240 - d) / RUN;
    }
    checkpoints.push({ x: x - 80, y: bankY, reached: false });
  };
  const beat = (name: string, f: () => void) => {
    const x0 = x;
    f();
    beats.push([x0, x, name]);
  };

  /** a stretch of bank with flowers and a reed or two at the back */
  function rest(len: number, flowers = true) {
    const x0 = x;
    run(len);
    expert += len / RUN;
    if (flowers && len > 260) row(x0 + 80, x - 80, bankY - 34, Math.max(2, Math.round(len / 170)), R.pick(['hibiscus', 'orchid'] as const));
    if (len > 300 && R.chance(0.6)) dress(R.r(x0 + 60, x - 60), bankY);
    pieces.push({ k: 'rest', x0, x1: x });
  }

  /**
   * the plain bank before a stage's first danger (START_WALK and more): nothing can hurt, but a low step up onto a rise of the bank and
   * back down again every couple of seconds, so the walk is never four seconds with nothing to do (each step 20 px, under the lip's hoist,
   * 26 px, physics.ts FORGIVE: a plain walk carries him up it, STAGE-RULES §2 "Plain walk")
   */
  function startWalk(len: number) {
    const x0 = x;
    const y0 = bankY;
    const step = 20;
    let up = false;
    run(Math.min(len, R.r(380, 440)));
    while (x - x0 < len - 260) {
      close();
      up = !up;
      open(x, y0 - (up ? step : 0));
      run(Math.min(R.r(300, 380), Math.max(120, len - (x - x0) - 140)));
    }
    if (up) {
      close();
      open(x, y0);
    }
    run(Math.max(0, len - (x - x0)));
    expert += len / RUN;
    pieces.push({ k: 'start', x0, x1: x });
  }

  /**
   * a river: the bank ends, logs drift across `logs` log-spacings of water, and a new bank starts beyond. `safe`: falling in costs no life
   * (the teaching river), he is set back on this bank. Flowers arc over the water where a hop from log to log goes.
   */
  function river(dir: 1 | -1, speed: number, logs: number, logW: number, opts: { safe?: boolean; flowers?: number; tag?: string; lead?: number; tail?: number; gap?: number } = {}) {
    const x0r = x;
    run(opts.lead ?? R.r(120, 135));
    close();
    const rx0 = x;
    // (a river that flows back at him may keep its logs closer than it must: they come toward him, so the hop only gets shorter)
    const gap = opts.gap ?? Math.round(gapFor(dir, speed));
    const width = (logs + 1) * (logW + gap) - logW;
    const rx1 = rx0 + width;
    const { count, period } = logLayout({ dir, speed, logW, gap, width });
    for (let i = 0; i < count; i++) {
      const p: Platform = {
        id: pid++,
        x: rx0,
        y: LOG_Y,
        width: logW,
        height: LOG_HEIGHT,
        type: 'drift',
        style: 'log',
        drift: {
          x0: rx0,
          x1: rx1,
          dir,
          speed,
          width: logW,
          offset: (i * period) / count,
          baseY: LOG_Y,
        },
      };
      p.x = driftX(p.drift!, 0);
      P.push(p);
    }
    rivers.push({
      x0: rx0,
      x1: rx1,
      surfaceY: SURFACE,
      dir,
      speed,
      ...(opts.safe ? { safe: { backX: rx0 - 70, backY: G } } : {}),
    });
    const n = opts.flowers ?? Math.max(3, logs + 1);
    if (n > 0) arc(rx0 + 50, rx1 - 50, G - 70, n, 'hibiscus', 50);
    // reeds where the banks meet the water: one on each side, low enough not to hide the logs
    reeds(rx0 - R.r(10, 30), G + 6, R.chance(0.5));
    reeds(rx1 + R.r(10, 30), G + 6, R.chance(0.5));
    open(rx1);
    run(opts.tail ?? R.r(115, 135));
    // a river that flows with him is crossed about as fast as running; one that flows back at him means waiting for each log
    expert += (x - x0r) / RUN + width / (RUN * (dir === 1 ? 0.75 : 0.45)) + 1;
    pieces.push({
      k: opts.tag ?? `river${dir === 1 ? 'W' : 'A'}`,
      x0: x0r,
      x1: x,
    });
    return { x0: rx0, x1: rx1 };
  }

  /** a longer stretch of bank with a snake in its middle (well away from the flags at either end) */
  function guardedRest(len: number, at = 0.6) {
    rest(len);
    // (a flag often follows a stretch like this, at its far end: the snake keeps to the near side of the middle)
    snake(x - len * at, G);
  }

  /**
   * the bank between two crossings: with a river's own bank at each end, about two seconds of plain walking. Long enough to breathe
   * after the hops (a rest), short enough that nothing goes quiet.
   */
  const breath = () => {
    // (on the bank between two crossings a low rise, 20 px, walked up and over: under the lip's hoist, 26 px, so a plain walk carries him
    // up it, and the walk from one river to the next has a step in it. Without it, the river banks of the log rolls were just over two
    // seconds of plain walking each, a fifth of 2-1's, 2-2's and 2-7's rolls dead, 2026-10-28)
    if (bankY !== G || x - bankFrom < 60) return rest(R.r(100, 150), false);
    const x0 = x;
    close();
    open(x, G - 20);
    // (wide enough to land a flick on: at 100-130 px a running flick from its foot carried him over it, plainWalk.test.ts)
    run(R.r(160, 180));
    close();
    open(x, G);
    run(R.r(5, 15));
    expert += (x - x0) / RUN;
    pieces.push({ k: 'rest', x0, x1: x });
  };
  /** a snake on the bank between two crossings, met with a breath of bank still to walk before the next river */
  const snakeBank = () => {
    const x0 = x;
    run(R.r(90, 170));
    snake(x + 115, G, 110);
    run(115 + R.r(100, 150));
    expert += (x - x0) / RUN + 2;
  };

  /** an island between two rivers: a short bank in the middle of the water (flat ground to breathe on) */
  function island(len: number) {
    run(len);
    if (len > 200) reeds(x - len / 2, G + 4);
  }

  /** steps down: three banks, each lower than the last, to the water's level */
  function stepsDown(from: number) {
    const x0 = x;
    const h = from;
    for (const k of [1, 2, 3]) {
      const y = G - Math.round((h * (3 - k)) / 3);
      run(R.r(170, 230));
      close();
      open(x, y);
    }
    run(R.r(120, 180));
    expert += (x - x0) / RUN + 0.5;
    void h;
    pieces.push({ k: 'steps', x0, x1: x });
  }

  /**
   * the far side of still water: a flat stone at the stones' own height at the foot of the bank, the bank a walk-up step above it (20 px,
   * under the lip's hoist). QA 2026-10-29 (2-2): the last hop from a pad or a stone was up onto the bank, 20-34 px higher, and a hop
   * that came up short met the bank's face and slid down it into the water, with no sideways speed; and a kid who ran on off the last
   * stone fell in. Now the last hop lands level, and the bank is walked up onto.
   */
  const LAND_STEP = 80;
  /** returns where the bank starts */
  function landStep(at: number): number {
    P.push({ id: pid++, x: at, y: ISLAND_TOP, width: LAND_STEP, height: 110, type: 'solid', style: 'moss_stone' });
    return at + LAND_STEP;
  }
  /** a lily pond: still water crossed on floating pads, a flower above each */
  function lilyPond(pads: number, deepFlowers = true, special?: { at: number; put: (cx: number, top: number) => void }, opts: { safe?: boolean } = {}) {
    const x0p = x;
    run(R.r(145, 160));
    close();
    const px0 = x;
    let px = px0;
    for (let i = 0; i < pads; i++) {
      // (gaps 36-46% of a jump, 2026-10-29: at up to 55%, a hop from a pad's middle came down short of the next one)
      px += Math.round(one * R.r(0.36, 0.46));
      // (wide pads, 124-144 px, QA 2026-10-29: on the 84-104 px ones a hop that came down past a pad's middle ran on off its far end, and
      // he fell in with no sideways speed; 2-2's lily ponds cost Matt 14 lives. On 130 px pads every take-off from 70 px before the edge to
      // 20 px past it, with any hold, lands and stays)
      const w = Math.round(R.r(124, 144));
      P.push({
        id: pid++,
        x: px,
        y: SURFACE - 8,
        width: w,
        height: 12,
        type: 'solid',
        lily: true,
      });
      if (special?.at === i) special.put(px + w / 2, SURFACE - 8);
      else {
        flower(px + w / 2, SURFACE - 60, 'lotus');
        if (deepFlowers && i % 2 === 1) flower(px + w / 2, SURFACE - 140, 'lotus');
      }
      px += w;
    }
    // (the last hop is up onto the bank, 34 px higher than the pads: a short one, so a hop that comes up short still lands on top
    // instead of meeting the bank's face and sliding down it into the water)
    px += Math.round(one * R.r(0.32, 0.4));
    // still water: no logs, so nothing drifts (speed 0)
    rivers.push({ x0: px0, x1: px, surfaceY: SURFACE, dir: 1, speed: 0, ...(opts.safe ? { safe: { backX: px0 - 70, backY: G } } : {}) });
    reeds(px0 - 20, G + 6);
    reeds(px + 20, G + 6);
    open(landStep(px));
    run(R.r(145, 160));
    expert += (x - x0p) / RUN + pads * 0.35;
    pieces.push({ k: 'pond', x0: x0p, x1: x });
  }

  /** a mooring post standing on the bank with a plank shelf at its top (the kit's perch), climbed by its rope */
  function post(px: number, topY: number) {
    const tree: TreeStructure = {
      id: T.length + 1,
      x: px,
      groundY: bankY,
      topY: topY - 150,
      trunkWidth: 60,
      hasClimbVine: true,
      canopyRadius: 0,
    };
    T.push(tree);
    V.push({
      id: V.length + 1,
      x: px,
      topY: topY - 2,
      bottomY: bankY - 6,
      swaySpeed: 0.9,
      swayPhase: 0,
      vineType: 'tree_climb',
      treeId: tree.id,
    });
    P.push({
      id: pid++,
      x: px - 40,
      y: topY,
      width: 200,
      height: 24,
      type: 'solid',
      style: 'branch',
    });
  }

  /**
   * vines over the river (2-4): the bank ends, lianas hang over the water from the boughs above, and the far bank (or an island, when
   * `island` gives its length) is where the last swing lands. `safe`: the water costs no life (the teaching crossing). Rolled again until
   * the jump grabs the first vine, every vine catches the next, and the last one lands (the same checks as World 1's lianas, protoCheck.ts).
   */
  function swingRiver(n: number, opts: { safe?: boolean; island?: number; flow?: number; frames?: boolean } = {}) {
    const x0r = x;
    run(R.r(120, 170));
    const edge = x;
    close();
    for (let tries = 0; tries < 14; tries++) {
      const easy = !!opts.safe || tries > 7;
      const d0 = R.r(170, 200);
      const sp = Array.from({ length: n - 1 }, () => (easy ? R.r(300, 330) : R.r(315, 350)));
      const d1 = R.r(200, 240);
      const xs = [edge + d0];
      for (const g of sp) xs.push(xs[xs.length - 1] + g);
      const farX = Math.round(xs[n - 1] + d1);
      const tops = xs.map(() => Math.round(opts.safe ? R.r(190, 220) : R.r(140, 200)));
      const vs: Vine[] = xs.map((vx, k) => ({ id: -1 - k, x: vx, topY: tops[k], bottomY: Math.min(G + 30, tops[k] + 410), swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true }));
      const far: Platform = { id: -99, x: farX, y: G, width: opts.island ?? 400, height: BANK_H, type: 'solid' };
      let ok = jumpGrab(edge, G, vs[0]) >= 4;
      for (let k = 0; ok && k < n - 1; k++) ok = catchWindow(vs[k], vs[k + 1]) > 0.6 && earlyCatch(vs[k], vs[k + 1]);
      if (ok) ok = landWindow(n > 1 ? vs[n - 2] : null, vs[n - 1], far) >= 8;
      if (!ok && tries < 13) continue;
      rivers.push({ x0: edge, x1: farX, surfaceY: SURFACE, dir: 1, speed: opts.flow ?? 45, open: true, ...(opts.safe ? { safe: { backX: edge - 70, backY: G } } : {}) });
      // 2-7: each vine hangs from a rope-swing frame standing in the river (no canopy)
      if (opts.frames) for (let k = 0; k < n; k++) decor.push({ n: 'swingFrame', x: xs[k], b: SURFACE + 34, w: 220, top: tops[k] - 6 });
      // the canopy the vines hang from: a leafy clump at each vine's top, and boughs reaching between them
      for (let k = 0; !opts.frames && k < n; k++) {
        const cw = Math.round(R.r(190, 230));
        canopyAt(xs[k], tops[k], cw);
        if (k + 1 < n) {
          const lw = Math.round(xs[k + 1] - xs[k] + 120);
          const ly = Math.min(tops[k], tops[k + 1]) - 6;
          decor.push({ n: 'limbShort', x: (xs[k] + xs[k + 1]) / 2, b: ly + w2h('limbShort', lw) * 0.6, w: lw, flip: k % 2 === 1 });
        }
      }
      if (!opts.frames && R.chance(0.5)) decor.push({ n: 'pole', x: edge + R.r(30, 70), b: SURFACE + 30, w: 64, flip: R.chance(0.5) });
      for (let k = 0; k < n; k++) {
        V.push({ ...vs[k], id: V.length + 1, swayPhase: (xs[k] * 0.013) % 6.28 });
        // the flowers arc where the leap goes, from one vine to the next
        arc(k === 0 ? edge + 10 : (xs[k - 1] + xs[k]) / 2, k === n - 1 ? farX - 10 : (xs[k] + xs[k + 1]) / 2, Math.min(G - 150, tops[k] + 200), 4, 'hibiscus', 70);
      }
      reeds(edge - 20, G + 6, R.chance(0.5));
      reeds(farX + 24, G + 6, R.chance(0.5));
      open(farX);
      run(opts.island ?? R.r(110, 160));
      expert += (edge - x0r) / RUN + (farX - edge) / 430 + 0.3 * n + (x - farX) / RUN;
      pieces.push({ k: `swing${n}`, x0: x0r, x1: x });
      return;
    }
  }

  /** a piece's drawn height at width w (Matt's sheet, w2PropsData.ts) */
  const w2h = (n: keyof typeof W2_FRAMES, w: number) => (w * W2_FRAMES[n].h) / W2_FRAMES[n].w;
  /** the leafy clump a vine hangs from, centred on its top */
  const canopyAt = (vx: number, top: number, w: number) => decor.push({ n: 'canopy', x: vx, b: top + w2h('canopy', w) * 0.45, w, flip: R.chance(0.5) });

  // ----- 2-7 The Mailman's Route: the village's own ways about -----

  /**
   * the carved steps (Matt's painting) up or down the bank: a step every 22 px or so, walked straight up (the wall check lifts him over a
   * step that low), the upper ground carrying on at the new height. Each step is a block down to the ground, drawn by the painting.
   */
  function stairs(rise: number, up: boolean) {
    const x0s = x;
    run(R.r(70, 90));
    close();
    // (each step low enough to walk straight up, and a tread wide enough to stand on: at 28 px wide and 22 px high a small thumb hopping
    // them ran off a step before its flick came)
    // (16 px a step: at 20 px the kid bot hopped them and missed, 2-7 and 2-9 on 13 of 20 bot rolls, 2026-10-28)
    const n = Math.max(3, Math.ceil(rise / 16));
    const r = rise / n;
    const tread = 34;
    const fromY = bankY;
    const toY = up ? fromY - rise : fromY + rise;
    const sx = x;
    for (let i = 0; i < n; i++) {
      const top = Math.round(up ? fromY - r * (i + 1) : fromY + r * (i + 1));
      P.push({ id: pid++, x: sx + i * tread, y: top, width: tread + 1, height: BANK_H + (G - top), type: 'solid', style: 'log', art: 'steps' });
      if (i % 2 === 1) flower(sx + i * tread + tread / 2, top - 34, 'orchid');
    }
    const ex = sx + n * tread;
    // the ground under the stairs (the steps themselves are drawn by the painting, which covers the rock between them and this)
    bank(sx, ex, up ? fromY : toY);
    // the painting: its walk runs from (30, 280) up to (265, 25) when flipped (climbing to the right), (95, 25) down to (330, 280) not
    const kx = (n * tread) / 235;
    const ky = rise / 255;
    const w = 360 * kx;
    const h = 304 * ky;
    const left = up ? sx - 30 * kx : sx - 95 * kx;
    const topY = up ? toY - 25 * ky : fromY - 25 * ky;
    decor.push({ n: 'steps', x: left + w / 2, b: topY + h, w, h, flip: up });
    open(ex, toY);
    run(R.r(70, 90));
    expert += (x - x0s) / RUN + n * 0.08;
    pieces.push({ k: up ? 'stairsUp' : 'stairsDown', x0: x0s, x1: x });
  }

  /**
   * a row of porches (Matt's porch: a deck jutting from a rock) at the level he is on, a hop apart. Over the river (`water`) a fall costs
   * a life and the row ends on high ground at the same level; over dry ground (the teaching row) it ends with a hop down to the path
   * below, where a fall would have put him anyway.
   */
  function porchRun(n: number, water: boolean, tail?: number, safe = false) {
    const x0p = x;
    run(R.r(100, 130));
    close();
    const level = bankY;
    const xs = x;
    let px = x;
    for (let k = 0; k < n; k++) {
      px += Math.round(one * R.r(0.4, 0.52));
      const w = Math.round(R.r(150, 185));
      const y = Math.round(level + (k === 0 ? 0 : R.r(-14, 14)));
      P.push({ id: pid++, x: px, y, width: w, height: 20, type: 'solid', art: 'porch' });
      // the painting's deck runs from 8.5% to 94% of its width, its top 183 of 268 px down
      const wd = w / 0.855;
      const hd = (wd * 268) / 260;
      decor.push({ n: 'porch', x: px - 0.085 * wd + wd / 2, b: y + ((268 - 183) / 268) * hd, w: wd, flip: k % 2 === 1 && !water });
      row(px + 32, px + w - 32, y - 34, 2, 'hibiscus');
      px += w;
    }
    px += Math.round(one * R.r(0.4, 0.5));
    let path: Platform | null = null;
    if (water) {
      rivers.push({ x0: xs, x1: px, surfaceY: SURFACE, dir: 1, speed: 35, open: true, ...(safe ? { safe: { backX: xs - 60, backY: level } } : {}) });
      reeds(xs + 20, G + 6);
      reeds(px - 20, G + 6, true);
      open(px, level);
    } else {
      // the path below the porches, and the row ends with a hop down onto it
      path = bank(xs, px, G);
      open(px, G);
    }
    run(tail ?? R.r(110, 150));
    expert += (x - x0p) / RUN + n * 0.4;
    pieces.push({ k: water ? 'porchesWater' : 'porches', x0: x0p, x1: x });
    return { path, xs, px };
  }

  /** a basket on the rope (2-7): `up` rides from the path up to high ground on the right, else from high ground down to the path */
  function lift(up: boolean, high = G - Math.round(R.r(220, 240))) {
    const x0l = x;
    run(R.r(70, 90));
    const W = 96;
    let sx: number;
    const top = up ? high : bankY;
    if (up) {
      // the path runs up to the foot of the high ground; the shaft is the last stretch of path before the rock
      sx = x + 6;
      run(W + 12);
      close();
      open(x, top);
    } else {
      close();
      sx = x + 6;
      open(x, G);
      run(W + 12);
    }
    P.push({
      id: pid++, x: sx, y: G, width: W, height: 18, type: 'moving', art: 'lift',
      // (a brisk basket, and not long at the bottom: at 95 px/s with 1.6 s waits the ride was the longest stretch with nothing to do in 2-7)
      lift: { top, bottom: G, speed: 130, wait: 1.0, phase: R.r(0, 3), postRight: up },
    });
    // flowers up the shaft: the ride collects them (the lower two: a jump from the path reaches them too)
    for (let i = 1; i <= 2; i++) flower(sx + W / 2, G - ((G - top) * i) / 4 - 40, 'hibiscus');
    run(R.r(90, 110));
    expert += (x - x0l) / RUN + (G - top) / 130 + 1.8;
    pieces.push({ k: up ? 'liftUp' : 'liftDown', x0: x0l, x1: x });
    return { sx, top };
  }

  /** a stretch of high ground with a snake on it, about its middle (clear of a flag at the far end) */
  function guardedHigh(len: number) {
    rest(len);
    snake(x - len * 0.5, bankY);
  }

  /** the mailman on his round: walks back and forth along a stretch of path ahead */
  const mailman = (a: number, b: number, y = G) => decor.push({ cel: 'po.carry_stand', celWalk: 'po.walk_parcel', x: a, b: y + 2, k: 0.42, walk: [a, b, 9] });

  /** a house door in the bank with its sign: PLEASE BE PATIENT (the village's motto) */
  const patientDoor = (dx: number, y = G) => {
    piece('door', dx, y + 6, 170);
    piece('sign', dx - 150, y + 4, 112, { text: ['PLEASE BE', 'PATIENT'] });
  };

  /** the village at the end of a stage (2-1, 2-7): the jetty, the sign, the mailbox, doors in the bank, washing, a chimney and Gruntlewick */
  function villageEnd() {
    const v0 = x;
    // the jetty reaches out over the last river, when the village's bank is where one ends
    if (rivers.some((r) => Math.abs(r.x1 - bankFrom) < 2)) piece('jetty', bankFrom - 50, SURFACE + 26, 210, { flip: true });
    run(90);
    piece('sign', x, G + 4, 132, { text: ['PLEASE BE', 'PATIENT'] });
    run(90);
    piece('mailbox', x, G + 2, 54);
    run(90);
    mailman(x, x + 300);
    piece('door', x + 60, G + 6, 210);
    piece('window', x + 230, G - 30, 82);
    run(200);
    piece('laundry', x, G + 4, 200);
    run(150);
    piece('door', x, G + 6, 190, { flip: true });
    piece('chimney', x + 120, G - 72, 60);
    decor.push({ cel: 'tc.scroll', x: x + 220, b: G + 2, k: 0.42, flip: true });
    // (the shrine a little sooner: with the creek's last hop the walk in came to four seconds and more, 2026-10-28)
    run(230);
    expert += (x - v0) / RUN;
  }

  // ----- 2-8 Reed Cages: still water that rises -----

  /**
   * a basin of still water with low reed islands in it, reed cages hung over the water off some of them (each island with a cage has its
   * pile of stones and the cage's counter-basket: cageRoom). Once he steps in the water starts to rise, and covers the islands after about
   * `seconds` (it stops just under the banks). `safe`: falling in puts him back on the bank, and the water goes down for the next try (the
   * teaching basins). `across`: each cage's stones are on the island before its own, across the water (thrown over, the twist).
   */
  function floodBasin(islands: number, cageAt: number[], seconds: number, opts: { safe?: boolean; across?: boolean; need?: number; tips?: RoomTips } = {}) {
    const x0b = x;
    run(R.r(145, 160));
    close();
    const bx0 = x;
    let ix = x;
    let prev: Platform | null = null;
    for (let i = 0; i < islands; i++) {
      ix += Math.round(one * R.r(0.36, 0.46));
      const lifted = cageAt.includes(i) && (!opts.across || !!prev);
      const w = Math.round(lifted ? R.r(250, 280) : R.r(150, 200));
      const isl: Platform = { id: pid++, x: ix, y: ISLAND_TOP, width: w, height: 110, type: 'solid', style: 'moss_stone' };
      P.push(isl);
      if (lifted) cageRoom({ need: opts.need ?? STONE, mode: 'bank', critter: R.pick(['capy', 'duck', 'otter'] as const), ground: isl, ...(opts.across ? { pileOn: prev! } : {}), tips: i === cageAt[0] ? opts.tips : undefined });
      else if (!opts.across || !cageAt.includes(i + 1)) row(ix + 40, ix + w - 40, ISLAND_TOP - 34, 2, 'lotus');
      reeds(ix + R.r(16, 36), ISLAND_TOP + 4, R.chance(0.5));
      ix += w;
      // (the cage hangs over the water past its island: a pool's width, a hop across)
      if (lifted) ix += POOL_W - Math.round(one * 0.4);
      prev = isl;
    }
    ix += Math.round(one * R.r(0.36, 0.44));
    // it rises from 22 px under the islands to 8 px over them (and stops 10 px under the banks)
    rivers.push({
      x0: bx0, x1: ix, surfaceY: SURFACE, dir: 1, speed: 0,
      flood: { y1: ISLAND_TOP - 10, seconds, trigger: bx0 + 30 },
      ...(opts.safe ? { safe: { backX: bx0 - 70, backY: G } } : {}),
    });
    reeds(bx0 - 20, G + 6);
    reeds(ix + 20, G + 6, true);
    open(ix, G);
    run(R.r(145, 160));
    expert += (x - x0b) / RUN + islands * 0.5;
    pieces.push({ k: opts.across ? 'floodAcross' : 'flood', x0: x0b, x1: x });
  }

  /** a reed cage with a little one in it, standing at (cx, floor) */
  function cage(cx: number, floor: number, critter: 'capy' | 'duck' | 'otter') {
    C.push({
      id: cid++,
      type: 'cage',
      x: cx,
      y: floor - 26,
      collected: false,
      bobPhase: 0,
      cageHp: 2,
      critter,
    });
  }


  // ----- the river's other ways across, and the puzzle rooms (puzzleKit.ts) -----

  /** stepping stones across a shallow creek: still water, a stone a hop from the next (a fall in costs a life unless `safe`) */
  function stones(n: number, opts: { safe?: boolean; flowers?: boolean; wide?: boolean } = {}) {
    const x0s = x;
    run(R.r(145, 160));
    close();
    const sx0 = x;
    let sx = sx0;
    for (let i = 0; i < n; i++) {
      sx += Math.round(one * R.r(0.36, 0.46));
      // (`wide`: flat-topped stones, room to land a hop that runs on a little: a first-timer overshot the narrow ones into the creek)
      // (2026-10-29: wider still, 124-144 px; QA's falls in 2-2 came down on a stone's far end and ran on off it)
      const w = Math.round(opts.wide ? R.r(124, 144) : R.r(76, 92));
      P.push({ id: pid++, x: sx, y: ISLAND_TOP, width: w, height: 110, type: 'solid', style: 'moss_stone' });
      if (opts.flowers) flower(sx + w / 2, ISLAND_TOP - 60, 'lotus');
      sx += w;
    }
    // (the last hop is up onto the bank, 20 px higher than the stones: a short one, QA 2026-10-29, as the lily ponds')
    sx += Math.round(one * R.r(0.28, 0.34));
    rivers.push({ x0: sx0, x1: sx, surfaceY: SURFACE, dir: 1, speed: 0, ...(opts.safe ? { safe: { backX: sx0 - 70, backY: G } } : {}) });
    reeds(sx0 - 20, G + 6);
    reeds(sx + 20, G + 6, true);
    open(landStep(sx));
    run(R.r(145, 160));
    expert += (x - x0s) / RUN + n * 0.35;
    pieces.push({ k: 'stones', x0: x0s, x1: x });
  }

  /** off the end of high ground, down to the bank's level (a drop, as off a mooring post's high bank) */
  function dropDown() {
    const x0 = x;
    run(R.r(60, 80));
    close();
    open(x, G);
    run(R.r(90, 110));
    expert += (x - x0) / RUN + 0.4;
    pieces.push({ k: 'drop', x0, x1: x });
  }

  /**
   * a creek of reed islands: little islands a hop apart, each channel between them its own water (a hop, a few steps on the island, a
   * hop): crossed hop by hop, where stepping stones are one long run of hops. A fall in costs a life unless `safe` (back on the island)
   */
  function channels(n: number, opts: { safe?: boolean; flowers?: boolean } = {}) {
    const x0c = x;
    run(R.r(145, 160));
    close();
    let cx = x;
    for (let i = 0; i <= n; i++) {
      const g = Math.round(one * R.r(0.34, 0.42));
      rivers.push({ x0: cx, x1: cx + g, surfaceY: SURFACE, dir: 1, speed: 0, ...(opts.safe ? { safe: { backX: cx - 50, backY: i ? ISLAND_TOP : G } } : {}) });
      // (the flowers over each channel, where the hop goes)
      if (opts.flowers) flower(cx + g / 2, ISLAND_TOP - 80, 'hibiscus');
      cx += g;
      if (i === n) break;
      const w = Math.round(R.r(150, 190));
      P.push({ id: pid++, x: cx, y: ISLAND_TOP, width: w, height: 110, type: 'solid', style: 'moss_stone' });
      if (opts.flowers) flower(cx + w / 2, ISLAND_TOP - 40, 'lotus');
      reeds(cx + R.r(16, 36), ISLAND_TOP + 4, R.chance(0.5));
      cx += w;
    }
    open(cx);
    run(R.r(110, 130));
    // (each channel is its own water: a moment to read it before the hop)
    expert += (x - x0c) / RUN + (n + 1) * 1.3;
    pieces.push({ k: 'channels', x0: x0c, x1: x });
  }

  /**
   * a mooring post at the foot of a high bank, too high to jump: up the post's rope to its shelf, a hop onto the bank, and a drop
   * off its far side (the reeds' village way up out of the water)
   */
  function postUp() {
    const x0p = x;
    run(R.r(150, 180));
    const px = x;
    const topY = G - 236;
    post(px, topY);
    // flowers up the rope: the climb gathers them
    flower(px, G - 90, 'orchid');
    flower(px, G - 170, 'orchid');
    // (the shelf runs from px - 40 to px + 160; the high bank starts a hop past its end)
    run(160 + Math.round(R.r(46, 60)));
    // (LV-11, polish report 2026-10-29: a 72 px step at the foot of the bank, so the floor before it is never a dip with no way out:
    // the scripted player fell back 6-7 times at this 200 px wall. From the step the bank is a double jump; the post is still the
    // easy way up)
    P.push({ id: pid++, x: x - 96, y: G - 72, width: 96, height: 72 + BANK_H, type: 'solid', style: 'log' });
    close();
    open(x, G - 200);
    // (too high to jump: the only way up is the post. A short stretch on top: at 340-370 px the walk from the post's top to the drop
    // and on to the next crossing was over 4 s with nothing to do, 2026-10-28)
    // (with a low step up along the top, 20 px, walked over: the climb and the walk on top had nothing else to do in them; and flowers
    // up there, the climb's reward)
    run(R.r(110, 130));
    close();
    open(x, G - 220);
    run(R.r(110, 130));
    row(x - 200, x - 40, G - 254, 3, 'orchid');
    // and a drop off its far end, back down to the water's level
    close();
    open(x, G);
    run(R.r(100, 120));
    expert += (x - x0p) / RUN + 236 / 220 + 1.5;
    pieces.push({ k: 'postUp', x0: x0p, x1: x });
  }

  /**
   * a river with a sandbar in its middle: two short rivers, two logs each, and a hop across the sand between (the second may flow the
   * other way). Shorter rides, more hops: the logs, then the sand, then the logs again.
   */
  function sandbar(dirA: 1 | -1, dirB: 1 | -1, speed: number, logW: number, opts: { safe?: boolean; flowers?: number; tag?: string } = {}) {
    const a = river(dirA, speed, 2, logW, { ...opts, tail: Math.round(R.r(120, 160)) });
    const b = river(dirB, speed + Math.round(R.r(-3, 3)), 2, logW, { ...opts, lead: 0 });
    return { a, b };
  }

  const rooms: RoomSpec[] = [];
  /** a spot on a platform at world x, as a room's anchor */
  const at = (p: Platform, wx: number, dy = 0): Anchor => ({ on: p.id, at: (wx - p.x) / p.width, ...(dy ? { dy } : {}) });

  /**
   * A reed cage hung on a rope over a pulley (Matt's sheet; 2-3 and 2-8): the cage over a pool a hop across, its counter-basket hanging
   * on the bank before it, a pile of river stones behind. Stones in the basket lift the cage out of the water; all the way up, its floor
   * drops open and the little one is free. No punch breaks it (engine.ts).
   *   need   the weight that lifts it all the way (a stone weighs 2): with 4, the first stone lifts it halfway, so the room shows itself
   *   mode   'bank': the pile on the basket's bank; 'across': the pile on a reed island across a channel (his hands full, he cannot jump:
   *          the stones are thrown over); 'high': the basket hangs high up the post (flick up to throw the stones in)
   *   ground build it on this reed island in a rising basin instead (2-8): the island ends where the cage hangs, over the basin's water;
   *          `pileOn`: the stones are on the island before it, across the water (thrown over)
   */
  function cageRoom(o: { need: number; mode: 'bank' | 'across' | 'high'; critter: Critter; safe?: boolean; tips?: RoomTips; ground?: Platform; pileOn?: Platform }) {
    const ri = rooms.length;
    const x0 = x;
    let first: Platform;
    let pileP: Platform;
    let A: Platform;
    let pileX: number;
    let basketX: number;
    const postX = (o.pileOn ?? o.ground ?? { x }).x + 26;
    if (o.ground) {
      // on an island: the pile at its near end (or on the island before it, across the water: thrown over), the basket at its far end,
      // the cage over the water past it
      A = o.ground;
      first = pileP = o.pileOn ?? A;
      pileX = pileP.x + (o.pileOn ? 56 : 70);
      basketX = A.x + A.width - 46;
    } else if (o.mode === 'across') {
      // the stones lie on a reed island a hop off this bank; the basket's bank is a hop on, across a channel
      run(R.r(110, 140));
      first = close()!;
      const g1 = Math.round(R.r(84, 100));
      const iw = Math.round(R.r(280, 300));
      const ch = Math.round(R.r(110, 125));
      const ix = x + g1;
      rivers.push({ x0: x, x1: ix, surfaceY: SURFACE, dir: 1, speed: 0, ...(o.safe ? { safe: { backX: x - 60, backY: G } } : {}) });
      pileP = bank(ix, ix + iw);
      pileX = ix + 64;
      rivers.push({ x0: ix + iw, x1: ix + iw + ch, surfaceY: SURFACE, dir: 1, speed: 0, ...(o.safe ? { safe: { backX: ix + iw - 50, backY: G } } : {}) });
      reeds(ix + iw - 30, G + 4, true);
      open(ix + iw + ch);
      run(R.r(150, 170));
      basketX = x;
      run(64);
      A = close()!;
    } else {
      // (narrow: the signpost, the pile, the basket and the cage all in one upright phone's view)
      run(R.r(80, 100));
      pileX = x;
      run(R.r(100, 120));
      basketX = x;
      run(64);
      A = first = pileP = close()!;
    }
    const E = A.x + A.width;
    if (!o.ground) {
      rivers.push({ x0: E, x1: E + POOL_W, surfaceY: SURFACE, dir: 1, speed: 0, ...(o.safe ? { safe: { backX: E - 60, backY: G } } : {}) });
      reeds(E + POOL_W + 16, G + 6, true);
    }
    // the cage over the middle of the water: built where it ends up (lifted), the kit hangs it down at the rope's end as the stage starts
    const cageId = cid++;
    const cx = E + POOL_W / 2;
    const topFloor = A.y - CAGE_UP;
    C.push({ id: cageId, type: 'cage', x: cx, y: topFloor - 26, collected: false, bobPhase: 0, cageHp: 2, critter: o.critter });
    const low = SURFACE + 10;
    const stones2 = Math.ceil(o.need / STONE);
    const parts: RoomSpec['pieces'] = [
      { kind: 'reset', id: `post${ri}`, at: at(first, postX) },
      { kind: 'source', id: `pile${ri}`, variant: 'stone', at: at(pileP, pileX), look: 'pile' },
      ...Array.from({ length: stones2 }, (_, k) => ({ kind: 'item' as const, id: `stone${ri}${k}`, variant: 'stone' as const, source: `pile${ri}`, for: `basket${ri}`, ...(k ? { at: at(pileP, pileX + 40 * k) } : {}) })),
      { kind: 'basket', id: `basket${ri}`, at: at(A, basketX), mouth: o.mode === 'high' ? 236 : 92, need: o.need, drop: 34 },
      { kind: 'lift', id: `lift${ri}`, at: { on: A.id, at: 1, dx: POOL_W / 2, dy: low - A.y }, w: 56, rise: low - topFloor, by: `basket${ri}`, cage: cageId },
    ];
    rooms.push({
      id: `cage${ri}`, left: at(first, Math.max(first.x + 2, Math.min(x0, postX - 20))), right: { on: A.id, at: 1, dx: POOL_W + 60 },
      above: o.mode === 'high' ? 480 : 420, below: 170, pieces: parts, exit: `lift${ri}`, beyond: at(A, basketX - 20),
      ground: [...new Set([first.id, pileP.id, A.id])], tips: o.tips,
    });
    if (!o.ground) {
      open(E + POOL_W);
      run(R.r(190, 220));
    }
    expert += (x - x0) / RUN + stones2 * 3 + (o.mode === 'bank' ? 1 : 3);
    pieces.push({ k: `cage-${o.mode}`, x0, x1: x });
    return { cageId, A };
  }

  /**
   * The ferry (2-2): a river too wide to jump, with one raft on it, moored under the far bank while the sluice holds the river still.
   * Pull the lever and the current runs: the raft comes round from under this bank and carries him across (pull it again and the river
   * stands still, the raft wherever it is). `safe`: a splash puts him back on the bank.
   */
  function ferryRoom(o: { safe?: boolean; tips?: RoomTips; flowers?: number } = {}) {
    const ri = rooms.length;
    const x0 = x;
    run(R.r(70, 90));
    const postX = x;
    run(R.r(110, 130));
    const leverX = x;
    // (the lever a few steps back from the water: he sees the raft come round from there)
    run(R.r(240, 260));
    const A = close()!;
    const rx0 = x;
    const W = Math.round(R.r(500, 540));
    const w = 220;
    const speed = 80;
    const rx1 = rx0 + W;
    // (moored: it has just slid in under the far bank as the sluice stops the river, a moment after the stage starts)
    const offset = (W + w - 10) / speed - 0.25;
    const raft: Platform = { id: pid++, x: rx0, y: LOG_Y, width: w, height: LOG_HEIGHT, type: 'drift', style: 'log', drift: { x0: rx0, x1: rx1, dir: 1, speed, width: w, offset, baseY: LOG_Y } };
    raft.x = driftX(raft.drift!, 0);
    P.push(raft);
    const riverIdx = rivers.length;
    rivers.push({ x0: rx0, x1: rx1, surfaceY: SURFACE, dir: 1, speed, raft: true, ...(o.safe ? { safe: { backX: rx0 - 70, backY: G } } : {}) });
    if (o.flowers !== 0) arc(rx0 + 60, rx1 - 60, G - 66, o.flowers ?? 5, 'hibiscus', 40);
    reeds(rx1 + 24, G + 6, R.chance(0.5));
    open(rx1);
    run(R.r(150, 190));
    rooms.push({
      id: `ferry${ri}`, left: at(A, x0 + 2), right: { on: A.id, at: 1, dx: W + 60 }, above: 420, below: 160,
      pieces: [
        { kind: 'reset', id: `post${ri}`, at: at(A, postX) },
        { kind: 'lever', id: `lever${ri}`, at: at(A, leverX) },
        { kind: 'sluice', id: `sluice${ri}`, at: { on: A.id, at: 1, dx: -40 }, river: riverIdx, open: `lever${ri}`, opened: 'with', shut: 'still' },
      ],
      exit: `sluice${ri}`, beyond: at(A, leverX + 40), ground: [A.id], tips: o.tips,
    });
    expert += (x - x0) / RUN + (W + w) / speed / 2 + 2;
    pieces.push({ k: 'ferry', x0, x1: x });
  }

  /**
   * The court gate (2-9): a latched gate in the court's wall, the court bell beside it. Ring the bell (a tap by it) and the gate opens
   * and stays open, and every guard in earshot comes to look at the bell for a while (noise.ts): a guard stands past the gate to hear it.
   */
  function bellGate(tips: RoomTips) {
    const ri = rooms.length;
    const x0 = x;
    run(R.r(60, 70));
    const postX = x;
    run(R.r(120, 140));
    const bellX = x;
    run(R.r(150, 170));
    const gateX = x;
    run(R.r(110, 130));
    const A = close()!;
    open(x);
    rooms.push({
      id: `bell${ri}`, left: at(A, x0 + 2), right: at(A, A.x + A.width - 10), above: 420, below: 80,
      pieces: [
        { kind: 'reset', id: `post${ri}`, at: at(A, postX) },
        { kind: 'bell', id: `bell${ri}`, at: at(A, bellX) },
        { kind: 'gate', id: `gate${ri}`, at: at(A, gateX), open: `bell${ri}`, latch: true, look: 'reeds' },
      ],
      exit: `gate${ri}`, beyond: at(A, gateX + 110), ground: [A.id], tips,
    });
    piece('archway', gateX, G + 6, 230);
    expert += (x - x0) / RUN + 2;
    pieces.push({ k: 'bellGate', x0, x1: x });
    return { gateX, bellX };
  }

  /**
   * The court's gallery (2-9's twist): up the carved steps to a walk of porches over the court, the court bell at the top of the steps,
   * the guards on the court floor below. Ring the bell and they all go to stand under it, looking at it (noise.ts), their backs to the
   * far end of the gallery, where he hops down behind them. A pile of pebbles waits there: a pebble thrown back along the court turns
   * them again.
   */
  function bellGallery(guards: number) {
    const ri = rooms.length;
    const x0 = x;
    stairs(Math.round(R.r(130, 150)), true);
    const high = bankY;
    run(R.r(40, 60));
    const bellX = x;
    const gal = porchRun(4, false, Math.round(R.r(220, 260)));
    const path = gal.path!;
    // the guards keep to the court floor under the porches, within earshot of the bell and clear of where he hops down at its far end
    const span = Math.min(440, gal.px - gal.xs - 380);
    for (let i = 0; i < guards; i++) guard(gal.xs + 110 + (span * i) / Math.max(1, guards - 1), G, 110);
    const pileX = gal.px - 70;
    const highBank = P.find((p) => p.type === 'solid' && Math.abs(p.y - high) < 1 && p.x <= bellX && p.x + p.width >= bellX)!;
    rooms.push({
      id: `gallery${ri}`, left: at(highBank, Math.max(highBank.x + 4, bellX - 140)), right: at(path, gal.px - 4), above: 300, below: G - high + 80,
      pieces: [
        { kind: 'bell', id: `bell${ri}`, at: at(highBank, bellX) },
        { kind: 'source', id: `pile${ri}`, variant: 'pebble', at: at(path, pileX), look: 'pile' },
        { kind: 'item', id: `pebble${ri}`, variant: 'pebble', source: `pile${ri}` },
      ],
      exit: `bell${ri}`, beyond: at(path, gal.px - 20), ground: [path.id],
      tips: { enter: 'Ring the bell. The guards will come and look!', hold: 'Throw it back along the court. Clack!' },
    });
    expert += guards * 2.4 + 2;
    pieces.push({ k: 'gallery', x0, x1: x });
  }

  // ----- the stage: its sections in the versions the roll picks (w2Sections.ts) -----
  const picks = w2Picks(plan, seed);
  const sec: W2Kit = {
    R, config, V, C,
    get x() { return x; },
    get bankY() { return bankY; },
    get expert() { return expert; },
    addExpert: (s) => { expert += s; },
    run, open, beat, flag, hint, rest, breath, snakeBank, guardedRest, river, stones, lilyPond, swingRiver, stairs, porchRun, lift, guardedHigh,
    mailman, patientDoor, villageEnd, floodBasin, cageRoom, ferryRoom, bellGate, bellGallery, sandbar, island, postUp, dropDown, channels, startWalk, heart, goldenSeed,
    piece: (n, px, b, w, extra) => piece(n as W2Decor['n'], px, b, w, extra as Partial<W2Decor>),
    row, arc, flower, turtle, guard, snake,
    mark: (k, x0) => pieces.push({ k, x0, x1: x }),
    nextCid: () => cid++,
    enemies: () => E.length,
    noteId: () => {
      const note = findForStage(config.worldIndex, config.miniIndex);
      return note && note.kind === 'note' ? note.id : null;
    },
    LOG_Y, ISLAND_TOP, START_WALK, EXPERT_SECONDS, G, STONE,
  };
  look = picks.look;
  buildW2Sections(plan, sec, picks);

  // (no animal within 200 px of the shrine, a safe spot too: walk the last bank on past one, levelCheck SAFE_APPROACH)
  for (const e of E) {
    const d = x - 220 - e.patrolMaxX;
    if (d > -400 && d < SAFE_APPROACH + 20) run(SAFE_APPROACH + 20 - d);
  }
  const exitX = x - 220;
  close();
  // nothing lies past the shrine, where he cannot go (rules.ts PAST_SHRINE)
  for (let i = C.length - 1; i >= 0; i--) if (C[i].x > exitX + PAST_SHRINE) C.splice(i, 1);
  C.push({
    id: cid++,
    type: 'exit_totem',
    x: exitX,
    y: bankY - 30,
    collected: false,
    bobPhase: 0,
  });

  const width = Math.ceil(x + 20);
  const targetCount = plan === '2-2' ? FLOWER_GOAL_22 : plan === '2-3' ? CAGES_23 : plan === '2-5' ? SNAPPER_GOAL_25 : plan === '2-8' ? CAGES_28 : plan === '2-9' ? COURT_GOAL_29 : config.targetCount;
  const cfg: LevelConfig = {
    ...config,
    levelWidth: width,
    levelHeight: Math.max(config.levelHeight, 900),
    targetCount,
  };
  // the puzzle rooms' own platforms (a gate's door and wall, a cage's rope end), placed from the banks they stand on
  const kit = rooms.length ? { rooms } : undefined;
  if (kit) addKitPlatforms(P, kit);
  const movedPickups = fixPickups({ platforms: P, vines: V, ropes: [], waterY: WATER }, C);
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
    spawnY: P[0].y,
    exitTotemX: exitX,
    exitTotemY: bankY,
    checkpoints: checkpoints.sort((a, b) => a.x - b.x),
    waterY: WATER,
    rivers,
    ...(kit ? { kit } : {}),
    meta: {
      attempt: seed,
      chunks: pieces.map((p) => p.k),
      width,
      pieces,
      timing: { layoutSeconds: expert, decorSeconds: 0, route: width },
    },
    proto: {
      hints: hints.sort((a, b) => a.x - b.x),
      covers: [],
      beats,
      movedPickups,
      decor,
    },
  };
}
