/**
 * World 5's fixes from QA's sideways gate (v198, 2026-10-26: "the Jen bot", 918 x 370 sideways, one thumb), items 2 to 9. Item 1, the
 * lips Pokey could not get up onto, is w5Lips.test.ts.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { RealPlay, levelConfig } from './realPlay.ts';
import { G, buildProtoStage, HAND_STAGES } from './protoStage.ts';
import { COCOON, W5_TEACH, type W5Extras } from './w5Kit.ts';
import { W5_CLEAR_OF_COCOON } from './w5Stages.ts';
import { PAINTED } from './w5Look.ts';
import { W5_POUCH } from './w5Lines.ts';
import { cardScale } from './w5Play.ts';
import { engineGuideLine } from './dotLines.ts';
import { GuideQueue, readMs, type MoveId } from './dotGuide.ts';
import { midSceneAfter } from './midScene.ts';
import { GOAL_MIN_OPACITY } from '../components/hud/seeThrough.ts';
import { stompTest } from './fight.ts';
import type { Enemy } from './types.ts';

const w5Of = (sim: RealPlay) => (sim.stage as unknown as { proto: { w5: W5Extras } }).proto.w5;
const touch = (sim: RealPlay) => {
  (sim.input as unknown as { source: string }).source = 'gesture';
  return sim;
};

// ───────────────────────────── 2. cocoons ─────────────────────────────

test('5-5: every cocoon opens to three taps from the ground (or the branch) it hangs over, standing anywhere a fist reaches it', () => {
  const bad: string[] = [];
  for (const seed of [1, 38]) {
    const base = new RealPlay('5-5', seed);
    const cocoons = w5Of(base).cocoons!;
    cocoons.forEach((c, i) => {
      // (the floor under it: the ground, a high road, or the web's branch)
      const floor = base.platforms.filter((q) => q.x <= c.x && q.x + q.width >= c.x && q.y >= c.y && q.y - c.y < 60).sort((a, b) => a.y - b.y)[0];
      if (!floor) {
        bad.push(`seed ${seed}: cocoon ${i} at (${c.x}, ${c.y}) hangs over nothing`);
        return;
      }
      // standing short of it facing it, from 100 px off to right under it (a tied one holds him where his punch lands)
      for (const dx of [-100, -70, -45, -20, 0]) {
        const sim = new RealPlay('5-5', seed);
        const before = sim.p.crittersRescued;
        sim.stand(c.x + dx, floor.y);
        sim.p.facing = 1;
        for (let k = 0; k < 3; k++) {
          sim.frame({ punch: true });
          for (let j = 0; j < 14; j++) sim.frame();
        }
        if (sim.p.crittersRescued !== before + 1) bad.push(`seed ${seed}: cocoon ${i} at (${c.x}, ${c.y}), standing ${dx} px off: not freed`);
      }
    });
  }
  assert.deepEqual(bad, []);
  // (so no jump-punch is ever needed, and the tip is the tap: "Tap to punch it open")
  assert.equal(engineGuideLine(W5_TEACH.cocoon, '5-5')!.move, 'punch');
});

test('5-5: the wrapped chairs read as furniture (wood and cloth showing) and stand well away from the cocoons; none lies there shut', () => {
  // (only the takes with the wooden frame and the tan cloth showing: the all-white ones were punched as cocoons, QA v198)
  assert.deepEqual([...PAINTED.wrappedChair!], ['wrappedArmchair2', 'wrappedChair2']);
  for (const seed of [1, 38, 75, 112]) {
    const st = buildProtoStage(levelConfig('5-5'), seed, HAND_STAGES['5-5']) as unknown as { proto: { w5: W5Extras } };
    const w5 = st.proto.w5;
    const cocoons = w5.cocoons!;
    for (const ch of (w5.chairs ?? []).filter((q) => q.wrapped)) {
      const near = cocoons.find((c) => Math.abs(c.x - ch.x) < W5_CLEAR_OF_COCOON);
      assert.ok(!near, `seed ${seed}: a wrapped chair at ${ch.x}, a cocoon at ${near?.x}`);
    }
    for (const d of w5.decor ?? []) {
      assert.notEqual(d.n, 'cocoon', `seed ${seed}: a shut cocoon lying in the grass at ${d.x} (it cannot be punched)`);
      if (['wrappedChair', 'wrappedStool', 'silkLump'].includes(d.n)) assert.ok(!cocoons.some((c) => Math.abs(c.x - d.x) < W5_CLEAR_OF_COCOON), `seed ${seed}: ${d.n} at ${d.x}`);
    }
  }
});

// ───────────────────────────── 3. spiders ─────────────────────────────

test('World 5\'s jumping spiders: a clean stomp beats one, and a jump over one, crouched or rushing, costs nothing', () => {
  // (the spider's kind cannot be stomped on its thread elsewhere; World 5's on the ground can: Dot says "or stomp it")
  const sp = { type: 'spider', x: 1000, y: G - 12, width: 34, height: 22, hitW: 60 } as Enemy;
  assert.equal(stompTest({ x: 1000, y: G - 4, vy: 300 }, G - 20, sp), null, 'a spider elsewhere');
  assert.deepEqual(stompTest({ x: 1000, y: G - 4, vy: 300 }, G - 20, { ...sp, stompable: true }), { kind: 'stomp', damage: 1 });
  let runs = 0, hits = 0, beaten = 0;
  for (const id of ['5-1', '5-2'] as const) {
    const base = new RealPlay(id, 1);
    const spiders = (base.e.enemies as Enemy[]).filter((e) => e.type === 'spider');
    assert.ok(spiders.every((e) => e.stompable), `${id}: every spider can be stomped`);
    for (const s0 of spiders.slice(0, 6)) {
      for (const off of [120, 200, 280]) {
        for (const k of [5, 8, 11]) {
          const r = touch(new RealPlay(id, 1));
          const e = r.e;
          e.loseLife = () => {};
          e.viewCssW = 918;
          e.viewCssH = 370;
          e.introT = 99;
          e.applyZoom();
          r.safe = false;
          r.stand(s0.x - off - 200, G);
          r.p.invincibleTimer = 0;
          let jumped = -1;
          for (let i = 0; i < 150; i++) {
            e.lives = 9;
            if (jumped < 0 && r.p.x >= s0.x - off) jumped = i;
            const j = jumped >= 0 ? i - jumped : -1;
            r.frame({ right: true, press: j === 0 || j === k, jump: j >= 0 && j < k + 8 });
            const sp2 = (e.enemies as Enemy[]).find((q) => q.id === s0.id)!;
            if (j > 10 && r.p.grounded && r.p.x > sp2.x + 80) break;
          }
          runs++;
          hits += e.statHeartsLost;
          if ((e.enemies as Enemy[]).find((q) => q.id === s0.id)!.defeated) beaten++;
        }
      }
    }
  }
  // (a double flick at a spider, taken anywhere from 120 to 280 px short of it: over it, or down on it, never a heart. v199: 22 of 54)
  assert.equal(hits, 0, `${hits} hearts in ${runs} runs`);
  assert.ok(beaten > 0, 'some came down on one and beat it');
});

// ───────────────────────────── 4. the crouch's warning ─────────────────────────────

/** a canvas that records the "!" it is asked to write (its font size, in world units) */
function bangs(): { ctx: CanvasRenderingContext2D; sizes: number[] } {
  const sizes: number[] = [];
  let font = '';
  const ctx = new Proxy({} as Record<string, unknown>, {
    get(t, k) {
      if (k === 'fillText') return (s: string) => { if (s === '!') sizes.push(Number(/(\d+)px/.exec(font)?.[1] ?? 0)); };
      if (k in t) return t[k as string];
      return () => {};
    },
    set(t, k, v) {
      if (k === 'font') font = v as string;
      t[k as string] = v;
      return true;
    },
  }) as unknown as CanvasRenderingContext2D;
  return { ctx, sizes };
}

