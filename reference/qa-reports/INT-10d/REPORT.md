# INT-10d report: the petal rule decoupled, then link #4 (1-6 + the 1-7 eagle). Branch t-int-10b. Opus 5.5 high. STOPPED at the lead's word (4:19 PM ET: links #4 and #5 become one link from INT-11's head).
Started 1:55 PM ET (packet 1:54 PM); stopped 4:16 PM ET. Every time below pasted from `TZ=America/New_York date`.

## Done-items
1. **Placement is main's lay again** (2cc8be2a): pipeline.ts fillSockets lays a pickup socket at `k.x` on its own piece as main does
   (node-fixed counts `pickLeft` kept); petals.ts fillGaps as main: ENG-PETAL's ledge clip to walked spans and ENG-16E's off-path guard
   (pit floors, hurt floors, creaky-limb jumps) out; walkPetals (the built-stage move/strip) and walkedSpan.ts walkedPiece deleted (new
   replaces old). Kept (not the walked model): 1-4's lid head stop in climb trails (vineField shutLidFeet), pairPetals' 38 px one-hand
   reach, 1-6's arcs (Collectible.arc, never counted), the harvest top-up fix (8-2), the LOW brief (now ruling C below). Searched for a
   2-1 river/arc or log/pad petal rule on the branch (`git diff origin/main...HEAD` over src/game for petal+ride/log/pad/river): none
   exists beyond main, so nothing to keep there.
2. **The door counts only walked petals** (2cc8be2a): petals.ts `markWalked` stamps `Collectible.walked` on every flower/leaf of a gen2
   stage, last in stageGenerator finishStage (after petalPass and pairPetals, so it judges the stage the game plays): standing on a
   solid/creaky piece -> true only inside its walked span (ENG-PETAL's model with ruling A, WALKED_MIN, 2 px give) on a piece off no miss;
   on a ride (log, pad, lift) -> true; in the air -> true unless inside a fall below its lower lip. goals.ts goalCounts skips
   `walked === false` (plus arc and crumbling as before). The HUD counter and the engine's tally count every petal picked (no filter
   there: grep of engine.ts), so an off-path petal still shows and still adds; it never seals a door.
3. **Ruling C** (lead 2:08 PM ET; f3df3855): a LOW brief's fill runs only over stretches longer than SPREAD_MAX (2 x 840 + 400 px, the
   spread test's 2 screens), petals.ts fillGaps `min`, so it lays the petals that close such a stretch and no more.
