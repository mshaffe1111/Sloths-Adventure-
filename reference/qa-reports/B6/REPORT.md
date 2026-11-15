# B6 REPORT (ENG-B6, t-eng-b6 = t-int-9@1c7f6b95 + t-eng-b5@c0599609, then 1-8's last engine pieces). Code head: see Gates. Written 7:20 PM ET 11-14.
**Step 1, merge, DONE 6:49 PM (lead ACCEPTED 6:53):** merge 3261dd4b. t-int-9's history roots in an ORPHAN commit (f1b72ec7 = HOOKS 994ea4e7 +
ENG-S1..S5 squashed, no parent): git saw 2 merge bases, 52 conflicts. All 179 B5-changed files re-merged against the TRUE base 994ea4e7
(`git merge-file`): 173 equal that clean 3-way exactly (46 false conflicts = files B5 never touched); the 6 real ones = the packet's six,
both lines kept. Proof on 3261dd4b: tsc 0; WHOLE suite 3,570 tests / 3,568 pass / 0 fail / 2 todo; lock 102/102 unchanged vs t-int-9;
chaseBots 9 + 1 todo; tierBots 7/7 (B6/step1/).
**a. NEW 7 THE STILL FORK, done, a LAY on the kit (D66: no new eagle):** gen2/stillFork.ts layStillFork(stage, fork, look, world) + World 1's
W1_STILL_FORK (w1Cast.ts). The living fork already holds the collapse and cracks anew as he leaves (B1). The lay: moss carpet 60 px past
the stop; ONE perched eagle within 420 px of it (one upright screen), clear of the fork's flag; zone ~871 px (warn at Easy's longest x his
run + sight + 60) so a runner meets the eye; facing -1 (it crosses TOWARD him); ONE pass (Post.passes / Enemy.kitPasses: spent = rests on
its post for good, never "cleared", which would have counted a beaten eagle). Refused by name: short fork, broken ground, rock in the cover,
last stretch, already watched, flag on the post spot. Tests gen2/stillFork.test.ts 7/7 ("the kit: ... one pass", "the lay ...", "refuses
by name ...", "real engine, Normal: ... warn shows 2 s ...", "running on ... dived on; stopping in the moss ... never", "PLANTED: ... facing 1
...", "Easy: ... harmless"); one-pass test RED on the base kit (planted.txt). Bot: chaseBots "chase bots at the still fork" MIDDLE, EXPERT,
MIDDLE Easy x3 seeds: on at a full run, still in the moss through the pass, 0 hearts, runs on as the next crack sets off; PLANTED no hide:
dived on 3/3. RunOptions.knows ['hide'] (1-7 taught it).
**b. NEW 4 THE RUNNER LIANA, done:** runnerLiana.ts + pieces/runnerLianaPiece.ts, `Vine.runner`. Solved once by the engine's own air +
catch (3 take-offs x 3 holds); its phase eased toward that moment at his top-run arrival, at most 0.12 swing/s, ONLY while he runs at it
(>= 0.85 top run), never held or past the lip; respawn restores it. Tests runnerLiana.test.ts 6/6: Normal AND Easy, caught in stride from
12/12 starting moments, no frame over its own swing x 1.34; PLANTED piece off: 5/12. Bots: chaseBots "the runner liana" MIDDLE, EXPERT,
MIDDLE Easy striders 6/6 moments: never stand at the lip, caught < 1 s after take-off, far bank. PLANTED piece off: stood up to 2.17 s.
**Lead push-back (6:53) RESOLVED, traced:** the MIDDLE stop 195 px before the lip was its open-ground steering rhythm (gapQ lift to t 11.09 s),
off only on a laid chase; and under it a general bug: lianaWait judged a hop with a 0.2 s hold while the tier's press is drawn 22-231 ms.
Fixed for EVERY stage (firsttimer.ts): runnerAhead keeps the thumb down near a runner liana's lip (PLANTED noRunnerHold: stood 1.60/1.10/
0.40/0.27/0.13/0 s, with it 0); a liana hop is held at least as judged (RED before: moment 4/6 never caught; after 6/6). castBots + pitClimb
19/19 after. A bot "run read" I tried first proved unneeded: reverted.
**c. NEW 8 THE TIP, done:** `ChaseStretch.tip` (last stretch only). The piece marks its last section chaseTip (props3-atlas#chaseTip, in the
inventory); off the ground past its end, every section still standing breaks at once, the tip tumbles WHOLE, one crack,
PieceHost.slowMo(0.55 s) (the engine's own; the old 1-8's number). **Lead's 7:24 FAIL fixed at the camera, any stage with a tip:** upright
the chase lead (him 10-30% across) and the landing framing kept the fall off-screen left, and the slow motion pushed the zoom in 1.3x.
Now: the run in keeps the chase lead (he sees the liana); once he is off the ground at the tip the view leans BACK (cameraFollow.ts
TIP_VIEW: him 86% across as its target, the landing framing waiting, until 330 px past the tip; the target leads the eased camera's lag);
the branch end breaks TIP.delay 0.5 s after he swings off, so the view has turned first; a piece's slow motion no longer zooms in (the
giant's hit and old 1-8 keep it). chaseTip.test.ts 8/8: as it falls the WHOLE tip + 200 px+ of branch are in view at 412x915, 915x412,
360x800 (real engine, real camera); PLANTED lean off: upright loses the tip; RED on the base chase piece (2/4 of the first four). Two traps
the camera tests caught: the tip timer restarted when his swing carried him back over the tip, and a 24 px "tip" sliver passed trivially.
**Easy's chase gap (ruling 6:10 PM), done:** CHASE_LAY.easyGap = 50 px, MEASURED: the Easy CHILD clears 40/50 px on 3/3; 60-140 px each drop
seed 1. layChase refuses a wider stretch gap on Easy by name (chaseEasyGap.test 2/2, Normal the plant); chaseBots toy at 50 + plant at 60.
**Clips (D63/D69), ?fixture=chase, real page** (B6/shots/: 8 mp4 + named key-frame stills + per-frame *.json; B6/shoot.mjs; the fixture lays
all three by data, layFixturePieces). FORK Normal (up+side): screech f84 as he steps on, hidden f112, eye starts f144 (2.0 s), eye over him
f211 (the eagle blinks: gaze on him hidden), pass over f226, next crack f355, 0 hearts. Easy: f80/f104/f158 (2.6 s)/f237/f255/f389. TIP
(reshot after the camera fix) Normal: press f124 (real touch flick), caught f129, the branch end falls f144 = **the frame where the fall
shows: normal-tip-upright-slow.jpg / -sideways-slow.jpg f145** (the broken halves and the tumbling tip lower left, him on the liana right),
slow 17 frames, let go f177, landed f198; Easy: press f120, caught f122, falls f139, slow f140, let go f177, landed f197; 0 hearts in all 8.
**Polish check:** looked at screech, hidden, eyeOverHim, passOver, slow, landed, both ways. Fixed: upright the eagle was OFF screen while its
eye crossed him (post 512 px past the moss): postMax 420 rule, reshot. Rough, named: (1) upright he sits at the screen's left edge on the
fork (chase lead 10%), the 1-1 squirrel overlapping; (2) upright the falling branch end is off the left edge (the lead looks ahead) and the
slow motion also zooms in 1.3x; sideways it reads well; (3) the moss carpet shows a seam between its two strips; (4) 1-1's Pokey line stays
up through every fixture clip (the fixture plays under 1-1's row; the shooter's hide did not take); (5) the fixture's far landing is a
plain earth bank, not a tree. (6) **NAMED, not fixed (lead's item 2): the seam where a chase section meets fork ground** (fork sideways
passOver f226, x~340): a straight vertical cut, the log's texture against World 1's grass lip and dirt. NOT the fixture's own join: chaseLay
cuts every K node's ground into the long-branch log sections and leaves forks as kit ground, so 1-8 will show it at EVERY stretch/fork
join. Not patched in code: the only painted pieces at hand are moss mounds and carpets, which since 1-7 mean "hide here" (misleading); the
fix is art or design. READY PACKET (Content + Engine): either draw a chase stage's forks as the same branch (chaseSeg on fork ground: the
fork IS part of the Long Branch, 1-8.md "a great living fork"), or paint a join piece (a knot / branch collar, ~89.1 px scale, HF) laid by
the chase piece at each chase-to-ground join; the engine side is a draw call at each join (pieces/chasePiece.ts).
**Pushback:** (1) Easy ruling: at 50 px Easy chase stretches are nearly gapless; Designer to confirm (built as ruled). (2) "NODE-KEY rows
Now": these are DATA on the K lay (a fork lay, a stretch mark, a vine mark), not letters: K's row now names all three + Easy's gap, `s`'s
phase dial reads runner BUILT; `s` and `L` stay Later (their letter emitters do not exist). (3) Interface adds for the Architect:
PieceHost.vineClock + slowMo, Post.passes/Enemy.kitPasses, Vine.runner, ChaseStretch.tip, RunOptions.knows, noRunnerHold.
**ENGINE-WORTHY:** (E1) a horizontal camera focus (PieceHost.focus is vertical only): the tip now has its own rule (TIP_VIEW); the still fork upright still has him at the screen's edge.
(E2) slow motion lives in the frame loop, not update(): no RealPlay test can see it. (E3) drawcheck pins him standing: the tip's burst
(<= ~13 debris drawImage for 1.8 s) is unmeasured: add '1-98' with a tip moment (B5 s3). (E4) bot RNG is salted by profile NAME.
**Learned:** a squashed orphan root makes every later merge lie: merge per file against the true base and verify auto-merges too. A bot
toy measuring "never stands" measures the testers unless it uses a strider. The decision a bot makes must use the numbers its act uses.
**Method update (proposed, LAWS 4):** methods/integrate: add the true-base check (`git merge-base --all`; >1 base -> merge-file per file).
level.md rule 21: the toy's bot profile must name which calibrated habits it removes and why.
**EXACT NEXT STEP for BUILD-18 (1-8):** after the chase lays, in w1Arc08's finish: layStillFork(stage, forkIdx, W1_STILL_FORK, 1) on beat 9's
fork (flat, unbroken >= 466 px, no rock in the moss, its flag >= 90 px off the post: refused by name otherwise); mark the chase liana(s)
`runner: true` (runnerProblems = []: >= 1,188 px of run to the lip); set the last stretch `tip: true` with a gap, a runner liana and a
landing after it (layFixturePieces is the worked example: 444 px gap, liana 214 px out, 380 up); on Easy keep stretch gaps <= 50 px; bots:
RunOptions.knows ['hide']; Dot's lines from the keeper. Not ready: painted nut/fruit (B5 s1), the C4 edge under the lead (B5 s2), E1.
**Gates on 1a1303ff (LAWS 5, src changed):** PENDING (runner reference/qa-reports/B6/final/).
**Lessons applied:** D19 (decision = act), D23/D36 (frozen worktrees), D30 (times from date), D40, D43 (no stage id), D55 (context %),
D57 (queue at every push), D63/D69, D66, D67, "prove a change is needed; revert what isn't", law 22 (no test loosened).
**Turnover:** reference/handoffs/engine-core.md section 0B6 + 0v's built line (this commit).
