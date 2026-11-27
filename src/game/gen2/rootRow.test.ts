/**
 * THE ROOF ROOT on a row LAID BY GEN2 (ENG-ROOT item 4; 3-2.md NEW 2; level.md rules 21, 23): a toy World 3 row, its root from the place
 * `root` over its walkable floor, a glowworm dark over it (gen2/dark.ts darkEnds 'glow'), one fixed patch on the root (a light of that
 * dark, rootPatches) and a kit ocelot from its socket under it, as noiseRow.test.ts lays its rows. World-neutral: no stage of the game, a
 * toy kit (toyWorld.ts) with World 3's number.
 *   - laid: the root is a Rope with look 'root' and ROOT_SPEED, its whole length over the floor, 190 up on Normal and 170 on Easy, the
 *     patch a fixed light (no sleep) in the dark zone at its place, r 90 / 60, the ocelot on the floor under the root.
 * NEXT (box 2): the first-timer creeps it unseen (rootPlan); plants: rootPlan off -> leapt at; the root as a `rope` over a gap -> red;
 * the root's speed unset (120) -> the creep-timing verdict reads it.
 */
import '../headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildGen2Stage } from './pipeline.ts';
import { cfg as toyCfg } from './toyWorld.ts';
import { darkEnds, ROOT_PATCH_DROP } from './dark.ts';
import { ROOT_SPEED } from '../rope.ts';
import { W3_CAST, W3_DOWN, w3Walk, w3World } from './worlds/w3.ts';
import type { SectionTemplate, WorldKit } from './types.ts';
import type { LevelConfig } from '../types.ts';

const ID = '3-97';
const cfg: LevelConfig = { ...toyCfg(ID, 'sprint'), unlocked: true };

const row: SectionTemplate = {
  id: 'toy-root-row', name: 'a root over an ocelot', archetypes: 'any', phases: ['ten', 'ketsu'], difficulty: 2, maxPerStage: 1,
  pieces: [
    { key: 'floor', shape: 'bank', w: [1600, 1600], place: { kind: 'start' }, main: true },
    { key: 'root', shape: 'vine', w: [0, 0], place: { kind: 'root', on: 'floor', at: [0.5, 0.5], len: [900, 900], up: { normal: 190, easy: 170 },
      patches: [{ at: 0.5, r: { normal: 90, easy: 60 } }] } },
  ],
  sockets: [...darkEnds('floor', 'floor', 'glow'), { id: 'ocelot', role: 'enemy', on: 'floor', t: [0.5, 0.5], maxThreat: 3, chance: 1 }],
  entry: { piece: 'floor', kind: 'ground' }, exit: { piece: 'floor', kind: 'ground' }, exitDy: 0, mirrorable: false,
};
const W3 = w3World();
const kit: WorldKit = {
  ...W3,
  spawn: (e, _c, out) => {
    const cast = (out.proto.cast ??= { kinds: [], traps: [] });
    if (!cast.kinds.includes(e.type)) cast.kinds.push(e.type);
  },
  manifest: { ...W3.manifest, creatures: [...W3_CAST], sections: [...W3_DOWN, { ...w3Walk, id: 'w3toy-walk', phases: ['ki', 'sho', 'ten', 'ketsu'] }, row] },
  // (World 3's way-down bricks, its shelf walk on every phase as the filler around the row)
};
function built(difficulty: 'normal' | 'easy', K: WorldKit = kit) {
  for (let seed = 1; seed <= 20; seed++) {
    const st = buildGen2Stage({ config: cfg, kit: K, seed, difficulty });
    if (!st.gen2.errors?.length && st.ropes?.some((r) => r.look === 'root') && st.enemies.some((e) => e.type === 'ocelot')) return { st, seed };
  }
  throw new Error(`no roll lays the root row (${difficulty})`);
}

test('laid by gen2: a root over its walkable floor at the root\'s speed, its patch a fixed light of the dark over it, the ocelot under it', () => {
  for (const difficulty of ['normal', 'easy'] as const) {
    const { st } = built(difficulty);
    const root = st.ropes!.find((r) => r.look === 'root')!;
    assert.equal(root.speed, ROOT_SPEED, `${difficulty}: the root's own creep`);
    assert.equal(root.required, false, `${difficulty}: never required (the floor is walkable)`);
    assert.equal(root.g0 - root.y, difficulty === 'easy' ? 170 : 190, `${difficulty}: its height`);
    for (let x = root.x0; x <= root.x1; x += 20) {
      assert.ok(st.platforms.some((p) => p.x <= x && p.x + p.width >= x && Math.abs(p.y - root.g0) < 2), `${difficulty}: floor under the root at x ${x}`);
    }
    const mid = Math.round((root.x0 + root.x1) / 2);
    const dark = (st.zones ?? []).find((z) => z.kind === 'dark' && z.x0 <= mid && z.x1 >= mid);
    assert.ok(dark, `${difficulty}: a dark zone over the root`);
    const patch = dark!.lights!.find((l) => l.x === mid && l.y === root.y + ROOT_PATCH_DROP);
    assert.ok(patch && !patch.sleep && !patch.clock && patch.id !== undefined, `${difficulty}: the patch, fixed, with its glow id (${JSON.stringify(dark!.lights)})`);
    assert.equal(patch!.r, difficulty === 'easy' ? 60 : 90, `${difficulty}: its ring`);
    const oc = st.enemies.find((e) => e.type === 'ocelot')!;
    assert.ok(oc.x > root.x0 && oc.x < root.x1, `${difficulty}: the ocelot under the root (x ${oc.x}, root ${root.x0}-${root.x1})`);
  }
});

test("the pool reads the root as the rope's move, never a climb (hangsNeed by place): World 3 without 'climb' lays it, without 'rope' never", () => {
  const without = (m: string): WorldKit => ({ ...kit, manifest: { ...kit.manifest, moves: kit.manifest.moves.filter((x) => x !== m) } });
  for (const difficulty of ['normal', 'easy'] as const) {
    assert.ok(built(difficulty, without('climb')).st.ropes!.some((r) => r.look === 'root'), `${difficulty}: no climb, the root still lays`);
    for (let seed = 1; seed <= 20; seed++) {
      const st = buildGen2Stage({ config: cfg, kit: without('rope'), seed, difficulty });
      assert.ok(!st.gen2.sections.some((q) => q.template === 'toy-root-row'), `${difficulty} seed ${seed}: no rope, no root row`);
    }
  }
});
