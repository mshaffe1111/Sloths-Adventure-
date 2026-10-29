/**
 * Meeca's stage (5-M), the QA batch of 2026-10-29, each finding proven in the real engine (realPlay.ts), upright and sideways:
 *   1. Flicker nudges a stuck player in every room (about 20 s with nothing new done, then a stronger one about 40 s), and at a trunk she
 *      is not carving; anything new done starts the clock again;
 *   2. room 2 upright: her, both plates and the gate on one screen; a pressed plate shows pressed, the gate's opening flashes;
 *   3. picking up is taught on room 1's ledge (a practice pinecone and her line) before room 2 needs it; the tap is generous (further,
 *      and behind her); her hands full and her stood still, the hold line comes again;
 *   4. the carving spot is the whole trunk and a step either side; the ring shows at every trunk; a finger held still brings Flicker's
 *      "draw circles";
 *   5. the HUD names what it counts ("Warnings 1/5");
 *   6. a landmark at the start of every trail section, never the same twice running; Flicker part-way along two trails;
 *   7. a soft chair keeps "Wiggle, wiggle!" up while it holds her; a thumb held one way, taps, or nothing at all still get her free;
 *   8. every trail ledge is within her real reach: the second-jump banks with a 70% hold and a second flick anywhere in a 0.33 s window, up past the top
 *      of the first jump, Normal and Easy;
 *   9. a plain walk pushed into a one-hop step brings her line on the hop;
 *  10. shaken off the silk line, a sloppy slide walking on never catches her on it again at once;
 *  and the knot: a pinecone thrown up anywhere near it, either way she faces, snaps it.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { MeecaBot } from './meecaBot.ts';
import type { MeecaPlay } from './meecaPlay.ts';
import { NUDGE_S, STEP_PUSH_S } from './meecaPlay.ts';
import type { KitPlay } from './puzzlePlay.ts';
import { KNOT_AIM } from './puzzlePlay.ts';
import { CARVED_KEY } from './meecaCarved.ts';
import { FLICKER_NUDGES, MEECA_SAY, ROOM_LINES, wordsIn } from './meecaLines.ts';
import { buildMeecaStage, LANDMARKS, MEECA_G, PRACTICE_ID } from './meecaStage.ts';
import { CHAIR, KIT } from './puzzleKit.ts';
import { setDifficulty } from './difficulty.ts';
import { goalInfo } from '../components/hud/goalInfo.ts';
import { centreGeo, counterW } from '../components/hud/hudLayout.ts';
import { meecaStageConfig } from './extraStages.ts';
import type { Platform } from './types.ts';

function forget() {
  try {
    localStorage.removeItem('sloth_tips_5-M');
    localStorage.removeItem(CARVED_KEY);
  } catch {
    /* no storage */
  }
}
function onScreen(seed: number, w = 844, h = 390): RealPlay {
  forget();
  const sim = new RealPlay('5-M', seed);
  sim.e.viewCssW = w;
  sim.e.viewCssH = h;
  (sim.e as unknown as { introT: number }).introT = 99;
  (sim.e as unknown as { applyZoom(): void }).applyZoom();
  return sim;
}
const parts = (sim: RealPlay) => ({ mc: (sim.e as { mc: MeecaPlay }).mc, kit: (sim.e as { kit: KitPlay }).kit });
const ORDER = ['sit', 'eat', 'silk', 'tea', 'look'];
function atRoom(id: string, seed = 1, w = 844, h = 390, back = -30) {
  const sim = onScreen(seed, w, h);
  const bot = new MeecaBot(sim);
  bot.card();
  const { mc, kit } = parts(sim);
  mc.marked = 1 + ORDER.indexOf(id);
  mc.flicker.on = true;
  mc.flicker.show = 1;
  const r = kit.rooms.find((q) => q.spec.id === id)!;
  sim.stand(r.resets[0].x - back, r.resets[0].y);
  sim.frame();
  return { sim, bot, mc, kit, r };
}
const said = (mc: MeecaPlay, id: string) => mc.saidAt.some((s) => s.id === id);
const idle = (sim: RealPlay, s: number) => {
  for (let i = 0; i < Math.round(s * 30); i++) sim.frame();
};
/** what the camera shows now (world px) */
const view = (sim: RealPlay) => {
  const c = sim.e.camera;
  return { x0: c.x, x1: c.x + c.viewportWidth, y0: c.y, y1: c.y + c.viewportHeight };
};

