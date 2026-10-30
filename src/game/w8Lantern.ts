/**
 * 8-4 Lantern Run — World 8's special stage (Matt's pick, 2026-10-29 4:58 PM ET: "the Firefly Lantern Run"; specials must not just climb
 * up high). Pokey hurries sideways through the night canopy carrying a jar of fireflies (lantern.ts): its light shrinks as he goes, every
 * glowing flower fills it again, and the dark beyond it is slow and unsafe to move through. Refill timing is the tension.
 *
 * Left to right, about 2:20 for a quick player:
 *   1. START    a moonlit bough; the jar half full and a glowing flower just ahead: he fills it before anything can go wrong (shown,
 *               then Dot's line). Nothing moves, nothing falls.
 *   2. LEARN    boughs and hops between flowers about 7-8 s apart (a quick player); the jar runs low between them (Dot, once).
 *   3. DEVELOP  lianas and a trunk to climb, a flower on every perch past a liana.
 *   4. REST     the moon glade: a wide bough, the great flower, a flag.
 *   5. TWIST    moths: the first one met in a flower's light (Dot's line), then moths in the dark stretches.
 *   6. TWIST    the long dark: flowers further apart (about 10 s), lianas and moths: hurry.
 *   7. FINISH   the firefly tree: he opens the jar, the fireflies rise into the tree and light the whole canopy; the shrine.
 *
 * Falls (World 8's rule, the lantern deciding what is lit: lantern.ts takeoff): under every gap is the long drop to the canopy floor. On
 * Normal a fall costs a life when the far side was lit as he left the bough; from an unlit take-off (the jar too dim to show the far
 * side, no flower near) it is soft, back on the bough. Easy's are all soft. Nothing crumbles; straight up a trunk always climbs.
 */
import { fixPickups } from './flowerReach.ts';
import { heartsAtFlags, stream, type ProtoExtras, type StageHint } from './protoStage.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import type { Collectible, LevelConfig, Platform, TreeStructure, Vine } from './types.ts';
import type { Zone } from './zones.ts';
import { LIANA } from './gen2/types.ts';
import { jumpLinkGap, lianaBand, VINE } from './gen2/pipeline.ts';
import type { GlowFlower, LanternGap, LanternPlan, MothSpot } from './lantern.ts';

export const LANTERN_STAGE_ID = '8-4';

/** the boughs' resting height (world y) and the stage's floor far below (a fall past it is the long drop) */
export const LANTERN_G = 1060;
export const LANTERN_H = 1800;

/**
 * the night outside the jar's ring (the lead's review of the mock-up: near black broke the lighting rule): a deep moonlit blue, not
 * black, over the scene at most `alpha`, so the boughs, trunks and the canopy edge still read as faint cool shapes and the next bough
 * is never a black void; the jar shows the colour and the detail, the moon only the shape (zoneArt.ts drawDarkness)
 */
export const LANTERN_NIGHT = { ink: 'rgb(8, 16, 44)', alpha: 0.74 } as const;
/** the firefly tree as drawn (w8LanternRun.ts): its height over its foot, and the middle of its crown over its foot (world px) */
export const TREE_H = 700;
export const TREE_CROWN = 520;
/** how far in front of the bough it leads up to a trunk's vine stands (px): his half width and a little (gen2-w8 CLIMB_CLEAR) */
const CLIMB_CLEAR = 26;
/** upright, his feet this far down the view (the plain framing's 0.55 left the bottom half an empty drop) */
export const LANTERN_VIEW = { uprightFeetAt: 0.7 } as const;

/** the lines (new, the lead approves them: LEAD-PLAYBOOK "Dot and in-stage lines"); Dot is back with Pokey in World 8 */
export const LANTERN_LINES = {
  /** at the start, the jar half full and the first flower ahead */
  start: 'Your jar is fading. That flower glows!',
  /** the first time it runs low */
  low: "The jar's nearly out. Find a flower!",
  /** after the dark first closes in (the setback) */
  setback: 'Too dark. Back to the last flower.',
  /** the first moth, in the flower's light */
  moths: 'Moths! They want your light.',
  /** the first lit drop on Normal (World 8's line) */
  drop: "Careful! It's a long way down.",
  /** the firefly tree */
  swarm: 'Let them go, Pokey. Look up!',
} as const;

