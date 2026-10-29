/**
 * World 8's swing stages on gen2 (gen2/worlds/w8Swing.ts and w8Rooms.ts), built through buildGen2Stage on 20 rolls, Normal and Easy, on a
 * stand-in World 8 kit (w8Harness.ts: the world's own manifest is the main World 8 builder's) with these sections and the stage's room
 * joined (withW8Swing) and the room required: every roll passes levelCheck (and so puzzleCheck on its room and the fireflies over every
 * gap in the dark), is long enough, never crumbles, holds its own room once; every liana hangs in the dark with a swarm on it that lights
 * its whole swing; no flag and no animal stands in the dark, and the flags are never more than FLAG_SPAN.max apart.
 */
import '../headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { MODEL_FAST, modelStage } from '../stageTime.ts';
import type { LevelConfig } from '../types.ts';
import { buildGen2Stage, checkStage, FLAG_SPAN, layLocal, maxGap, planBudget, rngFor } from './pipeline.ts';
import type { Gen2Stage } from './types.ts';
import { cfg, M8, w8StandInKit } from './w8Harness.ts';
import { W8R_STAGE } from './worlds/w8Rooms.ts';
import { RAISE, W8_DARK, W8_SWING_SECTIONS, W8S_NEW_LINES, W8S_STAGES, w8SwingFor } from './worlds/w8Swing.ts';

const SEEDS = Array.from({ length: 20 }, (_, i) => i + 1);
const STAGES: Array<[string, LevelConfig['objectiveType']]> = [['8-3', 'vine_runner'], ['8-5', 'vine_runner']];
const cache = new Map<string, Gen2Stage>();
export const buildW8 = (id: string, a: LevelConfig['objectiveType'], seed: number, difficulty: 'easy' | 'normal') => {
  const k = `${id}:${seed}:${difficulty}`;
  if (!cache.has(k)) cache.set(k, buildGen2Stage({ config: cfg(id, a), kit: w8StandInKit(Number(id.split('-')[1]), difficulty), seed, difficulty }));
  return cache.get(k)!;
};
const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

test('the sections: each is laid in its own space (600-1700 px, 370 more a liana), level at its ends, its hops a third of a jump in the dark', () => {
  // (every roll lays, on both settings: a liana's perch must keep Easy's 300 ms release window too, or the core throws)
  for (const d of ['normal', 'easy'] as const) {
    const budget = planBudget(cfg('8-3', 'vine_runner'), M8, d);
    for (const s of W8_SWING_SECTIONS) {
      const keys = new Set(s.pieces.map((p) => p.key));
      for (const k of s.sockets) assert.ok(keys.has(k.on), `${s.id}.${k.id} sits on a piece it has`);
      for (let r = 1; r <= 30; r++) {
        const L = layLocal(s, budget, rngFor(r));
        const lianas = L.pieces.filter((p) => p.shape === 'liana').length;
        assert.ok(L.width >= 600 && L.width <= 1700 + 370 * lianas, `${s.id} ${d}: ${L.width} px`);
        assert.ok(Math.abs(L.exit.y - s.exitDy) <= 25, `${s.id}: exitDy ${s.exitDy}, laid ${L.exit.y}`);
        // (a hop is a third of a jump or so, never under the core's 60 px; a gap a liana hangs over is the swing's, wider than any jump)
        const swung = (g: { x0: number; x1: number }) => L.pieces.some((p) => p.shape === 'liana' && p.x >= g.x0 - 1 && p.x <= g.x1 + 1);
        for (const g of L.gaps) if (!swung(g)) assert.ok(g.x1 - g.x0 <= Math.max(60, maxGap(0, false, budget.margin) * 0.42) + 1, `${s.id}: a ${g.x1 - g.x0} px hop in the dark`);
        // (a liana section, or one with a tip, is never mirrored)
        if (s.pieces.some((p) => p.shape === 'liana') || s.sockets.some((k) => k.role === 'tip')) assert.equal(s.mirrorable, false, s.id);
      }
      // (a dark stretch starts after a lit bough and ends before one: its two ends on neither the first nor the last piece)
      const ends = s.sockets.filter((k) => k.id === 'darkFrom' || k.id === 'darkTo').map((k) => k.on);
      const endT = (id: string) => s.sockets.find((k) => k.id === id)?.t;
      if (ends.length) assert.ok((ends[0] !== s.entry.piece || Number(endT('darkFrom')) >= 0.5) && !ends.includes(s.exit.piece), `${s.id}: its dark reaches its lit ends`);
      // (no animal in the dark: an enemy socket only on a lit end)
      for (const k of s.sockets.filter((q) => q.role === 'enemy')) if (ends.length) assert.ok((k.on === s.entry.piece && !ends.includes(k.on)) || k.on === s.exit.piece, `${s.id}.${k.id} stands in the dark`);
    }
  }
  assert.equal(RAISE, -80);
  for (const l of W8S_NEW_LINES) assert.ok(words(l) < 10, l);
  // (8-3 and 8-5 keep their own sections apart, sharing only the lit boughs, the bough steps and the first swing)
  const only = (n: number) => new Set(w8SwingFor(n).map((s) => s.id));
  const shared = [...only(3)].filter((id) => only(5).has(id));
  assert.deepEqual(shared.sort(), ['w8s-bough-steps', 'w8s-first-swing', 'w8s-lantern-bough']);
  for (const id of Object.keys(W8S_STAGES)) assert.ok(W8_SWING_SECTIONS.some((s) => s.id === id), id);
});

