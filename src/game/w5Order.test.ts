/**
 * World 5's teaching order (QA, a blind first-timer at 320x782, 2026-10-26). Played in the real engine (realPlay.ts) by a player who
 * holds right from the very first frame, hopping only what is in the way: every first-time line about a thing comes before that thing
 * is within his reach, in the old look (the banner shows an engine line the moment it is sent) and in the new one (the line goes
 * through Dot's queue, dotGuide.ts, as components/dot/DotGuide.tsx queues it: the goal card first, a story aside in the way, no line
 * starting with an animal at hand). And the steps: nothing before the second jump is taught needs more than one plain jump (1-1's
 * stepping-stone numbers), and the stuck-helper still speaks at a step in World 5, over the silk's warning.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { G, buildProtoStage, HAND_STAGES } from './protoStage.ts';
import { levelConfig } from './realPlay.ts';
import { GuideQueue, type MoveId } from './dotGuide.ts';
import { engineGuideLine } from './dotLines.ts';
import { DANGER } from './dotGuideWatch.ts';
import { W5_TEACH, type W5Extras } from './w5Kit.ts';
import { W5_HINTS, W5_STEP_HELP, W5_STEP_HELP_KEYS, W5_STEP_HELP_PAD } from './w5Lines.ts';
import { W5_PLAIN_STUMPS, type W5Info } from './w5Stages.ts';
import { stuckLine } from './stuckHelper.ts';
import { reachJump } from './physics.ts';
import { validateStage } from './levelCheck.ts';

/** "within reach": this close (px) ahead of him, a thing can be touched or must be jumped now */
const REACH = 250;
/** a player who moves at once sends the goal card to its counter about this soon (GoalCard.tsx: armed at 0.9 s, 0.48 s to shrink) */
const CARD_MS = 1500;
const STEP_LINES = [W5_STEP_HELP, W5_STEP_HELP_PAD, W5_STEP_HELP_KEYS];
const WALL_LINES = [stuckLine('screen'), stuckLine('pad'), stuckLine('keys')];

type Built = ReturnType<typeof buildProtoStage> & { w5info: W5Info; proto: { w5: W5Extras } };
const build = (id: '5-1' | '5-2', s: number) => buildProtoStage(levelConfig(id), s, HAND_STAGES[id]) as Built;
const SEEDS = Array.from({ length: 16 }, (_, i) => 1 + i * 37);
// (a phone: the lines in their touch words, lessons.ts lessonInputMode)
try {
  const w = globalThis as unknown as { window?: { matchMedia?: unknown } };
  if (w.window) w.window.matchMedia = () => ({ matches: true });
} catch {
  /* no window */
}

/** a first-timer: no tip of the stage heard on this phone yet (tipMemory.ts) */
function forgetTips(id: string) {
  try {
    localStorage.removeItem(`sloth_tips_${id}`);
  } catch {
    /* no storage */
  }
}

interface Frame { t: number; x: number; danger: boolean; moves: Record<'jump' | 'double' | 'run', number> }
interface Said { text: string; x: number; t: number }

/**
 * Hold right from the first frame to `untilX`, hopping what is in the way as he comes to it (a face, the end of the ground, a spider,
 * a thread, a cake), with a second jump at the top of a hop only where one jump will not do (a face taller than one jump, a gap
 * wider than one): a first-timer's thumb, up and over. He does not punch, so he
 * walks into the Butler's tray. Each frame keeps when it was, where he was, whether an animal was at hand (dotGuideWatch.ts inDanger:
 * no new line but a warning starts then) and the moves done so far (the queue's move counter).
 */
