// The help ladder flown on 1-1 in the real engine at 30 fps (R-165.62 done-item 2): seed 3747, the piece w1-log-chain-rise, every
// put-back a real walk off a log into the gap (RealPlay; A1's soft fall sets him back). Easy: Dot's move line at 3, a pad tap is a full
// jump at 5 (the hop read before and after), the steps grow at 8 and he passes the WHOLE piece to its exit with plain jumps only.
// Normal: the line at 3, the offer at 12 with the stage held still, a no grows nothing, the re-ask at 20, a second no never asks again;
// a yes grows the steps and the piece is passed with plain jumps. StuckWatch says nothing in 1-1; "Flick up and forward to jump." is
// never said again over the put-backs; each grown step is in the draw list, and gone after a restart.
import test from 'node:test';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { RealPlay } from './realPlay.ts';
import { setDifficulty } from './difficulty.ts';
import { withPlaySeed } from './testlink1_1.ts';
import { recorder } from './playRecorder.ts';
import { InputEngine } from './inputEngine.ts';
import { PadInput } from './padControl.ts';
import { MOVE_LINES, STEP_LINE, STEP_CUT, LINE_UP_S, padFullJump } from './helpLadder.ts';
import { dotHelp, setDotHelp } from './dotGuideHelp.ts';
import type { Platform } from './types.ts';

const SEED = 3747;
const PIECE = 'w1-log-chain-rise';
type Piece = { k: string; x0: number; x1: number };
type Eng = {
  currentStage: { meta: { pieces: Piece[] } };
  platforms: Platform[];
  drawPlats: Platform[];
  paintedPlats: Platform[];
  input: unknown;
  helpAsk: (o: { reask: boolean; cut?: string }, answer: (yes: boolean) => void) => void;
  helpState(): { asking: { k: string; count: number; cut?: string } | null; grown: Platform[]; paused: boolean; on: boolean };
  stop(): void;
};

function fly(setting: 'easy' | 'normal', seed = SEED) {
  setDifficulty(setting);
  const r = withPlaySeed(seed, () => new RealPlay('1-1', 1));
  const e = r.e as unknown as Eng;
  const events: string[] = [];
  const was = recorder.event;
  recorder.event = function (this: typeof recorder, what: string, detail?: string | number) {
    events.push(`${what} ${detail ?? ''}`.trim());
    return was.call(this, what, detail);
  } as typeof recorder.event;
  const asked: Array<{ reask: boolean; cut?: string; answer: (yes: boolean) => void }> = [];
  e.helpAsk = (o, answer) => asked.push({ ...o, answer });
  const piece = e.currentStage.meta.pieces.find((q) => q.k === PIECE)!;
  assert.ok(piece, `seed ${seed} lays ${PIECE}`);
  // (the take-off log: the piece's first log; walking off its right end drops him into the first rising gap)
  const logs = r.platforms.filter((p) => p.type === 'solid' && p.style === 'log' && p.width >= 300 && p.x >= piece.x0 - 2 && p.x + p.width <= piece.x1 + 2).sort((a, b) => a.x - b.x);
  return { r, e, events, asked, piece, logs, done: () => { recorder.event = was; setDifficulty('normal'); e.stop(); } };
}
type Flight = ReturnType<typeof fly>;

/** one real put-back: walk off the first log's right end and fly until A1 sets him back (8 s at most) */
function putBack(f: Flight): void {
  const { r, events, logs } = f;
  const n = events.filter((v) => v.startsWith('softFall')).length;
  const pf = logs[0];
  // (once steps have grown the log's end is a step he climbs: then he drops from under the second log instead, a fall in the same gap)
  const grown = f.e.helpState().grown.length > 0;
  if (grown) r.fly(logs[1].x + 90, logs[1].y + 40);
  else r.stand(pf.x + pf.width - 40, pf.y);
  for (let i = 0; i < 6 && !grown; i++) r.frame({});
  for (let i = 0; i < 30 * 8; i++) {
    r.frame({ right: !grown && i < 45 });
    if (events.filter((v) => v.startsWith('softFall')).length > n) break;
    if (f.e.helpState().asking) break;
  }
  assert.equal(events.filter((v) => v.startsWith('softFall')).length, n + 1, 'a real put-back');
  // (settle: the iris opens and he stands; Normal's offer comes then)
  for (let i = 0; i < 45 && !f.e.helpState().asking; i++) r.frame({});
}

