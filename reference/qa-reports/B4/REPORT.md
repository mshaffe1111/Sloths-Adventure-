# B4 REPORT (ENG-B4, t-eng-b4 from t-eng-b3@71da15cd, session_01FhBbYMtNC2e3rUp1iijkHV). Written 4:01 PM ET. Code head e53d0452.
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
stretch stay (option 2): in play a fall (a heart); their LOOK is not in my clips (no pits on the bare branch): judge on the first K stage.
**Done 3, the edge C4** (bc9d11b2..e53d0452): chasePiece.ts `edgeCanvas`: an ember disc (0.46 of the short side) centred ON the break (or
the trailing edge) at his feet, a squat dark core on the branch line; baked ONCE per screen size, ONE drawImage a frame at alpha 0.8 x k,
re-baked on a turn or canvasLost (D6). Test: no gradient a frame, one drawImage, alpha by gap, bakes 1/2/3.
**Done 4 (grep first, D66):** NOT in src/game: a rolling hazard (nut, fruit); a laid chase's camera lead (engine.ts:6175: old 1-8 only).
**Found + fixed:** a catch (a heart) floated "3 lives left" (clip f90): chaseCaught passes lifeNote false; planted test, red without.
**Done 5, bots first (rule 21)** (0f21f0aa): engine.ts guideView.chase is on while he is on a laid stretch; the tier bots keep the thumb
down and stand at an edge only if it fits the front's stop budget (firsttimer.ts chaseRoom). tools/inspect/chaseBots.test.ts, in CI
(gates.yml tool tests): CHILD/MIDDLE/EXPERT Normal + MIDDLE Easy, 3 seeds each: **caught 0** everywhere; middle and expert reach the
fork on every seed. PLANTED: a 2.8 s stopper is caught without the skill (5 catches), never with it. **OPEN (todo, visible):** the child
reaches the fork on 1 of 3 seeds: every miss a FALL at a 120 px gap (aim up to 232 px early), never a catch. tierBots 7/0 (1-1 unmoved).
**Done 6, clips** (shots/: 8 mp4 + sheets, of e53d0452, B2's lead-passed bare branch on 1-2's page and camera), both settings and ways:
`edge` (front closes, the ember grows at the break, he runs at 60 px and pulls away), `caught` (heart, flag, whole).
Named frames (D69), Normal: crack f0 (edge on at once, k 0.24), edge full f50 (147 px), first section falls f55, runs f64, pulled away
200 px+ f164; caught f66 = 2.2 s = Normal's stop budget, the put-back fade, hp 5 -> 4, back at the flag and the branch whole by f90.
Easy: edge full f81, first fall f89, runs f99, away f140; caught f104 = 3.47 s = Easy's budget. No lives note (sheet-caught-after.jpg).
**Gates** (scoped, LAWS 5; e53d0452 differs from ab3960b9 by one constant, the edge's radius): unit FULL on ab3960b9 3,417 tests,
3,415 pass / 0 fail / 2 todo (pre-existing), 38 min; on e53d0452 tsc 0 + chase tests 35/0. Build (BASE_PATH) 0, chunkcheck PASS, artcheck
PASS, drawcheck PASS 674 s (ab3960b9; no scenario lays a chase: Pushback 1), **buildcheck PASS alone** (p95 Normal 129 ms, Easy 113 ms),
seed lists 5/5 --check PASS (257/100/100/100/150), registrycheck PASS, tierBots 7/0, tool tests (CI line incl. chaseBots) 79/0/1 todo,
lockall 102/102 unchanged (bc9d11b2, after the last build change), generality PASS, knowncheck PASS, roadmapcheck PASS (unshallowed).
NOT run (scoped: no menu, pop-up or survey touched): clipcheck, kbdcheck. The integrator runs the full set.
**Polish check:** first look cut a hard full-height seam at the break (B2's "laser"): re-baked centred on the break; then a tall dark
core read as a smoky pillar: made squat on the branch line; sideways, sized by the long side, the ember filled the whole height and
turned the sky orange: now sized by the SHORT side (same size against him both ways). Caught clip: "3 lives left" after a heart: fixed.
**Rough, named:** the ember is faint at k < 0.5; contrast.mjs NOT run; dark backdrops not shot; the shooter's camera (no chase camera).
**Pushback:** (1) drawcheck on a fixture (c): drawcheck plays only stages the page loads; a gen2 fixture lives only in tests: waits for
w1Arc08 or Suggestion c. (2) nut/fruit (M + HF art) and camera lead (S): not in a 2 h box after 1-3, 5-6 (D40 order kept).
**Suggestions (ready packets):** (a) ROLLING HAZARD (1-8.md NEW 2): pieces/rollingPiece.ts by data `{kind: low|high, dropX, speed,
bounce}`, set off by his x, drop-in tell 0.5 s+, thunk, ground shadow, no-heart bump before the crack; bots read it (chaseBots extends:
hop low, stay under high); planted tests; art via Content. (b) CHASE CAMERA LEAD (NEW 5): engine.ts camera target on a laid stretch
from data (stretchAt), the lead sized so a 1 s tell fits upright; measure with shoot.mjs both ways. (c) QA FIXTURE ROUTE: `?fixture=chase`
in dev builds only builds 1-98 (chaseLay.test's fixture) so drawcheck and clips run a real laid K before w1Arc08. (d) DESIGNER QUESTION:
the child tier in stride on Normal reaches the fork on 1 of 3 seeds (falls at 120 px gaps, 0 catches): narrower stretch gaps, or accept? (e) contrast.mjs pass on the edge, 4 backdrops.
**Unresolved:** suggestions a-c, e; the child todo; R-165.207 (buildcheck PASS alone here; one run does not fix its flake).
**What a 1-8 builder can lay NOW, beat by beat (1-8.md arc):** 0 Arrive, 13 Exit: yes (plain nodes). 1-2 the safe nut and fruit: NO
(no hazard: Suggestion a). 3, 5, 7 K stretches: YES (lay, split, flags, edge, bots, caught = heart + flag + whole); 5's mushroom, double,
creaky limb need their own pieces inside a K section (not tried on a stretch); 5's phased liana: NO. 9 the still fork: the fork holds the
front (yes); the eagle's post and pass: NO (1-7's). 11 L: YES as the `last` stretch (final burst) once World 1's pool has finale
sections (it has none). 12 the tip: NO (slow motion exists, the whole-branch fall does not). Camera lead on a stretch: NO.
**EXACT NEXT STEP:** 1. Suggestion a (rolling nut + fruit piece, bots read it) and b (camera lead), both before w1Arc08 (D40, rule 21).
2. The Designer rules on (d). 3. Suggestion c, then drawcheck + clips on a real laid K; contrast.mjs (e) on 4 backdrops.
**Method:** stage-piece.md 1-6, stage-fix.md, gates.md. **Lessons:** D6, D16, D19, D23/D36, D40, D43, D57, D59, D63, D64, D66, D67, D69,
law 22 (B3's "some refused" assert pinned a defect: replaced by a yield floor; the child's crossing is a todo, never loosened).
**Method update (stage-piece.md step 5, proposed):** shoot from a worktree with its own Vite (a src edit crashed my 6th clip); compute a
key frame from the state at THAT frame (my first pulledAway read the loop's final flag: f1). **Learned:** a refusal can be a stale
verdict; a bot tuned where falls are soft must be re-read where a fall is a heart. **Turnover:** engine-core.md 0v rewritten (344fef72).
