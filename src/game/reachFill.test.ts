/**
 * R-165.207 (buildcheck's slow first builds): the reach memo (physics.ts) fills a whole table in one pass per flight instead of one full
 * simulation per height asked.
 *   - Every entry equals the old height-at-a-time simulation, written out here frozen as it was (simulateReach before R-165.207), for
 *     every table the game asks (jump, bounce, held jump, tree hop and leap, the 190/160 vault, the leaf: both ticks): densely over the
 *     heights stages use, sparsely over the table's whole range, and past it (the per-height path).
 *   - maxDropReach reads the tables: every key equals the old one, which simulated each drop again (frozen here as it was).
 *   - Filling 1-1's eight tables costs a bounded number of air frames: the height-at-a-time memo flew millions for the same asks.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { airStep, EASY_HOLD, flightReach, maxDropReach, PHYS, reachFramesFlown, SIM_DTS, type AirBody, type FlightOpts } from './physics.ts';
import { GLIDE } from './glide.ts';

/** simulateReach as it was before R-165.207 (physics.ts), frozen: the oracle */
function oldSimulateReach(dy: number, v0: number, vx: number, dbl: boolean, dt: number, glide = false): number {
  const o: FlightOpts = { v0, vx, dbl, dt, glide };
  const target = -dy;
  const tries = o.dbl ? Array.from({ length: 36 }, (_, i) => i * o.dt * (1 / 30 / o.dt)) : [-1];
  let best = -1;
  for (const tD of tries) {
    const b: AirBody = { x: 0, y: 0, vx: o.vx, vy: -o.v0 };
    let t = 0;
    let doubled = !o.dbl;
    let fallT = 0;
    let left: number = GLIDE.maxTime;
    for (let i = 0; i < 600; i++) {
      if (!doubled && t >= tD - 1e-9) {
        b.vy = -PHYS.doubleV;
        doubled = true;
      }
      const prev = b.y;
      if (glide) {
        const x0 = b.x, y0 = b.y;
        airStep(b, o.dt, 1, false);
        b.x = x0;
        b.y = y0;
        if (b.vy <= -GLIDE.refillUp) left = GLIDE.maxTime;
        fallT = b.vy > GLIDE.minFall ? fallT + o.dt : 0;
        if (fallT >= GLIDE.onset && left > 0) {
          left = Math.max(0, left - o.dt);
          if (b.vy > GLIDE.fallSpeed) b.vy = Math.max(GLIDE.fallSpeed, b.vy - GLIDE.brake * o.dt);
        }
        b.x += b.vx * o.dt;
        b.y += b.vy * o.dt;
      } else airStep(b, o.dt, 1, false);
      t += o.dt;
      if (b.vy >= 0 && prev <= target + 14 && b.y >= target) {
        if (b.x > best) best = b.x;
        break;
      }
      if (b.y > target + 400) break;
    }
  }
  return best;
}

type Kind = Omit<FlightOpts, 'dt'> & { name: string };
/** the tables 1-1's build asks (reachJump, reachBounce: physics.ts) */
const ONE_ONE: Kind[] = [
  { name: 'jump', v0: PHYS.jumpV, vx: PHYS.maxRun, dbl: false },
  { name: 'jump+double', v0: PHYS.jumpV, vx: PHYS.maxRun, dbl: true },
  { name: 'bounce', v0: PHYS.bounceV, vx: PHYS.maxRun, dbl: false },
  { name: 'bounce+double', v0: PHYS.bounceV, vx: PHYS.maxRun, dbl: true },
];
/** every other table a caller asks (reachJumpHeld, levelCheck's vault, tree hop and leap, the leaf) */
const OTHERS: Kind[] = [
  { name: 'held jump', v0: Math.round(PHYS.jumpV * Math.sqrt(EASY_HOLD)), vx: PHYS.maxRun, dbl: true },
  { name: 'vault', v0: 190, vx: 160, dbl: false },
  { name: 'tree hop', v0: PHYS.treeHopV, vx: 240, dbl: true },
  { name: 'tree leap', v0: PHYS.treeLeapV, vx: 330, dbl: true },
  { name: 'leaf jump', v0: PHYS.jumpV, vx: PHYS.maxRun, dbl: true, glide: true },
  { name: 'leaf bounce', v0: PHYS.bounceV, vx: PHYS.maxRun, dbl: false, glide: true },
  { name: 'leaf drop', v0: 0, vx: PHYS.maxRun, dbl: false, glide: true },
];

