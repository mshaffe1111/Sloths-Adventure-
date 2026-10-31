/**
 * World 9's three puzzle rooms (gen2/worlds/w9Rooms.ts): the validator (puzzleCheck.ts, through levelCheck) solves each on Normal and Easy
 * and fails it without its key piece; none can be walked past; each fits an upright phone at half scale; Dot's lines are short and her
 * entry line never names a piece; and each is played through in the real engine, upright and sideways, on Normal and Easy, with no
 * heart or life lost:
 *   the bucket room  a stone carried onto the plank, flicked up into the high bucket (Easy: set down in the low one), and the plank
 *                    rises with him to the ledge
 *   the plates room  a stone flicked up onto the shelf's plate; Normal's gate stays sealed until he stands on the other, then stays open
 *   the lift room    Normal: standing on the plate opens the high gate, but stepping off shuts it; a stone holds it; the plank by the
 *                    lever rides up; through. Easy: once pressed, the gate stays open.
 */
import '../headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateStage } from '../levelCheck.ts';
import { KIT, roomBox, type Anchor } from '../puzzleKit.ts';
import { KitPlay } from '../puzzlePlay.ts';
import { DOUBLE_RISE } from '../physics.ts';
import { G } from '../protoStage.ts';
import { RealPlay, type Pad } from '../realPlay.ts';
import { setDifficulty, type Difficulty } from '../difficulty.ts';
import type { Platform } from '../types.ts';
import type { SectionTemplate } from './types.ts';
import { generateAllLevels } from '../worldsData.ts';
import { buildGen2Stage } from './pipeline.ts';
import { w9Finish } from './worlds/w9.ts';
import { w9GameKit } from './worlds/w9Game.ts';
import { roomStage9, RUNWAY } from './w9SwingHarness.ts';
import { BUCKET, bucketRoom, LIFT, liftRoom, PLATES, platesRoom, roomFor9, W9_ROOM_SECTIONS, W9R_NEW_LINES, W9R_STAGE, W9R_TIERS, w9RoomsFor } from './worlds/w9Rooms.ts';

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;

/** each room's key pieces: without them its way on never opens (Easy's lift room: the plate, which he can press himself) */
const KEY: Record<string, string[]> = { bucket: ['source', 'item'], plates: ['source', 'item'], lift: ['source', 'item'] };

test('the rooms: the checker solves each, Normal and Easy; each fails without its key piece', () => {
  for (const t of W9_ROOM_SECTIONS) {
    for (const d of ['normal', 'easy'] as const) {
      const st = roomStage9(roomFor9(t, d), d);
      assert.deepEqual(validateStage(st).errors, [], `${t.id} ${d}`);
      const keyless = (p: { kind: string }) => !(d === 'easy' && t === liftRoom ? ['plate'] : KEY[t.room!.id]).includes(p.kind);
      const bare = roomStage9(roomFor9(t, d), d, keyless);
      assert.ok(validateStage(bare).errors.some((e) => e.startsWith(`room s1-${t.room!.id}:`)), `${t.id} ${d}: solved without its key`);
    }
  }
  // (Normal's plates gate needs both: the shelf's plate alone never opens it)
  const shelfOnly = roomStage9(platesRoom, 'normal', (p) => p.id !== 's1-plateA');
  assert.ok(validateStage(shelfOnly).errors.length > 0, 'the plates room solved without the floor plate');
  // (the lift room with no lever: the plank never rises)
  const noLever = roomStage9(liftRoom, 'normal', (p) => p.kind !== 'lever');
  assert.ok(validateStage(noLever).errors.some((e) => e.startsWith('room s1-lift:')), 'the lift room solved without its lever');
  // (Easy's room is the same section, its pieces in the same places; only the wires and the bucket differ)
  for (const t of W9_ROOM_SECTIONS) {
    const e = roomFor9(t, 'easy');
    assert.equal(e.id, t.id);
    assert.deepEqual(e.pieces, t.pieces);
  }
});

