import test from 'node:test';
import assert from 'node:assert/strict';
import { buildProtoStage, EXPERT_SECONDS, G, GRANDMA_GOAL_36, GRANDMA_GOAL_37, PROWLER_GOAL_33, PROWLER_GOAL_39 } from './protoStage.ts';
import { catchWindow } from './protoCheck.ts';
import { airStep, swingGrab, swingStep, timedLaunch, inSweetSpot, setTimedSwing } from './physics.ts';
import { inReach, vinePhase, vineSees, type ThornVine } from './thornVine.ts';
import { validateStage } from './levelCheck.ts';
import { GLOW_REACH } from './zones.ts';
import type { LevelConfig } from './types.ts';

type W3 = '3-1' | '3-2' | '3-3' | '3-4' | '3-5' | '3-6' | '3-7' | '3-8' | '3-9';
const TYPE: Record<W3, LevelConfig['objectiveType']> = { '3-1': 'sprint', '3-2': 'stealth', '3-3': 'purge', '3-4': 'ascent', '3-5': 'stealth', '3-6': 'relic_hunt', '3-7': 'relic_hunt', '3-8': 'vine_runner', '3-9': 'gauntlet' };
const cfg = (id: W3): LevelConfig =>
  ({
    worldIndex: 3, miniIndex: Number(id.split('-')[1]), id, name: id, objectiveType: TYPE[id], targetCount: 1, timeLimit: 0, levelWidth: 9000,
    levelHeight: 900, description: '', unlocked: true, completed: false, stars: 0, highScore: 0, bestTime: 0,
  }) as LevelConfig;
const SEEDS = Array.from({ length: 16 }, (_, i) => 1 + i * 37);
const PLANS: W3[] = ['3-1', '3-2', '3-3', '3-4', '3-5', '3-6', '3-7', '3-8', '3-9'];

/**
 * 3-8's liana chains are checked as they are built (protoCheck.ts: every vine catches the next), not by the reachability check, which
 * models one liana from ledge to ledge: for that check a stand-in bridge spans each chain, as World 2's tests do for 2-7.
 */
