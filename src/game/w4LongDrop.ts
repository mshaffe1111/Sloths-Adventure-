/**
 * 4-7 The Long Drop — World 4's special stage: the long way down the cliff on the leaf, back and forth across its face.
 *
 * Ledge after ledge, each lower than the last, with a gap between. The path runs right, drops into a cave and turns back, and so on
 * down five switchbacks to the shrine at the foot of the cliff:
 *
 *   right  Learn: drops a double jump still crosses (the leaf just makes them easy). Develop: gaps only the leaf crosses (this is the
 *          first stage that needs it, skills.ts). Twist: rocks come loose and drop through the glide paths (rockfall.ts, `air` drops:
 *          grit trickles from above first); wait on the ledge for one to pass, then go.
 *   turn   Rest: the cave. Drop straight down into a cave in the cliff (a flag), and the path turns back.
 *   left   Develop: the same drops, the other way. Develop: warm air rising out of the mist (an updraft) under some gaps lifts the open
 *          leaf, a bonus with a trail of petals.
 *   turn   a hairpin: drop to the ledge under the last one, and back again.
 *   right  Twist: up on the warm air. The next ledge is higher than any jump: drift into the warm air, rise in it, drift across. Develop:
 *          the long crossing, a gap too wide even for the leaf, with warm air in the middle of it to win the height back.
 *   turn   Rest: the lower cave.
 *   left   Twist: rocks in the warm air. A rock drops through the air he has to ride up: wait for it, then go. Develop: back across, all
 *          of it mixed.
 *   turn   a hairpin.
 *   right  Develop: all of it, out past the end of every ledge above, and Finish: the final plunge, the deepest drops of the cliff, a flag
 *          on each, to the shrine.
 *
 * A glide that falls short drops into the mist: once he is well below the ledge he left, it is a fall (w4Play deepFall), back to the
 * flag, and the flags are close together. Every flag is lower than the one before it (w4Play `descent`: lower is further on). Under every
 * switchback the next one runs deeper than a fall into the mist, so no short cut drops from one onto the next.
 *
 * Built from y = 0 downward and shifted at the end so the top ledge sits 400 px under the top of the stage.
 */
import { fixPickups } from './flowerReach.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import type { Collectible, LevelConfig, Platform } from './types.ts';
import { GLIDE } from './glide.ts';
import { reachGlide, reachJump, TAKEOFF_SLACK } from './physics.ts';
import { rockFits, type RockDrop } from './rockfall.ts';
import { heartsAtFlags, stageSeconds, stream, type ProtoExtras, type StageHint } from './protoStage.ts';
import type { Updraft, W4Decor } from './w4Play.ts';

const RUN = 285;
/** how far below the ledge he last stood on a glide may fall before it counts as a fall into the mist (px) */
export const LONG_DROP_FALL = 700;
/** in warm air the open leaf rises until his middle (32 px over his feet) is at its top: his feet hang about this far under it */
export const DRAFT_HOVER = 36;
/** a ledge the warm air is needed for sits this far under where he hangs at the top of it (an easy drift down onto it) */
const DRAFT_LAND = 90;

/** what the tests read back about the warm air: which updraft (index into proto.w4.updrafts) is which */
export interface DraftInfo {
  i: number;
  /** bonus: a lift and petals over a gap the leaf crosses anyway; up: the only way to a higher ledge; across: the only way over a gap
   *  too wide for the leaf; rock: up, with a rock dropping through it */
  kind: 'bonus' | 'up' | 'across' | 'rock';
  /** up, across, rock: the ledge it is needed for, and the one he sets off from */
  to?: number;
  from?: number;
}

