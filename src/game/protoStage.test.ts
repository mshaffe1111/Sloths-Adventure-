import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, G, LOG } from './protoStage.ts';
import { PHYS, airStep, canGrabSwing, reachGlide, reachJump, swingGrab, swingStep, tarzanLaunch, type AirBody } from './physics.ts';
import { swingLandings } from './levelCheck.ts';
import type { LevelConfig, Platform, Vine } from './types.ts';

const cfg = {
  worldIndex: 1, miniIndex: 6, id: '1-6', name: 'First Lianas', objectiveType: 'vine_runner', targetCount: 1, timeLimit: 270,
  levelWidth: 16100, levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
} as LevelConfig;
const S = buildProtoStage(cfg);
const swings = S.vines.filter((v) => v.vineType === 'swing_liana');
const at = (x: number) => swings.find((v) => Math.abs(v.x - x) < 1)!;
const plat = (pred: (p: Platform) => boolean) => S.platforms.find(pred)!;

/** the highest a double jump lifts his feet (px), at either tick rate and the best moment for the second jump */
function maxRise() {
  let best = 0;
  for (const dt of [1 / 30, 1 / 60]) {
    for (let tD = 0.05; tD < 0.6; tD += 0.01) {
      const b: AirBody = { x: 0, y: 0, vx: 0, vy: -PHYS.jumpV };
      let t = 0, used = false, top = 0;
      for (let i = 0; i < 300; i++) {
        if (!used && t >= tD) { b.vy = -PHYS.doubleV; used = true; }
        airStep(b, dt, 0);
        t += dt;
        top = Math.min(top, b.y);
        if (used && b.vy > 0) break;
      }
      best = Math.max(best, -top);
    }
  }
  return best;
}
/** landing on a thin branch counts when the feet pass within this of its top (engine catchDrop) */
const THIN = 14;
/** catching the lip of a bank or wall hoists him up when the feet get within this of its top */
const HOIST = 26;

/** seconds of a swing on A during which letting go catches B (holding toward B, with the double jump if it helps) */
function catchWindow(A: Vine, B: Vine) {
  const dt = 1 / 30;
  const len = A.bottomY - A.topY;
  const s = swingGrab({ x: A.x - 40, y: A.topY + len * 0.7, vx: 300, vy: 100 }, A);
  let ok = 0;
  for (let k = 0; k < 90; k++) {
    const r = swingStep(s, A, dt, 1, 0);
    if (Math.sin(s.angle) <= 0.05) continue;
    const l = tarzanLaunch(r.vx, r.vy, 1);
    let hit = false;
    for (const tD of [99, 0.15, 0.3, 0.45]) {
      const c: AirBody = { x: r.x, y: r.y, vx: l.vx, vy: l.vy };
      let t = 0, used = false;
      for (let i = 0; i < 60 && !hit; i++) {
        if (!used && t >= tD) { c.vy = -PHYS.doubleV; used = true; }
        airStep(c, dt, 1);
        t += dt;
        if (canGrabSwing(c.x, c.y, B)) hit = true;
      }
      if (hit) break;
    }
    if (hit) ok++;
  }
  return ok * dt;
}

/**
 * Coming off liana A onto liana B (the first release that catches it), how many release moments on B land him on `to`
 * (out of a swing sampled at 30 Hz). Falls through anything else, as the water would take him.
 */
function chainLanding(A: Vine, B: Vine, to: Platform) {
  const dt = 1 / 30;
  const len = A.bottomY - A.topY;
  const s = swingGrab({ x: A.x - 40, y: A.topY + len * 0.7, vx: 300, vy: 100 }, A);
  let arrival: AirBody | null = null;
  for (let k = 0; k < 90 && !arrival; k++) {
    const r = swingStep(s, A, dt, 1, 0);
    if (Math.sin(s.angle) <= 0.2) continue;
    const l = tarzanLaunch(r.vx, r.vy, 1);
    const c: AirBody = { x: r.x, y: r.y, vx: l.vx, vy: l.vy };
    for (let i = 0; i < 60; i++) {
      airStep(c, dt, 1);
      if (canGrabSwing(c.x, c.y, B)) { arrival = { ...c }; break; }
    }
  }
  if (!arrival) return -1;
  const sb = swingGrab(arrival, B);
  let ok = 0;
  for (let k = 0; k < 90; k++) {
    const r = swingStep(sb, B, dt, 1, 0);
    if (Math.sin(sb.angle) <= 0.05) continue;
    const l = tarzanLaunch(r.vx, r.vy, 1);
    let landed = false;
    for (const tD of [99, 0.2, 0.4]) {
      const c: AirBody = { x: r.x, y: r.y, vx: l.vx, vy: l.vy };
      let t = 0, used = false;
      for (let i = 0; i < 90; i++) {
        if (!used && t >= tD) { c.vy = -PHYS.doubleV; used = true; }
        const prevY = c.y;
        airStep(c, dt, 1);
        t += dt;
        if (c.vy >= 0 && prevY <= to.y + 14 && c.y >= to.y && c.x > to.x + 10 && c.x < to.x + to.width) { landed = true; break; }
        if (c.y > 900) break;
      }
      if (landed) break;
    }
    if (landed) ok++;
  }
  return ok;
}

