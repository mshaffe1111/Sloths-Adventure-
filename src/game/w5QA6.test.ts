/**
 * World 5, QA 6 (the upright gate on v200, 2026-10-26: "the Matt bot", an expert at 320 x 782 upright, one thumb):
 *
 *   1. 5-4 at about 25%: swinging back on a long silk line, Pokey went out past the left edge of the view (the eased camera trails a
 *      quick swing; engine.ts updateCamera, cameraFollow.ts keepHeroX), and the bot could not find him to go on.
 *   2. 5-3's first orchid: Dot's "Quick!" came while he was stuck in the silk behind its stump. It stands on clear grass now, a plain
 *      hop up from the path, with a long beat, and no silk creeps along its stretch; the cups give up their petals to a hop that lands
 *      anywhere in them; the first steps and the first row keep a longer beat, and a row's blooms open in turn about as fast as a run.
 *   3. One-step ledges: a flick with the thumb still steering was eaten (touchGestures.ts): one thumb that had drifted down the glass
 *      as it steered, a second thumb put down close beside the steering one, and a flick well over to the side with nothing to kick.
 *   4. Dot's bubble on Pokey (dotGuidePerch.ts placeBubble): a spot far from her cost more than a corner of him.
 *   5. The Seamstress did not read: knitting on her web disc she was "a webbed chair and a lace cloth".
 *   7. 5-M's words were only on the canvas (meecaPlay.ts screenWords, MeecaWords.tsx).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { G } from './protoStage.ts';
import { HERO_KEEP, keepHeroX } from './cameraFollow.ts';
import { TouchGestures, type GestureEnv, type GestureSink } from './touchGestures.ts';
import { BUBBLE_TAG_H, fallbackSafeArea, placeBubble, type Rect } from './dotGuidePerch.ts';
import { SEAMSTRESS } from './w5Kit.ts';
import { SEAM_STILL, seamTop } from './w5Creatures.ts';
import { SEAMSTRESS_FRAMES } from './seamstressAtlasData.ts';
import { W5_LESSON_ORCHID } from './w5Stages.ts';
import { MEECA_CARD, MEECA_SAY } from './meecaLines.ts';
import type { Platform } from './types.ts';

type Engine = Record<string, any>;
const upright = (sim: RealPlay, w = 320, h = 782) => {
  const e = sim.e as Engine;
  e.viewCssW = w;
  e.viewCssH = h;
  e.introT = 99;
  e.applyZoom();
  (sim.input as unknown as { source: string }).source = 'gesture';
  return e;
};

// ───────────────────────────── 1. the camera on a silk line ─────────────────────────────

test('the eased camera never lets his middle come nearer either side of the view than HERO_KEEP', () => {
  assert.equal(keepHeroX(100, 120, 368), 120 - HERO_KEEP);
  assert.equal(keepHeroX(0, 400, 368), 400 + HERO_KEEP - 368);
  assert.equal(keepHeroX(200, 300, 368), 200);
  // (a view narrower than twice the keep: he is centred)
  assert.equal(keepHeroX(0, 100, 60), 70);
});

test('5-4 upright (320 x 782): pumping a long silk line and letting go at any moment, he stays on the screen and gets over each chain', () => {
  const probe = new RealPlay('5-4', 1);
  const chains = (probe.stage as unknown as { w54info: { chains: Array<{ edge: number; far: number; y: number; vines: number[] }> } }).w54info.chains;
  const bad: string[] = [];
  let worst = Infinity;
  for (const ch of chains.slice(1, 4)) {
    for (let letgo = 20; letgo < 140; letgo += 17) {
      const sim = new RealPlay('5-4', 1);
      const e = upright(sim);
      sim.stand(ch.edge - 200, ch.y);
      let grabbed = -1, over = false;
      for (let i = 0; i < 30 * 30 && !over; i++) {
        e.lives = 9;
        if (sim.p.isVineSwinging && grabbed < 0) grabbed = i;
        const k = grabbed < 0 ? -1 : i - grabbed;
        if (grabbed < 0) {
          const at = sim.p.x > ch.edge - 30 && sim.p.grounded;
          sim.frame({ right: true, press: at, jump: at || !sim.p.grounded });
        } else if (k < letgo) {
          // (pumping: left a while, right a while, the swing going back and forth)
          const left = Math.floor(k / 22) % 2 === 0;
          sim.frame({ left, right: !left });
        } else {
          const j = (k - letgo) % 20;
          if (j === 0) sim.input.state.jumpLean = 1;
          sim.frame({ right: true, press: j === 0, jump: j < 7 });
        }
        const sx = sim.p.x - e.camera.x;
        worst = Math.min(worst, sx, e.camera.viewportWidth - sx);
        over = sim.p.grounded && sim.p.x > ch.far + 120;
      }
      if (!over) bad.push(`the chain at ${ch.edge}, let go after ${letgo} frames: stuck at x ${Math.round(sim.p.x)}, y ${Math.round(sim.p.y)}`);
    }
  }
  assert.deepEqual(bad, []);
  assert.ok(worst >= HERO_KEEP - 1, `he came ${Math.round(worst)} px from the edge of the view`);
});

// ───────────────────────────── 2. 5-3's orchids ─────────────────────────────

const lessonOf = (sim: RealPlay) => (sim.e as Engine).proto.w5.orchids.find((o: { lesson?: boolean }) => o.lesson);

test("5-3's first orchid: a plain hop up from the clear grass lands on it, with its cup's petals, whenever it is open", () => {
  for (const seed of [1, 38]) {
    for (const s of [0.2, 2, 4, W5_LESSON_ORCHID.open]) {
      const sim = new RealPlay('5-3', seed);
      upright(sim);
      const o = lessonOf(sim);
      assert.ok(G - o.y <= 96 && o.period === W5_LESSON_ORCHID.period, `seed ${seed}: the first orchid ${G - o.y} px up`);
      sim.stand(o.x - o.w / 2 - 90, G);
      sim.t = o.period * 20 + ((((s - 0.5 - o.offset) % o.period) + o.period) % o.period);
      let on = false;
      for (let i = 0; i < 60 && !on; i++) {
        sim.frame({ right: i < 14, press: i === 3, jump: i >= 3 && i < 10 });
        on = i > 5 && sim.p.grounded && Math.abs(sim.p.y - o.y) < 2;
      }
      const cup = sim.collectibles.filter((c) => o.petalIds.includes(c.id));
      assert.ok(on, `seed ${seed}: setting off ${s} s into its beat, he did not land on it (y ${Math.round(sim.p.y)})`);
      assert.ok(cup.every((c) => c.collected), `seed ${seed}: setting off ${s} s into its beat, its cup not picked`);
    }
  }
});

test("5-3's first orchid: standing still all along its stretch, no silk creeps up him (the lesson is the orchid)", () => {
  for (const seed of [1, 38]) {
    const sim = new RealPlay('5-3', seed);
    const o = lessonOf(sim);
    for (const dx of [-520, -300, -120, 0]) {
      sim.stand(o.x + dx, G);
      // (he has moved this run: standing at the start never counts)
      sim.frame({ right: true });
      for (let i = 0; i < 30 * 12; i++) sim.frame();
      assert.equal((sim.e as Engine).w5.silk, 0, `seed ${seed}: ${dx} px from it, the silk crept`);
    }
    // (and the rule still holds once he is past it)
    sim.stand(o.x + o.w / 2 + 400, G);
    sim.frame({ right: true });
    let most = 0;
    for (let i = 0; i < 30 * 12; i++) {
      sim.frame();
      most = Math.max(most, (sim.e as Engine).w5.silk);
    }
    assert.ok(most > 0, `seed ${seed}: past it, the silk never crept`);
  }
});

test("5-3: an open orchid's cup gives up its petals to a hop that lands anywhere in it, even at the bloom's far end", () => {
  const sim = new RealPlay('5-3', 1);
  const w5 = (sim.e as Engine).proto.w5;
  const o = w5.orchids.find((q: { lesson?: boolean; petalIds: number[] }) => !q.lesson && q.petalIds.length >= 2);
  sim.t = o.period * 20 + ((((0.2 - o.offset) % o.period) + o.period) % o.period);
  // (coming down onto its last few px, well past the 34 px the engine picks up within)
  sim.fly(o.x + o.w / 2 - 8, o.y - 60, 0, 200, 1);
  for (let i = 0; i < 12; i++) sim.frame();
  assert.ok(Math.abs(sim.p.y - o.y) < 2, 'he landed on it');
  assert.ok(sim.collectibles.filter((c) => o.petalIds.includes(c.id)).every((c) => c.collected), 'the whole cup picked');
});

test("5-3's first row: a running hop that sets off at most moments of the first bloom's beat crosses on the blooms and picks every cup", () => {
  for (const seed of [1, 38]) {
    const probe = new RealPlay('5-3', seed);
    const st = probe.stage as unknown as { w5info: { rows: Array<{ edge: number; far: number; orchids: number[] }> }; proto: { w5: { orchids: Array<{ period: number; offset: number; petalIds: number[] }> } } };
    const row = st.w5info.rows[0];
    const os = row.orchids.map((k) => st.proto.w5.orchids[k]);
    const o0 = os[0];
    let ok = 0, n = 0;
    for (let ph = -0.8; ph < o0.period - 0.8; ph += 0.25) {
      const sim = new RealPlay('5-3', seed);
      upright(sim);
      sim.stand(row.edge - 120, G);
      sim.t = o0.period * 20 + ((((ph - o0.offset) % o0.period) + o0.period) % o0.period);
      let hold = 0, deep = false;
      for (let i = 0; i < 30 * 8 && !(sim.p.grounded && sim.p.x > row.far + 30); i++) {
        const p = sim.p;
        let press = false;
        if (p.grounded && hold <= 0 && !sim.platforms.some((q) => !q.broken && Math.abs(q.y - p.y) < 3 && q.x <= p.x + 30 && q.x + q.width >= p.x + 30)) {
          press = true;
          hold = 9;
        }
        sim.frame({ right: true, press, jump: hold > 0 });
        hold--;
        if (sim.p.y > G + 40) deep = true;
      }
      const ids = os.flatMap((o) => o.petalIds);
      n++;
      if (!deep && sim.collectibles.filter((c) => ids.includes(c.id)).every((c) => c.collected)) ok++;
    }
    assert.ok(ok / n >= 0.68, `seed ${seed}: ${ok} of ${n} set-off moments cross the first row`);
  }
});

// ───────────────────────────── 3. one-step ledges, steering and flicking ─────────────────────────────

/** a 320 x 782 phone with refined controls and jump help, on the ground */
function thumbs() {
  const log: string[] = [];
  const sink: GestureSink = {
    move: (d) => log.push(`move:${d}`), duck: (on) => log.push(`duck:${on}`), jumpPress: (l) => log.push(`jump:${l ?? 0}`), jumpRelease: () => log.push('jumpUp'),
    punch: () => log.push('punch'), kick: () => log.push('kick'), mega: () => log.push('mega'), climb: (d) => log.push(`climb:${d}`), feedback: () => {},
  };
  const env: GestureEnv = { assist: () => true, air: () => false, refined: () => true, kickNear: () => false, onVine: () => false, onSwing: () => false, onRope: () => false, megaReady: () => true };
  const g = new TouchGestures(sink, () => 320, env);
  let now = 1000;
  return {
    log,
    jumped: () => log.some((l) => l.startsWith('jump:')),
    wait(ms: number) {
      for (let k = 0; k < ms; k += 30) {
        now += Math.min(30, ms - k);
        g.tick(now);
      }
    },
    down: (id: number, x: number, y: number) => g.down(id, x, y, now),
    up: (id: number, x: number, y: number) => g.up(id, x, y, now),
    drag(id: number, x0: number, y0: number, x1: number, y1: number, ms: number, steps = 4) {
      for (let i = 1; i <= steps; i++) {
        now += ms / steps;
        g.move(id, x0 + ((x1 - x0) * i) / steps, y0 + ((y1 - y0) * i) / steps, now);
      }
    },
  };
}

