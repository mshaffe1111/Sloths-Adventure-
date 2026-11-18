/**
 * The little ones that follow him home (follow.ts, followPlay.ts; 2-3.md "follow.ts: the engine packet's contract"): the six planted
 * toys, each RED with its rule taken out (level.md rules 21-23). Pokey is the real engine at 30 fps (realPlay.ts) through the game's own
 * InputEngine (a tap is its 80 ms hold, R-165.284), as the design's flight (reference/specs/sims/follow23.ts) flew him.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DT, RealPlay } from './realPlay.ts';
import { InputEngine } from './inputEngine.ts';
import { setDifficulty } from './difficulty.ts';
import { lineSeen, newTrail, record, regroup, spook, stepLine, type Follower, type Trail } from './follow.ts';
import { FollowPlay } from './followPlay.ts';
import { W2_FOLLOW } from './gen2/worlds/w2.ts';
import { easyGoalFor, normalGoal, rescueCount } from './goals.ts';
import type { WatchZone } from './watcher.ts';
import type { Collectible, Platform } from './types.ts';

const FLOOR = 800;
const GAP = W2_FOLLOW.gap;
const PACE = W2_FOLLOW.pace.normal;
const floor = (w = 14000): Platform => ({ id: 1, x: 0, y: FLOOR, width: w, height: 200, type: 'solid' }) as Platform;

/** the real Pokey on a bare floor, standing at x, driven by the game's InputEngine */
function rig(x: number, pl: Platform[] = [floor()]) {
  const r = new RealPlay('2-3', 1);
  const inp = new InputEngine();
  inp.source = 'pad';
  r.e.input = inp as never;
  r.bare(pl);
  r.stand(x, FLOOR);
  inp.clearAll();
  for (let i = 0; i < 4; i++) r.e.update(DT);
  return { r, inp };
}

/** a trail laid 600 px back along the floor and n little ones bunched on it behind him */
function bunched(x: number, n: number): { t: Trail; line: Follower[] } {
  const t = newTrail(x - 600, FLOOR);
  record(t, { x, y: FLOOR, grounded: true }, 'walk');
  const kinds = ['duck', 'otter', 'capy'] as const;
  const line: Follower[] = Array.from({ length: n }, (_, i) => ({ kind: kinds[i % 3], s: t.s - GAP * (i + 1), x: x - GAP * (i + 1), y: FLOOR, moved: false, state: 'follow', facing: 1 }));
  return { t, line };
}

/** he runs D px from a stand and lets go; the line (pace) behind him. The widest line (him to tail) and how long it bunches after he stands */
function runStop(D: number, pace: number) {
  const { r, inp } = rig(1000);
  const { t, line } = bunched(r.p.x, 5);
  const release = r.p.x + D;
  inp.triggerTouchMove('right');
  let k = 0, stood = -1, still = 0, widest = 0, gone = false;
  for (; k < 900; k++) {
    if (!gone && r.p.x >= release) { inp.triggerTouchMove("none"); gone = true; }
    r.e.update(DT);
    record(t, r.p, 'walk');
    stepLine(t, line, pace, GAP, DT);
    if (stood < 0 && gone && Math.abs(r.p.vx) < 0.5) stood = k;
    widest = Math.max(widest, r.p.x - line[4].x);
    still = stood >= 0 && line.every((f) => !f.moved) ? still + 1 : 0;
    if (still >= 6) break;
  }
  return { widest, bunch: (k - 5 - stood) * DT };
}

test('toy 1, the line on a bare floor: he runs 600 px and lets go; widest 357 +-10 px, bunched 1.0 +-0.2 s after he stands (2-3.md flight)', () => {
  const q = runStop(600, PACE);
  assert.ok(Math.abs(q.widest - 357) <= 10, `widest ${q.widest.toFixed(1)} px`);
  assert.ok(Math.abs(q.bunch - 1.0) <= 0.2, `bunched ${q.bunch.toFixed(2)} s after he stands`);
});

test('toy 1 planted: with no pace cap the line never stretches (widest is the bunched 170 px), so the toy goes RED', () => {
  const q = runStop(600, 1e6);
  assert.ok(Math.abs(q.widest - 357) > 10, `planted widest ${q.widest.toFixed(1)} px`);
});

