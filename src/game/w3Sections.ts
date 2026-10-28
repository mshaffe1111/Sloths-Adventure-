/**
 * World 3's section versions (the variety pass, 2026-10-28; STAGE-RULES §2 "Variety across rolls", GEMINI-LEDGER C1, C3, C4, C8).
 *
 * The 200-roll tool found every World 3 stage 91-99% alike from roll to roll: the platforms moved, but the order of things to do never
 * changed. Now each stage has two or three authored versions of its main sections (Start, Learn, Develop, Twist, Finish), and the layout
 * roll picks one of each:
 *   - the versions of a section come out of a shuffle bag (gen2/variety.ts ShuffleBag) drawn on the roll's own stream, and a cooldown
 *     (CooldownQueue) over the whole stage keeps one kind of stretch from turning up in two sections of one stage (a dark twist after a
 *     dark develop), so a stage always mixes its world's things;
 *   - the Finish draws its pieces from a shuffle bag (C1) instead of cycling them in a fixed order;
 *   - `mirror` flips the order of the pieces inside a section where nothing depends on it (C8, as far as a side-scroller allows; the
 *     sinkhole climb mirrors for real: its first trunk on the left or the right);
 *   - the grotto's dressing (which pieces stand on the floor, which hang from the roof) rotates with the roll, the stages taking turns
 *     between two halves of the sets (STAGE-RULES §4, as artRoll.ts rollLook does for the kit's sets).
 * The picks are a pure function of the stage and the layout number: a retry keeps the stage, a fresh roll changes it. (Keeping the version
 * a player saw last out of their next roll needs the last roll remembered; that is layoutMemory.ts's job, see the report.)
 */
import { CooldownQueue, ShuffleBag, pickWeighted, type Rng } from './gen2/variety.ts';
import { fixPickups } from './flowerReach.ts';
import { reachJump } from './physics.ts';
import { heartsAtFlags, stream, type ProtoExtras, type StageHint } from './protoStage.ts';
import { HANG_DROP, ROPE_RISE, ROPE_SPEED } from './rope.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import type { Collectible, Enemy, LevelConfig, Platform, Rope, TreeStructure, Vine } from './types.ts';
import type { W3Decor } from './w3Art.ts';

/** how many versions each section of each stage has (a section with 1 is the same on every roll) */
export const W3_VERSIONS: Record<string, { start: number; learn: number; develop: number; twist: number; finish: number }> = {
  '3-1': { start: 3, learn: 2, develop: 3, twist: 3, finish: 3 },
  '3-2': { start: 3, learn: 2, develop: 3, twist: 2, finish: 3 },
  '3-3': { start: 3, learn: 2, develop: 3, twist: 3, finish: 3 },
  '3-4': { start: 1, learn: 2, develop: 3, twist: 3, finish: 2 },
  '3-5': { start: 3, learn: 2, develop: 3, twist: 3, finish: 3 },
  '3-6': { start: 3, learn: 2, develop: 3, twist: 3, finish: 3 },
  '3-7': { start: 3, learn: 2, develop: 3, twist: 2, finish: 3 },
  '3-8': { start: 3, learn: 2, develop: 3, twist: 3, finish: 3 },
  '3-9': { start: 3, learn: 2, develop: 3, twist: 3, finish: 3 },
};

/** the kind of stretch each version is, by stage and section: the stage's cooldown keeps one kind out of two sections */
const KINDS: Record<string, Partial<Record<'develop' | 'twist' | 'finish', readonly string[]>>> = {
  '3-1': { develop: ['spore', 'abyss', 'vine'], twist: ['spore', 'abyss', 'vine'], finish: ['vine', 'spore', 'abyss'] },
  '3-2': { develop: ['fern', 'dark', 'vine'], twist: ['dark', 'plate'], finish: ['fern', 'dark', 'vine'] },
  '3-3': { develop: ['shelf', 'dark', 'abyss'], twist: ['spore', 'shelf', 'floor'], finish: ['shelf', 'dark', 'vine'] },
  '3-4': { develop: ['rope', 'hops', 'prowl'], twist: ['rope', 'prowl', 'hops'] },
  '3-5': { develop: ['row', 'abyss', 'vine'], twist: ['dark', 'abyss', 'row'], finish: ['row', 'abyss', 'vine'] },
  '3-6': { develop: ['stones', 'spore', 'abyss'], twist: ['dark', 'spore', 'abyss'], finish: ['stones', 'abyss', 'vine'] },
  '3-7': { develop: ['eyes', 'vine', 'abyss'], twist: ['dark', 'plate'], finish: ['vine', 'eyes', 'abyss'] },
  '3-8': { develop: ['chain', 'abyss', 'row'], twist: ['chain', 'abyss', 'dark'], finish: ['chain', 'row', 'abyss'] },
  '3-9': { develop: ['tree', 'dark', 'abyss'], twist: ['floor', 'tree', 'dark'], finish: ['tree', 'abyss', 'dark'] },
};

