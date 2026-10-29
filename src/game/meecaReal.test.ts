/**
 * Meeca's stage (5-M, "On the March North") in the real engine (realPlay.ts), played by meecaBot.ts with the pad's controls and a
 * finger tracing circles to carve:
 *   - a full playthrough on several rolls, sideways (844 x 390) and upright (390 x 844): the trail mark and all five warnings cut, every
 *     trail walked, the ending, the clear, no heart and no life lost, the carvings kept in her order for 5-6;
 *   - the hard way, room by room: the soft chair holds her and pops her back off (never a way up), the silk line holds her and drops her
 *     (never a way up), manners get her a cup and a sleepy moment and the Butler stays put; none of it costs anything;
 *   - each room's own rules in the engine: the beetle by the door shows what a cake does as she comes in, a pinecone thrown up snaps the
 *     knot and the ladder unrolls, the arch cannot be walked through, tea tipped from the floor sends the lift up without her and the post
 *     sets the table again, the dark steps show only in Flicker's light and the pit under them is soft with a way out;
 *   - the carving: the circle carves only at a trunk, she cannot walk past a trunk she has not marked, and she tiptoes through the camp;
 *   - Easy's sparkle comes for going back and forth, never for a clock; Flicker's hints come only when asked, a step at a time;
 *   - the trails' floor (Matt, 2026-10-28: "you can just run straight across the bottom"): walked, every section stops her; hopped
 *     along without climbing, every section with a trunk stops her; and she has no leaf: a jump held over a gully never glides;
 *   - a full playthrough on Easy (the stage as Easy makes it).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { MeecaBot, floorWalker } from './meecaBot.ts';
import type { MeecaPlay } from './meecaPlay.ts';
import type { KitPlay } from './puzzlePlay.ts';
import { CARVED_KEY, carvingsForPokey } from './meecaCarved.ts';
import { FLICKER_HINTS, MEECA_ENDING_B, MEECA_GOAL, ROOM_LINES } from './meecaLines.ts';
import { GULLY, MEECA_G, TIPTOE } from './meecaStage.ts';
import { setDifficulty } from './difficulty.ts';

function forget() {
  try {
    localStorage.removeItem('sloth_tips_5-M');
    localStorage.removeItem(CARVED_KEY);
  } catch {
    /* no storage */
  }
}
/** the stage on a screen of this size (css px), as the engine fits its view to it */
function onScreen(seed: number, w = 844, h = 390): RealPlay {
  forget();
  const sim = new RealPlay('5-M', seed);
  sim.e.viewCssW = w;
  sim.e.viewCssH = h;
  sim.e.introT = 99;
  sim.e.applyZoom();
  return sim;
}
const parts = (sim: RealPlay) => ({ mc: (sim.e as { mc: MeecaPlay }).mc, kit: (sim.e as { kit: KitPlay }).kit });
const room = (kit: KitPlay, id: string) => kit.rooms.find((r) => r.spec.id === id)!;
/** start a room at its door, the trunks before it marked */
function atRoom(id: string, seed = 1, w = 844, h = 390, back = -30) {
  const sim = onScreen(seed, w, h);
  const bot = new MeecaBot(sim);
  bot.card();
  const { mc, kit } = parts(sim);
  const order = ['sit', 'eat', 'silk', 'tea', 'look'];
  mc.marked = 1 + order.indexOf(id);
  mc.flicker.on = true;
  mc.flicker.show = 1;
  const r = room(kit, id);
  sim.stand(r.resets[0].x - back, r.resets[0].y);
  sim.frame();
  return { sim, bot, mc, kit, r };
}

