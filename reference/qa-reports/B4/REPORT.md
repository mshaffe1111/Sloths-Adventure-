# B4 REPORT (ENG-B4, t-eng-b4 from t-eng-b3@71da15cd, session_01FhBbYMtNC2e3rUp1iijkHV). Written GATES_TIME ET. Code head ab3960b9.
**Done 1, the split by the realised run-up** (18925c11): stretches and flags are walked together (chaseLay.ts): a stretch runs on while the
flag before its crack, where it really stands, reaches a flag after it; past that it splits at a route piece that flag reaches. Floor
`chaseFloor()` = ceil(behind x maxRun / base) = 645 px (Normal row: shorter, nothing falls under him); a split never leaves a shorter
rest. The first crack may set off at the end of one of the K's own route pieces (a rolled flag ~1,000 px before it left no spot); the
600 px flagBefore is now honoured exactly (B3 searched 760). The last fork's flag is chosen by rolledFlagBreaches itself (D19); the
rolled pass's span fill runs again after the chase. **CHASE-FINISH:** L after the last K is the `last` stretch (final burst); none without.
**Two roots found and fixed in pipeline.ts:** applyVerdicts kept a stale flagMiss from the search's pre-lay judgement (refused 2/30
rolls whose flags passed); Easy judged Normal's PRE-lay build. **Yield** (tools/engine/chaseYield.ts, 30 W1 rolls of `A T P F R K R K R
S E`, stage 8): **Normal 30/30, Easy 30/30** (start of task 16/19; B3 15/23). Stretches 822-3,780 px, 2.3 a stage. Tests: chaseLay.test.ts
10/10, 4 of them red on B3's code. **Lock 102/102 unchanged** vs 71da15cd (lockall --layouts 16, on bc9d11b2: every build change).
**Done 2, the lay check** (9cd6ddc6): `chaseStanders`: dressing (proto.dress/decor/w3decor/kitDecor) with its foot on a falling
section, or a creature walking a patch over one, refuses the lay by name (D16); planted test; 0 on all 30 W1 rolls. Pit floors under a
stretch stay (the ruling's option 2); in play a pit on a stretch is a fall (a heart), mechanically sound; their look is not in my clips
(the bare branch has no pits): judge on the first real K stage.
**Done 3, the edge C4** (bc9d11b2, ab3960b9, FINAL_HEAD): pieces/chasePiece.ts `edgeCanvas`: an ember disc (radius 0.46 of the screen's short
side) centred ON the break (or the trailing edge when it is off screen) at his feet, a squat dark core on the branch line; baked ONCE per screen size, ONE drawImage a
frame at alpha 0.8 x k, re-baked on a turn or canvasLost (D6). Test: no gradient a frame, one drawImage, alpha by gap, bakes 1/2/3.
**Done 4 (grep first, D66):** NOT in src/game: any rolling hazard (the nut and fruit), a camera lead for a LAID chase (engine.ts:6175
leads only the old 1-8). Not built (box; Suggestions a, b). **Found + fixed:** a chase catch (a heart) floated "3 lives left" (clip f90):
respawnAtCheckpoint(lifeNote) false from chaseCaught; planted test (chasePiece.test.ts, red without).
**Done 5, bots first (rule 21)** (0f21f0aa): engine.ts guideView.chase is on while he is on a laid stretch; the tier bots keep the thumb
down and stand at an edge only if it fits the front's stop budget (firsttimer.ts chaseRoom). tools/inspect/chaseBots.test.ts, in CI
(gates.yml tool tests): CHILD/MIDDLE/EXPERT Normal + MIDDLE Easy, 3 seeds each: **caught 0** everywhere; middle and expert reach the
fork on every seed. PLANTED: a 2.8 s stopper is caught without the skill (5 catches), never with it. **OPEN (todo, visible):** the child
reaches the fork on 1 of 3 seeds: every miss a FALL at a 120 px gap (aim up to 232 px early), never a catch. tierBots 7/0 (1-1 unmoved).
**Done 6, clips** (shots/, B2's lead-passed world: a bare branch on 1-2's page, B2's front-framed camera): 8 clips, both settings, both
orientations: `edge` (front closes, the ember grows at the break, he runs at 60 px and pulls away) and `caught` (heart, flag, whole).
Named frames (D69), Normal: crack f0 (edge on at once, k 0.24), edge full f50 (147 px), first section falls f55, runs f64, pulled away
200 px+ f164; caught f66 = 2.2 s = Normal's stop budget, the put-back fade, hp 5 -> 4, back at the flag and the branch whole by f90.
Easy: CLIP_EASY. Stills per key frame beside each clip; sheets sheet-*.jpg.
**Gates on ab3960b9** (scoped, LAWS 5): GATES_LINE
**Polish check:** first look cut a hard full-height seam at the break (B2's "laser"): re-baked centred on the break; then a tall dark
core read as a smoky pillar: made squat on the branch line; sideways, sized by the long side, the ember filled the whole height and
turned the sky orange: now sized by the SHORT side (same size against him both ways). Caught clip: "3 lives left" after a heart: fixed.
**Rough, named:** the ember is faint at k < 0.5 on this light backdrop (contrast.mjs on 1-2/2-1/3-1/3-9 NOT run: box); dark-backdrop
worlds not shot; clips use the shooter's camera, not a chase camera (none exists for a laid chase).
**Pushback:** (1) drawcheck on a chase fixture (c) cannot be done: drawcheck plays only stages the page can load, and a gen2 fixture
exists only in tests (withTestStage); it waits for w1Arc08 or a QA fixture route (Suggestion c). (2) the nut, fruit and camera lead
are an M and an S build each plus HF art: not in a 2 h box after 1-3 and 5-6 (D40 order kept).
**Suggestions (ready packets):** (a) ROLLING HAZARD (1-8.md NEW 2): pieces/rollingPiece.ts by data `{kind: low|high, dropX, speed,
bounce}`, set off by his x, drop-in tell 0.5 s+, thunk, ground shadow, no-heart bump before the crack; bots read it (chaseBots extends:
hop low, stay under high); planted tests; art via Content. (b) CHASE CAMERA LEAD (NEW 5): engine.ts camera target on a laid stretch
from data (stretchAt), the lead sized so a 1 s tell fits upright; measure with shoot.mjs both ways. (c) QA FIXTURE ROUTE: `?fixture=chase`
in dev builds only builds 1-98 (chaseLay.test's fixture) so drawcheck and clips run a real laid K before w1Arc08. (d) DESIGNER: the
child tier in stride on Normal (todo above): narrower stretch gaps or accept. (e) contrast.mjs pass on the edge, 4 backdrops.
**Unresolved:** suggestions a-c, e; the child todo; R-165.207 buildcheck (BUILDCHECK_LINE).
**Method used:** stage-piece.md 1-6, stage-fix.md (planted first), gates.md. **Lessons applied:** D6, D16, D19, D23/D36 (worktrees,
ls-remote), D40, D43 (generality PASS), D57, D59, D63, D64, D66, D67 (no wait loops), D69, law 22 (the yield's "some refused" assert
was a defect's pin, replaced by a yield floor; the child's crossing is a todo, never loosened).
**Method update (stage-piece.md, proposed):** step 5: shoot in a worktree of its own with its own Vite (a src edit reloads the page:
my 6th clip crashed); a key frame is computed from the state at THAT frame, never the loop's final flags (my first pulledAway was f1).
**Learned:** check verdict state is judged afresh before trusting a refusal (2 refusals were stale); a test asserting refusals exist
pins a defect; a bot calibrated where falls are soft must be re-read where a fall is a heart. **Turnover:** engine-core.md 0v (ab3960b9).
