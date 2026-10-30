/**
 * World 7's puzzle rooms (gen2/worlds/w7Rooms.ts): the validator (puzzleCheck.ts, through levelCheck) solves each on Normal and Easy and
 * fails it without its key piece; neither can be walked past; each fits an upright phone at half scale; and each is played through in
 * the real engine, upright and sideways, on Normal and Easy, with no heart or life lost:
 *   the sealed door   his own weight and one stone leave the plate up (Normal); two stones press it, the door opens (Easy: one stone)
 *   the lever door    the lever alone leaves it shut, a stone on the plate opens it (Normal); Easy: the lever alone opens it
 * Pokey's lines are short (Dot is gone in World 7).
 */
import '../headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateStage } from '../levelCheck.ts';
import { ITEM, KIT, kitPlatId, roomBox, type Anchor } from '../puzzleKit.ts';
import { KitPlay } from '../puzzlePlay.ts';
import { DOUBLE_RISE } from '../physics.ts';
import { G } from '../protoStage.ts';
import { RealPlay } from '../realPlay.ts';
import { setDifficulty, type Difficulty } from '../difficulty.ts';
import type { SectionTemplate } from './types.ts';
import { roomStage, RUNWAY } from './w6Harness.ts';
import { leverRoom, leverRoomEasy, SEAL, sealRoom, sealRoomEasy, W7_ROOM_SECTIONS, W7R_NEW_LINES, W7R_ROOM_HINTS, W7R_STAGE, withW7Rooms } from './worlds/w7Rooms.ts';
import { W7_MANIFEST } from './worlds/w7.ts';

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
const roomFor = (t: SectionTemplate, d: Difficulty) => (d === 'easy' ? (t === sealRoom ? sealRoomEasy : leverRoomEasy) : t);

test('the rooms: the checker solves each, Normal and Easy; each fails without its stones; the seal needs two stones on Normal, the lever door both', () => {
  for (const t of W7_ROOM_SECTIONS) {
    for (const d of ['normal', 'easy'] as const) {
      const st = roomStage(roomFor(t, d), d);
      assert.deepEqual(validateStage(st).errors, [], `${t.id} ${d}`);
    }
    // (no stones: the plate never goes down; on Easy the lever door opens on its lever, so Normal's)
    const bare = roomStage(t, 'normal', (p) => p.kind !== 'source' && p.kind !== 'item');
    assert.ok(validateStage(bare).errors.some((e) => e.startsWith(`room s1-${t.room!.id}:`)), `${t.id}: solved without its stones`);
  }
  const one = roomStage(sealRoom, 'normal', (p) => p.id !== 's1-stone2');
  assert.ok(validateStage(one).errors.some((e) => e.startsWith('room s1-seal:')), 'the seal is solved with one stone on Normal');
  const noLever = roomStage(leverRoom, 'normal', (p) => p.kind !== 'lever');
  assert.ok(validateStage(noLever).errors.some((e) => e.startsWith('room s1-lever:')), 'the lever door is solved without its lever');
  const noLeverEasy = roomStage(leverRoomEasy, 'easy', (p) => p.kind !== 'lever');
  assert.ok(validateStage(noLeverEasy).errors.some((e) => e.startsWith('room s1-lever:')), 'Easy: solved without the lever');
  // (Pokey's weight alone is short of the seal's plate, and so is one stone; two are enough)
  assert.ok(KIT.pokeyWeight < SEAL.need.normal && ITEM.stone.weight < SEAL.need.normal && 2 * ITEM.stone.weight >= SEAL.need.normal);
  assert.ok(ITEM.stone.weight >= SEAL.need.easy);
  // (Easy's room is the same section: the same id, the same floors)
  for (const [n, e] of [[sealRoom, sealRoomEasy], [leverRoom, leverRoomEasy]] as const) {
    assert.equal(e.id, n.id);
    assert.deepEqual(e.pieces, n.pieces);
  }
});

