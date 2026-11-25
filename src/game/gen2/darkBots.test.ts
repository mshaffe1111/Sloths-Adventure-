/**
 * THE BOTS' SKILL FOR THE DARK (ENG-DARK, R-165.449; level.md rule 21: a skill every bot has, with its planted toy): at a rim in the
 * glowworms' dark whose landing is still dark, he stands until it is lit, then goes (firsttimer.ts glowWait; 3-1.md "Stand still, and
 * the glowworms show the way down"). On a REAL row (level.md rule 23): World 3's first stage drafted down (stageTable.ts DRAFT_TABLE
 * '3-1'), the whole bot run in the real engine, the rims he goes over judged by litAhead ('every gap lit 1 s ahead', GAME-MAP B9).
 *   - with the skill: every rim he goes over in the run's first minute was lit 1 s ahead: GREEN;
 *   - the skill REMOVED (noGlowWait, the plant): he walks off into the dark: RED.
 * The draft is readied before the bots' harness loads (realPlay.ts builds the levels at load), so the bots are imported after it.
 */
import '../headlessDom.ts';
import { readied, readyDraft } from '../../../tools/engine/draft.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const DRAFT = '3-1';
/** the bot's first minute on the draft's roll 1 (a minute crosses several of its dark rims) */
async function run(noGlowWait: boolean) {
  if (readied !== DRAFT) readyDraft(DRAFT);
  const { firstTimer, FT_ADULT } = await import('../../../tools/inspect/firsttimer.ts');
  return firstTimer(DRAFT, 1, noGlowWait ? { ...FT_ADULT, noGlowWait } : FT_ADULT, { cap: 60 });
}

test("the dark's skill: he stands at a dark rim until its landing is lit, then goes: every rim he went over was lit 1 s ahead (GREEN)", async () => {
  const r = await run(false);
  assert.ok(r.dark, 'the drafted 3-1 has a lit dark (FTRun.dark)');
  assert.ok(r.dark.crossed >= 3, `he went over dark rims in his first minute (${r.dark.crossed})`);
  assert.deepEqual(r.dark.unlit, []);
});

test("the dark's skill REMOVED (noGlowWait, rule 21's plant): he walks off into the dark (RED)", async () => {
  const r = await run(true);
  assert.ok(r.dark && r.dark.crossed >= 3, `he went over dark rims (${r.dark?.crossed})`);
  assert.ok(r.dark.unlit.length >= 1, 'a rim gone over with its landing dark');
  assert.match(r.dark.unlit[0], /landing dark|after its light woke/);
});

test("the dark's skill holds a running JUMP too: the expert's jump into the dark waits for the landing's light (GREEN; planted: glowJump removed)", async () => {
  // (castBots x40 on 653bb970: the expert went over the rim at the right end of a piece with its landing dark, the jump pressed 94 px
  //  out, just past GLOW_NEAR; this roll's first 85 s hold that jump)
  if (readied !== DRAFT) readyDraft(DRAFT);
  const { firstTimer, FT_EXPERT } = await import('../../../tools/inspect/firsttimer.ts');
  const r = firstTimer(DRAFT, 12, FT_EXPERT, { cap: 85 });
  assert.ok(r.dark && r.dark.crossed >= 3, `he went over dark rims (${r.dark?.crossed})`);
  assert.deepEqual(r.dark.unlit, []);
});
