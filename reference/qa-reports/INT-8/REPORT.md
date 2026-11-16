# INT-8 REPORT (t-int-8 from origin/t-int-7@007f4421; lead session_01FhBbYNzGRJBDMzn6XbtQK2; R-165.228). 11:01 AM ET on, Opus 5.5 xhigh.
## STATUS: GREEN on 595ada5d (code head; every later commit is reference/ docs, stills and tools only). Link #2 can be built from it.
- **Every CLAUDE.md Check and CI step on 595ada5d: 0** (gates/RESULTS.txt).
- **buildcheck: GREEN by the lead's rule (12:17 PM)** ("within noise of both parents = R-165.207's known flake; slower on every run =
  red"). This container's 1-1 Normal p95 swings about 60 ms run to run (gates/buildcheck-compare.txt; load at each start):
  | Head | Normal p95 runs, ms (load at start) | Over 150 |
  |---|---|---|
  | link #1 007f4421 | 185 (1.18), 175 (1.84), 132 (2.38) | 2 of 3 |
  | POLISH-9 2840b63c | 140 (1.15), 122 (1.55) | 0 of 2 |
  | the merge 595ada5d | 146 (in the runner), 174 (1.98), 135 (1.13), 168 (1.71), 181 (1.58) | 3 of 5 |
  - The merge is not slower on every run. At matched load it equals POLISH-9 (135 at 1.13 vs 140 at 1.15).
  - Link #1, gated GREEN by INT-7 (113), fails here 2 of 3.
  - Link #1's one change in the 1-1 build path (finishStage pairPetals) returns at once on a stage with no vine field
    (vineField.ts:339), so no merge cost is found. Named plainly: on this container the budget has no margin; the flake is R-165.207's.
- **Known red carried from link #1, not a hold (the lead, 11:41 AM):** R-165.212 reopened: 1-4's fig gate can be got over from the
  far-end ledge (below).
- **R-165.240:** tools/inspect/clip.mjs + its planted test on t-int-8-clip (315548d1). Its full run is UNRUN (ruling A).
- **EXACT NEXT STEP (the lead):** judge the stills and clips listed under Done, step 4. Build link #2's test link from t-int-8 (src
  identical to 595ada5d). Start FIX-15 from t-int-8-clip with the TRY lines below. Give t-int-8-clip its own full gate run.

## Done (evidence)
- **Step 1, the merge (595ada5d):** origin/t-polish-9@2840b63c onto link #1. One merge base (471bd000, t-polish-5's head, which both sides
  hold). Textual overlap: 2 files, and no conflict in either.
  - src/game/gen2/provenIndex.ts auto-merged with each side's own line: 1-1 `n 162, 9b25668b` (POLISH-9's relist B) and 1-4
    `6b772e6e` (link #1's 1-4 list). Neither side touched the other's line, so nothing was taken wholesale.
  - reference/qa-reports/POLISH-5/item2/mainscan.mts.txt: the same rename on both sides.
  - Read for meaning (no text overlap):
    - Link #1 changed finishStage on every stage (stageGenerator.ts pairPetals: the vine field's paired petals). POLISH-9 locked
      1-1's first run. The lock is judged by seedlist 1-1 --check (first-run.drift).
    - POLISH-9 changed pipeline.ts (refuseGraphs, its own rng stream 68), reach.ts and verdicts.ts. 1-4's new list holds every
      listed seed to its own search, judged by seedlist 1-4 --check.
    - gates.yml: POLISH-9 added firsttimer.test.ts to the tool line, and INT-8's runner takes that line.
  - The first commit's trailer named the lead's session, not mine. I amended it on my own branch before anything was built on it
    (391fa501 -> 595ada5d, force-with-lease on t-int-8 only).
- **Step 2, seed lists, tierBots, first-run lock:** the runner's `seedlists` (every list registrycheck names, each `--check`; 1-1's
  `--check` also judges first-run.drift: the lock), `tierBots` and `tooltests` lines. Results below (gates).
