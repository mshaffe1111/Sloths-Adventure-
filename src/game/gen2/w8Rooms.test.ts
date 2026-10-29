/**
 * World 8's puzzle rooms (gen2/worlds/w8Rooms.ts): the validator (puzzleCheck.ts, through levelCheck) solves each on Normal and Easy and
 * fails it without its key pieces; none can be walked past; each fits an upright phone at half scale; and each is played through in the
 * real engine, upright and sideways, on Normal and Easy, with no heart or life lost:
 *   the pads room   the bark door shut; up the branch steps that show in the lantern's light; a pinecone from the bough down to the
 *                   first glow pad; standing on the second opens the door only while he stands there; a second pinecone, and through
 *                   (Easy: one pad, one pinecone)
 *   the moon room   a glowcap set down on the floor leaves the bud shut (Normal); flicked up onto the stump, its light opens the
 *                   moonflower and the door with it (Easy: set down by the stump is enough)
 */
import '../headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateStage } from '../levelCheck.ts';
import { ITEM, KIT, kitPlatId, roomBox, type Anchor } from '../puzzleKit.ts';
import { KitPlay } from '../puzzlePlay.ts';
import { DOUBLE_RISE } from '../physics.ts';
import { G } from '../protoStage.ts';
import { RealPlay, type Pad } from '../realPlay.ts';
import { setDifficulty, type Difficulty } from '../difficulty.ts';
import type { Platform } from '../types.ts';
import type { SectionTemplate } from './types.ts';
import { M8, roomStage, RUNWAY } from './w8Harness.ts';
import { MOON, moonRoom, moonRoomEasy, PADS, padsRoom, padsRoomEasy, roomFor, W8_REQUIRED, W8_ROOM_SECTIONS, W8R_NEW_LINES, W8R_ROOM_HINTS, W8R_STAGE, withW8Rooms } from './worlds/w8Rooms.ts';

const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
/** each room's key pieces: without them its way on never opens */
const KEY: Record<string, string[]> = { pads: ['source', 'item'], moon: ['source', 'item'] };

test('the rooms: the checker solves each, Normal and Easy; each fails without its key pieces (the pads room without the lantern, or with one pinecone on Normal)', () => {
  for (const t of W8_ROOM_SECTIONS) {
    for (const d of ['normal', 'easy'] as const) {
      const st = roomStage(roomFor(t, d), d);
      assert.deepEqual(validateStage(st).errors, [], `${t.id} ${d}`);
      const bare = roomStage(roomFor(t, d), d, (p) => !KEY[t.room!.id].includes(p.kind));
      assert.ok(validateStage(bare).errors.some((e) => e.startsWith(`room s1-${t.room!.id}:`)), `${t.id} ${d}: solved without its key`);
    }
  }
  for (const d of ['normal', 'easy'] as const) {
    // (no lantern: the branch steps never show, the bough is out of reach)
    const dark = roomStage(roomFor(padsRoom, d), d, (p) => p.kind !== 'glow');
    assert.ok(validateStage(dark).errors.some((e) => e.startsWith('room s1-pads:')), `${d}: solved without the lantern`);
  }
  // (Normal: one pinecone is one pad; he can stand on the other, but the door shuts as he steps off it)
  const one = roomStage(padsRoom, 'normal', (p) => p.id !== 's1-cone2');
  assert.ok(validateStage(one).errors.some((e) => e.startsWith('room s1-pads:')), 'Normal solved with one pinecone');
  // (Easy's rooms are the same sections, their pieces in the same places but the moonflower's stem)
  for (const [n, e] of [[padsRoom, padsRoomEasy], [moonRoom, moonRoomEasy]] as const) {
    assert.equal(e.id, n.id);
    assert.deepEqual(e.pieces, n.pieces);
    assert.deepEqual(e.room!.pieces.map((p) => p.id), n.room!.pieces.map((p) => p.id));
  }
});