/** a tap on the Pad's Jump button standing on a flat log: how high he rises (px) */
function padHop(f: Flight): number {
  const { r, e, logs } = f;
  const fake = e.input;
  const inp = new InputEngine();
  inp.source = 'pad';
  const pad = new PadInput(inp);
  const pf = logs[1];
  r.stand(pf.x + 100, pf.y);
  e.input = inp;
  for (let i = 0; i < 8; i++) (r.e as unknown as { update(dt: number): void }).update(1 / 30);
  const y0 = r.p.y;
  let top = y0;
  pad.jumpButton(true);
  for (let i = 0; i < 40; i++) {
    if (i === 2) pad.jumpButton(false); // (a tap: 67 ms down)
    (r.e as unknown as { update(dt: number): void }).update(1 / 30);
    top = Math.min(top, r.p.y);
    if (i > 4 && r.p.grounded) break;
  }
  e.input = fake;
  return Math.round(y0 - top);
}

/**
 * plain jumps only, from the first log to the piece's exit: hold right; standing, with a face or the edge just ahead, a held single jump;
 * never a press in the air. True when he stands past the piece's end with no fall and no second jump
 */
function plainRun(f: Flight): { ok: boolean; why: string; jumps: number } {
  const { r, events, piece, logs } = f;
  const falls = events.filter((v) => v.startsWith('softFall')).length;
  r.stand(logs[0].x + 60, logs[0].y);
  for (let i = 0; i < 4; i++) r.frame({});
  let hold = 0, jumps = 0, double = false;
  const plats = () => r.platforms.filter((q) => q.type === 'solid' && !q.broken);
  for (let i = 0; i < 30 * 40; i++) {
    const p = r.p;
    let press = false;
    if (p.grounded && hold === 0) {
      const ahead = p.x + 34;
      const under = plats().some((q) => ahead >= q.x && ahead <= q.x + q.width && Math.abs(q.y - p.y) < 6);
      const face = plats().some((q) => q.x > p.x && q.x - p.x < 44 && q.y < p.y - 8 && q.y + q.height > p.y - 4);
      if (!under || face) {
        press = true;
        hold = 12;
        jumps++;
      }
    }
    r.frame({ right: true, jump: hold > 0, press });
    if (hold > 0) hold--;
    if (r.p.isDoubleJumping) double = true;
    if (events.filter((v) => v.startsWith('softFall')).length > falls) return { ok: false, why: `fell at x ${Math.round(r.p.x)}`, jumps };
    if (double) return { ok: false, why: 'a second jump', jumps };
    if (r.p.grounded && r.p.x >= piece.x1 + 20) return { ok: true, why: '', jumps };
  }
  return { ok: false, why: `stopped at x ${Math.round(r.p.x)} y ${Math.round(r.p.y)}`, jumps };
}

const helps = (f: Flight) => f.events.filter((v) => v.startsWith('help ') || v.startsWith('helpOffer'));
const flickUp = (f: Flight) => f.r.said.filter((s) => /flick up and forward to jump|slide up and across to jump/i.test(s.text)).length;
const moveSaid = (f: Flight) => f.r.said.filter((s) => s.text === MOVE_LINES.double.touch || s.text === MOVE_LINES.double.pad).length;

