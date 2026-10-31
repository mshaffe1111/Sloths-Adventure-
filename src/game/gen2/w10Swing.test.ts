/**
 * World 10's swings (gen2/worlds/w10Swing.ts) and rooms (w10Rooms.ts), built through buildGen2Stage on 20 rolls, Normal and Easy, on the
 * stand-in World 10 kit (w10SwingHarness.ts, until the main builder's w10.ts is merged in): each section is laid in its own space at its
 * size, never mirrored, with no climbing vine; every roll passes levelCheck (and so puzzleCheck on its room), is long enough, never
 * crumbles, holds one of its own rooms once and no other; every liana takes one of its section's looks; the quick route swings on every liana
 * (no walking under one through its pit: every swing is needed).
 */
import '../headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { MODEL_FAST, modelStage } from '../stageTime.ts';
import { buildGen2Stage, checkStage, layLocal, planBudget, rngFor } from './pipeline.ts';
import type { Gen2Stage } from './types.ts';
import { cfg10, w10StandIn } from './w10SwingHarness.ts';
import { W10R_STAGE } from './worlds/w10Rooms.ts';
import { W10_LIANA_LOOK, W10_SWING_SECTIONS, W10S_STAGES, w10SwingFor, w10SwingLooks, withW10Swing } from './worlds/w10Swing.ts';
import { pickRoute } from '../../../tools/inspect/eraRoll.ts';

const SEEDS = Array.from({ length: 20 }, (_, i) => i + 1);
const STAGES = ['10-1', '10-3', '10-6', '10-7', '10-9'];
const cache = new Map<string, Gen2Stage>();
const build = (id: string, seed: number, difficulty: 'easy' | 'normal') => {
  const k = `${id}:${seed}:${difficulty}`;
  if (!cache.has(k)) cache.set(k, w10SwingLooks(buildGen2Stage({ config: cfg10(id), kit: w10StandIn(Number(id.split('-')[1]), difficulty), seed, difficulty })));
  return cache.get(k)!;
};

test('the sections: each is laid in its own space at its size (600-1700 px, +370 a liana), level at its ends, never mirrored, no climb', () => {
  for (const d of ['normal', 'easy'] as const) {
    const budget = planBudget(cfg10('10-6'), { ...w10StandIn(6, d).manifest, moves: ['double', 'swing', 'climb', 'glide'] }, d);
    for (const s of W10_SWING_SECTIONS) {
      const keys = new Set(s.pieces.map((p) => p.key));
      for (const k of s.sockets) assert.ok(keys.has(k.on), `${s.id}.${k.id} sits on a piece it has`);
      assert.equal(s.mirrorable, false, s.id);
      assert.ok(!s.pieces.some((p) => p.shape === 'vine'), `${s.id}: a climbing vine`);
      assert.ok(!s.teaches && !s.sockets.some((k) => k.role === 'tip'), `${s.id}: no line (the swing is known since World 4)`);
      const lianas = s.pieces.filter((p) => p.shape === 'liana').length;
      assert.ok(lianas >= 1, s.id);
      assert.equal(W10_LIANA_LOOK[s.id]?.length, lianas, `${s.id}: a look for each liana`);
      for (let r = 1; r <= 30; r++) {
        const L = layLocal(s, budget, rngFor(r));
        assert.ok(L.width >= 600 && L.width <= 1700 + 370 * lianas, `${s.id}: ${L.width} px`);
        assert.ok(Math.abs(L.exit.y - s.exitDy) <= 25, `${s.id}: exitDy ${s.exitDy}, laid ${L.exit.y}`);
      }
    }
  }
});

