# BUILD-23b REPORT: 2-3 continued (t-build-23 from b51e4f0df; this section written 9:25 PM ET by `date`)

## EXACT NEXT STEP (for BUILD-23c)
1. **Three decisions from the lead first** (sent 8:59 PM ET): (a) THE ISLE: the pond's last bank is the far shore with dry ground past
   it, so w2-new#reed-isle-a is NOT laid (it sank into the soil: stills/b23-L1-normal-w2new-reed-isle-a-REJECTED-sideways.jpg). The fix
   is water past the isle, which changes beat 6's flown G 360/510 numbers: Designer/lead. Once ruled, lay it in w2Arc23.ts layW2New23
   (walk line 83/208 of the picture on the isle bank's top; the comment there says how). (b) The post's painted plank shelf, just under
   the cage, reads as a ledge he cannot stand on: a real ledge (Designer) or a post with no shelf (HF). (c) **Rule 8 breach:** sideways,
   with him on the ground at the post, cage 4 sits under the HUD goal plank (stills/b23-L1-normal-w2new-mooring-post-sideways.jpg).
2. **The bots stay RED until ENG-CAGE's GREEN hash lands** (the lead sends it; do NOT touch firsttimer.ts or castBots). Then castBots
   1-6 as a look, then relist (seedlist.ts; 2-3's row has NO `judged` yet), castBots 1-40 both settings (rule 28), the meter.
3. **THE FULL SET on the exact head** (D96: CLAUDE.md's list AND every CI gate: coveragecheck, registrycheck, tipwalk; kbdcheck,
   buildcheck, seedlist 1-1, the engine tools' tests, tierBots), plus `lockall --layouts 16 --intended 2-3 --check lock-main.json`
   against main (UNRUN tonight: the lead's 8:35 PM ruling): only 2-3 may move. clipcheck in full: tonight only its new '2-3 HUD faces'
   step ran (CLIPCHECK_STEPS), seen both ways, no breaches.
4. Then the final stills on the GREEN head (rule 29): every beat both ways, both settings, the HUD faces in each state with the line
   really spooked by a look (tonight's 'spooked' is set by hand, follow.ts spook's fields).

## Done (each pushed on t-build-23)
| Commit | What | Evidence |
|---|---|---|
| ad2d9e15a | **ENGINE PIECE (designed cage socket)**: the planted test for 3f958e630 (the branch itself is BUILD-23's, kept unrewritten) | src/game/gen2/designedCage.test.ts: a rolled 2-3, seeds 1-2 both settings: 5 designed cages each with its little one, goal Normal 5 / Easy 3, a burst one joins the line. Branch off: 'expected 5, actual 0' RED; on GREEN. generalitycheck PASS. No STOPGAP. lockall UNRUN (step 3) |
| cd44b43fa | **ENGINE PIECE (heron look)**: the cause, found on the page: pose and art were right (w2HeronLook drawn, riverArtReady true); drawHerons culled the whole look while its wash (70 px sight) was off view, and the sweep starts 160 px past its stretch. BUILD-23's still was shot 8 frames in (lookX 5464, view 5620-6820). followArt.ts lookInView: wash OR heron in view | followArt.test.ts planted (old rule RED, new GREEN); stills/b23-L1-normal-3-heron-look-*.jpg (mid-sweep, wash over his bed) and 3a-heron-look-start-*.jpg (the gaze off the left edge), both ways |
| 14839fa18 | **w2-new wired** (ruling 8:05 PM): w2NewArt.ts; W2Decor.nw + one branch in drawW2Decor; 2-3's STAGE_DRAWS 'w2-new'; stagePreload. The mooring post stands over beat 5's rope as its look (vine.rope true: no kapok trunk doubled). **sheetWarm**: no eagle on a follow stage, no props2 for reed clumps (stageSheets.test.ts was RED on t-build-23 @ b51e4f0df from BUILD-23's own 2-3, not inherited: D94) | w2Arc23.test.ts test 6 (planted x3); on the page 1 drawImage from w2-new on the post's frame, both ways (w2new23.mjs); stills/b23-L1-normal-w2new-mooring-post-*.jpg; stageSheets.test 8/8 |
| 9bb9e851a + cc9288f9b | **Planted faults** (rule 12): reference/qa-reports/BUILD-23/planted-faults.py, 16 plants: all six w2Arc23 tests, the three engine pieces, sheetWarm x2, the find, the HUD face | planted-faults.txt (14/14 CAUGHT at 9bb9e851a; the 2 added at cc9288f9b each CAUGHT by hand) |
| 1974d9294 | **The HUD faces** (BUILD-23.md item 2): followFaces.ts (pure, the heron's own rule: in cover and still is hidden), engine.ts lineFaces(), App -> GameHUD -> VineHud prop (polled 150 ms, redrawn only on change), LineFace.tsx (cut from w2-props' Happy paintings; the sheet's size read, not assumed: it is 2592 tall now, the mock assumed 2166) | followFaces.test.ts planted; stills/b23-L1-normal-hud-faces-{open,hiding,spooked}-*.jpg and -plank-crops.jpg: dim / lit green / grey with amber ring and '!', both ways; clipcheck step '2-3 HUD faces' seen both ways, no breaches |
| cc9288f9b | 2-3's find off the rest's boulder: finds.test.ts and flowerReach.test.ts were RED on b51e4f0df (find #15 at (7020, 627) inside platform 26: the rest brick's findSpot sat on its own boulder) | finds + flowerReach + w2Arc23 + designedCage 17/17; planted |
| (this commit) | REPORT, engine-core.md 0zq-23b | |

## Polish check (each still looked at, as Matt will on a phone)
- 3-heron-look (both): head-up heron, dashed gaze down to the reed bed, the three little ones' heads in the reeds: reads. **Named:** the
  ground wash is faint (cream at alpha 0.55/2 on a sunlit bank, mostly behind the reeds); the gaze carries it. Colour: a Designer number.
- 3a-heron-look-start (both): the gaze runs off the left edge toward where it looks: reads (before the fix: no gaze at all).
- w2new-mooring-post (both): one post, cage 4 on its top, Pokey to scale beside it; upright reads well. **Named:** the plank shelf reads
  as a ledge (step 1b); sideways the cage is under the HUD plank (step 1c, rule 8).
- w2new-reed-isle-a-REJECTED: the isle mound sunk in dry soil: rejected, not laid (step 1a).
- hud-faces open / hiding / spooked (both): match ENG-23's mock. First try: the '!' was grey (the face's grayscale greyed it): moved the
  tone to an inner layer. Second: blank discs (.vh-slot's silhouette rule): filter none inline. Final crops: plank-crops.jpg.
- World 2's neon stems and teal sprouts (ENV[2]) are on screen in these stills: R-165.362's member, not mine (named, not fixed).
- Every still is a LOOK CHECK on a RED-bot head (rule 29): the final shoot waits for GREEN.

## Pushback
- Two touches outside a builder's walls, named: riverArt.ts's W2Decor type gained one optional field (`nw`) for the ruled "one painter",
  and tools/perf/clipcheck.mjs (the Critic's gate) gained the '2-3 HUD faces' step the packet asked for. Both small; the Architect and
  the Critic may want to review.
- The isle as designed (the pond's far end) cannot carry an isle picture made to stand in water: the design and the art disagree.

## Suggestions
- level.md rule 11 could say: a painted piece made to stand in water is laid only where water surrounds it; a still with the piece in
  place is the check (the isle cost one round here).

## Unresolved
- The isle, the shelf, the cage under the HUD (step 1). The bots RED (ENG-CAGE). Full set, lockall and full clipcheck UNRUN tonight.
- Faint heron wash (Designer's colour). Dot's `spooked` line on the first spook and the locked-gate line by state (BUILD-23's ENGINE-WORTHY 4) still open.
- The art inventory still says w2-new#mooring-post 'ready (not in the build: no code loads the sheet)': Content's file, now stale.

## Method update (level.md)
- Shoot a watcher's look at the middle of its sweep, by state (lookX over the cover), never N frames after the phase flips.
- A designed objective is proven on a ROLLED row with its plant (designedCage.test.ts is the model).

## Learned (for the next builder)
- A still that "shows nothing" can be a timing artifact: read the state at the frame (lookX vs the view) before blaming the art.
- A full-suite red on your own stage is yours even when it predates you on the branch: check it on the branch's pre-you head (D94).

## Lessons applied
D30 (every time from `date`), D94 (stageSheets and finds reds checked on b51e4f0df, worded as BUILD-23's, not inherited), D96 (the full
CI list named as UNRUN, not "the gates"), D101 (the isle and shelf reported, not coded around), D102 (lean reads: grep and line ranges).
Turnover note: reference/handoffs/engine-core.md 0zq-23b (this commit).

---

# BUILD-23 REPORT: 2-3 "Stuck in the Reeds: Walk Them Home" (handover at the lead's STOP, 8:31 PM ET 11-20, D76: context past 400k)

## EXACT NEXT STEP (for BUILD-23b)
1. **The lead's rulings (8:10 and 8:21 PM ET, read by BUILD-23 only after its STOP):** ruling (a): the designed-cage branch is the
   BUILDER's, kept as a GENERAL engine piece. Its conditions are NOT yet met, all for BUILD-23b: (1) its own commit with a message starting
   'ENGINE PIECE (designed cage socket)': 3f958e630 is pushed with a "PENDING" message, and ENG-CAGE branches from it, so do NOT rewrite
   it: add a follow-up commit with that message that holds the planted test, and name both in this REPORT; (2) the plant: branch off ->
   a 2-3 roll lays 0 cages (RED); on -> Normal 5 / Easy 3 with critters (GREEN); plus one assert that a designed cage's little one joins
   the line (engine.ts:4517 c.critter); (3) generalitycheck PASS; (4) lockall vs main shows ONLY 2-3 moving (any other stage moving: stop
   and tell the lead); (5) no STOPGAP. The cage BOT skill is ENG-CAGE's (t-eng-cage, from 3f958e630), with the climb-punch question:
   do NOT touch firsttimer.ts or castBots. (A) the startFollow move is KEPT, in its own commit affa08d81; ENG-CAGE reviews it.
   (B) reeds as h: accepted, R-165.360 carries realisedCode 'm'. The 9:45 PM stills are a LOOK CHECK; the final shoot waits for green
   bots (rule 29). Until ENG-CAGE lands, 2-3's bots are RED (0/18) and nothing is GREEN.
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
- The designed-cage branch: ruling (a) at 8:10 PM ET (the builder's, a general engine piece; conditions in step 1). The 8:21 PM ruling:
  the bot skill goes to ENG-CAGE; startFollow kept; reeds as h accepted (R-165.360).

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
my "8:15 PM" message to the lead was a typed-ahead time; it arrived at 8:05 PM by the clock (the lead's note). D76 handover at the lead's STOP.
