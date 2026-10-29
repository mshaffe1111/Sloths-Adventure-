/**
 * The QA batch of 2026-10-29 on Worlds 1-3 (reference/STATUS.md, the QA checklist's rule numbers): one regression test per finding
 * that can be one, each failing on the stages as they were before the fix.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, G } from './protoStage.ts';
import { buildW2Stage, ISLAND_TOP } from './w2Stages.ts';
import { w2Picks } from './w2Sections.ts';
import { easyStage } from './easyMode.ts';
import { withGoals } from './goals.ts';
import { reachJump } from './physics.ts';
import { RealPlay } from './realPlay.ts';
import { setDifficulty } from './difficulty.ts';
import { pickLesson } from './lessons.ts';
import { harmlessPass, newWatch, stepWatch, type WatchZone } from './watcher.ts';
import type { LevelConfig, Platform } from './types.ts';

const cfg = (id: string, type: LevelConfig['objectiveType']): LevelConfig =>
  ({
    worldIndex: Number(id[0]), miniIndex: Number(id.split('-')[1]), id, name: id, objectiveType: type, targetCount: 1, timeLimit: 0, levelWidth: 9000,
    levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
  }) as LevelConfig;
const ROLLS = Array.from({ length: 24 }, (_, i) => 1 + i);
const DEEP_TIP = 'No moss down there. Jump true!';

/** the stretches of a stage's path where nothing stands above the water (a fall there costs a life): [x0, x1] */
function deepGaps(platforms: Platform[], x0: number, x1: number, water: number): Array<[number, number]> {
  const out: Array<[number, number]> = [];
  let from: number | null = null;
  for (let x = x0; x <= x1; x += 2) {
    const dry = platforms.some((p) => p.type !== 'bouncy' && x >= p.x && x <= p.x + p.width && p.y < water - 8);
    if (!dry && from === null) from = x;
    if (dry && from !== null) {
      out.push([from, x]);
      from = null;
    }
  }
  return out;
}

// QA 1 (rule 2): 3-1's first water came 12-16% in with no tip before it (Dot's line waited behind the spores' and the lessons), as a
// 56-64 px slot just out of the spore cloud; plain hops lost all three lives in about 10 s on ?layout=1 and 7
test('3-1: the first water is taught well before it, and is one plain level jump with a wide landing (every roll, Normal and Easy)', () => {
  for (const s of ROLLS) {
    for (const easy of [false, true]) {
      const built = withGoals(buildProtoStage(cfg('3-1', 'sprint'), s, '3-1'));
      const st = easy ? easyStage(built) : built;
      const water = st.waterY!;
      const gaps = deepGaps(st.platforms, st.spawnX, st.exitTotemX, water);
      assert.ok(gaps.length > 0, `roll ${s}: 3-1 has water`);
      const [edge, far] = gaps[0];
      const tip = st.proto!.hints.find((h) => h.text === DEEP_TIP);
      assert.ok(tip, `roll ${s}: Dot's water line is in the stage`);
      assert.ok(tip!.x <= edge - 1200, `roll ${s}${easy ? ' Easy' : ''}: Dot's water line ${Math.round(edge - tip!.x)} px before the first water (want 1200+)`);
      // (nothing else of Dot's comes between her water line and the water: the spores' line comes after it)
      const between = st.proto!.hints.filter((h) => h.x > tip!.x && h.x < edge);
      assert.deepEqual(between.map((h) => h.text), [], `roll ${s}: no other line of Dot's between the water line and the water`);
      const w = far - edge;
      assert.ok(w >= 64 && w <= reachJump(0, false) * 0.46, `roll ${s}: the first water is ${w} px across (a plain jump, wide enough to see)`);
      const near = st.platforms.find((p) => Math.abs(p.x + p.width - edge) <= 2 && p.y < water - 8)!;
      const land = st.platforms.find((p) => Math.abs(p.x - far) <= 2 && p.y < water - 8)!;
      assert.ok(near && land, `roll ${s}: banks either side of the first water`);
      assert.equal(near.y, G, `roll ${s}: taken off from the floor`);
      assert.equal(land.y, G, `roll ${s}: a level landing`);
      assert.ok(land.width >= 330, `roll ${s}: a wide landing (${land.width} px)`);
      // no spore cloud and no dark anywhere near it
      for (const z of st.zones ?? []) assert.ok(z.x1 < tip!.x - 100 || z.x0 > far + 300, `roll ${s}: a ${z.kind} zone at ${Math.round(z.x0)}-${Math.round(z.x1)} near the first water`);
    }
  }
});

