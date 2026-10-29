/**
 * 6-8 Stilt Climb — World 6's special stage, its one hand-built stage (the rest of World 6 is gen2's): the climb UP through the
 * mangrove's stilt roots, out of the swamp, toward the first sight of the ruins (World 7) at the top, while the dirty, fast tide comes
 * in under him (risingTide.ts; the water line drawn with Matt's painted dirty water, badWaterArt.ts). Matt approved the mock-up
 * (reference/prop-sheets/qa-notes/6-8-mockup/PLAN.md, 2026-10-29), and the tide costs a life on Easy too.
 *
 * Bottom to top (up is negative y while building; shifted down at the end). The climb zig-zags in a column: a root up at one side, a
 * shelf back across, a liana or a hop on.
 *   1. START    the mudflat at low tide: a wide bank, a root knee, Dot's water line before any water can reach him. Nothing moves.
 *   2. LEARN    the tide turns once he is up the first root (a churn he sees and hears, Dot's line), then rises under him. Roots to
 *               climb and short hops between them; a flag, where Dot tells him the water stops at the flags (slack water).
 *   3. DEVELOP  lianas: ledge -> self-swinging liana -> a perch above it, a root up between. The first is taught on a wide shelf where
 *               the tide holds. Each liana is the only way on (past every jump and the leaf's glide), and its release window is the
 *               engine's (gen2 lianaBand: 167 ms Normal, 300 ms Easy, both checked).
 *   4. REST     slack water: a wide shelf with a flag, the middle of the stage.
 *   5. TWIST    the roots' animals: poison frogs and tayras on long root shelves, 120 px clear of every take-off, landing and root
 *               (JUMP_CLEAR), 200 px from every flag. Both are taught earlier in World 6: no line.
 *   6. TWIST    spring tide: the water comes faster (TidePlan.springAbove), four lianas and the roots between, a flag every second perch.
 *   7. FINISH   the tallest root up through the canopy to the crown, a long root at the top, and the shrine at its far end; Dot sees the
 *               ruins (the reveal's painted backdrop is the next art job: PLAN.md's Gemini prompt).
 *
 * Nothing crumbles; every rise is one plain hop; straight up a root always climbs. The roll moves widths, gaps and heights a little
 * (a set piece, like 4-7: no variety target).
 */
import { fixPickups } from './flowerReach.ts';
import { heartsAtFlags, stageSeconds, stream, type ProtoExtras, type StageHint } from './protoStage.ts';
import { findForStage } from './finds.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import type { Collectible, Enemy, LevelConfig, Platform, TreeStructure, Vine } from './types.ts';
import { LIANA, WATER_LINE } from './gen2/types.ts';
import { jumpLinkGap, lianaBand, VINE } from './gen2/pipeline.ts';
import { JUMP_CLEAR } from './stageMetrics.ts';
import { SAFE_APPROACH } from './levelCheck.ts';
import type { TidePlan } from './risingTide.ts';
import { LEDGE_MIN_COPY, ledgeCopies, ledgeHeight, STILT_PIECES, type LedgeLook, type StiltDecor, type StiltLedge, type StiltProp } from './w6StiltArt.ts';

/** what the tests read back: each section's height range (world y, after the shift), the lianas and their shelves, the crown */
export interface Stilt68 {
  sections: Array<{ name: string; top: number; bottom: number }>;
  /** each liana: its vine id, the ledge it is swung from and the perch it lands on (platform ids) */
  lianas: Array<{ vine: number; from: number; to: number }>;
  /** the catches under the hops' gaps and the lianas (platform ids) */
  catches: number[];
  /** the way up, ledge by ledge (platform ids), with the quick player's seconds on arriving at each (the tide's tests replay it slower) */
  route: Array<{ id: number; t: number; by: 'start' | 'root' | 'hop' | 'liana' }>;
  /** where the water stands at the start (the mudflat's edge), and the crown's top */
  lowWater: number;
  crown: number;
  /** the quick player's seconds the build reckons (climbing 220 px/s, running 285, a liana half a swing and a wait, an animal 2 s) */
  expert: number;
}

/**
 * World 6's frog and tayra as gen2's manifest has them (gen2/worlds/w6.ts W6_CREATURES; the stage's test checks they still match). Not
 * imported: w6.ts reads protoStage's ground height as it loads, and protoStage loads this file.
 */
