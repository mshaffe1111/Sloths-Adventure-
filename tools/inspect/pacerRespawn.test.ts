/**
 * The race's fall INVARIANT, end to end (the lead's ruling, ENG-27s, D112): a fall never pays race time. Back at a race-leg fall's x,
 * his margin to the mail boat is never better than it was the frame before the life was lost. The respawn puts him back on the margin he
 * had when he FIRST passed where he respawns, less the life-lost beat, and the boat runs on (pieces/pacerPiece.ts; it waits for no one).
 * Margin (s) = (him.x - boat.x) x dir / the boat's speed |x1 - x0| / seconds; + is ahead (pacer.ts pacerMargin).
 * Every listed 2-7 toy row (home and post, the race table's seeds 1-6, and the four-bot table's rows), both settings, every bot (the
 * careful middle, the expert on Normal, the ride-only player). A race already decided (he reached the dock, or the boat docked) is
 * never rewound (pacerPiece). It replaces the at-the-stand invariant (Option A: his margin kept whole where he stood after the respawn),
 * which credited the stretch from the respawn to the fall twice: RED on e8c4d0153 (3 of 5 race-leg falls on the table paid, +0.56..0.59 s;
 * every bot paid, ENG-27s table: A 12 of 20, B 6 of 15, C 2 of 4, D' 3 of 5).
 * THE STRICT HOLD (the lead's ruling (a), ENG-27t): the first-pass rewind alone left 7 of 89 falls paying (RED on 7501bf2fb, +0.10..0.84 s);
 * back at the fall's x the boat makes up the excess EASED. So his margin back at the x is read against the boat's clock with the excess
 * still owed counted (the race the verdict judges), and the ease itself is checked: on no frame does the boat move more than (1 + EASE_PEAK)
 * of its own step (no jump; respawn frames excepted, the respawn re-places it), and a verdict counts the excess still owed.
 */
import '../../src/game/headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { homeRun } from './homeToys.ts';
import { SKILLS } from './firsttimer.ts';
import { HOME_CODE, POST_CODE } from '../../src/game/gen2/toyHome.ts';
import { pacerMargin, pacerX } from '../../src/game/pacer.ts';

/** a frame of the fixed loop (30 fps) of the boat's travel, and as much again for his own step on the frame he lands */
const TOL = 2 / 30;
const SEEDS = [1, 2, 3, 4, 5, 6];

/** every race-leg fall of one run: his margin the frame before, and his margin the first frame he stands back at (or past) its x */
/** the test's own bound on the ease (pieces/pacerPiece.ts EASE_PEAK is the piece's): on no frame does the boat move more than half again
 *  its own step (a speed-up, never a jump; the ruling's 'no boat visibly jumps', judged on the clip too) */
const EASE_PEAK = 0.5;
/** the ease's breaches of one run: a frame the boat moved more than (1 + EASE_PEAK) of its step, a verdict that dropped the excess owed */
const easeBad: string[] = [];
let eased = 0;