test('3-1: in the real engine a short running flick clears the first water, and walking off it costs the life (it is real water)', () => {
  setDifficulty('normal');
  for (const s of [1, 7, 12]) {
    const r = new RealPlay('3-1', s);
    const st = r.stage;
    const [edge, far] = deepGaps(r.platforms, st.spawnX, st.exitTotemX, st.waterY!)[0];
    for (const at of [-60, -30, 0]) {
      r.stand(edge - 260, G);
      r.died = false;
      let pressed = false;
      let held = 0;
      for (let i = 0; i < 90 && !r.died; i++) {
        const pad: Record<string, boolean> = { right: true };
        if (!pressed && r.p.x >= edge + at) {
          pressed = true;
          pad.press = pad.jump = true;
        } else if (pressed && held < 0.07) pad.jump = true;
        if (pressed) held += 1 / 30;
        r.frame(pad);
      }
      assert.ok(!r.died && r.p.x > far, `roll ${s}: a 0.07 s flick ${at} px from the edge clears the first water`);
    }
    r.stand(edge - 120, G);
    r.died = false;
    for (let i = 0; i < 60 && !r.died; i++) r.frame({ right: true });
    assert.ok(r.died, `roll ${s}: a plain walk off the bank falls in`);
  }
});

// QA 2 (rules 2/3/4): 2-2's lily ponds cost Matt 14 lives, four in a row at one crossing, three of them falling with no sideways
// speed; the first five sent him back to the very start. The pads were 84-104 px, so a hop that came down past a pad's middle ran on
// off its far end, and the last hop was up onto a bank 20-34 px above the pads and stones (over the 26 px hoist): short, it met the
// bank's face and slid down it. The ponds' roll had 7000 px between flags.
const W2_ROLLS = Array.from({ length: 40 }, (_, i) => 1 + i);
const pondRolls = W2_ROLLS.filter((s) => w2Picks('2-2', s).flavour === 'ponds');

test("2-2: wide lily pads (wider still on Easy), and every crossing of pads or stones ends on a level step at the bank's foot", () => {
  assert.ok(pondRolls.length >= 3);
  for (const s of W2_ROLLS) {
    for (const easy of [false, true]) {
      const built = withGoals(buildW2Stage(cfg('2-2', 'harvest'), s, '2-2'));
      const st = easy ? easyStage(built) : built;
      for (const p of st.platforms.filter((q) => q.lily)) assert.ok(p.width >= (easy ? 164 : 124), `roll ${s}${easy ? ' Easy' : ''}: a ${p.width} px lily pad`);
      for (const r of st.rivers ?? []) {
        if (r.speed !== 0) continue;
        const inside = st.platforms.filter((p) => p.type === 'solid' && p.x > r.x0 && p.x + p.width < r.x1 && p.y < r.surfaceY + 10);
        if (inside.length < 2) continue;
        // (a crossing of pads or stones: the far end is a step at the stones' own height, and the bank a walk-up above it)
        const step = st.platforms.find((p) => Math.abs(p.x - r.x1) <= 2 && p.type === 'solid');
        assert.ok(step && step.y === ISLAND_TOP, `roll ${s}: still water at ${Math.round(r.x0)} ends on a level step (got ${step?.y})`);
        const bank = st.platforms.find((p) => Math.abs(p.x - (step!.x + step!.width)) <= 2 && p.type === 'solid');
        assert.ok(bank && step!.y - bank.y <= 22, `roll ${s}: the bank is a walk-up step above it`);
      }
    }
  }
});

test('2-2: a flag before the first water that costs a life, and never more than 4100 px between flags (every roll)', () => {
  for (const s of W2_ROLLS) {
    const st = withGoals(buildW2Stage(cfg('2-2', 'harvest'), s, '2-2'));
    const flags = (st.checkpoints ?? []).map((c) => c.x).sort((a, b) => a - b);
    const deadly = (st.rivers ?? []).filter((r) => !r.safe).sort((a, b) => a.x0 - b.x0)[0];
    assert.ok(flags[0] < deadly.x0, `roll ${s}: a flag (${flags[0]}) before the first deadly water (${Math.round(deadly.x0)})`);
    const marks = [st.spawnX, ...flags, st.exitTotemX];
    for (let i = 1; i < marks.length; i++) assert.ok(marks[i] - marks[i - 1] <= 4100, `roll ${s}: ${Math.round(marks[i] - marks[i - 1])} px between flags at ${Math.round(marks[i - 1])}`);
  }
});