/** three tap hops in a run, then he stands; his apexes and the first little one's (x of the highest point of each air time) */
function hops(groundedOnly: boolean) {
  const { r, inp } = rig(1000);
  const { t, line } = bunched(r.p.x, 5);
  inp.triggerTouchMove('right');
  const x0 = r.p.x;
  const his: number[] = [], its: number[] = [];
  let n = 0, since = -1, lift = -1, stop = -1, still = 0, top = Infinity, topX = 0, ftop = Infinity, ftopX = 0;
  for (let k = 0; k < 900; k++) {
    if (r.p.grounded && r.p.x > x0 + 120) {
      if (n < 3 && since === 1) { inp.triggerTouchUp(0, 80); lift = k + 2; n++; }
      since++;
    } else since = r.p.grounded ? since : 0;
    if (n >= 3 && r.p.grounded && since > 2 && stop < 0) { inp.triggerTouchMove('none'); stop = k; }
    if (k === lift) inp.releaseTouchUp();
    r.e.update(DT);
    if (!groundedOnly || r.p.grounded) record(t, r.p, 'walk');
    stepLine(t, line, PACE, GAP, DT);
    if (!r.p.grounded) { if (r.p.y < top) { top = r.p.y; topX = r.p.x; } } else if (top < FLOOR - 1) { his.push(topX); top = Infinity; }
    const f = line[0];
    if (f.y < FLOOR - 1) { if (f.y < ftop) { ftop = f.y; ftopX = f.x; } } else if (ftop < FLOOR - 1) { its.push(ftopX); ftop = Infinity; }
    still = stop >= 0 && line.every((g) => !g.moved) ? still + 1 : 0;
    if (still >= 6) break;
  }
  return { his, its, standing: line.map((g) => g.y) };
}

test('toy 2, the hop replay: the first little one hops where he hopped, each apex at his apex x +-4 px', () => {
  const q = hops(false);
  assert.equal(q.his.length, 3, `his hops ${q.his.map(Math.round)}`);
  assert.equal(q.its.length, 3, `its hops ${q.its.map(Math.round)}`);
  for (let i = 0; i < 3; i++) assert.ok(Math.abs(q.its[i] - q.his[i]) <= 4, `hop ${i + 1}: his apex x ${q.his[i].toFixed(1)}, its ${q.its[i].toFixed(1)}`);
  // (and when he stands just past a landing, none of them is left standing in the air: it finishes its hop, or waits at the take-off)
  assert.ok(q.standing.every((y) => Math.abs(y - FLOOR) < 0.5), `they stand on the floor: ${q.standing.map((y) => y.toFixed(1))}`);
});

test('toy 2 planted: a trail recorded only on the ground has no hops in it, so the toy goes RED', () => {
  const q = hops(true);
  assert.equal(q.his.length, 3);
  assert.notEqual(q.its.length, 3, `planted: its hops ${q.its.length}`);
});

/** he walks to a post's foot (x 1000), climbs 300 px up it for 3 s, then comes down 60 px on; `hold`: the trail's mode while he climbs */
function climb(mode: 'hold' | 'walk') {
  const t = newTrail(400, FLOOR);
  record(t, { x: 1000, y: FLOOR, grounded: true }, 'walk');
  const { line } = { line: bunched(1000, 5).line };
  let past = 0, up = 0;
  for (let k = 0; k < 90; k++) {
    record(t, { x: 1000, y: FLOOR - (300 * k) / 90, grounded: false }, mode);
    stepLine(t, line, PACE, GAP, DT);
    for (const f of line) {
      if (f.x > 1000 - GAP + 0.5) past++;
      if (f.y < FLOOR - 0.5) up++;
    }
  }
  const head = line[0].x;
  // (down again, 60 px on: back on the ground the line passes the foot)
  record(t, { x: 1000, y: FLOOR, grounded: true }, mode === 'hold' ? 'walk' : mode);
  record(t, { x: 1060, y: FLOOR, grounded: true }, 'walk');
  let k = 0;
  for (; k < 300; k++) {
    stepLine(t, line, PACE, GAP, DT);
    if (!line.some((f) => f.moved)) break;
  }
  return { past, up, head, rejoined: k * DT, behind: 1060 - line[0].x };
}

