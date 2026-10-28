/**
 * 4-9 The Aerie (World 4's last stage before the Sky Sovereign, 4-10): the long climb up the last cliffs to her aerie, a gauntlet of
 * everything World 4 taught, two at a time. The new twist is the wind on the aerie's narrow ledges: a capuchin guard paces each one
 * (capuchin.ts `blowOff`), and the gust that blows along the ledge blows it clean off. It is back up in a couple of seconds, so the way
 * is only clear for a sloth who is right behind it as the gust hits: read the chimes, get up close, run. Each guard blown off while he
 * is near counts toward the stage's goal (a gauntlet: GUARD_GOAL_49 guards).
 *
 *   1. START    the aerie in view: Dot sees it at the top of the cliffs and the Sovereign's shadow sweeps over (w4Play omens). Terraces,
 *               a rock coming loose (4-1) and a gust over a little pit with its chimes (4-2), each with a short reminder.
 *   2. LEARN    off the ledge: a guard on a narrow ledge over a drop, in a gust lane, twice.
 *   3. DEVELOP  Dot and the boulder: a vine tied up under its knot (4-4) up a tall cliff, and a guard at the top; then water pouring
 *               over a gap (4-8) whose shelf is reached up a vine Dot unties, or a tree. A second knot, off the way, hides the golden
 *               seed: from its perch only the leaf reaches a ledge behind the leaves.
 *   4. TWIST    over the drop: gaps only the leaf crosses (4-7), with rocks dropping through them (the grit trickles first) and warm
 *               air rising under one; then a guard on the edge of a high perch, and the glide on the gust that blows it off.
 *   5. TWIST    the mist and the winds: a column of ledges hidden in mist up a tall cliff (4-6), shown by standing still at its foot,
 *               with a gust lane across it (climb in the calm); one of her feathers drifts down at the top; then two guards on two
 *               ledges whose gusts take turns, half a beat apart.
 *   6. FINISH   to the aerie: the ideas again in new pairs (a knot and a guard, a guard and a rock, the boulder), a flag after each,
 *               until a quick player has had about five minutes (stageSeconds('4-9')); her shadow once more, and Dot at the gate.
 *
 * Everything is built as solid terraces down to the cliff's foot, and every drop (under a ledge, under a glide) has a floor with steps
 * back up the near side: a miss costs a climb, never a life. Built from y = 0 upward (up is negative) and shifted down at the end.
 */
import { fixPickups } from './flowerReach.ts';
import { heartsAtFlags, stageSeconds, stream, type LeafCover, type ProtoExtras, type StageHint } from './protoStage.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import { BLOW_OFF, type Capuchin } from './capuchin.ts';
import { reachGlide, reachJump } from './physics.ts';
import { ROCK, rockFits, type RockDrop } from './rockfall.ts';
import { PATIENCE, type PatienceSpot } from './patience.ts';
import { DOT_HELP, type Chime, type DotKnot } from './w4Kit.ts';
import { FALLS, type Waterfall } from './waterfalls.ts';
import type { Omen, Updraft } from './w4Play.ts';
import type { Zone } from './zones.ts';
import type { Collectible, LevelConfig, Platform, TreeStructure, Vine } from './types.ts';
import { PAST_SHRINE } from './rules.ts';
import { W4Roll } from './w4Sections.ts';

/** the aerie's goal: guards blown off their ledges (the stage holds more than this, and every one stands on the way) */
export const GUARD_GOAL_49 = 8;
/** the pieces' sizes: a guard's ledge, the drop under a ledge or a glide and its steps, the boulder, and the water over its gap */
export const AERIE = { pass: [620, 680], deep: 400, step: 100, tread: 90, boulder: { w: 100, h: 84 }, lip: 60, head: 280 } as const;
/** a gust lane's rhythm (s), as 4-2's; the lane across the mist is slower, so the calm is long enough to climb it */
const GUST = { idle: 2.8, warn: 1.4, active: 2.2, force: 120 } as const;
const MIST_GUST = { idle: 4.4, warn: 1.4, active: 1.8, force: 100 } as const;
const MIST_LANE = 150;
const MIST_STEP = 130;
const MIST_FILL = 3;

/** what the tests read back about the stage's puzzles (platform ids, zone indexes, guard indexes) */
export interface Aerie49 {
  /** the expert seconds at which each flag stands (spawn first, the exit last) */
  flagSeconds: number[];
  guards: Array<{ monkey: number; ledge: number; lane: number; kind: 'pass' | 'perch'; far: number }>;
  knots: Array<{ knot: number; vine: number; top: number; secret?: boolean }>;
  falls: Array<{ fall: number; shelf: number; boulder: number; far: number }>;
  glides: Array<{ from: number; to: number; rock?: number; draft?: number }>;
  mists: Array<{ spot: number; foot: number; ledges: number[]; top: number; lane: number }>;
  secret: { perch: number; ledge: number } | null;
  /** the terraces (platform ids): solid rock from their tops down to the cliff's foot */
  blocks: number[];
}

