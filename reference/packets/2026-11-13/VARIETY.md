# VARIETY: make mixed node strings lay (R-165.197/.198). Opus 5.5 MAX (engine). Written 1:36 PM ET by the lead.
Why max (stated, models.json engine tier; Matt 1:36 PM: "we need to put a higher model on this and get it fixed, since this is going to drive
the game"): nodeMix.test (t-nodes) found only 1 of 60 valid node strings lays clean on World 1's kit and 0 on the toy kit: the parser reads
every combination; the kits and verdicts fail them. Mix and match is the game's foundation (one designer + one developer, 2-hour levels,
variety across all worlds). This needs root-cause engine reasoning across the lay, kits and verdicts; Fable is off for cost (Matt 12:42 PM).
Continue branch t-nodes (NODES-2's head + REPORT.md: its HISTOGRAM of named failure reasons, ranked, is your frozen start). You hold
gen2/pipeline.ts, gen2/types.ts, tower.ts, nodeCode.ts, legs.ts, nodeAsks.ts and the kit files the report names; engine.ts by patch.
## Done
0. FIRST (blocks tonight's 1-4): the tower lay's turn vine can stand past the end of the bough it climbs to (B14c: 26 px off, clearClimbs; B14b: 1-4 Easy seed 1, vine x1063 vs bough end 1037), and the verdicts let it through. Fix the lay at the root + a verdict with a planted case from that roll; push; one line to the lead (B14c re-runs 1-4's bots on it).
1. Fix the top failure reasons at their ROOT (general, for every world's kit: missing section kinds a node can ask for, lay rules that
   only fit the shapes levels were hand-built for, verdict checks that refuse fair rolls); never loosen a fairness verdict or STAGE-RULES
   number to make a string pass (LAWS 22). Each fix: a planted test.
2. Re-run nodeMix.test after each fix; report the clean count per kit (the variety number) and the remaining named reasons.
3. No shipped stage's lock or seed list moves (lockall); full CLAUDE.md Checks at the end.
BOX: 2 hours from your start, or 40% of your 1,000,000-token window: push, REPORT.md (30 lines + "Learned") with EXACT NEXT STEP, stop.
Context % in every message (5 lines max). Read TODAY.md (burn rules, read your queue at every push). Lead: session_01FhBbYNzGRJBDMzn6XbtQK2.
