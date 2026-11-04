/**
 * 1-1 Into the Canopy, rebuilt (w1-rhythm-b, 2026-11-04; reference/W1-REBUILD-PLAN.md row 1-1, reference/notes/w1-rhythm-b-plan.md).
 *
 * A linear wave that RISES: from the forest floor, up the earth bank, onto the first kapok bough, up into the canopy on the second jump,
 * across the mushroom boughs, along the high branches over open air, to the top branch and the view. 88 BPM, a march: the platforms sit
 * where his feet come down when he jumps on the beat (`trace`), so a player can tap along.
 *
 * Eight nodes on the research's tension curve (MATT-RESEARCH-2026-11-04-full.txt line 531): intro, ramp, ramp (the second jump taught),
 * spike, rest, counter-melody, climax, cool-down. A flag on a flat apron at every node's entrance. No fill: the length is the nodes'.
 * Nothing costs a life until the climax: misses before it land on moss, the bank or the bough below (a retry or a setback). The climax's
 * gaps are open air (a life on Normal; Easy's soft fall puts him back). The backdrop turns from the forest floor to the canopy as he
 * rises (proto.reveal: World 1's own strips), and on the top branch the view pulls back with a chime.
 */
import type { GeneratedStage } from './stageGenerator.ts';
import type { Collectible, LevelConfig, Platform } from './types.ts';
import { airStep, PHYS, reachJump, reachJumpHeld, TAKEOFF_SLACK, type AirBody } from './physics.ts';
import { fixPickups } from './flowerReach.ts';
import { heartsAtFlags, stream, type ProtoExtras, type StageHint } from './protoStage.ts';

/** the stage's tempo and its beat (s) */
export const BPM_11 = 88;
const BEAT = 60 / BPM_11;
const RUN = PHYS.maxRun;
const BANK_H = 90;
/** where his feet leave a ledge, in from its end, and how far into the next one they come down, at the least (px) */
const LIP = 14;
const PRE = 50;
/** the soft pits' floor under the forest floor, and the step out of one */
const HOLLOW = 130;
const PIT_STEP = 55;
/** under a hop between boughs, the bough that catches a miss, this far down (one plain jump back up) */
const CATCH_DOWN = 82;
/** a mushroom's step: higher than the second jump climbs (185 px), within the bounce's (the old 1-1's bounce walls: 225-240 from the
 * floor, the mushroom's own 30 under that) */
const BOUNCE_UP = 205;
/** the backdrop's turn to the canopy: from this height above the floor to this one */
const CANOPY_FROM = 620;
const CANOPY_FULL = 1150;

/** a jump he makes, from the cursor: up `rise` px (down if negative), the next take-off `beats` beats after this one */
interface Hop {
  beats: number;
  rise: number;
  /** the second jump, pressed this long (s) after the first */
  dbl?: number;
  /** what he lands on */
  on: 'bank' | 'stone' | 'branch' | 'shroom' | 'laid';
  /** what lies under the gap: moss (floor level), the bough below, or open air */
  under: 'soft' | 'catch' | 'pit' | 'none';
  /** land on a mushroom at the far side: it bounces him on (bouncy, 70 wide) */
  petal?: boolean;
}

/**
 * The flight of a jump taken at a full run (the engine's air step at 30 fps, Jump held, as the engine softens the top of a held jump): how far on (px) and how long (s)
 * until his feet come down through a surface `rise` px above the take-off. Easy plans on a shorter flick (physics EASY_HOLD). An interim
 * stand-in for the shared beat tracer (beatTrace.ts, w1-rhythm), which takes its place when it lands.
 */
export function flight(rise: number, dbl: number | undefined, easy: boolean, bounce = false): { dx: number; t: number } {
  const v0 = bounce ? PHYS.bounceV : easy ? Math.round(PHYS.jumpV * Math.sqrt(0.7)) : PHYS.jumpV;
  const b: AirBody = { x: 0, y: 0, vx: RUN, vy: -v0 };
  const dt = 1 / 30;
  let t = 0;
  let doubled = dbl === undefined;
  for (let i = 0; i < 200; i++) {
    if (!doubled && t >= dbl! - 1e-9) {
      b.vy = -(easy ? Math.round(PHYS.doubleV * Math.sqrt(0.7)) : PHYS.doubleV);
      doubled = true;
    }
    const prev = b.y;
    airStep(b, dt, 1, true);
    t += dt;
    if (b.vy >= 0 && prev <= -rise && b.y >= -rise) return { dx: b.x, t };
  }
  return { dx: -1, t };
}

