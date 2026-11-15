# METER-1 REPORT: the difficulty meter measures what a stage really asks (R-165.261)
Branch t-meter-1 from origin/t-tools-2@19b45a06. Tools and docs only: tools/difficulty/ (score.ts, score.test.ts, band.ts, botcross.ts),
reference/design/DIFFICULTY.md §1 (six new rows), reference/handoffs/engine-core.md §0zd, this folder. No game code, no seed list, no
asset. Started 8:28 PM ET 11-14; times below from `TZ=America/New_York date`. Scored on: BUILD-16's 1-6 = origin/t-build-16@ba374aee
(which contains t-tools-2); BUILD-18's 1-8 = origin/t-build-18@3cc12409 (which contains ENG-CL) merged LOCALLY with origin/t-tools-2
(the meter needs settingDials.ts; never pushed); 1-1..1-5 and 1-7 are the same stages on both trees. The meter file is this branch's.

## The table (Normal and Easy medians of 4 layouts, range in brackets; target = DIFFICULTY.md §4 World 1)
| Stage | Target N | Normal before | **Normal after** | Easy before | **Easy after** | E / N after |
|---|---|---|---|---|---|---|
| 1-1 | 2.5 | 4 (3.5-4.3) | **4 (3.5-4.3)** | 2.6 (1.5-2.9) | **2.6 (1.5-2.9)** | 0.65 |
| 1-2 | 2.5 | 0.9 (0.9-1.3) | **0.9 (0.9-1.3)** | 0.3 (0.2-0.3) | **0.3 (0.2-0.3)** | 0.33 |
| 1-3 | 1.5 | 1.1 (0.8-1.4) | **1.1 (0.8-1.4)** | 0.6 (0.5-0.7) | **0.5 (0.4-0.6)** | 0.45 |
| 1-4 | 4.5 | 2.9 (2.9-2.9) | **4.3 (4.3-4.3)** | 2.5 (2.5-2.5) | **3.2 (3.1-3.2)** | 0.74 |
| 1-5 | 5.5 | 4 (3.3-4.5) | **4 (3.3-4.5)** | 1 (0.9-1.1) | **1 (0.9-1.1)** | 0.25 |
| 1-6 (BUILD-16) | 6.5 | 3.3 (3-3.4) | **5.4 (4.7-6)** | 1.8 (1.8-1.8) | **3.6 (3.5-3.6)** | 0.67 |
| 1-7 | 5.5 | 2.3 (2-2.6) | **2.2 (1.9-2.7)** | 1.5 (1.4-1.6) | **1.2 (1.1-1.2)** | 0.55 |
| 1-8 (BUILD-18) | 7.5 | 17.4 (17.3-17.8) | **6.8 (6.3-7.2)** | 14.7 (14.4-15) | **3.3 (3.2-3.3)** | 0.49 |
| old hand-built 1-6 (t-build-18; BUILD-16 replaces it) | - | 6.4 (5.8-9.7) | 6.9 (6.5-9.7) | 5.5 (4.7-6.5) | 5.7 (4.7-6.5) | 0.83 |
| old hand-built 1-8 (t-build-16; BUILD-18 replaces it) | - | 28.2 (27.5-29.7) | 12.2 (11.7-12.2) | 25.5 (25.3-25.5) | 8 (7.9-8.1) | 0.66 |
SCALE 0.28194 before and after (1 meter point = 3.5 raw points a minute): 1-1 has none of the new asks, so DIFFICULTY.md's own method
(1-1 anchors SCALE) moves nothing; the testers' tier calibration exists for 1-1 only (BOTS.md), so there is no other anchor to take.
Files: meter-before-b16.txt / meter-before-b18.txt, meter-after-b16.txt / meter-after-b18.txt, meter-before.json / meter-after.json.
Listed stages (gen2/listed.ts LISTED): 1-1..1-7 on t-build-16, 1-1..1-5, 1-7, 1-8 on t-build-18: all are in the table.

**w1Arc16.test.ts's band check on t-build-16 with this meter (`npx tsx tools/difficulty/band.ts 1-6`, the test's own computation):
Normal 5.452 (layouts 5.96, 5.63, 5.27, 4.68), Easy 3.584. The test stays RED: Normal must be >= 5.5 and reads 0.05 under; Easy
passes (<= 4.5 and <= 0.7 x Normal).** By the corrected ruler that is a design finding (below), not tuned here.

