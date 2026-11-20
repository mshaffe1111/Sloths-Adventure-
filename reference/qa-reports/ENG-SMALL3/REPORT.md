# ENG-SMALL3 (Engine): R-165.319, R-165.321, R-165.317

Branch t-eng-small3 from origin/t-int-13 8efb1bba5. Final hash: FINAL_HASH. Packet: reference/packets/2026-11-20/ENG-SMALL3.md.

## Done-items
1. **R-165.319, the threat dial takes the kit's ids** (b6f175b1). nodeCode.ts `ID`, one spelling for a threat kind, hazard, clock and
   find, as the kit writes it: a small letter first, then letters of either case, digits, '-' or '_'. Plant nodeDials.test 'R-165.319': RED before (`"thornVine*2z" is not a threat`), GREEN after; still refused: a capital or digit
   first, a dot (`ThornVine`, `2vine`, `thorn.vine`, `#Pods`, `+Seed`). Every listed stage's node string re-checked: 12 stages, 15
   distinct graph codes, each parsed by the old and the new parser: 15/15 identical (the change only adds spellings).
2. **R-165.321, Grandma's things named by the things placed** (ca206de5). protoStage.ts thingFern: `THINGS[thingsPlaced % n]`. Plant
   w3Stages.test 'R-165.321': RED before (3-6 seed 1: teddy bear / locket / locket / ...), GREEN after. Measured over seeds 1-16 (Play's
   layouts) and the test's 16 seeds, Normal and Easy: a name repeated before every name was used on 31/31 3-6 rolls and 26/31 3-7 rolls
   before, 0/124 after. Text changes: 3-6 and 3-7 only (the `thing` field of their relics); no seed list holds World 3.
3. **R-165.317, tierBots.test diffs all 200 runs** (3f2861da, bfa132d5). `movedRuns` replays every committed run and names each moved
   one with its fields; a new test requires variants 1-40 of each table row committed once. Plant 'R-165.317' (child Easy variant 25's
   finishSeconds moved, BUILD-24c's case): GREEN; RED with the old 3-variant replay (a mutation: 15 of 200 replayed). Full replay on
   t-int-13's 1-1: 200 runs, 0 moved, 206 s on 4 cores. The command is unchanged and already in CI (gates.yml rolled, 26 of 60 min on the
   last publish, run 43814775377); time labels updated in CLAUDE.md, gates.yml and BOTS.md.
4. **The check list (every CLAUDE.md item, plus the packet's):** run on a8e5a455 (src and tools identical to bfa132d5a; later commits are this report only):

| Gate | Result |
|---|---|
| suite, 3 shards | FAIL 1 (timing under load; PASS alone; R-165.325): 3,937 tests, 3,934 pass, 2 todo, 1 red, stageQuality 'generating a stage is quick' p90 657 ms with 4 jobs on 4 cores |
| tsc; vite build (BASE_PATH); chunkcheck; artcheck; knowncheck; generality | PASS each |
| roadmapcheck | exit 2 at first (this clone was shallow); PASS after `git fetch --unshallow` |
| drawcheck; clipcheck; kbdcheck; buildcheck | PASS (690 s); PASS, 83 known (327 s); PASS (re-shot stills restored, not committed); PASS |
| seedlist 1-1 --check + every list --check (registrycheck --lists: 1-1..1-9, 2-1, 2-2, 2-4) | 12/12 PASS |
| the 4 CLAUDE.md tool tests; the CI rolled tool line; registrycheck; tipwalk --layouts 4 | PASS (46 s), PASS (406 s), PASS, PASS |
| tierBots.test (all 200 runs) | PASS (193 s) |
| lockall --layouts 16 vs base 8efb1bba | 100/102 unchanged; 3-6, 3-7 collectibles (intended: the names) |
| lockall vs main 6e7b85f8 | 19 stages move: the base's own 17 plus 3-6/3-7 collectibles; no layout move from this job |
| funcheck | FAIL, identical on the base 8efb1bba (30 worse or new, 41 to lower; 1,590 flags; diff 0 lines): t-int-13's, not this job's |
| paintcheck (CI's, 3 parts) | PAINTCHECK |

## Polish check
No drawing changed. The one player-facing change: 3-6/3-7's "GRANDMA'S <THING>!" text (engine.ts:3396) in list order, words unchanged.

## Pushback
- R-165.321's done-item "a hunt with N finds names N different things" cannot hold: 3-6 lays 8-15 finds over 4 names, 3-7 lays 9 over 5
  (`GRANDMA_GOAL + 2..3` and more by the finish). The plant holds what the code can: no name twice before every name is used, then the
  list again in order. Even the keeper's lists (5 and 6 names, lines-3.md on t-keeper-3x) are under the finds laid. The lead ruled the
  names are content for the 3-6/3-7 builds (11-19).

## Suggestions
- Name a thing when it is FOUND, not laid (engine.ts:3396 reads `c.thing`): the nth find gets the nth name, so a goal's finds are
  all different (once the keeper's lists land) whatever order he searches. Files: engine.ts, protoStage.ts; done: an out-of-order plant.

## Unresolved
- The suite's timing red (R-165.325, logged by the lead) and funcheck's FAIL (the base's own, t-int-13) are not this job's to fix.

## Method used, lessons applied, method update
- Method: gates.md "Adding a new check" (defect named, plant, run twice, wired, runtime reported); ENGINE.md day one (plants, locks).
- Lessons: D21 (the id rule spread to hazard/clock/find; the counter pattern grepped: one site), D30, D57/D87, D59, D86, D88 (plants use
  the repo's look-alikes: kebab and camel ids, a capital first refused), D90 (outputs to files, summary lines only).
- Method update (proposal): gates.md's table gets a tierBots.test row (every committed run replays; about 4 min; rolled), and step 5
  says: a gate that replays a SAMPLE of a committed record is weaker than its spec; replay it all unless measured too slow.

## Learned
A pin's spec and its code drift apart quietly (BOTS.md: "any run that moves fails it"; the test replayed 15 of 200): read the test.

## Turnover note
reference/handoffs/engine-core.md §0zq-small3 (a8e5a455).
