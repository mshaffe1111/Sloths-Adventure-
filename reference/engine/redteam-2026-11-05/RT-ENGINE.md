# RT-ENGINE: red team 2 (the engine), gen2 1-1 at engine-core 4ec76da73

Scripts: `redteam/scripts-engine/` (run from `ec/` with `npx tsx ../redteam/scripts-engine/<name>.ts`). Sweep data: `sweep1.jsonl`, `sweep2.jsonl`
(seeds 1-200 x Normal/Easy). Not re-reported: KNOWN-ISSUES 1-11 (the pool-short rolls, the seed promise failing, etc.).

## Cleared (looked for, not found)
- **Determinism:** 281 builds rebuilt in a second process hash the same (platforms, pickups, animals, vines, flags, exit). `sweep.ts`, the python diff in this report's history: `nondeterministic []`.
- **Seeds that throw:** none on seeds 1-200 on either setting (0 of 400).
- **Loosened slots hidden:** none. Every build with a loosened slot carries it in gen2.errors (`loosened hidden 0`).
- **The golden seed without a mushroom:** on all 35 builds where the seed's promise passes, taking every mushroom out loses the seed (`seednomush.ts`: 0 of 35).
- **Easy's hardest must-make jump vs Normal's:** no seed of 1-60 where Easy's is harder (`bottleneck.ts`). The metric is rough; see suspicions.
- **The swing timing global:** `lianaRelease` (pipeline.ts:152-160) sets the global TIMED and puts it back in `finally`. It does not leak into the live game.

## Findings, by severity

### 1. HIGH (gates): `stage.ts 1-1 --roll A|B|C` judges the MIXER's 1-1 in its stage lines, its tests and its stills, not the gen2 roll
- **What breaks:** the gates for Matt's three rolls. The parent process sets the pick (stage.ts:54, `asQaBuildForTest(true); setPick11(ROLL)`), but the pick is in-memory state. Three steps run in child processes or a browser that never get it, so each one builds `pick11() === 'mixer'`:
  - the "stage lines" (`spawnSync` of tools/engine/runs/dump.ts, stage.ts:109): views, float share, ideas, up/down, surface kinds, bough share, ideas twice in a row;
  - the stage's tests (stage.ts:436);
  - the stills (stills-at.mjs, stage.ts:457). It has no pick argument, and the page's pick starts at 'mixer' (testlink1_1.ts:13). The stills spots are gen2 x positions, shot on the mixer's stage.
- **Proof:** `rollDump.ts`, run exactly as stage.ts runs it:
  ```
  this process (pick A): 152 platforms, gen2=true, mixer explain=false, width 36500
  dump.ts child (as stage.ts:109 spawns it): 239 platforms, mixer explain=true, width 37786
  ```
- **Why:** the pick is module state (testlink1_1.ts:13), and nothing passes it across the process boundary.
- **Fix (root):**
  - Carry the build choice as data, not module state: an env var or CLI arg (`STAGE_PICK=A`), read by dump.ts, the test runner and the page (a URL param the QA page already honours).
  - Give every child a guard: it asserts the stage it measured carries `gen2.seed === roll11Seed(ROLL)` and FAILS otherwise. A measure of the wrong stage must never print a PASS.
- **Owner:** gates.

### 2. HIGH (gates, levelCheck): the 11-05 roofed-drop fix is beaten by a road that steps down 4 px or more
- **What breaks:** the same bug as tonight's Roll C. A piece wholly under a continuous road is linked as reached by a straight fall, and its petals pass.
- **Proof:** `roofstep.ts`. The road is two abutting pieces (x 420-1020 at y 600, then x 1020-1920 at y 600+step). A log at x 900-1100, y 700 lies wholly under the joint road, with a flower on it. The only other way in is a 500 px gap from the start bank.
  ```
  step 0  -> reachLog false, "flower #1 ... is out of reach"   (correct)
  step 2  -> reachLog false                                       (correct)
  step 4  -> reachLog true, ok true                               (WRONG)
  step 10 -> reachLog true, ok true                               (WRONG)
  step 20 -> reachLog true, ok true                               (WRONG)
  ```
- **Why:** `roofedDrop` (levelCheck.ts:478-494) has two holes:
  - its run grows only over pieces within 3 px of the take-off's height (`Math.abs(q.y - a.y) > 3`);
  - `closed()` counts an edge as closed only when a piece at that height or HIGHER stands against it (`q.y <= a.y + 3`).
  
  A road that goes on a few px lower makes the edge read as "open". In the game, walking off that edge lands him on the lower piece, which still covers the log.