## Where the 3.3 and the 17.4 came from, and where they went (points a layout, mean of 4, Normal; `bykind`)
- **1-6 before 11.7 raw**: swing 18 x 29.7 points, single 49.75 x 6.5. Nothing else was seen. **After 19.2 raw**: swing 20 x 38.7,
  catch 14 x 6.2, vine snake 7 x 3.7 (false lianas 2 x 0: a choice is under the free bit), single 6.5.
- **1-8 before 65.4 raw**: "hazard" 51 x 109.1 points (the chase's pacing beats, one every 1.5 s, each a 2-bit heart hazard
  overlapping its neighbours, plus the fruit), nuts 0. **After 26.8 raw**: nuts 11 x 16.4, chase 5 x 16.0, swings 2 x 8.2, single 6.6,
  fruit 7 x 2.6, the still fork's watch 1 x 2.5, catches 2 x 1.7.
- **1-4 before 11.2 raw** (hazard 7.5 x 5.8), **after 16.2** (hazard 11 x 16.8): the pods, now with the time he climbs in their way.
- **1-7 before 9.4** (creature 9 x 8.3: every eagle at the default 0.5 s tell), **after 8.6** (watch 10 x 5.6, swings 4 x 3.4,
  catches 2.75 x 1.4, single 5.9).

