/**
 * World 5's hand-built stages (the Orchid Sanctuary), built the new way: planned beats, details rolled by the seed, every piece checked.
 * The mechanics are Dot's rules (w5Kit.ts, run by w5Play.ts); every prop comes from the story (reference/STORY-REWRITE.md "World 5").
 *
 * 5-1 The Loveliest Place (sprint, the golden afternoon): "Run through the loveliest place on the road. Do not stop."
 *   1. START    the first tree, with Meeca's carving: POKEY. DON'T SIT. M. (cut with a hairpin as they marched her past).
 *   2. LEARN    the little table in the middle of the path, set for two, with its card ("Do sit. The pot is warm. It is always warm.")
 *               and two soft chairs that tug: the stillness is taught gently here (a wrap is only a fright: W5Extras.gentle).
 *   3. DEVELOP  the open garden: soft jumps, stumps, a high road of petals, and the jumping spider (it crouches, then rushes). Everything
 *               up to the first wide gap is one plain jump high (1-1's stepping-stone numbers); the second jump is taught at that gap,
 *               the first place that needs it (QA, 2026-10-26).
 *   4. TWIST    the guests who sat: silk-wrapped chairs along the way, soft chairs at the lip of the jumps, spiders in pairs.
 *   5. FINISH   the ideas again in new pairs, a flag after each, until a quick player has had about 2:45 (STAGE_SECONDS).
 *
 * 5-2 Don't Sit (stealth, gold): "POKEY. DON'T SIT. Stay hidden and keep moving."
 *   1. START    Dot's rules: don't sit, don't eat, don't drink, don't touch the silk, don't admire the silk (with room to say them
 *               before anything they are about comes near, for a player who runs from the first moment).
 *   2. LEARN    the sleeping spiders first (one lies alone, to be hopped: it wakes only if he walks right into it), then the humming
 *               threads: strung low across the way, they hum at a touch, and the sleeping spiders near them wake and come. Each is
 *               taught before the first one he could touch (QA, 2026-10-26).
 *   3. DEVELOP  the cakes: tiny cakes among the petals that make him sleepy; then the first Butler, holding out a tray with a cake on
 *               it (punch the tray away, or jump over him).
 *   4. TWIST    soft chairs among the threads ("You'd be a very still chair"), and Pell's blanket note in plain sight on a pink bell.
 *   5. TWIST    everything at once: threads before the jumps (the wide one with a reminder of the second jump), cakes on the high
 *               road, sleeping spiders under it, the Butler again.
 *   6. FINISH   new pairs until about 3:20 (STAGE_SECONDS).
 *
 * Every drop is a soft pit (a mossy floor and a step back up the far side): a miss costs a climb, never a life. The hearts are lost to
 * spiders and to the silk, never to a fall.
 */
import { fixPickups } from './flowerReach.ts';
import { G, heartsAtFlags, stageSeconds, stream, type LeafCover, type ProtoExtras, type StageHint } from './protoStage.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import { findForStage } from './finds.ts';
import { reachJump } from './physics.ts';
import { PAST_SHRINE } from './rules.ts';
import { TABLE_CARD, type Butler, type Cake, type Carving, type Chair, type TeaTable, type Thread, type W5Decor, type W5Extras, type W5Spider } from './w5Kit.ts';
import { W5_HINTS, type W5Hint } from './w5Lines.ts';
import type { Collectible, Enemy, LevelConfig, Platform, TreeStructure, Vine } from './types.ts';

export type W5Plan = '5-1' | '5-2';

/** the floor of a soft pit, and the step out of it (as protoStage.ts) */
const HOLLOW_Y = 710;
const PIT_STEP = 55;
const BANK_H = 90;
/** a quick, sure player runs at 285 px/s */
const RUN = 285;
/** a gap's widths: one jump (a little under the 175 px a running jump reaches), and two (well under the 313 of a double jump) */
const GAP1: [number, number] = [130, 165];
const GAP2: [number, number] = [205, 250];
/** how far a spider's patch keeps from a flag or the spawn (levelCheck.ts SAFE_APPROACH is 200) */
const SAFE_GAP = 230;
/**
 * Stumps before the second jump is taught: 1-1's stepping-stone numbers (protoStage.ts stumps: the first 50 px, the rest 50, 60 or 70),
 * an easy single hop. 5-1's old 60 to 88 px stumps came before the lesson and a first-timer was stuck at them for 20 s (QA, 2026-10-26).
 */