export function buildAerie(config: LevelConfig, seed: number): GeneratedStage & { proto: ProtoExtras; aerie49: Aerie49 } {
  const R = stream(seed);
  const P: Platform[] = [];
  const V: Vine[] = [];
  const T: TreeStructure[] = [];
  const C: Collectible[] = [];
  const checkpoints: Array<{ x: number; y: number; reached: boolean }> = [];
  const hints: StageHint[] = [];
  const beats: Array<[number, number, string]> = [];
  const covers: LeafCover[] = [];
  const Z: Zone[] = [];
  const chimes: Chime[] = [];
  const knots: DotKnot[] = [];
  const monkeys: Capuchin[] = [];
  const falls: Waterfall[] = [];
  const rocks: RockDrop[] = [];
  const patience: PatienceSpot[] = [];
  const updrafts: Updraft[] = [];
  const omens: Omen[] = [];
  /** the petals out along a glide (the level check counts them; flowerReach does not know the leaf) */
  const drift = new Set<Collectible>();
  /** the terraces: solid rock from the top down to the cliff's foot (their heights are set once the foot is known) */
  const blocks = new Set<Platform>();
  const info: Aerie49 = { flagSeconds: [0], guards: [], knots: [], falls: [], glides: [], mists: [], secret: null, blocks: [] };
  let pid = 1, vid = 1, tid = 1, cid = 1, fid = 1;
  /** how long a quick, sure player takes (s): running 285 px/s, climbing 220, pushing 120 */
  let expert = 0;
  const RUN = 285, CLIMB = 220, PUSH = 120;
  /** the seconds Dot takes, from standing still under a knot to the vine down for him */
  const DOT = DOT_HELP.ask + DOT_HELP.fly + DOT_HELP.pick + 0.8;
  const r = Math.round;

  // ----- the kit -----
  const block = (x0: number, x1: number, top: number) => {
    const p: Platform = { id: pid++, x: r(x0), y: r(top), width: r(x1) - r(x0), height: 100, type: 'solid', style: 'log' };
    P.push(p);
    blocks.add(p);
    return p;
  };
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
  /** a vine down a bare cliff from `topY`, tied up out of reach under its knot until Dot frees it (w4Play tiedBottom) */
  const knotVine = (vx: number, topY: number, groundY: number, secret = false) => {
    const id = vid++;
    V.push({ id, x: r(vx), topY: r(topY) - 2, bottomY: r(groundY) - 6, swaySpeed: 0.9, swayPhase: 0, vineType: 'tree_climb', rope: true });
    knots.push({ x: r(vx), y: r(topY) + 18, x0: r(vx) - 44, x1: r(vx) + 44, ground: r(groundY), releases: { kind: 'vine', id } });
    for (let i = 0; i < 3; i++) flower(vx, groundY - 80 - (i * (groundY - topY - 140)) / 2, 'hibiscus');
    return { knot: knots.length - 1, vine: id, secret };
  };
  const flower = (x: number, y: number, v: Collectible['botanicalVariant'] = 'orchid') => {
    const c: Collectible = { id: cid++, type: 'flower', botanicalVariant: v, x: r(x), y: r(y), collected: false, bobPhase: (x * 0.031) % 6.28 };
    C.push(c);
    return c;
  };
  const row = (x0: number, x1: number, y: number, n: number, v: Collectible['botanicalVariant'] = 'orchid') => {
    for (let i = 0; i < n; i++) flower(x0 + ((x1 - x0) * i) / Math.max(1, n - 1), y, v);
  };
  /** a line Dot says the first time he passes x (`pad` and `keys`: the same for the on-screen pad and a keyboard) */
  const hint = (x: number, text: string, pad = text, keys = text) => hints.push({ x: r(x), text, pad, keys });
  /** a gust lane over [x0, x1] along the ledge at `base`, its chimes on a post at chimeX; returns its index */
  const lane = (x0: number, x1: number, dir: 1 | -1, chimeX: number, base: number, o: { top?: number; bottom?: number; offset?: number; rhythm?: typeof GUST | typeof MIST_GUST } = {}) => {
    const g = o.rhythm ?? GUST;
    const period = g.idle + g.warn + g.active;
    Z.push({
      kind: 'wind', x0: r(x0), x1: r(x1), top: r(o.top ?? base - 560), bottom: r(o.bottom ?? base + 40), baseY: r(base), dir, period, warn: g.warn,
      active: g.active, force: g.force, offset: Math.round(((o.offset ?? R.r(0, period)) % period) * 10) / 10,
    });
    chimes.push({ x: r(chimeX), y: r(base), zone: Z.length - 1 });
    return Z.length - 1;
  };

  // ----- the cursor: `x` is the open end of the terrace he is on, at height `y`; it started at `from` -----
  let x = 0, y = 0, from = 0;
  const run = (len: number) => { x += Math.round(len); };
  const end = () => {
    if (x - from > 1) block(from, x, y);
    from = x;
  };
  const up = (rise: number, tread: number) => {
    end();
    y -= r(rise);
    x += r(tread);
  };
  /** a new terrace from `at`, at height `top` */
  const open = (at: number, top: number) => {
    x = r(at);
    from = x;
    y = r(top);
  };
  const flag = (back = 80) => {
    checkpoints.push({ x: r(x - back), y: r(y), reached: false });
    info.flagSeconds.push(expert);
  };
  const beat = (name: string, f: () => void) => {
    const x0 = x;
    f();
    beats.push([r(x0), r(x), name]);
  };
  /**
   * the drop under a ledge or a glide, from e0 to e1 below the terrace at `top`: a floor `deep` down, and steps back up the near side
   * (each a hop, the highest one under the near end), so whatever falls in climbs back out where it came from
   */
  function chasm(e0: number, e1: number, top: number, deep: number) {
    const n = Math.round(deep / AERIE.step) - 1;
    for (let k = 1; k <= n; k++) block(e0 + (k - 1) * AERIE.tread, e0 + k * AERIE.tread, top + k * AERIE.step);
    block(e0 + n * AERIE.tread, e1, top + deep);
  }

  // ----- the pieces (each starts and ends on the terrace he is on) -----
  /** a stretch of terrace with a few flowers */
  function rest(len: number) {
    const x0 = x;
    run(len);
    if (len > 260) row(x0 + 80, x - 80, y - 34, Math.max(2, r(len / 170)), R.pick(['orchid', 'hibiscus'] as const));
    expert += len / RUN;
  }
  /**
   * a mossy rock on the terrace, one easy hop high, a petal on it, and a breath of plain terrace past it: between two pieces
   * (2026-10-28, the stage inspector: the plain walks between the pieces were up to seven quiet seconds)
   */
  function hopRest(after = R.r(150, 180)) {
    run(R.r(80, 110));
    // (the painted mossy rock, sized to it: art 'rock', protoArt drawRockArt)
    const w = r(R.r(84, 96));
    P.push({ id: pid++, x: x, y: y - 40, width: w, height: 40, type: 'solid', style: 'moss_stone', art: 'rock' });
    flower(x + w / 2, y - 74, 'orchid');
    run(w + after);
    expert += (95 + w + after) / RUN + 0.2;
  }
  /** a few dry steps up, a flower on each */
  function stairs(n: number) {
    for (let i = 0; i < n; i++) {
      const tread = R.r(200, 230);
      up(R.r(84, 96), tread);
      flower(x - tread / 2, y - 34, i % 2 ? 'orchid' : 'hibiscus');
      expert += 0.5 + tread / RUN;
    }
  }
  /** a cliff too tall to jump, and a tree at its foot to climb it */
  function treeUp(h: number) {
    const x0 = x;
    run(R.r(200, 240));
    const tX = x - 50;
    const y0 = y;
    end();
    y -= r(h);
    trunk(tX, y0, y);
    for (let i = 0; i < 3; i++) flower(tX, y0 - 80 - ((h - 140) * i) / 2, 'hibiscus');
    run(R.r(180, 220));
    expert += (x - x0) / RUN + h / CLIMB + 1;
  }
  /** a long terrace where a rock comes loose from the cliff above (4-1): stop short of the shadow, go once it has fallen */
  let rocksSaid = false;
  function rockRest(len: number) {
    const x0 = x;
    if (!rocksSaid) hint(x0 + 20, 'Rocks coming loose up here too! Stop before the shadow, and go once it has fallen');
    rocksSaid = true;
    run(len);
    const rx = r(x0 + len * R.r(0.45, 0.6));
    const rock: RockDrop = { x: rx, top: y - 460, land: y, every: Math.round(R.r(4.6, 5.6) * 10) / 10, warn: 1.4, offset: Math.round(R.r(0, 5) * 10) / 10 };
    row(x0 + 80, x - 80, y - 34, Math.max(2, r(len / 170)), 'orchid');
    // (no flower where the rock lands: he should not be tempted to stand there)
    for (let i = C.length - 1; i >= 0; i--) if (C[i].type === 'flower' && Math.abs(C[i].x - rx) < ROCK.radius + 50 && Math.abs(C[i].y - (y - 34)) < 4) C.splice(i, 1);
    if (rockFits(rock)) rocks.push(rock);
    expert += len / RUN + 1.6;
  }
  /** a little pit with a gust lane over it, its chimes on the near side (4-2): jump with the wind behind, or wait for it to drop */
  function gustPit(dir: 1 | -1) {
    const x0 = x;
    run(R.r(260, 300));
    const E = x;
    end();
    const one = reachJump(0, false);
    // (the level check keeps every gap under a gust within a safe plain jump, and a headwind's within the double jump)
    const gap = r(dir > 0 ? Math.min(one * R.r(0.66, 0.72), 128) : Math.min(one * 0.56, 96));
    block(E, E + gap, y + 130);
    open(E + gap, y);
    if (dir > 0) for (let i = 0; i < 3; i++) flower(E + gap / 2 + (i - 1) * 70, y - 130 + Math.abs(i - 1) * 30, 'hibiscus');
    run(R.r(240, 280));
    lane(E - 170, E + gap + 110, dir, E - 120, y);
    expert += (x - x0) / RUN + (dir < 0 ? 3.2 : 1.2);
  }
  /**
   * the new twist: a narrow ledge over a drop with a capuchin guard pacing its far half, in a gust lane, its chimes before it. On its
   * feet the guard will not let him by (nor over: nothing near is higher than a jump over it); the gust blows it clean off, and it is
   * back on its ledge BLOW_OFF seconds later. `lead`: steps up to it first, so nothing behind is high enough to glide over it from.
   */
  function guardPass(dir: 1 | -1, lead = true, beside?: { rock?: boolean }) {
    const x0 = x;
    if (lead) stairs(2);
    run(R.r(270, 310));
    const E = x;
    end();
    const L = r(R.r(AERIE.pass[0], AERIE.pass[1]));
    const ledge = shelf(E, E + L, y);
    chasm(E, E + L, y, AERIE.deep);
    const gx0 = E + L - 320, gx1 = E + L - 200;
    monkeys.push({ job: 'guard', x: r((gx0 + gx1) / 2), y, x0: gx0, x1: gx1, blowOff: BLOW_OFF });
    row(E + 60, gx0 - 120, y - 34, 2, 'orchid');
    row(gx1 + 60, E + L - 40, y - 34, 2, 'hibiscus');
    const z = lane(E - 260, E + L + 80, dir, E - 200, y);
    info.guards.push({ monkey: monkeys.length - 1, ledge: ledge.id, lane: z, kind: 'pass', far: E + L });
    open(E + L, y);
    if (beside?.rock) {
      // a rock coming loose just past the ledge: through the guard, then stop short of the shadow
      run(R.r(340, 400));
      const rock: RockDrop = { x: r(E + L + R.r(180, 220)), top: y - 460, land: y, every: Math.round(R.r(4.8, 5.6) * 10) / 10, warn: 1.4, offset: Math.round(R.r(0, 5) * 10) / 10 };
      if (rockFits(rock)) rocks.push(rock);
      expert += 1.6;
    }
    run(R.r(190, 230));
    // (a quick player waits half a gust's cycle on average)
    expert += (E - x0) / RUN + (GUST.idle + GUST.warn + GUST.active) / 2 + (x - E) / RUN;
  }
  /**
   * a gap only the leaf crosses: the next terrace `dy` lower and further than any jump goes (4-7), with the drop under it. `rock`: a
   * rock drops through the middle of the glide on its own rhythm (the grit trickles first). `draft`: warm air rises in it. `runIn`:
   * the terrace runs on a way first. `ledge`: he sets off from the end of this narrow ledge out over the drop (the drop runs back
   * under it to the terrace it juts from). Returns the gap's near edge.
   */
  function glideGap(o: { rock?: boolean; draft?: boolean; runIn?: boolean; ledge?: Platform } = {}) {
    const x0 = x;
    if (o.runIn !== false) run(R.r(260, 300));
    const E = x;
    const A = y;
    end();
    const leafMax = (d: number) => reachGlide(-d, true) * 0.97 - 70 - 40;
    const jumpMax = (d: number) => reachJump(-d, true) * 1.12;
    let dy = r(R.r(130, 180));
    while (leafMax(dy) - jumpMax(dy) < 120 && dy < 260) dy += 20;
    const gap = r(jumpMax(dy) + (leafMax(dy) - jumpMax(dy)) * R.r(0.25, 0.5));
    const deep = Math.ceil((dy + 240) / AERIE.step) * AERIE.step;
    chasm(o.ledge ? o.ledge.x : E, E + gap, A, deep);
    // petals down the drift, each no further out than the leaf carries from the terrace at its height
    const yAt = (u: number) => A - 20 + dy * u * u;
    let reach = 0.6;
    while (reach > 0.2 && gap * reach > reachGlide(-(yAt(reach) - A), false) * 0.97 - 70 - 20) reach -= 0.05;
    if (gap * reach >= 150) {
      for (let i = 1; i <= 3; i++) {
        const u = (reach * i) / 3;
        drift.add(flower(E + gap * u, yAt(u), 'orchid'));
      }
    }
    const g: Aerie49['glides'][number] = { from: -1, to: -1 };
    if (o.rock) {
      const rock: RockDrop = { x: r(E + gap * 0.5), top: A - 420, land: A + deep, every: Math.round(R.r(4.8, 5.6) * 10) / 10, warn: 1.4, offset: Math.round(R.r(0, 5) * 10) / 10, air: true };
      if (rockFits(rock)) {
        rocks.push(rock);
        g.rock = rocks.length - 1;
        expert += 1.8;
      }
    }
    if (o.draft) {
      updrafts.push({ x0: r(E + gap * 0.3), x1: r(E + gap * 0.7), top: A - 260, bottom: A + deep });
      g.draft = updrafts.length - 1;
    }
    const near = o.ledge ?? P.find((p) => blocks.has(p) && p.y === A && p.x + p.width === E);
    open(E + gap, A + dy);
    run(R.r(250, 290));
    end();
    const far = P[P.length - 1];
    g.from = near?.id ?? -1;
    g.to = far.id;
    info.glides.push(g);
    row(far.x + 80, far.x + far.width - 60, far.y - 34, 2, 'hibiscus');
    expert += (E - x0) / RUN + gap / RUN + 0.8 + (x - E - gap) / RUN;
    return E;
  }
  /**
   * a guard on the edge of a high perch, and a gap only the leaf crosses beyond it: a gust lane along the perch and out over the drop,
   * behind him. The gust blows the guard off the edge; run past and set off with it behind you.
   */
  function guardPerch() {
    const x0 = x;
    stairs(2);
    run(R.r(300, 360));
    // the perch's edge: a narrow ledge jutting out over the drop, the guard pacing its far end
    const E0 = x;
    end();
    const L = r(R.r(540, 580));
    const ledge = shelf(E0, E0 + L, y);
    x = E0 + L;
    from = x;
    const E = x;
    const gx0 = E - 340, gx1 = E - 220;
    monkeys.push({ job: 'guard', x: r((gx0 + gx1) / 2), y, x0: gx0, x1: gx1, blowOff: BLOW_OFF });
    flower(E0 + 80, y - 34, 'orchid');
    const A = y;
    const z = lane(E0 - 260, E + 520, 1, E0 - 200, A);
    glideGap({ runIn: false, ledge });
    const g = info.glides[info.glides.length - 1];
    info.guards.push({ monkey: monkeys.length - 1, ledge: g.from, lane: z, kind: 'perch', far: E });
    expert += (E - x0) / RUN + (GUST.idle + GUST.warn + GUST.active) / 2;
  }
  /** a cliff too tall to jump with a vine down it tied up under its knot: stand still under it, and Dot unties it */
  function knotWall(h: number) {
    const x0 = x;
    run(R.r(320, 380));
    const E = x;
    const yA = y;
    end();
    y -= r(h);
    const k = knotVine(E - 50, y, yA);
    run(R.r(260, 320));
    // (the top terrace starts at the cliff's edge: tested below once it is closed)
    info.knots.push({ ...k, top: -1 });
    pendingTop.push(info.knots.length - 1);
    expert += (E - x0) / RUN + DOT + h / CLIMB + 0.8 + (x - E) / RUN;
  }
  /** the knots whose top terrace has not been closed yet */
  const pendingTop: number[] = [];
  const closeTops = () => {
    for (const i of pendingTop.splice(0)) {
      const k = info.knots[i];
      const v = V.find((q) => q.id === k.vine)!;
      k.top = P.find((p) => blocks.has(p) && p.y === v.topY + 2 && p.x === v.x + 50)?.id ?? -1;
    }
  };
  /**
   * water pouring over a gap from high on the cliff (4-8): up a tree (or a knotted vine) to a shelf with a boulder on it, and the gap
   * past the shelf's end to the next terrace, under the water. Roll the boulder to the shelf's end, under the spout, and the water runs
   * off it; then the gap is a jump from the top of the boulder.
   */
  function plugFall(rope: boolean) {
    const x0 = x;
    run(R.r(260, 300));
    const tX = r(x);
    const yA = y;
    const sy = r(yA - R.r(230, 245));
    const shelfEnd = tX + r(R.r(360, 400));
    const sh = shelf(tX - 40, shelfEnd, sy);
    if (rope) {
      const k = knotVine(tX, sy, yA);
      info.knots.push({ ...k, top: sh.id });
    } else {
      trunk(tX, yA, sy);
      for (let i = 0; i < 3; i++) flower(tX, yA - 80 - (i * (yA - sy - 140)) / 2, 'hibiscus');
    }
    const { w: BW, h: BH } = AERIE.boulder;
    const boulder: Platform = { id: pid++, x: tX + 70, y: sy - BH, width: BW, height: BH, type: 'solid', style: 'moss_stone', push: { min: tX + 60, max: shelfEnd } };
    P.push(boulder);
    const gap = r(R.r(220, 240));
    // the terrace runs on under the shelf to the foot of the next cliff, where the water lands
    x = shelfEnd + gap;
    end();
    falls.push({ id: fid, x: shelfEnd - AERIE.lip, width: gap + AERIE.lip, top: sy - AERIE.head, bottom: yA, plug: { platformId: boulder.id, atX: shelfEnd - BW } });
    open(shelfEnd + gap, sy);
    run(R.r(260, 300));
    end();
    info.falls.push({ fall: fid, shelf: sh.id, boulder: boulder.id, far: P[P.length - 1].id });
    fid++;
    row(shelfEnd + gap + 80, x - 60, sy - 34, 2, 'hibiscus');
    expert += (tX - x0) / RUN + (yA - sy) / CLIMB + (rope ? DOT : 0.5) + (shelfEnd - BW - tX - 70) / PUSH + FALLS.dry + 1.4 + (x - shelfEnd - gap) / RUN;
  }
  /**
   * the mist (4-6) up a tall cliff: a column of small ledges hidden in it, shown by standing still at its foot, and a gust lane across
   * the column, its chimes at the foot (the lane stands clear of the foot, so waiting there is never pushed): settle the mist, wait
   * for the wind to drop, and climb the way you saw in the calm. A slip lands back at the foot.
   */
  function mistClimb(first: boolean) {
    const x0 = x;
    // (long enough that a mossy rock before it stands clear of the mist's band: hopRest)
    run(R.r(640, 680));
    const E = x;
    const foot = y;
    end();
    const n = R.i(4, 5);
    const rise = R.i(66, 72);
    const cx = E - 250;
    const hidden: number[] = [];
    let ln = R.i(-1, 1);
    for (let i = 1; i <= n; i++) {
      if (i > 1) ln += R.chance(0.2) ? 0 : R.pick([-1, 1].filter((m) => Math.abs(ln + m) <= 1));
      const lx = cx + ln * MIST_LANE;
      hidden.push(shelf(lx - MIST_STEP / 2, lx + MIST_STEP / 2, foot - i * rise).id);
      expert += 0.8;
    }
    const top = shelf(E - 470, E, foot - (n + 1) * rise);
    hidden.push(top.id);
    if (first) {
      hint(cx - 560, 'Mist again! Stand still at the foot and it settles to show the ledges. Then remember the way');
      hint(cx - 260, 'And the wind blows across it. Wait for the chimes to stop, then climb in the calm');
      // while he stands still for the mist, one of the Sovereign's feathers drifts down through it; Dot says so at the top
      omens.push({ kind: 'feather', x: cx - 160, y: foot });
      hint(E + 120, 'That feather was hers. She is not far now');
    }
    patience.push({
      kind: 'mist', x0: cx - 100, x1: cx + 100, y: foot, fill: MIST_FILL, hides: hidden,
      // (the band covers the column's stretch only: the drops and terraces at its height further on stay clear)
      area: { top: top.y - 30, bottom: foot - 40, x0: cx - 240, x1: E - 10 },
      view: { x: cx, y: r((foot + top.y) / 2) },
    });
    const z = lane(cx - 260, E - 10, R.chance(0.5) ? 1 : -1, cx - 170, foot, { top: top.y - 200, bottom: foot - 30, rhythm: MIST_GUST });
    info.mists.push({ spot: patience.length - 1, foot: P.find((p) => blocks.has(p) && p.y === foot && p.x + p.width === E)!.id, ledges: hidden.slice(0, -1), top: top.id, lane: z });
    open(E, top.y);
    run(R.r(320, 380));
    const cycle = MIST_GUST.idle + MIST_GUST.warn + MIST_GUST.active;
    expert += (E - x0) / RUN + MIST_FILL + PATIENCE.settle + cycle / 3 + 0.8 + (x - E) / RUN;
  }
  /** two guards on two ledges, with a terrace between them, in two gust lanes whose gusts take turns half a beat apart */
  function guardPair() {
    const x0 = x;
    stairs(2);
    run(R.r(270, 310));
    const period = GUST.idle + GUST.warn + GUST.active;
    const off = R.r(0, period);
    const one = (dir: 1 | -1, offset: number, chimeBack: number, laneBack: number) => {
      const E = x;
      end();
      const L = r(R.r(AERIE.pass[0], AERIE.pass[1]));
      const ledge = shelf(E, E + L, y);
      chasm(E, E + L, y, AERIE.deep);
      const gx0 = E + L - 320, gx1 = E + L - 200;
      monkeys.push({ job: 'guard', x: r((gx0 + gx1) / 2), y, x0: gx0, x1: gx1, blowOff: BLOW_OFF });
      row(gx1 + 60, E + L - 40, y - 34, 2, 'hibiscus');
      const z = lane(E - laneBack, E + L + 60, dir, E - chimeBack, y, { offset });
      info.guards.push({ monkey: monkeys.length - 1, ledge: ledge.id, lane: z, kind: 'pass', far: E + L });
      open(E + L, y);
    };
    one(1, off, 200, 260);
    run(R.r(300, 330));
    one(R.chance(0.5) ? 1 : -1, off + period / 2, 160, 220);
    run(R.r(240, 280));
    expert += (x - x0) / RUN + period / 2 + 1;
  }
  /**
   * the secret: a vine tied up on a bare cliff over the terrace, to a little perch, and out past its end, behind leaves, a ledge with a
   * golden seed that only the leaf reaches (too high for any jump from the terrace). The terrace runs on underneath for a long way, so
   * nothing past it can be reached from up there.
   */
  function secretKnot() {
    const x0 = x;
    run(R.r(280, 340));
    const vx = r(x);
    const py = y - 330;
    const perch = shelf(vx - 40, vx + 150, py);
    const k = knotVine(vx, py, y, true);
    info.knots.push({ ...k, top: perch.id });
    const drop = 80;
    const jumpMax = reachJump(-drop, true) * 1.12;
    const leafMax = reachGlide(-drop, true) * 0.97 - 70 - 40;
    const sx = r(perch.x + perch.width + jumpMax + (leafMax - jumpMax) * R.r(0.3, 0.5));
    const ledge = shelf(sx, sx + 140, py + drop);
    C.push({ id: cid++, type: 'seed', x: sx + 80, y: ledge.y - 34, collected: false, bobPhase: 1, findId: 'seed-1' });
    covers.push({ x: sx - 30, y: ledge.y - 90, w: 200, h: 120 });
    info.secret = { perch: perch.id, ledge: ledge.id };
    hint(vx - 320, 'Another vine tied up, on a bare bit of cliff... what is it for?');
    // the terrace runs on underneath, far enough that nothing past it is reached from up there: two mossy rocks to hop on it
    const end0 = sx + 140 + 760;
    x = Math.max(x, vx + 200);
    expert += (x - x0) / RUN;
    while (end0 - x > 520) hopRest(R.r(160, 200));
    hopRest(Math.max(120, end0 - x - 240));
  }

  // ======================= the stage =======================
  beat('Start: the aerie above', () => {
    // (Dot sees the aerie and the Sovereign's shadow sweeps over: a deliberate pause, then a hop and the steps)
    rest(R.r(560, 600));
    hint(120, 'There, Pokey. Way up at the top of the cliffs, that heap of sticks. That is her aerie');
    omens.push({ kind: 'shadow', x: r(x), y });
    hint(x + 320, 'That was her. She is up there. Keep going, and keep low');
    hopRest(R.r(140, 180));
    stairs(3);
    rockRest(R.r(480, 560));
    flag();
    treeUp(R.r(300, 330));
    hint(x + 20, 'The chimes! They ring before the wind blows. Jump with it behind you');
    gustPit(1);
    hopRest();
    flag();
  });
  beat('Learn: off the ledge', () => {
    hint(x - 200, `Guards on the ledges up here. ${GUARD_GOAL_49} of them stand between us and her`);
    hint(x + 560, 'See it pacing, right where the wind blows? Get up close behind it. The gust blows it clean off, so run!');
    guardPass(1, true);
    flag();
    hint(x + 20, 'It climbs back up quick. Be right behind it when the gust comes');
    guardPass(1, true);
    flag();
  });
  // (2026-10-28, the variety pass: 200 rolls of 4-9 were 97% alike. The roll (w4Sections.ts) orders the Develop's three parts after
  // the knot, the second Twist's two, and the finish draws its pairs from a bag leaning to the roll's theme: the guards, the falls and
  // rocks, or the climbs)
  const roll = new W4Roll(seed, '4-9');
  beat('Develop: Dot and the boulder', () => {
    hopRest();
    hint(x + 60, 'Tied up again! Stand still under the knot, and I will fly up');
    knotWall(R.r(290, 320));
    hint(x + 20, 'And a guard at the top. Wait for the chimes');
    guardPass(R.chance(0.5) ? 1 : -1, false);
    closeTops();
    flag();
    const plug = () => {
      hopRest();
      hint(x + 40, 'Water pours over that gap. Get up top and keep sliding into the boulder to roll it under the water', 'Water pours over that gap. Get up top and hold the pad into the boulder to roll it under the water', 'Water pours over that gap. Get up top and hold right into the boulder to roll it under the water');
      plugFall(R.chance(0.5));
      flag();
    };
    const secret = () => {
      hopRest();
      secretKnot();
      flag();
    };
    if (roll.pick(['plugFirst', 'secretFirst'] as const) === 'plugFirst') { plug(); secret(); }
    else { secret(); plug(); }
  });
  beat('Twist: over the drop', () => {
    hint(x + 60, 'Too far to jump. Jump, and keep your thumb on the glass to open your leaf', 'Too far to jump. Jump, and hold Jump to open your leaf', 'Too far to jump. Jump, and hold Space to open your leaf');
    glideGap();
    hopRest(R.r(120, 160));
    hint(x + 40, 'Grit trickling down! A rock is coming through. Wait for it to pass, then glide');
    glideGap({ rock: true });
    flag();
    hopRest(R.r(120, 160));
    hint(x + 40, 'Warm air rising out of the drop! Glide into it and it lifts you');
    glideGap({ draft: true, rock: R.chance(0.5) });
    flag();
    hint(x + 40, 'A guard on the edge! When the wind blows it off, run, and glide with the gust behind you');
    guardPerch();
    flag();
  });
  beat('Twist: the mist and the turning wind', () => {
    const mist = () => {
      mistClimb(true);
      flag();
    };
    const pair = () => {
      hint(x + 40, 'Two guards, and their winds take turns. Pass the first, keep going, and be behind the second when its gust comes');
      guardPair();
      flag();
    };
    if (roll.pick(['mistFirst', 'pairFirst'] as const) === 'mistFirst') { mist(); pair(); }
    else { pair(); hopRest(); mist(); }
  });
  type Piece49 = 'knot' | 'rocks' | 'plug' | 'climb' | 'glide' | 'pair';
  const theme = roll.theme('finish', ['guards', 'falls', 'climbs'] as const);
  const counts: Record<typeof theme, Record<Piece49, number>> = {
    guards: { knot: 1, rocks: 2, plug: 1, climb: 1, glide: 0, pair: 2 },
    falls: { knot: 1, rocks: 1, plug: 2, climb: 0, glide: 2, pair: 0 },
    climbs: { knot: 2, rocks: 0, plug: 1, climb: 2, glide: 1, pair: 0 },
  };
  const bag = roll.bag<Piece49>(['knot', 'rocks', 'plug', 'climb', 'glide', 'pair'], (k) => counts[theme][k]);
  beat('Finish: to the aerie', () => {
    // the ideas again in new pairs, a flag after each, until a quick player has had about five minutes (stageSeconds('4-9'))
    let n = 0;
    let rocksSaid = false;
    let plugs = 0;
    while (expert < stageSeconds('4-9') - 16 && n < 24) {
      const k = bag.draw()!;
      if (k === 'knot') {
        knotWall(R.r(290, 320));
        guardPass(R.chance(0.5) ? 1 : -1, false);
        closeTops();
      } else if (k === 'rocks') {
        if (!rocksSaid) hint(x + 40, 'A guard, and rocks past its ledge. Through, then stop short of the shadow');
        rocksSaid = true;
        guardPass(1, true, { rock: true });
      } else if (k === 'plug') {
        plugs++;
        plugFall(R.chance(0.5));
        rockRest(R.r(480, 560));
      } else if (k === 'climb') {
        if (R.chance(0.5)) mistClimb(false);
        else treeUp(R.r(300, 330));
        guardPass(R.chance(0.5) ? 1 : -1, true);
      } else if (k === 'glide') {
        glideGap({ rock: R.chance(0.5), draft: R.chance(0.5) });
      } else guardPair();
      hopRest();
      flag();
      n++;
    }
    // (the finish always holds a second boulder fall: the stage's falls come back once more before her aerie)
    if (!plugs) {
      plugFall(R.chance(0.5));
      hopRest();
      flag();
    }
    // (hops on the way to the gate make up any last seconds the dice left short: to within the walk to her gate, so no make-up walk
    // after it runs the quiet past four seconds, 2026-10-28)
    for (let k = 0; k < 12 && expert < stageSeconds('4-9') - 3; k++) hopRest();
    stairs(3);
    omens.push({ kind: 'shadow', x: r(x), y });
    hint(x + 40, 'Her aerie is right above us, Pokey. I am staying right beside you. All the way up');
    // (the walk to her gate: a deliberate few quiet seconds before the fight)
    rest(R.r(640, 680));
    if (expert < stageSeconds('4-9')) rest((stageSeconds('4-9') - expert) * RUN + 60);
  });
  const exitX = r(x - 220);
  end();
  C.push({ id: cid++, type: 'exit_totem', x: exitX, y: y - 30, collected: false, bobPhase: 0 });
  for (let i = C.length - 1; i >= 0; i--) if (C[i].x > exitX + PAST_SHRINE) C.splice(i, 1);
  info.flagSeconds.push(expert);

  // shift down: the top terrace 420 px under the top of the stage; every terrace runs down to one foot, 160 px under the lowest floor
  const shift = 420 - Math.min(...P.map((p) => p.y));
  for (const p of P) p.y += shift;
  for (const v of V) { v.topY += shift; v.bottomY += shift; }
  for (const t of T) { t.groundY += shift; t.topY += shift; }
  for (const c of C) c.y += shift;
  for (const cp of checkpoints) cp.y += shift;
  for (const z of Z) { z.top += shift; z.bottom += shift; z.baseY += shift; }
  for (const c of chimes) c.y += shift;
  for (const k of knots) { k.y += shift; k.ground += shift; }
  for (const m of monkeys) m.y += shift;
  for (const w of falls) { w.top += shift; w.bottom += shift; }
  for (const k of rocks) { k.top += shift; k.land += shift; }
  for (const s of patience) {
    s.y += shift;
    s.area!.top += shift;
    s.area!.bottom += shift;
    s.view!.y += shift;
  }
  for (const u of updrafts) { u.top += shift; u.bottom += shift; }
  for (const o of omens) o.y += shift;
  for (const cv of covers) cv.y += shift;
  const foot = Math.max(...[...blocks].map((p) => p.y)) + 160;
  for (const p of blocks) p.height = foot - p.y;
  info.blocks = [...blocks].map((p) => p.id);
  const W = Math.ceil(x + 20);
  const H = foot + 40;
  // (the first terrace: a mossy rock on it may come before it in the list)
  const spawnY = P.find((p) => blocks.has(p))!.y;
  cid = heartsAtFlags(C, checkpoints, cid);
  const movedPickups = fixPickups({ platforms: P, vines: V, ropes: [] }, C.filter((c) => !drift.has(c)));
  const cfg: LevelConfig = { ...config, levelWidth: W, levelHeight: H, targetCount: GUARD_GOAL_49 };
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
    spawnY,
    exitTotemX: exitX,
    exitTotemY: y + shift,
    checkpoints: checkpoints.sort((a, b) => a.x - b.x),
    zones: Z,
    meta: { attempt: seed, chunks: [], width: W, timing: { layoutSeconds: expert, decorSeconds: 0, route: W } },
    proto: {
      hints: hints.sort((a, b) => a.x - b.x), covers, beats, movedPickups,
      w4: { rocks, falls, chimes, knots, monkeys, patience, updrafts, omens },
    },
    aerie49: info,
  };
}
