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
