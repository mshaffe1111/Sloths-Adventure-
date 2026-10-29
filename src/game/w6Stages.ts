/**
 * 6-8 Stilt Climb — World 6's special stage, its one hand-built stage (the rest of World 6 is gen2's): the climb UP through the
 * mangrove's stilt roots, out of the swamp, toward the first sight of the ruins (World 7) at the top, while the dirty, fast tide comes
 * in under him (badWaterArt.ts, the water that costs a life in Worlds 6-10).
 *
 * BLOCKOUT (step 1, the mock-up for Matt): the sections in their order and rough sizes, in the real engine, so the screenshots show
 * the climb's shape upright and sideways. The rising tide is not wired into the engine yet (the shots set the water's height by hand);
 * the tide's rules, the teaching lines, the creatures' clearances and the tests come in step 2, once Matt has seen the mock-up.
 *
 * Bottom to top (up is negative y while building; shifted down at the end):
 *   1. START    the mudflat at low tide: a wide bank, a knee to hop, Dot's water line, the first stilt root. Nothing moves yet.
 *   2. LEARN    the tide turns once he is up the first root. Roots to climb and hop between, zig-zagging up; a flag.
 *   3. DEVELOP  lianas: ledge -> self-swinging liana -> a perch above, left and right, a root climb between.
 *   4. REST     slack water: a wide root shelf with a flag and a root arch to stand under; the tide holds.
 *   5. TWIST    the roots' animals: poison frogs on short root shelves (stomp), a tayra on a long one; roots and hops between.
 *   6. TWIST    spring tide: the water speeds up through a stack of lianas and roots, a flag on each perch.
 *   7. FINISH   the tallest root up through the canopy to the crown: the ruins on the skyline, the shrine.
 */
import { fixPickups } from './flowerReach.ts';
import { heartsAtFlags, stream, type ProtoExtras, type StageHint } from './protoStage.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import type { Collectible, Enemy, LevelConfig, Platform, TreeStructure, Vine } from './types.ts';
import { LIANA } from './gen2/types.ts';
import { lianaBand, VINE } from './gen2/pipeline.ts';

/** what the mock-up shots read back: each section's height range (world y, after the shift) */
export interface Stilt68 {
  sections: Array<{ name: string; top: number; bottom: number }>;
  /** where the water stands at the start (the mudflat's edge), and the top of the climb */
  lowWater: number;
  crown: number;
}

/**
 * World 6's frog and tayra as gen2's manifest has them (gen2/worlds/w6.ts W6_CREATURES; the stage's test checks they still match). Not
 * imported: w6.ts reads protoStage's ground height as it loads, and protoStage loads this file.
 */
export const STILT_CREATURES = {
  frog: { enemy: 'frog', w: 36, h: 24, hp: 1, footY: 14 },
  tayra: { enemy: 'tayra', w: 46, h: 24, hp: 1, footY: 15 },
} as const;

