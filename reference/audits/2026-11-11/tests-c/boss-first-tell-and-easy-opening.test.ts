/**
 * Audit C (boss slice): two fixes are gated on BossDef.openCue (set only for bosses 1-3), a flag that means "the opening is announced".
 *
 * 1. bossAI.ts startMove: "the first time, Dot names it, and the wind-up runs long enough for her line to be read before it strikes
 *    (QA gate: the pounce tip came up with the hit)". The Sky Sovereign (7 named moves) and the Tarantula Queen (6 named moves) have
 *    Dot's per-move lines too, with wind-ups as short as 0.55 s, and do not get the longer first wind-up.
 * 2. bossAI.ts EASY_OPEN_MUL: "Easy: every opening lasts this many times as long". engine.ts gives it only to an openCue boss.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BossPlay, DT } from '../../../../src/game/bossPlay.ts';
import { EASY_OPEN_MUL, FIRST_TELL_MUL } from '../../../../src/game/bossAI.ts';

/** stand in the arena, unhurt, and log every wind-up that came with one of Dot's move lines */
function firstTells(id: string, seconds: number) {
  const f = new BossPlay(id);
  f.skipEntrance();
  const lines = new Set(Object.values(f.def.moves).map((m) => m.guide).filter(Boolean) as string[]);
  const out: Array<{ move: string; tell: number; lasted: number }> = [];
  let said = f.guides.length;
  let watching: { move: string; n: number } | null = null;
  for (let i = 0; i < seconds / DT; i++) {
    f.p.invincibleTimer = 1;
    f.frame();
    const st = f.boss.ai!.state;
    if (watching && (st !== 'tell' || f.boss.ai!.move !== watching.move)) {
      out.push({ move: watching.move, tell: f.def.moves[watching.move].tell, lasted: watching.n * DT });
      watching = null;
    }
    if (watching) watching.n++;
    for (; said < f.guides.length; said++) {
      if (lines.has(f.guides[said].text) && st === 'tell' && f.boss.ai!.move) watching = { move: f.boss.ai!.move, n: 1 };
    }
  }
  return out;
}

for (const id of ['2-10', '4-10', '5-10']) {
  test(`${id}: a move Dot names for the first time winds up long enough to read her line (FIRST_TELL_MUL)`, () => {
    const seen = firstTells(id, 50);
    assert.ok(seen.length >= 2, `saw ${seen.length} named first wind-ups`);
    for (const s of seen) {
      assert.ok(s.lasted >= s.tell * FIRST_TELL_MUL - 2 * DT, `${id} ${s.move}: Dot's line came with a ${s.lasted.toFixed(2)} s wind-up (the move's own ${s.tell} s; the rule gives ${(s.tell * FIRST_TELL_MUL).toFixed(2)} s)`);
    }
  });
}

for (const id of ['1-10', '4-10', '5-10', '6-10', '7-10', '8-10', '9-10', '10-10']) {
  test(`${id} Easy: every opening lasts EASY_OPEN_MUL times as long`, () => {
    const f = new BossPlay(id, true);
    assert.equal(f.e.bossContext().openMul, EASY_OPEN_MUL);
  });
}
