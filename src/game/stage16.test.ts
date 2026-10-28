/**
 * 1-6's seesaw (2026-10-28, the puzzle kit): shown first (a log wedged on its near end holds the far end up as a step), then learned
 * (push the log onto the near end, climb the far end to the bank), then twisted (the far end rests down and the log lies past it: push it
 * back onto the far end, and the near end is the step to the branch overhead). The validator proves every roll's rooms and that each needs
 * its log; the real engine plays the learn room and the twist through.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, G } from './protoStage.ts';
import { validateStage } from './levelCheck.ts';
import { roomBox } from './puzzleKit.ts';
import { RealPlay } from './realPlay.ts';
import type { KitPlay } from './puzzlePlay.ts';
import type { LevelConfig } from './types.ts';

const cfg = {
  worldIndex: 1, miniIndex: 6, id: '1-6', name: 'First Lianas', objectiveType: 'vine_runner', targetCount: 1, timeLimit: 270,
  levelWidth: 16100, levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
} as LevelConfig;
const SEEDS = Array.from({ length: 8 }, (_, i) => 1 + i * 37);
const roomErrors = (st: ReturnType<typeof buildProtoStage>, id?: string) => validateStage(st).errors.filter((e) => e.startsWith(id ? `room ${id}:` : 'room '));

test('1-6: the seesaw rooms (shown, learned, twisted) pass the validator, and each one needs its log', () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg, s);
    const rooms = st.kit!.rooms;
    assert.deepEqual(rooms.map((r) => r.id.replace(/-\d+$/, '')), ['seesaw-show', 'seesaw', 'seesaw-twist'], `seed ${s}`);
    assert.deepEqual(roomErrors(st), [], `seed ${s}`);
    // the shown one and the learned one sit right after the fallen log, in its beat; the twist comes later, in the next develop
    const puzzle = st.proto.beats.find((b) => b[2].startsWith('Puzzle'))!;
    const again = st.proto.beats.find((b) => b[2].startsWith('Develop again'))!;
    const box = (i: number) => roomBox(rooms[i], st.platforms);
    assert.ok(box(0).x0 > puzzle[0] && box(1).x1 < puzzle[1], `seed ${s}: shown and learned in the puzzle beat`);
    assert.ok(box(2).x0 > again[0] && box(2).x1 < again[1], `seed ${s}: the twist in the develop again beat`);
    // narrow and tall enough for an upright phone and a sideways one (the view zooms out to three quarters at most)
    for (let i = 0; i < 3; i++) assert.ok(box(i).x1 - box(i).x0 <= 860 && box(i).y1 - box(i).y0 <= 540, `seed ${s}: room ${rooms[i].id} is ${Math.round(box(i).x1 - box(i).x0)} wide`);
    // no animal in a seesaw room, and every floor in one above the water (a miss is a hop out of the shallow pit)
    for (let i = 0; i < 3; i++) {
      const b = box(i);
      assert.ok(!st.enemies.some((e) => e.patrolMaxX > b.x0 - 200 && e.patrolMinX < b.x1 + 200 && e.y > b.y0 - 200), `seed ${s}: an animal by ${rooms[i].id}`);
    }
    // take each room's log away: the room can no longer be got through (the bank past it is out of reach without it)
    for (let i = 0; i < 3; i++) {
      const t = buildProtoStage(cfg, s);
      const b = roomBox(t.kit!.rooms[i], t.platforms);
      t.platforms = t.platforms.filter((p) => !(p.push && p.x + p.width > b.x0 - 40 && p.x < b.x1 + 40));
      assert.ok(roomErrors(t, t.kit!.rooms[i].id).length > 0, `seed ${s}: ${t.kit!.rooms[i].id} can be done without its log`);
    }
  }
});

const kitOf = (r: RealPlay) => (r.e as unknown as { kit: KitPlay }).kit;
const roomRun = (r: RealPlay, prefix: string) => kitOf(r).rooms.find((q) => q.spec.id.startsWith(prefix) && /^seesaw(-twist)?-\d+$/.test(q.spec.id) && (prefix === 'seesaw-twist' || !q.spec.id.includes('twist')))!;
/** a double jump up and to one side, steering that way for `steer` frames (30 a second) */
const doubleJump = (r: RealPlay, dir: 1 | -1, steer = 40) => {
  const side = (i: number) => (i < steer ? (dir > 0 ? { right: true } : { left: true }) : {});
  for (let i = 0; i < 40; i++) r.frame(i === 0 || i === 9 ? { ...side(i), press: true } : { ...side(i), jump: i < 22 });
  r.wait(0.5);
};

test('1-6 in the real engine: push the log onto the near end, up the far end, and the second jump to the bank', () => {
  const r = new RealPlay('1-6', 1);
  const room = roomRun(r, 'seesaw-');
  const s = room.seesaws[0];
  const box = roomBox(room.spec, r.platforms);
  const log = r.platforms.find((p) => p.push && p.x > box.x0 && p.x < box.x1)!;
  assert.equal(s.tilt, -1, 'at rest the near end is down');
  r.stand(log.x - 30, G);
  for (let i = 0; i < 200; i++) r.frame({ right: true });
  assert.ok(log.x + log.width / 2 > s.ends[0].x && log.x + log.width / 2 < s.ends[0].x + s.ends[0].width, `the log is on the near end (${Math.round(log.x)})`);
  r.stand(s.ends[1].x + 60, s.ends[1].y);
  r.wait(0.6);
  assert.equal(s.tilt, -1, 'the log outweighs him: the far end stays up under him');
  assert.ok(Math.abs(r.p.y - (G - 110)) < 4, `he stands on the raised end (${r.p.y})`);
  doubleJump(r, 1);
  const bank = r.platforms.find((p) => p.id === room.spec.beyond.on)!;
  assert.ok(Math.abs(r.p.y - bank.y) < 3 && r.p.x > bank.x, `on the bank (${Math.round(r.p.x)}, ${r.p.y})`);
});

test('1-6 in the real engine: the twist, the log pushed back onto the far end, and up from the near end to the branch', () => {
  const r = new RealPlay('1-6', 1);
  const room = roomRun(r, 'seesaw-twist');
  const s = room.seesaws[0];
  const box = roomBox(room.spec, r.platforms);
  const log = r.platforms.find((p) => p.push && p.x > box.x0 && p.x < box.x1)!;
  assert.equal(s.tilt, 1, 'at rest the far end is down');
  // alone on the near end, his weight takes it down: no step there without the log
  r.stand(s.ends[0].x + 60, s.ends[0].y);
  r.wait(1);
  assert.equal(s.tilt, -1);
  // round the log on the far floor, and push it back toward the seesaw
  r.stand(log.x + log.width + 40, G);
  r.wait(0.6);
  for (let i = 0; i < 200; i++) r.frame({ left: true });
  assert.ok(log.x + log.width / 2 > s.ends[1].x && log.x + log.width / 2 < s.ends[1].x + s.ends[1].width, `the log is on the far end (${Math.round(log.x)})`);
  r.stand(s.ends[0].x + 60, s.ends[0].y);
  r.wait(0.6);
  assert.equal(s.tilt, 1, 'the log holds the far end down: the near end stays up under him');
  assert.ok(Math.abs(r.p.y - (G - 100)) < 4, `he stands on the raised near end (${r.p.y})`);
  doubleJump(r, 1, 16);
  assert.ok(Math.abs(r.p.y - (G - 260)) < 3, `up on the branch over the bank (${Math.round(r.p.x)}, ${r.p.y})`);
});