test('1. Flicker nudges in every room: ~20 s with nothing new done, then a stronger one at ~40 s; short, his, and never before', () => {
  for (const [name, w, h] of [['sideways', 844, 390], ['upright', 390, 844]] as const) {
    for (const id of ORDER) {
      const { sim, mc, r } = atRoom(id, 1, w, h);
      // (room 2: the dozer by the door eats its cake and falls asleep as she comes in, something new; the clock starts after)
      // (room 5: Flicker's light finds the first step a moment after she stands there, something new too: its clock starts a little late)
      if (id === 'eat') for (let i = 0; i < 30 * 10 && r.beetles[0].st.mode !== 'sleep'; i++) sim.frame();
      const start = mc.t;
      const shown = new Set<string>();
      for (let i = 0; i < 30 * 46; i++) {
        sim.frame();
        if (mc.bubble?.who === 'flicker') shown.add(mc.bubble.text);
      }
      const at = (n: number) => (mc.saidAt.find((s) => s.id === `nudge:${id}:${n}`)?.t ?? Infinity) - start;
      assert.ok(at(0) >= NUDGE_S[0] - 0.5 && at(0) <= NUDGE_S[0] + 3, `${name} ${id}: the first nudge at ${at(0).toFixed(1)} s`);
      assert.ok(at(1) >= NUDGE_S[1] - 0.5 && at(1) <= NUDGE_S[1] + 3, `${name} ${id}: the second nudge at ${at(1).toFixed(1)} s`);
      assert.ok(shown.has(FLICKER_NUDGES[id][0]) && shown.has(FLICKER_NUDGES[id][1]), `${name} ${id}: both in Flicker's bubble`);
      assert.equal(sim.e.lives, 3);
    }
  }
  for (const [k, lines] of Object.entries(FLICKER_NUDGES)) {
    assert.equal(lines.length, 2, k);
    for (const l of lines) assert.ok(wordsIn(l) < 10, l);
  }
});

test('1. something new done starts the nudge clock again; a trunk not carved gets its own nudge', () => {
  const { sim, bot, mc, r } = atRoom('eat', 1, 390, 844, 260);
  // (the dozer's show as she comes in)
  bot.walkTo(r.beetles[0].home - 150);
  idle(sim, 15);
  // the cake picked up: new
  const src = r.sources[0];
  bot.walkTo(src.x - 44);
  bot.face(1);
  bot.tap();
  assert.ok(parts(sim).kit.holding);
  idle(sim, 15);
  assert.ok(!said(mc, 'nudge:eat:0'), 'not yet: the cake in her hands is new');
  idle(sim, 7);
  assert.ok(said(mc, 'nudge:eat:0'), 'then the nudge');
  // the trail mark, in the prologue: stood at the trunk, not carving
  const s2 = onScreen(1);
  new MeecaBot(s2).card();
  const m2 = parts(s2).mc;
  m2.flicker.on = true;
  m2.flicker.show = 1;
  const tr = m2.st.trunks[0];
  s2.stand(tr.standX, tr.standY);
  idle(s2, NUDGE_S[0] + 1);
  assert.ok(said(m2, 'nudge:carve:mark:0'), 'the carving nudge');
  assert.equal(m2.marked, 0);
});

