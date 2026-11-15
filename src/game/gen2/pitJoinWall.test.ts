/**
 * R-165.265 (ENG-PETAL 11-14, every stage): where the lay joins two soft pits' floors (pitFloorJoin, ENG-16H), a miss in the earlier pit
 * must never walk on under the perch to the later pit's stair and its liana: a wall stands at the earlier floor's end, its face more than a
 * double jump and the engine's hoist over the floor, never over the lip. Planted: python3 reference/qa-reports/ENG-PETAL/planted.py wall.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import '../headlessDom.ts';
import { pitJoinWall, PIT_JOIN } from './pipeline.ts';
import { buildStage } from '../../../tools/engine/libstage.ts';
import { generateStage, setLayoutVariant } from '../stageGenerator.ts';
import { generateAllLevels } from '../worldsData.ts';
import { DOUBLE_RISE, FORGIVE, JUMP_RISE } from '../physics.ts';
import type { Platform } from '../types.ts';

const CLIMB = DOUBLE_RISE + Math.max(FORGIVE.normal.mantle, FORGIVE.easy.mantle);

test('the wall: at the earlier floor\'s end, a face he cannot climb, never over the lip; none in a floor too shallow for one', () => {
  const w = pitJoinWall({ x: 1000, y: 1091, w: 150 }, 866)!;
  assert.ok(w, 'a wall where two deep floors are joined');
  assert.equal(w.x, 1000, 'at the earlier floor\'s end');
  assert.ok(w.y >= 866, 'its top never over the lip');
  assert.ok(1091 - w.y > CLIMB, `its face (${1091 - w.y} px) more than a double jump and the hoist (${Math.round(CLIMB)})`);
  assert.equal(pitJoinWall({ x: 1000, y: 1000, w: 150 }, 866), null, 'a floor too shallow under the lip: no wall');
  assert.equal(pitJoinWall({ x: 1000, y: 1091, w: 150 }, undefined), null, 'no fall record: no wall');
});

test('1-6 rolls 1-4, both settings: every joined pair of soft pits has its wall, so the earlier pit\'s only way up is its own stair', () => {
  let joins = 0;
  for (const d of ['normal', 'easy'] as const) {
    for (let seed = 1; seed <= 4; seed++) {
      const st = buildStage('1-6', seed, d) as { platforms: Platform[]; gen2: { falls?: Array<{ x0: number; x1: number; y: number; kind: string }> } };
      const soft = (st.gen2.falls ?? []).filter((f) => f.kind === 'soft').sort((a, b) => a.x0 - b.x0);
      const out: string[] = [];
      for (let i = 1; i < soft.length; i++) {
        const a = soft[i - 1], b = soft[i];
        if (b.x0 - a.x1 > PIT_JOIN.px || b.x0 < a.x1) continue;
        // (the joined floor: one solid under the lip reaching from the earlier gap's end to the later's start; since INT-10b it is one
        // piece with a pit's floor (joinPitFloors), so it reaches past both ends)
        const join = st.platforms.find((p) => p.type === 'solid' && p.y > a.y + 60 && p.x <= a.x1 + 4 && p.x + p.width >= b.x0 - 4);
        if (!join) continue;
        joins++;
        const wall = st.platforms.find((p) => p.type === 'solid' && Math.abs(p.x - a.x1) <= 4 && p.y >= a.y && join.y - p.y > CLIMB && p.y + p.height >= join.y);
        if (!wall) out.push(`${d} seed ${seed}: the floor joined under ${Math.round(a.x1)}..${Math.round(b.x0)} (y ${join.y}) has no wall`);
      }
      assert.deepEqual(out, [], `1-6 ${d} seed ${seed}`);
    }
  }
  assert.ok(joins > 0, 'the rolls hold joined floors (the creaky landing)');
});

// (the castBots layouts of ENG-16I's ten rescues, the lead's 9:42 PM ET list: kid N 1, 2, 14, 20, 32; child and middle N 34; kid E 18, 21)
const RESCUES = [1, 2, 14, 18, 20, 21, 32, 34];
test('1-6 as the game plays it, the rescue layouts, both settings: every soft pit climbs back to its take-off, each rise a plain jump (the way back)', () => {
  let pits = 0;
  for (const d of ['normal', 'easy'] as const) {
    for (const seed of RESCUES) {
      setLayoutVariant(seed);
      let built: unknown;
      try { built = generateStage({ ...generateAllLevels().find((l) => l.id === '1-6')!, unlocked: true }, d); } finally { setLayoutVariant(null); }
      const st = built as { platforms: Platform[]; heartFalls?: Array<{ x0: number; x1: number; soft?: boolean }>; gen2: { falls?: Array<{ x0: number; x1: number; y: number; kind: string }> } };
      const out: string[] = [];
      // (a set-back gap, Laid.heartFalls soft: a fall there puts him back on the ledge he left, no climb)
      const back = (f: { x0: number; x1: number }) => (st.heartFalls ?? []).some((z) => z.soft && z.x0 <= f.x0 + 4 && z.x1 >= f.x1 - 4);
      for (const f of (st.gen2.falls ?? []).filter((q) => q.kind === 'soft' && !back(q))) {
        // (the column at the take-off side: every top over the floor there, from the floor up to the take-off's lip)
        const x = f.x0 + 50;
        const bank = st.platforms.filter((p) => p.type !== 'bouncy' && !p.broken && Math.abs(p.x + p.width - f.x0) <= 4).sort((a, b) => a.y - b.y)[0];
        if (!bank) continue;
        const under = st.platforms.filter((p) => p.type === 'solid' && !p.broken && x >= p.x && x <= p.x + p.width && p.y > bank.y + 2).sort((a, b) => b.y - a.y);
        // (a thorn floor sets him back: no climb out, by design)
        if (!under.length || under[0].pit === 'hurt') continue;
        const tops = under.map((p) => p.y);
        pits++;
        const chain = [...new Set([...tops, bank.y])];
        const rises = chain.slice(1).map((y, i) => chain[i] - y);
        if (rises.some((r) => r > JUMP_RISE)) out.push(`${d} seed ${seed}: the pit under ${Math.round(f.x0)}..${Math.round(f.x1)} climbs back by rises ${rises.join(', ')} (a plain jump: ${Math.round(JUMP_RISE)})`);
      }
      assert.deepEqual(out, [], `1-6 ${d} layout ${seed}`);
    }
  }
  assert.ok(pits > 0, 'the layouts hold soft pits');
});
