// gen2 1-1's own promises, moved from the mixer's 1-1 (stage11.test.ts, plainWalk.test.ts: the lead 11-06, the mixer's four retire with
// the mixer's 1-1 path, not before). Measured on the test link's Rolls A, B and C, as the game builds them (testlink1_1.ts, the picker).
// A promise gen2 1-1 does not keep today is run and reported as a known failure by name (a TODO with its reason), never skipped.
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { RealPlay } from '../realPlay.ts';
import { jumpOK } from '../levelCheck.ts';
import { setDifficulty } from '../difficulty.ts';
import { asQaBuildForTest } from '../playRecorder.ts';
import { setPick11 } from '../testlink1_1.ts';
import type { Platform } from '../types.ts';

const ROLLS = ['A', 'B', 'C'] as const;
const roll = (r: (typeof ROLLS)[number]) => { asQaBuildForTest(true); setPick11(r); setDifficulty('normal'); return new RealPlay('1-1', 1); };
const solidish = (q: Platform) => q.type === 'solid' && !q.broken && !q.lily;

test('gen2 1-1: nothing can cost a life: under every x from the start to the exit there is a piece to land on above the death line', () => {
  const bad: string[] = [];
  for (const r of ROLLS) {
    const sim = roll(r), st = sim.stage, death = st.waterY ?? st.config.levelHeight;
    // (a soft heartFalls zone, a level double-gap block, costs nothing: a fall there puts him back on the take-off, engine.ts heartFall)
    const soft = (st.heartFalls ?? []).filter((z) => z.soft);
    for (let x = st.spawnX; x < st.exitTotemX; x += 20) if (!soft.some((z) => x >= z.x0 && x <= z.x1) && !sim.platforms.some((p) => p.type !== 'bouncy' && p.x <= x && p.x + p.width >= x && p.y < death)) { bad.push(`Roll ${r}: nothing to land on at x ${x}`); break; }
  }
  assert.deepEqual(bad, []);
});

test('gen2 1-1 in the real engine: running into the first mushroom bounces him up and on along the path', () => {
  for (const r of ROLLS) {
    const sim = roll(r);
    const m = sim.platforms.filter((p) => p.type === 'bouncy').sort((a, b) => a.x - b.x)[0];
    const ground = sim.platforms.filter((p) => p.type === 'solid' && p.x <= m.x && p.x + p.width >= m.x + m.width && Math.abs(p.y - (m.y + m.height)) < 4)[0]
      ?? sim.platforms.filter((p) => p.type === 'solid' && p.x + p.width <= m.x + 4 && p.y >= m.y - 40).sort((a, b) => b.x + b.width - (a.x + a.width))[0];
    sim.stand(Math.max(ground.x + 20, m.x - 200), ground.y);
    let top = Infinity;
    for (let f = 0; f < 150 && !(sim.p.grounded && sim.p.x > m.x + m.width + 60 && sim.p.y < ground.y - 100); f++) {
      sim.frame({ right: true });
      top = Math.min(top, sim.p.y);
    }
    assert.ok(ground.y - top > 100 && !sim.died, `Roll ${r}: at ${Math.round(sim.p.x)}, ${Math.round(sim.p.y)} (top ${Math.round(top)}, ground ${ground.y})`);
  }
});

/** the double teach's gap: from the double teach node on, the first gap within 1,500 px a plain jump can't cross and a double can */
function doubleGap(platforms: Platform[], tip: number, death: number, soft: ReadonlyArray<{ x0: number; x1: number; soft?: boolean }> = []): { a: Platform; b: Platform; safe: boolean } | undefined {
  const way: Platform[] = [];
  for (const p of platforms.filter((q) => q.type === 'solid' && q.x + q.width > tip).sort((a, b) => a.x - b.x)) {
    if (way.length && p.y > way[way.length - 1].y + 80) continue;
    way.push(p);
  }
  for (let i = 0; i + 1 < way.length; i++) {
    const [a, b] = [way[i], way[i + 1]];
    if (b.x - (a.x + a.width) < 40 || b.x > tip + 1500) continue;
    if (jumpOK(a, b, false).ok || !jumpOK(a, b, true).ok) continue;
    const mid = (a.x + a.width + b.x) / 2;
    // (safe: ground under the gap, or a soft heartFalls zone over it, where a miss puts him back on the take-off: the lead's ruling A)
    return { a, b, safe: soft.some((z) => z.soft && mid >= z.x0 && mid <= z.x1) || platforms.some((p) => p !== a && p !== b && p.x <= mid && p.x + p.width >= mid && p.y > Math.max(a.y, b.y) && p.y < death) };
  }
  return undefined;
}