function holdRight(id: '5-1' | '5-2', seed: number, untilX: number) {
  forgetTips(id);
  const sim = new RealPlay(id, seed);
  const w5 = (sim.stage as unknown as { proto: { w5: W5Extras } }).proto.w5;
  const gaps = (sim.stage as unknown as { w5info: W5Info }).w5info.gaps;
  const frames: Frame[] = [];
  const moves = { jump: 0, double: 0, run: 0 };
  let ran = 0, lastX = sim.p.x, hold = 0, second = false, wasDbl = false, needs2 = false;
  const inWay = (x: number, lo: number, hi: number) => x - sim.p.x > lo && x - sim.p.x < hi;
  for (let i = 0; i < 30 * 200 && sim.p.x < untilX; i++) {
    const p = sim.p;
    let press = false;
    if (p.grounded) {
      second = false;
      const face = sim.platforms.some((q) => q.type === 'solid' && !q.broken && inWay(q.x, 0, 70) && q.y < p.y - 12 && q.y > p.y - 220 && q.y + q.height > p.y - 4);
      const floor = sim.platforms.some((q) => !q.broken && Math.abs(q.y - p.y) < 3 && q.x <= p.x + 40 && q.x + q.width >= p.x + 40);
      const thing = sim.e.enemies.some((e: { defeated: boolean; x: number; y: number }) => !e.defeated && inWay(e.x, 30, 110) && Math.abs(e.y + 12 - p.y) < 60)
        || (w5.threads ?? []).some((t) => inWay(t.x0, 40, 100) && Math.abs(t.y - p.y) < 60)
        || (w5.cakes ?? []).some((c) => inWay(c.x, 20, 80) && Math.abs(c.y - p.y) < 60);
      if ((face || !floor || thing) && hold <= 0) {
        press = true;
        hold = 9;
        moves.jump++;
        // (one jump will not do: a face taller than it, or no ground at this height for a running jump's length)
        const tall = sim.platforms.some((q) => q.type === 'solid' && !q.broken && inWay(q.x, 0, 90) && q.y < p.y - 95 && q.y > p.y - 220 && q.y + q.height > p.y - 4);
        const far = !floor && gaps.some((g) => g.double && inWay(g.edge, -10, 90) && Math.abs(p.y - G) < 3);
        needs2 = tall || far;
      }
    } else if (needs2 && !second && p.vy > -80 && hold <= 4) {
      press = true;
      second = true;
      hold = 6;
    }
    if (p.grounded && Math.abs(p.vx) > 60) {
      ran += Math.abs(p.x - lastX);
      if (ran >= 150) {
        moves.run++;
        ran = 0;
      }
    }
    lastX = p.x;
    sim.frame({ right: true, press, jump: hold > 0 });
    if (sim.p.isDoubleJumping && !wasDbl) moves.double++;
    wasDbl = !!sim.p.isDoubleJumping;
    hold--;
    const q = sim.p;
    const danger = sim.e.enemies.some((e: { defeated: boolean; x: number; y: number }) => !e.defeated && Math.abs(e.x - q.x) < DANGER.foeDx && Math.abs(e.y - q.y) < DANGER.foeDy)
      || (!q.grounded && !q.climbing && q.vy > DANGER.fallVy);
    frames.push({ t: sim.t, x: q.x, danger, moves: { ...moves } });
  }
  return { sim, frames, said: sim.said as Said[] };
}

/**
 * The new look: the engine's lines through Dot's queue, as the app queues them, frame by frame. The goal card holds the queue for its
 * first moments, and a story aside (the stage's lead-in) is pushed first, in the way. Returns when each line first went up (x, t).
 */
function newLookShown(id: string, run: ReturnType<typeof holdRight>): Map<string, { x: number; t: number }> {
  const q = new GuideQueue();
  const shown = new Map<string, { x: number; t: number }>();
  const lines = run.said.map((s) => ({ s, l: engineGuideLine(s.text, id, { dot: true }) }));
  const t0 = run.frames[0].t;
  const ms = (t: number) => (t - t0) * 1000;
  q.push({ key: 'story:L', text: 'Dot\'s lead-in to the stage, a story aside in the way', kind: 'story', who: 'Dot', source: 'story' }, 0);
  let k = 0;
  for (const f of run.frames) {
    while (k < lines.length && lines[k].s.t <= f.t + 1e-6) {
      const l = lines[k].l;
      if (l) q.push(l, ms(lines[k].s.t));
      k++;
    }
    q.tick(ms(f.t), { danger: f.danger, hold: ms(f.t) < CARD_MS, moveCount: (m: MoveId) => (f.moves as Record<string, number>)[m] ?? 0 });
    for (const ev of q.drain()) {
      if (process.env.W5_ORDER_DEBUG === "2") console.log("   ev", ev.type, f.t.toFixed(1), Math.round(f.x), ev.show.line.key.slice(0, 40), ev.type === "end" ? ev.why : "", f.danger ? "DANGER" : "");
      if (ev.type === 'start' && !shown.has(ev.show.line.key)) shown.set(ev.show.line.key, { x: f.x, t: f.t });
    }
  }
  return shown;
}