test('toy 3, the climb: while he climbs no little one passes the foot or leaves the ground; down 60 px on, they rejoin', () => {
  const q = climb('hold');
  assert.equal(q.past, 0, 'a little one passed the foot');
  assert.equal(q.up, 0, 'a little one climbed');
  assert.ok(Math.abs(q.head - (1000 - GAP)) < 1, `the first waits ${GAP} px short of the foot (x ${q.head.toFixed(1)})`);
  assert.ok(q.rejoined <= 0.5, `rejoined in ${q.rejoined.toFixed(2)} s (the flight: 0.3 s)`);
  assert.ok(Math.abs(q.behind - GAP) < 1, `the first stands ${q.behind.toFixed(1)} px behind him`);
});

test('toy 3 planted: with the WAIT ignored (his climb recorded as a walk) the line climbs the post after him, so the toy goes RED', () => {
  const q = climb('walk');
  assert.ok(q.up > 0 || q.past > 0, 'planted: nobody climbed');
});

test('toy 3, the engine\'s mode: climbing, swinging, hanging, riding and a fall are holds; his own hop is a walk (followPlay.ts)', () => {
  const zones: WatchZone[] = [];
  const fp = new FollowPlay(W2_FOLLOW, false, { exitX: 9000, zones, covers: [], platforms: [floor()], safeWater: [] }, { x: 1000, y: FLOOR });
  const step = (h: Partial<{ x: number; y: number; vy: number; grounded: boolean; climbing: boolean }>) => fp.step(DT, { x: 1000, y: FLOOR, vy: 0, grounded: true, ...h }, floor(), () => 0.5);
  step({});
  step({ x: 1010 });
  step({ x: 1010, y: FLOOR - 40, climbing: true, grounded: false });
  assert.ok(fp.trail.held, 'a climb holds');
  step({ x: 1010, y: FLOOR, grounded: true });
  assert.ok(!fp.trail.held, 'back on the ground');
  step({ x: 1020, y: FLOOR - 10, vy: -400, grounded: false });
  assert.ok(!fp.trail.held, 'his own hop off the ground is a walk');
  step({ x: 1030, y: FLOOR, grounded: true });
  step({ x: 1040, y: FLOOR + 10, vy: 120, grounded: false });
  assert.ok(fp.trail.held, 'walking off an edge is a fall: a hold');
});

/** a heron over [0, 1200]; he holds at a post at 1000, the line bunched at its foot: B at 966 (out of the reeds), A at 932 (in them) */
function heronToy(readHim: boolean) {
  const zone: WatchZone = { x0: 0, x1: 1200, calm: [5, 5] };
  const covers = [{ x: 880, w: 80, y: FLOOR }];
  // (his trail starts before the stretch, as a stage's does: a spooked one runs back along his path to the stretch's start)
  const fp = new FollowPlay(W2_FOLLOW, false, { exitX: 9000, zones: [zone], covers, platforms: [floor()], safeWater: [] }, { x: -100, y: FLOOR });
  const hero = { x: 1000, y: FLOOR, vy: 0, grounded: true };
  fp.step(DT, { ...hero, x: -100 }, floor(), () => 0);
  for (let x = -70; x <= 1000; x += 30) fp.step(DT, { ...hero, x }, floor(), () => 0);
  fp.step(DT, hero, floor(), () => 0);
  fp.free('duck', { x: 970, y: FLOOR }, { x: 970, y: FLOOR });
  fp.free('otter', { x: 940, y: FLOOR }, { x: 940, y: FLOOR });
  for (let k = 0; k < 60; k++) fp.step(DT, { ...hero, x: 1000, y: FLOOR - 20, climbing: true, grounded: false } as never, undefined, () => 0);
  const [b, a] = fp.line;
  const at = { a: a.x, b: b.x };
  // (him: in the open beside the post, still, under the same look; a planted watcher that reads him counts him as a little one)
  const him: Follower = { kind: 'capy', s: 0, x: 1000, y: FLOOR, moved: false, state: 'follow', facing: 1 };
  let heSeen = false;
  for (let k = 0; k < Math.round(12 / DT); k++) {
    const ev = fp.step(DT, { ...hero, y: FLOOR - 20, climbing: true, grounded: false } as never, undefined, () => 0);
    void ev;
    for (const h of fp.herons) if (h.lookX !== null && readHim && lineSeen(h.lookX, [him], covers).length) heSeen = true;
  }
  return { a, b, at, heSeen, passes: fp.herons[0].s.passes };
}

