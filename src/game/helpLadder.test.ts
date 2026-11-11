// The help ladder's schedule (R-165.62 done-item 1): scripted put-backs at one piece fire each rung at exactly its count, once, and
// nothing else; the count resets past the piece and on a stage end, and not on a refused offer or a pause. The red: the same checks with
// the thresholds planted off by one (4/6/9/13) fail.
import test from 'node:test';
import assert from 'node:assert/strict';
import { HelpLadder, RUNGS, stepsFor, pieceMoveLaid, BOUNCE_ALONE, padFullJump, setHelpLadder, pieceMove, moveLine, MOVE_LINES, STEP_LINE, OFFER_LINE, REASK_LINE, type Rungs, type Box } from './helpLadder.ts';

const PIECES = [
  { k: 'a', x0: 0, x1: 1000 },
  { k: 'chain', x0: 1000, x1: 2000 },
  { k: 'c', x0: 2000, x1: 3000 },
];
const AT = 1500;

/** n put-backs at the chain: each rung fired, as "count:rung" */
function run(l: HelpLadder, n: number, answer?: (rung: string, count: number) => boolean | undefined): string[] {
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    for (const a of l.putBack(AT)) {
      out.push(`${a.count}:${a.rung}`);
      const yes = answer?.(a.rung, a.count);
      if (yes !== undefined) l.answer(a.piece.k, yes);
    }
  }
  return out;
}

/** the schedule the lead ruled, checked against a ladder built with `r` */
function checkSchedule(r: Rungs) {
  // Easy: 3 the move, 5 the pad, 8 the steps; nothing else in 30 put-backs
  assert.deepEqual(run(new HelpLadder('easy', PIECES, r), 30), ['3:move', '5:pad', '8:step'], 'Easy');
  // Normal: 3 the move, 12 the offer; a "no", then the re-ask 8 later (20), a second "no", then never
  assert.deepEqual(run(new HelpLadder('normal', PIECES, r), 40, (rung) => (rung === 'offer' || rung === 'reask' ? false : undefined)), ['3:move', '12:offer', '20:reask'], 'Normal, no and no');
  // Normal: a yes at 12 grows the steps and nothing is asked again
  const yes = new HelpLadder('normal', PIECES, r);
  const grew: number[] = [];
  for (let i = 0; i < 30; i++) for (const a of yes.putBack(AT)) if (a.rung === 'offer' && yes.answer(a.piece.k, true)) grew.push(a.count);
  assert.deepEqual(grew, [12], 'Normal, a yes at 12 grows the steps');
  // Normal: no answer yet (the offer is up) asks nothing more
  assert.deepEqual(run(new HelpLadder('normal', PIECES, r), 40), ['3:move', '12:offer'], 'Normal, unanswered');
}

test('the schedule: each rung at exactly its count, once, and nothing else (Easy 3/5/8, Normal 3/12, re-ask 8 after a no)', () => {
  checkSchedule(RUNGS);
});

test('planted: the thresholds off by one (4/6/9/13) fail the same checks', () => {
  assert.throws(() => checkSchedule({ move: 4, pad: 6, step: 9, offer: 13, reaskAfter: 8 }), assert.AssertionError);
  // (and each one alone)
  for (const k of ['move', 'pad', 'step', 'offer', 'reaskAfter'] as const) assert.throws(() => checkSchedule({ ...RUNGS, [k]: RUNGS[k] + 1 }), assert.AssertionError, k);
});

test('the count is per piece: put-backs at another piece neither add to it nor fire its rungs', () => {
  const l = new HelpLadder('easy', PIECES);
  l.putBack(AT);
  l.putBack(AT);
  assert.deepEqual(l.putBack(2500), [], 'a put-back at the next piece is its own first');
  assert.equal(l.count('chain'), 2);
  assert.equal(l.count('c'), 1);
  assert.deepEqual(l.putBack(AT).map((a) => a.rung), ['move'], 'the chain\'s third');
});

