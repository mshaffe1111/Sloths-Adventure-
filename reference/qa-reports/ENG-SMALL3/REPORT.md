# ENG-SMALL3 (Engine): R-165.319, R-165.321, R-165.317

Branch t-eng-small3 from origin/t-int-13 8efb1bba5. Final hash: FINAL_HASH. Packet: reference/packets/2026-11-20/ENG-SMALL3.md.

## Done-items
1. **R-165.319, the threat dial takes the kit's ids** (b6f175b1). nodeCode.ts `ID`: a small letter first, then letters of either case,
   digits, '-' or '_' (the one spelling for a threat kind, hazard, clock and find; the agreed spelling: as the kit writes it).
   Plant nodeDials.test 'R-165.319': RED before (`"thornVine*2z" is not a threat`), GREEN after; still refused: a capital or digit
   first, a dot (`ThornVine`, `2vine`, `thorn.vine`, `#Pods`, `+Seed`). Every listed stage's node string re-checked: 12 stages, 15
   distinct graph codes, each parsed by the old and the new parser: 15/15 identical (the change only adds spellings). No design doc on
   t-int-13 or the lead branch carries a camelCase threat yet.
2. **R-165.321, Grandma's things named by the things placed** (ca206de5). protoStage.ts thingFern: `THINGS[thingsPlaced % n]`. Plant
   w3Stages.test 'R-165.321': RED before (3-6 seed 1: teddy bear / locket / locket / ...), GREEN after. Measured over seeds 1-16 (Play's
   layouts) and the test's 16 seeds, Normal and Easy: a name repeated before every name was used on 31/31 3-6 rolls and 26/31 3-7 rolls
   before, 0/124 after. Text changes: 3-6 and 3-7 only (the `thing` field of their relics); no seed list holds World 3.
3. **R-165.317, tierBots.test diffs all 200 runs** (3f2861da, bfa132d5). `movedRuns` replays every committed run and names each moved
   one with its fields; a new test requires variants 1-40 of each table row committed once. Plant 'R-165.317' (child Easy variant 25's
   finishSeconds moved, BUILD-24c's case): GREEN; RED with the old 3-variant replay (a mutation: 15 of 200 replayed). Full replay on
   t-int-13's 1-1: 200 runs, 0 moved, 206 s on 4 cores. The command is unchanged and already in CI (gates.yml rolled, 26 of 60 min on the
   last publish, run 43814775377); time labels updated in CLAUDE.md, gates.yml and BOTS.md.
4. **The check list on FINAL_HASH:** GATE_TABLE

## Polish check
No drawing changed. The only player-facing change is 3-6/3-7's floating "GRANDMA'S <THING>!" text (engine.ts:3396), now in list order
with no early repeat; the words themselves are unchanged.

## Pushback
- R-165.321's done-item "a hunt with N finds names N different things" cannot hold: 3-6 lays 8-15 finds over 4 names, 3-7 lays 9 over 5
  (`GRANDMA_GOAL + 2..3` and more by the finish). The plant holds what the code can: no name twice before every name is used, then the
  list again in order. Even the keeper's lists (5 and 6 names, lines-3.md on t-keeper-3x) are under the finds laid. The lead ruled the
  names are content for the 3-6/3-7 builds (11-19).

## Suggestions
- (Engine/Designer) Name a thing when it is FOUND, not when it is laid (engine.ts:3396 reads `c.thing`): the nth find a player makes
  gets the nth name, so the goal's finds (5 and 6) are always different once the keeper's lists land, whichever ferns he searches.
  Files: engine.ts relic pickup, protoStage.ts; done: a planted test that finds things out of x order and sees no repeat in the goal.

## Unresolved
UNRESOLVED

## Method used, lessons applied, method update
- Method: gates.md "Adding a new check" (a tightened gate: the defect named, a plant, run twice, wired, runtime reported);
  ENGINE.md day one (planted failure first; lock vs base and main).
- Lessons: D21 (the id rule spread to hazard, clock and find; the name-by-counter pattern grepped tree-wide: one site), D30 (every time
  from `date`), D57/D87 (inbox read at each push), D59 (no gate left running at report), D86 (the whole CLAUDE.md list), D88 (the
  plant uses the repo's real look-alikes: kebab and camel ids, a capital-first refusal), D90 (outputs to files, summary lines only).
- Method update (proposal): gates.md's table has no row for tierBots.test; add "tierBots.test | every committed calibration run replays
  exactly; the bots' numbers equal the profiles | about 4 min | rolled". And "Adding a new check" step 5 should say: a gate that
  replays a SAMPLE of a committed record is weaker than its spec; replay the whole record unless its runtime is measured too long.

## Learned
A pin's spec and its code drift apart quietly: BOTS.md said "any run that moves fails it" while the test replayed 15 of 200. Read the
test, not the doc, before trusting a gate.

## Turnover note
reference/handoffs/engine-core.md §0zq-small3 (this commit).
