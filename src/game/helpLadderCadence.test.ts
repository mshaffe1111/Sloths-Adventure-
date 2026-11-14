// The Critic's failing test (INT-1-1 audit, 11-11): Dot's move line at 3 set-backs, at the pace a struggling player really plays.
// The rule (help-lines.md §1; ONE-ONE-FIX-PLAN "The help schedule"; the packet's "Dot's line at 3"): at 3 set-backs in a piece Dot
// SAYS the move it needs. The engine sends it (engine.ts helpSay) and takes it down LINE_UP_S (8 s) of GAME time later. Her bubble
// shows it only once her queue lets a line start (DotGuide.tsx:858-885, copied below; dotGuide.ts:510: no line that can wait starts
// in danger). He blinks 1.2 s after every set-back (engine.ts softFall: invincibleTimer 1.2), and blinking IS danger
// (dotGuideWatch.ts:90 `if (v.hurt) return true`), as is over 0.3 s in the air. A player who tries again at once (he holds right, or
// runs and jumps again: a set-back every 1.7-2.2 s) is blinking or in the air the whole time: the line never starts and the engine
// takes it down unseen. In the browser (reference/qa-reports/INT-1-1-critic/: wait-walk.json, wait-jump.json, proof-*.png; seed 982,
// both settings, upright and sideways): never shown at a set-back every 2.0 s or less; shown only when he stands about 1.2 s or more
// after each set-back. This flies the real engine at 30 fps (RealPlay, blinking as in play: `safe` off) on the real queue.
import test from 'node:test';
import type { Platform } from './types.ts';
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { RealPlay, DT } from './realPlay.ts';
import { setDifficulty } from './difficulty.ts';
import { withPlaySeed } from './testlink1_1.ts';
import { FIRST_RUN_11 } from './gen2/firstRun11.ts';
import { GuideQueue, type GuideLine } from './dotGuide.ts';
import { engineGuideLine } from './dotLines.ts';
import { DANGER } from './dotGuideWatch.ts';
import { helpGuideLine, pushHelpLine, HELP_LINES, MOVE_LINES, RUNGS, STEP_LINE } from './helpLadder.ts';
import { skyline } from './helpLadder.ts';

// (re-pinned by POLISH-9b, R-165.228: 982 left 1-1's list at POLISH-7's relist, and since then this flew a raw search's stage, which
// the A/D-only graph ruling changed. No listed layout now has a log over a gap that both sets him back and grows steps on both settings
// (swept: the first 60 listed layouts). The ladder's flight bed is now the first run's w1-last-step-up, whose 60 px hole sets him back on
// both settings and grows: its take-off and landing read from the ladder's own walking surface (helpLadder.ts skyline), never copied)
const PIECE = 'w1-last-step-up';
const SEED = FIRST_RUN_11.seed;
/** the piece's first hole on its walking surface: the take-off top before it and the landing top after it (as platforms) */
function hole(e: unknown, piece: Piece): [Platform, Platform] {
  const segs = skyline(piece, (e as { roadBoxes(): Parameters<typeof skyline>[1] }).roadBoxes());
  const i = segs.findIndex((a, j) => j + 1 < segs.length && a.x1 >= piece.x0 && a.x1 <= piece.x1 && segs[j + 1].x0 > a.x1 + 1 && a.x1 - a.x0 >= 120);
  assert.ok(i >= 0, `${PIECE} has a hole in its walking surface`);
  const plat = (g: (typeof segs)[number]) => ({ id: -1, x: g.x0, y: g.y, width: g.x1 - g.x0, height: g.bottom - g.y, type: 'solid' }) as Platform;
  return [plat(segs[i]), plat(segs[i + 1])];
}
type Piece = { k: string; x0: number; x1: number };
type Eng = { currentStage: { meta: { pieces: Piece[] } }; help: { count(k: string): number }; helpAsk: (o: unknown, answer: (yes: boolean) => void) => void; stop(): void };