export function buildIntoCanopy(config: LevelConfig, seed: number, easy = false): GeneratedStage & { proto: ProtoExtras } {
  const R = stream(seed * 7919 + 11);
  const P: Platform[] = [];
  const C: Collectible[] = [];
  const checkpoints: Array<{ x: number; y: number; reached: boolean }> = [];
  const hints: StageHint[] = [];
  const beats: Array<[number, number, string]> = [];
  const pieces: Array<{ k: string; x0: number; x1: number }> = [];
  let pid = 1, cid = 1;
  let expert = 0;

  // ---- the cursor: he stands on a surface that began at `from`, at height y (0 is the forest floor, up is negative), and `x` is where
  // he leaves it. The surface is laid when he leaves it (`leave`).
  let x = 0, y = 0, from = 0;
  let kind: Hop['on'] = 'bank';
  const flower = (fx: number, fy: number, v: Collectible['botanicalVariant'] = 'orchid') =>
    C.push({ id: cid++, type: 'flower', botanicalVariant: v, x: Math.round(fx), y: Math.round(fy), collected: false, bobPhase: (fx * 0.031) % 6.28 });
  const lay = (x0: number, x1: number, top: number, k: Hop['on']): Platform => {
    const w = Math.round(x1 - x0);
    const p: Platform = k === 'bank'
      ? { id: pid++, x: Math.round(x0), y: top, width: w, height: BANK_H, type: 'solid', style: 'log' }
      : k === 'stone'
        // (an earth step of the bank: it stands down into the forest floor, so nothing walks under it)
        ? { id: pid++, x: Math.round(x0), y: top, width: w, height: -top + BANK_H, type: 'solid', style: 'log', soil: true }
        : { id: pid++, x: Math.round(x0), y: top, width: w, height: 24, type: 'solid', style: 'branch' };
    // ('laid': the surface is already down, laid by the piece itself)
    P.push(p);
    return p;
  };
  /** lay the surface he is on, ending `lip` past the cursor */
  const leave = (lip = LIP): Platform => (kind === 'laid' ? P[P.length - 1] : lay(from, x + lip, y, kind === 'shroom' ? 'branch' : kind));
  const walk = (len: number) => {
    x += len;
    expert += len / RUN;
  };
  const flag = () => checkpoints.push({ x: Math.round(x - 60), y, reached: false });
  const hint = (hx: number, text: string, pad = text, keys = text, extra: Partial<StageHint> = {}) => hints.push({ x: Math.round(hx), text, pad, keys, ...extra });
  const beat = (name: string, f: () => void) => {
    const b0 = x;
    f();
    beats.push([b0, x, name]);
  };
  /** one jump on the beat: lay what he leaves, fly, and open what he lands on; then he runs on to the next take-off */
  const hop = (h: Hop) => {
    const laid = kind === 'laid';
    const left = leave();
    const edge = laid ? x + LIP : left.x + left.width;
    const f = flight(h.rise, h.dbl, easy);
    // (a hop needs at least 0.6 of what he can clear, or the gap reads as no gap; a jump nothing like that far is a step)
    const land = x + f.dx;
    const ny = y - h.rise;
    // (never wider than the level check's own reach takes on trust, his take-off slack off: the gap closes up toward him, and he still
    // comes down on the beat where he always would, further onto the ledge)
    const reach = (easy ? reachJumpHeld : reachJump)(h.rise, h.dbl !== undefined);
    const near = Math.round(Math.min(land - PRE, edge + reach * 0.95 - TAKEOFF_SLACK));
    // what is under the gap
    if (h.under === 'soft') {
      if (y === 0 && ny === 0) {
        // a soft pit in the forest floor: moss walled down to it, and a step out at the far wall
        const wallTop = BANK_H;
        P.push({ id: pid++, x: edge - 60, y: wallTop, width: 60, height: HOLLOW - wallTop + 4, type: 'solid', style: 'moss_stone', soil: true });
        P.push({ id: pid++, x: near, y: wallTop, width: 60, height: HOLLOW - wallTop + 4, type: 'solid', style: 'moss_stone', soil: true });
        P.push({ id: pid++, x: edge - 60, y: HOLLOW, width: near - edge + 120, height: BANK_H, type: 'solid', style: 'moss_stone' });
        const sw = near - edge < 170 ? near - edge : 70;
        P.push({ id: pid++, x: near - sw, y: HOLLOW - PIT_STEP, width: sw, height: PIT_STEP, type: 'solid', style: 'moss_stone', soil: true });
      } else {
        // between earth steps: a mossy floor one easy hop under the lower side
        const lower = Math.max(y, ny);
        const fl = Math.min(HOLLOW, lower + 75);
        P.push({ id: pid++, x: edge, y: fl, width: near - edge, height: HOLLOW + BANK_H - fl, type: 'solid', style: 'moss_stone', soil: true });
      }
    } else if (h.under === 'catch') {
      // a short bough under this gap only, one plain jump down (a miss is a hop back up to either side; never a way past the hops)
      lay(edge - 30, near + 30, Math.max(y, ny) + CATCH_DOWN, 'branch');
    }
    if (h.on === 'shroom') {
      // a mushroom on the far bough: he comes down on it and it bounces him on (the bough runs on under and past it)
      P.push({ id: pid++, x: Math.round(land - 35), y: ny - 30, width: 70, height: 30, type: 'bouncy' });
    }
    if (h.petal) flower(x + f.dx / 2, y - Math.min(150, 60 + Math.max(0, h.rise)) - 40, 'hibiscus');
    from = near;
    y = ny;
    kind = h.on;
    const run = Math.max(0, h.beats * BEAT - f.t) * RUN;
    x = Math.round(land + Math.max(run, 0));
    // (a ledge is never shorter than a body and a half past where he lands)
    x = Math.max(x, near + PRE + 60);
    expert += h.beats * BEAT;
  };
  /** a bounce off a mushroom at the end of what he is on: up `rise` onto what he lands on, the next take-off `beats` beats on */
  const bounce = (h: { rise: number; beats: number; dbl?: number; on: 'stone' | 'branch'; under: Hop['under'] }) => {
    const left = leave();
    const edge = left.x + left.width;
    // the mushroom stands at the end of what he is on; he hops onto it and it throws him up and on
    P.push({ id: pid++, x: edge - 70, y: y - 30, width: 70, height: 30, type: 'bouncy' });
    // (thrown from the mushroom's top, 30 over what he stands on; a steep throw comes down close: the far side never under the mushroom)
    const f = flight(h.rise - 30, h.dbl, easy, true);
    const land = Math.max(edge - 35 + f.dx, edge + PRE + 90);
    const ny = y - h.rise;
    const near = Math.round(Math.max(land - PRE - 20, edge + 70));
    if (h.under === 'catch') lay(edge - 30, near + 30, Math.max(y, ny) + CATCH_DOWN, 'branch');
    else if (h.under === 'soft') P.push({ id: pid++, x: edge, y: Math.min(HOLLOW, y + 75), width: near - edge, height: HOLLOW + BANK_H - Math.min(HOLLOW, y + 75), type: 'solid', style: 'moss_stone', soil: true });
    from = near;
    y = ny;
    kind = h.on;
    x = Math.round(Math.max(land + Math.max(0, h.beats * BEAT - f.t) * RUN, from + PRE + 80));
    expert += h.beats * BEAT;
  };
  /** a flat stretch to walk, with root knots to step over (small hops up and down: walking with a bump in it, not a move) */
  const stroll = (len: number, knots: number) => {
    const x0 = x;
    for (let k = 0; k < knots; k++) {
      walk(len / (knots + 1));
      // (the surface breaks round it, as the floor's stumps do: on one long piece under it the level check's route walked through it)
      const was = kind;
      leave(0);
      const kw = Math.round(R.r(80, 100));
      if (was === 'branch') P.push({ id: pid++, x: Math.round(x), y: y - 26, width: kw, height: 50, type: 'solid', style: 'moss_stone' });
      else P.push({ id: pid++, x: Math.round(x), y: y - 40, width: kw, height: 40 + (was === 'stone' ? -y : 0) + BANK_H, type: 'solid', style: 'log', soil: true });
      walk(kw);
      from = x;
      kind = was === 'shroom' ? 'branch' : was;
    }
    walk(len / (knots + 1));
    if (len) pieces.push({ k: 'rest', x0, x1: x });
  };
  const row = (x0: number, x1: number, n: number, v: Collectible['botanicalVariant'] = 'orchid') => {
    for (let i = 0; i < n; i++) flower(x0 + ((x1 - x0) * i) / Math.max(1, n - 1), y - 34, v);
  };

  const one = reachJump(0, false);
  void one;

  // ---- 1. Forest floor (intro): run and jump, one hop a bar, over soft moss. The touch coach teaches the gestures first (touchCoach.ts).
  beat('Intro: the forest floor', () => {
    from = 0;
    walk(Math.round(R.r(420, 460)));
    flag();
    hint(x + 40, 'Jump the little gaps');
    // three soft pits a bar apart (the flight on the beat lays the far side); a low stump between two is a bump in the walk
    for (let k = 0; k < 3; k++) {
      hop({ beats: k < 2 ? 4 : 2, rise: 0, on: 'bank', under: 'soft', petal: true });
      if (k < 2) {
        const sx = from + Math.round((x - from) * 0.45);
        const sw = Math.round(R.r(100, 130));
        const sh = R.i(38, 46);
        P.push({ id: pid++, x: sx, y: -sh, width: sw, height: sh + BANK_H, type: 'solid', style: 'log', soil: true });
        flower(sx + sw / 2, -sh - 34, 'orchid');
      }
    }
    walk(60);
    pieces.push({ k: 'stumps', x0: 0, x1: x });
  });

  // ---- 2. Up the bank (ramp): a hop over a mossy dip, a hop up a step, two beats each; twice a step too tall to jump, with a mushroom
  // at its foot (the bounce, taught: a miss is a bounce again)
  beat('Ramp: up the bank', () => {
    const x0 = x;
    flag();
    hint(x + 40, 'Up the bank! Hop from step to step');
    walk(100);
    const steps = R.pick([[50, 60], [60, 50], [40, 60]]);
    hop({ beats: 2, rise: 0, on: 'stone', under: 'soft' });
    hop({ beats: 2, rise: steps[0], on: 'stone', under: 'soft' });
    hop({ beats: 2, rise: 0, on: 'stone', under: 'soft', petal: true });
    hint(x - 60, 'Land on the mushroom to bounce up high');
    bounce({ rise: BOUNCE_UP, beats: 3, on: 'stone', under: 'soft' });
    row(from + 60, x - 20, 2);
    hop({ beats: 2, rise: 0, on: 'stone', under: 'soft' });
    hop({ beats: 2, rise: steps[1], on: 'stone', under: 'soft' });
    hop({ beats: 2, rise: 0, on: 'stone', under: 'soft', petal: true });
    bounce({ rise: BOUNCE_UP - 10, beats: 2, on: 'stone', under: 'soft' });
    hop({ beats: 2, rise: 0, on: 'stone', under: 'soft' });
    hop({ beats: 2, rise: steps[0] - 10, on: 'stone', under: 'soft' });
    walk(30);
    pieces.push({ k: 'bank', x0, x1: x });
  });

  // ---- 3. The bank top (rest): no move. Dot names the second jump, and a shelf over the path only it reaches is there to try it on
  // (a miss lands him back on the path). The first kapok's boughs are in view ahead.
  beat('Rest: the bank top', () => {
    flag();
    hint(x + 40, 'Flick up again in the air to jump twice', 'Press Jump again in the air', 'Press Space again in the air');
    stroll(Math.round(R.r(1450, 1550)), 3);
    // the practice shelf, 150 over the path, at the rest's end, where the climb on the second jump starts
    lay(x + 60, x + 230, y - 150, 'branch');
    flower(x + 145, y - 150 - 34, 'hibiscus');
    walk(330);
  });

  // ---- 4. Up into the canopy (spike, the stage's moment): three second jumps up off the bank (its top runs on under them), then a bar a
  // level, hops and the second jump up to the next bough; a short bough under each gap catches a miss
  beat('Spike: up into the canopy', () => {
    const x0 = x;
    flag();
    walk(60);
    const f = flight(140, 0.3, easy);
    lay(from, x + f.dx * 3 + 2 * 3 * BEAT * RUN, y, 'stone');
    kind = 'laid';
    for (let k = 0; k < 3; k++) {
      hop({ beats: 2, rise: 140, dbl: 0.3, on: 'branch', under: 'none' });
      flower(x - 30, y - 34, 'orchid');
    }
    // (a different count of hops on each level, so no run of four moves comes round more than three times)
    // (the second level goes up by a mushroom, not the second jump: the bounce learned on the bank comes back)
    for (const [n, up] of [[3, 'dbl'], [2, 'shroom'], [3, 'dbl']] as const) {
      for (let j = 0; j < n; j++) hop({ beats: 1, rise: 0, on: 'branch', under: 'catch', petal: j === 1 });
      if (up === 'dbl') hop({ beats: 2, rise: 150, dbl: 0.28, on: 'branch', under: 'catch' });
      else bounce({ rise: BOUNCE_UP - 20, beats: 2, on: 'branch', under: 'catch' });
    }
    walk(40);
    pieces.push({ k: 'canopy', x0, x1: x });
  });

  // ---- 5. The high bough (rest): no move. Dot's line; the golden seed glints on a shelf up ahead, over the mushroom boughs.
  beat('Rest: the high bough', () => {
    flag();
    hint(x + 30, 'Look how high we are! Almost the top.');
    stroll(Math.round(R.r(1600, 1700)), 3);
    row(from + 120, x - 100, 2, 'hibiscus');
  });

  // ---- 6. Mushroom boughs (counter-melody): a bounce on one, land on three, a hop on four (long-short); off the second mushroom a
  // bounce and the second jump reach the seed shelf. A short bough under each gap.
  beat('Counter: the mushroom boughs', () => {
    const x0 = x;
    flag();
    walk(60);
    bounce({ rise: BOUNCE_UP, beats: 2, on: 'branch', under: 'catch' });
    hop({ beats: 1, rise: 0, on: 'branch', under: 'catch' });
    hop({ beats: 2, rise: -70, on: 'branch', under: 'catch', petal: true });
    bounce({ rise: BOUNCE_UP - 20, beats: 3, on: 'branch', under: 'catch' });
    // the seed shelf: up off this mushroom's bough, a bounce and the second jump high (seen from the high bough)
    {
      const sy = y - 230;
      const sx = from + 20;
      lay(sx, sx + 160, sy, 'branch');
      C.push({ id: cid++, type: 'seed', x: sx + 80, y: sy - 34, collected: false, bobPhase: 1, findId: 'seed-1' });
      P.push({ id: pid++, x: from + 140, y: y - 30, width: 70, height: 30, type: 'bouncy' });
    }
    hop({ beats: 1, rise: 0, on: 'branch', under: 'catch' });
    hop({ beats: 2, rise: -80, on: 'branch', under: 'catch' });
    hop({ beats: 1, rise: -60, on: 'branch', under: 'catch' });
    bounce({ rise: BOUNCE_UP, beats: 3, on: 'branch', under: 'catch' });
    hop({ beats: 1, rise: 0, on: 'branch', under: 'catch', petal: true });
    walk(40);
    pieces.push({ k: 'mushroom', x0, x1: x });
  });

  // ---- 7. The last low bough (rest): no move, Dot's warning before the high branches
  beat('Rest: before the high branches', () => {
    flag();
    hint(x + 30, 'No moss up here. Keep the beat!');
    stroll(Math.round(R.r(1350, 1450)), 2);
  });

  // ---- 8. The high branches (climax): on the beat, over open air. Hops, the second jump over the wide ones, and mushrooms that
  // bounce him up to the next branch; a few gaps have a bough under them, most have nothing (a life on Normal; Easy's soft fall).
  beat('Climax: the high branches', () => {
    const x0 = x;
    flag();
    walk(60);
    type B = ['j' | 'J' | 'U' | 'M', number];
    const bars: B[][] = [
      [['J', 0], ['J', -60], ['M', BOUNCE_UP]],
      [['j', 0], ['J', -70], ['U', -40]],
      [['M', BOUNCE_UP - 10], ['J', -50], ['j', -60]],
      [['J', 0], ['U', -40], ['J', -40]],
      [['M', BOUNCE_UP], ['j', -50], ['U', 0]],
    ];
    bars.forEach((bar, k) => {
      for (const [m, rise] of bar) {
        if (m === 'M') bounce({ rise, beats: 3, on: 'branch', under: 'pit' });
        else hop({ beats: m === 'U' ? 2 : 1, rise, dbl: m === 'U' ? 0.32 : undefined, on: 'branch', under: m === 'j' ? 'catch' : 'pit', petal: m === 'U' });
      }
      if (k === 2) {
        // a flag halfway, on a bough wide enough to stand on (the second half starts again here)
        walk(160);
        flag();
      }
    });
    walk(60);
    pieces.push({ k: 'climax', x0, x1: x });
  });

  // ---- 9. The top branch (cool-down): the view, a stroll to the shrine
  let crown: Platform | null = null;
  beat('Cool-down: the top branch', () => {
    flag();
    hop({ beats: 3, rise: 40, dbl: 0.3, on: 'branch', under: 'pit' });
    walk(260);
    row(from + 80, x, 3, 'hibiscus');
    walk(Math.round(R.r(240, 280)));
  });
  crown = leave(0);
  // the top branch runs on past the shrine
  crown.width += 300;
  const exitX = Math.round(x - 40);
  C.push({ id: cid++, type: 'exit_totem', x: exitX, y: crown.y - 30, collected: false, bobPhase: 0 });
  void one;

  // ---- place it: the top branch 420 under the top of the stage, the floor near its bottom
  const minY = Math.min(...P.map((p) => p.y));
  const shift = 420 - minY;
  for (const p of P) p.y += shift;
  for (const c of C) c.y += shift;
  for (const cp of checkpoints) cp.y += shift;
  for (const h of hints) {
    if (h.belowY !== undefined) h.belowY += shift;
    if (h.aboveY !== undefined) h.aboveY += shift;
  }
  const floorY = shift;
  const H = floorY + HOLLOW + BANK_H + 20;
  cid = heartsAtFlags(C, checkpoints, cid);
  const movedPickups = fixPickups({ platforms: P, vines: [] }, C);
  const width = Math.ceil(Math.max(...P.map((p) => p.x + p.width)) + 20);
  const cfg: LevelConfig = { ...config, levelWidth: width, levelHeight: Math.max(config.levelHeight, H) };
  return {
    config: cfg,
    trees: [],
    platforms: P,
    vines: [],
    ropes: [],
    enemies: [],
    boss: null,
    collectibles: C,
    spawnX: 140,
    spawnY: floorY,
    exitTotemX: exitX,
    exitTotemY: crown.y,
    checkpoints: checkpoints.sort((a, b) => a.x - b.x),
    meta: { attempt: seed, chunks: pieces.map((p) => p.k), width, pieces, timing: { layoutSeconds: expert, decorSeconds: 0, route: width } },
    proto: {
      hints: hints.sort((a, b) => a.x - b.x), covers: [], beats, movedPickups,
      // the floor turns to the canopy as he rises (World 1's own strips: its sunrise sky, the canopy's crowns and leaf tops), and on the
      // top branch the view pulls back with a chime
      reveal: { from: floorY - CANOPY_FROM, full: floorY - CANOPY_FULL, load: floorY - CANOPY_FROM + 300, crown: crown.y, strips: { far: 'w1sunrise-far', mid: 'w1c-mid', near: 'w1c-near' } },
    },
  };
}