test('toy 4, the heron reads the line: one still in the open is spooked back to the stretch start, one still in the reeds is not; never him', () => {
  const q = heronToy(false);
  assert.ok(q.passes >= 1, 'the heron looked');
  assert.ok(q.at.a > 890 && q.at.a < 950, `A stands in the reeds (x ${q.at.a.toFixed(1)})`);
  assert.ok(q.at.b > 950, `B stands in the open (x ${q.at.b.toFixed(1)})`);
  assert.equal(q.a.state, 'follow', 'A, still in the reeds, is not seen');
  assert.equal(q.b.state, 'spooked', 'B, still in the open, is seen');
  assert.ok(q.b.back && Math.abs(q.b.x) < 1, `B ran back to the stretch's start and waits (x ${q.b.x.toFixed(1)})`);
});

test('toy 4 planted: a watcher that reads him sees him (he stands still in the open beside the post), so the toy goes RED', () => {
  const q = heronToy(true);
  assert.ok(q.heSeen, 'planted: a watcher reading him would have seen him');
});

test('toy 4, the look sweeps the stretch in WORLD x, past the view: a little one 600 px behind him upright is read', () => {
  // (watcher.ts shadowX crosses the view: upright 440 px of stage, so a tail 600 px back was never under it. 2-3.md Pushback 1)
  const zone: WatchZone = { x0: 0, x1: 2000, calm: [5, 5] };
  const fp = new FollowPlay(W2_FOLLOW, false, { exitX: 9000, zones: [zone], covers: [], platforms: [floor()], safeWater: [] }, { x: 1700, y: FLOOR });
  const looks: number[] = [];
  for (let k = 0; k < Math.round(10 / DT); k++) {
    fp.step(DT, { x: 1700, y: FLOOR, vy: 0, grounded: true }, floor(), () => 0);
    const h = fp.herons[0];
    if (h.lookX !== null) looks.push(h.lookX);
  }
  assert.ok(Math.min(...looks) < 1700 - 600 && Math.max(...looks) > 1700, `the look crossed ${Math.round(Math.min(...looks))}-${Math.round(Math.max(...looks))}`);
  assert.ok(Math.min(...looks) <= -100 && Math.max(...looks) >= 2100, `from 160 px beyond one end to 160 px beyond the other (${Math.round(Math.min(...looks))} to ${Math.round(Math.max(...looks))}, sampled a frame in)`);
});

test('toy 5, the regroup at a flag: a lost heart re-forms the whole line, a spooked one too, bunched behind him', () => {
  const { line } = bunched(3000, 5);
  spook(line[2], 1000);
  line[2].x = 1000;
  line[2].back = true;
  const t = regroup(line, { x: 1800, y: FLOOR }, GAP, 1);
  line.forEach((f, i) => {
    assert.equal(f.state, 'follow', `little one ${i + 1}`);
    assert.ok(Math.abs(f.x - (1800 - GAP * (i + 1))) < 0.5, `little one ${i + 1} at x ${f.x}`);
  });
  assert.equal(t.s - line[0].s, GAP);
});

test('toy 5 planted: a regroup that leaves a spooked one where it hid strands it at its reed, so the toy goes RED', () => {
  const { line } = bunched(3000, 5);
  spook(line[2], 1000);
  line[2].x = 1000;
  // (the plant: re-form only the ones still following)
  const keep = line.filter((f) => f.state === 'follow');
  regroup(keep, { x: 1800, y: FLOOR }, GAP, 1);
  assert.notEqual(line[2].state, 'follow');
  assert.ok(Math.abs(line[2].x - 1000) < 1, 'planted: the spooked one stayed at its reed');
});