test('2-2: in the real engine, a hop from each lily pad lands on the next and stays there with the thumb lifted (ponds rolls)', () => {
  setDifficulty('normal');
  for (const s of pondRolls.slice(0, 3)) {
    const r = new RealPlay('2-2', s);
    const pads = r.platforms.filter((p) => p.lily).sort((a, b) => a.x - b.x);
    let tried = 0;
    for (let i = 0; i + 1 < pads.length; i++) {
      const [a, b] = [pads[i], pads[i + 1]];
      if (b.x - (a.x + a.width) > 200) continue;
      for (const hold of [0.07, 0.15, 0.25]) {
        for (const at of [-40, -15, 5]) {
          r.stand(a.x + 20, a.y);
          r.died = false;
          let pressed = false;
          let held = 0;
          let landed = false;
          for (let f = 0; f < 70 && !r.died; f++) {
            const pad: Record<string, boolean> = {};
            if (!landed) pad.right = true;
            if (!pressed && r.p.x >= a.x + a.width + at) {
              pressed = true;
              pad.press = pad.jump = true;
            } else if (pressed && held < hold) pad.jump = true;
            if (pressed) held += 1 / 30;
            r.frame(pad);
            if (pressed && held > 0.1 && r.p.grounded) landed = true;
          }
          assert.ok(!r.died && r.standingOn === b.id, `roll ${s}: a ${hold} s hop ${at} px from pad ${i}'s end stays on pad ${i + 1} (on ${r.standingOn})`);
          tried++;
        }
      }
    }
    assert.ok(tried > 20, `roll ${s}: pads tried`);
  }
});

// QA 3 (rule 2): 1-7 at 17% and 25%: "Flick up into the trunk to grab it" did nothing at the tall root stump (six tries); the spring
// mushroom beside it is the way. The tip was Dot's climb lesson, fired on the ground beside the secret bush's trunk, hidden in the
// leaves; the next thing the player saw was the stump. The stage's way up the stump is the mushroom, so the lesson no longer fires for
// the hidden trunk (its vine starts a hop up), and a flick up from inside the bush still climbs to the secret path.
test('1-7: Dot\'s climb lesson never fires on the ground for the trunk hidden in the secret bush, and a flick up inside it still climbs', () => {
  for (const s of ROLLS) {
    const st = buildProtoStage(cfg('1-7', 'stealth'), s, '1-7');
    const bushes = st.proto.bushes ?? [];
    for (const v of st.vines.filter((q) => q.vineType === 'tree_climb')) {
      if (!bushes.some((b) => !b.hanging && v.x > b.x && v.x < b.x + b.w)) continue;
      for (const dx of [-160, -60, 0, 60, 160]) {
        const scene = {
          px: v.x + dx, py: G, view: { x0: v.x - 300, x1: v.x + 300, y0: G - 600, y1: G + 100 }, enemies: [], collectibles: [], platforms: [],
          vines: [v], checkpoints: [], rivers: [],
        };
        assert.notEqual(pickLesson(scene, new Set()), 'climb', `roll ${s}: the climb lesson fires ${dx} px from the hidden trunk at ${v.x}`);
      }
    }
  }
  setDifficulty('normal');
  for (const s of [1, 2, 3]) {
    const r = new RealPlay('1-7', s);
    const bushes = (r.e as { proto: { bushes: Array<{ x: number; w: number; hanging?: boolean }> } }).proto.bushes;
    const v = r.vines.find((q) => q.vineType === 'tree_climb' && bushes.some((b) => !b.hanging && q.x > b.x && q.x < b.x + b.w))!;
    r.stand(v.x - 10, G);
    let held = 0;
    for (let i = 0; i < 90; i++) {
      const pad: Record<string, boolean> = { up: true };
      if (i === 0) pad.press = pad.jump = true;
      else if (held < 0.15) pad.jump = true;
      held += 1 / 30;
      r.frame(pad);
    }
    assert.ok(r.p.y <= v.topY + 10, `roll ${s}: up the hidden trunk to its branch (at ${Math.round(r.p.y)}, branch ${v.topY})`);
  }
});