- **Real builds:** `roofscan.ts` finds 154 such stepped roof shapes over a reachable piece, in 109 of 200 builds. The two I checked by eye (seed 3 Normal p133, seed 2 Easy p122) have a real way in from the side (seed 3: branch p135 at y 693), so I have **not** proved a shipped bad roll. The shape is common, though, and the gate cannot tell the difference.
- **Fix (root):**
  - Model leaving a run as the game does. Walking off an edge is a fall from that edge: the first surface whose x-span the falling body crosses is where he lands. The run is the surface he can walk without falling: abutting pieces that step down onto each other join it, and a step down is not an exit.
  - Add a regression test with steps of 0, 2, 4, 10, 20 and 40 px. It must say "out of reach" on every one.
  - Better still, replace the "out and back within half the reach" shortcut with the same arc test the jump links use.
- **Owner:** gates (levelCheck), plus a test.

### 3. HIGH (pipeline and game route): a failed gen2 roll is still built and played
- **What breaks:**
  - `buildGen2Stage` never throws on a failed roll. After 6 re-rolls it returns the FIRST failed stage (`return best!`, pipeline.ts:2491), with gen2.errors filled.
  - stageGenerator.ts:2858-2875 builds the stage, adds hearts and dress and returns it, and never reads `gen2.errors`.
- **Proof:** sweep seeds 1-200. 135 of 400 builds carry gen2.errors and 0 throw. For example, seed 3 Normal: 4 errors, `pool short at slot 4 (n4 teach: no section for the job left)`, code `A Tg1> Tg2> Tg2< …`, with the bounce teach replaced by a second ground teach. The level check still says ok, so no other gate in the game path stops it.
- **Today:** only the test link's seeds A/B/C reach this path. ENGINE-PLAN wants "a seed per play". The day that lands, about a third of plays (135/400 here) would be a stage the engine itself rejected, played without a word.
- **Why:** the "Law 22: fail the roll" ruling stops at the pipeline. Nothing downstream honours it.
- **Fix (root):** the game never plays an unproved roll.
  - Build-time: each stage ships with a list of seeds that passed every gate (stage.ts over N seeds). The game picks from that list by the play's own seed.
  - Run-time guard: if a built roll has gen2.errors, take the next proved seed. Nothing falls back silently.
  - A test asserts that every seed `generateStage` can reach for 1-1 has `gen2.errors.length === 0`.
- **Owner:** pipeline and the game route (stageGenerator), plus a test.

### 4. MEDIUM-HIGH (pipeline): on 8% of seeds Easy is not Normal's stage, and its own plan can lose the bounce teach
- **What breaks:** two promises.
  - ENGINE-PLAN: "Easy as the same stage played kinder", and Step 5's "Easy never falls back".
  - pipeline.ts:2404's own comment: "Easy is Normal's stage under Easy's rules".
- **Proof:** sweep. Easy's plan differs from Normal's on 16 of 200 seeds: 8, 18, 60, 91, 93, 106, 107, 110, 120, 124 and others. On 4 seeds Easy fails where Normal passes: 110, 124, 138, 143 (93 is the other way round). `easyplan.ts 124`:
  - Normal: `morning-path learn dip-double-teach hop-bounce …` with 0 errors.
  - Easy: `… bank-double-teach dip-double-teach hollow-twoway … root-stair-fork …` with 4 errors.
  - The Easy repairs: `w1-hop-bounce swapped out`, then `w1-mushroom-bank-teach swapped out: the block is walked round: bounce block at eB (x 9562) is reached by a double from the platform at x 9122, y 809 (0 px under, 78 px across)`, then `w1-mushroom-lift … walked round`.
  - So Easy's own kinder geometry (the 0.65 margin and the 48 px landing pads, types.ts:707-709) makes the bounce teach's block reachable by a double. Easy loses the lesson, then falls back to planning a different stage.
- **Why:** Easy is judged only after Normal has fixed the plan. A section that Easy's rules break is handled by re-planning Easy alone (pipeline.ts:2428), never by choosing a section both settings can lay.
- **Fix (root):**
  - Accept a Normal plan only if Easy lays it cleanly too. Fold the Easy assemble and check into Normal's loop: an Easy-only breach bans that section at that slot for BOTH settings.
  - Delete the "Easy plans its own" path.
  - Make Easy's pads respect the block rule: no pad may widen a take-off into a block's double reach. The block check runs on Easy's geometry inside Normal's choice.