test("the rooms: none can be walked past, each fits an upright phone, each has a post, none can hurt; Dot's lines are short and the entry names no piece", () => {
  for (const t of W9_ROOM_SECTIONS) {
    const st = roomStage9(t, 'normal');
    const b = roomBox(st.room, st.platforms);
    assert.ok(b.x1 - b.x0 <= 720 && b.y1 - b.y0 <= 844 / 0.5, `${t.id}: ${b.x1 - b.x0} x ${b.y1 - b.y0}`);
    assert.ok(st.room.pieces.some((p) => p.kind === 'reset'), `${t.id}: a reset post`);
    assert.ok(!t.sockets.some((s) => s.role === 'enemy') && t.maxPerStage === 1 && !t.mirrorable, t.id);
    assert.ok(!st.platforms.some((p) => p.type === 'fragile'), `${t.id}: nothing crumbles`);
  }
  // every high ledge and shelf is out of a double jump from the floor
  for (const up of [BUCKET.rise, PLATES.shelfUp, LIFT.rise]) assert.ok(up > DOUBLE_RISE + 20, `${up} px`);
  for (const l of W9R_NEW_LINES) assert.ok(words(l) < 10, l);
  // (the entry line names the problem, never the piece or the move: the lead's rule, Dot is a guide, not a narrator)
  for (const t of Object.values(W9R_TIERS)) assert.ok(!/stone|bucket|plate|lever|plank|flick|throw|shelf/i.test(t.enter), t.enter);
  for (const t of W9_ROOM_SECTIONS) {
    const tips = t.room!.tips as Record<string, string>;
    assert.ok(tips.enter && tips.nudge && tips.move && tips.open, `${t.id}: three tiers and the way-on line`);
  }
});

test("each stage's kit holds its own room and no other (9-3 the bucket, 9-5 the plates, 9-8 the lift), Easy's version on Easy", () => {
  for (let s = 1; s <= 9; s++) {
    const want = W9_ROOM_SECTIONS.filter((x) => W9R_STAGE[x.id] === `9-${s}`).map((x) => x.id);
    assert.deepEqual(w9RoomsFor(s).map((x) => x.id), want, `9-${s}`);
  }
  assert.deepEqual(Object.values(W9R_STAGE).sort(), ['9-3', '9-5', '9-8']);
  assert.deepEqual(w9RoomsFor(3, 'easy')[0].room!.pieces.filter((p) => p.kind === 'basket').map((p) => (p as { mouth: number }).mouth), [BUCKET.mouthLow]);
});

// ───────────────────────────── each room in the real engine ─────────────────────────────

