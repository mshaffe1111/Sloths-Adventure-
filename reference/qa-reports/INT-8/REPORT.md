# INT-8 REPORT (t-int-8 from origin/t-int-7@007f4421; lead session_01FhBbYNzGRJBDMzn6XbtQK2; R-165.228). 11:01 AM ET on, Opus 5.5 xhigh.
## STATUS: (filled at the end)

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
