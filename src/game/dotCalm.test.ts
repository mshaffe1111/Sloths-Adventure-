/**
 * Dot toned down in Worlds 1-4 (Matt, 2026-10-28: "a little repetitive at times and comes in a little too soon"; QA the same day: tips
 * lingered, "Flick up into the trunk to grab it" ~30 s with no trunk in reach, "Slide your thumb up to climb" ~40 s over open ground).
 * The queue's calm rules (dotGuide.ts CALM) and the cut for moves done in earlier stages (dotGuideHelp.ts knownMoveTip).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { CALM, GuideQueue, type GuideLine, type MoveId, type TickEnv } from './dotGuide.ts';
import { knownMoveTip, markMoveDone, movesDone } from './dotGuideHelp.ts';

const line = (key: string, text: string, o: Partial<GuideLine> = {}): GuideLine => ({ key, text, kind: 'info', who: 'Dot', source: 'engine', ...o });

/** run the queue for `ms` from `from`, a frame at a time; returns when each line started (key -> ms) */
function run(q: GuideQueue, from: number, ms: number, env: Partial<TickEnv> = {}, moves: Record<string, number> = {}): Array<{ key: string; at: number; why?: string }> {
  const out: Array<{ key: string; at: number; why?: string }> = [];
  for (let t = from; t <= from + ms; t += 1000 / 30) {
    q.tick(t, { danger: false, moveCount: (m: MoveId) => moves[m] ?? 0, ...env });
    for (const ev of q.drain()) out.push(ev.type === 'start' ? { key: ev.show.line.key, at: t } : { key: ev.show.line.key, at: t, why: ev.why });
  }
  return out;
}
const starts = (evs: ReturnType<typeof run>) => evs.filter((e) => !e.why);

/** pushes at given times, during the run */
function runWith(q: GuideQueue, ms: number, pushes: Array<[number, GuideLine]>): Array<{ key: string; at: number; why?: string }> {
  const out: Array<{ key: string; at: number; why?: string }> = [];
  const todo = [...pushes].sort((a, b) => a[0] - b[0]);
  for (let t = 0; t <= ms; t += 1000 / 30) {
    while (todo.length && todo[0][0] <= t) q.push(todo.shift()![1], t);
    q.tick(t, { danger: false, moveCount: () => 0 });
    for (const ev of q.drain()) out.push(ev.type === 'start' ? { key: ev.show.line.key, at: t } : { key: ev.show.line.key, at: t, why: ev.why });
  }
  return out;
}

test('calm: nothing in the first 2.5 s but a warning or the locked exit', () => {
  const evs = starts(runWith(new GuideQueue(true), 4000, [[0, line('a', 'Gather flowers for the crown!', { kind: 'goal' })], [300, line('w', 'Here it comes! Slide down in a bush!', { kind: 'danger' })]]));
  assert.ok(evs.find((e) => e.key === 'w')!.at < 400, 'the warning at once');
  assert.ok(!evs.some((e) => e.key === 'a' && e.at < CALM.startMs), 'no plain line in the quiet start');
  const one = starts(runWith(new GuideQueue(true), 4000, [[0, line('a', 'Gather flowers for the crown!', { kind: 'goal' })]]));
  assert.ok(one[0].at >= CALM.startMs && one[0].at < CALM.startMs + 100, `then it comes (${one[0].at})`);
  // and the plain queue is as it was
  assert.ok(starts(runWith(new GuideQueue(), 1000, [[0, line('a', 'Gather flowers for the crown!')]]))[0].at < 1000);
});