function play(t: SectionTemplate, d: Difficulty, w: number, h: number) {
  setDifficulty(d);
  const st = roomStage9(roomFor9(t, d), d);
  const sim = new RealPlay('kit', 1);
  sim.bare(st.platforms);
  const e = sim.e;
  const kp = new KitPlay(st.kit!, st.platforms, { world: 9, stage: 3, vines: e.vines, collectibles: e.collectibles });
  Object.assign(e, { kit: kp, enemies: [] });
  e.currentStage.kit = st.kit;
  e.viewCssW = w;
  e.viewCssH = h;
  e.introT = 99;
  e.applyZoom();
  sim.safe = false;
  // (on the room's floor, past any knee on the way in)
  const floor = st.platforms.find((p) => p.id === st.room.left.on)!;
  sim.stand(Math.max(RUNWAY - 120, floor.x + 10), floor.y);
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
const at = (st: ReturnType<typeof roomStage9>, id: string) => {
  const pc = st.room.pieces.find((p) => p.id === `s1-${id}`) as { at: Anchor };
  const pl = st.platforms.find((p) => p.id === pc.at.on)!;
  return pl.x + pc.at.at * pl.width + (pc.at.dx ?? 0);
};
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
/** a stone from the pile, in his hands */
const takeStone = (sim: RealPlay, kit: KitPlay, st: ReturnType<typeof roomStage9>) => {
  walkTo(sim, at(st, 'pile') - 40);
  face(sim, 1);
  tap(sim);
  assert.ok(kit.holding, 'a tap by the pile picks a stone up');
};
/** where to stand to flick a thing up onto a spot `up` px over his feet, `dir` ahead (the kit's throw: puzzleKit THROW) */
const flickFrom = (x: number, up: number, dir: 1 | -1) => {
  const vy = 820, g = 1500, hand = 70;
  const tUp = vy / g;
  const peak = (vy * vy) / (2 * g);
  const tDown = Math.sqrt((2 * Math.max(0, peak - (up - hand))) / g);
  return x - dir * (14 + 100 * (tUp + tDown));
};

const SCREENS = [['sideways', 844, 390], ['upright', 390, 844]] as const;

for (const d of ['normal', 'easy'] as const) {
  for (const [name, w, h] of SCREENS) {
    test(`the bucket room in the real engine (${d}, ${name}): a stone in the bucket from the plank, the plank rises with him, onto the ledge`, () => {
      const { sim, kit, st } = play(bucketRoom, d, w, h);
      const lives = sim.e.lives;
      const hp = sim.p.hp;
      const r = kit.rooms[0];
      const plank = r.lifts[0];
      const floor = st.platforms.find((p) => p.id === st.room.left.on)!;
      const top = st.platforms.find((p) => p.id === st.room.beyond.on)!;
      const bx = at(st, 'bucket');
      // the ledge can't be jumped from the plank at rest
      walkTo(sim, plank.plat.x + plank.plat.width - 20);
      for (let k = 0; k < 2; k++) {
        sim.frame({ right: true, press: true });
        for (let i = 0; i < 8; i++) sim.frame({ right: true, jump: true });
        sim.frame({ right: true, press: true });
        for (let i = 0; i < 30; i++) sim.frame({ right: true, jump: true });
      }
      sim.wait(1);
      assert.ok(sim.p.y > top.y + 50, `the ledge is out of reach (${Math.round(sim.p.y)})`);
      if (sim.standingOn !== floor.id && sim.standingOn !== plank.plat.id) assert.ok(stepTo(sim, floor, -1), 'back onto the floor');
      takeStone(sim, kit, st);
      // onto the plank (at the floor's height) with it
      walkTo(sim, d === 'easy' ? plank.plat.x + 20 : flickFrom(bx, BUCKET.mouthHigh, -1), 4);
      assert.equal(sim.standingOn, plank.plat.id, 'on the plank');
      assert.ok(kit.holding);
      face(sim, -1);
      if (d === 'easy') tap(sim);
      else sim.frame({ press: true });
      sim.wait(1.2);
      assert.ok(!kit.holding, 'into the bucket');
      sim.wait(BUCKET.rise / KIT.liftSpeed + 1);
      assert.ok(plank.level > 0.99, `the bucket weighed down: the plank all the way up (${plank.level.toFixed(2)})`);
      assert.ok(Math.abs(sim.p.y - top.y) < 3, `up with the plank (${Math.round(sim.p.y)}, the ledge ${top.y})`);
      walkTo(sim, top.x + top.width / 2);
      assert.equal(sim.standingOn, top.id, 'onto the ledge');
      assert.equal(sim.e.lives, lives);
      assert.equal(sim.p.hp, hp);
      setDifficulty('normal');
    });

    test(`the plates room in the real engine (${d}, ${name}): a stone flicked up onto the shelf's plate, ${d === 'easy' ? 'the gate opens' : 'he stands on the other, the gate stays open'}, through`, () => {
      const { sim, kit, st } = play(platesRoom, d, w, h);
      const lives = sim.e.lives;
      const hp = sim.p.hp;
      const r = kit.rooms[0];
      const gate = r.gates[0];
      const [plateB, plateA] = r.plates;
      const floor = st.platforms.find((p) => p.id === st.room.left.on)!;
      const floorB = st.platforms.find((p) => p.id === st.room.beyond.on)!;
      const shelf = st.platforms.find((p) => p.id === (st.room.pieces.find((q) => q.id === 's1-plateB') as { at: Anchor }).at.on)!;
      assert.equal(gate.open, false, 'sealed to start with');
      // standing on the floor's plate alone does nothing
      walkTo(sim, at(st, 'plateA'), 4);
      sim.wait(0.4);
      assert.equal(gate.open, false, 'one plate: still sealed');
      takeStone(sim, kit, st);
      walkTo(sim, flickFrom(at(st, 'plateB'), PLATES.shelfUp, 1), 4);
      face(sim, 1);
      sim.frame({ press: true });
      sim.wait(1.5);
      assert.ok(!kit.holding);
      assert.equal(plateB.down, true, `the stone on the shelf's plate (${Math.round(r.items[0].x)}, ${Math.round(r.items[0].y)}; the shelf ${shelf.x}..${shelf.x + shelf.width})`);
      if (d === 'normal') {
        assert.equal(gate.open, false, 'one plate: still sealed');
        walkTo(sim, at(st, 'plateA'), 4);
        sim.wait(0.4);
        assert.equal(plateA.down, true);
      }
      assert.equal(gate.open, true, 'open');
      walkTo(sim, floor.x + floor.width - 20);
      assert.ok(stepTo(sim, floorB), 'up onto floor B');
      walkTo(sim, at(st, 'gate') + 100);
      assert.equal(gate.open, true, 'latched: it stays open');
      assert.ok(sim.p.x > at(st, 'gate') + 80, `through the gate (${sim.p.x.toFixed(0)})`);
      assert.equal(sim.e.lives, lives);
      assert.equal(sim.p.hp, hp);
      setDifficulty('normal');
    });

    test(`the lift room in the real engine (${d}, ${name}): ${d === 'easy' ? 'a step on the plate opens the gate for good' : 'a stone holds the plate'}, the lever, the plank up, through`, () => {
      const { sim, kit, st } = play(liftRoom, d, w, h);
      const lives = sim.e.lives;
      const hp = sim.p.hp;
      const r = kit.rooms[0];
      const gate = r.gates[0];
      const plank = r.lifts[0];
      const lever = r.levers[0];
      const top = st.platforms.find((p) => p.id === st.room.beyond.on)!;
      assert.equal(gate.open, false, 'shut to start with');
      // standing on the plate opens it; stepping off shuts it (Easy: it stays open)
      walkTo(sim, at(st, 'plate'), 4);
      sim.wait(0.4);
      assert.equal(gate.open, true, 'on the plate: open');
      walkTo(sim, at(st, 'plate') - 120);
      sim.wait(0.4);
      if (d === 'normal') {
        assert.equal(gate.open, false, 'off the plate: shut again');
        takeStone(sim, kit, st);
        walkTo(sim, at(st, 'plate') - 40);
        face(sim, 1);
        tap(sim);
        sim.wait(0.6);
        assert.ok(!kit.holding);
        assert.equal(r.plates[0].down, true, 'the stone on the plate');
      }
      assert.equal(gate.open, true, d === 'easy' ? 'latched open' : 'the stone holds it open');
      // onto the plank, the lever from there, up
      walkTo(sim, plank.plat.x + 20, 4);
      assert.equal(sim.standingOn, plank.plat.id, 'on the plank');
      face(sim, -1);
      tap(sim);
      assert.equal(lever.on, true, 'the lever pulled');
      sim.wait(LIFT.rise / Math.min(KIT.liftSpeed, KIT.windSpeed) + 1);
      assert.ok(Math.abs(sim.p.y - top.y) < 3, `up with the plank (${Math.round(sim.p.y)}, the ledge ${top.y})`);
      walkTo(sim, at(st, 'gate') + 80);
      assert.ok(sim.p.x > at(st, 'gate') + 60, `through the gate (${sim.p.x.toFixed(0)})`);
      assert.equal(sim.e.lives, lives);
      assert.equal(sim.p.hp, hp);
      setDifficulty('normal');
    });
  }
}

// ───────────────────────────── each room in its stage, on the game's kit ─────────────────────────────

test("9-3, 9-5 and 9-8 on 10 raw rolls each, Normal and Easy, on the game's kit (w9GameKit): the stage's room once, solved, and levelCheck passes", () => {
  const levels = generateAllLevels();
  for (const [id, room] of [['9-3', bucketRoom], ['9-5', platesRoom], ['9-8', liftRoom]] as const) {
    const config = { ...levels.find((l) => l.id === id)!, unlocked: true };
    for (const difficulty of ['normal', 'easy'] as const) {
      for (let seed = 1; seed <= 10; seed++) {
        const st = w9Finish(buildGen2Stage({ config, kit: w9GameKit(Number(id[2]), difficulty), seed, difficulty }));
        const at = `${id} seed ${seed} (${difficulty})`;
        assert.equal(st.gen2.sections.filter((s) => s.template === room.id).length, 1, `${at}: ${room.id} once`);
        assert.equal(st.gen2.sections.filter((s) => s.template.startsWith('w9r-')).length, 1, `${at}: one room`);
        assert.deepEqual(validateStage(st).errors, [], at);
      }
    }
  }
});
