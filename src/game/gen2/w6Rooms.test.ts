/**
 * World 6's puzzle rooms (gen2/worlds/w6Rooms.ts): the validator (puzzleCheck.ts, through levelCheck) solves each on Normal and Easy and
 * fails it without its key piece; neither can be walked past; each fits an upright phone at half scale; and each is played through in
 * the real engine, upright and sideways, on Normal and Easy, with no heart or life lost:
 *   the water room   the door shut by high water; the wheel raises the raft with him on it; the stone from the shelf to the plate; the
 *                    door stays shut while the water is up; the wheel again, the water down, through
 *   the dark room    the steps dark until the firefly's light finds them; the hollow under them is soft with a step out; up the
 *                    steps in the light, onto the bank, and the moonflower opens
 */
import '../headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateStage } from '../levelCheck.ts';
import { KIT, kitPlatId, roomBox, type Anchor, type RoomSpec } from '../puzzleKit.ts';
import { KitPlay } from '../puzzlePlay.ts';
import { DOUBLE_RISE } from '../physics.ts';
import { G } from '../protoStage.ts';
import { RealPlay, type Pad } from '../realPlay.ts';
import { setDifficulty, type Difficulty } from '../difficulty.ts';
import type { Platform } from '../types.ts';
import type { SectionTemplate } from './types.ts';
import { M6, roomStage, RUNWAY } from './w6Harness.ts';
import { DARK, darkRoom, RAFT_RISE, W6_ROOM_SECTIONS, W6R_LESSONS, W6R_NEW_LINES, W6R_ROOM_HINTS, WATER, waterRoom, withW6Rooms } from './worlds/w6Rooms.ts';

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

/** each room's key pieces: without them its way on never opens */
const KEY: Record<string, string[]> = { water: ['source', 'item'], dark: ['glow'] };

test('the rooms: the checker solves each, Normal and Easy; each fails without its key piece (and the water room without its wheel)', () => {
  for (const t of W6_ROOM_SECTIONS) {
    for (const d of ['normal', 'easy'] as const) {
      const st = roomStage(t, d);
      assert.deepEqual(validateStage(st).errors, [], `${t.id} ${d}`);
      const bare = roomStage(t, d, (p) => !KEY[t.room!.id].includes(p.kind));
      assert.ok(validateStage(bare).errors.some((e) => e.startsWith(`room s1-${t.room!.id}:`)), `${t.id} ${d}: solved without its key`);
    }
  }
  // (with no wheel the raft never rises: the stone on the shelf is out of reach)
  const noWheel = roomStage(waterRoom, 'normal', (p) => p.kind !== 'lever');
  assert.ok(validateStage(noWheel).errors.some((e) => e.startsWith('room s1-water:')), 'solved without the wheel');
});

test('the rooms: neither can be walked past, each fits an upright phone, each has a post, none can hurt; Dot\'s lines are short', () => {
  for (const t of W6_ROOM_SECTIONS) {
    const st = roomStage(t, 'normal');
    const b = roomBox(st.room, st.platforms);
    assert.ok(b.x1 - b.x0 <= 720 && b.y1 - b.y0 <= 844 / 0.5, `${t.id}: ${b.x1 - b.x0} x ${b.y1 - b.y0}`);
    assert.ok(st.room.pieces.some((p) => p.kind === 'reset'), `${t.id}: a reset post`);
    assert.ok(!t.sockets.some((s) => s.role === 'enemy') && t.maxPerStage === 1 && !t.mirrorable, t.id);
    assert.ok(!st.platforms.some((p) => p.type === 'fragile'), `${t.id}: nothing crumbles`);
  }
  // the root door stands on floor B; its wall is out of a double jump's reach from the floor, and from the raft risen
  const st = roomStage(waterRoom, 'normal');
  const door = st.platforms.find((p) => p.id === kitPlatId(0, 's1-door', 0))!;
  const wall = st.platforms.find((p) => p.id === kitPlatId(0, 's1-door', 1))!;
  const raft = st.platforms.find((p) => p.id === kitPlatId(0, 's1-raft', 0))!;
  const floor2 = st.platforms.find((p) => p.id === (st.room.beyond.on))!;
  assert.equal(door.y + door.height, floor2.y, 'the door reaches the floor');
  assert.ok(floor2.y - wall.y > DOUBLE_RISE + 20, `the wall is ${floor2.y - wall.y} px over the floor`);
  assert.ok(raft.y - RAFT_RISE - wall.y > DOUBLE_RISE + 10, 'out of reach from the raft risen');
  // the shelf is out of a double jump from floor A, and level with the raft risen
  const shelf = st.platforms.find((p) => p.id === (st.room.pieces.find((q) => q.id === 's1-pile') as { at: Anchor }).at.on)!;
  assert.equal(shelf.y, G - WATER.shelfUp);
  assert.ok(WATER.shelfUp > DOUBLE_RISE + 20);
  assert.equal(raft.y - RAFT_RISE, shelf.y, 'risen, the raft is level with the shelf');
  // the dark room's bank is out of a double jump from floor E
  assert.ok(DARK.bankUp > DOUBLE_RISE + 20);
  for (const l of W6R_NEW_LINES) assert.ok(words(l) < 10, l);
  for (const [a, b] of Object.values(W6R_ROOM_HINTS)) assert.ok(words(a) < 10 && words(b) < 10, `${a} / ${b}`);
});

