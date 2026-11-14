# B5 REPORT (ENG-B5, t-eng-b5 from t-eng-b4@956e33e0). Written 5:20 PM ET 11-14. Code head: see the last line (gates).
**a. ROLLING HAZARD, done.** rolling.ts (pure rules) + pieces/rollingPiece.ts (PIECE_KINDS after CHASE); data `GeneratedStage.rolling:
RollSpec[] {kind low|high, dropX, speed, bounce, teach?}`. Set off by HIS x (`rollAhead`, ~350-370 px at a full run); drop-in tell 0.8 s
(TELL_MIN 0.5; from up to 480 px, clamped under the HUD band), a thunk (playLand), 0.15 s+ of roll after it; seen 1.0 s+ (Easy 1.1) from
drop to him at a full run. Ground shadow (one baked ellipse, smaller/fainter with height). Teach (before the first crack, `rollTeaches`) =
a bump, no heart, no safe time; after the crack a heart via damagePlayer. Fruit arcs PHASED to him (`phasedPace`, re-asked in the air)
so a run, a walk, a stop under it all pass mid-arc over his DRAWN head (59 px Normal, 78 Easy on the page). Refused by name:
`rollProblems` (at start) and `rollGroundProblems` (the lay's: no gap, no hop rock in the run-in). Tests: src/game/rolling.test.ts
13/13 (the fruit's run/walk/stand were RED before phasing: "a walk: touched at 6.23 s", "Easy, standing: touched at 7.03 s"; a one-frame
tap clears a nut, measured window). Art: inventory only: the nut = dressnew-w1 w1NutPod's shell cut round; the fruit = M-10-d's own
cannonball fruit (the tree 1-8 stands at); baked once, one drawImage a frame. **Bots** (firsttimer.ts rollPlan): hop a closing nut
(held 2+ frames), thumb down under a fruit, both yield to a gap; tools/inspect/chaseBots.test.ts 9 pass + 1 todo (B4's child item);
PLANTED: `noRollRead` touched on 3/3 seeds, with the skill 0/3. Over 8 seeds the middle bot: 0 touches, reached the fork on all.
**b. CHASE CAMERA LEAD, done.** cameraFollow.ts chaseSpan/chaseBack + engine.ts updateCamera: over the stage's chase span (from data) his
middle sits so the farthest set-off shows (10-30% across). src/game/chaseCamera.test.ts 4/4, real engine + real camera: nut seen before
it reaches him, Normal/Easy: 390x844 1.03/1.07 s, 412x915 1.00/1.03, 844x390 1.03/1.13, 915x412 1.03/1.13; 360x800 1.00; **320x782
0.90 s (named, under the 1 s)**. PLANTED: plain framing 0.83 s at 390x844. Found + fixed: the span was cached per stage object, so a
chase laid anew on the same stage kept a stale span (test red on the old engine).
**c. QA FIXTURE ROUTE, done.** `?fixture=chase` / `__play('1-98')`, dev builds only (chaseFixtureStage.ts; null elsewhere, tested):
chaseLay.test's fixture (one shared definition now) + w1Finish + hazards laid on unbroken runs. Found + fixed: 1-1's config laid over
the build put the pit line above his ground (he fell at spawn; planted check). The fixture clears bare hop rocks inside a hazard's
run-in (never one carrying dressing or a creature). **drawcheck on the fixture: PASS upright and sideways** (run.mjs '1-98' + drawcheck's
own judge, DRAWCHECK_RESULTS). Its 4 spots pin him on platforms: the hazards are mostly waiting there (say so: the chase sections are
what it counted).
**Clips (D63/D69), 8, both ways, both settings, on the real page** (reference/qa-reports/B5/shots/, sheet-upright.jpg, sheet-sideways.jpg,
per-frame state in *.json): nut: set off f10 (f8 Easy), thunk f35, HOP f37 (f38 Easy, the real touch flick), past f46: no touch.
Fruit: thunk f35, OVER his head f46 (59 px Normal, 78 px Easy), past f52: no touch, chase running. Camera: him 12-13% across upright
(385 px ahead seen), 31% sideways (828 px).
**e. CONTRAST (numbers for the next lead; B2's bar, not loosened): the baked C4 edge FAILS on all 4 backdrops both ways at full warning**
(reference/qa-reports/B5/contrast.txt): upright A dE 5-7, B 2; sideways A 11-13, B 5-6; inside the glow G 8-14. It reads warm, not
grey: in G da +5..+9, db +4..+10, dC +1..+9; the "smoke" is 1-2 upright: dL -2.1 with dC +0.9 (darker, little colour). Cause: with
the chase lead the break sits at or past the screen's edge, so half the disc is off screen (B2 measured C4 with the front 40% across).
**Polish check:** stills/clips both ways (sheets above). Rough, named: (1) the nut is the nut-pod shell cut round: reads as a cracked
nut, its moss patches odd; (2) the fruit's shadow is faint at phone size; (3) at 13% across upright Dot flies at the screen's edge;
(4) the C4 edge too weak under the lead (e). Painted palm nut + cannonball fruit (NEW 3) and the edge are the lead's calls.
**Pushback:** (1) the packet's camera "1 s tell fits upright" cannot hold on a 320 px phone (368 px of world): 0.90 s; Easy's extra time
is in pace and spacing, not sight line (ROLL_EASY: B5's numbers, the Designer may tune). (2) "a no-heart bump before the crack":
built as data (`teach`, else by the first crack); after the crack a nut is a heart: the Designer should confirm.
**What a 1-8 builder can lay NOW:** beats 1-2 (teach nut + fruit: `rolling` with teach) YES; 3, 5, 7 K stretches with nuts and fruit
YES (lay each on a plain run: `rollGroundProblems` must be empty; one threat at a time, 1.5 s+ = 430 px+ at a run); 11 L with both
heights YES; camera lead YES (automatic from data). Still NO: the phased liana (NEW 4), the still fork's eagle (NEW 7), the tip (NEW 8),
a gen2 `h` letter lay (rolling is laid by data by the builder).
**Suggestions (ready packets):** (s1) CONTENT/LEAD: painted palm nut + cannonball fruit (HF, sized 0.34/0.47 of 89.1), swap CUT.
(s2) ENGINE: the C4 edge under the chase lead: centre the disc on screen at the edge (or size by the gap), re-run B5/contrast.mjs to the
bar. (s3) CRITIC: add '1-98' to limits.json scenarios (run.mjs already accepts it) so CI's drawcheck plays a laid chase with hazards.
(s4) DESIGNER: confirm after-crack nut = a heart, ROLL_EASY, and 320 px phones at 0.90 s.
**Method update (stage-piece.md):** a clip tool presses jump with input.triggerTouchUp/releaseTouchUp (D69); his x is his MIDDLE, y his
FEET; a hazard's lay check takes the platforms (rocks), not only the spec. **Learned:** a camera change moves every screen-anchored
draw (the edge): re-measure them with the new framing; cache keys must include the data a harness can swap.
**Lessons applied:** D6, D16, D19, D23/D36, D40, D57, D59, D62, D63, D64, D66, D67, D69; law 22 (the fruit fixed at its phasing, no test
loosened; Easy's landing-at-his-feet fixed at the tell, not the test). **Turnover:** engine-core.md 0w + 0v (fe0aa1a0... see git log).
