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
import assert from 'node:assert/strict';
import './headlessDom.ts';
import { RealPlay, DT } from './realPlay.ts';
import { setDifficulty } from './difficulty.ts';
import { withPlaySeed } from './testlink1_1.ts';
import { GuideQueue, type GuideLine } from './dotGuide.ts';
import { engineGuideLine } from './dotLines.ts';
import { DANGER } from './dotGuideWatch.ts';
import { helpGuideLine, pushHelpLine, HELP_LINES, MOVE_LINES, RUNGS } from './helpLadder.ts';

const SEED = 982;
const PIECE = 'w1-log-chain-rise';
type Piece = { k: string; x0: number; x1: number };
type Eng = { currentStage: { meta: { pieces: Piece[] } }; help: { count(k: string): number }; helpAsk: (o: unknown, answer: (yes: boolean) => void) => void; stop(): void };

/**
 * He walks off the piece's first log again and again, standing still `waitS` seconds after each set-back before he goes again.
 * Returns the seconds of play the move line was up in her bubble between the engine sending it and taking it down, and the set-backs
 * in that time.
 */
function fly(setting: 'easy' | 'normal', waitS: number): { sent: boolean; upS: number; setBacks: number; cycleS: number } {
  setDifficulty(setting);
  const r = withPlaySeed(SEED, () => new RealPlay('1-1', 1));
  const e = r.e as unknown as Eng;
  try {
    // (as in play: he blinks after a set-back and then stops; RealPlay's default keeps him blinking for ever)
    r.safe = false;
    e.helpAsk = (_o, answer) => answer(false);
    const piece = e.currentStage.meta.pieces.find((q) => q.k === PIECE)!;
    assert.ok(piece, `seed ${SEED} lays ${PIECE}`);
    const log = r.platforms.filter((p) => p.type === 'solid' && p.style === 'log' && p.width >= 300 && p.x >= piece.x0 - 2 && p.x + p.width <= piece.x1 + 2).sort((a, b) => a.x - b.x)[0];
    r.stand(log.x + log.width - 140, log.y);
    r.p.invincibleTimer = 0;
    // Dot's guide, as DotGuide.tsx runs it each frame (:858-885): her clock, the air time, the queue
    const q = new GuideQueue(true);
    const line = MOVE_LINES.single.touch, linePad = MOVE_LINES.single.pad;
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
