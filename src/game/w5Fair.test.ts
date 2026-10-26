/**
 * World 5 movement fairness (QA gate on v198, 2026-10-26: "the Matt bot", an expert at 320 x 782 upright, one thumb). Played in the
 * real engine (realPlay.ts) the way one thumb plays: it lifts to flick, so a flick has no steering in it unless the thumb slides on.
 *
 *   1. Tall blocks: the same double flick cleared a block one try and not the next. The second jump REPLACED his upward speed, so a
 *      quick second flick threw the first jump away (70 ms apart the pair rose 104 px, a third of a second apart 165). Now it adds its
 *      height to the first's (physics.ts secondJumpV): a block that needs a double jump is cleared from any reasonable start.
 *   2. Dips with a one-step exit: a straight flick with the thumb lifted went straight up beside the step and came down where it began.
 *      Now, in World 5, it lands on the step (engine.ts STEP_UP): every dip is left with one plain flick a step, silk on him or not.
 *   3. The silk: Dot says the rule the first time he stands still, before it can start; a jump sheds it; he wobbles in it as he pulls.
 *   4. Hits from behind: a spider's rush went on after he got past it, turning to bite his back with no warning of its own. A rush is
 *      one way now (w5Kit SPIDER5.past): coming back takes a new crouch, in view.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { G, buildProtoStage, HAND_STAGES } from './protoStage.ts';
import { levelConfig } from './realPlay.ts';
import { DOUBLE_RISE, JUMP_RISE, PHYS, secondJumpV } from './physics.ts';
import { SIT, SPIDER5, W5_TEACH, newGate, stepGate, type W5Extras } from './w5Kit.ts';
import { engineGuideLine } from './dotLines.ts';
import { W5_DOT_LINES } from './w5Lines.ts';
import type { W5Info } from './w5Stages.ts';
import type { Enemy, Platform } from './types.ts';

const SEEDS = Array.from({ length: 16 }, (_, i) => 1 + i * 37);
/** behind the spider (px past its middle, the far side from where it crouched facing him): bitten there, it came at his back */
const BEHIND = 8;
type Built = ReturnType<typeof buildProtoStage> & { w5info: W5Info; proto: { w5: W5Extras } };

/** a thumb on the glass: the touch jump help (jumpHelp.ts) is the game's own */
function touch(sim: RealPlay) {
  (sim.input as unknown as { source: string }).source = 'gesture';
  return sim;
}

// ───────────────────────────── 1. tall blocks ─────────────────────────────

test('the second jump adds to the first: rising, its height is the same however soon it comes; falling, it is the second jump\'s own', () => {
  const rise = (v: number) => (v * v) / (2 * PHYS.gravUp);
  for (const t of [0.03, 0.07, 0.1, 0.2, 0.3]) {
    const vy = -PHYS.jumpV + PHYS.gravUp * t;
    const h = PHYS.jumpV * t - (PHYS.gravUp * t * t) / 2;
    // (the apex from here, with no hold or cut: exactly the first jump's own top plus the second's, DOUBLE_RISE)
    assert.ok(Math.abs(h + rise(secondJumpV(vy, PHYS.doubleV)) - DOUBLE_RISE) < 0.5, `at ${t} s`);
  }
  assert.equal(secondJumpV(200, PHYS.doubleV), -PHYS.doubleV);
  assert.equal(secondJumpV(0, PHYS.doubleV), -PHYS.doubleV);
});

const BX = 1000;
/** the real engine on a bare floor with one block `h` tall at BX */
function blockWorld(h: number) {
  const sim = touch(new RealPlay('5-1', 1));
  const plats: Platform[] = [
    { id: 1, x: 0, y: G, width: 4000, height: 90, type: 'solid', style: 'log' } as Platform,
    { id: 2, x: BX, y: G - h, width: 120, height: h, type: 'solid', style: 'moss_stone' } as Platform,
  ];
  sim.bare(plats);
  return sim;
}
type Steer = 'none' | 'hold' | 'lift' | 'after';
/**
 * a double flick at the block: the first flick when his body is `gap` px from its face (standing there, or running at it from far back
 * when `run`), the second `k` frames after; each flick held 7 frames (inputEngine.ts MIN_TOUCH_JUMP_HOLD_MS, 220 ms). The steering:
 * none at all; held right throughout (the thumb slides up and on); lifted for each flick (one thumb off the glass to flick, back on to
 * steer); or put on only with the second flick. True: he ends up standing on top.
 */