/**
 * He walks off the piece's first log again and again, standing still `waitS` seconds after each set-back before he goes again.
 * Returns the seconds of play the move line was up in her bubble between the engine sending it and taking it down, and the set-backs
 * in that time.
 */
function fly(setting: 'easy' | 'normal', waitS: number, want?: string): { sent: boolean; upS: number; setBacks: number; cycleS: number } {
  setDifficulty(setting);
  const r = withPlaySeed(SEED, () => new RealPlay('1-1', 1));
  const e = r.e as unknown as Eng;
  try {
    // (as in play: he blinks after a set-back and then stops; RealPlay's default keeps him blinking for ever)
    r.safe = false;
    e.helpAsk = (_o, answer) => answer(false);
    const piece = e.currentStage.meta.pieces.find((q) => q.k === PIECE)!;
    assert.ok(piece, `seed ${SEED} lays ${PIECE}`);
    const [log] = hole(e, piece);
    r.stand(Math.max(log.x + 20, log.x + log.width - 140), log.y);
    r.p.invincibleTimer = 0;
    // Dot's guide, as DotGuide.tsx runs it each frame (:858-885): her clock, the air time, the queue
    const q = new GuideQueue(true);
    // (the move the engine reads for the piece as laid: engine.ts pieceMove)
    const mv = MOVE_LINES[(e as unknown as { pieceMove(p: Piece): keyof typeof MOVE_LINES }).pieceMove(piece)];
    const line = want ?? mv.touch, linePad = want ?? mv.pad;
    let clock = 0, airMs = 0, said = 0, passed = 0, sentAt = -1, downAt = -1, up = 0, n = 0, wait = 0, firstBack = -1, lastBack = -1, backsInWindow = 0;
    for (let i = 0; i < 30 * 90 && downAt < 0; i++) {
      r.frame({ right: wait <= 0 });
      if (wait > 0) wait -= DT;
      const p = r.p;
      const t = r.e.gameTime as number;
      const now = e.help.count(PIECE);
      if (now > n) {
        n = now;
        wait = waitS;
        if (firstBack < 0) firstBack = t;
        lastBack = t;
        if (sentAt >= 0) backsInWindow++;
      }
      // (the engine's lines to her: a ladder line goes in as DotGuide.engineLine puts it; a "passed" takes it down, passedLine)
      for (; said < r.said.length; said++) {
        const text = r.said[said].text;
        if (!HELP_LINES.has(text)) continue;
        const l = helpGuideLine(text, 'reminders', 6000);
        if (l) pushHelpLine(q, l as GuideLine, clock);
        if (text === line || text === linePad) sentAt = t;
      }
      for (; passed < r.passed.length; passed++) {
        const text = r.passed[passed].text;
        const l = engineGuideLine(text, '1-1', { dot: true });
        if (l) q.clear((x) => x.key === l.key, clock);
        if (text === line || text === linePad) downAt = t;
      }
      const hurt = p.invincibleTimer > 0;
      if (!hurt) clock += DT * 1000;
      airMs = p.grounded ? 0 : airMs + DT * 1000;
      // (DotGuide.tsx:870 `danger = inDanger(v) || ... || airMs > 300`; dotGuideWatch.ts inDanger: blinking, or falling fast)
      const danger = hurt || airMs > 300 || (!p.grounded && p.vy > DANGER.fallVy);
      q.tick(clock, { danger, hold: false, moveCount: () => 0, stale: () => false } as never);
      const cur = q.cur?.line.text;
      if (sentAt >= 0 && downAt < 0 && (cur === line || cur === linePad)) up += DT;
    }
    assert.ok(n >= RUNGS.move, `he was set back ${n} times`);
    return { sent: sentAt >= 0, upS: Math.round(up * 10) / 10, setBacks: backsInWindow, cycleS: n > 1 ? Math.round(((lastBack - firstBack) / (n - 1)) * 100) / 100 : 0 };
  } finally {
    e.stop();
    setDifficulty('normal');
  }
}

