/**
 * Meeca's stage (5-M) in the real engine (realPlay.ts), played by meecaBot.ts with the pad's controls and a thumb held still to carve:
 *   - a full playthrough on four seeds, upright and sideways: all five warnings cut, back in line after each, the blanket scene, the
 *     clear, in about 2.5 to 3 minutes (never under 2);
 *   - the guards' tell is on screen before any catch: a careless player (who ignores the rings) is caught, and every catch comes from
 *     a guard who turned round in full view for the whole tell (at least 0.6 s) and was in full view as he looked; nobody looks back
 *     while he is off screen;
 *   - a catch is gentle: no heart and no life lost, Pell walks her back into line, and what she had cut stays cut;
 *   - the order of her thoughts: each that teaches comes before the thing it teaches is needed;
 *   - in line or crouched in a fern she is never caught.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { MeecaBot } from './meecaBot.ts';
import type { MeecaPlay } from './meecaPlay.ts';
import { TELL } from './meecaStage.ts';
import { MEECA_ENDING, MEECA_GOAL } from './meecaLines.ts';
import { carvingsForPokey, CARVED_KEY } from './meecaCarved.ts';

const DT = 1 / 30;
const SCREENS: Array<[string, number, number]> = [['upright', 390, 844], ['upright small', 320, 782], ['sideways', 844, 390], ['short', 640, 320]];

function forget() {
  try {
    localStorage.removeItem('sloth_tips_5-M');
    localStorage.removeItem(CARVED_KEY);
  } catch {
    /* no storage */
  }
}

/** the stage on a screen of this size (css px), as the engine fits its view to it */
function onScreen(seed: number, w: number, h: number): RealPlay {
  forget();
  const sim = new RealPlay('5-M', seed);
  sim.e.viewCssW = w;
  sim.e.viewCssH = h;
  sim.e.introT = 99;
  sim.e.applyZoom();
  return sim;
}

for (const [name, w, h] of [SCREENS[0], SCREENS[2]]) {
  for (const seed of [1, 38, 75, 112]) {
    test(`5-M seed ${seed}, ${name}: a full playthrough, every warning cut, back in line, the blanket, the clear`, () => {
      const sim = onScreen(seed, w, h);
      let won = false;
      sim.e.callbacks.onVictory = () => (won = true);
      const bot = new MeecaBot(sim);
      const mc = bot.mc;
      const lives = sim.e.lives;
      const hp = sim.p.hp;
      let rejoined = 0;
      let lastDone = 0;
      for (let i = 0; i < 400 * 30 && mc.phase !== 'done'; i++) {
        bot.step();
        if (mc.done > lastDone && mc.done < MEECA_GOAL) lastDone = mc.done;
        if (mc.inLine && rejoined < lastDone) rejoined = lastDone;
      }
      assert.equal(mc.phase, 'done', `cleared (${mc.done} cut, phase ${mc.phase})`);
      assert.ok(won, 'the engine cleared the stage');
      assert.equal(mc.done, MEECA_GOAL);
      assert.equal(rejoined, MEECA_GOAL - 1, 'back in line after every warning before the last');
      assert.equal(mc.line, MEECA_ENDING.length - 1, 'every line of the ending was shown');
      assert.ok(mc.wrapped, 'the blanket round her');
      assert.equal(sim.e.lives, lives);
      assert.equal(sim.p.hp, hp);
      assert.ok(mc.t >= 120, `at least two minutes (${mc.t.toFixed(0)} s)`);
      assert.ok(mc.t <= 260, `not much over three minutes for a careful player (${mc.t.toFixed(0)} s)`);
      // what she carved is saved, in order along the way, for 5-6
      const saved = carvingsForPokey();
      assert.deepEqual(saved.map((c) => c.id), ['sit', 'eat', 'tea', 'silk', 'look']);
      assert.ok(saved.every((c, i) => i === 0 || c.along > saved[i - 1].along));
      assert.equal(saved.filter((c) => c.high).length, 1, 'one cut up on the branch');
    });
  }
}

