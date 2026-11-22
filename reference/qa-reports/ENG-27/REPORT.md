# ENG-27t REPORT (start 8:31 PM ET by `date`; box 8:59 PM ET; base t-eng-27-wip-27s 7501bf2fb; the strict hold on t-eng-27-wip-27t: plant cc66545df, fix bf92d3daf, the D121 check 7559289ca (D117), NOT on t-eng-27)
## EXACT NEXT STEP (ENG-27u, read only this section, D90)
**THE LEAD'S RULINGS IN MY BOX (verbatim in substance; they come first):** (1) YES: rewrite src/game/gen2/pacerLay.test.ts:71's respawn
clause to the ruled rule: first-pass margin less DOWN_SECS, then the eased hold; RED on Option A's code, GREEN on ours (new replaces old).
(2) The ease is ACCEPTED (per-frame numbers 6.76 px peak vs 4.86 at pace, 1.39x; and the clip: the respawn's 228 px re-placement falls
inside the iris's black frames). One more check across the grid: the re-placement ALWAYS lands inside the iris, never with the view live;
an assert in pacerRespawn if cheap. Then on to E. **So ENG-27u: (a) pacerLay :71 rewrite (plant on Option A's code, e.g. 16698b8a1's
piece); (b) the iris assert in pacerRespawn (on the respawn frame, the screen is in the iris: read the engine's iris/fade state there, every
race-leg respawn on the grid); (c) the full suite on the result; then E, D's judge, the table below.**
  (b)'s pointers (read, not built): the iris is engine.ts `irisOpen` (:913, private), set to IRIS_OPEN_SECS 0.45 s (:242) at the respawn
  (:6210) and run down by dt (:1780); drawIris (:5809) closes on him while `down` (k from DOWN_SECS*0.3) and opens over 0.45 s, the hole
  of radius full*(1 - smoothstep(k)) centred on him. The assert: on the frame the boat is re-placed (pacerRespawn's `wasDown && !e.down`),
  the boat's box on screen lies OUTSIDE that hole (or k = 1), every race-leg respawn on the grid.
**The lead's question (one line):** the black band down the right edge of the clips is NOT notch emulation (the clip sets no insets) and
NOT the game's inset (probe on the dev page: the canvas fills the whole 915x412 and 412x915, the camera's view covers the canvas, no
safe-area variable set): most likely the camera showing past the toy's painted backdrop at the out-and-back's far end, the platforms' art
drawn past it below. UNVERIFIED: the toy world's width was not read (my probe's field came back empty); check `stage.width` vs camera.x +
view on a shot before calling it.
**Done since the first rows:** pacerRespawn now also proves the boat's PLACE pays (D121, 7559289ca on t-eng-27-wip-27t): while it owes,
its clock + owed grows by exactly a frame's dt, and the owed drains within the ease's named length. GREEN on frozen 7559289ca (2 of 2).
The plant for it (an ease that never drains, a detached commit on 7559289ca): RED, as it must be (8202e11b3, a detached commit, not pushed: the eased() guard returns 0; t/grid-RED-drainplant-8202e11b3.txt):
  home and post both fail, 52 breaches 'the boat still owed ... past the ease's length' (home middle Normal 5 0.84 s, Easy 2 0.28, Easy 5
  0.65, Easy 6 0.06, ride Easy 5 0.50, ...). GREEN on 7559289ca (t/grid-GREEN-7559289ca.txt). The check bites.
**(1) THE STRICT HOLD IS BUILT AND GREEN on the grid; the lead rules its rows. Then (2) E, (3) D's judge, (4) the table, as ENG-27t's
packet wrote them (unchanged, none started: box).**
- **Before (2), finish (1)'s two open checks:** (i) THE CLIP (D63) of the ease: the recording is made (tools/inspect/cliprec27t.ts on
  bf92d3daf: post, middle, Normal, seed 6, the +0.68 paying fall; the ease from run frame 3498 to 3585, 193 frames with 60 before and 45
  after); film it on the dev page (`?fixture=home` is POST_CODE at the asked seed: `npx vite --port 5199` on a frozen bf92d3daf tree, then
  `PW=/opt/node-tools/node_modules/playwright/index.js node reference/qa-reports/ENG-27/t/clip27t.mjs 5199 <rec.json> <out> upright 6`
  and `sideways 6`), LOOK at both at game speed: the boat on screen while it eases; no visible jump or lurch. FILMED in my box (t/ease-upright.mp4, t/ease-sideways.mp4, stills t/sheet-*.jpg, on frozen bf92d3daf's dev page, the recording from a6bb1ef05, the same piece): the boat in view in 86 of 97 upright shots; in the recording its move per frame is 4.86 px at its pace and peaks at 6.76 px (1.39x) on the ease, a smooth rise and fall; the one big move (228 px) is the RESPAWN's re-placement (the first-pass rewind, db4f97f81: clock 43.43 -> 41.89 as the down ends), with the boat out of view in that shot. I looked at the stills, not the clip played at speed: WATCH both at game speed and judge 'no visible jump or lurch' (D63) before the lead rules.
  (ii) the full suite on bf92d3daf (D114; pacerLay alone already run on it: the same ten reds as the base, no change): the base suite on 7501bf2fb ran in my container (tsc PASS; unit still running at hand-over, 10 not ok so far: pacerLay's known 9 (the race bots: 1504, 1506, 1508, 1510, 1514, 1516-1519) AND A TENTH, NEW: src/game/gen2/pacerLay.test.ts:71 'on a respawn keeps exactly the margin he had when he fell' (`the respawn keeps his 2.04 s`): it pins Option A, which db4f97f81 replaced (the lead's ruling); new replaces old: rewrite its respawn clause to the ruled rule (first-pass margin less DOWN_SECS, the hold eased) as a planted test, the lead's call since it is a unit test outside pacerRespawn); the suite on the fix is NOT run.
- **Then (2) E toy-first** (RED on D', GREEN on E: a toy where a short drawn single would fall short of the 72 px gap and the smallest aimed
  hop that lands 50 px past it is pressed), **(3)** trace Easy 2 x 15087 on D' and Normal 2 x 15982 on D (a predicted fall that came down
  safe) and fix the judge, hopJudged 4/4 GREEN, **(4)** the table on the 7 rows (E beside A b7a68a8bd and D'), pacerLay and pacerRespawn on
  E; then the race call goes to the lead. No race retune before it.
- **Where E goes (read on bf92d3daf, not built):** the race gate is tools/inspect/firsttimer.ts:3122-3140 (`SKILLS.floatSure && raceLegal`):
  today `h = this.aim.at(dir, t, (d) => this.drawHop(d))` (D': ONE drawn hop held, 1115 WaitAim) and `gateSees(q, ..., h, ..., RACE_MARGIN)` on
  the far bank (24) or the next logs (RACE_MARGIN, :708). E replaces the drawn aim AT THIS GATE ONLY (the packet: 'the decision picks'):
  candidates = the tier's calibrated kinds x their nominal holds (drawHop's own tables, firsttimer.ts:4193, without the noise), smallest
  first; the first whose AIMED flight `gateLands(q, at, x, y, dir, cand, t, vx, margin, v2)` (:1136, no thumb arg) lands -> press it now;
  `this.gateHop` = that candidate with the drawn hold spread and thumb noise applied at the press (what flies). None lands -> ride on.
  The toy (hopJudged.test.ts beside the held-aim toy): a 72 px gap, a candidate list [single 0.1 s (aimed lands 20 px short), single
  0.3 s (lands 60 px past), double ...]: D' (the held draw = the short single) never presses; E presses the 0.3 s single the first frame
  it lands with 50 px. RED on bf92d3daf (D'), GREEN on E.
## Done-items
- **(0) The suite on 7501bf2fb, frozen, in the background first:** started 8:33 PM ET on a frozen 7501bf2fb tree (s/suite-7501.log in my container): npm ci and tsc PASS; unit at hand-over: 10 not ok, the known nine plus pacerLay.test.ts:71 (above). Its later gates did not finish in my box.
- **(1) The strict hold (the lead's ruling (a)), src/game/pieces/pacerPiece.ts on bf92d3daf:** a respawn on the race leg (the first-pass
  rewind of db4f97f81 kept under it, unchanged: the clock from `first[k] - DOWN_SECS`) now also HOLDS the fall: its x (his x the frame
  before the life was lost) and his margin there. The first frame he STANDS at or past that x with a better margin, the excess is owed
  and eased off: the boat's clock runs ahead of dt on a raised cosine (`EASE_PEAK` 0.5: at most half again its own pace, never a step in
  its speed; `EASE_MIN` 1 s; length max(1, 2E/0.5) s, so 0.84 s takes 3.4 s). The verdict counts the excess still owed (if he docks
  mid-ease); a new fall mid-ease ends the ease (the respawn's clock re-places him) and holds the new fall. **The ease's length cites its
  reason** (D116, in the code): half again its pace reads as the boat pushing on, not jumping; the bound is checked per frame.
- **The plant, cc66545df (the test only, on 7501bf2fb's code): RED on exactly ENG-27s's seven** (t/grid-RED-cc66545df.txt): home middle
  Normal 5 x 7425 +0.84, Easy 2 x 10049 +0.33, Easy 5 x 4656 +0.69, Easy 6 x 3198 +0.10, ride Easy 5 x 7533 +0.50; post middle Normal 6
  x 10125 +0.68, expert Normal 1 x 10076 +0.73. **GREEN on the fix** (frozen a6bb1ef05, the same piece as bf92d3daf:
  t/grid-GREEN-a6bb1ef05.txt; and again on frozen bf92d3daf itself after the restack: t/grid-GREEN-bf92d3daf.txt, 2 of 2 ok): 89 race-leg falls judged, none pays; 830 frames of ease on the grid, no frame's boat move over
  1.5x its step, no verdict drops the excess.
- **What the test reads (pacerRespawn.test.ts):** his margin back at the fall's x against the boat's WHOLE clock (clock + the excess it
  owes); the ease's own checks (the boat's move per frame at most 1.5x its own step, a respawn's frame excepted; a verdict at least clock +
  owed). Its bound is its own named constant (0.5), not the piece's (a test that imports what it tests proves nothing); a piece with no
  `owed` (the base) reads 0, so the plant is RED there, not NaN-green (I caught that hole in my own first test before the plant).
- **Traced, two (rule 28):** (a) home middle Normal 5 x 7425 on 13bbf0d7a (t/trace-home-middle-n5-13bbf0d7a.txt): the hold fired, ONE
  FRAME LATE: he stood back at x 7425 on frame 3449 (margin -1.34 against -2.17 at the fall), the boat owed 0.84 from frame 3450. Why: the
  pieces step BEFORE he moves (engine.ts), so the piece reads where the last frame left him. (This fall was lives 1 -> 0 -> 3: the
  game-over restart; the hold holds through it.) (b) post expert Normal 1 x 10076 with a look-ahead by his last step (work tree,
  uncommitted, t/trace-post-expert-n1-lookahead.txt): it fired mid-jump OVER the x (grounded read from the frame before), margin 2.71 there,
  no excess; he landed past it at 3.75 (+0.73). So the look-ahead was wrong and the stale read is the EXACT one: the frame-start state is
  the previous frame's end, the very frame the test calls "back". The fix resolves the hold there; the test counts the owed from the frame
  after (clock + owed there, less one step). The boat starts the ease 33 ms after he stands there; the race verdict loses nothing.
## The rows (to the lead, rows first)
| check | 7501bf2fb (base) | cc66545df (plant, base code) | bf92d3daf / a6bb1ef05 (fix) |
|---|---|---|---|
| pacerRespawn home | RED 5 of 41 (ENG-27s) | RED 5 of 41 | GREEN 0 of 41; 299 ease frames |
| pacerRespawn post | RED 2 of 48 (ENG-27s) | RED 2 of 48 | GREEN 0 of 48; 531 ease frames |
| the ease's bound (move per frame vs 1.5x the boat's step) | (no ease) | (no ease) | 0 breaches; the clip's ease: base step 4.86 px, peak 6.76 px (1.39x) |
| verdict keeps the owed excess | (no ease) | (no ease) | 0 breaches |
## Polish check
- The ease, stills upright and sideways (t/sheet-upright.jpg, t/sheet-sideways.jpg): the boat on the water beside and past him, no snap in the stills; numbers above. ROUGH, named, not mine and not fixed: the fixture page draws a black band past the toy world's right edge in both orientations (the camera shows past the toy's end); Pokey draws over the boat where he stands on the log above it (the 'under' layer, the lead's ruling (a)). The clip is not yet watched at speed (above).
## Unresolved
- The clip (above) filmed, stills looked at, not watched at speed; the suite on the fix (pacerLay alone on frozen bf92d3daf: 9 pass, 10
  fail, the SAME ten as the base with the same error lines: the known nine and :71's Option A; t/pacerLay-bf92d3daf.txt; no change from the
  hold); (2), (3), (4).
- One interim grid ran on my WORK tree, not a frozen one (the look-ahead, uncommitted: 2 of 89 paid); its result only told me the look-ahead
  was wrong; every row above is from a frozen tree at a named hash (D115).
- **D119 repeated (mine):** a bare `git commit` after a python heredoc ran outside its && chain, in the main checkout, when the worktree add
  above it failed (the disk allowance was full): it had nothing to commit, no harm, but the countermeasure (one command per heredoc, or the
  whole chain in a script that stops on error) was not applied. I freed the disk by removing my finished worktrees (git worktree remove).
  A partial scratch folder fPl may remain in my scratchpad (not a worktree).
- I restacked my own t-eng-27-wip-27t (force-with-lease from 13bbf0d7a, mine alone) so the plant is its own commit on 7501bf2fb.
- **D121 on my own test (a proxy, named):** pacerRespawn reads the piece's `owed` (clock + owed is the race the verdict judges, and the
  verdict check proves the excess counts at the dock), but nothing yet proves the boat's PLACE pays it: a piece whose ease never drained
  `owed` would still pass (the race honest by the verdict, the boat on screen not). Add to pacerRespawn: after each ease, the boat's
  clock has advanced by its frames' dt plus the excess (owed back to 0) before the dock, or the verdict counts the rest. Not done (box).