test('the count resets standing on the piece beyond, and on a stage end; not on a pause, time, a refused offer or a step given', () => {
  const l = new HelpLadder('normal', PIECES);
  run(l, 4);
  l.stood(1200); // (standing inside the piece is not past it)
  l.stood(999);
  assert.equal(l.count('chain'), 4);
  l.stood(2000); // the piece beyond
  assert.equal(l.count('chain'), 0, 'reset past the piece');
  run(l, 3);
  l.end();
  assert.equal(l.count('chain'), 0, 'reset on a stage end');
  // a refused offer: the count carries on (13 after the 12th and one more)
  const n = new HelpLadder('normal', PIECES);
  run(n, 13, (rung) => (rung === 'offer' ? false : undefined));
  assert.equal(n.count('chain'), 13, 'not reset by a refused offer');
  // a step given (Easy at 8): the count carries on, and no rung fires again
  const e = new HelpLadder('easy', PIECES);
  assert.deepEqual(run(e, 12), ['3:move', '5:pad', '8:step']);
  assert.equal(e.count('chain'), 12, 'not reset by a step given');
  // (a pause and time are not inputs: nothing but putBack/stood/end/answer changes a count, so neither can reset it)
});

test('the pad\'s full jump: Easy at 5 for the piece he is being set back at, until he stands beyond it; never on Normal', () => {
  const l = new HelpLadder('easy', PIECES);
  setHelpLadder(l);
  run(l, 4);
  assert.equal(padFullJump(), false, 'not before 5');
  run(l, 1);
  assert.equal(padFullJump(), true, 'at 5');
  l.stood(2100);
  assert.equal(padFullJump(), false, 'past the piece');
  const nl = new HelpLadder('normal', PIECES);
  setHelpLadder(nl);
  run(nl, 6);
  assert.equal(padFullJump(), false, 'Normal');
  setHelpLadder(null);
  assert.equal(padFullJump(), false, 'no ladder (every other stage)');
});

test('Dot\'s words are help-lines.md\'s, and break neither story guard (no slow, late, hurry or "too")', () => {
  assert.equal(pieceMove(['double']), 'double');
  assert.equal(pieceMove(['bounce', 'double']), 'bounce');
  assert.equal(pieceMove([]), 'single');
  assert.equal(moveLine('double', 'screen'), 'Jump, then flick up again in the air!');
  assert.equal(moveLine('double', 'pad'), 'Jump, then hold Jump again in the air!');
  assert.equal(moveLine('single', 'keys'), 'Run first, then hold Jump. Big one!');
  const all = [...Object.values(MOVE_LINES).flatMap((m) => [m.touch, m.pad]), STEP_LINE, OFFER_LINE, REASK_LINE];
  for (const s of all) assert.ok(!/\b(slow|late|hurry|too)\b/i.test(s), s);
});

test('the steps come from the piece as laid: a rock under every rise over 60 px (leaving 60), a plank in a gap too wide for the last jump', () => {
  // seed 3747's Easy chain as laid, with its catch branches marked as the builder marks them
  const solids: Box[] = [
    { x: 28573, y: 772, width: 92, height: 120 }, { x: 28665, y: 712, width: 480, height: 24 }, { x: 28798, y: 850, width: 231, height: 24 },
    { x: 29115, y: 802, width: 151, height: 24, catch: true }, { x: 29216, y: 598, width: 464, height: 24 }, { x: 29650, y: 688, width: 143, height: 24, catch: true },
    { x: 29743, y: 484, width: 490, height: 24 }, { x: 30203, y: 574, width: 146, height: 24, catch: true }, { x: 30299, y: 370, width: 490, height: 24 },
    { x: 30759, y: 464, width: 282, height: 24, catch: true }, { x: 30991, y: 374, width: 474, height: 24 }, { x: 31465, y: 443, width: 88, height: 120 },
  ];
  const piece = { k: 'w1-log-chain-rise', x0: 28665, x1: 31465 };
  const steps = stepsFor(piece, solids, () => 150);
  const rocks = steps.filter((b) => !b.plank).sort((a, b) => a.x - b.x), planks = steps.filter((b) => b.plank);
  // three rises of 114: one rock each at the end of the lower log, its top 57 under the next log (two 57 px faces), TOP_W wide
  assert.deepEqual(rocks.map((s) => [s.x, s.y, s.width, s.height]), [[28985, 655, 160, 57], [29520, 541, 160, 57], [30073, 427, 160, 57]]);
  // the 202 px level gap: a plank at its middle, 50 px short of each side (the lead's ruling 11-11: gap - 100; it was 60 px wide)
  assert.deepEqual(planks.map((s) => [s.x, s.y, s.width]), [[30839, 374, 102]]);
  assert.equal(stepsFor(piece, solids, () => 1000).filter((b) => b.plank).length, 0, 'no plank when a plain jump clears the gap');
});

