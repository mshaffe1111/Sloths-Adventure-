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
import { findForStage } from './finds.ts';
import { reachJump } from './physics.ts';
import { catchWindow, earlyCatch, jumpGrab, landWindow } from './protoCheck.ts';
import { buildKapok, EXPERT_SECONDS, G, stream, type ProtoExtras, type StageHint } from './protoStage.ts';
import { gapFor, driftX, logLayout, LOG_DROP, LOG_HEIGHT, surfaceBelowBank, type RiverZone } from './river.ts';
import type { W2Decor } from './riverArt.ts';
import { W2_FRAMES } from './w2PropsData.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import type { Collectible, Enemy, LevelConfig, Platform, TreeStructure, Vine } from './types.ts';

export type W2Plan = '2-1' | '2-2' | '2-3' | '2-4' | '2-5' | '2-6' | '2-7' | '2-8' | '2-9';
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
/** 2-3: three little ones to free (a capybara, a duckling, an otter) */
export const CAGES_23 = 3;
/** 2-8 Reed Cages asks for 7 more little ones (the stage holds about one and a half times that) */
export const CAGES_28 = 7;
/** 2-9 The River King's Court asks for 14 of the court's guards and snappers (it holds about one and a half times that) */
export const COURT_GOAL_29 = 14;
/** a reed island's top in a rising river: just above the still water (it starts 20 px below), so the water covers it as it rises */
export const ISLAND_TOP = 600;

const WATER = 730;
const BANK_H = 90;
/** the river's surface, and where a log rides */
export const SURFACE = G + surfaceBelowBank;
const LOG_Y = G + LOG_DROP;