for (const setting of ['normal', 'easy'] as const) {
  test(`1-1 ${setting}, seed ${SEED}, ${PIECE}: he holds right and walks off again and again; Dot's move line at 3 is up in her bubble at least 2 s before the engine takes it down`, () => {
    const f = fly(setting, 0);
    assert.ok(f.sent, 'the engine sent the move line at 3');
    assert.ok(f.upS >= 2, `the line was up ${f.upS} s (a set-back every ${f.cycleS} s, ${f.setBacks} more set-backs before the engine took it down)`);
  });
}

test('the harness is honest: standing still 2 s after each set-back, the same line does come up (so the red above is the pace, not the test)', () => {
  const f = fly('normal', 2);
  assert.ok(f.sent && f.upS >= 2, `up ${f.upS} s (a set-back every ${f.cycleS} s)`);
});

// (the Engine's fix, INT-1-1: the ladder's line starts while he blinks (dotGuide.ts `anyway`) and its 8 s count from when it is first on
// screen (helpLadder.ts helpLineOnScreen). The Critic asked for the step line at 8 to be checked the same way: Easy, at the same pace)
test(`1-1 easy, seed ${SEED}, ${PIECE}: at the same pace the step line at 8 is up in her bubble at least 2 s`, () => {
  const f = fly('easy', 0, STEP_LINE);
  assert.ok(f.sent, 'the engine sent the step line at 8');
  assert.ok(f.upS >= 2, `the step line was up ${f.upS} s (a set-back every ${f.cycleS} s)`);
});

// (the browser found two more holds the harness above does not have, INT-1-1 pace.mjs: the stage's own double tip was up, and a clear
// that waits its minimum time never comes while her clock stands still in the blink; and a "passed" that waited the same way held the
// move line up over the step line. Both now go at once)
test('in danger with her clock still: the ladder line takes over from the stage tip at once, and its "passed" takes it down at once', () => {
  const q = new GuideQueue(true);
  const tip = engineGuideLine('Flick up again in the air to jump twice', '1-1', { dot: true })!;
  const env = (danger: boolean) => ({ danger, hold: false, moveCount: () => 0, stale: () => false }) as never;
  q.push(tip as GuideLine, 9000);
  q.tick(9000, env(false));
  assert.equal(q.cur?.line.key, tip.key, 'the stage tip is up');
  const move = helpGuideLine(MOVE_LINES.single.touch, 'reminders', 6000)!;
  pushHelpLine(q, move as GuideLine, 9100);
  q.tick(9100, env(true));
  assert.equal(q.cur?.line.text, MOVE_LINES.single.touch, 'up at once, in danger, the clock not moved on');
  // (DotGuide passedLine for a ladder line, then the step line)
  q.clear((l) => l.key === `engine:${MOVE_LINES.single.touch}`, 9100, true);
  pushHelpLine(q, helpGuideLine(STEP_LINE, 'reminders', 5000)! as GuideLine, 9100);
  q.tick(9100, env(true));
  assert.equal(q.cur?.line.text, STEP_LINE);
});

// (delta 2: the old stuck helper, "This way, Pokey! Try over here.", spoke 2.5 s after the steps grew; DotGuide.tsx asks helpLadderOn()
// and keeps it quiet while a ladder is on. The seam: on in 1-1, off on another stage and after the stage ends)
test('helpLadderOn: true while 1-1 runs (its ladder on), false on 1-2 and once the stage has ended', async () => {
  const { helpLadderOn } = await import('./helpLadder.ts');
  setDifficulty('easy');
  const r = withPlaySeed(SEED, () => new RealPlay('1-1', 1));
  assert.equal(helpLadderOn(), true);
  (r.e as unknown as Eng).stop();
  assert.equal(helpLadderOn(), false);
  const o = new RealPlay('1-2', 1);
  assert.equal(helpLadderOn(), false);
  (o.e as unknown as Eng).stop();
  setDifficulty('normal');
});