// QA 6 (rule 7): 1-7's "The squirrels' acorn tree! Carry one out with you." read as a must; the bot never got an acorn and walked on.
// The first stretch can be crossed without one, the second only with one: the lines say so.
test('1-7: the acorn rooms say what an acorn is for, and that the long stretch needs one', () => {
  for (const s of ROLLS) {
    const st = buildProtoStage(cfg('1-7', 'stealth'), s, '1-7');
    const rooms = (st.kit?.rooms ?? []).filter((r) => r.id.startsWith('acorns-'));
    assert.equal(rooms.length, 2, `roll ${s}: two acorn rooms`);
    assert.doesNotMatch(String(rooms[0].tips?.enter ?? ''), /Carry one out/, `roll ${s}: the first room's line is not an order`);
    assert.match(String(rooms[0].tips?.enter ?? ''), /eagle/, `roll ${s}: the first room says what an acorn does`);
    assert.match(String(rooms[1].tips?.enter ?? ''), /acorn/i, `roll ${s}: the second room says one is needed`);
  }
});

// QA 4 (above World 1's band): 1-7's eagle took hearts 5 to 1 in about 80 s on ?layout=1 upright, where the next bush was often off
// screen (an upright phone shows 416 px of the world, about 120 behind him and 290 ahead). Now in every watched stretch but the acorn
// meadow (its passes are its puzzle) a bush is always on an upright screen, the calms are longer, and the first pass over each
// stretch only warns.
test('1-7: in every watched stretch a bush is on an upright screen wherever he stands, and the first pass over each stretch only warns', () => {
  const UP_BEHIND = 120, UP_AHEAD = 290;
  for (const s of ROLLS) {
    const st = buildProtoStage(cfg('1-7', 'stealth'), s, '1-7');
    const all = (st.proto.bushes ?? []).filter((b) => !b.secret);
    for (const z of st.proto.watch ?? []) {
      if (!z.freeFirst) continue;
      assert.ok(z.calm[0] >= 7, `roll ${s}: a ${z.calm[0]} s calm at ${Math.round(z.x0)}`);
      // (from where he walks in to the stretch's first bush the first pass over it, which only warns, is the only one that can come)
      const first = Math.min(...all.filter((b) => b.x + b.w / 2 >= z.x0 && b.x + b.w / 2 <= z.x1).map((b) => b.x));
      for (let px = Math.max(z.x0, first); px <= z.x1; px += 20) {
        const seen = all.some((b) => b.x + b.w > px - UP_BEHIND && b.x < px + UP_AHEAD);
        assert.ok(seen, `roll ${s}: no bush on an upright screen at x=${px} (stretch ${Math.round(z.x0)}-${Math.round(z.x1)})`);
      }
    }
    assert.ok((st.proto.watch ?? []).filter((z) => z.freeFirst).length >= 4, `roll ${s}: freeFirst stretches`);
  }
});

test("watcher: a freeFirst stretch's first pass is harmless, its second is not, and a plain stretch is as before", () => {
  const a: WatchZone = { x0: 0, x1: 1000, calm: [3, 3], freeFirst: true };
  const b: WatchZone = { x0: 2000, x1: 3000, calm: [3, 3] };
  const c: WatchZone = { x0: 4000, x1: 5000, calm: [3, 3], freeFirst: true };
  const s = newWatch();
  const passOver = (z: WatchZone) => {
    for (let i = 0; i < 400 && s.phase !== 'pass'; i++) stepWatch(s, 0.05, z, () => 0);
    const harmless = harmlessPass(s);
    for (let i = 0; i < 400 && s.phase === 'pass'; i++) stepWatch(s, 0.05, z, () => 0);
    return harmless;
  };
  assert.equal(passOver(a), true, "the stage's first pass");
  assert.equal(passOver(a), false, 'the second over the same stretch');
  assert.equal(passOver(b), false, 'a plain stretch');
  assert.equal(passOver(c), true, 'the first over a new freeFirst stretch');
  assert.equal(passOver(c), false, 'the second over it');
});