test('the rooms: none can be walked past, each fits an upright phone, each has a post, none can hurt; Pokey\'s lines are short', () => {
  for (const t of W7_ROOM_SECTIONS) {
    const st = roomStage(t, 'normal');
    const b = roomBox(st.room, st.platforms);
    assert.ok(b.x1 - b.x0 <= 720 && b.y1 - b.y0 <= 844 / 0.5, `${t.id}: ${b.x1 - b.x0} x ${b.y1 - b.y0}`);
    assert.ok(st.room.pieces.some((p) => p.kind === 'reset'), `${t.id}: a reset post`);
    assert.ok(!t.sockets.some((s) => s.role === 'enemy') && t.maxPerStage === 1 && !t.mirrorable, t.id);
    assert.ok(!st.platforms.some((p) => p.type === 'fragile'), `${t.id}: nothing crumbles`);
    const door = st.platforms.find((p) => p.id === kitPlatId(0, 's1-door', 0))!;
    const wall = st.platforms.find((p) => p.id === kitPlatId(0, 's1-door', 1))!;
    const floor2 = st.platforms.find((p) => p.id === st.room.beyond.on)!;
    assert.equal(door.y + door.height, floor2.y, `${t.id}: the door reaches the floor`);
    assert.ok(floor2.y - wall.y > DOUBLE_RISE + 20, `${t.id}: the wall is ${floor2.y - wall.y} px over the floor`);
  }
  for (const l of W7R_NEW_LINES) assert.ok(words(l) < 10, l);
  for (const [a, b] of Object.values(W7R_ROOM_HINTS)) assert.ok(words(a) < 10 && words(b) < 10, `${a} / ${b}`);
});

test("each stage's kit holds its own room and no other (7-3 the sealed door, 7-7 the lever door), once", () => {
  for (let st = 1; st <= 9; st++) {
    const kit = withW7Rooms(withW7Rooms({ manifest: { ...W7_MANIFEST, sections: [] } }, st), st);
    const want = W7_ROOM_SECTIONS.filter((s) => W7R_STAGE[s.id] === `7-${st}`).map((s) => s.id);
    assert.deepEqual(kit.manifest.sections.map((s) => s.id), want, `7-${st}`);
  }
  assert.deepEqual(Object.values(W7R_STAGE).sort(), ['7-3', '7-7']);
});

// ───────────────────────────── each room in the real engine ─────────────────────────────

function play(t: SectionTemplate, d: Difficulty, w: number, h: number) {
  setDifficulty(d);
  const st = roomStage(roomFor(t, d), d);
  const sim = new RealPlay('kit', 1);
  sim.bare(st.platforms);
  const e = sim.e;
  const kp = new KitPlay(st.kit!, st.platforms, { world: 7, stage: 3, vines: e.vines, collectibles: e.collectibles });
  Object.assign(e, { kit: kp, enemies: [] });
  e.currentStage.kit = st.kit;
  e.viewCssW = w;
  e.viewCssH = h;
  e.introT = 99;
  e.applyZoom();
  sim.safe = false;
  sim.stand(RUNWAY - 120, G);
  sim.frame();
  return { sim, kit: kp, st };
}
/** walk to x; a step up in the way is hopped, as a thumb does (the room's floor2 lies a step under floor) */
const walkTo = (sim: RealPlay, x: number, tol = 8) => {
  let last = sim.p.x;
  let still = 0;
  for (let i = 0; i < 900 && Math.abs(sim.p.x - x) > tol; i++) {
    const side = sim.p.x < x ? { right: true } : { left: true };
    still = Math.abs(sim.p.x - last) < 0.5 ? still + 1 : 0;
    last = sim.p.x;
    if (still >= 4 && sim.p.grounded) {
      sim.frame({ ...side, press: true });
      for (let k = 0; k < 10; k++) sim.frame({ ...side, jump: true });
      still = 0;
    } else sim.frame(side);
  }
  sim.frame();
};
const face = (sim: RealPlay, dir: 1 | -1) => {
  sim.frame(dir > 0 ? { right: true } : { left: true });
  sim.frame();
};
const tap = (sim: RealPlay) => {
  sim.frame({ punch: true });
  sim.frame();
};
const at = (st: ReturnType<typeof roomStage>, id: string) => {
  const pc = st.room.pieces.find((p) => p.id === `s1-${id}`) as { at: Anchor };
  const pl = st.platforms.find((p) => p.id === pc.at.on)!;
  return pl.x + pc.at.at * pl.width + (pc.at.dx ?? 0);
};
/** a stone from the pile, carried to the plate and set down on it */
function stoneToPlate(sim: RealPlay, kit: KitPlay, st: ReturnType<typeof roomStage>) {
  walkTo(sim, at(st, 'pile') - 40);
  face(sim, 1);
  tap(sim);
  assert.ok(kit.holding, 'a tap by the pile picks a stone up');
  walkTo(sim, at(st, 'plate') - 30, 6);
  sim.wait(0.4);
  face(sim, 1);
  tap(sim);
  sim.wait(0.6);
  assert.ok(!kit.holding, 'set down');
}
/** try to get past the shut door: walk into it and jump at it */
function tryDoor(sim: RealPlay, st: ReturnType<typeof roomStage>, doorX: number) {
  walkTo(sim, at(st, 'door') - 100);
  for (let k = 0; k < 3; k++) {
    sim.frame({ right: true, press: true });
    for (let i = 0; i < 8; i++) sim.frame({ right: true, jump: true });
    sim.frame({ right: true, press: true });
    for (let i = 0; i < 20; i++) sim.frame({ right: true, jump: true });
  }
  sim.wait(1);
  assert.ok(sim.p.x < doorX, `the door is shut to him (${sim.p.x.toFixed(0)})`);
}