function doubleFlick(h: number, gap: number, k: number, steer: Steer, run = false): boolean {
  const sim = blockWorld(h);
  const at = BX - 19 - gap;
  sim.stand(run ? at - 400 : at, G);
  sim.p.facing = 1;
  sim.frame();
  if (run) for (let i = 0; i < 300 && sim.p.x < at; i++) sim.frame({ right: true });
  for (let i = 0; i < 70; i++) {
    const flick = i < 7 || (i >= k && i < k + 7);
    const right = steer === 'hold' ? true : steer === 'lift' ? !flick : steer === 'after' ? i >= k : false;
    sim.frame({ press: i === 0 || i === k, jump: flick, right });
    if (i > 2 && sim.p.grounded) return Math.abs(sim.p.y - (G - h)) < 2;
  }
  return false;
}

test('a block that needs the second jump is cleared by a double flick from any reasonable start, however quick the second flick', () => {
  const bad: string[] = [];
  // (World 5's: the first tall stump, 125, and the rest, 118 to 138: w5Stages.ts TALL_H)
  for (const h of [118, 125, 138]) {
    for (const k of [2, 3, 4, 5, 6, 8, 10]) {
      // standing right against it, or a step back
      for (const gap of [0, 12, 40]) for (const steer of ['none', 'hold', 'lift', 'after'] as Steer[]) if (!doubleFlick(h, gap, k, steer)) bad.push(`${h} px, standing ${gap} px off, ${steer}, second flick ${k} frames on`);
      for (const steer of ['hold', 'lift', 'after'] as Steer[]) if (!doubleFlick(h, 80, k, steer)) bad.push(`${h} px, standing 80 px off, ${steer}, second flick ${k} frames on`);
      // running at it, the first flick 20 to 120 px out
      for (const gap of [20, 60, 120]) for (const steer of ['hold', 'lift', 'none'] as Steer[]) if (!doubleFlick(h, gap, k, steer, true)) bad.push(`${h} px, running, first flick ${gap} px out, ${steer}, second ${k} frames on`);
    }
  }
  assert.deepEqual(bad, []);
  // (and it is the second jump's: one held jump, steering onto it, climbs none of them)
  const one = (h: number) => {
    const sim = blockWorld(h);
    sim.stand(BX - 19 - 12, G);
    sim.frame();
    for (let i = 0; i < 60; i++) {
      sim.frame({ press: i === 0, jump: i < 30, right: true });
      if (i > 2 && sim.p.grounded) return Math.abs(sim.p.y - (G - h)) < 2;
    }
    return false;
  };
  // (118 is the lowest: one held jump and the lip's hoist reach it, as they always did; 125 up only the second jump climbs)
  for (const h of [125, 138]) assert.ok(!one(h), `one jump climbed ${h}`);
  assert.ok(JUMP_RISE < 118);
});

test('5-1 and 5-2 in the real engine: every stump only the second jump climbs is cleared by a quick or slow double flick, from against it', () => {
  const bad: string[] = [];
  for (const id of ['5-1', '5-2'] as const) {
    for (const seed of SEEDS.slice(0, 6)) {
      const st = buildProtoStage(levelConfig(id), seed, HAND_STAGES[id]) as Built;
      for (const s of st.w5info.stumps.filter((q) => q.h > 100)) {
        for (const k of [2, 4, 7, 10]) {
          for (const steer of ['none', 'lift'] as Steer[]) {
            const sim = touch(new RealPlay(id, seed));
            sim.stand(s.x - 19 - 4, G);
            sim.p.facing = 1;
            sim.frame();
            let ok = false;
            for (let i = 0; i < 70; i++) {
              const flick = i < 7 || (i >= k && i < k + 7);
              sim.frame({ press: i === 0 || i === k, jump: flick, right: steer === 'lift' && !flick });
              if (i > 2 && sim.p.grounded) {
                ok = Math.abs(sim.p.y - (G - s.h)) < 2;
                break;
              }
            }
            if (!ok) bad.push(`${id} seed ${seed}: the ${s.h} px stump at ${s.x}, ${steer}, second flick ${k} frames on`);
          }
        }
      }
    }
  }
  assert.deepEqual(bad, []);
});

// ───────────────────────────── 2. dips ─────────────────────────────