for (const [name, w, h] of SCREENS) {
  test(`5-M, ${name}: a careless player is caught, and every catch was warned in full view; a catch is gentle`, () => {
    const sim = onScreen(1, w, h);
    const bot = new MeecaBot(sim, true);
    const mc = bot.mc as MeecaPlay;
    const lives = sim.e.lives;
    const hp = sim.p.hp;
    // each frame: which guards were in full view, and what each was doing
    const seen: Array<{ t: number; on: boolean[]; ph: Array<string | null> }> = [];
    let cutAtCatch: number[] = [];
    let n = 0;
    for (let i = 0; i < 400 * 30 && mc.phase !== 'done'; i++) {
      const before = mc.catches.length;
      const cut = mc.cut.slice();
      bot.step();
      seen.push({ t: mc.t, on: mc.guards.map((_, g) => mc.onScreen(g)), ph: mc.guards.map((_, g) => mc.watchOf(g)?.ph ?? null) });
      if (mc.catches.length > before) {
        n++;
        cutAtCatch = cut;
        assert.equal(sim.e.lives, lives, 'no life lost');
        assert.equal(sim.p.hp, hp, 'no heart lost');
        // what she had cut stays cut
        for (let k = 0; k < cut.length; k++) assert.ok(mc.cut[k] >= cut[k] - 1e-9);
      }
      if (n >= 3) break;
    }
    assert.ok(n >= 1, 'caught at least once');
    void cutAtCatch;
    for (const c of mc.catches) {
      assert.ok(c.turnSeen, 'his whole turn was in full view');
      // the turn: TELL seconds, every frame of it in full view
      const turn = seen.filter((f) => f.t > c.turnAt + 0.5 * DT && f.t <= c.turnAt + TELL);
      assert.ok(turn.length >= Math.floor((TELL - 0.1) / DT), `a turn of ${turn.length} frames`);
      assert.ok(turn.every((f) => f.on[c.by]), 'in full view through the tell');
      assert.ok(TELL >= 0.6);
      const at = seen.find((f) => Math.abs(f.t - c.t) < DT / 2);
      assert.ok(at?.on[c.by], 'in full view as he looked');
    }
    // nobody ever started looking while off screen
    for (const l of mc.looks) if (!l.on) assert.ok(!mc.catches.some((c) => Math.abs(c.t - l.t) < DT / 2), 'no catch from off screen');
    // after a catch she is walked back into line
    for (let i = 0; i < 12 * 30 && mc.phase === 'caught'; i++) bot.step();
    assert.equal(mc.phase, 'play');
    assert.ok(mc.inLine, 'back in line');
  });
}

test('5-M: in line, or crouched in a fern, she is never caught', () => {
  const sim = onScreen(1, 844, 390);
  const bot = new MeecaBot(sim);
  const mc = bot.mc;
  // through the opening and into line
  for (let i = 0; i < 40 * 30 && !(mc.everInLine && mc.done >= 1); i++) bot.step();
  // stand in line for a minute of look-backs
  for (let i = 0; i < 60 * 30; i++) sim.frame();
  assert.equal(mc.catches.length, 0);
  assert.ok(mc.looks.length > 0, 'Pell looked back while she was in line');
  // crouched in a fern by a tree, through several look-backs
  const sim2 = onScreen(1, 844, 390);
  const bot2 = new MeecaBot(sim2);
  const mc2 = bot2.mc;
  // (played up to the third tree, halted there, back in line; then into the fern by its stand while both backs are turned)
  for (let i = 0; i < 300 * 30 && !(mc2.done >= 2 && mc2.inLine && !mc2.marching); i++) bot2.step();
  const fern = mc2.st.ferns.find((f) => Math.abs(f.x - mc2.st.trunks[2].standX) < 120)!;
  for (let i = 0; i < 20 * 30 && !(mc2.watchOf(0)?.ph === 'back' && mc2.watchOf(0)!.k > 0.8); i++) sim2.frame();
  mc2.inLine = false;
  sim2.stand(fern.x, fern.y);
  sim2.frame({ down: true });
  assert.ok(mc2.hidden(), 'hidden in the fern');
  const looks = mc2.looks.length;
  const caught = mc2.catches.length;
  for (let i = 0; i < 25 * 30; i++) sim2.frame({ down: true });
  assert.ok(mc2.hidden(), 'still hidden');
  assert.ok(mc2.looks.length > looks, 'they looked back while she hid');
  assert.equal(mc2.catches.length, caught);
});