export function buildW2Stage(config: LevelConfig, seed = 1, plan: W2Plan): GeneratedStage & { proto: ProtoExtras } {
  // 2-6 Up the Bank Houses: World 1's climbing stage (1-4) built up the riverbank village instead of the kapok
  if (plan === '2-6') return buildKapok(config, seed, true);
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

  // the cursor: x is the open end of the bank Pokey is on
  let bankFrom = 0;
  let bankY = G;
  let x = 0;
  const run = (len: number) => {
    x += len;
  };
  const close = () => {
    if (x - bankFrom > 1) bank(bankFrom, x, bankY);
  };
  const open = (at: number, y = G) => {
    bankFrom = at;
    x = at;
    bankY = y;
  };
  const flag = () => checkpoints.push({ x: x - 80, y: bankY, reached: false });
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
    if (len > 300 && R.chance(0.6)) reeds(R.r(x0 + 60, x - 60), bankY + 4);
    pieces.push({ k: 'rest', x0, x1: x });
  }

  /**
   * a river: the bank ends, logs drift across `logs` log-spacings of water, and a new bank starts beyond. `safe`: falling in costs no life
   * (the teaching river), he is set back on this bank. Flowers arc over the water where a hop from log to log goes.
   */
  function river(dir: 1 | -1, speed: number, logs: number, logW: number, opts: { safe?: boolean; flowers?: number; tag?: string } = {}) {
    const x0r = x;
    run(R.r(140, 200));
    close();
    const rx0 = x;
    const gap = Math.round(gapFor(dir, speed));
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
    run(R.r(140, 200));
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
  function guardedRest(len: number) {
    rest(len);
    // (a flag often follows a stretch like this, at its far end: the snake keeps to the near side of the middle)
    snake(x - len * 0.6, G);
  }

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

  /** a lily pond: still water crossed on floating pads, a flower above each */
  function lilyPond(pads: number, deepFlowers = true, special?: { at: number; put: (cx: number, top: number) => void }) {
    const x0p = x;
    run(R.r(140, 190));
    close();
    const px0 = x;
    let px = px0;
    for (let i = 0; i < pads; i++) {
      px += Math.round(one * R.r(0.42, 0.55));
      const w = Math.round(R.r(84, 104));
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
    px += Math.round(one * R.r(0.42, 0.55));
    // still water: no logs, so nothing drifts (speed 0)
    rivers.push({ x0: px0, x1: px, surfaceY: SURFACE, dir: 1, speed: 0 });
    reeds(px0 - 20, G + 6);
    reeds(px + 20, G + 6);
    open(px);
    run(R.r(140, 200));
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
    run(R.r(150, 230));
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
      run(opts.island ?? R.r(140, 200));
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
    run(R.r(140, 200));
    close();
    const n = Math.max(3, Math.round(rise / 22));
    const r = rise / n;
    const tread = 28;
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
    run(R.r(120, 180));
    expert += (x - x0s) / RUN + n * 0.08;
    pieces.push({ k: up ? 'stairsUp' : 'stairsDown', x0: x0s, x1: x });
  }

  /**
   * a row of porches (Matt's porch: a deck jutting from a rock) at the level he is on, a hop apart. Over the river (`water`) a fall costs
   * a life and the row ends on high ground at the same level; over dry ground (the teaching row) it ends with a hop down to the path
   * below, where a fall would have put him anyway.
   */
  function porchRun(n: number, water: boolean) {
    const x0p = x;
    run(R.r(120, 170));
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
    if (water) {
      rivers.push({ x0: xs, x1: px, surfaceY: SURFACE, dir: 1, speed: 35, open: true });
      reeds(xs + 20, G + 6);
      reeds(px - 20, G + 6, true);
      open(px, level);
    } else {
      // the path below the porches, and the row ends with a hop down onto it
      bank(xs, px, G);
      open(px, G);
    }
    run(R.r(140, 200));
    expert += (x - x0p) / RUN + n * 0.4;
    pieces.push({ k: water ? 'porchesWater' : 'porches', x0: x0p, x1: x });
  }

  /** a basket on the rope (2-7): `up` rides from the path up to high ground on the right, else from high ground down to the path */
  function lift(up: boolean, high = G - Math.round(R.r(220, 240))) {
    const x0l = x;
    run(R.r(160, 220));
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
      lift: { top, bottom: G, speed: 95, wait: 1.6, phase: R.r(0, 4), postRight: up },
    });
    // flowers up the shaft: the ride collects them (the lower two: a jump from the path reaches them too)
    for (let i = 1; i <= 2; i++) flower(sx + W / 2, G - ((G - top) * i) / 4 - 40, 'hibiscus');
    run(R.r(180, 240));
    expert += (x - x0l) / RUN + (G - top) / 95 + 2.4;
    pieces.push({ k: up ? 'liftUp' : 'liftDown', x0: x0l, x1: x });
    return { sx, top };
  }

  /** a stretch of high ground with a snake on it, keeping to the near side of the middle (clear of a flag at the far end) */
  function guardedHigh(len: number) {
    rest(len);
    snake(x - len * 0.6, bankY);
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
    run(200);
    piece('sign', x, G + 4, 132, { text: ['PLEASE BE', 'PATIENT'] });
    run(120);
    piece('mailbox', x, G + 2, 54);
    run(180);
    mailman(x, x + 360);
    piece('door', x + 60, G + 6, 210);
    piece('window', x + 230, G - 30, 82);
    run(380);
    piece('laundry', x, G + 4, 200);
    run(260);
    piece('door', x, G + 6, 190, { flip: true });
    piece('chimney', x + 120, G - 72, 60);
    decor.push({ cel: 'tc.scroll', x: x + 220, b: G + 2, k: 0.42, flip: true });
    run(460);
    expert += (x - v0) / RUN;
    if (expert < EXPERT_SECONDS) {
      // a short last stroll to the shrine for any seconds the dice left short (never a long empty walk)
      const extra = Math.min(320, (EXPERT_SECONDS - expert) * RUN);
      run(extra);
      expert += extra / RUN;
    }
  }

  // ----- 2-8 Reed Cages: still water that rises -----

  /**
   * a basin of still water with low reed islands in it, cages on some of them. Once he steps in the water starts to rise, and covers the
   * islands after about `seconds` (it stops just under the banks). `safe`: falling in puts him back on the bank, and the water goes down
   * for the next try (the teaching basin). `post`: the last island has a mooring post with a cage on its shelf, above any water.
   */
  function floodBasin(islands: number, cageAt: number[], seconds: number, opts: { safe?: boolean; post?: boolean } = {}) {
    const x0b = x;
    run(R.r(140, 200));
    close();
    const bx0 = x;
    let ix = x;
    let postAt = -1;
    for (let i = 0; i < islands; i++) {
      ix += Math.round(one * R.r(0.36, 0.46));
      const w = Math.round(R.r(150, 200));
      P.push({ id: pid++, x: ix, y: ISLAND_TOP, width: w, height: 110, type: 'solid', style: 'moss_stone' });
      if (cageAt.includes(i)) cage(ix + w * 0.55, ISLAND_TOP, R.pick(['capy', 'duck', 'otter'] as const));
      else row(ix + 40, ix + w - 40, ISLAND_TOP - 34, 2, 'lotus');
      reeds(ix + R.r(16, 36), ISLAND_TOP + 4, R.chance(0.5));
      if (opts.post && i === islands - 1) postAt = ix + 40;
      ix += w;
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
    if (postAt > 0) {
      // the mooring post on the last island, its shelf high and dry, the cage on it; a jump from the shelf reaches the far bank
      const topY = G - 200;
      const keep = bankY;
      bankY = ISLAND_TOP;
      post(postAt, topY);
      bankY = keep;
      cage(postAt + 110, topY, R.pick(['capy', 'duck', 'otter'] as const));
    }
    open(ix, G);
    run(R.r(160, 220));
    expert += (x - x0b) / RUN + islands * 0.5 + cageAt.length * 1.6 + (postAt > 0 ? 4 : 0);
    pieces.push({ k: opts.post ? 'floodPost' : 'flood', x0: x0b, x1: x });
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

  // ======================================================================================================================
  if (plan === '2-1') {
    // 2-1 Down to the River: hop the drifting logs down to the riverbank village.
    open(0, G - 150);
    beat('Learn: the logs drift', () => {
      rest(R.r(420, 520));
      hint(260, 'Down to the river!');
      stepsDown(150);
      rest(R.r(200, 260));
      hint(x + 20, 'The logs drift with the river. Hop on and ride!');
      // the teaching river: two logs' worth of slow water, and a miss is only a splash
      river(1, 55, 2, 190, { safe: true, tag: 'learn' });
      hint(x - 120, 'Missed? Splash! Try again from the bank.');
      rest(R.r(260, 340));
      river(1, 60, 3, 180, { safe: true, tag: 'learn' });
      flag();
    });
    beat('Develop: deep water', () => {
      rest(R.r(220, 300));
      hint(x + 10, 'Deep water now. Stay on the logs!');
      river(1, 70, 3, 170);
      heart(x - 40, G - 60);
      guardedRest(R.r(600, 680));
      river(1, 72, 3, 168);
      island(R.r(170, 230));
      // a golden seed over the second river of the pair, higher than a hop from a log: a double jump from a log at the right moment
      const r2 = river(1, 75, 3, 165);
      goldenSeed((r2.x0 + r2.x1) / 2, LOG_Y - 175);
      flag();
    });
    beat('Twist: against the current', () => {
      rest(R.r(260, 340));
      hint(x + 10, 'This river flows back at you. Wait for a log, then hop on.');
      river(-1, 60, 3, 175);
      heart(x - 50, G - 60);
      rest(R.r(240, 320));
      river(-1, 65, 3, 170);
      flag();
    });
    beat('Finish: down to the village', () => {
      let n = 0;
      // (the village's walk adds about 8 s)
      while (expert < EXPERT_SECONDS - 8 && n < 10) {
        if (n % 3 === 1) guardedRest(R.r(600, 680));
        else rest(R.r(240, 360));
        river(n % 3 === 2 ? -1 : 1, 70 + n * 2, 3, 165);
        if (++n % 2 === 0) flag();
      }
      rest(R.r(160, 220));
      heart(x - 60, G - 60);
      // the village: its jetty out over the last river's bank, the sign, the mailbox, round doors in the bank
      villageEnd();
    });
  } else if (plan === '2-7') {
    // 2-7 The Mailman's Route: the long way round the river, the way the mailman goes: up the carved steps, along the porches, into the
    // basket of a rope lift and up the bank, over the river on the logs and on the rope-swing frames, and past every door marked PLEASE
    // BE PATIENT to the end of his round.
    open(0);
    beat('Learn: up the steps, along the porches', () => {
      rest(R.r(460, 540));
      hint(220, 'Follow the mailman’s route round the village!');
      mailman(260, 520);
      stairs(Math.round(R.r(110, 130)), true);
      hint(x - 160, 'Hop along the porches');
      porchRun(3, false);
      rest(R.r(260, 320));
      patientDoor(x - 110);
      flag();
      piece('mailbox', x - 40, G + 2, 54);
    });
    beat('Develop: the basket lift, porches over the river', () => {
      rest(R.r(220, 280));
      hint(x + 40, 'Step into the basket. It carries you up!');
      lift(true);
      rest(R.r(160, 220));
      porchRun(3, true);
      heart(x - 60, bankY - 60);
      guardedHigh(R.r(600, 660));
      lift(false);
      river(1, 72, 3, 168);
      flag();
      piece('mailbox', x - 40, G + 2, 54);
    });
    beat('Twist: the swing frames', () => {
      rest(R.r(220, 300));
      hint(x + 10, 'Swing across on the rope frames!');
      swingRiver(2, { frames: true });
      rest(R.r(240, 320));
      patientDoor(x - 110);
      swingRiver(3, { frames: true });
      heart(x - 40, G - 60);
      // a golden seed above the next lift's crane: a double jump from the basket at the top
      const lf = lift(true);
      goldenSeed(lf.sx + 48, lf.top - 175);
      rest(R.r(160, 220));
      stairs(Math.round(G - bankY), false);
      flag();
    });
    beat('Finish: the end of the round', () => {
      let n = 0;
      while (expert < EXPERT_SECONDS - 14 && n < 10) {
        rest(R.r(220, 300));
        const k = n % 4;
        if (k === 0) {
          lift(true);
          rest(R.r(140, 200));
          porchRun(R.i(2, 3), true);
          lift(false);
        } else if (k === 1) river(n % 2 ? -1 : 1, 74, 3, 166);
        else if (k === 2) swingRiver(n % 3 === 2 ? 3 : 2, { frames: true });
        else {
          stairs(Math.round(R.r(110, 130)), true);
          porchRun(3, false);
        }
        if (++n % 2 === 0) flag();
      }
      rest(R.r(160, 220));
      heart(x - 60, G - 60);
      villageEnd();
    });
  } else if (plan === '2-8') {
    // 2-8 Reed Cages: more little ones caught in the reeds, on islands in still water that rises once he steps in. Learn on a basin where
    // a fall costs nothing; then wider basins with more cages; the twist puts the last cage up a mooring post, high and dry, with the jump
    // to the far bank from its shelf.
    open(0);
    beat('Learn: the water rises', () => {
      rest(R.r(460, 540));
      hint(220, 'More little ones in the reeds! Free them before the water rises.');
      floodBasin(2, [1], 30, { safe: true });
      hint(x - 220, 'Back on the bank before the islands go under!');
      rest(R.r(220, 280));
      floodBasin(3, [0, 2], 30, { safe: true });
      flag();
    });
    beat('Develop: deep water', () => {
      rest(R.r(220, 280));
      hint(x + 10, 'Deep water now. Be quick!');
      floodBasin(3, [1, 2], 26);
      heart(x - 40, G - 60);
      guardedRest(R.r(600, 660));
      river(1, 72, 3, 168);
      floodBasin(4, [0, 3], 28);
      flag();
    });
    beat('Twist: up the mooring post', () => {
      rest(R.r(220, 280));
      hint(x + 10, 'One is up the post. Climb above the water!', 'One is up the post. Hold Up to climb above the water!', 'One is up the post. Hold W or Up to climb above the water!');
      floodBasin(3, [1], 24, { post: true });
      heart(x - 40, G - 60);
      rest(R.r(240, 320));
      // a golden seed over the middle of a basin, a double jump from an island before it floods
      const sx = x;
      floodBasin(4, [2], 24);
      goldenSeed(sx + (x - sx) * 0.45, ISLAND_TOP - 170);
      flag();
    });
    beat('Finish: before the water rises', () => {
      let n = 0;
      while (expert < EXPERT_SECONDS - 10 && n < 10) {
        rest(R.r(220, 300));
        if (n % 3 === 2) river(n % 2 ? -1 : 1, 74, 3, 166);
        else floodBasin(R.i(3, 4), n % 3 === 0 ? [0, 2] : [1], 24, { post: n % 4 === 3 });
        if (++n % 2 === 0) flag();
      }
      rest(R.r(500, 700));
    });
  } else if (plan === '2-9') {
    // 2-9 The River King's Court: fight through the court to the king. His guards (royal snappers, upright with spears) block a blow to
    // the front, jab further than a snapper bites, and need two hits; from behind, or open after a jab, they go down; a kick staggers one
    // back into whoever stands behind him. Learn one guard at a time; then guards and snappers on the islands; the twist is the court
    // itself, a row of guards before the king's bell, where one good kick bowls the rest over.
    open(0);
    /** a stretch of bank with guards (and snappers between them) spread along it, clear of the flags at either end */
    const guardBank = (n: number, spacing: [number, number], snappers = 0) => {
      const x0g = x;
      run(R.r(260, 320));
      for (let i = 0; i < n; i++) {
        run(R.r(spacing[0], spacing[1]));
        guard(x);
        if (i < snappers) {
          run(R.r(spacing[0] * 0.6, spacing[1] * 0.6));
          turtle(x);
        }
      }
      run(R.r(400, 460));
      row(x0g + 120, x - 120, G - 34, Math.max(2, Math.round((x - x0g) / 220)), 'hibiscus');
      expert += (x - x0g) / RUN + n * 2.4 + snappers * 1.6;
      pieces.push({ k: `guards${n}`, x0: x0g, x1: x });
    };
    /** the court's dressing along a stretch of bank: lanterns on posts, and a sign */
    const courtLanterns = (x0c: number, x1c: number) => {
      for (let lx = x0c + 80; lx < x1c - 60; lx += R.r(260, 340)) piece('lantern', lx, G + 4, 40);
    };
    beat('Learn: one guard', () => {
      rest(R.r(460, 540));
      hint(220, 'The river king’s guards! Hit one from behind, or when he lowers his spear.');
      piece('sign', 360, G + 4, 132, { text: ['THE KING’S', 'COURT'] });
      run(R.r(260, 320));
      guard(x, G, 100);
      run(R.r(420, 480));
      expert += 4;
      hint(x - 240, 'Head-on he blocks. Kick him!', 'Head-on he blocks. Kick him!', 'Head-on he blocks. Kick him!');
      guardBank(2, [320, 380]);
      river(1, 72, 3, 168);
      flag();
    });
    beat('Develop: guards on the islands', () => {
      rest(R.r(240, 300));
      for (let k = 0; k < 2; k++) {
        const ix = x;
        island(R.r(400, 460));
        guard((ix + x) / 2, G, 100);
        expert += 3;
        river(k ? -1 : 1, 74, 3, 166);
      }
      heart(x - 40, G - 60);
      guardBank(2, [280, 340], 2);
      lilyPond(5);
      flag();
    });
    beat('Twist: the court', () => {
      rest(R.r(240, 300));
      hint(x + 20, 'The court! Kick one guard into the rest!');
      const c0 = x;
      // close together: a guard kicked along this bank meets every one behind him
      guardBank(4, [110, 140]);
      courtLanterns(c0, x);
      heart(x - 40, G - 60);
      river(-1, 70, 3, 170);
      const c1 = x;
      guardBank(3, [240, 300], 1);
      courtLanterns(c1, x);
      // a golden seed high over the court: the top of a double jump from the middle of the bank
      goldenSeed((c1 + x) / 2, G - 190);
      flag();
    });
    beat('Finish: to the king', () => {
      let n = 0;
      while (expert < EXPERT_SECONDS - 16 && n < 10) {
        rest(R.r(220, 300));
        const c = x;
        guardBank(n % 3 === 0 ? 4 : 2, n % 3 === 0 ? [120, 150] : [260, 320], n % 2);
        courtLanterns(c, x);
        if (n % 2) lilyPond(4);
        else river(n % 4 ? -1 : 1, 74 + n * 2, 3, 165);
        if (++n % 2 === 0) flag();
      }
      // the king's court: lanterns, the bell, his sign
      rest(R.r(200, 260));
      const k0 = x;
      run(240);
      piece('sign', x, G + 4, 140, { text: ['BOW TO', 'THE KING'] });
      run(200);
      piece('bell', x, G + 6, 150);
      run(260);
      courtLanterns(k0, x);
      run(R.r(300, 380));
      expert += (x - k0) / RUN;
    });
  } else if (plan === '2-2') {
    // 2-2 Petals for the Crown: the river king wants admiring. Gather flowers for his crown: over the logs, high and low, and across the
    // lily pond. The flowers show the way: they arc where the hop goes.
    open(0);
    beat('Learn: flowers over the water', () => {
      rest(R.r(500, 600));
      hint(240, 'Gather flowers for the river king’s crown!');
      river(1, 65, 3, 175, { flowers: 6 });
      rest(R.r(260, 340));
      lilyPond(5);
      hint(x - 260, 'Hop the lily pads. The flowers show the way.');
      flag();
    });
    beat('Develop: high and low', () => {
      rest(R.r(240, 300));
      // flowers high over the river: a double jump from a log reaches the top row
      const r = river(1, 75, 4, 165, { flowers: 6 });
      arc(r.x0 + 80, r.x1 - 80, LOG_Y - 170, 4, 'orchid', 30);
      heart(x - 40, G - 60);
      guardedRest(R.r(600, 680));
      // the note (World 2's story find) waits on a lily pad in the middle of a quiet pond
      const note = findForStage(config.worldIndex, config.miniIndex);
      lilyPond(6, true, {
        at: 3,
        put: (cx, top) => {
          if (note && note.kind === 'note') C.push({ id: cid++, type: 'find', findId: note.id, hidden: false, x: cx, y: top - 40, collected: false, bobPhase: 0 });
          else flower(cx, top - 52, 'lotus');
        },
      });
      flag();
    });
    beat('Twist: against the current', () => {
      rest(R.r(240, 320));
      hint(x + 10, 'This river flows back at you. Wait for a log, then hop on.');
      river(-1, 65, 3, 170, { flowers: 5 });
      heart(x - 50, G - 60);
      rest(R.r(220, 300));
      lilyPond(4);
      const rs = river(1, 75, 3, 165, { flowers: 6 });
      // the golden seed over the middle of the river, a double jump from a log
      goldenSeed((rs.x0 + rs.x1) / 2, LOG_Y - 178);
      flag();
    });
    beat('Finish: the crown', () => {
      let n = 0;
      while (expert < EXPERT_SECONDS - 10 && n < 10) {
        rest(R.r(240, 340));
        if (n % 2 === 0) river(n % 4 === 2 ? -1 : 1, 72, 3, 165, { flowers: 6 });
        else lilyPond(4);
        if (++n % 2 === 0) flag();
      }
      rest(R.r(500, 700));
    });
  } else if (plan === '2-4') {
    // 2-4 Over the Water: swing across the river on the hanging vines. Learn over water that costs no life, two vines at a time; then
    // longer chains over the deep river; the twist mixes the two rules: a swing lands on an island in the middle of the river, and the
    // logs carry him on from there.
    open(0);
    beat('Learn: swing over the water', () => {
      rest(R.r(480, 560));
      hint(260, 'Swing over the river! Jump into a vine to grab it.');
      swingRiver(2, { safe: true });
      hint(x - 160, 'Missed? Splash! Try again from the bank.');
      rest(R.r(240, 320));
      swingRiver(2, { safe: true });
      flag();
    });
    beat('Develop: the long swing', () => {
      rest(R.r(240, 320));
      hint(x + 10, 'Deep water now. Let go at the front of the swing.');
      swingRiver(3);
      heart(x - 40, G - 60);
      guardedRest(R.r(600, 680));
      swingRiver(3);
      flag();
    });
    beat('Twist: vines and logs', () => {
      rest(R.r(240, 320));
      hint(x + 10, 'Swing to the island, then ride the logs!');
      swingRiver(2, { island: Math.round(R.r(240, 300)) });
      river(1, 70, 3, 168);
      heart(x - 40, G - 60);
      rest(R.r(240, 320));
      // a golden seed above the last vine of a long chain, a leap from the top of its swing
      const v0 = V.length;
      swingRiver(4);
      const last = V[V.length - 1];
      if (V.length > v0) goldenSeed(last.x + 40, last.topY + 40);
      flag();
    });
    beat('Finish', () => {
      let n = 0;
      while (expert < EXPERT_SECONDS - 10 && n < 10) {
        if (n % 3 === 1) guardedRest(R.r(600, 680));
        else rest(R.r(240, 340));
        if (n % 3 === 2) {
          swingRiver(2, { island: Math.round(R.r(240, 300)) });
          river(n % 2 ? -1 : 1, 70, 3, 168);
        } else swingRiver(n % 2 ? 4 : 3);
        if (++n % 2 === 0) flag();
      }
      rest(R.r(500, 700));
    });
  } else if (plan === '2-5') {
    // 2-5 River Snappers: chase the snapping turtles off the bank. Learn: one at a time; a blow to the face only sends it into its
    // shell, so get behind it or stomp it. Develop: a row of them on one stretch of bank, where a kicked shell bowls the rest over.
    // Twist: snappers on the islands between the rivers, so the fight is on a short patch of ground with water each side.
    open(0);
    /** a long bank with snappers spread along it, each on its own patch, clear of the flags at either end */
    const snapperBank = (n: number, spacing: [number, number]) => {
      const x0b = x;
      run(R.r(260, 320));
      for (let i = 0; i < n; i++) {
        run(R.r(spacing[0], spacing[1]));
        turtle(x);
      }
      run(R.r(380, 440));
      row(x0b + 120, x - 120, G - 34, Math.max(2, Math.round((x - x0b) / 200)), 'hibiscus');
      expert += (x - x0b) / RUN + n * 1.6;
      pieces.push({ k: `snappers${n}`, x0: x0b, x1: x });
    };
    beat('Learn: one snapper', () => {
      rest(R.r(420, 500));
      hint(200, 'Snappers! Hit one from behind, or jump on it.');
      run(R.r(260, 300));
      turtle(x, G, 100);
      run(R.r(380, 440));
      expert += 3;
      hint(x - 200, 'Head-on, it hides. Kick the shell!', 'Head-on, it hides. Kick the shell!', 'Head-on, it hides. Kick the shell!');
      snapperBank(2, [300, 360]);
      river(1, 72, 3, 168);
      flag();
    });
    beat('Develop: bowl them over', () => {
      rest(R.r(240, 300));
      hint(x + 20, 'A row of snappers. Kick a shell into the others!');
      // close together: a shell kicked along this bank meets every one of them
      snapperBank(4, [110, 140]);
      heart(x - 40, G - 60);
      river(-1, 70, 3, 170);
      snapperBank(3, [260, 320]);
      flag();
    });
    beat('Twist: snappers on the islands', () => {
      rest(R.r(240, 300));
      river(1, 75, 3, 165);
      for (let k = 0; k < 2; k++) {
        const ix = x;
        island(R.r(380, 440));
        turtle((ix + x) / 2, G, 90);
        expert += 2;
        river(k ? -1 : 1, 75, 3, 165);
      }
      heart(x - 40, G - 60);
      // a golden seed high over a row of snappers: the top of a double jump from the middle of the bank
      const sx = x;
      snapperBank(3, [200, 240]);
      goldenSeed((sx + x) / 2, G - 190);
      flag();
    });
    beat('Finish', () => {
      let n = 0;
      while (expert < EXPERT_SECONDS - 10 && n < 10) {
        rest(R.r(220, 300));
        snapperBank(n % 3 === 0 ? 4 : 2, n % 3 === 0 ? [120, 150] : [260, 320]);
        river(n % 2 ? -1 : 1, 72 + n * 2, 3, 165);
        if (++n % 2 === 0) flag();
      }
      rest(R.r(500, 700));
    });
  } else {
    // 2-3 Stuck in the Reeds: three little ones in reed cages. One by the bank in the reeds, one out on an island in the river,
    // one up a mooring post. Two blows break a cage.
    open(0);
    const critters = R.shuffle<'capy' | 'duck' | 'otter'>(['capy', 'duck', 'otter']);
    beat('Learn: a cage in the reeds', () => {
      rest(R.r(460, 560));
      hint(260, 'Little ones are stuck in reed cages. Free them!');
      run(R.r(180, 240));
      hint(x - 120, 'Tap twice to break the cage', 'Punch the cage twice', 'Punch the cage twice');
      cage(x, G, critters[0]);
      reeds(x - 70, G + 6);
      reeds(x + 74, G + 6, true);
      run(R.r(260, 340));
      expert += 3;
      river(1, 70, 3, 170);
      flag();
    });
    beat('Develop: the island', () => {
      rest(R.r(240, 320));
      river(1, 72, 3, 168);
      // the island in the river, with the second cage in its reeds
      const islandX = x;
      island(R.r(300, 360));
      cage(islandX + 150, G, critters[1]);
      reeds(islandX + 70, G + 6);
      reeds(islandX + 240, G + 6, true);
      expert += 3;
      heart(islandX + 280, G - 60);
      river(-1, 65, 3, 170);
      guardedRest(R.r(600, 680));
      flag();
    });
    beat('Twist: up the mooring post', () => {
      rest(R.r(240, 300));
      hint(
        x + 20,
        'The last one is up the post. Climb!',
        'The last one is up the post. Hold Up to climb',
        'The last one is up the post. Hold W or Up to climb',
      );
      run(R.r(160, 200));
      const postX = x;
      const topY = G - 240;
      post(postX, topY);
      cage(postX + 110, topY, critters[2]);
      goldenSeed(postX + 140, topY - 150);
      run(R.r(320, 380));
      expert += 240 / 220 + 3;
      heart(x - 60, G - 60);
      river(1, 75, 3, 165);
      flag();
    });
    beat('Finish', () => {
      let n = 0;
      while (expert < EXPERT_SECONDS - 10 && n < 10) {
        rest(R.r(240, 340));
        river(n % 2 === 1 ? -1 : 1, 72, 3, 165);
        if (++n % 2 === 0) flag();
      }
      rest(R.r(500, 700));
    });
  }

  const exitX = x - 220;
  close();
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
