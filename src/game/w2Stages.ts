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
import { EXPERT_SECONDS, G, stream, type ProtoExtras, type StageHint } from './protoStage.ts';
import { gapFor, driftX, logLayout, LOG_DROP, LOG_HEIGHT, surfaceBelowBank, type RiverZone } from './river.ts';
import type { W2Decor } from './riverArt.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import type { Collectible, Enemy, LevelConfig, Platform, TreeStructure, Vine } from './types.ts';

export type W2Plan = '2-1' | '2-2' | '2-3' | '2-4';
export const W2_STAGES: Record<string, W2Plan> = {
  '2-1': '2-1',
  '2-2': '2-2',
  '2-3': '2-3',
  '2-4': '2-4',
};

/** 2-2 asks for 80 flowers for the king's crown (the stage holds about one and a half times that) */
export const FLOWER_GOAL_22 = 80;
/** 2-3: three little ones to free (a capybara, a duckling, an otter) */
export const CAGES_23 = 3;

const WATER = 730;
const BANK_H = 90;
/** the river's surface, and where a log rides */
export const SURFACE = G + surfaceBelowBank;
const LOG_Y = G + LOG_DROP;

export function buildW2Stage(config: LevelConfig, seed = 1, plan: W2Plan): GeneratedStage & { proto: ProtoExtras } {
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
  function swingRiver(n: number, opts: { safe?: boolean; island?: number; flow?: number } = {}) {
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
      const v0 = x;
      // the jetty reaches out over the last river from the village's bank, its posts in the water
      piece('jetty', bankFrom - 50, SURFACE + 26, 210, { flip: true });
      run(200);
      piece('sign', x, G + 4, 132, { text: ['PLEASE BE', 'PATIENT'] });
      run(120);
      piece('mailbox', x, G + 2, 54);
      run(180);
      decor.push({
        cel: 'po.carry_stand',
        celWalk: 'po.walk_parcel',
        x: x,
        b: G + 2,
        k: 0.42,
        walk: [x - 60, x + 360, 9],
      });
      piece('door', x + 60, G + 6, 210);
      piece('window', x + 230, G - 30, 82);
      run(380);
      piece('laundry', x, G + 4, 200);
      run(260);
      piece('door', x, G + 6, 190, { flip: true });
      piece('chimney', x + 120, G - 72, 60);
      decor.push({
        cel: 'tc.scroll',
        x: x + 220,
        b: G + 2,
        k: 0.42,
        flip: true,
      });
      run(460);
      expert += (x - v0) / RUN;
      if (expert < EXPERT_SECONDS) {
        // a short last stroll to the shrine for any seconds the dice left short (never a long empty walk)
        const extra = Math.min(320, (EXPERT_SECONDS - expert) * RUN);
        run(extra);
        expert += extra / RUN;
      }
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
  const targetCount = plan === '2-2' ? FLOWER_GOAL_22 : plan === '2-3' ? CAGES_23 : config.targetCount;
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