test('5-M: the order of her thoughts: each that teaches comes before the thing it teaches', () => {
  const sim = onScreen(1, 390, 844);
  const bot = new MeecaBot(sim);
  const mc = bot.mc;
  const firstCut: number[] = [];
  let firstOut = -1, firstClimb = -1, soldierTurn = -1, pellTurn = -1, firstCrouch = -1;
  for (let i = 0; i < 400 * 30 && mc.phase !== 'done'; i++) {
    const cut = mc.cut.slice();
    const wasIn = mc.inLine;
    bot.step();
    mc.cut.forEach((c, k) => {
      if (firstCut[k] === undefined && c > cut[k]) firstCut[k] = mc.t;
    });
    if (wasIn && !mc.inLine && mc.done >= 1 && firstOut < 0) firstOut = mc.t;
    if (sim.p.climbing && firstClimb < 0) firstClimb = mc.t;
    if (sim.p.ducking && mc.done >= 2 && firstCrouch < 0) firstCrouch = mc.t;
    if (mc.watchOf(1)?.ph === 'turn' && soldierTurn < 0) soldierTurn = mc.t;
    if (mc.watchOf(0)?.ph === 'turn' && pellTurn < 0) pellTurn = mc.t;
  }
  const at = (id: string) => mc.saidAt.find((s) => s.id === id)?.t ?? Infinity;
  assert.ok(at('carve') <= firstCut[0], 'the hold, before the first letter');
  assert.ok(at('rejoin') < Infinity, 'her place in line');
  assert.ok(at('ring') < pellTurn, 'the ring, before the first look-back');
  assert.ok(at('slip') <= firstOut, 'slide out, before she first slips out');
  assert.ok(at('two') < soldierTurn, 'two rings, before the soldier first turns');
  assert.ok(at('fern') < firstCut[2] && at('fern') < firstCrouch, 'the fern, before the third tree and before she first hides');
  assert.ok(at('climb') < firstClimb, 'the climb, before she climbs');
  // in the order the stage brings them
  const order = ['carve', 'rejoin', 'ring', 'slip', 'two', 'fern', 'climb', 'last'].map(at);
  for (let i = 1; i < order.length; i++) assert.ok(order[i] > order[i - 1], `thought ${i} after ${i - 1}`);
  // a teaching thought is not taught again on a replay; a story one is
  const again = new RealPlay('5-M', 1);
  const b2 = new MeecaBot(again);
  for (let i = 0; i < 120 * 30 && b2.mc.done < 4; i++) b2.step();
  assert.deepEqual(b2.mc.saidAt.map((s) => s.id).filter((id) => id !== 'last'), []);
});

test('5-M: with no finger down she only moves in line (the column carries her) or when caught (Pell walks her back), never on her own', () => {
  // (QA: twice she kept moving with no finger down for 0.8 s and more, in "Learn: the ring" and "Develop: two rings": the march)
  const sim = onScreen(1, 844, 390);
  const bot = new MeecaBot(sim);
  const mc = bot.mc;
  let tries = 0, outOfLine = 0;
  for (let i = 0; i < 300 * 30 && mc.phase !== 'done' && tries < 30; i++) {
    bot.step();
    if (i % 60 !== 59 || mc.phase !== 'play') continue;
    tries++;
    // out of line first (a slide back, or a hop forward), then every finger off the glass for 1.5 s
    if (mc.inLine) for (let k = 0; k < 10; k++) sim.frame(tries % 2 ? { left: true } : { right: true, press: k === 0, jump: k < 6 });
    let lastX = sim.p.x;
    for (let k = 0; k < 45; k++) {
      sim.frame({});
      const dx = Math.abs(sim.p.x - lastX);
      lastX = sim.p.x;
      // (after 0.8 s: a hop has landed and a run has braked)
      if (k < 24 || mc.inLine || mc.phase !== 'play') continue;
      outOfLine++;
      assert.ok(dx < 0.5, `out of line with no finger down she moved ${dx.toFixed(1)} px in a frame at ${mc.t.toFixed(1)} s`);
    }
  }
  assert.ok(outOfLine > 100, `only ${outOfLine} frames out of line were watched`);
});