test('5-1: a crouching spider\'s "!" is drawn over the light and the pop-up words, as large on a sideways screen as upright', () => {
  const sim = new RealPlay('5-1', 1);
  sim.safe = false;
  const e = sim.e;
  const sp = (e.enemies as Enemy[]).filter((q) => q.type === 'spider').sort((a, b) => a.x - b.x)[0];
  sim.stand(sp.x - 420, G);
  for (let i = 0; i < 40 && (e.w5.gates as Map<number, { phase: string }>).get(sp.id)!.phase !== 'windup'; i++) sim.frame({ right: true });
  assert.equal((e.w5.gates as Map<number, { phase: string }>).get(sp.id)!.phase, 'windup');
  const at = (zoom: number) => {
    const b = bangs();
    e.w5.drawWarnings(b.ctx, sim.t, { x0: sp.x - 600, x1: sp.x + 600, zoom });
    return b.sizes[0] ?? 0;
  };
  // (sideways the view is zoomed out to show the run ahead: the "!" grows with it, so on the glass it is as big as upright)
  const up = at(0.87), side = at(0.5);
  assert.ok(up >= 18, `upright ${up}`);
  assert.ok(side * 0.5 >= up * 0.87 * 0.95, `sideways ${side} px at zoom 0.5 against ${up} at 0.87`);
  assert.equal(cardScale(0.5), Math.min(1.8, 0.87 / 0.5));
  // (and it is drawn after the pop-up words: engine.ts renders drawWarnings right after drawPopups in World 5)
  const src = fs.readFileSync(new URL('./engine.ts', import.meta.url), 'utf8');
  const popups = src.indexOf('this.drawPopups(ctx);\n      // (and its warnings');
  assert.ok(popups > 0 && src.indexOf('this.w5.drawWarnings(', popups) > popups);
});