/** every soft pit in a stage: its near edge and far bank (5-3's rows of orchids are over soft pits too) */
function pitsOf(st: Built): Array<{ edge: number; far: number }> {
  return [...st.w5info.gaps, ...st.w5info.rows];
}

/**
 * dropped into the dip at its near side, a one-thumb player: he steers to the next face, lifts his thumb and flicks straight up, and
 * does it again at each face. How many flicks it took to stand on the ground past the dip (-1: never)
 */
function leaveDip(id: string, seed: number, pit: { edge: number; far: number }, stillFirst = 0): { flicks: number; steps: number } {
  const sim = touch(new RealPlay(id, seed));
  const x0 = pit.edge + 24;
  const under = sim.platforms.filter((q) => q.y > G && q.x <= x0 && q.x + q.width >= x0);
  const floorY = Math.min(...under.map((q) => q.y));
  // (the steps up out of it: each face between here and the far bank, up to the ground)
  const steps = new Set(sim.platforms.filter((q) => q.type === 'solid' && q.height >= 50 && q.x > x0 && q.x <= pit.far + 2 && q.y < floorY && q.y >= G).map((q) => q.y)).size;
  sim.stand(x0, floorY);
  sim.p.facing = 1;
  // (he moves, then stands: the silk comes on)
  sim.frame({ left: true });
  sim.frame();
  sim.wait(stillFirst);
  let flicks = 0, hold = 0, rest = 0;
  for (let i = 0; i < 30 * 10; i++) {
    const p = sim.p;
    const face = sim.platforms.some((q) => q.type === 'solid' && !q.broken && q.height >= 50 && q.x - (p.x + 19) >= -2 && q.x - (p.x + 19) < 6 && q.y < p.y - 6 && q.y + q.height > p.y - 4);
    let press = false;
    if (p.grounded && hold <= 0 && face && rest-- <= 0) {
      press = true;
      hold = 7;
      rest = 3;
      flicks++;
    }
    // (the thumb steers on the ground until he is at a face; it is off the glass for the flick and while he is in the air)
    sim.frame({ right: p.grounded && !face && hold <= 0, press, jump: hold > 0 });
    hold--;
    if (sim.p.grounded && Math.abs(sim.p.y - G) < 2 && sim.p.x > pit.far) return { flicks, steps };
    if (flicks > steps + 3) break;
  }
  return { flicks: -1, steps };
}

test('World 5\'s dips: with the thumb lifted, one plain flick climbs each step out, with silk on him or not (5-1, 5-2, 5-3, 5-5)', () => {
  const bad: string[] = [];
  let dips = 0;
  for (const id of ['5-1', '5-2', '5-3', '5-5']) {
    for (const seed of SEEDS.slice(0, 4)) {
      const st = buildProtoStage(levelConfig(id), seed, HAND_STAGES[id]) as Built;
      for (const pit of pitsOf(st)) {
        dips++;
        for (const still of [0, 4]) {
          const r = leaveDip(id, seed, pit, still);
          if (r.flicks !== r.steps) bad.push(`${id} seed ${seed}: the dip ${pit.edge}..${pit.far}${still ? ', silk on him' : ''}: ${r.flicks < 0 ? 'never out' : `${r.flicks} flicks`} for ${r.steps} steps`);
        }
      }
    }
  }
  assert.ok(dips > 40, `${dips} dips`);
  assert.deepEqual(bad, []);
});

test('the step help is a plain flick\'s only: at a face taller than one jump, or with the thumb steering away, it does nothing', () => {
  // (a 125 px block: one straight flick goes up and comes down where it began)
  const sim = blockWorld(125);
  sim.stand(BX - 19, G);
  sim.p.facing = 1;
  sim.frame();
  for (let i = 0; i < 40; i++) sim.frame({ press: i === 0, jump: i < 7 });
  assert.ok(sim.p.grounded && Math.abs(sim.p.y - G) < 1 && Math.abs(sim.p.x - (BX - 19)) < 3, `at ${sim.p.x}, ${sim.p.y}`);
  // (a 60 px step, steering left: he goes left)
  const s2 = blockWorld(60);
  s2.stand(BX - 19, G);
  s2.p.facing = 1;
  s2.frame();
  for (let i = 0; i < 40; i++) s2.frame({ press: i === 0, jump: i < 7, left: true });
  assert.ok(s2.p.x < BX - 60 && Math.abs(s2.p.y - G) < 1);
  // (and the same 60 px step, thumb lifted: up onto it)
  const s3 = blockWorld(60);
  s3.stand(BX - 19, G);
  s3.p.facing = 1;
  s3.frame();
  for (let i = 0; i < 40; i++) s3.frame({ press: i === 0, jump: i < 7 });
  assert.ok(Math.abs(s3.p.y - (G - 60)) < 1 && s3.p.x > BX, `at ${s3.p.x}, ${s3.p.y}`);
});