/** a toy marsh in the real engine: 5 cages along a floor, a flag, the exit; proto.follow on (unless `follow` is false) */
function marsh(setting: 'normal' | 'easy', follow = true) {
  setDifficulty(setting);
  try {
    const { r, inp } = rig(300);
    const e = r.e as never as Record<string, any>;
    const cages: Collectible[] = [600, 900, 1200, 1500, 1800].map((x, i) => ({ id: 100 + i, x, y: FLOOR - 26, type: 'cage', collected: false, critter: (['duck', 'otter', 'capy'] as const)[i % 3] }) as Collectible);
    const exit = { id: 200, x: 3200, y: FLOOR - 40, type: 'exit_totem', collected: false } as Collectible;
    e.collectibles = [...cages, exit];
    const st = e.currentStage;
    st.exitTotemX = 3200;
    st.checkpoints = [{ x: 2200, y: FLOOR, reached: false }];
    const want = setting === 'easy' ? easyGoalFor(5) : 5;
    st.config = { ...st.config, objectiveType: 'rescue', targetCount: want };
    e.proto = { hints: [], covers: [], beats: [], movedPickups: [], ...(follow ? { follow: W2_FOLLOW } : {}) };
    e.startFollow();
    return { r, inp, e, cages, exit, want };
  } finally {
    setDifficulty('normal');
  }
}

/** he walks to the exit, freeing the first `n` cages as he reaches each (as a burst does), and stands there; the door's lock on the way */
function walkHome(setting: 'normal' | 'easy', n: number, follow = true) {
  const m = marsh(setting, follow);
  const { r, inp, e, cages, exit } = m;
  inp.triggerTouchMove('right');
  let freed = 0, lockedAtFree: boolean | undefined;
  for (let k = 0; k < 2400; k++) {
    if (freed < n && r.p.x >= cages[freed].x - 30) e.freeCritter(cages[freed++]);
    if (r.p.x >= 3200) inp.triggerTouchMove('none');
    r.e.update(DT);
    if (freed === n && lockedAtFree === undefined) lockedAtFree = exit.isLocked;
    if (r.p.x >= 3200 && (!follow || e.follow.home() >= m.want)) break;
  }
  for (let i = 0; i < 30; i++) r.e.update(DT);
  return { lockedAtFree, lockedAtEnd: exit.isLocked, home: e.follow?.home() ?? 0, want: m.want, line: e.follow?.line as Follower[] | undefined };
}

test('toy 6, the goal "bring N home": Normal 5, Easy 3 (goals.ts); freed ones do not open the door, home ones do', () => {
  const cages = { collectibles: [1, 2, 3, 4, 5].map((i) => ({ id: i, x: i, y: 0, type: 'cage', collected: false })), enemies: [], config: { objectiveType: 'rescue', worldIndex: 2, miniIndex: 3 }, platforms: [] };
  assert.equal(normalGoal(cages as never), 5);
  assert.equal(easyGoalFor(5), 3);
  assert.equal(rescueCount(5, 2), 2, 'a follow stage counts only those home');
  assert.equal(rescueCount(5, undefined), 5, 'every other stage counts the freed');
  const nq = walkHome('normal', 5);
  assert.equal(nq.lockedAtFree, true, 'Normal: all five freed, none home: the door stays shut');
  assert.equal(nq.home, 5, `Normal: home ${nq.home}`);
  assert.equal(nq.lockedAtEnd, false, 'Normal: all five home: the door opens');
  const eq = walkHome('easy', 3);
  assert.equal(eq.want, 3);
  assert.equal(eq.lockedAtFree, true, 'Easy: three freed, none home: shut');
  assert.equal(eq.home, 3);
  assert.equal(eq.lockedAtEnd, false, 'Easy: three home: open');
});

test('toy 6 planted: a goal that counts the freed (no follow row) opens the door before anyone is home, so the toy goes RED', () => {
  const q = walkHome('normal', 5, false);
  assert.notEqual(q.lockedAtFree, true, 'planted: the door opened at the burst');
});

test('the engine: a lost heart re-forms the line bunched behind him at the flag (respawnAtCheckpoint), spooked ones too', () => {
  const m = marsh('normal');
  const { r, inp, e, cages } = m;
  for (const c of cages) e.freeCritter(c);
  inp.triggerTouchMove('right');
  let k = 0;
  while (r.p.x < 2500 && k < 600) { r.e.update(DT); k++; }
  inp.triggerTouchMove('none');
  const line = e.follow.line as Follower[];
  spook(line[1], 1000);
  for (let i = 0; i < 20; i++) r.e.update(DT);
  e.currentStage.checkpoints[0].reached = true;
  e.respawnAtCheckpoint('pit');
  r.e.update(DT);
  const flag = r.p.x;
  assert.ok(Math.abs(flag - 2200) < 40, `he is back at the flag (x ${flag})`);
  line.forEach((f, i) => {
    assert.equal(f.state, 'follow', `little one ${i + 1}: ${f.state}`);
    assert.ok(f.x < flag && f.x > flag - GAP * 6 - 2, `little one ${i + 1} bunched behind him (x ${f.x.toFixed(1)}, he ${flag.toFixed(1)})`);
  });
});