export function buildStiltClimb(config: LevelConfig, seed: number): GeneratedStage & { proto: ProtoExtras; stilt68: Stilt68 } {
  const R = stream(seed);
  const P: Platform[] = [];
  const V: Vine[] = [];
  const T: TreeStructure[] = [];
  const E: Enemy[] = [];
  const C: Collectible[] = [];
  const checkpoints: Array<{ x: number; y: number; reached: boolean }> = [];
  const hints: StageHint[] = [];
  const beats: Array<[number, number, string]> = [];
  const sections: Stilt68['sections'] = [];
  let pid = 1, vid = 1, tid = 1, cid = 1, eid = 1;
  const r = Math.round;
  const L = 120, Rt = 1800;

  const ledge = (x0: number, x1: number, y: number, h = 24): Platform => {
    const p: Platform = { id: pid++, x: r(x0), y: r(y), width: r(x1 - x0), height: h, type: 'solid', style: 'log' };
    P.push(p);
    return p;
  };
  const flower = (x: number, y: number, v: Collectible['botanicalVariant'] = 'orchid') =>
    C.push({ id: cid++, type: 'flower', botanicalVariant: v, x: r(x), y: r(y), collected: false, bobPhase: (x * 0.031) % 6.28 });
  /** a stilt root to climb, from `foot` up to `top` */
  const root = (x: number, foot: number, top: number) => {
    const tree: TreeStructure = { id: tid++, x: r(x), groundY: r(foot), topY: r(top) - 150, trunkWidth: 70, hasClimbVine: true, canopyRadius: 120 };
    T.push(tree);
    V.push({ id: vid++, x: r(x), topY: r(top) - 2, bottomY: r(foot) - 6, swaySpeed: 0.9, swayPhase: (x * 0.007) % 6.28, vineType: 'tree_climb', treeId: tree.id });
    for (let i = 1; i <= 2; i++) flower(x, foot - ((foot - top) * i) / 3, 'hibiscus');
  };
  const flag = (p: Platform) => checkpoints.push({ x: r(p.x + p.width / 2), y: p.y, reached: false });
  /** a line the first time he passes x on the ledge at `y` (only at about that height: a climb passes the same x many times) */
  const hint = (x: number, y: number, text: string) => hints.push({ x: r(x), text, pad: text, keys: text, aboveY: r(y + 10), belowY: r(y - 150) });
  const frog = (p: Platform, at: number) => {
    const c = STILT_CREATURES.frog;
    const x = p.x + p.width * at;
    E.push({ id: eid++, type: c.enemy, x: r(x), y: r(p.y - (c.footY ?? c.h / 2)), vx: 0, vy: 0, width: c.w, height: c.h, hp: c.hp, maxHp: c.hp, facing: -1, patrolMinX: r(x - 20), patrolMaxX: r(x + 20), attackCooldown: 1.2, telegraphTimer: 0, isAttacking: false, animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0 } as Enemy);
  };
  const tayra = (p: Platform) => {
    const c = STILT_CREATURES.tayra;
    E.push({ id: eid++, type: c.enemy, x: r(p.x + p.width / 2), y: r(p.y - (c.footY ?? c.h / 2)), vx: 0, vy: 0, width: c.w, height: c.h, hp: c.hp, maxHp: c.hp, facing: -1, patrolMinX: r(p.x + 130), patrolMaxX: r(p.x + p.width - 130), attackCooldown: 1.2, telegraphTimer: 0, isAttacking: false, animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0 } as Enemy);
  };

  // ----- the cursor: the ledge he is on, and which way the climb is heading -----
  let cur: Platform;
  let dir: 1 | -1 = 1;
  /** the open end of the ledge he is on, the way he is going */
  const edge = () => (dir > 0 ? cur.x + cur.width : cur.x);
  /** a stilt root at the far end of this ledge, up `h` to a shelf `w` wide that runs on the other way (the climb turns) */
  const rootUp = (h: number, w: number) => {
    const tx = edge() - dir * 50;
    const top = cur.y - h;
    root(tx, cur.y, top);
    dir = (dir * -1) as 1 | -1;
    const x0 = dir > 0 ? tx - 40 : tx + 40 - w;
    cur = ledge(Math.max(L, x0), Math.min(Rt, x0 + w), top);
  };
  /** a hop up `rise` over a `gap` to a ledge `w` wide */
  const hopUp = (gap: number, rise: number, w: number): void => {
    const x0 = dir > 0 ? edge() + gap : edge() - gap - w;
    // (at the column's side the climb turns back across the ledge and hops off its other end; a root up if there is no room there either)
    if (x0 < L || x0 + w > Rt) {
      dir = (dir * -1) as 1 | -1;
      const x1 = dir > 0 ? edge() + gap : edge() - gap - w;
      if (x1 < L || x1 + w > Rt) return rootUp(rise + 280, w + 100);
      cur = ledge(x1, x1 + w, cur.y - rise);
      flower(x1 + w / 2, cur.y - 60);
      return;
    }
    cur = ledge(x0, x0 + w, cur.y - rise);
    flower(x0 + w / 2, cur.y - 60);
  };
  /** a liana past this ledge's end, and the perch past it `raise` px higher (sized from the release window: gen2 lianaBand) */
  const liana = (raise = 80, w = 240): void => {
    const from = { x: 0, y: cur.y, w: cur.width };
    const top = cur.y - 410;
    const v = { x: cur.width + 175, topY: top, bottomY: Math.min(cur.y + 30, top + LIANA.len) };
    const band = lianaBand(from, v, { amp: VINE.amp, period: VINE.period.normal }, -raise, w, LIANA.window.normal) ?? [v.x + 260, v.x + 260];
    const near = (band[0] + band[1]) / 2;
    const vx = dir > 0 ? cur.x + v.x : cur.x + cur.width - v.x;
    const x0 = dir > 0 ? cur.x + near : cur.x + cur.width - near - w;
    // (no room the way he is going: a root up first, and the shelf at its top runs the other way)
    if (x0 < L || x0 + w > Rt) {
      rootUp(300, 300);
      return liana(raise, w);
    }
    V.push({ id: vid++, x: r(vx), topY: r(v.topY), bottomY: r(v.bottomY), swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true });
    cur = ledge(x0, x0 + w, cur.y - raise);
    flower(vx, top + 300, 'hibiscus');
  };
  const section = (name: string, f: () => void) => {
    const y0 = cur.y;
    const n0 = P.length;
    f();
    const made = P.slice(n0);
    sections.push({ name, bottom: y0, top: Math.min(y0, ...made.map((p) => p.y)) });
    beats.push([Math.min(...made.map((p) => p.x)), Math.max(...made.map((p) => p.x + p.width)), name]);
  };

  // 1. START: the mudflat at low tide
  const flat = ledge(L, 1100, 0, 90);
  cur = flat;
  ledge(560, 680, -40, 90); // a root knee to hop
  flower(620, -100);
  hint(300, 0, "Careful! That water's dirty and fast."); // (Dot's World 6 water line)
  hint(800, 0, "The tide's coming in. Climb!"); // (new, needs Matt's approval)
  sections.push({ name: 'Start: the mudflat at low tide', top: -40, bottom: 0 });
  // 2. LEARN: roots and hops, zig-zag up (the column is 120..1800: each liana runs from one side toward the other)
  section('Learn: roots to climb, the tide turns', () => {
    rootUp(380, 420);
    hopUp(150, 60, 260);
    rootUp(360, 380);
    hopUp(160, 60, 300);
    hopUp(150, 60, 300);
    rootUp(340, 420);
    flag(cur);
  });
  // 3. DEVELOP: lianas up
  section('Develop: lianas up', () => {
    hint(cur.x + cur.width / 2, cur.y, 'Wait for the swing. Let go at the top.'); // (new, needs Matt's approval)
    liana();
    rootUp(420, 300); // (two lianas stacked keep their heights apart, or their swings shrink to nothing: physics.ts swingSetup)
    liana(80, 260);
    rootUp(300, 520);
    flag(cur);
    hopUp(150, 60, 280);
    rootUp(380, 300);
    liana(80, 260);
    rootUp(360, 420);
  });
  // 4. REST: slack water
  section('Rest: slack water', () => {
    flag(cur);
    hint(cur.x + cur.width / 2, cur.y, 'The tide stops at the roots. Breathe.'); // (new, needs Matt's approval)
    rootUp(360, 420);
  });
  // 5. TWIST: the roots' animals
  section("Twist: the roots' animals", () => {
    hopUp(150, 60, 280);
    frog(cur, 0.6);
    rootUp(340, 380);
    hopUp(150, 60, 520);
    tayra(cur);
    rootUp(320, 360);
    flag(cur);
    hopUp(150, 60, 300);
    hopUp(150, 60, 300);
    frog(cur, 0.6);
    rootUp(360, 420);
    hopUp(150, 60, 520);
    tayra(cur);
    rootUp(340, 380);
  });
  // 6. TWIST: spring tide, lianas and roots
  section('Twist: spring tide', () => {
    flag(cur);
    hint(cur.x + cur.width / 2, cur.y, 'Spring tide! Keep moving.'); // (new, needs Matt's approval)
    liana(80, 240);
    rootUp(420, 300);
    liana(80, 240);
    flag(cur);
    rootUp(420, 300);
    liana(80, 240);
    rootUp(420, 300);
    liana(80, 240);
    flag(cur);
    rootUp(320, 320);
    hopUp(150, 60, 280);
    frog(cur, 0.65);
    rootUp(320, 420);
  });
  // 7. FINISH: the tallest root, up through the canopy to the crown
  section('Finish: the crown and the ruins', () => {
    flag(cur);
    rootUp(560, 900);
  });
  const crown = cur;
  void R;

  // shift: the crown 600 px under the top of the stage (room for the sky and the skyline over it)
  const shift = 600 - Math.min(...P.map((p) => p.y));
  for (const p of P) p.y += shift;
  for (const v of V) { v.topY += shift; v.bottomY += shift; }
  for (const t of T) { t.groundY += shift; t.topY += shift; }
  for (const c of C) c.y += shift;
  for (const e of E) e.y += shift;
  for (const cp of checkpoints) cp.y += shift;
  for (const h of hints) {
    if (h.aboveY !== undefined) h.aboveY += shift;
    if (h.belowY !== undefined) h.belowY += shift;
  }
  for (const s of sections) { s.top += shift; s.bottom += shift; }
  const floorY = flat.y;
  const H = floorY + 500;
  const W = Rt + 120;
  const exitX = r(crown.x + crown.width / 2 + 200);
  C.push({ id: cid++, type: 'exit_totem', x: exitX, y: crown.y - 30, collected: false, bobPhase: 0 });
  cid = heartsAtFlags(C, checkpoints, cid);
  const movedPickups = fixPickups({ platforms: P, vines: V, ropes: [] }, C);
  return {
    config: { ...config, levelWidth: W, levelHeight: H },
    trees: T,
    platforms: P,
    vines: V,
    ropes: [],
    enemies: E,
    boss: null,
    collectibles: C,
    spawnX: 220,
    spawnY: floorY,
    exitTotemX: exitX,
    exitTotemY: crown.y,
    checkpoints,
    waterY: floorY + 60,
    meta: { attempt: seed, chunks: [], width: W },
    proto: { hints, covers: [], beats, movedPickups },
    stilt68: { sections, lowWater: floorY + 60, crown: crown.y },
  };
}
