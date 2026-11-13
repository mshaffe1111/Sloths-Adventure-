/**
 * The vine field's feel test room (LATTICE, R-165.177; feelPairStage.ts, feelPair.ts, vineField.ts), in the real engine by touch,
 * upright (390) and sideways (1034):
 *   - a QA build only: outside one the room does not exist (no config, generateStage never builds it);
 *   - its layout (FEEL-LATTICE §5, §7): five vines 80 px apart, 450 tall, floor to bough; six of mixed lengths (150-450) with ONE gap
 *     out of reach (he must jump); a vine with a cluster to push; sound floor, nothing that hurts, no door;
 *   - Matt's rule by touch: a sideways stroke toward a vine in reach takes it in the other hand, again lets go of the old one; with no
 *     vine there, held, it hops him off as on any climb;
 *   - the speeds on the stopwatch: one hand up at 220 px/s, two hands 1.6x; the slide down 2x, a tap by the sign makes it 1.6x;
 *   - a cluster pushed up its vine tears free at the top and falls;
 *   - stepping off a bough to the floor costs nothing (loseLife is the engine's own here, not RealPlay's stub: engine-core trap 9).
 * v2 (B14, 11-13: FEEL-LATTICE §6-7; podfall.ts, fieldPlay.ts, vineField.ts ClusterGate):
 *   - pods down two columns on one steady stage beat (beat.ts): hanging on a podded vine he is knocked to the floor within a beat
 *     (counted, no heart); a vine over is never hit; two hands across a podded column are; a knock takes no vine on the way down;
 *   - a bough shut by a cluster is no footing: the climb stops at its top, no vault; freed, the bough springs open and he vaults on;
 *     a gate of two lifts a notch for the first and opens on the second.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TouchRig, stroke } from './touchRig.ts';
import { asQaBuildForTest } from './playRecorder.ts';
import { FEEL, FEEL_PAIR_ID, feelPairConfig } from './feelPairStage.ts';
import { feelClock } from './feelPair.ts';
import { generateStage } from './stageGenerator.ts';
import { CLIMB_SPEED, GRAB_REACH } from './vinePair.ts';
import { FIELD_FEEL, GATE } from './vineField.ts';
import type { Vine } from './types.ts';

const WIDTHS = [390, 1034];

test('outside a QA build there is no feel room: no config, and its id builds nothing of it', () => {
  asQaBuildForTest(false);
  assert.equal(feelPairConfig(), null);
  asQaBuildForTest(true);
  const cfg = feelPairConfig()!;
  asQaBuildForTest(false);
  let built: ReturnType<typeof generateStage> | null = null;
  try {
    built = generateStage(cfg);
  } catch {
    built = null;
  }
  assert.ok(!built?.feelRoom, 'the shipped game builds no feel room, even asked by id');
});

function room(w: number): TouchRig {
  asQaBuildForTest(true);
  const r = new TouchRig(FEEL_PAIR_ID, 1, w);
  return r;
}

test('the room: an even field, a mixed field with one gap he must jump, a cluster vine; sound floor, nothing that hurts, no door', () => {
  const r = room(1034);
  const st = r.r.stage;
  const climbs = (st.vines.filter((v) => v.vineType === 'tree_climb') as Vine[]).sort((a, b) => a.x - b.x);
  assert.equal(climbs.length, FEEL.even.length + FEEL.mixed.length + FEEL.push.length + FEEL.pods.length + FEEL.under.length);
  assert.ok(climbs.every((v) => v.field && v.climbSpeed === undefined), "every one a field vine at today's 220 px/s");
  const top = FEEL.floor - FEEL.rise;
  assert.ok(climbs.every((v) => v.topY === top), 'all hang from a bough at one height');
  const even = climbs.slice(0, 5);
  assert.ok(even.every((v, i) => v.bottomY === FEEL.floor && (!i || v.x - even[i - 1].x === 80)), 'five vines 80 apart, 450 tall');
  const mixed = climbs.slice(5, 11);
  const lens = mixed.map((v) => v.bottomY - v.topY);
  assert.ok(Math.min(...lens) === 150 && Math.max(...lens) === 450 && new Set(lens).size === 6, `six of mixed lengths (${lens})`);
  const gaps = mixed.slice(1).map((v, i) => v.x - mixed[i].x);
  assert.deepEqual(gaps.filter((g) => g > FIELD_FEEL.reach), [110], 'one gap out of reach: 110 px');
  assert.equal(st.clusters?.length, FEEL.clusters.length + FEEL.underClusters.length);
  assert.deepEqual(st.gates?.map((g) => g.clusters.length), [1, 2], 'a gate of one, then a gate of two');
  assert.equal(st.pods?.length, 4, 'pods down two columns of lane 2 and down both push vines of lane 3b');
  assert.ok(st.pods!.every((p) => p.clock === 'room-pods' && p.cost === 'knock'), 'every pod on one beat, a knock and no heart');
  const beat = st.clocks!.find((c) => c.id === 'room-pods')!;
  assert.deepEqual(beat.phases.map((q) => [q.name, q.seconds]).filter(([n]) => n === 'warn'), [['warn', 1]], 'a 1.0 s tell');
  assert.ok(Math.abs(beat.phases.reduce((n, q) => n + q.seconds, 0) - 3.6) < 1e-9, 'one steady 3.6 s beat');
  const floor = st.platforms.find((p) => p.y === FEEL.floor)!;
  assert.ok(floor && floor.x <= 0 && floor.x + floor.width >= FEEL.width, 'sound floor wall to wall');
  for (const v of climbs) {
    const b = st.platforms.find((p) => Math.abs(p.y - (top + 2)) < 1 && v.x - 30 > p.x && v.x + 30 < p.x + p.width);
    assert.ok(b, `a bough over the vine at ${v.x}, footing either side`);
  }
  assert.equal(st.enemies.length, 0);
  assert.ok(!st.zones?.length && !st.heartFalls?.length && st.waterY === undefined && !st.rivers?.length, 'nothing that hurts');
  assert.ok(st.platforms.every((p) => p.type === 'solid' && p.crumbleAfter === undefined), 'only sound footing (the gates open by fruit)');
  assert.equal(st.exitTotemX, 0, 'no door');
  const sign = st.feelRoom!.sign;
  assert.ok(climbs.every((v) => Math.abs(sign.x - v.x) > GRAB_REACH + 20), "the sign stands out of every vine's grab reach");
});

const press = (r: TouchRig) => r.push(stroke(1, [[0, 160, 700], [120, 160, 600]], false));
const lift = (r: TouchRig) => r.push([{ t: 0, k: 'u', id: 1, x: 160, y: 600 }]);
/** a quick tap on the right half (a punch, by the gestures) */
const tap = (r: TouchRig) => r.push(stroke(2, [[0, r.width * 0.78, 300], [60, r.width * 0.78, 300]], true));