test('one thumb: steering into the step, then flicking up (and over) without lifting, jumps however far the thumb had drifted down', () => {
  const bad: string[] = [];
  for (const drift of [0, 20, 40, 60]) {
    for (const [dx, dy, ms] of [[0, -80, 60], [40, -70, 60], [60, -60, 80], [50, -45, 60], [30, -50, 90]] as const) {
      const t = thumbs();
      t.down(1, 60, 560);
      t.drag(1, 60, 560, 130, 560 + drift, 120 + drift * 4);
      t.wait(400);
      t.drag(1, 130, 560 + drift, 130 + dx, 560 + drift + dy, ms, 3);
      t.wait(60);
      if (!t.jumped()) bad.push(`drifted ${drift} px, flick ${dx},${dy} in ${ms} ms: ${t.log.join(' ')}`);
      // (and the steer holds through it: he keeps going into the step)
      if (t.log.includes('move:none')) bad.push(`drifted ${drift} px, flick ${dx},${dy}: the steer let go`);
    }
  }
  assert.deepEqual(bad, []);
});

test('two thumbs: with the steering thumb held, the other thumb\'s flick up jumps, wherever it lands, even right beside the steering one', () => {
  const bad: string[] = [];
  for (const [ax, ay] of [[250, 485], [200, 520], [110, 560], [160, 470]] as const) {
    for (const [dx, dy, ms] of [[0, -80, 60], [40, -70, 60], [60, -55, 60], [70, -50, 80], [30, -40, 60], [20, -35, 120]] as const) {
      const t = thumbs();
      t.down(1, 58, 563);
      t.drag(1, 58, 563, 128, 563, 100);
      t.wait(300);
      t.down(2, ax, ay);
      t.drag(2, ax, ay, ax + dx, ay + dy, ms, 3);
      t.up(2, ax + dx, ay + dy);
      t.wait(60);
      if (!t.jumped()) bad.push(`at ${ax},${ay}, flick ${dx},${dy} in ${ms} ms: ${t.log.join(' ')}`);
    }
  }
  assert.deepEqual(bad, []);
});