- **Owner:** pipeline.

### 5. MEDIUM (pipeline and perf): the build is slow enough to stall a phone at stage start
- **Proof:** sweep on this desktop container: build time p50 162 ms, p95 552 ms, max 1114 ms (seeds 1-200 x 2).
  - An Easy build first builds Normal in full (pipeline.ts:2413).
  - Each length iteration on Normal also assembles an Easy stage (pipeline.ts:2475).
  - checkAndRepair calls validateStage up to 8 times, plus the crumble re-check each time (pipeline.ts:2276-2282).
- **Why:** all of it runs on the main thread, inside `generateStage`.
- **Risk:** a mid-range phone is roughly 3-5x slower. That is a 0.5-5 s freeze on load, once per-play seeds are live, breaking the "silky smooth" bar (PERFORMANCE-RULES §1).
- **Fix (root):**
  - Build from the proved-seed list (finding 3) and cache by (stage, seed, difficulty). Build off the main thread, or at idle on the world map.
  - Add a build-time budget to the perf gate: the p95 of the build on a throttled run.
- **Owner:** pipeline and gates.

### 6. MEDIUM (pipeline): the V-rules (codeErrors) never fail a roll in the pipeline
- **What breaks:** `realisedCode` (pipeline.ts:602-642) writes `gen2.codeErrors`, but `buildGen2Stage` (pipeline.ts:2392-2398) folds in only `loosened` and `missing`. The re-roll and swap loop never looks at the V1-V20 breaches. Only stage.ts (stage.ts:343) reads them.
- **Proof:** code read, plus the sweep. 135 builds have codeErrors, and today each of them also has a pool-short error ("errors==0 but codeErr>0: 0"). So the hole is masked today, not closed.
- **Why it matters:** combined with finding 3, a roll that breaks a V-rule without a loosened slot would reach the game as clean.
- **Fix:**
  - Fold codeErrors into gen2.errors.
  - Make the repair loop treat a V-breach at a slot as a swap at that slot.
  - Add a test with a planted V-breach that must fail.
- **Owner:** pipeline and tests.

### 7. LOW-MEDIUM (pipeline): a dead length ceiling trims every roll toward the floor, against "no cap, lengths that vary"
- **What breaks:** the time limits in planBudget (pipeline.ts:280).
  - `seconds.max = min(target*1.1, 295)` comes to about 153 s for 1-1.
  - All 400 builds are over it (typical 174-262 s) and ship with only a repairs note ("ships long … ceiling 153 s").
  - Meanwhile the trim loop (pipeline.ts:2477-2486) cuts sections off any roll that starts over the ceiling, until the floor would fail.
- **Proof:** the sweep's Normal fast times: p0 142.9 s, against the floor of 120/0.84 = 142.86 s. The shortest rolls sit exactly on the floor, as a trim-to-floor loop would leave them.
- **Why:** the ceiling was never re-set when Matt ruled "at least 2:00, no cap" (ENGINE-PLAN, Matt 1:05 AM).
- **Fix:** take the ceiling and the trim out for stages under Matt's no-cap rule, or set the ceiling from a measured band. Then length comes from the section count, as ENGINE-PLAN gap 4 says.
- **Owner:** pipeline.

### 8. LOW (pipeline, rule drift): crumbling tiles may never be required, but Matt allowed them anywhere once taught
- **What breaks:** `checkStage` (pipeline.ts:2276-2282) fails a roll whenever the stage with its crumbling tiles removed cannot reach the shrine.
  - CLAUDE.md and STAGE-RULES (Matt, 2026-11-02): "crumbling platforms may be required anywhere once taught, pits included".
  - The engine enforces the old, stricter rule, so a whole class of pieces is barred from carrying the route. That works against "variety comes from more pieces".
- **Fix:**
  - Read the move ladder: a crumble required after its teach is allowed.
  - Before its teach it is a breach.
  - On respawn every required tile is whole again; the engine already does this.
- **Owner:** pipeline (rule) and gates.

