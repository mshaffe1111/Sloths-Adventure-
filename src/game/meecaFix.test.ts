/**
 * Meeca's stage (5-M) after Matt's run of 2026-10-31 ("Missing Meeca. Falling thru floor. Repetitive."), in the real engine:
 *   - room 4 (tea): the lift never comes down on her in its well; a double jump out of the well beside the Butler's arch never holds her
 *     in the air on the arch's door (she drops to the floor and stands); Flicker's "His teapot, though... very full" comes within about
 *     20 s however busy she is.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { MeecaBot } from './meecaBot.ts';
import type { MeecaPlay } from './meecaPlay.ts';
import type { KitPlay } from './puzzlePlay.ts';
import { FLICKER_NUDGES, MEECA_SAY } from './meecaLines.ts';
import { CARVED_KEY } from './meecaCarved.ts';
import { meecaGeneratedStage } from './meecaStage.ts';
import { meecaStageConfig } from './extraStages.ts';
import { setDifficulty } from './difficulty.ts';

function sim5(seed = 1, w = 448, h = 998) {
  try {
    localStorage.removeItem('sloth_tips_5-M');
    localStorage.removeItem(CARVED_KEY);
  } catch {
    /* no storage */
  }
  const sim = new RealPlay('5-M', seed);
  sim.e.viewCssW = w;
  sim.e.viewCssH = h;
  sim.e.introT = 99;
  sim.e.applyZoom();
  new MeecaBot(sim).card();
  const mc = (sim.e as unknown as { mc: MeecaPlay }).mc;
  const kit = (sim.e as unknown as { kit: KitPlay }).kit;
  return { sim, mc, kit };
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const teaLift = (kit: KitPlay) => (kit.rooms.find((r) => r.spec.id === 'tea') as any).lifts[0] as { plat: { x: number; y: number; width: number }; baseY: number; level: number; spec: { rise: number } };

for (const seed of [1, 7]) {
  test(`5-M seed ${seed}, room 4: the lift waits up while she is in its well, and comes down once she is out`, () => {
    const { sim, mc, kit } = sim5(seed);
    mc.marked = 4;
    mc.flicker.on = true;
    const l = teaLift(kit);
    // (tipped from the floor: up without her; she drops in; the table is set again and the basket empties)
    l.level = 1;
    l.plat.y = l.baseY - l.spec.rise;
    sim.stand(l.plat.x + 40, l.baseY);
    for (let f = 0; f < 90; f++) {
      sim.frame();
      const over = sim.p.x + 18 > l.plat.x && sim.p.x - 18 < l.plat.x + l.plat.width;
      assert.ok(!(over && sim.p.y > l.plat.y && sim.p.y - 40 < l.plat.y + 20), `frame ${f}: the plank (y ${l.plat.y}) is in her (y ${Math.round(sim.p.y)})`);
    }
    assert.ok(l.level > 0.9, 'still up while she stands under it');
    // out to the left onto the floor: then it comes down
    for (let f = 0; f < 60; f++) sim.frame({ left: true, jump: f < 8, press: f === 0 });
    for (let f = 0; f < 120; f++) sim.frame();
    assert.ok(sim.p.x < l.plat.x, 'she is out of the well');
    assert.ok(l.level < 0.01, `and the lift is back down (level ${l.level.toFixed(2)})`);
    assert.ok(!sim.died, 'no life');
  });
}

test('5-M room 4: a double jump out of the well beside the arch drops her back to the floor (never held on the door, never in the wall)', () => {
  for (const dx of [0, -30, -60]) {
    const { sim, mc, kit } = sim5(1);
    mc.marked = 4;
    const l = teaLift(kit);
    sim.stand(l.plat.x + 40 + dx, l.baseY + 60);
    sim.frame();
    let held = 0;
    for (let f = 0; f < 75; f++) {
      sim.frame({ right: true, jump: f < 8 || (f >= 9 && f < 16), press: f === 0 || f === 9 });
      if (!sim.p.grounded && Math.abs(sim.p.vy) < 100 && f > 20) held++;
    }
    assert.ok(sim.p.grounded, `dx ${dx}: she stands (y ${Math.round(sim.p.y)})`);
    assert.ok(sim.p.y >= l.baseY - 1 && sim.p.y <= l.baseY + 61, `dx ${dx}: on the floor or in the well, not up on the door (y ${Math.round(sim.p.y)})`);
    assert.ok(held < 6, `dx ${dx}: not held in the air (${held} frames)`);
    assert.ok(!sim.died, 'no life');
  }
});

