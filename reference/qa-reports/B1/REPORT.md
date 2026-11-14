# B1 CHASE-CORE REPORT (ENGINE-678 W1), t-b1-chase from t-hooks@994ea4e7, ENG-B1 session_01FhBbYJmReosZL5eiBmSTK3. Written 11:49 PM ET (WIP: gates running).
**Done 1, the piece:** chase.ts `ChaseLay` (stretches `{start,end,last?}`, a LIVING FORK between one's end and the next's start) + `ChaseRun` (one front
per stretch: waits, cracks behind him, stops at its fork) + `CHASE_ROWS` (Normal = CHASE unchanged; Easy 170/200, cap min(200, PHYS.maxRun), no burst,
600 back, hold 2.2: stop budget 3.4 s vs 2.2 s). pieces/chasePiece.ts: breaks `chase` sections its front passes (debris), draws sections ('world') and
the edge tint ('screen'); caught on a stretch or 300 px under the branch = a heart + the flag; respawn rebuilds each section from its front. Lead-OK
asks: PIECE_KINDS line; `GeneratedStage.chase`; `PieceHurt.toFlag` -> engine.ts:2908 chaseCaught() (rule chase.ts:5-7, Matt 10-24); a chase section
drawn only by its chase drawer (engine.ts:1061 draw list, protoArt.ts paintedPlatforms).
**Done 2, general by data:** no stage id/seed/x (generality 0); proven on 1-2 and 2-1 (toFlag on 1-2, 3-3); old 1-8 keeps its engine collapse and
starts no piece. chase.test.ts 14/14 (rows, Easy cap at every gap, forks stop and never catch, stop budget to one step, restarts, lay problems named);
chasePiece.test.ts 18/18 via RealPlay (stride never caught both settings; Easy front <= 200 px/s in play; stop = caught at budget +/- 2 steps, hp-1,
not a life, at the flag, branch whole; 20 s on a fork safe; fall off = heart + flag; bad lay refused). Planted red: no piece 13/16, no toFlag 2/2, each draw line 2/2.
**Done 3, gates** (gates/RESULTS.txt, own worktree on 17dc0fbe): tsc, build, chunkcheck, artcheck, knowncheck, generality, roadmap, kbdcheck 0; unit x3, seedlists, registry, tooltests, tierBots, lockall vs f9671e3b, drawcheck, clipcheck, buildcheck RUNNING at 11:48 PM (line rewritten at the end).
**Polish check: FAIL (lead 11:46 PM, D61).** stills/: (1) the front is OFF frame in every still (150-547 px behind): no crack opening, no section
mid-collapse, no fork both ways, no clip. (2) 2-1-normal-fork-upright's water box, cut bank and grass strip are MY scene, not the chase (the piece draws
only chasePiece.ts:140-152 and :169): stills.mjs:46 kept 2-1's river under swapped platforms; no 2-1 defect. (3) The edge tint (old 1-8's rgba(70,18,8)
at 0.55) is faint on dark backdrops. Also 1-2-easy-close-sideways shows Dot's held line.
**Left for B5/B6 (engine-core.md 0u):** Dot's "breaking behind us" line, shake, music danger, chase camera, liana phase, tip, per-world look.
**Pushback:** the Easy numbers are mine from the design's two limits: DESIGNER to rule with bots (B7). The draw-list line is pinned by text until B5 lays one.
**Method:** stage-piece.md 1-6. **Lessons:** D19, D23/D36, D30, D37 (r.died false), D40, D43, D57, D59. **Method update:** stage-piece.md step 4: a
new hook power is asked for before coding and gets a probe test (toFlag); step 5: stills from a real laid stage or a bare world, framed on the piece.
**Learned:** stills come from a real laid stage or a RealPlay.bare world, never a hand-mixed scene, with the thing built IN frame (frame by the piece,
not by him); check the hook's hurt path against the design's penalty first; a test's numbers start where the code starts (start - behind); check
the engine's draw lists for any platform a piece draws itself.
**EXACT NEXT STEP:** 1. NEVER a hand-mixed scene (lead 11:47 PM): shoot from a real laid stage or a RealPlay.bare-equivalent world (realPlay.ts:328-340
clears zones, waterY, rivers); tap Dot's line before every shot. 2. Frame by the front: camera.x = front - 0.25*vw, him <= 0.55*vw ahead. Normal: stand at
start+10, shoot at 1.9-2.0 s (a section broke 0.1 s before, front ~90 px behind); Easy 3.0-3.1 s. Fork both ways: front preset 300 px short, him on
the fork, camera on the fork's near edge at 1.4 s (Normal) / 1.9 s (Easy). 3. A 6 s webm each way (recordVideo): the front closes to ~60 px, he runs
off and pulls away. 4. A tint that reads on every backdrop (dark core + warm rim, alpha to ~0.75, by gap), contrast measured on 1-2, 2-1 and a dark
World 3 backdrop. 5. Lead pass/fail; merge t-b1-chase before B5 CHASE-LAY (fills GeneratedStage.chase, refuses by chaseLayProblems, in-play draw check).