/** a sideways stroke on the left half, then the finger up: `dir` -1 left, 1 right; `hold` ms kept down at its end */
function side(r: TouchRig, dir: -1 | 1, hold = 250) {
  r.push(stroke(1, [[0, 160, 650], [90, 160 + dir * 70, 650]], false));
  r.run(90 + hold);
  r.push([{ t: 0, k: 'u', id: 1, x: 160 + dir * 70, y: 650 }]);
  r.run(250);
}
const even = (i: number) => FEEL.even[i][0];

/** stand at a vine's foot, hold up for `ms`, let go: he hangs on it */
function upFor(r: TouchRig, x: number, ms: number) {
  r.r.stand(x, FEEL.floor);
  r.clear();
  r.run(200);
  press(r);
  r.run(ms);
  lift(r);
  r.run(300);
}

test("Matt's rule by touch: toward a vine in reach, both hands; again, he lets go of the old; at the field's edge a held push hops off", () => {
  for (const w of WIDTHS) {
    const r = room(w);
    upFor(r, even(1), 700);
    assert.ok(r.p.climbing && r.p.x === even(1) && !r.p.climbPair, `@${w}: one hand on the second vine`);
    side(r, 1);
    assert.ok(r.p.climbing && r.p.x === (even(1) + even(2)) / 2 && r.p.climbPair === 80, `@${w}: both hands (x ${r.p.x}, pair ${r.p.climbPair})`);
    side(r, 1);
    assert.ok(r.p.climbing && r.p.x === even(2) && !r.p.climbPair, `@${w}: again right: one hand on the new vine (x ${r.p.x})`);
    side(r, -1);
    side(r, -1);
    assert.ok(r.p.climbing && r.p.x === even(1), `@${w}: and back left the same way (x ${r.p.x})`);
    side(r, -1);
    side(r, -1);
    assert.ok(r.p.climbing && r.p.x === even(0), `@${w}: to the first vine (x ${r.p.x})`);
    // the first vine: nothing to its left, so a held push is the plain one and hops him off (as on any climb)
    side(r, -1, 700);
    assert.ok(!r.p.climbing, `@${w}: a held push with no vine there hops him off`);
  }
});