test("5-M room 4: Flicker's teapot nudge comes within about 20 s of coming in, however busy she is", () => {
  const { sim, mc, kit } = sim5(1);
  mc.marked = 4;
  mc.flicker.on = true;
  mc.flicker.show = 1;
  const r = kit.rooms.find((q) => q.spec.id === 'tea')!;
  sim.stand(r.resets[0].x + 40, r.resets[0].y);
  // (every frame something new: the way every cup, tip and reset reset his clock)
  let n = 0;
  (kit as unknown as { progressKey: (k: number) => string }).progressKey = () => String(n++);
  const want = FLICKER_NUDGES.tea[0];
  let at = -1;
  for (let f = 0; f < 30 * 26 && at < 0; f++) {
    sim.frame({ right: f % 60 < 30, left: f % 60 >= 30 });
    if (mc.bubble?.text === want) at = f / 30;
  }
  assert.ok(at > 0 && at <= 23, `the nudge came at ${at.toFixed(1)} s`);
});

test("5-M room 5: the step she leaps to is lit when she lands, with Flicker's light trailing behind her", () => {
  for (const seed of [1, 7, 12]) {
    const { sim, mc, kit } = sim5(seed);
    mc.marked = 5;
    mc.flicker.on = true;
    mc.flicker.show = 1;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = kit.rooms.find((q) => q.spec.id === 'look') as any;
    // (his light hangs back behind her, the way it trails her when she is quick: QA's bots jumped on as soon as they landed)
    mc.flickerAt = () => ({ x: sim.p.x - 200, y: sim.p.y - 110 });
    const steps = r.ledges.map((l: { plat: { x: number; y: number; width: number } }) => l.plat).sort((a: { x: number }, b: { x: number }) => a.x - b.x);
    for (let i = 0; i + 1 < steps.length; i++) {
      const a = steps[i], b = steps[i + 1];
      sim.stand(a.x + a.width - 22, a.y);
      for (const l of r.ledges) if (l.plat === a) {
        l.lit = true;
        l.plat.broken = false;
      }
      let landed = false;
      for (let f = 0; f < 60 && !landed; f++) {
        sim.frame({ right: f < 30, jump: f < 10, press: f === 0 });
        if (f > 3 && sim.p.grounded) landed = Math.abs(sim.p.y - b.y) < 2 && sim.p.x > b.x - 10;
        if (f > 3 && sim.p.grounded && !landed) break;
      }
      assert.ok(landed, `seed ${seed}: step ${i + 1} -> ${i + 2}: she landed at ${Math.round(sim.p.x)},${Math.round(sim.p.y)} (step at ${b.x}..${b.x + b.width}, y ${b.y})`);
    }
  }
});

test('5-M log crossings: no two in a play look alike, every hop is a short one onto a wide log, and the high-way line comes at the top', () => {
  for (let seed = 1; seed <= 40; seed++) {
    const g = meecaGeneratedStage(meecaStageConfig(), seed);
    const st = g.proto.meeca!;
    const byId = new Map(g.platforms.map((p) => [p.id, p]));
    const shapes: string[] = [];
    for (const tr of st.trails) {
      for (const sec of tr.sections) {
        if (sec.kind !== 'logs') continue;
        const plats = tr.steps.filter((s) => s.kind === 'plat').map((s) => byId.get((s as { id: number }).id)!).filter((p) => p.x >= sec.x0 && p.x < sec.x1);
        const logs = plats.filter((p) => p.style === 'log');
        shapes.push(sec.shape ?? '?');
        for (let i = 1; i < plats.length; i++) {
          const a = plats[i - 1], b = plats[i];
          const gap = b.x - (a.x + a.width);
          if (gap <= 0) continue;
          assert.ok(gap <= 85, `seed ${seed} at ${b.x}: a ${gap} px hop`);
          assert.ok(a.y - b.y <= 30, `seed ${seed} at ${b.x}: ${a.y - b.y} px up`);
        }
        for (const l of logs) assert.ok(l.width >= 140, `seed ${seed}: a ${l.width} px log`);
      }
    }
    for (let i = 1; i < shapes.length; i++) assert.notEqual(shapes[i], shapes[i - 1], `seed ${seed}: two ${shapes[i]} crossings running (${shapes.join(' ')})`);
    // ("Too far to jump. The high way, then." as she comes onto the bank, before the stairs: QA saw it only once she was down them)
    const first = st.trails[0].sections[0];
    assert.ok(st.highX <= first.x0 + 40, `seed ${seed}: the high-way line at ${st.highX}, the bank at ${first.x0}`);
  }
});

