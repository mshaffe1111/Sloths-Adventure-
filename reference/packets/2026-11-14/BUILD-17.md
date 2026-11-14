# BUILD-17: build 1-7 "A Very Good Bush" (R-165.204) for Matt's link. Opus 5.5 high (content; a level builder). Written 11:52 AM ET 11-14.
Branch t-build-17 from origin/t-eng-e2@1f66e7a9 (ENG-E2 GREEN on code b4a697c9: moss carpet/patch/hanging, letter m, the perched eagle,
bots still in cover; it carries ENG-E1's eagle and t-art-678b). READ FIRST, IN ORDER: reference/methods/level.md (Building rules),
LEVEL-BAR.md, STAGE-RULES.md, DIFFICULTY.md, the design reference/design/1-7.md on origin/t-1718-design (Normal 5.5, Easy ~3, 221 s,
petals, node string), ENG-E1 + ENG-E2 REPORTs (what lays), and how 1-6 was built (t-build-16: w1Arc16, BUILD-16/16b REPORTs, LEVEL-LOG).
## Step 0: ENG-E2's two redos (its REPORT "REDO" section has the exact steps), before any level work (D40)
1. Perched eagle clear of the HUD by >= 24 px both ways: SNAG_PERCH (sweepPose.ts) and W17.snagB.perch (w17Art.ts) together (try 90);
   captions print eagle top vs the HUD sign's DOM bottom. ENGINE LINES: list file:line in REPORT for the xhigh integrator.
2. Hanging-moss still with him actually hanging (player.hanging true, Dot's box dismissed) and the mossy liana (isVineSwinging true),
   both orientations. A still proves only what you can see in it (D69).
## Build
w1Arc17 (World 1 data, no engine lines): the beats of 1-7.md, Easy rows, flags/hearts by Matt's rules (typed from STAGE-RULES, D49),
Dot's lines from KEEPER-17 (the lead forwards them verbatim; leave a placeholder key until then, never your own words), petals on the
walked path from the start (BUILD-16b's lesson: no petal arcs over gaps), the goal sealed by StageSpec.gathers if the merge with 1-6's
seal has landed (else say so). Meter: score.ts targets N 5.5, E ~3 (R-165.239: the meter double-counts lianas; name it, never pad).
Then addlevel (relist + bots both settings, 0 rescues; a bot that can't do a fair move gets fixed first, never listed around), the WHOLE
suite on your final head, planted faults, stills upright + sideways Normal + Easy of every beat, CLIPS of the bush teach, bare bark, the
creaky limb, the mossy-liana twist and the perched eagle (name the frame where each action happens, D69; tools/inspect/clip.mjs from
t-int-8-clip if you need jumps). Full CLAUDE.md Checks (buildcheck ALONE). Polish check per still; "Learned" + proposed rule changes.
No until/sleep wait loops (D67); background limits long enough for addlevel. BOX: 90 minutes or 40% context (400k of 1M by the real figure).
Lead: session_01FhBbYNzGRJBDMzn6XbtQK2.
