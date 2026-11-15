# ENG-CL report (11-14): the chase stage's blockers for 1-8, and the look handed over

Branch `t-eng-cl` from origin/t-eng-b6 a4e1ff8f. Packet: origin/ccr-ea739a2f-dfcee4 reference/packets/2026-11-14/ENG-CL.md, plus the
lead's item (8) (8:20 PM) and the look's scope change (8:31 PM, ruled YES with three conditions 8:55 PM). Order kept: (7), (6) + (8),
(5); (4) waits on BUILD-18's row; the look (1)-(3) handed over below (EXACT NEXT STEP). BUILD-18 had every sha and data name the
moment each landed.

## 1. Done-items, each with its evidence
| Item | Commit | What | Proof |
|---|---|---|---|
| (7) the quiet line sees a chase | 57d5b344 | tools/inspect/beats.ts findBeats counts a LAID chase (stage.chase: a pressure beat on each stretch every 1.5 s, as the hand-built proto.chase) and each stage.rolling hazard where it meets him (rolling.ts rollMeetX: a nut 'h', a fruit 'Z'). listRules.ts quietOf/quietJudge judge the roll AS PLAYED: the ONE new listed.ts playFinish(row, st, d) (World 1's finish, then the row's kit finish), which Play (stageGenerator.ts) now calls too; seedlist.ts, libstage.ts, yield.ts --list pass it. | PLANTED tools/engine/seedlist.test.ts "the quiet line sees a laid chase" (fixture seed 2 read 10.8 s of nothing inside its first stretch; red without the beats half and without the judge half, each run in a scratch worktree). rolling.test.ts holds rollMeetX to the real engine at 30 fps (nut met 12-14 px from it, inside 19; fruit 1496 vs drop 1500). All 6 proven lists --check PASS unchanged (1-1 162, 1-2 100, 1-3 100, 1-4 100, 1-5 150, 1-7 100). |
| (7b) the search's judge gets the roll as laid | 05acb456 | BUILD-18 8:34 PM: every 1-8 roll threw "finish: the stage lays no chase": pipeline.ts's length loop asked BuildRequest.also of each candidate BEFORE layChase. Now pipeline.ts asLaid hands the judge a COPY with its chase (and, since (6), its hazards) laid: the stage and its sections' pieces cloned together, so layChase cuts the copy's own platforms; the search keeps its own build, laid once. | PLANTED src/game/gen2/chaseLay.test.ts "the caller's judge is handed every chase roll as laid" (2 of 3 rolls had no chase before); the cut is the same with and without a judge. No listed stage has chase nodes, so no shipped roll moves. |
| (8a) runnerLip at the take-off's height | 05acb456 | runnerLiana.ts runnerLip: of the ground ends in reach, the HIGHEST, then the nearest. The nearest end at any height took a soft gap's stair step under 1-8 K2's lip ("200 px of run to its lip", every Normal roll). | PLANTED runnerLiana.test.ts (a pit step under the gap; a log lying on the lip's end is the take-off). |
| (6) chase pieces in gen2 | 81c4a582 | 'roll' socket role {roll: low/high, on, t} (gen2/types.ts), filled by the pipeline, laid after the chase and before the verdicts in all three paths (buildGen2Stage, Easy's Normal build, the judge's copy: pipeline.ts layChaseStage -> gen2/rollLay.ts rollsOf), pace/arc from WorldManifest.rolls (World 1: w1Cast.ts W1_ROLL; optional `apart` per setting). Every fault a roll error by name. With no roll socket on the stage and a look: by the chase's own ground (rollLay.ts layRolling, the fixture's rule lifted unchanged). gen2/chaseTip.ts layTip(st, look) (W1_TIP) and readyStillFork(st, fork, look) for ANY fork. The fixture now calls them (its own copies deleted). | PLANTED src/game/gen2/rollLay.test.ts (sockets laid where placed at the world's pace, faults named, the judge sees them; no look refused by name; by-ground default) and chaseTipLay.test.ts (layTip both looks; readyStillFork on fork 1). The fixture's hazards identical old vs new (kind, x, teach) on seeds 1-6 both settings. |
| (8a') liana checks split | 81c4a582 | runnerLiana.ts lianaProblems (a lip, a catchable moment) split from runnerProblems (+ the run): layTip asks the one its look needs and filters nothing. | chaseTipLay.test.ts: a runner tip with a short run refused by name, nothing laid; a plain one laid. |
| (8b) the still fork's post window | e6c097ba | stillFork.ts layStillFork moves a fork flag that stands where its post must (the window is 14 px for World 1's moss): to postX + flagClear, on the fork before the next crack, inside ROLLED_FLAGS max/min of its neighbours (StillForkStage.spawnX optional), else refused by name with nothing moved; the post is sought every 2 px, not 20. | PLANTED stillFork.test.ts (the move; no room; the span). The old refusal case was the rule the lead changed. |
| (5) Easy: no heart from a nut or fruit | af3eeb6c | rolling.ts rollTeaches(spec, chase, easy): on Easy always a bump, any stage, whatever the spec says; rollingPiece passes its setting. | PLANTED on the real engine, rolling.test.ts (Easy after the crack and with teach: false: no heart, a bump; Normal after the crack: a heart). |
| (1) show first | c32cdb2d | reference/qa-reports/ENG-CL/mock/mock-bough-sheet.jpg (a COMPOSITE of BUILD-18's real frame, README there). The lead ruled YES with three conditions. | the sheet |

Gates on the head: see section 8 (filled from the run's own output).

## 2. Polish check
- B6's two stills (normal-fork-sideways-passOver.jpg x~340, normal-tip-sideways-slow.jpg f145): the seam and the dozen-tile fall are
  still there: the look was not built (section 5).
- The mock-up sheet: judged both ways; first pass had the valley's top edge cutting across his feet and Dot's box dragging a soil
  rectangle; redone with the valley under the bough only and the box left out (named in its README).
- No game screen changed in this box except what the planted tests assert (the rolling hazards, the tip, the still fork, on the dev
  fixture and toys). The fixture's tip liana is now a PLAIN liana (below).

## 3. Pushback (with evidence)
- The packet says helpRoomBreaches gets the row's finish "via listed.ts FINISH". It does not: tools/engine/seedlist.ts passes it
  w1Finish only for squirrel rows, so 1-4's and 1-7's room for help is judged before finish14/finish17 (and 1-2/1-3/1-5's without
  w1Finish). Left as it is: changing it can refuse listed seeds. Ready packet in section 4.
- The fixture's tip runner liana never had a runner's run: with ENG-B6's regex filter gone, every seed reports 243-562 px of level run
  to the lip (1,188 needed): 1-1's ground steps 47-51 px every ~200 px and carries hop rocks (diagnosed seed 1: x 25195-26268). The
  filter hid a true line. The fixture now lays a plain liana, said in its code; a runner tip is 1-8's, on its own long level run.
- (1)'s gentle rise is BUILD-18's geometry (the bricks' heights); the draw follows the walkable top and cannot add rise.
- The long-branch sheet has no underside piece (chaseSeg's bottom edge is straight and hard): condition (a) needs a painted piece.

## 4. Suggestions (ready packets)
- HELP-FINISH: tools/engine/seedlist.ts `finish` (for helpRoomBreaches) := (st) => playFinish(row, st, d) per setting, as the quiet
  judge now uses; run every list's --check; any refused seed is a real room-for-help fault on the stage as played. Files: seedlist.ts,
  yield.ts. Done: all lists --check, a planted test on a 1-4 seed whose finish14 fields change its rises.
- BOUGH-UNDERSIDE (Hugging Face; the lead 8:57 PM: a fresh look member runs the job and the build): one long seamless bough section,
  tiling left-right, about 1.2x Pokey's drawn height thick (about 107 px of world at his 89.1), a mossed walkable top (the moss line a
  straight row the walkable top sits on, as chaseSeg's `top`), a rounded, shaded bark underside that fades to transparent at its
  bottom, in World 1's painted style (Matt's long-branch sheet props3-atlas.webp as the style reference); plus a matching knot/collar
  for (2), sized to the bough. Logged in reference/art/HF-SPEND.md, entered in the inventory at scale.

## 5. Unresolved, named plainly
- (1)-(3) the look: NOT built. EXACT NEXT STEP:
  1. Data: `WorldManifest.ground?: 'bough'` (gen2/types.ts); the pipeline copies it onto the stage (`GeneratedStage.ground`), set by
     BUILD-18's kitLib18 and by buildChaseFixtureStage's kit (the fixture shoots it).
  2. Draw: src/game/protoArt.ts drawGround (the bank loop at :1074, baked into the ground chunks, drawGroundChunks :1241): on a bough
     stage skip the soil, the pit shade and drawBankArt; draw each bank as the bough along its top (the painted bough section from
     BOUGH-UNDERSIDE; until it lands, chaseSeg at k = 107/100, every other one mirrored: drawChaseSection's maths, protoArt.ts:204),
     its moss line on the walkable top; a free end (no bank meeting it at its height) as chaseBrokenL/R at the bough's thickness (the
     lead's (b): never a square notch); a soft code-drawn shade under the bough fading into the mist (a small touch, STAGE-RULES §4).
     Module state like `kitWorld`: a setter called where the stage starts.
  3. Below the bough: the backdrop's own lower part now shows (its painted ground strip in w1rain-far.webp's bottom ~20%). Check it
     sideways and upright at the deepest camera; if the strip shows, the backdrop pass needs the valley/mist band under the ground
     line (the mock used w1rain-far's band at 45-78% of its height under a mist that thickens downward).
  4. (c) the hanging moss / epiphytes under the bough: dressing rows by inventory id for ENG-DR's piece (src/game/art/inventory.ts;
     grep its moss and epiphyte rows), named in the stage data, not drawn here.
  5. (2) the join knot where two banks of different heights meet (Hugging Face, cap $3, reference/methods/hf-art.md, logged in
     reference/art/HF-SPEND.md, sized to the bough, in the inventory at scale). (3) the collapse in 3-5 large pieces: pieces/chasePiece.ts
     :268 groups debris per run of sections (chaseDebris / chaseBrokenL/R at the group's size); the tip's fall the same way.
  6. Proof: real engine stills at the seam (B6 passOver x~340) and f145, upright 412x915 and sideways 915x412, both settings, to the
     lead FIRST (the lead's 8:55 ruling); drawcheck with a fall on screen; the full gates; the lock (only chase/bough stages move).
- (4) the dead hand-built 1-8 (protoStage.ts buildLongBranch :6165, the engine's ChasePlan path): waits until BUILD-18's 1-8 row is
  on a branch with this one (today only on t-build-18). Then: delete both, grep `proto.chase`/`ChasePlan`/`BRANCH_TILE` users
  (chaseLay.test.ts imports BRANCH_TILE; findBeats reads proto.chase), the lock shows only 1-8.

## 6. Method used, lessons applied, method update
- Method: reference/methods/stage-piece.md (a piece by data, planted test first), seed-list.md (the list's judge), gates.md.
- Lessons applied: D19 (the judge calls Play's own finish: playFinish is the one definition); "test the measuring tool" (rollMeetX
  held to the real engine before findBeats trusts it); "prove a change is needed" (the fixture's 10.8 s before the fix); D21 (the
  judge's copy, Easy's Normal build and the stage all lay the chase and hazards the same way); D16 (no rock carrying dressing is
  cleared); D55 (context % in every message); D57 (the queue read at every push: the lead's (8) and BUILD-18's throw both landed
  mid-task); Law 22 (no rule bent to pass: the fixture's hiding filter removed and the plain liana named; changed tests only where
  the lead's ruling changed the rule: the still fork's flag case, Easy's heart).
- Method update (proposed for stage-piece.md): "A lay that refuses by name never filters its own checker's lines; a fixture that
  cannot meet a rule says so in its own data (a plain liana), it does not regex the line away." And for seed-list.md: "A list judge
  (BuildRequest.also) is handed the roll as Play gets it: the finish (playFinish) and, on a chase stage, the chase and hazards laid
  (pipeline.ts asLaid)."

## 7. Turnover
reference/handoffs/engine-core.md section 0CL (this branch's last commit).

## 8. Gates on the head (filled from the run)
PENDING at the time of writing; see the commit that fills this section.

## Learned (for the next engine member)
- When a builder says "every roll throws", read the pipeline's call order before the finish: the search's judge ran pre-chase.
- A fixture's regex filter on a checker's lines is a hidden defect; grep for `.filter((m) => !/` on problem lists before trusting a fixture.
