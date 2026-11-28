# ENG-CATCH-f: the down tower never lays a catch twice, no two pieces of wood overlap, and the named check refuses any that do; onto t-eng-w3 (R-165.561)

## EXACT NEXT STEP
(box 5, ENG-CATCH-j, a TAIL, STOPPED ON A RED, written 7:50 PM ET Fri 11-27 by `date`; t-eng-w3 checked at 7a580aefc then)
NOT LANDED. The frozen candidate 192a433ae (code 9afeaf31c) fails 2 suite tests that pass on 7a580aefc: OURS, proven alone.
- src/game/gen2/darkBots.test.ts:578 (test at :576, "a dark stop holds at the lip ... child Easy roll 8, the rim at x 515, y 4375"):
  past=0, "the stop was held with his middle past the end". And :584 (test at :582, its noLipHold plant): unlit 0 !== 1.
- Alone (proof-j/dark8.txt): 7a580aefc 2/2 pass (16 s); frozen 192a433ae 0/2 (14 s).
- Why: the candidate trims 12 branch catches on draft 3-1 easy roll 8 and drops 1 (236 -> 235 solid). The trims start at y 1752
  (806-1180 -> 1077-1180), long before the rim. The wood at the rim (251-515 @ 4375, 137-531 and 531-815 @ 4497, 210-565 and
  658-861 @ 4778) is byte for byte the same (proof-j/3-1-easy8-wood.diff, all8.mts/near8.mts, read only). So the child's route
  changes upstream, and the pinned lip moment (his stop at 102.67 s, darkBots.test.ts:560) never happens. 3-1 is a draft, so
  the 102-stage lock never covered it.
- THE LEAD RULES (a tail writes no code): the fix is an engine packet that re-points these two rows to a roll where the lip case
  still happens on the new lay, with the same bar and plant (as 38e4892e did for noLevelRead), never a loosened bar
  (ENGINE.md:51: a test pins properties of a roll, not its x). Then that head goes through the freeze and the gates again.
- If the fix touches only darkBots.test.ts (no src/ or tools/ lay code), these carry over (D118): the suite's other shards
  2-6 (green) and the steps below that were not run.
NOT RUN this box (the red stopped the tail; all still owed, ALONE, each on the frozen tree of the next candidate):
  the CI tool line (gates.yml:157); tierBots; `seedlist.ts 1-4 --check`; castBots 1-4 both settings on the candidate AND on
  7a580aefc (`--seeds 1-16 --setting both --par 4 --rows <f>`, the bar runHolds castBots.ts:32; compare: proof-j/castcmp.py base.jsonl cand.jsonl <floor>); the
  normal-4 stills at y 10364, upright and sideways, both trees. Scratch tools ready in proof-j/: castcmp.py, shoot14.mjs (stills: <root> <port> <out> <label> 4 normal 1000 10364), near8/all8.mts.

## Box 5 (ENG-CATCH-j, a tail): the suite on the frozen tree; a red, proven ours; stopped before landing
(started 7:05 PM ET Fri 11-27 by `date`, on 192a433ae frozen; no code written)
- t-eng-w3 = 7a580aefc (`git ls-remote`, at the start and at the hand-over). Frozen worktree at 192a433ae: chattr +i on src/ and
  tools/, src/game/gen2/proven writable, `touch src/x`, `tools/x` and `src/game/gen2/x` -> "Operation not permitted"; `git diff
  --name-only 9afeaf31c 192a433ae -- src tools`: 0 files. A base worktree at 7a580aefc for the solo runs.
- THE SUITE, 6 shards (deploy.yml:38 glob, 3 at a time), verdict RED: 4189 tests, 4184 pass, 2 fail, 3 todo (proof-j/suite-totals.txt).
  1/6: 753, 750 pass, 2 fail, 1 todo (892 s). 2/6: 656/656 (996 s). 3/6: 749/749 (1170 s). 4/6: 685/685 (707 s).
  5/6: 725/725 (666 s). 6/6: 621, 619 pass, 0 fail, 2 todo (1236 s; its `not ok` is the TODO w1Arc19.test.ts:191, R-165.312).
  The 2 fails: darkBots.test.ts:578 and :584 (proof-j/shard1-reds.txt). Solo runs, OURS: 7a580aefc 2/2, frozen 0/2 (proof-j/dark8.txt).
  R-165.550 ctestPicker:78 (inherited, owned) did not fail in this run.
- Not run: the CI tool line, tierBots, seedlist 1-4, castBots, stills, landing (the red stops a tail; see the EXACT NEXT STEP).
- Lessons applied: D115 (frozen tree, chattr; each solo run in its own worktree), D59 (I waited for the suite past the box
  rather than stop with it running), D30 (stamps from `date`), D52 (cites checked last), ENGINE.md:51 (the fix is a re-point, not x).
