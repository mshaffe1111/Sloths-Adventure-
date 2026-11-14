# POLISH-4 REPORT (t-polish-4 from t-polish-3@a9d6b1bc; lead session_01FhBbYNzGRJBDMzn6XbtQK2). Opus 5.5 high. Box 11:36 PM ET 11-13, stopped at the 40% context line.
**EXACT NEXT STEP:** 0. Read gates/RESULTS below: the full suite on head e215878 (merged) is the one result this report waits on.
1. Run the rest of CLAUDE.md Checks on this head: build + chunkcheck, artcheck, drawcheck, clipcheck, kbdcheck, buildcheck (alone,
   D-note in engine-core 0n), tool tests, and RULER's own asks: `lockall` (1-1 too), mixlist, ruler/scan.ts (RULER REPORT "Then on t-ruler").
2. R-165.206 1-4's rotten fork, NOT STARTED: w1Arc14.ts ROTTEN_FORK on t-len-14@d56cd91 (not in this base; t-int-6 REPORT step 2): the
   middle bot jumps for an exit 240 px above. Make the creak the way UP or hide the exit till he is down; castBots before/after on one head;
   adult Easy >= 100 s; ONE relist; 1-4 stills of the beat, upright + sideways, Normal + Easy, built setting printed (D62).
3. R-165.209 HUD half (1-4's gate under the HUD sideways) only if time remains; NOT the square posts (ART-678, D40).
## Done (evidence)
- **Step 1, green the head (R-165.221):** `DropSite = 'hole-under-route'` (verdicts.types.ts), an optional `site` on every Drop and on
  gen2.falls (types.ts). pipeline.ts: softHoles' fall records carry it; dropsOf passes it to the Drop. Root: w1.relay gapsOf read EVERY
  Drop as a gap he jumps, so 1-1's 2,700 px earth holes read as double test gaps. No verdict loosened; skip by TYPE, never by width/place.
  Readers (grep `.drops`, `dropsOf(`, `gen2.falls` over src/ and tools/):
  SKIP (they count the route's own jumps): w1.relay.test gapsOf; pipeline.ts nodeAsks hazard (a node's own fall; no graph asks #soft
  today, so no roll moved: seedlist --check PASS with the same plans).
  SEE (what a fall ends in, its look, its record): dropVerdicts (drop.lethal-in-no-lethal, drop.look-lies), untypedVerdicts
  (drop.untyped), promises11 hazard.untaught (heart only), climbHoles.test, verdicts.test "one Drop per fall", library13.test (1-3, no holes),
  lethalSpans/rolledFlagBreaches (read heartFalls/falls kind, unchanged).
- **Planted:** w1.relay.test "planted (R-165.221): a hole under the route is no test gap; the same span as a route gap is still read",
  and "1-1 (a) teach first, 257 seeds": both RED with the skip switched off, green with it (9/9). climbHoles.test: every hole's Drop is
  typed; "a hole under the route is still a drop to the drop verdicts" (a hole drawn as water is look-lies; a lethal hole on 1-1 is
  refused; a gap inside a hole is typed by its record). softFalls11 "the word lays nothing" now asserts the typed record exactly.
- **Step 2, t-ruler merged** (500eb9b; one conflict, engine-core.md: both kept, RULER's section is 0o). 1-1 relist on the merged head:
  `seedlist 1-1 --merge <its 257 in order> --in-order --count 257` (90 s): 257/257, same seeds, same order (checked), list version
  e32c7d0a -> 6518cfac; quiet <= 4 s on 257/257. `seedlist 1-1 --check` PASS (verdicts refuse 0 of 257). tierBots 7/7 PASS.
## Gates on e215878: tsc 0, knowncheck PASS, generality PASS, roadmapcheck PASS (after unshallow), seedlist 1-1 --check PASS, tierBots
  PASS. Full unit suite: see RESULTS line below. NOT RUN (named, UNRUN): build, chunkcheck, artcheck, drawcheck, clipcheck, kbdcheck,
  buildcheck, tool tests, lockall/mixlist/scan. The pre-merge suite on 9b45e20 was stopped at test 1517 with 0 failures (superseded).
## Polish check: no pixel changes in this work (a type field and a merged ruler that paints 0 changes, RULER scan-3.txt): no stills
  owed for step 1-2; 1-4 stills belong to step 3 (not started). The rough spots POLISH-3 named (R-165.224) are unchanged.
## Pushback: none on the ruling. Note: the ask "full suite once after softFall11.test.ts:97's edit" is met by the merged-head run.
## Method, lessons, Learned
Method: level.md, gates.md; merge in a worktree while the suite ran on the main tree. Lessons: D19 (the test reads the same Drop the
verdicts read), D29 (relist -> --check, tierBots, full suite), D40, D46, D55, D57 (queue read at push), D59 (no gate left running), D61, D62.
Method update: `seedlist --merge` wants the list's own order dumped from provenSeeds() (a one-line tsx -e), then a JSON compare after.
**Learned:** when one reader misreads a record, type the record (what it IS) rather than teaching the reader a width or place rule; then
grep every reader and sort them into "counts the route" vs "judges the fall": the split was clean and no verdict had to change.