// QA 5 (rules 7/2): 2-6 upright, 0-11%: the first ladder stood 440 px from the start, off an upright screen (it shows 70-510), so Dot's
// "Slide up a post" came as he walked past it and the floor led him away along the bank's dirt. Now it stands in view from the start,
// and a log a hop high lies on the floor just past it, so a plain walk stops beside it.
test('2-6: the first ladder is on an upright screen from the start, and a plain walk stops beside it (every roll)', () => {
  setDifficulty('normal');
  for (const s of [1, 2, 3, 7, 12]) {
    const r = new RealPlay('2-6', s);
    const st = r.stage;
    const ladder = r.vines.filter((v) => v.vineType === 'tree_climb').sort((a, b) => b.bottomY - a.bottomY)[0];
    assert.ok(ladder.x - st.spawnX <= 260, `roll ${s}: the first ladder ${Math.round(ladder.x - st.spawnX)} px from the start`);
    r.stand(st.spawnX, st.spawnY);
    for (let i = 0; i < 120; i++) r.frame({ right: true });
    assert.ok(Math.abs(r.p.x - ladder.x) < 120, `roll ${s}: a plain walk stops by the ladder (at ${Math.round(r.p.x)}, ladder ${ladder.x})`);
  }
});

// QA 5 (rules 2/7): Dot's "Up through the village! Slide up a post" came after he had walked past the ladder. Dot says nothing in a
// stage's first 2.5 s (dotGuide.ts CALM.startMs) and he reaches the ladder in 0.7 s, so the tip can only come before the climb if he is
// still standing by the ladder when it does: walked in the real engine through Dot's queue, holding right and nothing else, the first
// line about climbing (the stage's tip, or the climb lesson for a first-timer) goes up while he stands within 120 px of the ladder, on
// the floor, on every roll, Normal and Easy, upright and sideways.
test("2-6: Dot's climb line goes up while a plain walk stands by the first ladder (every roll, both settings, both views, taught or not)", async () => {
  const { GameEngine } = await import('./engine.ts');
  const { GuideQueue } = await import('./dotGuide.ts');
  const { engineGuideLine } = await import('./dotLines.ts');
  const { lessonDotLine, markLessonSeen } = await import('./lessons.ts');
  try {
    (globalThis as unknown as { window: { matchMedia: unknown } }).window.matchMedia = () => ({ matches: true });
  } catch {
    /* no window */
  }
  const bad: string[] = [];
  for (const diff of ['normal', 'easy'] as const) {
    setDifficulty(diff);
    for (const view of [[390, 844], [844, 390]] as const) {
      for (const taught of [false, true]) {
        for (const s of [1, 2, 3, 7, 12]) {
          localStorage.clear();
          if (taught) markLessonSeen('climb');
          Object.assign((globalThis as unknown as { window: object }).window, { innerWidth: view[0], innerHeight: view[1] });
          const r = new RealPlay('2-6', s);
          const e = r.e;
          const proto = GameEngine.prototype as unknown as Record<string, (...a: unknown[]) => unknown>;
          e.lessonTick = proto.lessonTick.bind(e);
          e.updateCamera = proto.updateCamera.bind(e);
          e.resizeCanvas();
          const ladder = r.vines.filter((v) => v.vineType === 'tree_climb').sort((a, b) => b.bottomY - a.bottomY)[0];
          const said: Array<{ text: string; lesson?: Parameters<typeof lessonDotLine>[0] }> = [];
          e.callbacks.onLesson = (l: Parameters<typeof lessonDotLine>[0]) => said.push({ text: '', lesson: l });
          e.callbacks.onGuide = (text: string, _s: number, passed?: boolean) => {
            if (text && !passed) said.push({ text });
          };
          const q = new GuideQueue(true);
          r.stand(r.stage.spawnX, r.stage.spawnY);
          let at: string | null = null;
          for (let i = 0; i < 12 * 30 && !at; i++) {
            r.frame({ right: true });
            for (const x of said.splice(0)) {
              const l = x.lesson ? lessonDotLine(x.lesson, 'screen') : engineGuideLine(x.text, '2-6', { dot: true });
              if (l) q.push(l, (i * 1000) / 30);
            }
            q.tick((i * 1000) / 30, { danger: false, hold: i < 45, moveCount: () => 0 });
            for (const ev of q.drain()) {
              if (ev.type !== 'start' || !/climb|post/i.test(ev.show.line.text)) continue;
              at = `"${ev.show.line.text}" at ${(i / 30).toFixed(1)} s, x ${Math.round(r.p.x)} (ladder ${ladder.x}), y ${Math.round(r.p.y)}`;
              if (Math.abs(r.p.x - ladder.x) > 120 || Math.abs(r.p.y - r.stage.spawnY) > 8 || !r.p.grounded) bad.push(`${diff} ${view.join('x')} ${taught ? 'taught' : 'first-timer'} roll ${s}: ${at}`);
            }
          }
          if (!at) bad.push(`${diff} ${view.join('x')} ${taught ? 'taught' : 'first-timer'} roll ${s}: no climb line in 12 s`);
        }
      }
    }
  }
  setDifficulty('normal');
  assert.deepEqual(bad, []);
});

