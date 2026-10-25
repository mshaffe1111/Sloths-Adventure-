import test from 'node:test';
import assert from 'node:assert/strict';
import { Gait, ik2, bodyFor, resetBodies, bodyCount, FollowChain, type Body, type LegSpec } from './creatureRig.ts';
import type { Enemy } from './types.ts';
import { spiderLegs } from './creatures.ts';

const trot: LegSpec[] = [
  { hx: 13, hy: 1, l1: 12.5, l2: 13, bend: 1, group: 0, restX: 4 },
  { hx: 10, hy: 1, l1: 12.5, l2: 13, bend: 1, group: 1, restX: 4 },
  { hx: -14, hy: 2, l1: 12.5, l2: 12.5, bend: -1, group: 1, restX: -3 },
  { hx: -11, hy: 2, l1: 12.5, l2: 12.5, bend: -1, group: 0, restX: -3 },
];

function body(over: Partial<Body> = {}): Body {
  return { key: 't', wx: 0, wy: 0, vx: 0, vy: 0, fv: 0, dt: 1 / 30, t: 0, age: 0, facing: 1, fs: 1, fsSpring: undefined as never, turned: false, fresh: true, rig: null, seen: 0, ...over };
}

test('ik2 reaches a target in range and clamps one out of range', () => {
  const a = ik2(0, 0, 10, 15, 12, 12, 1);
  assert.ok(Math.abs(Math.hypot(a.fx - 0, a.fy - 0) - Math.hypot(10, 15)) < 0.01);
  assert.ok(Math.abs(Math.hypot(a.kx, a.ky) - 12) < 0.01);
  assert.ok(Math.abs(Math.hypot(a.fx - a.kx, a.fy - a.ky) - 12) < 0.01);
  const far = ik2(0, 0, 100, 0, 12, 12, 1);
  assert.ok(Math.hypot(far.fx, far.fy) <= 24);
});

for (const [name, speed] of [['stroll', 55], ['gallop', 160], ['stand', 0]] as const) {
  test(`gait ${name}: planted feet never slide, one group swings at a time, reach is respected`, () => {
    const g = new Gait(trot);
    const b = body();
    let x = 100;
    let stepsStarted = 0;
    let slid = 0;
    let both = 0;
    let overReach = 0;
    let prevPlanted = trot.map(() => true);
    const prevFoot = trot.map(() => ({ x: 0, y: 0 }));
    for (let i = 0; i < 30 * 8; i++) {
      x += (speed * 1) / 30;
      b.wx = x;
      b.vx = speed;
      b.fv = speed;
      b.fresh = i === 0;
      g.update(b, { stepDist: 8 + speed * 0.02, stepHeight: 5, slow: 0.26, fast: 0.12, groundY: 19, maxLead: 18 }, 0);
      const swinging = g.legs.filter((l) => !l.planted).map((l) => l.spec.group);
      if (new Set(swinging).size > 1) both++;
      g.legs.forEach((l, k) => {
        if (prevPlanted[k] && l.planted && i > 0) {
          if (Math.abs(l.fx - prevFoot[k].x) > 0.001 || Math.abs(l.fy - prevFoot[k].y) > 0.001) slid++;
        }
        if (prevPlanted[k] && !l.planted) stepsStarted++;
        const h = g.hipWorld(k, b);
        if (Math.hypot(l.fx - h.x, l.fy - h.y) > (l.spec.l1 + l.spec.l2) * 1.12) overReach++;
        prevFoot[k] = { x: l.fx, y: l.fy };
        prevPlanted[k] = l.planted;
      });
    }
    assert.equal(slid, 0, 'a planted foot moved');
    if (speed <= 60) assert.ok(both <= 3, `both diagonal groups were in the air together for ${both} frames`); // a gallop is allowed a flight phase
    assert.equal(overReach, 0, 'a foot was stretched past its leg length');
    if (speed === 0) assert.equal(stepsStarted, 0, 'a standing creature should not shuffle');
    else assert.ok(stepsStarted > 8 * 2, `too few steps: ${stepsStarted}`);
  });
}

test('bodyFor measures speed from position, ignores teleports, and keeps bosses apart from enemies', () => {
  resetBodies();
  const e = { id: 3, facing: 1, x: 0, y: 0 } as Enemy;
  let t = 0;
  let b = bodyFor('snake', e, t);
  for (let i = 0; i < 30; i++) {
    t += 1 / 30;
    e.x += 2; // 60 px/s
    b = bodyFor('snake', e, t);
  }
  assert.ok(Math.abs(b.vx - 60) < 3, `vx ${b.vx}`);
  e.x += 1000; // checkpoint reload
  t += 1 / 30;
  b = bodyFor('snake', e, t);
  assert.equal(b.fresh, true);
  assert.equal(b.vx, 0);
  const boss = { ...e, rigKey: 'b' } as Enemy;
  assert.notEqual(bodyFor('snake', boss, t + 0.04).key, b.key);
});

test('follow chain keeps its spacing', () => {
  const c = new FollowChain(12, 3, 0, 0);
  const rest = c.pts.map((p) => ({ ...p }));
  for (let i = 0; i < 120; i++) c.update({ x: i * 1.5, y: Math.sin(i / 7) * 6 }, rest.map((p) => ({ x: p.x + i * 1.5, y: p.y })), () => 8, 1 / 30);
  for (let i = 1; i < c.pts.length; i++) {
    const d = Math.hypot(c.pts[i].x - c.pts[i - 1].x, c.pts[i].y - c.pts[i - 1].y);
    assert.ok(Math.abs(d - 3) < 0.05, `segment ${i} is ${d}`);
  }
});

for (const speed of [0, 45, 95]) {
  test(`spider gait at ${speed}px/s: eight legs, no sliding, no over-stretch`, () => {
    const g = new Gait(spiderLegs);
    assert.equal(g.legs.length, 8);
    const b = body();
    let x = 0;
    let slid = 0;
    let over = 0;
    const prev = g.legs.map(() => ({ x: 0, planted: true }));
    for (let i = 0; i < 240; i++) {
      x += speed / 30;
      b.wx = x; b.vx = speed; b.fv = speed; b.fresh = i === 0;
      g.update(b, { stepDist: 7 + speed * 0.04, stepHeight: 6, slow: 0.22, fast: 0.12, groundY: 17, maxLead: 10 }, 0);
      g.legs.forEach((l, k) => {
        if (i > 0 && prev[k].planted && l.planted && Math.abs(l.fx - prev[k].x) > 0.001) slid++;
        const h = g.hipWorld(k, b);
        if (Math.hypot(l.fx - h.x, l.fy - h.y) > (l.spec.l1 + l.spec.l2) * 1.05) over++;
        prev[k] = { x: l.fx, planted: l.planted };
      });
    }
    assert.equal(slid, 0);
    assert.equal(over, 0);
  });
}

test('bodies from an old stage are pruned after the next stage restarts the clock', () => {
  resetBodies();
  // a long first stage: its creatures are drawn until t = 300 s
  for (let id = 1; id <= 20; id++) bodyFor('snake', { id, facing: 1, x: id * 50, y: 0 } as Enemy, 300);
  assert.equal(bodyCount(), 20);
  // the next stage starts at t = 0 and only ever draws one creature
  const e = { id: 500, facing: 1, x: 0, y: 0 } as Enemy;
  for (let t = 0; t < 10; t += 1 / 30) bodyFor('snake', e, t);
  assert.equal(bodyCount(), 1, 'the old stage\'s bodies were kept');
});
