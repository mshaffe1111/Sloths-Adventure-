# POLISH-4 REPORT (t-polish-4 from t-polish-3@a9d6b1bc; lead session_01FhBbYNzGRJBDMzn6XbtQK2). Opus 5.5 high. Box 11:36 PM ET 11-13, stopped at the 40% context line.
**NOT GREEN: verdicts.test.ts:323 (seed-323, the engine lane's realFalls clause), plus 1-2/1-3/1-5 --check (item 0).**
**EXACT NEXT STEP (for POLISH-5, 1-1; the lead 12:08 AM: 1-4's rotten fork R-165.206 moved to FIX-14 with Matt's rocks/fig-gate notes):**
0. **1-2/1-3/1-5 replays moved by the t-ruler merge (500eb9b, w1Pits.ts findOpenPits), NOT by step 1** (proof below). Seeds whose replay
   differs from its search on the merged head (both settings unless named): 1-2: 20 23 54 63 65 75 99; 1-3: 44; 1-5: 14 44 45 86 139.
   Every one still builds clean under the ruler ("the verdicts refuse 0" on each list): the search now keeps a different roll for them, so
   a relist `--merge <provenSeeds order> --in-order --count <n>` (1-2 100, 1-3 100, 1-5 150) keeps every seed and its place, moving only
   those plans; then --check, tierBots, every seed test (D29). ONLY on the lead's word (a relist moves rolls Matt has played). RULER's report
   expected nothing to move outside 1-1: "lockall --layouts 16 vs d8d6a97 on the 101 other stages: 101/101 unchanged (1-2, 1-3 roll as on
   main)". That compares layouts 1-16 replayed, never a list's search, so it could not see this; its seedlist checks ran on 1-1 only (and
   timed out). 1-4 PASSES on the merged head.
1. Rest of CLAUDE.md Checks on the head: build + chunkcheck, artcheck, drawcheck, clipcheck, kbdcheck, buildcheck (alone), tool tests,
   RULER's asks (lockall incl. 1-1, mixlist, ruler/scan.ts).
2. 1-1 (R-165.228: harder than every stage but 1-4; fewer doubles, easier jumps; R-165.226: props over ledges/pits). What I saw in the
   code this box (no stills shot, so nothing judged on screen): 1-1's double tests are w1.relay "(a) teach first" gaps: a double test is any
   level gap > SINGLE_GAP (w1.relay.test.ts gapsOf/teachFirst), and Normal must lay at least one; the count per roll is the lever for
   "fewer doubles" and that test pins the minimum, not a maximum. Its high road ends in a climb over earth holes 946-2,870 px wide (seed 769:
   25298..27953, 28068..30938, 31047..31993) crossed on logs with catch branches under them (RULER REPORT); falls there are put-backs, so they
   cost time, not lives. For R-165.226, w1Pits' new ruler (findOpenPits, earthLine) now knows every hole's lips: a prop check can ask
   "does this prop's footprint stand past a lip/over a hole" from the same earthHoles() (pipeline.ts) instead of a new ruler.
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
  owed for steps 1-2; step 3 (1-4) moved to FIX-14 unstarted. The rough spots POLISH-3 named (R-165.224) are unchanged.
## Pushback: none on the ruling. Note: the ask "full suite once after softFall11.test.ts:97's edit" is met by the merged-head run.
## Method, lessons, Learned
Method: level.md, gates.md; merge in a worktree while the suite ran on the main tree. Lessons: D19 (the test reads the same Drop the
verdicts read), D29 (relist -> --check, tierBots, full suite), D40, D46, D55, D57 (queue read at push), D59 (no gate left running), D61, D62.
Method update: `seedlist --merge` wants the list's own order dumped from provenSeeds() (a one-line tsx -e), then a JSON compare after.
**Learned:** when one reader misreads a record, type the record (what it IS) rather than teaching the reader a width or place rule; then
grep every reader and sort them into "counts the route" vs "judges the fall": the split was clean and no verdict had to change.
## RESULTS (gates/ holds the logs)
- seedlist --check, 9b45e20 (step 1 only) vs e215878 (+ t-ruler + 1-1 relist): 1-1 PASS / PASS; 1-2 PASS / 14 lines (7 seeds); 1-3 PASS /
  2 lines (seed 44); 1-4 not run / PASS; 1-5 PASS / 10 lines (5 seeds). So the step 1 skip (gapsOf, nodeAsks hazard) moves no roll on 1-1..1-5.
- Full unit suite on e215878: 3376 tests, 3373 pass, **1 FAIL: verdicts.test.ts:308/323**
  ("planted: without branch 128 the slot is a fall", the seed-323 copy). It comes in with the t-ruler merge: the pre-merge run on 9b45e20
  passed it (stopped at test 1517 with 0 fails, after this file had run). RULER's report says this copy needs its real right bank, and
  POLISH-3 showed a bank does not fix it; the root is realFalls' floor clause (promises11.ts:44), which the packet gives to the engine lane.
  NOT patched here (LAWS 22). The 4-3 line is a `# TODO`, not a fail. **So this head is NOT GREEN** until the engine lane fixes realFalls.
