# BUILD-23 REPORT: 2-3 "Stuck in the Reeds: Walk Them Home" (handover at the lead's STOP, 8:31 PM ET 11-20, D76: context past 400k)

## EXACT NEXT STEP (for BUILD-23b)
1. **Read the lead's rulings first** (cage-lay branch (a)/(b), the bot cage skill, World 2's env plants). Until they come back, 2-3's
   bots are RED (0/18) and nothing is GREEN.
2. **The heron's look is not visible on the real page.** stills/b23-L1-normal-3-heron-look-*.jpg are taken while the engine says the
   first heron is in its `pass` phase (followPlay herons[0].s.phase), but the heron is drawn in its CALM pose with no gaze and no wash.
   There is NO dress heron in 2-3 (proto.dress has none, checked). The heron's foot is at x 6290, b 653 (seed 1). So drawHerons
   (engine.ts:7838 -> followArt.ts:122) falls back to drawDress (riverArtReady() false?) and/or h.lookX is null at render time.
   Find which one, on the page (log heronPose(h), riverArtReady(), h.lookX in the stills script), and fix it where the cause is. If the
   cause is engine code, it is ENGINE-WORTHY: tell the lead. A look the player cannot see fails the polish bar.
3. **Wire w2-new.webp** (the lead's ruling (1), 8:05 PM: the builder does it, data + one painter, planted: the sheet preloads on 2-3 and
   the mooring post and the reed isle draw from it). Do it BEFORE any still of beats Pr or Wf. Not started.
4. **Planted faults** for w2Arc23.test.ts (level.md rule 12): a planted-faults.py with each of the five tests RED under its plant.
   Not started.
5. Then continue the packet in order: the HUD faces (item 2), the bots once the skill lands, relist (seedlist.ts, fly the judged rows
   first: 2-3's row has NO `judged` yet), castBots 1-40, the meter, THE FULL SET.

## Where it stands (branch t-build-23, base 0eefc707e; every commit pushed)
| Commit | What |
|---|---|
| 858684675 | 2-3 laid through World 2's kit: src/game/gen2/worlds/w2Arc23.ts (ARC_23 `A Tg Th R Pw Xh R Pr Wf R Ch R S E`; kitLib23, kit 'w2-23'; finish23), the stageTable row, listed.ts KITS/WORLD/FINISH; tools/engine/runs/line23.ts, quiet23.ts |
| 3f958e630 | **THE ENGINE PIECE, PENDING the lead's ruling:** pipeline.ts, a DESIGNED cage (socket allow 'cage' + its critter) laid where it stands, every one, with its critter. Without it a rolled graph lays NO cage (only missionGraph's fallback spine sets node.objectives). Planted test not written yet. Revert this commit if the lead rules (b). |
| affa08d81 | **engine.ts startFollow moved after the player is made** (it ran in the constructor before this.player: every real proto.follow stage threw). Engine code: for an engine member's review. |
| 6a88626d9 | The hand build's 2-3 deleted (w2Sections plan '2-3', W2Plan, W2_FLAVOURS/BY_DRAW rows, W2_STAGES '2-3', CAGES_23, W2_PUZZLES '2-3' (ruling (2)), the LV-11 post step) and the tests re-pointed (below). |
| 81dd325de | The keeper's lines: reference/story/lines-2-3.md (from t-keeper-23-29@e5f754d8); the stage card, Pokey's page, the clue; hint.2-3.cage/post/open retired (way.2-3 stays); w2Arc23.test.ts (5 tests, PASS). |
| (this commit) | This REPORT, stills23.mjs, the early stills. |