test("5-M before room 1: at the foot of the high wall she says there is a way up in here (the logs over the way in are not it)", () => {
  for (const [w, h] of [[448, 998], [844, 390]] as const) {
    const { sim, mc } = sim5(1, w, h);
    mc.marked = 1;
    mc.flicker.on = true;
    sim.stand(mc.st.wallX - 150, 650);
    let heard = false;
    // (after the room's own line, "Too high. A chair!...", which comes first)
    for (let f = 0; f < 30 * 14 && !heard; f++) {
      sim.frame({ right: f < 30 * 2 });
      heard = mc.thought?.text === MEECA_SAY.wall.text;
    }
    assert.ok(heard, `${w}x${h}: she said it (at ${Math.round(sim.p.x)}, the wall at ${mc.st.wallX})`);
  }
});

test('5-M: the opening card goes with one tap, even a tap made while it settles', () => {
  try {
    localStorage.removeItem('sloth_tips_5-M');
  } catch {
    /* no storage */
  }
  const sim = new RealPlay('5-M', 1);
  sim.e.viewCssW = 448;
  sim.e.viewCssH = 998;
  sim.e.introT = 99;
  sim.e.applyZoom();
  const mc = (sim.e as unknown as { mc: MeecaPlay }).mc;
  for (let f = 0; f < 12; f++) sim.frame();
  assert.equal(mc.phase, 'card');
  // (one tap, 0.4 s in: inside the card's first moment)
  sim.frame({ press: true });
  for (let f = 0; f < 30 * 3 && mc.phase === 'card'; f++) sim.frame();
  assert.equal(mc.phase, 'play', 'one tap was enough');
});

test("5-M room 3: the knot is clear of the HUD's sign on a phone held sideways (and upright)", () => {
  for (const [w, h] of [[844, 390], [740, 360], [448, 998]] as const) {
    const { sim, mc, kit } = sim5(1, w, h);
    mc.marked = 3;
    mc.flicker.on = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const r = kit.rooms.find((q) => q.spec.id === 'silk') as any;
    sim.stand(r.resets[0].x + 40, r.resets[0].y);
    for (let f = 0; f < 30 * 6; f++) sim.frame({ right: f < 30 * 4 });
    const k = r.knots[0];
    const z = (sim.e as unknown as { zoom: number }).zoom;
    const top = (k.y - 44 - sim.e.camera.y) * z;
    // (the HUD's band: 96 css px upright, 66 on a short sideways screen, 84 otherwise: engine.ts renderMeecaScreen)
    const band = h > w ? 96 : h <= 430 ? 66 : 84;
    assert.ok(top >= band, `${w}x${h}: the knot's top at ${top.toFixed(0)} css px, the HUD down to ${band}`);
  }
});

test('5-M room 1: one short steer whose touch flickers does not pop her out of the chair; four real wiggles do', () => {
  const { sim, mc, kit } = sim5(1);
  mc.marked = 1;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const r = kit.rooms.find((q) => q.spec.id === 'sit') as any;
  const c = r.chairs[0];
  sim.stand(c.x - 120, c.y);
  for (let f = 0; f < 90 && c.state === 'empty'; f++) sim.frame({ right: Math.abs(sim.p.x - c.x) > 6, jump: f >= 8 && f < 16, press: f === 8 });
  for (let f = 0; f < 40; f++) sim.frame();
  assert.equal(c.state, 'held', 'sat and held');
  // (about 270 ms of steering right, the touch dropping out of the steer three times on the way)
  for (const on of [1, 1, 0, 1, 0, 1, 0, 1]) sim.frame({ right: !!on });
  for (let f = 0; f < 10; f++) sim.frame();
  assert.equal(c.state, 'held', `one short steer: still held (${c.wig} wiggles counted)`);
  for (const d of ['left', 'right', 'left', 'right']) {
    for (let f = 0; f < 4; f++) sim.frame({ [d]: true });
    for (let f = 0; f < 6; f++) sim.frame();
  }
  assert.notEqual(c.state, 'held', 'four wiggles: free');
});

test('5-M on Easy: no hearts by the flags (nothing hurts her, so a heart there was never picked up)', () => {
  setDifficulty('easy');
  try {
    for (const seed of [1, 7]) {
      const sim = new RealPlay('5-M', seed);
      const hearts = (sim.e as unknown as { collectibles: Array<{ type: string }> }).collectibles.filter((c) => c.type === 'heart' || c.type === 'super_heart');
      assert.equal(hearts.length, 0, `seed ${seed}: ${hearts.length} hearts`);
    }
  } finally {
    setDifficulty('normal');
  }
});