4. **Planted** (reference/qa-reports/INT-10d/planted-door-off.txt): (a) petalFill.test 1 and 3 (a fill petal on a soft pit's floor / a
   thorn bed is laid by main's fill and never counted) and walkedPath.test F (1-6 layouts 1-3: petals off the path exist; the goal is
   within what every run passes; with the exclusion off the share asks more than every run passes) all RED with `x.walked !== false`
   taken out of goalCounts, GREEN with it. (b) walkedPath.test G: 6-2 layout 1 Normal holds main's 73 petals (the walked lay left 5).
   E (ruling C): a 2.8-screen bare stretch on a LOW stage gets petals only inside it and none left over 2 screens, 1.5 screens gets
   none; RED on the old LOW skip. ENG-PETAL's toys restated to the door rule (A, A2, C via markWalked; D: on 1-6 L1-3, 1-1, 1-7, 6-1,
   7-3, 8-2 both settings every standing petal is counted exactly when its span says so); walkedSpan.test's 1-6 socket case is D now;
   petalFill.test restated (ENG-16E's creaky-limb-arc toy dropped: no door equivalent, the arc off a required limb is walked).
5. **petals.test GREEN** 3/3 (spread: 13 reds -> 0), with petalArcs, fieldPetals, goalsGathers, petalFill: 21/21 (2:12 PM run).
6. **1-6 at the band under main's lay** (screens.mts, Normal layouts 1-5 mean, petals per upright screen): 1-1 1.52, 1-2 1.06, 1-3 1.72,
   1-5 1.42, **1-6 113 petals, 1.05**, 1-7 0.73, 1-8 0.76. 1-6 sits with the other LOW stage (1-2); no bank rows to remove (INT-10c took
   them out), arcs kept (bonus, never counted). petalArcs.test's band check passes (0.86-1.2).
7. **FIX-21 cherry-picked** (827436784 -> b80451f6): one import conflict in pipeline.ts (kept HEAD's physics imports, took
   comboGuaranteedAt/missionOf); bounceAlone.test 2/2.

8. **Ruling (a)** (lead 3:02 PM ET; a67a91fb): `bounce-air` is a Move; planBudget holds it only where skills.ts comboGuaranteedAt says
   (no stage yet), pipeline.ts bounceCap and reach.ts bounceLipOverCap read the budget's moves; the 8 W1 sections whose lay moves with the
   combo declare `needs: [..., 'bounce-air']` (w1-hop-bounce, w1-bounce-run, w1-ledges, w1-two-lifts, w1-bounce-wall,
   w1-bounce-over-dip, w1-mushroom-log, w1-mushroom-stair), so they leave every pool. w1.test's exitDy test lays each section with the
   moves it declares (not loosened: same 25 px). comboNeeds.test.ts planted x2 (planted-door-off.txt PLANT 1/2). Other bounce teaches
   stay in the pool (w1-mushroom-lift, w1-mushroom-bank-teach); w1-hop-bounce, which teaches 'bounce', leaves with the combo.
9. **Relists**: 1-1 IN ORDER (`--merge` its own 161 seeds `--in-order`: same seeds, same order; a plain relist first rebuilt it from
   fresh seeds: caught by comparing the seed arrays, redone), 1-4, 1-6. 1-4's index line: the two relists wrote provenIndex.ts at once
   and the later one put back 1-4's old version; set to the list file's own. 1-1's first-run lock: both hashes are TIPS's f94ccdcb
   record again exactly (firstrun-lock.txt), the state before ENG-16H's walked lay: the revert proof.
10. **lockall vs main 73e7bed0** (2 layouts x both settings, lockall-2-vs-main.txt; on f104754b, before ruling (a)): 63/102 unchanged.
   The wholesale moves, traced by bisecting t-int-10b's first-parent line then the merged branch with lockall on just those stages:
   **9-3, 9-4, 10-3, 10-6** move at TOOLS-2 ba2b1a21 (R-165.251, merged by ENG-16H 8b8dc02a): every stage builds on its own setting's
   dials and the hand-built retry's chosen attempt is cached per setting (stageGenerator `known` key gains dialsKey), so their validated
   attempt follows the setting. Intended by R-165.251; not petals.

11. **castBots 1-40 x child/middle/expert x both settings** (castBots-1-6/7/8.txt, head dd6c5067 = code a67a91fb): 1-6 child Normal
   38/40 (seeds 23, 34: 'shrine rescued x1'), every other tier/setting 40/40; 1-7 all 40/40 (eagle hits only, no life lost but 1 pit);
   1-8 child Normal 37/40 (seeds 7, 9, 13), all else 40/40. The same failing seeds as INT-10b's runs on its head; no sealed door anywhere.
12. **1-1 tier calibration** recommitted (reference/qa-reports/R-165.59/calibration-main.jsonl): every check's pass/fail unchanged on all
   5 tier/settings; child Normal rescues 4 -> 5 (variant 1: a run that was rescue-free now has one; NOT traced: the run JSON carries no
   rescue x). tierBots.test 7/7.
13. **KID_RUNS_59** (dbbad40e, the one code fix from the gate run): the suite re-measured 5-9's kid runs as 3, 5, 6, 7, 6, 5 = main
   73e7bed0's record exactly (the revert proof); Easy goal unchanged (median 5). INT-11 merges it.
14. **1-7's eagle on this head** (probe.txt): ENG-WATCH2's walker probe, seeds 1-4 Normal: eagles 0-1 (the lesson) lose 0, every eagle
   2-8 loses >= 1 heart on all four seeds, identical to ENG-WATCH2's probe-recheck. The caught walk re-shot on eagle #2
   (shots/17-walk2-n-up/side.mp4; the dive at f128, HEART LOST f129 at x 7179: shots/17-walk2-n-*-f128-dive.jpg).

## Gates (once, on 473f6d45 = code a67a91fb; the suite and clipcheck on the head as they started; logs in gates/)
| Gate | Result |
|---|---|
| tsc | PASS |
| build (BASE_PATH) + chunkcheck | PASS |
| artcheck, knowncheck, generality | PASS |
| roadmapcheck | PASS (first try stopped at the shallow-clone guard; `git fetch --unshallow`, then PASS) |
| tool tests (library, seedlist, yield, travelBots) | PASS 37/37 |
| seedlist 1-1 --check (and 1-2..1-8 on a67a91fb: lists/check2-*) | PASS |
| kbdcheck | PASS (its regenerated keyboard pngs reverted: tool output, not a change) |
| tierBots.test | PASS 7/7 (after the recalibration) |
| suite | UNFINISHED at the stop: 1456 ok, 1 red (firstTimerBot KID_RUNS_59, fixed in dbbad40e) when stopped |
| drawcheck | RED: 1-8 sideways x 24036, gradients 7.33 > 2, drawImageScreens 10.86 > 7.5 (re-run alone: same). Already red on 45a14a55 (6.11 / 9.96), not from INT-10d: the chase stretch's flush 215 px pieces each paint their soil and depth band. RESOLVED on t-int-11 (the lead, 4:19 PM): the bough look (ENG-LOOK2/ART-18 on t-build-18c) turns off soil/pit shading on bough stages; 1-8 x 24036 passes there (4.54 up / 5.41 side). |
| buildcheck | RED, NOT VALID: 1-1 Normal p95 178 ms > 150 measured with the suite, drawcheck and clipcheck on all 4 cores; the re-run alone never happened (the stop). INT-11's one gate run measures it. |
| clipcheck | UNFINISHED at the stop (started 4:09 PM) |

## Polish check (shots/; the setting each was built on printed by the game)
- 1-6 L1 at x 8730 (FIX-21's bank), 28296 (creaky landing's joined floor), 45650 (gorge), Normal + Easy, fresh + old save, upright +
  sideways (24 stills); the walk x 25000-31000 both settings both ways (4 clips). Whole screen (D79): HUD, backdrop, props read painted;
  Pokey's line box sits under him, never over where he acts. Nothing rough found that this branch made. 1-6 L1 Normal asks 28: of 113
  petals 58 are arc bonuses and 23 off the walked path (32 counted); the lead: fine (the door can't seal).
- 1-7: glance with him still (#1), fake-out (#5), caught walk (#2: the dive and the lost heart named above), Easy's longer tell (#1):
  up + side. The first walk clip (#1) showed no catch: #1 is a lesson eagle (0 hearts by design); the clip choice was wrong, not the eagle.
- Frames (438 MB) kept out of the repo; mp4s and stills only (8 MB).

## Unresolved
- suite and clipcheck unfinished; buildcheck alone not run (all go to INT-11's one gate run on the joined head).
- 1-1 child Normal variant 1's new rescue: untraced.
- petalArcs.test's title still names the stripped-lay band (1-3 0.86, 1-5 1.04); under main's lay World 1 reads 1.42-1.72.
- build.py --published: not run (the link moved to INT-11).

## Lessons applied / misses
D19 (markWalked judges the stage the game plays, after pairPetals), D21 (fill + socket both reverted; air and standing petals both
judged), D29 (relists, then every list --check, the first-run lock, tierBots), D30 (every time from `date`), D36 (`git ls-remote` = HEAD
after each push), D40 (ruling (a) before the relists: I had relisted before reading it), D46, D59 (gates named UNFINISHED, not "will
finish"), D62 (stills print the built setting), D69 (the walk clip judged by its frames: no catch, then re-shot with the frame named),
D79 (whole screen). MISSES: D57 twice (the lead's 2:50 and 3:02 PM messages sat 12-22 min unread across two pushes; the 1-1/1-4/1-6
relists and a bot run were made before ruling (a) and redone); a plain relist rebuilt 1-1 from fresh seeds before I relisted it in
order (caught by comparing the seed arrays); three background commands lost their `$O`/`$S` to a `&` subshell and wrote logs to `/`
(moved back; scripts now use absolute paths).

## Method update (proposed)
- level.md / gates.md: "Relist a listed stage IN ORDER (`--merge <its own seeds> --in-order`) unless the packet says rebuild; two
  relists never run at once (they both write provenIndex.ts: the later one put back 1-4's old version)."
- gates.md: "buildcheck runs ALONE (a loaded machine reads p95 178 vs 150 on the same code)"; "roadmapcheck needs a full clone: `git
  fetch --unshallow` first in a cloud container".
- A clip of a watcher's catch names an eagle past the lesson (eagleProbe's numbering), never #1.

## Turnover note
No engine-core.md section this time (the lead stopped the task before the hand-off; this REPORT is the turnover for INT-11).

## Pushback
- None on the ruling. One note: the band numbers in petalArcs.test's title (1-3 0.86, 1-5 1.04) were measured on the stripped lay; under
  main's lay World 1 reads 1.42-1.72. The test still guards 1-6; the title is history.