test('the steering thumb rolling down and easing back up slowly is still no jump, and a finger resting on it is still no punch', () => {
  const t = thumbs();
  t.down(1, 60, 560);
  t.drag(1, 60, 560, 130, 560, 200);
  t.drag(1, 130, 560, 135, 620, 600);
  t.drag(1, 135, 620, 138, 570, 600);
  assert.ok(!t.jumped(), t.log.join(' '));
  t.down(2, 150, 575);
  t.wait(60);
  t.up(2, 150, 575);
  assert.ok(!t.log.includes('punch'));
});

/** every one-step face in a stage (a stump, a soft pit's step or bank): the block, and the floor beside it */
function stepsOf(sim: RealPlay): Array<{ q: Platform; floor: number }> {
  const P = sim.platforms;
  const out: Array<{ q: Platform; floor: number }> = [];
  for (const q of P) {
    if (q.type !== 'solid' || q.height < 30 || q.art === 'orchid') continue;
    const xs = q.x - 25;
    const under = P.filter((f) => f.type === 'solid' && f.art !== 'orchid' && f.x <= xs - 10 && f.x + f.width >= xs + 6 && f.y > q.y && f.y - q.y <= 96);
    if (under.length) out.push({ q, floor: Math.min(...under.map((f) => f.y)) });
  }
  return out;
}