- LESSONS read: the packet's list by headline (D63, D96, D102, D107, D109, D111-D121); not each in full (box). Applied: D96 (the
  suite script runs the five CI-only gates too), D121 (above), D111 (box), D113 (every long run in the
  background), D114/D118 (the base suite first), D115 (frozen trees; one breach named above), D117 (the candidate on wip), D120, D109,
  D112/D121 (the invariant named before the ease), D116 (the ease's reason in the code), D63 (the clip: filmed, stills looked at, not watched at speed).
## Method update (proposed, the lead rules)
- level.md / engine-core.md trap: **a piece steps BEFORE Pokey moves** (engine.ts): any piece rule keyed on "he is at x" sees the last
  frame's x, one frame late; a test reading the same frame's end must count what the piece does on the next frame, or the piece must not
  guess ahead (a look-ahead by his last step misreads a jump). Check: pacerRespawn's frame-after read.
- A plant that reads a new field must default it (`?? 0`), or the plant passes NaN-green on the base.
## Turnover note
- reference/handoffs/engine-core.md not rewritten (box); this section is the hand-over.

# ENG-27s REPORT (start 8:09 PM ET by `date`; box 8:37 PM ET; base t-eng-27 2d9359932, code 16698b8a1; D', two plants and the fall-pays fix candidate on t-eng-27-wip-27s 7501bf2fb (D117), NOT on t-eng-27)
## EXACT NEXT STEP (ENG-27t, read only this section, D90)
**FIRST, THE LEAD'S LATEST RULING (after my one traced fall), which overrides the fall-pays lines below where they differ: RULED (a), the
STRICT HOLD** ("a fall never pays"; a named residual would change the rule to get around the defect, law 22). When he reaches the fall's x
again with a margin better than the one he had at the fall, the boat makes up the excess EASED: never a snap; the ease is long enough
that no boat visibly jumps, judged on a clip at game speed (D63). **INVARIANT (D112, D121):** once the ease ends, his margin is never better
than at the fall; if he reaches the finish mid-ease, the excess still counts. **TEST:** the full grid (home and post, seeds 1-6, both settings,
middle, expert, ride-only: tools/inspect/pacerRespawn.test.ts on wip-27s 7501bf2fb, which already IS that grid), the 7 paying falls RED on
7501bf2fb (they are: s/grid-7501bf2fb.txt, s/fallpays-grid-RED-7501bf2fb.txt) and GREEN on the fix. **Keep the first-pass rewind under it**
(db4f97f81: no stretch credited twice). The test must also check the ease (no boat jump per frame over a bound you name, and the excess
counted at the finish). Build it on wip-27s from 7501bf2fb, the clip and the grid first, rows to the lead; then E and D's judge as ruled
below. Nothing on t-eng-27 but the REPORT.
**The lead's rulings (received in my box, for this step):** (1) fall-pays is an engine bug: on a respawn his margin is the one he had when he
FIRST passed the respawn point, less the time from the fall to his stand (the boat waits for no one); invariant (D112): back at a race-leg
fall's x his margin is never better than at the fall; pacerRespawn's at-the-stand test deleted (new replaces old); engine change on wip, rows
first. (2) The honest middle is NOT D': build **E**: the decision picks the SMALLEST hop from the tier's calibrated kinds and nominal holds
whose AIMED flight lands with RACE_MARGIN (firsttimer.ts:708, 50 px) on the far side; no noise, no thumbAt; he presses when that aimed hop
lands; the press flies the drawn hold spread and thumb noise; falls come only from the thumb. (3) D's judge must fly exactly what the engine
flies: trace and fix the q -2 rows that came down safe (D' Easy 2 x 15087 #14; D Normal 2 x 15982 #20, #19) in the same change. (4) Table E
beside A and D' on the 7 rows (finish, race, lives, falls per press), pacerLay and pacerRespawn; the lead then rules the race (boat pace or
the 72 px gap, river.ts:189-190, the lead's call). No race retune before it.
0. **(1) is BUILT on t-eng-27-wip-27s (candidate, NOT on t-eng-27):** db4f97f81 (pieces/pacerPiece.ts: `first[]`, his margin the first time
   he reached each 16 px of the leg; respawn() sets the clock from first[k] - DOWN_SECS and the boat runs on, no hold; DOWN_SECS moved from
   engine.ts to physics.ts so the piece can count the beat the clock holds through), 7501bf2fb (tools/inspect/pacerRespawn.test.ts: the old
   at-the-stand test replaced by the end-to-end invariant over its whole grid: home and post, seeds 1-6, both settings, middle, expert,
   ride-only). **Checked:** tsc PASS on db4f97f81; the table-row plant GREEN on db4f97f81 (was RED on e8c4d0153); home N1 falls now cost
   -0.34..-2.35 s (paid +0.56..+0.59). **The full grid on 7501bf2fb is RED: 7 of 89 race-leg falls still pay** (s/fallpays-grid-RED-
   7501bf2fb.txt): home middle Normal 5 x 7425 +0.84, Easy 2 x 10049 +0.33, Easy 5 x 4656 +0.69, Easy 6 x 3198 +0.10, ride Easy 5 x 7533
   +0.50; post middle Normal 6 x 10125 +0.68, expert Normal 1 x 10076 +0.73. **Trace two of them first (rule 28: seed, x, frame, what
   happened).** ONE traced (s/cross-e6-7501bf2fb.txt, probe s/cross-27s.mts.txt): home middle Easy 6 x 3198: first pass at the respawn
   x 3490 margin 5.77, at the fall 5.43 (the first crossing LOST 0.34 s to the boat); respawn 5.77 - 0.75 = 5.02; the second crossing of the
   292 px took 1.57 s and GAINED 0.52 s, back at x 3198 5.54 (+0.10). So his second crossing beat his first by 0.86 s, more than the 0.75 s
   beat: the first-pass margin is not enough wherever the first crossing was slow (what slowed it is not traced yet; the other six not traced).
   **The lead (after my grid RED): trace two of the seven first; the form of the fix waits on the cause.** Bring with the trace: every race-leg
   fall on the grid, its cost or gain, the mean and the worst gain, PER BOT (probe s/grid-27s.mts.txt; my run's output s/grid-7501bf2fb.txt
   if it finished in my box). If the cause is river timing on the second try (a log in reach that was not the first time), the lead rules
   between (a) a strict hold: back at the fall's x his margin is clamped to the one at the fall, the boat EASED over about a second, never
   snapped on screen; (b) the mechanics invariant (no stretch credited twice) plus a floor that every fall costs at least the beat, the
   residual named. Each names its invariant and test (D112, D121). The candidate stays on wip.
   **The per-bot grid on 7501bf2fb (MEASURED, s/grid-7501bf2fb.txt, every fall listed):** middle 38 falls, 5 pay, mean -1.12 s, worst gain
   +0.84, worst cost -6.10; expert 10, 1 pay, mean -0.98, worst gain +0.73, worst cost -1.89; ride-only 41, 1 pay, mean -1.54, worst gain
   +0.50, worst cost -5.82 (89 falls, 7 pay: the test's seven). Still to bring: the trace of a second paying fall (what slowed the first crossing). If so, the ruling's formula cannot keep the
   invariant by itself; the lead rules the form (D112: name the invariant before any cap). Then the suite on the fix (pacerLay was RED 9/19
   on the base and on D': name any change), and send the lead the rows (rows first).
1. Then (2) E with a plant first (a toy where a short drawn single would fall short of a 72 px gap and the smallest aimed hop that clears it
   with 50 px is pressed instead), and (3) the judge fix with hopJudged GREEN 4/4; then (4).
2. **The base suite 16698b8a1** ran in my container: tsc PASS; unit 1846 ok, 9 not ok when I handed over, all nine pacerLay's (the same 9 ENG-27p
   named on B); the rest dies with my container: RE-RUN (D114/D118).
## Done-items
- **(1) The lead's ruling built (t-eng-27-wip-27s, from D e75664cde):** one exported `WaitAim` (tools/inspect/firsttimer.ts, above gateLands)
  holds each gate's aim: `at(dir, t, draw)` draws (drawHop: the tier's kind and hold) ONCE when a wait begins, returns it unchanged until
  `end()` (pressed, or the target left reach: edgeWait's `lands` none, upstream's `next` none, edgeStand's bank-fallback press), a frame
  the gate is not reached (gap over 1.5 frames) or a turn. **Deleted:** the 0.5 s beat, its redraw and the floatBeat fields at edgeStand,
  edgeWait, upstream; refused with the target in reach he stands by choice holding the aim (edgeWait's 6 s fall-through came only on a
  beat-out frame, so it is gone too). The decision reads the aim only (D's gateLands); the press flies it with its drawn noise (D's flyThumb).
  **Plant 64134c343** (D's beat moved inside WaitAim; equal to D by reading, its redraw one frame sooner) + toy 'a wait holds its aim': **RED**
  ('he pressed a redrawn lucky hold at frame 15 (2 draws in one wait)', s/toy-RED-64134c343.txt); **D' 95702a42e GREEN**, D's no-foresight
  toy GREEN (s/toy-GREEN-95702a42e.txt); tsc PASS on D'.
- **hopJudged in full:** D' 5 pass 1 fail: Easy seed 2 'edgeWait q#-2 t 27.70 x 15087 double 0.320 | came down #14 drift' (a predicted fall
  that came down SAFE: a judge flight error); D e75664cde fails the same kind on Normal seed 2 (x 15982 twice, came down #20, #19). So it is
  D's judge() (the noisy draw's flight), not the held aim (s/hopJudged-*.txt). OPEN.
- **(2) The four-bot table** (frozen trees, middle; s/table-wt*.txt, probe s/table-27s.mts.txt; finish s | race won/lost, him vs boat s | lives
  lost; land/press | falls/press over judged presses at a float):
  | row | A b7a68a8bd | B 16698b8a1 | C b0c6dd586 | D' 95702a42e |
  |---|---|---|---|---|
  | home N1 (boat 93.9) | 175.1 W 85.4, 6 | 190.0 L 114.3, 1 | 246.3 L 108.4, 3 | 213.5 L 130.8, 4 |
  | home N2 (92.4) | 203.0 W 90.9, 6 | 215.8 L 122.9, 1 | 167.1 W 81.3, 1 | 276.2 L 119.4, 3 |
  | home N3 (92.1) | 189.5 W 89.7, 4 | 215.9 L 119.8, 4 | 203.8 L 93.0, 5 | 251.8 L 140.4, 1 |
  | home E1 (97.5) | 145.9 W 83.4, 3 | 189.3 L 117.3, 5 | 145.3 W 83.3, 0 | 158.3 L 102.3, 0 |
  | home E3 (96.1) | 149.7 W 83.1, 1 | 170.0 L 101.5, 2 | 146.3 W 82.8, 0 | 166.8 L 100.3, 0 |
  | post N4 (100.8) | 153.3 W 90.2, 1 | 183.6 L 127.8, 1 | 164.9 L 110.8, 0 | 184.0 L 126.2, 1 |
  | post N5 (103.4) | 172.9 W 96.9, 5 | 217.4 L 152.6, 1 | 186.1 L 118.2, 1 | 218.6 L 150.4, 0 |
  | races won | 7/7 | 0/7 | 3/7 | 0/7 |
  | land / fall per press | 0.87-1.00 / 0-0.13 | 1.00 / 0 | 1.00 / 0 | 1.00 / 0 |
  Presses at a float 13-28 a run on every bot. D' never fell on a judged press, and stands longest (slowest finishes).
- **(3) Split (b), the 72 px:** src/game/river.ts:189-190 `gapFor(dir, speed)` is a flat 72 for a river WITH him (96 + 0.2 x speed against).
  Every log on a river drifts at its one speed, so the gap from the log he rides to the next never changes. Every race site rides with
  the flow (`here.drift.dir === dir`), so every race site is the same 72 px gap, with RACE_MARGIN 50 px of log wanted past it.
- **(4) Fall-pays, end to end** (back at the fall's x, margin vs the frame before the fall): A 12 of 20 race-leg falls pay, B 6 of 15,
  C 2 of 4, D' 3 of 5, each +0.01..+0.81 s (A N1 x 10103 +0.61, A P5 x 12815 +0.81, B N1 x 8868 +0.60; D' N1 x 11600 +0.59, N1 x 8738
  +0.56, P4 x 12479 +0.59); the rest cost 0.01-4.9 s. **One cause:** Option A keeps his margin where he STANDS after the respawn, behind
  the fall's x; he then re-crosses the respawn-to-fall stretch, already credited on his first crossing, so it is credited twice: a fall
  pays wherever he re-crosses it faster than the boat. pacerRespawn's invariant (margin at the stand) holds; the principle (D112) fails.
  **Plant e8c4d0153** (tools/inspect/pacerRespawn.test.ts, 'back at a race-leg fall's x, his margin is never better than at the fall', the
  middle on the table's 7 rows): **RED** on the wip-27s head, the same three falls as the probe (s/fallpays-RED-e8c4d0153.txt).
## Polish check
- No screen changed (bot and test code only); the numbers above are the evidence.
## Pushback
- "A new target comes in reach": I read a wait as the frames a target stays in reach at one gate (a second log arriving inside it does NOT
  redraw). A redraw per new log is one key in WaitAim; the lead's call.
- D' answers the foresight question but loses every race and is the slowest bot; with hopJudged's q -2 rows open on D and D', the judge
  that records the noisy flight is not yet trustworthy enough to rule D' on land rate alone.
## Unresolved
- pacerLay on D' e8c4d0153: RED 9/19, the same nine as B; pacerRespawn's old invariant GREEN on D' (now replaced). Per bot A, C: not run. The q -2 judge flight rows; the suite past unit on the base and the suite on e8c4d0153: NOT done.
- I told the lead C's post N5 row was lost; it was not (I read the file before the run finished); corrected in a second message.
- The disk allowance filled once (2.7 GB a worktree); I removed finished worktrees; no run's result was lost to it.
- LESSONS read: D107, D109, D111-D120 (headline and countermeasure); D96, D102 not read in full (box). Applied: D111, D113, D114/D118,
  D115, D117, D119 (edits as scratch scripts), D120 (worked on past the question), D109.
## Method update
- level.md rule 28: a drawn-hop gate's aim is drawn once per wait and held until the press or the target leaves reach (WaitAim); check: the
  held-aim toy in hopJudged.test.ts. STAGE-RULES / the race: 'a fall never pays' is checked end to end at the fall's x (the new plant), not
  at the respawn's stand.
- A probe's table is read only after its run reports DONE (my C P5 miss).
## Turnover note
- reference/handoffs/engine-core.md not rewritten (box); this section is the hand-over.

# ENG-27r REPORT (start 7:43 PM ET by `date`; box 8:11 PM ET; base t-eng-27 ea7686a43; candidate D on t-eng-27-wip-27r e75664cde (D117), NOT on t-eng-27)
## EXACT NEXT STEP (ENG-27s, read only this section, D90)
0. **The suite on 74a97ad44 is running in MY container** (frozen worktree, scratchpad suite.sh; tsc PASS, unit shards running when the box closed).
   It dies with my container: RE-RUN it (D114/D118), and run the same suite on D e75664cde beside it (D's tsc is clean; only its toy test was run).
1. **Run hopJudged on D in full** (`tools/inspect/hopJudged.test.ts`, the four home rows): D presses on the aim, so a flown draw can now fall;
   judge() records it as q -2 and the test reads q -2 as consistent only if he is lost (`landed === 'lost'`). Name every q -2 row and whether
   any q -2 row came down SAFE (that would be a judge flight error, the Normal 2 #66 kind). Then the four-bot table (packet step 3), frozen,
   ONE run at a time beside the suite: A b7a68a8bd, B 74a97ad44, C b0c6dd586, D e75664cde; home middle Normal 1-3, Easy 1 and 3; post Normal
   4 and 5; finish s, race margin vs the boat, lives lost, presses at a float, land rate per press, falls per press; hopJudged and pacerRespawn
   on C and D; C's Normal 2 x 8256 row traced. Worktrees for A, B, C were made (scratchpad wtA/wtB/wtC) and die with this container.
2. Then split (b) (every race site 72 px) and the fall-pays measure end to end (packet step 4) with its RED plant. Not started (box).
## Done-items
- **Step 1, the code answer (74a97ad44 = code 4df2d084c; tools/inspect/firsttimer.ts):** every drawn-hop gate reads the DRAWN NOISE of the very hop
  it then flies. The hop: `drawHop` :4174-4199 draws kind, hold, d2, dblAt, hold2, upOnly AND the thumb's fumbles for 75 frames (drift, slip,
  late let-go, :4192-4198) on rHop. Each gate judges `hopFlies(q, ..., h, t, vx, margin, this.v2(), this.thumbAt(), ...)`, whose flight plays
  h.thumb frame by frame (:1037-1060) from the thumb's state now (thumbAt :4212): edgeStand :2769-2770, edgeWait :3041-3042, race :3102-3106
  (bank 24 px, logs RACE_MARGIN), upstream :3148-3149. The press flies that same h: `gateHop = h`, startJump :4258-4262 takes its kind, hold,
  d2, upOnly, and `flyThumb = gate.thumb` :4271, played by thumbify :4105-4110. So B presses only when the noise already drawn for this
  press lands: FORESIGHT, one draw held, redrawn whole (noise too) every 0.5 s beat (:2786-2788, :3058-3060, :3156-3158). **On b0c6dd586:** the
  same read, but `gateDraw` :4172 (`return this.drawHop(dir)`, called at :2771 edgeStand, :3041 edgeWait, :3094 race, :3141 upstream)
  draws a fresh hop, noise included, on EVERY frame judged: foresight with about 30 tries a second, as the lead said.
- **Step 2, candidate D (t-eng-27-wip-27r):** plant 78979d13b first: the four gates (5 call sites) read through one exported `gateLands`
  (B's read kept: noise and thumbAt) and a toy in hopJudged.test.ts ('no foresight, ENG-27r'): a single held 0.2 s at a solid 120 px on;
  aimed it lands, with a 24-frame slip drawn on the press frame it falls short; the gate must press it. **RED on the plant** ('the gate read the
  slip drawn for the hop before he pressed'; the toy's own first assert, the aim lands, passed). **D e75664cde:** `gateLands` judges
  `{ ...h, thumb: undefined }` with no thumbAt: the aim (kind, holds, second press, beat: the tier's draws, held for the wait on B's beat),
  the log, the gap. The press still flies h with its drawn noise (flyThumb, unchanged). judge() (D :1736) still flies the FULL drawn hop and
  now records a fall too (q -2) so the hop judged is the hop flown; hopJudged's came-down check reads q -2 as right only if `landed === 'lost'`.
  **Toy GREEN on D**; tsc clean on D. Nothing else run on D.
## Pushback
- The aim keeps B's per-wait draws of kind and hold and B's 0.5 s beat (D116: that beat has no source). The hold drawn is the testers' habit, so
  the aim still re-draws its kind and hold every 0.5 s: about 2 tries a second at a lucky hold (not a lucky thumb). If the lead wants the aim
  fixed for the whole wait, or the hold the tier's median (who.hold[0]), it is one line in each gate; the table should say which.
- The packet asked for 6 heavy items in a 28-minute box; the suite alone outlives the box. I cut scope (table, splits, fall-pays not started)
  rather than any check.
## Unresolved
- The suite (B and D), hopJudged in full on D, the four-bot table, split (b), the fall-pays measure and its plant: NOT done.
- LESSONS D96, D102, D107, D109, D111-D119 not read in full (box); applied as the packet states them: D109 (no clock times to the lead), D111
  (box), D113 (background runs only), D114/D118 (suite first), D115 (frozen worktrees), D117 (candidate on wip).
## Method update
- level.md rule 28 should add: a gate decides on the hop AS AIMED (no thumb noise); the judge records the FLOWN draw's prediction, a fall included.
## Turnover note
- reference/handoffs/engine-core.md NOT rewritten (box); this section is the turnover.

# ENG-27q REPORT (start 7:27 PM ET by `date`; box 7:55 PM ET; base t-eng-27 4df2d084c; bot change on t-eng-27-wip-27q b0c6dd586 (D117), NOT on t-eng-27)
## EXACT NEXT STEP (ENG-27r, read only this section, D90)
0. **The lead (on this report): b0c6dd586 is NOT ruled; it stays on wip-27q.** The gates press only when the hop drawn WITH the thumb's noise lands,
   and a player cannot see his thumb slip before he presses, so the gate has foresight; re-aiming every frame gives it about 30 tries a second at a
   lucky thumb. **Table FOUR bots** (packet ENG-27r.md): ungated (b7a68a8bd), one-draw hold (4df2d084c), the re-aim (b0c6dd586), and a NO-FORESIGHT
   gate (decides on the hop as aimed, flies it with the drawn noise). Then the lead rules the honest middle, then the race. Items 1-3 below come after.
1. **The lead rules the re-aim's rows (table below) before t-eng-27 takes b0c6dd586.** Then, on wip-27q, frozen: trace hopJudged Normal 2's ONE red
   row (`race q#69 judged t 118.57 x 8256 lag 0 hold 0.295 double | flown same | came down #66 solid`, q/green-b0c6dd586.txt): hopFlies judged log
   #69 and the engine caught him first on bank #66 (solid, safe). TRACED (q/diag-n2-x8256b.txt; its clock is onFrame-counted, +0.76 s on game t):
   a DOUBLE off log #68 from x 8256 y 1527 (second press about 0.4 s in); he came down at x 7952 y 1499 ON bank #66 (x 7626..7946, 28 px above the
   logs), 6 px past its end, inside the engine's side catch (0.26 w = 11.4 px); log #69 was under him then (x 7805..8045). #66 IS in flightOthers'
   list (y and x filters pass), so the judged flight came down a few px further on, past the bank's catch: a hopFlies flight error of a few px at a
   bank's end on a double. Next: fly hopFlies frame by frame beside the engine for this hop (the second press's frame, the steer's vx -268/-285
   alternation) and fix the judge, never the hop. Each frame now aims a fresh draw, so the race tries hops ENG-27p never flew. hopJudged must be 4/4.
2. The suite on 4df2d084c (step 0) ran in MY container: tsc PASS; shards 1-3 had 414/387/444 pass, 0 fail when the box closed, not finished. Re-run it.
3. Not done (box): the race table (middle 24/24, expert 12/12, ride-only 0/24; raceprobe-27e.ts.txt as tools/inspect/_race.ts), split (b) the 72 px,
   then ENG-27p's ORDER (4) castBots x40 2-1..2-6 1465822f7 vs head, tierBots 1-1 9/9, seed 5's +34.7 s, B, S.
## Done-items
- **Plant RED first (8e825b614: GATE_TRACE, records only; the re-aim test in hopJudged.test.ts, already on the CI tool line):** RED on the base logic,
  `gate frames 1293 (edgeWait 60, upstream 70, race 1161, edgeStand 2); judged on a draw held from an earlier frame 1265 (edgeWait 52, upstream 61,
  race 1152)`; first held row `edgeWait t 12.87 x 14855 drawn t 12.83` (q/reaim-RED-8e825b614.txt).
- **The fix (b0c6dd586), cadence = EVERY FRAME:** `gateDraw` draws the hop on the frame each gate judges it (edgeStand, edgeWait, race, upstream); the
  0.5 s beat (floatBeat) and waitHop DELETED. Source, cited beside it: BOTS.md (R-165.59) keeps stopReact and thumb from KID/ADULT, "no profile
  measures reaction, thumb latency", so no calibrated decision or reaction time exists; the re-aim is each frame, the press on the judged frame at
  lag 0 and its flight with the thumb's own state (hopFlies' thumbAt). drawHop unchanged; rHop is its own stream (the main stream as ever). tsc PASS.
- **GREEN (q/green-b0c6dd586.txt):** the re-aim test GREEN (281 gate frames, 0 held, 12 refused-then-pressed-next-frame); pacerRespawn GREEN 2/2;
  **hopJudged 3/4: Normal 2 RED (one row, above; it came down on SOLID). NOT MET.**
- **pacerLay on b0c6dd586: 13/19 (ENG-27p: 9 red on fb6bd156e).** Now pass of those 9: middle beats the boat home Normal 2, Easy 1, Easy 3. Still red: Normal 1, Normal 3,
  post Normal 4/5, the boardLog plant (B), the racing-hop plant (q/pacerLay-b0c6dd586.txt).
## The wait table, home middle Normal 1/2/3 (q/gateprobe-27q.mts.txt; q/gate-*.txt). Base logic 8e825b614 -> re-aim b0c6dd586
| seed | finish s | lives lost | race judged s (refused) | edgeWait judged s | upstream judged s | race land rate per fresh draw |
|---|---|---|---|---|---|---|
| 1 | 190.0 -> **246.3** | 1 -> 3 | 38.7 (38.4) -> 8.4 (8.0) | 2.0 -> 0.5 | 2.3 -> 0.3 | 4.8% |
| 2 | 215.8 -> 167.1 | 1 -> 1 | 24.8 (24.5) -> 4.4 (4.0) | 3.6 -> 0.3 | 0.2 -> 0.0 | 10.5% |
| 3 | 215.9 -> 203.8 | 4 -> 5 | 34.0 (33.7) -> 4.7 (4.3) | 1.1 -> 0.9 | 1.8 -> 0.3 | 9.2% |
All gates' judged time falls 78-84% (seed 1 43.1 -> 9.4 s; race 38.7 -> 8.4). Seed 1 finishes 56 s SLOWER with 2 more lives lost: the faster hop is the riskier hop (more
draws tried, first to land is pressed; 3 falls). The big race sites now hold 0.7-3.1 s (seed 1 x 2750 3.1 s, 0% of draws land); per-draw land rates
2-25% by site, as ENG-27p's 2-21%: the river's real difficulty, the lead's design call. (Base 'land rate' per frame is not comparable: one draw repeated.)
## Split (a): does he ride the log anyway while the race gate refuses? YES, ALL of it.
The race gate runs only on a log drifting HIS way (raceLegal: here.drift.dir === dir), and a refused frame falls to SKILLS.handed (no input): the log
carries him toward the bank every refused frame (base seed 1: x 13464 -> 12967 in 6.2 s, about 80 px/s). Of 32 base episodes (seeds 1-3) 30 ended in a hop
before the log's end and 2 were 'carried->air' (off the log, not onto the bank). So the refused seconds were never a stand: they were ride time; what
the hold cost was hopping late, not standing still.
## Split (c): b7a68a8bd's 6 lost lives, home middle Normal 1 (q/racecost-b7a68a8bd-n1.txt; probe q/racecost-27q.mts.txt). Won 85.4 s vs the boat 93.89.
4 fell ON the race leg (t 88.7 x 13473, 110.2 x 10103, 121.1 x 8787, 149.1 x 4523), 2 before it (x 15147, 15235). Each race-leg fall: back at that x 2.0-2.3 s
later with his margin 1.59->1.65, 4.83->5.44, 5.66->5.62, 8.49->8.50 s: race time lost -0.06, **-0.61**, +0.03, -0.01 s. **Under Option A a fall costs
him about nothing in race time (only the heart), and one PAID him 0.61 s by the time he was back at that x** (the invariant holds at the first stand; the
re-crossing then beat the boat's pace). So the race does not punish a reckless hop. The re-aim (b0c6dd586) Normal 1: 3 lives lost, NONE on the race
leg, race LOST 108.4 vs 93.89. Split (b), the 72 px: NOT measured (box).
## Polish check: no screen changed (bot code and a test). ## Pushback: none on the ruling. One flag: on seed 1 the re-aim makes him faster to hop and
more often to fall (lives 1 -> 3, finish +56 s); the race call should read that row. ## Suggestions: none new. ## Unresolved: hopJudged Normal 2
(above), the race table, (b), the ORDER, the suite's end. ## Method update: a gate that judges a drawn hop draws it on the frame it judges
(GATE_TRACE row-checks it); a cadence literal needs a cited source or it is every frame. ## Turnover note: engine-core.md §0zq-27q (this commit).
Lessons applied: D96, D102, D107, D109, D111-D119 (frozen trees, background runs, wip branch, no clock times to the lead).

# ENG-27p REPORT (start 7:04 PM ET by `date`; handed over at the D111 box; base df0cd9638 (code d2408e867); branch t-eng-27 head 16698b8a1 (code fb6bd156e + a type-only fix) + this REPORT)
## EXACT NEXT STEP (ENG-27q, from t-eng-27 head; read only this section, D90)
**STEP 0: the full CLAUDE.md suite on the head, frozen, in the BACKGROUND while you work (the lead, D118; mine was still running at the box
in ENG-27p's container, so its result is lost to you).**
**THE LEAD'S RULING (given at ENG-27p's box, on the table below):** (1) **The one-draw hold is a BOT MISREAD** (a tester re-aims every
moment; the 0.5 s is a bare literal with no source, D116). Fix it: the gates (race ~3120, upstream ~3164, edgeWait ~3056, the edge stand
~2766 on the head) re-draw the hop at a cadence WITH A SOURCE: the tier's calibrated decision or reaction time (R-165.59) if one exists, else
EACH FRAME with the thumb's own lag. Say which, and why. Rule 28 still holds: a planted test first, hopJudged GREEN 4/4. (2) **The 2-21% land
rates are real river difficulty;** the race's design call is the lead's and WAITS until (1) is fixed and three things are measured: (a) how
much of the race gate's 38.7 s he would ride the log anyway; (b) why every race site shows 72 px; (c) how many of base b7a68a8bd's 6 lost
lives on home Normal 1 fell on the race leg and what each cost in race time (under Option A a fall keeps his margin: does the race reward a
reckless hop? base losses: t 13.9 x 15147, 26.5 x 15235, 88.7 x 13473, 110.2 x 10103, 121.1 x 8787, 149.1 x 4523; p/lossprobe-n1-27p.txt).
**NO race retune before that.** Then pacerLay and the race table again, and the ORDER below.
**Background to the ruling: pacerLay.** pacerLay.test is RED 9/19 on the head fb6bd156e AND on d2408e867 AND on
a0ab91d33, the same 9 tests; 18/19 on b7a68a8bd (only B's plant), all four run here on frozen trees (p/pacerLay-*.txt). **The middle player
stopped winning the race at a0ab91d33** (ENG-27n: the lead's ruling built, the drawn-hop gates on edgeWait, upstream and race: pressed only
when the drawn hop lands, else he stands). Home middle Normal 1/2/3: 130 / 129.5 / 131 s on a0ab91d33 (boat 93.9 / 92.4 / 92.1); Easy 1/3
123.7 / 103.8 (boat 97.5 / 96.1); post Normal 4/5 126.3 / 144.7 (boat 100.8 / 103.4); B's plant and the racing-hop plant's RED half red
too. No member ran pacerLay between (hopJudged only). **Probes, home middle Normal 1, whole run (p/waitprobe-n1-27p.txt,
p/lossprobe-n1-27p.txt; scripts p/*-27p.*.txt, run as .mts with the PROJECT's tsx, node_modules/.bin/tsx, not npx from the scratchpad):**
b7a68a8bd finish 175.1 s, 69.0 s standing still, 6 lives LOST (`r.lives` counts lives lost); head fb6bd156e finish 190.0 s, 104.6 s still,
1 life lost. The gated bot is SAFER and SLOWER: +35.6 s still, most at x 15000-15999 (15.9 s), 10500 (7.8), 13000 (6.6), 6000 (6.5), 5000.
**The lead's split (asked 7:20 PM ET): is the gate's thumb calibrated or a pacing guess?** The drawn hop itself is the calibrated thumb
(drawHop: flickHold, dblShare, dbl2Q, the drift/slip/release draws, all from `who`, R-165.59's tiers); the BEAT is not: one hop drawn and held
for 0.5 s (`t - this.floatBeat < 0.5`, edgeWait ~3060, upstream ~3158, and now the edge stand) is a bare literal with no cited source (D116),
and the gate presses only on a frame that ONE draw lands, so the wait is paced by that literal. Per-site land rates (50 draws at each refused
frame, on a THROWAWAY stream swapped in and out, so the run is unchanged: finish 190.0 s, 1 life lost; p/rate-n1-27p.txt, the probe's bot
p/firsttimer-ratediag-27p.ts.txt, `RATEDIAG=1`): **seconds of frames each gate judged and refused: race 38.7, upstream 2.3, edgeWait 1.8,
edgeStand 0.1.** Nearly all the +35.6 s is the RACE gate, off a log. Biggest race sites (x, s judged, mean land rate of the calibrated draw,
nearest [platform, gap px]): 8500 3.1 s 9% [66, 72]; 1500 3.1 s 7% [96, 72]; 13250 3.1 s 16% [47, 72]; 5750 3.1 s 2% [78, 72]; 4250 2.9 s
10%; 7000 2.8 s 11%; 11250 2.7 s 18%; 11500 2.5 s 16%; 13000 2.0 s 3%; 8750 1.9 s 16%; 1750 1.9 s 21%; 5500 1.8 s 18%; 9750 1.6 s 18%;
10000 1.5 s 9%. Bank gates over 0.5 s: edgeWait 14900 52% [12, 99]; 16100 19% [17, 77]; 9000 43% [66, 149]. NOT separated yet: how much of
the race gate's judged time he would ride the log anyway (the log carries him toward the bank) and how much is a true stand; the gap
'72' is the same at every race site (likely the bank's lip from the log's end: check). **My read for the lead's split:** the hop is the
calibrated thumb, but at the race sites only 2-21% of its draws land, and the gate holds ONE draw (beat 0.5 s upstream/edgeWait; the race
holds waitHop until a gate presses it) and presses only when that draw lands. A tester re-aims every moment, so the one-draw hold reads as
the pacing guess (D116: no source) and the low rate as the river's real difficulty. Both are in play; the probe cannot split them alone.
ORDER after that (ENG-27o's (3)-(6), on the head, frozen, one at a time; disk: use SPARSE worktrees, `git worktree add --no-checkout`,
`git sparse-checkout set --no-cone '/*' '!reference/' '!public/' '!docs/'`; full ones filled this container's allowance at 7):
(3) the race table (middle 24/24, expert 12/12, ride-only 0/24: it WILL show pacerLay's losses; recipe raceprobe-27e.ts.txt as
tools/inspect/_race.ts); (4) rule 28 castBots x40 on 2-1..2-6, base 1465822f7 vs head, row for row (the judge changed on every gate hop
AND the edge stand now gates and may wait: rows WILL move, each traced; no tier's count may drop), tierBots 1-1 9/9; (5) seed 5's time;
(6) B, S. **The full CLAUDE.md suite (the lead's D118: src tests import tools/inspect, so every bot commit needs it): STARTED on
/home/user/f-fb6bd156e (frozen, code = b62ab031c's) at the box; result in the lead's message if it came in, else RE-RUN IT FIRST.** tsc on
fb6bd156e: 1 error, MINE (firsttimer.ts:2766, `s.dir !== 0` on a -1|1 field; no runtime effect), fixed in 16698b8a1; **tsc on 16698b8a1: PASS (0 errors)**,
on a sparse frozen tree (it ran beside the suite: two runs at once, my miss against 'one heavy run at a time', named).
**(1) DONE: ruling A built, its invariant planted RED first, hopJudged GREEN on all four (Normal 5, 2; Easy 5, 2) on fb6bd156e**
(p/hopJudged-fb6bd156e-GREEN-27p.txt). **(2) pacerRespawn GREEN 2/2** (p/pacerRespawn-fb6bd156e.txt); pacerLay as above.
## ENG-27p: what was done
- **The invariant (D112), as the lead agreed it on my measure:** every press from a river's bank with drift logs near its edge (edgeWait's
  own window: within 400 px of the edge, |dy| < 70; `edgeFloats`) either flies on a judgment made on its OWN press frame, or, pressed with
  no judgment, comes down on SOLID. A judgment left from an earlier frame or another branch ('stale') always fails; an unjudged press that
  comes down on a log, in the water or nowhere seen ('unjudged') fails. Named in hopJudged's test titles. The judged-row checks (flown as
  judged, came down where judged) now read judged rows only.
- **Why not edgeWait's `near` read as "a float within reach":** planted first on 39e19d036 with that read (a single held who.hold[0], lags
  0..0.2): NO stale row at x 15632 (p/hopJudged-39e19d036-narrow-27p.txt): on the stand's press frame that read is false, because he flew a DOUBLE
  onto log #40. Measured with the wider window: 14 bank presses flagged over the four runs; 13 came down on solid (bank to bank, the way home),
  only x 15632 on a log. Lead told (priority next); the lead agreed and tightened (b) to "solid only".
- **RED proof:** cd7c0da5b's code (d2408e867 + the trace only) with the final test (6ac2bab34's): Normal 5 RED (2 rows), Normal 2 RED (`stale
  edgeWait q#40 judged t 79.30 x 15632 | flown t 79.67 double | came down #40 drift`), Easy 5 RED (1 row), Easy 2 GREEN
  (p/hopJudged-RED-cd7c0da5b+6ac2bab34test-27p.txt). The three Normal 5/Easy 5 rows were 'came down #-1': traced (scratch copy, not a frozen
  tree): he came down on his OWN bank (#70 x 6620..6940 y 1517; #76; #70), on a landing frame where the engine had not set standingOn
  (engine.ts:2829 resets it to -1 each frame). A trace miss, not a fall: the row now reads the floor under him then (fb6bd156e). So the
  REAL red on d2408e867 is the one row the packet named, x 15632.
- **The fix (A), 7c5f25239 + fb6bd156e:** at the edge stand (intend, the `this.standing` branch), drift logs in the window and
  SKILLS.floatSure: the hop he will fly (`waitHop`, drawn once per wait on rHop) through hopFlies at lag 0 from where he stands; it lands ->
  judged (`edgeStand`), gateHop, pressed. It does not -> `this.judged` cleared, and: a bank in reach past the edge (within 400 px, -120..+300 px
  of his feet) -> the stand's own press as before (no stand-forever, no bank hop forced onto a log); NO bank in reach -> he stands by choice
  (clockHeld, pending and lateArmed dropped), the drawn hop drawn anew each 0.5 s beat (edgeWait's). edgeWait clears the `near` probe's
  judgment when its gate refuses. With the fallback alone (6ac2bab34) x 15632 still flew the double onto #40 unjudged
  (p/hopJudged-6ac2bab34-27p.txt): traced (scratch probe at every refused stand): of 12 refused stands over the four runs, 11 had a solid bank
  300-430 px on (each came down on it); x 15632 had NONE (logs #39, #40 only) and its drawn hop was a 0.033 s tap: the fallback cannot know
  where its unjudged hop lands, so there (only there) he stands by choice, as the lead said.
- **hopJudged on fb6bd156e: GREEN 4/4.** Normal 5: 15 judged hops, 5 bank presses all on solid. Normal 2: 27 judged hops (was 22: the run
  moved after x 15632, it now waits there and flies an `edgeStand` gate hop), 3 bank presses all on solid. Easy 5: 23, 2 on solid. Easy 2: 23,
  3 on solid. **The 14 flagged presses on d2408e867 and how each came down:** Normal 5 x 6657 solid (own bank #70), x 6648 #75 solid,
  x 5258 solid (own bank #76), x 2358 #93 solid; Normal 2 x 15632 #40 LOG (stale), x 7686 #71 solid, x 6255 #76 solid; Easy 5 x 6748 solid
  (own bank #70), x 2402 #93 solid; Easy 2 x 10647 #60, x 7854 #71, x 6420 #76, x 3730 #87, all solid. (13 of 14 solid.)
- **Checks:** hopJudged on each head, each on its own frozen worktree (/home/user/f-39e19d036, f-cd7c0da5b, f-red3 (cd7c0da5b + the final
  test, a local commit a900b63a1, not pushed), f-6ac2bab34, f-fb6bd156e); traces on /home/user/s-probe only. pacerRespawn 2/2 and pacerLay 10/19 on
  fb6bd156e; pacerLay on d2408e867 (10/19), a0ab91d33 (10/19), b7a68a8bd (18/19) for the bisect. NOT run: tsc on the bot file, the race
  table, rule 28's diff, tierBots, seed 5's time, B, S (the box went to the invariant's definition, two traces and pacerLay's bisect).
- **Lessons applied:** D111 (28 min from 7:04 PM ET), D113 (every run backgrounded, waited on its notification), D115 (every run on its own
  frozen tree; traces on a separate copy), D114 (src/ unchanged: no suite), D109 (no clock times in messages), D96/D102 (lean reads),
  D112 (the invariant is the principle, "every press at a float flies on its own judgment", tested on the real runs, not a mechanism's toy),
  rule 28 (each red traced before its fix; the fix where the cause is). Law 3: the ruling's trigger read was checked against the real row
  before building on it (it was false there). **Polish check:** no screen changed (bot and test only); none due.
- **Learned (proposed for level.md, rule 28's check):** a gate's TRIGGER must be checked on the row it is for: "a float within reach" read
  as a single's reach misses every double, so a test built on it passes the very hop it was written to catch. Define the trigger by the
  window a person sees (the logs near the edge) and judge by where he comes down (solid only, unless a gate judged it on that frame).
# ENG-27o REPORT (handed over at the D111 box; base 3ca307dc7; branch t-eng-27 head d2408e867 + this REPORT)
## EXACT NEXT STEP (ENG-27p, from t-eng-27 head; read only this section, D90)
ORDER: (1) hopJudged's last RED rows (below) traced and fixed, the test GREEN on all four (Normal 5, 2; Easy 5, 2); (2) pacerLay (its one
red is B's known plant), pacerRespawn (the invariant GREEN); (3) the race table (middle 24/24, expert 12/12, ride-only 0/24); (4) rule 28
castBots x40 on 2-1..2-6 base 1465822f7 vs head, row for row (the judge changed on EVERY gate hop: rows WILL move, each traced); tierBots
1-1 9/9; (5) seed 5's time traced (where he waits, why); (6) B, S. src/ is unchanged (bot and test only), so no suite.
(1) **hopJudged on d2408e867 (o/hopJudged-d2408e867-27o.txt): Normal 5 GREEN (10 rows), Easy 5 GREEN (21), Easy 2 GREEN (20);
    Normal 2 RED by ONE row, not a judge miss: `edgeWait q#40 judged t 79.30 x 15632 lag 0 hold 0.200 (no kind) | flown t 79.67 hold
    0.162 double | came down #40`.** Probed (a stack at startJump, t 79.667): the press came from the EDGE STAND (`this.standing`, intend
    ~line 2741 on d2408e867: 'a tier bot stopped at an edge: he lets go, comes to a stand, stands his time, then jumps from there',
    startJump(s.dir, jumpFor(...))), not from a gate; the row is the edgeWait `near` probe's judgment (judge with who.hold[0], lags 0..0.2,
    `if (HOP_TRACE.on && near) this.judge(...)`) left in `this.judged` when the drawn-hop gate refused, then picked up by the stand's press
    0.37 s later. He came down where judged (#40), by luck: no gate judged that hop. **Ruling needed (lead), then build it:** (A, my
    pick, rule 28's own words 'every bot gate that judges a hop'): at a river edge with a float near, the stand's jump goes through the
    drawn-hop gate (hopFlies, lag 0, pressed only if it lands, else he stands by choice), and the probe's stale `this.judged` is cleared
    when the gate refuses; or (B) the trace only: clear `this.judged` on refusal, and the stand's hop stays unjudged (a hop no gate judged
    pressed at a float: the very miss rule 28 forbids). Then hopJudged GREEN on all four, and on to (2).**
    How to trace a row (what found the four roots below, 1 min each): a copy of the head (NOT the frozen tree), one console.log in hopFlies
    when HOPDIAG='t0:qid' matches (the judged flight, a J line per frame) and one in pad() for t0-0.05..t0+2.6 (the engine's: P lines:
    x, y, vx, vy, grounded, on, the pad's steer and jump, lastSteer, travel, slip, release, the thumb frame); the runner is 6 lines
    (homeRun('middle', setting, seed, 1) with HOP_TRACE on, print the rows that came down elsewhere). Compare J i with P ft i+1.
## ENG-27o: what was done
- **Step 1, the thumb flown by the judge (b53c49e49), as ENG-27n's root said:** `DrawnThumb` { drift, slip, release }, one entry per frame
  from the press, drawn in drawHop on rHop AFTER the hop's own draws (so the hop's draws are as they were); `ThumbAt` (thumbify's state at
  the judgment: lastSteer, driftPx, releaseArmed, releaseLeft, travel and slip ends from now, thumbSpeed, a tier bot's one lift-off per
  let-go). hopFlies flies thumbify's order on the steer it means: the drift held the same way, the travel when turning ((2*16 + driftPx) /
  thumbSpeed, no steer), a slip (no steer for its frames), the late lift-off at a let-go (not on a press frame; lastSteer not moved while it
  runs). thumbify, on the gate hop's frames (from startJump until he is down, `flyThumb`), uses those draws in place of its own; its own
  this.r draws are still made under the same conditions. **hopJudged on b53c49e49: Normal 5 GREEN (11 rows), Normal 2 GREEN (17 rows: the
  lost double at x 14674 is gone).** Easy added to the test (seeds 5, 2): Easy 2 GREEN (21), Easy 5 RED by 2 rows.
- **Easy 5's two rows, traced frame by frame (o/diag-easy5-q11-27o.txt, o/diag-easy5-q49-27o.txt), two roots (ddd49b0b3):**
  (a) x 15540, a one-frame tap (hold 0.033), judged landing on log #11, came down LOST: the judge cut the FIRST press a frame early
  (`age + DT < until`); the engine's cut reads this frame's jumpHeld (engine.ts ~2695) and the bot's pad carries jump while age < hold, so
  the press frame is always held: the engine flew 20 px higher (vy -576.7 after frame 1 against the judge's -166.7) and came down past the
  log's end. The q49 row showed the same frame short on a 0.185 s hold (engine held 6 frames, judge 5). Fix: `held = age < until` for
  both presses (the second was already counted so). (b) x 13811, judged through the bank he stood on (#46) onto a log under its lip
  (#49), came down on the bank: the judge looked at the target only.
- **Then two more "came down elsewhere" rows (o/hopJudged-ddd49b0b3-27o.txt; Normal 5, 2 still GREEN): Easy 5 x 12053 (#55 judged, down on
  #53) and Easy 2 x 13569 (#52 judged, down on #47);** traced (o/diag-easy5-q55-27o.txt, o/diag-easy2-q52-27o.txt): the flights EQUAL the
  engine's frame for frame; he came down first on a solid above the judged log (#53 is the bank he hopped from, y 1473; #47 solid y 1478).
  Fix (4f78f9cb3): `FlightOthers`, every platform within 700 px and -160..+220 px of his feet, each where it is at the frame's game time
  (floatAt), checked each falling frame with the engine's own catch (onFloor: the side a centre may hang past, a log's wider on Easy, the
  catch drop); caught on anything but the target -> the hop does not land. On 4f78f9cb3: Easy 2 GREEN, Easy 5 x 12053 still down on #53:
  probed (the list held #53 at x 11910..12190; his centre at the crossing 11891.8, 18 px past its end, moving away): the engine's
  ledge-landing forgiveness (FORGIVE.easy.landPx 12) caught and nudged him on. Fix (d2408e867): the catch takes landPx (a log's too on
  Easy) either way he moves (the engine also asks for a carry toward it; taken both ways, the judge only refuses more, never lands more).
  Also on 4f78f9cb3, Normal 2 showed a row of another kind: `edgeWait q#40 judged t 79.30 x 15632 lag 0 hold 0.200 (no kind) | flown t
  79.67 hold 0.162 double | came down #40`: an old-judge trace row (the edgeWait's `near` probe, judge with who.hold[0] and lags 0..0.2)
  whose press came 0.37 s later by another path (came down where judged). NOT traced: which path pressed it (ENG-27n's Learned: the
  stopped-dead read presses a hop no gate judged).
- **Checks:** the bot file and the test type-check alone (tsc on firsttimer.ts with node types, --ignoreConfig: 0 errors in tools/; the 23
  reported are all src/ import.meta.glob, vite's types not loaded); hopJudged as above on every head, each on its own frozen worktree. Docs push (D53): knowncheck PASS; roadmapcheck could not run its proofs here ('shallow clone, proofs cannot be checked (fetch-depth 0): FAIL', this container's clone, not the content; CI runs it full-depth).
  NOT run: pacerLay, pacerRespawn, the race table, rule 28's diff, tierBots, seed 5's time, B, S (the box went to step 1's four roots
  and the fifth row's probe). Frozen trees left: /home/user/f-b53c49e49, f-ddd49b0b3, f-4f78f9cb3, f-d2408e867 (this container only).
- **Lessons applied:** D111 (28 min by `date`, start 6:44 PM ET), D113 (every run backgrounded; no foreground wait: the harness refused one
  sleep-then-read I tried, and I waited on the notification), D115 (every run on its own frozen worktree at its hash; traces on a separate
  copy), D114 (src/ unchanged since the base suite, so it carries), D109 (no clock times in messages), D96/D102 (lean reads: the packet's
  list only), D107/D112 n/a to a member, rule 28 (each miss traced frame by frame before its fix, the fix where the cause is: the judge).
  **Polish check:** no screen changed (bot and test only); none due.
- **Learned (proposed for level.md, rule 28's check):** a gate's judge must fly what the ENGINE does with the pad, not what the bot means:
  the hold counted on the pad's own frames (the press frame held), the thumb's fumbles, and every platform's catch (forgiveness included)
  on the way down, not only the target's. A judge pinned on one setting is not pinned: Easy's wider catches found three of the four roots.
# ENG-27n REPORT (handed over at the D111 box, written 6:12 PM ET 11-21 by `date`; base b7a68a8bd; branch t-eng-27 head 40242a902 + this REPORT)
## EXACT NEXT STEP (ENG-27o, from t-eng-27 head; read only this section, D90)
ORDER: (0) the suite's verdict and its RED; (1) the thumb's travel in hopFlies (the one LOST row's root); (2) boardHop onto the drawn
hop, v2 on Easy; (3) pacerLay, pacerRespawn; (4) the whole runs and seed 5's time; (5) the race table; (6) rule 28's diff; (7) B and S.
(0) **The full src suite on b7a68a8bd: DONE after the box (n/suite-b7a68a8bd-27n.txt): 4060 tests, 4056 pass, 1 fail, 3 todo**
    (the todos: w1Arc19 R-165.312, the 4-3 wall check, one more, all marked TODO). The one fail, the only red:
    **1 RED: src/game/gen2/pacerLay.test.ts:211** 'bot (planted): a log drifting his way, still mostly under the lip, is boarded by a
    hop, so the careful middle player wins home Easy seed 1; RED without it' fails its RED half: 'RED: without the skill the plant must
    lose (86.6 s against 97.53 s)'. **The lead's ruling: this is the KNOWN boardLog plant (failing on purpose since ENG-27j), step B's,
    not new.** B's scan rules it: boardLog on vs off over 2-1..2-7 x40; no row moves -> boardLog retires WITH its test; rows move ->
    underLip sends him to the lip and waits (rule 28). No other red. (This container's disk allowance ran out for a moment late in the
    run, after this red had already been reported; it was freed, and no test failed after it.)
(1) **hopJudged on 2f525cd72 (n/hopJudged-2f525cd72-27n.txt): seed 5 GREEN** (12 judged, edgeWait and race: 0 flown not as judged,
    0 elsewhere); **seed 2 RED by ONE row:** `edgeWait q#14 judged t 19.93 x 14674 lag 0 hold 0.235 double | flown t 19.93 x 14674 hold
    0.235 double | LOST`. **ROOT, traced frame by frame (n/double-flight-27n.txt, three runs):** the judged flight and the engine's are
    EQUAL through the second press (frame 10); the second press's hold count was a frame short (fixed, 2f525cd72); then from frame 20
    the bot's own overSmall reads 2 (steer back over log #14), but NO steer reaches the engine for the 5 frames to touch-down (vx stays
    268): thumbify's travel when turning (`who.swap`, 0.133-0.2 s, drawn from this.r at the reversal) holds no steer through a reversal,
    so he comes down at x 14889, past the log's far end (14880). hopFlies steered back at once and judged it landed. **FIX:** pre-draw the
    swap in drawHop (its own stream, DrawnHop.swap) and fly it in hopFlies (a reversal: no steer for `swap` s, then the steer back; a
    let-go then a reversal, below); the lead agrees the judge must fly the thumb's turn time. **thumbify, read (firsttimer.ts ~line
    3990): what the engine gets in the air is the steer AFTER three fumbles:** (i) the late lift-off: a let-go (overSmall 1) keeps the
    old steer for `releaseLeft` frames (drawn at the let-go: exp(gauss(release)), clamped to releaseMax; a tier bot arms it once per
    let-go), and lastSteer is NOT moved on while it runs; (ii) the travel: a reversal against lastSteer gives no steer for (2 * 16 +
    driftPx) / thumbSpeed s (driftPx grows each frame held the same way by gauss(drift) * DT, to 30; ADULT/MIDDLE thumbSpeed 320: 0.1 s
    at least); (iii) a slip: each frame with a steer, r() < slip * DT drops it for round(between(slipFrames)) frames. **FIX (the same
    pattern as drawHop):** hopFlies takes the thumb's state at the judgment (lastSteer, driftPx, releaseArmed, travelUntil - t,
    driftUntil - t) and a pre-drawn thumb from rHop (the release count, the per-frame drift steps and slip outcomes for ~40 frames), and
    flies (i)-(iii) frame by frame; thumbify, on the gate hop's frames, uses those pre-drawn values (its own draws still made, so the
    stream is as ever). Pin it: the per-frame trace (n/double-flight-27n.txt's A/P lines) equal frame for frame on seed 2 x 14674, then
    hopJudged seeds 5 and 2 GREEN.
(2) **boardHop** (jumpFor ~line 1630) still judges a single held who.hold[0] and its press comes through decide's thumb lag (a0ab91d33,
    seed 5 t 86.67: judged x 10467, pressed 2 frames on from x 10458 held 0.171 via the stopped-dead read; n/hopJudged-a0ab91d33-27n.txt;
    not reached on seeds 5 and 2 since). Under floatSure: the drawn hop judged by hopFlies at lag 0, gateHop set, pressed at once (decide
    keeps its gauss draw, then startJump now when a gate hop is set); gateHop good only on the frame it was set (gateAt === this.t).
    **v2 on Easy: DONE (40242a902):** every hopFlies call takes the engine's own second-jump speed (FirstTimerRun.v2(): PHYS.doubleV *
    (1 + ASSIST.doubleJump * assistNow()) * drowse * dragJump, engine.ts ~2671; 1.12x on Easy); hopJudged on Normal unchanged (n/hopJudged-
    40242a902-27n.txt). Easy doubles are still unproven: add an Easy seed to hopJudged once (1) is GREEN. Then the liana and wheel
    traces (ENG-27m's (1)).
(3) **pacerLay.test (with (0)'s RED), pacerRespawn.test: NOT run on the head** (the suite held the heavy slot). Frozen tree, GREEN.
(4) **The whole runs** (2-7 home middle Normal 5 and 2; candidate 2's: seed 5 171 -> 205.7 s, seed 2 203 -> 182.2 s, m/candidate2-
    runs-27m.txt) re-measured on the head first: the waits past the beat now stand by choice and redraw each 0.5 s beat, which can move
    time either way. Then seed 5's extra seconds traced: where he waits, why (a wait that never ends is a miss).
(5) the race table (middle 24/24, expert 12/12, ride-only 0/24; the probe's recipe in ENG-27m's (1)); (6) rule 28 on 2-1..2-6 x40 both
    settings, base 1465822f7 vs head, frozen trees, row for row (the river gates run on every W2 river: rows WILL move, each traced);
    tierBots 1-1 9/9; (7) B and S as ENG-27l's (4), (5).
## ENG-27n: what was done
- **Step 0:** the full src suite on b7a68a8bd, frozen worktree, background (above). npm install needs `--legacy-peer-deps` (CI's line).
- **THE LEAD'S RULING BUILT** (a0ab91d33): candidate 2 applied (`git apply`, its two HOPDIAG lines stripped), plus:
  `DrawnHop` { kind, hold, d2, dblAt, hold2, upOnly } and `drawHop()`: startJump's draws in the same order (flickHold with the same
  floor, the dblShare draw, d2 from dbl2Q with the same climb/needs bounds, the kind's hold cap, upOnly, dblAt) and the second press's
  hold, drawn ONCE per wait (`waitHop`, kept until a gate presses it, cleared when a beat runs out). `hopFlies()`: hopLandsOn's flight
  plus no steer for upOnly, the double's second press (at d2, or past dblAt when d2 < 0) through the engine's secondJumpV, its hold, and
  the overSmall let-go / steer-back over the judged float. **edgeWait, upstream and race** judge the drawn hop with hopFlies at lag 0
  from p.x and press only if it lands (`gateHop`), else he stands by choice and it is judged again next frame. startJump flies the
  gate's hop (kind, hold, d2, upOnly, dblAt, hold2) unchanged.
- **THE RANDOM STREAM KEPT:** drawHop draws from its OWN seeded stream (`rHop`, the run's seed formula + 50021), read nowhere else;
  startJump still makes every main-stream draw it made (and the mid-air second-hold draw is still made, its value replaced by hold2), and
  the gates pass startJump the same kind as before ('single' at edgeWait/upstream, jumpFor's at the race), so each press consumes the
  same main-stream draws; only WHEN he presses moves. Not yet proven by a run: rule 28's diff (6) shows it.
- **hopJudged.test.ts**: a drawn row (it carries its kind) must be flown with the SAME kind and hold; boardHop's single as before.
  On a0ab91d33: seed 5 13 judged, 1 flown not as judged, 0 elsewhere; seed 2 21 judged, 2 not as judged, 0 elsewhere.
- **Traced (a diagnostic copy, run twice, the same rows both times; n/hopJudged-a0ab91d33-27n.txt):** every row flown not as judged
  was a press no gate made: upstream's fall-through after the 0.5 s beat (seed 2 t 21.67, 36.47, 39.33), and the stopped-dead read
  (blockedT) 2 frames after a judgment (seed 2 t 20.17 x 14674 edgeWait; seed 5 t 86.67 x 10467 boardHop). **Fixed:** 123876d28
  (upstream: the beat out, a new draw, he stands on; the log hands him back) -> the upstream rows clean (n/hopJudged-123876d28-27n.txt);
  174e3f54d (the edge wait past the beat returned with nothing held: now he stands by choice, clockHeld, and the next beat draws its own
  hop) -> seed 5 GREEN, seed 2's one row left is (1); 2f525cd72 (hopFlies: the second press's hold counted from its own frame, flown
  frame-exact against the engine) -> the same row, its root traced to the thumb's travel (1).
- **Checks on 40242a902:** the bot file type-checks alone (tsconfig excludes tools/; checked with node types: 0 errors) and loads;
  hopJudged 1/2 (above). NOT run: pacerLay, pacerRespawn, the race table, rule 28's diff, tierBots, the rest of the full set.
- **Lessons applied:** D114 (the suite first, on the base, background), D113 (every run backgrounded, no foreground wait), D115 (every
  run on its own frozen worktree: base, three frozen heads, the diagnostic copy), D111 (28 min by `date`), D57/D87 (ReadNotifications
  at each step and push), D109 (no clock times in messages), rule 28 (traced before fixed; the test RED-first, now asserting EQUAL).
  **Polish check:** no screen changed (bot and test only); none due.
- **Learned (proposed for level.md):** a wait that returns nothing must say he stands by choice on EVERY frame of it, not only the
  first beat: the stopped-dead read takes any unflagged stand and presses a hop no gate judged. A gate that judges with a model of the
  hop must have that model pinned against the engine for every kind it judges, the thumb's own fumbles included (the double here was
  flown as judged and came down LOST: the steer back took the thumb's travel time, which the judge did not fly).

# ENG-27m REPORT (handed over at the D111 box, 28 min; base 79196c2f6; branch t-eng-27, this commit)
## EXACT NEXT STEP (ENG-27n, from t-eng-27 head; read only this section, D90)
ORDER: (0) the suite's result; (1) M2, turning hopJudged.test.ts GREEN; (2) rule 28's castBots diff; (3) B; (4) S.
(0) **The full src suite on 79196c2f6** (6 shards, frozen worktree, run_in_background): suite 1/6 PASS 635/635; 2/6 PASS 617 + 1 todo, 0 fail; 3/6 onward were still
    running in ENG-27m's container at the box (ENG-27m sends the lead the summary if it gets it). If no result reached the lead: re-run
    the 6 shards on a frozen worktree of the head (the CLAUDE.md src list, `--test-shard=i/6`). A red: name it, tell the lead.
(1) **THE RULE'S TEST IS WRITTEN AND RED ON THE BASE: `tools/inspect/hopJudged.test.ts`** (in gates.yml's tool-test line; RED until M2
    is fixed, by design). HOP_TRACE (firsttimer.ts) records, for every hop a hopLandsOn gate judged and then pressed, the judgment (gate,
    platform, frame, x, hold, lag), the hop flown (frame, x, hold, kind) and where he came down; it records only: the whole run result
    of 2-7 home middle Normal 5 and 2 is identical with it off and on (m/trace-neutral-27m.txt). Gates traced: `edgeWait` (the bank's
    wait for a float, ~line 2825), `race` (the racing hop, M1's), `upstream` (the hop off a log's front against the flow), `boardHop`
    (jumpFor's judged single). NOT yet traced: the liana (hopCatches, lianaWait) and the wheel (wheelHop): add them (they judge with
    hopCatches / the wheel's own read; landed = caught the vine / on the wheel).
    **ON THE BASE (m/hopJudged-base-27m.log.txt):** seed 5: 16 judged hops, 10 flown not as judged, 2 came down elsewhere, BOTH LOST
    and both the M2 site: `edgeWait q#68 judged t 100.97 x 8990 lag 0.1 hold 0.200 | flown t 101.67 x 8964 hold 0.169 single | LOST`
    (ENG-27l's x 8794 fall) and `edgeWait q#85 judged t 136.70 x 4833 lag 0.2 | flown t 137.07 x 4825 hold 0.137 | LOST` (x 4664).
    Seed 2: 23 judged, 17 not as judged, 6 elsewhere (3 LOST: edgeWait x 6000 lag 0.2, x 5978 lag 0.2; upstream x 14902 lag 0.1 flown
    at once as a double). Every `race` row is flown as a DOUBLE (kind drawn, M1 kept the draw) though judged a single; all came down
    where judged, but the rule says SAME hold AND kind: ruling needed (see below).
    **M2's CAUSE, traced (two runs: seeds 5 and 2):** the edge wait ends on a hop judged from where he WILL BE (x + vx*lag, lag 0.1 or
    0.2), then the press comes from other code: a pending thumb (decide's lag), the stopped-dead read (~line 2775, `blockedT >=
    stopReact` decides a jump while he stands at the edge) or tierEdge, from another x, later, with a drawn hold and kind.
    **A CANDIDATE, NOT PROVEN, NOT IN THE CODE (m/floatSure-candidate-27m.diff.txt, SKILLS.floatSure; result m/hopJudged-candidate-27m.txt):**
    press only on the frame the lag-0 hop lands from where he stands, a single held exactly who.hold[0] (startJump's floatHop, like
    wheelHop); a beat later he STANDS for it (pending and lateArmed dropped, clockHeld, blockedT 0), the same at `upstream`. Result:
    seed 5 edgeWait rows all clean (0 elsewhere; the 4 left are race doubles); seed 2: 3 edgeWait rows still LOST (x 7269 lag 0.1,
    5980 lag 0.2, 4728 lag 0.2): standing kills the walk the lag-0.1/0.2 hop was judged on (x + vx*lag), so the lag-0 hop never lands
    and the 0.5 s beat runs out; the press that drowned him then came from the stopped-dead read in the PLAIN edge wait
    (`floats.length && !near`, 6 s), which never said he stands by choice.
    **CANDIDATE 2 (m/floatSure-candidate2-27m.diff.txt, a diff against THIS head d26cbe22f: candidate 1 plus, in the plain edge wait
    under SKILLS.floatSure, clockHeld = true, blockedT = 0, pending = null; strip its two HOPDIAG console lines before committing):**
    hopJudged: seed 5: 10 judged hops, 0 came down elsewhere; seed 2: 16 judged, 0 came down elsewhere; EVERY edgeWait and upstream
    row flown as judged; the only rows left are the race hop's drawn double (m/hopJudged-candidate2-27m.txt). Whole runs (2-7 home
    middle Normal, m/candidate2-runs-27m.txt): seed 5 lives 4 -> 3 but 171 -> 205.7 s; seed 2 lives 6 -> 1, 203 -> 182.2 s.
    Seed 5's +34.7 s is NOT explained yet (standing waits for a float on banks? it must be traced before anything else).
    NEXT, in order: apply candidate 2 (`git apply`), trace seed 5's +34.7 s (where the extra time goes: rule 28, two runs per cause);
    the race table (copy reference/qa-reports/ENG-27/raceprobe-27e.ts.txt to tools/inspect/_race27k.ts; `npx tsx tools/inspect/_race27k.ts
    middle,expert,ride home` and `... post`: middle 24/24, expert 12/12, ride-only 0/24); hopJudged with OFF=floatSure RED and on GREEN
    once the race kind is ruled; pacerLay; pacerRespawn GREEN; then (2). ENG-27m ran no race table: the base suite held the one heavy slot.
    **THE LEAD'S RULING (received after the first push): judge the hop he FLIES.** Draw the kind and the hold FIRST, by the testers'
    habit as now (dblShare, flickHold, d2: calibration, BOTS.md; do NOT force a single), then judge THAT hop, from where he IS when
    pressed (no x+vx*lag projection), and press only if it lands; if not, he waits (a careful child hesitating at an edge) and it is
    judged again next frame. No other press (a pending thumb, the stopped-dead read blockedT, tierEdge) may fire a hop the gate did
    not judge. HOW (ENG-27m's read, not built): split startJump's draws (flickHold, the dblShare draw, d2, upOnly, in the SAME order)
    into a drawHop() that returns { kind, hold, d2, upOnly } and is drawn ONCE per wait (kept until pressed, so the stream does not
    change frame to frame), a flight that flies the double's second press at d2 (hopLandsOn flies a single only: add the second
    impulse as the engine does, airStep/hopFrame), every hopLandsOn gate (edgeWait, race, upstream, boardHop) judging the drawn hop
    at lag 0 from p.x, and startJump taking the drawn hop instead of drawing again. Candidate 2's stand (clockHeld, blockedT 0,
    pending/lateArmed null) is the wait. hopJudged.test.ts then asserts kind and hold EQUAL the judged ones (today: flown hold >=
    judged, kind single: change it to the drawn hop's), RED with OFF=floatSure, GREEN on. Then the race table, then (2).
    WHAT THE DOUBLE'S FLIGHT MUST CARRY (read in the code, ENG-27m): the second press comes at d2 (or, d2 < 0, when vy > dblAt, drawn
    in startJump: `between(this.r, who.dblAt)`), and ITS hold is drawn mid-air (`j.hold = age + flickHold(...)`, ~lines 2439 and 2453):
    pre-draw it in drawHop too (a draw moves earlier in the stream: say so in the rule 28 diff). In the air the thumb steers back
    over a small landing (overSmall, ~line 2445: side(-dir)); hopLandsOn flies dir held all the way, so judge with that steer or
    the hop judged is still not the hop flown. tools/inspect/firsttimer.ts ~line 4556 (tryAt) already flies a double frame by frame
    on the real sim: the pattern to copy for a test that pins the new flight against the engine.
(2) Rule 28's castBots diff, 2-1..2-6 x40 both settings, base 1465822f7 vs the final head, frozen trees (ENG-27l (3) below); NOTE the
    candidate DOES reach 2-1..2-6 (the edge wait and upstream run on every W2 river), so rows WILL move: each traced, no tier's pass down.
(3) B and (4) S: unchanged (ENG-27l (4), (5) below).
**Checks on this head (d26cbe22f + REPORT):** tsc PASS; ciTests PASS 4/4 (hopJudged registered); roadmapcheck PASS, timecheck PASS (after
`git fetch --unshallow`), knowncheck PASS, generalitycheck PASS; hopJudged RED 0/2 by design (the RED-first test). Not run: the
rest of the full set (no screen or engine code changed: the bot only gained a trace that records).
**Lessons applied:** D114 (the full suite first, on the base, background), D113 (no foreground wait; every run backgrounded or seconds
long), D111 (28-min box by `date`), D57/D87 (ReadNotifications at each step), rule 28's own new clause (the test before the fix), D63
not reached (no clip), D96 not reached (no full set). **Polish check:** no screen changed (bot and test only); none due.
**Learned (proposed for level.md):** a bot that STANDS to wait must say so (clockHeld) or the stopped-dead read decides a jump for it;
a judgment made with a lag projects his walk, so the wait that follows must keep that walk or re-judge from where he stands.

# ENG-27l REPORT (handed over at the D111 box; base 1465822f7; branch t-eng-27 head 122193be4 + this REPORT; ground t-eng-ground 484199316)
## EXACT NEXT STEP (ENG-27m, from t-eng-27 head; read only this section, D90)
ORDER: (1) G's result; (2) M2's bank-to-log site, then the race table; (3) rule 28's castBots diff; (4) B; (5) S.
(1) **G, the ground's gates on 484199316** (chain a then b, run-gates-d.sh, frozen worktree, node_modules symlinked, tooltests.cmd = the
    ground's gates.yml line 157 without '- run:'; `git fetch --unshallow` done first). At the box: tsc PASS, suite 1/6 PASS 634/634, suite
    2/6 PASS 616 + 1 todo, 0 fail (l/ground-gates-at-box-27l.txt); suite 3/6 onward still running in ENG-27l's container (logs in its scratch, lost if it stops; ENG-27l sends the lead the summary if it gets
    it before stopping). If no result reached the lead: re-run `G=<logdir> H=<worktree at 484199316> bash reference/qa-reports/ENG-GROUND/run-gates-d.sh a`
    then `b` (npm install needs `--legacy-peer-deps`, as CI's). All green: tell the lead 484199316 is the green ground head. A red: name it.
(2) **M2's other site: a hop from a BANK onto a log drifting AWAY (his way) lands behind its back end.** The race-hop fix (M1, below) left
    it, and it now costs home middle Normal 5 the race (93.9 vs 93.63, -0.3; it WON by 9.9 on 1465822f7). Its falls with the fix
    (l/falls-home5-raceSure-on-27l.txt): x 8794 (takeoff from bank #64, log #68 ahead), 8704 (the same crossing after the respawn), 4664
    (bank #81, log #85), 1691 (bank #93, log #95); without the fix the row fell once (x 8787, the same crossing). The other rows' bank-to-log
    falls are the same kind: home N2 x 4427 (ENG-27k), x 9789 and 5678-5853 with the fix (l/falls-home2-raceSure-on-27l.txt).
    WHERE (read, not proven): the edge wait for a float, firsttimer.ts `lands` (~line 2812: a hop at lag 0, 0.1 OR 0.2 s from where he
    stands NOW, held who.hold[0]) sets `near`, and the wait ends; the jump is then pressed by the edge code below it (tierEdge: his aim
    point, his thumb lag, a hold drawn from holdQ), so the hop judged is again not the hop flown (from another x, later, another hold).
    TRIED AND DROPPED by ENG-27l (l/race-variantC-dropped-27l.txt): the edge hop ('run') to a log the wait judged, held at least
    who.hold[0]: home N5's falls 4 -> 2 (x 4664 and 1691 gone; x 8794 stays, so that crossing has another cause, the press point or the
    lag judged, not the hold), but middle 21/24 (home N2 -2.6, post N1 -0.8, post N4 -0.3): the hold alone is not the cause there.
    Fix where the cause is, the same way as M1: the hop flown is the hop judged (judged from where and when he will press it, held at least
    the hold judged, as the liana's, the wheel's and now the race hop are), two runs per cause, planted on these falls (RED off, GREEN on).
    Then the race table (copy reference/qa-reports/ENG-27/raceprobe-27e.ts.txt to tools/inspect/_race27k.ts, `npx tsx
    tools/inspect/_race27k.ts middle,expert,ride home` and `... post`, about 1 min each): middle 24/24, expert 12/12, ride-only 0/24; any
    middle loss traced. The falls probe: copy l/falls-27l.ts.txt to tools/inspect/_falls.ts, `OFF=<skill> npx tsx tools/inspect/_falls.ts
    <seed> <setting> home|post` (OFF turns that SKILLS flag off for the RED run).
(3) **Rule 28's castBots diff**, base 1465822f7 vs head, 2-1..2-6 x40 both settings: `npx tsx tools/inspect/castBots.ts --stage <s>
    --seeds 1-40 --setting both --par 3 --rows <s>-<side>.jsonl` on each worktree, then `python3 reference/qa-reports/ENG-27/castdiff-27g.py.txt
    base.jsonl head.jsonl`. ENG-27l's first run was stopped before any row (its head side read the working tree, where the M2 candidate
    was being tried: a diff of the wrong code). Re-run on frozen worktrees: **2-1 DONE, base 1465822f7 vs 2e77837cb: 0 of 360 rows moved,
    every tier's pass count the same** (l/castdiff-2-1-27l.txt, rows l/castrows-2-1-27l.jsonl; 251 s a side at --par 2). **2-2..2-6 NOT
    RUN.** **tierBots 1-1 9/9 on 2e77837cb.** Run 2-2..2-6 on the final head after (2), and 2-1 again if (2) moves code. By construction no
    2-1..2-6 row can move (SKILLS.raceSure lives only inside the race branch, which needs a stage pacer: only 2-7 lays one), but the diff
    is the proof (rule 28): run it on the FINAL head after (2), row for row, every moved row explained, no tier's pass count down. Then
    tierBots 1-1 9/9, pacerLay (now 18/19: the red is B's boardLog plant), and the invariant (pacerLay test 3) GREEN.
(4) **B** unchanged from ENG-27k's (3) below: boardLog's scan first (skill on vs off, 2-1..2-7's listed seeds x40, both settings); no row
    moves: retire it WITH its test; rows move: underLip sends him on to the lip and waits there (a bot change, the plant laid explicitly),
    rule 28's diff.
(5) **S** unchanged from ENG-27k's (4) below: stills at 2x both ways (the boat waiting, setting off, docked; the door and letter; a
    respawn on the race leg), THE CLIP of the race leg with a fall in it (D63), THE FULL SET (gates.md D96; lockall vs 0eefc707e: only
    2-7's toy moves). Known and not ours: R-165.380.
## ENG-27l: what was done
M1. **Proven and fixed: the racing hop off a log took the bank with no landing check and flew a hop of its own hold.** firsttimer.ts, the
    race leg's hop off a log running his way (SKILLS.race): `bank` (any floor within 80 px of the log's end, 70 px of height) started the
    hop with no landing check, and startJump drew the press's hold from holdQ (as short as a frame), so a tap off the log's front came down
    19 px short of a bank 28 px up (k/falls-*-27k.txt: the hop 2 frames held, apex 47 px). **Two runs per cause** (l/falls-*-raceSure-
    off/on-27l.txt): off, all ten of ENG-27k's falls come back at the same x; on, none of the four M1 falls (home N2 x 10683, 6551, 3959;
    post N5 x 12371). **Fix (SKILLS.raceSure):** the bank is asked through hopLandsOn (its rise read, 24 px in) with who.hold[0], as the
    next log already was; the hop flown is held at least who.hold[0] (raceHop, read in startJump after its draws, so the stream is as
    ever; jumpFor still picks single or double), as the liana's and the wheel's hops are. **Plant** (pacerLay.test 'the racing hop off a
    log lands where it was judged to'): the exact falls, RED with the skill off, GREEN on. **Tried and dropped** (variant A,
    l/race-variantA-27l.txt): a forced single at exactly who.hold[0] with the bank asked 50 px in: he rode too many logs in and middle
    lost five races (home N2, N4, N5; post N1, N5).
    **Race table on the fix** (l/race-variantB-27l.txt): middle 23/24 (1465822f7: 22/24): home N2 WON +1.5 (was -3.0), post N5 WON +6.5
    (was -0.2), home N5 LOST -0.3 (was +9.9: (2) above, M2's bank-to-log site, which this fix did not touch: his timing moved and the
    misread met him there). Expert 12/12 (closest home N2 +11.1). Ride-only 0/24, identical to ENG-27k's (raceSure is inside the race
    branch, which the ride-only player never runs). pacerLay.test 18/19: 'the careful middle player beats it, normal seed 2' (RED on
    7c7fe2a9a) is GREEN; the one red is the known boardLog plant (B). The invariant (test 3) GREEN. tsc PASS.
    R-165.381 (the ride's hop off a drifting log falls short on 2-1): NOT yet re-read on 2-1; it is the ride's drift code (`upstream`
    and the edge wait), not the race branch, so it goes with (2).
G. The ground's chain a and b on 484199316 started first (npm install needed `--legacy-peer-deps`): tsc PASS, suite 1/6 PASS 634/634 at
    the box; the rest running ((1) above).
Not reached: B, S, the castBots diff (started, then stopped: (3)).
Lessons applied: D40 (no patch on what is being replaced: the fix is in the bot's own read, the race leg untouched), D57/D87
(ReadNotifications at every step and push), D102/D90 (read lean: only ENG-27k's top section), D105/D107 (two runs per cause, the plant on
the exact falls, RED then GREEN), D109 (no clock times to the lead), D111 (the box), D112 (the race and the invariant untouched; the bot
fixed, never the margin), D113 (every long run in the background).
Polish check: no screen changed this round (a bot change only); S not reached.
Learned (for level.md, proposed): "the hop judged is the hop flown" is now three sites (liana, wheel, race) fixed one at a time; a
proposed rule: every bot gate that judges a hop (hopLandsOn / hopCatches) hands the same hold and kind to startJump, checked by a test
that the judged hold reaches the jump (PRESS_TRACE-style), so the fourth site (the bank's edge wait, (2)) is caught by a check.

# ENG-27k REPORT (handed over at the D111 box; base d83358fad; branch t-eng-27; ground fix t-eng-ground 484199316; merge 154eb8366; F 7c7fe2a9a)
## EXACT NEXT STEP (ENG-27l, from t-eng-27 head; read only this section, D90)
ORDER: (1) the lead's ruling on the two middle losses (RULED, below); (2) the race table and the gates; (3) B; (4) S.
(0) **THE LEAD'S RULING (after (1) below): (b) first.** A fall never PAYS; the respawn's own time is forgiven (the invariant);
    re-crossing the river he fell in is play and its cost is his (engine-core.md now says it in those words). Trace each fall to its
    parting frame: a bot misread (fix it generally, rule 28's row-for-row castBots diff, 2-1..2-6 x40 both settings, plus pacerLay) or a
    real hazard a careful player meets. If after (b) any fall is real and middle still loses: (a), the claim becomes 'middle wins with no
    fall, and with up to one real fall', the losing rows named with their falls. NOT (c).
    **TRACED (ENG-27k, every fall on the race leg of both losing rows; k/falls-middle-home-normal2-27k.txt, k/falls-middle-post-
    normal5-27k.txt; probe k/falls-27k.ts.txt, copy to tools/inspect/_falls.ts, args `<seed> <setting> home|post`: the frames before
    each life lost and at each takeoff what lies ahead within 420 px): ALL TEN are bot misreads, of two general kinds, none a hazard:**
    M1, a SINGLE hop off a drifting log's front to a HIGHER bank (28 px up) 80-95 px ahead: it comes down 19 px short every time.
       home N2: x 10683 (log #58 front 10744, bank #55 edge 10664), x 6551 (log #75 front 6612, bank #72 edge 6532), x 3959 (bank #82
       edge 3940); post N5: x 12371 (bank #50 edge 12352). He stands still on the log riding it (vx 0), then hops (vx -223..-285,
       vy -513) at its front: the hop's reach with a 28 px rise is under the gap. A full jump or a double carries it.
    M2, a hop onto a log drifting AWAY from him (with the current, his way): he aims at where it is at takeoff and lands behind its
       back end as it moves on. home N2: x 4427 (log #84 back end 4404 at takeoff); post N5: x 12815 and 12831 (logs #51/#52, back end
       12784-12880 as he left), x 6055 and 5907 (log #79, 15-30 px behind its back end).
    WHERE (read, not yet proven by two runs per cause): both are in the racing hop off a log, firsttimer.ts ~2826-2836 (SKILLS.race,
    'a log running his way is ridden only while nothing is in reach ... he hops now off its front end'). Its condition is `bank || <a
    log where sure(q)>`: `bank` is any non-log floor within 80 px of the LOG's edge and 70 px of height, taken with NO landing check
    (M1: the bank 80-95 px from his takeoff and 28 px up, counted from the log's edge, never asked whether the hop lands on it); `sure(q)`
    asks hopLandsOn with `who.hold[0]`, but the jump made is `jumpFor(p, dir, here)` (mem.plan: single or double, its own hold), so the
    hop judged is not always the hop flown (M2: check that hopLandsOn moves the log over the hop's time and that the flown hop is the one
    judged). Fix there: the bank asked through the same landing check (its rise included), and the jump flown = the jump judged.
    NEXT: fix M1 and M2 in the bot where the cause is (firsttimer.ts: the hop off a log reads the rise to the far floor and the log's
    drift over the hop's time; fromTakeoff reads a gap from where he takes off, so M1 is likely the same reading missing the RISE, and
    M2 the target's motion), two runs per cause, the castBots 1-40 row diff on 2-1..2-6 both settings (every moved row traced), then
    pacerLay and the race table. Only if a fall is still left and real: (a) as ruled.
(1) **RULING ASKED: pacerLay 'the careful middle player beats it, normal seed 2' (home) is RED on 7c7fe2a9a: 95.4 s vs the boat's 92.37.**
    Traced (k/trace-middle-home-normal2-27k.txt; probe k/probe-27k.ts.txt, copy to tools/inspect/_probe.ts, args `2 normal`): the
    invariant holds at each of its 4 falls (+0.92 -> +0.92 at x 10683, -0.85 -> -0.85 at x 6551, -1.40 -> -1.40 at x 3959, -1.16 -> -1.16
    at x 4427). The loss is (a) its thin pace: +0.4 to +2.2 s mid-leg BEFORE any fall (the boat is 7% slower than the FLOWN middle, this
    bot is slower than the flown middle on this seed), and (b) each respawn is a river back from the fall, so it re-crosses the river it
    fell in and pays that river's log wait again (-0.85 at x 7308 -> -2.86 by x 6750). Under the floor it WON by 2.5 (the floor's pay).
    Options sent to the lead: (a) accept, the test becomes 'wins with no fall' and fall rows named; (b) the four falls are bot misses:
    rule 28 trace (two runs per cause), the fix where the cause is, castBots row diff (my recommendation); (c) change what the respawn
    keeps. Do what the lead rules; never loosen the margin or the test to get green (law 22).
(2) **The race table on 7c7fe2a9a** (home and post, seeds 1-6, both settings, middle / expert / ride-only): DONE (k/race-27k.txt).
    Ride-only LOST ALL 24 (home 0/12, post 0/12; closest post Easy 4 by 5.1 s, home Easy 4 by 6.2). Expert WON all 12 (Normal only; no
    expert bot on Easy; closest home Normal 5 by 7.5 s, post Normal 3 by 10.2). Middle 22/24: LOST home Normal 2 (95.4 vs 92.37, -3.0;
    (1) above) and post Normal 5 (103.6 vs 103.44, -0.2). Post Normal 5 traced (k/trace-middle-post-normal5-27k.txt; the probe's 4th
    arg `post`): 6 falls, each margin kept (+1.60, +1.75, +1.26, +1.47, -0.23, +0.15); FOUR of them at one crossing in 10 s (x 12984,
    12815, 12371, 12831, each put back at x 13128) and two at x 6055 / 5907 (back at 6258); its margin hovers -1.6 to +2.6 s the whole
    leg. Both losses: a thin careful-middle pace plus repeated falls at one crossing; under the floor both were WON by its pay. Same
    ruling as (1): I recommend (b), the repeated falls at one crossing as bot misses, traced by rule 28.
    Re-run: copy reference/qa-reports/ENG-27/raceprobe-27e.ts.txt to tools/inspect/_race27k.ts on a frozen worktree, then
    `npx tsx tools/inspect/_race27k.ts middle,expert,ride home` and `... post` (about 30 s each). Ride-only must lose all 24; middle and
    expert win; any middle or expert loss traced (rule 28).
    **The gates on the ground head 484199316** (chain a then b, run-gates-d.sh, frozen worktree, node_modules symlinked, tooltests.cmd =
    THE GROUND's gates.yml line 157 without '- run:' (my first try read the wrong checkout's line 157: empty; fixed before tooltests ran)):
    running at the box in this container (logs in its scratch, lost if it stops): tsc PASS, suite 1/6 PASS
    634/634; suite 2/6 onward running. If the container died, re-run: `G=<logdir> H=<worktree at 484199316> bash reference/qa-reports/ENG-GROUND/run-gates-d.sh a`
    then `b`; `git fetch --unshallow` before roadmapcheck and the lock. All green: tell the lead 484199316 is the green ground head.
    Then THE FULL SET on t-eng-27's head (gates.md D96: chain a, b and the lock vs 0eefc707e: only 2-7's toy moves).
(3) **B: THE LEAD'S RULING (11-21, to ENG-27k): SCAN FIRST.** boardLog ON vs OFF (firsttimer.ts SKILLS.boardLog, line 708; its read
    is underLip, line ~2786) over 2-1..2-7's listed seeds x40, both settings: `npx tsx tools/inspect/castBots.ts --stage <stage> --seeds
    1-40` each way (level.md rule 28), plus 2-7's toy rows. NO row moves: retire boardLog WITH its test (the row diff is the proof).
    Rows move: fix the wait point (underLip sends him on to the lip and waits THERE), the plant laid explicitly (one log, 64 px out of
    240 when his look first reaches it), RED without the skill, GREEN with it; then rule 28's diff. The lead also: four falls at one
    crossing inside 10 s is a bot that cannot read that crossing, not a fair race; the race and the invariant stay untouched.
    Background, unchanged from ENG-27j's B below (pacerLay.test 'a log drifting his way ... home Easy seed 1; RED without
    it' still FAILS on 7c7fe2a9a: 85.2 vs 97.53, the race now wins without the skill). ENG-27j's trace (3) found the skill's wait point
    WRONG on the toy (it holds him at his look distance, 57 px short of the lip, and the longer hop lands near the log's front: the miss
    the skill was planted against, made by the skill). That is a bot change: ask the lead whether underLip should send him on to the
    lip first, then wait; rule 28 (row-for-row castBots diff) goes with it; then the explicit toy (one log, 64 px out of 240 when his look
    first reaches it), RED without the skill, GREEN with it. Never loosened, never retired while the skill lives.
(4) **S**: stills at 2x both ways (the boat waiting, setting off, docked; the door and letter; a respawn on the race leg: now the boat
    held level with him while he drops onto the flag) and THE CLIP of the race leg (D63) with a fall in it; THE FULL SET. Known, not ours:
    the wall end's shade seam and water fill, the stretched wall picture (R-165.380).

## ENG-27k: what was done
G. **The ground's suite 4/6 red was the ground's own, not load** (k/../../ENG-GROUND/k/red-green-27k.txt on t-eng-ground): stageModes.test
   alone, unloaded: RED on 2d4e0752a and d83358fad (8/9), GREEN on 0eefc707e (9/9). Cause: 988f7ce24 (ENG-27 step 0) made levelCheck's
   'past the shrine' read config.travel, which matches the engine's own left-mode wall (stageModes walls(-1)); the test's fixture asked
   the 1-1 builder for travel 'left', but 1-1 lays rightward (its shrine at its right end), so every pickup lay beyond a left shrine and
   no seed could build. The check is right; the fixture asked for a stage the game cannot lay (the lead accepted). Fix (484199316): the
   fixture builds 1-1 as the game lays it and makes its leftward reading after the build (config.travel with the start and shrine it
   already moved, then travelStart): the engine's left mode is still run end to end. Plant: realPlay.test "the level check's 'past the
   shrine' is the engine's own wall, whichever way the stage travels": RED on 0eefc707e's check (left: a flower beyond a left shrine not
   refused), GREEN. rules.ts says so. tsc PASS. The merge refreshed on t-eng-27 (154eb8366); the merge 24d6ba567 stands.
F. **Option A built (7c7fe2a9a)**, the rule first (D40), the old deleted (new replaces old): PacerPiece records his margin at the start
   of every step it runs (pacer.ts pacerMargin = pacerAt(his x) - clock); the world holds through the life-lost beat (engine.ts down),
   so after a fall that is the margin the frame before the life was lost. A respawn on the leg sets the clock so he keeps exactly it
   (pacerKeep) and holds the boat level with him until he stands; a respawn before the leg: back at its start, waiting; a decided race
   is never rewound (unchanged). A lead bigger than the way from the start leaves the clock negative: the boat waits at its start that
   long (the verdict reads the clock). DELETED: Pacer.floor, PacerRow.floor, W2_RACE.floor, pacerReplace, riversLeft, middleAt and the
   lay's marks (they fed only the respawn share); engine-core.md says why with ENG-27j's numbers.
   THE INVARIANT on the grid: tools/inspect/pacerRespawn.test.ts (added to CI's tool line, gates.yml 157): home and post, seeds 1-6,
   both settings, middle / expert (Normal) / ride-only, each life lost on the race leg paired with its own first stand after the
   respawn (a second life lost before a stand is a failure by name), tolerance 2 frames. RED on 154eb8366: home 90 of 91, post 76 of 78
   respawns moved his margin (k/inv-red-27k.txt; e.g. middle home Normal 1 at x 7407: +12.51 -> +6.26, a lead taken). GREEN on
   7c7fe2a9a (k/inv-green-27k.txt, 35 s). The pacerLay unit test now drops him ahead and behind the boat: the respawn keeps +/- exactly,
   holds while he is in the air, runs on the step he stands. The ride-only claim is 'never wins' (the exemption is gone).
   pacerLay.test on 7c7fe2a9a: 16/18 (k/pacerLay-27k.txt): the two reds are (1) above and B.
Lessons applied: D40 (the rule first, the old path deleted, nothing patched around it), D57/D87 (ReadNotifications at each step and
push), D102 (read lean: the packet's list only), D109 (no clock times in messages), D111 (the box by `date`), D112 (the test is the
invariant on the grid, not a toy of a mechanism), D113 (every long run in the background; foreground only single files of seconds).
NOT done (the box): (2)'s full set on t-eng-27, B, S (the stills and THE CLIP).

# ENG-27j REPORT (handed over at the D111 box; base d29258340; branch t-eng-27, head: this commit; merge 24d6ba567, re-plant af127d21e)
## EXACT NEXT STEP (ENG-27k, from t-eng-27 head; read only this section, D90)
ORDER: G in the background first; then F (the respawn rule: RULED, option A on every respawn, below), then B (boardLog's toy), then S
(stills, THE CLIP, THE FULL SET). R is done; re-run it after F (ride-only must lose all 24).
G. **A RED ON THE GROUND (at the box end): suite 4/6 FAIL 615/617** (1 fail, 1 todo), gates-27j/suite4-fail-tail.txt:
   src/game/stageModes.test.ts:131 'left in the engine (a fixture only this test builds: 1-1 read leftward, its shrine moved to the left
   of the start)': "gen2 1-1 (normal): no seed of 24 from 769 builds cleanly (the first: seed #71 lies past the shrine, where he cannot
   go)". NOT yet known: whether it is the ground's (2d4e0752a vs its base 0eefc707e) or older, or a load flake (six race runs and a
   dev server shared the 4 CPUs while it ran). FIRST: run that one file alone on a frozen 2d4e0752a and on 0eefc707e
   (`npx tsx --test src/game/stageModes.test.ts`); then on t-eng-27's head. Red on 2d4e0752a and green on 0eefc707e = the ground's:
   name the commit to the lead and stop (the merge 24d6ba567 waits on the lead's ruling). The merge stands only on the lead's word.
   Earlier on the same frozen tree: tsc PASS, suite 1/6 PASS 634/634, suite 2/6 PASS 616/617
   (1 todo, 0 fail), suite 3/6 PASS 809/810 (1 todo, 0 fail) (with ENG-GROUND-e's lock PASS 102/102). Unrun or running when the container
   stopped: suite 4-6 (run those by hand:
   `npx tsx --test --test-shard=<i>/6 <the SUITE glob in run-gates-d.sh>`, then the rest of chain a from tooltests on), tooltests, tierBots, tipwalk,
   coverage, registry, generality, known, roadmap, time, art (chain a) and all of chain b. Run them FIRST, in the background, on a frozen
   worktree at 2d4e0752a: `G=<logdir> H=<worktree> bash reference/qa-reports/ENG-GROUND/run-gates-d.sh a` then `... b` ($G/../tooltests.cmd
   = gates.yml line 157 with the leading '- run:' stripped; node_modules symlinked from the main checkout; `git fetch --unshallow` before
   roadmapcheck and the lock). All green: tell the lead 2d4e0752a is the green ground head. ANY red: the merge 24d6ba567 is already on
   t-eng-27 (safe-keeping, the container is temporary): name the red to the lead with its log tail and wait for the ruling (revert with
   `git revert -m 1 24d6ba567` only on the lead's word).
B. **boardLog's RED half is NOT re-planted yet** (pacerLay.test 'a log drifting his way, still mostly under the lip ... home Easy seed 1;
   RED without it' FAILS on the merged head: 57/58 of the six files; the race now wins without the skill, 85.2 vs 97.53, ENG-27i). Left
   failing on purpose: never loosen, never retire while the skill lives (the lead's ruling). Build its explicit toy in
   tools/inspect/firsttimer.test.ts beside the fromTakeoff one: a bank ending at 1000 (top 600), one log his way 28 px under the lip, the
   river a zone, a level put-back (levelHeight 700). My first toy, boardlog-probe-27j.ts.txt (copy to tools/inspect/_probe.ts; args none:
   a sweep of the log's front at t0 and his start; never commit it as .ts): FT_MIDDLE_EASY from x 940 or 700, cap 4. FOUND: (1) the
   engine's log x froze during his splash while driftX(t) ran on (log800 vs dx846 at t 1.4), so a bare toy's log and the bot's clock part
   after a fall: judge only the first approach; (2) from x 940 with the front at 1000 he ran off the lip onto the log's front and off it
   ON AND OFF ALIKE (the miss itself, but the skill did not engage: underLip reads fa = floorAt(p.x + look) and the log's front was
   already behind his look, so fa was empty); (3) from x 700, fronts 960/975/986: ON fell (t 2.5-3.3), OFF did not; 1000/1015 and from
   500: neither fell. (3) needs tracing before any toy is called a plant (is it the skill's own harm, a rule-28 concern, or the toy?).
   TRACED (3) at front 975, start 700 (boardlog-trace-27j.ts.txt, frame rows every 0.1 s): ON, his look meets the log still mostly under
   the lip, so underLip says no floor ahead and he STOPS where he is, 57 px short of the lip (x 943, t 1.1-1.7); he hops from there at
   t 1.8 and comes down on the log at x 1089, 26 px from its front (log 875-1115), still moving, runs on and jumps off its front at
   t 2.5 into the water (x 1347; no next log, the far bank 485 px on). OFF, he walks to the lip (x 1003, t 1.7), the plain ride wait
   holds him there to t 2.6, he hops at t 2.7 and comes down 88 px in from the front (x 1057 on 905-1145) and rides at the log's speed.
   So on this toy the skill's wait point is WRONG: it holds him at his look distance, not at the lip, and the longer hop lands near
   the log's front. That is the same miss the skill was planted against (coming down near the front and off it), made by the skill.
   Before re-planting: decide with the lead whether underLip should send him on to the lip (as the ride wait does) and only then
   wait; that is a bot change, so rule 28 (row-for-row castBots diff) goes with it. One log only and a 600 px river make this toy
   harsher than any listed row; a second log within a hop would let the ride's own hop save him, so lay ONE log to keep the cause bare.
   The toy must put the log 64 px out of 240 at the moment his look first reaches it (the race's x 7650), not at t0.
   Only if a scan of 2-1..2-7's listed seeds finds a log mostly under the lip at a running approach NOWHERE after the merge: retire
   boardLog WITH its test, by a rule-28 row-for-row castBots diff showing nothing moves.
R. **The race table on the merged head: DONE** (af127d21e, race-27j-merged.txt; raceprobe-27e.ts.txt on a frozen worktree). Middle: home
   12/12 WON, post 12/12 WON (closest: home Easy 3 and post Easy 3/5 by 4.1-5.9 s; home Normal rows in the file). Expert (Normal only:
   no expert bot on Easy): home 6/6, post 6/6 WON. No middle or expert loss, so none to trace. Ride-only: lost 22/24; WON home Normal
   seed 1 (93.5 vs 93.89, +0.4; was lost by 21.5 at 27f) and seed 2 (91.8 vs 92.37, +0.6; won by 0.3 at 27f). pacerLay's 'the ride-only
   player never wins without a fall on the last crossing' (home seeds 1-3, both settings) PASSES, so each of those two wins carries a
   fall on the last crossing (the lead's ruling A: falling in is not winning without effort). Worth the lead's eye: home Normal 1 moved
   from a 21.5 s loss to a 0.4 s win with the merge and the re-plant, by the exemption, not by a clean ride.
F. **A FALL PAYS (the lead's concern on ride-only's two wins; measured, fallm-27j.ts.txt: copy to tools/inspect/_fallm.ts, run with tsx).**
   His margin to the boat in seconds (lead = (him - boat) x dir / the boat's speed; + is ahead) the frame before a life lost on the race
   leg -> the first frame he stands after the respawn, home Normal ride-only, merged head:
   seed 1: -0.91 -> +5.29 (mid-leg); -10.32 -> +3.67 (the crossing before the last: the boat 1657 px ahead, nearly docked, put back
   behind him); +3.20 -> +3.55 (the last crossing). WON by 0.4. seed 2: -0.93 -> +6.14; -0.94 -> +5.43; -0.68 -> +3.48 (the last
   crossing: behind, then ahead). WON by 0.6. So EVERY respawn on the leg resets the race to him plus the floor (pacerReplace: level
   with him plus max(share, floor)), whatever he trailed by. The lead's ruling (11-21, to ENG-27j): on the last crossing a fall costs
   nothing and pays nothing: the respawn restores the margin he had when he fell (the respawn's lost time forgiven), never more;
   planted both ways; pacerLay re-run; race table re-run. PUSHBACK SENT (it would not fix seed 1, whose pay came one crossing earlier).
   **THE LEAD'S RULING (after the pushback): OPTION A, ON EVERY RESPAWN.** The respawn's lost time is forgiven and he keeps EXACTLY the
   margin he had when he fell: a fall neither costs nor pays race time (it still costs the heart). Not B (a capped floor keeps the
   loophole's shape). NEW REPLACES OLD: the floor (pacer.ts Pacer.floor, PacerRow.floor, W2_RACE.floor, pacerReplace's floor lines
   96-105) and ruling A(ii)'s last-crossing exemption are DELETED, not switched off; engine-core.md says why (this measure).
   BUILD, in this order (D40: the rule first, nothing patched around it):
   (1) THE INVARIANT, planted RED first on the merged head: on every listed 2-7 seed (the toy's rows: home and post, the seeds the
       race table uses, 1-6), both settings, every bot (middle, expert on Normal, ride-only), every respawn on the race leg: his margin
       to the boat the first frame he stands after the respawn == his margin the frame before the life was lost (within a frame of
       the boat's travel). Margin = (him.x - boat.x) x dir / the boat's speed |x1-x0|/seconds, boat.x = pacerPiece.x. RED numbers to
       quote (fallm-27j.ts.txt, merged head): home Normal ride-only seed 1: -0.91 -> +5.29, -10.32 -> +3.67, +3.20 -> +3.55; seed 2:
       -0.93 -> +6.14, -0.94 -> +5.43, -0.68 -> +3.48. (A respawn BEFORE the race leg still sets the boat back at its start, waiting:
       unchanged.)
       MEASURED ON THE WHOLE GRID (invariant-27j.ts.txt, a probe, not the test; invariant-27j-merged.txt; tolerance 0.1 s): RED
       nearly everywhere: middle home 45/49, middle post 44/46, expert home 22/23, expert post 19/20, ride-only home 20/21, post 12/12
       respawns break it. Both ways: the floor PAYS a trailing player (ride-only post Easy 5: -12.61 -> +2.95; home Normal 1: -11.14 ->
       +3.67) and TAKES a leading player's lead (expert home Normal 2: +17.48 -> +3.48; middle post Easy 3: +23.39 -> +4.36), so every
       respawn resets him to about +3 to +7 s whatever he had. Two ride-only rows already go the other way (home Normal 4: -3.84 ->
       -5.38; home Easy 2: -3.54 -> -5.37). The probe's pairing is rough where two lives are lost before he stands (repeated "after"
       values at one x); the real test pairs each life lost with its own respawn.
   (2) THE RULE: pacerPiece records his margin when the life is lost (the frame before; pacerPiece.respawn, line 47-52, runs at the
       respawn, so the margin must be taken at the fall: hook the piece's per-frame update while he is on the leg, keep the last
       grounded or last pre-fall frame's margin), and at the respawn sets the clock so the boat stands that same margin from his
       respawn x: clock = clock of the x = respawnX - dir x margin x speed (pacerX is linear in clock: invert it). pacerReplace's
       floor arithmetic goes; whatever pacerLay laid from the floor goes with it.
   (3) pacerLay.test: the floor claims (lines ~62-130: 'after a fall the floor counts each crossing left', the floor-per-crossing
       checks, the ride-only "last crossing" exemption test) are REWRITTEN to the invariant, never loosened. 'the ride-only player never
       wins without a fall on the last crossing' becomes 'the ride-only player never wins' (no exemption).
   (4) The race table re-run (race-27j-merged.txt's method): ride-only must lose all 24; middle and expert must still win all theirs;
       any middle or expert loss traced (seed, x, frame, what took him). Rule 28 for the pacer change: the cast bots row for row on
       2-7's toy (no other stage has a pacer; say so with the grep).
S. **Stills: a first pass on the merged head, NOT the set.** stills-27j/sheet-upright.jpg and sheet-sideways.jpg (2x, race-stills-27e.mjs on a
   dev server at af127d21e, fixture seed 1 Normal; PW=/opt/node22/lib/node_modules/playwright/index.mjs because the script sits outside
   node_modules). Spots (x:boatDx:tag:face:leg): 17420:none:waiting:L:low 16330:-330:settingoff:L:low 1050:211:docked:L:low
   15700:none:door:R:up. Judged edge to edge: DOCKED sideways reads well (the boat and its rower at the far bank's edge, Pokey on the bank
   beside it). DOOR AND LETTER on the out leg reads well both ways (the round door, the letter, the petal ring). WAITING and SETTING OFF
   FAIL AS STILLS: the boat is not on screen. Waiting: its bow at 16519 (P.x0) is 900 px from Pokey at the wait river's near bank
   (17420), past the view's edge both ways. Setting off at 16000: the boat is behind the 15703-16519 land (layer 'under', the lead's
   ruling (a)). Upright, docked is off-screen too (211 px right of him in a ~440 px view). Pick the spots from the marks
   (homeStage(1,'normal',POST_CODE).pacer.marks: 16519, 14911, 14173, ... 1261): waiting = Pokey on the wait river's water or a log
   within ~400 px of 16519; setting off = the boat over the first crossing's open water, not over land. QUESTION FOR THE LEAD (law
   zero): on this roll the waiting boat cannot be seen from the wait river's near bank (an 800 px river, a ~980 px view sideways); a
   player meets it only partway across. Is that the design (2-7.md), or should the boat wait where he can see it from the bank?
   Then THE CLIP of the race leg (D63) and THE FULL SET (gates.md D96; lockall vs 0eefc707e: only 2-7's toy moves; `git fetch --unshallow` first).
   Known and NOT ours: the wall end's shade seam and water fill and the stretched wall picture (R-165.380, after release 3).
## What was done
1. **The merge** (24d6ba567): origin/t-eng-ground 2d4e0752a into t-eng-27, --no-ff. The two conflicts ENG-27i mapped, nothing else.
   w2.ts lip(): OURS (`p.y >= y - 2 && p.y <= y + LIP_RISE`, a bank on the fall's own storey; it refuses the upper leg 600 over the fall
   that theirs refused too), both comments folded into one. engine-core.md: both sections kept; the "groundStack (NOT merged here yet)"
   line now names the merge and points at §0zq-GROUND. tsc PASS. The six files (pacerLay, pacerBehindBanks, groundStack, legsHome,
   postLay, w2.test) after the re-plant: 57/58, the one fail boardLog's RED half (B above).
2. **fromTakeoff's RED half re-planted on its cause laid explicitly** (af127d21e; the lead's ruling): tools/inspect/firsttimer.test.ts 'in
   the real engine: a jump from a STAND over a laid pond reads the gap from where he stands ...' (sim.bare, the bot's own jumpFor read, as
   ENG-27h's boardHop plant): (a) a stand 165 px before a laid 133 px pond (post Normal seed 5's x 6591), (b) a stand 107 px back on a log
   with the bank 72 px past its front (seed 4's x 2749): each a double with SKILLS.fromTakeoff on, a single with it off (RED, checked);
   and the narrowing rule 28 found holds on as off (running at the pond, a dry pit the same width, a stand 330 px before a 60 px pond:
   each a single). firsttimer.test.ts 13/13 PASS. pacerLay's post Normal 4 and 5 race tests keep their GREEN half (the middle wins both,
   PASS); their RED half moved to the laid toy (comment in place; title says where its RED lives). Not loosened: the skill's RED is
   still proven, now where its cause is laid rather than where the generator happened to lay it.
POLISH CHECK: no screen changed in this packet (a merge and tests). The first stills (S) were looked at edge to edge on contact sheets:
   docked (sideways) and the door and letter pass; waiting and setting off do not show the boat (spots, not the game; S says where).
   THE CLIP is undone.
LESSONS APPLIED: D111 (the box from `date`; long runs in the background on frozen worktrees from the start), D57 (inbox at each step and
   push), D102 (lean reads), D109 (no clock times in messages), law 22 / the lead's ruling (no test loosened; the failing RED half left
   failing and named rather than dropped), law 3 (the bare toy's first result checked frame by frame before calling it a plant: it was
   not one). LEARNED: a re-plant at the bot's read (jumpFor) on a bare toy is quick and exact; a re-plant of a floor-ahead read
   (boardLog) needs the log placed relative to his look at arrival, and a bare world's log stops during a splash while the bot's clock
   runs on: trace the first approach only.

# ENG-27i REPORT (handed over at the D111 box, 28 min; rewritten 4:02 PM ET by date; first written 3:57 PM ET 11-21 by date). Base 7d5200da8; branch t-eng-27, head: this commit
## EXACT NEXT STEP (ENG-27j, from t-eng-27 head; read only this section, D90). 1a is done. ORDER (the lead's): G, R, then 1, 2, 3
G. **The gates on 2d4e0752a first, IN THE BACKGROUND** (origin/t-eng-ground's head, ENG-GROUND-e: "the corner"): a frozen worktree at
   2d4e0752a, CLAUDE.md "Checks" in order (gates.md); read only tails and failures. Nothing else edits that tree while they run.
R. **The re-plant (the lead's ruling on pacerLay's three planted RED halves; see the TRIED note in step 1):** never loosen, never retire a
   test while its skill lives. Re-plant each where its cause still lives: build the toy so the cause is laid EXPLICITLY (the pool or gap it
   needs, not whatever the generator lays there), RED without the skill and GREEN with it, on the MERGED ground (so: on the trial merge
   with ours lip, then carried into the real merge). The three: ENG-27f's fromTakeoff plants, post Normal seeds 4 and 5 (a stand 165 px
   before a 133 px safe pond, x 6591; a stand 107 px back on a log, 72 px past its front, x 2749), and ENG-27g's boardLog plant, home
   Easy seed 1 (a log drifting his way still mostly under the lip). Only if a scan of 2-1..2-7's listed seeds finds the cause NOWHERE after
   the merge, retire the skill WITH its test, proven by a rule-28 row-for-row diff showing nothing moves.
0. Setup: `npm install --legacy-peer-deps`, then `git checkout package-lock.json`. Sparse worktrees: mkwt-27g.sh.txt (set S to your scratchpad).
   Rule 28 is DONE for the refined boardHop (below): do not re-run it. Its tools: r28patch-27i.py.txt (the refined skill for every tree),
   r28-runner-27h.ts.txt, r28diff-27h.py.txt; probes r28moved/r28lives/r28fire-27i.py.txt, bhfire-27i.ts.txt (+ r28probe-27i.diff.txt:
   NO_HOP=1 turns boardHop alone off, __bhf logs each fire, __up each single the testers' dblShare turns into a double).
1a. **DONE (the lead's ruling (3), before the merge): explain 2-4 child Normal's lives 185 -> 205 IN FULL (a shipped stage).**
   the four untraced lives, one line each (trace runs on hd3; none is a wrong boardHop read): child N 14 x 24458, walked onto log 107 and ran
   off its front (the named walk-off; the fire's single was not the move made); child N 18 x 16483, the same walk-off on log 76; middle N 22
   x 23087, boardHop's single came down on log 102 as read, then the ride's hop off the log fell short (R-165.381); middle N 38 x 16295,
   the single came down on the bank's last 5 px (16126 of 16121), then he walked onto log 73 and off its front. Per row and per zone:
   r28-27i/2-4-childN-lives.txt (hop on vs NO_HOP=1, 35 moved rows, +20): by 1000-px zone, lives on/off (fires): 16k 33/30 (6), 21k 19/23 (4),
   22k 38/37 (12), **23k 41/28 (0)**, 24k 24/22 (13), **25k 23/17 (0)**. So the extra lives sit where boardHop NEVER fires (23k +13, 25k +6).
   Every 2-4 harm in every tier is water (hitBy; child N base 177, 27g head 185, new 205). Seeds 40 and 39 (+6, +5) traced life by life
   (r28-27i/2-4-c39c40-lives.txt): of 16 lives, 11 are a hop FROM a drifting log (here = drift, the ride's, R-165.381) and 5 a jump from a
   bank where boardHop did NOT fire (the bot's own gap read); NONE is a boardHop jump (39's fires 280.6/281.4 at x 21131/21222 are look-ahead
   points 900 px from the life at 280.6; 40's are 206.4 x 15973 and 360.7 x 24175, after its last life). The runs part at the first fire
   and the rest is the same water met at another log phase. Statistically +20 on 228/208 lives is about 1 sigma (sqrt 436 = 21).
   Seeds 10, 12, 13, 27 (+4, +5, +4, +5) the same way (r28-27i/2-4-c10c12c13c27-lives.txt): of 25 lives, 19 from a drifting log (a hop or a
   walk-off: the ride's), 6 from a bank where boardHop did not fire, NONE a boardHop jump. The other ten plus rows (2, 4, 5, 8, 16, 18,
   20, 21, 30, 33) by r28classify-27i.py.txt (r28-27i/2-4-c10rows-lives.txt): 55 lives, 39 from a log, 16 from a bank without a fire, 0 a
   boardHop jump. **ALL 16 rows that gained lives: 96 lives, 69 from a drifting log (R-165.381's hop or the named walk-off), 27 from a bank
   where boardHop did not fire, 0 from a boardHop jump.** Done with 1a: no wrong boardHop read on 2-4; the +20 is the same water met by
   runs that parted at the first fire (likely: it puts the child on logs, where the ride's own faults take him; the off runs' log share was not counted). Sent to the lead.
   Lead's rulings in hand: dblShare's upgrade of a
   boarding single STAYS (BOTS.md calibration); the ride's hop off a drifting log falling short is R-165.381, after 2-7 ships, left alone.
1. **The merge** (packet step 3): origin/t-eng-ground at the lead's green hash (2d4e0752a once G is green), --no-ff.
   A trial on 8a2257760 gave the two conflicts ENG-27g mapped, nothing else: engine-core.md (keep both sections; replace our line 18
   "groundStack (t-eng-ground, NOT merged here yet)..." with its real line, pointing at §0zq-GROUND) and w2.ts lip() (ours
   `p.y >= y - 2 && p.y <= y + LIP_RISE` sits inside theirs `p.y <= y + LIP_RISE && p.y >= y - LIP_RISE`; ours also rejects their
   600-px upper leg; banks() takes y from the river's surface at its rivers call, so try OURS first and settle by both sides' tests).
   **TRIED on 8a2257760 (scratch, never pushed): with OURS lip, tsc clean and 53/56 of the six files; groundStack, w2.test, postLay,
   legsHome, pacerBehindBanks all pass. The 3 fails are pacerLay's planted RED halves, and they fail with THEIRS lip too (28/31):
   ENG-27f's fromTakeoff plants post Normal seeds 4 and 5 and ENG-27g's boardLog plant home Easy seed 1, "without the skill the plant must
   lose", now WIN without it (97.9 s vs boat 100.76; 100.5 vs 103.44; 85.2 vs 97.53): the merged ground took away the descent pools these
   plants were set on (the lead's ruling), so the cause is no longer on the toy. Do NOT loosen them (law 22): the lead's ruling is step R above.**
   Then tsc + pacerLay + pacerBehindBanks + groundStack + legsHome + postLay + w2.test (paths: src/game/gen2/{pacerLay,legsHome,postLay}.test.ts,
   src/game/gen2/worlds/w2.test.ts, src/game/{groundStack,pacerBehindBanks}.test.ts); engine-core.md.
2. The race table on the merged head: raceprobe-27e.ts.txt as tools/inspect/_race.ts, `npx tsx tools/inspect/_race.ts <middle|expert|ride> <home|post>`
   (six in parallel, about 1 min). The PRE-merge reference on 7d5200da8 is race-27i/: middle 12/12 WON home and post (both settings),
   expert 6/6 WON (Normal; no Easy bot), ride-only 0/12 (lost every one, the ride-only claim). Any middle or expert loss after the merge: trace it.
3. Stills 2x both ways (boat waiting, setting off, docked; door and letter: race-stills-27e.mjs, positions from the MERGED roll) and THE CLIP of
   the race leg (cliprec-27e + clip-27e.mjs, D63); THE FULL SET (gates.md D96; lockall vs 0eefc707e: only the toy; git fetch --unshallow first).
## Rule 28 for the refined boardHop (2-1..2-6, 40 seeds, both settings; r28-27i/<st>-head.jsonl and <st>-diff.txt)
- Tier pass counts base / 27g head / new head: unchanged in every tier and setting, no drop (2-1..2-5 tiers 40/40; 2-6 0/40 at base too).
- Flips vs base: boardHop moved NO kid or adult row; every flip is one of ENG-27g's traced eight (2-1 kid N 11, 2-2 kid N 4, 2-4 kid N
  9/10/16/22/27, adult N 18). No flip from boardHop.
- Moved rows (27g head -> new), every one with a log across a lip in jumpFor: 2-1 87, 2-2 24, 2-3 0, 2-4 111, 2-5 29, 2-6 0.
- Lives 27g head -> new: 2-1 child N 102->93, middle N 51->58, expert N 40->42; 2-2 child N 215->204, child E 41->33, middle N 99->85,
  middle E 13->14, expert N 76->72; 2-4 child N 185->205, middle N 121->116, expert N 137->131; 2-5 middle N 9->7; 2-3, 2-6 same.
- Lives within 3 s after a boardHop FIRE, hop on vs NO_HOP=1 (2-1's 15 screened rows, 2-4's 111 moved rows; 2-2's 24: none after any
  read). Lost the same way with it off: 2-1 4, 2-4 1. The rest, traced (r28-27i/upgrade-probe.jsonl; frames in the trace runs):
  - The single came down ON the log as singleLands said, then a hop FROM the log (here = drift: the ride's, not boardHop's; R-165.381, the lead's) fell short
    0.3-1.3 s later: 2-1 child N 23 (x 24834), middle N 2 (14436), middle N 36 (24854); 2-4 middle N 22 (23087).
  - The testers' double habit: 2-1 child N 23 t 248.3, startJump got boardHop's single, dblShare (firsttimer.ts:3845, about 24%) made it
    a double that flew over log 114 (24606-24756) into the 72 px before log 111 (x 24791). Lead's ruling: it STAYS (the testers' habit).
  - The named log-front walk-off (walked on, rode, ran off the front): 2-4 child N 14 (24458), child N 18 (16483), middle N 38 (16295).
  - 2-4 child N +20 NOT yet explained in full: step 1a.
  - A fire logged 850 px from the life (a look-ahead point): 2-4 child N 12, child N 30: not his jump.
- pacerLay 19/19 on 7d5200da8 (the refined head), pacerLay-27i.txt.
## Done / not done
- Done: packet 1 (r28patch-27i), 2 (the table, sent), the pre-merge race reference. NOT done: 3 (no hash), 4 on the merged head, 5.
- Lessons applied: D57 (queue read at every step and push), D90/D102 (lean reads), D109 (no clock times to the lead), D111 (the box).
- Polish check: no screen changed in what was done (bot and report only); the stills and the clip are step 3 above.
- Learned: the rows run about 1 min per 90 rows on 4 cores (24 jobs in about 12 min, not 40). The __bh read log is a superset; log the fire
  (__bhf) and the executed kind (__up / the trace's jmp) before tracing a life, since a logged single can still go up as a double.

# ENG-27h REPORT (handed over at the lead's D76 call, real context ~325k; written 3:38 PM ET 11-21 by date). Base 71c3a293b; branch t-eng-27, head: this commit
## EXACT NEXT STEP (ENG-27i, from t-eng-27 head; read only this section, D90)
0. Setup: `npm install --legacy-peer-deps`, then `git checkout package-lock.json`. Sparse worktrees: mkwt-27g.sh.txt (set S to your scratchpad).
   Patch a worktree for rule 28 with `python3 reference/qa-reports/ENG-27/r28patch-27h.py.txt <wt>` (runs r28patch-27g.py.txt, then adds SKILLS.boardHop where missing,
   all three skills read off with R28_BASE=1, and a log __bh of every jumpFor that meets a log across a lip). NOTE: r28patch-27h's boardHop hunk
   for trees WITHOUT it (t-build-23, t-build-25) is the FIRST cut (no singleLands): update its HOP line and helper to match firsttimer.ts now
   (`&& this.singleLands(p, dir)` and the singleLands helper) before running 2-3/2-5. Runner: r28-runner-27h.ts.txt -> tools/inspect/_r28run.ts
   (prints bhReads/bhFirst). Diff: `python3 reference/qa-reports/ENG-27/r28diff-27h.py.txt <stage> r28-27g/<st>-base.jsonl r28-27g/<st>-head.jsonl <new>.jsonl`.
1. **Rule 28 re-diff for the NARROWED boardHop (this head), 2-1..2-6, 40 seeds both settings: RUN NOTHING YET ON IT.** Trees: 2-1, 2-2, 2-4,
   2-6 on this head; 2-3 on origin/t-build-23 66775dabf; 2-5 on origin/t-build-25 6ddeeead2 (the trees r28-27g's base/head rows ran on, so
   only new head rows are needed: about 40 min on 4 cores, 24 jobs of 10 seeds). The lead's bar: no flip from a wrong read; every moved row
   explained (bhReads > 0); no tier count drops. Then for every moved row run bhev-27h.ts.txt (`_bhev.ts <stage> bot:setting:seed ...`): any
   life within 3 s after a boardHop read gets traced (r28trace-27h.ts.txt + r28cmp-27h.py.txt, NO_HOP=1 for the comparison run; the trace
   needs `(globalThis as any).__run = this;` at the top of pad()). The first cut (a235ceec1, a single wherever a log crossed the lip) gave on
   2-2: 46 moved, no new flip, no count drop, but 4 lives right after its read (middle N 3, 6, 17; expert N 10): middle N 17 traced, the single
   from a stand 35 px back came down 20 px past log 79's front (75 px out) where the double reached log 80. Hence the refinement here: a single
   only where hopLandsOn says a single comes down on a log. Rows of that first cut are obsolete (not committed).
2. pacerLay 19/19 was run on the FIRST cut only: re-run it on this head (and it is in the merge check below).
3. The merge: origin/t-eng-ground at the lead's green hash (ENG-GROUND-d). --no-ff. Trial merge on ef38ee2fd: two conflicts as ENG-27g mapped:
   engine-core.md (two new sections at one spot: keep both; replace our "groundStack (NOT merged here yet)" line with its real line) and
   w2.ts lip(): ours `p.y >= y - 2 && p.y <= y + LIP_RISE` (never over the fall's height) sits inside theirs `p.y <= y + LIP_RISE && p.y >= y -
   LIP_RISE`; settle by both sides' tests. After: tsc + pacerLay 19/19 + pacerBehindBanks + groundStack + legsHome + postLay + firsttimer.test.
4. The packet's steps 3-5 (UNDONE): race table on the merged head (raceprobe-27e.ts.txt; home and post, seeds 1-6, both settings, middle /
   expert / ride-only; any middle or expert loss traced; the named log-front walk-off is not to fix unless it loses a race); stills 2x both
   ways (boat waiting, setting off, docked; door and letter) and THE CLIP of the race leg (cliprec-27e, D63); THE FULL SET (gates.md D96;
   lockall vs 0eefc707e: only the toy; funcheck same-run vs main; git fetch --unshallow first). Then REPORT, "What the 2-7 builder needs".

## ENG-27h: what was done
- **Step 1, the 8 flips: TRACED and ACCEPTED by the lead** (trace-27h.txt): all 8 the boarding hop, all shifted draws after a right read. The
  kid's late lift-off (R-165.59) holds his steer through the wait, so his path is the same and only his draws move; base's air press off a
  log's front made the coyote window and head's did not (2-1, 2-2); on 2-4 the pairs part at the first log river and the extra lives come
  80-150 s later at spots base also loses lives at. The skill lowers those bots' totals (2-1 kid N lives 229 to 193, rescues 11 to 8).
- **A wrong read found off the 8, the lead's GO to narrow:** 2-2 child N 36, jumpFor read the gap past the log under the lip as a double
  over it into the water. **SKILLS.boardHop** (firsttimer.ts jumpFor, logAcross, singleLands): a log his way across the lip, a step down,
  where a single from here comes down on a log: a single. Planted (firsttimer.test, 12/12): the read in a toy (RED with it off; controls:
  a log only 40 px out, plant-checked RED without singleLands; no log; all under the bank; against the flow) and the run it was found on
  (2-2 child N 36, no life within 3 s of such a stand; RED with it off) with middle N 17 as a guard (NOT plant-checked against the first cut).
  tsc clean. Child N 36: 7 lives to 3, the boarding a single onto log 79.
- NOT done: the re-diff on the refined skill, the merge (no hash yet), the race table, stills, THE CLIP, THE FULL SET.

## Lessons applied
D57/D87 (inbox at every step and push), D102 (lean reads; handed over at the call), D109 (no clock times in messages), LAW 3 (each trace
claim checked: rows re-made, draws counted, the liana catch read off the engine), rule 28 (every flip traced; the narrowing's own lives
traced before trusting its re-diff, which caught the first cut's short single).

# ENG-27g REPORT (handed over at the context line). Base 64d1b14f8; branch t-eng-27, head: this commit
## EXACT NEXT STEP (ENG-27h, from t-eng-27 head; read only this section, D90)
0. Setup: `npm install --legacy-peer-deps`, then `git checkout package-lock.json`. Worktrees are 2.7 GB each and the disk fills: make
   them sparse (no reference/ except reference/qa-reports/R-165.59/), as ENG-27g's mkwt.sh did (below). Probes: copy each .txt here to
   tools/inspect/_<name>.ts, never commit. ENG-27g's rule-28 runner and patch: r28-runner-27g.ts.txt and r28patch-27g.py.txt here.
1. **Rule 28 for SKILLS.boardLog (c92cf743c): RUN, RED on 8 flips, TRACE THEM FIRST.** Rows and diffs: r28-27g/<stage>-base.jsonl,
   -head.jsonl, -diff.txt (base = both of ENG-27g's skills off, head = both on, the same frozen tree; 2-3 on origin/t-build-23, 2-5 on
   origin/t-build-25 with both hunks, r28patch-27g.py.txt; runner r28-runner-27g.ts.txt; diff r28diff-27g.py.txt).
   - 2-3: base = BUILD-23e 360/360; 75 moved (all the take-off read's; the hop moves none), no flips. 2-5: base = BUILD-25d 360/360;
     214 moved (104 take-off, 170 hop), no flips. 2-6: 0 moved.
   - 2-1: 310 moved, P->F 1 (kid Normal 11), F->P 4. 2-2: 155 moved, P->F 1 (kid Normal 4), F->P 5. 2-4: 337 moved, P->F 6 (kid
     Normal 9, 10, 16, 22, 27; adult Normal 18), F->P 8. Every pass count rose (2-1 kid N 32->35; 2-2 kid N 24->28; 2-4 kid N 30->31,
     adult N 38->39); every moved row has a read a skill changes on its base run (no row unexplained). But the lead's bar is NO flip.
   - Do next: trace the 8 P->F (two runs per cause: the death probe death-27e.ts.txt, or the runner with an onFrame), find whether
     each is the hop's or the take-off read's and at what x, and fix where the cause lives or bring the lead the trace. The kid and
     adult (first-timers) are touched by the hop: it sits in the edge read every bot shares. Then send the lead the table.
2. The merge: origin/t-eng-ground at the hash the lead sends (ENG-GROUND-c has one more fix first). --no-ff. Two conflicts known
   (trial merge on 3e805121d): reference/handoffs/engine-core.md, and src/game/gen2/worlds/w2.ts `lip()` in banks(): this branch has
   `p.y >= y - 2 && p.y <= y + LIP_RISE` (ENG-27e: never over the fall's height), t-eng-ground `p.y <= y + LIP_RISE && p.y >= y - LIP_RISE`
   (ENG-GROUND-b). Settle by running BOTH sides' tests: legsHome, pacerLay, pacerBehindBanks, postLay (this side) and groundStack (its).
   After: tsc + pacerLay 19/19 + pacerBehindBanks + groundStack + legsHome + postLay; engine-core.md's groundStack line.
3. The packet's steps 3-5 (UNDONE): the race table on the final head (home and post, seeds 1-6, both settings, middle / expert /
   ride-only; any middle or expert loss traced); stills 2x both ways (the boat waiting, setting off, docked; the door and letter) and
   THE CLIP of the race leg (D63; ENG-27e's tools, cliprec-27e); THE FULL SET (gates.md D96; lockall vs 0eefc707e: only the toy;
   funcheck same-run vs main; git fetch --unshallow first).
4. A second fault, NOT fixed (name it to the lead): after boarding, riding a log his way at full speed, he can still run off its front
   (2-7 home Easy seed 2 with the boarding hop: x 11554 off log 57; 9974; 5567). Lives lost per home race with both skills: 2-10.

## ENG-27g: what was done
- **Step 1, rule 28 for the take-off read: ACCEPTED by the lead.** Baselines re-run: 2-3 (t-build-23 unpatched) = BUILD-23e 360/360,
  2-5 (t-build-25 unpatched) = BUILD-25d 360/360 (castdiff-2-3-27g-base.txt, castdiff-2-5-27g-base.txt). Child Normal 30 traced
  (trace-27g.txt 1): the whole fix doubled three of his jumps, all over water; the rescue at x 20968 came from shifted draws, so the
  water-only candidate narrowed nothing. Both 2-7 misses were jumps from a STAND (post 5: 165 px before a 133 px pond; post 4: 107 px
  back on a log); running singles carry 207 px from a press 70 px back (flownArcs single-hold from70). Narrowed (5ef30a5cc): the
  run-up counts only from a stand (under 10 px/s), over water (wetBetween, FIX-21's read made one helper), and while a single can
  carry it. Re-diff: 2-3 75/360 moved, 2-5 104/360, no flips, every tier's pass count held, every moved row a stand over water the
  skill changes on its baseline run (75/75, 104/104; on 30 and 46 of them the baseline single splashed): castdiff-2-3-27g.txt,
  castdiff-2-5-27g.txt, rows castrows-2-3-27g.jsonl / castrows-2-5-27g.jsonl. A stand-only first try (no water test) moved 96 of 2-3,
  some at dry pits (castdiff-2-3-27g-stand.txt). tierBots 1-1 9/9 (tierBots-27g.txt).
- **pacerLay went 17/18 on the narrowing** (home Easy seed 1, middle: 98.4 s vs 97.53): traced (trace-27g.txt 5) to a pre-existing
  walk-off, the bot running off a bank lip onto a log drifting his way still mostly under it, then off its front; 2-4 of the 4-8
  lives EVERY home race lost. The lead: GO, fix it where it lives.
- **SKILLS.boardLog (c92cf743c):** a log drifting his way, a step down, less than half its length past the lip, is no floor ahead, so
  he waits and hops on (the ride wait). Planted (pacerLay.test, home Easy seed 1: wins with it, RED without). With it on, both post
  races win whether the take-off read is on or off (post 5 by 8.1 s with it, 1.0 s without), so the take-off plants run with the
  boarding hop off (where their misses happen). pacerLay 19/19 (pacerLay-27g.txt). Home races, middle, seeds 1-3 both settings: all
  six win with both skills.
- Rule 28 for boardLog: RUN (step 1 above: 8 P->F flips on 2-1, 2-2, 2-4, untraced). NOT done:, the merge (no hash yet), the race table, stills, THE CLIP, THE FULL SET.

## Lessons applied
D57/D87 (inbox read at every step and push), D94 (both baselines re-run before any diff), D96 (gates named UNRUN), D102 (lean reads;
handed over at the line), D105/D109 (no clock times in messages), LAW 3 (a prediction from a collapsed probe was wrong by 80 rows:
checked against the real diff before claiming it), rule 28 (every moved row traced to a read the change makes; two runs per cause).

# ENG-27f REPORT (handed over at the context line; written 2:17 PM ET 11-21 by date). Base 0d8d56a65; branch t-eng-27, head: this commit
## EXACT NEXT STEP (ENG-27g, from t-eng-27 head; read only this section, D90)
0. Setup: `npm install --legacy-peer-deps`, then `git checkout package-lock.json`. Probes as .txt here (copy each to tools/inspect/_<name>.ts,
   never commit): raceprobe-27e (`middle,expert,ride home|post [seeds]`), splash-27f (pond put-backs and falls per run: `middle home,post`),
   jumps-27f (frames and re-placements: `tier setting seed home|post [clk0 clk1 every]`), trapx-27f (who wrote his x), riv-27f, under-27f
   (the laid platforms/rivers in an x window), racetrace-27d, death-27e, ride-27e.
1. **Rule 28 for SKILLS.fromTakeoff (d54a47d42)**, the lead's ask: a row-for-row castBots diff on 2-3 and 2-5, and tierBots 1-1 9/9.
   Trace any moved row, or narrow the fix.
   - 2-3 DONE, RED by the rule: castdiff-2-3-27f.txt. On origin/t-build-23 66775dabf with the jumpFor hunk only, against BUILD-23e's
     castbots23e-rows, 183 of 360 rows moved: kid and adult 0; child, middle and expert 33-38 of 40 each. One pass flips: child Normal
     seed 30, P to F (a rescue, time 401.8 to 438.2). The rest are time shifts: any changed jump shifts every later random draw.
     Rows: castrows-2-3-27f-fromTakeoff.jsonl.
   - Do next: (i) confirm the baseline. Run t-build-23 unpatched; it should equal castbots23e (ENG-27e matched Easy 160/160).
     (ii) Trace child Normal 30, two runs per cause. (iii) Narrow the fix and re-diff. Candidate: count the run-up only over WATER
     (the gap between the lip and the landing holds a river or a safe pond, like FIX-21's `past` read): both of 2-7's misses are over
     water. Or ask the lead whether wholesale time shifts with no pass change are accepted.
   - 2-5 NOT DONE: the run here was edited mid-run and is discarded. Do: castBots 2-5 --seeds 1-40 --bots kid,adult,child,middle,expert
     --setting both --rows, on this head with and without the hunk, against reference/qa-reports/BUILD-25/castrows-2-5-25d.jsonl.
     A worktree per run: two runs in one tree race on firsttimer.ts.
   - tierBots 1-1: NOT RUN (`npx tsx --test tools/inspect/tierBots.test.ts`).
2. **The table on the final head (both fixes)**: raceprobe home and post, seeds 1-6, middle/expert/ride, both settings, plus splash-27f.
   Trace every loss (rule 28). Known with the bot fix on the OLD floor (race-27f-fromTakeoff-oldfloor.txt): middle 23/24; post Normal 4
   and 5 now WIN (+1.6, +3.0); NEW losses: middle post Normal 6 (-0.7, four falls) and expert post Normal 4 (-1.1, six falls). No fall
   follows a jump the fix turned into a double: the falls moved with the shifted draws. Ride-only home Easy 1 won +1.5: check its last
   crossing.
3. The packet's step 0: merge origin/t-eng-ground when the lead sends its green hash (--no-ff; tsc + pacerLay 18/18 + pacerBehindBanks
   5/5 + groundStack + legsHome + postLay after). Then the stills and THE CLIP (packet step 2; ENG-27e's commands in the section below),
   groundStack's line in engine-core.md §0zq-27f, and THE FULL SET (gates.md D96; lockall vs 0eefc707e: only the toy may move).

## ENG-27f: what was done
- **Step 1, the race table after ruling A** (dc7b583e8: race-27f-after-ruling.txt, trace-27f.txt). Middle home 12/12 WON. Middle post
  Easy 6/6; post Normal LOST seed 4 (-1.0) and seed 5 (-8.3, NEW: before ruling A it won only by the rewind of a docked boat). Expert
  Normal 12/12 WON. Ride-only 21/24 lost; its 3 wins each fell on the last crossing (named, not judged).
  - CORRECTION to trace-27f's pond line: the bot did NOT read the notch as a step down (its `drops` was false). It took a single from
    157 px before the pond (jumpFor sized the gap from the lip), then late presses and standing jumps from the put-back spot.
- **(b) the floor, the lead's ruling (1)** (4a7584fb4). pacer.ts riversLeft: after a fall the floor counts each crossing left from the
  respawn, never more than a clean run's margin, never less than one floor; the ride-only cap holds except on the last crossing.
  Planted on post Normal 4: RED on the one floor (2.0 against 2.29: red-27f-floor-single.txt) and per crossing alone (12.6 against a
  clean 6.59: red-27f-floor-percrossing.txt). Two assertions that pinned the one floor now read the ruled rule. pacerLay 16/16.
  - PUSHBACK taken: per crossing alone, an early fall paid 5 s. Post 4's loss was the hop's (a), not the floor's.
- **(a) the bot** (d54a47d42). SKILLS.fromTakeoff: jumpFor counts his ground to the lip with the gap. One root under both misses (the
  pond single from 157 px back; the log hop from 107 px back toward a bank 77 px past the log's front). Planted in pacerLay.test, post
  Normal 4 and 5, RED with the skill off (red-27f-fromTakeoff.txt: 101.5 and 111.7 s against 100.76 and 103.44). pacerLay 18/18; tsc
  clean.
- **Step 3, engine-core.md §0zq-27f** written (groundStack's line waits for the merge).
- NOT done: the merge (no green hash yet), the stills and THE CLIP, THE FULL SET (every gate UNRUN on this head), and rule 28's rest.

## What the 2-7 builder needs
- **The dock rule:** the race is judged at the far bank of the last river that holds the boat whole (lay (A)). DOCKED 0. A docked boat
  stays docked.
- **Fairness after a fall:** the boat is re-placed from the RESPAWN point. It keeps at least one floor (2 s Normal / 3 s Easy) for each
  crossing left, never more than a clean run's margin. Off the last crossing the ride-only cap holds, so a fall a river back with a slow
  log wait can still lose: the middle bot's clean play is what wins.
- **The ground rule (groundStack, t-eng-ground):** not merged here yet. Until then the waiting boat is hidden under the out leg's earth.
- **The bot:** 2-7's tier rows depend on SKILLS.fromTakeoff, and its rule 28 is open (step 1 above).

## Lessons applied
D57/D87 (inbox read at every step and push; long runs in the background), D63 (the clip is still owed: named, not skipped), D94 (2-3's
baseline is BUILD-23e's committed rows on the integration branch, and the baseline re-run is step 1 (i)), D96 (THE FULL SET named as
UNRUN, not claimed), D102 (lean reads; handed over at the line), D105/D109 (no clock times in messages), D107 (none), LAW 3 (my first pond
cause was wrong; checked the fact, corrected it to the lead and here).

# ENG-27e REPORT (handed over at the lead's D102 call; written 1:38 PM ET 11-21 by date). Base 580344077; branch t-eng-27, head below
## EXACT NEXT STEP (ENG-27f, from t-eng-27 head; read only this section, D90)
0. Setup: `npm install --legacy-peer-deps`, then `git checkout package-lock.json`. Probes here as .txt (copy to tools/inspect/ with a
   leading underscore, never commit): raceprobe-27e (`_raceprobe.ts middle,ride|expert home|post [seeds]`; expert has no Easy bot, its
   rows print 'no bot'), racetrace-27d (marks vs the bot), death-27e (`_death.ts tier setting seed home|post`: the 40 frames before each
   life lost), ride-27e (ride-only: lives lost, the clock's re-placements), cliprec-27e (the clip's recorder). Vite dev on 5199
   (`npx vite --port 5199 --strictPort --host 127.0.0.1`); PW=/opt/node-tools/node_modules/playwright/index.mjs.
1. **The race table re-run after ruling A** (the lead: "Middle Normal home 4 and post 4 should win, and any that still loses gets named
   and traced"): raceprobe on home and post, seeds 1-6, middle / expert / ride, into a file. Compare with race-27e-pre-ruling.txt
   (head d3d1d3f15, before ruling A). Trace any middle loss with death-27e + racetrace (seed, x, frame, what took him; rule 28).
   pacerLay.test is 15/15 on 316a7a18e (pacerLay-27e-bots.txt).
2. **THE CLIP (D63)**: the tool is built and tested on 200 frames (it paints on the real page): `npx tsx tools/inspect/_clipRec.ts middle
   normal 1 <rec.json>` (about 35 MB; the race leg of the fixture's roll, POST_CODE seed 1; it WON 99.2 s against 103.21 s before ruling
   A), then `node reference/qa-reports/ENG-27/clip-27e.mjs 5199 <rec.json> <out> sideways` and `upright` (about 1,900 shots each at 2x;
   ffmpeg joins them at 15 fps; its log names every shot where the boat's box is in view). Look at it whole. Known before you start:
   the first stretch of the race leg runs UNDER the out leg (race point 16519 to the out leg's x0 14049 on seed 1) where the out leg's
   painted earth is drawn over the race leg's river (stills 3), so the boat is hidden there until ENG-GROUND's ground paint lands; and
   the boat is drawn only over water (the lead's ruling (a)): over a bank it is behind the bank. Count and name the shots without it.
3. engine-core.md (ENG-27e's packet step 4, not reached): one line each: the pacer (shares, floor + cap, the floor uncapped on the last
   crossing, a docked boat stays docked, DOCKED 0, lay (A), the lane counts the wait river); pacerWaters closed at both ends; the post;
   'under'; w2NextArt; the home fixture; w2.ts banks() on the fall's own storey.
4. THE FULL SET on the final head (gates.md D96; run-gates-27c.sh): lockall --layouts 16 vs 0eefc707e (only the toy may move; ENG-27e's
   bank scan says no listed World 2 stage moves from banks()), funcheck same-run vs main, drawcheck (the pacer's window now also takes the
   rivers touching its ends: no new draw on a stage without a pacer). Any gate without a verdict is UNRUN.

## ENG-27e: what was done (each step, each plant)
- **Step 1, the Easy put-back (d3d1d3f15):** traced by trapping every write to his x/y at frame 2583: engine.ts:2971-2972, the teaching
  river's splash (`river.safe.backX/backY`), on a pond built by src/game/gen2/worlds/w2.ts `banks()`, which took the TOPMOST solid at each
  lip with no floor; on the toy's stacked legs the out leg's ground (id 10, y 680) starts at the race-leg pond's far lip (14821), so the
  splash set him 846 px up. riverAt was right; not one of ENG-26f's four x-only reads (none touches w2.ts), so nothing was cherry-picked
  (the lead agreed). Fix: a bank lies on the fall's own storey (from its height `y` down to LIP_RISE under it). Evidence it moves only
  the toy: all 744 falls and 576 log rivers on 2-1..2-10 x 16 layouts x both settings have one bank candidate per lip, none above y; on
  the toy 5 falls had two (Normal seeds 3, 4, 5; Easy 2, 5). Plants (legsHome.test, RED on 580344077: red-27e-pond / red-27e-play):
  a pond sets him back on its own storey (6 seeds x 2 settings; RED Normal seed 5 at y 730 on a 1503 bank); no one-frame lift off the
  race leg without a life (RED middle Easy seed 2, frames 2584 and 4112).
- **Rule 28:** tierBots 1-1 9/9 PASS. Easy castBots row for row: 2-3 (origin/t-build-23 + the fix) 160/160 identical to BUILD-23e's
  castbots23e-rows; 2-5 (on this base) 160/160 identical base vs head.
- **Step 2, the race table (before ruling A; race-27e-pre-ruling.txt):** middle Easy 12/12 WON (home Easy 2 now +6.3 s, was -0.1);
  middle Normal 10/12, LOST home 4 (-0.1 s; the fix moved it from +2.9: a different early pond changed his timing, and he fell at the
  last river: a hop off log 96's end at x 1353 toward the bank 125 px away peaked 19 px over its top and met its side, frame 4691) and
  post 4 (-1.0 s, the same on the base: three short hops into log rivers, x 13707, 6109, 2582); expert Normal 12/12 WON; ride-only 23/24
  lost, WON home Easy 1 by 0.43 s (on the base too). pacerLay.test was 3/4 on base AND head: ENG-27d's run stopped at its first
  assertion and hid the ride-only one. PUSHBACK-27e.md traced every miss to one root (a fall on the last river, then pacerReplace):
  (i) a DOCKED boat was rewound by a later fall (post Normal 1 and 3 ride-only had lost by 13 s and raced again); (ii) after a fall on
  the last river the race is one crossing, and the capped floor served neither guarantee.
- **The lead's ruling A (316a7a18e):** (i) pacerPiece.respawn: a docked boat stays docked (RED on the old piece: 95.37 -> 27.22,
  red-27e-docked-oldpiece); (ii) pacer.ts pacerReplace: on the LAST crossing (past the far bank of the river before the last) the floor
  holds uncapped; farther out the ride-only cap stands (RED on b05eeac5d: red-27e-lastcrossing). pacerLay.test: every race claim its own
  test (12), the ride-only claim names and excludes a fall on the last crossing, with why (the floor is the child's safety net; falling in
  is not winning without effort). GREEN 15/15; named: ride-only Normal 2 and Easy 1 fell on the last crossing and won (not judged).
- **Step 3, a find in the stills (b05eeac5d):** the waiting boat (and the boat setting off) was NEVER drawn: pacerDraw.ts pacerWaters kept
  rivers strictly inside the race point..dock window, and the river it waits over starts AT the race point; and pacerLay's lane (the
  lowest surface) left that river out, so a lower wait river was cut too (home seed 6). Fixed both; planted pacerBehindBanks 5 (wait
  and dock drawn whole, home and post, both settings, seeds 1-6; RED home Normal 1, then seed 6). ENG-27d's "seen at both ends" held in
  its lay test, not on the page.
- **Stills (stills-27e/, 2x, upright and sideways, fixture seed 1, Normal):** 1 the door shut with the letter in its slot; 2 at the door,
  open, +100; 4 the boat setting off beside him over the first river (drawn now, but DIM: this stretch runs under the out leg); 5 docked
  at the last river's far bank. **3, the boat waiting: NOT seen** (ROUGH, named): the out leg's painted earth covers the first race river
  under it (he stands in front of a wall of earth). The ground paint is ENG-GROUND's (t-eng-ground, not yet pushed when I looked).
  The clip: NOT made (the tool is ready, step 2 above).

## Gates (316a7a18e): tsc PASS; legsHome 7/7; pacerLay 15/15; pacerBehindBanks 5/5; postLay 3/3; tierBots 1-1 9/9 (on d3d1d3f15).
Every other gate UNRUN (THE FULL SET is step 4 above).

## What the 2-7 builder needs
- The dock rule: the boat waits with its bow at the far bank of the race leg's FIRST river that holds it whole and docks at the far bank
  of the LAST; the race is judged at the dock line; a docked boat has won and no later fall rewinds it; after a fall on the last crossing
  the boat keeps the setting's floor (Normal 2 s, Easy 3 s), farther out the floor is capped by the ride-only bound.
- The ground paint is ENG-GROUND's: until it lands, the race leg under the out leg is buried by the out leg's earth (the wait unseen).
- A soft fall's splash pond takes its banks on its own storey (w2.ts banks()); on stacked legs a lip can have two candidates.

## Learned (for the next engine member)
- A test that asserts many claims in one body hides every claim after the first miss: one test per claim (the lead's ruling).
- "Seen" proven in a draw test on a toy box is not seen on the page: shoot the state (wait, set-off, dock) on the real page, fresh page
  each (a spot that sets the race off spoils every spot after it).

Lessons applied: D57/D87 (ReadNotifications at every step and push; long runs in the background), D63 (the clip named NOT made, its
tool ready), D75/D101 (proven on the laid toy and the real page), D96 (gates named UNRUN, not passed), D102 (read by greps and ranges;
handed over at the lead's call), D105, D107, D109 (no clock times in messages).

# ENG-27d REPORT (handed over at the lead's D76 call, real context ~339k; written 12:59 PM ET 11-21 by date). Base 0eefc707e; branch t-eng-27
## EXACT NEXT STEP (ENG-27e, from t-eng-27 head; read only this section, D90)
0. Setup as ENG-27c's step 1 (npm install --legacy-peer-deps, restore package-lock.json). Probes kept here as .txt (copy to tools/inspect/
   with a leading underscore, never commit them): raceprobe-27d.ts.txt (`npx tsx tools/inspect/_raceprobe.ts middle|expert|ride home|post
   [seeds]`; expert has no Easy bot, so its Easy rows throw), racestart-27d.ts.txt (per-frame x/y/down/clock/checkpoint/softAt in a frame
   window), racetrace-27d.ts.txt (the bot's time at each flown mark against the estimate), jumps-27d.ts.txt (every frame he moves > 150 px).
   Stills: race-stills-27d.mjs (DSF=2 for 2x; PW=/opt/node-tools/node_modules/playwright/index.mjs; vite on 5199; shoot on-river spots LAST:
   a spot on a log carries him on the next spot).
1. **THE EASY PUT-BACK (the lead's ruling: fix it in this packet, Option 1; a PLAY change, so rule 28 applies).** Symptom: HOME_CODE Easy
   seed 2, middle bot: on the race leg he drops into the dip at x 14724-14821 (moss_stone piece id 42, top 1530, h 90; banks 14486-14724 and
   14821-15189 at 1470) and at frame 2584 he is set at (14891, 680), on the OUT leg's piece 14822-15102 (id 10), with no life lost and no
   bot rescue (rescues 0). The boat keeps racing, he walks the out leg and the column again, and he loses by 0.08 s. Same jump at frame 4112.
   What it is NOT: softFall/heartFall's softAt. softAt was ON the race leg {x 15000, y 1470, x0 14821, x1 15189} at frames 2570-2583,
   and only became (14891, 680) at frame 2585, after he stood there. No river, no safe pool (st.safeWater null), no down beat.
   NEXT CHECK: what moves him in the frame he is at (14788, 1500) falling into the dip. Suspects, by x alone on a stacked leg: (a) the
   side-push / unstick out of a solid's box (he enters id 42's box from the side and the push puts him on the top of the platform found
   by x: id 10 at 680); (b) a step-up or ledge-grab that picks the top surface at x without his y; (c) a kit's pit/pond set-back (w2Finish).
   Method: in racestart, at frame 2583 copy the engine, step once with a recorder on player.x/y writes, or grep engine.ts for code that
   sets p.y from a platform's y and a find() by x alone (`q.x <= p.x` without `q.y` near `p.y`). Fix the lookup to his leg (as ENG-27b
   did for riverAt), planted RED on this frame (a test: after the race leg's first flag, no frame lifts him from y >= Pacer.yMin to
   y < yMin without a lost life). The flag-as-put-back line the lead approved is NOT made: softAt was right, so it was not the cause;
   make it only if the trace shows a put-back reads softAt.
   Rule 28 after the fix: tierBots 1-1 still 9/9 (npx tsx --test tools/inspect/tierBots.test.ts) and a row-for-row castBots diff on Easy
   for the stages with committed rows (2-3: BUILD-23e rows on origin/t-build-23; 2-5 if on this base). Trace any moved row or narrow the fix.
2. **Then the race table, both settings, after the fix:** raceprobe on home and post, seeds 1-6, middle / expert / ride. Every number in
   the table; name the middle's thinnest win; any middle loss at 7%: which roll and why (racetrace: the mark where he falls behind,
   respawns, log waits). Then `npx tsx --test src/game/gen2/pacerLay.test.ts` must be 4/4 (its bot test is RED today on middle Easy seed 2,
   96.4 s against 96.32 s, from step 1's put-back). A table on lay (A) WITHOUT the fix ran into this session's scratch and is lost with
   it: do not quote it.
3. reference/handoffs/engine-core.md (step 5 of ENG-27d's packet, not reached): one line each on the pacer (shares, floor + cap, DOCKED 0),
   lay (A) (bow race point, wait and dock at far banks, pacerShoreFaults), layer 'under' (the lead's condition 3), the post (postLay's
   cuts, petals.ts marked letters), w2NextArt.ts, the home fixture (?fixture=home, DEV only), and the softAt finding from step 1.
4. THE FULL SET on the final head (gates.md D96; run-gates-27c.sh): lockall --layouts 16 vs 0eefc707e (only the toy may move), funcheck
   same-run vs main (World 1's 22 ruled lines are standing debt), drawcheck PASS (the lead's condition 2: 'under' adds one drawPieces pass
   over the pieces list, no draw on a stage without a pacer), the test-link floor. Any gate without a verdict is UNRUN.
5. Stills of the WAIT and the DOCK under lay (A) (the lead: "your stills show the start"): the boat waiting with its bow at the first wide
   river's far bank, him crossing beside it, and docked at the last wide river's far bank; both ways, 2x. Then THE CLIP (D63, ENG-27d's
   step 3, not reached): the race leg with the boat in every frame, both ways; the door and letter stills on the OUT leg (a HIGH pick).

## ENG-27d: what was done
- **Step 2, the boat behind the banks (2460568a9; the lead's ruling (a) and its follow-up):** a fifth piece layer 'under' in
  stagePiece.types.ts (doc: over the river's body, BEHIND the ground's earth and every platform), drawn once in render() before the drawn
  platforms, the water's sheet and the painted ground (no protoArt hook needed: the painted ground is drawn after all of them). The pacer
  is on 'under' and shows only over the race leg's water (pacerDraw.ts pacerWaters/pacerShown: clipped to each river's x0..x1), its
  waterline on THAT river's surface: the toy's leg has rivers 1427-1507 apart (seed 3), so the lane alone would sink it up to 80 px; its
  ~100 px over its waterline against banks 42-120 px over the lane would show over the grass without the clip. Planted
  (src/game/pacerBehindBanks.test.ts, 4 tests): RED with the boat on 'back' (drawn after the ground) and RED with the clip removed
  ('241 px of it over the bank 0-560: floating over the land'; the high river sinks it); pieceHook.test has 'under' in the frame order.
  Stills 2x, upright and sideways: stills-27d/1-slipping-behind-bank, 2-back-out-of-bank, 3-on-river (looked at: the bow goes under the
  bank's lip and reeds with no hard cut; the hull sits on the water; logs pass in front).
- **The lead's dock ruling, lay (A) (this head):** the race point is the boat's BOW (pacerDraw.ts pacerHull: the hull trails it,
  PACER_SHORE 20 px); gen2/pacerLay.ts waits it with its bow at the far bank of the race leg's FIRST river that holds it whole (its
  length from its art, pacerLength, + 20 px each end) and docks it at the far bank of the LAST such river, so the race is whole flown
  crossings (a first try timed from mid-river charged him a share of a log wait he never pays: the ride-only bot won by 0.5 s).
  pacerShoreFaults (general, by name): its hull at the wait and at the dock lies wholly over one river's water; planted RED in
  pacerLay.test on today's old ends (the column's foot and the exit, both on land). Pacer's doc updated. DOCKED 80 -> 0 (the lead
  accepted): the race is judged at the dock line; 80 px on a log was a free ~1 s (the ride-only bot won by 0.17 s on it); the lay
  test's dock check now asserts no verdict 20 px short and one at the line.
- **Found, not mine (the lead: a separate packet):** wherever the race leg runs UNDER the out leg, the out leg's painted earth is drawn
  down over it (protoArt ground soil runs to the foot): seed 1 POST_CODE x ~14000-18600, Pokey walks in front of solid earth and the
  river at 14173-14911 does not show. stills-27d/4-race-leg-under-out-leg-buried-x14950-*.jpg.

## Gates (this head): tsc PASS; pacerBehindBanks 4/4, pieceHook 8/8, pacerLay 3/4 (the bot test RED: step 1's put-back, named above).
Every other gate UNRUN (THE FULL SET is step 4).

## What the 2-7 builder needs (adds to ENG-27c's list below)
- The boat is seen only over water: its race leg needs TWO rivers that hold it whole (241 px + 20 each end), one near each end; a roll
  without is refused by name. It waits beside the first one's far bank and the race is judged at the last one's far bank, not the exit.
- Stacked legs: the race leg under the out leg is buried in the out leg's painted earth (separate packet) and an Easy put-back can lift
  him to the out leg (step 1). Do not judge 2-7's Easy race before step 1 lands.

## Lessons applied: D57/D87/D105 (notifications at each step; two rulings sat ~10 min once while I traced: own miss), D30/D109 (times
from date, none in messages), D63 (the clip is named open, not skipped), D76/D102 (read lean; handed over at the lead's call),
D86/D96 (every unrun gate named UNRUN), D94 (lock base 0eefc707e named). D101 and D107 are not written anywhere on this checkout.

# ENG-27c REPORT (hand-over at the lead's context line, written 11:17 AM ET 11-21 by date). Base 0eefc707e; branch t-eng-27; code head ad23f8b0a
## EXACT NEXT STEP (ENG-27d, from t-eng-27 head; read only this section, D90)
1. Setup: `npm install --legacy-peer-deps` (restore package-lock.json after). Probes and the stills script are kept here as files:
   raceprobe-27c.ts.txt (copy to tools/inspect/_raceprobe.ts), race-stills-27c.mjs (copy to tools/inspect/, run with
   PW=/opt/node-tools/node_modules/playwright/index.mjs, vite on 5199; the toy is on the page as `?fixture=home[&seed=n]` or __play('2-97')).
2. GATES: ENG-27c started THE FULL SET at 11:15 AM ET on ad23f8b0a (run-gates-27c.sh: chain1 tsc + suite shards 1-6 + CI tool tests +
   tierBots + tipwalk + funcheck + coverage/registry/generality/known/roadmap/time/artcheck; chain2 every seed list --check + paintcheck
   0-2 + build + chunkcheck + clipcheck + kbdcheck + drawcheck + buildcheck; chain3 lockall --layouts 16 base 0eefc707e vs head). Its
   verdicts are appended below under "Gates" if ENG-27c lived to see them; any gate not listed there with a verdict is UNRUN: run it.
   lockall: ONLY the toy may move (no shipped stage has a pacer, a post or a marked petal: petals.ts's change touches marked letters only).
3. THE LANE: RULED (a) by the lead 11:18 AM ET: the boat passes BEHIND the banks (drawn behind the bank's front face: it slips out of
   sight over each bank and comes back in the next river), never in the earth, never floating over land. A draw change: planted (a test
   that the boat is drawn before the bank's face where a bank stands over its lane, RED when drawn over it) + stills both ways. Before: stills-27c/ show the boat on its lane (the race leg's lowest river surface, y 1524): over a
   river, sideways, it reads well (race-bank-both-ways-small.jpg right); upright it sits at the screen's left edge. Over a BANK the lane is
   42 px under the bank top: the hull would sit in the earth (pieces/pacerPiece.ts layer 'back'). Options to show the lead: (a) hidden
   over banks (drawn behind the bank: it 'closes on every river', 2-7.md); (b) a lane in front of the banks' water strip (layer 'front' at
   the bank's foot); (c) lift it over banks (reads as flying). Then: the door stills (him at a slot on the OUT leg: race-stills' spot picks
   the LOWEST piece under x, so for the out leg use a 'high' pick; ENG-27c's door shot landed him on the home leg, deleted) and THE CLIP
   of the race leg with the boat in every frame, both ways (D63): a bot run (homeRun 'middle' with onFrame) recorded, or the page with
   tools/inspect/clip.mjs.
4. Name for the 2-7 builder (below, "What the 2-7 builder needs").

## ENG-27c: what was done
- **Step 1, the shares (ff60ced1b):** PacerRow.margin is a share of the careful middle's time: seconds = min(middle x (1 + share),
  rideOnly - under); W2_RACE.margin {normal 0.07, easy 0.1}; TOY_RACE deleted (the toy races on W2_RACE). Planted: pacerLay.test asserted
  the share first, RED ('normal seed 1: 112.91 s against 105.41 s x 4'), then GREEN.
- **The lead's ruling (b), the respawn floor (ad23f8b0a):** PacerRow.floor {normal 2, easy 3}; pacerReplace keeps max(share x left,
  floor) of margin over his middle time left, the floor capped at the ride-only bound's share of the way left (the ride-only bot WON Easy
  seed 1, 116.6 vs 117.59 s, on the bare floor; the lead ruled the cap stands, 11:13 AM). Planted both ways in pacerLay.test (a respawn a
  fifth from the dock keeps 2 s, RED without the floor; near the dock never past the ride-only bound, RED without it). pacerReplace is
  written so the start is exactly 0 (the share made the old form 1.4e-14).
- **Step 2, the art (ad23f8b0a):** 2-7's 7 frames packed into src/assets/w2-next/w2-next.webp (2313x357, 175 KB; pack-w2-next.py) +
  w2-next.json; 7 catalog rows (from t-art-next, file = the sheet's cells, status 'packed and drawn by id', part ENG-27c) and
  catalog_master.py --emit (w2.json: mailBoat/B, doorOpen; cast.json: letter/B, reply/B). w2NextArt.ts loads and draws by inventory id;
  stageManifest 'w2-next' for a stage with a pacer or a post (stageManifest.test planted both ways); stagePreload starts it. pacerDraw:
  two rowing frames (0.35 s each), waterline on the lane (0.85 of the frame, measured), bow first (mirrored running right). postDraw: the
  shut door w2-props#door 170 px wide (patientDoor's), the open one in its box; letters/replies flutter (0.3 s) at the sheet's 3 cut px a
  unit. World 2's tables name frames on their own (artuse sees them). artUse PASS, artcheck PASS, no code-drawn stand-in.
- **Step 3, NEW 2 the post (ad23f8b0a, from ENG-27b's patch):** the bot failure had FOUR roots, each traced on the bots' own runs and
  fixed, planted: (1) a far bank's slot in the landing of a jump off a LOG (expert Normal 1: off the log 106 px short of the bank, down 172
  px in, over the slot; walkedSpan has no log footing): postLay cuts a full run's jump off the log at the bank's edge, and the take-off
  onto a log ahead; (2) a piece between two gaps the expert DOUBLES across (expert Normal 3): cut a double jump's landing off the piece
  behind; (3) the played stage's petal pass (petals.ts screenExtras) TOOK THE LETTER (middle Normal 3: the letter, lowered to his middle,
  was the lowest petal nearest its neighbours): petalTrail never thins a marked letter (no shipped stage has one); (4) petals inside a
  slot's clearance give way to it (the nearest becomes the letter, the rest are lifted) instead of refusing the spot. The post runs on its
  own toy code POST_CODE ('A Pg1> Xw1> R Fg1> R /D ...': 2-7's longer way out): 11 of 12 rolls lay 2 doors, Easy 6 refused BY NAME (the
  test asserts the name and >= 11 of 12); HOME_CODE stays the legs/race toy ENG-27 measured (homeKit lays the post only on POST_CODE). The
  door test now walks between the two doors, then onto the second. postLay.test 3/3, legsHome 4/4, pacerLay 4/4 (incl. the race bots).
- **The page fixture:** homeFixtureStage.ts, `?fixture=home[&seed=n]` / __play('2-97'), DEV only (as the wheel fixture), POST_CODE.

## The race table (the toy, ENG-27c probe; boat at the ruled shares; Normal 7%, Easy 10%)
HOME_CODE before the floor (seeds 1-6): MIDDLE Normal won 1 (+0.2 s), 2 (+2.9), 3 (+0.6), 4 (+10.8), 6 (+0.8), LOST 5 (-2.7: 4 respawns,
then -2.4 s on the last two crossings waiting for logs, 70-90 px/s against the flown 104-126); MIDDLE Easy won all: +5.6, +5.6, +2.0, +3.7,
+0.3, +0.2; EXPERT Normal lost 1 (-0.1), won 6 by 0.04 s, others +3.8 to +9.1 (no expert bot on Easy); RIDE-ONLY lost all 12 (thinnest
Easy 1 by 1.0 s, Easy 4 by 1.4). POST_CODE (the longer way out), seed 1 Normal: the middle lost by 0.77 s before the floor. The floor
(capped) is in; the table was NOT re-run after it: re-run raceprobe on both codes (seeds 1-6) for the final numbers.

## What the 2-7 builder needs
- The race is THIN at a 7% share: on the toy the middle bot won 5 of 6 Normal rolls, three by under 1 s; a roll's log phase on the
  last reaches decides it. Run the race bots on every listed 2-7 seed (not 1-3) and expect to drop rolls the middle loses; (c) the boat's
  time from the roll's own log phases is the named refinement (the lead: later, not now).
- The post asks wide WALKED ground on the way out: a door never stands in a log's landing, a double jump's landing, beside a flag
  (140 px) or nearer another door than 360 px. 2-7's 6 doors need a long out leg of flat bank; a roll short of room is refused by name.
- The lane over banks is open (item 3 above). The hand build w2Stages.ts '2-7' is the builder's to delete.

## Gates (head ad23f8b0a; verdicts appended as they finish)
Started 11:15 AM ET. tsc PASS (7 s) on ad23f8b0a. EVERY OTHER GATE IS UNRUN: the lead stopped ENG-27c at 11:19 AM ET (D76, real context
~375k) with suite shard 1, the seed lists and the lock's base record mid-run (partial log tails in gates-27c/, no verdicts). THE FULL SET
is ENG-27d's, on its final head after the boat-behind-banks draw change (run-gates-27c.sh, the same chains).

## Learned
- A pickup the engine lays AFTER the trail's pass is planned can still be taken by the pass in the PLAYED stage (buildGen2Stage has no
  petal pass; generateStage does): compare the built stage with the played one (sim.e.collectibles at frame 0) before blaming the lay.
- 'On his path' must include where every tier is in the AIR: logs (no footing) and optional doubles are both outside walkedSpan.
- A rule added by ruling can break another rule of the same feature (the floor let ride-only win): run the whole feature's bots after
  every rule change, not only the test the ruling names.
- Proposed level.md rule: "every pickup a mechanic lays on the path is checked in the PLAYED stage by the bots of every tier".

## Unresolved, named: the lane over banks (lead's call); the door/letter-into-slot stills on the OUT leg and THE CLIP (D63); the race table
re-run after the floor; the gates still running; reference/handoffs/engine-core.md NOT rewritten by ENG-27c (context line): ENG-27d adds
the pacer (shares, floor + cap), the post (postLay's cuts, petals.ts letters), w2NextArt.ts and the home fixture.

## Lessons applied: D30 (times from date; one hand-typed time slipped in a message at 11:00 AM, own miss, corrected), D57/D87/D105
(ReadNotifications at each step and push; long runs in the background), D76/D102 (read lean, handed over at the line), D86/D96 (the
full CI list in the runner, verdicts by name, UNRUN named), D94 (lock against the integration base 0eefc707e), D103 (rulings read
between steps).

# ENG-27b REPORT (stopped by the lead at 10:46 AM ET 11-21, D76: real context ~369k). Base 0eefc707e; branch t-eng-27; code head 5a579bb16
## EXACT NEXT STEP (ENG-27c, from t-eng-27 head; read only this section, D90)
1. Setup: worktree of t-eng-27, `npm install --legacy-peer-deps` (restore package-lock.json after). Every engine step below is on THIS head.
2. NEW 2 the post: WIP, NOT committed as code: `git apply reference/qa-reports/ENG-27/ENG-27b-post-wip.patch` (post.ts, gen2/postLay.ts,
   pieces/postPiece.ts, postDraw.ts (no-op until art), gen2/postLay.test.ts; hooks in pipeline.ts layChaseStage + PIECES_OF, types.ts
   Collectible.mark 'letter'|'reply', gen2/types.ts GraphBrief.post, stageGenerator.ts GeneratedStage.post, engine.ts draw hook, w2.ts
   W2_POST_ART, toyHome.ts TOY_DOORS 2). State: tsc PASS; postLay.test tests 1-2 PASS (slot on path on 12 rolls, planted RED 60 px up;
   a door opens on the pass); test 3 (bots) FAILS on 'middle normal seed 1: every letter posted' after the LAST edit (the slot search
   from the walked span's middle out in 20 px steps, SLOT_CLEAR = 2 x PICKUP_APART). Before that edit the bots posted 9/9 but 4 of 12
   rolls were refused ('only 1 route piece'). Find which door the run lacks (scratch probe: compare homeStage(1).post with the played
   stage's sim.e.collectibles letters: the played stage once dropped a NEW letter 38 px from a petal; the slot search may now take over
   a petal the played assembly moves). Then the 12 rolls clean AND 9/9 bot runs, commit.
3. The race margin as SHARES (the lead's ruling, 10:46 AM): PacerRow.margin becomes a share of the careful middle's time, Normal 7%,
   Easy 12% (2-7.md: 3/42.1, 5/47.8 → 0.07, 0.10; the lead said 12% for Easy: use the lead's numbers); pacerLay.ts seconds = min(middle
   x (1 + share), rideOnly - under); W2_RACE.margin {normal: 0.07, easy: 0.12}; DROP TOY_RACE (toyHome.ts) and use W2_RACE on the toy;
   pacerLay.test asserts the share. Re-run pacerLay.test: middle 6/6 ahead, ride-only 6/6 behind (on 5a579bb16 with TOY_RACE x2.5 the
   middle won 6/6, thinly: normal seeds 1, 3 by 0.2 and 0.6 s; expert normal 2/3, lost seed 1 by 0.1 s after 5 deaths).
4. ART (the lead did not rule against): pack 2-7's 7 frames (w2-next#mailBoat, #mailBoatB, #letter, #letterB, #reply, #replyB,
   #doorOpen; cuts at origin/t-art-next:reference/art/hfnext/cut/{boat,boatB,letter,letterB,reply,replyB,door-open}.png, catalog rows
   in t-art-next's CATALOG-MASTER.csv, file 'origin/t-art-next:...') into src/assets/w2-next/w2-next.webp (ENG-ROCK's precedent:
   21af89b4e), rows' file + frame rects, `tools/art/catalog_master.py --emit`; then pacerDraw.ts drawPacer (two rowing frames on its lane,
   ~240 px long against Pokey's 89.1) and postDraw.ts drawDoor / drawPostItem by those ids (w2-props#door is packed already). No
   code-drawn stand-in. Pacer.lane is the race leg's lowest river surface: judge it on stills (behind the banks on layer 'back' it is
   hidden over every bank; the design wants it beside him in every frame: the lane is the open question, show the lead first).
5. Stills of the toy upright + sideways, the whole screen (the boat beside him on the race leg, a letter going into a slot, an open
   door) and a CLIP of the race leg with the boat in every frame (D63). REPORT: the race table, "What the 2-7 builder needs".
6. THE FULL SET (reference/methods/gates.md, D96) on the final head, the suite in shards, lockall vs 0eefc707e, every list --check,
   coveragecheck (the race and the post must price), registrycheck, paintcheck, generalitycheck, tierBots.test, funcheck.
## ENG-27b: what was done (10:48 AM ET)
- Lockall (NEXT STEP 2): 102/102 unchanged, base 0eefc707e vs f2705ecd, 3264 builds each, byte-identical (two --out runs compared by
  --check's logic). Nothing shipped moved.
- Steps 2-3, one root (647e172d9): towerRoute.ts towerCorners left a column's last turn for after the stage's last leg: the bot reached
  the home leg's end, walked 17,500 px back to the column through every river and home again (56-94 lives), and at the column's last
  storey read the way on as straight down through its floor (~13 s, rescued). Now a column of a stage of legs climbs its own last turn
  at its foot (keyed on gen2.tower.legs: up/down towers unchanged). ENG-27's suspect wet() by x alone was ruled out first (a y-aware wet
  changed 0 of 6 rows). Planted: legsHome.test 'the column's last turn...' RED without (seed 1), GREEN with; toy 9/9 finish, 0 rescues,
  1-6 lives; seed 2 left 4 lives vs 6 laid right.
- NEW 1 (5a579bb16): pacer.ts, gen2/pacerLay.ts (rivers matched to flown rows by speed + log length: no RiverZone change), pieces/
  pacerPiece.ts, StageStats.race (badges.ts: the verdict; the medal itself is the Designer's), W2_RACE, SKILLS.race / SKILLS.rideOnly
  (firsttimer.ts), pacerLay.test (4 tests, RED for each bound and an unflown row; the respawn re-place; the bots). Type additions for
  the lead's review: GraphBrief.pacer, GeneratedStage.pacer, StageStats.race (and, in the WIP patch, GraphBrief.post,
  GeneratedStage.post, Collectible.mark 'letter'|'reply').
- RiverZone.way (ENG-27's field): a river in a leg laid left keeps the screen's dir (what the engine moves logs by) but must be judged
  in its own frame: riverFaults reads 'upstream' and 'with him' from dir relative to the way he crosses, and without `way` a fair
  river mirrored left reads as flowing against him (legsHome.test 'judged in its own frame' plants it). The alternative, a dir in his
  frame, would change what every engine reader of dir does; one optional field read only by the judge is the smaller change.
## Gates (code head 5a579bb16 unless named)
| gate | result |
|---|---|
| tsc | PASS (5a579bb16) |
| lockall vs 0eefc707e (f2705ecd) | PASS 102/102 |
| suite shard 1/3 (647e172d9) | PASS 1285/1286, 0 fail |
| suite shards 2/3, 3/3 (647e172d9) | UNRUN at stop (running) |
| seedlist --check 1-1..1-8 (647e172d9) | PASS |
| seedlist --check 1-9, 2-1, 2-2, 2-4, 2-5 | UNRUN at stop |
| legsHome.test, pacerLay.test (5a579bb16) | PASS |
| tierBots.test, THE FULL SET | UNRUN |
## Learned
- A stage of legs breaks every tool that assumed the route ends at the last section (towerCorners' leftover turn): when a bot's route
  looks wrong, print the route's corners before tuning the bot (one print found steps 3 and 4).
- A race decided by an absolute margin is only as fair as the leg is long: state margins as shares (the lead's ruling).
- The played stage can drop a collectible the build laid (the post's new letter 38 px from a petal): test a NEW pickup on the played
  run (homeRun), never only on buildGen2Stage.
## Lessons applied: D76 (stopped at the lead's line), D86/D96 (the full list named, the unrun named), D94 (reds are this branch's),
D101 (proven on the rolled toy, played the game's way), D102 (read by greps and line ranges), D103.

# ENG-27 REPORT (stopped by the lead at 8:33 PM ET 11-20, D76: real context ~427k). Base 0eefc707e; branch t-eng-27; code head 458315ba
## (ENG-27's) EXACT NEXT STEP for ENG-27b: DONE through step 4 and NEW 1; see ENG-27b above
1. Setup: worktree of t-eng-27, `npm install --legacy-peer-deps` (restore package-lock.json after: it is tracked).
2. UNRUN, run first: `npx tsx tools/engine/lockall.ts --layouts 16 --out lock-base.json` on 0eefc707e, then `--check lock-base.json` on
   t-eng-27: expect 102/102 unchanged (no shipped graph has a leg mark; levelCheck's run-leg rule and w2Finish's side read only flow 'legs';
   riverAt changes play, not layout). Then the suite in 3 shards (my run was on a mixed working tree: UNRUN), seedlist --check of every
   listed stage (riverAt + firsttimer.ts changed: D86's spread rule), tierBots.test, then THE FULL SET (gates.md) at ENG-27b's final.
3. Bots on the toy (step 0's last open item; `npx tsx reference/qa-reports/ENG-27/botTable.ts middle,expert normal,easy 1,2,3`,
   botTable-1.txt): seed 1 middle/expert finish both settings (192.8 s / 205.3 s, 2-4 lives, 1 rescue); seeds 2-3 drown in the HOME
   leg's rivers (56-94 lives, 900-1100 s). Seed 3 drowns with the home leg laid RIGHT too (probe18.ts: 76 lives): that roll's rows, not
   the left leg. Seed 2 is direction-sensitive (5 lives laid right, 56 left). First death traced (probe19.ts, t 92.1): he runs off the
   near (right) bank at full speed as a log slides out and lands in the 72 px gap. Suspect first: firsttimer.ts:2733 `wet()` reads
   rivers by x alone (the out leg's rivers lie over the home leg: use river.ts riverAt or the leg's own rivers), then the edge look
   (floorAt at p.x + dir*look). Re-run the table; planted toy: seed 2 left within 2x its right-laid lives.
4. The column rescue (every seed): the bot stands ~13 s on the down column's last storey (seed 1: x 18075 y 1217) and is rescued to
   the floor. towerRoute.ts towerCorners `within()` draws a straight diagonal down a no-vine descent (dropsDown): give it each storey's
   end, as it gives a vine field its vines. Planted: rescues 0 on the toy, seeds 1-3.
5. Then the packet's items 1-6: NEW 1 the mail boat pacer, NEW 2 the post, the `race` bot skill, the art by ART-NEXT-b's inventory ids
   (origin/t-art-next f4f724269, reference/qa-reports/ART-NEXT-b/REPORT.md; I did not open it: no id read, none wired), stills/clip.
## Step 0 (the READY toy, show first): DONE for the lay; bots partly (item 3-4 above)
- The toy: src/game/gen2/toyHome.ts `A Pg1> Xw1> R /D Dc_ /L Pf1< Pw1> Mg1> Ww1> R Sw1> E` on World 2's ground and river rows; laid by
  gen2 on a listed test row (tools/inspect/homeToys.ts: withTestStage + plantSeedList + w2Finish, ENG-26's pattern, D75). Map with the
  middle bot's path: toy-map-s1-normal.png (toyMap.ts).
- Planted (src/game/gen2/legsHome.test.ts, 5 tests; legs.test.ts +3): RED same-ground `/L` overlay refused BY NAME on every roll both
  settings ("legs: leg 2 (left) overlays leg 1 (right) ..."); GREEN `/D /L` clean on 6 seeds x both settings, home leg >= LEG_CLEAR (260)
  under the out leg, rivers on it dir -1 way -1, out leg's dir -1 unmarked, >=3 flags and >=10 petals on it, same stage from same seed.
  RED evidence: red-base-0eefc707e.txt (base: the toy throws "a river in a leg laid left is not mirrored yet"; without the shrine fix
  0 petals; without the verdict the RED test fails).
- Engine changes (all general, no stage id: generalitycheck PASS): legs.ts reflectLeg turns a left leg's rivers, logs, splash-back and
  riding petals (tail / wheel pond / sluice refused by name); legOverlaps + LEG_CLEAR; pipeline.ts: no throw for left-leg rivers, the
  start's back wall when a later leg lies beyond it, the overlay refused alone in checkStage (no repair swaps: refuseNotThrow's rule);
  river.ts RiverZone.way (Architect's type: a field ADDED, flag for review) + riverAt/RIVER_DEPTH 120; riverLay.ts riverFaults judges a
  left-crossed river in its own frame; levelCheck.ts hop limit relative to him, 'past the shrine' by the stage's travel, no link between
  two run legs; engine.ts water check by riverAt (was x alone: a life every frame on the home leg under the out leg's river);
  w2.ts w2Finish splash pond on a left leg sets him back on its right bank; firsttimer.ts bots follow the lay's route on a stage of legs.
## Gates (head 458315ba)
| tsc | PASS | generalitycheck | PASS (26 literals, 26 known) | legs.test + legsLay.test + legsHome.test | PASS (25/0 at 8:30 PM ET) |
| suite (3 shards), lockall vs base, seedlist --check (all lists), tierBots, castBots, coverage/registry/paint, drawcheck/clipcheck | UNRUN |
## Found, open (named)
- Inspector phantom (pre-existing): findRoute hops from the out leg's last bank to a way-down column's floor through its wall (levelCheck
  drop links do not see walls; legsLay's DOWN_CODE too). Bots no longer follow it on legs; the meter/coverage tools still read findRoute.
- engine.ts:3607 a SEALED door pushes him back to x - 35, vx -140: wrong way on a stage that ends LEFT (2-7 is a sprint: never seals).
- The toy's home leg is ~3x the out leg (chunkSeconds fills); a level's lengths are its builder's.
## Polish check: no stills/clip of the real page yet (the toy map only). Pushback: none. Learned: an out-and-back puts one leg UNDER another,
and every "by x alone" lookup (river under him, past the shrine, wet ahead, falls' links) breaks: grep `x > r.x0 && x < r.x1` first.
Lessons applied: D30, D57, D59 (the suite named UNRUN), D75, D94, D97. Turnover note: engine-core.md §0zq-27 added (top), this commit.