export const W5_PLAIN_STUMPS = { first: 50, steps: [50, 60, 70] } as const;
/** after it: one jump high (60 to 88, under SAFE.rise1), or (`tall`) two */
const STUMP_H: [number, number] = [60, 88];
const TALL_H: [number, number] = [125, 145];
/** how far before a gap's edge Dot's line about it is said (px): room to say it before he is near it, for a player at full run */
const GAP_TELL = 760;

/** what the tests read back about the stage (ids and x's) */
export interface W5Info {
  plan: W5Plan;
  /** the expert seconds at which each flag stands (spawn first, the exit last) */
  flagSeconds: number[];
  gaps: Array<{ edge: number; far: number; double: boolean }>;
  /** the high roads: the step up (platform id) and the road (platform id), each over solid ground */
  highRoads: Array<{ step: number; road: number }>;
  /** enemy ids of the spiders */
  spiders: number[];
  /** the stumps (x, height, whether the second jump was taught by then) */
  stumps: Array<{ x: number; h: number; taught: boolean }>;
  /** where the second jump is taught (5-1) or reminded (5-2): the x of its line and of the gap's edge */
  doubleLesson?: { hint: number; edge: number };
}

export function buildW5Stage(config: LevelConfig, seed: number, plan: W5Plan): GeneratedStage & { proto: ProtoExtras; w5info: W5Info } {
  const R = stream(seed * 7 + (plan === '5-1' ? 501 : 502));
  const P: Platform[] = [];
  const V: Vine[] = [];
  const T: TreeStructure[] = [];
  const C: Collectible[] = [];
  const E: Enemy[] = [];
  const checkpoints: Array<{ x: number; y: number; reached: boolean }> = [];
  const hints: StageHint[] = [];
  const beats: Array<[number, number, string]> = [];
  const covers: LeafCover[] = [];
  const chairs: Chair[] = [];
  const tables: TeaTable[] = [];
  const cakes: Cake[] = [];
  const butlers: Butler[] = [];
  const threads: Thread[] = [];
  const carvings: Carving[] = [];
  const spiders: W5Spider[] = [];
  const decor: W5Decor[] = [];
  const info: W5Info = { plan, flagSeconds: [0], gaps: [], highRoads: [], spiders: [], stumps: [] };
  /** has the second jump been taught? (in 5-1, at its first wide gap; 5-2 comes after 5-1, and reminds at its first) */
  let doubleTaught = plan !== '5-1';
  let doubleSaid = false;
  let pid = 1, cid = 1, eid = 1;
  let expert = 0;
  const r = Math.round;

  // ----- the kit -----
  const bank = (x0: number, x1: number, y = G, style: Platform['style'] = 'log') => {
    const p: Platform = { id: pid++, x: r(x0), y: r(y), width: r(x1) - r(x0), height: BANK_H, type: 'solid', style };
    P.push(p);
    return p;
  };
  const branch = (x0: number, x1: number, y: number) => {
    const p: Platform = { id: pid++, x: r(x0), y: r(y), width: r(x1) - r(x0), height: 24, type: 'solid', style: 'branch' };
    P.push(p);
    return p;
  };
  const block = (x0: number, x1: number, h: number) => {
    const p: Platform = { id: pid++, x: r(x0), y: r(G - h), width: r(x1) - r(x0), height: r(h), type: 'solid', style: 'moss_stone' };
    P.push(p);
    return p;
  };
  /** a soft pit between two banks: a mossy floor walled down to it, and a low step at the far wall's foot (protoStage.ts softPit) */
  const softPit = (edge: number, far: number) => {
    const wallTop = G + BANK_H;
    const wallH = HOLLOW_Y - wallTop + 4;
    P.push({ id: pid++, x: r(edge - 60), y: wallTop, width: 60, height: wallH, type: 'solid', style: 'moss_stone' });
    P.push({ id: pid++, x: r(far), y: wallTop, width: 60, height: wallH, type: 'solid', style: 'moss_stone' });
    bank(edge - 60, far + 60, HOLLOW_Y, 'moss_stone');
    const sw = far - edge < 170 ? far - edge : 70;
    P.push({ id: pid++, x: r(far - sw), y: HOLLOW_Y - PIT_STEP, width: r(sw), height: PIT_STEP, type: 'solid', style: 'moss_stone' });
  };
  const flower = (x: number, y: number, v: Collectible['botanicalVariant'] = 'orchid') => {
    const c: Collectible = { id: cid++, type: 'flower', botanicalVariant: v, x: r(x), y: r(y), collected: false, bobPhase: (x * 0.031) % 6.28 };
    C.push(c);
    return c;
  };
  const row = (x0: number, x1: number, y: number, n: number, v: Collectible['botanicalVariant'] = 'orchid') => {
    for (let i = 0; i < n; i++) flower(x0 + ((x1 - x0) * i) / Math.max(1, n - 1), y, v);
  };
  const arc = (x0: number, x1: number, yTop: number, n: number, v: Collectible['botanicalVariant'] = 'hibiscus') => {
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      flower(x0 + (x1 - x0) * t, yTop + 60 * (1 - Math.sin(Math.PI * t)), v);
    }
  };
  const hint = (x: number, h: W5Hint) => hints.push({ x: r(x), text: h.old, pad: h.pad ?? h.old, keys: h.keys ?? h.old });
  /** a jumping spider on the ground the cursor is on, pacing [x0, x1]; `doze`: asleep until a thread hums or he walks into it */
  const spider = (sx: number, x0: number, x1: number, doze = false) => {
    const id = 500 + eid++;
    // (never pacing within reach of the flag behind it: a respawn is always a safe spot, levelCheck SAFE_APPROACH)
    x0 = Math.max(x0, lastFlag + SAFE_GAP);
    sx = Math.max(sx, x0 + 20);
    x1 = Math.max(x1, sx + 20);
    E.push({
      id, type: 'spider', x: r(sx), y: G - 12, vx: 0, vy: 0, width: 34, height: 22, hp: 1, maxHp: 1, facing: doze ? 1 : -1,
      patrolMinX: r(x0), patrolMaxX: r(x1), attackCooldown: 1.2, telegraphTimer: 0, isAttacking: false, animTimer: 0, hitFlashTimer: 0,
      defeated: false, koTimer: 0, behaviorTimer: 0, edgeMinX: r(x0), edgeMaxX: r(x1),
      // (on the ground, not hanging on a thread: drawn as the painted jumping spider, w5Creatures.ts and spiderSprite.ts)
      noThread: true,
    } as Enemy);
    spiders.push({ id, ...(doze ? { doze: true } : {}) });
    info.spiders.push(id);
  };
  const scenery = (n: string, x: number, w: number, o: Partial<W5Decor> = {}) => decor.push({ n, x: r(x), b: G, w: r(w), ...o });
  /** the garden's dressing along a stretch: flowering bushes and ferns behind the path */
  const garden = (x0: number, x1: number) => {
    for (let gx = x0 + R.r(40, 140); gx < x1 - 60; gx += R.r(170, 300)) {
      const k = R.f();
      scenery(k < 0.45 ? (R.chance(0.5) ? 'blossom' : 'blossom2') : 'fern', gx, k < 0.45 ? R.r(70, 110) : R.r(80, 120));
    }
  };

  // ----- the ground: `x` is the open end of the bank he is on (at G) -----
  let bankFrom = 0;
  let x = 0;
  const run = (len: number) => { x += r(len); };
  const close = () => {
    if (x - bankFrom > 1) bank(bankFrom, x);
  };
  const open = (at: number) => {
    bankFrom = r(at);
    x = r(at);
  };
  /** where the last flag (or the spawn) stands */
  let lastFlag = 140;
  const flag = () => {
    // a little more garden first if a spider's patch reaches too near where the flag would stand
    const reach = Math.max(-1e9, ...E.map((e) => e.patrolMaxX));
    if (x - 80 - reach < SAFE_GAP) {
      const add = SAFE_GAP - (x - 80 - reach);
      run(add);
      expert += add / RUN;
    }
    lastFlag = r(x - 80);
    checkpoints.push({ x: r(x - 80), y: G, reached: false });
    info.flagSeconds.push(expert);
  };
  const beat = (name: string, f: () => void) => {
    const x0 = x;
    f();
    beats.push([r(x0), r(x), name]);
  };

  // ----- the pieces (each starts and ends on open ground at G) -----
  /** a stretch of garden with petals along it */
  function rest(len: number, petals = true) {
    const x0 = x;
    run(len);
    if (petals && len > 260) row(x0 + 80, x - 80, G - 34, Math.max(2, r(len / 170)), R.pick(['orchid', 'hibiscus'] as const));
    garden(x0, x);
    expert += len / RUN;
  }
  /** a jump over a soft pit (two jumps' worth when `double`), petals in an arc over it */
  function gap(double = false) {
    const x0 = x;
    run(R.r(140, 220));
    const edge = x;
    if (double && !doubleSaid) {
      // the first gap only the second jump crosses: 5-1 teaches it here (the first place that needs it), 5-2 reminds
      doubleSaid = true;
      doubleTaught = true;
      const at = Math.min(x0 + 20, edge - GAP_TELL);
      hint(at, plan === '5-1' ? W5_HINTS.s51double : W5_HINTS.s52double);
      info.doubleLesson = { hint: r(at), edge: r(edge) };
    }
    const w = r(R.r(...(double ? GAP2 : GAP1)));
    // (never wider than the jump reaches, with room to spare: a real thumb makes every one)
    const far = edge + Math.min(w, r(reachJump(0, double) * (double ? 0.8 : 0.94)));
    close();
    softPit(edge, far);
    arc(edge + 10, far - 10, G - (double ? 170 : 128), double ? 4 : 3);
    info.gaps.push({ edge, far, double });
    open(far);
    run(R.r(140, 200));
    expert += (far - edge) / RUN + 0.35 + 280 / RUN;
  }
  /** stumps to hop: one jump high, or (taller) two */
  function stumps(n: number, tall = false) {
    // (nothing a second jump is needed for before it is taught)
    if (tall && !doubleTaught) throw new Error(`${plan}: tall stumps before the second jump is taught`);
    for (let i = 0; i < n; i++) {
      run(R.r(120, 180));
      const w = R.r(130, 190);
      const h = !doubleTaught
        ? info.stumps.length === 0 ? W5_PLAIN_STUMPS.first : R.pick(W5_PLAIN_STUMPS.steps)
        : tall && i % 2 === 1 ? R.r(...TALL_H) : R.r(...STUMP_H);
      info.stumps.push({ x: r(x), h: r(h), taught: doubleTaught });
      block(x, x + w, h);
      flower(x + w / 2, G - h - 34, 'hibiscus');
      run(w);
      expert += (w + 150) / RUN + 0.4;
    }
    run(R.r(100, 160));
  }
  /** a high road of branches over the path: a step up (the catch ledge under it), the road with its petals, and the ground below */
  function highRoad(len: number, extra?: (x0: number, x1: number, y: number) => void) {
    run(R.r(160, 220));
    const s0 = x;
    const step = branch(s0, s0 + 150, G - 92);
    const roadY = G - 92 - R.r(78, 90);
    const r0 = s0 + 110;
    const road = branch(r0, r0 + len, roadY);
    row(r0 + 60, r0 + len - 60, roadY - 34, Math.max(3, r(len / 120)), 'hibiscus');
    extra?.(r0, r0 + len, roadY);
    info.highRoads.push({ step: step.id, road: road.id });
    run(150 + len);
    expert += (150 + len) / RUN + 0.8;
    run(R.r(120, 180));
  }
  /** jumping spiders on a long stretch of garden, `n` of them, each pacing its own patch (awake: they crouch, then rush) */
  function spiderRun(n: number, len: number) {
    const x0 = x;
    run(len);
    const sp = (len - 200) / n;
    for (let i = 0; i < n; i++) {
      const sx = x0 + 160 + sp * (i + 0.6);
      spider(sx, Math.max(bankFrom + 30, sx - 220), Math.min(x - 30, sx + 220));
    }
    row(x0 + 80, x - 80, G - 34, Math.max(2, r(len / 200)), 'orchid');
    garden(x0, x);
    expert += len / RUN + 1.4 * n;
  }
  /** soft chairs along the path (they tug), with wrapped ones (the guests who sat) between */
  function chairWalk(n: number, wrapped: number) {
    const x0 = x;
    const live: number[] = [];
    for (let i = 0; i < n; i++) {
      run(R.r(300, 380));
      live.push(x);
      chairs.push({ x: r(x), y: G, face: i % 2 ? -1 : 1, color: i % 2 ? 'lilac' : 'pink' });
    }
    run(R.r(220, 280));
    // the guests who sat: wrapped chairs between the soft ones (and after the last), never on top of one
    const spots = [x0 + 90, ...live, x - 60];
    for (let k = 0; k < wrapped; k++) {
      const a = spots[k % (spots.length - 1)], b = spots[(k % (spots.length - 1)) + 1];
      chairs.push({ x: r((a + b) / 2 + (k >= spots.length - 1 ? 40 : 0)), y: G, face: k % 2 ? -1 : 1, wrapped: true });
    }
    row(x0 + 100, x - 100, G - 34, Math.max(2, r((x - x0) / 180)), 'hibiscus');
    expert += (x - x0) / RUN + 0.3 * n;
  }
  /** a humming thread strung low across the way (jump it), and `n` sleeping spiders beyond it, in the reach of its hum */
  function threadTrap(n: number, sleepers = true) {
    run(R.r(200, 260));
    const t0 = x;
    const tw = r(R.r(60, 90));
    threads.push({ x0: t0, x1: t0 + tw, y: G - 14 });
    // (the sleepers lie well inside the hum's reach, THREAD.alert from the thread's middle)
    run(tw + R.r(160, 220));
    const s0 = x;
    for (let i = 0; i < n; i++) {
      run(R.r(120, 170));
      if (sleepers) spider(x, s0 - 120, x + 240, true);
    }
    run(R.r(260, 320));
    row(s0 + 40, x - 80, G - 34, Math.max(2, n + 1), 'orchid');
    expert += (x - t0 + 220) / RUN + 0.5 + 0.35 * n;
  }
  /** tiny cakes floating among the petals on the path: they look like a treat (jump over them) */
  function cakeRow(n: number) {
    run(R.r(180, 240));
    const x0 = x;
    for (let i = 0; i < n; i++) {
      run(R.r(170, 230));
      cakes.push({ x: r(x), y: G - 34 });
      flower(x - 85, G - 34, 'orchid');
    }
    run(R.r(160, 220));
    flower(x - 60, G - 34, 'orchid');
    expert += (x - x0 + 200) / RUN + 0.3 * n;
  }
  /** the Butler, on the path facing the way Pokey comes, holding a cake out on his tray */
  function butler() {
    run(R.r(300, 360));
    butlers.push({ x: r(x), y: G, dir: -1 });
    run(R.r(280, 340));
    flower(x - 80, G - 34, 'hibiscus');
    expert += 640 / RUN + 1.2;
  }

  // ───────────────────────────── 5-1 The Loveliest Place ─────────────────────────────
  if (plan === '5-1') {
    beat('Start: the first tree', () => {
      hint(60, W5_HINTS.s51start);
      // the first tree of the sanctuary, and Meeca's warning cut into it on the move
      const tx = 700;
      // (the words at his eye level: the camera keeps the ground low in the view)
      carvings.push({ x: tx, y: G - 196, lines: ['POKEY.', 'DON\'T', 'SIT.', 'M.'], size: 32, trunk: { ground: G, w: 128, h: 470 } });
      hint(tx - 220, W5_HINTS.s51carving);
      // (room for the first lines to be said before the table's soft chairs tug: a player who runs from the first moment has the goal
      // card and the opening line before the chairs' tip can come; QA, 2026-10-26)
      rest(R.r(1950, 2100));
      flag();
    });
    beat('Learn: the table set for two', () => {
      rest(R.r(380, 460));
      run(R.r(320, 380));
      const tx = x;
      // (said before the chairs' own line: a chair's tip comes 480 px short of it, and the first chair stands 120 px short of the table)
      hint(tx - 700, W5_HINTS.s51table);
      tables.push({ x: tx, y: G, card: TABLE_CARD });
      chairs.push({ x: tx - 120, y: G, face: 1, color: 'pink' }, { x: tx + 120, y: G, face: -1, color: 'lilac' });
      scenery('doily', tx - 210, 46, { b: G - 2 });
      run(R.r(360, 420));
      expert += 2.5; // (the card, read in passing)
      rest(R.r(500, 600));
      flag();
    });
    beat('Develop: the open garden', () => {
      gap();
      rest(R.r(240, 300));
      stumps(2);
      spiderRun(1, R.r(900, 1000));
      gap();
      flag();
      // the second jump, taught at the first gap that needs it, with room after the flag for its line to be said on its own and read
      rest(R.r(450, 550));
      gap(true);
      hint(x + 60, W5_HINTS.s51petals);
      highRoad(R.r(560, 680));
      flag();
      spiderRun(2, R.r(1100, 1250));
      stumps(3, true);
      flag();
    });
    beat('Twist: the guests who sat', () => {
      hint(x + 80, W5_HINTS.s51guests);
      chairWalk(3, 4);
      gap();
      chairWalk(2, 2);
      spiderRun(2, R.r(1000, 1150));
      gap(true);
      flag();
    });
    beat('Finish', () => {
      let n = 0;
      while (expert < stageSeconds('5-1') - 12 && n < 30) {
        const k = n % 4;
        if (k === 0) {
          gap(R.chance(0.5));
          stumps(2, true);
        } else if (k === 1) {
          highRoad(R.r(480, 600));
          spiderRun(R.chance(0.5) ? 1 : 2, R.r(900, 1050));
        } else if (k === 2) {
          chairWalk(2, 2);
          gap(true);
        } else {
          spiderRun(2, R.r(1000, 1100));
          gap();
        }
        if (n % 2 === 1) flag();
        n++;
      }
      hint(x + 40, W5_HINTS.s51end);
      rest(R.r(700, 820));
      if (expert < stageSeconds('5-1')) rest((stageSeconds('5-1') - expert) * RUN + 60);
    });
  }

  // ───────────────────────────── 5-2 Don't Sit ─────────────────────────────
  if (plan === '5-2') {
    beat('Start: the rules', () => {
      hint(60, W5_HINTS.s52rules);
      carvings.push({ x: 380, y: G - 128, lines: ['DON\'T', 'SIT.'], size: 32, trunk: { ground: G, w: 112, h: 420 } });
      // (room for the rules to be said, and read, before the first sleeper or thread comes near: a player who runs from the first
      // moment has the goal card, then the rules, then their second half, before the sleeping spiders' line; QA, 2026-10-26)
      rest(R.r(1700, 1850));
      flag();
    });
    beat('Learn: the sleeping spiders, then the humming threads', () => {
      // the first sleeper lies on its own, to be hopped (it wakes only if he walks into it); Dot's line comes well before it
      rest(R.r(300, 360), false);
      hint(x, W5_HINTS.s52doze);
      run(R.r(900, 980));
      spider(x, x - 160, x + 200, true);
      run(R.r(300, 360));
      expert += 1300 / RUN;
      // then the first thread, alone (its line comes as it comes into view, w5Play.ts), and a thread with sleepers beyond it
      rest(R.r(240, 300), false);
      threadTrap(0, false);
      threadTrap(2);
      flag();
      gap();
      // (a breath after the landing: the thread is seen, and hopped, not landed on)
      rest(R.r(220, 280), false);
      threadTrap(1);
      rest(R.r(260, 320));
      flag();
    });
    beat('Develop: the cakes and the Butler', () => {
      // (each new thing with room before it: its line is said, and read, before he is at it, whatever was said just before; QA, 2026-10-26)
      rest(R.r(450, 550));
      cakeRow(2);
      gap();
      cakeRow(3);
      flag();
      rest(R.r(450, 550));
      butler();
      rest(R.r(300, 360));
      stumps(2);
      flag();
    });
    beat('Twist: the chairs and the note', () => {
      rest(R.r(400, 480));
      hint(x + 60, W5_HINTS.s52chair);
      chairWalk(2, 3);
      threadTrap(1);
      // Pell's blanket note, in plain sight: a pink bell on top of a stump beside the path
      const note = findForStage(config.worldIndex, config.miniIndex);
      run(R.r(200, 260));
      const sw = 170;
      block(x, x + sw, 70);
      if (note && note.kind === 'note') C.push({ id: cid++, type: 'find', findId: note.id, hidden: false, x: r(x + sw / 2), y: G - 70 - 26, collected: false, bobPhase: 0 });
      run(sw);
      expert += (sw + 230) / RUN + 0.5;
      chairWalk(2, 2);
      flag();
    });
    beat('Twist: all at once', () => {
      hint(x + 60, W5_HINTS.s52all);
      threadTrap(1);
      // (a breath past the sleeper before the wide gap: the second jump's reminder is said with no spider at hand)
      rest(R.r(450, 550));
      gap(true);
      highRoad(R.r(560, 660), (x0, x1, y) => {
        cakes.push({ x: r((x0 + x1) / 2), y: r(y - 34) });
      });
      threadTrap(2);
      butler();
      flag();
    });
    beat('Finish', () => {
      let n = 0;
      while (expert < stageSeconds('5-2') - 12 && n < 30) {
        const k = n % 4;
        if (k === 0) {
          threadTrap(R.chance(0.5) ? 1 : 2);
          gap(R.chance(0.5));
        } else if (k === 1) {
          cakeRow(R.chance(0.5) ? 2 : 3);
          chairWalk(2, 1);
        } else if (k === 2) {
          highRoad(R.r(480, 600), (x0, x1, y) => {
            if (R.chance(0.5)) cakes.push({ x: r((x0 + x1) / 2), y: r(y - 34) });
          });
          threadTrap(1);
        } else {
          butler();
          stumps(2, true);
        }
        if (n % 2 === 1) flag();
        n++;
      }
      hint(x + 40, W5_HINTS.s52end);
      rest(R.r(700, 820));
      if (expert < stageSeconds('5-2')) rest((stageSeconds('5-2') - expert) * RUN + 60);
    });
  }

  // the shrine, and nothing past it
  const exitX = r(x - 220);
  close();
  C.push({ id: cid++, type: 'exit_totem', x: exitX, y: G - 30, collected: false, bobPhase: 0 });
  const past = (px: number) => px > exitX + PAST_SHRINE;
  for (let i = C.length - 1; i >= 0; i--) if (past(C[i].x)) C.splice(i, 1);
  for (const list of [cakes, butlers, chairs, threads] as Array<Array<{ x?: number; x0?: number }>>) {
    for (let i = list.length - 1; i >= 0; i--) if (past(list[i].x ?? list[i].x0 ?? 0)) list.splice(i, 1);
  }
  info.flagSeconds.push(expert);

  const W = Math.ceil(x + 20);
  cid = heartsAtFlags(C, checkpoints, cid);
  const movedPickups = fixPickups({ platforms: P, vines: V, ropes: [] }, C);
  const cfg: LevelConfig = { ...config, levelWidth: W, levelHeight: Math.max(config.levelHeight, 900) };
  const w5: W5Extras = {
    mood: 'gold', petals: true, ...(plan === '5-1' ? { gentle: true } : {}),
    chairs, tables, cakes, butlers, threads, carvings, spiders, decor,
  };
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
    exitTotemY: G,
    checkpoints: checkpoints.sort((a, b) => a.x - b.x),
    zones: [],
    meta: { attempt: seed, chunks: [], width: W, timing: { layoutSeconds: expert, decorSeconds: 0, route: W } },
    proto: { hints: hints.sort((a, b) => a.x - b.x), covers, beats, movedPickups, w5 },
    w5info: info,
  };
}
