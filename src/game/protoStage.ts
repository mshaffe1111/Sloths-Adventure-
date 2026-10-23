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
 * Every number was checked against the shared physics (physics.ts): the walls and gaps that must need the log or the lianas
 * are beyond a double jump, and the ones that must be easy are well inside it (see protoStage.test.ts).
 */
import type { GeneratedStage } from './stageGenerator.ts';
import type { Collectible, Enemy, LevelConfig, Platform, TreeStructure, Vine } from './types.ts';

export const PROTO_STAGE_ID = '1-6';
const KEY = 'sloth_proto_16';

/** the hand-built 1-6 is played instead of the generated one (saved on the device; ?proto=1 also turns it on) */
export function protoStageEnabled(): boolean {
  try {
    if (typeof location !== 'undefined' && /[?&]proto=1\b/.test(location.search)) return true;
    return typeof localStorage !== 'undefined' && localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}
export function setProtoStagePref(on: boolean) {
  try {
    if (on) localStorage.setItem(KEY, '1');
    else localStorage.removeItem(KEY);
  } catch {
    /* ignore */
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
export interface StageHint { x: number; text: string; pad: string; keys: string; shown?: boolean; /** only when Pokey is this low or lower (fell to the floor) */ belowY?: number }
/** leaves drawn in front of a hidden nook; they part when Pokey comes close */
export interface LeafCover { x: number; y: number; w: number; h: number }

export interface ProtoExtras {
  hints: StageHint[];
  covers: LeafCover[];
  /** the beats, for the blueprint and the tests: [x0, x1, name] */
  beats: Array<[number, number, string]>;
}

export function buildProtoStage(config: LevelConfig): GeneratedStage & { proto: ProtoExtras } {
  const P: Platform[] = [];
  const V: Vine[] = [];
  const T: TreeStructure[] = [];
  const E: Enemy[] = [];
  const C: Collectible[] = [];
  let pid = 1, vid = 1, tid = 1, eid = 1, cid = 1;

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
  const block = (x0: number, x1: number, h: number, extra: Partial<Platform> = {}) => {
    const p: Platform = { id: pid++, x: x0, y: G - h, width: x1 - x0, height: h, type: 'solid', style: 'moss_stone', ...extra };
    P.push(p);
    return p;
  };
  const liana = (x: number, topY: number, bottomY = topY + 340) => {
    V.push({ id: vid++, x, topY, bottomY, swaySpeed: 1.1, swayPhase: (x * 0.013) % 6.28, vineType: 'swing_liana', isSwingingVine: true });
  };
  /** a kapok trunk you climb from the ground at `groundY` up to a perch at `perchY` */
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
  /** flowers along the swing from one point to the next: they show the path */
  const arc = (x0: number, x1: number, yTop: number, n: number, v: Collectible['botanicalVariant'] = 'hibiscus') => {
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      flower(x0 + (x1 - x0) * t, yTop + 70 * (1 - Math.sin(Math.PI * t)), v);
    }
  };
  const snake = (x: number, surface: number, range = 90) => {
    E.push({
      id: eid++, type: 'snake', x, y: surface - 14, vx: 28, vy: 0, width: 38, height: 22, hp: 1, maxHp: 1, facing: 1,
      patrolMinX: x - range / 2, patrolMaxX: x + range / 2, attackCooldown: 2, telegraphTimer: 0, isAttacking: false,
      animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0,
    } as Enemy);
  };
  const seed = (x: number, y: number, n: number) => C.push({ id: cid++, type: 'seed', x, y, collected: false, bobPhase: n, findId: `seed-${n}` });

  // ---------- 0. the start: a calm stretch of forest floor ----------
  bank(0, 1000);
  row(380, 860, G - 34, 5, 'orchid');

  // ---------- 1. LEARN: swing hollows with a soft floor ----------
  // hollow 1: one liana. Missing it drops you onto moss (a hop gets you out), not into the water.
  bank(1000, 1360, 710, 'moss_stone');
  liana(1150, G - 310, G + 30);
  arc(1010, 1350, G - 150, 5);
  bank(1360, 2000);
  row(1560, 1880, G - 34, 4, 'orchid');
  // hollow 2: two lianas in a row, still over the soft floor. The first chain.
  bank(2000, 2780, 710, 'moss_stone');
  liana(2220, G - 310, G + 30);
  liana(2540, G - 310, G + 30);
  arc(2010, 2380, G - 150, 5);
  arc(2380, 2770, G - 150, 5);
  bank(2780, 3300);

  // ---------- 2. DEVELOP: the gorge, then the tree and the liana only its top can reach ----------
  // three lianas over real water, at three different heights
  liana(3530, 270);
  liana(3860, 240);
  liana(4170, 280);
  arc(3310, 3700, G - 160, 5);
  arc(3700, 4020, G - 200, 5);
  arc(4020, 4390, G - 150, 5);
  bank(4400, 5100);
  // the kapok: climb it, walk out on the branch at the top, leap for the high liana (out of reach from the ground)
  trunk(4900, G, 300);
  branch(4860, 5060, 300);
  for (let i = 0; i < 4; i++) flower(4900, G - 70 - i * 60, 'hibiscus');
  liana(5240, 120, 350);
  arc(5060, 5560, 200, 6);

  // ---------- 3. PUZZLE: the fallen kapok ----------
  const yard = bank(5560, 7000);
  // a low rock the log stops against (Pokey hops it easily)
  const rock = block(5760, 5850, 50);
  // the hollow log, pushed by walking into it
  const log: Platform = {
    id: pid++, x: 6300, y: G - LOG.h, width: LOG.w, height: LOG.h, type: 'solid', style: 'log',
    // it stops a step short of the wall (a root at the wall's foot), so Pokey can always get behind it and push it back
    push: { min: rock.x + rock.width, max: 6945 },
  };
  P.push(log);
  // the high canopy: a wall 230 px tall (a double jump tops out near 175, plus 26 for catching the lip)
  bank(7000, 7800, G - 230);
  row(7080, 7720, G - 264, 6, 'orchid');
  // secret 1: the nook on the low branch, above where the log stops against the rock
  branch(5790, 5960, 325);
  seed(5875, 292, 1);
  row(6420, 6900, G - 34, 4, 'orchid');

  // ---------- 4. TWIST: the canopy road ----------
  // the forest floor far below is safe: a fall walks you to a trunk that climbs back up
  bank(7800, 10900);
  branch(7840, 8150, 360);
  // the long branch that creaks and snaps under him
  // (it joins the branch before it, so he walks onto it rather than jumping, and is standing on it when it goes)
  branch(8160, 8700, 360, 'fragile', { crumbleAfter: 0.55 });
  // two lianas hang just below it: they catch him when it goes
  liana(8420, 200, 560);
  liana(8620, 200, 560);
  branch(8780, 9350, 400);
  trunk(9250, G, 400);
  for (let i = 0; i < 3; i++) flower(9250, G - 70 - i * 55, 'hibiscus');
  snake(9060, 400, 120);
  branch(9450, 9800, 340);
  row(9500, 9760, 306, 3, 'hibiscus');
  // secret 2: out over the floor, 480 px from the last branch: a double jump falls 140 px short, the Leaf Glide makes it
  // with plenty to spare, and from the floor it is 210 px up (out of reach)
  branch(10280, 10400, 370);
  seed(10340, 336, 2);
  row(8000, 8100, 326, 2, 'hibiscus');

  // ---------- 5. FINISH: four lianas home ----------
  liana(11120, 270);
  liana(11460, 230, 570);
  liana(11800, 260);
  liana(12140, 220, 560);
  arc(10900, 11290, G - 170, 5);
  arc(11290, 11630, G - 220, 5);
  arc(11630, 11970, G - 180, 5);
  arc(11970, 12390, G - 230, 6);
  bank(12400, 13500, G - 60);
  row(12780, 13000, G - 94, 3, 'orchid');

  const exitX = 13240;
  // the Exit Shrine itself (the door the stage ends at)
  C.push({ id: cid++, type: 'exit_totem', x: exitX, y: G - 60 - 30, collected: false, bobPhase: 0 });
  const cfg: LevelConfig = { ...config, levelWidth: 13500, levelHeight: Math.max(config.levelHeight, 900) };

  // written for a thumb on the glass first (the game is a phone and tablet game); the pad and keyboard wording follow it
  const hints: StageHint[] = [
    { x: 950, text: 'Flick up into the vine to grab it', pad: 'Jump into the vine to grab it', keys: 'Jump into the vine to grab it' },
    { x: 2100, text: 'Flick up again as you swing forward', pad: 'Press Jump as you swing forward', keys: 'Press Space as you swing forward' },
    { x: 4560, text: 'That vine is too high. Climb the tree!', pad: 'That vine is too high. Climb the tree!', keys: 'That vine is too high. Climb the tree!' },
    { x: 4700, text: 'Flick up beside the trunk, keep your thumb up', pad: 'Jump at the trunk, hold Pad up', keys: 'Jump at the trunk, hold W or up' },
    { x: 6100, text: 'Keep sliding into the log to push it', pad: 'Hold the pad into the log to push it', keys: 'Hold left or right into the log to push it' },
    { x: 7900, text: 'The canopy road', pad: 'The canopy road', keys: 'The canopy road' },
    { x: 8500, belowY: 520, text: 'Fell? Climb the next tree back up', pad: 'Fell? Climb the next tree back up', keys: 'Fell? Climb the next tree back up' },
    { x: 9820, text: 'Something shiny, far away...', pad: 'Something shiny, far away...', keys: 'Something shiny, far away...' },
  ];

  const stage: GeneratedStage & { proto: ProtoExtras } = {
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
    exitTotemY: G - 60,
    checkpoints: [
      { x: 3100, y: G, reached: false },
      { x: 5680, y: G, reached: false },
      { x: 7140, y: G - 230, reached: false },
      { x: 10760, y: G, reached: false },
    ],
    waterY: WATER,
    meta: { attempt: 0, chunks: ['proto'], width: 13500 },
    proto: {
      hints,
      covers: [{ x: 5760, y: 250, w: 230, h: 110 }],
      beats: [
        [0, 1000, 'Start'],
        [1000, 3300, 'Learn: swing over soft moss'],
        [3300, 5560, 'Develop: the gorge and the tall kapok'],
        [5560, 7800, 'Puzzle: the fallen log'],
        [7800, 10900, 'Twist: the canopy road'],
        [10900, 13500, 'Finish: four lianas home'],
      ],
    },
  };
  void yard;
  return stage;
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