/** when the engine sent a line (old look: it is on screen from then) */
const sentAt = (said: Said[], text: string) => said.find((s) => s.text === text);
const keyOf = (id: string, text: string) => engineGuideLine(text, id, { dot: true })!.key;

/** the first-time lines of a stage, each with the x of the first thing it is about */
function lessonsOf(id: '5-1' | '5-2', st: Built): Array<{ name: string; text: string; at: number }> {
  const w = st.proto.w5;
  const out: Array<{ name: string; text: string; at: number }> = [];
  const dl = st.w5info.doubleLesson;
  if (dl) out.push({ name: 'the second jump', text: (id === '5-1' ? W5_HINTS.s51double : W5_HINTS.s52double).old, at: dl.edge });
  const chair = (w.chairs ?? []).filter((c) => !c.wrapped).sort((a, b) => a.x - b.x)[0];
  if (chair) out.push({ name: 'the soft chairs', text: W5_TEACH.chair, at: chair.x });
  if (id === '5-2') {
    const thread = Math.min(...w.threads!.map((t) => t.x0));
    const cake = Math.min(...w.cakes!.map((c) => c.x));
    const sleeper = Math.min(...w.spiders!.filter((s) => s.doze).map((s) => st.enemies.find((e) => e.id === s.id)!.x));
    out.push({ name: 'the rules', text: W5_HINTS.s52rules.old, at: Math.min(thread, cake) });
    out.push({ name: 'the sleeping spiders', text: W5_HINTS.s52doze.old, at: Math.min(sleeper, thread) });
    out.push({ name: 'the threads', text: W5_TEACH.thread, at: thread });
    out.push({ name: 'the cakes', text: W5_TEACH.cake, at: cake });
    out.push({ name: 'the Butler', text: W5_TEACH.butler, at: Math.min(...w.butlers!.map((b) => b.x)) - 46 });
  }
  return out;
}

for (const id of ['5-1', '5-2'] as const) {
  test(`${id}: holding right from the start, every first-time line comes before its thing is within reach (old look and new)`, () => {
    const problems: string[] = [];
    for (const seed of process.env.W5_ORDER_SEEDS === '16' ? SEEDS : SEEDS.slice(0, 4)) {
      const st = build(id, seed);
      const ls = lessonsOf(id, st);
      const run = holdRight(id, seed, Math.max(...ls.map((l) => l.at)) + 200);
      const shown = newLookShown(id, run);
      if (process.env.W5_ORDER_DEBUG) {
        console.log(id, seed, 'ended at', Math.round(run.sim.p.x), 't', run.sim.t.toFixed(1), ls.map((l) => `${l.name}@${l.at}`).join(', '));
        for (const s of run.said) console.log('  said', s.t.toFixed(1), Math.round(s.x), s.text.slice(0, 50), '| new:', shown.get(keyOf(id, s.text))?.x.toFixed(0), shown.get(keyOf(id, s.text))?.t.toFixed(1));
      }
      for (const l of ls) {
        const s = sentAt(run.said, l.text);
        if (!s) {
          problems.push(`seed ${seed}: ${l.name}: never said`);
          continue;
        }
        if (s.x > l.at - REACH) problems.push(`seed ${seed}: ${l.name}: said at x ${Math.round(s.x)}, ${Math.round(l.at - s.x)} px before it (old look)`);
        const n = shown.get(keyOf(id, l.text));
        if (!n) problems.push(`seed ${seed}: ${l.name}: never shown in the new look`);
        else if (n.x > l.at - REACH) problems.push(`seed ${seed}: ${l.name}: shown at x ${Math.round(n.x)}, ${Math.round(l.at - n.x)} px before it (new look)`);
      }
    }
    assert.deepEqual(problems, []);
  });
}