/** what the tests read back */
export interface Lantern84 {
  sections: Array<{ name: string; x0: number; x1: number }>;
  /** each liana: its vine id, the bough it is swung from and the perch it lands on (platform ids) */
  lianas: Array<{ vine: number; from: number; to: number }>;
  /** the way, bough by bough, with the quick player's seconds on arriving at each */
  route: Array<{ id: number; t: number; by: 'start' | 'hop' | 'liana' | 'climb' }>;
  /** the quick player's seconds the build reckons (running 285 px/s, a hop 0.3 s, a liana half a swing and a wait, climbing 220 px/s) */
  expert: number;
  /** the quick player's seconds on reaching each flower (the jar's gaps: lantern.test.ts) */
  flowerT: number[];
  plan: LanternPlan;
}

export function buildLanternRun(config: LevelConfig, seed: number): GeneratedStage & { proto: ProtoExtras; lantern84: Lantern84 } {
  const R = stream(seed);
  const P: Platform[] = [];
  const V: Vine[] = [];
  const T: TreeStructure[] = [];
  const C: Collectible[] = [];
  const checkpoints: Array<{ x: number; y: number; reached: boolean }> = [];
  const hints: StageHint[] = [];
  const beats: Array<[number, number, string]> = [];
  const sections: Lantern84['sections'] = [];
  const lianas: Lantern84['lianas'] = [];
  const route: Lantern84['route'] = [];
  const flowers: GlowFlower[] = [];
  const moths: MothSpot[] = [];
  const gaps: LanternGap[] = [];
  /** the quick player's seconds on reaching each flower */
  const flowerT: number[] = [];
  let pid = 1, vid = 1, tid = 1, cid = 1, fid = 1, mid = 1;
  let expert = 0;
  const RUN = 285, CLIMB = 220;
  const r = Math.round;
  const j = (a: number, b: number) => r(R.r(a, b));

  const bough = (x0: number, x1: number, y: number): Platform => {
    const p: Platform = { id: pid++, x: r(x0), y: r(y), width: r(x1 - x0), height: r(LANTERN_H + 200 - y), type: 'solid', style: 'log' };
    P.push(p);
    return p;
  };
  const petal = (x: number, y: number) =>
    C.push({ id: cid++, type: 'flower', botanicalVariant: 'orchid', x: r(x), y: r(y), collected: false, bobPhase: (x * 0.031) % 6.28 });
  const hint = (x: number, text: string, passX?: number) => hints.push({ x: r(x), text, pad: text, keys: text, ...(passX !== undefined ? { passX: r(passX) } : {}) });

  let cur: Platform;
  const end = () => cur.x + cur.width;
  const arrive = (by: Lantern84['route'][number]['by']) => route.push({ id: cur.id, t: expert, by });
  /** run the bough he is on (its whole width) */
  const runOn = () => { expert += cur.width / RUN; };
  /** a glowing flower `at` (0..1) along the bough he is on */
  const flower = (at: number, big = false) => {
    const f: GlowFlower = { id: fid++, x: r(cur.x + 50 + (cur.width - 100) * at), y: cur.y, r: big ? 300 : 190, ...(big ? { big: true } : {}) };
    flowers.push(f);
    flowerT.push(expert + (f.x - cur.x) / RUN);
    return f;
  };
  /** a moth resting in the dark over the bough he is on, `at` along it */
  const moth = (at: number) => moths.push({ id: mid++, x: r(cur.x + cur.width * at), y: r(cur.y - j(120, 170)) });
  const flag = (at = 0.5) => checkpoints.push({ x: r(cur.x + cur.width * at), y: cur.y, reached: false });
  /** a hop over `gap` to a bough `dy` lower (negative: up) and `w` wide; a petal in its arc shows the way */
  const hop = (gap: number, dy: number, w: number, soft = false) => {
    runOn();
    // (the way drifts back toward the boughs' resting height after a climb or a liana: a hurry sideways, never a climb up high)
    dy = Math.max(-60, Math.min(140, dy + r((LANTERN_G - cur.y) * 0.45)));
    // (a hop up is a shorter hop: the first-timer's short flicks fell short of 170 px rising 50)
    if (dy < -20) gap = Math.min(gap, 130);
    expert += 0.3;
    const from = end();
    const y0 = cur.y;
    cur = bough(from + gap, from + gap + w, y0 + dy);
    gaps.push({ x0: from, x1: cur.x, y0, y1: cur.y, ...(soft ? { soft: true } : {}) });
    petal(from + gap / 2, Math.min(y0, cur.y) - 80);
    arrive('hop');
  };
  /**
   * a liana past this bough's end and the perch past it `raise` px higher: the perch's near end where a let-go lands within the engine's
   * release window on both settings (gen2 lianaBand: Normal 167 ms, Easy 300 ms), and past every jump and glide from the bough
   * (jumpLinkGap), so the swing is the only way on
   */
  const liana = (raise: number, w: number) => {
    runOn();
    const from = { x: 0, y: 0, w: cur.width };
    const v = { x: cur.width + j(165, 185), topY: -410, bottomY: 0 };
    const min = cur.width + jumpLinkGap(raise, config.worldIndex, config.miniIndex) + 20;
    const nb = lianaBand(from, v, { amp: VINE.amp, period: VINE.period.normal }, -raise, w, LIANA.window.normal, min, 'normal');
    const eb = lianaBand(from, v, { amp: VINE.amp, period: VINE.period.easy }, -raise, w, LIANA.window.easy, min, 'easy');
    const lo = Math.max(nb?.[0] ?? Infinity, eb?.[0] ?? Infinity);
    const hi = Math.min(nb?.[1] ?? -Infinity, eb?.[1] ?? -Infinity);
    if (!(lo <= hi)) throw new Error(`8-4: no perch past a liana keeps both release windows (raise ${raise}, width ${w})`);
    const near = lo + (hi - lo) * R.r(0.3, 0.7);
    const vx = cur.x + v.x;
    const vine: Vine = { id: vid++, x: r(vx), topY: r(cur.y + v.topY), bottomY: r(cur.y + v.bottomY), swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true };
    V.push(vine);
    const fromId = cur.id;
    const y0 = cur.y, x0 = end();
    expert += (VINE.period.normal - LIANA.window.normal) / 2 + VINE.period.normal / 2;
    cur = bough(cur.x + near, cur.x + near + w, cur.y - raise);
    // (a missed let-go is soft: back on the bough it swings from. The first-timer lost most of its Normal lives at lianas, as 6-8's did
    // before its catches; the retry still costs the jar's light)
    gaps.push({ x0, x1: cur.x, y0, y1: cur.y, soft: true });
    lianas.push({ vine: vine.id, from: fromId, to: cur.id });
    // (a petal in the leap off the liana, on the way to the perch: Meeca's petals mark the way, never filler)
    petal((vx + cur.x) / 2, cur.y - 110);
    arrive('liana');
  };
  /** a trunk at this bough's end, up `h` to a bough `w` wide running on (too high to jump: the trunk is the way) */
  const climb = (h: number, w: number) => {
    runOn();
    // (the trunk stands CLIMB_CLEAR in front of the bough it leads up to, whose face is the wall: gen2-w8's lesson, a vine hung inside
    // the bough snapped him into it)
    const tx = end() - 40;
    const top = cur.y - h;
    cur.width = r(tx + CLIMB_CLEAR - cur.x);
    const tree: TreeStructure = { id: tid++, x: r(tx), groundY: r(cur.y), topY: r(top) - 150, trunkWidth: 70, hasClimbVine: true, canopyRadius: 120 };
    // (the bough he climbs from ends at the trunk: the way on is up it)
    T.push(tree);
    V.push({ id: vid++, x: r(tx), topY: r(top) - 2, bottomY: r(cur.y) - 6, swaySpeed: 0.9, swayPhase: (tx * 0.007) % 6.28, vineType: 'tree_climb', treeId: tree.id });
    expert += h / CLIMB + 0.6;
    // (and one partway up the trunk: the way on is up)
    petal(tx, cur.y - h * 0.55);
    cur = bough(tx + CLIMB_CLEAR, tx + CLIMB_CLEAR + w, top);
    arrive('climb');
  };
  const section = (name: string, f: () => void) => {
    const n0 = P.length;
    const x0 = cur.x;
    f();
    const x1 = Math.max(...P.slice(n0).map((p) => p.x + p.width), end());
    sections.push({ name, x0, x1 });
    beats.push([x0, x1, name]);
  };

  // 1. START: the moonlit bough. The jar starts half full (w8LanternRun.ts) and the first flower is just ahead
  const G = LANTERN_G;
  cur = bough(0, 1500, G);
  arrive('start');
  flower(0.3);
  hint(260, LANTERN_LINES.start);
  sections.push({ name: 'Start: the moonlit bough', x0: 0, x1: 1500 });
  beats.push([0, 1500, 'Start: the moonlit bough']);

  // 2. LEARN: hops between flowers about 8 s apart (a quick player)
  section('Learn: flower to flower', () => {
    // (the first three hops are soft whatever the jar shows, and short: the stage's first jumps are learned, never a life)
    hop(j(120, 140), j(-20, 20), j(420, 520), true);
    hop(j(130, 150), j(-20, 30), j(380, 460), true);
    hop(j(130, 150), j(-30, 0), 560, true);
    flower(0.6);
    // (Dot's drop line on the far end of this bough, about 10 s after her first; the first flag waits for the next flower, so her
    // lines keep their gaps: STAGE-RULES §1)
    hint(end() - 200, LANTERN_LINES.drop, end());
    hop(j(150, 175), j(0, 50), j(360, 440));
    hop(j(170, 195), j(-50, -20), j(380, 460));
    hop(j(150, 180), j(0, 40), j(360, 440));
    hop(j(160, 185), j(-30, 20), 520);
    flower(0.5);
    flag(0.3);
    hop(j(160, 185), j(0, 40), j(380, 440));
    hop(j(150, 175), j(-40, 0), j(400, 460));
    climb(j(330, 360), 480);
    hop(j(160, 185), j(20, 60), j(380, 440));
    hop(j(160, 190), j(0, 40), 480);
    flower(0.55);
    flag(0.25);
  });

  // 3. DEVELOP: lianas and a trunk, a flower past each liana
  section('Develop: lianas and a trunk', () => {
    hop(j(150, 175), j(0, 40), 380);
    liana(80, 300);
    flower(0.6);
    hop(j(160, 185), j(10, 50), 420);
    hop(j(150, 180), j(0, 40), 380);
    climb(j(330, 360), 520);
    hop(j(160, 190), j(0, 40), 380);
    liana(80, 300);
    flower(0.55);
    flag(0.2);
    hop(j(150, 175), j(20, 60), 400);
    liana(80, 300);
    hop(j(160, 185), j(20, 60), 440);
    liana(80, 300);
    flower(0.6);
    hop(j(160, 185), j(0, 40), 400);
    hop(j(150, 180), j(-40, 0), 420);
  });

  // 4. REST: the moon glade
  section('Rest: the moon glade', () => {
    hop(j(160, 185), j(0, 30), 900);
    flower(0.5, true);
    flag(0.3);
  });

  // 5. TWIST: moths. The first sits in the glade's flower light, so he meets it lit
  section('Twist: the moths', () => {
    moth(0.8);
    hint(cur.x + cur.width * 0.55, LANTERN_LINES.moths, cur.x + cur.width);
    hop(j(160, 190), j(0, 40), j(420, 480));
    hop(j(150, 175), j(-40, 0), 520);
    moth(0.6);
    hop(j(170, 195), j(0, 50), j(380, 440));
    flower(0.6);
    hop(j(160, 185), j(-50, -20), 460);
    moth(0.5);
    liana(80, 300);
    hop(j(150, 175), j(0, 40), 480);
    moth(0.7);
    flower(0.5);
    flag(0.2);
    hop(j(160, 190), j(0, 40), 440);
    climb(j(330, 360), 520);
    moth(0.6);
    hop(j(160, 185), j(0, 40), 420);
    hop(j(150, 180), j(-30, 10), 460);
    flower(0.5);
  });

  // 6. TWIST: the long dark: flowers further apart, lianas and moths
  section('Twist: the long dark', () => {
    hop(j(170, 195), j(0, 40), 460);
    liana(80, 300);
    flower(0.7);
    hop(j(160, 190), j(0, 40), 420);
    moth(0.5);
    climb(j(330, 360), 500);
    hop(j(170, 195), j(-20, 30), 420);
    moth(0.4);
    hop(j(160, 185), j(0, 50), 380);
    flower(0.55);
    flag(0.2);
    liana(80, 300);
    hop(j(170, 195), j(0, 40), 440);
    moth(0.6);
    hop(j(160, 190), j(-40, 0), 420);
    liana(80, 300);
    hop(j(150, 175), j(0, 50), 460);
    moth(0.3);
    flower(0.65);
    flag(0.2);
    hop(j(160, 185), j(0, 40), 400);
    liana(80, 300);
    hop(j(160, 190), j(0, 40), 420);
    moth(0.5);
    climb(j(330, 360), 480);
    flower(0.4);
    hop(j(160, 185), j(0, 40), 440);
    moth(0.6);
    liana(80, 300);
    flower(0.6);
  });

  // 7. FINISH: the firefly tree, then the shrine
  let swarmX = 0;
  let swarmTree = { x: 0, y: 0 };
  section('Finish: the firefly tree', () => {
    hop(j(160, 185), j(0, 30), 1500);
    swarmX = r(cur.x + 520);
    // (the tree's foot on the bough; its crown, where the swarm goes, about TREE_CROWN px over it)
    swarmTree = { x: r(cur.x + 780), y: cur.y };
    hint(swarmX - 120, LANTERN_LINES.swarm);
    flag(0.15);
    runOn();
  });
  // (never more than 3500 px without a flag (LV-9 allows 4000: flagSpan.test.ts): each longer stretch gets one by the glowing flower
  // nearest its middle, or on the bough there. The engine's own top-up can't help: flags keep out of the dark, and the whole stage is night)
  for (let k = 0; k < 20; k++) {
    const xs = [200, ...checkpoints.map((c) => c.x).sort((m, n) => m - n), end() - 160];
    const i = xs.findIndex((x, n) => n > 0 && x - xs[n - 1] > 3500);
    if (i < 0) break;
    const mid = (xs[i - 1] + xs[i]) / 2;
    const f = flowers.filter((q) => q.x > xs[i - 1] + 700 && q.x < xs[i] - 700).sort((m, n) => Math.abs(m.x - mid) - Math.abs(n.x - mid))[0];
    const at = f ? f.x - 130 : mid;
    const on = P.filter((q) => q.x + 40 <= at && q.x + q.width - 40 >= at).sort((m, n) => m.y - n.y)[0]
      ?? P.filter((q) => q.width > 200).sort((m, n) => Math.abs(m.x + m.width / 2 - mid) - Math.abs(n.x + n.width / 2 - mid))[0];
    checkpoints.push({ x: r(Math.max(on.x + 40, Math.min(on.x + on.width - 40, at))), y: on.y, reached: false });
  }
  const exitX = r(end() - 160);
  C.push({ id: cid++, type: 'exit_totem', x: exitX, y: cur.y - 30, collected: false, bobPhase: 0 });
  cid = heartsAtFlags(C, checkpoints, cid);
  const movedPickups = fixPickups({ platforms: P, vines: V, ropes: [] }, C);
  const W = r(end() + 40);
  const plan: LanternPlan = { flowers, moths, gaps, swarmX, swarmTree };
  // the whole stage is night: one dark stretch, lit by the glowing flowers (the engine draws it; the jar is his own light)
  const zones: Zone[] = [{ kind: 'dark', x0: 0, x1: W, top: 0, bottom: LANTERN_H, baseY: G, dir: 1, period: 1, warn: 0, active: 1, offset: 0, force: 0, lights: [...flowers.map((f) => ({ x: f.x, y: f.y - 40, r: f.r })), { x: swarmTree.x, y: swarmTree.y - TREE_CROWN, r: 240 }] }];
  return {
    config: { ...config, levelWidth: W, levelHeight: LANTERN_H },
    trees: T,
    platforms: P,
    vines: V,
    ropes: [],
    enemies: [],
    boss: null,
    collectibles: C,
    spawnX: 200,
    spawnY: G,
    exitTotemX: exitX,
    exitTotemY: cur.y,
    checkpoints,
    zones,
    meta: { attempt: seed, chunks: [], width: W, timing: { layoutSeconds: expert, decorSeconds: 0, route: W } },
    proto: { hints: hints.sort((a, b) => a.x - b.x), covers: [], beats, movedPickups, lantern: plan },
    lantern84: { sections, lianas, route, expert, flowerT, plan },
  };
}
