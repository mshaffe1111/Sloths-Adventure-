/**
 * World 10's three puzzle rooms (gen2/worlds/w10Rooms.ts): the validator (puzzleCheck.ts, through levelCheck) solves each on Normal and
 * Easy and fails it without its key piece; none can be walked past; each fits an upright phone at half scale; Pokey's lines are short;
 * and each is played through in the real engine, upright and sideways, on Normal and Easy, with no heart or life lost:
 *   the hoist     Normal: the lever raises the alcove's portcullis; a stone from the rubble; onto the plank; flick up: it lands in the high
 *                 basket and the plank carries him up to the wall walk. Easy: no alcove, the basket low: a tap sets the stone in
 *   the beam      one stone on the near end and the far end still tips down under him; two hold it up; up the beam, onto the wall
 *   the gatehouse Normal: the portcullis stays shut with only the lever pulled, and with only the stone on the plate; both, it opens.
 *                 Easy: the lever alone
 */
import '../headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateStage } from '../levelCheck.ts';
import { ITEM, KIT, roomBox, type Anchor } from '../puzzleKit.ts';
import { KitPlay } from '../puzzlePlay.ts';
import { DOUBLE_RISE } from '../physics.ts';
import { G } from '../protoStage.ts';
import { RealPlay, type Pad } from '../realPlay.ts';
import { setDifficulty, type Difficulty } from '../difficulty.ts';
import type { Platform } from '../types.ts';
import type { SectionTemplate } from './types.ts';
import { roomStage, RUNWAY } from './w6Harness.ts';
import {
  BEAM, beamRoom, GATE, gateRoom, HOIST, hoistRoom, roomFor, W10_ROOM_REQUIRED, W10_ROOM_SECTIONS, W10R_NEW_LINES, W10R_ROOM_HINTS, W10R_STAGE, w10RoomsFor,
  withW10Rooms,
} from './worlds/w10Rooms.ts';

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

/** each room's key pieces: without them its way on never opens */
const KEY: Record<string, string[]> = { hoist: ['source', 'item'], beam: ['source', 'item'], gate: ['lever'] };

test('the rooms: the checker solves each, Normal and Easy; each fails without its key piece', () => {
  for (const t of W10_ROOM_SECTIONS) {
    for (const d of ['normal', 'easy'] as const) {
      const st = roomStage(roomFor(t, d), d);
      assert.deepEqual(validateStage(st).errors, [], `${t.id} ${d}`);
      const bare = roomStage(roomFor(t, d), d, (p) => !KEY[t.room!.id].includes(p.kind));
      assert.ok(validateStage(bare).errors.some((e) => e.startsWith(`room s1-${t.room!.id}:`)), `${t.id} ${d}: solved without its key`);
    }
  }
  // (the hoist on Normal: no lever, the rubble stays locked in its alcove)
  assert.ok(validateStage(roomStage(hoistRoom, 'normal', (p) => p.kind !== 'lever')).errors.some((e) => e.startsWith('room s1-hoist:')), 'the hoist without its lever');
  // (the gatehouse on Normal: no stone, the lever alone does not open it)
  assert.ok(validateStage(roomStage(gateRoom, 'normal', (p) => p.kind !== 'source' && p.kind !== 'item')).errors.some((e) => e.startsWith('room s1-gate:')), 'the gate without a stone');
  // (one stone is too light: the beam's far end tips down under him, on Easy too)
  for (const d of ['normal', 'easy'] as const) {
    const one = roomStage(beamRoom, d, (p) => p.id !== 's1-stone2');
    assert.ok(validateStage(one).errors.some((e) => e.startsWith('room s1-beam:')), `${d}: solved with one stone`);
  }
  // (Easy's rooms are the same sections, their floors in the same places; only the room's pieces differ)
  for (const t of W10_ROOM_SECTIONS) {
    assert.equal(roomFor(t, 'easy').id, t.id);
    assert.deepEqual(roomFor(t, 'easy').pieces, t.pieces);
  }
});