function check(k: Kind, dt: number, heights: Iterable<number>): number {
  let n = 0;
  for (const dy of heights) {
    const got = flightReach(dy, { ...k, dt });
    // (the memo answers each height at its 2 px step: physics.ts reachAt)
    const want = oldSimulateReach(Math.round(dy / 2) * 2, k.v0, k.vx, k.dbl, dt, !!k.glide);
    if (!Object.is(got, want)) assert.fail(`${k.name} at 1/${Math.round(1 / dt)} s, dy ${dy}: ${got}, the old simulation ${want}`);
    n++;
  }
  return n;
}
const span = (a: number, b: number, step: number) => ({ *[Symbol.iterator]() { for (let v = a; v <= b; v += step) yield v; } });

test('R-165.207: filling 1-1\'s eight reach tables flies a bounded number of air frames (the height-at-a-time memo flew millions)', () => {
  const before = reachFramesFlown();
  for (const k of ONE_ONE) for (const dt of SIM_DTS) for (let dy = -2000; dy <= 1200; dy += 2) flightReach(dy, { ...k, dt });
  const flown = reachFramesFlown() - before;
  assert.ok(flown <= 120_000, `filling 1-1's tables flew ${flown} air frames (ceiling 120,000)`);
});

test('R-165.207: every reach table entry equals the old height-at-a-time simulation (1-1\'s tables densely, every 2 px stages use)', () => {
  let n = 0;
  for (const k of ONE_ONE) for (const dt of SIM_DTS) n += check(k, dt, span(-2400, 1200, 2));
  assert.ok(n > 14_000);
});

test('R-165.207: every other table the game asks equals the old simulation (every 6 px over the heights stages use)', () => {
  for (const k of OTHERS) for (const dt of SIM_DTS) check(k, dt, span(-2400, 1200, 6));
});

test('R-165.207: the whole table range and past it (the per-height path) equal the old simulation, sampled', () => {
  for (const k of [...ONE_ONE, ...OTHERS]) for (const dt of SIM_DTS) {
    check(k, dt, span(-8192, 8192, 194));
    check(k, dt, [-8192, -8191, -8190, 8190, 8191, 8192, -8193, -8194, -9000, 8193, 8194, 9000, -0.9, 0.9, 1, -1, 3, -3]);
  }
});

test('R-165.207: maxDropReach, read from the tables, equals the old one that simulated every drop (every key to past the table range)', () => {
  // (the old maxDropReach, frozen: the most of 0 and every drop's reach to (key + 1) x 80 px, jump and bounce, single and double, both
  // ticks, plus 32; its running most is kept per drop here so each key is not flown again)
  let most = 0;
  const old: number[] = [];
  for (let d = 0; d <= 122; d++) {
    for (const dt of SIM_DTS) for (const dbl of [false, true]) most = Math.max(most, oldSimulateReach(-d * 80, PHYS.jumpV, PHYS.maxRun, dbl, dt), oldSimulateReach(-d * 80, PHYS.bounceV, PHYS.maxRun, dbl, dt));
    old.push(most);
  }
  for (let key = 0; key <= 121; key++) {
    for (const maxDrop of key ? [key * 80, key * 80 - 79, key * 80 - 33.5] : [0, -50]) {
      assert.equal(maxDropReach(maxDrop), old[key + 1] + 32, `maxDropReach(${maxDrop})`);
    }
  }
});