function falls(bot: 'middle' | 'expert' | 'ride', code: string, setting: 'normal' | 'easy', seed: number): { x: number; m: number; back?: number; pend?: number }[] {
  const was = { ...SKILLS };
  if (bot === 'ride') Object.assign(SKILLS, { race: false, rideOnly: true });
  const out: { x: number; m: number; back?: number; pend?: number }[] = [];
  let piece: { kind: string; pacer: { dir: number; x0: number; x1: number; seconds: number }; clock: number | null; owed?: number; verdict: { him: number } | null } | undefined;
  let mLast: number | null = null, lives: number | undefined, bx: number | null = null, judged = false, wasDown = false;
  let dueAt: number | null = null, totLast: number | null = null, frame = 0;
  try {
    homeRun(bot === 'expert' ? 'expert' : 'middle', setting, seed, 1, { onFrame: (sim: { e: Record<string, any> }) => {
      const e = sim.e, p = e.player;
      piece ??= (e.pieces as Array<typeof piece>).find((q) => q!.kind === 'pacer');
      if (!piece) return;
      const P = piece.pacer;
      const m = piece.clock === null || piece.verdict ? null : pacerMargin(P as never, p.x, piece.clock + (piece.owed ?? 0));
      const fell = lives !== undefined && e.lives < lives;
      if (fell && mLast !== null) out.push({ x: p.x, m: mLast });
      // (the ease: the boat's move this frame against its own step; a respawn's frame re-places it and is excepted)
      const x = piece.clock === null ? null : pacerX(P as never, piece.clock);
      const step = Math.abs(P.x1 - P.x0) / P.seconds / 30;
      if ((piece.owed ?? 0) > 0) eased++;
      if (x !== null && bx !== null && !fell && !e.down && !wasDown && Math.abs(x - bx) > (1 + EASE_PEAK) * step + 1e-6)
        easeBad.push(`${bot} ${setting} ${seed}: the boat moved ${Math.abs(x - bx).toFixed(2)} px in a frame (its step ${step.toFixed(2)}, bound ${((1 + EASE_PEAK) * step).toFixed(2)})`);
      if (piece.verdict && !judged) {
        judged = true;
        if (piece.verdict.him + 0.05 + 1e-9 < (piece.clock ?? 0) + (piece.owed ?? 0) - 1 / 30)
          easeBad.push(`${bot} ${setting} ${seed}: the verdict ${piece.verdict.him} s dropped the excess owed (clock ${(piece.clock ?? 0).toFixed(2)} + owed ${(piece.owed ?? 0).toFixed(2)})`);
      }
      // (the boat's PLACE pays the excess, not only the books (D121): while it owes, its clock + owed grows by exactly a frame's dt (more:
      //  a new excess, the deadline restarts; less: excess lost), and the owed drains within the ease's named length, max(1, 2E / EASE_PEAK)
      //  s and a frame; a fall or the dock ends the watch (the respawn re-places it; the verdict check counts the rest))
      const owed = piece.owed ?? 0, tot = (piece.clock ?? 0) + owed;
      if (fell || e.down || wasDown || piece.verdict) dueAt = null;
      else if (owed > 0) {
        if (dueAt === null || (totLast !== null && tot - totLast > 1 / 30 + 1e-6)) dueAt = frame + Math.ceil(Math.max(1, (2 * owed) / EASE_PEAK) * 30) + 1;
        else if (totLast !== null && tot - totLast < 1 / 30 - 1e-6) easeBad.push(`${bot} ${setting} ${seed}: the ease lost ${(1 / 30 - (tot - totLast)).toFixed(4)} s of the excess in a frame`);
        if (frame > dueAt) { easeBad.push(`${bot} ${setting} ${seed}: the boat still owed ${owed.toFixed(2)} s past the ease's length`); dueAt = Infinity; }
      } else if (dueAt !== null && totLast !== null && Math.abs(tot - totLast - 1 / 30) > 1e-6) {
        easeBad.push(`${bot} ${setting} ${seed}: the ease ended ${(tot - totLast - 1 / 30).toFixed(4)} s off its excess`);
        dueAt = null;
      } else dueAt = null;
      totLast = piece.clock === null ? null : tot;
      frame++;
      bx = x;
      wasDown = !!e.down;
      // (the boat learns where he stands one frame later (the pieces step before he moves): his margin back at the x is read against
      //  the boat's whole clock, the excess it then owes counted, on the frame after: clock + owed there, less that frame's step)
      for (const f of out) if (f.pend !== undefined && piece.clock !== null) { f.back = pacerMargin(P as never, f.pend, piece.clock + (piece.owed ?? 0) - 1 / 30); f.pend = undefined; }
      for (const f of out) if (f.back === undefined && f.pend === undefined && m !== null && !e.down && p.grounded && (p.x - f.x) * piece.pacer.dir >= 0) f.pend = p.x;
      mLast = m;
      lives = e.lives;
    } } as never, code);
  } finally {
    Object.assign(SKILLS, was);
  }
  return out;
}

for (const [name, code] of [['home', HOME_CODE], ['post', POST_CODE]] as const) {
  test(`2-7 ${name}: back at a race-leg fall's x, his margin is never better than at the fall (a fall never pays, end to end)`, () => {
    const bad: string[] = [];
    let n = 0;
    const rows: Array<['middle' | 'expert' | 'ride', 'normal' | 'easy', number]> = [];
    for (const bot of ['middle', 'expert', 'ride'] as const)
      for (const setting of ['normal', 'easy'] as const) {
        if (bot === 'expert' && setting === 'easy') continue;
        for (const seed of SEEDS) rows.push([bot, setting, seed]);
      }
    // (the four-bot table's rows past seed 6: none today; home Normal 1-3, Easy 1 and 3, post Normal 4 and 5 are inside the grid)
    for (const [bot, setting, seed] of rows) {
      for (const f of falls(bot, code, setting, seed)) {
        if (f.back === undefined) continue;
        n++;
        if (f.back > f.m + TOL) bad.push(`${bot} ${setting} ${seed} x ${Math.round(f.x)}: ${f.m.toFixed(2)} at the fall -> ${f.back.toFixed(2)} s back at its x (+${(f.back - f.m).toFixed(2)})`);
      }
    }
    assert.ok(n > 0, `${name}: no race-leg fall in the grid (the test judges nothing)`);
    assert.deepEqual(bad, [], `${name}: ${bad.length} of ${n} race-leg falls paid:\n${bad.join('\n')}`);
    assert.deepEqual(easeBad, [], `${name}: the ease broke ${easeBad.length} times:\n${easeBad.join('\n')}`);
    console.log(`# ${name}: ${n} race-leg falls judged; ${eased} frames of ease on the grid`);
  });
}
