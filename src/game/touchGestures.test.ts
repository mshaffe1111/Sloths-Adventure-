import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TouchGestures, type GestureSink } from './touchGestures.ts';

/** a recording sink plus a scripted-finger helper (844 x 390 landscape phone) */
function rig() {
  const log: string[] = [];
  const sink: GestureSink = {
    move: (d) => log.push(`move:${d}`),
    duck: (on) => log.push(`duck:${on}`),
    jumpPress: () => log.push('jump'),
    jumpRelease: () => log.push('jumpUp'),
    punch: () => log.push('punch'),
    kick: () => log.push('kick'),
    mega: () => log.push('mega'),
    feedback: () => {},
  };
  const g = new TouchGestures(sink, () => 844);
  let now = 1000;
  const api = {
    g,
    log,
    now: () => now,
    wait(ms: number) {
      now += ms;
      g.tick(now);
    },
    down(id: number, x: number, y: number) {
      g.down(id, x, y, now);
    },
    /** move a finger in steps over `ms` */
    drag(id: number, x0: number, y0: number, x1: number, y1: number, ms: number, steps = 8) {
      for (let i = 1; i <= steps; i++) {
        now += ms / steps;
        g.move(id, x0 + ((x1 - x0) * i) / steps, y0 + ((y1 - y0) * i) / steps, now);
        g.tick(now);
      }
    },
    up(id: number, x: number, y: number) {
      g.up(id, x, y, now);
    },
    has: (s: string) => log.includes(s),
    count: (s: string) => log.filter((l) => l === s).length,
  };
  return api;
}

test('steering on the left half runs and never attacks', () => {
  const t = rig();
  t.down(1, 200, 250);
  t.drag(1, 200, 250, 320, 252, 600);
  t.wait(800);
  t.drag(1, 320, 252, 120, 250, 700);
  t.up(1, 120, 250);
  assert.ok(t.has('move:right') && t.has('move:left'));
  assert.ok(!t.has('kick') && !t.has('punch') && !t.has('mega') && !t.has('jump'));
  assert.equal(t.log.filter((l) => l.startsWith('move:')).pop(), 'move:none');
});

test('steering with the RIGHT thumb is steering, not kicks (the old bug)', () => {
  const t = rig();
  t.down(1, 600, 250);
  t.drag(1, 600, 250, 760, 255, 700); // a steady slide right
  t.wait(900);
  t.drag(1, 760, 255, 560, 250, 900); // and back left
  t.up(1, 560, 250);
  assert.ok(t.has('move:right'), 'ran right');
  assert.ok(t.has('move:left'), 'ran left');
  assert.ok(!t.has('kick'), 'no kick');
  assert.ok(!t.has('punch'), 'no punch');
});

test('a quick, confident drag to start running on the right half does not kick if it keeps going', () => {
  const t = rig();
  t.down(1, 560, 250);
  t.drag(1, 560, 250, 640, 250, 260); // ~0.3 px/ms: brisk but not a flick
  t.drag(1, 640, 250, 760, 250, 500);
  t.up(1, 760, 250);
  assert.ok(!t.has('kick'));
  assert.ok(t.has('move:right'));
});

test('a real flick sideways on the right half is a kick', () => {
  const t = rig();
  t.down(1, 560, 250);
  t.drag(1, 560, 250, 640, 252, 70, 4);
  t.up(1, 640, 252);
  assert.equal(t.count('kick'), 1);
  assert.ok(!t.has('punch'));
});

test('a thumb flick that is quick out and quick off is a kick even at phone-realistic speed', () => {
  const t = rig();
  t.down(1, 600, 250);
  t.drag(1, 600, 250, 668, 250, 150, 5); // 68 px in 150 ms
  t.up(1, 668, 250);
  assert.equal(t.count('kick'), 1);
  assert.ok(!t.has('move:right'));
});

test('a short slow nudge is neither a kick nor a punch', () => {
  const t = rig();
  t.down(1, 600, 250);
  t.drag(1, 600, 250, 640, 250, 320, 8);
  t.up(1, 640, 250);
  assert.ok(!t.has('kick') && !t.has('punch'));
});

test('a flick up is a jump and releases on lift; a flick down ducks while held', () => {
  const t = rig();
  t.down(1, 600, 300);
  t.drag(1, 600, 300, 604, 240, 80, 4);
  t.up(1, 604, 240);
  assert.ok(t.has('jump') && t.has('jumpUp'));
  const u = rig();
  u.down(1, 600, 200);
  u.drag(1, 600, 200, 598, 270, 90, 4);
  assert.ok(u.has('duck:true'));
  u.up(1, 598, 270);
  assert.ok(u.has('duck:false'));
});

test('a clean tap punches once', () => {
  const t = rig();
  t.down(1, 650, 260);
  t.wait(90);
  t.up(1, 652, 261);
  assert.equal(t.count('punch'), 1);
});

test('a long press is a mega, once, and lifting afterwards does not also punch', () => {
  const t = rig();
  t.down(1, 650, 260);
  t.wait(300);
  t.wait(300);
  t.up(1, 650, 260);
  assert.equal(t.count('mega'), 1);
  assert.ok(!t.has('punch'));
});