for (const id of ['5-3', '5-5']) {
  test(`${id} in the real engine: walking into every one-step face and flicking with the steer still held lands on it, at any lean`, () => {
    const bad: string[] = [];
    let n = 0;
    for (const seed of [1, 38]) {
      const sim = new RealPlay(id, seed);
      (sim.input as unknown as { source: string }).source = 'gesture';
      for (const { q, floor } of stepsOf(sim)) {
        for (const lean of [-1, 0, 1] as const) {
          for (const pressed of [0, 4]) {
            sim.stand(q.x - 80, floor);
            for (let i = 0; i < 60 && sim.p.x < q.x - 22; i++) sim.frame({ right: true });
            for (let i = 0; i < pressed; i++) sim.frame({ right: true });
            let y = NaN;
            for (let f = 0; f < 120; f++) {
              if (f === 0) sim.input.state.jumpLean = lean;
              sim.frame({ press: f === 0, jump: f < 7, right: true });
              if (f > 3 && sim.p.grounded) {
                y = Math.round(sim.p.y);
                break;
              }
            }
            n++;
            if (!(y <= q.y)) bad.push(`seed ${seed}: the ${floor - q.y} px step at ${q.x}, lean ${lean}, pressed ${pressed} frames: landed at ${y}`);
          }
        }
      }
    }
    assert.ok(n > 100, `${n} tries`);
    assert.deepEqual(bad, []);
  });
}

