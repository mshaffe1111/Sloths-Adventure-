/**
 * 1-2 The Petal Trail, built on the music's beat (w1Rhythm.ts; w1-rhythm 2026-11-04, W1-REBUILD-PLAN.md): an over-under loop-back on
 * the swung beat. Replaces the old 1-2's tests (its mushroom stairs and catch mushrooms went with it).
 */
import './headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateStage } from './stageGenerator.ts';
import { setLayoutVariant } from './stageGenerator.ts';
import { generateAllLevels } from './worldsData.ts';
import { badPickups } from './flowerReach.ts';
import { stageBpm } from './beatTrace.ts';
import { T12, rhythmLayout } from './w1Rhythm.ts';
import { validateStage } from './levelCheck.ts';
import type { GeneratedStage } from './stageGenerator.ts';

const cfg = generateAllLevels().find((l) => l.id === '1-2')!;
const LAYOUTS = Array.from({ length: 16 }, (_, i) => i + 1);
const built = (v: number, d: 'normal' | 'easy') => {
  setLayoutVariant(v);
  try {
    return generateStage(cfg, d) as GeneratedStage & { proto: { beats: Array<[number, number, string]>; rhythm: { bpm: number; nodes: Array<{ tag: string; tier: string; dir: number; x0: number; x1: number }>; reroll: number } } };
  } finally {
    setLayoutVariant(null);
  }
};

test("1-2: every roll is the research's tension curve (intro, ramp, spike, rest, counter-melody, climax, cool-down), on the music's beat, two minutes or more on it, Normal and Easy", () => {
  for (const v of LAYOUTS) {
    for (const d of ['normal', 'easy'] as const) {
      const st = built(v, d);
      const r = st.proto.rhythm;
      assert.equal(r.bpm, stageBpm(cfg), `${v} ${d}: the music's BPM`);
      const tags = new Set(r.nodes.map((n) => n.tag));
      for (const t of ['intro', 'ramp', 'spike', 'rest', 'counter', 'climax', 'cool']) assert.ok(tags.has(t), `${v} ${d}: a ${t} node`);
      // the order of the curve: intro first, the climax after the counter-melody, the cool-down last
      const at = (t: string) => r.nodes.findIndex((n) => n.tag === t);
      assert.ok(at('intro') === 0 && at('spike') < at('rest') && at('rest') < at('counter') && at('counter') < at('climax') && at('cool') === r.nodes.length - 1, `${v} ${d}: ${r.nodes.map((n) => n.tag)}`);
      assert.ok(st.meta!.timing!.layoutSeconds >= 118, `${v} ${d}: ${st.meta!.timing!.layoutSeconds.toFixed(0)} s on the beat`);
      assert.ok(!st.proto.beats.some((b) => /^Finish/.test(b[2])), 'no padded finish');
      assert.equal(st.collectibles.filter((c) => c.type === 'exit_totem').length, 1);
      assert.equal(st.collectibles.find((c) => c.type === 'find')?.findId, 'w1_note');
    }
  }
});

test('1-2: the loop goes back the other way: the bough leg runs right to left, under the canopy, over the floor', () => {
  for (const v of LAYOUTS) {
    const r = built(v, 'normal').proto.rhythm;
    const b = r.nodes.find((n) => n.tier === 'B')!;
    assert.equal(b.dir, -1, `${v}`);
    const a = r.nodes.filter((n) => n.tier === 'A');
    const c = r.nodes.filter((n) => n.tier === 'C');
    assert.ok(a.some((n) => n.x0 <= b.x0 && n.x1 >= b.x0) || a[a.length - 1].x1 >= b.x0, `${v}: the canopy over the bough`);
    assert.ok(c[0].x0 < b.x1 && c[c.length - 1].x1 > b.x1, `${v}: the floor under the bough and on past it`);
  }
});

test('1-2: a miss never lands on a later part of the way (the canopy has nothing below it but its own catches, the bough no gap)', () => {
  for (const v of LAYOUTS) {
    for (const easy of [false, true]) {
      const L = rhythmLayout('1-2', v, easy, stageBpm(cfg));
      const rest = L.nodes.find((n) => n.tag === 'rest')!;
      // left of the rest, under the canopy, there is nothing but its catch branches
      for (const q of L.ledges) if (L.nodes[q.node]?.tier !== 'A' && q.x0 < rest.x0) assert.fail(`${v}: a ${q.surface} of tier ${L.nodes[q.node]?.tier} at ${q.x0},${q.y} under the canopy's gaps`);
      // the canopy over the loop has its base bough the whole way, and the bough leg is one bough
      const bough = L.ledges.filter((q) => q.surface === 'bough');
      assert.equal(bough.length, 2, `${v}: two boughs`);
      const bLeg = L.nodes.find((n) => n.tier === 'B')!;
      assert.ok(bough.some((q) => q.y === T12.B && q.x0 <= bLeg.x0 + 1 && q.x1 >= bLeg.x1 - 1), `${v}: the bough under the whole leftward leg`);
    }
  }
});

test('1-2: every petal can be reached, the level check finds the shrine, and the snakes sit only under the high branches', () => {
  for (const v of LAYOUTS) {
    const st = built(v, 'normal');
    assert.deepEqual(badPickups({ platforms: st.platforms, vines: st.vines, waterY: st.waterY }, st.collectibles).map((c) => `${Math.round(c.x)},${Math.round(c.y)}`), [], `${v}`);
    assert.ok(validateStage(st, { rooms: false }).ok, `${v}: the level check reaches the shrine`);
    for (const e of st.enemies) assert.ok(Math.abs(e.y + 14 - T12.B) < 2, `${v}: a snake on the bough`);
  }
});