function bridged(st: ReturnType<typeof buildProtoStage>) {
  const xs = st.vines.filter((v) => v.isSwingingVine).map((v) => v.x).sort((a, b) => a - b);
  const spans: number[][] = [];
  for (const vx of xs) {
    const l = spans[spans.length - 1];
    if (l && vx - l[1] < 420) l[1] = vx;
    else spans.push([vx, vx]);
  }
  const bridges = spans.map((sp, i) => ({ id: 90000 + i, x: sp[0] - 260, y: G, width: sp[1] - sp[0] + 520, height: 20, type: 'solid' as const }));
  return { stage: { ...st, platforms: [...st.platforms, ...bridges] }, bridges };
}
function check(plan: W3, st: ReturnType<typeof buildProtoStage>) {
  if (plan !== '3-8') return validateStage(st);
  const { stage, bridges } = bridged(st);
  const res = validateStage(stage);
  // (the flowers along a swing are on its flight, not on the stand-in bridge)
  res.errors = res.errors.filter((e) => {
    const m = e.match(/^flower #\d+ at \((\d+), \d+\) is out of reach$/);
    return !(m && bridges.some((b) => Number(m[1]) > b.x - 60 && Number(m[1]) < b.x + b.width + 60));
  });
  res.ok = res.errors.length === 0;
  return res;
}

test('World 3 trio: every roll passes the reachability check, has one exit, and is at least two minutes for a quick player', () => {
  for (const plan of PLANS) {
    for (const s of SEEDS) {
      const st = buildProtoStage(cfg(plan), s, plan);
      const res = check(plan, st);
      assert.ok(res.ok, `${plan} seed ${s}: ${res.errors.join('; ')}`);
      assert.equal(st.collectibles.filter((c) => c.type === 'exit_totem').length, 1, `${plan} seed ${s}`);
      // (3-4 is World 1's climb, 1-4, up the sinkhole: timed the way 1-4 is, a little under two minutes for a quick climber)
      assert.ok(st.meta!.timing!.layoutSeconds >= (plan === '3-4' ? EXPERT_SECONDS - 20 : EXPERT_SECONDS), `${plan} seed ${s}: ${Math.round(st.meta!.timing!.layoutSeconds)} s`);
      assert.ok((st.proto.w3decor ?? []).length > 10, `${plan} seed ${s}: the grotto is undressed`);
    }
  }
});

test('World 3 trio: the beats are always there, in order', () => {
  const want: Record<W3, string[]> = {
    '3-1': ['Start', 'Learn', 'Develop', 'Twist', 'Finish'],
    '3-2': ['Start', 'Learn', 'Develop', 'Twist', 'Finish'],
    '3-3': ['Start', 'Learn', 'Develop', 'Twist', 'Finish'],
    '3-4': ['Learn', 'Test', 'Twist', 'Finish'],
    '3-5': ['Start', 'Learn', 'Develop', 'Twist', 'Finish'],
    '3-6': ['Start', 'Learn', 'Develop', 'Twist', 'Finish'],
    '3-7': ['Start', 'Learn', 'Develop', 'Twist', 'Finish'],
    '3-8': ['Start', 'Learn', 'Develop', 'Twist', 'Finish'],
    '3-9': ['Start', 'Learn', 'Develop', 'Twist', 'Finish'],
  };
  for (const plan of PLANS) for (const s of SEEDS.slice(0, 6)) {
    assert.deepEqual(buildProtoStage(cfg(plan), s, plan).proto.beats.map((b) => b[2].split(':')[0]), want[plan], `${plan} seed ${s}`);
  }
});

test('World 3 dark: the glowworms are asleep, one hangs over the way in, and one stop always lights the next gap', () => {
  for (const plan of PLANS) {
    for (const s of SEEDS) {
      const st = buildProtoStage(cfg(plan), s, plan);
      const darks = (st.zones ?? []).filter((z) => z.kind === 'dark');
      if (plan === '3-1' || plan === '3-2') assert.ok(darks.length >= 2, `${plan} seed ${s}: ${darks.length} dark stretches`);
      for (const z of darks) {
        const ls = z.lights ?? [];
        assert.ok(ls.length && ls.every((l) => l.sleep && l.id !== undefined), `${plan} seed ${s}: a light that is not a glowworm`);
        assert.ok(ls.some((l) => l.x < z.x0 + 400), `${plan} seed ${s}: nothing to wake at the way into the dark at ${Math.round(z.x0)}`);
        // standing anywhere on the floor of the dark, the next glowworm ahead is within reach of a stop
        const xs = ls.map((l) => l.x).sort((a, b) => a - b);
        for (let i = 1; i < xs.length; i++) assert.ok(xs[i] - xs[i - 1] < GLOW_REACH.ahead, `${plan} seed ${s}: ${xs[i] - xs[i - 1]} px between glowworms`);
      }
      const ids = darks.flatMap((z) => z.lights!.map((l) => l.id));
      assert.equal(new Set(ids).size, ids.length, `${plan} seed ${s}: two glowworms share an id`);
    }
  }
});

test('3-2: the eyes watch the ferns, and every fern in the dark stands where he stops before a gap', () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg('3-2'), s, '3-2');
    const ferns = st.proto.bushes ?? [];
    assert.ok(ferns.length >= 8 && ferns.every((b) => b.kind === 'grotto'), `seed ${s}`);
    assert.ok((st.proto.watch ?? []).length >= 3, `seed ${s}`);
    // every watched stretch has somewhere to hide
    for (const w of st.proto.watch!) assert.ok(ferns.some((b) => b.x > w.x0 && b.x < w.x1), `seed ${s}: a watched stretch with no fern`);
  }
});

test('3-3: about one and a half times the prowlers it asks for, and jaguars among them', () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg('3-3'), s, '3-3');
    const prowlers = st.enemies.filter((e) => e.type === 'ocelot' || e.type === 'jaguar');
    assert.equal(st.config.targetCount, PROWLER_GOAL_33);
    assert.ok(prowlers.length >= Math.ceil(PROWLER_GOAL_33 * 1.5), `seed ${s}: ${prowlers.length} prowlers`);
    assert.ok(prowlers.some((e) => e.type === 'jaguar'), `seed ${s}: no jaguar`);
  }
});

test('thorn vines: asleep, then a warning, then a look; a look sees him only moving within its reach', () => {
  const v: ThornVine = { x: 1000, top: G - 470, bud: G - 112, reach: 105, sleep: 4, stir: 1.1, look: 1.7, offset: 0 };
  assert.equal(vinePhase(v, 1).phase, 'sleep');
  assert.equal(vinePhase(v, 4.5).phase, 'stir');
  assert.equal(vinePhase(v, 5.5).phase, 'look');
  assert.equal(vinePhase(v, 7).phase, 'sleep');
  const t = 5.5;
  const at = (x: number, vx: number, grounded = true, ducking = false) => vineSees(v, t, { x, y: G, vx, grounded, ducking });
  assert.ok(at(1050, 200), 'running under it');
  assert.ok(!at(1050, 0), 'standing still');
  assert.ok(!at(1050, 200, true, true), 'ducking');
  assert.ok(at(1050, 0, false), 'in the air');
  assert.ok(!at(1300, 200), 'out of reach');
  assert.ok(!vineSees(v, 2, { x: 1050, y: G, vx: 200, grounded: true }), 'asleep');
  assert.ok(!inReach(v, 1050, G + 130 + 20), 'down in a pit');
});

