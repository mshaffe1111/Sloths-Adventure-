/**
 * 4-7 The Long Drop — World 4's special stage: a long way down the cliff on the leaf.
 *
 * A diagonal descent, left to right: ledge after ledge, each lower than the last, with a gap between. Learn: drops a double jump still
 * crosses (the leaf just makes them easy). Develop: gaps only the leaf crosses (this is the first stage that needs it, skills.ts).
 * Twist: rocks come loose and drop through the glide paths (rockfall.ts, `air` drops: grit trickles from above first); wait on the ledge
 * for one to pass, then go. Finish: warm air rising out of the mist (an updraft) under some gaps lifts the open leaf, a bonus with a
 * trail of petals, never a need. A glide that falls short drops into the mist: once he is well below the ledge he left, it is a fall
 * (w4Play deepFall), back to the flag, and the flags are close together.
 *
 * Built from y = 0 downward and shifted at the end so the top ledge sits 400 px under the top of the stage.
 */
import { fixPickups } from './flowerReach.ts';
import type { GeneratedStage } from './stageGenerator.ts';
import type { Collectible, LevelConfig, Platform } from './types.ts';
import { reachGlide, reachJump, TAKEOFF_SLACK } from './physics.ts';
import { rockFits, type RockDrop } from './rockfall.ts';
import { EXPERT_SECONDS, heartsAtFlags, stream, type ProtoExtras, type StageHint } from './protoStage.ts';
import type { Updraft } from './w4Play.ts';

const RUN = 285;
/** how far below the ledge he last stood on a glide may fall before it counts as a fall into the mist (px) */
export const LONG_DROP_FALL = 700;

