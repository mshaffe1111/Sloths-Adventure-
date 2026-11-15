# ENG-LOOK: night of 11-14, (1) and (1b) (t-eng-look). Report 10:45 PM ET, context ~40% (my estimate; get_session reads 0)

**EXACT NEXT STEP (morning, in this order; each planted first, any stage):**
1. **(1b, second half) the tip's gap as a MARKED fall, built WITH (2), not tonight (pushback below).** The red is w1Pits.test "World 1,
   layout 1: ... the only unmarked floorless gaps outside 1-8 are 1-6's water": 1-8 reads 1 unmarked fall (the tip's gap from layTip) where
   the test still pins the DELETED hand-built 1-8 (`falls['1-8'] >= 10`, its unmarked chase holes). The fix is three moves together:
   (a) w1Pits.ts `chaseGaps` honours a bank's `pit: 'drop'` (today it ignores marking: every chase-stage gap is an unmarked fall);
   (b) chaseTip.ts layTip marks the far branch `pit: 'drop'`; (c) the w1Pits test holds 1-8 to 0 unmarked falls like every other W1 stage
   (drop the `>= 10` pin of the deleted builder; the rule gets STRICTER, law 15). Planted test ready to paste into chaseTipLay.test.ts:
   toy({ at: 10364, dy: 80 }) + layTip, then `findW1Pits(st.platforms).filter(g => g.x0 < g1 && g.x1 > g0)` is one `fall` with
   `drop === true` (red today: `{"kind":"fall","lipL":false,"lipR":false}`, no drop). BUT (a)+(b) alone make w1Pits' chase painter
   (w1Pits.ts ~l.976, `if (chase)`) draw a dark hole AND torn branch ends at both banks, the far tree's whole branch included: so it lands
   with (2)'s pit look (chaseBrokenL/R at a BREAK; the tip's end is the tip art, the far bank is a living branch, never torn).
2. **(1c) the lead's, 10:13 PM: w1Overhang '23 stones past their ground on 1-8'.** BUILD-18b's diagnosis: pipeline settle (pipeline.ts
   ~2799, w1.ts settle) runs BEFORE layChaseStage cuts the bank into crumble sections, so groundRun sees one wall and keeps the rock; after
   the cut the rock's art hangs 54-230 px over a section that falls. Fix: settle after the chase lay, or groundRun counts only standing
   (non-crumble) wall. Plant on chaseLay's toy (a rock on a bank the lay cuts) before the fix; then `seedlist 1-8 --check` and the lock
   (the stones move on 1-8 only; list what moved).
3. **(2) the bough look**, per the packet: merge origin/t-eng-dr (c3c7e658) first; the ONE HF job (cap $3, HF-SPEND.md); the look by world
   data baked into the ground chunks; the first real still upright + sideways to the lead before finishing; drawcheck 1-8 at x 24036 both
   ways WITH ENG-DR's dressing, and the 1-98 fixture. Note for (2): engine.ts `setCanopy` was keyed to the deleted `proto.chase` (the
   hand-built 1-8 turned the canopy full); gen2 1-8 has had canopy 0 since BUILD-18's routing change. Tonight's deletion keeps 0 (no
   change); whether a laid chase turns the canopy is the look's call.
4. **(3)** the still fork's eagle on ENG-WATCH's head (R-165.267), as the packet says.
5. Not engine, seen on my stills: on the far branch past the tip Dot says "The mossy fork won't break. Stop and keep still!" (the still
   fork's line, firing on the far tree's branch: tip-gap-today-side.jpg). The keeper's/BUILD-18b's to check; I did not trace it.

## Done-items
**(1) The dead hand-built 1-8 is deleted, and the 7 tests pinned to it hold their rules on a LAID gen2 chase, any chase stage.**
- Deleted (new replaces old): protoStage.ts `buildLongBranch` (~250 lines), its routing, `BRANCH_TILE`, `ProtoExtras.chase`, the
  `'1-8'` StagePlan; w1Sections.ts 1-8's section rows, `w1Chase` and its CHASE patterns (`W1Stage` no longer holds 1-8: isW1Stage('1-8')
  was still true, a stale route for layoutMemory); engine.ts's own ChasePlan collapse (`this.chase`, updateChase, restartChase, drawChase,
  drawChaseEdge, chaseFalling/SlowDone/Next, the chase camera lead, the music danger, the guide view's `!!this.chase`, the canopy key).
  `chaseCaught` was SHARED with the piece hook's `toFlag` hurt: kept as `heartToFlag` (same body, Game Over guard included).
  easyMode.ts's two `proto.chase` flags (always false since BUILD-18) removed. chase.test.ts' test of the deleted builder removed (its
  rules: the chase stage's own tests and w1Arc18.test hold 1-8 now; ONE rule had no other pin: "World 1's book in a fern before the
  chase": finds.ts w1_book's clue says "On The Long Branch, check by the first knot" and the gen2 1-8 lays NO book (grep w1Arc18.ts:
  none). That is a content gap BUILD-18b/the keeper should place; I name it, not fix it). chaseLay.test's BRANCH_TILE pin dropped (one
  definition left: CHASE_LAY.tile 222).
- The inspector's pacing (tools/inspect/inspect.ts) keyed its chase column off `proto.chase`: gen2 1-8 was judged on the Normal column.
  Re-pointed to the stage's laid chase (`st.chase.stretches.length`); beats.ts' dead proto.chase span removed (the laid one stays).