- Polish check (box 5): no screen judged; the 1-4 stills are still owed, and the red stopped the box before them.
- Learned: the lock covers the 102 table stages, not the drafts. A lay change on a draft (3-1) shows up only in the suite's
  pinned-roll bots. A tail that freezes a lay change should run the draft-pinned tests (darkBots, w3*) FIRST, minutes, before the
  35-minute suite. Method update (dispatch-packet / gates.md): add "drafts the candidate's lay reaches: run their pinned-roll tests
  first, alone, on both trees".

## Box 4's EXACT NEXT STEP (superseded by the one above)
(box 4, ENG-CATCH-i, a TAIL, handed over, written 7:04 PM ET Fri 11-27 by `date`; t-eng-w3 checked at 7a580aefc then)
FROZEN CANDIDATE = code 9afeaf31c (frozen as 192a433ae: src/ and tools/ byte for byte 9afeaf31c's). The branch head after it
(origin/t-eng-catch-f, the hash in the lead message) adds docs only: engine-core.md §0zr-CATCH, lockbase-7a580aefc.json.gz, proof-i/,
this REPORT. So the gates' verdicts on 192a433ae carry to it (D118: no src/ or tools/ change). DONE: steps 1, 2, the LOCK (both runs)
and the turnover note. NOT DONE: the suite, the CI tool line, tierBots and the landing.
1. `git ls-remote origin refs/heads/t-eng-w3` must still be 7a580aefc; if it moved, stop and tell the lead.
2. Freeze 192a433ae in a detached worktree (dispatch-packet.md D115: chattr, src/game/gen2/proven writable), node_modules symlinked.
3. On the frozen tree, once each, with the verdict word and counts line: the CI tool line (gates.yml:157); the suite in 6 shards
   (deploy.yml:38, `--test-shard=i/6`, each shard's totals); `npx tsx --test tools/inspect/tierBots.test.ts`. Also, because 1-4
   moved and has a proven list (src/game/gen2/proven/seeds-1-4.ts): `npx tsx tools/engine/seedlist.ts 1-4 --check` (CI's
   seedlists job runs it; the packet's list did not name it). Every red: file:line, run ALONE on 7a580aefc (R-165.550 ctestPicker:78
   is inherited and owned: name it, do not fix it).
4. THE LOCK IS DONE, do not re-run it. Base on 7a580aefc: 3264 builds of 102 stages, 0 errors (lockbase-7a580aefc.json.gz). Check on
   the frozen tree: "lock: 101/102 stages unchanged"; 1-4 moved (platforms, collectibles, proto.dress), exit 1 without --intended.
   PROVEN by the overlap scan (proof-i/lockscan.mts builds as lockall does): the 14 moved builds (proof-i/moved-builds.txt) are EXACTLY
   the 14 of 32 whose old lay had same-height overlapping solid wood (55 pairs, 0 exact duplicates); the new lay: 0 pairs in 32.
   Re-check with `--intended 1-4` against the gz if the lead wants the exit 0 line.
5. Polish (box 2's ask; 1-4 is a shipped World 1 stage and its wood moved): one moved 1-4 build (e.g. normal 4: old 854-1054 over
   996-1176 at y 10364) still on a phone-sized screen, upright and sideways, where the trimmed plank meets wood end to end.
6. Land on t-eng-w3 by fast-forward (`git push origin <head>:refs/heads/t-eng-w3`, no force, no rebase), `git ls-remote` equal,
   message the lead the landed hash and every counts line.

## Box 4 (ENG-CATCH-i, a tail): freeze, the lock, the turnover note
(started 6:38 PM ET Fri 11-27 by `date`, on 192a433ae; no code written)
- t-eng-w3 = 7a580aefc (`git ls-remote`). Frozen worktree at 192a433ae: chattr on src/ and tools/, src/game/gen2/proven writable,
  `touch src/x` -> "Operation not permitted"; `git diff --name-only 9afeaf31c 192a433ae` outside this REPORT folder: 0 files.
- LOCK, two runs ALONE: base `lockall --layouts 16 --out` at 7a580aefc: "lock: wrote 3264 builds of 102 stages", 0 errors, 9m43s.
  Check on the frozen tree: "lock: 101/102 stages unchanged", "1-4: platforms, collectibles, proto.dress", 9m33s (proof-i/lock-check.txt).
  The move is box 2's rule at work on an up tower: old 55 overlap pairs in 14 of 32 builds, new 0 in 32; the moved set equals the
  overlap set (diff empty). New lays sometimes hold more pieces (easy 5: 93 -> 94 solid): a covered catch trimmed, box 2's design.
- Turnover note: reference/handoffs/engine-core.md §0zr-CATCH (the three invariants, downInvariant the one named check, TowerRefusal
  by misses[0].line at tower.ts:351, the proof commands), commit 93e8cb25d.
- Lessons applied: D115 (frozen tree, chattr), D118 (docs-only head carries the verdict), D119 (commits by -m), D30/D128 (stamps from
  `date`); the lock ALONE (nothing beside either run); a move called intended only with the scan's proof.
- Polish check (box 4): no screen judged; 1-4's wood moved, so the still in step 5 is owed before Matt sees it.
- Learned: box 2's overlap rule reaches up towers too (1-4), not only the down tower; the lock found it, the scan proved it.

## Box 3's EXACT NEXT STEP (superseded by the one above)
(box 3, ENG-CATCH-h, handed over, written 6:34 PM ET Fri 11-27 by `date`; t-eng-w3 checked at 7a580aefc then)
CANDIDATE = origin/t-eng-catch-f HEAD (the hash in the lead message). Its code is 9afeaf31c (box 3's named overlap check on box 2's
8ab05d35c; the commits after it are this REPORT folder only: the REPORT and proof-h/). Box 3's steps 1-3 DONE (below: the check, its
two tests and plant, the cost, the six-config proof, the overlap scan, the pre-freeze tests); step 4 (freeze, gates, land) NOT STARTED.
1. Re-check base: `git ls-remote origin refs/heads/t-eng-w3` must still be 7a580aefc. If it moved: merge it by hash, tsc + generality,
   and re-run the pre-freeze list whole (tower, towerMend, towerBots, legs, legsLay, camRepick, cameraFollow, worlds/w3, worlds/w3Noise:
   every test that imports tower.ts, by grep, plus w3Noise).
2. Freeze: `git worktree add --detach <scratch>/wt-frozen <CANDIDATE>` (dispatch-packet.md line 81 on the lead branch), node_modules
   symlinked; every gate below runs there.
3. The gates once on the frozen head, each with its verdict word and counts line: the CI tool line; the suite in 6 shards with
   totals; THE LOCK as two runs ALONE (nothing else running): `npx tsx tools/engine/lockall.ts --layouts 16 --out <scratch>/base.json`
   in a detached worktree at 7a580aefc, then `--layouts 16 --check <scratch>/base.json` on the frozen head. A stage that moves is
   EXPECTED only where its old lay laid wood twice (box 1) or laid wood over wood at one height (box 2): box 3's check refuses nothing
   new by construction (step 2's proof below: refusals byte for byte box 2's). Prove each move by proof-g/scan.mts (old tree against
   frozen head: a same-height overlap or duplicate in the old lay, gone in the new; point ROOT at each tree, and for another stage
   change its buildStage id), else send it to the lead. tierBots. Every red: file:line, run alone on 7a580aefc (R-165.550
   ctestPicker:78 is inherited and owned).
4. Land on t-eng-w3 by fast-forward (`git push origin <CANDIDATE>:refs/heads/t-eng-w3`, no force), `git ls-remote` equal, message
   the lead the landed hash and every counts line.

## Box 3 (ENG-CATCH-h): the tower's named check refuses any overlap
(started 6:14 PM ET Fri 11-27 by `date`, on a4f5a6474; the lead's ruling: no-overlap INTO downInvariant, the check every final lay
passes and the guarantee refuses on, so ANY path that leaves an overlap is refused by name, and plant THAT)
- THE CHECK (tower.ts): `woodOverlaps(platforms)` (exported): every two pieces of solid wood (type 'solid': the stage's own and the
  catches alike) at one height (|dy| <= 1) that overlap strictly along x (end to end is none), each by name: "tower: two pieces of
  solid wood overlap at one height: x A-B and x C-D at y Y". Box 2's definition and scan.mts's, exactly. downInvariant lists these
  FIRST (DownMiss.what 'overlap', no piece), so (a) the guarantee's refusal (misses[0]) names the overlap whenever a lay has one, (b) the
  mend never keeps a remedy that lays one (it would not leave fewer misses), (c) the mend tries no remedy on it (no piece: it is the
  roll's to answer). The type change: DownMiss.what gains 'overlap' (the lead's ruling names downInvariant's misses as the place; no
  consumer outside tower.ts reads `what`, by grep).
- TESTS (both new, tower.test.ts, RED FIRST: 47/49 before the check): "THE DOWN TOWER'S INVARIANT names any two pieces of solid wood that
  overlap at one height ..." (a 50 px overlap 1 px apart, and one wholly over another, named; end to end, 2 px apart, or a fragile piece,
  not); "THE GUARANTEE refuses by name a down tower that would leave two pieces of solid wood overlapping at one height ..." (a tower
  whose own wood overlaps: TowerRefusal, its miss the overlap's name exactly; and box 2's three toys (ENG-CATCH-b's, the 50 px gap, the
  60 px gap) return lays the invariant reads clean). With the check: 49/49.