test('gen2 1-1: right after the double is taught, a gap only the second jump crosses (a miss lands him on safe ground under it)', () => {
  const bad: string[] = [];
  for (const r of ROLLS) {
    const sim = roll(r), st = sim.stage as typeof sim.stage & { gen2?: { nodes?: Array<{ token: string; x0: number }> } };
    const teach = (st.gen2?.nodes ?? []).find((n) => /^T\w*2/.test(n.token));
    if (!teach) { bad.push(`Roll ${r}: no double teach node`); continue; }
    const g = doubleGap(sim.platforms, teach.x0, st.waterY ?? st.config.levelHeight, st.heartFalls ?? []);
    if (!g) bad.push(`Roll ${r}: no gap only the second jump crosses within 1,500 px of the teach (x ${Math.round(teach.x0)})`);
    else if (!g.safe) bad.push(`Roll ${r}: nothing under the double gap at ${Math.round(g.a.x + g.a.width)}`);
  }
  assert.deepEqual(bad, []);
});

/** dips: a ground block 60-260 px under the ground blocks either side of it (a soft pit's floor), open on top */
function dipsOf(ps: Platform[]): Array<{ d: Platform; top: number }> {
  const out: Array<{ d: Platform; top: number }> = [];
  // (ground only: a pit's floor is a block of ground and so are the banks either side, 90 px deep or more; a stone or stump standing on a
  // bank under the boughs is not a dip)
  const sorted = ps.filter((q) => solidish(q) && q.height >= 90).sort((a, b) => a.x - b.x);
  for (const d of sorted) {
    if (d.width < 40) continue;
    const left = sorted.filter((q) => q.x + q.width <= d.x + 4 && q.x + q.width > d.x - 120).sort((a, b) => a.y - b.y)[0];
    const right = sorted.filter((q) => q.x >= d.x + d.width - 4 && q.x < d.x + d.width + 120).sort((a, b) => a.y - b.y)[0];
    if (!left || !right) continue;
    const top = Math.min(left.y, right.y);
    if (d.y - top < 60 || d.y - Math.max(left.y, right.y) > 260 || d.y - Math.max(left.y, right.y) < 60) continue;
    if (ps.some((o) => o !== d && solidish(o) && o.y < d.y && o.y + o.height > d.y - 4 && o.x <= d.x + 20 && o.x + o.width >= d.x + 20)) continue;
    out.push({ d, top: Math.max(left.y, right.y) });
  }
  return out;
}
/** dropped into a dip, a one-thumb player heads one way (dir), flicking straight up at each face: out with single flicks? (-1: never).
 *  gen2's soft pits climb back to the take-off (the planner's back pit), so a dip is left either way */
function leaveDip(sim: RealPlay, d: Platform, top: number, dir: 1 | -1 = 1): number {
  sim.stand(dir > 0 ? d.x + 20 : d.x + d.width - 64, d.y);
  sim.p.facing = dir;
  let flicks = 0, hold = 0, rest = 0, lastX = sim.p.x, still = 0;
  for (let i = 0; i < 30 * 12; i++) {
    const p = sim.p;
    if (p.climbing || p.isVineSwinging || p.hanging) return flicks;
    const face = sim.platforms.some((q) => solidish(q) && q.height >= 20 && q.y < p.y - 6 && q.y + q.height > p.y - 4 && (dir > 0 ? q.x - (p.x + 19) >= -3 && q.x - (p.x + 19) < 8 : (p.x - 19) - (q.x + q.width) >= -3 && (p.x - 19) - (q.x + q.width) < 8));
    still = Math.abs(p.x - lastX) < 0.5 && p.grounded ? still + 1 : 0;
    lastX = p.x;
    let press = false;
    if (p.grounded && hold <= -3 && (face || still > 6) && rest-- <= 0) { press = true; hold = 7; rest = 3; flicks++; }
    const go = p.grounded && !face && hold <= 0;
    sim.frame({ right: dir > 0 && go, left: dir < 0 && go, press, jump: hold > 0 });
    hold--;
    if (sim.died) return -1;
    if (sim.p.grounded && sim.p.y <= top + 2 && (dir > 0 ? sim.p.x > d.x + d.width + 30 : sim.p.x < d.x - 30)) return flicks;
    if (flicks > 6) break;
  }
  return -1;
}

test('gen2 1-1: every dip is left with single flicks (no double or perfect jump needed)', () => {
  const bad: string[] = [];
  let n = 0;
  for (const r of ROLLS) {
    const sim = roll(r);
    (sim.input as unknown as { source: string }).source = 'gesture';
    for (const { d, top } of dipsOf(sim.platforms)) {
      n++;
      const ways = [leaveDip(sim, d, top, 1), leaveDip(sim, d, top, -1)].filter((f) => f >= 0);
      const flicks = ways.length ? Math.min(...ways) : -1;
      if (flicks < 0 || flicks > 3) bad.push(`Roll ${r}: the dip at x ${Math.round(d.x)}..${Math.round(d.x + d.width)}, ${flicks < 0 ? 'never out' : `${flicks} flicks`}`);
    }
  }
  assert.ok(n > 10, `${n} dips`);
  assert.deepEqual(bad, []);
});