test('2. room 2 upright: her, both plates and the gate on one screen; a pressed plate shows pressed, and the gate flashes open', () => {
  for (const [w, h] of [[390, 844], [844, 390]] as const) {
    for (const seed of [1, 38, 112]) {
      const { sim, bot, kit, r } = atRoom('eat', seed, w, h, 260);
      const [pa, pb] = r.plates;
      const gate = r.gates[0];
      const fits = (where: string) => {
        const v = view(sim);
        for (const [x0, x1, what] of [[pa.x - pa.w / 2, pa.x + pa.w / 2, 'near plate'], [pb.x - pb.w / 2, pb.x + pb.w / 2, 'far plate'], [gate.x - KIT.gateW / 2, gate.x + KIT.gateW / 2, 'gate']] as const) {
          assert.ok(x0 >= v.x0 - 1 && x1 <= v.x1 + 1, `${w}x${h} seed ${seed}, ${where}: the ${what} (${Math.round(x0)}-${Math.round(x1)}) off the view ${Math.round(v.x0)}-${Math.round(v.x1)}`);
        }
        assert.ok(sim.p.x >= v.x0 && sim.p.x <= v.x1, 'and her');
      };
      // holding the cake by the stool
      bot.walkTo(r.beetles[0].home - 150);
      idle(sim, 4);
      bot.walkTo(r.sources[0].x - 44);
      bot.face(1);
      bot.tap();
      idle(sim, 3);
      fits('holding the cake');
      // the cake on the far plate, the beetle on it; she on the near one
      bot.walkTo(pb.x - 44);
      bot.face(1);
      bot.tap();
      for (let i = 0; i < 30 * 10 && !pb.down; i++) sim.frame();
      assert.ok(pb.down, 'the beetle asleep on the far plate');
      bot.walkTo(pa.x, 8);
      for (let i = 0; i < 30 * 3 && !gate.open; i++) sim.frame();
      assert.ok(gate.open);
      idle(sim, 0.3);
      assert.ok(pa.show > 0.9 && pb.show > 0.9, 'both plates show pressed');
      assert.ok((gate as unknown as { openAt: number }).openAt >= 0, 'the opening flash');
      idle(sim, 2.5);
      fits('on the near plate as the gate opens');
      void kit;
    }
  }
});

test('3. picking up is taught on room 1\'s ledge before room 2: a practice pinecone, her line, a generous tap, and the hold line again', () => {
  for (const diff of ['normal', 'easy'] as const) {
    setDifficulty(diff);
    try {
      const { sim, bot, mc, kit, r } = atRoom('sit');
      const sp = r.saplings[0];
      bot.walkTo(sp.x, 4);
      for (let i = 0; i < 30 * 6 && !sp.bent; i++) sim.frame({ up: true });
      sim.frame();
      const at = kit.restingAt(PRACTICE_ID)!;
      assert.ok(at, 'a pinecone lies up on the ledge');
      for (let i = 0; i < 20; i++) sim.frame();
      assert.ok(said(mc, 'pick'), `${diff}: "${MEECA_SAY.pick.text}" as she lands by it`);
      // a tap a little short of it still picks it up
      bot.walkTo(at.x - 92, 4);
      bot.face(1);
      bot.tap();
      assert.ok(kit.holding, `${diff}: picked up from 92 px`);
      assert.ok(said(mc, 'kit:sit:hold'), ROOM_LINES.sit.hold);
      // set down, then picked up again from just behind her (she turns to it)
      bot.tap();
      idle(sim, 0.6);
      assert.ok(!kit.holding);
      const again = kit.restingAt(PRACTICE_ID)!;
      sim.stand(again.x + 40, again.y);
      sim.frame();
      bot.face(1);
      bot.tap();
      assert.ok(kit.holding, `${diff}: picked up from behind her`);
      assert.equal(sim.p.facing, -1, 'and she turned to it');
      // her hands full, stood still: the hold line again
      const before = mc.saidAt.filter((s) => s.id === 'holdAgain').length;
      idle(sim, 7);
      assert.ok(mc.saidAt.filter((s) => s.id === 'holdAgain').length > before, `${diff}: the hold line again`);
      // (room 2's own: the cake's line, also again)
      assert.ok(ORDER.indexOf('sit') < ORDER.indexOf('eat'));
    } finally {
      setDifficulty('normal');
    }
  }
});

