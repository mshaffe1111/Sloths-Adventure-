/**
 * Audit C-07 (ENGINE-AUDIT-C, 11-11). The DOT-1 rule (tipMemory.ts, dotSay.ts keep): a tip or lesson counts as taught only once its line
 * has been SHOWN. The first-stage coach was not under it: engine.start() wrote "coach done" and "the gap lesson is seen" to the phone
 * the moment the stage started, before a word of it was said. A brand-new player whose first 1-1 was restarted, backed out of or
 * reloaded in its first seconds was never coached, and never got the gap lesson either. The lead's call: the DOT-1 rule wins.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { headlessCanvas } from './headlessDom.ts';
import { GameEngine } from './engine.ts';
import { InputEngine } from './inputEngine.ts';
import { generateAllLevels } from './worldsData.ts';
import { coachDone, coachWanted } from './touchCoach.ts';
import { lessonsSeen } from './lessons.ts';
import { GuideQueue, GUIDE, type GuideLine } from './dotGuide.ts';
import { DotSay } from './dotSay.ts';

const lvl11 = () => generateAllLevels().find((l) => l.id === '1-1')!;
/** a brand-new touch player (touchCoach.ts coachWanted: ?coach=1 stands in for the coarse-pointer check, which the headless DOM lacks) */
function freshPhone() {
  localStorage.clear();
  (globalThis as unknown as { location: { search: string } }).location.search = '?coach=1';
}

test('C-07: starting 1-1 does not mark the coach and the gap lesson as taught before anything was said', () => {
  freshPhone();
  const lvl = lvl11();
  assert.equal(coachWanted(lvl.id, lvl.secret), true);
  const said: string[] = [];
  const e = new GameEngine(headlessCanvas(), lvl, new InputEngine(), { onCoach: (s: string | null) => void (s && said.push(s)) } as never);
  e.start();
  // not one frame of play yet: the coach has shown nothing (its first step comes 1.1 s in)
  assert.deepEqual(said, []);
  e.stop();
  assert.equal(coachDone(), false, 'sloth_coach_done was written at start(): leaving now, the coach never comes back on this phone');
  assert.equal(lessonsSeen().has('gap'), false, 'the gap lesson was marked seen at start(): Dot will never say it either');
  // (while the coach teaches the first gap, this run's own lesson picker still holds the gap card back: it would say it twice)
  assert.equal((e as unknown as { lessonSeen: Set<string> | null }).lessonSeen?.has('gap'), true, 'no gap card over the coach this run');
});

/** the coach's line for a step, as Dot's guide queues it (DotGuide.tsx, the coach's effect) */
const coachLine = (step: 'run' | 'jump'): GuideLine => ({
  key: `coach:${step}`, text: step === 'run' ? 'Slide to run.' : 'Slide up to jump.', kind: 'teach', who: 'Dot', move: step,
  topic: step === 'jump' ? 'gap' : 'controls', skill: `coach:${step}`, source: 'coach',
});

function show(say: DotSay, l: GuideLine, from: number, ms: number): number {
  say.say(l, from);
  let t = from;
  for (; t < from + ms; t += 100) {
    say.queue.tick(t, { danger: false, moveCount: () => 0 });
    say.keep(t);
  }
  return t;
}

test('C-07: the coach is taught, and the gap lesson with it, once its jump line has been up its minimum time (not before, not by the run line)', () => {
  freshPhone();
  const say = new DotSay(new GuideQueue(true), 'teach', new Set(), new Set(), true);
  let t = show(say, coachLine('run'), 2000, 4000);
  assert.equal(coachDone(), false, 'the run line alone does not teach the jump');
  say.queue.clear((l) => l.source === 'coach', t, true);
  t = show(say, coachLine('jump'), t, GUIDE.minShowMs - 300);
  assert.equal(coachDone(), false, 'not before its minimum time');
  assert.equal(lessonsSeen().has('gap'), false);
  show(say, coachLine('jump'), t, 1000);
  assert.equal(coachDone(), true, 'the coach is done once its jump line has been shown');
  assert.equal(lessonsSeen().has('gap'), true, 'and the gap lesson it taught');
});