test('the rooms join a kit once, each open only from its own stage on (6-7 the water room, 6-6 the dark hollow)', () => {
  const kit = withW6Rooms({ manifest: M6 });
  const twice = withW6Rooms(kit);
  assert.equal(twice.manifest.sections.length, W6_ROOM_SECTIONS.length);
  assert.equal(kit.manifest.lessons![waterRoom.uses![0]], W6R_LESSONS[waterRoom.uses![0]]);
  // (lessons count from the stage after the one named: 6-6 for the water room means 6-7 on; the vine stages 6-1 and 6-3 never meet it)
  assert.deepEqual([waterRoom.archetypes, darkRoom.archetypes], [['vine_runner'], ['sprint']]);
});

// ───────────────────────────── each room in the real engine ─────────────────────────────

function play(t: SectionTemplate, d: Difficulty, w: number, h: number) {
  setDifficulty(d);
  const st = roomStage(t, d);
  const sim = new RealPlay('kit', 1);
  sim.bare(st.platforms);
  const e = sim.e;
  const kp = new KitPlay(st.kit!, st.platforms, { world: 6, stage: 7, vines: e.vines, collectibles: e.collectibles });
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
const walkTo = (sim: RealPlay, x: number, tol = 8) => {
  for (let i = 0; i < 600 && Math.abs(sim.p.x - x) > tol; i++) sim.frame(sim.p.x < x ? { right: true } : { left: true });
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
/** onto a platform ahead (right), jumping (and a second flick) as a player would; true once standing on it */
function stepTo(sim: RealPlay, to: Platform, dir: 1 | -1 = 1): boolean {
  let second = false;
  const side = dir > 0 ? { right: true } : { left: true };
  for (let i = 0; i < 30 * 8; i++) {
    const pl = sim.p;
    if (sim.standingOn === to.id && pl.grounded && (dir > 0 ? pl.x >= to.x + Math.min(40, to.width / 2) : pl.x <= to.x + to.width - Math.min(40, to.width / 2))) return true;
    const here = sim.platforms.find((q) => q.id === sim.standingOn);
    const ahead = dir > 0 ? to.x - pl.x : pl.x - (to.x + to.width);
    const higher = pl.y - to.y;
    let pad: Pad = { ...side };
    if (pl.grounded) {
      second = false;
      const atEdge = !!here && here.id !== to.id && (dir > 0 ? pl.x > here.x + here.width - 22 : pl.x < here.x + 22);
      const atFace = higher > 20 && ahead < 70 && ahead > -to.width;
      if (here && here.id !== to.id && (atFace || (atEdge && higher > -40))) pad = { ...side, press: true };
    } else {
      // (in the air he steers for the target's middle, as a thumb does: a short step is easily overshot at a run)
      const mx = to.x + to.width / 2;
      const steer: Pad = Math.abs(pl.x - mx) < 10 ? {} : pl.x < mx ? { right: true } : { left: true };
      pad = pl.y < to.y - 4 || pl.vy < 0 ? { ...steer, jump: true } : { ...side, jump: true };
      if (!second && pl.vy > -120 && pl.y - to.y > 30) {
        pad = { ...side, press: true };
        second = true;
      }
    }
    sim.frame(pad);
  }
  return false;
}

const SCREENS = [['sideways', 844, 390], ['upright', 390, 844]] as const;

for (const d of ['normal', 'easy'] as const) {
  for (const [name, w, h] of SCREENS) {
    test(`the water room in the real engine (${d}, ${name}): raise the water, the stone to the plate, lower the water, through the root door`, () => {
      const { sim, kit, st } = play(waterRoom, d, w, h);
      const lives = sim.e.lives;
      const hp = sim.p.hp;
      const r = kit.rooms[0];
      const door = r.gates[0];
      const raft = r.lifts[0];
      const lever = r.levers[0];
      const pl = (id: number) => st.platforms.find((p) => p.id === id)!;
      const floorA = pl(st.room.left.on);
      const shelf = pl((st.room.pieces.find((p) => p.id === 's1-pile') as { at: Anchor }).at.on);
      const floor2 = pl(st.room.beyond.on);
      assert.equal(door.open, false, 'the root door is shut to start with');
      // the door can't be jumped from floor B's foot
      walkTo(sim, at(st, 'door') - 120);
      for (let k = 0; k < 3; k++) {
        sim.frame({ right: true, press: true });
        for (let i = 0; i < 8; i++) sim.frame({ right: true, jump: true });
        sim.frame({ right: true, press: true });
        for (let i = 0; i < 20; i++) sim.frame({ right: true, jump: true });
      }
      sim.wait(1);
      assert.ok(sim.p.x < door.wall.x, `the door is shut to him (${sim.p.x.toFixed(0)})`);
      // back through the well to floor A, then down onto the raft; the wheel from the raft: the water up, the raft up with him, level
      // with the shelf
      walkTo(sim, raft.plat.x + raft.plat.width + 40);
      assert.ok(stepTo(sim, floorA, -1), 'out of the well onto floor A');
      walkTo(sim, raft.plat.x + 30, 6);
      sim.wait(0.3);
      walkTo(sim, raft.plat.x + 20, 4);
      assert.equal(sim.standingOn, raft.plat.id, 'on the raft');
      face(sim, -1);
      tap(sim);
      assert.equal(lever.on, true, 'the wheel turned: the water rises');
      sim.wait(RAFT_RISE / KIT.windSpeed + 1);
      assert.ok(Math.abs(sim.p.y - shelf.y) < 3, `up with the raft (${sim.p.y.toFixed(0)}, the shelf ${shelf.y})`);
      // the root-stone from the shelf
      walkTo(sim, at(st, 'pile') + 40);
      face(sim, -1);
      tap(sim);
      assert.ok(kit.holding, 'a tap by the pile picks the stone up');
      // down with it: across the raft and off its far end into the well, to the plate
      walkTo(sim, at(st, 'plate') - 40);
      sim.wait(0.5);
      assert.ok(kit.holding, 'still holding it after the drop');
      face(sim, 1);
      tap(sim);
      sim.wait(0.6);
      assert.ok(!kit.holding);
      assert.equal(r.plates[0].down, true, 'the stone is on the plate');
      sim.wait(0.5);
      assert.equal(door.open, false, 'the water is still up: the door stays shut');
      // out of the well, the wheel again from floor A: the water drains, the raft sinks, the door opens
      walkTo(sim, floorA.x + floorA.width + 30, 6);
      assert.ok(stepTo(sim, floorA, -1), 'out of the well onto floor A');
      walkTo(sim, at(st, 'sluice') - 30);
      face(sim, 1);
      tap(sim);
      assert.equal(lever.on, false, 'the wheel back: the water drains');
      sim.wait(RAFT_RISE / KIT.windSpeed + 1);
      assert.ok(raft.level < 0.01, 'the raft is down');
      assert.equal(door.open, true, 'water down, the stone on the plate: the door is open');
      // through: down into the well, across, up onto floor B, through the door
      walkTo(sim, at(st, 'plate') + 80);
      assert.ok(stepTo(sim, floor2), 'up onto floor B');
      walkTo(sim, at(st, 'door') + 120);
      assert.ok(sim.p.x > at(st, 'door') + 100, `through the root door (${sim.p.x.toFixed(0)})`);
      assert.equal(sim.e.lives, lives);
      assert.equal(sim.p.hp, hp);
      setDifficulty('normal');
    });

    test(`the dark room in the real engine (${d}, ${name}): the steps show only in the firefly's light, the hollow is soft, up and the moonflower opens`, () => {
      const { sim, kit, st } = play(darkRoom, d, w, h);
      const lives = sim.e.lives;
      const hp = sim.p.hp;
      const r = kit.rooms[0];
      const steps = r.ledges.map((l) => l.plat);
      assert.ok(steps.every((p) => p.broken), 'dark to start with');
      const hollow = st.platforms.find((p) => p.y === G + DARK.down)!;
      const floorE = st.platforms.find((p) => p.id === st.room.left.on)!;
      const bank = st.platforms.find((p) => p.id === st.room.beyond.on)!;
      // into the hollow on purpose: a soft floor, and a step out
      sim.stand(hollow.x + 200, hollow.y);
      for (let i = 0; i < 20; i++) sim.frame();
      assert.ok(sim.p.grounded && sim.e.lives === lives, 'landed soft');
      walkTo(sim, hollow.x + DARK.stepW + 30);
      for (let k = 0; k < 4 && sim.p.y > G + 1; k++) {
        sim.frame({ left: true, press: true });
        for (let i = 0; i < 20; i++) sim.frame({ left: true, jump: true });
      }
      assert.ok(Math.abs(sim.p.y - G) < 2, `hopped out (${sim.p.y})`);
      walkTo(sim, floorE.x + floorE.width - 20);
      // up the steps in the light, a step at a time, onto the bank
      for (const l of [...steps, bank]) {
        for (let i = 0; i < 30 && l.broken; i++) sim.frame();
        assert.ok(!l.broken || l === bank, 'lit as he nears it');
        assert.ok(stepTo(sim, l), `onto ${l === bank ? 'the bank' : 'a step'} (${sim.p.x.toFixed(0)}, ${sim.p.y.toFixed(0)})`);
      }
      walkTo(sim, at(st, 'moon') + 20);
      sim.wait(0.5);
      assert.ok(r.moons[0].open, 'the moonflower opened in his light');
      assert.equal(sim.e.lives, lives);
      assert.equal(sim.p.hp, hp);
      setDifficulty('normal');
    });
  }
}