for (const [name, w, h, seeds] of [['sideways', 844, 390, [1, 38, 75]], ['upright', 390, 844, [1, 112]]] as const) {
  for (const seed of seeds) {
    test(`5-M seed ${seed}, ${name}: a full playthrough: the mark and five warnings cut, every trail walked, the ending and the clear`, () => {
      const sim = onScreen(seed, w, h);
      let won = false;
      sim.e.callbacks.onVictory = () => (won = true);
      const lives = sim.e.lives;
      const hp = sim.p.hp;
      const bot = new MeecaBot(sim);
      bot.play();
      const { mc } = parts(sim);
      assert.equal(mc.phase, 'done', `cleared (${mc.count} cut, phase ${mc.phase}): ${bot.log.map(([a, t]) => `${a}@${t.toFixed(0)}`).join(' ')}`);
      assert.ok(won, 'the engine cleared the stage');
      assert.equal(mc.count, MEECA_GOAL, 'the HUD counted M. 5/5');
      assert.ok(!bot.log.some(([a]) => a.startsWith('stuck')), bot.log.map(([a]) => a).join(', '));
      assert.equal(mc.line, MEECA_ENDING_B.length - 1, 'every line of the ending was shown');
      assert.ok(mc.wrapped, 'the blanket round her');
      assert.equal(sim.e.lives, lives);
      assert.equal(sim.p.hp, hp);
      // the quick bot plays faster than any person (it knows every answer, never misses a jump): two and a half minutes even so
      assert.ok(mc.t >= 150, `${mc.t.toFixed(0)} s`);
      const saved = carvingsForPokey();
      assert.deepEqual(saved.map((c) => c.id), ['sit', 'eat', 'silk', 'tea', 'look']);
      assert.ok(saved.every((c, i) => i === 0 || c.along > saved[i - 1].along));
    });
  }
}

test('5-M the hard way (upright): the chair, the silk line and a polite cup of tea each hold her a moment, cost nothing, and lead nowhere', () => {
  const sim = onScreen(38, 390, 844);
  let won = false;
  sim.e.callbacks.onVictory = () => (won = true);
  const lives = sim.e.lives;
  const bot = new MeecaBot(sim, true);
  bot.play();
  const { mc } = parts(sim);
  assert.ok(won && mc.phase === 'done', bot.log.map(([a]) => a).join(', '));
  for (const k of ['chair', 'silk', 'polite']) assert.ok(bot.log.some(([a]) => a === k), `she met the ${k}`);
  assert.equal(sim.e.lives, lives);
  // her own words for each, the first time
  for (const id of ['kit:sit:chair', 'kit:silk:silk', 'kit:tea:polite']) assert.ok(mc.saidAt.some((s) => s.id === id), id);
});

test('room 1, DON\'T SIT: the soft chair holds her (no jump gets her off it), she wiggles free and is popped back the way she came; the sapling bends her onto the ledge', () => {
  const { sim, bot, kit, r } = atRoom('sit');
  const chair = r.chairs[0];
  const ledge = sim.platforms.find((p) => p.id === r.spec.beyond.on)!;
  bot.walkTo(chair.x - 70);
  sim.frame({ right: true, press: true });
  for (let i = 0; i < 24 && chair.state === 'empty'; i++) sim.frame({ right: true, jump: true });
  assert.notEqual(chair.state, 'empty', 'she sat in it');
  // held: jumps do nothing at all
  const y = sim.p.y;
  for (let k = 0; k < 4; k++) {
    sim.frame({ press: true });
    for (let i = 0; i < 6; i++) sim.frame({ jump: true });
  }
  assert.equal(sim.p.y, y, 'still in the seat');
  assert.equal(kit.hold(), 'chair');
  for (let k = 0; k < 8 && chair.state !== 'pop'; k++) for (let i = 0; i < 3; i++) sim.frame(k % 2 ? { left: true } : { right: true });
  for (let i = 0; i < 30; i++) sim.frame();
  assert.equal(chair.state, 'empty');
  assert.ok(sim.p.grounded && Math.abs(sim.p.y - MEECA_G) < 2 && sim.p.x < chair.x, `back on the floor before it (${sim.p.x.toFixed(0)}, ${sim.p.y.toFixed(0)})`);
  // the sapling: climbed, it bends over and sets her on the ledge
  const sp = r.saplings[0];
  bot.walkTo(sp.x, 4);
  for (let i = 0; i < 30 * 5 && !sp.bent; i++) sim.frame({ up: true });
  sim.frame();
  assert.ok(sp.bent && sim.standingOn === ledge.id, `on the ledge (${sim.standingOn})`);
  assert.ok(sim.vines.find((v) => v.id === sp.spec.vine)!.off, 'a bridge now, not a climb');
});