const SCREENS = [['sideways', 844, 390], ['upright', 390, 844]] as const;

for (const d of ['normal', 'easy'] as const) {
  for (const [name, w, h] of SCREENS) {
    test(`the sealed door in the real engine (${d}, ${name}): the stones onto the plate, the door opens, through`, () => {
      const { sim, kit, st } = play(sealRoom, d, w, h);
      const lives = sim.e.lives;
      const hp = sim.p.hp;
      const r = kit.rooms[0];
      const door = r.gates[0];
      assert.equal(door.open, false, 'the door is shut to start with');
      tryDoor(sim, st, door.wall.x);
      stoneToPlate(sim, kit, st);
      sim.wait(0.5);
      if (d === 'easy') assert.equal(door.open, true, 'Easy: one stone opens it');
      else {
        // (standing on the plate himself with one stone presses it, but the door shuts again as he steps off: he can't be on it and
        // through at once)
        walkTo(sim, at(st, 'plate') - 120);
        sim.wait(0.5);
        assert.equal(door.open, false, 'one stone is not enough');
        stoneToPlate(sim, kit, st);
        sim.wait(0.5);
        assert.equal(door.open, true, 'two stones open it');
      }
      walkTo(sim, at(st, 'door') + 140);
      assert.ok(sim.p.x > at(st, 'door') + 100, `through the door (${sim.p.x.toFixed(0)})`);
      assert.equal(sim.e.lives, lives);
      assert.equal(sim.p.hp, hp);
      setDifficulty('normal');
    });

    test(`the lever door in the real engine (${d}, ${name}): the lever, then a stone on the plate (Easy: the lever), through`, () => {
      const { sim, kit, st } = play(leverRoom, d, w, h);
      const lives = sim.e.lives;
      const hp = sim.p.hp;
      const r = kit.rooms[0];
      const door = r.gates[0];
      const lever = r.levers[0];
      assert.equal(door.open, false, 'the door is shut to start with');
      walkTo(sim, at(st, 'lever') - 30);
      face(sim, 1);
      tap(sim);
      assert.equal(lever.on, true, 'the lever is pulled');
      sim.wait(0.5);
      if (d === 'easy') assert.equal(door.open, true, 'Easy: the lever opens it');
      else {
        assert.equal(door.open, false, 'the lever alone is not enough');
        tryDoor(sim, st, door.wall.x);
        stoneToPlate(sim, kit, st);
        sim.wait(0.5);
        assert.equal(door.open, true, 'the lever and a stone on the plate open it');
      }
      walkTo(sim, at(st, 'door') + 140);
      assert.ok(sim.p.x > at(st, 'door') + 100, `through the door (${sim.p.x.toFixed(0)})`);
      assert.equal(sim.e.lives, lives);
      assert.equal(sim.p.hp, hp);
      setDifficulty('normal');
    });
  }
}
