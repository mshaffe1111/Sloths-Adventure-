/**
 * 4-3 Waterfall Steps (World 4, an ascent): wet steps climbing terrace by terrace beside the great waterfall, with three falls to get
 * past, each its own idea (waterfalls.ts), and a monkey that steals a petal (capuchin.ts).
 *
 *   1. LEARN    the plug. A fall pours over the steps and pushes him back down. Up the tree beside it, along the shelf at the top, and
 *               roll the boulder into the stream's slot: the fall dries to a trickle and the steps can be climbed.
 *   2. DEVELOP  the thief. A capuchin sits by a petal on the terraces above. It grabs it and runs up the steps, stopping at each post to
 *               tease him: catch it there (or punch it) and it drops the petal. Lose it and it keeps the petal at its den, further on.
 *               Then a second plug, its shelf reached up a zigzag of little ledges instead of a tree.
 *   3. TWIST    the order. This fall fills a pool, and a log floats on it: the log is the way up to the boulder's shelf, and stopping the
 *               fall drains the pool and sinks the log. So ride the log up first, then plug. Nothing can go wrong for good: the boulder
 *               is only reached from the log, and once the fall is stopped its steps lead up from the floor, so a slip costs a climb.
 *   4. TWIST    the surge. A great fall that pours and eases on its own rhythm, over a long stair with a cave halfway up behind the
 *               water: climb in the quiet spell (it warns as it eases), wait in the cave for the next one, climb on. World 4's keepsake,
 *               half a pink ribbon, hides in a fern at the back of the cave.
 *   5. DEVELOP  the thief behind the falls. A second capuchin grabs a petal and runs up a surge's stair, teasing from the cave behind
 *               the water: follow it up in the quiet spells.
 *   6. TWIST    the tide pool (the pool and the surge together). A fall on its own rhythm fills a pool: its log rises while the fall
 *               pours and sinks in the quiet, and the log at its highest is the only way up to the ledge beside it. Up the tree there to
 *               a shelf over the pool, where the same fall pours across the gap to the cliff top: cross it in the quiet.
 *   7. TWIST    the boulder up the surge (the plug and the surge together). The boulder's shelf is reached up a stair under a surge;
 *               a tree from the floor under the shelf climbs back to it after a slip.
 *   8. FINISH   two surges side by side, half a beat apart (climb one, wait on the dry ledge between, climb the other), and the last
 *               terraces to the shrine. From the pool on, a rock now and then comes loose over a long terrace (taught in 4-1).
 *
 * The cliff is built as solid terraces down to the floor, so nothing here can drop him anywhere he cannot climb back from, and a fall
 * from a shelf only lands on the terrace below. Built from y = 0 upward (up is negative) and shifted down at the end, like the kapok.
 */
import { fixPickups } from './flowerReach.ts';
import { FIND_BY_ID } from './finds.ts';
import { heartsAtFlags, stageSeconds, stream, type ProtoExtras, type StageHint } from './protoStage.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import type { Capuchin } from './capuchin.ts';
import { ROCK, rockFits, type RockDrop } from './rockfall.ts';
import type { Pool, Waterfall } from './waterfalls.ts';
import type { W4Decor } from './w4Play.ts';
import type { Collectible, LevelConfig, Platform, TreeStructure, Vine } from './types.ts';

/** the wet stair under a fall: how high and how deep each step is, and how much floor the water covers in front of it */
export const WET = { rise: 130, tread: 130, margin: 110 } as const;
/** the pushable boulder */
export const BOULDER = { w: 96, h: 88 } as const;
/**
 * a pool's log: how far over the terrace it floats with the pool full and lies once it drains, how far under the ledge it floats at its
 * highest (a double jump straight up), and how far the ledge reaches out over the log's near end (so that jump is straight up, and plain)
 */
export const POOL = { full: 150, empty: 30, ledge: 140, over: 70 } as const;
/** seconds a rock's shadow and grit show before it falls (4-1's are 1.4: here they come back on long terraces, warned well ahead) */
export const ROCK_WARN = 2.0;
/** Dot on the rocks: the stage's hint at the first rock, and said again by w4Play when a rock first warns near him, if it was missed */
export const ROCK_TIP = 'Rocks coming loose again! Stop before the shadow, and go once it has fallen';
/**
 * A surge's water is a wall while it pours (waterfalls.ts fallWall): caught on its stair when it comes back, he is washed down to its
 * foot. So its quiet spell is long enough for a player to climb from the foot of the water to the next dry spot (the cave behind it,
 * or out of the water at the top): a moment to start and the walk in, and a double jump for each wet step (s).
 */
