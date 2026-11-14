# POLISH-9 / POLISH-9b REPORT (t-polish-9; lead session_01FhBbYNzGRJBDMzn6XbtQK2; R-165.228)
POLISH-9 (5:28-5:32 AM ET) stopped on the lead's pause; POLISH-9b (7:58 AM ET on) resumed at 182bb680. Opus 5.5 high.
Context at report: about 22% of 1M (my estimate; D64).

## VERDICT: **NOT GREEN: one red, a design call** (the yield deal, below). Everything else this packet asked is done. Every gate I ran passes except that one. buildcheck ALONE is UNRUN (box).

## EXACT NEXT STEP (the next 1-1 member or the lead, one step)
The lead or Designer rules on the yield deal (item 1 below). Then the ruled change, with ONE more relist only if it moves 1-1's plans. Then buildcheck ALONE and the full suite on that head.

## What is still red, exactly
1. **yield.test "the deal" (52 of 200 fresh 1-1 graphs).** This is a design call, not a pin. Since POLISH-7's CUT_11_DOUBLES, 1-1's pool has
   **no section for the `combine` job**. Its twists, tests and signatures remain. But the graphs sprint-B and sprint-C each deal a combine
   node (n8). So every B/C roll is refused ("pool short at slot 8 (n8 combine...)"), and the deal rule ("a node is never dealt a type no
   section of its job has") fails. The yield floor still passes: 12+ of 30 fresh seeds lay clean on A and D.
   Options for the lead or Designer, one of:
   - take sprint-B and sprint-C out of 1-1's graph list (1-1 rolls A and D only);
   - add a combine section with no double (a bounce + single-jump combine) to 1-1's pool.
   Never loosen the 2-in-200 line (law 22).

## Done (heads named)
- **Toy planted test for POLISH-9's bot fix** (ae03ef34): tools/inspect/firsttimer.test.ts.
  - Setup: real engine, a 255 px gap with a level put-back, FT_ADULT on 5 seeds.
  - With the fix: every jump is a run-up near the lip, 0 rescues.
  - Plant (drop `!graceHeld &&`): standing doubles from 850, where he was set down, rescued on every seed. Red, exactly 1-1's symptom.
  - firsttimer.test.ts (9/9) is now run by CI (gates.yml tool line) and is off ciTests.known.json (17 -> 16, knowncheck PASS). Before
    this, the planted test would have guarded nothing.
- **Bot-pin suites the fix could move:** 62/62 (gates/g-botpins.txt): firstTimerBot, w6Stages, goalsEasy, requiredMove, feelPairRoom,
  castBots.test, bands.test. Correction to POLISH-9's list: teachSpoken.test.ts lives at src/game/gen2/ and runs in the full suite.
- **castBots 1-1 layouts 1-10:**

  | Bot | Normal | Easy |
  |---|---|---|
  | kid | 9/10 (POLISH-9's run) | 10/10 |
  | adult | 10/10 (POLISH-9's run) | 10/10 |
  | middle | 10/10 | 10/10 |
  | expert | 10/10 | (Normal only) |
  | child | 8/10 | 10/10 |

  Logs: gates/castbots-1-1-kid-adult-easy.txt, castbots-1-1-tiers-both.txt. The lead accepted both remaining rescues as named, not 1-1
  defects (8:21 AM):
  - **Kid Normal L10, located.** The rescue is at the 254 px double test (gap 7732 -> 7986). He fails 3 running doubles, then the
    KID/ADULT bots' own 3-try loop rule (firsttimer.ts:946) puts him past. These are real misses: a tap first hop of 0.07-0.12 s and an
    early second press, landing about 40 px under the far top. The kid makes this double about 5 times in 9 on the toy. Allowed 8 tries
    (scratch override, no code change), he crosses alone with 0 rescues. The game's Normal ladder has Dot name the move at put-back 3
    and offer the step at 12 (helpLadder.ts).
  - **Child Normal seeds 5 and 9.** Each is a 20 s stall at a 50-53 px step (5: x 6363; 9: x 2266): the child's short pushes each fall
    under stopReact, so he never reads a wall. firsttimer.ts:1675-1677 already names this pattern and leaves 1-1's calibrated tier bots
    as they are. POLISH-5 had 9/10. tierBots.test is 7/7.
- **First-run lock re-recorded once** (firstRun11.ts; firstrun-lock-diff.txt).
  - The probe was tested first (D15): built at 91f8b157, it reproduces the recorded lock exactly.
  - What changed: POLISH-8's teach rise moved the stretch before the teach (Normal -8 px, Easy -2 px): 32 platforms' y, 45 earth
    heights, 2 flags, and the flowers on it, which re-pick their kind by height.
  - Identical: the plan, foes, hints, beats and soft zones. Nothing changed outside that one shift.
  - New lock: Normal 598f2cf9d031bb9f, Easy faba40c194f515f7.
- **Room for help is now the list judge's own rule** (the lead's ruling, 8:21 AM; 136386e0).
  - Cause: w1.relay.test (b) refused 4 Easy layouts that POLISH-7's relist (6dfffea3) had listed with new plans, because the list's judge
    never asked the rule. Bisect: becb79fe 0 of 257, 6dfffea3 4 of 169. Not the bounce cap: reverting it in a scratch worktree still
    gave 4.
  - Fix: the rule moved unchanged into src/game/gen2/helpRoom.ts (ONE definition, D19; the test re-exports it).
    tools/engine/listRules.ts helpRoomBreaches judges the stage as played (the world's finish, goals, Easy's transform) on no-lethal
    stages only, with no stage id (generality PASS). seedlist runs it in its relist filter and in --check.
  - Planted: seedlist.test, 33825 Easy as the list's search lays it (seed 34161101, 4 rerolls, x 26674); red with the judge off.
  - **ONE relist** (`--merge <list order> --in-order`): 167 -> 163. Dropped: 33825 (#58), 55341 (#91), 61613 (#100), 28931 (#118).
    Every kept plan is identical, the order is kept, and layouts 1-57 are untouched (castBots L1-10, calibration variants 1-40, first
    run = variant 10 = 9652). See gates/relist-1-1-diff.txt.
  - seedlist 1-1 --check PASS (163); 1-2 to 1-5 --check PASS.
- **Re-pins, each with its reason** (POLISH-7's 17 plus what its unrun half and the relist found). Intent kept; none loosened.
  - ctestStretches.ts: the stone stair test's words, "the stairs and banks" (single steps). The test's own instruction.
  - cameraBounce.test: flies the first run's seed-perch mushroom, found by its piece. 9800 now rerolls to a layout with no mushroom there.
  - proven.test: reads Roll A from testlink1_1.json (it was a copy, 4106).
  - softFalls11:
    - "as listed" reads the list's replay seed (769 has 2 rerolls).
    - The word-lays-no-ground check replays both sides. Raw roll 5 Normal is refused since 6dfffea3, and a refused search build is
      handed back from Y2's repair-off phase, while every replay runs the repair, so the test was reading the repair as the word.
  - w1.ts cut11: a section the double cut leaves on no stage is `parked` with its reason (w1.test's tags rule: w1-second-jump and 5
    more). `parked` is read only by the brief-pick path, which no World 1 brief uses; seedlist 1-1 to 1-5 --check PASS.
  - helpLadderPieces: the three double-teach shapes.
    - The list's 1st seed, Easy, w1-double-teach.
    - The first run, Normal, w1-dip-double-teach.
    - 5088 Normal, w1-bank-double-teach.
    - Why: the bounce teach is a plain bounce now and needs no help (it pinned nothing), and w1-two-answers is out of 1-1.
    - Swept: every double teach of the first 12 listed layouts, both settings, fails plainly as laid and passes once grown.
    - Not re-pinned on a piece: the stump take-in rule (no layout swept grows over a stump).
  - helpLadderSweep: the list's own floor, SEED_LIST_MIN, not 200.
  - seedListLoad: compares the list seed and the replay seed like for like (entry 28634 has its reroll 28955058).
  - w1Overhang: Matt's 9652 case is replayed on the pool it was laid from. It held w1-bank-stair-test, which is now cut from 1-1.
  - w1Pits per-gap ruler: takes the first seed of its graph string that lays a log chain with a fall. 58 held none after the pool
    change. Found, not copied.
- **Stills** (stills/, 2x, Roll A = seed 9652 with 0 rerolls, the built setting printed by the game for each file):
  rollA-{normal,easy}-1-1-L10-*-x{11560,12090}-{upright,sideways}.jpg (the bounce teach) and -x{22300,23300}-* (the stone stair).

## Gates on e0c78137 (src as of b7df7a52; later commits are reports and logs only)
- **PASS:**
  - tsc
  - BASE_PATH build; chunkcheck; artcheck (on 690d4ba5's src; later src changes are tests and tools only, plus listRules and the list file)
  - knowncheck (ciTests.known 17 -> 16); generality; roadmapcheck (after unshallowing the fresh clone); kbdcheck
  - drawcheck (607 s); clipcheck (83 known, 453 s)
  - seedlist --check: 1-1 (163, first-run lock holds, the new room-for-help rule) and 1-2 to 1-5 (before the relist, after the `parked` change)
  - tierBots.test 7/7; CI tool-test line 84/84 (firsttimer.test and the new plant included); bot-pin suites 62/62
- **Full unit suite:** the discovery run (gates/g-unit-discovery.txt, mixed heads) had 3,387 tests and 9 failures. Each is fixed above,
  or is the relist's (b), or is the deal. The final run on b7df7a52 is in gates/g-unit.txt: __UNIT__
- **RED:** yield.test "the deal" (a design call, item 1).

## Polish check (judged as Matt will see them on a phone, both orientations)
- **Bounce teach, Normal and Easy, upright and sideways:** the mushroom glows with an up-arrow cue right before a ~178 px earth bank,
  and the petals on top show where the bounce goes. The flag is just behind. The bank face and its earth read cleanly; nothing floats or
  is cut off. Pass.
- **Stone stair, both settings and orientations:** clear single-height steps climbing right, each step a jump. Pass.
- Named, not a defect: the section is called "the stone stair", but its steps are drawn as earth banks, not stones. That is the
  section's art kit.

## Pushback
The deal red (item 1) is the cost of CUT_11_DOUBLES, and it was invisible because POLISH-7's suite stopped before it. 1-1 now has
graphs it can never lay. I'd take B and C off 1-1 rather than write a combine just to fill the slot. A combine with no double is a weak
beat for a closing test.

## Method used
level.md (rules 5, 12, 14, 18), BOTS.md, bands.md; FT_TRACE / FT_FRAMES; git worktree bisects at becb79fe / 6dfffea3 / 91f8b157.

## Method update (level.md, proposed; the lead approves)
- **"A list rule a test enforces is the list judge's rule too: if a test refuses a listed layout, the rule moves into listRules.ts with a
  plant, then the list is rebuilt."**
  - Proof: 4 Easy layouts sat listed between POLISH-7 and now because only the test asked.
  - Edit: level.md rule 12, add "(the relay test's (b) is the judge's own since POLISH-9b)".
- **"Run the whole suite before re-pinning, never from a partial run's list."**
  - Proof: POLISH-7's 17 came from 2,622 of 3,387 results. The unrun half held 2 more pins (w1Overhang, w1Pits) and 1 real red (the deal).

## Learned
- A relist that re-searches seeds changes plans the tests pinned by seed, so a pin by seed wants the list's replay (provenPlan), never
  `gen2.seed === seed`.
- A search's refused build and a replay are not the same build (Y2's two phases), so compare replay to replay.

## Lessons applied
- D15: the lock probe reproduced the recorded hashes, and the judge reproduced the test, before either was trusted.
- D19: one definition of the rule, shared by the test and the judge.
- D29: every roll-pinning test re-run after the relist (the full suite on the head).
- D57: queue read at every push. The lead's 8:21 ruling waited 18 min between two of my pushes; it was read at the next.
- D59: the dev server stopped, nothing left running (see UNRUN).
- D61: stills judged.
- D62: the built setting is printed in every still.
- D63: n/a (no interaction changed).
- D64: context against 1M.

## UNRUN (D59)
__UNRUN__

## Turnover note
Not rewritten. This REPORT's EXACT NEXT STEP is the resume point.