test('which stages take which swings: 10-6, 10-7 and 10-9\'s finale (10-3 none); the long chains only in the Iron Netting', () => {
  const base = w10StandIn(1).manifest;
  for (let s = 1; s <= 9; s++) {
    const got = withW10Swing({ manifest: { ...base, sections: [] } }, s).manifest.sections.map((x) => x.id);
    const want = W10S_STAGES.includes(s) ? W10_SWING_SECTIONS.filter((x) => w10SwingFor(s, x.id)).map((x) => x.id) : [];
    assert.deepEqual(got, want, `10-${s}`);
  }
  assert.ok(w10SwingFor(6, 'w10s-chain-run') && !w10SwingFor(3, 'w10s-chain-pair') && !w10SwingFor(7, 'w10s-storm-ropes'));
  assert.deepEqual(W10_SWING_SECTIONS.filter((x) => w10SwingFor(9, x.id)).map((x) => x.id).sort(), ['w10s-chain-pair', 'w10s-guard-pair', 'w10s-guard-wall']);
});

for (const id of STAGES) {
  test(`${id} on 20 rolls, Normal and Easy: levelCheck passes, long enough, nothing crumbles, its own room once, every liana swung`, () => {
    for (const difficulty of ['normal', 'easy'] as const) {
      for (const seed of SEEDS) {
        const st = build(id, seed, difficulty);
        const at = `${difficulty} ${seed}`;
        assert.deepEqual(checkStage(st, st.gen2.budget).errors, [], at);
        const fast = modelStage(st, MODEL_FAST).total;
        assert.ok(fast >= st.gen2.budget.seconds.fastFloor && fast >= 120, `${at}: fast ${fast.toFixed(0)} s`);
        // (World 10's crumbling ramparts are the ground's, never required; nothing in a swing section or a room crumbles)
        const mine = st.gen2.sections.filter((s) => /^w10[sr]-/.test(s.template));
        assert.ok(!st.platforms.some((p) => p.type === 'fragile' && mine.some((s) => p.x >= s.x0 && p.x < s.x1)), `${at}: a crumbling piece in a swing or a room`);
        const rooms = st.gen2.sections.map((s) => s.template).filter((t) => t in W10R_STAGE);
        const own = Object.entries(W10R_STAGE).filter(([, s]) => s === id).map(([t]) => t);
        // (one room a roll on a stage with a room (none on 10-6 and 10-9): a stage with two, 10-7's gatehouse and Winch House, holds one of them, the roll's pick)
        assert.ok(own.length ? rooms.length === 1 && own.includes(rooms[0]) : rooms.length === 0, `${at}: rooms ${rooms}`);
        // (every liana is swung on the quick route, and takes one of its section's looks)
        const route = pickRoute(cfg10(id).objectiveType, st).used.route;
        assert.notEqual(route.traced, 'failed', at);
        const swings = route.segs.filter((s) => s.kind === 'swing');
        for (const v of st.vines.filter((x) => x.vineType === 'swing_liana')) {
          assert.ok(swings.some((s) => Math.min(s.x0, s.x1) <= v.x + 40 && Math.max(s.x0, s.x1) >= v.x - 40), `${at}: the liana at ${v.x} is never swung`);
          assert.ok(['chain', 'banner', 'rope'].includes(v.hangLook ?? ''), `${at}: the liana at ${v.x} looks ${v.hangLook}`);
        }
        if (!W10S_STAGES.includes(Number(id.split('-')[1]))) assert.ok(!st.vines.some((v) => v.vineType === 'swing_liana'), `${at}: a swing in ${id}`);
      }
    }
  });
}

test('the looks: a retry keeps every look (the same roll), and the rolls between them show every look', () => {
  const seen = new Set<string>();
  for (const seed of SEEDS.slice(0, 8)) {
    const a = build('10-6', seed, 'normal');
    const b = w10SwingLooks(buildGen2Stage({ config: cfg10('10-6'), kit: w10StandIn(6, 'normal'), seed, difficulty: 'normal' }));
    assert.deepEqual(a.vines.map((v) => v.hangLook), b.vines.map((v) => v.hangLook), `${seed}`);
    for (const v of a.vines) if (v.hangLook) seen.add(v.hangLook);
  }
  assert.deepEqual([...seen].sort(), ['banner', 'chain', 'rope']);
});
