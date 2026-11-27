# ENG-TIPLEFT REPORT (the left-leg socket tip; 2-8's engine gap; rule 26). Session 1, started 9:39 PM ET (from the session hook date)

## EXACT NEXT STEP (LANDED: 8a2045547 on t-eng-tipleft, base a0d85e961)
BUILD-28's next session: `git merge origin/t-eng-tipleft` into t-build-28-wip (fast-forward base, no conflicts expected), tsc, then
libstage --stage 2-8 --seeds 40 on a frozen tree. Seed 2's fork line is fixed (said at its socket walking left). Seed 3's is 2-8's
DEAL (fork-rest dealt to the outbound rest n6): pin fork-rest to the R before F, in data. Also data, inherited and identical on base:
storyTipScan's two 2-8 lines (fork, rise) dropped on Tips.

## GATES (frozen worktrees; base a0d85e961 frozen beside them). Full run on 0057bd6f5; the final 8a2045547 re-checked where it differs
- tsc 0. generalitycheck PASS (26 literals, 26 known).
- LOCK, one run, lockall --layouts 16 over ALL 102 stages (3,264 builds) against the base's own lock: 100/102 unchanged. Moves, every one:
  - 1-4, part proto.hints ONLY, all 32 builds (layouts unchanged): its two left-running storeys' tips now carry beforeX. Layout 1
    Normal: "field" (s5, entry x 550 -> exit 110) was { x 484 }, now { x 110, beforeX 484 }; "figs" (s7, entry 1166 -> exit 540) was
    { x 1069 }, now { x 354, beforeX 1069 }. Before, each was said on entering the storey, 66 and 97 px before its socket; now at it.
    seedlist 1-4 --check: PASS (100 seeds, each clean on both settings).
  - 2-8, every part, on variants 2, 4, 5, 6, 9, 10, 12, 16 (both settings): on the base those rolls were REFUSED (the fork tip early)
    and the build fell to another seed (variant 2: seed 7921, 4: 11955, 5: 12964); now each builds clean on its own seed. Intended:
    2-8 is mid-build and has no seed list.
- CI tool line ('rolled'): tools tests 437: 435 pass, 1 fail, 1 todo (the fail = registrycheck.test, inherited, as ENG-FORK28's);
  tipwalk --layouts 4 PASS; teachFirstScan --check --seeds 20 PASS (0 misses, 600 rolls); tierBots 9/9 PASS.
  INHERITED reds (2-8 mid-build): registrycheck (2-8 not in drawcheck scenarios, no seed list, not flown); storyTipScan --check
  FAIL on 2-8's fork and rise lines dropped on Tips: IDENTICAL on the base (BUILD-28's data: storyTips/teachTips for those two lines).
- SUITE on 0057bd6f5, 6 shards (tests / pass / fail / todo): 1: 674/673/1/0; 2: 657/656/1/0; 3: 742/741/1/0; 4: 754/754/0/0;
  5: 705/701/2/2; 6: 684/682/1/1.
  MINE, fixed in 8a2045547: shard 1 tipBand.test "every rolled tip carries its section band": 1-8's "w18.nut" is laid as a WARNING
  and tipHintOf skipped warnings. Now it matches by x first (the old matcher exactly), then by beforeX. On 8a2045547: tipBand.test +
  tipLeft.test 10/10 PASS; lockall --stages 1-4,1-8,2-8 (96 builds): identical to 0057bd6f5's (1-8 unmoved vs base; 1-4 hints only;
  2-8 the 16 builds above).
  INHERITED, each red on the frozen base too: shard 2 artUse.test (cage-whole, cage-b unused art); shard 3 stageSheets.test (a sheet
  not in its preload list); shard 5 firstTimerBot.test 5-9's Easy goal (KID_RUNS_59, the release line's) and groundwork.test (a
  World 1-4 count outside Matt's band); shard 6 puzzleCamera.test (Worlds 1-2 puzzle rooms). The todos are the files' own TODOs.

## Done-items
1. (a) THE PIECE: pipeline.ts socket tips: a tip on a section he walks leftward (its exit left of its entry: a leg laid left) gets
   `{ x: min(section x0, socket - TIP_LEFT_KEEP 40), beforeX: socket }` (the water warning's way): said from the socket on, walking
   left. A right-running tip is `{ x: socket }` as before. TIP_LEFT_KEEP 40 = four frames at full run (285 px/s, 30 fps), so a socket at
   its section's left edge still gets frames to be met in. No stage id, seed or x in the code (generalitycheck PASS).
2. (b) THE CHECK: src/game/hintDue.ts holds the engine's hint-due rule (x, beforeX, belowY, aboveY, band); engine.ts:3313 and tipReach
   both call it, so tipReach sees what the game does. tipReach walks the route in 4 px steps as he walks it (each leg entry to exit, in
   its own direction). tipHintOf finds a tip's hint by its socket point (x, or a leftward tip's beforeX); tipBand.test and
   teachFirstScan match the same way (a leftward tip's x is no longer its socket).
3. THE TOYS (src/game/gen2/tipLeft.test.ts, 2-8 seeds 1-4 x both settings, properties only, no pinned x):
   - a left-leg socket tip is said within TIP_NEAR of its socket walking left (by hintDue, the engine's rule): GREEN;
   - a right-leg tip is unchanged ({ x: socket }, no beforeX, said at its socket): GREEN;
   - tipReach passes the left-leg tip and refuses the old hint shape: GREEN;
   - PLANTED: the pipeline's old shape restored (`reach = { x: k.x }`): tests 2 and 4 RED, "w28.fork: tipReach says 7029 px early";
     restored, 4 of 4 pass.
   Probe (libstage buildStage, Normal): seed 2's fork hint was { x 15345, band 1317-1810 }, tipReach early 7,029; now
   { x 14861, beforeX 15345 }, early 0. Seed 3 unchanged (early 0).
4. tsc 0. generalitycheck PASS (26 literals, 26 known).

## Pushback (accepted by the lead)
The packet's seed 3 is NOT the left-leg gap. On a0d85e961 seed 3 deals w2-28-fork-rest to n6, the OUTBOUND rest (s6, x 17430-18550,
y 815, the right leg): the fork line is said at its own socket walking right (tipReach early 0, correctly), but on the wrong leg, long
before the fork (s11 on the home leg). That is 2-8's DEAL (fork-rest's job 'rest' fits either R node): BUILD-28's data, its next box.
Making tipReach refuse seed 3 would be a false red, so it does not. Seed 2 is the real gap and the toys use it.
Base: t-eng-tipleft was cut at aad4d81d2 and fast-forwarded to a0d85e961 (t-build-28-wip's head: data and report only on top), so
BUILD-28's merge is clean (the lead: fine).

## Unresolved (named)
- tipReach still walks the route's LINE (each section's entry to exit, every 4 px step), not the surfaces between: a section whose
  pieces dip far from that line is judged by the line's height. Reading the real surfaces (st.platforms per leg) changes the build's
  own verdict (tipMisses is in the build's falls) on every tower stage, so it needs its own lock run: a ready packet, not done here.
  No case of it is known (the packet's seed 3 was the deal above).

## Lessons applied
D115 (gates on chattr-frozen worktrees, proven/ writable), D119 (commit message from a file, no heredoc in the commit chain), D128 (stamps
from date / the session hook), D134 (next step at the top, pushed and ls-remote-checked before any hand-over), D140 (ReadNotifications at
step boundaries: the lead's acceptance), D146 (every shard's totals for THIS hash in the landing).