test('4. the carving spot is the whole trunk and a step either side, the ring shows at every trunk, and a still finger brings "draw circles"', () => {
  const sim = onScreen(1, 390, 844);
  const bot = new MeecaBot(sim);
  bot.card();
  const { mc } = parts(sim);
  mc.flicker.on = true;
  mc.flicker.show = 1;
  const tr = mc.st.trunks[0];
  for (const dx of [-tr.w / 2 - 60, -40, 0, 40, tr.w / 2 + 60, 120]) {
    sim.stand(tr.x + dx, tr.standY);
    sim.frame();
    assert.equal(mc.carveSpot, true, `at ${dx} from the trunk's middle`);
    assert.equal(mc.ringOn, 0);
  }
  sim.stand(tr.x - 220, tr.standY);
  sim.frame();
  assert.equal(mc.carveSpot, false, 'well away from it');
  // circles traced at its middle carve
  sim.stand(tr.x, tr.standY);
  for (let i = 0; i < 30 * 8 && mc.marked < 1; i++) sim.frame({ circle: 0.3 });
  assert.equal(mc.marked, 1, 'carved from the middle of the trunk');
  // the next trunk: the ring again (the ghost finger only the first time)
  const t1 = mc.st.trunks[1];
  sim.stand(t1.x, t1.standY);
  sim.frame();
  assert.equal(mc.ringOn, 1, 'the ring at the second trunk too');
  assert.equal(mc.ringFinger, false);
  // a finger held still (the touch controls' hold, a mega: the real input keeps it a few frames, the test pad clears it, so it is set
  // after the pad's update)
  const inp = (sim as unknown as { input: { update(dt: number): void; state: { megaPunchPressed: boolean } } }).input;
  const up = inp.update.bind(inp);
  let once = true;
  inp.update = (dt: number) => {
    up(dt);
    if (once) inp.state.megaPunchPressed = true;
    once = false;
  };
  sim.frame();
  idle(sim, 1.3);
  assert.ok(said(mc, 'carveHold'), MEECA_SAY.carveHold.text);
  assert.equal(mc.bubble?.text, MEECA_SAY.carveHold.text);
});

test('5. the HUD names what it counts: "Warnings 1/5", the plate wide enough for the word', () => {
  const g = goalInfo({ ...meecaStageConfig(), targetCount: 5 });
  assert.equal(g.word, 'Warnings');
  for (const mode of ['port', 'land', 'short'] as const) {
    const c = centreGeo(mode, 390);
    assert.ok(counterW(c, 'count', 5, 'Warnings') > counterW(c, 'count', 5) + c.num * 2, mode);
  }
});

test('6. a landmark at the start of every trail section, never the same twice running; Flicker part-way along two trails', () => {
  const names = new Set<string>();
  for (const seed of [1, 2, 3, 38, 75, 112]) {
    const st = buildMeecaStage(seed);
    const secs = st.trails.flatMap((t) => t.sections);
    assert.equal(st.landmarks.length, secs.length, `seed ${seed}: one a section`);
    st.landmarks.forEach((l, i) => {
      assert.ok(l.x >= secs[i].x0 && l.x < secs[i].x1, `seed ${seed}: in its section`);
      if (i) assert.notEqual(l.n, st.landmarks[i - 1].n, `seed ${seed}: the same twice running at ${i}`);
      names.add(l.n);
    });
    // (a fresh roll deals them differently)
    if (seed > 1) assert.notDeepEqual(st.landmarks.map((l) => l.n), buildMeecaStage(1).landmarks.map((l) => l.n));
  }
  assert.equal(names.size, LANDMARKS.length, 'every piece is used');
  const sim = onScreen(1);
  const bot = new MeecaBot(sim);
  bot.play();
  const { mc } = parts(sim);
  assert.ok(said(mc, 'trailA') && said(mc, 'trailB'), 'Flicker, part-way along');
});

