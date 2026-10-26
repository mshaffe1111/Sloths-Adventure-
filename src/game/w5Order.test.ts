/**
 * World 5's teaching order (QA, a blind first-timer at 320x782, 2026-10-26). Played in the real engine (realPlay.ts) by a player who
 * holds right from the very first frame, hopping only what is in the way: every first-time line about a thing comes before that thing
 * is within his reach, in the old look (the banner shows an engine line the moment it is sent) and in the new one (the line goes
 * through Dot's queue, dotGuide.ts, as components/dot/DotGuide.tsx queues it: the goal card first, the stage's story aside, no line
 * starting with an animal at hand). And the steps: nothing before the second jump is taught needs more than one plain jump (1-1's
 * stepping-stone numbers), and the stuck-helper still speaks at a step in World 5, over the silk's warning.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { RealPlay } from './realPlay.ts';
import { G, buildProtoStage, HAND_STAGES } from './protoStage.ts';
import { levelConfig } from './realPlay.ts';
import { GuideQueue, type MoveId } from './dotGuide.ts';
import { engineGuideLine, swapLine } from './dotLines.ts';
import { START_AFTER_MS, stageLine } from './wayside.ts';
import { fernLine } from './wayside.ts';
import { DANGER } from './dotGuideWatch.ts';
import { CAKE, SPIDER5, W5_TEACH, type W5Extras } from './w5Kit.ts';
import { W5_FRAMES } from './w5PropsData.ts';
import { CARD_READ_ZOOM, cardScale } from './w5Play.ts';
import { W5_HINTS, W5_STEP_HELP, W5_STEP_HELP_KEYS, W5_STEP_HELP_PAD } from './w5Lines.ts';
import { W5_POUCH } from './w5Lines.ts';
import { W5_FIRST_TALL, W5_HEART_UP, W5_PLAIN_STUMPS, type W5Info } from './w5Stages.ts';
import { stuckLine } from './stuckHelper.ts';
import { inSweetSpot, reachJump } from './physics.ts';
import type { W54Info } from './w5Stage54.ts';
import { validateStage } from './levelCheck.ts';

/** "within reach": this close (px) ahead of him, a thing can be touched or must be jumped now */
const REACH = 250;
/** a player who moves at once sends the goal card to its counter about this soon (GoalCard.tsx: armed at 0.9 s, 0.48 s to shrink) */
const CARD_MS = 1500;
const STEP_LINES = [W5_STEP_HELP, W5_STEP_HELP_PAD, W5_STEP_HELP_KEYS];
const WALL_LINES = [stuckLine('screen'), stuckLine('pad'), stuckLine('keys')];

