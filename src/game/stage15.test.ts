/**
 * 1-5 Where She Walked, built on the music's beat (w1Rhythm.ts; w1-rhythm 2026-11-04, W1-REBUILD-PLAN.md): the trail down from the
 * canopy at dusk, on the broken beat, snap twigs over real pits. Replaces the old 1-5's tests (its climbs, ropes and fern went with it).
 */
import './headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { generateStage, setLayoutVariant } from './stageGenerator.ts';
import { generateAllLevels } from './worldsData.ts';
import { badPickups } from './flowerReach.ts';
import { stageBpm } from './beatTrace.ts';
import { BOA_KICK_S, BOA_LINE, BOA_TEACH_W, SNAP_SPARE, rhythmLayout } from './w1Rhythm.ts';
import { templateFlags, unitsOf } from '../../tools/validate/variety.ts';
import { findW1Pits } from './w1Pits.ts';
import { validateStage } from './levelCheck.ts';
import type { GeneratedStage } from './stageGenerator.ts';

const cfg = generateAllLevels().find((l) => l.id === '1-5')!;
const LAYOUTS = Array.from({ length: 16 }, (_, i) => i + 1);
const built = (v: number, d: 'normal' | 'easy') => {
  setLayoutVariant(v);
  try {
    return generateStage(cfg, d) as GeneratedStage & { proto: { rhythm: { bpm: number; nodes: Array<{ tag: string; x0: number; x1: number; y: number }> } } };
  } finally {
    setLayoutVariant(null);
  }
};

test("1-5: every roll is the tension curve on the music's beat, two minutes or more on it, coming down from the canopy to the floor", () => {
  for (const v of LAYOUTS) {
    for (const d of ['normal', 'easy'] as const) {
      const st = built(v, d);
      const r = st.proto.rhythm;
      assert.equal(r.bpm, stageBpm(cfg));
      const tags = new Set(r.nodes.map((n) => n.tag));
      for (const t of ['intro', 'ramp', 'spike', 'rest', 'counter', 'climax', 'cool']) assert.ok(tags.has(t), `${v} ${d}: a ${t} node`);
      assert.ok(st.meta!.timing!.layoutSeconds >= 118, `${v} ${d}: ${st.meta!.timing!.layoutSeconds.toFixed(0)} s on the beat`);
      // down: the shrine is on the floor, 500 px and more under the start
      assert.ok(st.exitTotemY - st.spawnY >= 500, `${v} ${d}: from ${st.spawnY} down to ${st.exitTotemY}`);
      assert.equal(st.collectibles.find((c) => c.type === 'find')?.findId, 'w1_keepsake');
    }
  }
});

test('1-5: snap twigs are required and never break under a player on the beat (each holds his run on it and more)', () => {
  for (const v of LAYOUTS) {
    const st = built(v, 'normal');
    const snaps = st.platforms.filter((p) => p.type === 'fragile');
    assert.ok(snaps.length >= 25, `${v}: ${snaps.length} snap twigs`);
    for (const p of snaps) assert.ok((p.creak ?? 0) >= SNAP_SPARE && p.crumbleAfter === undefined, `${v}: twig at ${p.x} holds ${p.creak}`);
    // the vines are only in the counter-melody
    const counter = st.proto.rhythm.nodes.filter((n) => n.tag === 'counter');
    for (const vn of st.vines) assert.ok(counter.some((n) => vn.x >= n.x0 - 50 && vn.x <= n.x1 + 50), `${v}: a liana at ${vn.x} outside the counter-melody`);
  }
});

test('1-5: every petal can be reached and the level check finds the shrine', () => {
  for (const v of LAYOUTS) {
    const st = built(v, 'normal');
    assert.deepEqual(badPickups({ platforms: st.platforms, vines: st.vines, ropes: st.ropes, waterY: st.waterY }, st.collectibles).map((c) => `${Math.round(c.x)},${Math.round(c.y)}`), [], `${v}`);
    assert.ok(validateStage(st, { rooms: false }).ok, `${v}: the level check reaches the shrine`);
  }
  // (and the layouts roll differently: the nodes' spans differ between rolls)
  const a = rhythmLayout('1-5', 1, false, stageBpm(cfg)), b = rhythmLayout('1-5', 2, false, stageBpm(cfg));
  assert.notDeepEqual(a.ledges.map((q) => q.x0), b.ledges.map((q) => q.x0));
});

test('1-5: no node template twice in a row, none over twice, none again with the same numbers (STAGE-RULES §0c.2-3), 16 rolls, Normal and Easy', () => {
  for (const v of LAYOUTS) {
    for (const d of ['normal', 'easy'] as const) {
      const flags = templateFlags(unitsOf(built(v, d) as never));
      assert.deepEqual(flags, [], `layout ${v} ${d}: ${flags.map((f) => f.what).join('; ')}`);
    }
  }
});

test('1-5: every floor gap paints as a drop, never water (w1Pits.ts), and none is a slit under 40 px, 16 rolls, Normal and Easy', () => {
  for (const v of LAYOUTS) {
    for (const d of ['normal', 'easy'] as const) {
      const gaps = findW1Pits(built(v, d).platforms);
      for (const g of gaps) {
        assert.ok(g.kind !== 'fall' || g.drop, `layout ${v} ${d}: the gap at x ${Math.round(g.x0)} paints as water`);
        assert.ok(g.x1 - g.x0 >= 40, `layout ${v} ${d}: a ${Math.round(g.x1 - g.x0)} px slit at x ${Math.round(g.x0)}`);
      }
    }
  }
});

test("1-5: the kick: a coiled boa taught on a wide stone ledge after Dot's line, then 1-2 boas on snap twigs that hold the kick's time too, 16 rolls, Normal and Easy", () => {
  let twigRolls = 0;
  for (const v of LAYOUTS) {
    for (const easy of [false, true]) {
      const L = rhythmLayout('1-5', v, easy, stageBpm(cfg));
      const teach = L.boas[0];
      const pad = L.ledges.find((q) => q.surface !== 'crumble' && teach.x > q.x0 + 200 && teach.x < q.x1 - 100 && q.y === teach.y);
      assert.ok(pad && pad.x1 - pad.x0 >= BOA_TEACH_W - 1, `${v} ${easy}: the teaching boa on a wide solid ledge`);
      const line = L.lines.find((l) => l.text === BOA_LINE);
      assert.ok(line && line.x < teach.x - 200, `${v} ${easy}: Dot's line before the first boa`);
      // (on a snap twig that holds the kick's time too; a roll whose twigs are all too short has its one on a solid branch)
      const under = L.boas.slice(1).map((b) => L.ledges.find((q) => b.x > q.x0 && b.x < q.x1 && q.y === b.y));
      assert.ok(under.length >= 1 && under.every((q) => q && (q.surface !== 'crumble' || (q.hold ?? 0) >= (easy ? BOA_KICK_S.easy : BOA_KICK_S.normal))), `${v} ${easy}: a boa in the climax, on a twig that holds the kick or a branch`);
      twigRolls += under.some((q) => q?.surface === 'crumble') ? 1 : 0;
    }
  }
  // (the pair, a boa on a snap twig, on most rolls)
  assert.ok(twigRolls >= 24, `a boa on a snap twig on ${twigRolls} of 32 rolls`);
});