/** the grotto's dressing sets: what stands on the floor and what hangs from the roof (two halves, the stages take turns) */
export const W3_DECOR_SETS = [
  { floor: ['stalagmites', 'mushrooms', 'fern', 'stalagmites', 'clawRock'], hang: ['stalactite', 'glowLit'] },
  { floor: ['mushrooms', 'clawRock', 'mushrooms', 'stalagmites'], hang: ['glowLit', 'mossCurtain'] },
  { floor: ['stalagmites', 'stalagmites', 'fern', 'pawprint'], hang: ['stalactite', 'stalactite', 'glowLit'] },
  { floor: ['clawRock', 'fern', 'mushrooms', 'bones'], hang: ['mossCurtain', 'stalactite'] },
] as const;
export type W3DecorSet = (typeof W3_DECOR_SETS)[number];

export interface W3Pick {
  start: number;
  learn: number;
  develop: number;
  twist: number;
  finish: number;
  /** flip the order of the pieces inside a section where nothing depends on it */
  mirror: boolean;
  decor: W3DecorSet;
  /** a shuffle bag over the given pieces, on the roll's own stream (the Finish's pieces, C1) */
  bag: <T>(items: readonly T[]) => () => T;
  /** the roll's own stream (0..1), apart from the layout's dice */
  rng: Rng;
}