// ───────────────────────────── 3. the silk ─────────────────────────────

test('the silk is taught before it catches him: the first time he stands still, Dot says so, before any silk is on him (8 words or fewer)', () => {
  const row = W5_DOT_LINES.find((l) => l[0] === 'w5.still')!;
  assert.ok(row, 'the line is approved');
  assert.ok((row[5] as string).split(/\s+/).length <= 8, row[5] as string);
  for (const id of ['5-1', '5-2', '5-3']) {
    try {
      localStorage.removeItem(`sloth_tips_${id}`);
    } catch {
      /* no storage */
    }
    const sim = new RealPlay(id, 1);
    // he runs a while, then stops on open ground
    for (let i = 0; i < 30; i++) sim.frame({ right: true });
    let toldAt = -1, silkAt = -1, sitAt = -1;
    for (let i = 0; i < 30 * 5; i++) {
      sim.frame();
      if (toldAt < 0 && sim.said.some((s) => s.text === W5_TEACH.still)) toldAt = sim.t;
      if (sitAt < 0 && sim.said.some((s) => s.text === W5_TEACH.sit)) sitAt = sim.t;
      if (silkAt < 0 && sim.e.w5.silk > 0) silkAt = sim.t;
    }
    assert.ok(toldAt > 0 && silkAt > 0, `${id}: told ${toldAt}, silk ${silkAt}`);
    assert.ok(silkAt - toldAt >= 1, `${id}: the line came ${(silkAt - toldAt).toFixed(2)} s before the silk`);
    assert.ok(sitAt >= toldAt, `${id}: the shake-it-off line came first`);
    // (the new look says it as a thing's tip: a phone that has run before still hears it)
    const l = engineGuideLine(W5_TEACH.still, id, { dot: true })!;
    assert.equal(l.text, row[5]);
    assert.ok(l.thing, 'a thing tip');
    // (and once the silk is on him, its line is a warning: said at once, never dropped)
    assert.equal(engineGuideLine(W5_TEACH.sit, id, { dot: true })!.kind, 'danger');
  }
});

test('with silk on him a jump sheds a chunk of it at once, and pulling against it (steering, jumping) makes him wobble', () => {
  const sim = new RealPlay('5-2', 1);
  const w5 = sim.e.w5;
  sim.frame({ right: true });
  for (let i = 0; i < 30 * 5 && w5.silk < 0.5; i++) sim.frame();
  const before = w5.silk;
  assert.ok(before >= 0.5, `silk ${before}`);
  assert.equal(w5.wobble(sim.t), 0, 'no wobble standing still');
  sim.frame({ press: true, jump: true });
  sim.frame({ jump: true });
  assert.ok(w5.silk <= before - SIT.jump + 0.01, `a jump shed ${(before - w5.silk).toFixed(2)}`);
  let most = 0;
  for (let i = 0; i < 4; i++) {
    sim.frame({ jump: true });
    most = Math.max(most, Math.abs(w5.wobble(sim.t)));
  }
  assert.ok(most > 1, `wobble ${most}`);
  // (nothing on him: no wobble however he steers)
  const s2 = new RealPlay('5-2', 1);
  for (let i = 0; i < 20; i++) {
    s2.frame({ right: i % 4 < 2, left: i % 4 >= 2 });
    assert.equal(s2.e.w5.wobble(s2.t), 0);
  }
});

// ───────────────────────────── 4. spiders from behind ─────────────────────────────