test('the 110 px gap is out of reach: a push there takes nothing, a jump across catches the next vine', () => {
  const r = room(1034);
  const [x0] = FEEL.mixed[2], [x1] = FEEL.mixed[3];
  r.r.stand(x0, FEEL.floor);
  r.clear();
  r.run(200);
  // (the third mixed vine ends 70 over the floor: a jump straight up takes it)
  r.push(stroke(1, [[0, 160, 700], [100, 160, 560]], false));
  r.run(900);
  lift(r);
  r.run(300);
  assert.ok(r.p.climbing && r.p.x === x0, `he hangs on the vine before the gap (x ${r.p.x})`);
  side(r, 1, 100);
  assert.ok(r.p.climbing && r.p.x === x0 && !r.p.climbPair, 'a push toward the gap takes nothing');
  // a flick up and right: the leap off, caught on the far vine
  r.push(stroke(1, [[0, 160, 700], [80, 215, 610]], true));
  let caught = false;
  r.run(1500, () => (caught ||= r.p.climbing && r.p.x === x1));
  assert.ok(caught, `a jump across catches the vine past the gap (x ${r.p.x.toFixed(0)})`);
});

/** the speed of the last climb (px/s), measured mid-climb */
let rate = 0;

/** hold up from the foot until he stands on the bough; the stopwatch's line */
function climbUp(r: TouchRig, x: number, two: boolean, label: string): number {
  r.r.stand(x, FEEL.floor);
  r.clear();
  r.run(200);
  press(r);
  r.run(150);
  lift(r);
  if (two) side(r, 1, 100);
  press(r);
  // (his speed, measured mid-climb over half a second)
  r.run(300);
  const y0 = r.p.y;
  r.run(500);
  rate = (y0 - r.p.y) / 0.5;
  r.run(2700);
  lift(r);
  r.run(400);
  assert.ok(r.p.grounded && r.p.y < FEEL.floor - FEEL.rise + 10, `${label}: he stands on the bough (y ${r.p.y.toFixed(0)})`);
  const line = feelClock().lines.find((l) => l.label === label);
  assert.ok(line && line.secs !== null && !line.running, `${label}: the stopwatch holds a time (${JSON.stringify(feelClock().lines)}, pair ${r.p.climbPair})`);
  return line!.secs!;
}

/** from hanging at the top, hold down to the floor; the stopwatch's line */
function climbDown(r: TouchRig, x: number, two: boolean, label: string): number {
  upFor(r, x, 1950);
  assert.ok(r.p.climbing && r.p.y < FEEL.floor - FEEL.rise + 50, `${label}: he hangs near the top (y ${r.p.y.toFixed(0)})`);
  if (two) side(r, 1, 100);
  r.push(stroke(1, [[0, 160, 600], [120, 160, 700]], false));
  // (two hands down at 0.5x: about 4 s)
  r.run(5000);
  lift(r);
  r.run(400);
  assert.ok(r.p.grounded && Math.abs(r.p.y - FEEL.floor) < 2, `${label}: he is down on the floor (y ${r.p.y.toFixed(0)})`);
  const line = feelClock().lines.find((l) => l.label === label);
  assert.ok(line && line.secs !== null && !line.running, `${label}: the stopwatch holds a time (${JSON.stringify(feelClock().lines)}, pair ${r.p.climbPair})`);
  return line!.secs!;
}

