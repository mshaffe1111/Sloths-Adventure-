# B1 CHASE-CORE REPORT (ENGINE-678 W1), t-b1-chase from t-hooks@994ea4e7. ENG-B1, session_01FhBbYJmReosZL5eiBmSTK3. Written 11:47 PM ET (WIP: gates still running).
**Done 1, the chase as a general piece:** chase.ts `ChaseLay` (stretches `{start,end,last?}`; a LIVING FORK between one's end and the next's
start) + `ChaseRun` (one front per stretch: waits, cracks behind him, stops at its fork) + `CHASE_ROWS` (Normal = CHASE unchanged; Easy base
170 / max 200 / cap min(200, PHYS.maxRun) / no final burst / behind 600 / hold 2.2: stop budget 3.4 s vs 2.2 s). pieces/chasePiece.ts on the
hook: breaks `chase` sections its front passes (debris), draws whole/cracking sections ('world') and the trailing-edge tint ('screen');
caught on a stretch or 300 px under the branch = a heart and the flag; respawn rebuilds every section from its front. Lead-approved asks
(a)-(d): PIECE_KINDS line; `GeneratedStage.chase`; `PieceHurt.toFlag` + engine.ts:2908 -> chaseCaught() (rule: chase.ts:5-7, Matt 10-24);
a chase section drawn only by its chase drawer (engine.ts:1061 draw list, protoArt.ts paintedPlatforms).
**Done 2, general by data:** no stage id/seed/x in the piece (generality 0); proven on 1-2 and 2-1 (and toFlag on 1-2, 3-3). Old 1-8 keeps
its own engine collapse (proto.chase) and starts no piece (tested). chase.test.ts 14/14 (pure: rows, Easy cap at every gap, forks stop and
never catch, stop budget exact to one step, restart at a fork/in a stretch, lay problems named). chasePiece.test.ts 18/18 through RealPlay
(runner in stride never caught both settings, Easy front measured <= 200 px/s in play, stop = caught at the budget +/- 2 steps -> hp-1, not
a life, at the flag, branch whole; 20 s on a fork never caught; a fall off = heart + flag; bad lay refused). Planted red: without the
piece 13/16, without toFlag 2/2, without each draw line 2/2.
**Done 3, gates** (gates/RESULTS.txt, run.sh in its own worktree on 17dc0fbe): tsc, build, chunkcheck, artcheck, knowncheck, generality, roadmap, kbdcheck 0; the rest (unit x3, seedlists, registry, tooltests, tierBots, lockall vs f9671e3b, drawcheck, clipcheck, buildcheck) RUNNING at 11:47 PM: this line is rewritten when the run ends.
**Polish check: FAIL (the lead, 11:46 PM, D61).** stills/ (crack/close/fork x Normal/Easy x upright/sideways on 1-2 and 2-1, setting printed):
(1) the front is 150-547 px behind him and OFF frame in every still: no crack opening, no section mid-collapse, no fork seen both ways,
and no clip; (2) 2-1-normal-fork-upright's teal water box, cut bank and floating grass are MY scene, not the chase: the piece draws only
chasePiece.ts:140-152 (sections, debris) and :169 (tint); stills.mjs:46 swapped 2-1's platforms but kept its river/waterY (RealPlay.bare
clears them, realPlay.ts:333) and the plain fork solid is painted as ground by the World 2 kit: no 2-1 defect, no R-id; (3) the trailing
tint (old 1-8's numbers, rgba(70,18,8) at 0.55) is faint on dark backdrops: a fail. Also: 1-2-easy-close-sideways shows Dot's held line.
**Left (B5/B6, named in engine-core.md 0u):** Dot's "breaking behind us" line, camera shake and music danger (old path only), the chase
camera, liana phase, the tip, per-world collapse look; B5's lay must call chaseLayProblems and add an in-play draw-list check.
**Pushback:** the Easy row's numbers are mine from the design's two limits; DESIGNER should rule them with bots (B7). The engine draw-list
line is pinned by its text until a stage lays a chase at its start.
**Method used:** stage-piece.md 1-6. **Lessons applied:** D19 (the test drives the same engine path: RealPlay + real respawn), D23/D36
(own worktree, ls-remote = HEAD), D30 (times from date), D37 (lives: r.died stays false, real loseLife stubbed), D40 (old 1-8 not touched),
D43 (generality), D57 (queue read at each push), D59 (gates waited for).
**Method update (proposed for stage-piece.md):** step 4: a piece that needs a new hook power asks the lead before coding and plants a
probe test for it (toFlag); step 5: a still script must tap Dot's held lines and frame the piece (stills.mjs), and print the built setting.
**Learned:** read the hook's hurt path against the design's penalty first (heart+knock is not heart+flag); a test's numbers come from the
code's own start point (the front sets off from start - behind); check the engine's draw lists for any platform a piece draws itself.
**EXACT NEXT STEP:** 1. stills.mjs scene: clear waterY/rivers/zones as realPlay.ts:333 does; tap Dot's line before EVERY shot; frame by the
front, not him: camera.x = front - 0.25*vw with him placed <= 0.55*vw ahead (Normal: stand at start+10, shoot at 1.9-2.0 s = a section
breaking 0.1 s earlier, front ~90 px behind; Easy: 3.0-3.1 s). Fork both ways: front preset 300 px short of the fork, him on the fork,
camera centred on the fork's near edge at 1.4 s (Normal) / 1.9 s (Easy). 2. A webm clip each way (Playwright recordVideo, 6 s): the front
closes to ~60 px, he runs off (pad right) and pulls away. 3. Tint that reads on every backdrop: a light-to-dark edge (dark core + a warm
1-2 px rim, alpha up to ~0.75) sized by gap; measure contrast on 1-2, 2-1 and a dark World 3 backdrop in the stills. 4. Lead pass/fail,
then B5 CHASE-LAY (gen2/chaseLay.ts fills GeneratedStage.chase, refuses by chaseLayProblems, in-play draw-list check), B6 (chase camera,
liana phase, tip). Merge t-b1-chase before B5.