// QA 5 (rule 2, "plain walk"): 2-6 ?layout=1, "plank ends walk you off to the floor": a plain walk along a porch ran off its dead end into
// a long fall, or onto the floor (where he walked off along the bank, away from the ladders). Now a mailbox on its post (a knot, as 4-6's)
// stands at each such end. Walked in the real engine from the middle of every porch, both ways, holding the one way and nothing else: no
// walk off a dead end falls 400 px or more, or onto the floor (where he first lands). (Not dead ends: a hop gap, the way on; and the
// secret side ledge, where a knot at the stub by its ladder would be a double jump up to the porch above, past the ladder, the rope and
// two porches: the level check takes it away. 0 open dead ends over rolls 1-40.)
test('2-6: a plain walk to a porch\'s dead end stops there: no fall of 400 px or more, none onto the floor (every roll, Normal and Easy)', () => {
  const bad: string[] = [];
  for (const diff of ['normal', 'easy'] as const) {
    setDifficulty(diff);
    for (const s of [1, 2, 3, 7, 12]) {
      const r = new RealPlay('2-6', s);
      const P = r.platforms;
      const floor = P.reduce((a, b) => (b.y > a.y ? b : a));
      const seeds = r.stage.collectibles.filter((c) => c.type === 'seed').map((c) => c.x);
      const secret = (p: Platform) => r.vines.some((v) => seeds.includes(v.x) && Math.abs(v.topY + 2 - p.y) < 4);
      let ends = 0;
      for (const p of P) {
        if (p === floor || p.height !== 24 || p.width < 150 || p.lip || secret(p)) continue;
        for (const side of [-1, 1] as const) {
          const end = side < 0 ? p.x : p.x + p.width;
          const hop = P.some((q) => q !== p && q.height === 24 && Math.abs(q.y - p.y) < 90 && (side > 0 ? q.x >= end && q.x - end < 200 : end >= q.x + q.width && end - (q.x + q.width) < 200));
          if (hop) continue;
          ends++;
          // (one walk off: where he first lands after leaving the porch)
          r.stand(p.x + p.width / 2, p.y);
          let left = false;
          for (let i = 0; i < 120; i++) {
            r.frame(side > 0 ? { right: true } : { left: true });
            if (!r.p.grounded) left = true;
            else if (left) break;
          }
          const fell = r.p.y - p.y;
          if (fell >= 400 || Math.abs(r.p.y - floor.y) < 4) bad.push(`${diff} roll ${s}: walking ${side > 0 ? 'right' : 'left'} on the porch at ${p.x}-${end} (y ${p.y}) fell ${Math.round(fell)} px`);
        }
      }
      assert.ok(ends > 20, `roll ${s}: ${ends} porch ends walked`);
    }
  }
  setDifficulty('normal');
  assert.deepEqual(bad, []);
});