export function buildLongDrop(config: LevelConfig, seed: number): GeneratedStage & { proto: ProtoExtras; drafts47: DraftInfo[] } {
  const R = stream(seed);
  const P: Platform[] = [];
  const C: Collectible[] = [];
  const checkpoints: Array<{ x: number; y: number; reached: boolean }> = [];
  const hints: StageHint[] = [];
  const beats: Array<[number, number, string]> = [];
  const rocks: RockDrop[] = [];
  /** the petals along each glide and up the warm air */
  const drift = new Set<Collectible>();
  const updrafts: Updraft[] = [];
  const drafts: DraftInfo[] = [];
  const decor: W4Decor[] = [];
  /** seconds a rock adds, by rock (only the rocks kept count) */
  const rockWait = new Map<RockDrop, number>();
  let pid = 1, cid = 1;
  let expert = 0;
  const target = stageSeconds('4-7');
  const r = Math.round;

  const ledge = (x0: number, x1: number, y: number) => {
    const p: Platform = { id: pid++, x: r(x0), y: r(y), width: r(x1 - x0), height: 24, type: 'solid', style: 'branch' };
    P.push(p);
    return p;
  };
  const flower = (x: number, y: number, v: Collectible['botanicalVariant'] = 'orchid') => {
    const c: Collectible = { id: cid++, type: 'flower', botanicalVariant: v, x: r(x), y: r(y), collected: false, bobPhase: (x * 0.031) % 6.28 };
    C.push(c);
    return c;
  };
  const row = (x0: number, x1: number, y: number, n: number, v: Collectible['botanicalVariant'] = 'orchid') => {
    for (let i = 0; i < n; i++) flower(x0 + ((x1 - x0) * i) / Math.max(1, n - 1), y, v);
  };
  /**
   * a line shown the first time he passes x. Below the first switchback every line also waits for his depth (`below`, the ledge it is
   * about), since he has passed that x higher up already; going left, only the depth.
   */
  const hint = (x: number, text: string, pad = text, keys = text, below?: number) =>
    hints.push({ x: r(x), text, pad, keys, ...(below !== undefined ? { belowY: r(below) } : {}) });
  let tier = 0;
  /** a line about the ledge he is on (see hint) */
  const say = (text: string, pad = text, keys = text) => hint(dir > 0 ? cur.x + 100 : 0, text, pad, keys, tier > 0 ? cur.y - 60 : undefined);
  let lastFlag = -Infinity;
  /** a flag on the ledge he is on (only if it is lower than the last one: lower is further on) */
  const flag = () => {
    if (cur.y <= lastFlag + 20) return;
    let fx = r(cur.x + cur.width / 2);
    while (checkpoints.some((c) => c.x === fx)) fx++;
    checkpoints.push({ x: fx, y: cur.y, reached: false });
    lastFlag = cur.y;
  };
  /** a beat covers the ledge it starts on and every ledge it adds (going left too) */
  const beat = (name: string, f: () => void) => {
    const n0 = P.length;
    const from = cur;
    f();
    const made = [from, ...P.slice(n0)];
    beats.push([Math.min(...made.map((p) => p.x)), Math.max(...made.map((p) => p.x + p.width)), name]);
  };

  /** the widest gap the leaf crosses from a ledge `dy` above the next, kept well inside what the level check allows */
  const leafMax = (dy: number) => reachGlide(-dy, true) * 0.97 - TAKEOFF_SLACK - 40;
  /** wider than any jump from that height */
  const jumpMax = (dy: number) => reachJump(-dy, true) * 1.12;

  // the top: the ledge broke away behind him; the only way is down
  let cur = ledge(120, 900, 0);
  row(400, 820, -34, 4, 'hibiscus');
  /** which way the path runs: 1 right, -1 left */
  let dir: 1 | -1 = 1;
  /** the end of the ledge he is on, the way he is going */
  const edgeOf = (p: Platform) => (dir > 0 ? p.x + p.width : p.x);
  /** a ledge `gap` on past `e` (the way he is going), `w` wide, its top at y */
  const ahead = (e: number, gap: number, w: number, y: number) => (dir > 0 ? ledge(e + gap, e + gap + w, y) : ledge(e - gap - w, e - gap, y));
  const span = (a: number, b: number) => ({ x0: r(Math.min(a, b)), x1: r(Math.max(a, b)) });
  /** no ledge between top and bottom across x0..x1 */
  const clear = (x0: number, x1: number, top: number, bottom: number) => !P.some((p) => p.x < x1 && p.x + p.width > x0 && p.y > top && p.y < bottom);

  /**
   * one drop: the next ledge `dy` lower, past a gap. `leaf`: wider than any jump. `rock`: a rock drops through the middle of the glide on
   * its own rhythm. `draft`: warm air rises under the gap (a lift, and petals up in it). `deep`: a deeper drop (after warm air carried
   * him up, it takes him back down past where he set off, so the next flag is lower again). `plunge`: the deepest drops, at the foot
   * of the cliff.
   */
  function drop(o: { leaf: boolean; rock?: boolean; draft?: boolean; long?: boolean; deep?: boolean; plunge?: boolean }) {
    let dy = Math.round(o.plunge ? R.r(400, 500) : o.deep ? R.r(400, 460) : R.r(120, 190));
    let gap: number;
    if (o.leaf) {
      // (a deeper drop when the window between a jump and the leaf is too narrow at this height)
      while (leafMax(dy) - jumpMax(dy) < 60 && dy < 300) dy += 20;
      gap = Math.round(jumpMax(dy) + (leafMax(dy) - jumpMax(dy)) * (o.plunge ? R.r(0.2, 0.45) : R.r(0.25, 0.6)));
    } else gap = Math.round(reachJump(-dy, true) * R.r(0.55, 0.72));
    const edge = edgeOf(cur);
    const fromY = cur.y;
    const lw = Math.round(o.long ? R.r(520, 680) : R.r(280, 380));
    const next = ahead(edge, gap, lw, fromY + dy);
    row(next.x + 60, next.x + next.width - 50, next.y - 34, Math.max(2, Math.round(lw / 150)), 'hibiscus');
    // petals down the drift (out over the gap, where only the leaf carries him: the level check counts them, flowerReach does not)
    // (each one no further out than the leaf carries from the ledge at its height, with room to spare; spaced so none overlap)
    const yAt = (u: number) => fromY - 20 + dy * u * u;
    let reach = 0.6;
    while (reach > 0.2 && gap * reach > reachGlide(-(yAt(reach) - fromY), false) * 0.97 - TAKEOFF_SLACK - 20) reach -= 0.05;
    if (gap * reach >= 150) {
      for (let i = 1; i <= 3; i++) {
        const u = (reach * i) / 3;
        drift.add(flower(edge + dir * gap * u, yAt(u), 'orchid'));
      }
    }
    if (o.rock) {
      const rk: RockDrop = { x: r(edge + dir * gap * 0.5), top: fromY - 420, land: fromY + dy + 260, every: Math.round(R.r(4.8, 5.6) * 10) / 10, warn: 1.4, offset: Math.round(R.r(0, 5) * 10) / 10, air: true };
      if (rockFits(rk)) {
        rocks.push(rk);
        rockWait.set(rk, 1.8);
      }
    }
    if (o.draft) {
      updrafts.push({ ...span(edge + dir * gap * 0.3, edge + dir * gap * 0.7), top: fromY - 260, bottom: fromY + dy + 320 });
      drafts.push({ i: updrafts.length - 1, kind: 'bonus' });
    }
    expert += cur.width / RUN + gap / RUN + 0.6 + (o.plunge ? 0.4 : 0);
    cur = next;
  }

  /**
   * up on the warm air: the next ledge is higher than any jump reaches. Warm air rises just past the end of this one: walk off into it
   * with the leaf open, rise to its top and drift across onto the ledge. With `rock`, a rock drops through the middle of the air on its
   * own rhythm: wait on the ledge for it to fall past, then go.
   */
  function climb(rock = false) {
    const A = cur;
    const e = edgeOf(A);
    const W = r(R.r(270, 310));
    const near = e + dir * 40;
    const far = near + dir * W;
    const rise = r(R.r(250, 290));
    const top = A.y - rise - DRAFT_HOVER - DRAFT_LAND;
    const gB = r(R.r(40, 80));
    const bw = r(R.r(320, 380));
    const B = ahead(far, gB, bw, A.y - rise);
    const u: Updraft = { ...span(near, far), top, bottom: A.y + 480 };
    updrafts.push(u);
    drafts.push({ i: updrafts.length - 1, kind: rock ? 'rock' : 'up', to: B.id, from: A.id });
    // petals up the middle of the air
    const mid = (u.x0 + u.x1) / 2;
    for (let i = 0; i < 3; i++) drift.add(flower(mid + (rock ? dir * 70 : 0), A.y - 70 - ((A.y - 70 - (top + 70)) * i) / 2, 'orchid'));
    row(B.x + 60, B.x + B.width - 60, B.y - 34, 2, 'hibiscus');
    if (rock) {
      // (it lets go from well above where he hangs at the top of the air, as high as the ledges above leave room for)
      const rk: RockDrop = { x: r(mid), top: B.y - 320, land: A.y + 420, every: Math.round(R.r(6.2, 7.0) * 10) / 10, warn: 1.4, offset: Math.round(R.r(0, 6) * 10) / 10, air: true };
      while (!clear(rk.x - 30, rk.x + 30, rk.top, rk.land) && rk.top < top - 40) rk.top += 20;
      if (rockFits(rk)) {
        rocks.push(rk);
        rockWait.set(rk, 2.6);
      }
    }
    // walk off, rise from a little under the ledge to the top of the air, settle, drift across
    const ride = (A.y + 40 - (top + DRAFT_HOVER)) / GLIDE.liftMax;
    expert += A.width / RUN + (40 + W / 2) / RUN + ride + 0.8 + (W / 2 + gB) / RUN + 0.6;
    cur = B;
  }

  /**
   * the long crossing: a gap too wide even for the leaf, with warm air rising in the middle of it. Glide out to it, rise, glide on to a
   * ledge a little lower than this one.
   */
  function across() {
    const A = cur;
    const e = edgeOf(A);
    const dyB = r(R.r(40, 110));
    const top = A.y + dyB - DRAFT_HOVER - DRAFT_LAND;
    const g1 = r(R.r(400, 470));
    const g2 = r(R.r(60, 100));
    let W = 260;
    // (always well past what the leaf alone carries)
    while (g1 + W + g2 < reachGlide(-dyB, true) + 160) W += 20;
    const near = e + dir * g1;
    const far = near + dir * W;
    const bw = r(R.r(320, 380));
    const B = ahead(far, g2, bw, A.y + dyB);
    const u: Updraft = { ...span(near, far), top, bottom: A.y + 560 };
    updrafts.push(u);
    drafts.push({ i: updrafts.length - 1, kind: 'across', to: B.id, from: A.id });
    // petals out along the glide to it, then up it
    drift.add(flower(e + dir * g1 * 0.3, A.y - 40, 'orchid'));
    drift.add(flower(e + dir * g1 * 0.55, A.y + 30, 'orchid'));
    const mid = (u.x0 + u.x1) / 2;
    drift.add(flower(mid, top + 190, 'orchid'));
    drift.add(flower(mid, top + 70, 'orchid'));
    row(B.x + 60, B.x + B.width - 60, B.y - 34, 2, 'hibiscus');
    const ride = (A.y + 160 - (top + DRAFT_HOVER)) / GLIDE.liftMax;
    expert += A.width / RUN + (g1 + W / 2) / RUN + ride + 0.6 + (W / 2 + g2) / RUN + 0.6;
    cur = B;
  }

  /**
   * a switchback: walk off the end of this ledge and drop straight down onto the one under it, which runs back under this one, and
   * turn round. `cave`: it is a cave in the cliff, with a flag, a rest.
   */
  function turn(cave: boolean) {
    const e = edgeOf(cur);
    const dy = r(R.r(500, 550));
    const w = r(R.r(620, 700));
    const out = 300;
    const far = e + dir * out;
    const t = dir > 0 ? ledge(far - w, far, cur.y + dy) : ledge(far, far + w, cur.y + dy);
    expert += cur.width / RUN + out / RUN + 0.8 + w / RUN;
    dir = dir > 0 ? -1 : 1;
    tier++;
    cur = t;
    if (cave) {
      // the cave: in the cliff behind the middle of the ledge
      decor.push({ n: 'cave', x: r(t.x + t.width / 2), b: t.y + 12, w: 260 });
      row(t.x + 80, t.x + t.width - 80, t.y - 34, 4, 'hibiscus');
      expert += 1;
    } else row(t.x + 80, t.x + t.width - 80, t.y - 34, 3, 'hibiscus');
  }

  beat('Start: the ledge is gone', () => {
    hint(160, 'The ledge is gone. The only way now is down: on the leaf');
  });
  beat('Learn: little drops', () => {
    hint(cur.x + 300, 'Flick up, then keep your thumb on the glass as you fall', 'Hold Jump as you fall', 'Hold Space as you fall');
    for (let k = 0; k < 4; k++) drop({ leaf: false });
    flag();
  });
  beat('Develop: only the leaf', () => {
    hint(cur.x + 100, 'Too far to jump! Open your leaf and drift across');
    for (let k = 0; k < 6; k++) {
      drop({ leaf: true, long: k === 2 });
      if (k % 2 === 1) flag();
    }
  });
  beat('Twist: falling rocks', () => {
    hint(cur.x + 100, 'Rocks are dropping through the gaps. Watch the grit falling, and go once the rock has passed');
    for (let k = 0; k < 6; k++) {
      drop({ leaf: true, rock: k % 3 !== 2 });
      if (k % 2 === 1) flag();
    }
  });
  beat('Rest: the cave', () => {
    hint(cur.x + 60, 'A cave in the cliff below! Walk off the end and drop straight down into it');
    turn(true);
    flag();
    say('A rest in the cave. The path turns back here: glide the other way now');
  });
  beat('Develop: the other way', () => {
    for (let k = 0; k < 4; k++) {
      drop({ leaf: k !== 0, rock: k === 1 || k === 3 });
      if (k % 2 === 1) flag();
    }
  });
  beat('Develop: the warm air', () => {
    say('Warm air rising out of the mist! Glide into it and it lifts you');
    for (let k = 0; k < 4; k++) {
      drop({ leaf: k !== 3, rock: k === 1, draft: k === 0 || k === 2, long: k === 3 });
      if (k % 2 === 1) flag();
    }
  });
  beat('Twist: up on the warm air', () => {
    turn(false);
    flag();
    drop({ leaf: true, deep: true });
    flag();
    say(
      'That ledge is too high to jump! Drift into the warm air, keep your thumb on the glass and rise, then drift across',
      'That ledge is too high to jump! Drift into the warm air, hold Jump and rise, then drift across',
      'That ledge is too high to jump! Drift into the warm air, hold Space and rise, then drift across',
    );
    for (let k = 0; k < 3; k++) {
      climb();
      drop({ leaf: true, deep: true });
      flag();
    }
  });
  beat('Rest: the lower cave', () => {
    say('Another cave below. Drop down and rest');
    turn(true);
    flag();
  });
  beat('Twist: rocks in the warm air', () => {
    drop({ leaf: true, deep: true });
    flag();
    say('A rock drops through the warm air! Wait for it to fall past, then ride up');
    for (let k = 0; k < 3; k++) {
      climb(true);
      drop({ leaf: true, deep: true, rock: k === 1 });
      flag();
    }
  });
  /** the time so far, with the rocks' waits */
  const soFar = () => expert + [...rockWait.values()].reduce((a, b) => a + b, 0);
  const rightmost = () => Math.max(...P.map((p) => p.x + p.width));
  /**
   * what is still to come after the stretch back across, roughly (the plunge makes up any shortfall): the hairpin, two
   * long crossings, the run out right past every ledge above, and the plunge
   */
  const restAfter = () => 4 + 2 * 12 + Math.max(2, (rightmost() - cur.x - 4200) / 800) * 4 + 4 * 4.3;
  /** a stretch of mixed drops (with `crossings`, every fifth is a long crossing) */
  const mixed = (k: number, crossings: boolean) => {
    const m = k % 5;
    if (m === 4 && crossings) across();
    else drop({ leaf: m !== 2, rock: m === 0 || m === 3, draft: m === 1 });
  };
  beat('Develop: back across', () => {
    let n = 0;
    while (soFar() + restAfter() < target && n < 12 && cur.x > 1600) {
      mixed(n, false);
      n++;
      if (n % 2 === 0) flag();
    }
    flag();
  });
  beat('Develop: the long crossing', () => {
    turn(false);
    flag();
    drop({ leaf: true });
    say('Too far even for the leaf! Glide to the warm air in the middle, rise in it, and glide on');
    for (let k = 0; k < 2; k++) {
      across();
      drop({ leaf: true });
      flag();
    }
  });
  beat('Develop: all of it', () => {
    // out past the end of every ledge above (the shrine stands at the far right, and nothing may be further right than it)
    const pastAll = rightmost() + 300;
    let n = 0;
    while ((cur.x + cur.width < pastAll || n < 2) && n < 30) {
      mixed(n, true);
      n++;
      if (n % 2 === 0) flag();
    }
    flag();
  });
  beat('Finish: the final plunge', () => {
    say('The foot of the cliff! The deepest drops now: open the leaf and aim for each ledge');
    let n = 0;
    while ((n < 4 || soFar() < target + 3) && n < 10) {
      drop({ leaf: true, plunge: true });
      flag();
      n++;
    }
    // the last ledge: the shrine's
    const last = cur;
    const g = r(reachJump(-150, true) * 0.6);
    const end = ahead(edgeOf(last), g, 520, last.y + 150);
    expert += last.width / RUN + 1 + 520 / RUN;
    cur = end;
  });

  // a rock must never fall onto a ledge
  for (let i = rocks.length - 1; i >= 0; i--) {
    const k = rocks[i];
    if (!clear(k.x - 30, k.x + 30, k.top, k.land)) {
      rockWait.delete(k);
      rocks.splice(i, 1);
    }
  }
  for (const w of rockWait.values()) expert += w;

  // shift: the top ledge 400 px under the top of the stage, room for the mist under the last ledge
  const top = Math.min(...P.map((p) => p.y));
  const shift = 400 - top;
  for (const p of P) p.y += shift;
  for (const c of C) c.y += shift;
  for (const cp of checkpoints) cp.y += shift;
  for (const k of rocks) { k.top += shift; k.land += shift; }
  for (const u of updrafts) { u.top += shift; u.bottom += shift; }
  for (const h of hints) if (h.belowY !== undefined) h.belowY += shift;
  for (const d of decor) d.b += shift;
  const bottom = Math.max(...P.map((p) => p.y));
  const H = bottom + 600;
  const W = Math.ceil(cur.x + cur.width + 120);
  const exitX = Math.round(cur.x + cur.width - 160);
  C.push({ id: cid++, type: 'exit_totem', x: exitX, y: cur.y - 30, collected: false, bobPhase: 0 });
  cid = heartsAtFlags(C, checkpoints, cid);
  const movedPickups = fixPickups({ platforms: P, vines: [], ropes: [] }, C.filter((c) => !drift.has(c)));
  const cfg: LevelConfig = { ...config, levelWidth: W, levelHeight: H };
  return {
    config: cfg,
    trees: [],
    platforms: P,
    vines: [],
    ropes: [],
    enemies: [],
    boss: null,
    collectibles: C,
    spawnX: 220,
    spawnY: P[0].y,
    exitTotemX: exitX,
    exitTotemY: cur.y,
    checkpoints: checkpoints.sort((a, b) => a.x - b.x),
    updrafts,
    deepFall: LONG_DROP_FALL,
    meta: { attempt: seed, chunks: [], width: W, timing: { layoutSeconds: expert, decorSeconds: 0, route: W } },
    proto: { hints: hints.sort((a, b) => a.x - b.x), covers: [], beats, movedPickups, w4: { rocks, updrafts, deepFall: LONG_DROP_FALL, decor, descent: true } },
    drafts47: drafts,
  };
}