const rise = maxRise();


test('1-6: a double jump cannot top the canopy wall, but it can from the log', () => {
  const wall = plat((p) => p.x === 7000 && p.y === G - 230);
  assert.ok((G - wall.y) > (rise + HOIST + 10), `${String(G - wall.y)} > ${String(rise + HOIST + 10)}`);
  assert.ok(G - LOG.h - wall.y < rise - 15);
});

test('1-6: the secret nook needs the log under it', () => {
  const nook = plat((p) => p.x === 5790 && p.y === 325);
  const rock = plat((p) => p.x === 5760 && p.height === 50);
  assert.ok(G - LOG.h - nook.y < rise - 15); // from the log: yes
  assert.ok((rock.y - nook.y) > (rise + THIN + 10), `${String(rock.y - nook.y)} > ${String(rise + THIN + 10)}`); // from the rock: no
  const log = plat((p) => !!p.push);
  // pushed left, the log stops against the rock, right under the nook
  assert.equal(log.push!.min, rock.x + rock.width);
  assert.ok((log.push!.min + 20) > (nook.x), `${String(log.push!.min + 20)} > ${String(nook.x)}`);
  assert.ok(log.push!.min + 40 < nook.x + nook.width); // enough of the log under the nook to stand on
});

test('1-6: the swing gaps are too wide to jump, so the lianas are the way', () => {
  assert.ok((1360 - 1000) > (reachJump(0, true) + 40), `${String(1360 - 1000)} > ${String(reachJump(0, true) + 40)}`);
  assert.ok((5560 - 5100) > (reachJump(0, true) + 40), `${String(5560 - 5100)} > ${String(reachJump(0, true) + 40)}`);
});

test('1-6: the far seed needs the Leaf Glide', () => {
  const b4 = plat((p) => p.x === 9450);
  const gs = plat((p) => p.x === 10280);
  const gap = gs.x - (b4.x + b4.width);
  const dy = b4.y - gs.y; // negative = a drop
  assert.ok((gap) > (reachJump(dy, true) + 100), `${String(gap)} > ${String(reachJump(dy, true) + 100)}`);
  assert.ok(gap < reachGlide(dy, true) - 100);
  assert.ok((G - gs.y) > (rise + THIN + 10), `${String(G - gs.y)} > ${String(rise + THIN + 10)}`); // not from the floor
  // and the first liana of the finish is too far away to swing back to it
  assert.ok((swings.find((v) => v.x > 11000)!.x - (gs.x + gs.width)) > (650), `${String(swings.find((v) => v.x > 11000)!.x - (gs.x + gs.width))} > ${String(650)}`);
});

test('1-6: the liana at the top of the kapok is out of reach from the ground', () => {
  const high = at(5240);
  assert.ok((G - rise) > (high.bottomY + 30), `${String(G - rise)} > ${String(high.bottomY + 30)}`);
});

test('1-6: every liana catches the next with a forgiving window', () => {
  for (const [a, b] of [[2230, 2610], [3520, 3900], [3900, 4290], [8420, 8620], [11130, 11530], [11530, 11960], [11960, 12400]]) {
    assert.ok(catchWindow(at(a), at(b)) > 0.6, `${a} -> ${b}`);
  }
});

test('1-6: the last liana of each run lands on the bank beyond', () => {
  // single lianas: from the ledge he jumps off
  const cases: Array<[number, number, number]> = [
    [1150, 1000, 1360],
    [5240, 4860, 5560],
  ];
  const got: string[] = [];
  for (const [vx, fromX, toX] of cases) {
    const from = plat((p) => Math.abs(p.x + p.width - fromX) < 1 || Math.abs(p.x - fromX) < 1);
    const to = plat((p) => Math.abs(p.x - toX) < 1);
    const hits = swingLandings(from, at(vx), 1, S.platforms, S.waterY!);
    got.push(`${vx}->${toX}:${hits.get(to.id) ?? 0}`);
  }
  // the end of a chain: arriving from the liana before
  for (const [pa, pb, toX] of [[2230, 2610, 2900], [3900, 4290, 4520], [8420, 8620, 8780], [11960, 12400, 12700]]) {
    const to = plat((p) => Math.abs(p.x - toX) < 1);
    got.push(`${pa}>${pb}->${toX}:${chainLanding(at(pa), at(pb), to)}`);
  }
  assert.deepEqual(got.filter((g) => Number(g.split(':')[1]) < 8), [], got.join(' '));
});

test('1-6: has two seeds and the checkpoints in order', () => {
  assert.equal(S.collectibles.filter((c) => c.type === 'seed').length, 2);
  const xs = S.checkpoints!.map((c) => c.x);
  assert.deepEqual([...xs].sort((a, b) => a - b), xs);
});