test("room 2, DON'T EAT: the beetle by the door eats its cake and falls asleep as she comes in; two plates, one Meeca: a cake on the far plate brings the other beetle", () => {
  const { sim, bot, mc, r } = atRoom('eat', 1, 844, 390, 260);
  const dozer = r.beetles[0];
  assert.equal(dozer.st.mode as string, 'idle', 'it dozes until she is near');
  bot.walkTo(dozer.home - 150);
  for (let i = 0; i < 30 * 6 && (dozer.st.mode as string) !== 'sleep'; i++) sim.frame();
  assert.equal(dozer.st.mode as string, 'sleep');
  assert.ok(Math.abs(sim.p.x - dozer.st.x) < 260, 'she was there to see it');
  for (let i = 0; i < 90; i++) sim.frame();
  assert.ok(mc.saidAt.some((s) => s.id === 'kit:eat:slept'), ROOM_LINES.eat.slept);
  // on the near plate alone, the gate stays shut
  const [plateA] = r.plates;
  bot.walkTo(plateA.x, 10);
  for (let i = 0; i < 60; i++) sim.frame();
  assert.equal(r.gates[0].open, false);
  bot.room2();
  assert.ok(r.gates[0].open && r.gates[0].latched);
  assert.ok(bot.log.some(([a]) => a === 'carved eat'));
  assert.equal(r.beetles[1].st.mode, 'sleep', 'asleep on the far plate, where Pokey finds it in 5-6');
});

test('room 3, HANDS OFF THE SILK: the silk line holds her and drops her, never higher than she caught it; a pinecone thrown up snaps the knot and the ladder unrolls', () => {
  const { sim, bot, r } = atRoom('silk');
  const sl = r.silks[0];
  const v = sl.vine!;
  const ladder = r.ladders[0];
  assert.ok(sim.vines.find((q) => q.id === ladder.spec.vine)!.off, 'rolled up: no ladder to climb');
  bot.walkTo(v.x - 20);
  sim.frame({ right: true, press: true });
  let top = Infinity;
  for (let i = 0; i < 20 && sl.state === 'free'; i++) sim.frame({ right: true, jump: true });
  assert.equal(sl.state, 'held', 'caught on it');
  const caughtAt = sim.p.y;
  for (let i = 0; i < 30 * 4 && (sl.state as string) !== 'free'; i++) {
    sim.frame({ up: true });
    top = Math.min(top, sim.p.y);
  }
  assert.ok(top >= caughtAt - 2, `never climbed it (${caughtAt.toFixed(0)} -> ${top.toFixed(0)})`);
  assert.ok(sim.p.grounded && Math.abs(sim.p.y - MEECA_G) < 2, 'dropped back to the floor');
  bot.room3();
  assert.ok(r.knots[0].snapped && ladder.down, 'the knot snapped, the ladder down');
  assert.ok(bot.log.some(([a]) => a === 'ladder') && bot.log.some(([a]) => a === 'carved silk'), 'up the ladder onto the bank, and the warning cut');
});

test('room 4, NO TEA. BE RUDE.: manners get a cup and a sleepy moment, the arch cannot be walked through, tea tipped from the floor sends the lift up alone (the post sets the table again), from the lift it lifts her over', () => {
  const { sim, bot, kit, r } = atRoom('tea');
  const butler = r.gates[0];
  const lift = r.lifts[0];
  const pot = r.teapots[0];
  bot.walkTo(butler.x - 112);
  bot.face(1);
  bot.tap();
  assert.equal(kit.hold(), 'sip', 'his sleepy steam');
  assert.ok(kit.sleepy() > 0.5);
  for (let i = 0; i < 30 * 3; i++) sim.frame({ right: true });
  assert.ok(sim.p.x < butler.wall.x, `the arch is shut to her (${sim.p.x.toFixed(0)})`);
  // tipped from the floor: the lift goes up without her
  bot.walkTo(pot.x - 50);
  bot.face(1);
  bot.tap();
  assert.ok(pot.tipped);
  for (let i = 0; i < 30 * 4; i++) sim.frame();
  assert.ok(lift.level > 0.99 && sim.p.y === MEECA_G, 'up, and she is not on it');
  bot.walkTo(r.resets[0].x + 40);
  bot.face(-1);
  bot.tap();
  for (let i = 0; i < 30 * 4; i++) sim.frame();
  assert.ok(!pot.tipped && lift.level < 0.01, 'the table set again, the lift down');
  assert.equal(pot.spills, 1, 'the stain stays');
  bot.room4();
  assert.ok(sim.p.x > butler.x + 100, 'over the arch and past him');
});

