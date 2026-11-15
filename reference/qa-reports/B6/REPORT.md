# B6 REPORT (ENG-B6, t-eng-b6 from t-int-9@1c7f6b95 + t-eng-b5@c0599609). DRAFT: gates on the final head pending.
**Step 1 (merge), DONE 6:49 PM ET:** merge 3261dd4b. t-int-9's history roots in an ORPHAN commit (f1b72ec7 = HOOKS 994ea4e7 + ENG-S1..S5,
no parent): git saw 2 merge bases and 52 conflicts. Every B5-changed file (179) re-merged against the true base 994ea4e7: 173 equal that
clean 3-way exactly (46 false conflicts = files B5 never touched); the 6 real ones were the packet's six, both lines kept (chase lead +
1-7 cover/watcher + swing camera; PIECE_KINDS RIDE, VINE_SNAKE, CHASE, ROLLING; gates.yml = t-int-9's list + chaseBots). Proof on
3261dd4b: tsc 0; WHOLE suite 3,570 tests, 3,568 pass, 0 fail, 2 todo (the old boulder-wall pair); lock 102/102 UNCHANGED vs t-int-9;
chaseBots 9 + 1 todo; tierBots 7/7 (reference/qa-reports/B6/step1/).
**a. NEW 7 THE STILL FORK, done (a LAY on the kit, no new piece: D66):** gen2/stillFork.ts `layStillFork(stage, fork, look, world)`,
World 1's look w1Cast.ts W1_STILL_FORK (the moss carpet 346 px + the perched harpy eagle via eagleOver). The living fork already holds
the collapse and a new crack already sets off as he leaves (chase.ts, B1). The lay puts the moss 60 px past where the collapse stops, ONE
eagle on its post within 420 px of the moss (him and it on one upright screen) clear of the fork's flag, its zone ~871 px from the fork's
edge (its warn at Easy's longest x his top run + sight + 60), facing -1 (its eye crosses TOWARD him: running on is running into it), and
ONE pass: kit Post.passes / Enemy.kitPasses (spent: cool Infinity, rests on its post, after a respawn too; never "cleared", which would
have counted a beaten eagle in enemiesDefeated and its kill stat). Refused by name: short fork, broken ground, a rock in the cover, the
last stretch, a stretch already watched, a flag where the post must stand. Tests: gen2/stillFork.test.ts 7/7 ("the kit: ... one pass",
"the lay ...", "the lay refuses by name ...", "real engine, Normal: ... the warn shows 2 s before the eye starts across", "... running on
... dived on ...; stopping in the moss ... never", "PLANTED: ... facing 1 ... untouched", "Easy: ... harmless"). PLANTED: the one-pass test
RED on the base kit (reference/qa-reports/B6/planted.txt). **Bot**: tools/inspect/chaseBots.test.ts "chase bots at the still fork" MIDDLE,
EXPERT, MIDDLE Easy x 3 seeds: onto the fork at a full run (>= 250 px/s), still in the moss through the pass, 0 hearts, runs on, the next
crack sets off with him (RunOptions.knows ['hide']: 1-7 taught it); PLANTED: without the hide, dived on 3/3, with it 0/3.
**b. NEW 4 THE RUNNER LIANA, done:** runnerLiana.ts + pieces/runnerLianaPiece.ts, data `Vine.runner`. Solved once with the engine's own
air + catch: the swing moment a full-run jump off its lip catches best (3 take-offs x 3 holds); eased toward it at his top-run arrival,
at most 0.12 of a swing a second, ONLY while he runs at it (>= 0.85 of his top run): a phase eased for a run that is not coming made the
middle bot WORSE than the plain swing until that rule. Never while held or past the lip; a respawn puts it back. PieceHost.vineClock
added. Tests: runnerLiana.test.ts 6/6: real engine Normal AND Easy, a runner catches it in stride from 12/12 starting moments, never slower
than 0.9 of his top run, no frame moves it more than its own swing x 1.34; PLANTED (piece off the hook): plain swing caught at a run from
5/12. **Bot**: chaseBots "the runner liana: the EXPERT STRIDER" 6/6 moments: never stands at the lip, caught within 1 s of take-off,
reaches the far bank; PLANTED (piece off): stood 0.27, 0, 2.17, 1.70, 1.20, 0.73 s, phased 0 at all six. OPEN (todo, numbers in the test):
the MIDDLE strider still stands at some moments: his own approach stops him ~200 px before a lip, the run ends, the liana keeps its plain
swing (as promised: a run). A bot run-read I added proved unneeded on the expert (0 waits with or without): reverted (LESSONS "prove a
change is needed").
**c. NEW 8 THE TIP, done:** `ChaseStretch.tip` (last stretch only, chaseLayProblems). The chase piece marks that stretch's last section
chaseTip (Matt's long-branch sheet's tip frame, props3-atlas#chaseTip in the inventory); off the ground past its far end, every section of
the stretch still standing breaks at once, the tip tumbles WHOLE, one big crack, PieceHost.slowMo(0.55 s) (the engine's own slow motion,
the old 1-8's number). Tests: chaseTip.test.ts 4/4 ("... as he leaves it on the liana the whole stretch falls at once, in slow motion",
"PLANTED: with no tip ...", "holds while he stands on it; a respawn ...", "the lay refuses a tip ..."); RED on the base chase piece (2 of
4, planted.txt). **Bot**: the tip asks nothing new of a player (he swings off as from any liana): proven by the runner-liana toy and the
clips; named, no new skill.
**Easy's chase gap (the lead's ruling), CHASE_LAY.easyGap:** PENDING (see below).
**Clips (D63/D69), on ?fixture=chase, the real page, B5's method** (reference/qa-reports/B6/shots/, *.json per frame; shoot.mjs; the
fixture lays all three by data: chaseFixtureStage.ts layFixturePieces). FORK, Normal: screech f84 (he steps onto the fork), hidden f112,
eye starts across f144 (2.0 s), eye over him f211 (the eagle blinks: its gaze on him hidden), pass over f226, the next crack with him
f355, 0 hearts, upright and sideways. Easy: screech f80, eye starts f158 (2.6 s), over him f237, pass over f255, crack f389. TIP, Normal:
press f124 (the real touch flick), off the tip f128 = the branch end falls (19/19), caught f129, slow motion 17 frames, let go f177,
landed f198, 0 hearts, upright and sideways. Easy: PENDING.