- PLANT (the lead's): box 2's `cut` filter removed (fit lays a partly overlapping piece whole, taking only the laid pieces inside it)
  -> tower.test.ts 47/49 RED: both box 2's trim-or-refuse test and the new guarantee test throw TowerRefusal "tower: unmendable miss:
  tower: two pieces of solid wood overlap at one height: x 475-590 and x 525-825 at y 1200": the invariant names the overlap and the
  roll is refused. Restored -> 49/49.
- COST (it runs on every lay and every try of the mend): woodOverlaps alone, measured directly: 13.7 us per call on a whole drafted 3-1's wood (avg 168 pieces, seeds 1-5
  normal, 200 calls each; proof-h/bench.mts, old tree wt-old = a4f5a6474, new wt-try), about 3% of downInvariant's 0.49 ms. The same run's
  whole-call numbers (before 0.491 ms, after 0.670 ms) differ by more than the new check itself costs: the two were timed one after the
  other while nothing else ran, old first, so that gap is run order and JIT, not the check; read it as noise, NOT as the cost. (A
  tower's lay passes far fewer pieces than the whole stage, so per lay it is less.) An interleaved re-time would settle the totals.
- tsc 0; generalitycheck PASS (26 literals, 26 known).
- PROOF, box 1's command (box 1's proof/proof.mts unchanged; tree wt-try = 9afeaf31c with src/game/gen2/worlds/w3.ts = t-kit-w3a
  39a3c5b52's byte for byte; run in wt-try: `GEN2_DRAFT=3-1 ROOT=<wt-try> KEEP=<config> FROM=1 SEEDS=40 VERBOSE=1 npx tsx <proof.mts>`),
  seeds 1-40 x both settings; logs proof-h/*.txt; each against box 2's number:
  - all five: ok 80/80, leaks 0, refusals 6 in 6 builds, Normal's rolls refused 3 / tried 42 (7%), worst stage 1 (n11). Box 2: 3/42.
  - root-down: ok 80/80, leaks 0, refused 0 / tried 40 (0%). Box 2: 0/40.
  - two-roots: ok 80/80, leaks 0, refused 0 / tried 40 (0%). Box 2: 0/40.
  - cap-down: ok 80/80, leaks 0, refused 1 / tried 40 (3%), worst stage 1 (n3). Box 2: 1/40.
  - cap-steps: ok 80/80, leaks 0, refused 1 / tried 41 (2%), worst stage 1 (n33). Box 2: 1/41.
  - shelf-hops: ok 80/80, leaks 0, refused 3 / tried 43 (7%), worst stage 1 (n13). Box 2: 3/43.
  Every log is byte for byte box 2's (`diff proof-g/<c>.txt proof-h/<c>.txt`: no difference, all six). 0 THROW in every log. As
  expected by construction: nothing new to refuse.
- THE OVERLAP SCAN (proof-g/scan.mts, the five pieces, seeds 1-40 x both, wt-try): 0 pairs in 0 of 80 built stages (proof-h/scan-h.txt), 0 throws; box 2: 0 in 80.
- PRE-FREEZE on 9afeaf31c, each file WHOLE: tower.test.ts 49/49; towerMend 13/13; towerBots 9/9; legs 7/7; legsLay 10/10; camRepick
  8/8; cameraFollow 14/14; worlds/w3.test 10/10; worlds/w3Noise 7/7 (every test that imports tower.ts, by grep, plus w3Noise): 127/127,
  0 fail. tsc 0; generalitycheck PASS (26/26).
  `git ls-remote origin refs/heads/t-eng-w3` = 7a580aefc.
- Learned: a check the lay keeps by construction still belongs in the named invariant: the plant shows the invariant alone turns a
  broken lay path into a refusal by name, so no future path (the move paths included, which no toy reaches) can ship an overlap.
- Box 3's lessons applied: D30/D128 (every stamp from `date`), D115 (each run in its own worktree: wt-try for the proof, wt-old for
  the cost), D119 (commit by -m, no heredoc), D154 (by construction, proven on seeds 1-40 x both, all six configs, plus the scan),
  D156 (generality with tsc), D159 (the base by hash).

- Polish check (box 3): engine only; no lay changed (every proof log byte for byte box 2's, scan 0 in 80), so no screen changed and
  no still was taken. Box 2's ask stands for the freeze box: one moved 3-1 seed on a phone-sized screen, upright and sideways, where a
  trimmed catch meets other wood end to end.
- Pushback: none. The packet's one type change (DownMiss.what gains 'overlap') is the Architect's wall; it is inside tower.ts and the
  lead's ruling names downInvariant's misses as the place, so it was made and is named here.
- Unresolved: step 4 (freeze, gates, lock, tierBots, land) NOT STARTED (the box ran out); the turnover note reference/handoffs/
  engine-core.md not rewritten (the landing box writes it with the landed hash).
- Method update: a check kept by construction still gets its named invariant, planted by breaking the construction (here box 2's `cut`
  filter) so the invariant alone is shown to refuse the roll by name.

## Box 2's EXACT NEXT STEP (superseded by the one above)
(box 2, ENG-CATCH-g, handed over, written 6:11 PM ET Fri 11-27 by `date`; t-eng-w3 checked at 7a580aefc then)
CANDIDATE = origin/t-eng-catch-f HEAD (the hash in the lead message). Its code is 8ab05d35c (box 2's overlap rule on box 1's 056b22736;
the commits after it are this REPORT folder only: the REPORT and proof-g/). Box 2's steps 1-3 DONE (below: the rule, its two tests and plants, the six-config proof,
the overlap scan, the pre-freeze tests); step 4 (freeze, gates, land) NOT STARTED.
1. Re-check base: `git ls-remote origin refs/heads/t-eng-w3` must still be 7a580aefc. If it moved: merge it by hash, tsc + generality,
   and re-run box 1's pre-freeze list whole (tower, towerMend, towerBots, legs, legsLay, camRepick, cameraFollow, worlds/w3,
   worlds/w3Noise).
2. Freeze: `git worktree add --detach <scratch>/wt-frozen <CANDIDATE>` (dispatch-packet.md line 81 on the lead branch), node_modules
   symlinked; every gate below runs there.
3. The gates once on the frozen head, each with its verdict word and counts line: the CI tool line; the suite in 6 shards with
   totals; THE LOCK as two runs ALONE (nothing else running): `npx tsx tools/engine/lockall.ts --layouts 16 --out <scratch>/base.json`
   in a detached worktree at 7a580aefc, then `--layouts 16 --check <scratch>/base.json` on the frozen head. A stage that moves is
   EXPECTED only where its old lay laid wood twice (box 1) or laid wood over wood at one height (box 2; going up too, the same `put`):
   prove each move by comparing the two lays' catches (a same-height overlap or duplicate in the old lay, gone in the new), else send
   it to the lead (the tool: proof-g/scan.mts reads the invariant itself, every same-height overlapping pair of solid wood in a
   built stage; it builds 3-1 with the five pieces: point ROOT at each tree, and for another stage change its buildStage id). tierBots. Every red: file:line, run alone on 7a580aefc (R-165.550 ctestPicker:78 is inherited and owned).
4. Land on t-eng-w3 by fast-forward (`git push origin <CANDIDATE>:refs/heads/t-eng-w3`, no force), `git ls-remote` equal, message
   the lead the landed hash and every counts line.

## Box 2 (ENG-CATCH-g): no two catches overlap at one height (the lead's ruling: fixed BEFORE the freeze)
- SCOPE, MY CALL (said first to the lead; reversible, one filter, `cut` in `fit`): the rule reads every solid wood at the height,
  the stage's own too, not only other catches: the toy's catch lay 18 px over the storey as well, and the scan found 102 of the 303
  old overlaps were catches over the stage's own logs, the same rough spot (an end cap mid-plank).
- THE RULE (tower.ts layCatches `overlaps` / `fit`, general: no stage id, seed or x): wood is never laid across solid wood at its height
  (|dy| <= 1, strict overlap). `put`: a piece wholly over laid pieces TAKES THEIR PLACE (they leave `laid`, `out`, `served`, `all`; the
  mend's keep puts them back, at their own indices, when it undoes the lay); a piece that only partly overlaps wood (laid or the
  stage's own) is TRIMMED to the open span under the fall line it serves, MEND.trim (60) px of it at the least, else REFUSED BY NAME
  (`overlapRefused`, exported, cleared per towerCatches: "overlap: a-b at y Y lies over ... and no open span of 60 px is left under its
  fall line x X"). Moves never land on other wood: the mend's remedy 1 (keep with k) refuses by name ("overlap: a move to ..."),
  trimKeep's trim steps and reLay's candidates skip any overlap (box 1's `already` there, wholly-on only, is now any overlap). A piece
  with no overlap is laid exactly as before (its span is not re-read against its fall line). The lay's loop skips the end of a piece
  another has since taken the place of. Going up uses the same `put`, so the rule holds there too.
- The toy (ENG-CATCH-b's, tower.test.ts): box 1 laid 654-716, 716-1033, 536-716 at y 1256 (536-716 over 654-716 AND 18 px over the
  storey 136-554). Now: 716-1033, 554-716 (the wide catch took 654-716's place and was trimmed off the storey; the shelf's end still
  caught under its fall line 626; no blind drop).
- TESTS (both new, tower.test.ts): "no two catches overlap at one height ..." (the toy) and "a catch that only partly overlaps wood at
  its height is trimmed to the open span under its fall line, or REFUSED by name ..." (a shelf's fall line x 500 over two pieces at
  y 1200: a 50 px gap -> every bough over it refused by name, the end caught lower at 410-590 y 1287, no blind drop; a 60 px gap ->
  the bough trimmed to 470-530, none refused).
- PLANTS: (1) `overlaps` made to find nothing -> the toy test RED (45/46: 654-716, 716-1033, 536-716 back); restored 46/46.
  (2) `fit` made to lay an unfittable piece whole instead of refusing it -> the trim-or-refuse test RED (46/47: 475-590 laid over
  525-825); restored 47/47. NOT PLANTED: the move path's refusal (keep with k, reLay, trimKeep): no toy found in this box that makes
  the mend move a piece over wood; it is named here, and the overlap scan below reads the real lays for any overlap.
- tsc 0 and generalitycheck PASS (26 literals, 26 known) after each step.
- PROOF, exactly as box 1 ran it (box 1's proof/proof.mts unchanged; tree wt-try = 0e2c5baf3 (its tower.ts = 8ab05d35c's; only tower.test.ts differs) with
  src/game/gen2/worlds/w3.ts = t-kit-w3a 39a3c5b52's byte for byte; run in wt-try:
  `GEN2_DRAFT=3-1 ROOT=<wt-try> KEEP=<config> FROM=1 SEEDS=40 VERBOSE=1 npx tsx <proof.mts>`), seeds 1-40 x both settings; logs
  proof-g/*.txt; each against box 1's number:
  - all five: ok 80/80, leaks 0, refusals 6 in 6 builds, Normal's rolls refused 3 / tried 42 (7%), worst stage 1 (n11). Box 1: 3/42.
  - root-down: ok 80/80, leaks 0, refused 0 / tried 40 (0%). Box 1: 0/40.
  - two-roots: ok 80/80, leaks 0, refused 0 / tried 40 (0%). Box 1: 0/40.
  - cap-down: ok 80/80, leaks 0, refused 1 / tried 40 (3%), worst stage 1 (n3). Box 1: 1/40.
  - cap-steps: ok 80/80, leaks 0, refused 1 / tried 41 (2%), worst stage 1 (n33). Box 1: 1/41.
  - shelf-hops: ok 80/80, leaks 0, refused 3 / tried 43 (7%), worst stage 1 (n13). Box 1: 3/43.
  Every log's named refusals are byte for byte box 1's (diff of each log after its first line: no difference).
  0 THROW in every log. No config worse than box 1.
- THE OVERLAP SCAN (proof-g/scan.mts: every built 3-1, the five pieces, seeds 1-40 x both: pairs of solid wood at one height,
  |dy| <= 1, that overlap): box 1's code (wt-old = 89fd5e401 + the kit's w3.ts): 303 pairs in 79 of 80 built stages (201 branch over
  branch, 102 log over branch; the tower's catches are laid as 'branch'). Box 2's code (wt-try): 0 pairs in 0 of 80. 0 throws either
  side. So the rough spot was on nearly every drafted 3-1, not only the toy, and the rule clears every one of them on the real lays.
  The same scan, pointed at a stage the lock moves, proves the move (step 3 below).
- PRE-FREEZE on 8ab05d35c, each file WHOLE: tower.test.ts 47/47; towerMend 13/13; towerBots 9/9; legs 7/7; legsLay 10/10; camRepick
  8/8; cameraFollow 14/14; worlds/w3.test 10/10; worlds/w3Noise 7/7 (every test that imports tower.ts, by grep, plus w3Noise). 0 fail.
  tsc 0; generalitycheck PASS (26/26). `git ls-remote origin refs/heads/t-eng-w3` = 7a580aefc.

## Box 1's EXACT NEXT STEP (superseded by the one above)
(box 1 handed over, written 5:50 PM ET Fri 11-27 by `date`; t-eng-w3 checked at 7a580aefc then)
CANDIDATE = origin/t-eng-catch-f HEAD (the hash in the lead message; the code is 056b22736 = 5330e490d's fix + t-eng-w3 7a580aefc merged;
the commits after it are this REPORT only). Steps 1-5 DONE (below: the red, the fix and its plant, the merge, the proof, the pre-freeze tests); steps 6-7 NOT STARTED.
1. Re-check base: `git ls-remote origin refs/heads/t-eng-w3` must still be 7a580aefc. If it moved: merge it by hash, tsc + generality,
   and re-run tower.test.ts + towerMend.test.ts + w3Noise.test.ts whole.
2. Step 5 is done on 056b22736 (totals below); the code has not changed since (the later commits are this folder only).
3. Freeze: `git worktree add --detach <scratch>/wt-frozen <CANDIDATE>` (dispatch-packet.md line 81 on the lead branch), node_modules
   symlinked; every gate below runs there.
4. Step 6, the gates once on the frozen head: the CI tool line; the suite in 6 shards with totals; THE LOCK as two runs ALONE (nothing
   else running): `npx tsx tools/engine/lockall.ts --layouts 16 --out <scratch>/base.json` in a detached worktree at 7a580aefc, then
   `--layouts 16 --check <scratch>/base.json` on the frozen head. A stage that moves is EXPECTED only where its old lay put the same
   wood twice (it now lays it once or tries the next anchor): prove each move is that (compare the two lays' catches) or send it to the
   lead. tierBots. Every red: file:line, run alone on 7a580aefc (R-165.550 ctestPicker:78 is inherited and owned).
5. Step 7: land on t-eng-w3 by fast-forward (`git push origin <CANDIDATE>:refs/heads/t-eng-w3`, no force), `git ls-remote` equal,
   message the lead the landed hash and every counts line.

## The red, and its root (RED FIRST, on f5f2aa16e)
- src/game/gen2/tower.test.ts WHOLE on f5f2aa16e: 44/45. :856 (ENG-CATCH-b's toy: going down, a bridge started a hop past a vine's
  top that misses the end's fall line), assertion 'no catch is laid twice' (:869): 3 !== 12.
- Traced (a stack print in `put`, removed): the 12 catches are rule 2's bridge 654-716 at y 1256 PUT 10 TIMES by the first lay
  (layCatches(false), the bridge at tower.ts ~:520), then 716-1033 once, then the mend's catch 554-650 under the fall line (keep, remedy
  2/3). Why: the bridge a hop past the vine's top (x 554 + TOWER.hop + 30 = 654) misses the shelf end's fall line (x 626), so the end
  stays open, and each of the lay's 10 passes bridged it again from the same storey. Nothing in `put` refused wood already there.
- Why green on d49de60f0 and red from ENG-CATCH-c box 1 on: the duplicates were always in the first lay; before the mend, the
  second lay (cover = true) left fewer misses and was returned. The mend inside layCatches mends the first lay too, so the second is no
  longer strictly better and the first lay, duplicates and all, is returned. The mend did not lay a catch twice; it exposed the lay
  that did. (The bisect the packet named, by remedy, is answered by the trace: no remedy of the mend puts the duplicate.)

## The fix (general: no stage id, seed or x)
- tower.ts layCatches `already(x0, x1, y, but?)`: wood wholly on solid wood already at its height (|dy| <= 1) lays nothing new.
  `put` refuses it and returns false; every caller counts a piece only when it was put (rule 1's run-on falls through to rule 2; rule
  2 tries the next anchor; rule 3, rule 4's pick); the mend's keep refuses a bough put refuses, and a piece laid again (remedy 1) onto
  wood already there; trimKeep never trims a piece onto other wood; reLay never moves a piece onto other wood. So every catch in a
  tower's final lay is distinct, by construction, on every path that lays or moves one.
- The toy's lay now: 654-716, 716-1033, 536-716 (3 catches, 3 distinct; the shelf's end caught under its fall line, no blind drop).
- PLANT: `put`'s refusal line removed -> tower.test.ts:856 RED (3 !== 12); restored -> green.
- tower.test.ts 45/45, towerMend.test.ts 13/13 (commit 5330e490d). tsc 0; generalitycheck PASS (26 literals, 26 known).

## Merge of t-eng-w3 7a580aefc (by hash, no rebase)
- `git merge --no-ff 7a580aefc` -> 056b22736. NO CONFLICTS: pipeline.ts (both sides changed it: the guarantee's reroll in
  buildRolledOn here, ENG-ROOT / ENG-DEAL there) merged by git with both sides' hunks kept; 50 files from t-eng-w3, tower.ts untouched
  by it. tsc 0; generalitycheck PASS (26 literals, 26 known).

## Pre-freeze (step 5) on the merged head 056b22736, each test file WHOLE
- Every test that imports tower.ts (grep): tower.test.ts 45/45; towerMend.test.ts 13/13; towerBots.test.ts 9/9; legs.test.ts 7/7;
  legsLay.test.ts 10/10; camRepick.test.ts 8/8; cameraFollow.test.ts 14/14; worlds/w3.test.ts 10/10. The only source changed is
  tower.ts. src/game/gen2/worlds/w3Noise.test.ts 7/7 (stays green). 0 fail anywhere. tsc 0; generalitycheck PASS (26/26).

## PROOF (step 4), as ENG-CATCH-e ran it (its probe/proof.mts, copied unchanged), seeds 1-40 x both settings
- Tree wt-try: the candidate 056b22736 with src/game/gen2/worlds/w3.ts = t-kit-w3a 39a3c5b52's w3.ts byte for byte (`git show`); tsc
  on it: errors in test files only (w3.test.ts, w3Level.test.ts want 3-2's exports the kit's w3.ts does not have), none in any source.
  Run: `GEN2_DRAFT=3-1 ROOT=<wt-try> KEEP=<config> FROM=1 SEEDS=40 VERBOSE=1 npx tsx proof.mts` (the first run left GEN2_DRAFT out:
  every build threw "no row for 3-1" (the draft row is installed only by GEN2_DRAFT); re-run with it, the numbers below).
- RESULTS (logs proof/*.txt here; every refusal named in its log), each against ENG-CATCH-e's number:
  - all five: ok 80/80, leaks 0, refusals 6 in 6 builds, Normal's rolls refused 3 / tried 42 (7%), worst stage 1 (n11). ENG-CATCH-e: 3/42.
    The same six named refusals as ENG-CATCH-e (n11, n19, n29 and e11, e19, e29: a blind drop off the wall catch x 31-211 / 33-213).
  - root-down: ok 80/80, leaks 0, refused 0 / tried 40 (0%). ENG-CATCH-e: 0/40.
  - two-roots: ok 80/80, leaks 0, refused 0 / tried 40 (0%). ENG-CATCH-e: 0/40.
  - cap-down: ok 80/80, leaks 0, refused 1 / tried 40 (3%), worst stage 1 (n3). ENG-CATCH-e: 1/40.
  - cap-steps: ok 80/80, leaks 0, refused 1 / tried 41 (2%), worst stage 1 (n33). ENG-CATCH-e: 1/41.
  - shelf-hops: ok 80/80, leaks 0, refused 3 / tried 43 (7%), worst stage 1 (n13). ENG-CATCH-e: 3/43. The same six named refusals
    (n13, n24, n36 and e13, e24, e36: blind drops of 311-314 px, past `see` 300).
  0 THROW in every log. No config got worse than ENG-CATCH-e.

## Open finding (box 1; FIXED in box 2, above)
- No catch is laid twice now, but a LATER, wider catch may still lie over an earlier one: the toy's 536-716 lies over 654-716 (same
  height). Physically harmless (no new footing, no new end), but two planks drawn over each other can show an end cap in the middle of
  a plank. Proposed next step for the lead: the same rule the other way round (a piece put wholly over laid pieces takes their place),
  with its own planted test; it changes which pieces are listed, so it needs the lock.

## Polish check
Box 1: engine-only (the lay); no screen changed; the overlap was the one rough spot it could show, named. Box 2: the overlap is gone
from every built 3-1 (scan: 303 pairs in 79 of 80 -> 0 in 80), so no two planks draw over each other and no end cap shows mid-plank;
no screenshot was taken in this box (no screen code changed; the lay changed). The freeze box should look at one moved 3-1 seed on a
phone-sized screen, upright and sideways, where a trimmed catch now meets other wood end to end, and judge the join.

## Learned
- The mend was blamed for this red for two boxes; it only changed which of two lays was returned. A trace of every `put` (its call site
  printed) found the real layer in one run. Before bisecting a red by remedy, print which code path laid the bad piece.
- An invariant "every catch distinct" belongs where wood is laid (`put`) and where it moves, not in a check after the lay: then no new
  remedy can break it.
- MY MISS: the first proof run left out GEN2_DRAFT=3-1 and every build threw; caught from its first line before any number was used.
  The command line is now written in this REPORT, so the next run copies it.
- Box 2: the toy said one overlap; the scan of the real lays said 303 in 79 of 80 stages, a third of them catches over the stage's own
  logs. A rule proven on a toy is proven on the real lays by a scan that reads the invariant itself (here: every same-height pair),
  old code against new, before any number is called a result.
- Box 2, MY MISS: the first commit message went through a heredoc (D119 says none); its text is right; later commits use -m.
Box 2's lessons applied: D30 (every stamp from `date`), D52 (cites checked last), box 1's D115 (each run in its own worktree: wt-try,
wt-old), D154 (by construction, proven on seeds 1-40 x both, all six configs, plus the scan), D156 (generality with tsc each step),
D159 (the base by hash). Box 1's lessons applied: D115 (each run on its own worktree: wt-try for the proof, wt-old for the d49de60f0 check), D119 (no heredoc with a
commit), D128 (stamps from `date`), D154 (the invariant guaranteed by construction, proven on seeds 1-40 x both, all six configs),
D156 (generality with tsc at each step), D159 (the base checked by hash with ls-remote).