// ───────────────────────────── 5. the pouch scene ─────────────────────────────

test('the pouch scene\'s lines are said once: a line that gives way or is cut after it has been mostly read is not said again', () => {
  const line = engineGuideLine(W5_POUCH.find((l) => l.id === 'd2')!.text, '5-5', { dot: true })!;
  assert.equal(line.scene, true);
  const tip = engineGuideLine(W5_TEACH.chair, '5-5', { dot: true })!;
  const env = { danger: false, moveCount: (_m: MoveId) => 0 };
  const q = new GuideQueue();
  q.push(line, 0);
  q.tick(700, env);
  assert.equal(q.cur?.line.key, line.key);
  // a tip about a thing comes: the scene's line keeps the screen until it is mostly read, then gives way, and is not said again
  q.push(tip, 900);
  q.tick(1200, env);
  assert.equal(q.cur?.line.key, line.key, 'not cut short for a tip');
  let shows = 1;
  let was = q.cur?.line.key;
  for (let t = 1300; t < 30000; t += 100) {
    q.tick(t, env);
    const k = q.cur?.line.key;
    if (k !== was && k === line.key) shows++;
    was = k;
  }
  assert.equal(shows, 1, 'said once');
  // and a warning that cuts in after it has been mostly read: not said again either
  const q2 = new GuideQueue();
  q2.push(line, 0);
  q2.tick(700, env);
  const warn = engineGuideLine(W5_TEACH.sit, '5-5', { dot: true })!;
  q2.push(warn, 700 + readMs(line.text) * 0.8);
  assert.equal(q2.cur?.line.key, warn.key);
  let again = false;
  for (let t = 800 + readMs(line.text); t < 30000; t += 100) if (q2.tick(t, env)?.line.key === line.key) again = true;
  assert.ok(!again);
});

test('5-5: no picture sequence of the pouch follows 5-5 (it plays in the stage); the other worlds keep theirs, World 4 after 4-D', () => {
  const o = { dotStageId: '4-D', newStages: true };
  assert.equal(midSceneAfter({ id: '5-5', worldIndex: 5, miniIndex: 5 }, o), false);
  for (const w of [1, 2, 3, 6, 7, 8, 9, 10]) assert.equal(midSceneAfter({ id: `${w}-5`, worldIndex: w, miniIndex: 5 }, o), true, `world ${w}`);
  assert.equal(midSceneAfter({ id: '4-5', worldIndex: 4, miniIndex: 5 }, o), false);
  assert.equal(midSceneAfter({ id: '4-D', worldIndex: 4, miniIndex: 11 }, o), true);
  assert.equal(midSceneAfter({ id: '4-5', worldIndex: 4, miniIndex: 5 }, { ...o, newStages: false }), true);
  // (the app asks this, and nothing else, before the halfway scene)
  const app = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
  assert.ok(app.includes("midSceneAfter(lvl, { dotStageId: DOT_STAGE_ID, newStages: newStagesOn() })"));
  assert.equal((app.match(/setScreen\('world_mid'\)/g) ?? []).length, 1);
});

