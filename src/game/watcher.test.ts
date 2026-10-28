import test from 'node:test';
import assert from 'node:assert/strict';
import { hidden, newWatch, sees, shadowX, stepWatch, WATCH, zoneAt, type Bush, type WatchZone } from './watcher.ts';
import { buildProtoStage, G } from './protoStage.ts';
import type { LevelConfig } from './types.ts';

const zones: WatchZone[] = [{ x0: 1000, x1: 5000, calm: [6, 6] }];
const bushes: Bush[] = [{ x: 1500, w: 124, y: 580, kind: 'tall' }, { x: 3000, w: 104, y: 440, kind: 'tall', hanging: true }];
const open = { x: 2000, y: 580, ducking: false, grounded: true, hanging: false };

test('the eagle keeps a steady rhythm: calm, a warning, a sweep, then calm again, the sweep changing side each time', () => {
  const s = newWatch();
  s.dur = 6;
  const z = zoneAt(zones, 2000);
  const phases: string[] = [];
  let warned = 0;
  for (let i = 0; i < 30 * 30; i++) {
    const ev = stepWatch(s, 1 / 30, z, () => 0.5);
    if (ev.warned) warned++;
    if (phases[phases.length - 1] !== s.phase) phases.push(s.phase);
  }
  // 30 s at 6 + 2.0 + 2.6 = 10.6 s a cycle: warnings at 6, 16.6 and 27.2 s, two sweeps finished
  assert.equal(warned, 3);
  assert.equal(s.passes, 2);
  assert.deepEqual(phases.slice(0, 4), ['calm', 'warn', 'pass', 'calm']);
  // two sweeps, one each way: back to the side it started from
  assert.equal(s.dir, 1);
});

test('outside a watched stretch the eagle stays away', () => {
  const s = newWatch();
  for (let i = 0; i < 30 * 30; i++) assert.deepEqual(stepWatch(s, 1 / 30, zoneAt(zones, 200), () => 0.5), {});
  assert.equal(s.phase, 'calm');
});

test('the shadow crosses the whole view during a sweep', () => {
  const s = newWatch();
  s.phase = 'pass';
  s.dir = 1;
  s.t = 0;
  assert.ok(shadowX(s, 1000, 844) < 1000);
  s.t = WATCH.pass;
  assert.ok(shadowX(s, 1000, 844) > 1844);
});

test('crouching inside a bush or hanging inside a hanging bush hides him; standing in a bush or out in the open does not', () => {
  assert.equal(hidden(bushes, { ...open, x: 1560, ducking: true }), true);
  assert.equal(hidden(bushes, { ...open, x: 1560, ducking: false }), false);
  assert.equal(hidden(bushes, { ...open, ducking: true }), false);
  assert.equal(hidden(bushes, { x: 3050, y: 520, ducking: false, grounded: false, hanging: true }), true);
  assert.equal(hidden(bushes, { x: 3200, y: 520, ducking: false, grounded: false, hanging: true }), false);
});

test('the shadow sees him only during the sweep, only near it, and only once a sweep', () => {
  const s = newWatch();
  s.phase = 'pass';
  assert.equal(sees(s, 2000, bushes, open), true);
  assert.equal(sees(s, 2300, bushes, open), false);
  s.seen = true;
  assert.equal(sees(s, 2000, bushes, open), false);
  s.seen = false;
  s.phase = 'warn';
  assert.equal(sees(s, 2000, bushes, open), false);
});

test('1-7: every watched stretch has bushes no farther apart than a run in one calm, and the twist hangs bushes from a rope', () => {
  const cfg = { worldIndex: 1, miniIndex: 7, id: '1-7', name: 'A Very Good Bush', objectiveType: 'stealth', targetCount: 1, timeLimit: 0, levelWidth: 16700, levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0 } as LevelConfig;
  for (let seed = 1; seed < 900; seed += 41) {
    const st = buildProtoStage(cfg, seed, '1-7');
    assert.deepEqual(st.proto.beats.map((b) => b[2].split(':')[0]), ['Start', 'Learn', 'Test', 'Twist', 'Finish']);
    const bs = st.proto.bushes!;
    const zs = st.proto.watch!;
    for (const z of zs) {
      // from the zone's start, every next place to hide is within what a run covers in the shortest calm here (285 px/s)
      const spots = bs.filter((b) => b.x + b.w / 2 >= z.x0 && b.x + b.w / 2 <= z.x1 && !b.secret).map((b) => b.x + b.w / 2).sort((a, b) => a - b);
      // (the acorn meadow, 2026-10-28: past a bush with an acorn tree beside it, the next bush may be further off than one calm's run,
      // up to what he runs while a thrown acorn holds the eagle over its noise, one calm, the warning and the pass, and the next calm)
      const oaks = (st.kit?.rooms ?? []).flatMap((r) => r.pieces.filter((pc) => pc.kind === 'source' && pc.variant === 'acorn').map((pc) => {
        const on = st.platforms.find((p) => p.id === (pc as { at: { on: number } }).at.on)!;
        return on.x + on.width * (pc as { at: { at: number } }).at.at;
      }));
      let at = z.x0;
      for (const sx of spots) {
        const runS = (sx - at) / 285 + (bs.find((b) => b.x + b.w / 2 === sx)?.hanging ? (sx - at) / 120 : 0);
        const lure = oaks.some((ox) => ox > at && ox < at + 320);
        const most = lure ? 2 * z.calm[0] + WATCH.warn + WATCH.pass : z.calm[0] + 1.4;
        assert.ok(sx - at < 285 * most || runS < most, `seed ${seed}: ${Math.round(sx - at)} px to the next bush${lure ? ' (with acorns)' : ''}`);
        at = sx;
      }
    }
    const hanging = bs.filter((b) => b.hanging);
    assert.ok(hanging.length >= 3);
    for (const b of hanging) assert.ok(st.ropes!.some((r) => b.x > r.x0 && b.x + b.w < r.x1 && Math.abs(r.y - (b.y - 6)) < 1), `seed ${seed}: a hanging bush on a rope`);
    // the first watched stretch is the gentle one
    assert.ok(zs[0].calm[0] >= 7);
    assert.ok(bs.every((b) => b.hanging || b.y === G));
  }
});