for (const [id, a] of STAGES) {
  test(`${id} on 20 rolls, Normal and Easy: levelCheck passes, long enough, nothing crumbles, its own room once`, () => {
    for (const difficulty of ['normal', 'easy'] as const) {
      for (const seed of SEEDS) {
        const st = buildW8(id, a, seed, difficulty);
        assert.deepEqual(checkStage(st, st.gen2.budget).errors, [], `${difficulty} ${seed}`);
        const fast = modelStage(st, MODEL_FAST).total;
        assert.ok(fast >= st.gen2.budget.seconds.fastFloor && fast >= 120, `${difficulty} ${seed}: fast ${fast.toFixed(0)} s`);
        assert.ok(!st.platforms.some((p) => p.type === 'fragile'), 'nothing crumbles');
        const rooms = st.gen2.sections.map((s) => s.template).filter((t) => t in W8R_STAGE);
        assert.deepEqual(rooms.map((t) => W8R_STAGE[t]), [id], `${difficulty} ${seed}: rooms ${rooms}`);
      }
    }
  });

  test(`${id} on 20 rolls, Normal and Easy: every liana in the dark with fireflies on its swing; no flag or animal in the dark; flags at most ${FLAG_SPAN.max} px apart`, () => {
    for (const difficulty of ['normal', 'easy'] as const) {
      for (const seed of SEEDS) {
        const st = buildW8(id, a, seed, difficulty);
        const at = `${difficulty} ${seed}`;
        const dark = (st.zones ?? []).filter((z) => z.kind === 'dark');
        const lianas = st.vines.filter((v) => v.vineType === 'swing_liana');
        assert.ok(lianas.length >= 6, `${at}: ${lianas.length} lianas`);
        for (const v of lianas) {
          const z = dark.find((q) => v.x > q.x0 && v.x < q.x1);
          assert.ok(z, `${at}: the liana at ${v.x} is not in the dark`);
          // (a swarm near its pivot whose light reaches the bottom of the swing at both ends: ±0.45 rad of the vine)
          const len = v.bottomY - v.topY;
          const bob = (side: number) => ({ x: v.x + side * Math.sin(0.45) * len, y: v.topY + Math.cos(0.45) * len });
          const lit = (p: { x: number; y: number }) => z!.lights!.some((l) => Math.hypot(l.x - p.x, l.y - p.y) <= l.r * 0.9);
          assert.ok(lit(bob(-1)) && lit(bob(1)) && lit({ x: v.x, y: v.bottomY }), `${at}: the liana at ${v.x} swings out of the light`);
        }
        for (const c of st.checkpoints) assert.ok(!dark.some((z) => c.x >= z.x0 && c.x <= z.x1 && c.y > z.top && c.y < z.bottom), `${at}: a flag in the dark at ${c.x}`);
        for (const e of st.enemies) assert.ok(!dark.some((z) => e.x > z.x0 - 30 && e.x < z.x1 + 30 && e.y > z.top && e.y < z.bottom + 60), `${at}: an animal in the dark at ${e.x}`);
        let prev = st.spawnX;
        for (const c of [...st.checkpoints, { x: st.exitTotemX }]) {
          assert.ok(c.x - prev <= FLAG_SPAN.max, `${at}: ${c.x - prev} px with no flag`);
          prev = c.x;
        }
        // (the dark's swarms are the fireflies: r 150+ over every gap is levelCheck's; the liana's own is W8_DARK.liana)
        assert.ok(dark.every((z) => (z.lights ?? []).every((l) => l.r === W8_DARK.gap || l.r === W8_DARK.liana || l.r === W8_DARK.perch || l.r === W8_DARK.way)) || dark.some((z) => !z.lights?.length));
      }
    }
  });
}
