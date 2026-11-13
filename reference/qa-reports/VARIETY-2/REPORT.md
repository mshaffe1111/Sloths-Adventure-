# VARIETY-2 REPORT (R-165.197/.198/.200). Engine, Opus 5.5 max. t-nodes. 2:47 - (running) ET, 11-13. Code head 6d7819de.
**EXACT NEXT STEP** (World 1 mix on 6d7819de: clean 1/60, unchanged; the kills are the painter's ruler and the pool, not the asks)
1. **READY PACKET, the per-gap ruler (the lead's rulings 3:21 + 3:27 PM; one whole job, Opus max, t-nodes):** findW1Pits (w1Pits.ts
   findOpenPits) judges each gap by its OWN two lips, never the stage's widest bank top G (w1Pits.ts:146-149): ground, the floor
   window (SOFT_BELOW..FALL_BELOW) and SOFT_FLOOR all read from the gap's lips; stricter and consistent, never looser (LAWS 22). Planted
   first: ruler/perGapGround.repro.ts becomes the test in src/game/ (RED.txt: the log chain's fall 37548..38002 vanishes when ground
   is laid 5,000 px away). Decide in the packet, with the lead: is a 24 px log ground only when it rests on earth, and is a hole
   between two banks judged at any width (today only 24-1600 px, w1Pits.ts:164)? Then: (a) a scan tool, old ruler (git show d8d6a97)
   vs new, over 102 stages x 16 layouts, listing every changed fall/water/drop; (b) sideways stills of each changed gap, before and
   after, in reference/qa-reports/VARIETY-2/ruler/; (c) seedlist 1-1 --check PASS (no proven 1-1 seed lost); lockall vs d8d6a97: any
   moved stage named and re-judged, never re-blessed; (d) re-run mixlist.ts (floor.unmarked 36 today) and the full Checks.
2. **Pool short (item 2, accepted to leave; its two real causes):** (a) the deal gives a test node bounce that W1's two bounce tests
   cannot lay there (string 8 seed 9: every reroll 1-6 `pool short at slot 9`); (b) late climb sections leave the corridor out the
   TOP (route already high: twists -365..-585, signature -390..-607). Measure both with tools/repairs.ts over the 60 strings first.
3. **'_' in World 1 (21 named misses):** no flow, combine, twist or signature section of W1 falls; content (B15) if Matt wants '_' there.
4. find '+' (Content), s v p t x, beat, points (B14/B15), toy kit sections: as VARIETY listed.
## Done
0. **Full Checks on 4b9a6419:** tsc, artcheck, knowncheck, generality PASS; roadmapcheck PASS (re-run on the full clone; the first run met the
   shallow clone); suite 3 shards: 3,197 pass, 0 fail, 2 todo (known since 10-26); build (BASE_PATH) + chunkcheck PASS; tool tests PASS;
   seedlist 1-1, tierBots, kbdcheck, buildcheck, clipcheck, drawcheck: RUNNING at this push.
3. **6d7819de, item 3 (accepted 3:21 PM):** askRefusal (pipeline.ts): a '_' asked of the node V19 makes climb (mustRise: after a late
   descent on an up stage) throws at graph time by V19's name. Planted gen2/askRefusal.test.ts: red before (pipeline.ts stashed, 1/2
   fail), green after (2/2); a '_' V19 does not bind is never refused. A pool-based refusal was built and REMOVED: 12 of its 35
   refusals were asks the lay kept (a node's net fall also comes from its joins: string 59's combine). Shipped graphs ask nothing.
4. **nodeMix (suite, 4b9a6419 = 6d7819de for every mix string: none asks a descent):** W1 clean 1/60 (string 32); legs fixture 3/60
   (24 refused by V-rules, 36 built). mixlist.ts: fair (every ask W1's kit lays) 8, fair clean 1; VARIETY's "12 fair" had no written rule.
5. **Lock:** lockall --layouts 16 on 6d7819de vs main d8d6a97 (recorded here): 102/102 stages unchanged. seedlist 1-1 --check: RUNNING (in the Checks below).
1-2. **Pushback** (PUSHBACK.md), accepted: 1 is the ruler (step 1 above), 2 renames a failure (step 2 above).
## Gates on 6d7819de
tsc, artcheck, knowncheck, generality, roadmapcheck PASS; the suite (3 shards), build + chunkcheck, tool tests, seedlist 1-1,
tierBots, kbdcheck, buildcheck, clipcheck, drawcheck: RUNNING at this push.
## Polish check
Nothing drawn changed: the refusal fires only on designed graphs that ask; no shipped stage asks. No stills apply.
## Method, lessons, Learned
Method: ENGINE.md day one (main's lock first; planted failure first), level.md 12, gates.md. Lessons: D15 (the "fair" rule re-measured,
8 not 12), D19, D40 (no patch on a ruler being replaced), D52 (cites re-grepped after the planner edit moved them), D53, D55, D57.
Method update: measure a new refusal against the old lay's named misses before keeping it (mixlist.ts askMiss caught 12 false ones).
**Learned:** a kill that also hits the bare frame on other seeds belongs to the ruler or the kit, not the ask: count the bare frame's
own failures first. Refuse at graph time only what fails on every seed. Never park a red *.test.ts: park a repro script.