// ───────────────────────────── 4. Dot's bubble ─────────────────────────────

test("Dot's bubble never covers Pokey while a spot clear of him is on the screen, upright and sideways", () => {
  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const ov = (a: Rect, b: Rect) => Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));
  for (const [W, H] of [[320, 782], [390, 844], [844, 390]]) {
    const safe = fallbackSafeArea(W, H);
    let on = 0;
    for (let k = 0; k < 1500; k++) {
      const px = 30 + rnd() * (W - 130), py = safe.rect.y0 + rnd() * H * 0.62;
      const pokey: Rect = { x0: px - 4, y0: py - 4, x1: px + 74, y1: py + 114 };
      const sx = Math.max(28, Math.min(W - 28, px + (rnd() < 0.5 ? -40 : 110))), sy = py + 10 + rnd() * 30;
      // (the way ahead and her ring: more boxes it must keep off)
      const hard: Rect[] = [pokey];
      for (let i = 0; i < 3; i++) {
        const x = rnd() * W, y = rnd() * H;
        hard.push({ x0: x, y0: y, x1: x + 60 + rnd() * 100, y1: y + 20 + rnd() * 40 });
      }
      const bw = Math.min(W - 40, 240 + rnd() * 60), bh = 56 + rnd() * 50;
      const b = placeBubble(sx, sy, bw, bh, safe, [pokey], ['above', 'left', 'right', 'below'], 26, hard, 18, pokey);
      if (ov({ x0: b.x, y0: b.y - BUBBLE_TAG_H, x1: b.x + bw, y1: b.y + bh }, pokey) > 0) on++;
    }
    assert.equal(on, 0, `${W}x${H}: on Pokey ${on} times`);
  }
});

// ───────────────────────────── 5. the Seamstress ─────────────────────────────

test('the Seamstress reads as a figure: a head over Pokey, knitting standing up (not on her web disc), her "!" over her raised needles', () => {
  assert.ok(SEAMSTRESS.h >= 118, `${SEAMSTRESS.h}`);
  assert.notEqual(SEAM_STILL.idle, 'idle', 'the web-disc still reads as a chair');
  assert.ok(SEAMSTRESS_FRAMES[SEAM_STILL.idle] && SEAMSTRESS_FRAMES[SEAM_STILL.tell] && SEAMSTRESS_FRAMES[SEAM_STILL.attack]);
  assert.ok(seamTop('tell') > SEAMSTRESS.h * 1.15, 'her tell stands taller');
  // Dot's line about her rings her
  const sim = new RealPlay('5-4', 1);
  const w5 = (sim.e as Engine).w5;
  const sm = (sim.e as Engine).proto.w5.seamstresses[0];
  assert.ok(w5.guideThings.some((g: { kind: string; x: number }) => g.kind === 'seamstress' && g.x === sm.x));
});

// ───────────────────────────── 7. 5-M's words in the page ─────────────────────────────

test("5-M: the words on its canvas are there to read: the \"On the March North\" card, then her thought clouds", () => {
  const sim = new RealPlay('5-M', 1);
  const mc = (sim.e as Engine).mc;
  sim.frame();
  const card = mc.screenWords();
  assert.equal(card[0].kind, 'card');
  for (const w of [...MEECA_CARD.title, ...MEECA_CARD.sub]) assert.ok(card[0].text.includes(w), `"${w}" in "${card[0].text}"`);
  // (a tap, once the card has been up a moment: it goes, and her first thought comes)
  for (let i = 0; i < 30; i++) sim.frame();
  sim.frame({ punch: true });
  for (let i = 0; i < 40; i++) sim.frame();
  const now = mc.screenWords();
  const th = now.find((q: { kind: string }) => q.kind === 'thought');
  assert.ok(th && th.text === `Meeca thinks: ${MEECA_SAY.camp.text}`, JSON.stringify(now));
  assert.ok(!now.some((q: { kind: string }) => q.kind === 'card'));
  // (and on any other stage, none)
  assert.deepEqual((new RealPlay('5-3', 1).e as Engine).meecaWords(), []);
});