test("room 5, DON'T STOP TO LOOK: the steps show only in Flicker's light; the pit under them is soft, with a way out", () => {
  const { sim, bot, mc, r } = atRoom('look');
  const steps = r.ledges.map((l) => l.plat);
  assert.ok(steps.every((p) => p.broken), 'dark to start with');
  // into the pit on purpose: a soft floor, and a step out
  const pit = sim.platforms.find((p) => p.y === MEECA_G + 150 && p.x < steps[0].x && p.x + p.width > steps[0].x)!;
  sim.stand(pit.x + 160, pit.y);
  for (let i = 0; i < 20; i++) sim.frame();
  assert.equal(sim.e.lives, 3);
  assert.ok(sim.p.grounded && !sim.died, 'landed soft');
  bot.walkTo(pit.x + 30);
  for (let k = 0; k < 3 && sim.p.y > MEECA_G + 1; k++) {
    sim.frame({ left: true, press: true });
    for (let i = 0; i < 20; i++) sim.frame({ left: true, jump: true });
  }
  assert.ok(Math.abs(sim.p.y - MEECA_G) < 2, `hopped out (${sim.p.y})`);
  bot.room5();
  assert.equal(mc.phase, 'done');
});

test('the carving: the circle carves only at a trunk, she cannot walk on past one she has not marked, and through the camp she tiptoes', () => {
  const sim = onScreen(1);
  const bot = new MeecaBot(sim);
  const { mc } = parts(sim);
  bot.card();
  // on tiptoe through the camp
  let fast = 0;
  for (let i = 0; i < 60; i++) {
    sim.frame({ right: true });
    fast = Math.max(fast, Math.abs(sim.p.vx));
  }
  assert.ok(fast <= TIPTOE + 1, `${fast}`);
  // a circle traced in the woods, away from any trunk, carves nothing and the touch controls do not look for one there
  sim.stand(mc.st.trails[0].x0 + 40, MEECA_G);
  for (let i = 0; i < 30; i++) sim.frame({ circle: 0.4 });
  assert.equal(mc.marked, 0);
  assert.equal(mc.carveSpot, false);
  // at the mark it does
  const tr = mc.st.trunks[0];
  sim.stand(tr.standX, tr.standY);
  sim.frame();
  assert.equal(mc.carveSpot, true);
  assert.equal(mc.ringOn, 0, 'the circle and the ghost finger, the first time');
  // walked past unmarked, she stops herself
  sim.stand(tr.x + 60, MEECA_G);
  for (let i = 0; i < 60; i++) sim.frame({ right: true });
  assert.ok(sim.p.x <= tr.x + 121, `${sim.p.x}`);
  bot.carve();
  assert.equal(mc.marked, 1);
  assert.equal(mc.count, 0, 'the trail mark is not one of the five');
  for (let i = 0; i < 40; i++) sim.frame({ right: true });
  assert.ok(sim.p.x > tr.x + 200, 'and on she goes');
});

test("Easy's sparkle comes for going back and forth with nothing changing, not for standing about; Flicker's hints only when asked, a step at a time", () => {
  setDifficulty('easy');
  try {
    const { sim, kit, mc, r } = atRoom('eat');
    const ri = kit.rooms.indexOf(r);
    sim.stand(r.box.x0 + 200, MEECA_G);
    for (let i = 0; i < 30 * 30; i++) sim.frame();
    assert.equal(kit.sparkling(ri), false, 'thirty seconds standing still: no clock');
    for (let k = 0; k < 12; k++) for (let i = 0; i < 12; i++) sim.frame(k % 2 ? { left: true } : { right: true });
    assert.equal(kit.sparkling(ri), true, 'back and forth: the sparkle');
    // hints: the room's two steps, in order, then the last again
    const a = mc.askHint();
    const b = mc.askHint();
    const c = mc.askHint();
    assert.deepEqual([a, b, c], [FLICKER_HINTS.eat[0], FLICKER_HINTS.eat[1], FLICKER_HINTS.eat[1]]);
    assert.equal(mc.bubble?.who, 'flicker');
    assert.equal(mc.hintsAsked, 3);
    assert.equal((sim.e as { buildStats(win: boolean, stars: number): { hints?: number } }).buildStats(true, 3).hints, 3, 'the medal counts them');
  } finally {
    setDifficulty('normal');
  }
});

