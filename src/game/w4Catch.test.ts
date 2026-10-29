import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, type StagePlan } from './protoStage.ts';
import { validateStage, type CheckGraph } from './levelCheck.ts';
import { generateAllLevels } from './worldsData.ts';
import type { Platform } from './types.ts';
import type { GeneratedStage } from './stageGenerator.ts';

// The catch branches under the climbs' hop gaps (round 6, 2026-10-29; Matt: catch ledges under high planks in tall climbs). A miss at a
// hop gap of 4-1's or 4-6's climb fell to the floor, up to the whole climb lost; 4-3 and 4-9 are checked the same way.

const LEVELS = generateAllLevels();
const build = (id: string, s: number) => buildProtoStage(LEVELS.find((c) => c.id === id)!, s, id as StagePlan);
const SEEDS = Array.from({ length: 50 }, (_, i) => 1 + i * 13);

/** the hop gaps of a stage: two planks a hop apart (20-260 px across, 110 up or down at most), nothing across between them */
function hopGaps(st: GeneratedStage, skip: Set<number>) {
  const P = st.platforms.filter((p) => p !== st.platforms[0] && p.height === 24 && !p.lip && p.width >= 60 && !skip.has(p.id));
  const out: Array<{ a: Platform; b: Platform }> = [];
  for (const a of P) for (const b of P) {
    if (b.x < a.x + a.width) continue;
    const g = b.x - (a.x + a.width);
    if (g < 20 || g > 260 || Math.abs(a.y - b.y) > 110) continue;
    if (P.some((c) => c !== a && c !== b && c.x < b.x && c.x + c.width > a.x + a.width && Math.abs(c.y - (a.y + b.y) / 2) < 60)) continue;
    out.push({ a, b });
  }
  return out;
}
/** how far a miss falls: from the lower plank to the first thing under the gap (at its two edges and its middle, the worst) */
function missDrop(st: GeneratedStage, a: Platform, b: Platform): number {
  const top = Math.max(a.y, b.y);
  const under = (x: number) => Math.min(...st.platforms.filter((q) => q.x <= x && q.x + q.width >= x && q.y > top + 4).map((q) => q.y));
  const gl = a.x + a.width, gr = b.x;
  return Math.max(under(gl + 10), under((gl + gr) / 2), under(gr - 10)) - top;
}

test('the climbs: no miss off a hop gap falls more than 450 px (4-1, 4-6, 4-3, 4-9; 50 rolls each)', () => {
  for (const id of ['4-1', '4-6', '4-3', '4-9']) {
    for (const s of SEEDS) {
      const st = build(id, s);
      const skip = new Set((st.proto.catches ?? []).map((c) => c.plat));
      for (const { a, b } of hopGaps(st, skip)) {
        const d = missDrop(st, a, b);
        assert.ok(d <= 450, `${id} seed ${s}: a miss between ${a.x + a.width} and ${b.x} (y ${a.y}/${b.y}) falls ${d} px`);
      }
    }
  }
});

/** the check's fewest moves from the spawn to the shrine's branch */
function moves(st: GeneratedStage): number {
  let g: CheckGraph | null = null;
  const res = validateStage(st, { inspect: (q) => (g = q) });
  assert.ok(res.ok, res.errors.slice(0, 3).join('; '));
  const graph = g as unknown as CheckGraph;
  const spawn = st.platforms.filter((p) => p.x <= st.spawnX && p.x + p.width >= st.spawnX && p.y >= st.spawnY - 10).sort((p, q) => p.y - q.y)[0];
  const exit = st.platforms.filter((p) => p.x <= st.exitTotemX && p.x + p.width >= st.exitTotemX && p.y >= st.exitTotemY - 10).sort((p, q) => p.y - q.y)[0];
  const from = graph.key(spawn), to = graph.key(exit);
  const dist = new Map([[from, 0]]);
  const queue = [from];
  while (queue.length) {
    const k = queue.shift()!;
    if (k === to) return dist.get(k)!;
    for (const n of graph.adj.get(k) ?? []) if (!dist.has(n)) { dist.set(n, dist.get(k)! + 1); queue.push(n); }
  }
  return Infinity;
}

test('the catch branches are never a shortcut: without them the check\'s way to the shrine is just as long (4-1, 4-6)', () => {
  for (const id of ['4-1', '4-6']) {
    let catches = 0;
    for (const s of SEEDS.slice(0, 20)) {
      const st = build(id, s);
      const mine = new Set((st.proto.catches ?? []).map((c) => c.plat));
      catches += mine.size;
      const with_ = moves(st);
      const without = moves({ ...st, platforms: st.platforms.filter((p) => !mine.has(p.id)) });
      assert.equal(with_, without, `${id} seed ${s}: the catches shorten the way (${without} moves to ${with_})`);
      // each sits under its gap, a double jump at most below the lower plank, and is a plain branch
      for (const c of st.proto.catches ?? []) {
        const p = st.platforms.find((q) => q.id === c.plat)!;
        const [a, b] = c.planks.map((pid) => st.platforms.find((q) => q.id === pid)!);
        assert.ok(p.x <= a.x + a.width && p.x + p.width >= b.x - 1 && p.y - Math.max(a.y, b.y) <= 180 && p.type === 'solid', `${id} seed ${s}`);
      }
    }
    assert.ok(catches > 0, `${id}: no catches`);
  }
});