test("calm: at least 10 s from one line's start to the next, but a first-time lesson, a warning or the locked exit need not wait", () => {
  const evs = starts(runWith(new GuideQueue(true), 30000, [
    [3000, line('a', 'A flag! Fall, and you start again here.')],
    [3500, line('b', 'Still 20 flowers to collect!', { kind: 'goal' })],
  ]));
  const at = (k: string) => evs.find((e) => e.key === k)?.at ?? -1;
  assert.ok(at('a') >= 3000 && at('b') - at('a') >= CALM.gapMs, `the second line waited (${at('a')} then ${at('b')})`);
  const lock = starts(runWith(new GuideQueue(true), 8000, [[3000, line('a', 'A flag! Fall, and you start again here.')], [4000, line('c', 'Sealed: collect 3 more flowers first.', { kind: 'must' })]]));
  assert.ok(lock.find((e) => e.key === 'c')!.at < 4100, 'the locked exit at once');
  const les = starts(runWith(new GuideQueue(true), 8000, [[3000, line('a', 'A flag! Fall, and you start again here.')], [3500, line('l', 'Flick up just before the edge.', { kind: 'teach', move: 'jump', source: 'lesson' })]]));
  assert.ok(les.find((e) => e.key === 'l')!.at < 3600, 'a first-time lesson comes in over a plain line at once');
});

test('calm: the same words at most twice a stage, and never again once their move is done', () => {
  const q = new GuideQueue(true);
  const moves: Record<string, number> = { jump: 0 };
  let said = 0;
  for (let i = 0; i < 4; i++) {
    q.push(line(`r${i}`, 'That spot again. Slow down and look first.', { kind: 'struggle' }), 3000 + i * 15000);
    said += starts(run(q, 3000 + i * 15000, 14900)).length;
  }
  assert.equal(said, 2, 'a reminder once');
  const m = new GuideQueue(true);
  m.push(line('j', 'Flick up again midair to jump twice.', { kind: 'teach', move: 'double', source: 'engine' }), 3000);
  assert.equal(starts(run(m, 3000, 2000, {}, moves)).length, 1);
  moves.double = 1;
  run(m, 5100, 2000, {}, moves);
  m.push(line('j2', 'Flick up again midair to jump twice.', { kind: 'teach', move: 'double', source: 'engine' }), 20000);
  assert.equal(starts(run(m, 20000, 15000, {}, moves)).length, 0, 'done since it was said');
});

test('calm: a move tip goes after 12 s undone, or once its thing has been out of view 2.5 s, and does not come back', () => {
  const tip = line('t', 'Flick up into the trunk to grab it.', { kind: 'teach', move: 'grab', topic: 'trunk' });
  const q = new GuideQueue(true);
  q.push(tip, 3000);
  const evs = run(q, 3000, 60000);
  const end = evs.find((e) => e.why);
  assert.ok(end && end.at - 3000 <= CALM.moveCapMs + 100, `it went at ${end && end.at - 3000} ms`);
  assert.equal(starts(evs).length, 1, 'once');
  const g = new GuideQueue(true);
  g.push(tip, 3000);
  const ge = run(g, 3000, 20000, { gone: () => true });
  const gend = ge.find((e) => e.why)!;
  assert.ok(gend.at - 3000 <= CALM.goneMs + 200, `with no trunk in view it went at ${gend.at - 3000} ms`);
  // (the plain queue keeps it its 20 s and brings it back once)
  const p = new GuideQueue();
  p.push(tip, 0);
  assert.equal(starts(run(p, 0, 80000)).length, 2);
});

test('a stage tip for a move done in an earlier stage is cut; first-time lessons, things and the crouch are not', () => {
  const before = new Set(['climb', 'jump', 'crouch']);
  assert.ok(knownMoveTip({ kind: 'teach', move: 'climb', source: 'engine' }, before));
  assert.ok(!knownMoveTip({ kind: 'teach', move: 'climb', source: 'lesson' }, before));
  assert.ok(!knownMoveTip({ kind: 'teach', move: 'jump', source: 'engine', thing: true }, before));
  assert.ok(!knownMoveTip({ kind: 'teach', move: 'crouch', source: 'engine' }, before));
  assert.ok(!knownMoveTip({ kind: 'teach', move: 'glide', source: 'engine' }, before));
  const mem = new Map<string, string>();
  const s = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v) };
  markMoveDone('climb', s);
  markMoveDone('climb', s);
  assert.deepEqual([...movesDone(s)], ['climb']);
});