## 1. Done-items, with evidence
1. **(1) The under-counts, found with numbers** (1-6 seed 1 Normal unless named; `tools/difficulty/score.ts --detail` and the
   challenge dumps):
   - **Every liana release was priced at a guessed 0.4 s in 1.6 s** (2.32 bits, OTHER_BITS.swing: a number from before the 2.85 s
     swing). The engine's own window for the same perches (gen2 pipeline.ts lianaRelease: physics pressWindow from the grip dial's holds
     and, on a liana with a dial or the last of a chain, only the presses that see the perch, SWING_SEEN, R-165.225) is 0.6-2.9 s on
     BUILD-16's 1-6: 1.0-2.7 bits; a release onto a creaky limb 3.6. Measured against lianaRelease liana by liana on seeds 1-2 (the
     first version, heldLandings without the view rule, read up to 3x wider on "hold high" lianas: 2867 ms against 933). The view rule
     is gen2's, so it applies only to stages gen2 laid; a stage of the older generator (Worlds 2-4's liana rows, 4-4's 51 lianas) is read
     by its own level check's lines (chainLines, heldLandings), which have none.
   - **The vine snakes were not seen at all**: 8 a layout on 22 lianas (down-off 3, down-back 1, up 3, still 2), 0 counted (they are
     `Vine.snake` with a clock, not cast members or beats).
   - **Route links leap a chain's middle liana** (route.ts's added links: liana 6 -> 8 over 7, 12 -> 13 over the perch 111): one release
     scored where he makes two.
   - **The catch off a bank was never a challenge** (TOOLS-1 removed it as a second release, rightly; it is its own ask: a running jump
     at a moving liana): 1.9-2.1 s of 2.85 on 1-6, 1.2-1.3 bits.
   - **Creaky limbs under a release were missed**: the crumble rule read the liana's x, 370-500 px from the perch it lands on.
   - **1-7**: each eagle beat missed its member (a 200 px lookup; the beat sits 202 px from where the eagle perches) and took the default
     0.5 s tell; its watched ground and cover were not read. The real asks: reach cover 130-270 px away (worst spot) and be still 0.5 s
     inside a 2 s warn: 0.9-1.9 bits a pass.
   - **1-8**: beats.ts gives a chase stretch a pacing beat every 1.5 s (ENG-CL's span) and the meter scored each as a 2-bit heart hazard
     (~16 a stretch, each overlapping the next): 109 of BUILD-18's points a layout came from them; nuts ('h' beats) scored nothing.
   - **1-4** (found by the bot cross-check, step 5): a falling pod was scored as if he crossed its column instantly; the route climbs
     0.5-2.8 s through it against a 1.9-3.1 s quiet.
2. **(2) The missing terms, each with its source in DIFFICULTY.md §1's style (six new rows) and a planted test that it counts what its
   name says** (`tools/difficulty/score.test.ts`, 14 tests; 4 were TOOLS-1's):
   - liana release = windowBits(the liana's own period, gen2's own window) (`releaseWindow`, `releaseBits`; the double's flights + 1.32;
     a creaky perch + 1); `chainOf` flies a leapt chain liana by liana; test 5 holds the window EQUAL to pipeline lianaRelease with and
     without a grip dial, and the view rule never wider; test 6 the chain walk;
   - catch off a bank (`catchWindow`, test 7); vine snake by its warn, a threat at its release, costing what the swing's ground costs;
     false liana a choice (`snakeChallenges`, test 8);
   - chase: fittsBits(front speed / his run) ONCE a stretch (Normal 230 of 285: 2.37 bits; the last stretch's burst 290: the cap; Easy
     170: 1.31), caught = a heart; the front is a threat over its whole stretch (`span`: every move inside x1.5) (`chaseChallenges`,
     test 9; a hand-built chase split at its finalFrom); the chase's pacing beats never scored as hazards (test 13, on the real 1-8);
   - rolling nut = a hop timed to its roll (log2(1 + 1 s / window), window = JUMP_AIRTIME less (2 x ROLL.lowR + 44) over his run plus
     its roll); fruit = its tell; a teach (every Easy one) a bump, no heart; each height its own move (`rollingChallenges`, test 10);
   - being watched: each pass fittsBits((run from the stretch's worst spot to the nearest cover, a mossy liana's sweep, or off the
     stretch past its sight) + calm-in) / its warn); passes 1 + 1 per (cool + warn) at a run; the kit's free first pass costs nothing;
     its eye a span threat (`watchChallenges`, test 11); the member lookup reads the kit's ground (`memberAt`, test 12);
   - a pod's window = its quiet less the route's time in its column, a crossing as long as the quiet taken in the cheapest number of
     crossings (`podCrossing`, test 14, on the real 1-4 too).
   - **Unmeasured asks are named and never priced as the hardest**: a catch no running jump makes is `NOT MEASURED`, 0 bits (12 on the
     old hand-built 1-6, 0 on BUILD-16's); a release no press flies keeps the earlier constant, named `NOT FLOWN` (0 on either 1-6).
   - **Planted faults, 18 of 18 RED** (planted-faults.txt; each old behaviour put back in score.ts, the tests run, the file restored
     from a saved copy): the old release constant, no crumble at the perch, the chain not walked, no catch, the snake's default tell, no
     span overlap, chase beats as hazards, the burst ignored, an untimed nut, the exact old 200 px lookup, mossy lianas not cover, the
     calm-in left out, the view rule left out, a pod crossed in no time, the stretch's ends not a way out, an unmeasured catch priced as
     one frame, a chain walked through a liana no catch reaches, the view rule on an older generator's stage. (One approximate plant, "200 px but keep the 600 px fallback", stayed green because the fallback still finds the eagle;
     the exact old lookup is red. Two planted cases first stayed green, one because both readings met the 5-bit cap, one because it
     asked ">=" where the two readings were 0.8 s and 0; both fixed to fail.)
3. **(3) Recalibrated only by DIFFICULTY.md's method**: SCALE from 1-1 Normal, 4 layouts = 0.28194, unchanged (1-1's challenge list
   is the same before and after: the same 24.5 points). No other constant moved (FREE 1, MIX 0.5/0.5, OVERLAP 0.5, NOVELTY). The tier
   calibration (BOTS.md) has tester data for 1-1 only.
4. **(4) Re-scored 1-1..1-8 and every listed stage, before / after**: the table above. Also World 2-10 one layout Normal, before/after
   (sweep-before.txt, sweep-after.txt): see "Spread" in §5.