test('5-2: the rules, then the sleeping spiders, then the threads: in that order, in both looks', () => {
  const st = build('5-2', 1);
  const run = holdRight('5-2', 1, 7000);
  const shown = newLookShown('5-2', run);
  const order = [W5_HINTS.s52rules.old, W5_HINTS.s52doze.old, W5_TEACH.thread];
  const old = order.map((t) => sentAt(run.said, t)!.t);
  const nu = order.map((t) => shown.get(keyOf('5-2', t))!.t);
  assert.ok(old[0] < old[1] && old[1] < old[2], `old look: ${old.map((t) => t.toFixed(1)).join(', ')}`);
  assert.ok(nu[0] < nu[1] && nu[1] < nu[2], `new look: ${nu.map((t) => t.toFixed(1)).join(', ')}`);
  // (and the old look's banner is not overwritten at once: each has a few seconds of its own)
  assert.ok(old[1] - old[0] > 3 && old[2] - old[1] > 2.5, `old look gaps: ${old.map((t) => t.toFixed(1)).join(', ')}`);
  void st;
});

test('the new look says a tip about a new thing even when its move was done earlier in the stage', () => {
  const q = new GuideQueue();
  const cake = engineGuideLine(W5_TEACH.cake, '5-2', { dot: true })!;
  assert.equal(cake.thing, true);
  assert.equal(cake.kind, 'teach');
  assert.equal(cake.text, 'Cakes make you slow! Flick up over them.');
  let jumps = 40;
  const env = { danger: false, moveCount: (m: MoveId) => (m === 'jump' ? jumps : 0) };
  q.push(cake, 0);
  q.tick(1000, env);
  assert.equal(q.cur?.line.key, cake.key, 'up, though he has jumped forty times');
  jumps++;
  q.tick(1400, env);
  assert.equal(q.cur?.line.key, cake.key, 'up for its minimum time');
  q.tick(2600, env);
  assert.equal(q.cur, null, 'done once he jumps (over the cakes)');
  // a plain move tip is still dropped when the move was done (QA v189)
  const q2 = new GuideQueue();
  const plain = engineGuideLine('Flick up again in the air to jump twice', '1-1', { dot: true })!;
  assert.ok(!plain.thing);
  q2.push(plain, 0);
  q2.tick(1000, { danger: false, moveCount: () => 3 });
  assert.equal(q2.cur, null);
  // the rules and the Butler: said whatever moves he knows; the rules are read, not a story aside waiting its turn
  const rules = engineGuideLine(W5_HINTS.s52rules.old, '5-2', { dot: true })!;
  assert.equal(rules.kind, 'teach');
  assert.equal(rules.move, undefined);
  const butler = engineGuideLine(W5_TEACH.butler, '5-2', { dot: true })!;
  assert.ok(butler.thing && butler.move === 'punch' && /tray away/.test(butler.text));
});

test("Matt's line rules: World 5's new tips are 8 words or fewer, and the cake and the Butler say what they do", () => {
  const words = (s: string) => s.trim().split(/\s+/).length;
  for (const text of [W5_TEACH.cake, W5_TEACH.ate, W5_TEACH.butler, W5_HINTS.s52doze.old, W5_HINTS.s51double.old, W5_HINTS.s52double.old, W5_STEP_HELP, W5_HINTS.s52rules.old]) {
    const l = engineGuideLine(text, '5-2', { dot: true }) ?? engineGuideLine(text, '5-1', { dot: true })!;
    assert.ok(words(l.text) <= 8 || l.key.endsWith('rules'), `"${l.text}" is ${words(l.text)} words`);
  }
  assert.match(engineGuideLine(W5_TEACH.cake, '5-2')!.text, /slow/i);
  assert.match(engineGuideLine(W5_TEACH.ate, '5-2')!.text, /slow/i);
  assert.match(W5_TEACH.cake, /slow/);
  assert.match(engineGuideLine(W5_TEACH.butler, '5-2')!.text, /punch his tray away/);
});