test('the speeds on the stopwatch: up one hand 220 px/s, two hands 1.6x; the slide down 2x, then 1.6x by the sign; two hands down slow', () => {
  for (const w of WIDTHS) {
    const r = room(w);
    const u1 = climbUp(r, even(1), false, 'Up, one hand');
    const want = FEEL.rise / CLIMB_SPEED;
    assert.ok(u1 > want - 0.3 && u1 < want + 0.6, `@${w}: one hand up in ${u1.toFixed(2)} s (220 px/s: ${want.toFixed(2)} s)`);
    assert.ok(Math.abs(rate - CLIMB_SPEED) < 3, `@${w}: one hand at ${rate.toFixed(0)} px/s`);
    const u2 = climbUp(r, even(1), true, 'Up, two hands');
    assert.ok(Math.abs(rate - CLIMB_SPEED * 1.6) < 3, `@${w}: two hands at ${rate.toFixed(0)} px/s (1.6x)`);
    assert.ok(u2 < u1, `@${w}: two hands up in ${u2.toFixed(2)} s, the step's pause and all (one ${u1.toFixed(2)})`);
    const d1 = climbDown(r, even(1), false, 'Slide down 2×');
    assert.ok(d1 < u1 * 0.65, `@${w}: the slide in ${d1.toFixed(2)} s`);
    const d2 = climbDown(r, even(1), true, 'Down, two hands');
    assert.ok(d2 > u1 * 1.3, `@${w}: two hands down, slow: ${d2.toFixed(2)} s`);
    // to the sign, and a tap by it
    r.r.stand(FEEL.sign - 20, FEEL.floor);
    r.clear();
    r.run(200);
    const punches = r.p.punching;
    tap(r);
    r.run(500);
    assert.equal(feelClock().speed, 1.6, `@${w}: the tap by the sign switched the slide to 1.6x`);
    assert.ok(!punches && !r.p.punching, `@${w}: and threw no punch`);
    const d3 = climbDown(r, even(1), false, 'Slide down 1.6×');
    assert.ok(d3 > d1 + 0.1 && d3 < u1 * 0.8, `@${w}: the 1.6x slide in ${d3.toFixed(2)} s (2x ${d1.toFixed(2)})`);
    assert.equal(feelClock().lines.find((l) => l.label === 'Slide down 2×')?.secs, d1, 'the 2x time is still on the clock');
  }
});

test('pushing the cluster: climbing up under it pushes it up its vine, slowly; at the top it tears free and falls', () => {
  for (const w of WIDTHS) {
    const r = room(w);
    const e = r.r.e as unknown as { clusters: Array<{ y: number; falling?: boolean; gone?: boolean }>; clustersFreed: number };
    const c = e.clusters[0];
    const y0 = c.y;
    const x = FEEL.push[0][0];
    upFor(r, x, 1200);
    assert.ok(r.p.climbing && c.y < y0 - 20, `@${w}: pushed up (${y0} to ${c.y.toFixed(0)})`);
    assert.ok(Math.abs(r.p.y - 78 - c.y) < 1, `@${w}: on his hands`);
    // the push is slow: 0.6x of 220 for a second
    const before = c.y;
    press(r);
    r.run(1000);
    const rate = before - c.y;
    assert.ok(c.falling || (rate > 220 * 0.6 - 25 && rate < 220 * 0.6 + 25), `@${w}: pushed at 0.6x (${rate.toFixed(0)} px in 1 s)`);
    r.run(4000);
    lift(r);
    r.run(2000);
    assert.equal(e.clustersFreed, 1, `@${w}: torn free`);
    assert.ok(c.gone, `@${w}: and fallen away`);
  }
});

test('stepping off a bough to the floor costs nothing (the engine’s own loseLife)', () => {
  const r = room(1034);
  delete (r.r.e as Record<string, unknown>).loseLife;
  r.r.safe = false;
  const lives = r.r.e.lives;
  assert.equal(typeof lives, 'number');
  climbUp(r, even(0), false, 'Up, one hand');
  // walk off the bough's left end
  r.push(stroke(1, [[0, 300, 600], [150, 150, 600]], false));
  r.run(2500);
  r.push([{ t: 0, k: 'u', id: 1, x: 150, y: 600 }]);
  r.run(800);
  assert.ok(r.p.grounded && Math.abs(r.p.y - FEEL.floor) < 2, `he lands on the floor (y ${r.p.y.toFixed(0)})`);
  assert.equal(r.r.e.lives, lives, 'no life lost');
  assert.equal(r.r.e.statLivesLost, 0, 'no life lost (the counter)');
  assert.equal(r.r.e.statHeartsLost, 0, 'no heart lost (the counter engine.ts statHeartsLost adds every hurt to)');
});

