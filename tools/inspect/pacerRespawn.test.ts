/**
 * The race's respawn INVARIANT (the lead's ruling, Option A, 11-21; D112): a fall neither costs nor pays race time. On every respawn on
 * the race leg the respawn's lost time is forgiven and he keeps EXACTLY the margin he had when he fell (it still costs the heart):
 * his margin to the mail boat the first frame he stands after the respawn == his margin the frame before the life was lost.
 * Margin (s) = (him.x - boat.x) x dir / the boat's speed |x1 - x0| / seconds; + is ahead; boat.x where the piece's clock puts it on its
 * leg, unclamped (pacer.ts pacerMargin: the same as the drawn boat's x while it runs; a lead kept from near the start leaves the clock
 * negative, the boat waiting at its start that long, and the race's time is what the verdict reads).
 * Every listed 2-7 toy row (home and post, the race table's seeds 1-6), both settings, every bot (the careful middle, the expert on Normal,
 * the ride-only player), every life lost on the race leg paired with ITS OWN respawn. A respawn before the leg sets the boat back at its
 * start, waiting (unjudged here); a race already decided (he reached the dock, or the boat docked) is never rewound (pacerPiece).
 * RED on the floor it replaces (t-eng-27 154eb8366: home 90 of 91, post 76 of 78 respawns moved his margin, both ways; inv-red-27k.txt).
 */
import '../../src/game/headlessDom.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { homeRun } from './homeToys.ts';
import { SKILLS } from './firsttimer.ts';
import { HOME_CODE, POST_CODE } from '../../src/game/gen2/toyHome.ts';
import { pacerMargin } from '../../src/game/pacer.ts';

/** a frame of the fixed loop (30 fps) of the boat's travel, and as much again for his own step on the frame he lands */
const TOL = 2 / 30;
const SEEDS = [1, 2, 3, 4, 5, 6];

interface Row { at: string; before: number; after: number }

function respawns(bot: 'middle' | 'expert' | 'ride', code: string, setting: 'normal' | 'easy', seed: number): { rows: Row[]; unpaired: string[] } {
  const was = { ...SKILLS };
  if (bot === 'ride') Object.assign(SKILLS, { race: false, rideOnly: true });
  const rows: Row[] = [], unpaired: string[] = [];
  // (the margin of the last frame, the life lost waiting for its stand, his lives last frame)
  let piece: { kind: string; pacer: { x0: number; x1: number; dir: number; seconds: number }; clock: number | null; x: number; verdict: unknown } | undefined;
  let last: { m: number | null; decided: boolean } | null = null, open: { m: number; x: number } | null = null, lives: number | undefined;
  try {
    homeRun(bot === 'expert' ? 'expert' : 'middle', setting, seed, 1, { onFrame: (sim: { e: Record<string, any> }) => {
      const e = sim.e;
      piece ??= (e.pieces as Array<typeof piece>).find((q) => q!.kind === 'pacer');
      if (!piece) return;
      const P = piece.pacer;
      const m = piece.clock === null ? null : pacerMargin(P as never, e.player.x, piece.clock);
      const decided = !!piece.verdict || (piece.clock !== null && piece.clock >= P.seconds);
      if (lives !== undefined && e.lives < lives) {
        if (open) unpaired.push(`life lost at x ${Math.round(open.x)} (${open.m.toFixed(2)} s) never stood before the next`);
        open = last && last.m !== null && !last.decided ? { m: last.m, x: e.player.x } : null;
      } else if (open && !e.down && e.player.grounded) {
        if (m !== null && !decided) rows.push({ at: `x ${Math.round(open.x)} -> ${Math.round(e.player.x)}`, before: open.m, after: m });
        open = null;
      }
      last = { m, decided };
      lives = e.lives;
    } } as never, code);
  } finally {
    Object.assign(SKILLS, was);
  }
  return { rows, unpaired };
}

for (const [name, code] of [['home', HOME_CODE], ['post', POST_CODE]] as const) {
  test(`2-7 ${name}: every respawn on the race leg keeps exactly the margin he had when he fell (a fall neither costs nor pays race time)`, () => {
    const bad: string[] = [];
    let n = 0;
    for (const bot of ['middle', 'expert', 'ride'] as const) {
      for (const setting of ['normal', 'easy'] as const) {
        if (bot === 'expert' && setting === 'easy') continue;
        for (const seed of SEEDS) {
          const { rows, unpaired } = respawns(bot, code, setting, seed);
          for (const u of unpaired) bad.push(`${bot} ${setting} ${seed}: ${u}`);
          for (const r of rows) {
            n++;
            if (Math.abs(r.after - r.before) > TOL) bad.push(`${bot} ${setting} ${seed} ${r.at}: ${r.before.toFixed(2)} -> ${r.after.toFixed(2)} s`);
          }
        }
      }
    }
    assert.ok(n > 0, `${name}: no respawn on the race leg in the grid (the test judges nothing)`);
    assert.deepEqual(bad, [], `${name}: ${bad.length} of ${n} respawns on the race leg changed his margin:\n${bad.join('\n')}`);
  });
}

// (ENG-27s, the fall-pays measure END TO END (D112: the principle 'a fall never pays' as its own test, not the respawn mechanism): the
//  respawn above keeps his margin where he STANDS after it, which is behind the fall's x; back at the fall's x his margin must be no better
//  than it was the frame before the fall. PLANT: RED where a fall pays (ENG-27s table, every bot A, B, C, D': the stretch from the respawn to
//  the fall is credited twice, once when he first crossed it and again as he re-crosses it from a margin kept whole, 0.01-0.81 s a fall))
const CASES = [['home', 'normal', 1], ['home', 'normal', 2], ['home', 'normal', 3], ['home', 'easy', 1], ['home', 'easy', 3], ['post', 'normal', 4], ['post', 'normal', 5]] as const;
test('2-7 home and post, the careful middle: back at a race-leg fall\'s x, his margin is never better than at the fall (a fall never pays, end to end)', () => {
  const bad: string[] = [];
  let n = 0;
  for (const [where, setting, seed] of CASES) {
    let piece: { kind: string; pacer: { dir: number }; clock: number | null; verdict: unknown } | undefined;
    let mLast: number | null = null, lives: number | undefined;
    const falls: { x: number; m: number; back?: number }[] = [];
    homeRun('middle', setting, seed, 1, { onFrame: (sim: { e: Record<string, any> }) => {
      const e = sim.e, p = e.player;
      piece ??= (e.pieces as Array<typeof piece>).find((q) => q!.kind === 'pacer');
      if (!piece) return;
      const m = piece.clock === null || piece.verdict ? null : pacerMargin(piece.pacer as never, p.x, piece.clock);
      if (lives !== undefined && e.lives < lives && mLast !== null) falls.push({ x: p.x, m: mLast });
      for (const f of falls) if (f.back === undefined && m !== null && !e.down && p.grounded && (p.x - f.x) * piece.pacer.dir >= 0) f.back = m;
      mLast = m;
      lives = e.lives;
    } } as never, where === 'post' ? POST_CODE : HOME_CODE);
    for (const f of falls) {
      if (f.back === undefined) continue;
      n++;
      if (f.back > f.m + TOL) bad.push(`${where} ${setting} ${seed} x ${Math.round(f.x)}: ${f.m.toFixed(2)} at the fall -> ${f.back.toFixed(2)} s back at its x (+${(f.back - f.m).toFixed(2)})`);
    }
  }
  assert.ok(n > 0, 'no race-leg fall in the table (the test judges nothing)');
  assert.deepEqual(bad, [], `${bad.length} of ${n} race-leg falls paid:\n${bad.join('\n')}`);
});