test('a rise over 120 px is a stair: rocks standing on the ground, every face 60 px or less, the top tread within 60 under the lip', () => {
  const ground = { x: 0, y: 800, width: 600, height: 400 }, ledge = { x: 600, y: 590, width: 300, height: 610 };
  const steps = stepsFor({ k: 'p', x0: 0, x1: 900 }, [ground, ledge], () => 150);
  assert.equal(steps.length, 3, JSON.stringify(steps));
  const tops = [800, ...steps.map((b) => b.y).sort((a, b) => b - a), 590];
  for (let i = 1; i < tops.length; i++) assert.ok(tops[i - 1] - tops[i] <= 60, `face ${tops[i - 1] - tops[i]}`);
  for (const b of steps) assert.equal(b.y + b.height, 800, 'stands on the ground');
  assert.ok(steps.every((b) => b.width >= 60));
});

test('a rock never takes in a floating log; ground with a stump resting on it is ground', () => {
  // a log floating over the ground in front of the ledge: no room for a stair under it, so nothing grows
  const ground = { x: 0, y: 800, width: 600, height: 400 }, log = { x: 300, y: 700, width: 290, height: 24 }, ledge = { x: 600, y: 590, width: 300, height: 610 };
  assert.ok(stepsFor({ k: 'p', x0: 0, x1: 900 }, [ground, log, ledge], () => 150).every((b) => b.x + b.width <= 300 || b.y + b.height <= 700), 'nothing under the log');
  // a stump on the ground: the ground stays road (the Critic's find: a dropped floor made a fake gap and a wall)
  const stump = { x: 200, y: 760, width: 60, height: 40 };
  const steps = stepsFor({ k: 'p', x0: 0, x1: 900 }, [ground, stump, { x: 600, y: 700, width: 300, height: 500 }], () => 150);
  assert.equal(steps.filter((b) => b.plank).length, 0, 'no fake gap');
  assert.ok(steps.every((b) => b.height <= 100 && b.y + b.height === 800));
});

test('a mushroom whose bounce alone reaches the lip gives the rise: nothing grows; one that needs a second jump after it gets a stair', () => {
  const ground = { x: 0, y: 800, width: 600, height: 400 }, cap = { x: 450, y: 770, width: 70, height: 30, bouncy: true };
  const low = { x: 600, y: 680, width: 300, height: 520 }, high = { x: 600, y: 560, width: 300, height: 640 };
  assert.equal(stepsFor({ k: 'p', x0: 0, x1: 900 }, [ground, cap, low], () => 150).length, 0, `a ${770 - 680} px lift over the cap`);
  assert.ok(stepsFor({ k: 'p', x0: 0, x1: 900 }, [ground, cap, high], () => 150).length >= 3, `a ${770 - 560} px lift over the cap (BOUNCE_ALONE ${Math.round(BOUNCE_ALONE)})`);
});

test('the move a piece needs, from the piece as laid: a mushroom is the bounce, a join no single jump makes is the double, else a single', () => {
  const piece = { k: 'p', x0: 0, x1: 1000 };
  const single = (dyUp: number) => (dyUp > 97 ? -1 : 150);
  const level = [{ x: 0, y: 500, width: 400, height: 24 }, { x: 500, y: 500, width: 400, height: 24 }];
  assert.equal(pieceMoveLaid(piece, level, [], single), 'single');
  const rise = [{ x: 0, y: 500, width: 400, height: 24 }, { x: 470, y: 386, width: 400, height: 24 }];
  assert.equal(pieceMoveLaid(piece, rise, [], single), 'double', 'a 114 px rise');
  const wide = [{ x: 0, y: 500, width: 300, height: 24 }, { x: 520, y: 500, width: 300, height: 24 }];
  assert.equal(pieceMoveLaid(piece, wide, [], single), 'double', 'a 220 px gap');
  assert.equal(pieceMoveLaid(piece, rise, [{ x: 420, y: 520, width: 40, height: 30 }], single), 'bounce');
});
