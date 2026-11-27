# ENG-CATCH-f: the down tower never lays a catch twice; the tower guarantee onto t-eng-w3 (R-165.561)

## EXACT NEXT STEP
(box 2, ENG-CATCH-g, handed over, written 6:11 PM ET Fri 11-27 by `date`; t-eng-w3 checked at 7a580aefc then)
CANDIDATE = origin/t-eng-catch-f HEAD (the hash in the lead message). Its code is 8ab05d35c (box 2's overlap rule on box 1's 056b22736;
the commits after it are this REPORT only). Box 2's steps 1-3 DONE (below: the rule, its two tests and plants, the six-config proof,
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
   it to the lead. tierBots. Every red: file:line, run alone on 7a580aefc (R-165.550 ctestPicker:78 is inherited and owned).
4. Land on t-eng-w3 by fast-forward (`git push origin <CANDIDATE>:refs/heads/t-eng-w3`, no force), `git ls-remote` equal, message
   the lead the landed hash and every counts line.

## Box 2 (ENG-CATCH-g): no two catches overlap at one height (the lead's ruling: fixed BEFORE the freeze)
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