test('the rooms: none can be walked past, each fits an upright phone, each has a post, none can hurt; the moonflower out of any light on the floor; Dot\'s lines are short', () => {
  for (const t of W8_ROOM_SECTIONS) {
    const st = roomStage(t, 'normal');
    const b = roomBox(st.room, st.platforms);
    assert.ok(b.x1 - b.x0 <= 390 / 0.5 && b.y1 - b.y0 <= 844 / 0.5, `${t.id}: ${b.x1 - b.x0} x ${b.y1 - b.y0}`);
    assert.ok(st.room.pieces.some((p) => p.kind === 'reset'), `${t.id}: a reset post`);
    assert.ok(!t.sockets.some((s) => s.role === 'enemy') && t.maxPerStage === 1 && !t.mirrorable, t.id);
    assert.ok(!st.platforms.some((p) => p.type === 'fragile'), `${t.id}: nothing crumbles`);
    // the bark door stands on floor B; its trunk is out of a double jump's reach from floor B and from the high bough
    const door = st.platforms.find((p) => p.id === kitPlatId(0, 's1-door', 0))!;
    const wall = st.platforms.find((p) => p.id === kitPlatId(0, 's1-door', 1))!;
    const floorB = st.platforms.find((p) => p.id === st.room.beyond.on)!;
    assert.equal(door.y + door.height, floorB.y, `${t.id}: the door reaches the floor`);
    assert.ok(floorB.y - wall.y > DOUBLE_RISE + 20, `${t.id}: the trunk is ${floorB.y - wall.y} px over floor B`);
    const bough = Math.min(...st.platforms.filter((p) => p.x > RUNWAY && p.y < G - 100 && p.x + p.width < door.x).map((p) => p.y));
    assert.ok(bough - wall.y > DOUBLE_RISE + 20, `${t.id}: the trunk is ${bough - wall.y} px over the bough`);
  }
  // the pads room's bough is out of a double jump from the floor
  assert.ok(PADS.boughUp > DOUBLE_RISE + 20);
  // a pinecone presses a pad; he is one weight
  assert.ok(ITEM.pinecone.weight >= 1);
  // the moon room: no glowcap lying anywhere on the floor reaches the bud (Normal); one on the stump does; Easy's bud hangs in reach of one on the floor
  const st = roomStage(moonRoom, 'normal');
  const moon = st.room.pieces.find((p) => p.kind === 'moonflower') as { at: Anchor; r: number };
  const boughP = st.platforms.find((p) => p.id === moon.at.on)!;
  const bud = { x: boughP.x + moon.at.at * boughP.width, y: boughP.y + (moon.at.dy ?? 0) - 40 };
  const reach = ITEM.mushroom.light!;
  const r = ITEM.mushroom.r;
  const floor = st.platforms.find((p) => p.id === st.room.left.on)!;
  const stump = st.platforms.find((p) => p.x > floor.x && p.y === G - MOON.stumpUp && p.width === MOON.stumpW)!;
  assert.ok(stump, 'the stump');
  const dist = (x: number, y: number) => Math.hypot(x - bud.x, y - r - bud.y);
  for (let x = floor.x; x <= floor.x + floor.width; x += 5) if (x < stump.x || x > stump.x + stump.width) assert.ok(dist(x, G) > reach + 20, `a glowcap on the floor at ${x - floor.x} reaches the bud`);
  assert.ok(dist(stump.x + 40, stump.y) <= reach - 10, `on the stump's near end it reaches the bud (${dist(stump.x + 40, stump.y).toFixed(0)})`);
  const easyBud = { ...bud, y: bud.y + MOON.hangEasy };
  assert.ok(Math.hypot(stump.x - 20 - easyBud.x, G - r - easyBud.y) <= reach - 10, 'Easy: one by the stump reaches the bud hanging lower');
  for (const l of W8R_NEW_LINES) assert.ok(words(l) < 10, l);
  for (const [a, b] of Object.values(W8R_ROOM_HINTS)) assert.ok(words(a) < 10 && words(b) < 10, `${a} / ${b}`);
});