test('a spider\'s rush is one way: once he is past it, it must crouch again before it comes back', () => {
  const near = { dx: 120, dy: 0, alarm: false, hunting: true, grounded: true, seen: true, shown: true };
  let g = newGate();
  g = stepGate(g, near, 1 / 30);
  assert.equal(g.phase, 'windup');
  for (let i = 0; i < 30; i++) g = stepGate(g, { ...near, dx: 80 }, 1 / 30);
  assert.equal(g.phase, 'go');
  // he hops over it and is behind it: the rush is over
  g = stepGate(g, { ...near, dx: -SPIDER5.past - 2 }, 1 / 30);
  assert.equal(g.phase, 'calm');
  // the next frame it crouches again, facing him: the whole warning before it comes
  g = stepGate(g, { ...near, dx: -60 }, 1 / 30);
  assert.equal(g.phase, 'windup');
  let frames = 0;
  while (g.phase === 'windup' && frames < 60) {
    g = stepGate(g, { ...near, dx: -60 }, 1 / 30);
    frames++;
  }
  assert.ok(frames / 30 >= 0.6, `${frames} frames`);
  // and a crouch he gets past is called off, to start again
  g = stepGate(newGate(), near, 1 / 30);
  g = stepGate(g, { ...near, dx: -40 }, 1 / 30);
  assert.equal(g.phase, 'calm');
});

test('5-1 and 5-2 upright at 320 x 782: no spider bites him from behind unless it crouched facing that way, on screen, first', () => {
  const bad: string[] = [];
  let hits = 0;
  for (const id of ['5-1', '5-2']) {
    for (const every of [1.5, 1.1]) {
      const r = new RealPlay(id, 1);
      const e = r.e;
      delete e.updateCamera;
      delete e.loseLife;
      e.viewCssW = 320;
      e.viewCssH = 782;
      e.introT = 99;
      e.applyZoom();
      r.safe = false;
      const p = r.p;
      p.invincibleTimer = 0;
      e.camera.x = Math.max(0, p.x - e.camera.viewportWidth * 0.45);
      const w5: W5Extras = (r.stage as unknown as { proto: { w5: W5Extras } }).proto.w5;
      const ids = new Set((w5.spiders ?? []).map((s) => s.id));
      const gates = e.w5.gates as Map<number, { phase: string; dir?: number }>;
      /** each spider's last crouch: the way it faced, and how long it was wholly on screen */
      const crouch = new Map<number, { dir: number; shown: number }>();
      const hurt = e.damagePlayer.bind(e);
      e.damagePlayer = (amount: number, fromX?: number) => {
        const lost = e.statHeartsLost;
        hurt(amount, fromX);
        if (e.statHeartsLost === lost) return;
        p.hp = p.maxHp;
        const s = (e.enemies as Enemy[]).find((q) => ids.has(q.id) && !q.defeated && q.x === fromX);
        if (!s) return;
        hits++;
        const c = crouch.get(s.id);
        // (from the side its crouch faced him: dx from the spider to him has the crouch's sign, or he is on top of it)
        const dx = p.x - s.x;
        if (!c || c.shown < 0.6 || (c.dir * dx < -BEHIND)) bad.push(`${id} hop ${every}: spider ${s.id} at ${r.t.toFixed(1)} s, dx ${Math.round(dx)}, crouch ${c ? `${c.dir > 0 ? 'right' : 'left'} ${c.shown.toFixed(2)} s` : 'none'}`);
      };
      const end = r.stage.exitTotemX;
      const hopEvery = Math.round(every * 30);
      let bestAt = 0, best = p.x;
      for (let i = 0; i < 30 * 300 && p.x < end - 60; i++) {
        e.lives = 9;
        const stuck = r.t - bestAt > 2;
        const k = i % hopEvery;
        r.frame({ right: true, press: k === 0 || (stuck && k === 9), jump: k < 16 });
        if (p.x > best + 20) {
          best = p.x;
          bestAt = r.t;
        }
        const cam = e.camera;
        for (const s of (e.enemies as Enemy[]).filter((q) => ids.has(q.id))) {
          const g = gates.get(s.id)!;
          const on = s.x - s.width / 2 >= cam.x && s.x + s.width / 2 <= cam.x + cam.viewportWidth;
          if (g.phase === 'windup') {
            const c = crouch.get(s.id);
            crouch.set(s.id, { dir: g.dir ?? 0, shown: on ? (c && c.dir === g.dir && c.shown >= 0 ? c.shown + 1 / 30 : 1 / 30) : 0 });
          }
        }
      }
      assert.ok(p.x >= end - 60, `${id}: the run stopped at ${Math.round(p.x)}`);
    }
  }
  assert.ok(hits > 5, `${hits} hits: they still come`);
  assert.deepEqual(bad, []);
});