type FieldEngine = { field: { pods: Array<{ id: number; x: number }> } | null; clusters: Array<{ id: number; y: number; falling?: boolean; gone?: boolean }>; clustersFreed: number; platforms: Array<{ id: number; broken?: boolean; y: number }> };
const fieldOf = (r: TouchRig) => r.r.e as unknown as FieldEngine;
const podX = (i: number) => FEEL.pods[i][0];

/** hang on a vine of lane 2 half way up and keep still for `ms`: how many knocks the clock counts, and where he ends */
function hangOn(r: TouchRig, x: number, two: boolean, ms: number, holdDown = false) {
  // (RealPlay keeps him safe from every hit unless told: a pod's knock waits for his safety to run out, as any hit does)
  r.r.safe = false;
  upFor(r, x, 900);
  if (two) side(r, 1, 100);
  // (held down on two hands he comes down slowly, and a thumb still down as he is knocked off must not take a vine on the way down)
  if (holdDown) r.push(stroke(1, [[0, 160, 600], [120, 160, 700]], false));
  const before = feelClock().knocks;
  let knocked = false, onFloor = false, retook = false;
  r.run(ms, () => {
    knocked ||= feelClock().knocks > before;
    if (knocked && !onFloor && r.p.climbing) retook = true;
    onFloor ||= knocked && r.p.grounded && Math.abs(r.p.y - FEEL.floor) < 2;
  });
  if (holdDown) lift(r);
  return { knocks: feelClock().knocks - before, onFloor, retook };
}

test('pods: on a podded vine he is knocked to the floor within a beat (counted, no heart); a vine over is safe; two hands across one are not', () => {
  for (const w of WIDTHS) {
    // podded column: lane 2's second vine
    let r = room(w);
    const lives = r.r.e.lives;
    let h = hangOn(r, podX(FEEL.podCols[0]), false, 4500);
    assert.ok(h.knocks >= 1 && h.onFloor, `@${w}: knocked off and down to the floor (${h.knocks} knocks)`);
    assert.equal(r.r.e.statHeartsLost, 0, `@${w}: no heart in the room`);
    assert.equal(r.r.e.lives, lives);
    // a free vine (the first, beside the podded second): never hit over two beats
    r = room(w);
    h = hangOn(r, podX(0), false, 7500);
    assert.equal(h.knocks, 0, `@${w}: a vine out of the pods' columns is safe`);
    assert.ok(r.p.climbing, `@${w}: still hanging`);
    // two hands from that free vine onto the podded one: exposed
    r = room(w);
    h = hangOn(r, podX(0), true, 4500);
    assert.ok(h.knocks >= 1, `@${w}: two hands span the podded column: knocked (${h.knocks})`);
    // knocked off with the thumb still held down: no vine taken on the way down, he lands on the floor
    r = room(w);
    h = hangOn(r, podX(0), true, 4500, true);
    assert.ok(h.knocks >= 1 && h.onFloor && !h.retook, `@${w}: knocked to the floor, no vine retaken (knocks ${h.knocks}, floor ${h.onFloor}, retook ${h.retook})`);
  }
});

