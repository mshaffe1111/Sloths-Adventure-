# BUILD-17b REPORT: 1-7's shared faults fixed globally, the old-1-7 tests on the new 1-7 (R-165.204). Opus 5.5, engine tier. 1:58 PM ET to 3:02 PM 11-14
Branch t-build-17 from c318fb0a. Code heads: 7c77f501 (fault 1), b943d52e (fault 2), 82aa6dc3 (fault 3), 892880aa (the five tests),
2a2e8adc1 (drawcheck plays 1-7). Method: reference/methods/stage-fix.md + gates.md; level.md rules 21-22; LEAD-PERSONA "The engine drives development".
Lessons applied: D19 (every new check calls the game's own build: generateStage/listedRoll, never a source grep), D36 (frozen worktrees for
the lock, the suite, the bots), D40 (old 1-6 not touched: lead ruling (a)), D43 (no stage id in engine code; generality PASS), D51 (1-7 joins
drawcheck), D57 (queue read at every push), D67 (no wait loops), LAWS 22 (no rule loosened: the sweeper's flag exemption rests on a
tested engine fact, planted).

## EXACT NEXT STEP
DONE (heads): fault 1 7c77f501, fault 2 b943d52e, fault 3 82aa6dc3 + b40cef1d9e (shallow catch), the 5 old-1-7 tests 892880aa, 1-7 in drawcheck 2a2e8adc1, turnover/bots/
stills 4f82c7c5. Fault 4 (requiredMove, old 1-6) is RED by the lead's ruling (a). Next, in order:
1. **b40cef1d9e moved 1-7 again** (the joined pit is now shallow, no step): re-run on it, 1-7 only: the full unit suite, castBots 1-7
   seeds 1-12 both settings, lock `--intended 1-7`, drawcheck. Everything else in the Gates table is on 892880aa / 82aa6dc3 / 2a2e8adc1
   as named. Not re-run here: this member stopped at the lead's 40% context line.