type Built = ReturnType<typeof buildProtoStage> & { w5info: W5Info; w54info?: W54Info; proto: { w5: W5Extras } };
type Id = '5-1' | '5-2' | '5-3' | '5-4';
const build = (id: Id, s: number) => buildProtoStage(levelConfig(id), s, HAND_STAGES[id]) as Built;
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
function holdRight(id: Id, seed: number, untilX: number) {
  forgetTips(id);
  const sim = new RealPlay(id, seed);
  const w5 = (sim.stage as unknown as { proto: { w5: W5Extras } }).proto.w5;
  const gaps = (sim.stage as unknown as { w5info?: W5Info }).w5info?.gaps ?? [];
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
    } else if (p.isVineSwinging) {
      // (on a silk line, 5-4: let go well inside the sweet spot, on the way forward, as a first-timer's thumb does once shown)
      const s = { angle: p.swingAngle ?? 0, omega: p.swingAngularVelocity ?? 0, len: p.swingLength ?? 100 };
      if (hold <= 0 && inSweetSpot(s, 1) && s.angle > 0.25) {
        press = true;
        hold = 6;
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
 * first moments, and the stage's story aside (wayside.ts) comes when it is due. Returns when each line first went up (x, t).
 */
function newLookShown(id: string, run: ReturnType<typeof holdRight>): Map<string, { x: number; t: number }> {
  const q = new GuideQueue();
  const shown = new Map<string, { x: number; t: number }>();
  const lines = run.said.map((s) => ({ s, l: engineGuideLine(s.text, id, { dot: true }) }));
  const t0 = run.frames[0].t;
  const ms = (t: number) => (t - t0) * 1000;
  // the stage's own story aside (wayside.ts), queued as the app queues it once it is due
  const [world, mini] = id.split('-').map(Number);
  const way = stageLine(world, mini);
  let wayDue = !!way;
  let k = 0;
  for (const f of run.frames) {
    if (way && wayDue && ms(f.t) >= START_AFTER_MS && way.at === 'start') {
      wayDue = false;
      q.push({ key: 'story:L', text: swapLine(way.text)?.text ?? way.text, kind: 'story', who: 'Dot', source: 'story', waitMs: 60000 }, ms(f.t));
    }
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
interface Lesson {
  name: string;
  text: string;
  /** where the thing is */
  at: number;
  /** how far before it the line must be up (default REACH) */
  reach?: number;
  /** a move the line teaches: a player who has already done it this stage is not told (dotGuide.ts, QA v189) */
  move?: 'double';
}
function lessonsOf(id: Id, st: Built): Lesson[] {
  const w = st.proto.w5;
  const out: Lesson[] = [];
  const dl = st.w5info?.doubleLesson;
  if (dl) out.push({ name: 'the second jump', text: (id === '5-1' ? W5_HINTS.s51double : W5_HINTS.s52double).old, at: dl.edge, move: 'double' });
  const tl = st.w5info?.tallLesson;
  if (tl) out.push({ name: 'the tall stumps', text: (id === '5-1' ? W5_HINTS.s51tall : W5_HINTS.s52tall).old, at: tl.at, move: 'double' });
  if (id === '5-1' || id === '5-3') {
    // the first awake spider: its line before it can notice him (and, once it is on screen, crouch)
    const sp = st.enemies.filter((e) => e.type === 'spider').sort((a, b) => a.x - b.x)[0];
    out.push({ name: 'the jumping spider', text: W5_TEACH.spider, at: sp.x, reach: SPIDER5.sense });
  }
  if (id === '5-4') {
    // the first silk line, Dot's fifth rule and the first sheet, two lines in a row, the Seamstress, the high bridge, the first spider
    const inf = st.w54info!;
    const sheet0 = w.sheets![0];
    const seam = w.sheets![inf.seamSheet];
    const two = inf.chains.find((c) => c.vines.length >= 2 && !c.high)!;
    const high = inf.chains.find((c) => c.high)!;
    const step = st.platforms.find((q) => q.id === high.start)!.x - 110;
    const sp = st.enemies.filter((e) => e.type === 'spider').sort((a, b) => a.x - b.x)[0];
    out.push({ name: 'the silk line', text: W5_TEACH.silk, at: inf.firstLine.x });
    out.push({ name: "Dot's fifth rule", text: W5_HINTS.s54admire.old, at: sheet0.x0 });
    out.push({ name: 'the silk sheet', text: W5_TEACH.sheet, at: sheet0.x0 });
    out.push({ name: 'two silk lines', text: W5_HINTS.s54chain.old, at: two.edge });
    out.push({ name: 'the Seamstress', text: W5_TEACH.seamstress, at: seam.x0 });
    out.push({ name: 'the high bridge', text: W5_HINTS.s54high.old, at: step });
    out.push({ name: 'the jumping spider', text: W5_TEACH.spider, at: sp.x, reach: SPIDER5.sense });
    return out;
  }
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
  if (id === '5-3') {
    // the closing orchids: the line before the first bloom's lip, the first cake before it
    out.push({ name: 'the closing orchids', text: W5_TEACH.orchid, at: Math.min(...st.w5info.orchids.map((o) => o.x0)) });
    out.push({ name: 'the cakes', text: W5_TEACH.cake, at: Math.min(...w.cakes!.map((c) => c.x)) });
  }
  return out;
}

for (const id of ['5-1', '5-2', '5-3', '5-4'] as const) {
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
        const reach = l.reach ?? REACH;
        if (s.x > l.at - reach) problems.push(`seed ${seed}: ${l.name}: said at x ${Math.round(s.x)}, ${Math.round(l.at - s.x)} px before it (old look)`);
        const n = shown.get(keyOf(id, l.text));
        // (a move tip for a move already done this stage is rightly not said in the new look)
        const done = l.move && (run.frames.find((f) => f.t >= s.t)?.moves[l.move] ?? 0) > 0;
        if (!n && !done) problems.push(`seed ${seed}: ${l.name}: never shown in the new look`);
        else if (n && n.x > l.at - reach) problems.push(`seed ${seed}: ${l.name}: shown at x ${Math.round(n.x)}, ${Math.round(l.at - n.x)} px before it (new look)`);
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
  for (const text of [W5_TEACH.cake, W5_TEACH.ate, W5_TEACH.butler, W5_HINTS.s52doze.old, W5_HINTS.s51double.old, W5_HINTS.s52double.old, W5_HINTS.s51tall.old, W5_HINTS.s52tall.old, W5_STEP_HELP, W5_HINTS.s52rules.old]) {
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
      let landed = false, held = 0;
      for (let i = 0; i < 60 && !landed; i++) {
        const near = q.x - sim.p.x < 70 && sim.p.grounded && sim.p.y === G && held === 0;
        if (near) held = 7;
        sim.frame({ right: true, press: near, jump: held > 0 });
        held = Math.max(0, held - 1);
        // (up on it, or over it and on the ground past it: either way the one jump got him past the step)
        if (sim.p.grounded && (Math.abs(sim.p.y - (G - q.h)) < 2 || sim.p.x > q.x + 60)) landed = true;
        assert.ok(!sim.p.isDoubleJumping, 'one jump only');
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
      // (the harness turns the stuck-helper off as cosmetic, realPlay.ts: here it is what is tested)
      delete (sim.e as Record<string, unknown>).watchForStuck;
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

test('5-1, 5-2 and 5-3: the hearts at the flags float at walking height, and walking under one at 4 of 5 hearts picks it up', () => {
  for (const id of ['5-1', '5-2', '5-3'] as const) {
    for (const s of SEEDS) {
      const st = build(id, s);
      const hearts = st.collectibles.filter((c) => c.type === 'heart');
      assert.ok(hearts.length >= 3, `${id} seed ${s}`);
      for (const h of hearts) assert.ok(G - h.y <= W5_HEART_UP + 1, `${id} seed ${s}: a heart ${G - h.y} px up at ${h.x}`);
    }
    const sim = new RealPlay(id, 1);
    const h = sim.collectibles.find((c) => c.type === 'heart')!;
    sim.stand(h.x - 160, G);
    sim.p.hp = sim.p.maxHp - 1;
    for (let i = 0; i < 30; i++) sim.frame({ right: true });
    assert.ok(h.collected, `${id}: walked under the heart at ${h.x} and it was not picked up`);
  }
});

test('5-2 upright at 320x782: the first cakes come into view with time to hop them, after their line, and a hop over one lands clear of the next', () => {
  for (const seed of SEEDS.slice(0, 4)) {
    const st = build('5-2', seed);
    const cakes = st.proto.w5.cakes!.slice().sort((a, b) => a.x - b.x);
    for (let i = 1; i < cakes.length; i++) if (Math.abs(cakes[i].y - cakes[i - 1].y) < 2) assert.ok(cakes[i].x - cakes[i - 1].x >= 290, `seed ${seed}: cakes ${cakes[i].x - cakes[i - 1].x} px apart`);
    forgetTips('5-2');
    const sim = new RealPlay('5-2', seed);
    const e = sim.e;
    // (the real camera, at the phone's size: realPlay.ts turns it off)
    delete e.updateCamera;
    e.viewCssW = 320;
    e.viewCssH = 782;
    e.introT = 99;
    e.applyZoom();
    const first = cakes.slice(0, 2);
    const seenAt = new Map<number, number>();
    const leads: string[] = [];
    for (let i = 0; i < 30 * 80 && sim.p.x < first[1].x - 40; i++) {
      const p = sim.p;
      // (hold right; hop what is in the way, as the order test's player does, but not the cakes: this measures how long each is seen first)
      const face = sim.platforms.some((q) => q.type === 'solid' && q.x - p.x > 0 && q.x - p.x < 70 && q.y < p.y - 12 && q.y > p.y - 220 && q.y + q.height > p.y - 4);
      const floor = sim.platforms.some((q) => Math.abs(q.y - p.y) < 3 && q.x <= p.x + 40 && q.x + q.width >= p.x + 40);
      const foe = (e.enemies as Array<{ defeated: boolean; x: number }>).some((q) => !q.defeated && q.x - p.x > 30 && q.x - p.x < 110);
      const thread = st.proto.w5.threads!.some((t) => t.x0 - p.x > 40 && t.x0 - p.x < 100);
      sim.frame({ right: true, press: p.grounded && (face || !floor || foe || thread), jump: !p.grounded && p.vy < 0 });
      const x1 = e.camera.x + e.camera.viewportWidth;
      for (const c of first) if (!seenAt.has(c.x) && c.x + 17 < x1) seenAt.set(c.x, sim.t);
      for (const c of first) {
        const at = seenAt.get(c.x);
        if (at !== undefined && at >= 0 && sim.p.x >= c.x - 70) {
          leads.push(`${c.x}: ${(sim.t - at).toFixed(2)} s`);
          assert.ok(sim.t - at >= 0.7, `seed ${seed}: the cake at ${c.x} was on screen ${(sim.t - at).toFixed(2)} s before he had to hop it`);
          seenAt.set(c.x, -1);
        }
      }
    }
    assert.equal(leads.length, 2, `seed ${seed}: ${leads.join(', ')}`);
    if (process.env.W5_ORDER_DEBUG) console.log('cakes seen', seed, leads.join(', '));
    const said = sentAt(sim.said, W5_TEACH.cake);
    assert.ok(said && said.x < first[0].x - 400, `seed ${seed}: the cakes' line came at ${said?.x}, the first cake at ${first[0].x}`);
  }
});

// ───────────────────────────── 5-5 Caught in Silk ─────────────────────────────

/** 5-5's first-time lines, each with the x of the first thing it is about (the cocoons, the spiders, the threads, the chairs, the silk) */
function lessons55(st: Built): Lesson[] {
  const w = st.proto.w5;
  const out: Lesson[] = [];
  const first = (xs: number[]) => Math.min(...xs);
  out.push({ name: 'the cocoons', text: W5_TEACH.cocoon, at: first(w.cocoons!.map((c) => c.x)) });
  const awake = st.enemies.filter((e) => !(w.spiders ?? []).some((s) => s.id === e.id && s.doze));
  out.push({ name: 'the jumping spider', text: W5_TEACH.spider, at: first(awake.map((e) => e.x)), reach: SPIDER5.sense });
  out.push({ name: 'the threads', text: W5_TEACH.thread, at: first(w.threads!.map((t) => t.x0)) });
  const silk = st.vines.find((v) => v.silk)!;
  out.push({ name: 'the silk line', text: W5_TEACH.silk, at: silk.x });
  const chair = (w.chairs ?? []).filter((c) => !c.wrapped).sort((a, b) => a.x - b.x)[0];
  if (chair) out.push({ name: 'the soft chairs', text: W5_TEACH.chair, at: chair.x });
  return out;
}

/**
 * the new look for 5-5: as newLookShown, with the line its fern brings at the start (wayside.ts fernLine: it hides the keepsake), and
 * `tail` seconds more at the end, standing at the shrine (sealed: a player who has run past the cocoons goes back for them)
 */
function newLookShown55(run: ReturnType<typeof holdRight>, tail = 0): Map<string, { x: number; t: number }> {
  const q = new GuideQueue();
  const shown = new Map<string, { x: number; t: number }>();
  const lines = run.said.map((s) => ({ s, l: engineGuideLine(s.text, '5-5', { dot: true }) }));
  const t0 = run.frames[0].t;
  const ms = (t: number) => (t - t0) * 1000;
  const fern = fernLine(5, 5)!;
  let fernDue = true;
  let k = 0;
  for (const f of run.frames) {
    if (fernDue && ms(f.t) >= START_AFTER_MS) {
      fernDue = false;
      q.push({ key: 'story:F', text: swapLine(fern.text)?.text ?? fern.text, kind: 'info', who: 'Dot', source: 'story', waitMs: 60000 }, ms(f.t));
    }
    while (k < lines.length && lines[k].s.t <= f.t + 1e-6) {
      const l = lines[k].l;
      if (l) q.push(l, ms(lines[k].s.t));
      k++;
    }
    q.tick(ms(f.t), { danger: f.danger, hold: ms(f.t) < CARD_MS, moveCount: (m: MoveId) => (f.moves as Record<string, number>)[m] ?? 0 });
    for (const ev of q.drain()) if (ev.type === 'start' && !shown.has(ev.show.line.key)) shown.set(ev.show.line.key, { x: f.x, t: f.t });
  }
  const last = run.frames[run.frames.length - 1];
  for (let t = last.t; t < last.t + tail; t += 1 / 30) {
    q.tick(ms(t), { danger: false, moveCount: (m: MoveId) => (last.moves as Record<string, number>)[m] ?? 0 });
    for (const ev of q.drain()) if (ev.type === 'start' && !shown.has(ev.show.line.key)) shown.set(ev.show.line.key, { x: last.x, t });
  }
  return shown;
}

test('5-5: holding right from the start, every first-time line comes before its thing is within reach, the pouch scene and all', () => {
  const problems: string[] = [];
  for (const seed of process.env.W5_ORDER_SEEDS === '16' ? SEEDS : SEEDS.slice(0, 4)) {
    const st = buildProtoStage(levelConfig('5-5'), seed, HAND_STAGES['5-5']) as Built;
    const ls = lessons55(st);
    // (on to the shrine: the pouch scene, from the rest branch on, plays out over most of the stage)
    const run = holdRight('5-5' as '5-1', seed, st.exitTotemX - 100);
    // (he has run past every cocoon: the shrine is sealed, and he has a minute there, going back for them)
    const shown = newLookShown55(run, 60);
    if (process.env.W5_ORDER_DEBUG) {
      console.log('5-5', seed, 'ended at', Math.round(run.sim.p.x), Math.round(run.sim.p.y), 't', run.sim.t.toFixed(1), ls.map((l) => `${l.name}@${l.at}`).join(', '));
      for (const s of run.said) console.log('  said', s.t.toFixed(1), Math.round(s.x), s.text.slice(0, 50), '| new:', shown.get(keyOf('5-5', s.text))?.x.toFixed(0), shown.get(keyOf('5-5', s.text))?.t.toFixed(1));
    }
    for (const l of ls) {
      const s = sentAt(run.said, l.text);
      if (!s) {
        problems.push(`seed ${seed}: ${l.name}: never said`);
        continue;
      }
      const reach = l.reach ?? REACH;
      if (s.x > l.at - reach) problems.push(`seed ${seed}: ${l.name}: sent at x ${Math.round(s.x)}, ${Math.round(l.at - s.x)} px before it`);
      const n = shown.get(keyOf('5-5', l.text));
      if (!n) problems.push(`seed ${seed}: ${l.name}: never shown`);
      else if (n.x > l.at - reach) problems.push(`seed ${seed}: ${l.name}: shown at x ${Math.round(n.x)}, ${Math.round(l.at - n.x)} px before it`);
    }
    // the pouch scene: every line sent at the rest branch or after, in its order, and every one of them shown in the end
    const rest = st.proto.w5.rest!;
    const sent = W5_POUCH.map((l) => sentAt(run.said, l.text));
    sent.forEach((s, i) => {
      if (!s) problems.push(`seed ${seed}: the pouch scene's line ${i} never sent`);
      else if (s.x < rest.x0) problems.push(`seed ${seed}: the pouch scene's line ${i} before the rest branch`);
    });
    const starts = W5_POUCH.map((l) => shown.get(keyOf('5-5', l.text))?.t ?? -1);
    if (starts.some((t) => t < 0)) problems.push(`seed ${seed}: pouch lines never shown: ${starts.map((t, i) => (t < 0 ? i : '')).join(' ')}`);
    for (let i = 1; i < starts.length; i++) if (starts[i] >= 0 && starts[i - 1] >= 0 && starts[i] < starts[i - 1]) problems.push(`seed ${seed}: pouch line ${i} before line ${i - 1}`);
  }
  assert.deepEqual(problems, []);
});

// ───────────────────────────── QA 2 (Sally, 5-1 and 5-2 on v196, 320x782 upright) ─────────────────────────────

test('5-1 in the real engine: the first tall stump after the lesson is climbed by a standing double flick, however quick the second flick, and not by one jump', () => {
  for (const seed of SEEDS.slice(0, 6)) {
    const tl = build('5-1', seed).w5info.tallLesson!;
    assert.equal(tl.h, W5_FIRST_TALL, `seed ${seed}`);
    const flick = (dx: number, k: number, one = false) => {
      const sim = new RealPlay('5-1', seed);
      // (a thumb on the glass: the default jump help, jumpHelp.ts, leans a second jump taken with nothing steering)
      (sim.input as unknown as { source: string }).source = 'gesture';
      sim.stand(tl.at - dx, G);
      sim.p.facing = 1;
      sim.frame();
      for (let i = 0; i < 60; i++) {
        // (a flick holds the jump at least 220 ms, MIN_TOUCH_JUMP_HOLD_MS: 7 frames)
        if (one) sim.frame({ press: i === 0, jump: i < 30, right: true });
        else sim.frame({ press: i === 0 || i === k, jump: i < 7 || (i >= k && i < k + 7) });
        if (i > 2 && sim.p.grounded) return Math.abs(sim.p.y - (G - W5_FIRST_TALL)) < 2;
      }
      return false;
    };
    // right next to it, or a step back; the second flick 67 ms to a third of a second after the first
    for (const dx of [24, 60]) for (const k of [2, 3, 4, 6, 8, 10]) assert.ok(flick(dx, k), `seed ${seed}: from ${dx} px, second flick ${k} frames on`);
    // (and it is the second jump's: one held jump, steering onto it, does not reach its top)
    assert.ok(!flick(24, 0, true), `seed ${seed}: one jump climbed it`);
  }
});

test('5-1 and 5-2: the second jump\'s tip and the tall stump\'s go once he is on the ground past their spot, done or not', () => {
  for (const id of ['5-1', '5-2'] as const) {
    forgetTips(id);
    const sim = new RealPlay(id, 1);
    const st = sim.stage as unknown as Built;
    const passed: Array<{ text: string; x: number }> = [];
    (sim.e as unknown as { callbacks: { onGuide: (t: string, s: number, p?: boolean) => void } }).callbacks.onGuide = (text, _s, p) => {
      if (p) passed.push({ text, x: sim.p.x });
    };
    const dl = st.w5info.doubleLesson!;
    const gap = st.w5info.gaps.find((g) => g.edge === dl.edge)!;
    const tl = st.w5info.tallLesson;
    const end = Math.max(gap.far, tl?.at ?? 0) + 400;
    // a first-timer who never jumps twice: one hop at each face and edge, so he drops into the soft pit and climbs out of it
    sim.stand(dl.hint - 40, G);
    let hold = 0;
    for (let i = 0; i < 30 * 120 && sim.p.x < end; i++) {
      const p = sim.p;
      const face = sim.platforms.some((q) => q.type === 'solid' && q.x - p.x > 0 && q.x - p.x < 70 && q.y < p.y - 12 && q.y > p.y - 220 && q.y + q.height > p.y - 4);
      const floor = sim.platforms.some((q) => Math.abs(q.y - p.y) < 3 && q.x <= p.x + 40 && q.x + q.width >= p.x + 40);
      const press = p.grounded && hold <= 0 && (face || !floor);
      if (press) hold = 9;
      sim.frame({ right: true, press, jump: hold > 0 });
      hold--;
      assert.ok(!sim.p.isDoubleJumping);
    }
    const tip = (id === '5-1' ? W5_HINTS.s51double : W5_HINTS.s52double).old;
    const gone = passed.find((q) => q.text === tip);
    assert.ok(gone, `${id}: the wide gap's tip was never taken down (${passed.map((q) => q.text).join(' | ')})`);
    assert.ok(gone.x >= gap.far + 60 && gone.x < gap.far + 400, `${id}: taken down at ${Math.round(gone.x)}, the gap's far side at ${gap.far}`);
    if (tl && tl.at < end - 400) {
      const tt = passed.find((q) => q.text === (id === '5-1' ? W5_HINTS.s51tall : W5_HINTS.s52tall).old);
      assert.ok(tt && tt.x > tl.at, `${id}: the tall stump's tip`);
    }
    // the new look: that clears the line from Dot's queue, up or waiting, once it has had its minimum time (DotGuide.tsx passedLine)
    const q = new GuideQueue();
    const l = engineGuideLine(tip, id, { dot: true })!;
    const env = { danger: false, moveCount: () => 0 };
    q.push(l, 0);
    q.tick(1000, env);
    assert.equal(q.cur?.line.key, l.key);
    q.clear((x) => x.key === engineGuideLine(gone.text, id, { dot: true })!.key, 3000);
    assert.equal(q.cur, null, `${id}: still up after he passed the gap`);
  }
});

test('World 5 cakes: the touch box is inside the painted cake, and in the real engine a hop or a double jump over each one, taken in time, never eats it', () => {
  // the painted cake (w5Look.ts drawCake, drawn 34 at the pickup: 1.2 times as tall, each take's own width)
  const ph = 34 * 1.2;
  for (const f of [W5_FRAMES.cakeIcon, W5_FRAMES.cakeIcon2]) {
    const pw = (ph * f.w) / f.h;
    assert.ok(2 * CAKE.half < pw - 4 && 2 * CAKE.half < ph - 4, `the box ${2 * CAKE.half} px, the painting ${pw.toFixed(0)} by ${ph.toFixed(0)}`);
  }
  assert.ok(CAKE.reach < 13, 'his reach for a cake is inside his body');
  for (const dbl of [false, true]) {
    for (const lead of [60, 80, 100, 120]) {
      const sim = new RealPlay('5-2', 1);
      (sim.input as unknown as { source: string }).source = 'gesture';
      const e = sim.e as unknown as { proto: { w5: W5Extras }; w5: { eaten: boolean[]; sleepy: number } };
      const all = e.proto.w5.cakes!;
      const cakes = all.filter((c) => c.y > G - 60).sort((a, b) => a.x - b.x);
      sim.stand(cakes[0].x - 500, G);
      let hold = 0, f = -1;
      for (let i = 0; i < 30 * 240 && sim.p.x < cakes[cakes.length - 1].x + 200; i++) {
        const p = sim.p;
        let press = false;
        if (p.grounded) {
          const c = cakes.some((q) => q.x - p.x > 0 && q.x - p.x <= lead && !e.w5.eaten[all.indexOf(q)]);
          const floor = sim.platforms.some((q) => Math.abs(q.y - p.y) < 3 && q.x <= p.x + 40 && q.x + q.width >= p.x + 40);
          const face = sim.platforms.some((q) => q.type === 'solid' && q.x - p.x > 0 && q.x - p.x < 70 && q.y < p.y - 12 && q.y > p.y - 220 && q.y + q.height > p.y - 4);
          if ((c || !floor || face) && hold <= 0) {
            press = true;
            hold = 7;
            f = 0;
          }
        } else if (dbl && f === 6) press = true;
        sim.frame({ right: true, press, jump: hold > 0 || (dbl && f >= 6 && f < 13) });
        if (f >= 0) f++;
        hold--;
        // (awake again at once: this measures the hops, not the sleepy walk)
        e.w5.sleepy = 0;
      }
      const ate = cakes.filter((c) => e.w5.eaten[all.indexOf(c)]).map((c) => c.x);
      assert.deepEqual(ate, [], `${dbl ? 'double jump' : 'hop'} from ${lead} px`);
    }
  }
});

/** 5-3's orchids: the first one alone over the grass, then two over the grass, then the rows over the soft pits */
test('5-3: the first orchid is alone over the grass, one plain hop up from a stump, before any row over a pit; nothing needs a second jump', () => {
  for (const s of SEEDS) {
    const st = build('5-3', s);
    const inf = st.w5info;
    assert.ok(validateStage(st).ok, `seed ${s}`);
    const first = inf.orchids[0];
    assert.equal(first.piece, 'lesson', `seed ${s}`);
    // (one plain hop up from a plain stump beside it: 1-1's first stepping stone)
    const stump = st.platforms.find((p) => p.style === 'moss_stone' && p.y + p.height === G && p.x + p.width <= first.x0 && first.x0 - (p.x + p.width) < 60);
    assert.ok(stump && G - stump.y <= 50 && stump.y - first.y <= 75 && first.ground === G, `seed ${s}: the first orchid ${G - first.y} px up, its stump ${stump ? G - stump.y : 'none'}`);
    // (grass right under it: a miss is a drop to the path)
    assert.ok(st.platforms.some((p) => p.y === G && p.x <= first.x0 && p.x + p.width >= first.x1), `seed ${s}: no grass under the first orchid`);
    // the next orchids are a beat later: the lesson is on its own
    assert.ok(inf.orchids[1].x0 - first.x1 > 500, `seed ${s}: the second orchid ${inf.orchids[1].x0 - first.x1} px after the first`);
    // the steps over the grass come before the first row over a pit
    const firstRow = inf.rows[0];
    for (const o of inf.orchids.filter((q) => q.x0 < firstRow.edge)) assert.ok(o.ground === G && o.piece !== 'row', `seed ${s}: an orchid over a pit before the first row`);
    // nothing here needs the second jump
    assert.ok(inf.gaps.every((g) => !g.double) && inf.stumps.every((q) => q.h <= 100), `seed ${s}`);
  }
});

test('5-3 in the real engine: a row of orchids crossed with plain jumps, starting as the first one opens, never into the pit', () => {
  for (const seed of [1, 38, 75]) {
    const st = build('5-3', seed);
    const w5 = st.proto.w5;
    for (const row of st.w5info.rows.slice(0, 3)) {
      const sim = new RealPlay('5-3', seed);
      const o0 = w5.orchids!.find((o) => Math.abs(o.x - (st.w5info.orchids[row.orchids[0]].x0 + st.w5info.orchids[row.orchids[0]].x1) / 2) < 2)!;
      sim.stand(row.edge - 60, G);
      // (he has just walked up and the first one is opening: he goes as it opens, as Dot says)
      sim.t = 60 + ((((0.85 - o0.offset - 0.4) % o0.period) + o0.period) % o0.period);
      let hold = 0, deep = false;
      for (let i = 0; i < 30 * 8 && !(sim.p.grounded && sim.p.x > row.far + 30); i++) {
        const p = sim.p;
        let press = false;
        if (p.grounded && hold <= 0) {
          const floor = sim.platforms.some((q) => !q.broken && Math.abs(q.y - p.y) < 3 && q.x <= p.x + 30 && q.x + q.width >= p.x + 30);
          if (!floor) {
            press = true;
            hold = 9;
          }
        }
        sim.frame({ right: true, press, jump: hold > 0 });
        hold--;
        assert.ok(!sim.p.isDoubleJumping, `seed ${seed}: one jump at a time`);
        if (sim.p.y > G + 40) deep = true;
      }
      assert.ok(!deep, `seed ${seed}: fell into the pit at the row at ${row.edge} (x ${Math.round(sim.p.x)})`);
      assert.ok(sim.p.x > row.far + 30 && Math.abs(sim.p.y - G) < 2, `seed ${seed}: the row at ${row.edge} not crossed (x ${Math.round(sim.p.x)}, y ${Math.round(sim.p.y)})`);
    }
  }
});

test('5-2: the cakes\' line is followed by one cake on its own, with room to try it, and the pair comes after', () => {
  for (const seed of SEEDS) {
    const st = build('5-2', seed);
    const cakes = st.proto.w5.cakes!.filter((c) => c.y > G - 60).map((c) => c.x).sort((a, b) => a - b);
    assert.ok(cakes[1] - cakes[0] > 700, `seed ${seed}: the second cake ${cakes[1] - cakes[0]} px after the first`);
    assert.ok(cakes[2] - cakes[1] < 400, `seed ${seed}: then a pair`);
  }
});

test('5-1: the table card is as large on the screen sideways and short as upright at 320x782, where it reads', () => {
  const sim = new RealPlay('5-1', 1);
  const e = sim.e as unknown as { viewCssW: number; viewCssH: number; introT: number; zoom: number; applyZoom(): void; camera: { viewportWidth: number } };
  e.introT = 99;
  for (const [w, h] of [[320, 782], [844, 390], [640, 320], [782, 288]]) {
    e.viewCssW = w;
    e.viewCssH = h;
    e.applyZoom();
    const s = cardScale(e.zoom);
    assert.ok(15 * e.zoom * s >= 15 * CARD_READ_ZOOM - 0.01, `${w}x${h}: the words ${(15 * e.zoom * s).toFixed(1)} px`);
    assert.ok(184 * s < e.camera.viewportWidth * 0.8, `${w}x${h}: the card fits across`);
  }
});

test('5-2: the rules\' second half names the silk, in 8 words or fewer', () => {
  const then = W5_HINTS.s52rules.then;
  assert.match(then, /silk/);
  assert.ok(then.trim().split(/\s+/).length <= 8, then);
});

test('5-3 upright (320x782, 390x844) and short (640x320): waiting at a row its first orchid is in view, and on each orchid the next', () => {
  for (const [vw, vh] of [[320, 782], [390, 844], [640, 320]] as const) {
    const st = build('5-3', 1);
    const sim = new RealPlay('5-3', 1);
    const e = sim.e;
    delete e.updateCamera;
    e.viewCssW = vw;
    e.viewCssH = vh;
    e.introT = 99;
    e.applyZoom();
    const w5 = st.proto.w5;
    const inView = (o: { x0: number; x1: number; y: number }) => {
      const cam = e.camera;
      // (the whole bloom, and the cup above it)
      return o.x0 >= cam.x && o.x1 <= cam.x + cam.viewportWidth && o.y - 70 >= cam.y && o.y + 20 <= cam.y + cam.viewportHeight;
    };
    for (const row of st.w5info.rows.slice(0, 4)) {
      sim.stand(row.edge - 160, G);
      for (let i = 0; i < 30 * 2 && sim.p.x < row.edge - 40; i++) sim.frame({ right: true });
      for (let i = 0; i < 40; i++) sim.frame();
      const first = st.w5info.orchids[row.orchids[0]];
      assert.ok(inView(first), `${vw}x${vh}: waiting at ${row.edge}, the orchid at ${first.x0} is off the screen (view ${Math.round(e.camera.x)}..${Math.round(e.camera.x + e.camera.viewportWidth)})`);
      for (let k = 0; k + 1 < row.orchids.length; k++) {
        const o = st.w5info.orchids[row.orchids[k]];
        const ko = w5.orchids!.find((q) => Math.abs(q.x - (o.x0 + o.x1) / 2) < 2)!;
        sim.t = 60 + ((((0.1 - ko.offset) % ko.period) + ko.period) % ko.period);
        sim.stand((o.x0 + o.x1) / 2, o.y);
        for (let i = 0; i < 24; i++) sim.frame();
        const next = st.w5info.orchids[row.orchids[k + 1]];
        assert.ok(Math.abs(sim.p.y - o.y) < 2, `${vw}x${vh}: he stands on the orchid at ${o.x0}`);
        assert.ok(inView(next), `${vw}x${vh}: on the orchid at ${o.x0}, the next at ${next.x0} is off the screen (view ${Math.round(e.camera.x)}..${Math.round(e.camera.x + e.camera.viewportWidth)})`);
      }
    }
  }
});