/** a small seeded stream of its own (mulberry32), so the picks never shift the layout's dice */
function rngOf(seed: number): Rng {
  let a = (seed * 2246822519 + 0x9e3779b9) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** World 3's picks for one stage on one layout number */
export function w3Pick(stage: string, seed: number): W3Pick {
  const v = W3_VERSIONS[stage];
  const no = Number(stage.split('-')[1]) || 0;
  const rng = rngOf(seed * 31 + no * 7919);
  const one = (n: number) => new ShuffleBag(rng, Array.from({ length: n }, (_, i) => i)).draw() ?? 0;
  // the roll's theme: one kind of stretch the roll leans on (two rolls of a stage then differ in what they ask most, not only in where:
  // the 200-roll tool scores rolls by their mix of actions). Each section leans on the theme; the Twist never repeats the Develop's
  // kind (the stage's cooldown), so the middle of a stage always changes pace.
  const kinds = KINDS[stage] ?? {};
  const all = [...new Set(Object.values(kinds).flat())];
  const theme = all.length ? all[Math.floor(rng() * all.length)] : '';
  const cool = new CooldownQueue<string>(1);
  const pick = (sec: 'develop' | 'twist' | 'finish', n: number) => {
    const ks = kinds[sec];
    if (!ks) return one(n);
    const ids = Array.from({ length: n }, (_, i) => i);
    const allowed = sec === 'twist' ? ids.filter((i) => cool.allows(ks[i])) : ids;
    const i = pickWeighted(rng, allowed.length ? allowed : ids, (i) => (ks[i] === theme ? 3 : 1)) ?? 0;
    cool.use(ks[i]);
    return i;
  };
  const start = one(v.start);
  const learn = one(v.learn);
  const develop = pick('develop', v.develop);
  const twist = pick('twist', v.twist);
  const finish = pick('finish', v.finish);
  const mirror = rng() < 0.5;
  // the decor: stages take turns between the two halves of the sets, the roll picks inside the half
  const half = no % 2 === 0 ? [0, 1] : [2, 3];
  const decor = W3_DECOR_SETS[pickWeighted(rng, half, () => 1) ?? half[0]];
  const bag = <T,>(items: readonly T[]) => {
    const b = new ShuffleBag(rng, items.map((_, i) => i));
    return () => items[b.draw() ?? 0];
  };
  return { start, learn, develop, twist, finish, mirror, decor, bag, rng };
}

// ---------------------------------------------------------------------------------------------------------------------------
// 3-4 The Sinkhole: World 3's own climb (the variety pass, 2026-10-28)

/** the sinkhole's width (the engine keeps him inside it) and the margin nothing is built in */
const SINK_W = 3200;
const SINK_MARGIN = 90;
const SINK_BANK_H = 90;

/**
 * 3-4 The Sinkhole: up the wall of the sinkhole toward the moonlight. It was World 1's kapok climb (protoStage.ts buildKapok, shared with
 * 1-4, 2-6, 4-1 and 4-6) dressed for the grotto, 99% alike from roll to roll and at World 2's difficulty. Now it is World 3's own:
 *   - the climb mirrors (C8): its first root on the left or the right of the sinkhole;
 *   - the zigzag up has three versions (ropes and roots as before; runs of hops up narrow shelves, the gaps wider than World 1's; or
 *     ocelots prowling the wide shelves, fought or hopped on the way up), and so has the twist (the long rope; a long shelf with two
 *     ocelots; a run of hops up small shelves), all picked by the roll (w3Pick);
 *   - hard but fair: a fall only drops him to a shelf below or the floor (it costs the climb, never a life); the prowlers are World 3's
 *     own (taught in 3-3), each alone on a wide shelf, never at the top of a root.
 * Built from y = 0 upward and shifted down at the end, so the crown sits near the top of the stage.
 */
export function buildSinkhole(config: LevelConfig, seed: number): GeneratedStage & { proto: ProtoExtras } {
  const R = stream(seed);
  const pk = w3Pick('3-4', seed);
  const W = SINK_W;
  const P: Platform[] = [];
  const V: Vine[] = [];
  const T: TreeStructure[] = [];
  const E: Enemy[] = [];
  const C: Collectible[] = [];
  const ROPES: Rope[] = [];
  const checkpoints: Array<{ x: number; y: number; reached: boolean }> = [];
  const hints: StageHint[] = [];
  const beats: Array<[number, number, string]> = [];
  const hollows: Array<{ x: number; y: number }> = [];
  let pid = 1, vid = 1, tid = 1, eid = 1, cid = 1, seedN = 0;
  let expert = 0;
  const RUN = 285, CLIMB = 220;

  const ledge = (x0: number, x1: number, y: number) => {
    const p: Platform = { id: pid++, x: Math.round(x0), y: Math.round(y), width: Math.round(x1 - x0), height: 24, type: 'solid', style: 'branch' };
    P.push(p);
    return p;
  };
  const trunk = (x: number, groundY: number, perchY: number) => {
    const tree: TreeStructure = { id: tid++, x, groundY, topY: perchY - 150, trunkWidth: 76, hasClimbVine: true, canopyRadius: 150 };
    T.push(tree);
    V.push({ id: vid++, x, topY: perchY - 2, bottomY: groundY - 6, swaySpeed: 0.9, swayPhase: (x * 0.007) % 6.28, vineType: 'tree_climb', treeId: tree.id });
  };
  const blocked = (x0: number, x1: number, y: number) => P.some((p) => p !== P[0] && p.x < x1 + 30 && p.x + p.width > x0 - 30 && Math.abs(p.y - y) < 130);
  const flower = (x: number, y: number, v: Collectible['botanicalVariant'] = 'orchid') =>
    C.push({ id: cid++, type: 'flower', botanicalVariant: v, x: Math.round(x), y: Math.round(y), collected: false, bobPhase: (x * 0.031) % 6.28 });
  const row = (x0: number, x1: number, y: number, n: number, v: Collectible['botanicalVariant'] = 'orchid') => {
    for (let i = 0; i < n; i++) flower(x0 + ((x1 - x0) * i) / Math.max(1, n - 1), y, v);
  };
  /** an ocelot prowling a shelf (two hits; World 3's prowlers, taught in 3-3) */
  const ocelot = (px: number, surface: number, range: number) => {
    // (kept only if it is clear of every flag, the spawn and the shrine once they are all placed: levelCheck's safe spots)
    E.push({
      id: eid++, type: 'ocelot', x: Math.round(px), y: surface - 18, vx: (R.chance(0.5) ? -1 : 1) * 55, vy: 0, width: 48, height: 28, hp: 2, maxHp: 2,
      facing: R.chance(0.5) ? 1 : -1, patrolMinX: Math.round(px - range / 2), patrolMaxX: Math.round(px + range / 2), attackCooldown: 2.5, telegraphTimer: 0,
      isAttacking: false, animTimer: 0, hitFlashTimer: 0, defeated: false, koTimer: 0, behaviorTimer: 0,
    } as Enemy);
    expert += 2.2;
  };
  const hint = (text: string, pad: string, keys: string, aboveY?: number) => hints.push({ x: 0, text, pad, keys, aboveY });

  // the floor: the whole width, so a fall is never more than a climb back
  P.push({ id: pid++, x: 0, y: 0, width: W, height: SINK_BANK_H, type: 'solid', style: 'log' });

  let cur: Platform = P[0];
  // (C8: the climb sets off up the left of the sinkhole or the right)
  let dir: 1 | -1 = pk.mirror ? -1 : 1;
  /** a root up from `cur` (near its end on the way he is heading), to a shelf growing out from it */
  const climb = (h0: number, flowers = 3) => {
    let h = h0;
    // (on the shelf he is on, near its end the way he is heading; never right against the sinkhole's wall)
    const want = Math.max(SINK_MARGIN + 220, Math.min(W - SINK_MARGIN - 220, dir === 1 ? cur.x + cur.width - 60 : cur.x + 60));
    const tX = Math.round(Math.max(cur.x + 40, Math.min(cur.x + cur.width - 40, want)));
    // the shelf grows out the way he is heading (back toward the middle near an edge)
    const out: 1 | -1 = dir === 1 ? (tX + 320 < W - SINK_MARGIN ? 1 : -1) : tX - 320 > SINK_MARGIN ? -1 : 1;
    const pw = Math.round(R.r(260, 320));
    const span = (y: number): [number, number, number] => (out === 1 ? [tX - 40, tX - 40 + pw, y] : [tX + 40 - pw, tX + 40, y]);
    for (let k = 0; k < 3 && blocked(...span(cur.y - h)); k++) h += 70;
    trunk(tX, cur.y, cur.y - h);
    for (let i = 0; i < flowers; i++) flower(tX, cur.y - 70 - ((h - 110) * i) / Math.max(1, flowers - 1), 'hibiscus');
    expert += h / CLIMB + 0.8;
    cur = ledge(...span(cur.y - h));
    return tX;
  };
  const room = () => (dir === 1 ? W - SINK_MARGIN - (cur.x + cur.width) : cur.x - SINK_MARGIN);
  const turn = () => { dir = dir === 1 ? -1 : 1; };
  /** a rope from the end of `cur` across a gap to a new shelf at the same height */
  const rope = (gap0: number, w0: number, under = 3) => {
    let gap = gap0, w = w0;
    const y = cur.y;
    const at = (d: 1 | -1) => (d === 1 ? cur.x + cur.width + gap : cur.x - gap - w);
    const fits = (d: 1 | -1) => (d === 1 ? W - SINK_MARGIN - (cur.x + cur.width) : cur.x - SINK_MARGIN) >= gap + w && !blocked(at(d), at(d) + w, y);
    if (!fits(dir) && fits(dir === 1 ? -1 : 1)) turn();
    else if (room() < gap + w) turn();
    // (never past the sinkhole's wall: the shelf shrinks to the room there is, 200 at least, then the gap)
    if (room() < gap + w) { w = Math.max(200, room() - gap); gap = Math.max(300, Math.min(gap, room() - w)); }
    const nx0 = at(dir);
    const next = ledge(nx0, nx0 + w, y);
    const a = dir === 1 ? cur : next, b = dir === 1 ? next : cur;
    ROPES.push({ id: ROPES.length + 1, x0: a.x + a.width - 44, x1: b.x + 44, y: y - ROPE_RISE, g0: y, g1: y, required: true });
    if (under) row(a.x + a.width + 70, b.x - 70, y - ROPE_RISE + HANG_DROP - 26, under, 'orchid');
    row(next.x + 50, next.x + next.width - 50, y - 34, 2, 'hibiscus');
    expert += 1.2 + (b.x - a.x - a.width + 88) / ROPE_SPEED + w / RUN;
    cur = next;
  };
  /** hops along and up shelves: `share` of what a jump up `rise` reaches (`wide`: the sinkhole's wider gaps, still well inside a jump) */
  const hops = (n: number, wide = false) => {
    for (let k = 0; k < n; k++) {
      const w = Math.round(wide ? R.r(150, 200) : R.r(180, 240));
      const rise = Math.round(wide ? R.r(40, 80) : R.r(20, 60));
      const gap = Math.round(reachJump(rise, false) * (wide ? R.r(0.55, 0.68) : R.r(0.4, 0.55)));
      const at = (d: 1 | -1) => (d === 1 ? cur.x + cur.width + gap : cur.x - gap - w);
      const fits = (d: 1 | -1) => (d === 1 ? W - SINK_MARGIN - (cur.x + cur.width) : cur.x - SINK_MARGIN) >= gap + w && !blocked(at(d), at(d) + w, cur.y - rise);
      if (!fits(dir)) {
        if (fits(dir === 1 ? -1 : 1)) turn();
        else return;
      }
      const nx0 = at(dir);
      cur = ledge(nx0, nx0 + w, cur.y - rise);
      flower(nx0 + w / 2, cur.y - 34, 'orchid');
      expert += (gap + w) / RUN + 0.5;
    }
  };
  /** a wide shelf (a rope's far end, or a shelf of its own off a root) with an ocelot prowling it, well clear of both its ends */
  const prowlShelf = () => {
    const w = Math.round(R.r(440, 520));
    const fits = (d: 1 | -1) => (d === 1 ? W - SINK_MARGIN - (cur.x + cur.width) : cur.x - SINK_MARGIN) >= 380 + w;
    if (!fits(dir)) turn();
    if (!fits(dir)) return false;
    rope(Math.round(R.r(380, 420)), w, 0);
    ocelot(cur.x + cur.width / 2, cur.y, w - 220);
    return true;
  };
  const flag = () => checkpoints.push({ x: Math.round(cur.x + cur.width / 2), y: cur.y, reached: false });
  const beat = (name: string, f: () => void) => {
    const b0 = cur ? cur.y : 0;
    f();
    beats.push([b0, cur.y, name]);
  };

  // ---- Learn: up from the floor
  beat('Learn: up the root', () => {
    cur = { ...P[0], x: dir === 1 ? 300 : W - 700, width: 400 } as Platform;
    hint('Up the sinkhole, toward the moonlight! Slide up a root to climb', 'Up the sinkhole, toward the moonlight! Hold up on a root to climb', 'Up the sinkhole, toward the moonlight! Hold up on a root to climb');
    climb(Math.round(R.r(280, 320)), 4);
    row(cur.x + 60, cur.x + cur.width - 60, cur.y - 34, 2, 'hibiscus');
    if (pk.learn === 1) hops(2);
    climb(Math.round(R.r(260, 300)), 3);
    flag();
  });

  // ---- Test: across and up (three versions), with the secret root
  beat('Test: zigzag up', () => {
    hint('Jump up to the rope, then slide along it', 'Jump up to the rope, then hold the way to go', 'Jump up to the rope, then hold the way to go', cur.y + 10);
    rope(Math.round(R.r(390, 440)), Math.round(R.r(300, 360)));
    climb(Math.round(R.r(270, 320)));
    rope(Math.round(R.r(390, 450)), Math.round(R.r(410, 450)));
    // the secret: a side root at the near end of this shelf, up to a dead end, with a hollow halfway (a golden seed inside)
    {
      const sx = Math.round(dir === 1 ? cur.x + 60 : cur.x + cur.width - 60);
      const h = Math.round(R.r(380, 420));
      trunk(sx, cur.y, cur.y - h);
      const hy = Math.round(cur.y - h * 0.5);
      hollows.push({ x: sx, y: hy });
      seedN++;
      C.push({ id: cid++, type: 'seed', x: sx, y: hy + 4, collected: false, bobPhase: seedN, findId: `seed-${seedN}` });
      const top = ledge(sx - 40, sx + 150, cur.y - h);
      row(top.x + 70, top.x + top.width - 25, top.y - 34, 2, 'hibiscus');
    }
    climb(Math.round(R.r(270, 320)));
    flag();
    if (pk.develop === 2) hint('Prowlers on the shelves! Punch, or hop past', 'Prowlers on the shelves! Punch, or hop past', 'Prowlers on the shelves! Punch, or hop past', cur.y + 10);
    let n = 0;
    while (expert < 140 - 44 && n < 30) {
      if (pk.develop === 0) rope(Math.round(R.r(390, 460)), Math.round(R.r(300, 380)), n % 2 ? 3 : 0);
      else if (pk.develop === 1) hops(R.i(4, 5), true); else if (n % 2 === 0 && n > 0) {
        if (!prowlShelf()) hops(2, true);
      } else hops(R.i(2, 3), n > 1);
      climb(Math.round(R.r(260, 320)));
      n++;
      if (n % 2 === 0) flag();
    }
  });

  // ---- Twist (three versions)
  beat('Twist: across the sinkhole', () => {
    dir = cur.x + cur.width / 2 < W / 2 ? 1 : -1;
    if (pk.twist === 0) {
      hint('A long way across. Keep sliding', 'A long way across. Keep holding the way to go', 'A long way across. Keep holding the way to go', cur.y + 10);
      const gap = Math.min(Math.round(R.r(900, 1050)), Math.round(room() - 340));
      rope(gap, 340, 6);
    } else if (pk.twist === 1) {
      // a long shelf out across the sinkhole, an ocelot at each end of its middle
      const len = Math.min(Math.round(R.r(1100, 1300)), Math.round(room() - 430));
      if (len >= 700) {
        rope(Math.round(R.r(380, 420)), len, 0);
        ocelot(cur.x + len * 0.33, cur.y, 200);
        ocelot(cur.x + len * 0.7, cur.y, 200);
      } else hops(5, true);
    } else {
      hops(5, true);
      climb(Math.round(R.r(260, 300)));
      hops(3, true);
    }
    flag();
  });

  // ---- Finish: up to the crown and the shrine
  beat('Finish: the crown', () => {
    climb(Math.round(R.r(280, 320)));
    if (pk.finish === 1) hops(3, true);
    else hops(2);
    if (room() < 620) turn();
    const tX = Math.round(dir === 1 ? cur.x + cur.width - 60 : cur.x + 60);
    const top = cur.y - 300;
    trunk(tX, cur.y, top);
    expert += 300 / CLIMB + 1;
    cur = dir === 1 ? ledge(tX - 40, Math.min(W - SINK_MARGIN, tX + 560), top) : ledge(Math.max(SINK_MARGIN, tX - 560), tX + 40, top);
    row(cur.x + 80, cur.x + cur.width - 80, top - 34, 3, 'hibiscus');
  });

  const crown = cur;
  // a flag too near a prowler's shelf moves to the far end of its shelf, or goes (levelCheck: 200 px, within 400 px up or down); a prowler
  // still too near the spawn or the shrine stays home
  const near = (e: Enemy, sp: { x: number; y: number }) => Math.abs(e.y + 18 - sp.y) < 400 && sp.x > e.patrolMinX - 230 && sp.x < e.patrolMaxX + 230;
  for (let i = checkpoints.length - 1; i >= 0; i--) {
    const f = checkpoints[i];
    if (!E.some((e) => near(e, f))) continue;
    const shelf = P.find((p) => p !== P[0] && Math.abs(p.y - f.y) < 1 && f.x >= p.x && f.x <= p.x + p.width);
    const moved = shelf && [shelf.x + 40, shelf.x + shelf.width - 40].map((x) => ({ x: Math.round(x), y: f.y, reached: false })).find((g) => !E.some((e) => near(e, g)));
    if (moved) checkpoints[i] = moved;
    else checkpoints.splice(i, 1);
  }
  const safe = [{ x: pk.mirror ? W - 200 : 200, y: 0 }, { x: crown.x + crown.width / 2, y: crown.y }];
  for (let i = E.length - 1; i >= 0; i--) if (safe.some((sp) => near(E[i], sp))) E.splice(i, 1);
  // the sinkhole: moss hanging under the shelves, mushrooms and ferns on them, the clawed rock and stalagmites on the floor, stalactites and
  // glowworm threads up in the dark (clear of the roots and the ropes); the pieces rotate with the roll (W3_DECOR_SETS)
  const w3decor: W3Decor[] = [];
  const clear = (x: number, y: number, half: number) =>
    V.every((v) => v.vineType !== 'tree_climb' || v.topY > y + 10 || v.bottomY < y - 10 || Math.abs(v.x - x) > half + 30) &&
    ROPES.every((r) => Math.abs(r.y + ROPE_RISE - y) > 20 || (Math.abs(r.x0 - x) > half + 30 && Math.abs(r.x1 - x) > half + 30)) &&
    E.every((e) => Math.abs(e.y - y) > 60 || x < e.patrolMinX - 60 || x > e.patrolMaxX + 60);
  let k = 0;
  const onShelf = pk.mirror ? (['fern', 'mushrooms', 'glowLit', 'mossCurtain'] as const) : (['mushrooms', 'fern', 'mossCurtain', 'glowLit'] as const);
  for (const p of P) {
    if (p === P[0] || p.width < 180) continue;
    const at = [0.5, 0.3, 0.7].map((u) => p.x + p.width * u).find((x) => clear(x, p.y, 50));
    if (at === undefined) continue;
    const kind = onShelf[k++ % 4];
    if (kind === 'mushrooms') w3decor.push({ n: 'mushrooms', x: at, b: p.y + 6, w: 80 });
    else if (kind === 'fern') w3decor.push({ n: 'fern', x: at, b: p.y + 6, w: 120, flip: k % 2 === 0 });
    else if (kind === 'mossCurtain') w3decor.push({ n: 'mossCurtain', x: p.x + p.width / 2, b: p.y + 14, w: Math.min(220, p.width * 0.7), hang: true });
    else w3decor.push({ n: 'glowLit', x: at, b: p.y + 20, w: 60, hang: true });
  }
  const floorSet = pk.decor.floor.filter((n) => n !== 'fern') as W3Decor['n'][];
  for (let fx = 200; fx < W - 200; fx += R.r(420, 620)) w3decor.push({ n: R.pick(floorSet), x: Math.round(fx), b: 8, w: Math.round(R.r(110, 170)) });
  // Matt's sinkhole sheet: the sinkhole's wet walls rising either side of the climb, and water trickling down to the floor
  const wallTop = Math.min(...P.map((p) => p.y)) - 300;
  const tileW = 340, tileH = Math.round((340 * 1200) / 1054);
  for (const wx of [tileW / 2 - 40, W - tileW / 2 + 40]) for (let wb = 8; wb > wallTop; wb -= tileH - 6) w3decor.unshift({ n: 'wallTile', x: Math.round(wx), b: Math.round(wb), w: tileW, flip: wx > W / 2 });
  for (const tx of [tileW + 60, W - tileW - 60]) w3decor.push({ n: 'trickle', x: Math.round(tx), b: 8, w: 96 });

  // shift down: the crown sits 400 px under the top of the stage, the floor 120 px over its bottom
  const shift = 400 - crown.y;
  for (const d of w3decor) d.b += shift;
  for (const p of P) p.y += shift;
  for (const v of V) { v.topY += shift; v.bottomY += shift; }
  for (const t of T) { t.groundY += shift; t.topY += shift; }
  for (const c of C) c.y += shift;
  for (const e of E) e.y += shift;
  for (const r of ROPES) { r.y += shift; r.g0 += shift; r.g1 += shift; }
  for (const cp of checkpoints) cp.y += shift;
  for (const h of hollows) h.y += shift;
  for (const h of hints) if (h.aboveY !== undefined) h.aboveY += shift;
  for (const b of beats) { b[0] += shift; b[1] += shift; }
  const floorY = P[0].y;
  const H = floorY + 120;
  const exitX = Math.round(crown.x + crown.width / 2 + (dir === 1 ? 140 : -140));
  C.push({ id: cid++, type: 'exit_totem', x: exitX, y: crown.y - 30, collected: false, bobPhase: 0 });
  cid = heartsAtFlags(C, checkpoints, cid);
  const movedPickups = fixPickups({ platforms: P, vines: V, ropes: ROPES }, C);
  const cfg: LevelConfig = { ...config, levelWidth: W, levelHeight: H };
  return {
    config: cfg,
    trees: T,
    platforms: P,
    vines: V,
    ropes: ROPES,
    enemies: E,
    boss: null,
    collectibles: C,
    spawnX: pk.mirror ? W - 200 : 200,
    spawnY: floorY,
    exitTotemX: exitX,
    exitTotemY: crown.y,
    checkpoints: checkpoints.sort((a, b) => b.y - a.y),
    meta: { attempt: seed, chunks: [], width: W, timing: { layoutSeconds: expert, decorSeconds: 0, route: H } },
    proto: { hints, covers: [], beats, movedPickups, hollows, w3decor },
  };
}