test('re-planting the steering thumb right after lifting it does not punch', () => {
  const t = rig();
  t.down(1, 200, 250);
  t.drag(1, 200, 250, 300, 250, 400);
  t.up(1, 300, 250);
  t.wait(60); // lifted, and back down almost at once
  t.down(2, 220, 250);
  t.wait(70);
  t.up(2, 220, 250);
  assert.ok(!t.has('punch'), 'a quick re-plant is not a punch');
  // but a deliberate tap a moment later still punches
  t.wait(400);
  t.down(3, 650, 250);
  t.wait(80);
  t.up(3, 650, 250);
  assert.equal(t.count('punch'), 1);
});

test('two thumbs: steer with one, punch, kick and jump with the other', () => {
  const t = rig();
  t.down(1, 200, 250);
  t.drag(1, 200, 250, 300, 250, 300);
  t.wait(100);
  t.down(2, 650, 250);
  t.wait(80);
  t.up(2, 650, 250); // punch
  t.wait(300);
  t.down(3, 650, 250);
  t.drag(3, 650, 250, 730, 250, 70, 4); // kick
  t.up(3, 730, 250);
  t.wait(300);
  t.down(4, 650, 300);
  t.drag(4, 650, 300, 650, 240, 70, 4); // jump
  t.up(4, 650, 240);
  assert.equal(t.count('punch'), 1);
  assert.equal(t.count('kick'), 1);
  assert.equal(t.count('jump'), 1);
  assert.ok(t.has('move:right'));
  assert.ok(!t.log.includes('move:none'), 'steering never dropped while the other thumb worked');
});

test('a second finger planted on top of the steering thumb is ignored', () => {
  const t = rig();
  t.down(1, 200, 250);
  t.drag(1, 200, 250, 280, 250, 300);
  t.down(2, 230, 270); // knuckle / other finger of the same hand
  t.wait(60);
  t.up(2, 230, 270);
  assert.ok(!t.has('punch'));
});

test('steering hard sideways with a slightly drifting thumb does not duck', () => {
  const t = rig();
  t.down(1, 150, 220);
  t.drag(1, 150, 220, 300, 262, 600); // slides right and a little down
  t.up(1, 300, 262);
  assert.ok(!t.has('duck:true'));
  assert.ok(t.has('move:right'));
});

test('an undecided right-side finger that holds still then drags becomes steering', () => {
  const t = rig();
  t.down(1, 600, 250);
  t.wait(120);
  t.drag(1, 600, 250, 690, 250, 500);
  t.up(1, 690, 250);
  assert.ok(t.has('move:right'));
  assert.ok(!t.has('kick') && !t.has('punch'));
});

test('steering stays steady: no flapping at the dead-zone edge', () => {
  const t = rig();
  t.down(1, 200, 250);
  t.drag(1, 200, 250, 222, 250, 200);
  // jitter around the edge of the dead zone
  for (let i = 0; i < 20; i++) {
    t.wait(16);
    t.g.move(1, 214 + (i % 2) * 6, 250, t.now());
  }
  const flips = t.log.filter((l) => l.startsWith('move:')).length;
  assert.ok(flips <= 3, `direction changed ${flips} times`);
});

test('cancelling releases everything', () => {
  const t = rig();
  t.down(1, 200, 250);
  t.drag(1, 200, 250, 300, 190, 300);
  t.g.cancelAll();
  assert.equal(t.log[t.log.length - 1], 'jumpUp');
  assert.ok(t.has('move:none') && t.has('duck:false'));
});

test('a running thumb that rolls down the glass keeps running instead of ducking to a halt', () => {
  const t = rig();
  t.down(1, 150, 220);
  t.drag(1, 150, 220, 240, 220, 300); // running right
  t.drag(1, 240, 220, 250, 275, 400); // the thumb rolls ~55 px down while still pushed right
  assert.ok(t.has('move:right'));
  assert.ok(!t.has('duck:true'));
  t.up(1, 250, 275);
});

test('a thumb that slides straight down from standstill ducks, and easing back up lets go', () => {
  const t = rig();
  t.down(1, 150, 220);
  t.drag(1, 150, 220, 150, 275, 400);
  assert.ok(t.has('duck:true'));
  t.drag(1, 150, 275, 150, 240, 300); // eased back up
  assert.equal(t.log[t.log.length - 1], 'duck:false');
  t.up(1, 150, 240);
});

test('mashing taps on the left half punches every time (a tap is never a "re-plant" of the tap before it)', () => {
  for (const gap of [60, 120, 180, 250]) {
    const t = rig();
    for (let i = 0; i < 8; i++) {
      t.down(i + 1, 200, 250);
      t.wait(70);
      t.up(i + 1, 200, 250);
      t.wait(gap);
    }
    assert.equal(t.count('punch'), 8, `gap ${gap}ms`);
  }
});

test('a tap right after really steering is still treated as the thumb landing again, not a punch', () => {
  const t = rig();
  t.down(1, 200, 250);
  t.drag(1, 200, 250, 290, 250, 150);
  t.up(1, 290, 250);
  t.wait(60);
  t.down(2, 290, 250);
  t.wait(60);
  t.up(2, 290, 250);
  assert.equal(t.count('punch'), 0);
});