test('3-5: rows of vines with room to freeze between them, and the medal in a Hush Fern', () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg('3-5'), s, '3-5');
    const vs = (st.proto.thorns ?? []).sort((a, b) => a.x - b.x);
    assert.ok(vs.length >= 12, `seed ${s}: ${vs.length} vines`);
    // two vines' reaches never meet: there is always somewhere to stand still
    for (let i = 1; i < vs.length; i++) assert.ok(vs[i].x - vs[i - 1].x > vs[i].reach + vs[i - 1].reach + 60, `seed ${s}: vines at ${vs[i - 1].x} and ${vs[i].x}`);
    // a flag never under a vine
    for (const c of st.checkpoints ?? []) assert.ok(vs.every((v) => Math.abs(v.x - c.x) > v.reach + 40), `seed ${s}: a flag under a vine at ${c.x}`);
    assert.equal(st.collectibles.filter((c) => c.type === 'find' && c.hidden && c.findId === 'w3_keepsake').length, 1, `seed ${s}`);
  }
});

test("3-6: Grandma's things hidden in ferns, more than it asks for, each one in a fern of its own", () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg('3-6'), s, '3-6');
    const things = st.collectibles.filter((c) => c.type === 'relic');
    assert.equal(st.config.targetCount, GRANDMA_GOAL_36);
    assert.ok(things.length >= GRANDMA_GOAL_36 + 2 && things.every((c) => c.hidden && c.thing), `seed ${s}: ${things.length}`);
    for (const c of things) assert.ok(!st.collectibles.some((f) => f.type === 'flower' && Math.hypot(f.x - c.x, f.y - c.y) < 60), `seed ${s}: a flower in the fern at ${c.x}`);
  }
});

test('3-2 holds World 3\'s note in plain sight', () => {
  for (const s of SEEDS.slice(0, 6)) {
    const st = buildProtoStage(cfg('3-2'), s, '3-2');
    assert.equal(st.collectibles.filter((c) => c.type === 'find' && !c.hidden && c.findId === 'w3_note').length, 1, `seed ${s}`);
  }
});

test("3-7: more of Grandma's things than it asks for, some under thorn vines, some where the eyes watch, and a vine never over a flag", () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg('3-7'), s, '3-7');
    const things = st.collectibles.filter((c) => c.type === 'relic');
    assert.equal(st.config.targetCount, GRANDMA_GOAL_37);
    assert.ok(things.length >= GRANDMA_GOAL_37 + 2 && things.every((c) => c.hidden && c.thing), `seed ${s}: ${things.length}`);
    const vs = st.proto.thorns ?? [];
    // a thing under a vine: searching there is keeping still (crouched), so the vine leaves him be
    assert.ok(things.some((c) => vs.some((v) => inReach(v, c.x, G))), `seed ${s}: no thing under a vine`);
    // a thing in a watched stretch, with a fern to hide in either side of it
    const watched = things.filter((c) => (st.proto.watch ?? []).some((w) => c.x > w.x0 && c.x < w.x1));
    assert.ok(watched.length >= 2, `seed ${s}: ${watched.length} things where the eyes watch`);
    for (const c of watched) {
      const ferns = (st.proto.bushes ?? []).map((b) => b.x + b.w / 2);
      assert.ok(ferns.some((f) => f < c.x && c.x - f < 450) && ferns.some((f) => f > c.x && f - c.x < 450), `seed ${s}: no fern near the thing at ${c.x}`);
    }
    for (const c of st.checkpoints ?? []) assert.ok(vs.every((v) => Math.abs(v.x - c.x) > v.reach + 40), `seed ${s}: a flag under a vine at ${c.x}`);
    for (let i = 1; i < vs.length; i++) {
      const [a, b] = [vs[i - 1], vs[i]].sort((p, q) => p.x - q.x);
      assert.ok(b.x - a.x > a.reach + b.reach + 60 || Math.abs(a.bud - b.bud) > 100, `seed ${s}: vines at ${a.x} and ${b.x}`);
    }
  }
});