test('1-1 Easy, seed 3747, w1-log-chain-rise: the line at 3, the full pad jump at 5, the steps at 8, then the whole piece on plain jumps', (t) => {
  const f = fly('easy');
  const { e, piece } = f;
  assert.equal(e.helpState().on, true, 'the ladder is on in 1-1');
  // (no "before" red on Easy: a held plain jump clears its 114 px rises, the packet Critic's run; players miss them by timing. Normal's
  // 140 px rises are the red, below)
  const hop0 = padHop(f);
  for (let n = 1; n <= 2; n++) putBack(f);
  assert.deepEqual(helps(f), [], 'nothing at 1 and 2');
  putBack(f);
  assert.deepEqual(helps(f), [`help move ${PIECE} 3 E`]);
  assert.equal(moveSaid(f), 1, 'Dot says the move (the double) once');
  putBack(f);
  assert.equal(padFullJump(), false, 'the tap is still a hop at 4');
  putBack(f);
  assert.deepEqual(helps(f).slice(1), [`help pad ${PIECE} 5 E`]);
  assert.equal(padFullJump(), true, 'a tap is a full jump at 5');
  const hop5 = padHop(f);
  assert.ok(hop0 < 70 && hop5 > 90, `the pad tap's rise: ${hop0} px before, ${hop5} px at 5`);
  t.diagnostic(`pad tap rise: ${hop0} px before, ${hop5} px at 5`);
  for (let n = 6; n <= 7; n++) putBack(f);
  assert.equal(e.helpState().grown.length, 0, 'no step before 8');
  putBack(f);
  assert.deepEqual(helps(f).slice(2), [`help step ${PIECE} 8 E`]);
  assert.equal(f.r.said.filter((s) => s.text === STEP_LINE).length, 1, 'Dot: the step line');
  const grown = e.helpState().grown;
  assert.ok(grown.length >= 3, `steps grown: ${grown.length}`);
  assert.ok(grown.filter((g) => g.height > 30).every((g) => g.cut === STEP_CUT), 'every step is the one mossy rock (the YES picture)');
  // the move line came down after its time (her own clock holds while he blinks after each set-back)
  const ml = f.r.said.find((x) => x.text === MOVE_LINES.double.touch || x.text === MOVE_LINES.double.pad)!;
  const mlDown = f.r.passed.find((x) => x.text === ml.text);
  assert.ok(mlDown && Math.abs(mlDown.t - ml.t - LINE_UP_S) < 0.1, `the move line down ${LINE_UP_S} s after it was said (${ml.t.toFixed(1)} -> ${mlDown?.t.toFixed(1)})`);
  for (const g of grown) {
    assert.ok(g.x >= piece.x0 - 100 && g.x < piece.x1, 'in the piece');
    assert.ok(e.platforms.includes(g), 'standable: in the platforms');
    assert.ok(g.cut || e.paintedPlats.includes(g), 'drawn: a World 1 cut piece (protoArt draws it from the platforms) or in the draw list');
  }
  // up to 12 more put-backs: nothing else fires on Easy
  for (let n = 9; n <= 12; n++) putBack(f);
  assert.equal(helps(f).length, 3, helps(f).join(' | '));
  // StuckWatch never speaks in 1-1, and the old teach line is never said again over the put-backs
  assert.ok(!f.events.some((v) => v.startsWith('stuckHelp')), 'no stuckHelp');
  assert.ok(!f.r.said.some((s) => /too tall/i.test(s.text)), 'no "Too tall"');
  assert.equal(flickUp(f), 0, '"Flick up and forward to jump." is not said again at the piece');
  const after = plainRun(f);
  assert.ok(after.ok, `with the steps, plain jumps pass the whole piece: ${after.why}`);
  t.diagnostic(`Easy: ${grown.length} grown, the piece passed on ${after.jumps} plain jumps`);
  f.done();
});

test('1-1 Normal, seed 3747: the line at 3, the offer at 12 (the stage held), a no grows nothing, the re-ask at 20, a second no is final', () => {
  const f = fly('normal');
  const { e, r, asked } = f;
  for (let n = 1; n <= 11; n++) putBack(f);
  assert.deepEqual(helps(f), [`help move ${PIECE} 3 N`], 'only the move line before 12');
  assert.equal(moveSaid(f), 1);
  assert.equal(padFullJump(), false, 'no quiet full jump on Normal');
  putBack(f);
  assert.equal(asked.length, 1, 'the offer at 12');
  assert.equal(asked[0].reask, false);
  assert.equal(asked[0].cut, STEP_CUT, 'the offer shows the stone that would grow');
  // her bubble: the move line was taken down when the offer opened (or before, at its time), and nothing is said from here on
  const move = f.r.said.find((x) => x.text === MOVE_LINES.double.touch || x.text === MOVE_LINES.double.pad)!;
  const down = f.r.passed.find((x) => x.text === move.text);
  assert.ok(down && down.t <= r.t + 1e-6 && down.t - move.t <= LINE_UP_S + 0.05, `the move line taken down by the offer (said ${move.t.toFixed(1)}, down ${down?.t.toFixed(1)}, offer ${r.t.toFixed(1)})`);
  const saidAtOffer = f.r.said.length;
  assert.deepEqual(helps(f).slice(1), [`help offer ${PIECE} 12 N`, `helpOffer shown ${PIECE} 12`]);
  assert.equal(e.helpState().paused, true, 'the stage is paused while it shows');
  const at = { x: r.p.x, y: r.p.y, t: r.t };
  for (let i = 0; i < 30; i++) r.frame({ right: true, press: i === 3 });
  assert.deepEqual({ x: r.p.x, y: r.p.y, t: r.t }, at, 'nothing moves while it is up');
  asked[0].answer(false); // (Back is a no: HelpOffer.test.ts)
  assert.equal(e.helpState().paused, false, 'play goes on');
  assert.equal(e.helpState().grown.length, 0, 'a no grows nothing');
  for (let n = 13; n <= 19; n++) putBack(f);
  assert.equal(asked.length, 1, 'nothing more until 20');
  putBack(f);
  assert.equal(asked.length, 2, 'the re-ask at 20');
  assert.equal(asked[1].reask, true);
  asked[1].answer(false);
  for (let n = 21; n <= 36; n++) putBack(f);
  assert.equal(asked.length, 2, 'after a second no, never again at that piece');
  assert.equal(f.r.said.length, saidAtOffer, `nothing said after a no: ${f.r.said.slice(saidAtOffer).map((x) => x.text).join(' | ')}`);
  assert.equal(e.helpState().grown.length, 0);
  assert.deepEqual(helps(f).filter((v) => v.startsWith('helpOffer')), [`helpOffer shown ${PIECE} 12`, `helpOffer no ${PIECE} 12`, `helpOffer shown ${PIECE} 20`, `helpOffer no ${PIECE} 20`]);
  assert.ok(!f.events.some((v) => v.startsWith('stuckHelp')), 'no stuckHelp');
  assert.equal(flickUp(f), 0);
  f.done();
});