- **The 7 re-pointed tests** (chaseTestKit.ts: `laidChaseStages()` = every STAGE_TABLE row whose stage lays a chase, never empty;
  `chaseRunOf`, `forkFlag` = a flag on the living fork before a later stretch, `sectionAt`), each a loop over every chase stage:
  chasePiece.test 'every stage that lays one starts exactly one [piece], and nothing else collapses beside it' (both settings);
  chaseRespawn A-07, A-07b; chaseRespawnReal 'out of lives (caught by the front)', '(fell off the branch)', 'snake mid-chase', 'hit
  while the collapse is past his flag'. Rules unchanged: one respawn at full hearts, the collapse waiting behind the flag, one Game Over,
  lives never below 0.
- **Planted (each restored after):** A: chasePiece.respawn forgets the chase -> A-07 red, and after I added "branch whole from his flag,
  front behind it" to the two Real tests (my first cut passed them: on a laid chase a front cannot catch him on a fork, so hearts alone
  proved nothing) snake + hit-past-flag red too. C: the Game Over guards removed (heartToFlag's AND loseLife's: loseLife now has its own,
  so one alone cannot go red) -> both out-of-lives tests red. D: restartAt's fresh-chase branch removed -> A-07b red.
- chasePiece.test 19/19, chaseRespawn 2/2, chaseRespawnReal 4/4, chase.test, chaseLay.test green; tsc clean.

**(1b), first half: the far-bough flag.** layTip moved a flag out of the tip's gap to `g1 + 120` but kept its OLD y, so on 1-8 layout 3
it floated off the far branch: skills.test 'no stage needs a rope ... every stage stays beatable' -> "1-8 v3: checkpoint at x=35024 is
not on a reachable platform". Fix: the flag goes to the far branch's top (`y: lip.y`). Planted: chaseTipLay.test 'a flag it moves out of
the gap stands ON the far branch' (a toy whose ground past the tip is 80 px lower) red with the fix reverted, green with it; skills.test
red on the frozen pre-fix head (suite shard), green on e014d41d.

## Whole suite (3 shards, frozen worktree at c738e52f = (1) without the flag fix)
SUITE_RESULT

## Polish check
Stills (sideways 915x412, dsf 1, real dev page, layout 1): tip-lip-today-side.jpg (on the tip: the branch ends in an earth bank, the
forest-floor ground (2) replaces) and tip-gap-today-side.jpg (from the far branch: the gap's near bank is a SQUARE earth notch, exactly
the lead's "never a square notch" for (2); the stray Dot line above). Nothing tonight changed a pixel: the deleted engine path drew only
for `proto.chase`, which no stage had set since BUILD-18 (proven unreachable: HAND_STAGES has no 1-8).

## Pushback
The packet's (1b) "the tip's gap must be a marked fall" is right as a rule, but marking it today is a LOOK change: on a chase stage the
pit painter paints every marked fall as a hole (dark under it, torn branch ends both sides). At the tip the far bank is the next tree's
living branch, and the near bank the tip art; both would get torn ends, unseen, on a stage already failing drawcheck. D40: it is the
pit look (2) rebuilds, so it ships with (2), shown first. Until then w1Pits.test stays RED on my head, named, not known-listed (law 22).

## Suggestions
- tools/validate/play.ts meters the chase from the deleted `engine.chase` (`chaseMinGap`, `chaseCaught`, `chaseOnScreen`,
  `chaseOutrunWith` reading `proto.chase`): on a laid chase it reads null, so world1.ts' 'chase outrun' rule never judges 1-8; and
  validate.test 'chase: on open ground ...' plants the deleted path (no workflow runs it: ciTests.test should catch that). Packet: re-point
  the meter to `pieces.find(kind 'chase').run` (frontBehind/caughtInRun), a counter test that proves it counts a planted catch.
- Dead after tonight, harmless, for a cleanup packet: protoArt.ts `drawCrownArt` and Platform.crown (only the deleted drawChase drew
  crowns), the w1Pits.ts note "1-8's gaps need nothing".

## Unresolved
w1Pits.test 1-8 (above, step 1); w1Overhang 23 stones (step 2, (1c)); BUILD-18's DATA reds are BUILD-18b's (not touched; w1Arc18.ts
untouched). Gates other than tsc + the suite were NOT run tonight (drawcheck, clipcheck, build, chunkcheck, seedlist, bots): cut for the
cutoff, not skipped; (2) changes the drawing, so they run on (2)'s head.

## Method used / Lessons applied / Method update
stage-fix.md + level.md rules 21-29 read; tests planted before each fix. Lessons: D19 (the tests drive the real engine and the piece the
screen runs, not a model), D23/D36 (suite on a frozen worktree), D40 (the tip marking waits for the look that replaces its painter), D55
(context % on every message), D57 (queue read before the push: the lead's (1c) arrived 10:13, taken into the next step), law 3 (probed
1-8's lay, flags and pieces before re-pointing), law 22 (no rule loosened; the one red left red and named).
Method update (proposed for stage-fix.md): "Re-pointing a test from a deleted path: plant the OLD bug against the NEW path (here: the
piece's respawn forgetting the chase). A re-pointed test that still passes with the bug planted proves nothing: my first cut of two
Real tests did, because a laid chase cannot catch him on a fork; I added the state the rule names (branch whole, front behind)."

## Learned
A deleted path's tests are re-pointed by their RULE, then planted against the new code; and a "same rule" can be vacuous on the new
code (forks), so the assertion must name the state, not the symptom.

## Turnover note
Not rewritten tonight (the task runs on into (2) tomorrow); engine-core.md gets its rewrite at the end of (2)-(3).