export const SURGE_CLIMB = { start: 1.0, perJump: 0.9 } as const;
export const quietFor = (jumps: number, rolled: number): number => Math.round(Math.max(rolled, SURGE_CLIMB.start + SURGE_CLIMB.perJump * jumps) * 10) / 10;

/** what the tests read back about the falls: which platforms each one pours over, and the beat it belongs to */
export interface FallInfo {
  fallId: number;
  kind: 'plug' | 'pool' | 'surge' | 'tide';
  /** the steps (and the cave ledge) under the water: climbable only while it is dry or quiet */
  steps: number[];
  /** plug and pool falls: the shelf the boulder sits on, and the platform the pool's log is (a tide's log too) */
  shelf?: number;
  log?: number;
}

export function buildWaterfallSteps(
  config: LevelConfig,
  seed: number,
): GeneratedStage & { proto: ProtoExtras; falls43: FallInfo[]; tides43: Array<{ fallId: number; log: number; ledge: number; lip: number; top: number }> } {
  const R = stream(seed);
  const P: Platform[] = [];
  const V: Vine[] = [];
  const T: TreeStructure[] = [];
  const C: Collectible[] = [];
  const checkpoints: Array<{ x: number; y: number; reached: boolean }> = [];
  const hints: StageHint[] = [];
  const beats: Array<[number, number, string]> = [];
  const falls: Waterfall[] = [];
  const pools: Array<Pool & { art?: { cx: number; b: number; w: number } }> = [];
  const monkeys: Array<Capuchin & { petalId?: number }> = [];
  const decor: W4Decor[] = [];
  const rocks: RockDrop[] = [];
  const info: FallInfo[] = [];
  let pid = 1, vid = 1, tid = 1, cid = 1, fid = 1;
  /** how long a quick, sure player takes (s): running 285 px/s, climbing 220, pushing 120, about 0.6 s a step */
  let expert = 0;
  const RUN = 285, CLIMB = 220, PUSH = 120;
  /** the floor of the cliff: every terrace is solid down to here */
  const BASE = 90;
  const r = Math.round;

  // ----- the kit -----
  /** a terrace (or a step): solid rock from its top all the way down */
  const terraceBlock = (x0: number, x1: number, y: number) => {
    const p: Platform = { id: pid++, x: r(x0), y: r(y), width: r(x1) - r(x0), height: BASE - r(y), type: 'solid', style: 'log' };
    P.push(p);
    return p;
  };
  /** a rock shelf jutting from the cliff (World 4's kit paints it) */
  const shelf = (x0: number, x1: number, y: number) => {
    const p: Platform = { id: pid++, x: r(x0), y: r(y), width: r(x1) - r(x0), height: 24, type: 'solid', style: 'branch' };
    P.push(p);
    return p;
  };
  const trunk = (x: number, groundY: number, perchY: number) => {
    const tree: TreeStructure = { id: tid++, x: r(x), groundY: r(groundY), topY: r(perchY) - 150, trunkWidth: 76, hasClimbVine: true, canopyRadius: 140 };
    T.push(tree);
    V.push({ id: vid++, x: r(x), topY: r(perchY) - 2, bottomY: r(groundY) - 6, swaySpeed: 0.9, swayPhase: (x * 0.007) % 6.28, vineType: 'tree_climb', treeId: tree.id });
  };
  const flower = (x: number, y: number, v: Collectible['botanicalVariant'] = 'orchid') => {
    const c: Collectible = { id: cid++, type: 'flower', botanicalVariant: v, x: r(x), y: r(y), collected: false, bobPhase: (x * 0.031) % 6.28 };
    C.push(c);
    return c;
  };
  const row = (x0: number, x1: number, y: number, n: number, v: Collectible['botanicalVariant'] = 'orchid') => {
    for (let i = 0; i < n; i++) flower(x0 + ((x1 - x0) * i) / Math.max(1, n - 1), y, v);
  };
  /** a line shown the first time he passes x (and, with `above`, only once he is that high) */
  const hint = (x: number, text: string, pad = text, keys = text, above?: number, before?: number) =>
    hints.push({ x: r(x), text, pad, keys, ...(above !== undefined ? { aboveY: r(above) } : {}), ...(before !== undefined ? { beforeX: r(before) } : {}) });

  // ----- the cursor: `x` is the open end of the terrace he is on, at height `y`; it started at `from` -----
  let x = 0, y = 0, from = 0;
  const run = (len: number) => { x += len; };
  /** close the terrace here */
  const end = () => {
    if (x - from > 1) terraceBlock(from, x, y);
    from = x;
  };
  /** one step up: the terrace so far ends, and a new one starts `rise` higher, `tread` deep (running on extends it) */
  const up = (rise: number, tread: number) => {
    end();
    y -= Math.round(rise);
    x += Math.round(tread);
  };
  const flag = (back = 80) => checkpoints.push({ x: r(x - back), y: r(y), reached: false });
  const beat = (name: string, f: () => void) => {
    const x0 = x;
    f();
    beats.push([r(x0), r(x), name]);
  };

  /** a few dry steps up the terraces, a flower on each */
  function stairs(n: number, rise: number, tread: number) {
    for (let i = 0; i < n; i++) {
      up(rise, tread);
      flower(x - tread / 2, y - 34, i % 2 ? 'orchid' : 'hibiscus');
    }
    expert += n * (0.5 + tread / RUN);
  }
  /** a stretch of terrace with a few flowers */
  function rest(len: number) {
    const x0 = x;
    run(len);
    if (len > 260) row(x0 + 80, x - 80, y - 34, Math.max(2, Math.round(len / 170)), R.pick(['orchid', 'hibiscus'] as const));
    expert += len / RUN;
  }
  /** a cliff too tall to jump, and a tree at its foot to climb it */
  function treeUp(h: number) {
    const x0 = x;
    run(R.r(200, 240));
    const tX = x - 50;
    const y0 = y;
    end();
    y -= Math.round(h);
    trunk(tX, y0, y);
    for (let i = 0; i < 3; i++) flower(tX, y0 - 80 - ((h - 140) * i) / 2, 'hibiscus');
    run(R.r(180, 220));
    expert += (x - x0) / RUN + h / CLIMB + 1;
  }
  /** a long terrace where a rock comes loose from the cliff above (taught in 4-1): stop short of the shadow, go once it has fallen */
  let rocksSaid = false;
  function rockRest(len: number) {
    const x0 = x;
    rest(len);
    const rx = r(x0 + len * R.r(0.45, 0.6));
    const rock: RockDrop = { x: rx, top: y - 460, land: y, every: Math.round(R.r(4.6, 5.6) * 10) / 10, warn: ROCK_WARN, offset: Math.round(R.r(0, 5) * 10) / 10 };
    if (!rockFits(rock)) return;
    // (no flower where the rock lands: he should not be tempted to stand there)
    for (let i = C.length - 1; i >= 0; i--) if (C[i].type === 'flower' && Math.abs(C[i].x - rx) < ROCK.radius + 50 && Math.abs(C[i].y - (y - 34)) < 4) C.splice(i, 1);
    if (!rocksSaid) hint(x0 + 20, ROCK_TIP);
    rocksSaid = true;
    rocks.push(rock);
    expert += 1.6;
  }
  /** a terrace and a dry stair, or a tree up a tall cliff, at random (with `rock`, the terrace may have a falling rock) */
  function terrace(rock = false) {
    if (R.chance(0.5)) {
      if (rock && R.chance(0.6)) rockRest(R.r(400, 460));
      else rest(R.r(180, 240));
      stairs(R.i(2, 3), R.r(88, 100), R.r(190, 240));
    } else {
      treeUp(R.r(300, 360));
    }
  }

  /**
   * between two pieces (2026-10-28, the stage inspector: the old 200-300 px of flat terrace after each piece and the long walks in were
   * three to six quiet seconds): one dry step up, and a breath on the terrace above it
   */
  function breath() {
    // (a little terrace first: a piece may end where the next one starts, at the top of a wet stair)
    rest(R.r(110, 140));
    stairs(1, R.r(84, 96), R.r(200, 230));
    rest(R.r(150, 190));
  }
  /**
   * a fall over a wet stair, stopped with a boulder. The water pours from the end of a shelf above the stair, where the stream runs
   * along a channel; roll the boulder along the channel into the slot at its end and the fall dries up.
   *   tree: the shelf is reached up a tree beside the fall (the lesson);
   *   hops: up a zigzag of little rock ledges beside the fall instead;
   *   pool: the fall fills a pool with a log floating on it, the log lifts him to a ledge, and a tree there reaches the shelf (the order:
   *         stopping the fall sinks the log, so it has to be ridden first; the boulder is only reached from it, so it always is).
   *   surge: up a short stair under a fall that comes and goes on its own (climb it in a quiet spell) to the shelf; a tree from the
   *         floor under the shelf climbs back to it, so a slip off the shelf only costs a climb.
   * The shelf is too far from the terrace above the steps for any jump, so the steps are the only way on, and they are under the water.
   */
  function plugFall(kind: 'tree' | 'hops' | 'pool' | 'surge') {
    const x0 = x, y0 = y;
    const n = 3;
    const topY = y0 - (n + 1) * WET.rise;
    const shelfY = r(topY - R.r(60, 100));
    let c0: number;
    let treeX: number;
    let logId: number | undefined;
    if (kind === 'tree') {
      run(R.r(240, 280));
      treeX = r(x + 40);
      c0 = r(treeX + R.r(400, 440));
      trunk(treeX, y0, shelfY);
      for (let i = 0; i < 4; i++) flower(treeX, y0 - 80 - ((y0 - shelfY - 160) * i) / 3, 'hibiscus');
      hint(x0 + 40, 'The water pushes you back down! Climb the tree, and stop it at the top', 'The water pushes you back down! Climb the tree, and stop it at the top', 'The water pushes you back down! Climb the tree, and stop it at the top');
      expert += (treeX - x0) / RUN + (y0 - shelfY) / CLIMB + 0.8;
    } else if (kind === 'hops') {
      run(R.r(230, 270));
      const hx = r(x);
      // five rock ledges beside the fall, back and forth, each a plain jump above the last; the shelf is one more jump up
      const k = 5;
      const rise = (y0 - shelfY) / (k + 1);
      for (let i = 1; i <= k; i++) {
        const lx = hx + (i % 2 ? 0 : 200);
        shelf(lx, lx + 170, y0 - rise * i);
        if (i < k) flower(lx + 85, y0 - rise * i - 34, i % 2 ? 'orchid' : 'hibiscus'); // (none under the shelf)
      }
      treeX = hx + 40;
      c0 = r(hx + 370 + R.r(240, 280));
      hint(x0 + 40, 'Another fall over the steps. Hop up the ledges beside it, and stop this one too');
      expert += (hx - x0) / RUN + k * 0.9 + 0.6;
    } else if (kind === 'surge') {
      run(R.r(230, 270));
      const s0 = r(x);
      run(WET.margin);
      for (let i = 0; i < n + 1; i++) {
        up(WET.rise, WET.tread);
        flower(x - WET.tread / 2, y - 34, 'orchid');
      }
      end();
      const s1 = r(x);
      const sSteps = P.filter((p) => p.x >= s0 + WET.margin - 1 && p.x < s1 - 1 && p.y < y0).map((p) => p.id);
      // a last little step out of the water, onto the rock the shelf juts from
      up(y - shelfY, 0);
      run(140);
      end();
      const surge = { pour: Math.round(R.r(3.4, 3.8) * 10) / 10, ease: 1.5, quiet: quietFor(n + 2, Math.round(R.r(3.4, 3.8) * 10) / 10), offset: Math.round(R.r(0, 8) * 10) / 10 };
      falls.push({ id: fid, x: s0, width: s1 - s0, top: r(shelfY - 160), bottom: y0, surge });
      info.push({ fallId: fid, kind: 'surge', steps: sSteps });
      fid++;
      // down to the floor under the shelf, with the tree back up
      y = y0;
      from = x;
      treeX = r(x + 40);
      c0 = r(treeX + R.r(400, 440));
      trunk(treeX, y0, shelfY);
      hint(x0 + 40, 'This one comes and goes as well. Climb up beside it in a quiet spell, to the boulder above the next fall');
      expert += (s0 - x0) / RUN + (surge.pour + surge.ease + surge.quiet) / 2 + (n + 1) * 0.6 + 0.6 + 140 / RUN + 1.5;
    } else {
      run(R.r(220, 260));
      // the ledge the log reaches, the pool and its log, then the floor the water covers in front of the steps
      const n0 = x;
      const nw = R.r(300, 340);
      const bx = r(n0 + nw + 20);
      const bw = 300;
      // the log floats a double jump up off the terrace while the pool is full, and lies in the bottom of the basin once it drains
      const fullY = y0 - POOL.full;
      const emptyY = y0 - POOL.empty;
      const ledgeY = r(fullY - POOL.ledge);
      // the ledge reaches out over the log's near end, so from the log at its highest the way up is a double jump straight up
      const ledge = shelf(n0, bx + 55 + POOL.over, ledgeY);
      row(ledge.x + 60, n0 + nw - 120, ledgeY - 34, 2, 'orchid');
      // the basin stands on the terrace (painted behind him), and the log floats on its water (drawn by w4Play; it rides up and down
      // with the pool)
      const log: Platform = { id: pid++, x: bx + 55, y: fullY, width: 170, height: 30, type: 'solid', style: 'log', art: 'poolLog' };
      P.push(log);
      logId = log.id;
      // a petal on the log, and one on the ledge right over its near end: where to jump to, straight up from there
      flower(log.x + log.width / 2 + 30, fullY - 40, 'hibiscus');
      flower(log.x + POOL.over / 2, ledgeY - 34, 'hibiscus');
      // (the fall pours into the far end of the basin, clear of the log)
      x = bx + bw - 50;
      c0 = r(x);
      treeX = r(n0 + 70);
      trunk(treeX, ledgeY, shelfY);
      flower(treeX, ledgeY - 110, 'hibiscus');
      flower(treeX, ledgeY - 220, 'hibiscus');
      pools.push({ fedBy: fid, platformId: log.id, fullY, emptyY, art: { cx: log.x + log.width / 2, b: y0 + 6, w: bw } });
      hint(x0 + 40, 'This fall fills the pool, and the log floats on it. Ride the log up before you stop the water!');
      hint(bx - 40, 'Stand on the near end of the log, under the ledge, and double jump straight up');
      expert += (bx - x0) / RUN + 1.4 + 1.2 + (ledgeY - shelfY) / CLIMB + 0.8;
    }
    // the shelf, its channel and the boulder
    const top = shelf(treeX - 40, c0, shelfY);
    const bX = r(c0 - BOULDER.w - R.r(190, 240));
    const boulder: Platform = {
      id: pid++, x: bX, y: shelfY - BOULDER.h, width: BOULDER.w, height: BOULDER.h, type: 'solid', style: 'moss_stone', art: 'boulder',
      push: { min: treeX + 60, max: c0 },
    };
    P.push(boulder);
    // the stone channel the stream runs in, pouring off the end of the shelf (it runs dry once the boulder is in)
    decor.push({ n: 'channelFall', x: c0 - 50, b: shelfY + 96, w: 190, wet: fid });
    // (the boulder is pushed by walking into it from beside it on its shelf, physics.ts blockBeside: Dot says exactly that)
    if (kind === 'tree') hint(treeX - 120, 'A boulder! Walk right into it and keep going: you push it along the shelf into the stream', 'A boulder! Walk right into it and keep holding right: you push it along the shelf into the stream', 'A boulder! Walk right into it and keep holding right: you push it along the shelf into the stream', shelfY + 10, c0);
    if (kind === 'pool') hint(treeX - 120, 'Now roll the boulder in, and watch the pool', 'Now roll the boulder in, and watch the pool', 'Now roll the boulder in, and watch the pool', shelfY + 10, c0);
    expert += (c0 - BOULDER.w - bX) / PUSH + 1.2;
    // the water, and the stair it pours over
    run(c0 + WET.margin - x);
    const steps: number[] = [];
    for (let i = 0; i < n; i++) {
      up(WET.rise, WET.tread);
      flower(x - WET.tread / 2, y - 34, 'orchid');
    }
    end();
    for (const p of P) if (p.x >= c0 + WET.margin - 1 && p.x < c0 + WET.margin + n * WET.tread - 1 && p.y < y0 && p.y > topY) steps.push(p.id);
    up(WET.rise, 0);
    // (standing on the terrace past the top of its stair, he got by it: a run started from a later flag finds it stopped, as it was)
    falls.push({ id: fid, x: c0, width: WET.margin + n * WET.tread, top: shelfY, bottom: y0, plug: { platformId: boulder.id, atX: c0 - BOULDER.w }, past: { x: r(x + 40), y: r(y + 10) } });
    info.push({ fallId: fid, kind: kind === 'pool' ? 'pool' : 'plug', steps, shelf: top.id, ...(logId !== undefined ? { log: logId } : {}) });
    fid++;
    expert += 1 + n * 0.6;
  }

  /**
   * a great fall on its own rhythm over a long wet stair, with a cave ledge halfway up behind the water: climb in a quiet spell, wait in
   * the cave for the next, climb on. The keepsake hides at the back of the cave.
   */
  function surgeFall(keepsake = true): { x: number; y: number } {
    const x0 = x, y0 = y;
    run(R.r(260, 300));
    const c0 = r(x);
    run(WET.margin);
    const surge = { pour: Math.round(R.r(3.4, 3.9) * 10) / 10, ease: 1.5, quiet: quietFor(3, Math.round(R.r(3.0, 3.4) * 10) / 10), offset: Math.round(R.r(0, 8) * 10) / 10 };
    const wetStep = () => {
      up(WET.rise, WET.tread);
      flower(x - WET.tread / 2, y - 34, 'orchid');
    };
    wetStep();
    wetStep();
    // the cave ledge
    up(WET.rise, 240);
    const cy = y;
    decor.push({ n: 'cave', x: x - 120, b: cy + 12, w: 230 });
    flower(x - 200, cy - 34, 'hibiscus');
    const cave = { x: r(x - 120), y: cy };
    // (the hollow in the rock behind the water: standing in it, the pour goes past in front of him, waterfalls.ts shelter)
    const shelter = { x0: r(x - 225), x1: r(x), y: cy };
    // World 4's keepsake, here by Matt's design for this stage (finds.ts FIND_STAGE_IN)
    const keep = FIND_BY_ID[`w${config.worldIndex}_keepsake`];
    if (keepsake && keep && keep.kind === 'keepsake') C.push({ id: cid++, type: 'find', findId: keep.id, hidden: true, x: r(x - 60), y: cy - 26, collected: false, bobPhase: 0 });
    wetStep();
    wetStep();
    end();
    const c1 = r(x);
    const steps = P.filter((p) => p.x >= c0 + WET.margin - 1 && p.x < c1 - 1 && p.y < y0).map((p) => p.id);
    up(WET.rise, 0);
    falls.push({ id: fid, x: c0, width: c1 - c0, top: r(y - 160), bottom: y0, surge, shelter: [shelter] });
    info.push({ fallId: fid, kind: 'surge', steps });
    fid++;
    // a quick player waits half a cycle on average, once for each half of the climb
    const cycle = surge.pour + surge.ease + surge.quiet;
    expert += (c0 - x0) / RUN + 2 * (cycle / 2) + 5 * 0.6;
    return cave;
  }

  /**
   * the thief behind the falls: a second capuchin, by a petal, runs off up a surge's stair and teases him from the cave behind the
   * water, then from the top. Follow it up in the quiet spells.
   */
  function thiefFalls() {
    const x0 = x;
    run(R.r(250, 290));
    const mx = r(x);
    const sitY = y;
    const petal = flower(mx + 46, sitY - 30, 'hibiscus');
    hint(x0 + 40, 'Another monkey! This one runs up behind the falling water. Follow it in the quiet, and touch it in the cave');
    const path: Array<{ x: number; y: number }> = [];
    run(R.r(330, 370));
    path.push({ x: r(x - 60), y: r(y) });
    expert += (x - x0) / RUN;
    const cave = surgeFall(false);
    path.push(cave);
    const x1 = x;
    run(R.r(280, 320));
    path.push({ x: r(x - 80), y: r(y) });
    monkeys.push({ job: 'thief', x: mx, y: sitY, petalId: petal.id, path });
    expert += (x - x1) / RUN + 2.5;
  }

  /**
   * the tide pool: a fall on its own rhythm pours into a pool, and the log on it rises while the fall pours and sinks in the quiet. The
   * only way up is the log at its highest: stand on it, let the water lift it, jump to the ledge beside it and climb the tree there to a
   * shelf over the pool. The fall pours across the gap between that shelf and the cliff top: cross it in the quiet (in the pour, it
   * washes him back down into the pool).
   */
  const tides: Array<{ fallId: number; log: number; ledge: number; lip: number; top: number }> = [];
  function tidePool() {
    const x0 = x, y0 = y;
    run(R.r(220, 260));
    const n0 = x;
    const nw = r(R.r(300, 340));
    const bx = r(n0 + nw + 20);
    const bw = 300;
    const fullY = y0 - POOL.full;
    const emptyY = y0 - POOL.empty;
    const ledgeY = r(fullY - POOL.ledge);
    const lipY = r(ledgeY - 260);
    // (as in the pool: the ledge reaches out over the log's near end, a double jump straight up from the log at its highest)
    const ledge = shelf(n0, bx + 30 + POOL.over, ledgeY);
    row(ledge.x + 60, n0 + nw - 120, ledgeY - 34, 2, 'orchid');
    const log: Platform = { id: pid++, x: bx + 30, y: fullY, width: 160, height: 30, type: 'solid', style: 'log', art: 'poolLog' };
    P.push(log);
    flower(log.x + log.width / 2 + 30, fullY - 40, 'hibiscus');
    flower(log.x + POOL.over / 2, ledgeY - 34, 'hibiscus');
    // the tree from the ledge up to the shelf over the pool, which stops short of the falling water
    const treeX = r(n0 + 70);
    trunk(treeX, ledgeY, lipY);
    flower(treeX, ledgeY - 110, 'hibiscus');
    const lip = shelf(treeX - 40, bx + 180, lipY);
    row(treeX + 80, bx + 120, lipY - 34, 3, 'orchid');
    // the water: down the far end of the basin, from above the shelf to the pool
    const wx = bx + 200;
    x = bx + bw;
    end();
    y = lipY;
    from = x;
    const surge = { pour: Math.round(R.r(3.4, 3.8) * 10) / 10, ease: 1.5, quiet: Math.round(R.r(3.2, 3.6) * 10) / 10, offset: Math.round(R.r(0, 8) * 10) / 10 };
    falls.push({ id: fid, x: wx, width: x - wx, top: lipY - 160, bottom: y0, surge });
    pools.push({ fedBy: fid, platformId: log.id, fullY, emptyY, art: { cx: log.x + log.width / 2, b: y0 + 6, w: bw } });
    info.push({ fallId: fid, kind: 'tide', steps: [], log: log.id });
    tides.push({ fallId: fid, log: log.id, ledge: ledge.id, lip: lip.id, top: lipY });
    fid++;
    hint(x0 + 40, 'This pool only fills while its fall pours. Stand on the log and let the water lift you');
    hint(bx - 40, 'Wait on the near end of the log, under the ledge. When the water lifts it all the way, double jump straight up');
    hint(treeX - 120, 'The water pours over the gap ahead. Cross when it goes quiet', 'The water pours over the gap ahead. Cross when it goes quiet', 'The water pours over the gap ahead. Cross when it goes quiet', lipY + 10);
    const cycle = surge.pour + surge.ease + surge.quiet;
    // to the log, wait for the water to lift it, up to the ledge, up the tree, along the shelf, wait for the quiet, across
    expert += (bx - x0) / RUN + 0.8 + cycle / 2 + 0.8 + (ledgeY - lipY) / CLIMB + 0.6 + (bx + 180 - treeX) / RUN + cycle / 3 + 0.8;
  }

  /**
   * the thief: a capuchin sits on the terrace by a petal. When he comes near it grabs it and runs off up the terraces ahead, stopping
   * at each post to tease him; the last post is its den.
   */
  function thief() {
    const x0 = x;
    // (2026-10-28: the walks between its posts a little shorter, still longer than his reach, so it runs and he follows)
    run(R.r(260, 300));
    const mx = r(x);
    const sitY = y;
    const petal = flower(mx + 46, sitY - 30, 'hibiscus');
    hint(x0 + 40, 'A monkey, by that petal! If it grabs it, run after it and touch it when it stops to tease you');
    const path: Array<{ x: number; y: number }> = [];
    let walked = mx - x0;
    const along = (len: number) => {
      run(len);
      walked += len;
    };
    along(R.r(360, 400));
    path.push({ x: r(x - 60), y: r(y) });
    stairs(2, R.r(88, 98), R.r(200, 230));
    along(R.r(280, 320));
    path.push({ x: r(x - 80), y: r(y) });
    stairs(3, R.r(88, 98), R.r(200, 230));
    along(R.r(280, 320));
    path.push({ x: r(x - 80), y: r(y) });
    stairs(2, R.r(88, 98), R.r(200, 230));
    along(R.r(320, 360));
    path.push({ x: r(x - 100), y: r(y) });
    monkeys.push({ job: 'thief', x: mx, y: sitY, petalId: petal.id, path });
    // (the stairs count themselves) catching it at a post takes a moment or two
    expert += walked / RUN + 2.5;
  }

  /**
   * two falls side by side on the same rhythm, half a beat apart, each over two wet steps, with a dry ledge between them: climb the
   * first in its quiet spell, wait on the ledge while the second pours, climb it in its own.
   */
  function surgePair() {
    const x0 = x, y0 = y;
    run(R.r(260, 300));
    const pour = Math.round(R.r(3.4, 3.8) * 10) / 10, ease = 1.5, quiet = quietFor(3, Math.round(R.r(3.0, 3.4) * 10) / 10);
    const cycle = pour + ease + quiet;
    const off = Math.round(R.r(0, 8) * 10) / 10;
    const a0 = r(x);
    run(WET.margin);
    for (let i = 0; i < 2; i++) {
      up(WET.rise, WET.tread);
      flower(x - WET.tread / 2, y - 34, 'orchid');
    }
    end();
    const a1 = r(x);
    const stepsA = P.filter((p) => p.x >= a0 + WET.margin - 1 && p.x < a1 - 1 && p.y < y0).map((p) => p.id);
    // the dry ledge between them; the second fall's water covers its far end
    up(WET.rise, R.r(250, 290));
    const b0 = r(x - WET.margin);
    flower(a1 + 60, y - 34, 'hibiscus');
    const yb = y;
    for (let i = 0; i < 2; i++) {
      up(WET.rise, WET.tread);
      flower(x - WET.tread / 2, y - 34, 'orchid');
    }
    end();
    const b1 = r(x);
    const stepsB = P.filter((p) => p.x >= b0 + WET.margin - 1 && p.x < b1 - 1 && p.y < yb).map((p) => p.id);
    up(WET.rise, 0);
    const top = r(y - 160);
    falls.push({ id: fid, x: a0, width: a1 - a0, top, bottom: y0, surge: { pour, ease, quiet, offset: off } });
    info.push({ fallId: fid, kind: 'surge', steps: stepsA });
    fid++;
    falls.push({ id: fid, x: b0, width: b1 - b0, top, bottom: yb, surge: { pour, ease, quiet, offset: Math.round((off + cycle / 2) * 10) / 10 } });
    info.push({ fallId: fid, kind: 'surge', steps: stepsB });
    fid++;
    hint(x0 + 40, 'Two falls, each on its own beat. Climb one, and wait between them for the other');
    expert += (a0 - x0) / RUN + cycle / 2 + 2 * 0.6 + 1 + cycle / 3 + 2 * 0.6;
  }

  // ======================= the stage =======================
  beat('Start: the wet steps', () => {
    rest(R.r(300, 340));
    hint(100, 'Climb the wet steps beside the great waterfall!');
    stairs(3, R.r(84, 96), R.r(200, 240));
    rest(R.r(160, 190));
    flag();
    treeUp(R.r(300, 340));
    breath();
  });
  beat('Learn: the boulder', () => {
    plugFall('tree');
    breath();
    flag();
  });
  beat('Develop: the thief', () => {
    thief();
    flag();
    breath();
  });
  beat('Develop: the high shelf', () => {
    plugFall('hops');
    breath();
    flag();
  });
  beat('Twist: the pool and the log', () => {
    plugFall('pool');
    breath();
    flag();
    rockRest(R.r(420, 480));
    terrace();
    breath();
  });
  beat('Twist: the surge', () => {
    hint(x + 40, 'This fall comes and goes on its own. Climb when it goes quiet, and wait in the cave behind it for the next quiet');
    surgeFall();
    breath();
    flag();
  });
  beat('Develop: the thief behind the falls', () => {
    thiefFalls();
    flag();
    terrace();
    breath();
    flag();
  });
  beat('Twist: the tide pool', () => {
    tidePool();
    breath();
    flag();
    rockRest(R.r(420, 480));
  });
  beat('Twist: the boulder up the surge', () => {
    plugFall('surge');
    breath();
    flag();
    terrace(true);
  });
  beat('Finish: to the shrine', () => {
    terrace(true);
    surgePair();
    breath();
    flag();
    let n = 0;
    while (expert < stageSeconds('4-3') + 4 && n < 24) {
      terrace(true);
      n++;
      if (n % 3 === 0) flag();
    }
    // (a last step up, and the shrine a short walk on)
    breath();
    rest(R.r(260, 300));
  });
  const exitX = r(x - 200);
  end();
  C.push({ id: cid++, type: 'exit_totem', x: exitX, y: y - 30, collected: false, bobPhase: 0 });

  // shift down: the top terrace sits 420 px under the top of the stage, the floor 120 px over its bottom
  const shift = 420 - y;
  for (const p of P) p.y += shift;
  for (const v of V) { v.topY += shift; v.bottomY += shift; }
  for (const t of T) { t.groundY += shift; t.topY += shift; }
  for (const c of C) c.y += shift;
  for (const cp of checkpoints) cp.y += shift;
  for (const h of hints) if (h.aboveY !== undefined) h.aboveY += shift;
  for (const w of falls) {
    w.top += shift;
    w.bottom += shift;
    for (const q of w.shelter ?? []) q.y += shift;
    if (w.past) w.past.y += shift;
  }
  for (const pl of pools) { pl.fullY += shift; pl.emptyY += shift; if (pl.art) pl.art.b += shift; }
  for (const m of monkeys) { m.y += shift; for (const q of m.path ?? []) q.y += shift; }
  for (const d of decor) d.b += shift;
  for (const k of rocks) { k.top += shift; k.land += shift; }
  const floorY = shift;
  const W = Math.ceil(x + 20);
  const H = floorY + BASE + 120;
  cid = heartsAtFlags(C, checkpoints, cid);
  const movedPickups = fixPickups({ platforms: P, vines: V, ropes: [] }, C);
  const cfg: LevelConfig = { ...config, levelWidth: W, levelHeight: H };
  return {
    config: cfg,
    trees: T,
    platforms: P,
    vines: V,
    ropes: [],
    enemies: [],
    boss: null,
    collectibles: C,
    spawnX: 140,
    spawnY: floorY,
    exitTotemX: exitX,
    exitTotemY: y + shift,
    checkpoints: checkpoints.sort((a, b) => b.y - a.y),
    meta: { attempt: seed, chunks: [], width: W, timing: { layoutSeconds: expert, decorSeconds: 0, route: W } },
    proto: {
      hints: hints.sort((a, b) => a.x - b.x), covers: [], beats, movedPickups,
      w4: { falls, pools, monkeys, decor, rocks, rockTip: ROCK_TIP },
    },
    falls43: info,
    tides43: tides,
  };
}