test('each stage\'s kit holds its own room and no other (8-3 the pads, 8-5 the moonflower), once; each required on every roll', () => {
  for (let st = 1; st <= 9; st++) {
    const kit = withW8Rooms(withW8Rooms({ manifest: M8 }, st), st);
    const want = W8_ROOM_SECTIONS.filter((s) => W8R_STAGE[s.id] === `8-${st}`).map((s) => s.id);
    assert.deepEqual(kit.manifest.sections.map((s) => s.id), want, `8-${st}`);
  }
  assert.deepEqual(Object.values(W8R_STAGE).sort(), ['8-3', '8-5']);
  assert.deepEqual(W8_REQUIRED, { '8-3': [{ section: padsRoom.id }], '8-5': [{ section: moonRoom.id }] });
  // (Easy's kit holds Easy's room)
  assert.equal(withW8Rooms({ manifest: M8 }, 3, 'easy').manifest.sections[0], padsRoomEasy);
  assert.equal(withW8Rooms({ manifest: M8 }, 5, 'easy').manifest.sections[0], moonRoomEasy);
});

// ───────────────────────────── each room in the real engine ─────────────────────────────

function play(t: SectionTemplate, d: Difficulty, w: number, h: number) {
  setDifficulty(d);
  const st = roomStage(roomFor(t, d), d);
  const sim = new RealPlay('kit', 1);
  sim.bare(st.platforms);
  const e = sim.e;
  const kp = new KitPlay(st.kit!, st.platforms, { world: 8, stage: 3, vines: e.vines, collectibles: e.collectibles });
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
/** onto a platform ahead (right), jumping (and a second flick) as a player would; true once standing on it (w6Rooms.test.ts) */
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

const SCREENS = [['sideways', 844, 390], ['upright', 390, 844]] as const;

for (const d of ['normal', 'easy'] as const) {
  for (const [name, w, h] of SCREENS) {
    test(`the pads room in the real engine (${d}, ${name}): up the lantern steps, pinecones down to the glow pads, through the bark door`, () => {
      const { sim, kit, st } = play(padsRoom, d, w, h);
      const lives = sim.e.lives;
      const hp = sim.p.hp;
      const r = kit.rooms[0];
      const door = r.gates[0];
      const [padA, padB] = r.plates;
      const steps = r.ledges.map((l) => l.plat);
      const pl = (id: number) => st.platforms.find((p) => p.id === id)!;
      const floor = pl(st.room.left.on);
      const bough = pl((st.room.pieces.find((p) => p.id === 's1-pile') as { at: Anchor }).at.on);
      const floorB = pl(st.room.beyond.on);
      assert.equal(door.open, false, 'the bark door is shut to start with');
      assert.ok(steps.every((p) => p.broken), 'the branch steps are dark from the door');
      // up the branch steps in the lantern's light, onto the bough
      const climb = () => {
        walkTo(sim, floor.x + 40);
        for (const l of [...steps, bough]) {
          for (let i = 0; i < 30 && l.broken; i++) sim.frame();
          assert.ok(!l.broken, 'lit as he nears it');
          assert.ok(stepTo(sim, l), `onto ${l === bough ? 'the bough' : 'a step'} (${sim.p.x.toFixed(0)}, ${sim.p.y.toFixed(0)})`);
        }
      };
      /** a pinecone from the pile, off the bough's end, onto the pad */
      const bring = (padX: number) => {
        climb();
        walkTo(sim, at(st, 'pile') - 40);
        face(sim, 1);
        tap(sim);
        assert.ok(kit.holding, 'a tap by the pile picks a pinecone up');
        // (off the bough's far end, then on to the pad)
        walkTo(sim, bough.x + bough.width + 30);
        sim.wait(0.5);
        walkTo(sim, padX - 40);
        assert.ok(kit.holding && Math.abs(sim.p.y - G) < 2, 'down off the bough, still holding it');
        face(sim, 1);
        tap(sim);
        sim.wait(0.6);
        assert.ok(!kit.holding);
      };
      bring(at(st, 'padA'));
      assert.equal(padA.down, true, 'a pinecone on the first pad');
      if (d === 'normal') {
        assert.equal(door.open, false, 'one pad glowing: the door stays shut');
        // he stands on the second: it opens; he steps off it: it shuts (no latch)
        walkTo(sim, at(st, 'padB'), 4);
        sim.wait(0.3);
        assert.equal(door.open, true, 'standing on the second pad: open');
        walkTo(sim, at(st, 'padB') - PADS.padB + PADS.padA - 100);
        sim.wait(0.3);
        assert.equal(door.open, false, 'stepping off it: shut again');
        bring(at(st, 'padB'));
        assert.equal(padB.down, true, 'a pinecone on the second pad');
      }
      sim.wait(0.3);
      assert.equal(door.open, true, d === 'easy' ? 'Easy: one pad glowing opens it' : 'both pads glowing: open');
      // through: up the knot onto floor B, through the door
      walkTo(sim, floor.x + floor.width - 20);
      assert.ok(stepTo(sim, floorB), 'up onto floor B');
      walkTo(sim, at(st, 'door') + 100);
      assert.ok(sim.p.x > at(st, 'door') + 80, `through the bark door (${sim.p.x.toFixed(0)})`);
      assert.equal(sim.e.lives, lives);
      assert.equal(sim.p.hp, hp);
      setDifficulty('normal');
    });

    test(`the moon room in the real engine (${d}, ${name}): a glowcap to the stump, the moonflower opens, through the bark door`, () => {
      const { sim, kit, st } = play(moonRoom, d, w, h);
      const lives = sim.e.lives;
      const hp = sim.p.hp;
      const r = kit.rooms[0];
      const door = r.gates[0];
      const moon = r.moons[0];
      const stump = st.platforms.find((p) => p.x > RUNWAY && p.y === G - MOON.stumpUp && p.width === MOON.stumpW)!;
      const floorB = st.platforms.find((p) => p.id === st.room.beyond.on)!;
      assert.ok(!door.open && !moon.open, 'shut, and the bud shut');
      // walking by the bud with his lantern opens nothing (his lantern is not its light): up on the stump under it
      walkTo(sim, stump.x - 30);
      assert.ok(stepTo(sim, stump), 'up on the stump');
      sim.wait(1);
      assert.ok(!moon.open, 'his lantern does not open it');
      // a glowcap from the patch
      walkTo(sim, at(st, 'patch') - 40);
      face(sim, 1);
      tap(sim);
      assert.ok(kit.holding, 'a glowcap in hand');
      // carrying, he goes no further than the stump's foot; set down there
      walkTo(sim, stump.x + 60);
      assert.ok(sim.p.x < stump.x, `stopped at the stump (${Math.round(sim.p.x - stump.x)})`);
      face(sim, 1);
      tap(sim);
      sim.wait(0.8);
      const it = r.items[0];
      if (d === 'easy') {
        assert.ok(moon.open, 'Easy: set down by the stump, its light reaches the bud hanging low');
      } else {
        assert.ok(!moon.open, 'set down on the floor, its light does not reach the bud');
        // pick it up again and flick it up onto the stump
        sim.stand(it.x - 30, G);
        face(sim, 1);
        tap(sim);
        assert.ok(kit.holding);
        walkTo(sim, stump.x + 60);
        face(sim, 1);
        sim.frame({ press: true });
        sim.wait(1.5);
        assert.ok(it.mode === 'rest' && it.y < G - 60, `up on the stump (${it.mode}, ${Math.round(it.y)})`);
        assert.ok(moon.open, 'its light opens the moonflower');
      }
      sim.wait(0.3);
      assert.equal(door.open, true, 'the moonflower open: the door open');
      // through: over the stump, up the knot onto floor B, through the door
      assert.ok(stepTo(sim, stump), 'up on the stump');
      assert.ok(stepTo(sim, floorB), 'onto floor B');
      walkTo(sim, at(st, 'door') + 100);
      assert.ok(sim.p.x > at(st, 'door') + 80, `through the bark door (${sim.p.x.toFixed(0)})`);
      assert.equal(sim.e.lives, lives);
      assert.equal(sim.p.hp, hp);
      setDifficulty('normal');
    });
  }
}

void KIT;