test('the rooms: none can be walked past, each fits an upright phone, each has a post, none can hurt; Pokey\'s lines are short', () => {
  for (const t of W10_ROOM_SECTIONS) {
    for (const d of ['normal', 'easy'] as const) {
      const st = roomStage(roomFor(t, d), d);
      const b = roomBox(st.room, st.platforms);
      assert.ok(b.x1 - b.x0 <= 720 && b.y1 - b.y0 <= 844 / 0.5, `${t.id}: ${b.x1 - b.x0} x ${b.y1 - b.y0}`);
      assert.ok(st.room.pieces.some((p) => p.kind === 'reset'), `${t.id}: a reset post`);
      assert.ok(!t.sockets.some((s) => s.role === 'enemy') && t.maxPerStage === 1 && !t.mirrorable, t.id);
      assert.ok(!st.platforms.some((p) => p.type === 'fragile'), `${t.id}: nothing crumbles`);
      // (no room can be walked past unsolved: the checker with every piece taken out but the way on fails it)
      const none = roomStage(roomFor(t, d), d, (p) => p.id === st.room.exit || p.kind === 'reset');
      assert.ok(validateStage(none).errors.some((e) => e.startsWith(`room s1-${t.room!.id}:`)), `${t.id} ${d}: walked past`);
    }
  }
  // the walls the hoist and the beam lead up are out of a double jump's reach from the floor; the beam's raised end is a step from it
  assert.ok(HOIST.rise > DOUBLE_RISE + 20 && BEAM.wallUp > DOUBLE_RISE + 20 && BEAM.wallUp - BEAM.rise < DOUBLE_RISE - 20);
  assert.ok(ITEM.stone.weight < KIT.pokeyWeight && 2 * ITEM.stone.weight > KIT.pokeyWeight);
  // the gatehouse: the lever's scaffold is a hop from the crate and the crate a hop from the floor; the plate 160 px short of the door
  assert.ok(GATE.crateUp < 90 && GATE.scafUp - GATE.crateUp < 90 && GATE.door - GATE.plate >= 160);
  for (const l of W10R_NEW_LINES) assert.ok(words(l) < 10, l);
  for (const [a, b] of Object.values(W10R_ROOM_HINTS)) assert.ok(words(a) < 10 && words(b) < 10, `${a} / ${b}`);
});

test('each stage\'s kit holds its own room and no other (10-1 the hoist, 10-3 the beam, 10-7 the gatehouse), once, Easy\'s on Easy', () => {
  const empty = { manifest: { world: 10, name: 'x', moves: [], ground: { y: G, bankH: 90, style: 'log' as const }, pit: 'soft' as const, pitDepth: 110, corridor: { top: 0, bottom: 1000, soft: 0 }, creatures: [], props: [], pairs: [], decor: [], flowers: [], sections: [], handBuilt: [] } };
  for (let s = 1; s <= 9; s++) {
    for (const d of ['normal', 'easy'] as const) {
      const kit = withW10Rooms(withW10Rooms(empty, s, d), s, d);
      const want = W10_ROOM_SECTIONS.filter((x) => W10R_STAGE[x.id] === `10-${s}`).map((x) => roomFor(x, d));
      assert.deepEqual(kit.manifest.sections, want, `10-${s} ${d}`);
      assert.deepEqual(w10RoomsFor(s, d), want);
    }
  }
  assert.deepEqual(Object.values(W10R_STAGE).sort(), ['10-1', '10-3', '10-7']);
  assert.deepEqual(Object.keys(W10_ROOM_REQUIRED).sort(), ['10-1', '10-3', '10-7']);
});

// ───────────────────────────── each room in the real engine ─────────────────────────────