export function buildLongDrop(config: LevelConfig, seed: number): GeneratedStage & { proto: ProtoExtras } {
  const R = stream(seed);
  const P: Platform[] = [];
  const C: Collectible[] = [];
  const checkpoints: Array<{ x: number; y: number; reached: boolean }> = [];
  const hints: StageHint[] = [];
  const beats: Array<[number, number, string]> = [];
  const rocks: RockDrop[] = [];
  /** the petals along each glide */
  const drift = new Set<Collectible>();
  const updrafts: Updraft[] = [];
  let pid = 1, cid = 1;
  let expert = 0;

  const ledge = (x0: number, x1: number, y: number) => {
    const p: Platform = { id: pid++, x: Math.round(x0), y: Math.round(y), width: Math.round(x1 - x0), height: 24, type: 'solid', style: 'branch' };
    P.push(p);
    return p;
  };
  const flower = (x: number, y: number, v: Collectible['botanicalVariant'] = 'orchid') =>
    C.push({ id: cid++, type: 'flower', botanicalVariant: v, x: Math.round(x), y: Math.round(y), collected: false, bobPhase: (x * 0.031) % 6.28 });
  const row = (x0: number, x1: number, y: number, n: number, v: Collectible['botanicalVariant'] = 'orchid') => {
    for (let i = 0; i < n; i++) flower(x0 + ((x1 - x0) * i) / Math.max(1, n - 1), y, v);
  };
  const hint = (x: number, text: string, pad = text, keys = text) => hints.push({ x, text, pad, keys });
  const flag = () => checkpoints.push({ x: Math.round(cur.x + cur.width / 2), y: cur.y, reached: false });
  const beat = (name: string, f: () => void) => {
    const b0 = cur.x;
    f();
    beats.push([b0, cur.x + cur.width, name]);
  };

  /** the widest gap the leaf crosses from a ledge `dy` above the next, kept well inside what the level check allows */
  const leafMax = (dy: number) => reachGlide(-dy, true) * 0.97 - TAKEOFF_SLACK - 40;
  /** wider than any jump from that height */
  const jumpMax = (dy: number) => reachJump(-dy, true) * 1.12;

  // the top: the ledge broke away behind him; the only way is down
  let cur = ledge(120, 900, 0);
  row(400, 820, -34, 4, 'hibiscus');

  /**
   * one drop: the next ledge `dy` lower, past a gap. `leaf`: wider than any jump. `rock`: a rock drops through the middle of the glide on
   * its own rhythm. `draft`: warm air rises under the gap (a lift, and petals up in it).
   */
  function drop(o: { leaf: boolean; rock?: boolean; draft?: boolean; long?: boolean }) {
    let dy = Math.round(R.r(120, 190));
    let gap: number;
    if (o.leaf) {
      // (a deeper drop when the window between a jump and the leaf is too narrow at this height)
      while (leafMax(dy) - jumpMax(dy) < 60 && dy < 300) dy += 20;
      gap = Math.round(jumpMax(dy) + (leafMax(dy) - jumpMax(dy)) * R.r(0.25, 0.6));
    } else gap = Math.round(reachJump(-dy, true) * R.r(0.55, 0.72));
    const edge = cur.x + cur.width;
    const fromY = cur.y;
    const lw = Math.round(o.long ? R.r(520, 680) : R.r(280, 380));
    const next = ledge(edge + gap, edge + gap + lw, fromY + dy);
    row(next.x + 60, next.x + next.width - 50, next.y - 34, Math.max(2, Math.round(lw / 150)), 'hibiscus');
    // petals down the drift (out over the gap, where only the leaf carries him: the level check counts them, flowerReach does not)
    // (each one no further out than the leaf carries from the ledge at its height, with room to spare; spaced so none overlap)
    const yAt = (u: number) => fromY - 20 + dy * u * u;
    let reach = 0.6;
    while (reach > 0.2 && gap * reach > reachGlide(-(yAt(reach) - fromY), false) * 0.97 - TAKEOFF_SLACK - 20) reach -= 0.05;
    if (gap * reach >= 150) {
      for (let i = 1; i <= 3; i++) {
        const u = (reach * i) / 3;
        flower(edge + gap * u, yAt(u), 'orchid');
        drift.add(C[C.length - 1]);
      }
    }
    if (o.rock) {
      const r: RockDrop = { x: Math.round(edge + gap * 0.5), top: fromY - 420, land: fromY + dy + 260, every: Math.round(R.r(4.8, 5.6) * 10) / 10, warn: 1.4, offset: Math.round(R.r(0, 5) * 10) / 10, air: true };
      if (rockFits(r)) {
        rocks.push(r);
        expert += 1.8;
      }
    }
    if (o.draft) updrafts.push({ x0: Math.round(edge + gap * 0.3), x1: Math.round(edge + gap * 0.7), top: fromY - 260, bottom: fromY + dy + 320 });
    expert += cur.width / RUN + gap / RUN + 0.6;
    cur = next;
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
  beat('Finish: the warm air', () => {
    hint(cur.x + 100, 'Warm air rising out of the mist! Glide into it and it lifts you');
    let n = 0;
    while (expert < EXPERT_SECONDS - 8 && n < 30) {
      const k = n % 4;
      drop({ leaf: k !== 3, rock: k === 1, draft: k === 0 || k === 2, long: k === 3 });
      n++;
      if (n % 2 === 0) flag();
    }
    // the last ledge: the shrine's
    const last = cur;
    const end = ledge(last.x + last.width + Math.round(reachJump(-150, true) * 0.6), last.x + last.width + Math.round(reachJump(-150, true) * 0.6) + 520, last.y + 150);
    expert += last.width / RUN + 1 + 520 / RUN;
    cur = end;
  });

  // shift: the top ledge 400 px under the top of the stage, room for the mist under the last ledge
  const top = Math.min(...P.map((p) => p.y));
  const shift = 400 - top;
  for (const p of P) p.y += shift;
  for (const c of C) c.y += shift;
  for (const cp of checkpoints) cp.y += shift;
  for (const r of rocks) { r.top += shift; r.land += shift; }
  for (const u of updrafts) { u.top += shift; u.bottom += shift; }
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
    meta: { attempt: seed, chunks: [], width: W, timing: { layoutSeconds: expert, decorSeconds: 0, route: W } },
    proto: { hints: hints.sort((a, b) => a.x - b.x), covers: [], beats, movedPickups, w4: { rocks, updrafts, deepFall: LONG_DROP_FALL } },
  };
}