## Suspicions (not proved)
- **The pickup box test (levelCheck.ts:752).** A pickup counts as reachable when ANY reachable piece lies within 150 px across and 190 px under it, not when he can touch it. A pickup on an unreachable piece passes if a reachable floor or road sits close by. `orphans.ts` found 0 cases on seeds 1-60 x 2 and Matt's three rolls, because the reach graph usually covers the piece anyway. Replace it with "the pickup's piece is reached, or a jump arc from a reached piece passes through it".
- **The bottleneck comparison (`bottleneck.ts`).** It rates a bounce as 0.5 and vine and swing edges as 0, so a real Easy-vs-Normal difficulty gap could hide under it. Easy's widest linked gap is wider than Normal's on seed 8 (304 vs 267 px, `easyplan.ts 8`), but that is the widest link anywhere, not one he must make.
- **The seed's promise (storyChecks.ts:24-31)** measures the seed's height over the highest bank (solid, 90 px+) within ±200 px, not over the piece under it. Every seed sits 34 px over its perch bough. It holds today only because the bough itself needs the mushroom (`seednomush.ts`), and a perch version with a stump under the bough would pass unseen.
- **stage.ts's "tests" gate on --roll** runs stage11.test.ts, whose promises are written for the mixer's 1-1 (KNOWN 7: the mixer-port red tests). Even once finding 1 is fixed, those tests may not describe the gen2 roll.

## Total
8 findings (3 HIGH, 1 MEDIUM-HIGH, 2 MEDIUM, 1 LOW-MEDIUM, 1 LOW) and 4 suspicions. 6 checks cleared: determinism, seeds that throw, hidden loosened slots, the seed without a mushroom, Easy's hardest must-make jump, and the swing timing global.

## Round 2: cross-examination of RT-PLAYER and RT-PLAN, from the engine's chair

### (1) Their top 5: the root in the code, or a refutation

**PLAYER**
- **P-F1, raw Dot ids on screen: CONFIRMED, root found.**
  - pipeline.ts:1805 has `const text = M.tips?.[m] ?? m`.
  - The w1World manifest (w1.ts:1280-1284) has no `tips` key. W5 has one (w5.ts:161).
  - So the socket's allow id (`hint.1-1.double`, `coach.nice`) is pushed as the hint's text, pad and keys (pipeline.ts:1806).
  - Root fix: a tip id must resolve to a row in dotLinesData, or the BUILD fails. Never `?? m`. Kit data gets its `tips` map.
- **P-F2, nothing hurts for 3 minutes, then one lethal drop; 6 useless hearts: PARTLY REFUTED.**
  - Zero creatures is by rule, not a fault. NODES V16 says creatures come only from 1-3 in W1, and w1.ts:1275 says "1-1 lays no creatures". The player's fix (foes in 1-1) breaks the rulebook. Take it to the designer, don't build it.
  - The hearts are CONFIRMED. They are added outside gen2 at stageGenerator.ts:2867 (`i % 2 === 1 && heartBy`), after the pipeline and its curation, with no threat check (ENGINE-PLAN gap 7).
  - The lethal drop, likely root: gen2's soft-pit treatment and its `falls` list (types.ts:682-683) cover the route's gaps only. Walking off the far side of an off-route log is not a listed fall, so neither the soft-pit pass nor any gate sees it. Not proved by me in time.
- **P-F3, the double jump is never explained, and the praise comes before the lesson: CONFIRMED, root in kit data.**
  - w1-dip-double-teach and w1-bank-double-teach (w1.ts:939-953) carry 0 tip sockets.
  - In w1-double-teach (w1.ts:565) the groups are authored [rest + `coach.nice`], then the gaps, then [rest + `hint.1-1.double`]. Laid unmirrored, that is backwards. Only a mirrored roll reads right, so the data, not the mirroring, is wrong.
  - Engine gap: V2 checks that the T TOKEN exists, never that a teach tip comes before the first use.
- **P-F4, too long, and Easy longer than Normal: CONFIRMED, but the fix is wrong.**
  - This is my finding 7 seen from the player's side.
  - The player's fix ("treat ships long over 153 s as a FAIL") enforces a ceiling that Matt's rule ("at least 2:00, no cap") overrules.
  - The root is three length numbers read by three layers (PLAN F15):
    - pipeline `seconds.max` of 153 s;
    - the spec band in stage.ts:83;
    - Matt's floor.
  - Fix: one length source in the brief or game plan, read by the pipeline and every gate.
  - Easy is 4-10% wider in my sweep too (seed 8: 35707 vs 34143 px). It is likely the 48 px landing pads plus the 0.65 margin, but I have not proved the split.