test('5-5: while the pouch scene plays, Dot\'s bubble keeps off Pokey and off every cocoon still shut', () => {
  const sim = new RealPlay('5-5', 1);
  const w5 = w5Of(sim);
  const rest = w5.rest!;
  sim.stand(rest.x0 + 200, rest.y);
  for (let i = 0; i < 30; i++) sim.frame();
  assert.ok(sim.e.w5.restPlaying(sim.t));
  const out: Array<{ x0: number; y0: number; x1: number; y1: number }> = [];
  sim.e.w5.keepOuts({ x0: rest.x0 - 400, x1: rest.calm! }, out);
  const p = sim.p;
  assert.ok(out.some((b) => b.x0 <= p.x - 20 && b.x1 >= p.x + 20 && b.y0 <= p.y - 60 && b.y1 >= p.y), 'Pokey kept clear');
  for (const c of w5.cocoons!.filter((q) => q.x > rest.x0 - 400 && q.x < rest.calm!)) {
    assert.ok(out.some((b) => b.x0 <= c.x - 20 && b.x1 >= c.x + 20 && b.y0 <= c.y - COCOON.mid - 30 && b.y1 >= c.y), `the cocoon at ${c.x} kept clear`);
  }
});

// ───────────────────────────── 6. 5-4's words ─────────────────────────────

test('5-4: the silk is taught in silk words, and the let-go follows the grab at once, while he swings', () => {
  const l = engineGuideLine(W5_TEACH.silk, '5-4', { dot: true })!;
  assert.ok(/silk/i.test(l.text) && !/vine/i.test(l.text), l.text);
  assert.ok(l.next && l.next.text.split(/\s+/).length <= 8, l.next?.text);
  // (urgent: no breath before it; QA v198 let go in the first sweet spot and the line came after)
  assert.equal(l.next!.kind, 'must');
  // the vine lesson ("Flick up into the vine to grab it") never comes at a silk line
  const sim = new RealPlay('5-4', 1);
  const first = sim.vines.filter((v) => v.silk).sort((a, b) => a.x - b.x)[0];
  const lessons: string[] = [];
  sim.e.callbacks.onLesson = (id: string) => lessons.push(id);
  delete sim.e.lessonTick;
  sim.stand(first.x - 300, G);
  for (let i = 0; i < 30 * 6; i++) sim.frame({ right: i < 20 });
  assert.ok(!lessons.includes('swing'), lessons.join(','));
});

// ───────────────────────────── 7. pulling free ─────────────────────────────

test('5-4: with the Seamstress\'s lace on him at her sheet, one slide back and forth frees him as surely as separate short slides', () => {
  const patterns: Record<string, (i: number) => { left?: boolean; right?: boolean }> = {
    // (one thumb sliding back and forth, as the touch layer reports it: right, nothing, left, nothing)
    'one slide': (i) => [{ right: true }, {}, { left: true }, {}][Math.floor(i / 3) % 4],
    'separate slides': (i) => (Math.floor(i / 5) % 2 ? {} : { right: true }),
  };
  for (const [name, pat] of Object.entries(patterns)) {
    const sim = touch(new RealPlay('5-4', 1));
    sim.safe = false;
    const w5 = w5Of(sim);
    const sm = w5.seamstresses![0];
    const sh = w5.sheets![sm.sheet];
    // (lingering at her sheet until her lace is on him)
    sim.stand(sh.x1 - 60, G);
    sim.frame({ right: true });
    for (let i = 0; i < 30 * 6 && sim.e.w5.silk < 0.5; i++) sim.frame();
    assert.ok(sim.e.w5.silk >= 0.5, `${name}: silk ${sim.e.w5.silk}`);
    let free = -1;
    for (let i = 0; i < 60 && free < 0; i++) {
      sim.frame(pat(i));
      if (sim.e.w5.silk <= 0) free = i;
    }
    assert.ok(free >= 0 && free < 30, `${name}: free after ${free} frames`);
    // and she does not cast at him again while he pulls free
    const silk0 = sim.e.w5.silk;
    let most = silk0;
    for (let i = 0; i < 60; i++) {
      sim.frame(patterns['one slide'](i));
      most = Math.max(most, sim.e.w5.silk);
    }
    assert.ok(most < 0.3, `${name}: back up to ${most.toFixed(2)} while wiggling`);
  }
});

// ───────────────────────────── 8. the goal counter ─────────────────────────────

test('the new HUD\'s goal counter never fades past reading (over a log it stays at least 60% there)', () => {
  const css = fs.readFileSync(new URL('../components/hud/hud.css', import.meta.url), 'utf8');
  const m = /\.vh-goal\.vh-see:not\(\.hidden\)\s*\{\s*opacity:\s*([\d.]+)\s*!important/.exec(css);
  assert.ok(m, 'the counter has its own floor');
  assert.equal(Number(m![1]), GOAL_MIN_OPACITY);
  assert.ok(GOAL_MIN_OPACITY >= 0.6);
});