- **Step 3, every CLAUDE.md Check + every CI step on 595ada5d** (gates/run.sh, INT-7's runner with gates.yml's tool line of today
  (firsttimer.test added); kbdcheck moved after drawcheck/clipcheck so it never runs beside the shards; buildcheck last and ALONE).
  Line by line in gates/RESULTS.txt; logs are gitignored, failures quoted here.
  - roadmapcheck's first run exited 2: "shallow clone, proofs cannot be checked". The container's clone was shallow, and that is not
    a defect of the branch. After `git fetch --unshallow` it PASSES (roadmap-unshallow line).
  - **Every runner line exits 0 (11:03 AM to 12:15 PM; gates/gate-summaries.txt):**
    - tsc, build (BASE_PATH), chunkcheck, artcheck, knowncheck and generality pass.
    - Unit shards: 1,311 / 1,161 / 928 tests, 0 fail, 2 todo (main's 4-3 boulder and its pair, as on INT-7).
    - Seed lists: 1-1 162, 1-2 100, 1-3 100, 1-4 100 and 1-5 150 PASS, so no relist was needed. 1-1's check includes the
      first-run lock, so the lock holds.
    - registry PASS; tool tests 85/85 (firsttimer.test included); tierBots 7/7 (no calibration moved, nothing recommitted).
    - drawcheck PASS (528 s); clipcheck PASS (83 known); kbdcheck PASS, run after the shards, and its planted case goes red.
    - buildcheck PASS: Normal p95 146 ms, Easy 99 ms (budget 150).
  - **buildcheck is in question.** Normal p95 146 is 4 ms under the budget, against 113 (INT-7) and 120 (POLISH-9). Re-run ALONE right
    after the runner (load 1.98 at its start), it FAILED: Normal p95 174 ms, max 182; Easy p95 80. The interleaved comparison on this
    container (link #1 / POLISH-9 / the merge) is in gates/buildcheck-compare.txt; the verdict is under STATUS.
- **Step 4, stills** from a FROZEN worktree of 595ada5d on :3218 (tools/shoot.sh). 2x, upright 412x915 and sideways 915x412,
  Normal and Easy. The game prints BUILT beside every file (D62): `stage 1-1, seed 9652, rerolls 0, built normal|easy`.
  - The places are read from the game's own build of the first run (layout 10 = list index 9 = seed 9652; play11Seed, firstRun11.ts):
    | Beat | Normal x | Easy x |
    |---|---|---|
    | Start | 600 | 600 |
    | Double teach: the dip's 130 px bank | 6900 | 7350 |
    | Double teach: the 254 px gap's lip (Easy fills it to a 53 px dip) | 7650 | 7700 |
    | Bounce teach (mushroom at 11614 / 12146) | 11450 | 11990 |
    | Stone stair | 22571 | 23744 |
    Files: stills/1-1/first-1-1-L10-<setting>-x<x>-<orientation>.jpg.
  - 1-4 layout 0 (seed 1): start x 140 (stills/1-4/start-1-4-L0-*.jpg). The fig gate: the four clips re-shot with the fixed tool
    (stills/1-4/gate-<setting>-<up|side>.mp4). The INT-7-tool versions are kept in stills/1-4/int7tool/ only as the record: their
    "Jump: still under" frame never jumped.
  - **CLIP, 1-1's first double, Normal sideways** (D63; stills/1-1/double-normal-side.mp4 + .txt; sheets/double-normal-side.jpg;
    the key stills are double-normal-side-{1..4}-*.jpg). Real touch presses throughout. He starts before w1-dip-double-teach with the
    earlier teach lines marked passed, and this section's own line is live on Normal's default Tips. He walks in, hops the 68 px step,
    and Dot says "Flick up again midair to jump twice."
    1. The dip's far bank (130 px): one jump rises 98 px and he drops back into the dip. The double climbs it (x 7044, y 1358).
    2. The 254 px gap (7732 -> 7986): one jump at the lip falls in. He is put back at the lip (x 7621) with no heart lost, and the
       iris wipe plays. The double (take-off 7715, second flick 7798) lands on the far bank at 7991.
    Every outcome is read from the game, and the captions follow those readings.
- **R-165.240 (the lead's add, 11:27 AM): the fig gate's try-over, re-shot with REAL jumps, and the clip tool fixed.**
  - The defect in the tool: INT-7's clip.mjs set `input.state.jumpPressed` bare. engine.ts:1674 runs `input.update()` first, and
    that drops a press with no buffer (inputEngine.ts update), so every "jump" frame in INT-7's clips did nothing. Its fig-gate
    "Jump: still under" proved nothing. My own first clip11 run did the same thing until I traced it.
  - The fix: every frame goes through the touch pad's own calls (triggerTouchMove / triggerTouchClimb / triggerTouchUp /
    releaseTouchUp). Every press is checked on the next frame: lift (vy < 0, rose, a jump spent, or off the vine) or a vine grab that
    took it. Otherwise the clip prints JUMP-NO-LIFT and exits 3. It caught two of my own script's mistimed presses while I built the
    clip.
  - Planted red: stills/1-4/PLANTED-bare-jump-gateover.txt. PLANT_BARE_JUMP=1 (the old bare press): vy 0, nothing spent, exit 3.
  - **ONE tool (the lead, 11:30 AM): tools/inspect/clip.mjs + clipPress.mjs + clip.test.ts on branch t-int-8-clip (315548d1),
    ruling A (11:45 AM).**
    - clipPress.mjs `pressFrame` is the one frame step. clip.mjs runs its own source in the page, and clip.test.ts runs it headless
      with the REAL InputEngine (D19).
    - clip.test.ts plants the bare press, which must be lost, and proves the touch press lifts, double included: 2/2 pass.
    - On gates.yml's tool line: ciTests 3/3, tsc 0, knowncheck, generality and roadmapcheck PASS.
    - Its full gate run is UNRUN (a CI config change runs everything). FIX-15 branches from it.
    - **Old copies the next shooter must NOT use:** reference/qa-reports/INT-7/tools/clip.mjs, INT-8/tools/clip.mjs, FIX-14b's
      clip.mjs, and any reference/qa-reports/*/tools/clip.mjs. The first presses bare; the second is superseded by tools/inspect/.

## Known red carried from link #1 (the lead's ruling, 11:41 AM: NOT a link #2 hold; R-165.212 reopened)
- **1-4's fig gate can be got OVER while a tie still holds**, shown with real touch presses (stills/1-4/gateover-normal-side.mp4 +
  .txt TRY lines; sheets/gateover-normal-side-ledge.jpg; stills/1-4/gateover-normal-side-OVER-*.jpg, -THROUGH-*.jpg). Normal, 1-4
  seed 1, gate 6: 3 figs, bough x 414-934 at y 1923, the far end sagging to a drawn top of about 1977.
  - **Held (head at or under the underside, 0 at worst):**
    - climbing up under the bough;
    - a leap off the vine top (vy -600);
    - a leap and a second flick (he re-catches a vine before the top);
    - an up-left flick from the far-end ledge at x 924 or 986 (he catches fig vine 874 under the bough).
  - **OVER:** the far-end ledge (x 876-1056, y 2022) sits only about 45 px under the sagged end's drawn top.
    - From x 1030, a straight-up flick with left held puts his feet at 1924, above the shut bough. His head reaches 150 px past the
      underside.
    - With a second flick in the air he reaches 1841, passes over the thatch, drops THROUGH it (a shut bough is no footing) and lands
      on the floor at 2363.
  - **Why (read in the code):** fieldPlay.ts `lid()` stops a rise only when it starts under the bough's drawn top and inside its span
    (plus `GATE.lidSide` 22). From that ledge he rises outside x 956 and enters the span already above the top, so "feet already over
    the bough's drawn top are left alone".
  - **The same ledge, under the end (x 869-956):** standing there, his head is drawn about 72 px into the thatch. A press there is
    taken by the fig-vine grab, and the lid puts him at about 2127, 105 px below the ledge he stood on.
  - Not in this merge: POLISH-9 changes no 1-4 or field file. A fix member starts from the TRY lines (the lead).

## Polish check (every still and clip judged at full size or on its contact sheet; sheets/)
- 1-1 first run, Normal and Easy, upright and sideways: start, the dip's bank, the gap's lip and its flag, the bounce mushroom before
  the tall bank, and the stone stair all read. Easy's gap is filled to a shallow dip and reads as ground.
- **For the lead's pass/fail (D61), not from this merge:**
  - The bounce cue is a code-drawn white ▲ over the mushroom (bounceArt.ts header: "the cue is unchanged: the up-arrow above them").
    It is in every 1-1 bounce still, POLISH-9's passed stills included.
  - The unlit flag's gold rim reads as a cream oval around the post (the lead's 2:56 AM ruling kept it). At the screen's edge it
    shows as a lone arc: 1-1 Easy x7350 sideways, left edge.
- The double clip reads start to finish:
  - Dot's line is on screen as he walks in.
  - Both one-jump tries visibly fail; the put-back is a clean iris wipe with no heart lost.
  - Both doubles land.
- 1-4 fig gate, all four: push, strain, SNAP, the head stop, the real leap dropping back under, the last fig throwing the thatch off,
  and the way up opening.
- Tool limits, not the game:
  - Pokey's line "Meeca climbs this every Sunday..." stays up through the gate clips, because the tool never taps it.
  - The caption bar covers the lowest ~45 px sideways.

## Pushback
- The packet's "two branches split 44 / 37 commits apart" didn't match this clone: 1681 / 37 against the one merge base 471bd000,
  because link #1 holds main's history. Only 2 files overlapped textually, so there was no conflict to resolve. I read the meaning
  across the files instead (Done, step 1).
- "Stills of the first double" on 1-1's first run: the section's first double is the dip's 130 px bank (x 6943), before the 254 px
  gap. The clip shows both.

## Suggestions
- **R-165.212's fix packet (the lead's):**
  - The lid judges the whole rise against the bough's drawn shape, not just a rise that starts under it: any frame in which his feet
    cross the drawn top inside span ± lidSide from below, or from the side while below the top, is stopped. Or move the far-end ledge
    so it sits at least a full double's height under the sagged end.
  - Plant it red on gateover's TRY ledge x 1030, with tools/inspect/clip.mjs `gateover` as the clip.
  - Sweep every gate on every 1-4 layout, not just seed 1 (D21).
- **A headless try-over gate:** clipPress.pressFrame on RealPlay-like engines with the real InputEngine, every gate, every ledge
  within 250 px. That turns R-165.212 into a unit test instead of a clip.
- **An integration role card** (INT-7's suggestion, still open): reference/roles/INTEGRATOR.md + handoffs/integrator.md. It would
  cover the runner, the frozen worktree, BUILT checks, tools/inspect/clip.mjs only, and "unshallow before roadmapcheck".

## Unresolved
- t-int-8-clip's full gate run is UNRUN (a CI config change runs everything; ruling A).
- R-165.212 is reopened and carried as a known red, not mine to fix.
- The Easy double clip was not shot (the packet asked Normal sideways).

## Method update (proposed: gates.md / release.md)
- **Clips use tools/inspect/clip.mjs only.** Never a copy under reference/qa-reports. Every press goes through the touch pad's calls
  and is lift-checked (clip.test.ts plants the bare press).
- **Before the runner, `git rev-parse --is-shallow-repository` must be false** (else `git fetch --unshallow`): roadmapcheck refuses a
  shallow clone.
- **kbdcheck runs after drawcheck/clipcheck, never beside the unit shards** (INT-7's load-21 red). INT-8's runner order does this.
- **A clip's cheat tries are taken from the geometry** (the ledges and vines within reach of a gate), each logged as a TRY line with
  OVER/HEAD read from the game. Never only from where the earlier clip stood.

**Lessons applied:**
- D29: every roll-pinning test in the full suite on the head.
- D36: a frozen worktree for the shoots.
- D50: teach lines live on the default Tips.
- D53: fast gates on the report tree.
- D57: the queue read at every push.
- D59: nothing left running; UNRUN named.
- D61: rough spots named for the lead's pass/fail.
- D62: BUILT on every file.
- D63: clips of the whole action with cheat tries; that is what found R-165.212.
- D64: context against 1M.
- D67: no until/sleep loops; waited on completion notices.
- D19: one press function for the clip and its test.

**Method used:** gates.md, INT-7's runner and shoot layout.

**Turnover note:** none exists for integration (Suggestion 3).