// QA 7 (polish): 2-6 ?layout=7 at about 9%: Pokey stood a few px past a porch's end, in the air. World 2's plank is a deck seen a little
// from above: its top edge (where his feet are drawn) runs over 15-87% of the picture, its front edge the whole width, and the picture was
// stretched edge to edge on the collider, so the top edge ended 20-90 px short of each end (it grew with the plank). Fitting the top edge
// to the collider instead ran the front edges 40-60 px past each end and closed the 55-85 px hop gaps on screen (the lead's polish
// screenshots). Now the ends keep their painted size, only the middle stretches, and the collider's end sits halfway along the slant:
// on any plank length the top edge stops at most 14 px short of the end and the front edge at most 14 px past, so a 55 px hop gap still
// shows 27 px of air at the front.
test("the painted plank's slanted ends sit on the collider's ends: no 20-90 px of air at a porch's end, and a hop gap still shows", async () => {
  const { paintSpan, branchSlices } = await import('./protoArt.ts');
  // (a picture 100 x 40: empty above row 4; row 4, the top edge, painted 15 to 86; widening row by row to the whole width at row 36)
  const w = 100, h = 40, a = new Uint8ClampedArray(w * h * 4);
  for (let y = 4; y < 37; y++) {
    const u = (y - 4) / 32;
    for (let x = Math.round(15 * (1 - u)); x < Math.round(86 + 14 * u); x++) a[(y * w + x) * 4 + 3] = 255;
  }
  assert.deepEqual(paintSpan(a, w, h), { top: 0.1, l: 0.15, r: 0.86, L: 0, R: 1 });
  // World 2's plank as measured from kits/w2.webp (594 x 187), drawn 54 tall
  const span = { top: 0.032, l: 0.153, r: 0.865, L: 0.002, R: 1 };
  const at = (cs: ReturnType<typeof branchSlices>, share: number) => {
    const c = cs.find((q) => share >= q.sx - 1e-9 && share <= q.sx + q.sw + 1e-9)!;
    return c.dx + ((share - c.sx) / c.sw) * c.dw;
  };
  for (const width of [170, 190, 330, 600]) {
    const p = { x: 1000, width };
    const cs = branchSlices(p, span, 594, 187, 54);
    const topL = at(cs, span.l), topR = at(cs, span.r), frontL = at(cs, span.L), frontR = at(cs, span.R);
    assert.ok(topL - p.x <= 14 && p.x + width - topR <= 14, `a ${width} px plank: its top edge ${Math.round(topL - p.x)} / ${Math.round(p.x + width - topR)} px short of the ends`);
    assert.ok(p.x - frontL <= 14 && frontR - (p.x + width) <= 14, `a ${width} px plank: its front edge ${Math.round(p.x - frontL)} / ${Math.round(frontR - p.x - width)} px past the ends`);
    // the pieces join with no hole and no overlap
    for (let i = 1; i < cs.length; i++) assert.ok(Math.abs(cs[i].dx - (cs[i - 1].dx + cs[i - 1].dw)) < 0.01 && Math.abs(cs[i].sx - (cs[i - 1].sx + cs[i - 1].sw)) < 1e-9);
  }
  // (no measure, as on a device with no canvas to measure on: the whole picture, as before)
  assert.deepEqual(branchSlices({ x: 100, width: 200 }, null, 594, 187, 54), [{ sx: 0, sw: 1, dx: 94, dw: 212 }]);
});

// QA 8 (unverified, 3-3 Easy: "0 of 7 predators" never moved while taps scored): the counter counts knock-outs (engine.ts knockOut, the
// only way an animal is beaten), and it says so ("N of 7 predators"). Checked in the real engine, and on the page (the counter's label
// went 1, 2, 3 of 7 as three prowlers went down, the score 600, 1,200, 1,850). Both ways a thumb beats a prowler (a tap, which beside
// an animal throws the kick, and a flick) count on Easy, every prowler of the roll.
test('3-3 Easy: every prowler beaten by a tap or a flick counts toward the goal (rolls 1-3)', () => {
  setDifficulty('easy');
  for (const s of [1, 2, 3]) {
    for (const move of ['tap', 'flick'] as const) {
      const r = new RealPlay('3-3', s);
      r.e.damagePlayer = () => {};
      const foes = r.e.enemies.filter((e: { type: string }) => e.type === 'ocelot' || e.type === 'jaguar');
      assert.ok(foes.length >= r.stage.config.targetCount, `roll ${s}: ${foes.length} prowlers for a goal of ${r.stage.config.targetCount}`);
      for (const f of foes) {
        for (let k = 0; k < 30 && !f.defeated; k++) {
          r.stand(f.x - 45, f.y + 14);
          r.p.facing = 1;
          r.frame(move === 'tap' ? { punch: true } : { kick: 1 });
          for (let i = 0; i < 8; i++) r.frame({});
        }
        assert.ok(f.defeated, `roll ${s}: a ${f.type} at ${Math.round(f.x)} beaten by ${move}s`);
      }
      assert.equal(r.p.enemiesDefeated, foes.length, `roll ${s}: ${move}s: the count`);
    }
  }
  setDifficulty('normal');
});