2. Fly 1-7 (registrycheck's one MISSING): `FLIGHT_STAGE=1-7 npx tsx reference/specs/sims/flight.ts normal all`, rows in flownArcs.ts.
3. R-165.249 (lead): the journal 'hide' page for the keeper; dotLinesData `hint.1-7.hide` goes with it.

## The 9 real faults: where each lived, and the fix (every stage)
| # | Fault (tests) | Where it really lived | Fix (file:line) | Planted |
|---|---|---|---|---|
| 1 | eagle "too close to a safe spot" (pickups, levels x2) and the SAME 3 errors were the only reds in glideStages + skills (not lianas) | levelCheck judged a kit sweeper by its laid x (= its stretch's start) with the old swooping eagle's 300 px. The 3 flags sit INSIDE the eagles' stretches (5004 in 4824-5164 ...), on hides | `isKitSweeper` (gen2/stillLay.ts), levelCheck.ts safe spots: a kit sweeper by its STRETCH vs spawn and exit (SAFE_APPROACH); a flag in it fair by the respawn's stand-down (castPlay.ts calm: rest + whole calm + 2 s warn) and stillFaults' hide spacing. Lead APPROVED 2:17 PM. pickups.test mirrors it | eagleKit.test "back at a flag inside its stretch": RED with calm() not resetting the cool ("next pass 0.60 s after the respawn"). pickups.test "judges a kit sweeper by the stretch": the shrine case is RED on the old rule |
| 2 | props2 not preloaded (stageSheets, sheetWarm) | stageSheets.ts `built` left out LISTED stages: 1-2..1-5 and 1-7 took the old generator's whole set and never their STAGE_DRAWS row. Also stale: 1-4's row (draws neither foe:goldsnake nor props2) and W1_ROOMS' 1-4/1-7 (no rooms) | stageSheets.ts `listed` (stageGenerator.listedRoll's test); 1-4 row cut; W1_ROOMS = {1-6} | stageSheets.test: listed rows held to what rolls 1-3 draw on both settings + W1_ROOMS held to stages that build rooms: RED with the stale row/rooms restored, RED with `listed` off. sheetWarm judges listed W1 stages (both settings) |
| 3 | w1Pits "1-7: 1 floorless gap" | the pipeline (layLocal): a creaky limb laid by a JUMP across a soft gap got a pit under each jump's gap but none under the limb, so when it gave way he fell into nothing. Both 1-7 Normal limbs (beat 8 was misread as a sunk step, beat 14 as water). Only 1-7 lays a limb by 'jump' | pipeline.ts layLocal (after the piece loop): a creak piece's plain pit gaps join into ONE pit lip to lip. Lead APPROVED | creak.test: layLocal probe (one pit under the limb, mirrored too; a sound bough keeps two) and built 1-7 seeds 1-3 (ground under every limb): both RED with the join off |
| 4 | requiredMove "limited bot ... 1-6" | NOT the liana route checks: old hand-built 1-6 (build unchanged, hash 60f387ee8b both heads); its full first-timer ended shrine at 346.7 s of 360 (13 rescues) BEFORE BUILD-16c's cherry-picked 700a279e (hopCatches) and 'time' at 360 s after (bisected: 5f86b7ba pass, 700a279e fail) | Lead ruling (a), D40: no work on old 1-6; link #3 carries the new 1-6 and the test re-points with it | (left RED, named) |

## The 5 old-1-7 tests (new replaces old)
| Test | Done |
|---|---|
| eagleFair "1-7: the hide is said before the first pass..." | RETARGETED to the kit eagle on the new 1-7, real engine, real damage: the bush line (LINES_17.bush) said at or before the first screech, the taught stretch's first pass free (kitFree) and never a hit, later passes hit, screeches at least its own calm + warn apart. The old clause "every warning is Dot's line" is the old design's (1-7 has no per-pass line): dropped. Log seed 1: warn 0 at 0.03 s, warn 1 9.9 s, hit pass 1 13.4 s, warn 2 20.5 s ... |
| dotBox 1-7 moment | RETARGETED to 1-7's own bush teach ("When the eagle screams, get in the green"), every screen |
| movesJournal "every tip a page waits for" | the 'hide' page's 1-7 tip was a deleted line and its 'watch:hide' is never said on 1-7: both cut, it opens on clearing 1-7 (as before). The TEST is stronger: every listed stage's tips are read from what the game builds, both settings (planted: the old tip RED) |
| artDress World 1's rooms | RETARGETED: "a petal bundle for every room" is held on 1-6's gated seesaw rooms (World 1's only rooms now) |
| puzzleCamera | 1-7 RETIRED from STAGES: its only subject was the acorn meadow; the rolled 1-7 builds no room (rooms 0 on every W1 stage but 1-6, script output in this report's Done) |

## Gates
| Gate | Head | Result |
|---|---|---|
| tsc | each commit | 0 |
| unit (full CLAUDE.md list) | 892880aa | 3418/3422 pass, 2 fail, 2 todo: requiredMove (ruled (a)) and plainWalk.test "one-jump steps" (1-7 seed 2: the joined pit had a 75 px step out UNDER the limb, its own ceiling; MY fault, fixed at b40cef1d9e: the joined pit is a shallow catch; plainWalk 3/3, creak 8/8, w1Pits 16/16, seedlist 1-7 PASS on b40cef1d9e) |
| the 14 reds, file by file | working tree = 892880aa | pickups 4/4, levels 13/13, glideStages 4/4, skills 7/7, stageSheets 8/8, sheetWarm 4/4, w1Pits 16/16, eagleFair 3/3, dotBox 1-7 1/1, movesJournal 5/5, artDress 7/7, puzzleCamera 4/4; requiredMove RED (ruled) |
| new planted tests | 7c77f501-892880aa | eagleKit 6/6, creak.test 8/8; each plant RED (see faults table) |
| lock `--layouts 16 --intended 1-7` vs c318fb0a | 82aa6dc3 | PASS: 101/102 stages unchanged (3264 builds, 16 layouts); 1-7 (intended) moved: platforms, collectibles, gen2, proto.dress |
| seedlist 1-7 --check | 82aa6dc3 | PASS (100 seeds, each clean on both settings): no relist needed |
| castBots 1-7 seeds 1-12 both settings | 82aa6dc3 | 107/108 (bots12.jsonl): every bot 12/12 both settings but kid Normal 11/12 (seed 3, accepted 2:36 PM); kid Normal lives lost 4 -> 0 |
| build (BASE_PATH) / chunkcheck / artcheck / knowncheck / generality | 892880aa | 0 / PASS / 0 / 0 / PASS (27 known) |
| roadmapcheck | 892880aa (unshallowed) | PASS |
| drawcheck (with 1-7) | 2a2e8adc1 | PASS (601 s), 12 scenarios both ways, 1-7 port and land clean |
| engine tools tests (CI list + library13, castBots, routeHumps, libstage, registrycheck, pitClimb) | 2a2e8adc1 | 81/82: the one red is registrycheck.test "the shipped table passes the gate": 1-7 not flown (BUILD-17 step 2, not this packet). On c318fb0a the same file had 2 reds; its planted "creature sheets taken out of its preload list" is green now (the listed-stage preload) |
| registrycheck --stage 1-7 | 2a2e8adc1 | 1 missing: flown (not this packet) |
Not run (scoped, the integrator's full set): clipcheck, kbdcheck, buildcheck, tierBots, seedlist 1-1 (the lock shows whether 1-1 moved).

## ENGINE LINES (for the integrator's line review)
- src/game/gen2/stillLay.ts:230-240 `SWEEPER_KINDS`, `isKitSweeper`, sweptZones on it
- src/game/levelCheck.ts:19, :932-947 safe spots: a kit sweeper by its stretch; flags exempt for it only
- src/game/stageSheets.ts:59 import, :74-75 (1-4's row cut between 1-3 and 1-5), :138-140 W1_ROOMS, :160-164 `listed` and `built`
- src/game/gen2/pipeline.ts:1376-1397 the creak-across-a-pit join in layLocal
- src/game/movesJournal.ts:236-240 the hide page's open
- tools/perf/limits.json scenarios + "1-7" (the Critic's file: a registration, no limit moved)

## Polish check
Shot on the real game (BUILD-17's shoot17.mjs, the dev page, frozen worktree at 82aa6dc3), Normal, seed 2, both ways; stills/ (jpg of
the shooter's png). Judged at 1x as a player:
- PASS beat 8 (upright-412x915-normal-b8-creak, sideways-915x412-normal-b8-creak): him ON the creaky limb as the eagle tells; under the limb
  a shallow dip with ground in it, lip to lip, reads as "it drops you a little". BEFORE (stills/BEFORE-upright-412x915-normal-b8-creak.jpg,
  BUILD-17's): a dark shaft down into nothing under the limb.
- PASS beat 14 (upright/sideways b14-finale): the finale's limb has the same shallow floor under it, both ways; he is hidden (1) in the moss.
- ROUGH, NOT MINE, named for the lead (all were in BUILD-17's stills too): a hard-edged lighter rectangle in the backdrop behind the action
  (b8 sideways x 480-1150, y 250-560; b14 upright x 0-730, y 620-1290); Dot's box over the upper screen (BUILD-17 (a)); the eagle over the
  lives counter in the b14 sideways still.

## Pushback
- The packet's (4) was wrong in kind: glideStages and skills were fault 1; requiredMove is old 1-6 and BUILD-16c's bot commit (evidence above).
- The packet's (1) "fix the cast lay": moving the eagle's laid x changes no outcome and clipping the stretch would cut 1-7's hides out of
  their eye; the CHECK was measuring the wrong thing. Lead approved the check fix 2:17 PM.

## Suggestions (ready packets)
1. **KEEPER + DESIGNER: the journal's 'hide' page** (movesJournal.ts:236): its words and demo teach the old slide-down hide ("Slide down
   inside a bush", pose 'duck'); 1-7 now teaches keeping still in the green (no crouch). Objective: a page for 1-7's rule (still in cover:
   a bush, moss, a mossy liana) opened by 1-7's bush line, and the slide-down page kept for World 4's watcher (4-5 "Her shadow!") where it
   is still the rule. Done: the movesJournal test (reads built tips) green; stills of the page.
2. **dotLinesData.ts:117 `hint.1-7.hide`** is the old line, kept only because dotGuide.test:316 reads it: retire with the page above.
3. **World 6/8 watcher zones and flags** (not 1-7): a survey found flags INSIDE watcher.ts zones (8-2 v0: 1073-2148 flag 2113, and more;
   8-1/8-8's scare runs by design). The kit's sweepers stand down on a respawn (castPlay.calm); check whether watcher.ts zones do (no
   'respawn' handling found in watcher.ts). If not, a respawn can meet a pass mid-eye: an Engine packet with a planted respawn test.

## Unresolved
- **requiredMove.test RED** (old hand-built 1-6's full first-timer times out at 360 s since BUILD-16c's 700a279e): lead ruling (a), D40;
  it re-points with the new 1-6 on link #3.
- **kid Normal 1-7 seed 3: one rescue at beat 10** (the mossy-liana pit, x 23064, "fell into this pit 3 times (its far wall 231 px up)").
  BUILD-17's accepted rescue was kid Normal seed 6 at the same beat; after the pit fix seed 6 is clean and seed 3 has it: 107/108 both
  ways. Not the creak join (beat 10 has no limb): the kid's timing moved upstream. A builder/bot matter for beat 10, the lead's call.
- **registrycheck 1-7: 1 missing, flown** (BUILD-17's step 2: `FLIGHT_STAGE=1-7 npx tsx reference/specs/sims/flight.ts normal all`);
  sheets and drawcheck now register. CI's registrycheck stays red on 1-7 until it is flown.
- The journal 'hide' page's words/demo (old slide-down) and dotLinesData `hint.1-7.hide`: Suggestions 1-2 (keeper + designer).

## Method update
- gates.md / stage-fix.md: before fixing a red "for a stage", print the check's own numbers (here the flags' x against the stretches):
  three reds that looked like three faults were one, and one red blamed on lianas was a bot commit (bisect the tool, not just the stage).
- level.md rule 22 worked as written: each fix is an engine line with a planted test, and the lock names only 1-7 (see Gates).

## Turnover
reference/handoffs/engine-core.md section 0y (commit below).