test('7. a soft chair keeps "Wiggle, wiggle!" up while it holds her; a thumb held one way, taps, or nothing at all still get her free', () => {
  const sit = (sim: RealPlay, bot: MeecaBot, chair: { x: number; state: string }) => {
    bot.walkTo(chair.x - 70);
    sim.frame({ right: true, press: true });
    for (let i = 0; i < 24 && chair.state === 'empty'; i++) sim.frame({ right: true, jump: true });
    assert.notEqual(chair.state, 'empty', 'she sat in it');
  };
  // a thumb held right, all the way: once it counts; then she lets go and slides again: wiggles
  {
    const { sim, bot, mc, r } = atRoom('sit', 1, 390, 844);
    const chair = r.chairs[0];
    sit(sim, bot, chair);
    for (let k = 0; k < 8; k++) {
      for (let i = 0; i < 15; i++) sim.frame({ right: true });
      if (chair.state === 'held') {
        assert.equal(mc.thought?.text, ROOM_LINES.sit.chair, `still up at ${k}`);
        assert.equal(mc.wiggling, true);
      }
    }
    for (let i = 0; i < 30 && chair.state !== 'empty'; i++) sim.frame();
    assert.equal(chair.state, 'empty', 'held right all along, she is free within a few seconds');
  }
  // taps only
  {
    const { sim, bot, r } = atRoom('sit');
    const chair = r.chairs[0];
    sit(sim, bot, chair);
    idle(sim, 1);
    for (let k = 0; k < CHAIR.wiggles + 1; k++) {
      sim.frame({ punch: true });
      idle(sim, 0.2);
    }
    for (let i = 0; i < 30 && chair.state !== 'empty'; i++) sim.frame();
    assert.equal(chair.state, 'empty', 'taps wiggle her free');
  }
  // nothing at all: it lets her go
  {
    const { sim, bot, mc, r } = atRoom('sit');
    const chair = r.chairs[0];
    sit(sim, bot, chair);
    for (let i = 0; i < 30 * 5; i++) sim.frame();
    assert.equal(mc.thought?.text, ROOM_LINES.sit.chair, 'the wiggle line still up at 5 s');
    for (let i = 0; i < 30 * (CHAIR.giveUp + 2) && chair.state !== 'empty'; i++) sim.frame();
    assert.equal(chair.state, 'empty', 'let go in the end');
    assert.equal(sim.e.lives, 3);
  }
});

/** a running jump from the bank she stands on at `to`'s face: the first held `h1` frames, the second pressed `f2` frames after it */
function climbBank(sim: RealPlay, to: Platform, h1: number, f2: number, h2: number): boolean {
  let pressed = -1;
  for (let i = 0; i < 30 * 5; i++) {
    const p = sim.p;
    if (sim.standingOn === to.id && p.grounded) return true;
    if (pressed < 0) {
      const ahead = to.x - p.x;
      if (p.grounded && ahead < 40) {
        pressed = i;
        sim.frame({ right: true, press: true });
      } else sim.frame({ right: true });
      continue;
    }
    const k = i - pressed;
    if (k === f2) sim.frame({ right: true, press: true });
    else if (k < h1 || (k > f2 && k < f2 + h2)) sim.frame({ right: true, jump: true });
    else sim.frame({ right: true });
    if (k > 10 && sim.p.grounded && sim.standingOn !== to.id) return false;
  }
  return false;
}

test('8. every second-jump bank is within her real reach: a 70% hold on each jump, the second flick anywhere from 0.1 s to 0.43 s after the first (Easy 0.5 s)', () => {
  let banks = 0;
  for (const diff of ['normal', 'easy'] as const) {
    setDifficulty(diff);
    try {
      for (const seed of [1, 2, 3, 38, 75, 112]) {
        const st = buildMeecaStage(seed);
        for (const tr of st.trails) {
          for (const sec of tr.sections) {
            if (sec.kind !== 'double') continue;
            for (const f2 of diff === 'easy' ? [3, 5, 7, 9, 11, 13, 15] : [3, 5, 7, 9, 11, 13]) {
              const sim = new RealPlay('5-M', seed);
              const { mc } = parts(sim);
              mc.phase = 'play';
              mc.marked = mc.st.trunks.length;
              const bank = sim.platforms.find((p) => p.x > sec.x0 && p.x < sec.x1 && p.y < MEECA_G - 100 && p.style !== 'branch' && p.style !== 'log')!;
              sim.stand(bank.x - 150, MEECA_G);
              sim.frame();
              assert.ok(climbBank(sim, bank, 9, f2, 9), `${diff} seed ${seed}: the bank ${MEECA_G - bank.y} px up at ${bank.x}, second flick ${f2} frames on: dropped back`);
              banks++;
            }
          }
        }
      }
    } finally {
      setDifficulty('normal');
    }
  }
  assert.ok(banks > 20, `${banks} tries`);
  // and every other step along a trail is one jump: never more than 75 px over the one before (her one jump: 98)
  for (const seed of [1, 2, 3, 38, 75, 112]) {
    const sim = new RealPlay('5-M', seed);
    const st = parts(sim).mc.st;
    for (const tr of st.trails) {
      let prev: Platform | null = null;
      for (const s of tr.steps) {
        if (s.kind === 'climb') {
          prev = null;
          continue;
        }
        const pl = sim.platforms.find((q) => q.id === s.id)!;
        const sec = tr.sections.find((q) => pl.x >= q.x0 && pl.x < q.x1);
        if (prev && sec?.kind !== 'double') assert.ok(prev.y - pl.y <= 80, `seed ${seed}: ${tr.name}: a step ${prev.y - pl.y} px up at ${pl.x}`);
        prev = pl;
      }
    }
  }
});