for (const id of ['5-1', '5-2'] as const) {
  test(`${id}: before the second jump is taught, every step is one plain jump high (1-1's numbers), and the lesson is at the first gap that needs it`, () => {
    for (const s of SEEDS) {
      const st = build(id, s);
      const inf = st.w5info;
      assert.ok(validateStage(st).ok, `seed ${s}`);
      const dl = inf.doubleLesson!;
      assert.ok(dl, `seed ${s}: the second jump is taught or reminded`);
      const firstDouble = inf.gaps.find((g) => g.double)!;
      assert.equal(dl.edge, firstDouble.edge, `seed ${s}: taught at the first wide gap`);
      for (const g of inf.gaps.filter((q) => q.edge < dl.edge)) assert.ok(!g.double && g.far - g.edge <= reachJump(0, false) * 0.95, `seed ${s}: a wide gap before the lesson`);
      if (id === '5-1') {
        const before = inf.stumps.filter((q) => q.x < dl.edge);
        assert.ok(before.length >= 2, `seed ${s}: stumps to practise on`);
        assert.equal(before[0].h, W5_PLAIN_STUMPS.first);
        for (const q of before) assert.ok(!q.taught && (W5_PLAIN_STUMPS.steps as readonly number[]).includes(q.h) || q.h === W5_PLAIN_STUMPS.first, `seed ${s}: a ${q.h} px stump at ${q.x}`);
        // nothing else on the way up to it is taller than a plain hop: every solid face rising from the path is 70 px or less
        for (const p of st.platforms) {
          if (p.x >= dl.edge || p.style === 'branch') continue;
          if (p.y + p.height >= G - 2 && p.y < G) assert.ok(G - p.y <= 70, `seed ${s}: a ${G - p.y} px face at ${p.x}`);
        }
      }
    }
  });
}

test('5-1 in the real engine: each stump before the lesson climbed with one plain jump (no second jump), running up to it', () => {
  for (const seed of [1, 38, 75]) {
    const st = build('5-1', seed);
    for (const q of st.w5info.stumps.filter((s) => !s.taught)) {
      const sim = new RealPlay('5-1', seed);
      sim.stand(q.x - 180, G);
      let landed = false;
      for (let i = 0; i < 60 && !landed; i++) {
        const near = q.x - sim.p.x < 70 && sim.p.grounded && sim.p.y === G;
        sim.frame({ right: true, press: near, jump: near || !sim.p.grounded });
        if (sim.p.grounded && Math.abs(sim.p.y - (G - q.h)) < 2) landed = true;
      }
      assert.ok(landed, `seed ${seed}: the ${q.h} px stump at ${q.x}, one jump`);
    }
  }
});

test('World 5: jumping again and again at a step, the stuck-helper speaks, and the silk waits while it does (5-1 and 5-2)', () => {
  for (const id of ['5-1', '5-2'] as const) {
    const st = build(id, 1);
    // a step one jump climbs (a plain stump), and one only the second jump climbs (a tall stump, after the lesson)
    const low = st.w5info.stumps.find((s) => s.h <= 100)!;
    const tall = st.w5info.stumps.find((s) => s.h > 100);
    for (const [q, line] of [[low, W5_STEP_HELP], ...(tall ? [[tall, stuckLine('keys')]] : [])] as Array<[{ x: number; h: number }, string]>) {
      const sim = new RealPlay(id, 1);
      sim.safe = false;
      // he walks up to it, and hops straight up beside it (the thumb lifted), pausing between hops as a puzzled player does
      sim.stand(q.x - 120, G);
      for (let i = 0; i < 40 && q.x - sim.p.x > 30; i++) sim.frame({ right: true });
      const hp = sim.p.hp;
      let saidAt = -1;
      for (let hop = 0; hop < 6 && saidAt < 0; hop++) {
        sim.frame({ press: true, jump: true });
        for (let i = 0; i < 4; i++) sim.frame({ jump: true });
        for (let i = 0; i < 40; i++) sim.frame();
        // (a long, puzzled pause: the silk starts to creep)
        sim.wait(2.6);
        const s = sim.said.find((x) => (line === W5_STEP_HELP ? STEP_LINES : WALL_LINES).includes(x.text));
        if (s) saidAt = s.t;
      }
      assert.ok(saidAt > 0, `${id}: the help at the ${q.h} px step is said`);
      // after it, the stillness waits: he can stand and read it, and the silk's warning does not come over it
      const n = sim.said.length;
      sim.wait(5);
      const after = sim.said.slice(n).map((s) => s.text);
      assert.ok(!after.includes(W5_TEACH.sit) && !after.includes(W5_TEACH.wrapGentle) && !after.includes(W5_TEACH.wrapped), `${id}: ${after.join(' | ')}`);
      assert.equal(sim.p.hp, hp, `${id}: no heart lost while she says it`);
      assert.equal(sim.e.w5.silk, 0, `${id}: no silk on him while she says it`);
    }
  }
});