function play(t: SectionTemplate, d: Difficulty, w: number, h: number) {
  setDifficulty(d);
  const st = roomStage(roomFor(t, d), d);
  const sim = new RealPlay('kit', 1);
  sim.bare(st.platforms);
  const e = sim.e;
  const kp = new KitPlay(st.kit!, st.platforms, { world: 10, stage: Number(W10R_STAGE[t.id].split('-')[1]), vines: e.vines, collectibles: e.collectibles });
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
const plat = (st: ReturnType<typeof roomStage>, id: number) => st.platforms.find((p) => p.id === id)!;
/** onto a platform ahead, jumping (and a second flick) as a player would; true once standing on it */
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
/** the wall can't be jumped: three tries at a run from `x0`, and he is still short of `x` */
function cantJump(sim: RealPlay, x0: number, x: number, what: string) {
  walkTo(sim, x0);
  for (let k = 0; k < 3; k++) {
    sim.frame({ right: true, press: true });
    for (let i = 0; i < 8; i++) sim.frame({ right: true, jump: true });
    sim.frame({ right: true, press: true });
    for (let i = 0; i < 20; i++) sim.frame({ right: true, jump: true });
  }
  sim.wait(1);
  assert.ok(sim.p.x < x, `${what} (${sim.p.x.toFixed(0)})`);
}

/** the painted dust puffs the engine is drawing either side of a plate at `x` (the plate puffs from its frame's sides) */
const pressDust = (sim: RealPlay, x: number) => (sim.e as unknown as { particles: Array<{ type: string; x: number }> }).particles.filter((p) => p.type === 'puff' && Math.abs(Math.abs(p.x - x) - 60) < 40).length;

const SCREENS = [['sideways', 844, 390], ['upright', 390, 844]] as const;

for (const d of ['normal', 'easy'] as const) {
  for (const [name, w, h] of SCREENS) {
    test(`the hoist in the real engine (${d}, ${name}): ${d === 'easy' ? 'a stone set in the low basket' : 'the lever, the stone, the throw up into the high basket'}, and up to the wall walk`, () => {
      const { sim, kit, st } = play(hoistRoom, d, w, h);
      const lives = sim.e.lives;
      const hp = sim.p.hp;
      const r = kit.rooms[0];
      const lift = r.lifts[0];
      const wall = plat(st, st.room.beyond.on);
      // the wall walk can't be jumped from the plank in the pit
      cantJump(sim, lift.plat.x + 10, wall.x + 4, 'the wall walk is out of reach');
      walkTo(sim, at(st, 'post') + 40);
      if (d === 'normal') {
        const alcove = r.gates[0];
        assert.equal(alcove.open, false, 'the alcove is shut to start with');
        walkTo(sim, at(st, 'lever') - 30);
        face(sim, 1);
        tap(sim);
        assert.equal(r.levers[0].on, true, 'the lever pulled');
        sim.wait(1);
        assert.equal(alcove.open, true, 'the alcove portcullis is up');
      } else assert.equal(r.gates.length, 0, 'Easy: no alcove');
      walkTo(sim, at(st, 'pile') - 40);
      face(sim, 1);
      tap(sim);
      assert.ok(kit.holding, 'a stone from the rubble');
      // onto the plank, facing the basket (on its near half: a tap reaches the low basket, a flick up lands the stone in the high one)
      walkTo(sim, lift.plat.x + (d === 'easy' ? 20 : 45));
      face(sim, -1);
      const y0 = sim.p.y;
      if (d === 'easy') sim.frame({ punch: true });
      else sim.frame({ press: true });
      sim.wait(3.5);
      assert.ok(!kit.holding, 'the stone is in the basket');
      assert.equal(r.baskets[0].count, 1);
      assert.ok(sim.p.y < y0 - HOIST.rise + 10, `he rode the plank up (${Math.round(y0)} -> ${Math.round(sim.p.y)})`);
      walkTo(sim, wall.x + wall.width / 2);
      assert.ok(Math.abs(sim.p.y - wall.y) < 3, `on the wall walk (${Math.round(sim.p.x)}, ${Math.round(sim.p.y)} vs ${wall.y})`);
      assert.equal(sim.e.lives, lives);
      assert.equal(sim.p.hp, hp);
      setDifficulty('normal');
    });

    test(`the beam in the real engine (${d}, ${name}): one stone tips under him, two hold, up onto the wall`, () => {
      const { sim, kit, st } = play(beamRoom, d, w, h);
      const lives = sim.e.lives;
      const hp = sim.p.hp;
      const r = kit.rooms[0];
      const [near, far] = r.seesaws[0].ends;
      const wall = plat(st, st.room.beyond.on);
      const floorY = near.y;
      assert.ok(far.y < floorY - BEAM.rise + 4, 'at rest the far end stands up');
      walkTo(sim, at(st, 'pile') - 40);
      face(sim, 1);
      tap(sim);
      assert.ok(kit.holding, 'a stone from the rubble');
      walkTo(sim, near.x + 20, 6);
      face(sim, 1);
      tap(sim);
      sim.wait(0.5);
      assert.ok(!kit.holding);
      assert.ok(stepTo(sim, far), 'onto the far end');
      sim.wait(1);
      assert.ok(far.y > floorY - 10, `one stone: the far end went down under him (${far.y}, the floor ${floorY})`);
      const floor = plat(st, st.room.left.on);
      assert.ok(stepTo(sim, floor, -1), 'back to the floor');
      walkTo(sim, at(st, 'pile') - 40);
      face(sim, 1);
      tap(sim);
      assert.ok(kit.holding, 'the second stone');
      sim.wait(1);
      walkTo(sim, near.x + 30, 6);
      face(sim, 1);
      tap(sim);
      sim.wait(0.8);
      assert.ok(!kit.holding);
      walkTo(sim, near.x + near.width - 30, 6);
      sim.wait(0.5);
      assert.ok(stepTo(sim, far), 'onto the far end again');
      sim.wait(1);
      assert.ok(far.y < floorY - BEAM.rise + 4, `two stones: it holds him up (${far.y})`);
      assert.ok(stepTo(sim, wall), `up onto the wall (${sim.p.x.toFixed(0)}, ${sim.p.y.toFixed(0)})`);
      assert.equal(sim.e.lives, lives);
      assert.equal(sim.p.hp, hp);
      setDifficulty('normal');
    });

    test(`the gatehouse in the real engine (${d}, ${name}): ${d === 'easy' ? 'the lever opens it' : 'the lever alone and the stone alone leave it shut; both open it'}, through`, () => {
      const { sim, kit, st } = play(gateRoom, d, w, h);
      const lives = sim.e.lives;
      const hp = sim.p.hp;
      const r = kit.rooms[0];
      const door = r.gates[0];
      const crate = st.platforms.find((p) => p.y === G - GATE.crateUp && p.width === GATE.crateW)!;
      const scaffold = st.platforms.find((p) => p.y === G - GATE.scafUp && p.width === GATE.scafW)!;
      const floor = plat(st, st.room.left.on);
      const floorB = plat(st, st.room.beyond.on);
      assert.equal(door.open, false, 'shut to start with');
      cantJump(sim, at(st, 'door') - 140, door.wall.x, 'the portcullis is shut to him');
      if (d === 'normal') {
        // the stone first: on the plate alone it stays shut
        walkTo(sim, at(st, 'pile') - 40);
        face(sim, 1);
        tap(sim);
        assert.ok(kit.holding, 'a stone from the rubble');
        walkTo(sim, at(st, 'plate') - 40);
        face(sim, 1);
        tap(sim);
        // (pressed, dust breathes out of the frame's sides: the lead's review, so the press reads on a phone)
        let dust = 0;
        for (let i = 0; i < 18; i++) {
          sim.frame();
          dust = Math.max(dust, pressDust(sim, r.plates[0].x));
        }
        sim.wait(0.3);
        assert.ok(!kit.holding);
        assert.equal(r.plates[0].down, true, 'the stone is on the plate');
        assert.ok(dust >= 2, `dust from the plate as it went down (${dust})`);
        assert.equal(door.open, false, 'the plate alone: still shut');
      }
      // up the crates to the lever (from the plate's side: back onto the crate, then on up to the scaffold)
      walkTo(sim, crate.x + crate.width + 60);
      assert.ok(stepTo(sim, crate, -1), 'onto the crate');
      assert.ok(stepTo(sim, scaffold), 'up onto the scaffold');
      walkTo(sim, at(st, 'lever') - 30, 4);
      face(sim, 1);
      tap(sim);
      assert.equal(r.levers[0].on, true, 'the lever pulled');
      sim.wait(1);
      assert.equal(door.open, true, d === 'easy' ? 'Easy: the lever opens it' : 'the stone and the lever: open');
      // down and through
      walkTo(sim, scaffold.x + scaffold.width + 40);
      sim.wait(0.5);
      assert.equal(sim.standingOn, floor.id, 'down on the floor');
      walkTo(sim, at(st, 'door') + 120);
      sim.wait(0.3);
      assert.ok(sim.p.x > at(st, 'door') + 100 && sim.standingOn === floorB.id, `through the portcullis (${sim.p.x.toFixed(0)})`);
      assert.equal(sim.e.lives, lives);
      assert.equal(sim.p.hp, hp);
      setDifficulty('normal');
    });
  }
}