test('9. a plain walk pushed into a one-hop step brings her line on the hop', () => {
  const sim = onScreen(1, 390, 844);
  new MeecaBot(sim).card();
  const { mc } = parts(sim);
  mc.marked = mc.st.trunks.length;
  // a stump or the gully's stairs: a face one hop tall, from the path
  const sec = mc.st.trails.flatMap((t) => t.sections).find((s) => s.kind === 'hollow' || s.kind === 'fallen')!;
  const face = sim.platforms.find((p) => p.x > sec.x0 && p.x < sec.x1 && p.y < MEECA_G - 40 && p.y > MEECA_G - 90 && p.height >= 50)!;
  sim.stand(face.x - 60, MEECA_G);
  for (let i = 0; i < Math.round((STEP_PUSH_S + 0.8) * 30); i++) sim.frame({ right: true });
  assert.ok(sim.p.x < face.x, 'the walk stopped at it');
  assert.ok(said(mc, 'stepHop'), MEECA_SAY.stepHop.text);
});

test('10. shaken off the silk line, a sloppy slide walking on (a little up in it) never catches her on it again at once', () => {
  for (const [w, h] of [[844, 390], [390, 844]] as const) {
    const { sim, bot, r } = atRoom('silk', 1, w, h);
    const sl = r.silks[0];
    const v = sl.vine!;
    bot.walkTo(v.x - 20);
    sim.frame({ right: true, press: true });
    for (let i = 0; i < 20 && sl.state === 'free'; i++) sim.frame({ right: true, jump: true });
    assert.equal(sl.state, 'held');
    for (let i = 0; i < 30 * 4 && (sl.state as string) !== 'free'; i++) sim.frame();
    let caught = 0;
    for (let i = 0; i < 30 * 3; i++) {
      sim.frame({ right: true, up: true });
      if (sl.state === 'held') caught++;
    }
    assert.equal(caught, 0, 'not caught again');
    assert.ok(sim.p.x > v.x + 80, `walked on past it (${Math.round(sim.p.x - v.x)})`);
  }
});

test('the knot: a pinecone thrown up anywhere near it snaps it, either way she faces', () => {
  const { sim: s0, r: r0 } = atRoom('silk');
  const knot0 = r0.knots[0];
  void s0;
  for (const face of [1, -1] as const) {
    for (let dx = -KNOT_AIM + 10; dx <= 0; dx += 20) {
      const { sim, bot, kit, r } = atRoom('silk');
      const src = r.sources[0];
      bot.walkTo(src.x - 44);
      bot.face(1);
      bot.tap();
      assert.ok(kit.holding);
      bot.walkTo(knot0.x + dx, 3);
      bot.face(face);
      sim.frame({ press: true });
      for (let i = 0; i < 45 && !r.knots[0].snapped; i++) sim.frame();
      assert.ok(r.knots[0].snapped, `thrown up from ${dx}, facing ${face}`);
    }
  }
});