export const STILT_CREATURES = {
  frog: { enemy: 'frog', w: 36, h: 24, hp: 1, footY: 14 },
  tayra: { enemy: 'tayra', w: 46, h: 24, hp: 1, footY: 15 },
} as const;

/**
 * the column the climb zig-zags in (world x): the whole width he can walk (the engine keeps him inside [20, W - 20]), so a shelf at the
 * side meets the stage's edge and never has an outer end to walk off into the tide
 */
export const STILT_COLUMN = { x0: 20, x1: 1700 } as const;

/**
 * 6-8 shows more of the world than other stages (as 4-7): sideways 760 px of world tall, upright 520 wide, so the shelf above, the
 * liana ahead and the tide below him are in one view (engine applyZoom)
 */
export const STILT_VIEW = { land: 760, port: 520 } as const;

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
  const lianas: Stilt68['lianas'] = [];
  const holds: TidePlan['holds'] = [];
  let pid = 1, vid = 1, tid = 1, cid = 1, eid = 1;
  let expert = 0;
  const RUN = 285, CLIMB = 220;
  const r = Math.round;
  const { x0: L, x1: Rt } = STILT_COLUMN;
  const j = (a: number, b: number) => r(R.r(a, b));

  const ledge = (x0: number, x1: number, y: number, h = 24): Platform => {
    const p: Platform = { id: pid++, x: r(x0), y: r(y), width: r(x1 - x0), height: h, type: 'solid', style: 'log' };
    P.push(p);
    return p;
  };
  const flower = (x: number, y: number, v: Collectible['botanicalVariant'] = 'orchid') =>
    C.push({ id: cid++, type: 'flower', botanicalVariant: v, x: r(x), y: r(y), collected: false, bobPhase: (x * 0.031) % 6.28 });
  let rootN = 0;
  /** a stilt root to climb, from `foot` up to `top` */
  const root = (x: number, foot: number, top: number) => {
    const tree: TreeStructure = { id: tid++, x: r(x), groundY: r(foot), topY: r(top) - 150, trunkWidth: 70, hasClimbVine: true, canopyRadius: 120 };
    T.push(tree);
    V.push({ id: vid++, x: r(x), topY: r(top) - 2, bottomY: r(foot) - 6, swaySpeed: 0.9, swayPhase: (x * 0.007) % 6.28, vineType: 'tree_climb', treeId: tree.id });
    // (one petal partway up every other root, never a stack on every post: the petals lead the eye up the way, not crowd it)
    if (rootN++ % 2 === 0) flower(x, foot - (foot - top) * 0.6, 'hibiscus');
  };
  /** a flag on the ledge he is on (placed along it away from the animals once they are all in: see the end) */
  const flagged: Platform[] = [];
  const flag = () => flagged.push(cur);
  /** a line the first time he passes x on the ledge at `y` (only at about that height: a climb passes the same x many times) */
  const hint = (x: number, y: number, text: string) => hints.push({ x: r(x), text, pad: text, keys: text, aboveY: r(y + 10), belowY: r(y - 150) });
  /** an animal on the ledge he is on (its patrol is cut back from the ledge's ends, its roots and the flags at the end) */
  const animal = (kind: keyof typeof STILT_CREATURES) => {
    const c = STILT_CREATURES[kind];
    const p = cur;
    E.push({ id: eid++, type: c.enemy, x: r(p.x + p.width / 2), y: r(p.y - c.footY), vx: 0, vy: 0, width: c.w, height: c.h, hp: c.hp, maxHp: c.hp, facing: -1, patrolMinX: p.x, patrolMaxX: p.x + p.width, attackCooldown: 1.2, telegraphTimer: 0, isAttacking: false, animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0 } as Enemy);
    expert += 2;
  };

  /** is the band [x0, x1] at height y clear of every platform within `dy` px up or down? */
  const free = (x0: number, x1: number, y: number, dy = 70) => !P.some((q) => q.x < x1 + 20 && q.x + q.width > x0 - 20 && Math.abs(q.y - y) < dy);
  /** the catches (platform ids): under each hop's gap and each liana, so a miss drops one short step, never into the tide (STAGE-RULES §2) */
  const catches: number[] = [];
  const route: Stilt68['route'] = [];
  const arrive = (by: Stilt68['route'][number]['by']) => route.push({ id: cur.id, t: expert, by });

  // ----- the cursor: the ledge he is on, and which way the climb is heading -----
  let cur: Platform;
  let dir: 1 | -1 = 1;
  /** the open end of the ledge he is on, the way he is going */
  const edge = () => (dir > 0 ? cur.x + cur.width : cur.x);
  const turn = () => { dir = (dir * -1) as 1 | -1; };
  /** a stilt root at the far end of this ledge, up `h` to a shelf `w` wide that runs back the other way (the climb turns) */
  const rootUp = (h: number, w: number) => {
    const tx = edge() - dir * 50;
    // (a shelf never at a liana's anchor near it: standing there, a thumb pressing up for the root grabs the liana; the root grows taller)
    const span = (hh: number) => (dir > 0 ? [tx + 40 - w, tx - 40] : [tx - 40, tx + w - 40]);
    for (let k = 0; k < 4; k++) {
      const [s0, s1] = span(h);
      const v = V.find((q) => q.vineType === 'swing_liana' && q.x > Math.min(s0, tx) - 150 && q.x < Math.max(s1, tx) + 150 && Math.abs(q.topY - (cur.y - h)) < 100);
      if (!v) break;
      h = cur.y - v.topY + 110;
    }
    expert += (cur.width * 0.7) / RUN + h / CLIMB + 0.6;
    // (the shelf runs on past the root's foot, to the stage's edge when that is near: a thumb that walks past the root is not dropped
    // off the end into the tide)
    const out = dir > 0 ? (Rt - edge() < 500 ? Rt - edge() : 110) : (edge() - L < 500 ? edge() - L : 110);
    const ex0 = dir > 0 ? edge() : edge() - out, ex1 = dir > 0 ? edge() + out : edge();
    const anchor = V.some((v) => v.vineType === 'swing_liana' && Math.abs(v.topY - cur.y) < 100 && v.x > ex0 - 80 && v.x < ex1 + 80);
    if (out > 0 && !anchor && !P.some((q) => q !== cur && q.x < ex1 + 30 && q.x + q.width > ex0 - 30 && Math.abs(q.y - cur.y) < 60)) {
      if (dir < 0) cur.x -= out;
      cur.width += out;
    }
    const top = cur.y - h;
    root(tx, cur.y, top);
    turn();
    const x0 = dir > 0 ? tx - 40 : tx + 40 - w;
    cur = ledge(Math.max(L, x0), Math.min(Rt, x0 + w), top);
    arrive('root');
  };
  /** a hop up `rise` over a `gap` to a ledge `w` wide (at the column's side it hops off the ledge's other end; a root if no room there) */
  const hopUp = (gap: number, rise: number, w: number): void => {
    // (a liana hanging by the take-off would catch the hop: it hops off the other end then)
    const lianaIn = (x0: number) => V.some((v) => v.vineType === 'swing_liana' && v.x > Math.min(edge(), x0) - 80 && v.x < Math.max(edge(), x0 + w) + 80 && v.topY < cur.y + 60 && v.bottomY > cur.y - 200);
    // (nor does the ledge it lands on stand at a liana's anchor: see rootUp)
    const atAnchor = (x0: number) => V.some((v) => v.vineType === 'swing_liana' && Math.abs(v.topY - (cur.y - rise)) < 100 && v.x > x0 - 80 && v.x < x0 + w + 80);
    const bad = (x0: number) => x0 < L || x0 + w > Rt || lianaIn(x0) || atAnchor(x0);
    let x0 = dir > 0 ? edge() + gap : edge() - gap - w;
    if (bad(x0)) {
      turn();
      x0 = dir > 0 ? edge() + gap : edge() - gap - w;
      if (bad(x0)) {
        // (no room either way: a root up at the end he was heading for, never back by the root he came up)
        turn();
        return rootUp(rise + 280, w + 100);
      }
    }
    expert += (cur.width * 0.7) / RUN + 0.7;
    // (a branch under the gap, a plain hop below the take-off: back up with a hop, or on with a double jump; never a shortcut)
    const g0 = dir > 0 ? edge() - 30 : x0 + w - 30, g1 = dir > 0 ? x0 + 30 : edge() + 30;
    if (free(g0, g1, cur.y + 90) && !V.some((v) => v.vineType === 'swing_liana' && Math.abs(v.topY - (cur.y + 90)) < 100 && v.x > g0 - 80 && v.x < g1 + 80)) {
      const c = ledge(g0, g1, cur.y + 90);
      c.style = 'branch';
      catches.push(c.id);
    }
    const from = edge();
    cur = ledge(x0, x0 + w, cur.y - rise);
    arrive('hop');
    // (a petal in the arc of the hop, over the gap: it shows where to jump)
    flower((from + (dir > 0 ? x0 : x0 + w)) / 2, cur.y - 70);
  };
  /**
   * a liana past this ledge's end and the perch past it `raise` px higher: the perch's near end where a let-go lands with the engine's
   * release window on BOTH settings (gen2 lianaBand: Normal 167 ms on its swing, Easy 300 ms on its slower one), and past every jump and
   * glide from the ledge (jumpLinkGap), so the swing is the only way. Built as if going right and mirrored when going left.
   */
  const liana = (raise: number, w: number, held = false): void => {
    const from = { x: 0, y: 0, w: cur.width };
    const v = { x: cur.width + j(165, 185), topY: -410, bottomY: 0 };
    const min = cur.width + jumpLinkGap(raise, config.worldIndex, config.miniIndex) + 20;
    const nb = lianaBand(from, v, { amp: VINE.amp, period: VINE.period.normal }, -raise, w, LIANA.window.normal, min, 'normal');
    const eb = lianaBand(from, v, { amp: VINE.amp, period: VINE.period.easy }, -raise, w, LIANA.window.easy, min, 'easy');
    const lo = Math.max(nb?.[0] ?? Infinity, eb?.[0] ?? Infinity);
    const hi = Math.min(nb?.[1] ?? -Infinity, eb?.[1] ?? -Infinity);
    if (!(lo <= hi)) throw new Error(`6-8: no perch past a liana keeps both release windows (raise ${raise}, width ${w})`);
    const near = lo + (hi - lo) * R.r(0.3, 0.7);
    const x0 = dir > 0 ? cur.x + near : cur.x + cur.width - near - w;
    // (no room the way he is going: a root up first, and the shelf at its top runs the other way)
    if (x0 < L || x0 + w > Rt) {
      rootUp(j(300, 330), 300);
      return liana(raise, w, held);
    }
    const vx = dir > 0 ? cur.x + v.x : cur.x + cur.width - v.x;
    if (held) holds.push({ x0: cur.x, x1: cur.x + cur.width, y: cur.y });
    const vine: Vine = { id: vid++, x: r(vx), topY: r(cur.y + v.topY), bottomY: r(cur.y + v.bottomY), swaySpeed: 1.1, swayPhase: 0, vineType: 'swing_liana', isSwingingVine: true };
    V.push(vine);
    const fromId = cur.id;
    // (under the swing a root shelf, a root at the ledge's end back up to it: a missed let-go costs the climb, never the tide)
    // (240 under it: above the tide while it waits under him, TIDE close; still too far under the perch for any jump)
    const sy = cur.y + 240;
    const s0 = dir > 0 ? edge() - 90 : x0 + w * 0.3, s1 = dir > 0 ? x0 + w * 0.7 : edge() + 90;
    if (free(s0, s1, sy, 90)) {
      const c = ledge(s0, s1, sy);
      catches.push(c.id);
      root(edge() - dir * 40, sy, cur.y);
    }
    expert += (cur.width * 0.6) / RUN + (VINE.period.normal - LIANA.window.normal) / 2 + VINE.period.normal / 2;
    cur = ledge(x0, x0 + w, cur.y - raise);
    lianas.push({ vine: vine.id, from: fromId, to: cur.id });
    arrive('liana');
    // (a petal in the leap off the liana, on the way to the perch)
    flower((vx + (dir > 0 ? x0 : x0 + w)) / 2, cur.y - 90, 'hibiscus');
  };
  /** a wide root shelf for an animal: a hop up onto it (the landing and take-offs at its ends, the animal in its middle) */
  const animalShelf = (kind: keyof typeof STILT_CREATURES, w: number) => {
    hopUp(j(140, 160), j(50, 65), w);
    animal(kind);
  };
  const section = (name: string, f: () => void) => {
    const y0 = cur.y;
    const n0 = P.length;
    f();
    const made = P.slice(n0);
    sections.push({ name, bottom: y0, top: Math.min(y0, ...made.map((p) => p.y)) });
    beats.push([Math.min(...made.map((p) => p.x)), Math.max(...made.map((p) => p.x + p.width)), name]);
  };

  // 1. START: the mudflat at low tide (spawn at 220; nothing can hurt here: the water is under the bank)
  const flat = ledge(L, 1100, 0, 90);
  cur = flat;
  arrive('start');
  ledge(560, 680, -40, 90); // a root knee to hop
  flower(620, -100);
  hint(300, 0, WATER_LINE);
  expert += 3;
  sections.push({ name: 'Start: the mudflat at low tide', top: -40, bottom: 0 });
  let turnAbove = 0;
  // 2. LEARN: roots and hops, zig-zag up; the tide turns once he is up the first root
  section('Learn: roots to climb, the tide turns', () => {
    rootUp(j(370, 390), 420);
    turnAbove = cur.y + 20;
    hopUp(j(140, 160), j(55, 65), 260);
    // (a short perch on top of a root: the kit's painted perch, a change from the long planks)
    rootUp(j(350, 370), 210);
    hopUp(j(150, 170), j(55, 65), 300);
    hopUp(j(140, 160), j(55, 65), 300);
    rootUp(j(330, 350), 440);
    flag();
  });
  // 3. DEVELOP: lianas up (two stacked lianas keep their heights apart, or their swings shrink: physics.ts swingSetup)
  section('Develop: lianas up', () => {
    // (no line: lianas are taught in 6-1, and a guide doesn't re-teach a move (STAGE-RULES §1, Dot is a guide, not a narrator))
    liana(80, 260, true);
    rootUp(j(420, 440), 300);
    liana(80, 260);
    rootUp(j(300, 320), 520);
    flag();
    hopUp(j(140, 160), j(55, 65), 280);
    rootUp(j(380, 400), 300);
    liana(80, 260);
    rootUp(j(420, 440), 300);
    liana(80, 260);
    rootUp(j(340, 360), 680);
  });
  // 4. REST: slack water (a wide shelf: the flag, and the World 6 book in a Hush Fern at its far end: placed once the flags are in)
  let rest: Platform = flat;
  section('Rest: slack water', () => {
    rest = cur;
    flag();
    rootUp(j(350, 370), 440);
  });
  // 5. TWIST: the roots' animals
  section("Twist: the roots' animals", () => {
    animalShelf('frog', 560);
    rootUp(j(340, 360), 380);
    animalShelf('tayra', 600);
    rootUp(j(320, 340), 400);
    flag();
    hopUp(j(140, 160), j(55, 65), 300);
    animalShelf('frog', 560);
    rootUp(j(350, 370), 420);
    animalShelf('tayra', 600);
    rootUp(j(330, 350), 210);
    hopUp(j(140, 160), j(55, 65), 280);
    rootUp(j(330, 350), 440);
  });
  // 6. TWIST: spring tide, lianas and roots
  let springAbove = 0;
  section('Twist: spring tide', () => {
    flag();
    springAbove = cur.y + 20;
    hint(cur.x + cur.width / 2, cur.y, "Spring tide! It's faster now."); // (new, needs Matt's approval)
    liana(80, 240);
    rootUp(j(420, 440), 300);
    liana(80, 240);
    flag();
    rootUp(j(420, 440), 300);
    liana(80, 240);
    rootUp(j(420, 440), 300);
    liana(80, 240);
    flag();
    rootUp(j(320, 340), 320);
    animalShelf('frog', 560);
    rootUp(j(320, 340), 440);
  });
  // 7. FINISH: the tallest root, up through the canopy to the crown
  let crownWalk: 1 | -1 = 1;
  section('Finish: the crown and the ruins', () => {
    flag();
    rootUp(560, 900);
    // the crown: the top of the canopy, the whole width, the shrine at its far end from the root (a walk with the ruins opening up)
    cur.x = L;
    cur.width = Rt - L;
    const top = V[V.length - 1].x;
    crownWalk = top < (L + Rt) / 2 ? 1 : -1;
    hint(top + crownWalk * 160, cur.y, 'Stone towers. Past the trees.'); // (new, needs Matt's approval)
    expert += Math.abs((crownWalk > 0 ? Rt - 160 : L + 160) - top) / RUN + 1;
  });
  const crown = cur;

  // the flags: each in the middle of its ledge, or as far along it from the animals as it goes (SAFE_APPROACH, within 400 px up or
  // down); a ledge an animal's patch leaves no room on passes its flag on to the next ledge up
  const near = (e: Enemy, y: number) => Math.abs(e.y - y) < 430;
  const spot = (p: Platform): [number, number] => {
    let best = p.x + p.width / 2, bestD = -1;
    for (let x = p.x + 60; x <= p.x + p.width - 60; x += 10) {
      // (from the animal's whole patch: its ledge less the ends it keeps clear of)
      const d = Math.min(1e9, ...E.filter((e) => near(e, p.y)).map((e) => Math.max(0, e.patrolMinX + JUMP_CLEAR - x, x - (e.patrolMaxX - JUMP_CLEAR))));
      if (d > bestD + 40 || (d >= bestD && Math.abs(x - p.x - p.width / 2) < Math.abs(best - p.x - p.width / 2))) { best = x; bestD = d; }
    }
    return [best, bestD];
  };
  for (const p of flagged) {
    const i = P.indexOf(p);
    const tries = P.slice(i, i + 5).filter((q) => q.y <= p.y && q.width >= 240);
    const pick = tries.find((q) => spot(q)[1] >= SAFE_APPROACH + 60) ?? p;
    checkpoints.push({ x: r(spot(pick)[0]), y: pick.y, reached: false });
  }
  // each animal's patrol: JUMP_CLEAR from its ledge's ends and from every root that stands on it or tops out on it, SAFE_APPROACH from
  // every flag near its height
  for (const e of E) {
    const p = P.find((q) => Math.abs(q.y - (e.y + 15)) < 3 && e.x >= q.x && e.x <= q.x + q.width)!;
    let lo = p.x + JUMP_CLEAR + e.width / 2, hi = p.x + p.width - JUMP_CLEAR - e.width / 2;
    const blocks = [
      ...V.filter((v) => v.vineType === 'tree_climb' && (Math.abs(v.topY + 2 - p.y) < 4 || Math.abs(v.bottomY + 6 - p.y) < 4)).map((v) => [v.x, JUMP_CLEAR + e.width / 2] as const),
      ...checkpoints.filter((c) => Math.abs(c.y - e.y) < 430).map((c) => [c.x, SAFE_APPROACH + 10] as const),
    ];
    for (const [bx, clear] of blocks) {
      // keep the larger side of the block
      if (bx < lo - clear || bx > hi + clear) continue;
      if (bx - lo > hi - bx) hi = Math.min(hi, bx - clear);
      else lo = Math.max(lo, bx + clear);
    }
    if (hi - lo < 40) throw new Error(`6-8: no room for the ${e.type} on platform ${p.id} (${p.x}..${p.x + p.width} at ${p.y}; ${JSON.stringify(blocks)}; flags ${JSON.stringify(checkpoints)})`);
    e.patrolMinX = r(lo);
    e.patrolMaxX = r(hi);
    e.x = r((lo + hi) / 2);
  }

  // the story find for stage 8 (finds.ts: World 6's book), in a Hush Fern on the rest shelf, as far along it from its flag and roots as
  // it goes (the old generator's addFinds put it on a high ledge; a hand-built stage places its own)
  const book = findForStage(config.worldIndex, config.miniIndex);
  if (book && book.kind === 'book') {
    const keepX = [
      ...checkpoints.filter((c) => Math.abs(c.y - rest.y) < 2).map((c) => c.x),
      ...V.filter((v) => v.vineType === 'tree_climb' && (Math.abs(v.topY + 2 - rest.y) < 4 || Math.abs(v.bottomY + 6 - rest.y) < 4)).map((v) => v.x),
    ];
    let bx = rest.x + 70, bd = -1;
    for (let x = rest.x + 70; x <= rest.x + rest.width - 70; x += 10) {
      const d = Math.min(...keepX.map((k) => Math.abs(k - x)));
      if (d > bd) { bd = d; bx = x; }
    }
    C.push({ id: cid++, type: 'find', findId: book.id, hidden: true, x: r(bx), y: rest.y - 26, collected: false, bobPhase: 0 });
  }

  // the ledges' looks (the lead's review: no two alike on one screen): each ledge takes one of Matt's World 6 pieces (w6StiltArt.ts) or the
  // kit's own root plank, never the look a ledge near it (likely on the same screen) has; a tall look (the root arch, the den) only
  // where its roots don't hang onto a ledge under it; a very wide ledge (the crown) is laid in segments of different looks
  const ledges: StiltLedge[] = [];
  const looked = new Map<Platform, Array<{ look: LedgeLook | 'kit'; n: number; x0: number; x1: number }>>();
  /** how deep a look may hang under a ledge from x0 to x1 before it reaches another ledge (or a catch) under it */
  const roomUnder = (p: Platform, x0: number, x1: number) =>
    Math.min(Infinity, ...P.filter((q) => q !== p && q.x < x1 + 20 && q.x + q.width > x0 - 20 && q.y > p.y + 10).map((q) => q.y - p.y - 30));
  /** how much a look would clash with the ledges already given one: each the same look counts more the closer it is */
  const clash = (y: number, x0: number, x1: number, look: LedgeLook | 'kit') => {
    let c = 0;
    for (const [q, ls] of looked) for (const l of ls) {
      if (l.look !== look) continue;
      const dx = Math.max(0, l.x0 - x1, x0 - l.x1);
      const d = Math.hypot(dx, Math.abs(q.y - y));
      if (d < 900) c += 1 / (1 + d / 150);
    }
    return c;
  };
  /** the look for a ledge (or a segment of one) and its copies: the fewest copies that keep it clear of what is under it */
  const lookFor = (p: Platform, x0: number, x1: number, kit: boolean): { look: LedgeLook | 'kit'; n: number } | null => {
    const w = x1 - x0;
    const room = roomUnder(p, x0, x1);
    const opts: Array<LedgeLook | 'kit'> = w <= 240 ? ['stump', 'moss-log', 'kit'] : ['root-arch', 'branch-b', 'moss-log', 'root-den', 'kit'];
    const fit: Array<{ look: LedgeLook | 'kit'; n: number }> = [];
    for (const l of opts) {
      if (l === 'kit') {
        if (kit) fit.push({ look: l, n: 1 });
        continue;
      }
      // (the tall root arch and den keep their shape: one or two copies; a plank or a log may be laid as several)
      // (and a stump at most twice: three in a row read as a pattern; a raft of logs may be more)
      const most = l === 'root-arch' || l === 'root-den' || l === 'stump' ? 2 : Math.max(1, Math.floor(w / LEDGE_MIN_COPY));
      for (let n = ledgeCopies(l, w); n <= most; n++) if (ledgeHeight(l, w, n) <= room) { fit.push({ look: l, n }); break; }
    }
    if (!fit.length) return kit ? { look: 'kit', n: 1 } : null;
    // the least clash; ties by the roll
    const k = Math.floor(R.r(0, fit.length));
    const turn = [...fit.slice(k), ...fit.slice(0, k)];
    return turn.reduce((best, l) => (clash(p.y, x0, x1, l.look) < clash(p.y, x0, x1, best.look) - 1e-9 ? l : best), turn[0]);
  };
  for (const p of [...P].filter((q) => q !== flat && q.height < 50).sort((m, n) => n.y - m.y)) {
    // (a ledge in segments is painted whole by this file, as the kit's plank can't take part of one: when a segment has no look that
    // fits, the ledge goes whole)
    let segs = p.width > 760 ? Math.round(p.width / 420) : 1;
    let mine: Array<{ look: LedgeLook | 'kit'; n: number; x0: number; x1: number }> = [];
    for (let tries = 0; tries < 2; tries++, segs = 1, mine = []) {
      for (let i = 0; i < segs; i++) {
        const x0 = p.x + (p.width * i) / segs, x1 = p.x + (p.width * (i + 1)) / segs;
        const got = lookFor(p, x0, x1, segs === 1);
        if (!got) break;
        mine.push({ look: got.look, n: got.n, x0, x1 });
      }
      if (mine.length === segs) break;
    }
    looked.set(p, mine);
    for (const m of mine) {
      if (m.look === 'kit') continue;
      p.art = 'stilt';
      ledges.push({ id: p.id, look: m.look, x: r(m.x0), y: p.y, w: r(m.x1 - m.x0), n: m.n, ...(R.f() < 0.5 ? { flip: true } : {}) });
    }
  }

  // the dressing (pictures only): on the wide shelves of the way up, Matt's World 6 hides and arches, or the cattails, a mooring post,
  // glow mushrooms or a lantern flower (props-made/w6c), clear of the shelf's roots, its flag, its find and its ends; a curtain of moss
  // hangs under some plain shelves (the kit's root wall was tried in panels behind the climb, 2026-10-29: its square edges read as crates)
  const decor: StiltDecor[] = [];
  const shelves = route.map((q) => P.find((p) => p.id === q.id)!).filter((p) => p !== flat);
  const SMALL: Array<[StiltProp, number, number]> = [['cattails', 110, 140], ['mooring-post', 60, 75], ['glow-mushrooms', 110, 140], ['lantern-flower', 46, 58]];
  let pick = Math.floor(R.r(0, STILT_PIECES.length));
  let small = Math.floor(R.r(0, SMALL.length));
  shelves.forEach((p, i) => {
    const keep = [
      ...V.filter((v) => v.vineType === 'tree_climb' && (Math.abs(v.topY + 2 - p.y) < 4 || Math.abs(v.bottomY + 6 - p.y) < 4)).map((v) => v.x),
      ...checkpoints.filter((c) => Math.abs(c.y - p.y) < 2).map((c) => c.x),
      ...C.filter((c) => c.type === 'find' && Math.abs(c.y + 26 - p.y) < 2).map((c) => c.x),
    ];
    const place = (n: StiltDecor['n'], w: number) => {
      for (let k = 0; k < 8; k++) {
        const x = p.x + w / 2 + 40 + (p.width - w - 80) * R.r(0, 1);
        if (keep.every((kx) => Math.abs(kx - x) > w / 2 + 40)) {
          decor.push({ n, x: r(x), b: p.y + 4, w, ...(R.f() < 0.5 ? { flip: true } : {}) });
          keep.push(x);
          return;
        }
      }
    };
    if (p.width >= 300 && i % 2 === 0) place(STILT_PIECES[pick++ % STILT_PIECES.length], j(200, 240));
    else if (p.width >= 200) {
      const [n, w0, w1] = SMALL[small++ % SMALL.length];
      place(n, j(w0, w1));
    }
    // (moss hangs under a plain plank, never under a root arch's own legs)
    const ls = looked.get(p) ?? [];
    if (i % 3 === 1 && ls.every((l) => l.look === 'kit' || l.look === 'branch-b')) {
      const w = Math.min(320, p.width * 0.7);
      decor.push({ n: 'moss-curtain', x: r(p.x + p.width * R.r(0.35, 0.65)), b: p.y + 10, w: r(w) });
    }
  });

  // shift: the crown 900 px under the top of the stage (room for the sky and the skyline over it, so the view can hold him in its middle
  // on the crown, upright too)
  const shift = 900 - Math.min(...P.map((p) => p.y));
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
  for (const h of holds) h.y += shift;
  for (const d of decor) d.b += shift;
  for (const l of ledges) l.y += shift;
  const floorY = flat.y;
  const lowWater = floorY + 60;
  const H = floorY + 500;
  const W = Rt + 20;
  const exitX = r(crownWalk > 0 ? crown.x + crown.width - 160 : crown.x + 160);
  C.push({ id: cid++, type: 'exit_totem', x: exitX, y: crown.y - 30, collected: false, bobPhase: 0 });
  cid = heartsAtFlags(C, checkpoints, cid);
  const movedPickups = fixPickups({ platforms: P, vines: V, ropes: [] }, C);
  const tide: TidePlan = { low: lowWater, turnAbove: turnAbove + shift, springAbove: springAbove + shift, holds };
  void stageSeconds;
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
    checkpoints: checkpoints.sort((a, b) => b.y - a.y),
    waterY: lowWater,
    meta: { attempt: seed, chunks: [], width: W, timing: { layoutSeconds: expert, decorSeconds: 0, route: W } },
    proto: {
      hints: hints.sort((a, b) => a.x - b.x), covers: [], beats, movedPickups, tide, view: STILT_VIEW, stilt: decor, stiltLedges: ledges,
      // (the ruins at dusk past the mangrove: World 7's dusk sky and its middle and near strips; fading in up the last root)
      reveal: { from: crown.y + 700, full: crown.y + 60, load: tide.springAbove, crown: crown.y, strips: { far: 'w7dusk-far', mid: 'w7-mid', near: 'w7-near' } },
    },
    stilt68: { sections, lianas, catches, route, lowWater, crown: crown.y, expert },
  };
}