5. **(5) Cross-check against the bots** (`tools/difficulty/botcross.ts`: kid, adult, child, middle, expert x 4 layouts x both settings,
   1-1..1-7 on t-build-16, 1-8 on the newest t-build-18; bots.jsonl, bots-summary.txt; rank.py, rank.txt, pairs.txt). Misses a minute =
   (hits + lives + put-backs + 8 x rescues) / minutes (a rescue is the help's put-past after 8 tries at one spot). Normal only (the
   method: the bots' Easy personas are other testers):
   | Stage | meter before | after | tier bots (child, middle, expert) | first-timers (kid, adult) | runs passed |
   |---|---|---|---|---|---|
   | 1-1 | 4 | 4 | 0.46 | 0.36 | 19/20 |
   | 1-2 | 0.9 | 0.9 | 0.14 | 0.00 | 20/20 |
   | 1-3 | 1.1 | 1.1 | 0.08 | 0.13 | 20/20 |
   | 1-4 | 2.9 | 4.3 | 1.97 | 0.60 | 14/20 |
   | 1-5 | 4 | 4 | 1.84 | 1.27 | 20/20 |
   | 1-6 | 3.3 | 5.4 | 0.05 | 1.89 | 6/20 |
   | 1-7 | 2.3 | 2.2 | 0.15 | 1.75 | 19/20 |
   | 1-8 | 17.4 | 6.8 | 1.59 | 2.41 | 20/20 |
   - **Spearman, 1-1..1-8: first-timers 0.67 -> 0.81 (over the published 0.7 bar, DIFFICULTY.md G4); tier bots 0.48 -> 0.34.**
   - **"A stage the bots find harder must not read easier"** (pairs 0.3+ misses a minute apart that the meter reads 0.3+ the other way):
     first-timers 5 -> 3 (1-6 over 1-1 and 1-5 fixed; left: 1-7 over 1-1, 1-4, 1-5); tier bots 3 -> 4 (left: 1-4 over 1-8; new: 1-1,
     1-4, 1-5 over 1-6). The tier bots barely miss on lianas (1-6: 0.05 misses a minute; kid and adult 1.89, with 4 rescues each in 4
     runs on Normal and 0 on Easy); their 1-6 failures are 9 sealed doors of 12 runs (petals missed), not misses. Their liana play is
     not calibrated (the testers never played a liana). Named in Unresolved and as a packet.
6. **Gates (on t-meter-1)**: `npx tsc --noEmit -p .` exit 0; **but tsconfig.json excludes tools/**, so it never reads score.ts: I
   type-checked tools/difficulty/*.ts with a temporary tsconfig that includes them (removed after): 0 errors other than TS2591 (no
   @types/node installed), which every tools file has. `npx tsx tools/difficulty/score.ts --check`: 14 planted cases pass.
   `npx tsx --test tools/difficulty/score.test.ts`: 14/14. The CI tool-test line (gates.yml:94, CI=1 FORCE_COLOR=1): 119/119, on the final head 2e02c4c7.
   `node tools/roadmapcheck.mjs`: PASS (after `git fetch --unshallow`: the session clone was shallow and the check refused it).
   `node tools/perf/knowncheck.mjs`: PASS. `npx tsx tools/engine/generalitycheck.ts`: PASS. **The whole suite (CLAUDE.md's line):
   see SUITE below.** Not run (no game code changed, LAWS 5 scoped): the build, chunkcheck, artcheck, drawcheck, clipcheck, kbdcheck,
   buildcheck, seedlist --check, tierBots (nothing in tools/inspect imports score.ts; the bots read no meter number).

**SUITE (CLAUDE.md's whole line, on t-meter-1; this branch changes nothing under src/, so the code it tests is the final head's): 3535
tests, 3533 pass, 0 fail, 2 todo (the existing TODO tests, e.g. 4-3's boulder fixer; TOOLS-2 recorded the same 3535 / 0 fail).** Finished
10:02 PM ET. Nothing left running: every bot, meter, plant and suite job ended (pgrep). The scratch worktrees of t-build-16 and of
t-build-18 + t-tools-2 live in the session scratchpad only; their local merge commits were never pushed.

## 2. Polish check
The meter changes no screen and draws nothing (it never runs on a phone, PERFORMANCE-RULES §1), so there are no stills. What I judged
instead, "the way Matt will": every heavy challenge in `--detail` on 1-4, 1-6, 1-7 and 1-8 is something a player really does there.
That pass caught four of my own first-version artifacts before they shipped: releases priced at the floor where the route's link
skipped the perch (fixed by flying the perches on the way), the old 1-6's catches priced as one-frame windows (named NOT MEASURED,
0 bits), 1-7's 2400 px stretch reading "cover 981 px away" (its mossy lianas are cover), 1-8's still fork reading 475 px from cover at
its far end (off the stretch is out of the eye).

## 3. Pushback
- **The band test and DIFFICULTY.md disagree.** w1Arc16.test.ts holds 1-6 Normal to 6.5 +-1 (5.5-7.5) and Easy to <= 0.7 x Normal;
  DIFFICULTY.md §6 G2 says "Normal median within its slot +-1.5 (World 1)" and "Easy at most 0.6 x Normal". By G2, 1-6's 5.45 passes
  and its Easy (0.66 x Normal) fails; by the test, Normal fails by 0.05 and Easy passes. Not mine to choose (LAWS 22): the lead or the
  Designer rules which is the rule, and the other is brought to it.
- **The packet's "1-7 reads 2.7 vs 5.5"** is 2.3 on t-build-16 / t-tools-2's 1-7 (before), 2.2 after. Its asks are hiding in time and
  keeping still; the bits model prices the first at 0.9-1.9 a pass and has no term for the second (restraint, DIFFICULTY.md §6 "next
  version", measured by the bots). I did not invent one: an untested weight would be a tune.
- **"merge t-eng-cl before you re-score"** (the lead, 8:44 PM): t-build-18@3cc12409 already contains ENG-CL, so 1-8 was scored on it.
  The meter now SKIPS ENG-CL's chase and fruit beats and scores both from the stage's own lay (st.chase, st.rolling), so merging
  t-eng-cl into t-meter-1 changes no number and would make this a game-code branch. Not merged; the lead's call if wanted.

## 4. Suggestions (ready packets)
- **RESTRAINT (Designer + Critic, the bots): the "keep still" and "don't press" asks** (1-7's hides, 1-2's chain, 1-8's fruit).
  Evidence: the kid takes 31 hits in 4 Normal runs of 1-7 (2.57 misses a minute, the highest of World 1 for the kid; 0 on Easy), the
  meter can price none of it. Objective: a restraint term measured by the bots (DIFFICULTY.md §6's own plan), one rule for every stage.
  Files: tools/difficulty/score.ts, tools/inspect/firsttimer.ts. Done: a planted case, and 1-7 no longer reads easier than 1-1 by the
  first-timers.
- **TIER BOTS ON LIANAS (Critic): calibrate the tier bots' release.** Evidence above (1-6: tier 0.05 vs first-timers 1.89 misses a
  minute). Objective: the tier bots' release timing noise from a tester window on a liana stage. Done: tierBots' liana rows, BOTS.md.
- **BAND RULE (lead / Designer): one band for World 1** (Pushback 1). Files: reference/design/DIFFICULTY.md §6, w1Arc16.test.ts. Done:
  the test cites the line it enforces and both say the same.
- **INSPECT (route.ts): the added chain links leap a liana** (6 -> 8 over 7; a liana to a bank past its perch). The meter corrects it
  (chainOf, the perches on the way); the route's own beats and every other reader do not. Done: route.ts links liana to liana in order;
  routeHumps-style planted test.
- **INSPECT (beats.ts): give the chase and fruit beats a kind** (the meter skips them by their words today; a reword would silently
  bring the 2-bit-a-beat chase back; test 13 would go red on 1-8, but only there).
- **METER: catches the running jump cannot make** (the old 1-6's 12): add the standing jump and the walk-in catch to catchWindow.

## 5. Design findings (the lead's ruling 9:27 PM: report them, with the gap and the lightest beat; nothing tuned here)
- **1-6 (BUILD-16 on t-build-16@ba374aee): Normal 5.452 against w1Arc16.test's 5.5 floor, a gap of 0.048 meter points** (0.17 raw
  points a minute: about 1.8 more points a layout outside its busiest 30 s, or 0.2 inside it). Layouts 5.96 / 5.63 / 5.27 / 4.68: the
  median sits between the middle two. Beat by beat (beats-1-6.txt, `tools/difficulty/beatpts.ts`, Normal, mean of 4): gorge 10.8
  points (39 a minute), chain 8.4, hang low 6.0, creaky landing 5.5, risers 5.5, snakes met 5.4, snake on your vine 4.3, **false liana
  2.6 (the lightest beat after the first liana's teach, 2.2): its own ask, choosing the real liana over the one with a face, is a
  0.5-bit choice under the free bit and scores 0; only its swing scores, 2.1**. The 7 rests are 9 s each and carry 0.2-0.4 points
  apiece: 63 s of the stage's 5.2 minutes at about 2 points a minute, which is what holds the mean down. **NOT FINAL**: ENG-PETAL changes
  1-6 (petals; a missed creaky limb costs the way back); the re-score on its head is skipped tonight by the lead's ruling (9:46 PM ET)
  and is EXACT NEXT STEP 0 for the morning.
- **1-7: Normal 2.2 against its 5.5.** Reason: its asks are hiding in time and keeping still. The meter prices the first (the run from the
  worst spot to cover plus the calm-in, inside a 2 s warn: 0.9-1.9 bits a pass), and has no bits for the second: restraint, DIFFICULTY.md
  §6 "next version". The lightest beats are exactly the hiding ones (beats-1-7.txt): the bush 0.2 points, red light green light 0.3,
  the eagle lands 0.3, moss 0.7; only the mossy lianas (5.1) and the light gap (4.1) carry swings. The first-timer bots find it the
  second-hardest stage of World 1 (the kid: 31 hits in 4 Normal runs, 0 on Easy); the tier bots do not (0.15 misses a minute).
  **Is a priced "held still under watch" term possible? Yes:** a hold is a sustained no-press for its pass, priceable as bits from the
  hold's length against a slip rate a minute, but that rate must be measured (bots or testers, §6's own method) before it is a term,
  and only the bots have a rate today (no tester window on 1-7), so not tonight (the lead's ruling).

## 5b. Unresolved (named plainly)
- **w1Arc16.test.ts is still RED on t-build-16** (1-6 Normal 5.452 < 5.5; Easy passes): blocks link #4 until ENG-PETAL's re-score, the
  band ruling (Pushback 1), or a re-lay.
- **1-7 reads 2.2 against its 5.5** (above): restraint is unpriced.
- **1-4 reads 4.3 but the tier bots still find it harder than 1-8 (1.97 vs 1.59 misses a minute) and 1-6**; what hits them there is
  logged as "other" (castBots hitBy); not traced further.
- **1-2 reads 0.9 against its 2.5** (before and after; DIFFICULTY.md §3 had it at 2.0 on 11-12): not this packet's change; not traced.
- **Easy over 0.6 x Normal**: 1-1 0.65, 1-4 0.74, 1-6 0.67 (DIFFICULTY.md G2's 0.6).
- **1-8 Normal on t-build-18@e9dc28bf built on no layout**; on 3cc12409 it builds on 4 (the numbers above).
- **The old hand-built 1-6 reads 6.9 / 5.7** (it is replaced by BUILD-16's); 12 of its catches are NOT MEASURED.
- **Spread** (World 1-10, one layout each, Normal, on t-build-16: sweep-before.txt / sweep-after.txt / sweep-diff.txt): world medians before -> after: W1 median 3.3->4.0 (1-4 2.9->4.3; 1-6 3.3->6; 1-8 29.8->12.2); W2 median 4.3->4.3 (2-4 9.7->11.3); W3 median 4.4->4.4 (3-8 7.6->8.7); W4 median 4.2->4.2 (4-4 9.4->11.9); W5 median 6.4->6.4; W6 median 3.6->4.5; W7 median 4.4->4.4; W8 median 3.5->3.9 (8-3 4->5.1; 8-5 2.6->3.9); W9 median 6.8->6.8; W10 median 9.9->9.9. Every move past World 1 is a liana stage (the true release windows on 2-4, 4-4, 3-8, 8-3, 8-5 and World 6 are narrower than the guessed 0.4 s of 1.6 s) and none is past its world's band top (DIFFICULTY.md §4); before the gen2-only view rule and the chain-catch check it read 4-4 9.4 -> 20, 2-4 9.7 -> 18.4 (fixed, planted). One layout each: a spread check, not a reading (the method asks 4).

## 6. Method used, lessons applied, method update
- **Method used**: reference/methods/difficulty.md (steps 1-5), the ENGINE card's day one (a planted failure for each rule, the lock:
  1-1's points unchanged), LAWS 3 and 22.
- **Lessons applied**: test the measuring tool before trusting its numbers (D15: 16 planted faults, two of my own tests caught being
  unable to fail); a gate must call the same code the screen calls (D19: the release window IS pipeline lianaRelease, held equal by
  test 5); check the fact in code, not a summary (D7/D24: vineSnake.ts, chase.ts, rolling.ts, watcher.ts, stillness.ts, podfall read
  before each term); spread every fix to its pair (the World 2-10 sweep; the hand-built chase and the laid one); prove a change is
  needed with the fixed tool (the bot cross-check found 1-4's pods); times from `date` (D20/D30); own worktrees, never a checkout in a
  shared tree (D36); context % in every message (D55). **Missed: D57** (read the queue at every push): the lead's 8:44 PM note sat 37
  minutes until 9:18; my first two pushes went out without a ReadNotifications.
- **Method update (proposed for reference/methods/difficulty.md)**: step 1 add `npx tsx --test tools/difficulty/score.test.ts`; step 2
  "today 0.30654" is stale: today's SCALE is 0.28194; step 5 replace the tierBots line with `tools/difficulty/botcross.ts` +
  `reference/qa-reports/METER-1/rank.py` (both bot families, Normal, misses a minute with rescues x 8, Spearman and the pairs rule) and
  say the tier bots are uncalibrated off 1-1's moves; new traps: (a) never price an unmeasured ask as the hardest the game allows: name
  it and leave it out or keep the earlier constant; (b) read the game's own sizing function for an ask (gen2's lianaRelease, not a
  neighbour that skips the view rule); (c) a beat is a pacing mark, not a challenge: a span beat every 1.5 s is not 16 hazards; (d) the
  repo's tsc excludes tools/: type-check a tool with a tsconfig that includes it; (e) a planted case must sit below every cap.

## 7. Learned (what I would tell the next meter builder)
- Find the game's own function for the number you need before you write a formula: the liana's window, the snake's tell, the chase's
  rows, the nut's tell and the pod's quiet were all already in the game; every guess the meter had made was wrong by 1.5x or more.
- An ask the tool cannot measure must not take the hardest value it could have: three of my first readings came from such fallbacks.
- The bots do not agree with each other off 1-1: say which family you rank against and why.
- A test that both the old and new code pass at a cap proves nothing: plant each fault and watch it go red (three of mine did not, at
  first: a capped share, a ">=" where both readings were equal, a fallback that hid the old lookup).
- Read each stage by the rule it was laid and checked by: gen2's view rule on gen2's stages, the older generator's level check on its own.
  The World 2-10 sweep is what showed it (4-4 read 9.4 -> 20 until then).

## 8. EXACT NEXT STEP
0. **Morning (the lead's ruling 9:46 PM ET):** merge t-meter-1 into ENG-PETAL's head (tools/difficulty only), run
   `npx tsx tools/difficulty/band.ts 1-6` and `npx tsx tools/difficulty/beatpts.ts 1-6 normal`, then w1Arc16.test.ts; report the
   number to the lead (a design finding with the gap and the lightest beat if still under 5.5).
1. The lead rules the World 1 band (G2 +-1.5 / 0.6, or the test's +-1 / 0.7). If G2: w1Arc16.test.ts's bounds become G2's and 1-6
   passes Normal (5.452) and fails Easy (3.584 > 0.6 x 5.452 = 3.27): BUILD-16's Easy needs re-laying. If the test's: 1-6 Normal needs
   +0.05 by the design's own levers (DIFFICULTY.md §6 UP; layout 4 reads 4.68), re-laid by the stage's builder, never tuned here.
2. Merge t-meter-1 into t-build-16 and t-build-18 (tools/difficulty only; no conflict expected: neither touches score.ts after
   t-tools-2), then re-run `npx tsx tools/difficulty/band.ts 1-6` and w1Arc16.test.ts there.
3. The RESTRAINT and TIER-BOTS-ON-LIANAS packets (§4), then re-run rank.py: the bar is first-timers and tier bots both >= 0.7.

## 9. Turnover note
reference/handoffs/engine-core.md section 0zd (METER-1), committed with this report.