test('1-1 Normal, seed 3747: a yes at 12 grows the steps, the piece is then passed on plain jumps; each step drawn, and gone after a restart', () => {
  const f = fly('normal');
  const { e, asked } = f;
  const before = plainRun(f);
  assert.equal(before.ok, false, 'without the steps, plain jumps do not pass Normal\'s piece');
  // (the failed run above was a real fall at the piece: put-back 1)
  for (let n = 2; n <= 12; n++) putBack(f);
  assert.equal(asked.length, 1);
  assert.ok(f.events.includes(`helpOffer shown ${PIECE} 12`), 'the offer at 12');
  asked[0].answer(true);
  assert.ok(f.events.includes(`helpOffer yes ${PIECE} 12`) && f.events.includes(`help step ${PIECE} 12 N`), f.events.filter((v) => v.startsWith('help')).join(' | '));
  const grown = e.helpState().grown;
  assert.ok(grown.length >= 3, `steps grown: ${grown.length}`);
  // the draw-list spy: a frame's draw reads each grown step (a cut piece from the platforms protoArt paints; any other from the lists)
  for (const g of grown) assert.ok(e.platforms.includes(g) && (g.cut ? true : e.paintedPlats.includes(g) || e.drawPlats.includes(g)), `step ${g.id} in the draw list`);
  const after = plainRun(f);
  assert.ok(after.ok, `with the steps, plain jumps pass the whole piece: ${after.why}`);
  for (let n = 1; n <= 30; n++) putBack(f);
  assert.equal(asked.length, 1, 'never asked again after a yes');
  // a restart: the stage is built again; no step, and the stage object the next roll reads never had one
  const ids = new Set(grown.map((g) => g.id));
  e.stop();
  assert.equal(e.helpState().grown.length, 0);
  assert.ok(!e.platforms.some((q) => ids.has(q.id)), 'gone from the platforms on stop');
  const again = fly('normal');
  assert.ok(!again.r.platforms.some((q) => ids.has(q.id) || grown.some((g) => g.x === q.x && g.y === q.y && g.width === q.width)), 'not in the restarted stage');
  assert.deepEqual(helps(again), []);
  again.done();
  f.done();
});

test('1-1 on Quiet (Dot\'s help setting): no line from her, but Easy\'s steps still grow at 8 and Normal\'s offer still shows at 12', () => {
  setDotHelp('quiet');
  try {
    assert.equal(dotHelp(), 'quiet');
    const ez = fly('easy');
    for (let n = 1; n <= 8; n++) putBack(ez);
    assert.ok(ez.e.helpState().grown.length >= 3, 'Easy: the steps grew');
    ez.done();
    const nm = fly('normal');
    for (let n = 1; n <= 12; n++) putBack(nm);
    assert.equal(nm.asked.length, 1, 'Normal: the offer (its pictures) shows');
    nm.asked[0].answer(false);
    nm.done();
  } finally {
    setDotHelp('reminders');
  }
});

test('the offer opens over a clear bubble: a ladder line still up is taken down the moment it opens', () => {
  const f = fly('normal');
  for (let n = 1; n <= 11; n++) putBack(f);
  // (a line said just now, well inside its time: only the offer's opening can take it down)
  const e = f.e as unknown as { helpLine: { text: string; until: number } | null; gameTime: number };
  e.helpLine = { text: MOVE_LINES.double.touch, until: e.gameTime + 1000 };
  const before = f.r.passed.length;
  putBack(f);
  assert.equal(f.asked.length, 1, 'the offer');
  assert.deepEqual(f.r.passed.slice(before).map((x) => x.text), [MOVE_LINES.double.touch], 'taken down as it opened');
  f.asked[0].answer(false);
  f.done();
});