test('a gate: shut, its bough is no footing and the climb stops at the top; the cluster pushed free springs it open and he vaults on', () => {
  for (const w of WIDTHS) {
    const r = room(w);
    const e = fieldOf(r);
    const bough = e.platforms.find((p) => p.id === 4)!;
    assert.ok(bough.broken, `@${w}: shut`);
    // up the second vine of lane 3a (no cluster on it): at the top he stays hanging, no vault onto a shut bough
    upFor(r, FEEL.push[1][0], 2600);
    assert.ok(r.p.climbing && r.p.y < FEEL.floor - FEEL.rise + 20, `@${w}: hanging at the top (y ${r.p.y.toFixed(0)}, climbing ${r.p.climbing})`);
    // over to the cluster's vine, down under it and push it up and free
    r.r.stand(FEEL.push[0][0], FEEL.floor);
    r.clear();
    r.run(200);
    press(r);
    r.run(6500);
    lift(r);
    r.run(1500);
    assert.equal(e.clustersFreed, 1, `@${w}: the cluster freed`);
    assert.ok(!bough.broken, `@${w}: the bough springs open`);
    assert.equal(feelClock().freed, 1);
    // now up the second vine again: he vaults onto it
    upFor(r, FEEL.push[1][0], 2600);
    assert.ok(r.p.grounded && Math.abs(r.p.y - (FEEL.floor - FEEL.rise + 2)) < 4, `@${w}: he stands on the opened bough (y ${r.p.y.toFixed(0)})`);
  }
});

test('a gate of two lifts a notch for the first cluster and opens on the second; a freed cluster lands on the floor, never on him', () => {
  const r = room(1034);
  const e = fieldOf(r);
  const bough = e.platforms.find((p) => p.id === 6)!;
  r.r.safe = false;
  const heart = r.r.e.statHeartsLost;
  const pushUp = (x: number) => {
    // (pushed in the quiet moments: the pods may knock him off, and the cluster stays snagged where he left it; he climbs again)
    for (let i = 0; i < 6; i++) {
      r.r.stand(x, FEEL.floor);
      r.clear();
      r.run(200);
      press(r);
      r.run(4000);
      lift(r);
      r.run(800);
      if (e.clustersFreed >= (x === FEEL.under[0][0] ? 1 : 2)) return;
    }
  };
  pushUp(FEEL.under[0][0]);
  assert.equal(e.clustersFreed, 1, 'the first freed');
  assert.ok(bough.broken, 'still shut after the first');
  const gateVine = r.r.stage.vines.find((v) => v.x === FEEL.under[1][0])!;
  assert.ok((r.r.e as unknown as { field: { blocksTop(v: unknown): boolean } }).field.blocksTop(gateVine), 'and its vines still stop short of the vault');
  const gate = (r.r.e as unknown as { field: { sagOf(g: unknown, t: number): number; gates: unknown[] } }).field;
  assert.ok(Math.abs(gate.sagOf(gate.gates[1], 1e6) - GATE.sag / 2) < 0.5, 'a notch lifted: half its sag');
  pushUp(FEEL.under[3][0]);
  assert.equal(e.clustersFreed, 2, 'the second freed');
  assert.ok(!bough.broken, 'open on the second');
  assert.equal(r.r.e.statHeartsLost, heart, 'no heart: a freed cluster never hurts him');
  assert.ok(e.clusters.filter((c) => c.id !== 1).every((c) => c.gone && Math.abs(c.y - FEEL.floor) < 1), "the gate's freed clusters came down on the floor");
});

test.after(() => asQaBuildForTest(false));

test("the sign's lettering is baked once, baked again when the phone takes its canvas back (LESSONS D6) and when the font arrives", async () => {
  const { letteringFrom } = await import('./feelPair.ts');
  let made = 0;
  let lostNow = false;
  const fake = () => {
    made++;
    const g = { clearRect() {}, fillText() {}, isContextLost: () => lostNow } as unknown as CanvasRenderingContext2D;
    return { width: 0, height: 0, getContext: () => g } as unknown as HTMLCanvasElement;
  };
  let font = false;
  const a = letteringFrom('9×', fake, () => font);
  assert.equal(made, 1);
  assert.equal(letteringFrom('9×', fake, () => font), a, 'kept while nothing changed');
  font = true;
  assert.equal(letteringFrom('9×', fake, () => font), a, 'the font arrived: the same canvas, lettered again');
  assert.equal(made, 1);
  lostNow = true;
  const b = letteringFrom('9×', fake, () => font);
  lostNow = false;
  assert.notEqual(b, a, 'the phone took the canvas back: a fresh one');
  assert.equal(made, 2);
  assert.equal(letteringFrom('9×', fake, () => font), b);
});