test('the engine: the line paddles over splash-back water on his path and nobody is hurt (no life, no heart)', () => {
  const pl: Platform[] = [
    { id: 1, x: 0, y: FLOOR, width: 1300, height: 200, type: 'solid' } as Platform,
    { id: 2, x: 1360, y: FLOOR, width: 90, height: 60, type: 'solid' } as Platform,
    { id: 3, x: 1510, y: FLOOR, width: 90, height: 60, type: 'solid' } as Platform,
    { id: 4, x: 1660, y: FLOOR, width: 4000, height: 200, type: 'solid' } as Platform,
  ];
  const { r, inp } = rig(1100, pl);
  const e = r.e as never as Record<string, any>;
  e.currentStage.rivers = [{ x0: 1300, x1: 1660, surfaceY: FLOOR + 20, speed: 0, dir: 1, safe: { backX: 1250, backY: FLOOR } }];
  e.currentStage.exitTotemX = 9000;
  e.proto = { hints: [], covers: [], beats: [], movedPickups: [], follow: W2_FOLLOW };
  e.startFollow();
  const fp = e.follow as FollowPlay;
  for (const [i, x] of [1000, 980, 960].entries()) fp.free((['duck', 'otter', 'capy'] as const)[i], { x, y: FLOOR }, { x, y: FLOOR });
  const hp = r.p.hp;
  inp.triggerTouchMove('right');
  let paddled = 0, lift = -1;
  for (let k = 0; k < 360; k++) {
    const on = r.platforms.find((q) => q.id === r.standingOn);
    if (r.p.grounded && on && on.x + on.width - r.p.x < 25 && on.id !== 4 && lift < 0) { inp.triggerTouchUp(0, 80); lift = k + 2; }
    if (k === lift) { inp.releaseTouchUp(); lift = -1; }
    r.e.update(DT);
    if (fp.line.some((f) => f.paddle)) paddled++;
    if (r.p.x > 2100) inp.triggerTouchMove('none');
  }
  assert.ok(!r.died, 'he crossed on the stones');
  assert.ok(paddled > 10, `the line paddled (${paddled} frames)`);
  assert.ok(fp.line.every((f) => f.x > 1660 && !f.paddle), `all three across: ${fp.line.map((f) => Math.round(f.x))}`);
  assert.equal(r.p.hp, hp, 'no heart');
});

/** the real engine, a watched stretch over the floor and him standing still in the open under it for 12 s; was he read? */
function standUnderTheLook(follow: boolean) {
  const { r } = rig(1000);
  const e = r.e as never as Record<string, any>;
  e.currentStage.exitTotemX = 9000;
  const zone: WatchZone = { x0: 0, x1: 2000, calm: [5, 5] };
  e.proto = { hints: [], covers: [], beats: [], movedPickups: [], bushes: [{ x: 1500, w: 260, y: FLOOR, kind: 'wide' }], watch: [zone], ...(follow ? { follow: W2_FOLLOW } : {}) };
  e.startFollow();
  const hp = r.p.hp;
  let seen = false;
  for (let k = 0; k < Math.round(12 / DT); k++) {
    r.e.update(DT);
    if (e.watch.seen) seen = true;
  }
  return { seen, caught: !!e.watchCaught, hp: r.p.hp - hp };
}

test('toy 4, the engine: on a stage whose little ones follow him, the watcher never reads HIM (no dive, no heart) standing in the open', () => {
  const q = standUnderTheLook(true);
  assert.equal(q.seen, false, 'the heron read him');
  assert.equal(q.caught, false);
  assert.equal(q.hp, 0);
});

test('toy 4 planted, the engine: without the follow row the same stretch is the eagle, which reads him in the open, so the toy goes RED', () => {
  const q = standUnderTheLook(false);
  assert.equal(q.seen, true, 'planted: the eagle did not see him');
});