test("the trails' floor, in the engine: walking along it never gets her through a section, and hopping without climbing never gets her past a trunk", () => {
  for (const seed of [1, 75]) {
    const probe = new RealPlay('5-M', seed);
    const st = parts(probe).mc.st;
    let trunks = 0;
    for (const tr of st.trails) {
      for (const sec of tr.sections) {
        const at = `seed ${seed}: ${tr.name}, ${sec.kind} at ${sec.x0}`;
        assert.equal(floorWalker(new RealPlay('5-M', seed), sec.x0, sec.x1, false).through, false, `${at}: walked straight through`);
        const hop = floorWalker(new RealPlay('5-M', seed), sec.x0, sec.x1, true);
        if (hop.climbs) {
          trunks++;
          assert.equal(hop.through, false, `${at}: got past its trunk without climbing`);
        }
      }
    }
    assert.ok(trunks >= 5, `seed ${seed}: ${trunks} sections with a trunk`);
  }
});

test('she has no leaf: a jump held all the way over a gully never glides; she drops into it, and its stairs lead back', () => {
  const sim = onScreen(1);
  // (a player who has come this far has Pokey's leaf, from 4-1: she still has none)
  (sim.e as unknown as { skills: Set<string> }).skills.add('glide');
  const { mc } = parts(sim);
  mc.phase = 'play';
  mc.marked = mc.st.trunks.length;
  const sec = mc.st.trails.flatMap((t) => t.sections).find((x) => x.kind === 'canopy' || x.kind === 'fallen')!;
  const floor = sim.platforms.find((p) => p.x > sec.x0 && p.x < sec.x1 && p.y === MEECA_G + GULLY)!;
  const lip = sim.platforms.find((p) => Math.abs(p.x + p.width - (floor.x - 168)) < 2 && p.y === MEECA_G)!;
  sim.stand(lip.x + lip.width - 150, MEECA_G);
  for (let i = 0; i < 30 * 3 && !(sim.p.grounded && sim.p.y > MEECA_G + 100); i++) {
    const nearEdge = sim.p.grounded && sim.p.x > lip.x + lip.width - 24;
    sim.frame(nearEdge ? { right: true, press: true } : sim.p.grounded ? { right: true } : { right: true, jump: true });
    assert.equal((sim.e as { glide: { on: boolean } }).glide.on, false, 'the leaf never opens');
  }
  assert.ok(sim.p.grounded && sim.p.y >= MEECA_G + 65, `she came down in the gully (${Math.round(sim.p.x)}, ${Math.round(sim.p.y)})`);
  // the way out is the way she came: left along the floor and up the stairs, a hop each
  for (let i = 0; i < 30 * 12 && !(sim.p.grounded && sim.p.y === MEECA_G); i++) {
    const p = sim.p;
    sim.frame(p.grounded && sim.e.player.vx === 0 && i % 6 === 0 ? { left: true, press: true } : { left: true, jump: !p.grounded });
  }
  assert.ok(sim.p.grounded && sim.p.y === MEECA_G && sim.p.x < floor.x, `back up on the path (${Math.round(sim.p.x)}, ${Math.round(sim.p.y)})`);
  assert.equal(sim.died, false);
});

test('5-M on Easy, upright: a full playthrough (the stage as Easy makes it), no heart and no life lost', () => {
  setDifficulty('easy');
  try {
    const sim = onScreen(2, 390, 844);
    let won = false;
    sim.e.callbacks.onVictory = () => (won = true);
    const lives = sim.e.lives;
    const bot = new MeecaBot(sim);
    bot.play();
    const { mc } = parts(sim);
    assert.ok(won && mc.phase === 'done', bot.log.map(([a, t]) => `${a}@${t.toFixed(0)}`).join(' '));
    assert.ok(!bot.log.some(([a]) => a.startsWith('stuck')), bot.log.map(([a]) => a).join(', '));
    assert.equal(sim.e.lives, lives);
  } finally {
    setDifficulty('normal');
  }
});
