# POLISH-3 REPORT (t-polish-3 from t-eng-base@204e3dec; lead session_01FhBbYNzGRJBDMzn6XbtQK2). Opus 5.5 high. Box 9:51-11:21 PM ET 11-13.
**EXACT NEXT STEP:** 1. Lead pass/fail on stills/ (below). 2. When t-ruler merges: on the merged head run `seedlist 1-1 --merge <the list's
257 seeds in order, JSON> --in-order --count 257` (88 s; 49477, 55341, 65753 replay differently under the ruler), then --check. 3. verdicts.test.ts
seed-323 copy: NOT fixable by a bank (below); promises11 realFalls' floor clause is the fix (its owner, the lead's call). 4. Items 2-5 of the
packet not started: 1-4's rotten fork (w1Arc14.ts on t-len-14@d56cd91, t-int-6 REPORT step 2), the 1-4 gate under the HUD, GOLDEN SEED, petals.
## Done (evidence)
- **R-165.221 (pipeline.ts `earthHoles`, `softHoles`):** a stage whose brief says no fall costs a life (`softFalls`: 1-1) gets ONE soft zone
  and ONE put-back fall record over every hole in its earth (no piece 90 px deep at any depth, lip to lip). Play unchanged: 1-1 already sets
  every fall back (engine.ts:942 softOn; heartFall with a soft zone calls the same softFall). No draw code reads heartFalls: pixels unchanged.
  Built from the final platforms, never added to `laid` (adding to it moved the search on 2 seeds: the search re-judges `laid`).
- **Planted:** climbHoles.test.ts red without the rule ("layout 1: hole 25298..27953 has no soft zone": t-ruler's own hole), green with;
  1-2 lays none. softFalls11 "the word lays nothing" restated: the word lays no ground; zones/falls/verdicts differ only by one soft mark
  per hole (asserted exactly); its without-word builds replay the same roll (the ruler refuses 1-1's holes unmarked, so no search builds).
- **1-1 list, ONE re-roll:** `--merge` over its own 257 seeds `--in-order --count 257`: same seeds, same order; plans moved on 2
  (12522 = variant 25, 73142 = variant 225); quiet still <= 4 s on 257/257. tierBots PASS (variant 25 inside its 1-40). seedlist 1-1 --check PASS.
- **firstRun11 lock** re-recorded (lead 10:13 PM): only heartFalls moved (firstrun-lock-diff.txt: every other part's hash identical).
- **Under t-ruler (scratch merge 1468aa95):** 1-1's verdicts refuse 0 of 257 (were: every seed); softFalls11, climbHoles, w1Pits, stumps green.
## Polish check (real page, vite dev on this head; setting via localStorage, BUILT setting printed; 412x915 / 915x412 at 2x)
- stills/1-1-L1-normal-{sideways,upright}-x26000-after.jpg, 1-1-L1-easy-{sideways,upright}-x28000-after.jpg (seed 769, easy:true printed).
- stills/1-1-L1-normal-sideways-walkoff-log115-putback.webm: off log 115 at x25947, falls, iris, back on 115 at 25851; lives/hearts kept.
- ROUGH, NOT FIXED (unchanged by this work, named): he falls THROUGH the backdrop's painted forest floor (it reads as ground under the logs),
  and upright ~40% of the screen under the climb is empty fog. Fix = art (earth or a painted drop under World 1's high road): show-first.
## Gates: see gates/RESULTS.txt (every CLAUDE.md Check + CI step once on the head).
## Pushback
- seed-323 copy: with E0a's REAL next bank (block 131 @28042, d2748131) the hole 27200..28042 is a fall with or without branch 128, and with
  a planted bank at log 127's end it is still a fall: realFalls (promises11.ts:44) counts log 127, BESIDE the slot, as "a floor inside the
  slot" under 128, so 128 reads as passable. A floor clause that asks for a floor UNDER the piece keeps the 23 px case. Not my file.
- 1-1's quiet values moved on 32 seeds with the zones (reported, not bound: listRules quiet reads the stage); all still <= 4 s.
## Method, lessons, Learned
Method: level.md, gates.md; ruler judged on the base build by copying its two files (probe), so a refused build cannot hide a hole.
Lessons: D15 (probe's argv bug caught before trusting it), D19, D23, D29 (relist -> every seed test + tierBots), D40, D52, D55, D57, D59, D61, D62.
Method update: a relist that must keep variants is `--merge <current order> --in-order --count <n>`; without --count it silently cuts to 100.
**Learned:** never add to the laid object at assembly: the search judges it again after a repair, so a mark meant for the final stage moves
which roll the search keeps. A data-only mark (a soft zone) changes no pixels: before/after stills prove nothing; a clip of the behaviour does.