test('3-8: a thorn vine in every gap of a liana chain, and a leap through it while it looks is seen', () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg('3-8'), s, '3-8');
    const lianas = st.vines.filter((v) => v.isSwingingVine).sort((a, b) => a.x - b.x);
    const vs = st.proto.thorns ?? [];
    let gaps = 0;
    for (let k = 0; k + 1 < lianas.length; k++) {
      const [A, B] = [lianas[k], lianas[k + 1]];
      if (B.x - A.x > 420) continue;
      gaps++;
      const v = vs.find((t) => t.x > A.x && t.x < B.x);
      assert.ok(v, `seed ${s}: no thorn vine between the lianas at ${A.x} and ${B.x}`);
      // every leap that catches B passes through its reach, and catching B takes him out of it
      const sw = swingGrab({ x: A.x - 40, y: A.topY + 280, vx: 300, vy: 100 }, A);
      let leaps = 0, seen = 0;
      for (let f = 0; f < 240; f++) {
        const r = swingStep(sw, A, 1 / 30, 1, 0);
        if (f < 60 || !inSweetSpot(sw, 1)) continue;
        const l = timedLaunch(sw, 1);
        const c = { x: r.x, y: r.y, vx: l.vx, vy: l.vy };
        let through = false;
        for (let i = 0; i < 45; i++) {
          airStep(c, 1 / 30, 1);
          if (inReach(v!, c.x, c.y)) through = true;
          if (Math.abs(c.x - B.x) < 40) break;
        }
        leaps++;
        if (through) seen++;
      }
      assert.ok(leaps > 0 && seen === leaps, `seed ${s}: ${seen} of ${leaps} leaps pass the vine at ${v!.x}`);
      assert.ok(!inReach(v!, B.x, B.topY + 300) && !inReach(v!, A.x, A.topY + 300), `seed ${s}: a liana within the vine's reach`);
      // on a liana he is out of its sight, however it swings
      assert.ok(!vineSees(v!, v!.sleep + v!.stir + 0.5 - v!.offset, { x: v!.x, y: v!.bud + 50, vx: 300, grounded: false, swinging: true }));
    }
    assert.ok(gaps >= 8, `seed ${s}: ${gaps} gaps with vines`);
    assert.equal(st.collectibles.filter((c) => c.type === 'find' && c.hidden && c.findId === 'w3_book').length, 1, `seed ${s}: the photo album`);
  }
});

test('3-8 on Easy: the slower swing still carries every liana to the next', () => {
  setTimedSwing(true);
  try {
    for (const s of SEEDS.slice(0, 6)) {
      const lianas = buildProtoStage(cfg('3-8'), s, '3-8').vines.filter((v) => v.isSwingingVine).sort((a, b) => a.x - b.x);
      for (let k = 0; k + 1 < lianas.length; k++) if (lianas[k + 1].x - lianas[k].x < 420) assert.ok(catchWindow(lianas[k], lianas[k + 1]) > 0.6, `seed ${s}: ${lianas[k].x}`);
    }
  } finally {
    setTimedSwing(false);
  }
});

test("3-9: enough prowlers for the goal, a jaguar among them, and a ring whose waves leap in from the dark", () => {
  for (const s of SEEDS) {
    const st = buildProtoStage(cfg('3-9'), s, '3-9');
    const prowlers = st.enemies.filter((e) => e.type === 'ocelot' || e.type === 'jaguar');
    assert.equal(st.config.targetCount, PROWLER_GOAL_39);
    assert.ok(prowlers.length >= Math.ceil(PROWLER_GOAL_39 * 1.4), `seed ${s}: ${prowlers.length} prowlers`);
    assert.ok(prowlers.some((e) => e.type === 'jaguar'), `seed ${s}: no jaguar`);
    const ring = st.proto.ring!;
    assert.ok(ring && ring.waves.length === 3, `seed ${s}: no ring`);
    assert.ok(ring.waves.flat().every((d) => d.kind === 'ocelot' || d.kind === 'jaguar') && ring.waves[2].some((d) => d.kind === 'jaguar'), `seed ${s}`);
    // every leap lands on something inside the ring
    for (const d of ring.waves.flat()) {
      assert.ok(d.x > ring.x0 + 60 && d.x < ring.x1 - 60, `seed ${s}: a prowler lands outside the ring at ${d.x}`);
      assert.ok(st.platforms.some((p) => d.x >= p.x && d.x <= p.x + p.width && Math.abs(p.y - d.surface) < 2), `seed ${s}: nothing under ${d.x}`);
    }
    // the wall is real, and a flag waits beyond it
    assert.ok(st.platforms.some((p) => p.id === ring.wallId));
    assert.ok((st.checkpoints ?? []).some((c) => c.x > ring.x1), `seed ${s}`);
  }
});
