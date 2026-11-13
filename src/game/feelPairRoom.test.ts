/**
 * The vine pair's feel test room (FEEL-PAIR, R-165.170; feelPairStage.ts, feelPair.ts), in the real engine by touch, upright (390) and
 * sideways (1034):
 *   - a QA build only: outside one the room does not exist (no config, generateStage never builds it);
 *   - its layout: one single and one draped pair, the same height (about three storeys), 120 px+ apart, sound floor under both, ONE bough
 *     both reach with the flag on it, nothing that hurts, no door;
 *   - the stopwatch times each climb, grab to standing on the bough: the single at 220 px/s, the pair at 2x, then (a tap by the sign)
 *     1.6x; the tap there is no punch;
 *   - stepping off the bough to the floor costs nothing (loseLife is the engine's own here, not RealPlay's stub: engine-core trap 9).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TouchRig, stroke } from './touchRig.ts';
import { asQaBuildForTest } from './playRecorder.ts';
import { FEEL, FEEL_PAIR_ID, feelPairConfig } from './feelPairStage.ts';
import { feelClock } from './feelPair.ts';
import { generateStage } from './stageGenerator.ts';
import { CLIMB_SPEED, PAIR_GAP, PAIR_SPEEDS, climbReach } from './vinePair.ts';
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

test('the room: a single and a draped pair side by side, the same height, sound footing, one bough with the flag, nothing that hurts', () => {
  const r = room(1034);
  const st = r.r.stage;
  const climbs = st.vines.filter((v) => v.vineType === 'tree_climb') as Vine[];
  assert.equal(climbs.length, 2);
  const [single, pair] = [climbs.find((v) => !v.pair)!, climbs.find((v) => v.pair)!];
  assert.ok(single && pair, 'one single, one pair');
  assert.equal(pair.pair, PAIR_GAP, 'strands 40 px apart (1-4.md)');
  assert.equal(pair.climbSpeed, CLIMB_SPEED * PAIR_SPEEDS[0], 'the pair starts at 2x');
  assert.equal(single.climbSpeed, undefined, "the single is today's 220");
  assert.equal(single.topY, pair.topY, 'the same height');
  assert.equal(single.bottomY, pair.bottomY);
  const rise = single.bottomY - single.topY;
  assert.ok(rise >= 3 * 220 && rise <= 3 * 270, `about three storeys (${rise} px)`);
  assert.ok(Math.abs(pair.x - single.x) - PAIR_GAP / 2 >= 120, 'a single 120 px+ from a pair (1-4.md)');
  const floor = st.platforms.find((p) => p.y === single.bottomY)!;
  for (const v of climbs) assert.ok(floor && v.x - 80 > floor.x && v.x + 80 < floor.x + floor.width, 'sound floor under each climb');
  // the top: one walk across from the single to the pair (its pieces end to end, no gap), the flag on it
  const tops = st.platforms.filter((p) => Math.abs(p.y - (single.topY + 2)) < 1).sort((a, b) => a.x - b.x);
  for (let i = 1; i < tops.length; i++) assert.equal(tops[i].x, tops[i - 1].x + tops[i - 1].width, 'the top has no gap');
  const [t0, t1] = [tops[0].x, tops[tops.length - 1].x + tops[tops.length - 1].width];
  for (const v of climbs) assert.ok(v.x - 30 > t0 && v.x + 30 < t1, 'one top both climbs reach, footing either side of each');
  assert.equal(st.checkpoints?.length, 1);
  const flag = st.checkpoints![0];
  assert.ok(flag.x > t0 && flag.x < t1 && Math.abs(flag.y - tops[0].y) < 1, 'the flag on the top');
  assert.equal(st.enemies.length, 0);
  assert.ok(!st.zones?.length && !st.heartFalls?.length && st.waterY === undefined && !st.rivers?.length, 'nothing that hurts');
  assert.ok(st.platforms.every((p) => p.type === 'solid' && p.crumbleAfter === undefined), 'only sound footing');
  assert.equal(st.exitTotemX, 0, 'no door');
  const sign = st.feelRoom!.sign;
  assert.ok(Math.abs(sign.x - pair.x) > climbReach(pair, false), "the sign stands out of the pair's grab reach");
});

const press = (r: TouchRig) => r.push(stroke(1, [[0, 160, 700], [120, 160, 600]], false));
const lift = (r: TouchRig) => r.push([{ t: 0, k: 'u', id: 1, x: 160, y: 600 }]);
/** a quick tap on the right half (a punch, by the gestures) */
const tap = (r: TouchRig) => r.push(stroke(2, [[0, r.width * 0.78, 300], [60, r.width * 0.78, 300]], true));

/** stand at a climb's foot, hold up until he stands on the bough; the stopwatch's line for it */
function climb(r: TouchRig, x: number, label: string): number {
  r.r.stand(x, FEEL.floor);
  r.clear();
  r.run(200);
  press(r);
  r.run(4500);
  lift(r);
  r.run(400);
  assert.ok(r.p.grounded && r.p.y < FEEL.floor - FEEL.rise + 10, `${label}: he stands on the bough (y ${r.p.y.toFixed(0)})`);
  const line = feelClock().lines.find((l) => l.label === label);
  assert.ok(line && line.secs !== null && !line.running, `${label}: the stopwatch holds a time`);
  return line!.secs!;
}

test('the stopwatch times each climb: the single at 220 px/s, the pair at 2x, a tap by the sign makes it 1.6x', () => {
  for (const w of WIDTHS) {
    const r = room(w);
    const t1 = climb(r, FEEL.single, 'One vine');
    const want1 = FEEL.rise / CLIMB_SPEED;
    assert.ok(t1 > want1 - 0.1 && t1 < want1 + 0.6, `@${w}: one vine in ${t1.toFixed(2)} s (climb alone ${want1.toFixed(2)} s)`);
    const t2 = climb(r, FEEL.pair, 'Two vines 2×');
    assert.ok(t2 > FEEL.rise / (CLIMB_SPEED * 2) - 0.1 && t2 < t1 * 0.6, `@${w}: two vines at 2x in ${t2.toFixed(2)} s`);
    // to the sign, and a tap by it
    r.r.stand(FEEL.sign - 20, FEEL.floor);
    r.clear();
    r.run(200);
    const punches = r.p.punching;
    tap(r);
    r.run(500);
    assert.equal(feelClock().speed, 1.6, `@${w}: the tap by the sign switched the pair to 1.6x`);
    assert.ok(!punches && !r.p.punching, `@${w}: and threw no punch`);
    assert.equal(r.r.stage.vines.find((v) => v.pair)!.climbSpeed, CLIMB_SPEED * 1.6);
    const t3 = climb(r, FEEL.pair, 'Two vines 1.6×');
    assert.ok(t3 > t2 + 0.15 && t3 < t1 * 0.75, `@${w}: two vines at 1.6x in ${t3.toFixed(2)} s (2x ${t2.toFixed(2)}, one ${t1.toFixed(2)})`);
    // the 2x time is still on the clock, its own line
    assert.equal(feelClock().lines.find((l) => l.label === 'Two vines 2×')?.secs, t2);
  }
});

test('stepping off the bough to the floor costs nothing (the engine’s own loseLife)', () => {
  const r = room(1034);
  delete (r.r.e as Record<string, unknown>).loseLife;
  r.r.safe = false;
  const lives = r.r.e.lives;
  assert.equal(typeof lives, 'number');
  climb(r, FEEL.single, 'One vine');
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