/** the engine's lesson pick, run for real (RealPlay skips it as cosmetic): the lessons it calls for, with where he was */
function withLessons(sim: RealPlay, on = true): Array<{ id: string; x: number }> {
  const got: Array<{ id: string; x: number }> = [];
  // (a fresh save as the game starts 1-1: the touch coach teaches the first gap, so the gap's lesson is marked seen, engine.ts start)
  localStorage.setItem('sloth_lessons', JSON.stringify(['gap']));
  const e = sim.e as Record<string, any>;
  e.lessonSeen = null;
  // (RealPlay keeps him invincible, and a lesson waits while he blinks as if hurt, engine.ts safeToStop: a real player is not)
  sim.safe = false;
  if (on) {
    const proto = Object.getPrototypeOf(e);
    e.lessonTick = proto.lessonTick.bind(e);
    e.updateCamera = proto.updateCamera.bind(e);
  }
  e.callbacks.onLesson = (id: string) => got.push({ id, x: e.player.x });
  return got;
}
/** walked in from the left (on ground 700 px before the first mushroom, right held): where the bounce lesson came, and where he first left it */
function bounceLessonWalk(sim: RealPlay, got: Array<{ id: string; x: number }>): { m: Platform; at?: number; bouncedAt?: number } {
  const m = sim.platforms.filter((p) => p.type === 'bouncy').sort((a, b) => a.x - b.x)[0];
  const g = sim.platforms.filter((p) => p.type === 'solid' && !p.broken && p.height >= 60 && p.x < m.x - 700 && p.x + p.width > m.x - 1000 && p.y > m.y - 40)
    .sort((a, b) => b.x + b.width - (a.x + a.width))[0];
  sim.stand(Math.min(g.x + g.width - 40, m.x - 700), g.y);
  for (let f = 0; f < 90; f++) sim.frame({});
  let bouncedAt: number | undefined, still = 0, hold = 0;
  for (let f = 0; f < 30 * 12 && bouncedAt === undefined; f++) {
    // (a face in the way: a flick, as a player would, once he has stood still a moment)
    still = sim.p.grounded && Math.abs(sim.p.vx) < 0.1 ? still + 1 : 0;
    const press = still > 6 && hold <= -3;
    if (press) hold = 7;
    sim.frame({ right: true, press, jump: hold > 0 });
    hold--;
    if (sim.p.y < m.y - 150 && Math.abs(sim.p.x - (m.x + m.width / 2)) < m.width + 120) bouncedAt = sim.p.x;
  }
  return { m, at: got.find((l) => l.id === 'bounce')?.x, bouncedAt };
}

test('gen2 1-1, a fresh save: walking in from the left, the bounce lesson comes before he reaches the first mushroom (lesson.bounce; planted: no lesson pick FAILS)', () => {
  const bad: string[] = [];
  for (const r of ROLLS) {
    const sim = roll(r);
    const got = withLessons(sim);
    const { m, at, bouncedAt } = bounceLessonWalk(sim, got);
    if (at === undefined) bad.push(`Roll ${r}: no bounce lesson (lessons ${got.map((l) => `${l.id}@${Math.round(l.x)}`).join(' ') || 'none'})`);
    else if (at >= m.x - 40) bad.push(`Roll ${r}: the bounce lesson at x ${Math.round(at)}, at or past the mushroom (x ${Math.round(m.x)})`);
    if (bouncedAt === undefined) bad.push(`Roll ${r}: he never bounced on the mushroom at x ${Math.round(m.x)}`);
  }
  assert.deepEqual(bad, []);
  // (planted: the same walk with the lesson pick left out has no lesson, so the check above fails)
  const sim = roll('B');
  const got = withLessons(sim, false);
  assert.equal(bounceLessonWalk(sim, got).at, undefined);
});

test('the double-gap safety reading: a soft zone over the gap is safe; a bare gap with nothing under it and no zone is not (planted)', () => {
  const P = (id: number, x: number, y: number, width: number): Platform => ({ id, x, y, width, height: 300, type: 'solid', style: 'moss_stone' });
  const ps = [P(1, 0, 600, 500), P(2, 700, 600, 500)];
  assert.equal(doubleGap(ps, 0, 2000, [{ x0: 500, x1: 700, soft: true }])?.safe, true);
  assert.equal(doubleGap(ps, 0, 2000, [])?.safe, false);
});
