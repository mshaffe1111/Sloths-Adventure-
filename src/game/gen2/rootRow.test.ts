/**
 * THE ROOF ROOT on a row LAID BY GEN2 (ENG-ROOT item 4; 3-2.md NEW 2; level.md rules 21, 23): a toy World 3 row, its root from the place
 * `root` over its walkable floor, a glowworm dark over it (gen2/dark.ts darkEnds 'glow'), one fixed patch on the root (a light of that
 * dark, rootPatches) and World 3's ocelot from its socket under it, as noiseRow.test.ts lays its rows. World-neutral: no stage of the
 * game, a toy id on World 3's own kit.
 *   - laid: the root is a Rope with look 'root' and ROOT_SPEED, its whole length over the floor, 190 up on Normal and 170 on Easy, the
 *     patch a fixed light (no sleep) in the dark zone at its place, r 90 / 60, the ocelot on the floor under the root.
 * The row is toyRoot.ts's (World 3's real kit). The bot's creep under the ocelot: rootBots.test.ts.
 */
import '../headlessDom.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildGen2Stage } from './pipeline.ts';
import { ROOT_PATCH_DROP } from './dark.ts';
import { ROOT_SPEED } from '../rope.ts';
import { rootBuilt as built, rootCfg as cfg, rootKit as kit } from './toyRoot.ts';
import type { WorldKit } from './types.ts';

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

test('the watch rule: the root starts and ends outside its ocelot\'s watch of the floor (its patrol and its sight ahead), 16 rolls; PLANT the socket\'s patch bound away and a roll breaks it', () => {
  const SIGHT = 240; // (World 3's ocelot, predators/world3.ts sight.ahead)
  const broken = (K: WorldKit) => (['normal', 'easy'] as const).flatMap((difficulty) => [1, 6, 11, 16, 21, 26, 31, 36].flatMap((from) => {
    const { st, seed } = built(difficulty, K, from);
    const root = st.ropes!.find((r) => r.look === 'root')!;
    return st.enemies.filter((e) => e.type === 'ocelot' && Math.abs(e.y - root.g0) < 40 && e.patrolMinX < root.x1 && e.patrolMaxX > root.x0)
      .filter((e) => e.patrolMinX - SIGHT < root.x0 || e.patrolMaxX + SIGHT > root.x1).map((e) => `${difficulty[0]}${seed}: patrol ${e.patrolMinX}..${e.patrolMaxX}, root ${root.x0}..${root.x1}`);
  }));
  assert.deepEqual(broken(kit), []);
  const unbound: WorldKit = { ...kit, manifest: { ...kit.manifest, sections: kit.manifest.sections.map((s) => (s.id === 'toy-root-row' ? { ...s, sockets: s.sockets.map((k) => (k.role === 'enemy' ? { ...k, patch: undefined } : k)) } : s)) } };
  assert.ok(broken(unbound).length > 0, 'unbound, the ocelot patrols the whole floor past the root\'s ends');
});