- **P-F5, 12-13 flags: CONFIRMED, root found.**
  - pipeline.ts:1725-1752 places a flag at every rest, and also whenever 35 s have passed or the next section would leave more than 4200 px without one. That is a clock rule.
  - On a 34-41k px stage it gives about 10-13 flags, and Easy's longer stage gives more.
  - Nothing reads risk. The "flag gate" is still on ENGINE-PLAN's to-add list.

**PLAN**
- **L-F2, the pipeline never reads `feel`/`not`, so 1-2 would be dealt 1-1's sections: CONFIRMED.**
  - `feel` is declared at w1.ts:67-80 and read nowhere in src/game/gen2/*.ts outside tests (grep). The manifest takes every W1 section (w1.ts:1283).
  - Worse, combined with my finding 3: once 1-2 builds, a 1-1 teach section dealt into 1-2 would pass the level check, and a failed roll would still be played.
  - Fix: filter on `feel`/`not` in the bag, and add a gate that no dealt section is outside the stage's feel set.
- **L-F3, the gates fail open past 1-1: CONFIRMED in the library, REFUTED in stage.ts.**
  - passLines.ts:63-64 returns `[]` for a stage with no reference row, and passLines.test.ts:32 even asserts it.
  - But stage.ts:102 does gate a missing row as a FAIL (`gate('pass lines', ['no measured reference row…'], false)`).
  - So the risk is any OTHER caller of judgeLines. Make the library itself fail on a missing row, and delete the test that blesses `[]`.
- **L-F4, medians, and Matt shown hand-picked rolls: CONFIRMED** (passLines.ts:60 and :65). My sweep makes it concrete:
  - 135 of 400 builds fail outright (finding 3), and median-based lines never see them.
  - Matt's three seeds are three of the clean two thirds.
- **L-F1 and L-F5 are plan and process.** Nothing in the code to root or refute.

### (2) What the three reports reveal together
- **No gate catches the player's findings because the eye check looked at a different stage.**
  - My finding 1: under `--roll`, stage.ts's stills, tests and stage lines all build the MIXER's 1-1.
  - So the lead's stills for Rolls A, B and C could never show the raw Dot ids (P-F1), the missing double-jump lesson (P-F3), or the gen2 logs and flags (P-F5, P-F6).
  - That is the common cause behind most of the player's list.
- **Each player finding, and the gate that should have caught it:**

  | Player finding | Gate that should catch it | Why it didn't |
  |---|---|---|
  | P-F1 | a "hint resolves" gate | none exists, and the stills showed the mixer's stage |
  | P-F2 hearts | a heart gate (ENGINE-PLAN to-add) | hearts are added after gen2, so the pipeline's curation and code gates never see them |
  | P-F3 | a teach-tip gate | V2 counts tokens, not words |
  | P-F4 | the length gate | it reads a different number from the pipeline (three length sources) |
  | P-F5 | a flag gate | not built |

- **The pattern across all three: the engine judges what it planned, not what it shipped.**
  - The node code checks tokens.
  - curate.ts scores before the hearts and finds are added.
  - The game route adds hearts, dress and finishStage after every gen2 gate.
  - stage.ts measures a stage the game is not playing (under `--roll`).
  - The failed-roll path (finding 3) plays what the pipeline rejected.
  - The fix for all of them: one pass that gates the FINAL GeneratedStage the engine will play (after the hearts, dress and Easy pass), in-process, keyed by the exact seed. Every gate reads that one object.
- **PLAN F2 plus PLAN F4 plus my finding 3 add up to the 1-2 failure mode.**
  - 1-2 will be dealt 1-1's sections (feel is never read).
  - A third of its rolls may fail (the pool-short cells get worse with a narrower feel set).
  - Those rolls will be played anyway, while the medians look fine.

### (3) Re-ranked
1. My finding 1 (`--roll` measures the mixer) moves to the top. It is the reason the player's blockers survived the eye check.
2. P-F1 (raw Dot ids) is a release blocker with a one-line root. The engine should fail the build on an unresolved tip id.
3. My finding 3 (failed rolls are played) stays HIGH, and rises once 1-2 builds (PLAN F2).
4. My finding 2 (the roofed-drop hole) stays HIGH, unproved on a live roll.
5. My finding 7 (length) merges with P-F4 and PLAN F15 into one fix: one length source. I keep it MEDIUM and reject the "enforce 153 s" fix.
6. P-F5 (flags by the clock) is added as MEDIUM, at pipeline.ts:1725.
