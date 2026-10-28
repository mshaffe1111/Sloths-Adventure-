/**
 * 1-7's acorn meadow (2026-10-28, the puzzle kit's noise lure): open ground the eagle watches, an acorn tree by the bush at each end of
 * its two stretches. The first stretch can be run in one calm (a bush at its end: the place to try the throw); the second only with an
 * acorn thrown when the eagle screeches, so that it circles over the noise while he runs on.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, G } from './protoStage.ts';
import { validateStage } from './levelCheck.ts';
import { roomBox } from './puzzleKit.ts';
import { WATCH, zoneAt } from './watcher.ts';
import { RealPlay } from './realPlay.ts';
import type { KitPlay } from './puzzlePlay.ts';
import type { LevelConfig } from './types.ts';

const cfg = {
  worldIndex: 1, miniIndex: 7, id: '1-7', name: 'A Very Good Bush', objectiveType: 'stealth', targetCount: 1, timeLimit: 0,
  levelWidth: 16700, levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
} as LevelConfig;
const SEEDS = Array.from({ length: 8 }, (_, i) => 1 + i * 41);

test('1-7: the acorn meadow passes the validator; the first stretch can be run in one calm, the second needs the acorn', () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg, s, '1-7');
    const rooms = st.kit!.rooms;
    assert.deepEqual(rooms.map((r) => r.id.replace(/-\d+$/, '')), ['acorns', 'acorns'], `seed ${s}`);
    assert.deepEqual(validateStage(st).errors.filter((e) => e.startsWith('room ')), [], `seed ${s}`);
    const fin = st.proto.beats.find((b) => b[2].startsWith('Finish'))!;
    const zones = st.proto.watch!;
    const bushes = st.proto.bushes!.filter((b) => !b.hanging && !b.secret).map((b) => b.x + b.w / 2);
    rooms.forEach((r, i) => {
      const box = roomBox(r, st.platforms);
      assert.ok(box.x0 > fin[0] && box.x1 < fin[1], `seed ${s}: the meadow is in the finish`);
      // the room is watched (a thrown acorn's noise is heard there), and no animal is near it
      const z = zoneAt(zones, (box.x0 + box.x1) / 2)!;
      assert.ok(z && z.x0 <= box.x0 && z.x1 >= box.x1, `seed ${s}: the eagle watches the meadow`);
      assert.ok(!st.enemies.some((e) => e.patrolMaxX > box.x0 - 300 && e.patrolMinX < box.x1 + 300), `seed ${s}: an animal by the meadow`);
      // the bush by the oak, and the next one on
      const oak = st.platforms.find((p) => p.id === r.left.on)!;
      const ox = oak.x + oak.width * (r.pieces.find((pc) => pc.kind === 'source') as { at: { at: number } }).at.at;
      const before = bushes.filter((b) => b < ox).pop()!;
      const next = bushes.find((b) => b > ox)!;
      assert.ok(ox - before < 260, `seed ${s}: a bush by the acorn tree`);
      const run = next - before;
      if (i === 0) assert.ok(run < 285 * (z.calm[0] + 1.4), `seed ${s}: the first stretch (${Math.round(run)} px) is a run in one calm`);
      else assert.ok(run > 285 * (z.calm[0] + WATCH.warn) && run < 285 * (2 * z.calm[0] + WATCH.warn + WATCH.pass), `seed ${s}: the second stretch (${Math.round(run)} px) needs the acorn, and the acorn is enough`);
    });
  }
});

const kitOf = (r: RealPlay) => (r.e as unknown as { kit: KitPlay }).kit;
type Watchy = { watch: { phase: string; t: number; dur: number; seen: boolean }; shadowX: (w: unknown, x: number, vw: number) => number; camera: { x: number; viewportWidth: number } };

test('1-7 in the real engine: an acorn thrown when the eagle screeches draws it over the noise, and he runs on unseen', () => {
  const r = new RealPlay('1-7', 1);
  const kit = kitOf(r);
  const room = kit.rooms.find((q) => q.spec.id.startsWith('acorns-') && q !== kit.rooms[0])!;
  const oak = room.sources[0];
  r.stand(oak.x - 40, G);
  r.frame({ right: true });
  r.frame();
  r.frame({ punch: true });
  assert.ok(kit.holding, 'a tap by the acorn tree picks one up');
  for (let i = 0; i < 40; i++) r.frame({ right: true });
  // the screech
  const e = r.e as unknown as Watchy;
  Object.assign(e.watch, { phase: 'warn', t: 0, dur: WATCH.warn, seen: false });
  // running, a flick up throws it: it lands behind him with a clack
  r.frame({ right: true, press: true });
  assert.ok(!kit.holding, 'thrown');
  // (up, and down again behind him: about a second)
  for (let i = 0; i < 40; i++) r.frame({ right: true });
  assert.equal(kit.noises.length, 1, 'it landed with a noise');
  const nx = kit.noises[0].x;
  assert.ok(r.p.x > nx + 120, `he is past the noise (${Math.round(r.p.x)} vs ${Math.round(nx)})`);
  // through the pass the eagle circles over the noise; he keeps running and is never seen
  let passed = false;
  for (let i = 0; i < 30 * 5; i++) {
    r.frame({ right: true });
    if (e.watch.phase === 'pass') {
      passed = true;
      const sx = e.shadowX(e.watch, e.camera.x, e.camera.viewportWidth);
      assert.ok(Math.abs(sx - nx) < 60, `the shadow circles the noise (${Math.round(sx)} vs ${Math.round(nx)})`);
    }
    assert.equal(e.watch.seen, false, `seen at ${Math.round(r.p.x)}`);
  }
  assert.ok(passed, 'the eagle came by');
});