**The beats as laid** (one brick each, Normal / Easy): A the marsh (`follow` tip). Tg the first cage (duck) on a flat bank, a flag before.
Th the heron, safe: `heron` + `look` 800+ px before one reed bed 300 / 340, watch socket 'teach-heron' (free first look, calm 8-9 s).
R rests (a boulder each). Pw the parade: two stones over splash-back water, cage 2 (otter) on the far bank. Xh clump to clump: reeds
300 / 340 over open mud 400 / 350, cage 3 (capy) in the far clump. Pr the mooring post: a tree_climb vine 230 px with cage 4 (otter) up it
(geometry only, NO post art yet). Wf the pond: ONE sinking pad (two read 500 px of open pond, over lineFaults' 360) to an isle bank with reeds;
finish23 stretches its watch zone across the pond to the isle. Ch everything: three clumps over G 350, cage 5 (capy), Normal's second heron
LAG_23 3.2 s (finish23), Easy one. S home: the boardwalk (NO jetty or families drawn yet). E the gate.
**Numbers (head 81dd325de):** libstage 2-3 12/12 CLEAN both settings (172.7-177.7 s modelled, 27.5-28.4k px); lineFaults clean on seeds 1-3
both settings; w2Arc23.test.ts 5/5.
**Tests re-pointed:** w2Puzzles.test.ts (pulley tests to 2-8's cages; the two-stone "halfway" step retires, no stage lays one now; the
across-room water check reads 2-8's one basin river; the room-camera test to 2-9's bell room), w2Stages.test.ts (PLANS without 2-3; its
2-3 test's still-true assertions moved into w2Arc23.test.ts: five cages, the three kinds, no animal near the first, the post),
dipWayOut.test.ts (2-3's step test retires with the step), puzzleCamera.test.ts, writtenKeys.test.ts (golden seed set-up to 2-8).
Ran green: those files plus layoutMemory, w1NewArt, dotStuckHelp, stagePlanGoals, dotTipSession, jumpTrails, follow, followArt, bands,
lineBot, lineChannel (103 tests, 4 red, all 4 since fixed). **NOT run: the whole suite** (dotLinesData row removal may move counts elsewhere).

## Rulings and GO (verbatim sources: the lead's messages)
- GO 8:05 PM ET on the plan as written; (1) w2-new.webp: the builder wires it, before stills of Pr/Wf; (2) 2-3 out of W2_PUZZLES: yes;
  (3) prove the cage punch early: done, the answer is NO (below).
- Asked 8:15-ish, NOT yet ruled: the designed-cage lay branch (a) builder or (b) engine member (commit 3f958e630).

## ENGINE-WORTHY (named, not coded around)
1. **The bots cannot punch a cage** (castBots 2-3 seeds 1-3, child/middle/expert x both: 0/18, every run "sealed door, goal 0/5 (Easy
   0/3)"): tools/inspect/firsttimer.ts punches only an animal walking at him (:2833) and a drop trap's load (:3206, :3224); a cage is only a
   distance topic (:2058). Plus: whether he can punch while climbing (the post's cage) is unproven. Sent to the lead 8:19 PM.
2. pipeline.ts realisedCode (:1085) cannot realise content 'm' (cover): the reed beats were laid as h (1-7's precedent) so V11 passes.
3. **World 2's neon-green stems and teal sprouts (packet item 4) are World 2-wide**, not 2-3's: envKit.ts ENV[2] near/decor (reedclump,
   nipa, proproot, hyacinth: code-drawn, envPlants.ts:266). Proven: stills/w2-env-plants-ON-2-5.jpg vs -OFF-2-5.jpg (the same 2-5 frame
   with ENV[2]'s lists emptied: the stems and sprouts go, the painted pebbles and flowers stay). Rule 22: a world-wide fix, the lead's call.
   NOT yet sent to the lead.
4. No engine hook says Dot's `spooked` line on the first spook, or picks `missingCage` / `missingReed` at the locked gate by state,
   or says Pokey's `post` / Dot's quiet `home` (keeper: on every Tips setting); goalStart/goalLate and countWord 'home' not wired;
   the heron's journal card not added. All named for BUILD-23b / an engine member.
5. The time model does not count a watched stretch's waits; 2-3 met the 2:00 floor by length (1-7's way), Easy's quick player 144-146 s.

## Polish check (early stills, head 81dd325de's stage, seed 1 L1, Normal; stills/ in this folder; Easy NOT shot)
- 1-cage-shut (both): the duck in its painted cage on a flat bank, him a step short: reads. A rolled flag stands beside the cage: clutter, look again.
- 2-line-behind-running / 2b-caught-up (both): the duckling trails him and closes up: reads.
- 3-heron-look (both): three little ones hidden in the bed, ears showing: reads. **The heron's look is NOT visible** (Next step 2): FAILS.
- 4-parade: the run reached the far side with the line bunched (the script's hop is crude): not judged, reshoot.
- The HUD's goal plank shows five blank slots: the faces (item 2) are not built.
- World 2's neon stems and teal sprouts are on screen (ENGINE-WORTHY 3).

## Learned (proposed level.md rules)
- A real stage row is the first proof of an engine piece: 2-3's first roll found three gaps the toys could not (no cage laid on a rolled
  graph, startFollow before the player, no bot cage skill). Rule 23's "ready" should require one roll of the real row plus one bot run.
- Lay the length first: a stage that is mostly walking needs 1-7's / 2-5's width (27-32k px) to meet the 2:00 floor; check libstage's
  seconds before the beats' details.

## Lessons applied / missed
Applied: D40 (engine gaps reported, not worked around in data, except the h-for-m precedent named), D30 for most times. **Missed D30 once:**
my 8:15 PM message to the lead was a guessed time, not from `date` (it was about 8:09). D76 handover at the lead's STOP.
